import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { withSpinnerButtonAndTransparentWrapper } from '../redux/registrationForm/regCart/productUpdate';

const lazyLoadDialog = importOpenDialog =>
  withLoading((...args) => {
    return async dispatch => {
      const openDialog = await importOpenDialog();
      return dispatch(openDialog(...args));
    };
  });

const lazyLoadTransparentWrapperWithSpinnerButton = importOpenWrapper =>
  withSpinnerButtonAndTransparentWrapper((...args) => {
    return async dispatch => {
      const openTransparentWrapperWithSpinnerButton = await importOpenWrapper();
      return dispatch(openTransparentWrapperWithSpinnerButton(...args));
    };
  });

export const openAlreadyRegisteredDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "alreadyRegisteredDialog" */ './AlreadyRegisteredDialog').then(
      m => m.openAlreadyRegisteredDialog
    )
);

export const openDeclineRegistrationDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "declineRegistrationDialog" */ './DeclineRegistrationDialog').then(
    m => m.openDeclineRegistrationDialog
  )
);

export const openStartNewRegistrationDialogFromPageLanding = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "startNewRegistrationDialog" */ './StartNewRegistrationDialog').then(
      m => m.openStartNewRegistrationDialogFromPageLanding
    )
);

export const openStartNewRegistrationDialogDuringRegistration = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "startNewRegistrationDialog" */ './StartNewRegistrationDialog').then(
      m => m.openStartNewRegistrationDialogDuringRegistration
    )
);

export const startNewRegistrationAndNavigateToRegistration = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "startNewRegistrationDialog" */ './StartNewRegistrationDialog').then(
      m => m.startNewRegistrationAndNavigateToRegistration
    )
);

export const openEventWaitlistDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "eventWaitlistDialog" */ './EventWaitlistDialog').then(m => m.openEventWaitlistDialog)
);

export const openEventTemporaryClosedErrorDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "eventTemporaryClosedDialog" */ './EventTemporaryClosedErrorDialog').then(
    m => m.openEventTemporaryClosedErrorDialog
  )
);

export const openNoAdmissionItemAvailableForRegistrationTypeDialog = lazyLoadDialog(() =>
  import(
    /* webpackChunkName: "noAdmissionItemAvailableForRegistrationDialog" */
    './NoAdmissionItemAvailableForRegistrationTypeDialog'
  ).then(m => m.openNoAdmissionItemAvailableForRegistrationTypeDialog)
);

export const openEventStatusDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "eventStatusDialog" */ './EventStatusDialog').then(m => m.openEventStatusDialog)
);

export const openEventAttendingFormatSwitchDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "AttendingFormatSwitchDialog" */ './AttendingFormatSwitchDialog').then(
    m => m.openEventAttendingFormatSwitchDialog
  )
);

export const openPrivateEventErrorDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "privateEventErrorDialog" */ './PrivateEventErrorDialog').then(
      m => m.openPrivateEventErrorDialog
    )
);

export const openRegistrationInOtherTabDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "registrationInOtherTab" */ './RegistrationInOtherTabDialog').then(
    m => m.openRegistrationInOtherTabDialog
  )
);

export const openKnownErrorDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "knownErrorDialog" */ './KnownErrorDialog').then(m => m.openKnownErrorDialog)
);

export const openPaymentProcessingErrorDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "paymentProcessingErrorDialog" */ './PaymentProcessingErrorDialog').then(
    m => m.openPaymentProcessingErrorDialog
  )
);

export const openPaymentCreditsErrorDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "paymentProcessingErrorDialog" */ './PaymentCreditsErrorDialog').then(
    m => m.openPaymentCreditsErrorDialog
  )
);

export const openPaymentSuccessfulDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "paymentSuccessfulDialog" */ './PaymentSuccessfulDialog').then(
    m => m.openPaymentSuccessfulDialog
  )
);

export const openInformationAlreadyUsedDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "informationAlreadyUsedDialog" */ './InformationAlreadyUsedDialog').then(
    m => m.openInformationAlreadyUsedDialog
  )
);

export const openInvalidPhoneNumberDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "invalidPhoneNumberDialog" */ './InvalidPhoneNumberDialog').then(
    m => m.openInvalidPhoneNumberDialog
  )
);

export const openPartialRegistrationConfirmationDialog = lazyLoadDialog(() =>
  import(
    /* webpackChunkName: "partialRegistrationConfirmationDialog" */
    './PartialRegistrationConfirmationDialog'
  ).then(m => m.openPartialRegistrationConfirmationDialog)
);

export const openPreviewModeWarningDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "previewModeWarningDialog" */ './PreviewModeWarningDialog').then(
    m => m.openPreviewModeWarningDialog
  )
);

export const openCapacityReachedDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "capacityReachedDialog" */ './CapacityReachedDialog').then(
    m => m.openCapacityReachedDialog
  )
);

export const openGroupCancelRegistrationDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "groupCancelDialog" */ './GroupCancelDialog').then(
    m => m.openGroupCancelRegistrationDialog
  )
);

export const openSessionOverlapWarningDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "sessionOverlapWarningDialog" */ './SessionOverlapWarningDialog').then(
    m => m.openSessionOverlapWarningDialog
  )
);

