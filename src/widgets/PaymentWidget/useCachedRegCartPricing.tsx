import { useCallback, useMemo } from 'react';
import { useStore, useSelector } from 'react-redux';
import { useQuery, QueryResult, useApolloClient, useReactiveVar } from '@apollo/client';
import {
  getCachedRegCartPricing,
  getRegCartPaymentInfo,
  getRegCartPricingGQL,
  regCartPaymentParams,
  plannerOverriddenProductFeesSavedVar,
  plannerOverriddenProductRefundsSavedVar,
  isInCheckoutVar
} from './regCartPricing';
import {
  CHECKED_OUT,
  DECLINED_REGISTRATION,
  FINALIZED_CANCEL_REGISTRATION,
  NOT_REGISTERING
} from '../../redux/registrationIntents';
import { createSelector } from 'reselect';

export const lastSavedRegCartForQuery = createSelector(
  state => (state as $TSFixMe).regCartStatus?.lastSavedRegCart,
  (lastSavedRegCart = {}) => {
    return JSON.stringify({
      ...lastSavedRegCart,
      paymentInfo: null,
      lastSavedPageId: null
    });
  }
);

export const getTravelCartForQuery = createSelector(
  state => (state as $TSFixMe).travelCart?.cart,
  (travelCart = {}) => {
    return JSON.stringify(travelCart);
  }
);

export const getPaymentInfoForQuery = (
  overriddenProductFees: $TSFixMe,
  overriddenProductRefunds: $TSFixMe
): $TSFixMe => {
  return JSON.stringify({
    overriddenProductFees,
    overriddenProductRefunds
  });
};

export const getShouldFetchPricing = createSelector(
  state => (state as $TSFixMe).regCartStatus?.registrationIntent,
  state => (state as $TSFixMe).registrationForm?.regCart?.status,
  (registrationIntent, regCartStatus) => {
    const registeringIntents = [NOT_REGISTERING, CHECKED_OUT];
    return !registeringIntents.includes(registrationIntent) && regCartStatus !== 'COMPLETED';
  }
);

export const getDeclinedOrCancelled = createSelector(
  state => (state as $TSFixMe).regCartStatus?.registrationIntent,
  registrationIntent => {
    const registeringIntents = [FINALIZED_CANCEL_REGISTRATION, DECLINED_REGISTRATION];
    return registeringIntents.includes(registrationIntent);
  }
);

export function useCachedRegCartPricing(): [QueryResult<$TSFixMe, $TSFixMe>, $TSFixMe] {
  const store = useStore();
  const state = store.getState();
  const apolloClient = useApolloClient();

  const {
    accessToken,
    clients: { regCartClient }
  } = state;

  const regCartId = useSelector(s => (s as $TSFixMe).registrationForm.regCart.regCartId);
  const shouldCalculatePricing = useSelector(getShouldFetchPricing);
  const declinedOrCancelled = useSelector(getDeclinedOrCancelled);
  const lastSavedRegCart = useSelector(lastSavedRegCartForQuery);
  const travelCart = useSelector(getTravelCartForQuery);
  const paymentParams = useSelector(regCartPaymentParams);
  const isInCheckout = useReactiveVar(isInCheckoutVar);

  const overriddenProductFees = useReactiveVar(plannerOverriddenProductFeesSavedVar);
  const overriddenProductRefunds = useReactiveVar(plannerOverriddenProductRefundsSavedVar);

  const getRegCartPricing = useCallback(
    () => getCachedRegCartPricing(regCartId, apolloClient),
    [apolloClient, regCartId]
  );

  const paymentInfo = useMemo(
    () => getRegCartPaymentInfo(paymentParams, getRegCartPricing, overriddenProductFees, overriddenProductRefunds),
    [getRegCartPricing, overriddenProductFees, overriddenProductRefunds, paymentParams]
  );

  const request = useMemo(() => {
    return shouldCalculatePricing
      ? regCartClient.buildRequestForRegCartPricing(accessToken, regCartId, paymentInfo)
      : regCartClient.buildRequestForGetRegCartPricing(accessToken, regCartId);
  }, [accessToken, paymentInfo, regCartClient, regCartId, shouldCalculatePricing]);

  const paymentInfoVar = getPaymentInfoForQuery(overriddenProductFees, overriddenProductRefunds);

  const query = useQuery(getRegCartPricingGQL(shouldCalculatePricing ? 'PUT' : 'GET'), {
    variables: {
      regCartId,
      paymentInfo: paymentInfoVar,
      lastSavedRegCart,
      travelCart
    },
    context: {
      request,
      fetchWithSessionTimeout: true
    },
    fetchPolicy: !isInCheckout && !declinedOrCancelled && regCartId ? 'cache-first' : 'standby'
  });

  // @ts-expect-error ts-migrate(2322) FIXME: Type 'QueryResult<any, { regCartId: any; paymentIn... Remove this comment to see the full error message
  return query;
}

export default useCachedRegCartPricing;
