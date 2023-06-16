import * as actions from './actionTypes';

export const NO_ACTION = 'noAction';
export const PENDING = 'pending';
export const SUCCESS = 'success';
export const FAILURE = 'failure';
export const statuses = { NO_ACTION, PENDING, SUCCESS, FAILURE };

const initialState = {
  login: { type: NO_ACTION },
  logout: { type: NO_ACTION },
  resendConfirmation: { type: NO_ACTION }
};

export default (state = initialState, action: $TSFixMe): $TSFixMe => {
  const { payload = {} } = action;
  const { error, errorMessage } = payload;
  switch (action.type) {
    case actions.LOG_IN_REGISTRANT_SUCCESS:
      return { ...state, login: { type: SUCCESS } };
    case actions.LOG_IN_REGISTRANT_FAILURE:
      return { ...state, login: { type: FAILURE, error, errorMessage } };
    case actions.LOG_OUT_REGISTRANT_PENDING:
      return { ...state, logout: { type: PENDING } };
    case actions.LOG_OUT_REGISTRANT_SUCCESS:
      return { ...state, logout: { type: SUCCESS } };
    case actions.LOG_OUT_REGISTRANT_FAILURE:
      return { ...state, logout: { type: FAILURE, error, errorMessage } };
    case actions.RESEND_CONFIRMATION_PENDING:
      return { ...state, resendConfirmation: { type: PENDING } };
    case actions.RESEND_CONFIRMATION_SUCCESS:
      return { ...state, resendConfirmation: { type: SUCCESS } };
    case actions.RESEND_CONFIRMATION_FAILURE:
      return { ...state, resendConfirmation: { type: FAILURE } };
    case actions.RESET_STATUS:
      return initialState;
    default:
      return state;
  }
};
