import { setIn } from 'icepick';
import { optionalValidator } from '@cvent/nucleus-form-validations';
import { currencyValidatorWithZero, numberRangeValidator } from 'event-widgets/utils/validators';
import { find, size, some } from 'lodash';
import { makeVar, gql } from '@apollo/client';
import * as currentRegistrantSelectors from '../../redux/selectors/currentRegistrant';
import {
  getRegCartPricingInfo,
  getPlannerOverriddenPricingInfo,
  calculateServiceFeesForPartialPayments
} from '../../redux/registrationForm/regCart/pricing';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';
import { createSelector } from 'reselect';

/*
 * Note: method "PUT" is required for apollo-link-rest to add a body to the request.
 */
export const getRegCartPricingGQL = (method = 'PUT'): $TSFixMe => gql`
query CalculatePricing($regCartId: String!, $url: String!, $input: any, $paymentInfo: String!, $lastSavedRegCart: String!, $travelCart: String!) {
  pricing(regCartId: $regCartId, url: $url, input: $input, paymentInfo: $paymentInfo, lastSavedRegCart: $lastSavedRegCart, travelCart: $travelCart)
  @rest(type: "PricingPayload", path: "{args.url}", method: "${method}") {
    regCartPricing @type(name: "RegCartPricing") {
      regCartId
      productFeeAmountCharge
      productFeeAmountRefund
      productSubTotalAmountCharge
      productSubTotalAmountRefund
      netFeeAmountCharge
      netFeeAmountChargeWithPaymentAmountServiceFee
      netFeeAmountRefund
      paymentCreditsForEventReg
      inviteeTypeServiceFeePricingCharges
      paymentTypeServiceFeePricingCharges
      inviteeTypeServiceFeePricingRefunds
      paymentTypeServiceFeePricingRefunds
      taxPricingCharges
      taxPricingRefunds
      eventRegistrationPricings
    }
  }
}
`;

export const GET_REG_CART_PRICING_FROM_CACHE = gql`
  fragment PricingFragment on RegCartPricing {
    regCartId
    productFeeAmountCharge
    productFeeAmountRefund
    productSubTotalAmountCharge
    productSubTotalAmountRefund
    netFeeAmountCharge
    netFeeAmountChargeWithPaymentAmountServiceFee
    netFeeAmountRefund
    paymentCreditsForEventReg
    inviteeTypeServiceFeePricingCharges
    paymentTypeServiceFeePricingCharges
    inviteeTypeServiceFeePricingRefunds
    paymentTypeServiceFeePricingRefunds
    taxPricingCharges
    taxPricingRefunds
    eventRegistrationPricings
  }
`;

export const getIsTaxesEnabled = (state: $TSFixMe): $TSFixMe => state.event?.eventFeatureSetup?.fees?.taxes;
export const getIsServiceFeeEnabled = (state: $TSFixMe): $TSFixMe => state.event?.eventFeatureSetup?.fees?.serviceFees;

export const plannerOverriddenProductFeesVar = makeVar({});
export const plannerOverriddenProductRefundsVar = makeVar({});
export const plannerOverriddenProductFeesSavedVar = makeVar({});
export const plannerOverriddenProductRefundsSavedVar = makeVar({});
export const isEditPriceVar = makeVar(false);
export const isEditRefundVar = makeVar(false);
export const isInCheckoutVar = makeVar(false);

export const getCachedRegCartPricing = (regCartId: $TSFixMe, apolloClient: $TSFixMe): $TSFixMe => {
  const cachedPricing = apolloClient?.readFragment({
    fragment: GET_REG_CART_PRICING_FROM_CACHE,
    id: `RegCartPricing:{"regCartId":"${regCartId}"}`
  });
  return {
    ...cachedPricing,
    plannerOverriddenProductFees: plannerOverriddenProductFeesSavedVar(),
    plannerOverriddenProductRefunds: plannerOverriddenProductRefundsSavedVar()
  };
};

export const clearCachedPricing = (regCartId: $TSFixMe, apolloClient: $TSFixMe): $TSFixMe => {
  if (apolloClient?.cache?.evict && regCartId) {
    apolloClient.cache.evict({ id: `RegCartPricing:{"regCartId":"${regCartId}"}` });
  }
};

export const isOverrideProductFeesValid = (overriddenFees: $TSFixMe): $TSFixMe => {
  const eventRegFees: $TSFixMe[] = overriddenFees && Object.values(overriddenFees);
  if (eventRegFees) {
    return !eventRegFees.some(productFees => {
      const invalid = find(productFees, fee => {
        const validator = optionalValidator(currencyValidatorWithZero);
        return !validator(fee);
      });
      return invalid;
    });
  }
  return true;
};

function getProductPricingsRefund(eventRegistrationPricings, eventRegId) {
  if (eventRegistrationPricings) {
    const eventRegistrationPricing = eventRegistrationPricings.find(
      eventRegPricing => eventRegPricing.eventRegistrationId === eventRegId
    );
    if (eventRegistrationPricing?.productPricings) {
      return eventRegistrationPricing.productPricings.filter(
        product => product.pricingRefunds && product.pricingRefunds.length > 0
      );
    }
  }
  return [];
}

