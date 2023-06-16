// Reducer to update state for cookie Consent
import { DENY } from '../../utils/CookieConstants';

export const SET_COOKIE_CONSENT = 'event-guestside-site/cookieConsent/SET_COOKIE_CONSENT';

export default function cookieConsentReducer(state = { status: DENY }, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case SET_COOKIE_CONSENT:
      return {
        ...state,
        status: action.payload.cookieStatus
      };
    default:
      return state;
  }
}
