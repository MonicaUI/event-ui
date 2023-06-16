import Logger from '@cvent/nucleus-logging';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  getAdmissionItems,
  getEventRegistrations,
  getPrimaryRegistrationId,
  getRegistrationPathId,
  getRegistrationTypeId,
  isPlaceholderRegCart
} from './selectors';
import { getInviteeData, createInitialRegCart } from './internal';
import { getFinalPricingInfo, getRegCartPricingInfo, getRegCartPricingInfoForCheckout } from './pricing';
import { restoreTravelCartIntoState, saveTravelRegistration } from '../../travelCart';
import { travelCartNotFound } from '../../travelCart/index';
import {
  CREATE_REG_CART_PENDING,
  CREATE_REG_CART_FAILURE,
  CREATE_REG_CART_SUCCESS,
  START_MODIFICATION_PENDING,
  START_MODIFICATION_FAILURE,
  START_MODIFICATION_SUCCESS,
  FINALIZE_CHECKOUT_PENDING,
  FINALIZE_CHECKOUT_FAILURE,
  FINALIZE_CHECKOUT_SUCCESS,
  INITIATE_CANCEL_REGISTRATION_PENDING,
  INITIATE_CANCEL_REGISTRATION_SUCCESS,
  START_CANCEL_REGISTRATION_CHECKOUT_PENDING,
  START_CANCEL_REGISTRATION_CHECKOUT_FAILURE,
  START_CANCEL_REGISTRATION_CHECKOUT_SUCCESS,
  FINALIZE_CANCEL_REGISTRATION_PENDING,
  FINALIZE_CANCEL_REGISTRATION_SUCCESS,
  INITIATE_DECLINE_REGISTRATION_SUCCESS,
  INITIATE_WAITLIST_REGISTRATION_FAILURE,
  INITIATE_WAITLIST_REGISTRATION_SUCCESS,
  START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE,
  FINALIZE_DECLINE_REGISTRATION_FAILURE,
  FINALIZE_DECLINE_REGISTRATION_SUCCESS,
  SET_CURRENT_EVENT_REGISTRATION_ID,
  UPDATE_REG_CART_PENDING,
  UPDATE_REG_CART_SUCCESS,
  UPDATE_REG_CART_FAILURE,
  CALCULATE_PRICING_SUCCESS,
  SET_AIR_REQUEST_OPT_OUT_CHOICE,
  CREATE_PLACEHOLDER_REG_CART_SUCCESS,
  CREATE_REG_CART_FROM_PLACEHOLDER_FAILURE
} from './actionTypes';
import { filterEventSnapshot, evaluateQuestionVisibilityLogic } from '../../actions';
import { loadAvailableCapacityCounts } from '../../capacity';
import { setQueryParamsInUserSession } from '../../userSession';
import { getUserType } from '../../defaultUserSession';
import { replaceVisibleProducts, populateRegCartVisibleProducts } from '../../visibleProducts';
import { recordAttendeeUtmParameters } from '../../attendeeActivities/attendeeUtmParameters';
import { hasAnyBookingsToProcess } from '../../../utils/travelUtils';
import { getTravelRegForm } from '../../travelCart/selectors';
import { getEventRegistrationId, isAdminRegistration } from '../../selectors/currentRegistrant';
import { push, setIn } from 'icepick';
import { getCurrentPageId, redirectToPage } from '../../pathInfo';
import { isGuestProductSelectionEnabledOnRegPath } from '../../selectors/currentRegistrationPath';
import { getDefaultAdmissionItemIdSelectionForRegType, isFeesEnabled } from '../../selectors/event';
import { updateGuestsToMatchPrimaryReg } from './guests';
import { size } from 'lodash';
import { findKnownErrorResourceKey, getUpdateErrors } from '../errors';
import { travelCartUpdated } from '../../travelCart/actions';
import { CLEAR_ORDERS } from '../../actionTypes';
import { getLocaleIdFromCultureCode } from '../../multiLanguage/actions';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';
import { updateSelectedTimeZoneForPrimaryAttendee } from '../../timezones';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { getDefaultRegistrationPath } from 'event-widgets/redux/selectors/appData';
import { getCachedRegCartPricing } from '../../../widgets/PaymentWidget/regCartPricing';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';
import { logoutRegistrant } from '../../registrantLogin/actions';
import { openEventTemporaryClosedErrorDialog, openKnownErrorDialog } from '../../../dialogs';
import { redirectToConfirmation } from '../../../errorHandling/confirmation';
import { getDefaultWebsitePageId } from '../../website';

