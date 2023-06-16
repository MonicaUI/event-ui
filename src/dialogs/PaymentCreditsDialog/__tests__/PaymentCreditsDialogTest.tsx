import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import configureStore from '../../../redux/configureStore';
import { MockedProvider } from '@apollo/client/testing';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import React from 'react';
import { openPaymentCreditsDialog } from '../index';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient, getApolloClientMocks } from '../../../widgets/PaymentWidget/__mocks__/apolloClient';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../../../widgets/PaymentWidget/__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { MOCK_GET_REG_CART_PRICING } from '../../../widgets/PaymentWidget/__mocks__/useCachedRegCartPricing';

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
jest.mock('../../../widgets/PaymentWidget/regCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../../../widgets/PaymentWidget/regCartPricing'),
  getRegCartPricingGQL: () => {
    return MOCK_GET_REG_CART_PRICING;
  }
}));

const productPricing = {
  productId: 'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb',
  productType: 'AdmissionItem',
  pricingCharges: [
    {
      quantity: 1,
      quantityPrevious: 0,
      feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
      priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
      productPriceTierBaseFeeAmountPerItem: 0,
      productFeeAmountPerItem: 0,
      productFeeAmount: 0,
      productSubTotalAmount: 0,
      netFeeAmount: 0
    }
  ],
  pricingRefunds: [
    {
      originalAmountCharged: 10
    }
  ],
  productFeeAmountCharge: 0,
  productFeeAmountRefund: 0,
  productSubTotalAmountCharge: 0,
  productSubTotalAmountRefund: 0,
  netFeeAmountCharge: 0,
  netFeeAmountRefund: 0
};

/**
 * reg cart has four attendee, group leader with 100 credits (complete credits used with 0 remaining),
 * a guest with this group leader,
 * invitee2 (with 250 credits with 100 used and 150 remaining),
 * and ivitee3 with no pricing product present but credits charge present.
 */
const regCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  ignoreTaxes: false,
  ignoreServiceFees: false,
  ignoreServiceFee: true,
  volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
  eventRegistrations: {
    primaryInvitee1RegId: {
      eventRegistrationId: 'primaryInvitee1RegId',
      attendeeType: 'GROUP_LEADER',
      attendee: {
        personalInformation: {
          firstName: 'primary',
          lastName: 'invitee1'
        },
        availablePaymentCredits: 100
      },
      registrationPathId: 'eventRegistrationId',
      sessionRegistrations: {}
    },
    primaryInvitee1Guest: {
      eventRegistrationId: 'primaryInvitee1Guest',
      attendeeType: 'GUEST',
      attendee: {
        personalInformation: {
          firstName: 'primary',
          lastName: 'invitee1'
        }
      },
      registrationPathId: 'eventRegistrationId',
      sessionRegistrations: {}
    },
    primaryInvitee2RegId: {
      eventRegistrationId: 'primaryInvitee2RegId',
      attendeeType: 'ATTENDEE',
      attendee: {
        personalInformation: {
          firstName: 'primary',
          lastName: 'invitee2'
        },
        availablePaymentCredits: 250
      },
      registrationPathId: 'eventRegistrationId',
      sessionRegistrations: {}
    },
    primaryInvitee3RegId: {
      eventRegistrationId: 'primaryInvitee3RegId',
      attendeeType: 'ATTENDEE',
      attendee: {
        personalInformation: {
          firstName: 'primary',
          lastName: 'invitee3'
        },
        availablePaymentCredits: 150
      },
      registrationPathId: 'eventRegistrationId',
      sessionRegistrations: {}
    }
  }
};

