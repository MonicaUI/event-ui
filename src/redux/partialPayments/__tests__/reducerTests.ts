import reducer from '../reducer';
import { UPDATE_PAYMENT_AMOUNT, UPDATE_SELECTED_PAYMENT_OPTION } from '../actions';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';

describe('PartialPaymentsReducer', () => {
  let state;
  beforeEach(() => {
    state = {
      partialPaymentSettings: {
        enabled: true,
        enabledOnPostRegPaymentPage: false,
        minimumPaymentAmountType: PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT,
        minimumPaymentAmount: '20',
        paymentDistributionMethodType: '1',
        productPriorityList: []
      }
    };
  });
  it('should return the initial state', () => {
    expect(reducer(state, {})).toEqual(state);
  });
  it('should update the paymentAmountOption in state', () => {
    const action = {
      type: UPDATE_SELECTED_PAYMENT_OPTION,
      payload: 1
    };
    const newstate = reducer(state, action);
    expect(newstate.paymentAmountOption.value).toEqual(1);
  });
  it('should update the paymentAmount in state', () => {
    const action = {
      type: UPDATE_PAYMENT_AMOUNT,
      payload: '20'
    };
    const newstate = reducer(state, action);
    expect(newstate.paymentAmount).toEqual('20');
  });
});
