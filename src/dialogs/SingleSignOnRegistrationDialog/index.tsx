import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import {
  openDialogContainer,
  closeDialogContainer,
  withLoading
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { SingleSignOnRegistrationDialog } from './SingleSignOnRegistrationDialog';
import { withStyles } from '../ThemedDialog';
import { connect } from 'react-redux';
import { startAdminRegistration, beginNewRegistration } from '../../routing/startRegistration';
import { setInviteeIdInUserSession, startSsoRegistration } from '../../redux/userSession';

import { setArriveFromDialogInUserSession, setDialogBeenOpened } from '../../redux/externalAuthentication';

import SingleSignOnRegistrationDialogStyles from './SingleSignOnRegistrationDialog.less';
import ButtonStyles from 'nucleus-core/less/cv/Button.less';
import SingleSignOnStyles from '../shared/Confirmation.less';
import { openPrivateEventErrorDialog } from '../PrivateEventErrorDialog';
import { loginRegistrant } from '../../redux/registrantLogin/actions';
import { loadRegistrationContent } from '../../redux/actions';
import { getRegistrationPathIdOrNull } from '../../redux/selectors/currentRegistrationPath';
import { POST_REGISTRATION } from '../../redux/website/registrationProcesses';
import { getConfirmationPageIdForInvitee } from '../../utils/confirmationUtil';
import { routeToPage } from '../../redux/pathInfo';
import useRegisteredInvitees from './useRegisteredInvitees';
import { determineRegCartIdToAbort } from '../../redux/selectors/shared';

const PRIVATE_EVENT_ERROR_CODE = -3;

const Dialog = withStyles(SingleSignOnRegistrationDialogWrapper);

const classes = {
  ...SingleSignOnStyles,
  ...SingleSignOnRegistrationDialogStyles,
  ...ButtonStyles
};

const inviteeRegistration = withLoading(() => {
  return async (dispatch, getState) => {
    dispatch(closeDialogContainer());
    const state = getState();
    const { authenticatedContact, defaultRegPathId } = state.userSession;
    const {
      clients: { externalAuthClient }
    } = state;
    try {
      const response = await externalAuthClient.createInvitee(authenticatedContact, defaultRegPathId);
      if (response.inviteeStub) {
        await dispatch(setInviteeIdInUserSession(response.inviteeStub));
      }
    } catch (error) {
      if (error.responseBody && error.responseBody.returnCode === PRIVATE_EVENT_ERROR_CODE) {
        const isSsoflow = true;
        return await dispatch(openPrivateEventErrorDialog(null, null, isSsoflow));
      }
      throw error;
    }
    await dispatch(startSsoRegistration(false));
    await dispatch(beginNewRegistration({ abortExistingCartId: determineRegCartIdToAbort(state) }));
  };
});

const adminRegistration = withLoading(() => {
  return async (dispatch, getState) => {
    dispatch(closeDialogContainer());
    const state = getState();
    const { authenticatedContact } = state.userSession;
    const {
      clients: { externalAuthClient }
    } = state;
    await externalAuthClient.updateContact(authenticatedContact);
    await dispatch(startSsoRegistration(true));
    await dispatch(setDialogBeenOpened());
    await dispatch(startAdminRegistration({ abortExistingCartId: determineRegCartIdToAbort(state) }));
  };
});

const dispatchToConfirmationPage = withLoading((emailAddress, confirmationNumber) => {
  return async (dispatch, getState) => {
    const confirmationInfo = {
      emailAddress,
      confirmationNumber
    };
    dispatch(closeDialogContainer());
    await dispatch(loginRegistrant(confirmationInfo));
    const state = getState();
    await dispatch(setArriveFromDialogInUserSession(true));
    await dispatch(setDialogBeenOpened());
    await dispatch(loadRegistrationContent(POST_REGISTRATION, getRegistrationPathIdOrNull(state)));
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee(state));
    await dispatch(routeToPage(confirmationPageId));
  };
});

const dispatchCloseIcon = withLoading(() => {
  return dispatch => {
    dispatch(closeDialogContainer());
  };
});

const mapStateToProps = (state: $TSFixMe) => {
  return {
    title: 'EventGuestSide_Sso_Admin_RegHeader__resx',
    translate: state.text.translate,
    hasRegisteredInvitees: state.userSession.hasRegisteredInvitees,
    registeredInvitees: state.userSession.registeredInvitees,
    hasDialogBeenOpened: state.externalAuthentication.hasDialogBeenOpened
  };
};

const mapDispatchToProps = {
  inviteeRegistration: withLoading(inviteeRegistration),
  adminRegistration: withLoading(adminRegistration),
  dispatchToConfirmationPage,
  dispatchCloseIcon
};

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    inviteeRegistration: dispatchProps.inviteeRegistration.bind(),
    adminRegistration: dispatchProps.adminRegistration.bind()
  };
};

const ConnectedSingleSignOnRegistrationDialog = connect(mapStateToProps, mapDispatchToProps, mergeProps)(Dialog);

export const openSingleSignOnRegistrationDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialog = <ConnectedSingleSignOnRegistrationDialog classes={classes} />;
    return dispatch(
      openDialogContainer(dialog, () => {}, {
        classes: {
          dialogContainer: SingleSignOnRegistrationDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};

function SingleSignOnRegistrationDialogWrapper(props) {
  const query = useRegisteredInvitees();
  const invitees = (query as $TSFixMe).data?.registeredInvitees ? (query as $TSFixMe).data?.registeredInvitees : [];
  return <SingleSignOnRegistrationDialog {...props} registeredInvitees={invitees} />;
}
