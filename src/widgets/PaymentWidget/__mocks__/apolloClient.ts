import { MOCK_GET_REG_CART_PRICING } from './useCachedRegCartPricing';

export const mockApolloClient = (readFragmentData = {}): $TSFixMe => {
  return {
    cache: {
      evict: jest.fn(),
      gc: jest.fn()
    },
    readFragment: jest.fn(() => readFragmentData),
    query: jest.fn()
  };
};

export const getApolloClientMocks = (state = {}): $TSFixMe => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'registrationForm' does not exist on type... Remove this comment to see the full error message
  const { registrationForm: { regCart: { regCartId = '' } = {} } = {}, regCartPricing } = state;
  return [
    {
      request: {
        query: MOCK_GET_REG_CART_PRICING,
        /*
         * The variables must match exactly with those passed in by the components being tested
         * in order for the mock Apollo Client to return the result below.
         */
        variables: {
          regCartId,
          paymentInfo: JSON.stringify({ overriddenProductFees: {}, overriddenProductRefunds: {} }),
          lastSavedRegCart: JSON.stringify({ paymentInfo: null, lastSavedPageId: null }),
          travelCart: JSON.stringify({})
        }
      },
      result: {
        data: {
          pricing: {
            regCartPricing
          }
        }
      }
    }
  ];
};
