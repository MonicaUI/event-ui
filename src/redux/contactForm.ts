export const SET_FIELD = 'event-guestside-site/contactForm/SET_FIELD';
export const RESET_CONTACT_FORM = 'event-guestside-site/contactForm/RESET_CONTACT_FORM';
export const AUTO_FOCUS_ON = 'event-guestside-site/contactForm/AUTO_FOCUS_ON';

export const setContactPlannerField = (fieldName: $TSFixMe, value: $TSFixMe): $TSFixMe => {
  return { type: SET_FIELD, payload: { fieldName, value } };
};

export function resetContactForm(): $TSFixMe {
  return { type: RESET_CONTACT_FORM };
}

export function turnOnAutoFocus(): $TSFixMe {
  return { type: AUTO_FOCUS_ON };
}

const initialState = {
  senderEmailAddress: '',
  message: '',
  autoFocus: false
};

export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case SET_FIELD:
      return { ...state, [action.payload.fieldName]: action.payload.value };
    case RESET_CONTACT_FORM:
      return { ...initialState };
    case AUTO_FOCUS_ON:
      return { ...state, autoFocus: true };
    default:
      return state;
  }
}
