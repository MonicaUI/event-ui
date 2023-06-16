import { getPaymentSettings } from '../../selectors/currentRegistrationPath';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { SELECT_PAYMENT_METHOD, SET_REG_CART_PAYMENT_FIELD_VALUE } from '../regCart/actionTypes';
import { getDefaultPaymentMethodType } from './util';
import { UPDATE_PAYMENT_AMOUNT, UPDATE_SELECTED_PAYMENT_OPTION } from '../../partialPayments/actions';
import { isOnProcessOfflineRegPath } from '../../selectors/currentRegistrant';
import { getSupportedCardsForAccount } from 'event-widgets/utils/creditCardUtils';
import { getSelectedMerchantAccount } from 'event-widgets/redux/selectors';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';

export function setRegCartPaymentFieldValue(path: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return {
    type: SET_REG_CART_PAYMENT_FIELD_VALUE,
    payload: { path, value }
  };
}
export function setSelectedPaymentMethod(selectedPaymentMethod: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const isProcessOffline = isOnProcessOfflineRegPath(getState());
    const showOfflineCardTypes = isProcessOffline && !getSelectedMerchantAccount(getState());
    const defaultPaymentMethodType = getDefaultPaymentMethodType(
      getState(),
      selectedPaymentMethod,
      showOfflineCardTypes,
      getSupportedCardsForAccount(getState())
    );

    return dispatch({
      type: SELECT_PAYMENT_METHOD,
      payload: {
        selectedPaymentMethod,
        defaultPaymentMethodType,
        isProcessOffline
      }
    });
  };
}

export function setCreditCardField(field: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return setRegCartPaymentFieldValue(['pricingInfo', 'creditCard', field], value);
}

export function setCreditCardPaymentType(selectedPaymentMethod: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    if (selectedPaymentMethod === 'creditCard') {
      const isProcessOffline = isOnProcessOfflineRegPath(getState());
      const { pricingInfo } = getState().registrationForm.regCartPayment;
      if (isProcessOffline && pricingInfo.creditCard.paymentType !== PAYMENT_TYPE.OFFLINE) {
        return dispatch(setCreditCardField('paymentType', PAYMENT_TYPE.OFFLINE));
      }
      if (!isProcessOffline && pricingInfo.creditCard.paymentType !== PAYMENT_TYPE.ONLINE) {
        return dispatch(setCreditCardField('paymentType', PAYMENT_TYPE.ONLINE));
      }
    }
  };
}

export function setPaymentOfflineAdditionalDetails(paymentMethodPath: $TSFixMe, additionalDetails: $TSFixMe): $TSFixMe {
  return setRegCartPaymentFieldValue(['pricingInfo', ...paymentMethodPath], additionalDetails);
}

export function clearInapplicableSelectedPaymentMethod() {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    const paymentSettings = getPaymentSettings(state);
    const selectedPaymentMethod = state.registrationForm.regCartPayment.selectedPaymentMethod;
    if (!selectedPaymentMethod) {
      return;
    }
    const selectedPaymentMethodSettings = getJSONValue(paymentSettings, selectedPaymentMethod);
    if (!selectedPaymentMethodSettings.enabled) {
      dispatch(setSelectedPaymentMethod(null));
    }

    // Set the payment type to the correct status when switching paths
    dispatch(setCreditCardPaymentType(selectedPaymentMethod));
  };
}

export function setPartialPaymentRadioButton(fieldName: $TSFixMe, value: $TSFixMe) {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch({ type: UPDATE_SELECTED_PAYMENT_OPTION, payload: value });
  };
}

export function updatePaymentAmountValue(fieldName: $TSFixMe, value: $TSFixMe) {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch({ type: UPDATE_PAYMENT_AMOUNT, payload: value });
  };
}
