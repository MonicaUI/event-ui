/* eslint-env jest */
import { shouldSubmitWebPaymentsForm, defaultPricingInfo } from '../util';
import { setIn } from 'icepick';

test('shouldSubmitWebpaymentsForm only returns true when we are certain a form is present', () => {
  // Blank state ok as long as experiment is off
  expect(
    shouldSubmitWebPaymentsForm({
      experiments: { isFlexRegWebPaymentEnabled: false }
    })
  ).toBeFalsy();

  const state = {
    experiments: { isFlexRegWebPaymentEnabled: true },
    registrationForm: {
      regCartPayment: {
        selectedPaymentMethod: null,
        paymentType: null,
        pricingInfo: null
      }
    }
  };

  expect(shouldSubmitWebPaymentsForm(state)).toBeFalsy();

  const setPaymentField = (inState, field, val) => setIn(inState, ['registrationForm', 'regCartPayment', field], val);
  const stateWithPricingInfo = setPaymentField(state, 'pricingInfo', defaultPricingInfo);
  const stateWithOnline = setPaymentField(stateWithPricingInfo, 'paymentType', 'Online');

  expect(shouldSubmitWebPaymentsForm(setPaymentField(stateWithOnline, 'selectedPaymentMethod', null))).toBeFalsy();

  expect(
    shouldSubmitWebPaymentsForm(setPaymentField(stateWithOnline, 'selectedPaymentMethod', 'randomMethod'))
  ).toBeFalsy();

  expect(
    shouldSubmitWebPaymentsForm(setPaymentField(stateWithOnline, 'selectedPaymentMethod', 'offline.optionOne'))
  ).toBeFalsy();

  expect(
    shouldSubmitWebPaymentsForm(setPaymentField(stateWithOnline, 'selectedPaymentMethod', 'creditCard'))
  ).toBeTruthy();
});

test('shouldSubmitWebpaymentsForm should be truthy when submitting for cclp', () => {
  // Blank state ok as long as experiment is off
  expect(
    shouldSubmitWebPaymentsForm({
      experiments: { isFlexRegWebPaymentEnabled: false }
    })
  ).toBeFalsy();

  const state = {
    experiments: { isFlexRegWebPaymentEnabled: true },
    registrationForm: {
      regCartPayment: {
        selectedPaymentMethod: null,
        paymentType: null,
        pricingInfo: null
      }
    }
  };

  expect(shouldSubmitWebPaymentsForm(state)).toBeFalsy();

  const setPaymentField = (inState, field, val) => setIn(inState, ['registrationForm', 'regCartPayment', field], val);
  const setCreditCardPaymentField = (inState, field, val) =>
    setIn(inState, ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', field], val);
  const stateWithPricingInfo = setPaymentField(state, 'pricingInfo', defaultPricingInfo);
  const stateWithOffline = setCreditCardPaymentField(stateWithPricingInfo, 'paymentType', 'Offline');

  expect(shouldSubmitWebPaymentsForm(setPaymentField(stateWithOffline, 'selectedPaymentMethod', null))).toBeFalsy();

  expect(
    shouldSubmitWebPaymentsForm(setPaymentField(stateWithOffline, 'selectedPaymentMethod', 'randomMethod'))
  ).toBeFalsy();

  expect(
    shouldSubmitWebPaymentsForm(setPaymentField(stateWithOffline, 'selectedPaymentMethod', 'offline.optionOne'))
  ).toBeFalsy();

  expect(
    shouldSubmitWebPaymentsForm(setPaymentField(stateWithOffline, 'selectedPaymentMethod', 'creditCard'))
  ).toBeTruthy();
});
