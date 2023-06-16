import { CALENDAR_EVENT_ID } from '../../utils/addToCalendarUtils';

export const LOAD_ADD_TO_CALENDAR_PROVIDERS = 'event-guestside-site/calendar/LOAD_CALENDAR_PROVIDERS';
export const LOAD_EVENT_CALENDAR = 'event-guestside-site/calendar/LOAD_EVENT_CALENDAR';
export const LOAD_SESSION_CALENDAR = 'event-guestside-site/calendar/LOAD_SESSION_CALENDAR';

export function setAddToCalendarProviders(calendarProviders: $TSFixMe): $TSFixMe {
  return {
    type: LOAD_ADD_TO_CALENDAR_PROVIDERS,
    payload: { calendarProviders }
  };
}

export function setCalendarUrl(calendarType: $TSFixMe, calendarUrl: $TSFixMe, entityId = CALENDAR_EVENT_ID): $TSFixMe {
  if (entityId === CALENDAR_EVENT_ID) {
    return {
      type: LOAD_EVENT_CALENDAR,
      payload: { calendarType, calendarUrl }
    };
  }

  return {
    type: LOAD_SESSION_CALENDAR,
    payload: { calendarType, calendarUrl, entityId }
  };
}

export default function addToCalendarReducer(state = {}, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case LOAD_ADD_TO_CALENDAR_PROVIDERS: {
      return {
        ...state,
        ...action.payload.calendarProviders
      };
    }
    case LOAD_EVENT_CALENDAR: {
      return {
        ...state,
        [action.payload.calendarType]: {
          ...state[action.payload.calendarType],
          [CALENDAR_EVENT_ID]: action.payload.calendarUrl
        }
      };
    }
    case LOAD_SESSION_CALENDAR: {
      return {
        ...state,
        [action.payload.calendarType]: {
          ...state[action.payload.calendarType],
          [action.payload.entityId]: action.payload.calendarUrl
        }
      };
    }
    default: {
      return state;
    }
  }
}
