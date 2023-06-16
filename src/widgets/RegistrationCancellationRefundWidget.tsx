import React from 'react';
import { connect } from 'react-redux';
import { useReactiveVar } from '@apollo/client';
import OrderRefundWidget from 'event-widgets/lib/OrderRefund/OrderRefundWidget';
import { merge } from 'lodash';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { delayedScrollToFirstWidgetError } from '../utils/formUtils';
import {
  getPaymentInfo,
  getInitialOverrideProductFees,
  getTaxesInfo,
  getInitialOverrideProductRefunds,
  getServiceFeeInfo
} from '../redux/selectors/payment';
import getRegCartPricingMergedState from './PaymentWidget/getRegCartPricingAction';
import useCachedRegCartPricing from './PaymentWidget/useCachedRegCartPricing';
import {
  isEditRefundVar,
  plannerOverriddenProductFeesVar,
  plannerOverriddenProductRefundsVar,
  overrideProductFees as overrideProductFeesCached,
  isOverrideProductRefundsValid as isOverrideProductRefundsValidCached,
  plannerOverriddenProductRefundsSavedVar
} from './PaymentWidget/regCartPricing';

function onPriceEditChange(field, value, currentEventRegId) {
  return () => {
    overrideProductFeesCached(currentEventRegId, field, value);
  };
}

function onOverridePricesEdit() {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    let state = getState();
    state = await getRegCartPricingMergedState(getState(), apolloClient);

    const eventRegistrationProductFees = merge(getInitialOverrideProductFees(state), plannerOverriddenProductFeesVar());
    const eventRegistrationProductRefunds = merge(
      getInitialOverrideProductRefunds(state),
      plannerOverriddenProductRefundsVar()
    );

    plannerOverriddenProductFeesVar(eventRegistrationProductFees);
    plannerOverriddenProductRefundsVar(eventRegistrationProductRefunds);
  };
}

function onOverridePricesSave() {
  return async () => {
    plannerOverriddenProductRefundsSavedVar(plannerOverriddenProductRefundsVar());
  };
}

function onEditRefundsToggle() {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    const state = await getRegCartPricingMergedState(getState(), apolloClient);
    if (isEditRefundVar()) {
      const { regCartPricing } = state;
      const overriddenProductRefunds = plannerOverriddenProductRefundsVar();
      if (isOverrideProductRefundsValidCached(overriddenProductRefunds, regCartPricing)) {
        dispatch(onOverridePricesSave());
        isEditRefundVar(false);
      } else {
        delayedScrollToFirstWidgetError('refundOrderSummary');
      }
    } else {
      dispatch(onOverridePricesEdit());
      isEditRefundVar(true);
    }
  };
}

/**
 * Data wrapper for the payment widget.
 */
const RegistrationCancellationRefundWidgetWrapper = withMappedWidgetConfig(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const { event } = state;
      const { regCartPricing, isEditRefund, overriddenProductRefunds } = props;
      return {
        refund: getPaymentInfo(state, regCartPricing).refund,
        lockDisplayPanel: false,
        canOverridePrices: state.defaultUserSession.isPlanner,
        isEditRefund,
        overrideProductRefunds: overriddenProductRefunds,
        translateCurrency: state.text.resolver.currency,
        taxRefundsInfo: getTaxesInfo(regCartPricing, event, 'taxPricingRefunds'),
        serviceFeeRefundsInfo: getServiceFeeInfo(regCartPricing, event, true)
      };
    },
    {
      onEditRefundsToggle,
      onPriceEditChange
    }
  )(OrderRefundWidget)
);

export default function RegistrationCancellationRefundWidgetCacheWrapper(props: $TSFixMe): $TSFixMe {
  const query = useCachedRegCartPricing();
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '[QueryResu... Remove this comment to see the full error message
  const { data, previousData } = query;
  const regCartPricing = data?.pricing?.regCartPricing || previousData?.pricing?.regCartPricing;
  const isEditRefund = useReactiveVar(isEditRefundVar);
  const overriddenProductRefunds = useReactiveVar(plannerOverriddenProductRefundsVar);

  return (
    <RegistrationCancellationRefundWidgetWrapper
      {...props}
      regCartPricing={regCartPricing}
      isEditRefund={isEditRefund}
      overriddenProductRefunds={overriddenProductRefunds}
    />
  );
}
