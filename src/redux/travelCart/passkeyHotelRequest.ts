import { getRegCart } from '../selectors/shared';
import {
  getRegistrationTypeId as getCurrentRegistrantRegistrationTypeId,
  getAttendeeId as getCurrentRegistrantAttendeeId
} from '../selectors/currentRegistrant';
import { getRegistrationPathIdOrDefault } from '../selectors/currentRegistrationPath';
import { getAttendeeId } from '../registrationForm/regCart/selectors';

/**
 * handler for passkey select hotel button
 * @param eventRegistrationId
 * @returns {Function}
 */
export function selectPasskeyHotel(eventRegistrationId?: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { passkeyClient }
    } = state;
    const regCart = getRegCart(state);
    const redirectedInviteeId = getAttendeeId(regCart, eventRegistrationId);
    const currentRegTypeId = getCurrentRegistrantRegistrationTypeId(state);
    const currentRegPathId = getRegistrationPathIdOrDefault(state);
    const currentInviteeId = getCurrentRegistrantAttendeeId(state);
    const currentUrl = window.location.href;
    const response = passkeyClient.getNewRequestRedirectUrl(
      redirectedInviteeId,
      currentInviteeId,
      currentRegPathId,
      currentRegTypeId,
      currentUrl
    );
    window.location = response;
    return response;
  };
}

/**
 * handler for passkey edit request
 * @param eventRegistrationId
 * @param hotelReservationId Specific reservation for which we have to redirect to modification
 * @returns {function(*, *): (string)}
 */
export function modifyPasskeyRequest(hotelReservationId?: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { passkeyClient }
    } = state;
    const currentRegTypeId = getCurrentRegistrantRegistrationTypeId(state);
    const currentRegPathId = getRegistrationPathIdOrDefault(state);
    const currentInviteeId = getCurrentRegistrantAttendeeId(state);
    // eslint-disable-next-line max-len
    const response = passkeyClient.getEditRequestRedirectUrl(
      currentInviteeId,
      currentRegPathId,
      currentRegTypeId,
      hotelReservationId
    );
    window.open(response, '_blank');
    return response;
  };
}
