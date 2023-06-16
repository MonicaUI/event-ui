import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import Logger from '@cvent/nucleus-logging';
import { isEmpty } from 'lodash';
import { isOverrideProductFeesValid, isOverrideProductRefundsValid } from '../../regCartPricing';
import { getGuestsOfRegistrant } from './selectors';
import * as currentRegistrantSelectors from '../../selectors/currentRegistrant';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';

const LOG = new Logger('redux/registrationForm/regCart/pricing');

/**
 * Gets the pricing info needed by the registration service from the user's payment information.
 */
// eslint-disable-next-line complexity
export function getRegCartPricingInfo(
  regCartPayment: $TSFixMe,
  feesEnabled: $TSFixMe,
  isPlanner = false,
  taxesEnabled?: $TSFixMe,
  ignoreTaxes = false,
  ignoreServiceFee = false,
  serviceFeeEnabled?: $TSFixMe,
  regCartPricing = null
): $TSFixMe {
  const { selectedPaymentMethod } = regCartPayment || {};
  let pricingInfo;
  const paymentCreditsApplied =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    regCartPricing &&
    regCartPricing.paymentCreditsForEventReg &&
    Object.keys(regCartPricing.paymentCreditsForEventReg).length > 0;
  const selectedPaymentDetails = (regCartPayment?.pricingInfo &&
    selectedPaymentMethod &&
    getJSONValue(regCartPayment?.pricingInfo, selectedPaymentMethod)) || { paymentType: PAYMENT_TYPE.OFFLINE };
  if (feesEnabled && selectedPaymentMethod === 'creditCard') {
    const { paymentMethodType, paymentType, ...paymentDetail } = selectedPaymentDetails;
    // We store contextId as a property of credit card, on backend it's in pricingInfo
    if (selectedPaymentDetails.contextId) {
      pricingInfo = {
        paymentMethodType,
        paymentType,
        paymentDetail: {
          contextId: selectedPaymentDetails.contextId
          // When context id is provided, no card is required
        }
      };
    } else {
      pricingInfo = {
        paymentMethodType,
        paymentType,
        paymentDetail: {
          [selectedPaymentMethod]: paymentDetail
        }
      };
    }
  } else {
    pricingInfo = selectedPaymentDetails;
  }
  // either payment method will be selected or credits will be surplus
  if (
    isPlanner &&
    feesEnabled &&
    (selectedPaymentMethod || paymentCreditsApplied) &&
    pricingInfo.paymentType === PAYMENT_TYPE.OFFLINE
  ) {
    pricingInfo = {
      ...pricingInfo,
      date: new Date()
    };
  }
  // Add 'ignoreTaxes' to pricingInfo for planner-reg add/remove taxes price re-calculation
  if (isPlanner && taxesEnabled) {
    pricingInfo = {
      ...pricingInfo,
      ignoreTaxes
    };
  }

  // Add 'ignoreServiceFees' to pricingInfo for planner-reg add/remove serviceFee price re-calculation
  if (isPlanner && serviceFeeEnabled) {
    pricingInfo = {
      ...pricingInfo,
      ignoreServiceFee
    };
  }
  return pricingInfo;
}

export function getPlannerOverriddenPricingInfo(
  pricingInfo: $TSFixMe,
  regCartPayment: $TSFixMe,
  regCartPricing = null,
  currentEventRegistrationId: $TSFixMe,
  isOverrideFeesValid: $TSFixMe,
  isOverrideRefundsValid: $TSFixMe,
  regCart: $TSFixMe
): $TSFixMe {
  const plannerPricingOverride = {
    ...pricingInfo
  };
  if (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    regCartPricing &&
    regCartPricing.plannerOverriddenProductFees != null &&
    !isEmpty(regCartPricing.plannerOverriddenProductFees) &&
    isOverrideFeesValid
  ) {
    plannerPricingOverride.plannerOverriddenProductFees = {
      ...regCartPricing.plannerOverriddenProductFees
    };
  }
  if (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    regCartPricing &&
    regCartPricing.plannerOverriddenProductRefunds != null &&
    !isEmpty(regCartPricing.plannerOverriddenProductRefunds) &&
    isOverrideRefundsValid
  ) {
    if (!plannerPricingOverride.plannerOverriddenProductFees) {
      plannerPricingOverride.plannerOverriddenProductFees = {};
    }
    plannerPricingOverride.plannerOverriddenProductFees[currentEventRegistrationId] = {
      ...plannerPricingOverride.plannerOverriddenProductFees[currentEventRegistrationId],
      ...regCartPricing.plannerOverriddenProductRefunds[currentEventRegistrationId]
    };
    // return all guests in the cart no matter registration status
    const guests = getGuestsOfRegistrant(regCart, currentEventRegistrationId, null);
    guests.forEach(guest => {
      plannerPricingOverride.plannerOverriddenProductFees[guest.eventRegistrationId] = {
        ...plannerPricingOverride.plannerOverriddenProductFees[guest.eventRegistrationId],
        ...regCartPricing.plannerOverriddenProductRefunds[guest.eventRegistrationId]
      };
    });
  }
  return plannerPricingOverride;
}

