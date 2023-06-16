/**
 * A module for registration related functionality.
 */
import { LOG_OUT_REGISTRANT_SUCCESS, LOG_IN_REGISTRANT_SUCCESS } from './registrantLogin/actionTypes';
import {
  CREATE_REG_CART_PENDING,
  CREATE_REG_CART_SUCCESS,
  CREATE_REG_CART_FAILURE,
  UPDATE_REG_CART_PENDING,
  UPDATE_REG_CART_SUCCESS,
  UPDATE_REG_CART_FAILURE,
  UPDATE_REG_CART_FAILURE_FOR_GUEST,
  FINALIZE_CHECKOUT_PENDING,
  FINALIZE_CHECKOUT_SUCCESS,
  FINALIZE_CHECKOUT_FAILURE,
  START_CANCEL_REGISTRATION_CHECKOUT_PENDING,
  START_CANCEL_REGISTRATION_CHECKOUT_SUCCESS,
  START_CANCEL_REGISTRATION_CHECKOUT_FAILURE,
  START_MODIFICATION_PENDING,
  START_MODIFICATION_SUCCESS,
  START_MODIFICATION_FAILURE,
  INITIATE_CANCEL_REGISTRATION_PENDING,
  INITIATE_CANCEL_REGISTRATION_SUCCESS,
  FINALIZE_CANCEL_REGISTRATION_PENDING,
  FINALIZE_CANCEL_REGISTRATION_SUCCESS,
  FINALIZE_DECLINE_REGISTRATION_SUCCESS,
  FINALIZE_CHECKOUT_PAYMENT_FAILURE,
  RESTORE_REG_CART_PENDING,
  RESTORE_REG_CART_SUCCESS,
  RESTORE_PARTIAL_CART_SUCCESS,
  ADD_GROUP_MEMBER_SUCCESS,
  RESTORE_REG_CART_PARTIAL,
  REGTYPE_CHANGED,
  ADD_GROUP_MEMBER_PENDING,
  ADD_GROUP_MEMBER_FAILURE,
  CHECKOUT_FAILURE,
  UPDATE_REG_CART_QUANTITY_ITEM_PENDING,
  UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS,
  UPDATE_REG_CART_QUANTITY_ITEM_FAILURE,
  UPDATE_REG_CART_SESSION_PENDING,
  UPDATE_REG_CART_SESSION_BUNDLE_PENDING,
  UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS,
  UPDATE_REG_CART_SESSION_BUNDLE_FAILURE,
  UPDATE_REG_CART_SESSION_SUCCESS,
  UPDATE_REG_CART_SESSION_FAILURE,
  UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS,
  UPDATE_REG_CART_PAYMENT_CREDITS_PENDING,
  UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE,
  SUBMIT_WEBPAYMENTS_FORM,
  RESET_WEBPAYMENTS_FORM,
  FINALIZE_DECLINE_REGISTRATION_FAILURE,
  CREATE_PLACEHOLDER_REG_CART_SUCCESS,
  UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS,
  UPDATE_REG_CART_MEMBERSHIP_ITEM_PENDING,
  UPDATE_REG_CART_MEMBERSHIP_ITEM_FAILURE,
  CREATE_REG_CART_FROM_PLACEHOLDER_FAILURE
} from './registrationForm/regCart/actionTypes';
import {
  NOT_REGISTERING,
  STARTING_REGISTRATION,
  REGISTERING,
  SAVING_REGISTRATION,
  CHECKING_OUT,
  CHECKED_OUT,
  CANCELLING,
  FINALIZED_CANCEL_REGISTRATION,
  DECLINED_REGISTRATION
} from './registrationIntents';

const initialState = {
  registrationIntent: NOT_REGISTERING,
  checkoutProgress: 0,
  lastSavedRegCart: null,
  partialRegCartUpdated: false, // when a previous partial/abandoned registration is found for the ID details entered
  isPartialCart: false, // when user confirms restoring a previous partial/abandoned registration
  regTypeChanged: false,
  webPaymentsIsSubmitting: false
};

/**
 * Reducer to keep track of the status of the reg cart
 */
