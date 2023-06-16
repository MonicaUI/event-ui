import { UPDATE_PAYMENT_AMOUNT, UPDATE_SELECTED_PAYMENT_OPTION } from './actions';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';
import { START_MODIFICATION_SUCCESS } from '../registrationForm/regCart/actionTypes';
import { GET_ORDERS } from '../actionTypes';

// Reducer to update state for Partial Payments
export default function reducer(state: $TSFixMe, action: $TSFixMe): $TSFixMe {
  const defaultPartialPayment = { paymentAmountOption: null, paymentAmount: null };
  switch (action.type) {
    case UPDATE_SELECTED_PAYMENT_OPTION: {
      const FULL_PAYMENT_VALUE = PAYMENT_AMOUNT_OPTION.FULL_PAYMENT.value;
      const paymentOption =
        action.payload === FULL_PAYMENT_VALUE
          ? PAYMENT_AMOUNT_OPTION.FULL_PAYMENT
          : PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT;
      return {
        ...state,
        paymentAmountOption: paymentOption
      };
    }
    case UPDATE_PAYMENT_AMOUNT:
      return {
        ...state,
        paymentAmount: action.payload
      };
    case START_MODIFICATION_SUCCESS:
    case GET_ORDERS:
      return defaultPartialPayment;
    default:
      return state;
  }
}
