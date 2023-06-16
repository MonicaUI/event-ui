/* ACTION TYPES */

export const CREATE_REG_CART_PENDING = 'event-guestside-site/regCart/CREATE_REG_CART_PENDING';
export const CREATE_REG_CART_SUCCESS = 'event-guestside-site/regCart/CREATE_REG_CART_SUCCESS';
export const CREATE_REG_CART_FAILURE = 'event-guestside-site/regCart/CREATE_REG_CART_FAILURE';
export const CREATE_PLACEHOLDER_REG_CART_SUCCESS = 'event-guestside-site/regCart/CREATE_PLACEHOLDER_REG_CART_SUCCESS';
export const CREATE_REG_CART_FROM_PLACEHOLDER_FAILURE =
  'event-guestside-site/regCart/CREATE_REG_CART_FROM_PLACEHOLDER_FAILURE';

export const RESTORE_REG_CART_PENDING = 'event-guestside-site/regCart/RESTORE_REG_CART_PENDING';
export const RESTORE_REG_CART_SUCCESS = 'event-guestside-site/regCart/RESTORE_REG_CART_SUCCESS';
export const RESTORE_REG_CART_PARTIAL = 'event-guestside-site/regCart/RESTORE_REG_CART_PARTIAL';
export const RESTORE_PARTIAL_CART_SUCCESS = 'event-guestside-site/regCart/RESTORE_PARTIAL_CART_SUCCESS';

export const REGTYPE_CHANGED = 'event-guestside-site/regCart/REGTYPE_CHANGED';

export const UPDATE_REG_CART_PENDING = 'event-guestside-site/regCart/UPDATE_REG_CART_PENDING';
export const UPDATE_REG_CART_SUCCESS = 'event-guestside-site/regCart/UPDATE_REG_CART_SUCCESS';
export const UPDATE_REG_CART_FAILURE = 'event-guestside-site/regCart/UPDATE_REG_CART_FAILURE';
export const UPDATE_REG_CART_FAILURE_FOR_GUEST = 'event-guestside-site/regCart/UPDATE_REG_CART_FAILURE_FOR_GUEST';
export const UPDATE_PLACEHOLDER_REG_CART = 'event-guestside-site/regCart/UPDATE_PLACEHOLDER_REG_CART';
export const UPDATE_PLACEHOLDER_REG_CART_ROLLBACK = 'event-guestside-site/regCart/UPDATE_PLACEHOLDER_REG_CART_ROLLBACK';

export const FINALIZE_CHECKOUT_PENDING = 'event-guestside-site/regCart/FINALIZE_CHECKOUT_PENDING';
export const FINALIZE_CHECKOUT_SUCCESS = 'event-guestside-site/regCart/FINALIZE_CHECKOUT_SUCCESS';
export const FINALIZE_CHECKOUT_FAILURE = 'event-guestside-site/regCart/FINALIZE_CHECKOUT_FAILURE';
export const FINALIZE_CHECKOUT_PAYMENT_FAILURE = 'event-guestside-site/regCart/FINALIZE_CHECKOUT_PAYMENT_FAILURE';

export const CALCULATE_PRICING_SUCCESS = 'event-guestside-site/regCart/CALCULATE_PRICING_SUCCESS';
export const CALCULATE_PRICING_FAILURE = 'event-guestside-site/regCart/CALCULATE_PRICING_FAILURE';
export const SET_PRICE_OVERRIDE = 'event-guestside-site/regCart/SET_PRICE_OVERRIDE';
export const INITIALIZE_PRICE_OVERRIDE = 'event-guestside-site/regCart/INITIALIZE_PRICE_OVERRIDE';
export const UPDATE_EDIT_MODE = 'event-guestside-site/regCart/UPDATE_EDIT_MODE';

export const START_CANCEL_REGISTRATION_CHECKOUT_PENDING =
  'event-guestside-site/regCart/START_CANCEL_REGISTRATION_CHECKOUT_PENDING';
