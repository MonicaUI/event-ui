import { SWITCH_CCPA_DIALOG_MODE } from '../actionTypes';
import { DIALOG_MODE } from 'event-widgets/utils/ccpaUtils';

export default function reducer(
  state = {
    ccpa: { dialogMode: DIALOG_MODE.UNREGISTERED }
  },
  action: $TSFixMe
): $TSFixMe {
  switch (action.type) {
    case SWITCH_CCPA_DIALOG_MODE:
      return {
        ...state,
        ccpa: {
          ...state.ccpa,
          dialogMode: action.payload.dialogMode
        }
      };
    default:
      return state;
  }
}
