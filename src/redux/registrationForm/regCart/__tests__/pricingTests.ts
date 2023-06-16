import { getRegCartPricingInfo, getRegCartPricingInfoForCheckout } from '../pricing';
import { setIn } from 'icepick';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';

jest.mock('../../../../initializeMultiTabTracking', () => {
  return {
    promptToTakeOverRegistration: jest.fn()
  };
});

const accessToken = 'BEARER fakeToken';
const dummyRegCartPayment = {
  selectedPaymentMethod: 'creditCard',
  pricingInfo: {
    creditCard: {
      paymentMethodKey: 'creditCard',
      paymentType: PAYMENT_TYPE.ONLINE,
      paymentMethodType: 'Visa',
      number: '4111111111111111',
      name: 'Horus Lupercal',
      cVV: '123',
      expirationMonth: '7',
      expirationYear: '2017',
      address1: '30th Millennium',
      address2: '',
      address3: '',
      country: 'Cthonia',
      city: 'Hive City',
      state: 'VA',
      zip: '22012'
    },
    check: {
      paymentMethodKey: 'check',
      paymentType: PAYMENT_TYPE.OFFLINE,
      paymentMethodType: 'Check',
      referenceNumber: '123'
    },
    purchaseOrder: {
      paymentMethodKey: 'purchaseOrder',
      paymentType: PAYMENT_TYPE.OFFLINE,
      paymentMethodType: 'PurchaseOrder',
      referenceNumber: '123'
    },
    offline: {
      optionOne: {
        paymentType: PAYMENT_TYPE.OFFLINE,
        paymentMethodType: 'Other',
        paymentMethodKey: 'offline.optionOne',
        note: 'grimDark'
      },
      optionTwo: {
        paymentType: PAYMENT_TYPE.OFFLINE,
        paymentMethodType: 'Other2',
        paymentMethodKey: 'offline.optionTwo',
        note: 'grimDark'
      },
      optionThree: {
        paymentType: PAYMENT_TYPE.OFFLINE,
        paymentMethodType: 'Other3',
        paymentMethodKey: 'offline.optionThree',
        note: 'grimDark'
      }
    },
    noPayment: {
      paymentMethodKey: 'noPayment',
      paymentType: PAYMENT_TYPE.NO_PAYMENT,
      paymentMethodType: null
    }
  }
};

const regCartPricing = {
  paymentCreditsForEventReg: {
    '0000000000000001': 500
  }
};

test('Verify getRegCartPricingInfo returns pricingInfo as expected for creditCard', () => {
  expect(getRegCartPricingInfo(dummyRegCartPayment, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for creditCard with process offline', () => {
  const cclpPayment = setIn(dummyRegCartPayment, ['pricingInfo', 'creditCard', 'paymentType'], PAYMENT_TYPE.OFFLINE);
  expect(getRegCartPricingInfo(cclpPayment, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for noPayment option', () => {
  const noPaymentOption = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'noPayment');
  expect(getRegCartPricingInfo(noPaymentOption, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for check option', () => {
  const checkOption = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'check');
  expect(getRegCartPricingInfo(checkOption, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for purchaseOrder option', () => {
  const purchaseOrderOption = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'purchaseOrder');
  expect(getRegCartPricingInfo(purchaseOrderOption, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for offline.optionOne', () => {
  const offlineOptionOne = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'offline.optionOne');
  expect(getRegCartPricingInfo(offlineOptionOne, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for offline.optionTwo', () => {
  const offlineOptionTwo = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'offline.optionTwo');
  expect(getRegCartPricingInfo(offlineOptionTwo, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfo returns pricingInfo as expected for offline.optionThree', () => {
  const offlineOptionThree = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'offline.optionThree');
  expect(getRegCartPricingInfo(offlineOptionThree, true, false, false, false)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for creditCard', () => {
  const regCartPricingInfo = getRegCartPricingInfo(dummyRegCartPayment, true, false, false, false);
  expect(getRegCartPricingInfoForCheckout(regCartPricingInfo, accessToken)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for creditCard with processOffline true', () => {
  const cclpPayment = setIn(dummyRegCartPayment, ['pricingInfo', 'creditCard', 'paymentType'], PAYMENT_TYPE.OFFLINE);
  const regCartPricingInfo = getRegCartPricingInfo(cclpPayment, true, false, false, false);
  expect(getRegCartPricingInfoForCheckout(regCartPricingInfo, accessToken)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for noPayment option', () => {
  const noPaymentOption = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'noPayment');
  const regCartPricingInfo = getRegCartPricingInfo(noPaymentOption, true, false, false, false);
  expect(getRegCartPricingInfoForCheckout(regCartPricingInfo, accessToken)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for offline option', () => {
  const offlineOptionOne = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'offline.optionOne');
  const regCartPricingInfo = getRegCartPricingInfo(offlineOptionOne, true, false, false, false);
  expect(getRegCartPricingInfoForCheckout(regCartPricingInfo, accessToken)).toMatchSnapshot();
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for offline option with Payment Credits', () => {
  const offlineOptionOne = setIn(dummyRegCartPayment, ['selectedPaymentMethod'], 'offline.optionOne');
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ paymentCreditsForEventReg: { '... Remove this comment to see the full error message
  const regCartPricingInfo = getRegCartPricingInfo(offlineOptionOne, true, true, false, false, regCartPricing);
  expect(getRegCartPricingInfoForCheckout(regCartPricingInfo).date).toBeDefined();
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for creditCard with processOffline true when using webpayments form', () => {
  let cclpPayment = setIn(dummyRegCartPayment, ['pricingInfo', 'creditCard', 'paymentType'], PAYMENT_TYPE.OFFLINE);
  cclpPayment = setIn(cclpPayment, ['pricingInfo', 'creditCard', 'contextId'], 'testContextId');
  const regCartPricingInfo = getRegCartPricingInfo(cclpPayment, true, false, false, false);
  const checkoutPricingInfo = getRegCartPricingInfoForCheckout(regCartPricingInfo, accessToken);
  expect(checkoutPricingInfo).toMatchSnapshot();
  expect(checkoutPricingInfo.paymentDetail.creditCard).toBe(null);
});

test('Verify getRegCartPricingInfoForCheckout returns checkoutInfo as expected by reg service checkout V2 endpoint for creditCard with processOffline true when  not using webpayments form', () => {
  const cclpPayment = setIn(dummyRegCartPayment, ['pricingInfo', 'creditCard', 'paymentType'], PAYMENT_TYPE.OFFLINE);
  const expectedCreditCard = {
    paymentMethodKey: 'creditCard',
    type: 'Visa',
    number: '4111111111111111',
    name: 'Horus Lupercal',
    cVV: '123',
    expirationDate: '2017-07',
    expirationMonth: '7',
    expirationYear: '2017',
    address1: '30th Millennium',
    address2: '',
    address3: '',
    country: 'Cthonia',
    city: 'Hive City',
    state: 'VA',
    zip: '22012'
  };

  const regCartPricingInfo = getRegCartPricingInfo(cclpPayment, true, false, false, false);
  const checkoutPricingInfo = getRegCartPricingInfoForCheckout(regCartPricingInfo, accessToken);

  expect(checkoutPricingInfo).toMatchSnapshot();
  expect(checkoutPricingInfo.paymentDetail.creditCard).toEqual(expectedCreditCard);
});
