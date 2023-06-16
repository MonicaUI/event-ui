import regCart, { isFullRegCartReplacement } from './regCart/reducer';
import {
  ADD_GROUP_MEMBER_FAILURE,
  ADD_GROUP_MEMBER_SUCCESS,
  CALCULATE_PRICING_FAILURE,
  CLEAR_CURRENT_GUEST_EVENT_REGISTRATION,
  CLEAR_CURRENT_EVENT_REGISTRATION_ID,
  CREATE_REG_CART_FAILURE,
  CREATE_REG_CART_SUCCESS,
  DISCOUNT_CODE_VALIDATION_FAILURE,
  FINALIZE_CHECKOUT_FAILURE,
  INITIATE_WAITLIST_REGISTRATION_FAILURE,
  SET_CURRENT_EVENT_REGISTRATION_ID,
  SET_CURRENT_GUEST_EVENT_REGISTRATION,
  SET_TEMPORARY_GUEST_FIELD_VALUE,
  START_MODIFICATION_FAILURE,
  START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE,
  UPDATE_REG_CART_FAILURE,
  UPDATE_REG_CART_FAILURE_FOR_GUEST,
  UPDATE_REG_CART_SUCCESS,
  UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS,
  UPDATE_REG_CART_QUANTITY_ITEM_FAILURE,
  UPDATE_REG_CART_SESSION_BUNDLE_FAILURE,
  UPDATE_REG_CART_SESSION_SUCCESS,
  UPDATE_REG_CART_SESSION_FAILURE,
  UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE,
  RESET_REG_CART_DISABLE_REG,
  RESTORE_REG_CART_SUCCESS,
  RESET_REG_CART,
  CREATE_PLACEHOLDER_REG_CART_SUCCESS
} from './regCart/actionTypes';
import { LOG_IN_REGISTRANT_SUCCESS, LOG_OUT_REGISTRANT_SUCCESS } from '../registrantLogin/actionTypes';
import { setIn } from 'icepick';
import regCartPayment from './regCartPayment/reducer';

export default function reducer(state = {}, action: $TSFixMe): $TSFixMe {
  const newRegCart = regCart((state as $TSFixMe).regCart, action);
  return {
    currentEventRegistrationId: currentEventRegistrationId((state as $TSFixMe).currentEventRegistrationId, action),
    regCartPayment: regCartPayment((state as $TSFixMe).regCartPayment, action),
    regCart: newRegCart,
    errors: errors((state as $TSFixMe).errors, action),
    currentGuestEventRegistration: currentGuestEventRegistration(
      (state as $TSFixMe).currentGuestEventRegistration,
      action
    ),
    // keep validation messages in sync with reg cart updates
    validationMessages: validationMessages((state as $TSFixMe).validationMessages, action),
    discountCodeStatus: discountCodeStatus((state as $TSFixMe).discountCodeStatus, action),
    preventRegistration: preventRegistration((state as $TSFixMe).preventRegistration, action)
  };
}
export function validationMessages(state = [], action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case UPDATE_REG_CART_FAILURE_FOR_GUEST:
      return action.payload?.error?.responseBody?.validationMessages || [];
    default:
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      return action.payload && action.payload.regCart && isFullRegCartReplacement(action)
        ? action.payload.validationMessages
        : state;
  }
}
function currentEventRegistrationId(state = '', action) {
  switch (action.type) {
    case ADD_GROUP_MEMBER_SUCCESS:
    case CREATE_REG_CART_SUCCESS:
    case CREATE_PLACEHOLDER_REG_CART_SUCCESS:
    case SET_CURRENT_EVENT_REGISTRATION_ID:
      return action.payload.currentEventRegistrationId;
    case CLEAR_CURRENT_EVENT_REGISTRATION_ID:
      return '';
    case LOG_IN_REGISTRANT_SUCCESS:
    case LOG_OUT_REGISTRANT_SUCCESS:
      return '';
    default:
      return state;
  }
}

function currentGuestEventRegistration(state = {}, action) {
  switch (action.type) {
    case SET_CURRENT_GUEST_EVENT_REGISTRATION:
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      return (action.payload && action.payload.currentGuestEventRegistration) || {};
    case SET_TEMPORARY_GUEST_FIELD_VALUE: {
      const { path, value } = action.payload;
      const obj = setIn(state, path, value);
      return obj;
    }
    case CREATE_REG_CART_SUCCESS:
    case CREATE_PLACEHOLDER_REG_CART_SUCCESS:
    case LOG_IN_REGISTRANT_SUCCESS:
    case LOG_OUT_REGISTRANT_SUCCESS:
    case CLEAR_CURRENT_GUEST_EVENT_REGISTRATION:
      return {};
    default:
      return state;
  }
}
/* eslint-disable complexity */
export function errors(state = {}, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case ADD_GROUP_MEMBER_FAILURE:
    case CREATE_REG_CART_FAILURE:
    case UPDATE_REG_CART_FAILURE:
    case UPDATE_REG_CART_FAILURE_FOR_GUEST:
    case UPDATE_REG_CART_QUANTITY_ITEM_FAILURE:
    case UPDATE_REG_CART_SESSION_BUNDLE_FAILURE:
    case UPDATE_REG_CART_SESSION_FAILURE:
    case UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE:
    case FINALIZE_CHECKOUT_FAILURE:
    case CALCULATE_PRICING_FAILURE:
    case START_MODIFICATION_FAILURE:
    case INITIATE_WAITLIST_REGISTRATION_FAILURE:
    case START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE:
      return {
        type: action.type,
        error: action.payload.error
      };
    default:
      return state;
  }
}

function discountCodeStatus(state = '', action) {
  switch (action.type) {
    case UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS:
    case UPDATE_REG_CART_SESSION_SUCCESS:
    case UPDATE_REG_CART_SUCCESS:
      return '';
    case DISCOUNT_CODE_VALIDATION_FAILURE:
      return action.payload.validationError;
    default:
      return state;
  }
}

function preventRegistration(state = false, action) {
  switch (action.type) {
    case RESET_REG_CART_DISABLE_REG:
      return true;
    case CREATE_REG_CART_SUCCESS:
    case RESTORE_REG_CART_SUCCESS:
    case RESET_REG_CART:
    case LOG_IN_REGISTRANT_SUCCESS:
      return false;
    default:
      return state;
  }
}
