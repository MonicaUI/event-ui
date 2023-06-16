import { ApolloClient } from '@apollo/client';
import {
  getCachedRegCartPricing,
  getRegCartPaymentInfo,
  getRegCartPricingGQL,
  regCartPaymentParams,
  plannerOverriddenProductFeesSavedVar,
  plannerOverriddenProductRefundsSavedVar
} from './regCartPricing';
import {
  lastSavedRegCartForQuery,
  getShouldFetchPricing,
  getTravelCartForQuery,
  getPaymentInfoForQuery
} from './useCachedRegCartPricing';

export async function getRegCartPricingMergedState(
  state: $TSFixMe,
  // @ts-expect-error ts-migrate(2314) FIXME: Generic type 'ApolloClient<TCacheShape>' requires ... Remove this comment to see the full error message
  apolloClient: ApolloClient,
  calculatePartialPayment = false
): Promise<$TSFixMe> {
  const {
    accessToken,
    clients: { regCartClient },
    registrationForm: { regCart }
  } = state;
  const overriddenProductFees = plannerOverriddenProductFeesSavedVar();
  const overriddenProductRefunds = plannerOverriddenProductRefundsSavedVar();

  const lastSavedRegCart = lastSavedRegCartForQuery(state);
  const travelCart = getTravelCartForQuery(state);
  const paymentParams = regCartPaymentParams(state);
  const regCartPricing = getCachedRegCartPricing(regCart.regCartId, apolloClient);

  const paymentInfo = getRegCartPaymentInfo(
    paymentParams,
    () => regCartPricing,
    overriddenProductFees,
    overriddenProductRefunds,
    calculatePartialPayment
  );
  const shouldCalculatePricing = getShouldFetchPricing(state);
  const request = shouldCalculatePricing
    ? regCartClient?.buildRequestForRegCartPricing(accessToken, regCart.regCartId, paymentInfo)
    : regCartClient?.buildRequestForGetRegCartPricing(accessToken, regCart.regCartId);
  const paymentInfoVar = getPaymentInfoForQuery(overriddenProductFees, overriddenProductRefunds);

  const query = await apolloClient.query({
    query: getRegCartPricingGQL(shouldCalculatePricing ? 'PUT' : 'GET'),
    variables: {
      regCartId: regCart.regCartId,
      paymentInfo: paymentInfoVar,
      lastSavedRegCart,
      travelCart
    },
    context: {
      request,
      fetchWithSessionTimeout: true
    },
    fetchPolicy: calculatePartialPayment ? 'network-only' : 'cache-first'
  });

  let mergedState = state;
  if (query?.data?.pricing?.regCartPricing) {
    mergedState = {
      ...state,
      regCartPricing: {
        ...state.regCartPricing,
        ...query.data.pricing.regCartPricing,
        plannerOverriddenProductFees: plannerOverriddenProductFeesSavedVar(),
        plannerOverriddenProductRefunds: plannerOverriddenProductRefundsSavedVar()
      }
    };
  }
  return mergedState;
}

export default getRegCartPricingMergedState;
