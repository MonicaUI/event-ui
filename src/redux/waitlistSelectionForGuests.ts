import { LOG_OUT_REGISTRANT_SUCCESS } from './registrantLogin/actionTypes';

export const ADD_SESSION_FOR_WAITLISTING_GUESTS =
  'event-guestside-site/waitlistSelectionForGuests/ADD_SESSION_FOR_WAITLISTING_GUESTS';
export const REMOVE_SESSION_FOR_WAITLISTING_GUESTS =
  'event-guestside-site/waitlistSelectionForGuests/REMOVE_SESSION_FOR_WAITLISTING_GUESTS';

export function addSessionForWaitlistingGuests(sessionId: $TSFixMe): $TSFixMe {
  return {
    type: ADD_SESSION_FOR_WAITLISTING_GUESTS,
    payload: sessionId
  };
}

export function removeSessionForWaitlistingGuests(sessionId: $TSFixMe): $TSFixMe {
  return {
    type: REMOVE_SESSION_FOR_WAITLISTING_GUESTS,
    payload: sessionId
  };
}

export default function reducer(state = {}, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case ADD_SESSION_FOR_WAITLISTING_GUESTS:
      return {
        ...state,
        [action.payload]: true
      };

    case REMOVE_SESSION_FOR_WAITLISTING_GUESTS:
      return {
        ...state,
        [action.payload]: false
      };

    case LOG_OUT_REGISTRANT_SUCCESS:
      return {};

    default:
      return state;
  }
}
