import setJSONValue from 'nucleus-widgets/utils/fields/setJSONValue';
import {
  RESTORE_REG_CART_SUCCESS,
  SELECT_PAYMENT_METHOD,
  SET_REG_CART_PAYMENT_FIELD_VALUE,
  START_MODIFICATION_SUCCESS
} from '../regCart/actionTypes';
import { LOG_OUT_REGISTRANT_SUCCESS } from '../../registrantLogin/actionTypes';
import { setIn } from 'icepick';
import { defaultPricingInfo, getPaymentMethodType } from './util';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';

const defaultRegCartPayment = { selectedPaymentMethod: null, pricingInfo: defaultPricingInfo };

function setPaymentMethodType(pricingInfo, selectedPaymentMethod, paymentMethodType) {
  if (selectedPaymentMethod) {
    return setJSONValue(pricingInfo, `${selectedPaymentMethod}.paymentMethodType`, paymentMethodType);
  }
  return pricingInfo;
}

function setCreditCardPaymentType(selectedPaymentMethod, pricingInfo, isProcessOffline) {
  if (selectedPaymentMethod === 'creditCard') {
    if (isProcessOffline && pricingInfo.creditCard.paymentType !== PAYMENT_TYPE.OFFLINE) {
      return setJSONValue(pricingInfo, `${selectedPaymentMethod}.paymentType`, PAYMENT_TYPE.OFFLINE);
    }
    if (!isProcessOffline && pricingInfo.creditCard.paymentType !== PAYMENT_TYPE.ONLINE) {
      return setJSONValue(pricingInfo, `${selectedPaymentMethod}.paymentType`, PAYMENT_TYPE.ONLINE);
    }
  }

  return pricingInfo;
}

export default function regCartPayment(state = defaultRegCartPayment, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case START_MODIFICATION_SUCCESS:
    case LOG_OUT_REGISTRANT_SUCCESS:
      return defaultRegCartPayment;
    case SET_REG_CART_PAYMENT_FIELD_VALUE: {
      const { path, value } = action.payload;
      return setIn(state, path, value);
    }
    case SELECT_PAYMENT_METHOD: {
      const { selectedPaymentMethod, defaultPaymentMethodType, isProcessOffline } = action.payload;
      const paymentMethodType = getPaymentMethodType(state.pricingInfo, selectedPaymentMethod);
      const pricingInfo = paymentMethodType
        ? state.pricingInfo
        : setPaymentMethodType(state.pricingInfo, selectedPaymentMethod, defaultPaymentMethodType);
      return {
        ...state,
        selectedPaymentMethod,
        pricingInfo: setCreditCardPaymentType(selectedPaymentMethod, pricingInfo, isProcessOffline)
      };
    }
    case RESTORE_REG_CART_SUCCESS:
      return action.payload.regCartPayment || defaultRegCartPayment;
    default:
      return state;
  }
}