// eslint-disable-next-line complexity
export default function regCartStatusReducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case CREATE_REG_CART_PENDING:
    case ADD_GROUP_MEMBER_PENDING:
    case RESTORE_REG_CART_PENDING:
    case START_MODIFICATION_PENDING:
      return { ...state, registrationIntent: STARTING_REGISTRATION, startProgress: action.payload?.startProgress };
    case RESTORE_REG_CART_PARTIAL:
      return { ...state, partialRegCartUpdated: true };
    case REGTYPE_CHANGED:
      return { ...state, regTypeChanged: action.payload.regTypeChanged };
    case UPDATE_REG_CART_SESSION_BUNDLE_PENDING:
    case UPDATE_REG_CART_SESSION_PENDING:
    case UPDATE_REG_CART_QUANTITY_ITEM_PENDING:
    case UPDATE_REG_CART_PAYMENT_CREDITS_PENDING:
    case UPDATE_REG_CART_MEMBERSHIP_ITEM_PENDING:
    case UPDATE_REG_CART_PENDING:
      return { ...state, registrationIntent: SAVING_REGISTRATION };
    case CREATE_REG_CART_SUCCESS:
    case CREATE_PLACEHOLDER_REG_CART_SUCCESS:
    case ADD_GROUP_MEMBER_SUCCESS:
    case RESTORE_REG_CART_SUCCESS:
    case UPDATE_REG_CART_SUCCESS:
    case UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS:
    case UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS:
    case UPDATE_REG_CART_SESSION_SUCCESS:
    case UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS:
    case UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS:
      return {
        ...state,
        registrationIntent: REGISTERING,
        lastSavedRegCart: action.payload.savedRegCart || action.payload.regCart,
        modificationStartRegCart:
          action.payload.modificationStartRegCart || (state as $TSFixMe).modificationStartRegCart
      };
    case RESTORE_PARTIAL_CART_SUCCESS:
      return { ...state, isPartialCart: true };
    case START_MODIFICATION_SUCCESS:
      return {
        ...state,
        registrationIntent: REGISTERING,
        lastSavedRegCart: action.payload.regCart,
        modificationStartRegCart: action.payload.regCart,
        isPartialCart: false
      };
    case FINALIZE_CHECKOUT_PENDING:
      return {
        ...state,
        registrationIntent: CHECKING_OUT,
        checkoutProgress: action.payload.checkoutProgress
      };
    case FINALIZE_CHECKOUT_SUCCESS:
      // TODO: handle partial checkout once the API supports it
      return {
        ...state,
        registrationIntent: CHECKED_OUT,
        checkoutProgress: 100
      };
    case CREATE_REG_CART_FROM_PLACEHOLDER_FAILURE:
      return {
        ...state,
        registrationIntent: REGISTERING
      };
    case CREATE_REG_CART_FAILURE:
    case START_MODIFICATION_FAILURE:
      return {
        ...state,
        registrationIntent: NOT_REGISTERING
      };
    case UPDATE_REG_CART_FAILURE:
    case UPDATE_REG_CART_FAILURE_FOR_GUEST:
    case ADD_GROUP_MEMBER_FAILURE:
    case FINALIZE_CHECKOUT_PAYMENT_FAILURE:
    case UPDATE_REG_CART_QUANTITY_ITEM_FAILURE:
    case UPDATE_REG_CART_SESSION_BUNDLE_FAILURE:
    case UPDATE_REG_CART_SESSION_FAILURE:
    case UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE:
    case UPDATE_REG_CART_MEMBERSHIP_ITEM_FAILURE:
      return {
        ...state,
        registrationIntent: REGISTERING
      };
    case INITIATE_CANCEL_REGISTRATION_PENDING:
    case INITIATE_CANCEL_REGISTRATION_SUCCESS:
    case START_CANCEL_REGISTRATION_CHECKOUT_PENDING:
    case START_CANCEL_REGISTRATION_CHECKOUT_SUCCESS:
    case FINALIZE_CANCEL_REGISTRATION_PENDING:
      return {
        ...state,
        registrationIntent: CANCELLING
      };
    case START_CANCEL_REGISTRATION_CHECKOUT_FAILURE:
      return {
        // TODO: add error handling
        ...state,
        registrationIntent: CHECKED_OUT
      };
    case FINALIZE_CANCEL_REGISTRATION_SUCCESS:
      return {
        ...state,
        registrationIntent: FINALIZED_CANCEL_REGISTRATION
      };
    case FINALIZE_DECLINE_REGISTRATION_SUCCESS:
      return {
        ...state,
        registrationIntent: DECLINED_REGISTRATION,
        lastSavedRegCart: action.payload.regCart
      };
    case LOG_IN_REGISTRANT_SUCCESS:
      return {
        ...state,
        registrationIntent: CHECKED_OUT
      };
    case LOG_OUT_REGISTRANT_SUCCESS:
      return initialState;
    case FINALIZE_CHECKOUT_FAILURE:
    case FINALIZE_DECLINE_REGISTRATION_FAILURE:
    case CHECKOUT_FAILURE:
      return {
        ...state,
        registrationIntent: REGISTERING
      };
    case SUBMIT_WEBPAYMENTS_FORM:
      return {
        ...state,
        webPaymentsIsSubmitting: true
      };
    case RESET_WEBPAYMENTS_FORM:
      return {
        ...state,
        webPaymentsIsSubmitting: false
      };
    default:
      return state;
  }
}
