import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('redux/modules/registrantLogin/actions');
import { unescape, isEmpty } from 'lodash';
import { restoreTransientTravelCartIntoState, restoreTravelCartIntoState } from '../travelCart/external';
import { filterEventSnapshot } from '../actions';
import { addMultipleSessionsForSelectingWaitlist } from '../sessionsInWaitlist';
import {
  SET_LOGIN_FORM_FIELD,
  RESEND_CONFIRMATION_PENDING,
  RESEND_CONFIRMATION_SUCCESS,
  LOG_IN_REGISTRANT_SUCCESS,
  LOG_IN_REGISTRANT_FAILURE,
  LOG_OUT_REGISTRANT_PENDING,
  LOG_OUT_REGISTRANT_SUCCESS,
  LOG_OUT_REGISTRANT_FAILURE,
  RESET_STATUS,
  CLEAR_URL_IDENTIFYING_INFORMATION,
  RESEND_CONFIRMATION_FAILURE
} from './actionTypes';
import { CLEAR_ORDERS } from '../actionTypes';
import { loadLanguageFromLocale } from '../multiLanguage/actions';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { getAttendeeId, getContactId } from '../selectors/currentRegistrant';
import { updateSelectedTimeZoneForPrimaryAttendee } from '../timezones';
import { getPrimaryAttendee, getPrimaryRegistrationId } from '../registrationForm/regCart/selectors';
import { updateInviteeStatusAndContactIdInStore, loadRegistrationContentForRegApproval } from '../persona';
import { InviteeStatusById, Accepted, PendingApproval } from 'event-widgets/utils/InviteeStatus';
import { SELECTED_TIMEZONE } from '../timeZoneSelection';
import { openPartialRegistrationConfirmationDialog } from '../../dialogs/PartialRegistrationConfirmationDialog';
import { getCurrentPageId, getPagePath, routeToUrl } from '../pathInfo';
import qs from 'querystring';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { EmailThrottleError } from '../../clients/EventEmailClient';
import { isPlannerRegistration } from '../defaultUserSession';
import getLoginInfo from '../../utils/loginInfoUtil';
import { AppDispatch, GetState } from '../reducer';
import { EventContext } from '../types';

export const setLoginFormField = (fieldName: $TSFixMe, value: $TSFixMe): $TSFixMe => {
  return { type: SET_LOGIN_FORM_FIELD, payload: { fieldName, value } };
};

/**
 * Attempts to log in a registrant. If the login attempt fails a user friendly
 * message along with the technical error will be stored within the application.
 */
