import reducer from '../regCartStatus';
import { LOG_OUT_REGISTRANT_SUCCESS } from '../registrantLogin/actionTypes';
import {
  CREATE_REG_CART_SUCCESS,
  UPDATE_REG_CART_SUCCESS,
  RESTORE_PARTIAL_CART_SUCCESS,
  FINALIZE_CHECKOUT_SUCCESS,
  INITIATE_CANCEL_REGISTRATION_SUCCESS,
  SUBMIT_WEBPAYMENTS_FORM,
  RESET_WEBPAYMENTS_FORM
} from '../registrationForm/regCart/actionTypes';
import { CHECKED_OUT } from '../registrationIntents';

const initialRegCartStatus = reducer(undefined, {});

// Note that this is a shorted regCart for brevity.
const regCartStatus = {
  ...initialRegCartStatus,
  lastSavedRegCart: {
    regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
  }
};
const completedRegCartStatus = {
  ...regCartStatus,
  registrationIntent: CHECKED_OUT,
  checkoutProgress: 100,
  lastSavedRegCart: {
    ...regCartStatus.lastSavedRegCart,
    status: 'COMPLETED'
  }
};

const savedRegCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
};

const logoutAction = { type: LOG_OUT_REGISTRANT_SUCCESS };

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('LOG_OUT_REGISTRANT_SUCCESS does not change default status', () => {
  expect(reducer(initialRegCartStatus, logoutAction)).toMatchSnapshot();
});

test('LOG_OUT_REGISTRANT_SUCCESS sets status to default.', () => {
  expect(reducer(completedRegCartStatus, logoutAction)).toMatchSnapshot();
});

test('CREATE_REG_CART_SUCCESS sets the state to registering.', () => {
  expect(reducer(initialRegCartStatus, { type: CREATE_REG_CART_SUCCESS, payload: { savedRegCart } })).toMatchSnapshot();
});

test('UPDATE_REG_CART_SUCCESS sets the state to registering.', () => {
  expect(reducer(initialRegCartStatus, { type: UPDATE_REG_CART_SUCCESS, payload: { savedRegCart } })).toMatchSnapshot();
});

test('FINALIZE_CHECKOUT_SUCCESS sets the state to CHECKED_OUT', () => {
  expect(reducer(regCartStatus, { type: FINALIZE_CHECKOUT_SUCCESS })).toMatchSnapshot();
});

test('INITIATE_CANCEL_REGISTRATION_SUCCESS sets the state to CANCELLING', () => {
  expect(reducer(regCartStatus, { type: INITIATE_CANCEL_REGISTRATION_SUCCESS })).toMatchSnapshot();
});

test('RESTORE_PARTIAL_CART_SUCCESS sets the state correctly', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
  expect(reducer({}, { type: RESTORE_PARTIAL_CART_SUCCESS })).toEqual({ isPartialCart: true });
});

test('SUBMIT_WEBPAYMENTS_FORM sets flag correctly', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
  expect(reducer({}, { type: SUBMIT_WEBPAYMENTS_FORM })).toEqual({ webPaymentsIsSubmitting: true });
});

test('RESET_WEBPAYMENTS_FORM sets flag correctly', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
  expect(reducer({}, { type: RESET_WEBPAYMENTS_FORM })).toEqual({ webPaymentsIsSubmitting: false });
});
