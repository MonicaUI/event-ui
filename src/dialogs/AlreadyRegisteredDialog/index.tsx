import React from 'react';
import { AlreadyRegisteredDialog } from './AlreadyRegisteredDialog';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import ConfirmationStyles from '../shared/Confirmation.less';
import AlreadyRegisteredStyles from '../AlreadyRegisteredAndContactPlanner/AlreadyRegisteredDialog.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import {
  openDialogContainer,
  closeDialogContainer,
  showLoadingDialog,
  hideLoadingDialog
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { connect } from 'react-redux';
import {
  setLoginFormField,
  loginRegistrant,
  resendConfirmationEmail,
  resetStatus
} from '../../redux/registrantLogin/actions';
import {
  loadCombinedSnapshot,
  loadGuestRegistrationContent,
  loadRegistrationContent,
  setReferrer
} from '../../redux/actions';
import { statuses } from '../../redux/registrantLogin/status';
import { routeToPage } from '../../redux/pathInfo';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { openPreviewModeWarningDialog } from '../PreviewModeWarningDialog';
import { getConfirmationPageIdForInvitee } from '../../utils/confirmationUtil';

import FormElementStyles from 'nucleus-core/less/cv/Forms.less';
import TextInputStyles from 'nucleus-core/less/cv/TextInput.less';
import FormLabelStyles from 'nucleus-core/less/cv/Labels.less';
import { REGISTRATION } from '../../redux/website/registrationProcesses';
import { getRegistrationPathIdOrNull } from '../../redux/selectors/currentRegistrationPath';
import { withStyles } from '../ThemedDialog';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { invalidateDatatagCache } from '../../utils/datatagUtils';

const classes = {
  ...AlreadyRegisteredStyles,
  form: {
    ...FormElementStyles,
    ...TextInputStyles,
    inputContainer: FormElementStyles.inputContainerOnRight,
    element: AlreadyRegisteredStyles.element,
    label: {
      ...FormLabelStyles,
      label: FormLabelStyles.labelOnTop
    },
    errorMessages: {
      container: FormElementStyles.errorContainer,
      errorText: FormElementStyles.errorText
    }
  }
};
const AlreadyRegisteredDialogWithStyles = withStyles(AlreadyRegisteredDialog);

export function onLogin({ postLoginOverride }: $TSFixMe = {}) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const isPreview = getState().defaultUserSession.isPreview;
    if (isPreview) {
      dispatch(openPreviewModeWarningDialog());
    } else {
      dispatch(showLoadingDialog());
      try {
        await dispatch(loginRegistrant());
        await dispatch(loadCombinedSnapshot());
        const registrationPathId = getRegistrationPathIdOrNull(getState());
        await Promise.all([
          dispatch(loadRegistrationContent(REGISTRATION, registrationPathId)),
          dispatch(loadGuestRegistrationContent(registrationPathId))
        ]);
      } catch (error) {
        dispatch(hideLoadingDialog());
        throw error;
      }

      if (postLoginOverride) {
        return dispatch(postLoginOverride());
      }
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee(getState()));
      dispatch(routeToPage(confirmationPageId));
      dispatch(closeDialogContainer());
      dispatch(setReferrer(null));
      invalidateDatatagCache();
      dispatch(hideLoadingDialog());
    }
  };
}

function onResendConfirmation() {
  return async (dispatch, getState) => {
    const isPreview = getState().defaultUserSession.isPreview;
    if (isPreview) {
      dispatch(openPreviewModeWarningDialog());
    } else {
      dispatch(showLoadingDialog());
      await dispatch(resendConfirmationEmail());
      dispatch(hideLoadingDialog());
    }
  };
}

const onBackToLogin = () => {
  return dispatch => {
    dispatch(resetStatus());
  };
};

const boundCloseDialog = () => {
  return dispatch => {
    dispatch(resetStatus());
    dispatch(closeDialogContainer());
    dispatch(setReferrer(null));
  };
};