const LOG = new Logger('redux/registrationForm/regCart/workflow');

export function redirectToSummaryPage() {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const defaultWebsitePageId = getDefaultWebsitePageId(getState());
    if (getCurrentPageId(getState()) !== defaultWebsitePageId) {
      dispatch(logoutRegistrant());
      dispatch(redirectToPage(defaultWebsitePageId));
    }
  };
}

/**
 * Creates a RegCart using inviteeId or contactId if provided, if not an empty RegCart
 */
export function startRegistration({
  eventId,
  inviteeId,
  contactId,
  regTypeId,
  adminContactId,
  isEmbeddedRegistration
}: {
  eventId?: $TSFixMe;
  inviteeId?: $TSFixMe;
  contactId?: $TSFixMe;
  regTypeId?: $TSFixMe;
  adminContactId?: $TSFixMe;
  isEmbeddedRegistration?: $TSFixMe;
}) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    await setQueryParamsInUserSession(dispatch, getState());
    const {
      accessToken,
      clients: { regCartClient },
      multiLanguageLocale: { locale },
      // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
      event: { eventLocalesSetup: { eventLocales } = {} },
      userSession: { referenceId, defaultRegPathId },
      defaultUserSession: { defaultRegPackId, isTestMode, httpReferrer },
      appData,
      accountSnapshotVersion,
      eventSnapshotVersion
    } = getState();
    dispatch({
      type: CREATE_REG_CART_PENDING
    });
    let response;

    try {
      const regPathId = isEmbeddedRegistration ? getDefaultRegistrationPath(appData)?.id : defaultRegPathId;
      response = await createInitialRegCart(
        regCartClient,
        accessToken,
        getState(),
        inviteeId,
        contactId,
        eventId,
        isTestMode,
        referenceId,
        regTypeId,
        regPathId,
        defaultRegPackId,
        httpReferrer,
        adminContactId,
        getLocaleIdFromCultureCode(locale, eventLocales),
        isEmbeddedRegistration,
        {
          account: accountSnapshotVersion,
          event: eventSnapshotVersion
        }
      );
      const currentEventRegistrationId = getPrimaryRegistrationId(response.regCart);
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'registrationPathId' does not exist on ty... Remove this comment to see the full error message
      const { registrationPathId, registrationTypeId } = Object.values(response.regCart.eventRegistrations)[0];
      if (regTypeId !== registrationTypeId || regPathId !== registrationPathId) {
        await dispatch(
          filterEventSnapshot(response.regCart.eventSnapshotVersions[eventId], registrationTypeId, registrationPathId)
        );
        await dispatch(loadAvailableCapacityCounts());
      }
      dispatch({
        type: isEmbeddedRegistration ? CREATE_PLACEHOLDER_REG_CART_SUCCESS : CREATE_REG_CART_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages,
          currentEventRegistrationId
        }
      });
      LOG.debug('createRegCart success');
    } catch (error) {
      LOG.info('createRegCart failed', error);
      dispatch({
        type: isPlaceholderRegCart(getState().registrationForm?.regCart)
          ? CREATE_REG_CART_FROM_PLACEHOLDER_FAILURE
          : CREATE_REG_CART_FAILURE,
        payload: { error }
      });
      dispatch(hideLoadingOnError());
      throw error;
    }
    await dispatch(replaceVisibleProducts());
    await dispatch(evaluateQuestionVisibilityLogic(null, true));
    return response;
  };
}

/**
 * aborts/cancels an ongoing INPROGRESS regCart
 * uses the regCartId argument or extracts the id from redux if not provided
 * @returns {function(...[*]=)}
 */
export function abortRegCart(regCartId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: { regCart },
      clients: { regCartClient }
    } = getState();
    try {
      const response = await regCartClient.abortRegCart(accessToken, regCartId || regCart.regCartId);
      LOG.debug('abortRegCart success');
      return response;
    } catch (error) {
      LOG.info('abortRegCart failed', error);
    }
  };
}

/**
 * aborts/cancels an ongoing INPROGRESS regCart and logs user out using Navigator.sendBeacon API
 * @returns {function(...[*]=)}
 */
