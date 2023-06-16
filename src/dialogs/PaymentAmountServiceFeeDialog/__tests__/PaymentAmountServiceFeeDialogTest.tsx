import React from 'react';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import configureStore from '../../../redux/configureStore';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import { merge } from 'lodash';
import { openPaymentAmountServiceFeeDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../../../widgets/PaymentWidget/__mocks__/regCartClient';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
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
  },
  getPaymentInfoForQuery: () => {
    return JSON.stringify({});
  }
}));

const groupMemberEventRegId = '00000000-0000-0000-0000-000000000002';
const groupLeaderEventRegId = '00000000-0000-0000-0000-000000000000';

const regCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'INPROGRESS',
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      attendee: {
        personalInformation: {
          emailAddress: 'lroling-384934@j.mail'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      confirmationNumber: '123456789',
      productRegistrations: [],
      attendeeType: 'GROUP_LEADER',
      registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
    },
    [groupMemberEventRegId]: {
      eventRegistrationId: '02',
      attendee: {
        personalInformation: {},
        eventAnswers: {}
      },
      attendeeType: 'ATTENDEE',
      primaryRegistrationId: groupLeaderEventRegId,
      productRegistrations: [
        {
          productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ]
    }
  }
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
  event: {
    selectedPaymentTypesSnapshot: {
      paymentMethodTypes: ['Visa', 'MasterCard']
    },
    products: {
      serviceFees: {
        'b272f019-8a00-487a-a640-938a836e74e7': {
          active: true,
          refundable: false,
          amount: 10.0,
          applyType: 0,
          adjustmentType: 1,
          inviteeType: 0,
          serviceFeeType: 51,
          applicableContactTypes: [],
          applicablePaymentMethods: ['Visa'],
          displayOrder: 2,
          code: 'how they pay - amount',
          id: 'b272f019-8a00-487a-a640-938a836e74e7',
          name: 'how they pay - amount',
          type: 'PaymentTypeServiceFee',
          defaultFeeId: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
          fees: {
            'e0e1f3ff-6c37-44cf-a454-6aca7712cea3': {
              chargePolicies: [
                {
                  id: 'e03a820d-8396-44d9-a95a-5e471c5ec6ed',
                  isActive: true,
                  effectiveUntil: '2999-12-31T00:00:00.000Z',
                  amount: 10.0,
                  maximumRefundAmount: 0.0
                }
              ],
              refundPolicies: [],
              isActive: true,
              isRefundable: false,
              registrationTypes: [],
              name: 'how they pay - amount',
              id: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
              amount: 10.0,
              glCodes: []
            }
          }
        }
      }
    },
    eventFeatureSetup: {
      fees: {
        merchantAccountId: 'merchantAccountId',
        fees: true,
        taxes: true,
        serviceFees: true
      }
    }
  },
  registrationForm: {
    regCart,
    regCartPayment: {}
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  regCartStatus: {
    lastSavedRegCart: {}
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

describe('PaymentAmountServiceFeeDialog', () => {
  test('matches snapshot when opened', async () => {
    const dialog = await mountComponent({}, {});
    store.dispatch(openPaymentAmountServiceFeeDialog());
    await waitWithAct();
    await dialog.update();
    expect(dialog).toMatchSnapshot();
  });
});