export const START_CANCEL_REGISTRATION_CHECKOUT_SUCCESS =
  'event-guestside-site/regCart/START_CANCEL_REGISTRATION_CHECKOUT_SUCCESS';
export const START_CANCEL_REGISTRATION_CHECKOUT_FAILURE =
  'event-guestside-site/regCart/START_CANCEL_REGISTRATION_CHECKOUT_FAILURE';

export const INITIATE_CANCEL_REGISTRATION_PENDING = 'event-guestside-site/regCart/INITIATE_CANCEL_REGISTRATION_PENDING';
export const INITIATE_CANCEL_REGISTRATION_SUCCESS = 'event-guestside-site/regCart/INITIATE_CANCEL_REGISTRATION_SUCCESS';

export const FINALIZE_CANCEL_REGISTRATION_PENDING = 'event-guestside-site/regCart/FINALIZE_CANCEL_REGISTRATION_PENDING';
export const FINALIZE_CANCEL_REGISTRATION_SUCCESS = 'event-guestside-site/regCart/FINALIZE_CANCEL_REGISTRATION_SUCCESS';

export const INITIATE_DECLINE_REGISTRATION_SUCCESS =
  'event-guestside-site/regCart/INITIATE_DECLINE_REGISTRATION_SUCCESS';

export const FINALIZE_DECLINE_REGISTRATION_SUCCESS =
  'event-guestside-site/regCart/FINALIZE_DECLINE_REGISTRATION_SUCCESS';
export const FINALIZE_DECLINE_REGISTRATION_FAILURE =
  'event-guestside-site/regCart/FINALIZE_DECLINE_REGISTRATION_FAILURE';

export const INITIATE_WAITLIST_REGISTRATION_SUCCESS =
  'event-guestside-site/regCart/INITIATE_WAITLIST_REGISTRATION_SUCCESS';
export const INITIATE_WAITLIST_REGISTRATION_FAILURE =
  'event-guestside-site/regCart/INITIATE_WAITLIST_REGISTRATION_FAILURE';

export const START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE =
  'event-guestside-site/regCart/START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE';

export const START_MODIFICATION_PENDING = 'event-guestside-site/regCart/START_MODIFICATION_PENDING';
export const START_MODIFICATION_SUCCESS = 'event-guestside-site/regCart/START_MODIFICATION_SUCCESS';
export const START_MODIFICATION_FAILURE = 'event-guestside-site/regCart/START_MODIFICATION_FAILURE';

export const SET_REG_CART_FIELD_VALUE = 'event-guestside-site/regCart/SET_REG_CART_FIELD_VALUE';

export const CLEAR_REG_CART_INFERRED_FIELDS = 'event-guestside-site/regCart/CLEAR_REG_CART_INFERRED_FIELDS';

export const ADD_GROUP_MEMBER_PENDING = 'event-guestside-site/regCart/ADD_GROUP_MEMBER_PENDING';
export const ADD_GROUP_MEMBER_SUCCESS = 'event-guestside-site/regCart/ADD_GROUP_MEMBER_SUCCESS';
export const ADD_GROUP_MEMBER_FAILURE = 'event-guestside-site/regCart/ADD_GROUP_MEMBER_FAILURE';
export const SET_CURRENT_EVENT_REGISTRATION_ID = 'event-guestside-site/regCart/SET_CURRENT_EVENT_REGISTRATION_ID';
export const CLEAR_CURRENT_EVENT_REGISTRATION_ID = 'event-guestside-site/regCart/CLEAR_CURRENT_EVENT_REGISTRATION_ID';
export const REMOVE_EVENT_REGISTRATION_ID = 'event-guestside-site/regCart/REMOVE_EVENT_REGISTRATION_ID';
export const REMOVE_INVALID_CUSTOM_FIELD = 'event-guestside-site/regCart/REMOVE_INVALID_CUSTOM_FIELD';