export function loginRegistrant(confirmationInfo?: $TSFixMe, regCartHadElasticsearchDelay?: $TSFixMe) {
  // eslint-disable-next-line complexity
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventGuestClient, regCartClient, attendeeLoginClient },
      accessToken,
      userSession: { contactId, inviteeId, inviteeStatus },
      defaultUserSession: { eventId },
      text: { translate },
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
      const contactIdFromCart = getContactId(getState());
      const isPlanner = isPlannerRegistration(getState());
      let primaryEmailAddress;
      let primaryConfirmationNumber;
      if (confirmationInfo) {
        emailAddress = confirmationInfo.emailAddress;
        confirmationNumber = confirmationInfo.confirmationNumber;
        primaryEmailAddress = confirmationInfo.primaryEmailAddress;
        primaryConfirmationNumber = confirmationInfo.primaryConfirmationNumber;
      }
      LOG.debug(
        'loginRegistrant',
        eventId,
        emailAddress,
        confirmationNumber,
        primaryEmailAddress,
        primaryConfirmationNumber
      );
      let response;
      if (
        postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE &&
        (contactId || contactIdFromCart)
      ) {
        response = await eventGuestClient.identifyByContactId(accessToken, eventId, contactId || contactIdFromCart);
      } else if (inviteeStatus === Accepted || inviteeStatus === PendingApproval) {
        response = await regCartClient.identifyByConfirm(
          isPlanner ? accessToken : null,
          eventId,
          emailAddress,
          confirmationNumber,
          inviteeId
        );
      } else {
        response = await regCartClient.identifyByConfirm(
          isPlanner ? accessToken : null,
          eventId,
          emailAddress,
          confirmationNumber
        );
      }
      LOG.debug('loginRegistrant success', response);
      const regCart = response.regCart;
      dispatch({
        type: LOG_IN_REGISTRANT_SUCCESS,
        payload: { regCart: { ...regCart, regRetrieval: true }, currentLogin: { emailAddress, confirmationNumber } }
      });
      const primaryEventRegistrationId = getPrimaryRegistrationId(regCart);
      dispatch(updateSelectedTimeZoneForPrimaryAttendee(regCart, primaryEventRegistrationId));
      dispatch(recordLoginSuccessActivity());
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (regCart && regCart.eventRegistrations) {
        const { registrationPathId, registrationTypeId } = regCart.eventRegistrations[primaryEventRegistrationId];
        await dispatch(filterEventSnapshot(getState().eventSnapshotVersion, registrationTypeId, registrationPathId));

        // Creating a list of sessions which are waitlisted
        const waitlistedSessions = {};
        Object.keys(regCart.eventRegistrations).forEach(id => {
          Object.keys(regCart.eventRegistrations[id].sessionWaitlists).forEach(sessionId => {
            waitlistedSessions[sessionId] = true;
          });
        });
        dispatch(addMultipleSessionsForSelectingWaitlist(waitlistedSessions));
        const attendee = getPrimaryAttendee(regCart);
        if (attendee) {
          await Promise.all([
            dispatch(updateInviteeStatusAndContactIdInStore(attendee)),
            dispatch(loadRegistrationContentForRegApproval(InviteeStatusById[attendee.inviteeStatus]))
          ]);
        }
      }

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (regCart && regCart.regCartId && regCart.hasTravel) {
        await dispatch(restoreTravelCartIntoState(regCart.regCartId));
      } else {
        await dispatch(restoreTransientTravelCartIntoState());
      }

      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (regCart && regCart.localeId) {
        dispatch(loadLanguageFromLocale(regCart.localeId));
      }
    } catch (error) {
      LOG.info('loginRegistrant failed', error);
      const { responseStatus, responseBody = {}, httpLogRequestId } = error;
      const firstValidationMessage = (responseBody.validationMessages || [])[0] || {};
      let errorMessage;
      if (!responseStatus) {
        LOG.error('loginRegistrant network error', error);
        errorMessage = translate('EventWidgets_GenericErrors_NetworkError__resx');
      } else if (firstValidationMessage.localizationKey === 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND') {
        errorMessage = translate('EventWidgets_AlreadyRegistered_ConfirmationNumberDoesNotExist__resx');
      } else if (firstValidationMessage.localizationKey === 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_EMAIL_MISMATCH') {
        errorMessage = translate('EventWidgets_AlreadyRegistered_EmailConfirmationNumberMismatch__resx');
      } else if (
        firstValidationMessage.localizationKey === 'REGAPI.REGAPI_LOOKUP_REGCART_BY_CONFIRM_INVALID_AUTH_METHOD'
      ) {
        return attendeeLoginClient.authorize();
      } else {
        LOG.error('loginRegistrant unexpected error', error);
        errorMessage = translate('EventWidgets_GenericErrors_UnexpectedError__resx', { instanceId: httpLogRequestId });
      }
      dispatch({ type: LOG_IN_REGISTRANT_FAILURE, payload: { error, errorMessage } });
      // show timeout modal if identifyByConfirm fails due to not-fatal reg cart delays (ex. Elasticsearch)
      if (
        error.responseStatus === 422 &&
        regCartHadElasticsearchDelay &&
        firstValidationMessage.localizationKey === 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND'
      ) {
        return dispatch(openPartialRegistrationConfirmationDialog());
      }
      throw error;
    }
  };
}
/**
 * Clears the registrant's session service side and dispatches an action
 * to indicate all registrant data should be removed.
 */
