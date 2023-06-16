import * as actions from './actionTypes';
import {
  START_MODIFICATION_SUCCESS,
  INITIATE_CANCEL_REGISTRATION_SUCCESS
} from '../registrationForm/regCart/actionTypes';

const initialState = {
  emailAddress: '',
  confirmationNumber: ''
};

export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case actions.LOG_IN_REGISTRANT_SUCCESS:
    case START_MODIFICATION_SUCCESS:
    case INITIATE_CANCEL_REGISTRATION_SUCCESS:
      return { ...state, ...action.payload.currentLogin };
    case actions.LOG_OUT_REGISTRANT_SUCCESS:
      return { ...initialState };
    default:
      return state;
  }
}
