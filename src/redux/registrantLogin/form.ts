import * as actions from './actionTypes';

const initialState = {
  emailAddress: '',
  confirmationNumber: '',
  firstName: '',
  lastName: ''
};

export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case actions.SET_LOGIN_FORM_FIELD:
      return { ...state, [action.payload.fieldName]: action.payload.value };
    case actions.LOG_OUT_REGISTRANT_SUCCESS:
      return { ...initialState };
    default:
      return state;
  }
}