export const SET_CURRENT_GUEST_EVENT_REGISTRATION = 'event-guestside-site/regCart/SET_CURRENT_GUEST_EVENT_REGISTRATION';
export const SET_TEMPORARY_GUEST_FIELD_VALUE = 'event-guestside-site/regCart/SET_TEMPORARY_GUEST_FIELD_VALUE';
export const CLEAR_CURRENT_GUEST_EVENT_REGISTRATION =
  'event-guestside-site/regCart/CLEAR_CURRENT_GUEST_EVENT_REGISTRATION';

export const DISCOUNT_CODE_VALIDATION_FAILURE = 'event-guestside-site/regCart/DISCOUNT_CODE_VALIDATION_FAILURE';

export const SET_REG_CART_PAYMENT_FIELD_VALUE =
  'event-guestside-site/registrationForm/regCartPayment/SET_REG_CART_PAYMENT_FIELD_VALUE';

export const SELECT_PAYMENT_METHOD = 'event-guestside-site/registrationForm/regCartPayment/SELECT_PAYMENT_METHOD';

export const CHECKOUT_FAILURE = 'event-guestside-site/registrationForm/regCart/CHECKOUT_FAILURE';

export const UPDATE_REG_CART_QUANTITY_ITEM_PENDING =
  'event-guestside-site/regCart/UPDATE_REG_CART_QUANTITY_ITEM_PENDING';
export const UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS =
  'event-guestside-site/regCart/UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS';
export const UPDATE_REG_CART_QUANTITY_ITEM_FAILURE =
  'event-guestside-site/regCart/UPDATE_REG_CART_QUANTITY_ITEM_FAILURE';
export const RESET_REG_CART = 'event-guestside-site/regCart/RESET_REG_CART';
export const RESET_REG_CART_DISABLE_REG = 'event-guestside-site/regCart/RESET_REG_CART_DISABLE_REG';

export const UPDATE_REG_CART_SESSION_BUNDLE_PENDING =
  'event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_PENDING';
export const UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS =
  'event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS';
export const UPDATE_REG_CART_SESSION_BUNDLE_FAILURE =
  'event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_FAILURE';

export const UPDATE_REG_CART_SESSION_PENDING = 'event-guestside-site/regCart/UPDATE_REG_CART_SESSION_PENDING';
export const UPDATE_REG_CART_SESSION_SUCCESS = 'event-guestside-site/regCart/UPDATE_REG_CART_SESSION_SUCCESS';
export const UPDATE_REG_CART_SESSION_FAILURE = 'event-guestside-site/regCart/UPDATE_REG_CART_SESSION_FAILURE';

export const UPDATE_REG_CART_PAYMENT_CREDITS_PENDING =
  'event-guestside-site/regCart/UPDATE_REG_CART_PAYMENT_CREDITS_PENDING';
export const UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS =
  'event-guestside-site/regCart/UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS';
export const UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE =
  'event-guestside-site/regCart/UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE';

export const SUBMIT_WEBPAYMENTS_FORM = 'event-guestside-site/regCart/SUBMIT_WEBPAYMENTS_FORM';
export const RESET_WEBPAYMENTS_FORM = 'event-guestside-site/regCart/RESET_WEBPAYMENTS_FORM';
export const SET_AIR_REQUEST_OPT_OUT_CHOICE = 'event-guestside-site/regCart/SET_AIR_REQUEST_OPT_OUT_CHOICE';

export const UPDATE_REG_CART_MEMBERSHIP_ITEM_PENDING =
  'event-guestside-site/regCart/UPDATE_REG_CART_MEMBERSHIP_ITEM_PENDING';
export const UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS =
  'event-guestside-site/regCart/UPDATE_REG_CART_MEMBERSHIP_ITEM_SUCCESS';
export const UPDATE_REG_CART_MEMBERSHIP_ITEM_FAILURE =
  'event-guestside-site/regCart/UPDATE_REG_CART_MEMBERSHIP_ITEM_FAILURE';
