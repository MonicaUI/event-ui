import {
  ADD_GROUP_MEMBER_SUCCESS,
  CLEAR_REG_CART_INFERRED_FIELDS,
  CREATE_PLACEHOLDER_REG_CART_SUCCESS,
  CREATE_REG_CART_SUCCESS,
  FINALIZE_CHECKOUT_SUCCESS,
  FINALIZE_DECLINE_REGISTRATION_SUCCESS,
  INITIATE_CANCEL_REGISTRATION_SUCCESS,
  INITIATE_DECLINE_REGISTRATION_SUCCESS,
  INITIATE_WAITLIST_REGISTRATION_SUCCESS,
  REMOVE_EVENT_REGISTRATION_ID,
  REMOVE_INVALID_CUSTOM_FIELD,
  RESTORE_REG_CART_SUCCESS,
  SET_REG_CART_FIELD_VALUE,
  START_MODIFICATION_SUCCESS,
  UPDATE_REG_CART_SUCCESS,
  UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS,
  RESET_REG_CART,
  UPDATE_REG_CART_SESSION_SUCCESS,
  UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS,
  RESET_REG_CART_DISABLE_REG,
  SET_AIR_REQUEST_OPT_OUT_CHOICE,
  UPDATE_PLACEHOLDER_REG_CART,
  UPDATE_PLACEHOLDER_REG_CART_ROLLBACK,
  UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS,
  UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS
} from './actionTypes';
import { LOG_IN_REGISTRANT_SUCCESS, LOG_OUT_REGISTRANT_SUCCESS } from '../../registrantLogin/actionTypes';
import { setIn, unset, updateIn } from 'icepick';
import { refPreserving } from '@cvent/ref-preserving-function';

const emptyRegCart = {
  regCartId: '',
  regMod: false,
  regDecline: false,
  regCancel: false,
  eventRegistrations: {}
};

// eslint-disable-next-line complexity
export function isFullRegCartReplacement(action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case ADD_GROUP_MEMBER_SUCCESS:
    case CREATE_REG_CART_SUCCESS:
    case CREATE_PLACEHOLDER_REG_CART_SUCCESS:
    case RESTORE_REG_CART_SUCCESS:
    case UPDATE_REG_CART_SUCCESS:
    case UPDATE_PLACEHOLDER_REG_CART:
    case UPDATE_PLACEHOLDER_REG_CART_ROLLBACK:
    case INITIATE_CANCEL_REGISTRATION_SUCCESS:
    case INITIATE_DECLINE_REGISTRATION_SUCCESS:
    case INITIATE_WAITLIST_REGISTRATION_SUCCESS:
    case LOG_IN_REGISTRANT_SUCCESS:
    case START_MODIFICATION_SUCCESS:
    case FINALIZE_CHECKOUT_SUCCESS:
    case FINALIZE_DECLINE_REGISTRATION_SUCCESS:
    case CLEAR_REG_CART_INFERRED_FIELDS:
    case UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS:
    case UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS:
    case UPDATE_REG_CART_SESSION_SUCCESS:
    case UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS:
    case RESET_REG_CART:
    case RESET_REG_CART_DISABLE_REG:
    case UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS:
      return true;
    default:
      return false;
  }
}

function reducer(state = emptyRegCart, action) {
  switch (action.type) {
    case SET_REG_CART_FIELD_VALUE: {
      const { path, value } = action.payload;
      return setIn(state, path, value);
    }
    case REMOVE_EVENT_REGISTRATION_ID: {
      const { path, currentEventRegistrationId } = action.payload;
      return updateIn(state, path, eventReg => unset(eventReg, currentEventRegistrationId));
    }
    case LOG_OUT_REGISTRANT_SUCCESS:
      return emptyRegCart;
    case REMOVE_INVALID_CUSTOM_FIELD: {
      const { path, fieldId } = action.payload;
      return setIn(state, [...path, fieldId, 'answers'], []);
    }
    case SET_AIR_REQUEST_OPT_OUT_CHOICE: {
      const { path, requestOptOutChoice } = action.payload;
      return setIn(state, path, requestOptOutChoice);
    }
    default:
      if (isFullRegCartReplacement(action)) {
        return action.payload.regCart;
      }
      return state;
  }
}
export default refPreserving(reducer);
