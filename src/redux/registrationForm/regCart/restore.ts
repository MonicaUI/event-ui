import { getRegCart } from '../../selectors/shared';
import { RESTORE_REG_CART_PENDING, RESTORE_REG_CART_SUCCESS, RESTORE_REG_CART_PARTIAL } from './actionTypes';
import qs from 'querystring';
import { redirectToPage, retryLoadPage, stripRetryAttempt } from '../../pathInfo';
import { getRestoreErrors } from '../errors';
import { logoutRegistrant } from '../../registrantLogin/actions';
import { restoreTravelRegistration } from '../../travelCart';
import Logger from '@cvent/nucleus-logging';
import { getPrimaryAttendee, getPrimaryContactIdFromRegCart } from './selectors';
import { loadRegistrationContentForRegApproval, updateInviteeStatusAndContactIdInStore } from '../../persona';
import { loadLanguageFromLocale } from '../../multiLanguage/actions';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { InviteeStatusById } from 'event-widgets/utils/InviteeStatus';
import { getConfirmationInfo } from '../../selectors/currentRegistrant';
import { isPlannerRegistration } from '../../defaultUserSession';

const LOG = new Logger('redux/registrationForm/regCart/restore');

// Rescind of abort registration request needs to block restoreRegistration dispatch
let rescindAbortRegistrationRequest;
export function setRescindAbortRegistrationRequest(request: $TSFixMe): $TSFixMe {
  rescindAbortRegistrationRequest = request;
}
async function runningResindAbortRegistrationRequest() {
  return rescindAbortRegistrationRequest
    ? rescindAbortRegistrationRequest.then(() => (rescindAbortRegistrationRequest = undefined))
    : Promise.resolve();
}

/**
 * Retrieves a RegCart from service.
 * This only works when user session is alive (server-side session is active and browser have identifier cookie)
 */
export function restoreRegistration(regCartId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    // wait for running rescind abort request to complete
    await runningResindAbortRegistrationRequest();
    const {
      accessToken,
      clients: { regCartClient }
    } = getState();
    // Only need to restore a reg cart once.
    const regCartIdFromState = (getRegCart(getState()) || {}).regCartId;
    if (regCartIdFromState === regCartId) return;
    dispatch({ type: RESTORE_REG_CART_PENDING });
    const isRetryAttempt = qs.parse(window.location.search.slice(1)).retryAttempt;
    let regCart = {};
    try {
      regCart = await regCartClient.getRegCart(accessToken, regCartId);
      regCart = await dispatch(performRegCartRestoreActions(regCart, isRetryAttempt));
    } catch (error) {
      LOG.info(`Failed to restore regCart ${regCartId}`, error);
      /*
       * PROD-46502: In the case of reg cart id conflict, we want to refresh the page, as they have likely
       * used the back button and the original page is out of date.
       */
      if (getRestoreErrors.isRegCartIdConflict(error)) {
        /*
         * If this is the second time this is happening, something is wrong that can't be fixed with a reload
         * Log out and redirect to summary
         */
        if (isRetryAttempt !== undefined && isRetryAttempt === 'true') {
          // We don't want to maintain this retryAttempt querystring value when they are redirected to summary.
          stripRetryAttempt();
          await dispatch(logoutRegistrant());
          await dispatch(redirectToPage('summary'));
          return;
        }
        // Otherwise attempt a reload to fix the conflict.
        retryLoadPage();
        return;
      }
      throw error;
    }
    await dispatch(restoreTravelRegistration(regCart));
  };
}

/**
 * Function to perform actions and update the regCart based on regCart values received from the getRegCart call
 */
function performRegCartRestoreActions(regCart, isRetryAttempt) {
  return async (dispatch, getState) => {
    let modificationStartRegCart = {};
    const regCartUpdate = regCart;
    // if isRegMod set the modification start regCart
    if (regCart.regMod) {
      const confirmationInfo = getConfirmationInfo(getState(), regCart);
      modificationStartRegCart = await dispatch(restoreModCart(confirmationInfo, regCart));
    }

    // Do not restore paymentInfo. Do not clear during failed: needed for 3d secure
    if (!(regCart?.paymentInfo?.thirdPartyRedirectUrl && regCart?.paymentInfo?.paymentStatus === 'PaymentFailed')) {
      regCartUpdate.paymentInfo = null;
    }
    // save reg cart to the store before loading language
    dispatch({ type: RESTORE_REG_CART_SUCCESS, payload: { regCart, modificationStartRegCart } });
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (regCart && regCart.localeId) {
      dispatch(loadLanguageFromLocale(regCart.localeId));
    }

    // Strip off the retry attempt querystring value if the reg cart get is successful on a retry.
    if (isRetryAttempt) {
      stripRetryAttempt();
    }
    return regCartUpdate;
  };
}

