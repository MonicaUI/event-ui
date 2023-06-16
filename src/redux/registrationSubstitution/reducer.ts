export const SUBSTITUTE_REGISTRANT_SUCCESS = 'event-guestside-site/substituteRegistrant/SUBSTITUTE_REGISTRANT_SUCCESS';
export const SUBSTITUTE_REGISTRANT_ERROR = 'event-guestside-site/substituteRegistrant/SUBSTITUTE_REGISTRANT_ERROR';
export const RESET_SUBSTITUTE_REGISTRANT = 'event-guestside-site/substituteRegistrant/RESET_SUBSTITUTE_REGISTRANT';
export const SET_FIELD = 'event-guestside-site/substituteRegistrant/SET_FIELD';
export const SET_VALIDATION = 'event-guestside-site/substituteRegistrant/SET_VALIDATION';
export const AUTO_FOCUS_ON = 'event-guestside-site/substituteRegistrant/AUTO_FOCUS_ON';
export const REQUEST_CONFIRMATION = 'event-guestside-site/substituteRegistrant/REQUEST_CONFIRMATION';
export const DENIED_CONFIRMATION = 'event-guestside-site/substituteRegistrant/DENIED_CONFIRMATION';
export const ACCEPTED_CONFIRMATION = 'event-guestside-site/substituteRegistrant/ACCEPTED_CONFIRMATION';
export const SET_SUBSTITUTION_CART = 'event-guestside-site/substituteRegistrant/SET_SUBSTITUTION_CART';
export const SHOW_CONCURRENT_ACTION_POPUP = 'event-guestside-site/substituteRegistrant/SHOW_CONCURRENT_ACTION_POPUP';
export const SHOW_CART_ABORTED_MESSAGE = 'event-guestside-site/substituteRegistrant/SHOW_CART_ABORTED_MESSAGE';
export const SHOW_SUBSTITUTION_FORM = 'event-guestside-site/substituteRegistrant/SHOW_SUBSTITUTION_FORM';
export const DISABLE_SUBMIT_BUTTON = 'event-guestside-site/substituteRegistrant/DISABLE_SUBMIT_BUTTON';

export function showConcurrentActionPopupMessage(substitutionCart: $TSFixMe): $TSFixMe {
  return { type: SHOW_CONCURRENT_ACTION_POPUP, payload: { substitutionCart } };
}

export function hideConcurrentActionPopupMessage(): $TSFixMe {
  return { type: SHOW_SUBSTITUTION_FORM };
}

export function showCartAbortedMessage(): $TSFixMe {
  return { type: SHOW_CART_ABORTED_MESSAGE };
}

export function substituteRegistrationSuccess(): $TSFixMe {
  return { type: SUBSTITUTE_REGISTRANT_SUCCESS };
}

export function substituteRegistrationError(): $TSFixMe {
  return { type: SUBSTITUTE_REGISTRANT_ERROR };
}

export function resetSubstituteRegistration(): $TSFixMe {
  return { type: RESET_SUBSTITUTE_REGISTRANT };
}

export function setShowConfirmationMessage(substitutionCart: $TSFixMe): $TSFixMe {
  return { type: REQUEST_CONFIRMATION, payload: { substitutionCart } };
}

export function setConfirmationDenied(): $TSFixMe {
  return { type: DENIED_CONFIRMATION };
}

export function setConfirmationAccepted(): $TSFixMe {
  return { type: ACCEPTED_CONFIRMATION };
}

export const setSubstituteRegistrantFields = (fieldName: $TSFixMe, fieldValue: $TSFixMe): $TSFixMe => {
  return { type: SET_FIELD, payload: { fieldName, fieldValue: fieldValue.trim() } };
};

export function turnOnAutoFocus(): $TSFixMe {
  return { type: AUTO_FOCUS_ON };
}

export function disableSubmitButton(): $TSFixMe {
  return { type: DISABLE_SUBMIT_BUTTON };
}

export function setValidationMessage(validation: $TSFixMe, shouldSubmitButtonShouldBeDisabled?: $TSFixMe): $TSFixMe {
  return { type: SET_VALIDATION, payload: { validation, shouldSubmitButtonShouldBeDisabled } };
}