export function abortRegCartAndLogout() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventGuestClient },
      event: { id: eventId },
      defaultUserSession = {}
    } = getState();
    try {
      const userType = getUserType(defaultUserSession);
      const response = await eventGuestClient.abortRegCartAndLogout(eventId, userType);
      LOG.debug('abortRegCartAndLogout success');
      return response;
    } catch (error) {
      LOG.info('abortRegCartAndLogout failed', error);
    }
  };
}

/**
 * rescinds a request to abort/cancel an ongoing INPROGRESS regCart and user log out
 * @returns {function(...[*]=)}
 */
export function rescindAbortRegCartAndLogoutRequest() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { eventGuestClient },
      event: { id: eventId },
      defaultUserSession = {}
    } = getState();
    try {
      const userType = getUserType(defaultUserSession);
      const response = await eventGuestClient.rescindAbortRegCartAndLogoutRequest(accessToken, eventId, userType);
      LOG.debug('rescindAbortRegCartAndLogoutRequest success');
      return response;
    } catch (error) {
      LOG.info('rescindAbortRegCartAndLogoutRequest failed', error);
    }
  };
}

export function startModification() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      event,
      registrationForm,
      accessToken,
      registrantLogin,
      clients: { regCartClient },
      userSession: { registrationId },
      experiments: { asyncRegModCreation = false } = {}
    } = getState();

    let regCart;
    try {
      const inviteeData = getInviteeData(registrationForm, registrationId);
      const isAdmin = isAdminRegistration(getState());
      const adminContactId = isAdmin ? registrationForm?.regCart?.admin?.contactId : null;
      const loginConfirmationNumber = isAdmin
        ? registrationForm?.regCart?.adminConfirmationNumber
        : inviteeData.confirmationNumber;
      LOG.debug('startModification start');
      if (asyncRegModCreation) {
        dispatch({ type: START_MODIFICATION_PENDING, payload: { startProgress: 0 } });
        let regCartId;
        regCartId = await regCartClient.initiateRegModAsync(
          accessToken,
          inviteeData.inviteeId,
          loginConfirmationNumber,
          event.id,
          adminContactId
        );
        const modResult = await regCartClient.awaitRegModReady(accessToken, regCartId, startProgress => {
          dispatch({ type: START_MODIFICATION_PENDING, payload: { startProgress } });
        });
        regCartId = modResult?.regCart?.regCartId || regCartId;
        dispatch({ type: START_MODIFICATION_PENDING, payload: { startProgress: 100 } });
        regCart = await regCartClient.getRegCart(accessToken, regCartId);
      } else {
        dispatch({ type: START_MODIFICATION_PENDING });
        const response = await regCartClient.createRegModCart(
          accessToken,
          inviteeData.inviteeId,
          loginConfirmationNumber,
          event.id,
          adminContactId
        );
        regCart = response.regCart;
      }

      const currentEventRegistrationId = getPrimaryRegistrationId(regCart);
      const currentLogin = {};
      if (isAdmin) {
        (currentLogin as $TSFixMe).emailAddress = registrationForm?.regCart?.admin?.emailAddress;
        (currentLogin as $TSFixMe).confirmationNumber = loginConfirmationNumber;
      } else {
        (currentLogin as $TSFixMe).emailAddress = registrantLogin?.currentLogin?.emailAddress;
        (currentLogin as $TSFixMe).confirmationNumber = registrantLogin?.currentLogin?.confirmationNumber;
      }
      dispatch({ type: START_MODIFICATION_SUCCESS, payload: { regCart, currentLogin } });
      dispatch({ type: SET_CURRENT_EVENT_REGISTRATION_ID, payload: { currentEventRegistrationId } });
      dispatch(updateSelectedTimeZoneForPrimaryAttendee(regCart, currentEventRegistrationId));
      if (regCart.hasTravel) {
        dispatch(restoreTravelCartIntoState(regCart.regCartId));
      } else {
        await dispatch(travelCartNotFound(regCart.regCartId));
      }
      const { registrationTypeId, registrationPathId } = regCart.eventRegistrations[currentEventRegistrationId];
      await dispatch(
        filterEventSnapshot(regCart.eventSnapshotVersions[event.id], registrationTypeId, registrationPathId)
      );
    } catch (error) {
      await dispatch({ type: START_MODIFICATION_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
    await dispatch(populateRegCartVisibleProducts());
  };
}

const checkoutCompletionDelay = 2000;
/**
 * Add a delay between receiving indication from the server that checkout has completed and reacting to it so that
 * the user has a chance to see checkout progress has hit 100%
 */
function delayCheckoutCompletion() {
  return new Promise(resolve => {
    // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
    setTimeout(() => resolve(), checkoutCompletionDelay);
  });
}

export function finalizeRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, { apolloClient }: $TSFixMe = {}): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: { regCartPayment, regCart },
      clients: { regCartClient, travelApiClient },
      testSettings: { registrationCheckoutTimeout },
      partialPaymentSettings
    } = getState();
    const regCartPricing = getCachedRegCartPricing(regCart.regCartId, apolloClient);

    // paymentAmountBeforeServiceFees is the netFeeAmountCharge (price without service fees)
    let paymentAmountBeforeServiceFees;
    // paymentAmount is netFeeAmountChargeWithPaymentAmountServiceFee which is the final amount to be charged
    let paymentAmount = regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee;
    // if partial payment amount is present in text box (i.e state), it should always be passed
    if (
      partialPaymentSettings?.paymentAmount &&
      partialPaymentSettings?.paymentAmountOption?.value === PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT.value
    ) {
      paymentAmountBeforeServiceFees = partialPaymentSettings.paymentAmount;
    } else if (regCartPayment.selectedPaymentMethod === 'noPayment') {
      paymentAmount = 0;
    }
    const pricingInfo = {
      ...getFinalPricingInfo({ ...getState(), regCartPricing }),
      paymentAmount,
      paymentAmountBeforeServiceFees
    };

    LOG.debug('finalizeRegistration', pricingInfo);
    dispatch({ type: CLEAR_ORDERS });
    dispatch({ type: FINALIZE_CHECKOUT_PENDING, payload: { checkoutProgress: 0 } });
    try {
      await regCartClient.calculateRegCartPricing(accessToken, regCart.regCartId, pricingInfo);
      await regCartClient.startRegCartCheckout(
        accessToken,
        regCart.regCartId,
        getRegCartPricingInfoForCheckout(pricingInfo, accessToken),
        registrationCheckoutTimeout
      );
      return await getFinalState(regCartClient, travelApiClient, accessToken, regCart.regCartId, dispatch);
    } catch (error) {
      if (getUpdateErrors.isCartCancelled(error) || getUpdateErrors.isCartStatusNotInProgress(error)) {
        // the rest was already set in motion to handle this - redirecting to summary page. we do nothing in this event.
        return;
      }
      dispatch({ type: FINALIZE_CHECKOUT_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}

export function resumeAlreadyStartedCheckout() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: {
        regCart: { regCartId }
      },
      clients: { regCartClient, travelApiClient }
    } = getState();
    return await getFinalState(regCartClient, travelApiClient, accessToken, regCartId, dispatch);
  };
}