export function calculateServiceFeesForPartialPayments(
  pricingInfo: $TSFixMe,
  partialPaymentSettings: $TSFixMe,
  regCartPricing: $TSFixMe,
  regCartPayment: $TSFixMe
): $TSFixMe {
  // paymentAmountBeforeServiceFees is the netFeeAmountCharge (price without service fees)
  let paymentAmountBeforeServiceFees;
  // paymentAmount is netFeeAmountChargeWithPaymentAmountServiceFee which is the final amount to be charged
  let paymentAmount = regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee;
  // if partial payment amount is present in text box (i.e state), it should always be passed
  if (
    partialPaymentSettings?.paymentAmount &&
    partialPaymentSettings?.paymentAmountOption?.value === PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT.value
  ) {
    paymentAmountBeforeServiceFees = partialPaymentSettings.paymentAmount;
  } else if (regCartPayment.selectedPaymentMethod === 'noPayment') {
    paymentAmount = 0;
  }
  const pricingInfoWithServiceFee = {
    ...pricingInfo,
    paymentAmount,
    paymentAmountBeforeServiceFees
  };
  return pricingInfoWithServiceFee;
}

export function getFinalPricingInfo(state: $TSFixMe): $TSFixMe {
  const {
    event,
    registrationForm: { regCartPayment, regCart },
    defaultUserSession: { isPlanner },
    regCartPricing
  } = state;

  const feesEnabled = event.eventFeatureSetup.fees.fees;
  const ignoreTaxes = regCart.ignoreTaxes;
  const ignoreServiceFee = regCart.ignoreServiceFee;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const taxesEnabled = event.eventFeatureSetup.fees && event.eventFeatureSetup.fees.taxes;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const serviceFeeEnabled = event.eventFeatureSetup.fees && event.eventFeatureSetup.fees.serviceFees;
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
    const currentEventRegistrationId = currentRegistrantSelectors.getEventRegistrationId(state);
    const isOverrideFeesValid = isOverrideProductFeesValid(state);
    const isOverrideRefundsValid = isOverrideProductRefundsValid(state);
    /*
     * during a planner mod if they remove a guest get the ModifcationStartCart so we can
     * save changes if they make any edits in the refund
     */
    const correctRegCart = currentRegistrantSelectors.getModificationStartRegCart(state) || regCart;
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

  LOG.debug('calculatePricing', pricingInfo);
  return pricingInfo;
}

/**
 * Format year and month in the format YYYY-MM
 */
function formatExpirationDate(expirationYear, expirationMonth) {
  const zeros = '0000';
  const year = expirationYear.toString();
  const month = expirationMonth.toString();
  return `${zeros.slice(0, 4 - year.length)}${year}-${zeros.slice(0, 2 - month.length)}${month}`;
}

export function getRegCartPricingInfoForCheckout(pricingInfo: $TSFixMe, accessToken?: $TSFixMe): $TSFixMe {
  const { paymentMethodType, paymentDetail } = pricingInfo;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  let creditCard = (paymentDetail && paymentDetail.creditCard) || {};
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const token = accessToken && accessToken.split(' ');
  const { expirationMonth, expirationYear } = creditCard;
  // Don't send credit card object if there's a context ID, because cid can be used to retrieve cc info on the backend
  if (paymentDetail && !paymentDetail.contextId) {
    creditCard = {
      ...creditCard,
      // Format date for payment service YYYY-MM
      expirationDate: formatExpirationDate(expirationYear, expirationMonth),
      type: paymentMethodType
    };
  } else {
    creditCard = null;
  }
  switch (pricingInfo.paymentType) {
    case PAYMENT_TYPE.ONLINE: {
      return {
        ...pricingInfo,
        paymentDetail: {
          ...paymentDetail,
          creditCard,
          paymentMethodMode: 'UseNewPaymentMethod',
          browserLandingURL: window.location.href.replace(/(^\w+:|^)\/\//, ''),
          // Webpayments indexes card tokens by context ID + client access token, so we need to send the latter here
          ...(paymentDetail?.contextId && { coreBearerToken: token[1] })
        }
      };
    }
    case PAYMENT_TYPE.OFFLINE: {
      if (creditCard || paymentDetail?.contextId) {
        return {
          ...pricingInfo,
          paymentDetail: {
            ...paymentDetail,
            creditCard,
            paymentMethodMode: 'UseNewPaymentMethod',
            browserLandingURL: window.location.href.replace(/(^\w+:|^)\/\//, ''),
            coreBearerToken: token[1]
          }
        };
      }
      return {
        ...pricingInfo,
        paymentDetail: {}
      };
    }
    default: {
      return pricingInfo;
    }
  }
}
