import { LOAD_ACCOUNT_SNAPSHOT, LOAD_EVENT_SNAPSHOT, RESTORE_ALL_REG_TYPES_FOR_EVENT } from './actionTypes';

export const EVENT_ACTION_PAYLOAD_KEY = 'event';

/**
 * Reducer which loads information from the event snapshot.
 * @param loadActionPayloadKey - The key locating the data in the load action
 *    payload that represents the reducers state.
 */
export const eventSnapshotReducer = (state: $TSFixMe, action: $TSFixMe, loadActionPayloadKey: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case LOAD_EVENT_SNAPSHOT:
      return action.payload[loadActionPayloadKey];
    case RESTORE_ALL_REG_TYPES_FOR_EVENT:
      /**
       * The reducer gets called with different pay load keys. We want it to be executed only in case when event
       * data is being passed as initial state.
       */
      if (loadActionPayloadKey === EVENT_ACTION_PAYLOAD_KEY) {
        const { registrationTypes } = action.payload;
        return {
          ...state,
          registrationTypes: {
            ...state.registrationTypes,
            ...registrationTypes
          }
        };
      }
      return state;
    default:
      return state;
  }
};

/**
 * Reducer which loads information from the account snapshot.
 * @param loadActionPayloadKey - The key locating the data in the load action
 *    payload that represents the reducers state.
 */
export const accountSnapshotReducer = (state: $TSFixMe, action: $TSFixMe, loadActionPayloadKey: $TSFixMe): $TSFixMe => {
  return action.type === LOAD_ACCOUNT_SNAPSHOT ? action.payload[loadActionPayloadKey] : state;
};