export async function getFinalState(
  regCartClient: $TSFixMe,
  travelApiClient: $TSFixMe,
  accessToken: $TSFixMe,
  regCartId: $TSFixMe,
  dispatch: $TSFixMe
): Promise<$TSFixMe> {
  const finalStatus = await regCartClient.waitForRegCartCheckoutCompletion(accessToken, regCartId, regCartStatus => {
    const checkoutProgress = regCartStatus.progress || 0;
    dispatch({ type: FINALIZE_CHECKOUT_PENDING, payload: { checkoutProgress } });
    LOG.debug('received reg cart progress', regCartStatus);
  });
  dispatch({ type: FINALIZE_CHECKOUT_PENDING, payload: { checkoutProgress: 100 } });
  await delayCheckoutCompletion();
  const regCartResponse = await regCartClient.getRegCart(accessToken, regCartId);
  dispatch({ type: FINALIZE_CHECKOUT_SUCCESS, payload: { regCart: regCartResponse } });
  dispatch(recordAttendeeUtmParameters());

  if (regCartResponse.hasTravel) {
    // get travel cart and update in state
    const travelCart = await travelApiClient.getTravelCart(regCartId);
    await dispatch(travelCartUpdated(travelCart));
  }
  LOG.debug('finished waiting for reg cart checkout', finalStatus);
  return finalStatus;
}

