import { SWITCH_CCPA_DIALOG_MODE } from '../actionTypes';
import { DIALOG_MODE } from 'event-widgets/utils/ccpaUtils';

/**
 * instead of opening new dialog every time, we switch the content in the ccpa dialog based on user input
 * @param dialogMode
 * @returns {{payload: {dialogMode: *}, type: *}}
 */
export const switchCcpaDialogMode = (dialogMode: $TSFixMe): $TSFixMe => {
  return {
    type: SWITCH_CCPA_DIALOG_MODE,
    payload: { dialogMode }
  };
};

/**
 * Make ccpa compliance request and update the dialog mode as per the response
 */
export const makeCcpaComplianceRequest = (ccpaComplianceRequests: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { ccpaComplianceClient }
    } = getState();
    const { isSuccessful } = await ccpaComplianceClient.makeCcpaComplianceRequest(ccpaComplianceRequests);
    dispatch(switchCcpaDialogMode(isSuccessful ? DIALOG_MODE.SUCCESS_OPT_OUT : DIALOG_MODE.FAILURE_OPT_OUT));
  };
};
