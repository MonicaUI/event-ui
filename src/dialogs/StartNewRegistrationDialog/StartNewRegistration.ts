import { connect } from 'react-redux';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import ConfirmationStyles from '../shared/Confirmation.less';
import { forceTabToActive } from '../../initializeMultiTabTracking';
import { UPDATE_USER_SESSION } from '../../redux/registrantLogin/actionTypes';
import querystring from 'querystring';
import { getQueryParam } from '../../utils/queryUtils';
import { beginNewRegistration } from '../../routing/startRegistration';
import { determineRegCartIdToAbort, getRegCart } from '../../redux/selectors/shared';
import { getDefaultRegistrationPath } from 'event-widgets/redux/selectors/appData';
import { withStyles } from '../ThemedDialog';
import { abortRegCart } from '../../redux/registrationForm/regCart/workflow';

const getDefaultRegPathId = (startWithDefaultRegPath, defaultRegPath, queryParams) => {
  let defaultRegPathId;
  if (startWithDefaultRegPath && defaultRegPath) {
    defaultRegPathId = defaultRegPath.id;
  } else {
    defaultRegPathId = queryParams.rp || undefined;
  }
  return defaultRegPathId;
};

export const startNewRegistrationAndNavigateToRegistration = (startWithDefaultRegPath = false) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const defaultRegPath = getDefaultRegistrationPath(getState().appData);
    dispatch(closeDialogContainer());
    // set correct properties in user session for weblinks with query params
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));

    const defaultRegPathId = getDefaultRegPathId(startWithDefaultRegPath, defaultRegPath, queryParams);

    /*
     * PROD-79995 need to prefill the invitee information if the invitee opens a url that contains
     * invitee id, skip logging out the registrant. If the invitee try to register from post reg
     * status, still need to log out the registrant and start a new reg.
     */
    const state = getState();
    const regCart = getRegCart(state) || {};
    // determine whether a previous cart exists and should be aborted
    let abortExistingCartId = determineRegCartIdToAbort(state);
    const isPostReg = regCart.status === 'COMPLETED' || regCart.status === 'TRANSIENT';
    if (!queryParams.i || !getState().userSession.inviteeId || isPostReg) {
      if (abortExistingCartId) {
        // abort must happen before logout
        await dispatch(abortRegCart(abortExistingCartId));
        abortExistingCartId = undefined;
      }
      await dispatch(logoutRegistrant());
      await dispatch({
        type: UPDATE_USER_SESSION,
        payload: {
          ...getState().userSession,
          defaultRegPathId,
          referenceId: getQueryParam(queryParams, 'refid')
        }
      });
    }
    // here we are answering 'yes, start a new registration'. so we mark the tab as active on first page of reg.
    dispatch(forceTabToActive('register'));
    await dispatch(
      beginNewRegistration({
        abortExistingCartId,
        isEmbeddedRegistration: state.isEmbeddedRegistration
      })
    );
  };
};

const Dialog = withStyles(ConfirmationDialog);

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  return {
    ...(props.dialogConfig || { title: '' }),
    translate: state.text.translate,
    useSuccessComponent: false,
    successMessage: 'EventGuestSide_StartNewRegistration_SuccessMessage__resx',
    instructionalText: 'EventGuestSide_StartNewRegistrationModal_InstructionalText__resx',
    classes: ConfirmationStyles
  };
};

const mapDispatchToProps = {
  confirmChoice: withLoading(startNewRegistrationAndNavigateToRegistration)
};

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    confirmChoice: dispatchProps.confirmChoice.bind(null, stateProps.startWithDefaultRegPath)
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Dialog);