export function waitForRegCartCheckoutCompletionUi() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const {
        accessToken,
        registrationForm: {
          regCart: { regCartId }
        },
        clients: { regCartClient, travelApiClient }
      } = getState();
      dispatch({ type: FINALIZE_CHECKOUT_PENDING, payload: { checkoutProgress: 0 } });
      return await getFinalState(regCartClient, travelApiClient, accessToken, regCartId, dispatch);
    } catch (error) {
      dispatch({ type: FINALIZE_CHECKOUT_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}

export function startCancelRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      event,
      registrationForm,
      accessToken,
      registrantLogin,
      clients: { regCartClient },
      userSession: { registrationId }
    } = getState();
    let response;
    try {
      LOG.debug('startCancelRegistration start');
      dispatch({ type: INITIATE_CANCEL_REGISTRATION_PENDING });
      const inviteeData = getInviteeData(registrationForm, registrationId);
      const isAdmin = isAdminRegistration(getState());
      const adminContactId = isAdmin ? registrationForm?.regCart?.admin?.contactId : null;
      const loginConfirmationNumber = isAdmin
        ? registrationForm?.regCart?.adminConfirmationNumber
        : inviteeData.confirmationNumber;
      LOG.debug('startCancellation start');
      response = await regCartClient.createCancelRegistrationCart(
        accessToken,
        inviteeData.inviteeId,
        loginConfirmationNumber,
        event.id,
        adminContactId
      );
      const regCart = response.regCart;
      const currentEventRegistrationId = getPrimaryRegistrationId(regCart);

      const currentLogin = {};
      if (isAdmin) {
        (currentLogin as $TSFixMe).emailAddress = registrationForm?.regCart?.admin?.emailAddress;
        (currentLogin as $TSFixMe).confirmationNumber = loginConfirmationNumber;
      } else {
        (currentLogin as $TSFixMe).emailAddress = registrantLogin?.currentLogin?.emailAddress;
        (currentLogin as $TSFixMe).confirmationNumber = registrantLogin?.currentLogin?.confirmationNumber;
      }
      dispatch({ type: SET_CURRENT_EVENT_REGISTRATION_ID, payload: { currentEventRegistrationId } });
      dispatch({ type: INITIATE_CANCEL_REGISTRATION_SUCCESS, payload: { regCart, currentLogin } });
      dispatch(updateSelectedTimeZoneForPrimaryAttendee(regCart, currentEventRegistrationId));
      const { registrationTypeId, registrationPathId } = regCart.eventRegistrations[currentEventRegistrationId];
      await dispatch(
        filterEventSnapshot(regCart.eventSnapshotVersions[event.id], registrationTypeId, registrationPathId)
      );
    } catch (error) {
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}

export function finalizeCancelRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, { apolloClient }: $TSFixMe = {}): Promise<$TSFixMe> => {
    const state = getState();
    const {
      accessToken,
      registrationForm: {
        regCart: { regCartId }
      },
      clients: { regCartClient },
      testSettings: { registrationCheckoutTimeout }
    } = state;

    const regCartPricing = getCachedRegCartPricing(regCartId, apolloClient);
    const pricingInfo = getFinalPricingInfo({ ...state, regCartPricing });

    dispatch({ type: START_CANCEL_REGISTRATION_CHECKOUT_PENDING });
    LOG.debug('finalize cancel registration', pricingInfo);
    try {
      await regCartClient.calculateRegCartPricing(accessToken, regCartId, pricingInfo);
      await regCartClient.startRegCartCheckout(accessToken, regCartId, pricingInfo, registrationCheckoutTimeout);
      dispatch({ type: START_CANCEL_REGISTRATION_CHECKOUT_SUCCESS });
    } catch (error) {
      dispatch(hideLoadingOnError());
      dispatch({ type: START_CANCEL_REGISTRATION_CHECKOUT_FAILURE, payload: { error } });
      throw error;
    }
    try {
      dispatch({ type: FINALIZE_CANCEL_REGISTRATION_PENDING });
      const finalStatus = await regCartClient.waitForRegCartCheckoutCompletion(accessToken, regCartId, () => {});
      await delayCheckoutCompletion();
      const regCartResponse = await regCartClient.getRegCart(accessToken, regCartId);
      dispatch({ type: FINALIZE_CANCEL_REGISTRATION_SUCCESS, payload: { regCart: regCartResponse } });
      LOG.debug('finished waiting for cancel reg cart checkout', finalStatus);
    } catch (error) {
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}

export function startDeclineRegistration(inviteeId: $TSFixMe, regTypeId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    await setQueryParamsInUserSession(dispatch, getState());
    const {
      accessToken,
      clients: { regCartClient },
      userSession: { referenceId },
      defaultUserSession: { eventId },
      plannerRegSettings,
      registrationForm: {
        regCart: { localeId }
      }
    } = getState();
    LOG.debug('Decline Registration start', { eventId, inviteeId, regTypeId, referenceId });
    const sendEmail = plannerRegSettings ? plannerRegSettings.sendEmail : true;
    try {
      const response = await regCartClient.createDeclineRegistrationCart(
        accessToken,
        eventId,
        inviteeId,
        regTypeId,
        sendEmail,
        referenceId,
        localeId
      );
      dispatch({ type: INITIATE_DECLINE_REGISTRATION_SUCCESS, payload: { regCart: response.regCart } });
    } catch (error) {
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}
export function startWaitlistRegistration(inviteeId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { regCartClient },
      defaultUserSession: { eventId }
    } = getState();
    LOG.debug('Waitlist Registration start', { eventId, inviteeId });
    try {
      const response = await regCartClient.createWaitlistRegistrationCart(accessToken, eventId, inviteeId);
      dispatch({ type: INITIATE_WAITLIST_REGISTRATION_SUCCESS, payload: { regCart: response.regCart } });
    } catch (error) {
      dispatch(hideLoadingOnError());
      dispatch({ type: INITIATE_WAITLIST_REGISTRATION_FAILURE, payload: { error } });
      throw error;
    }
  };
}
export function finalizeWaitlistRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: {
        regCart: { regCartId }
      },
      registrationForm: { regCart },
      clients: { regCartClient },
      testSettings: { registrationCheckoutTimeout },
      event,
      account
    } = getState();
    const pricingInfo = { paymentType: PAYMENT_TYPE.OFFLINE };
    LOG.debug('finalize waitlist registration', pricingInfo);
    try {
      await regCartClient.updateRegCart(accessToken, regCart);
      await regCartClient.startRegCartCheckout(accessToken, regCartId, pricingInfo, registrationCheckoutTimeout);
    } catch (error) {
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(regCart, getEventRegistrationId(getState())),
          getRegistrationPathId(regCart, getEventRegistrationId(getState()))
        )
      ) {
        return;
      }
      dispatch(hideLoadingOnError());
      dispatch({ type: START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE, payload: { error } });
      throw error;
    }
  };
}

