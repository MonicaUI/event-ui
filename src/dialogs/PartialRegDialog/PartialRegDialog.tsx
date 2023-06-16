import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { merge } from 'lodash';
import { REGISTRATION } from '../../redux/website/registrationProcesses';
import {
  loadGuestRegistrationContent,
  loadRegistrationContent,
  evaluateQuestionVisibilityLogic
} from '../../redux/actions';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PartialRegDialogStyles from './PartialRegDialog.less';
import { populateRegCartVisibleProducts } from '../../redux/visibleProducts';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { forceTabToActive } from '../../initializeMultiTabTracking';
import { routeToPage } from '../../redux/pathInfo';
import {
  UPDATE_REG_CART_SUCCESS,
  RESTORE_PARTIAL_CART_SUCCESS,
  CLEAR_CURRENT_EVENT_REGISTRATION_ID
} from '../../redux/registrationForm/regCart/actionTypes';
import { UPDATE_USER_SESSION } from '../../redux/registrantLogin/actionTypes';
import { getRegCart } from '../../redux/selectors/shared';
import { getRegistrationPathIdOrDefault } from '../../redux/selectors/currentRegistrationPath';
import { resumePartialRegistration } from '../../redux/registrationForm/regCart';
import { loadAvailableCapacityCounts } from '../../redux/capacity';
import { loadLanguageFromLocale } from '../../redux/multiLanguage/actions';
import { getPrimaryRegistrationId } from '../../redux/registrationForm/regCart/selectors';
import { setCurrentRegistrant } from '../../appInitialization/routeHandlers';

const updatePartialRegistration = withLoading((partialCartId, validationMessages) => {
  return async (dispatch, getState) => {
    dispatch(closeDialogContainer());
    const regCartIdFromState = (getRegCart(getState()) || {}).regCartId;
    const response = await dispatch(resumePartialRegistration(regCartIdFromState, partialCartId));
    let partialRegCart = response.regCart;
    // If we select yes, we fetch the partial regcart from service and update in the redux state
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const adminInformation = partialRegCart && partialRegCart.admin;
    if (adminInformation) {
      partialRegCart = {
        ...partialRegCart,
        admin: {
          ...adminInformation,
          selectedValue: true
        }
      };
    }
    await dispatch({ type: CLEAR_CURRENT_EVENT_REGISTRATION_ID });
    await dispatch({
      type: UPDATE_REG_CART_SUCCESS,
      payload: {
        regCart: partialRegCart,
        validationMessages
      }
    });
    dispatch({ type: RESTORE_PARTIAL_CART_SUCCESS });
    const primaryEventRegistrationId = getPrimaryRegistrationId(partialRegCart);
    // update the current registration id
    dispatch(setCurrentRegistrant(primaryEventRegistrationId));
    // we need to update the new reg cart id in the user session as well
    await dispatch({
      type: UPDATE_USER_SESSION,
      payload: {
        ...getState().userSession,
        regCartId: partialRegCart.regCartId
      }
    });

    await dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrDefault(getState())));
    await dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrDefault(getState())));
    await dispatch(populateRegCartVisibleProducts());
    await dispatch(loadAvailableCapacityCounts());
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (partialRegCart && partialRegCart.localeId) {
      dispatch(loadLanguageFromLocale(partialRegCart.localeId));
    }
    // we will fetch the first page of the registration and redirect to that
    const routeToPageId = REGISTRATION.forCurrentRegistrant().startPageId(getState());
    dispatch(forceTabToActive(routeToPageId));
    dispatch(routeToPage(routeToPageId));
    await dispatch(evaluateQuestionVisibilityLogic(null, true));
  };
});

class PartialRegDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    style: PropTypes.object
  };
  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;
  getStyleObject() {
    return {
      dialogHeader: this.getElementInlineStyle('header'),
      title: this.getElementInlineStyle('title'),
      subMessage: this.getElementInlineStyle('subTitle'),
      dragHandle: this.getElementBackground('content2'),
      dragContainer: this.getElementBackground('content1'),
      body: this.getElementInlineStyle('body1'),
      primaryButton: this.getElementInlineStyle('primaryButton'),
      secondaryButton: this.getElementInlineStyle('secondaryButton'),
      messageContainer: { paddingTop: 0 }
    };
  }
  getClasses() {
    return {
      ...PartialRegDialogStyles
    };
  }

  render() {
    return (
      <ConfirmationDialog
        {...injectTestId('partial-reg-dialog')}
        {...this.props}
        style={this.getStyleObject()}
        classes={this.getClasses()}
      />
    );
  }
}

function dialogStyle(globalTheme, sections) {
  return {
    ...globalTheme,
    header: globalTheme.dialog ? globalTheme.dialog.header : { styleMapping: 'header3' },
    title: globalTheme.dialog ? globalTheme.dialog.headerText : { styleMapping: 'header2' },
    subTitle: { styleMapping: 'header4' },
    content1: { ...merge({}, globalTheme, sections.content1), styleMapping: 'custom' },
    content2: { ...merge({}, globalTheme, sections.content2), styleMapping: 'custom' },
    body1: { styleMapping: 'body1' },
    primaryButton: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' },
    messageContainer: globalTheme.dialog ? globalTheme.dialog.body : {}
  };
}

/**
 * A connect wrapper around the share dialog to inject
 * the appropriate style information into its props.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const {
      customFonts,
      website: {
        theme: { global, sections }
      }
    } = state;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { style, ...otherDialogConfig } = props.dialogConfig;
    return {
      ...otherDialogConfig,
      title: 'PartialReg_Header__resx',
      translate: state.text.translate,
      useSuccessComponent: false,
      style: merge({}, dialogStyle(global, sections), { customFonts }),
      instructionalText: 'EventGuestSide_PartialRegModal_InstructionalText__resx'
    };
  },
  {
    requestClose: closeDialogContainer,
    updatePartialRegistration
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      confirmChoice: dispatchProps.updatePartialRegistration.bind(
        null,
        ownProps.regCart.regCartId,
        ownProps.validationMessages
      )
    };
  }
)(PartialRegDialog);
