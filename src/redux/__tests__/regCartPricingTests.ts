import reducer from '../regCartPricing';
import { LOG_OUT_REGISTRANT_SUCCESS } from '../registrantLogin/actionTypes';

const initialRegCartPricing = reducer(undefined, {});

// Note that this is a shorted regCart for brevity.
const regCartPricing = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  productFeeAmountCharge: 0,
  productFeeAmountRefund: 0,
  productSubTotalAmountCharge: 0,
  productSubTotalAmountRefund: 0,
  netFeeAmountCharge: 0,
  netFeeAmountRefund: 0
};

const logoutAction = { type: LOG_OUT_REGISTRANT_SUCCESS };

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('LOG_OUT_REGISTRANT_SUCCESS does not change default pricing', () => {
  expect(reducer(initialRegCartPricing, logoutAction)).toMatchSnapshot();
});

test('LOG_OUT_REGISTRANT_SUCCESS sets pricing to default.', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ regCartId: string; productFeeA... Remove this comment to see the full error message
  expect(reducer(regCartPricing, logoutAction)).toMatchSnapshot();
});