export function finalizeDeclineRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: {
        regCart: { regCartId }
      },
      registrationForm: { regCart },
      clients: { regCartClient },
      testSettings: { registrationCheckoutTimeout },
      event,
      account
    } = getState();
    const pricingInfo = { paymentType: PAYMENT_TYPE.OFFLINE };
    LOG.debug('finalize decline registration', pricingInfo);
    try {
      await regCartClient.updateRegCart(accessToken, regCart);
      await regCartClient.startRegCartCheckout(accessToken, regCartId, pricingInfo, registrationCheckoutTimeout);
    } catch (error) {
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(regCart, getEventRegistrationId(getState())),
          getRegistrationPathId(regCart, getEventRegistrationId(getState()))
        )
      ) {
        return;
      }
      dispatch(hideLoadingOnError());
      dispatch({ type: FINALIZE_DECLINE_REGISTRATION_FAILURE, payload: { error } });
      throw error;
    }
    try {
      const finalStatus = await regCartClient.waitForRegCartCheckoutCompletion(accessToken, regCartId, () => {});
      await delayCheckoutCompletion();
      const regCartResponse = await regCartClient.getRegCart(accessToken, regCartId);
      await dispatch({ type: FINALIZE_DECLINE_REGISTRATION_SUCCESS, payload: { regCart: regCartResponse } });
      LOG.debug('finished waiting for decline reg cart checkout', finalStatus);
    } catch (error) {
      dispatch(hideLoadingOnError());
      dispatch({ type: FINALIZE_DECLINE_REGISTRATION_FAILURE, payload: { error } });
      throw error;
    }
  };
}

