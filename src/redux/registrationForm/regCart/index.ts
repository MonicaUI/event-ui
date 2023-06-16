import { lazyLoadAction, lazyLoadFunction } from '../../../utils/lazyLoad';

export const updateSessionRegistration = lazyLoadFunction(() =>
  import(/* webpackChunkName: "registration" */ './internal').then(m => m.updateSessionRegistration)
);

export const updateAdmissionItemRegistration = lazyLoadFunction(() =>
  import(/* webpackChunkName: "registration" */ './internal').then(m => m.updateAdmissionItemRegistration)
);

export const getPricing = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './pricing').then(m => (m as $TSFixMe).getPricing)
);

export const updateRegCartWithGuests = lazyLoadFunction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './guests').then(m => m.updateRegCartWithGuests)
);

export const updateGuestsInRegCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './guests').then(m => m.updateGuestsInRegCart)
);

export const setCurrentGuestEventRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './guests').then(m => m.setCurrentGuestEventRegistration)
);

export const removeGuestByEventRegistrationId = lazyLoadFunction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './guests').then(m => m.removeGuestByEventRegistrationId)
);

export const updateGuestDetails = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './guests').then(m => m.updateGuestDetails)
);

export const clearTemporaryGuestInformation = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './guests').then(m => m.clearTemporaryGuestInformation)
);

export const removeEventRegistrationFromRegCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './group').then(m => m.removeEventRegistrationFromRegCart)
);

export const removeGroupMembersFromRegCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './group').then(m => m.removeGroupMembersFromRegCart)
);

export const addGroupMemberInRegCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './group').then(m => m.addGroupMemberInRegCart)
);

export const navigateToGroupMemberRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './group').then(m => m.navigateToGroupMemberRegistration)
);

export const startRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.startRegistration)
);

export const abortRegCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.abortRegCart)
);

export const abortRegCartAndLogout = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.abortRegCartAndLogout)
);

export const rescindAbortRegCartAndLogoutRequest = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.rescindAbortRegCartAndLogoutRequest)
);

export const startModification = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.startModification)
);

export const finalizeRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.finalizeRegistration)
);

export const calculateServiceFeesForPartialPayments = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.calculateServiceFeesForPartialPayments)
);

export const resumeAlreadyStartedCheckout = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.resumeAlreadyStartedCheckout)
);

export const waitForRegCartCheckoutCompletionUi = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.waitForRegCartCheckoutCompletionUi)
);

export const startCancelRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.startCancelRegistration)
);

export const finalizeCancelRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.finalizeCancelRegistration)
);

export const startDeclineRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.startDeclineRegistration)
);

export const startWaitlistRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.startWaitlistRegistration)
);

export const finalizeWaitlistRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.finalizeWaitlistRegistration)
);

export const finalizeDeclineRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.finalizeDeclineRegistration)
);

export const saveRegistration = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.saveRegistration),
  true
);

export const updateRegCart = lazyLoadFunction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.updateRegCart)
);

export const updatePaymentCreditsInRegCart = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './paymentCredits').then(m => m.updatePaymentCreditsInRegCart)
);

export const updateTravelFlagInRegCart = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.updateTravelFlagInRegCart)
);

export const setAirRequestOptOutChoice = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './workflow').then(m => m.setAirRequestOptOutChoice)
);

export const applyPartialEventRegistrationUpdate = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "registration" */ './partialUpdates').then(m => m.applyPartialEventRegistrationUpdate)
);

export const setRegistrationTypeId = lazyLoadAction(
  // eslint-disable-next-line import/no-cycle
  () => import(/* webpackChunkName: "registration" */ './registrationTypes').then(m => m.setRegistrationTypeId)
);

export const runRegistrationTypeChangeValidationsForPrimaryAndGuest = lazyLoadFunction(
  // eslint-disable-next-line import/no-cycle
  () =>
    import(/* webpackChunkName: "registration" */ './registrationTypes').then(
      m => m.runRegistrationTypeChangeValidationsForPrimaryAndGuest
    )
);

export const restoreRegistration = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './restore').then(m => m.restoreRegistration)
);

export const restoreRegistrationFromOtherTab = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './restore').then(m => m.restoreRegistrationFromOtherTab)
);

export const resumePartialRegistration = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './restore').then(m => m.resumePartialRegistration)
);

export const searchPartialRegistration = lazyLoadAction(() =>
  import(/* webpackChunkName: "registration" */ './restore').then(m => m.searchPartialRegistration)
);