export function setSubstitutionCart(substitutionCart: $TSFixMe): $TSFixMe {
  return {
    type: SET_SUBSTITUTION_CART,
    payload: { substitutionCart }
  };
}

const shouldSubmitButtonBeEnabled = (state, dupMatchKeyType, action) => {
  if (state.disableSubmitButton) {
    if (dupMatchKeyType === 'EMAIL_ONLY') {
      return (
        action.payload.fieldName === 'emailAddress' && state.substitutionForm.emailAddress !== action.payload.fieldValue
      );
    }
    return state.substitutionForm?.[action.payload.fieldName] !== action.payload.fieldValue;
  }
  return true;
};

export const initialState = {
  substituteRegistrationSuccess: false,
  substituteRegistrationError: false,
  showConfirmationMessage: false,
  hasConfirmed: false,
  autoFocus: false,
  showConcurrentActionMessage: false,
  cartAborted: false,
  substitutionForm: {
    firstName: '',
    lastName: '',
    emailAddress: ''
  },
  validationList: null,
  substitutionCart: null,
  originalSubstitutionCart: null,
  disableSubmitButton: false
};

export default function reducer(state = initialState, action = {}, dupMatchKeyType = 'EMAIL_ONLY'): $TSFixMe {
  switch ((action as $TSFixMe).type) {
    case SUBSTITUTE_REGISTRANT_SUCCESS:
      return {
        ...state,
        originalSubstitutionCart: null,
        substituteRegistrationSuccess: true,
        substituteRegistrationError: false,
        substitutionCart: {
          ...state.substitutionCart,
          status: 'COMPLETED'
        }
      };

    case SUBSTITUTE_REGISTRANT_ERROR:
      return {
        ...state,
        substituteRegistrationError: true,
        substituteRegistrationSuccess: false,
        showConcurrentActionMessage: false,
        cartAborted: false,
        substitutionCart: {
          ...state.substitutionCart,
          status: 'FAILED'
        }
      };

    case RESET_SUBSTITUTE_REGISTRANT:
      return initialState;

    case SET_FIELD:
      return {
        ...state,
        disableSubmitButton: !shouldSubmitButtonBeEnabled(state, dupMatchKeyType, action),
        substitutionForm: {
          ...state.substitutionForm,
          [(action as $TSFixMe).payload.fieldName]: (action as $TSFixMe).payload.fieldValue
        },
        validationList: null
      };

    case AUTO_FOCUS_ON:
      return {
        ...state,
        autoFocus: true
      };

    case REQUEST_CONFIRMATION:
      return {
        ...state,
        showConfirmationMessage: true,
        validationList: null,
        substitutionCart: (action as $TSFixMe).payload.substitutionCart
      };

    case DENIED_CONFIRMATION:
      return {
        ...state,
        showConfirmationMessage: false
      };

    case ACCEPTED_CONFIRMATION:
      return {
        ...state,
        showConfirmationMessage: false,
        hasConfirmed: true
      };

    case SET_VALIDATION:
      return {
        ...state,
        validationList: (action as $TSFixMe).payload.validation,
        disableSubmitButton: (action as $TSFixMe).payload.shouldSubmitButtonShouldBeDisabled
      };

    case SET_SUBSTITUTION_CART:
      return {
        ...state,
        substitutionCart: (action as $TSFixMe).payload.substitutionCart,
        substitutionForm: {
          firstName: (action as $TSFixMe).payload.substitutionCart.substituentInformation.firstName,
          lastName: (action as $TSFixMe).payload.substitutionCart.substituentInformation.lastName,
          emailAddress: (action as $TSFixMe).payload.substitutionCart.substituentInformation.emailAddress
        }
      };

    case SHOW_CONCURRENT_ACTION_POPUP: {
      return {
        ...state,
        showConcurrentActionMessage: true,
        originalSubstitutionCart: (action as $TSFixMe).payload.substitutionCart
      };
    }

    case SHOW_CART_ABORTED_MESSAGE: {
      return {
        ...state,
        cartAborted: true
      };
    }

    case SHOW_SUBSTITUTION_FORM: {
      return {
        ...state,
        showConcurrentActionMessage: false,
        originalSubstitutionCart: null
      };
    }

    case DISABLE_SUBMIT_BUTTON: {
      return {
        ...state,
        disableSubmitButton: true
      };
    }

    default:
      return state;
  }
}