const ConnectedAlreadyRegisteredDialog = connect(
  (state: $TSFixMe) => {
    const {
      account: {
        settings: { dupMatchKeyType }
      },
      userSession: { inviteeStatus, firstName: inviteeFirstName, lastName: inviteeLastName },
      registrantLogin: {
        form: { firstName, lastName, emailAddress, confirmationNumber },
        status
      },
      text: { translate },
      experiments: { flexProductVersion = -1 }
    } = state;
    return {
      ...injectTestId('already-registered'),
      login: {
        emailAddress,
        confirmationNumber,
        errorMessage: status.login.errorMessage || ''
      },
      resendConfirmation: {
        firstName,
        lastName,
        emailAddress,
        dupMatchKeyType,
        successResendingConfirmation: status.resendConfirmation.type === statuses.SUCCESS,
        failureResendingConfirmation: status.resendConfirmation.type === statuses.FAILURE
      },
      translate,
      inviteeStatus,
      inviteeFirstName,
      inviteeLastName,
      flexProductVersion
    };
  },
  {
    onChange: setLoginFormField,
    onClose: boundCloseDialog,
    onLoginSubmit: onLogin,
    onResendConfirmationSubmit: onResendConfirmation,
    onBackToLogin
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      onBackToLogin: dispatchProps.onBackToLogin,
      onClose: ownProps.onCloseOverride ? ownProps.onCloseOverride : dispatchProps.onClose,
      login: {
        ...ownProps.login,
        ...stateProps.login,
        onChange: dispatchProps.onChange,
        onSubmit: () => dispatchProps.onLoginSubmit({ postLoginOverride: ownProps.postLoginOverride })
      },
      resendConfirmation: {
        ...ownProps.resendConfirmation,
        ...stateProps.resendConfirmation,
        onChange: dispatchProps.onChange,
        onSubmit: dispatchProps.onResendConfirmationSubmit
      }
    };
  }
)(AlreadyRegisteredDialogWithStyles);

const ConfirmationDialogWithStyles = withStyles(ConfirmationDialog);

const redirectToLogin = () => {
  return (dispatch, getState) => {
    const {
      clients: { attendeeLoginClient }
    } = getState();
    attendeeLoginClient.authorize();
  };
};

const ConnectedConfirmationDialogWithStyles = connect(null, {
  requestClose: boundCloseDialog,
  confirmChoice: redirectToLogin
})(ConfirmationDialogWithStyles);

const prepopulateLoginForm = (dispatch, getState) => {
  const { registrationForm } = getState();
  const eventRegistration = Object.values(registrationForm.regCart.eventRegistrations)[0];
  const emailAddress = (eventRegistration as $TSFixMe)?.attendee?.personalInformation?.emailAddress;
  if (emailAddress) {
    dispatch(setLoginFormField('emailAddress', emailAddress));
  }
};

export const openAlreadyRegisteredDialog = ({
  title,
  registerNowText,
  instructionalText,
  postLoginOverride,
  onCloseOverride,
  prepopulateForm = false
}: $TSFixMe = {}) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      event: {
        eventSecuritySetupSnapshot: { postRegistrationAuthType }
      },
      text: { translate }
    } = getState();
    if (prepopulateForm) {
      prepopulateLoginForm(dispatch, getState);
    }
    const dialog =
      postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE ? (
        <ConnectedConfirmationDialogWithStyles
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ title: string; translate: any; buttonText:... Remove this comment to see the full error message
          title="EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx"
          translate={translate}
          buttonText={{
            // TODO: Add keys in language management
            no: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_AttendeeLogin_CancelText__resx',
            yes: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_AttendeeLogin_LoginText__resx'
          }}
          instructionalText="EventGuestSide_ExistingInvitee_AlreadyRegistered_AttendeeLogin_InstructionalText__resx"
          classes={ConfirmationStyles}
        />
      ) : (
        <ConnectedAlreadyRegisteredDialog
          title={title || 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx'}
          login={{
            instructionalText,
            registerNowText: registerNowText || '_registerNowWidget_textConfig__resx'
          }}
          classes={classes}
          postLoginOverride={postLoginOverride}
          onCloseOverride={onCloseOverride}
        />
      );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: { dialogContainer: AlreadyRegisteredStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