export const isOverrideProductRefundsValid = (overriddenRefunds: $TSFixMe, pricing: $TSFixMe): $TSFixMe => {
  const eventPricings = pricing?.eventRegistrationPricings;
  if (size(overriddenRefunds) > 0) {
    return !some(overriddenRefunds, (productRefunds, eventRegId) => {
      let invalid = some(productRefunds, fee => {
        const validator = optionalValidator(currencyValidatorWithZero);
        return !validator(fee);
      });
      if (invalid) return true;
      invalid = Object.keys(productRefunds).some(chargeOrderDetailId => {
        const productPricing = getProductPricingsRefund(eventPricings, eventRegId).find(price => {
          return price.pricingRefunds[0].chargeOrderDetailId === chargeOrderDetailId;
        });
        if (productPricing?.pricingRefunds) {
          const max = productPricing.pricingRefunds[0].originalAmountCharged;
          const validator = optionalValidator(numberRangeValidator(0, max));
          return !validator(productRefunds[chargeOrderDetailId]);
        }
      });
      return invalid;
    });
  }
  return true;
};

export function overrideProductFees(eventRegistrationId: $TSFixMe, productId: $TSFixMe, value: $TSFixMe): $TSFixMe {
  // eslint-disable-next-line no-prototype-builtins
  if (plannerOverriddenProductFeesVar()[eventRegistrationId].hasOwnProperty(productId)) {
    const newProductFees = setIn(plannerOverriddenProductFeesVar(), [eventRegistrationId, productId], value);
    plannerOverriddenProductFeesVar(newProductFees);
    // eslint-disable-next-line no-prototype-builtins
  } else if (plannerOverriddenProductRefundsVar()[eventRegistrationId].hasOwnProperty(productId)) {
    const newProductRefunds = setIn(plannerOverriddenProductRefundsVar(), [eventRegistrationId, productId], value);
    plannerOverriddenProductRefundsVar(newProductRefunds);
  }
}

export const regCartPaymentParams = createSelector(
  state => (state as $TSFixMe).registrationForm?.regCart?.eventRegistrations,
  state => (state as $TSFixMe).registrationForm?.regCartPayment,
  state => (state as $TSFixMe).defaultUserSession?.isPlanner,
  state => (state as $TSFixMe).event?.eventFeatureSetup?.fees?.fees,
  state => currentRegistrantSelectors.getEventRegistrationId(state),
  state => (state as $TSFixMe).event?.eventFeatureSetup?.fees && (state as $TSFixMe).event.eventFeatureSetup.fees.taxes,
  state => (state as $TSFixMe).registrationForm?.regCart?.ignoreTaxes,
  state => (state as $TSFixMe).registrationForm?.regCart?.ignoreServiceFee,
  state =>
    (state as $TSFixMe).event?.eventFeatureSetup?.fees && (state as $TSFixMe).event.eventFeatureSetup.fees.serviceFees,
  state => currentRegistrantSelectors.getModificationStartRegCart(state),
  state => (state as $TSFixMe).partialPaymentSettings,
  (
    eventRegistrations,
    regCartPayment,
    isPlanner,
    feesEnabled,
    currentEventRegistrationId,
    taxesEnabled,
    ignoreTaxes,
    ignoreServiceFee,
    serviceFeeEnabled,
    modificationStartRegCart,
    partialPaymentSettings
  ) => {
    return {
      regCart: { eventRegistrations },
      regCartPayment,
      isPlanner,
      feesEnabled,
      currentEventRegistrationId,
      taxesEnabled,
      ignoreTaxes,
      ignoreServiceFee,
      serviceFeeEnabled,
      modificationStartRegCart,
      partialPaymentSettings
    };
  }
);

export const getRegCartPaymentInfo = (
  paymentParams: $TSFixMe,
  getRegCartPricing: $TSFixMe,
  overriddenProductFees: $TSFixMe,
  overriddenProductRefunds: $TSFixMe,
  calculatePartialPayment = false
): $TSFixMe => {
  const {
    regCart,
    regCartPayment,
    isPlanner,
    feesEnabled,
    currentEventRegistrationId,
    taxesEnabled,
    ignoreTaxes,
    ignoreServiceFee,
    serviceFeeEnabled,
    modificationStartRegCart,
    partialPaymentSettings
  } = paymentParams;
  const regCartPricing = {
    ...getRegCartPricing(),
    plannerOverriddenProductFees: overriddenProductFees,
    plannerOverriddenProductRefunds: overriddenProductRefunds
  };
  const isOverrideFeesValid = isOverrideProductFeesValid(overriddenProductFees);
  const isOverrideRefundsValid = isOverrideProductRefundsValid(overriddenProductRefunds, regCartPricing);

  let pricingInfo = getRegCartPricingInfo(
    regCartPayment,
    feesEnabled,
    isPlanner,
    taxesEnabled,
    ignoreTaxes,
    ignoreServiceFee,
    serviceFeeEnabled,
    regCartPricing
  );
  if (isPlanner && feesEnabled) {
    /*
     * during a planner mod if they remove a guest get the ModifcationStartCart so we can
     * save changes if they make any edits in the refund
     */
    const correctRegCart = modificationStartRegCart || regCart;
    pricingInfo = getPlannerOverriddenPricingInfo(
      pricingInfo,
      regCartPayment,
      regCartPricing,
      currentEventRegistrationId,
      isOverrideFeesValid,
      isOverrideRefundsValid,
      correctRegCart
    );
  }

  if (
    calculatePartialPayment &&
    partialPaymentSettings?.paymentAmountOption?.value === PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT.value
  ) {
    pricingInfo = calculateServiceFeesForPartialPayments(
      pricingInfo,
      partialPaymentSettings,
      regCartPricing,
      regCartPayment
    );
  }

  return pricingInfo;
};