const initialState = {
  registrationForm: {
    regCart,
    regCartPayment: {
      pricingInfo: {
        creditCard: {
          paymentMethodKey: 'creditCard',
          paymentType: PAYMENT_TYPE.ONLINE,
          paymentMethodType: 'Visa',
          number: '',
          name: '',
          cVV: '',
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
        }
      }
    }
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  regCartPricing: {
    paymentCreditsForEventReg: {
      primaryInvitee1RegId: {
        eventRegId: 'primaryInvitee1RegId',
        creditsCharge: 100
      },
      primaryInvitee2RegId: {
        eventRegId: 'primaryInvitee2RegId',
        creditsCharge: 100
      },
      primaryInvitee3RegId: {
        eventRegId: 'primaryInvitee3RegId',
        creditsCharge: 10
      }
    },
    productSubTotalAmountCharge: 10,
    netFeeAmountCharge: 10,
    netFeeAmountChargeWithPaymentAmountServiceFee: 10,
    productFeeAmountRefund: 210,
    productSubTotalAmountRefund: 210,
    netFeeAmountRefund: 210,
    eventRegistrationPricings: [
      {
        eventRegistrationId: 'primaryInvitee1RegId',
        productFeeAmountCharge: 100,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 100,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 210,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [{ ...productPricing }]
      },
      {
        eventRegistrationId: 'primaryInvitee1Guest',
        productFeeAmountCharge: 100,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 100,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 210,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [{ ...productPricing }]
      },
      {
        eventRegistrationId: 'primaryInvitee2RegId',
        productFeeAmountCharge: 100,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 100,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 210,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [{ ...productPricing }]
      }
    ]
  },
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
    resolver: {
      date: () => 'some date',
      currency: x => x
    }
  },
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  eventTravel: {
    hotelsData: {
      hotels: []
    }
  },
  event: {
    products: {
      admissionItems: {
        'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb': {
          limitOptionalItemsToSelect: false,
          isOpenForRegistration: true,
          limitGuestsByContactType: false,
          includeWaitlistSessionsTowardsMaximumLimit: false,
          applicableContactTypes: [],
          limitOptionalSessionsToSelect: false,
          associatedOptionalSessions: [],
          applicableOptionalItems: [],
          minimumNumberOfSessionsToSelect: 0,
          availableOptionalSessions: [],
          capacityByGuestContactTypes: [],
          displayOrder: 1,
          code: '',
          description: '',
          id: 'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb',
          capacityId: 'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb',
          name: 'Event Registration',
          status: 2,
          type: 'AdmissionItem',
          defaultFeeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
          fees: {
            'e3f9f003-c24d-4d0e-8b07-33d0e843e660': {
              refundPolicies: [],
              isActive: true,
              isRefundable: true,
              registrationTypes: [],
              name: 'admission fee',
              id: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
              amount: 10000,
              chargePolicies: [
                {
                  id: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                  isActive: true,
                  effectiveUntil: '2999-12-31T00:00:00.000Z',
                  amount: 10000,
                  maximumRefundAmount: 10000
                }
              ]
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
  userSession: {},
  defaultUserSession: {},
  regCartStatus: {
    lastSavedRegCart: {}
  },
  travelCart: {
    cart: {}
  }
};

const regCartForPendingRegMod = {
  ...regCart,
  eventRegistrations: {
    ...regCart.eventRegistrations,
    primaryInvitee1RegId: {
      ...regCart.eventRegistrations.primaryInvitee1RegId,
      attendee: {
        ...regCart.eventRegistrations.primaryInvitee1RegId.attendee,
        availablePaymentCredits: 0,
        pendingPaymentCredits: 100
      }
    },
    primaryInvitee2RegId: {
      ...regCart.eventRegistrations.primaryInvitee2RegId,
      attendee: {
        ...regCart.eventRegistrations.primaryInvitee2RegId.attendee,
        availablePaymentCredits: 0,
        pendingPaymentCredits: 250
      }
    },
    primaryInvitee3RegId: {
      ...regCart.eventRegistrations.primaryInvitee3RegId,
      attendee: {
        ...regCart.eventRegistrations.primaryInvitee3RegId.attendee,
        availablePaymentCredits: 0,
        pendingPaymentCredits: 150
      }
    }
  }
};

const defaultProps = {
  style: {},
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res)
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};
let store;
const mountComponent = async state => {
  const apolloClientMocks = getApolloClientMocks(state);
  const apolloClient = mockApolloClient(state);
  store = configureStore(state, {}, { apolloClient });

  const component = mount(
    <Provider store={store}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
        <DialogContainer {...defaultProps} spinnerMessage="spinnerMessage" message="message" />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('Payment Credits Dialog', () => {
  test('matches snapshot when opened', async () => {
    const dialog = await mountComponent(initialState);
    store.dispatch(openPaymentCreditsDialog());
    await waitWithAct();
    await dialog.update();
    expect(dialog).toMatchSnapshot();
  });
});

describe('Payment Credits Dialog for Pending RegMod', () => {
  test('matches snapshot when opened', async () => {
    const dialog = await mountComponent({
      ...initialState,
      registrationForm: {
        regCart: regCartForPendingRegMod
      }
    });
    store.dispatch(openPaymentCreditsDialog());
    await waitWithAct();
    await dialog.update();
    expect(dialog).toMatchSnapshot();
  });
});
