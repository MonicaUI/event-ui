import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import apolloCache from '../../../apollo/apolloCache';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { getRegCartPricingMergedState } from '../getRegCartPricingAction';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { MOCK_GET_REG_CART_PRICING } from '../__mocks__/useCachedRegCartPricing';
import { createLink } from '../../../apollo/apolloLinkFetchRequest';
jest.mock('../regCartPricing', () => ({
  isOverrideProductFeesValid: () => {
    return {};
  },
  isOverrideProductRefundsValid: () => {
    return {};
  },
  plannerOverriddenProductFeesSavedVar: () => {
    return {};
  },
  plannerOverriddenProductRefundsSavedVar: () => {
    return {};
  },
  getCachedRegCartPricing: () => {
    return {};
  },
  regCartPaymentParams: () => {
    return {};
  },
  getRegCartPaymentInfo: () => {
    return {};
  },
  getRegCartPricingGQL: () => {
    return MOCK_GET_REG_CART_PRICING;
  }
}));

const mockRegCartPricing = {
  netFeeAmountCharge: 1200,
  netFeeAmountRefund: 0,
  productFeeAmountCharge: 1200,
  productSubTotalAmountCharge: 1200,
  productFeeAmountRefund: 0,
  productSubTotalAmountRefund: 0,
  regCartId: 'a81a9d4d-cfa8-4464-bf8f-7e51d94a3f13',
  eventRegistrationPricings: [
    {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      productFeeAmountCharge: 400,
      productFeeAmountRefund: 0,
      productSubTotalAmountCharge: 400,
      productSubTotalAmountRefund: 0,
      netFeeAmountCharge: 400,
      netFeeAmountRefund: 0,
      regCartStatus: {},
      registrantLogin: {},
      routing: {},
      productPricings: [
        {
          productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
          productType: 'Session',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 400,
              productFeeAmountPerItem: 400,
              productFeeAmount: 400,
              productSubTotalAmount: 400,
              netFeeAmount: 400
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 400,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 400,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 400,
          netFeeAmountRefund: 0
        },
        {
          productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
          productType: 'Session',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 0
        },
        {
          productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          productType: 'AdmissionItem',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 0
        }
      ]
    },
    {
      eventRegistrationId: '8587d261-af1d-423d-a406-eb305ca124f3',
      productFeeAmountCharge: 400,
      productFeeAmountRefund: 0,
      productSubTotalAmountCharge: 400,
      productSubTotalAmountRefund: 0,
      netFeeAmountCharge: 400,
      netFeeAmountRefund: 0,
      regCartStatus: {},
      registrantLogin: {},
      routing: {},
      productPricings: [
        {
          productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
          productType: 'Session',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 400,
              productFeeAmountPerItem: 400,
              productFeeAmount: 400,
              productSubTotalAmount: 400,
              netFeeAmount: 400
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 400,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 400,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 400,
          netFeeAmountRefund: 0
        },
        {
          productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
          productType: 'Session',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 0
        },
        {
          productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          productType: 'AdmissionItem',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 0
        }
      ]
    },
    {
      eventRegistrationId: '55e6409a-1f00-4c67-b586-9666229d9dc9',
      productFeeAmountCharge: 400,
      productFeeAmountRefund: 0,
      productSubTotalAmountCharge: 400,
      productSubTotalAmountRefund: 0,
      netFeeAmountCharge: 400,
      netFeeAmountRefund: 0,
      regCartStatus: {},
      registrantLogin: {},
      routing: {},
      productPricings: [
        {
          productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
          productType: 'Session',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 400,
              productFeeAmountPerItem: 400,
              productFeeAmount: 400,
              productSubTotalAmount: 400,
              netFeeAmount: 400
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 400,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 400,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 400,
          netFeeAmountRefund: 0
        },
        {
          productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
          productType: 'Session',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 0
        },
        {
          productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          productType: 'AdmissionItem',
          pricingCharges: [
            {
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
              priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 0
        }
      ]
    }
  ]
};

jest.mock('@apollo/client');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ApolloClient } = require('@apollo/client');
ApolloClient.prototype.query = () => {
  return Promise.resolve({ data: { pricing: { regCartPricing: mockRegCartPricing } } });
};

const eventId = '11111111-2222-3333-4444-555555555555';
const middleware = [thunk];
const mockStore = configureMockStore(middleware);

function getState() {
  return {
    clients: {
      regCartClient: new RegCartClient()
    },
    userSession: {
      eventId: 'dummyEventId',
      isPreview: false,
      defaultRegPathId: 'dummyRegPathId'
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          primaryEventRegId: {
            eventRegistrationId: 'primaryEventRegId',
            registrationTypeId: '001',
            registrationPathId: 'testRegPath',
            sessionRegistrations: {
              '831e0045-86d3-4133-89a8-4f26172b9d10': {}
            }
          },
          guestEventRegId: {
            eventRegistrationId: 'guestEventRegId',
            primaryRegistrationId: 'primaryEventRegId',
            registrationTypeId: '001',
            registrationPathId: 'testRegPath',
            attendeeType: 'GUEST',
            sessionRegistrations: {
              '831e0045-86d3-4133-89a8-4f26172b9d10': {}
            }
          }
        }
      },
      currentGuestEventRegistration: {
        eventRegistrationId: 'guestEventRegId'
      }
    },
    eventSnapshotVersion: EventSnapshot.eventSnapshot.version,
    account: EventSnapshot.accountSnapshot,
    appData: {
      registrationSettings: {
        registrationPaths: {
          testRegPath: {
            id: 'testRegPath',
            isDefault: true,
            guestRegistrationSettings: {
              isGuestRegistrationEnabled: true
            }
          }
        }
      }
    },
    event: {
      id: 'eventId'
    },
    regCartPricing: {
      isEditPrice: false,
      isEditRefund: false,
      netFeeAmountCharge: 400,
      netFeeAmountRefund: 0,
      productFeeAmountCharge: 400,
      productSubTotalAmountCharge: 400,
      productFeeAmountRefund: 0,
      productSubTotalAmountRefund: 0,
      regCartId: 'a81a9d4d-cfa8-4464-bf8f-7e51d94a3f13',
      plannerOverriddenProductFees: {},
      plannerOverriddenProductRefunds: {},
      eventRegistrationPricings: [
        {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productFeeAmountCharge: 400,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 400,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 400,
          netFeeAmountRefund: 0,
          regCartStatus: {},
          registrantLogin: {},
          routing: {},
          productPricings: [
            {
              productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
              productType: 'Session',
              pricingCharges: [
                {
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                  priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
                  productPriceTierBaseFeeAmountPerItem: 400,
                  productFeeAmountPerItem: 400,
                  productFeeAmount: 400,
                  productSubTotalAmount: 400,
                  netFeeAmount: 400
                }
              ],
              pricingRefunds: [],
              productFeeAmountCharge: 400,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 400,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 400,
              netFeeAmountRefund: 0
            },
            {
              productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
              productType: 'Session',
              pricingCharges: [
                {
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                  priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
                  productPriceTierBaseFeeAmountPerItem: 0,
                  productFeeAmountPerItem: 0,
                  productFeeAmount: 0,
                  productSubTotalAmount: 0,
                  netFeeAmount: 0
                }
              ],
              pricingRefunds: [],
              productFeeAmountCharge: 0,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 0,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 0,
              netFeeAmountRefund: 0
            },
            {
              productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
              productType: 'AdmissionItem',
              pricingCharges: [
                {
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                  priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
                  productPriceTierBaseFeeAmountPerItem: 0,
                  productFeeAmountPerItem: 0,
                  productFeeAmount: 0,
                  productSubTotalAmount: 0,
                  netFeeAmount: 0
                }
              ],
              pricingRefunds: [],
              productFeeAmountCharge: 0,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 0,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 0,
              netFeeAmountRefund: 0
            }
          ]
        }
      ]
    },
    website: {
      pages: {
        summary: { id: 'summary', name: 'summary' },
        postregpages: { id: 'postregpages', name: 'postregpages' },
        website_custom1: { id: 'custom1', name: 'Page1' },
        website_custom2: { id: 'custom2', name: 'Page2' }
      },
      pluginData: {
        eventWebsiteNavigation: {
          childIds: ['summary', 'postregpages', 'custom1', 'custom2']
        }
      }
    }
  };
}

const mergedState = Object.assign({}, getState(), { regCartPricing: mockRegCartPricing });

let store;
beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(getState());
});

describe('getRegCartPricingAction', () => {
  it('should return merged state with reg cart pricing', async () => {
    const apolloClient = new ApolloClient({
      link: createLink('base-url'),
      cache: apolloCache(store, {
        eventId
      }),
      typeDefs: {}
    });

    const response = await getRegCartPricingMergedState(store.getState(), apolloClient);
    expect(response).toMatchObject(mergedState);
  });
});