export function saveRegistration(linkedInviteeIdToRemove: $TSFixMe, checkTravel: $TSFixMe, isForward: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: { validationMessages },
      regCartStatus: { lastSavedRegCart },
      clients: { regCartClient },
      eventTravel,
      event,
      account
    } = getState();

    let {
      registrationForm: { regCart: cart }
    } = getState();
    if (checkTravel) {
      cart = { ...cart, hasTravel: !!hasAnyBookingsToProcess(getTravelRegForm(getState()), eventTravel) };
    }
    if (cart === lastSavedRegCart) {
      return { regCart: cart, validationMessages };
    }
    let response;
    let regStatus;
    dispatch({ type: UPDATE_REG_CART_PENDING });
    try {
      LOG.debug('updateRegCart', cart);
      response = await updateRegCart(getState(), regCartClient, accessToken, cart, linkedInviteeIdToRemove, isForward);
      const currentRegistrantEventRegId = getEventRegistrationId(getState());
      const regPathId = getRegistrationPathId(response.regCart, currentRegistrantEventRegId);
      const registrationTypeId = getRegistrationTypeId(response.regCart, currentRegistrantEventRegId);
      const regPath = getState().appData.registrationSettings.registrationPaths[regPathId];
      if (!regPath) {
        await dispatch(filterEventSnapshot(getState().eventSnapshotVersion, registrationTypeId, regPathId));
      }
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages
        }
      });
      LOG.debug('updateRegCart success');
    } catch (error) {
      LOG.info('updateRegCart failed', error);
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(cart, getEventRegistrationId(getState())),
          getRegistrationPathId(cart, getEventRegistrationId(getState()))
        )
      ) {
        return;
      }
      const { attendingFormat = AttendingFormat.INPERSON } = event;
      if (shouldHybridFlowWork(attendingFormat) && getUpdateErrors.isEventTemporaryClosed(error)) {
        dispatch(openEventTemporaryClosedErrorDialog());
        return;
      }
      if (getUpdateErrors.isCartBeingProcessed(error)) {
        // Checkout already started, instead of treating as a failure, we'll just poll for completion normally
        regStatus = await dispatch(resumeAlreadyStartedCheckout());
        if (
          regStatus.statusCode !== 'THIRD_PARTY_REDIRECT' &&
          regStatus.statusCode !== 'THIRD_PARTY_REDIRECT_STARTED'
        ) {
          return await redirectToConfirmation(regStatus, dispatch, getState);
        }
      }
      if (getUpdateErrors.isCartCancelled(error) || getUpdateErrors.acquiringLockFailed(error)) {
        return await dispatch(
          openKnownErrorDialog(
            findKnownErrorResourceKey(error.responseBody.validationMessages),
            null,
            redirectToSummaryPage
          )
        );
      }
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
    await dispatch(saveTravelRegistration(isForward));
    await dispatch(evaluateQuestionVisibilityLogic(null, true));
    return response;
  };
}

// Method to recalculate service fees for partial payments
export function calculateServiceFeesForPartialPayments(
  partialPaymentSettings: $TSFixMe,
  regCartPayment: $TSFixMe,
  regCart: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { regCartClient },
      regCartPricing
    } = getState();
    const feesEnabled = isFeesEnabled(getState());
    const paymentAmountBeforeServiceFees = partialPaymentSettings.paymentAmount;
    const paymentAmount = regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee;
    const pricingInfo = {
      ...getRegCartPricingInfo(regCartPayment, feesEnabled),
      paymentAmount,
      paymentAmountBeforeServiceFees
    };
    const response = await regCartClient.calculateRegCartPricing(accessToken, regCart.regCartId, pricingInfo);
    dispatch({
      type: CALCULATE_PRICING_SUCCESS,
      payload: {
        regCartPricing: response.regCartPricing,
        validationMessages: response.regCartPricing.validationMessages
      }
    });
  };
}

/**
 * Updates the regCart and additionally adds admission items to each event registration under the following conditions.
 * 1. The event registration has no admission item.
 * 2. The event only has a single admission item available and the event registration has a registration type which
 *    the admission item is available for.
 *
 * It became necessary in PROD-41864 to not automatically add an admission item until the registration type allowed it
 * to prevent hard errors.
 *
 * isForward indicates whether the invitee is moving forward in the registration (next page or submit)
 */
