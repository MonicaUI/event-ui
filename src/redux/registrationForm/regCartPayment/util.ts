import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';

const date = new Date();
export const defaultPricingInfo = {
  creditCard: {
    paymentMethodKey: 'creditCard',
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentMethodType: null,
    number: '',
    name: '',
    cVV: '',
    expirationMonth: (date.getMonth() + 1).toString(), // JS months are zero-indexed, payment processor months aren't
    expirationYear: date.getFullYear().toString(),
    address1: '',
    address2: '',
    address3: '',
    country: '',
    city: '',
    state: '',
    zip: ''
  },
  check: {
    paymentMethodKey: 'check',
    paymentType: PAYMENT_TYPE.OFFLINE,
    paymentMethodType: 'Check',
    referenceNumber: ''
  },
  purchaseOrder: {
    paymentMethodKey: 'purchaseOrder',
    paymentType: PAYMENT_TYPE.OFFLINE,
    paymentMethodType: 'PurchaseOrder',
    referenceNumber: ''
  },
  offline: {
    optionOne: {
      paymentType: PAYMENT_TYPE.OFFLINE,
      paymentMethodType: 'Other',
      paymentMethodKey: 'offline.optionOne',
      note: ''
    },
    optionTwo: {
      paymentType: PAYMENT_TYPE.OFFLINE,
      paymentMethodType: 'Other2',
      paymentMethodKey: 'offline.optionTwo',
      note: ''
    },
    optionThree: {
      paymentType: PAYMENT_TYPE.OFFLINE,
      paymentMethodType: 'Other3',
      paymentMethodKey: 'offline.optionThree',
      note: ''
    }
  },
  noPayment: {
    paymentMethodKey: 'noPayment',
    paymentType: PAYMENT_TYPE.NO_PAYMENT,
    paymentMethodType: null
  },
  payPal: {
    paymentMethodKey: 'payPal',
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentMethodType: 'PayPal'
  },
  authorizeDotNet: {
    paymentMethodKey: 'authorizeDotNet',
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentMethodType: 'AuthorizeNetSIM'
  },
  touchNet: {
    paymentMethodKey: 'touchNet',
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentMethodType: 'TouchNet'
  },
  cyberSourceSecureAcceptance: {
    paymentMethodKey: 'cyberSourceSecureAcceptance',
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentMethodType: 'CyberSourceSecureAcceptance'
  },
  wpm: {
    paymentMethodKey: 'wpm',
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentMethodType: 'Wpm'
  }
};

export function getPaymentMethodType(pricingInfo: $TSFixMe, selectedPaymentMethod: $TSFixMe): $TSFixMe {
  return selectedPaymentMethod ? getJSONValue(pricingInfo, `${selectedPaymentMethod}.paymentMethodType`) : null;
}

export function getDefaultPaymentMethodType(
  state: $TSFixMe,
  selectedPaymentMethod: $TSFixMe,
  processCardOffline: $TSFixMe,
  offlineCardTypes: $TSFixMe
): $TSFixMe {
  if (selectedPaymentMethod === 'creditCard') {
    const types = processCardOffline ? offlineCardTypes : state.event.selectedPaymentTypesSnapshot.paymentMethodTypes;
    return types ? types[0] : null;
  }
  return getPaymentMethodType(defaultPricingInfo, selectedPaymentMethod);
}

export function shouldSubmitWebPaymentsForm(state: $TSFixMe): $TSFixMe {
  if (!state.registrationForm?.regCartPayment) return false;
  if (!state.experiments?.isFlexRegWebPaymentEnabled) return false;

  const {
    registrationForm: {
      regCartPayment: { selectedPaymentMethod, pricingInfo }
    }
  } = state;

  if (!selectedPaymentMethod) return false;
  const selectedPricingInfo = getJSONValue(pricingInfo, selectedPaymentMethod);
  return selectedPricingInfo?.paymentMethodKey === 'creditCard';
}
