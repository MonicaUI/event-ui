import { getRegCart } from '../selectors/shared';
import { getAttendeeId } from '../selectors/currentRegistrant';
import qs from 'querystring';

const utmParameters = ['source', 'campaign', 'medium', 'term', 'content', 'custom'];

const hasUtmParameters = queryParams => {
  for (let i = 0; i < utmParameters.length; i++) {
    if (queryParams[`utm_${utmParameters[i]}`]) {
      return true;
    }
  }
  return false;
};

const getUtmParameters = url => {
  if (url && url.indexOf('?') >= 0) {
    const queryParams = qs.parse(url.split('?')[1]);
    if (hasUtmParameters(queryParams)) {
      const utm = {};
      utmParameters.forEach(param => {
        if (queryParams[`utm_${param}`]) {
          utm[param] = queryParams[`utm_${param}`];
        }
      });
      return utm;
    }
  }
};

export function recordAttendeeUtmParameters() {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      event: { id: eventId },
      clients: { eventGuestClient },
      accessToken
    } = getState();

    const attendeeId = getAttendeeId(getState());
    const regCart = getRegCart(getState());

    if (attendeeId && regCart && regCart.httpReferrer) {
      const cartUtmParameters = getUtmParameters(regCart.httpReferrer);
      if (cartUtmParameters) {
        const fact = {
          attendeeId,
          eventId,
          type: 'event_website_tracking_parameters',
          ...cartUtmParameters
        };
        eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
      }
    }
  };
}
