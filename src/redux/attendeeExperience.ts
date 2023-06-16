import { LOAD_EVENT_WEB_APP_SETTINGS } from './actionTypes';

const initialState = {};

export function setEventWebAppStatus(eventWebAppStatus: $TSFixMe): $TSFixMe {
  return { type: LOAD_EVENT_WEB_APP_SETTINGS, payload: { eventWebAppStatus } };
}

export function loadEventWebAppStatus() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const {
        clients: { eventGuestClient },
        accessToken
      } = getState();
      const eventWebAppStatus = await eventGuestClient.getEventWebAppStatus(accessToken);
      dispatch(setEventWebAppStatus(eventWebAppStatus));
    } catch (e) {
      dispatch(setEventWebAppStatus(false));
    }
  };
}

export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case LOAD_EVENT_WEB_APP_SETTINGS:
      return {
        ...action.payload.eventWebAppStatus,
        ...state
      };
    default:
      return state;
  }
}