export const logoutRegistrant = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventGuestClient },
      accessToken,
      event: { id: eventId, timezone: eventTimezone },
      defaultUserSession: { isPreview },
      userSession: { regTypeId, persistRegType },
      experiments: { flexPersistRegType = false },
      timezones
    } = getState();
    let isInviteeRedirectedToOktaLogoutUrl = false;
    dispatch({ type: CLEAR_ORDERS });
    if (timezones && !isEmpty(timezones) && eventTimezone) {
      // Once registrant logs out, set default(event) timezone as selected timezone in redux state
      dispatch({ type: SELECTED_TIMEZONE, payload: timezones[eventTimezone] });
    }
    dispatch({ type: LOG_OUT_REGISTRANT_PENDING });
    try {
      const logoutResponse = await eventGuestClient.logout(accessToken, eventId, isPreview ? 'preview' : 'standard');
      if (flexPersistRegType) {
        dispatch({
          type: LOG_OUT_REGISTRANT_SUCCESS,
          payload: {
            regTypeId: persistRegType ? regTypeId : '',
            persistRegType
          }
        });
      } else {
        dispatch({ type: LOG_OUT_REGISTRANT_SUCCESS });
      }
      /* This should be last step in the logout process as the
       invitee will redirect to the external IDP after this
       */
      if (logoutResponse?.oktaLogoutUrl) {
        isInviteeRedirectedToOktaLogoutUrl = true;
        window.location.assign(logoutResponse.oktaLogoutUrl);
      }
    } catch (error) {
      dispatch({ type: LOG_OUT_REGISTRANT_FAILURE, payload: { error } });
      throw error;
    }
    return isInviteeRedirectedToOktaLogoutUrl;
  };
};

/**
 * Clears the registrant's session service side and redirect to a different page,
 * note that this does not dispatche action to clear registrant's data from state
 * to avoid a flashing invalid data before the redirect.
 */
export const logoutPlanner = (redirectUrl: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventGuestClient },
      accessToken,
      event: { id: eventId }
    } = getState();
    try {
      await eventGuestClient.logout(accessToken, eventId, 'planner');
      global.location.replace(unescape(redirectUrl));
    } catch (error) {
      dispatch({ type: LOG_OUT_REGISTRANT_FAILURE, payload: { error } });
      throw error;
    }
  };
};

/**
 * Attempts to resend the users confirmation email.
 */
export function resendConfirmationEmail() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventEmailClient },
      event,
      registrantLogin: {
        form: { emailAddress, firstName, lastName }
      }
    } = getState();
    dispatch({ type: RESEND_CONFIRMATION_PENDING });
    try {
      await eventEmailClient.resendConfirmationEmail(event?.id, emailAddress, firstName, lastName);
      dispatch({ type: RESEND_CONFIRMATION_SUCCESS });
    } catch (error) {
      if (error instanceof EmailThrottleError) {
        dispatch({ type: RESEND_CONFIRMATION_FAILURE });
      } else {
        // rethrow an unexpected error
        throw error;
      }
    }
  };
}

export function resetStatus(): $TSFixMe {
  return { type: RESET_STATUS };
}

/**
 * Record attendee login information
 */
export function recordLoginSuccessActivity() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      event: { id: eventId },
      clients: { eventGuestClient },
      accessToken
    } = state;
    const attendeeId = getAttendeeId(state);

    // For now we are only tracking this for confirmed attendees. Next phase, we will track this for invitees
    if (attendeeId) {
      const fact = {
        type: 'event_registration_when_already_registered',
        eventId,
        attendeeId
      };

      await eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
    }
  };
}

const urlStrippedInvitee = state => {
  const url = getPagePath(state, getCurrentPageId(state));
  const path = url.split('?')[0];
  const query = qs.parse(url.split('?')[1]) || {};
  delete query.inviteeId;
  // The i query param is the encoded version of the inviteeId.
  delete query.i;
  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
};

export function clearOutOfSyncUserSessionFieldsAndUrlQuery() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    await dispatch(routeToUrl(urlStrippedInvitee(state)));
    if (state.userSession.inviteeId || state.userSession.regTypeId !== defaultRegistrationTypeId) {
      dispatch({ type: CLEAR_URL_IDENTIFYING_INFORMATION });
    }
  };
}

export function loginRegistrantOnInitialLoad(eventContext: EventContext) {
  return async (dispatch: AppDispatch, getState: GetState): Promise<void> => {
    const state = getState();
    const queryParams = qs.parse(window.location.search.slice(1));
    const loginInfo = eventContext.isPlanner
      ? state.plannerRegSettings.modificationRequest
      : getLoginInfo(queryParams, eventContext);
    const {
      userSession: { contactId },
      event: {
        eventSecuritySetupSnapshot: { postRegistrationAuthType }
      }
    } = state;
    const isSecureVerificationLoginNeeded =
      postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE &&
      contactId &&
      !eventContext.isPlanner;
    if (loginInfo || isSecureVerificationLoginNeeded) {
      await dispatch(loginRegistrant(loginInfo));
    }
    // else user is logged in whenever session is alive, or should manually login through AlreadyRegisteredDialog
  };
}
