import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { startCancelRegistration, finalizeCancelRegistration } from '../../redux/registrationForm/regCart';
import { routeToPage } from '../../redux/pathInfo';
import { getDefaultWebsitePageId } from '../../redux/website';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { merge } from 'lodash';
import { FINALIZED_CANCEL_REGISTRATION } from '../../redux/registrationIntents';
import ConfirmationStyles from '../shared/Confirmation.less';
import { logoutRegistrant, logoutPlanner } from '../../redux/registrantLogin/actions';
import { injectTestId } from '@cvent/nucleus-test-automation';
import clearImageInTheme from '../shared/clearImageInTheme';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

/**
 * Finalize the cancellation
 * On success: 1. route to the default(summary) page 2. logout registrant
 */
const onCancelRegistration = () => {
  return async (dispatch, getState) => {
    await dispatch(startCancelRegistration());
    await dispatch(finalizeCancelRegistration());
    const {
      defaultUserSession: { isPlanner },
      plannerRegSettings: { exitUrl }
    } = getState();
    if (isPlanner) {
      await dispatch(logoutPlanner(exitUrl));
    } else {
      await dispatch(logoutRegistrant());
    }
    dispatch(closeDialogContainer());
    const defaultPage = getDefaultWebsitePageId(getState()) || 'summary';
    dispatch(routeToPage(defaultPage));
  };
};

class CancelRegistrationDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    style: PropTypes.object
  };
  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;
  getStyleObject() {
    return {
      dialogHeader: this.getElementInlineStyle('dialogHeader'),
      exit: this.getElementInlineStyle('exit'),
      primaryButton: this.getElementInlineStyle('primaryButton'),
      secondaryButton: this.getElementInlineStyle('secondaryButton'),
      dragHandle: this.getElementBackground('content2'),
      body: this.getElementInlineStyle('body1')
    };
  }
  getClasses() {
    return {
      ...ConfirmationStyles
    };
  }
  render() {
    return (
      <ConfirmationDialog
        {...injectTestId('cancel-registration')}
        {...this.props}
        style={this.getStyleObject()}
        classes={this.getClasses()}
      />
    );
  }
}

const dialogStyle = (style, sections, global) => {
  return {
    ...style,
    dialogHeader: { styleMapping: 'header3' },
    exit: { styleMapping: 'body1' },
    primaryButton: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' },
    content2: { ...clearImageInTheme(merge({}, global, sections.content2)), styleMapping: 'custom' },
    body1: { styleMapping: 'body1' }
  };
};

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const { sections, global } = state.website.theme;
    const { style, ...otherDialogConfig } = props.dialogConfig;
    return {
      ...(otherDialogConfig || { title: '' }),
      translate: state.text.translate,
      useSuccessComponent: state.regCartStatus.registrationIntent === FINALIZED_CANCEL_REGISTRATION,
      style: dialogStyle(style, sections, global),
      successMessage: 'EventGuestSide_CancelRegistration_SuccessMessage__resx',
      instructionalText: 'EventWidgets_CancelRegistrationModal_InstructionalText__resx'
    };
  },
  {
    requestClose: boundCloseDialog,
    confirmChoice: withLoading(onCancelRegistration)
  }
)(CancelRegistrationDialog);