/**
 * Retrieves transient cart from service if app refreshed while in regMod to put it back into
 * the modificationStartRegCart object to help with regMod scenario.
 */
function restoreModCart(confirmationInfo, restoredRegCart) {
  return async (dispatch, getState) => {
    const {
      clients: { eventGuestClient, regCartClient },
      accessToken,
      defaultUserSession: { eventId },
      event: {
        eventSecuritySetupSnapshot: { postRegistrationAuthType }
      }
    } = getState();
    let {
      registrantLogin: {
        form: { emailAddress, confirmationNumber }
      }
    } = getState();
    try {
      LOG.debug('restore modification start regCart');
      if (confirmationInfo) {
        emailAddress = confirmationInfo.emailAddress;
        confirmationNumber = confirmationInfo.confirmationNumber;
      }
      const contactIdFromCart = getPrimaryContactIdFromRegCart(restoredRegCart);
      let response;
      if (postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE && contactIdFromCart) {
        response = await eventGuestClient.identifyByContactId(accessToken, eventId, contactIdFromCart);
      } else {
        const isPlanner = isPlannerRegistration(getState());
        response = await regCartClient.identifyByConfirm(
          isPlanner ? accessToken : null,
          eventId,
          emailAddress,
          confirmationNumber
        );
      }

      // map registration ids to the ones in the current cart
      const modificationStartRegCart = response.regCart || {};
      const eventRegistrations = {};
      const modificationStartEventRegs =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        (modificationStartRegCart && modificationStartRegCart.eventRegistrations) || {};

      Object.values(modificationStartEventRegs).forEach((eventReg: $TSFixMe) => {
        const matchingRegInRestoredCart: $TSFixMe = Object.values(restoredRegCart.eventRegistrations).find(
          reg => eventReg.attendee.attendeeId === (reg as $TSFixMe).attendee.attendeeId
        );
        if (matchingRegInRestoredCart) {
          eventRegistrations[matchingRegInRestoredCart.eventRegistrationId] = {
            ...eventReg,
            eventRegistrationId: matchingRegInRestoredCart.eventRegistrationId,
            primaryRegistrationId: matchingRegInRestoredCart.primaryRegistrationId
          };
        }
      });

      const attendee = getPrimaryAttendee(modificationStartRegCart);
      if (attendee) {
        await Promise.all([
          dispatch(updateInviteeStatusAndContactIdInStore(attendee)),
          dispatch(loadRegistrationContentForRegApproval(InviteeStatusById[attendee.inviteeStatus]))
        ]);
      }
      modificationStartRegCart.eventRegistrations = eventRegistrations;
      return modificationStartRegCart;
    } catch (error) {
      LOG.info('Failed to restore modification start regCart', error);
      throw error;
    }
  };
}

export function searchPartialRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    let response;
    const {
      accessToken,
      clients: { regCartClient },
      registrationForm: { regCart },
      userSession: { isAbandonedReg },
      defaultUserSession: { isPreview }
    } = getState();
    try {
      response = await regCartClient.searchPartialRegCart(accessToken, regCart, isPreview, isAbandonedReg);
    } catch (error) {
      /*
       * If we get other than 404 or invalid email error ,
       * means there is unknown system error, hence need to throw the error.
       */
      if (!getRestoreErrors.partialRegCartNotFound(error) && !getRestoreErrors.invalidEmailInPartial(error)) {
        throw error;
      }
      LOG.info('Failed to search partial regCart', error);
    }
    dispatch({ type: RESTORE_REG_CART_PARTIAL });
    return response;
  };
}

export function resumePartialRegistration(regCartId?: $TSFixMe, partialRegCartId?: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    let response;
    const {
      accessToken,
      clients: { regCartClient }
    } = getState();
    try {
      response = await regCartClient.resumePartialRegCart(accessToken, regCartId, partialRegCartId);
    } catch (error) {
      LOG.info('Failed to resume partial regCart', error);
      throw error;
    }
    return response;
  };
}

/**
 * Restores a registration from another tab
 */
export function restoreRegistrationFromOtherTab(
  regCart: $TSFixMe,
  regCartPayment: $TSFixMe,
  regCartPricing: $TSFixMe,
  modificationStartRegCart: $TSFixMe
): $TSFixMe {
  return {
    type: RESTORE_REG_CART_SUCCESS,
    payload: { regCart, regCartPayment, regCartPricing, modificationStartRegCart }
  };
}