export async function updateRegCart(
  state: $TSFixMe,
  regCartClient: $TSFixMe,
  accessToken: $TSFixMe,
  regCart: $TSFixMe,
  linkedInviteeIdToRemove?: $TSFixMe,
  isForward = null
): Promise<$TSFixMe> {
  const regCartWithPage = isForward ? setIn(regCart, ['lastSavedPageId'], getCurrentPageId(state)) : regCart;
  let response = await regCartClient.updateRegCart(accessToken, regCartWithPage, linkedInviteeIdToRemove);
  const eventRegistrationIds = Object.keys(getEventRegistrations(response.regCart));
  const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
  // Looks at each event registration and tries to add an admission item if possible.
  for (let index = 0; index < eventRegistrationIds.length; index++) {
    const eventRegistrationId = eventRegistrationIds[index];
    const eventRegistration = response.regCart.eventRegistrations[eventRegistrationId];
    const hasNoAdmissionItem = size(getAdmissionItems(response.regCart, eventRegistrationId)) === 0;
    const isGuest = eventRegistration && eventRegistration.attendeeType === 'GUEST';
    // if the attendee is a guest and guestProductSelectionEnabled then proceed
    const updateAdmissionItem = isGuest && isGuestProductSelectionEnabled;
    if (hasNoAdmissionItem && updateAdmissionItem) {
      const defaultAdmissionItemId = getDefaultAdmissionItemIdSelectionForRegType(
        state,
        eventRegistration.registrationTypeId
      );
      if (defaultAdmissionItemId) {
        response = await regCartClient.updateRegCart(
          accessToken,
          setIn(
            response.regCart,
            ['eventRegistrations', eventRegistrationId, 'productRegistrations'],
            push(eventRegistration.productRegistrations, {
              productId: defaultAdmissionItemId,
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            })
          ),
          linkedInviteeIdToRemove
        );
      }
    }
    // if guestProductSelection not enabled match the currentRegistrants guest to primary's products
    if (hasNoAdmissionItem && isGuest && !isGuestProductSelectionEnabled) {
      const primaryEventRegId = eventRegistration.primaryRegistrationId;
      const updatedRegCart = updateGuestsToMatchPrimaryReg(response.regCart, primaryEventRegId, state);
      response = await regCartClient.updateRegCart(accessToken, updatedRegCart, linkedInviteeIdToRemove);
    }
  }
  return response;
}

/**
 * Updates the travel flag in reg cart as passed
 */
export function updateTravelFlagInRegCart(hasTravelFlag: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      accessToken,
      registrationForm: { regCart },
      regCartStatus: { lastSavedRegCart },
      clients: { regCartClient },
      event,
      account
    } = state;
    let response;
    dispatch({ type: UPDATE_REG_CART_PENDING });
    try {
      /*
       * need to just update the travel flag in the cart
       * so use the last saved cart, to avoid any other validations from latest local state
       */
      response = await updateRegCart(state, regCartClient, accessToken, {
        ...lastSavedRegCart,
        hasTravel: hasTravelFlag
      });
      const savedRegCart = response.regCart;

      // and we also need to update the local state, to keep the travel flag in sync between saved and unsaved/latest
      const regCartWithUnsavedChanges = {
        ...regCart,
        hasTravel: savedRegCart.hasTravel
      };

      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: regCartWithUnsavedChanges,
          savedRegCart,
          validationMessages: response.validationMessages
        }
      });
      LOG.debug(`updateRegCart with id ${regCart.regCartId} was successful`);
    } catch (error) {
      LOG.error(`updateRegCart with id ${regCart.regCartId} failed`, error);
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(lastSavedRegCart, getEventRegistrationId(getState())),
          getRegistrationPathId(lastSavedRegCart, getEventRegistrationId(getState()))
        )
      ) {
        return;
      }
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}

/**
 * updates the air request opt out choice for attendee on the basis of their registration ID
 */
export function setAirRequestOptOutChoice(eventRegistrationId: $TSFixMe, requestOptOutChoice: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: SET_AIR_REQUEST_OPT_OUT_CHOICE,
      payload: {
        path: ['eventRegistrations', eventRegistrationId, 'attendee', 'airOptOutChoice'],
        requestOptOutChoice
      }
    });
  };
}
