import { LOG_OUT_REGISTRANT_SUCCESS } from './registrantLogin/actionTypes';
import { SET_CURRENT_PAGE } from './pathInfo';

export const UPDATE_SESSION_FILTERS = 'event-guestside-site/sessionFilters/UPDATE_SESSION_FILTERS';

export function updateSessionFilters(selectedSessionFilters: $TSFixMe): $TSFixMe {
  return {
    type: UPDATE_SESSION_FILTERS,
    payload: {
      selectedSessionFilters
    }
  };
}

const defaultSessionFilter = {
  keywordFilterValue: '',
  selectedFilterChoices: {}
};

export default function reducer(state = defaultSessionFilter, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case LOG_OUT_REGISTRANT_SUCCESS:
    case SET_CURRENT_PAGE:
      return defaultSessionFilter;
    case UPDATE_SESSION_FILTERS:
      return {
        ...state,
        ...action.payload.selectedSessionFilters
      };
    default:
      return state;
  }
}
