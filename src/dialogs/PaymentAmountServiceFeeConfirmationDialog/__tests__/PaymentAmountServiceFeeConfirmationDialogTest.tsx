import React from 'react';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import configureStore from '../../../redux/configureStore';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import { merge } from 'lodash';
import { openPaymentAmountServiceFeeConfirmationDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../../../widgets/PaymentWidget/__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { MOCK_GET_REG_CART_PRICING } from '../../../widgets/PaymentWidget/__mocks__/useCachedRegCartPricing';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks } from '../../../widgets/PaymentWidget/__mocks__/apolloClient';
jest.mock('../../../widgets/PaymentWidget/getRegCartPricingAction', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: async (state, _) => {
    return state;
  }
}));
jest.mock('../../../widgets/PaymentWidget/useCachedRegCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../../../widgets/PaymentWidget/useCachedRegCartPricing'),
  __esModule: true,
  getTravelCartForQuery: () => {
    return JSON.stringify({});
  },
  lastSavedRegCartForQuery: () => {
    return JSON.stringify({});
  }
}));
jest.mock('../../../widgets/PaymentWidget/regCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../../../widgets/PaymentWidget/regCartPricing'),
  getRegCartPaymentInfo: () => {
    return {};
  },
  getRegCartPricingGQL: () => {
    return MOCK_GET_REG_CART_PRICING;
  }
}));

const regCartPricing = {
  netFeeAmountRefund: '0',
  inviteeTypeServiceFeePricingRefunds: {},
  eventRegistrationPricings: [
    {
      netFeeAmountRefund: '0',
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      netFeeAmountChargeWithPaymentTypeServiceFee: '145.2',
      productPricings: [],
      productFeeAmountCharge: '100',
      chargeRevenueShareFees: {
        salesTax: null,
        fees: null
      },
      merchantProcessingFees: {
        paymentAmount: '0',
        fee: '0'
      },
      productSubTotalAmountCharge: '100',
      netFeeAmountCharge: '121',
      transactionIdToRefundAmounts: {},
      refundMerchantProcessingFee: null,
      productSubTotalAmountRefund: '0',
      refundRevenueShareFees: {
        salesTax: null,
        fees: null
      },
      productFeeAmountRefund: '0'
    }
  ],
  productFeeAmountCharge: '100',
  netFeeAmountChargeWithPaymentAmountServiceFee: 145.2,
  paymentTypeServiceFeePricingRefunds: {},
  paymentTypeServiceFeePricingCharges: {
    '0e3d7926-a956-4158-8908-f76a0aa0a3e5': {
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': '09c2deca-f85a-4428-8006-952817d19131'
      },
      appliedOrder: '1',
      id: '0e3d7926-a956-4158-8908-f76a0aa0a3e5',
      feeApplyType: '1',
      totalPaymentTypeServiceFeeAmount: '12.1',
      inviteeBreakdowns: [
        {
          amount: '12.1',
          attendeeType: 'ATTENDEE',
          attendeeId: null,
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          orderDetailTaxFeeId: null
        }
      ]
    },
    'c05fd891-1f48-4f03-a416-3f3db7902af4': {
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': 'c4198c04-495e-4500-a0cf-2ba6ed29655a'
      },
      appliedOrder: '4',
      id: 'c05fd891-1f48-4f03-a416-3f3db7902af4',
      feeApplyType: '1',
      totalPaymentTypeServiceFeeAmount: '12.1',
      inviteeBreakdowns: [
        {
          amount: '12.1',
          attendeeType: 'ATTENDEE',
          attendeeId: null,
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          orderDetailTaxFeeId: null
        }
      ]
    }
  },
  productSubTotalAmountCharge: '100',
  inviteeTypeServiceFeePricingCharges: {},
  netFeeAmountCharge: '121',
  taxPricingCharges: {},
  transactionIdToRegCartPricingRefund: {},
  taxPricingRefunds: {},
  regCartId: 'ed86b8ee-8982-4395-ae24-336a3dc8e234',
  productSubTotalAmountRefund: '0',
  productFeeAmountRefund: '0'
};

const initialState = {
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
    resolver: {
      date: () => 'some date',
      currency: x => x
    }
  },
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  regCartPricing: {
    ...regCartPricing
  },
  registrationForm: {
    regCart: {
      regCartId: '00001',
      eventRegistrations: {
        'b18958b2-bf64-4e2e-9c07-e13fd4b0f314': {
          attendeeType: 'ATTENDEE',
          eventRegistrationId: 'b18958b2-bf64-4e2e-9c07-e13fd4b0f314'
        }
      }
    },
    regCartPayment: {}
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  regCartStatus: {
    lastSavedRegCart: {}
  },
  travelCart: {
    cart: {}
  }
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

let store;
const mountComponent = async (props = {}, optionalState = {}) => {
  const state = merge({}, initialState, optionalState);
  store = configureStore(state, {});

  const apolloClientMocks = getApolloClientMocks(state);

  const component = mount(
    <Provider store={store}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
        <DialogContainer {...props} spinnerMessage="spinnerMessage" message="message" />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('PaymentAmountServiceFeeConfirmationDialog', () => {
  test('matches snapshot when opened', async () => {
    const component = await mountComponent({}, {});
    store.dispatch(openPaymentAmountServiceFeeConfirmationDialog());
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot();
  });

  test('renders correct order total when payment credits adjusted', async () => {
    // a total of 100 credits applied
    const customState = {
      regCartPricing: {
        paymentCreditsForEventReg: {
          eventRegistration1: {
            creditsCharge: 25
          },
          eventRegistration2: {
            creditsCharge: 75
          }
        }
      }
    };

    const dialog = await mountComponent({}, customState);
    store.dispatch(openPaymentAmountServiceFeeConfirmationDialog());
    await waitWithAct();
    await dialog.update();

    const totalWithCreditsAdjusted = regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee - 100;
    const expectedTotalDueResx = `EventWidgets_PaymentWidget_TotalDue__resx:{"totalDue":${totalWithCreditsAdjusted}}`;
    const totalDueElement = dialog.find('[data-cvent-id="total-due-value"]');
    expect(totalDueElement).toHaveLength(1);
    expect(totalDueElement.props().children === expectedTotalDueResx).toBeTruthy();
  });

  test('click on cancel payment amount service fee confirmation dialog', async () => {
    const dialog = await mountComponent();
    store.dispatch(openPaymentAmountServiceFeeConfirmationDialog());
    await waitWithAct();
    await dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });
});
