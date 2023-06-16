import { LOG_OUT_REGISTRANT_SUCCESS } from './registrantLogin/actionTypes';

export const ADD_SESSION_FOR_SELECTING_WAITLIST =
  'event-guestside-site/sessionsInWaitlist/ADD_SESSION_FOR_SELECTING_WAITLIST';
export const ADD_MULTIPLE_SESSIONS_FOR_SELECTING_WAITLIST =
  'event-guestside-site/sessionsInWaitlist/ADD_MULTIPLE_SESSIONS_FOR_SELECTING_WAITLIST';
export const REMOVE_SESSION_FOR_SELECTING_WAITLIST =
  'event-guestside-site/sessionsInWaitlist/REMOVE_SESSION_FOR_SELECTING_WAITLIST';

export function addSessionForSelectingWaitlist(sessionId: $TSFixMe): $TSFixMe {
  return {
    type: ADD_SESSION_FOR_SELECTING_WAITLIST,
    payload: sessionId
  };
}

export function addMultipleSessionsForSelectingWaitlist(sessions: $TSFixMe): $TSFixMe {
  return {
    type: ADD_MULTIPLE_SESSIONS_FOR_SELECTING_WAITLIST,
    payload: sessions
  };
}

export function removeSessionForSelectingWaitlist(sessionId: $TSFixMe): $TSFixMe {
  return {
    type: REMOVE_SESSION_FOR_SELECTING_WAITLIST,
    payload: sessionId
  };
}

export default function reducer(state = {}, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case ADD_SESSION_FOR_SELECTING_WAITLIST:
      return {
        ...state,
        [action.payload]: true
      };

    case ADD_MULTIPLE_SESSIONS_FOR_SELECTING_WAITLIST:
      return {
        ...state,
        ...action.payload
      };

    case REMOVE_SESSION_FOR_SELECTING_WAITLIST:
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