export const openGroupMemberRemoveDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "groupMemberRemoveDialog" */ './GroupMemberRemoveDialog').then(
      m => m.openGroupMemberRemoveDialog
    )
);

export const openSharePromptDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "sharePromptDialog" */ './SharePromptDialog').then(m => m.openSharePromptDialog)
);

export const openConfirmationDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "confirmationDialog" */ './ConfirmationDialog').then(m => m.openConfirmationDialog)
);

export const openGuestProductSelectionDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "guestProductSelectionDialog" */ './GuestProductSelectionDialogs').then(
      m => m.openGuestProductSelectionDialog
    )
);

export const openGuestProductSelectionDialogFromSessions = lazyLoadTransparentWrapperWithSpinnerButton(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "guestProductSelectionDialog" */ './GuestProductSelectionDialogs').then(
      m => m.openGuestProductSelectionDialog
    )
);

export const openGroupRegistrationTypeDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "groupRegistrationTypeDialog" */ './GroupRegistrationTypeDialog').then(
    m => m.openGroupRegistrationTypeDialog
  )
);

export const openGuestDetailsDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "guestDetailsDialog" */ './GuestDetailsDialog/GuestDetailsDialog').then(
      m => m.openGuestDetailsDialog
    )
);

export const openGuestRemoveDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "guestRemoveDialog" */ './GuestRemoveDialog').then(m => m.openGuestRemoveDialog)
);

export const openPaymentAmountServiceFeeConfirmationDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(
      /* webpackChunkName: "paymentAmountServiceFeeConfirmationDialog" */
      './PaymentAmountServiceFeeConfirmationDialog'
    ).then(m => m.openPaymentAmountServiceFeeConfirmationDialog)
);

export const openPaymentAmountServiceFeeConfirmationPostRegDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(
      /* webpackChunkName: "paymentAmountServiceFeePostRegConfirmationDialog" */
      './PaymentAmountServiceFeeConfirmationPostRegDialog'
    ).then(m => m.openPaymentAmountServiceFeeConfirmationPostRegDialog)
);

export const openTimeZoneDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "timeZoneDialog" */ './TimeZoneDialog').then(m => m.openTimeZoneDialog)
);

export const openPartialRegDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "partialRegDialog" */ './PartialRegDialog').then(m => m.openPartialRegDialog)
);

export const openSingleSignOnRegistrationDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "SingleSignOnRegistrationDialog" */ './SingleSignOnRegistrationDialog').then(
      m => m.openSingleSignOnRegistrationDialog
    )
);

export const openContactPlannerDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "contactPlannerDialog" */ './ContactPlannerDialog').then(m => m.openContactPlannerDialog)
);

export const openSubstituteRegistrationDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "substituteRegistrationDialog" */ './SubstituteRegistrationDialog').then(
      m => m.openSubstituteRegistrationDialog
    )
);

export const openInvitationForwardingDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "invitationForwardingDialog" */ './InvitationForwardingDialog').then(
    m => m.openInvitationForwardingDialog
  )
);

export const openCancelRegistrationSuccessConfirmationDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "cancelRegistrationSuccessDialog" */ './CancelRegistrationSuccessDialog').then(
    m => m.openCancelRegistrationSuccessConfirmationDialog
  )
);

export const openCancelRegistrationDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "cancelRegistrationDialog" */ './CancelRegistrationDialog').then(
      m => m.openCancelRegistrationDialog
    )
);

export const openShoulderDateApprovalWarningDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "shoulderDateApprovalWarningDialog" */ './ShoulderDateApprovalWarningDialog').then(
    m => m.openShoulderDateApprovalWarningDialog
  )
);

export const openTransactionInProcessingErrorDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "transactionInProcessingDialog" */ './TransactionInProcessingErrorDialog').then(
    m => m.openTransactionInProcessingErrorDialog
  )
);

export const openTravelUnsavedInfoWarningDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "travelUnsavedInfoWarningDialog" */ './TravelUnsavedInfoWarningDialog').then(
      m => m.openTravelUnsavedInfoWarningDialog
    )
);

export const openGroupFlightAttendeeSelectionDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(
      /* webpackChunkName: "openGroupFlightAttendeeSelectionDialog" */
      './GuestProductSelectionDialogs/GroupFlight/GroupFlight'
    ).then(m => m.openGroupFlightAttendeeSelectionDialog)
);

export const openPrivateRegistrationPathDialog = lazyLoadDialog(() =>
  import(/* webpackChunkName: "privateRegistrationPathDialog" */ './PrivateRegistrationPathDialog').then(
    m => m.openPrivateRegistrationPathDialog
  )
);

export const openFeeRefundPolicyDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "feeRefundPolicyDialog" */ './FeeRefundPolicyDialog').then(
      m => m.openFeeRefundPolicyDialog
    )
);

export const openPaymentCreditsDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () => import('./PaymentCreditsDialog').then(m => m.openPaymentCreditsDialog)
);

export const openIncludedSessionsDialog = lazyLoadDialog(
  // eslint-disable-next-line import/no-cycle
  () => import('./IncludedSessionsDialog').then(m => m.openIncludedSessionsDialog)
);
