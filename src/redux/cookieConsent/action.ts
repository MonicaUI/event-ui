import { SET_COOKIE_CONSENT } from './reducer';

export const setCookieConsent = (cookieStatus: $TSFixMe): $TSFixMe => {
  return {
    type: SET_COOKIE_CONSENT,
    payload: {
      cookieStatus
    }
  };
};
