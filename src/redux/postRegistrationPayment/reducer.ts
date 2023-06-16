import {
  RESET_SUBMIT_WEB_PAYMENT,
  SUBMIT_WEB_PAYMENT,
  STORE_WEBPAYMENT_DATA,
  FINALIZE_POSTREG_CHECKOUT_PENDING,
  FINALIZE_POSTREG_CHECKOUT_COMPLETE
} from './actionTypes';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { addQueryParams } from '../../utils/queryUtils';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';

export default function reducer(state = '', action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case SUBMIT_WEB_PAYMENT: {
      return {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        ...state,
        submitWebPayment: true
      };
    }
    case RESET_SUBMIT_WEB_PAYMENT:
      return {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        ...state,
        submitWebPayment: false
      };
    case STORE_WEBPAYMENT_DATA:
      return {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        ...state,
        webPaymentData: action.payload.webPaymentData
      };
    case FINALIZE_POSTREG_CHECKOUT_PENDING:
      return {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        ...state,
        isCheckingOut: true
      };
    case FINALIZE_POSTREG_CHECKOUT_COMPLETE:
      return {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        ...state,
        isCheckingOut: false
      };
    default:
      return {
        // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
        ...state,
        submitWebPayment: false
      };
  }
}

function getPaymentDistributions(orders) {
  const paymentDistribution = new Map();
  orders.forEach(order => {
    if (order.orderType === 'OfflineCharge') {
      order.orderItems.forEach(item => {
        if (item.amountDue > 0) {
          if (paymentDistribution.get(order.attendeeId)) {
            paymentDistribution.get(order.attendeeId).orders.push({
              orderId: order.orderId,
              orderDetailId: item.itemId,
              amountIntended: item.amountDue
            });
          } else {
            paymentDistribution.set(order.attendeeId, {
              attendeeId: order.attendeeId,
              orders: [
                {
                  orderId: order.orderId,
                  orderDetailId: item.itemId,
                  amountIntended: item.amountDue
                }
              ]
            });
          }
        }
      });
    }
  });
  return Array.from(paymentDistribution.values());
}

export function getTotals(orders: $TSFixMe): $TSFixMe {
  let subtotal = 0;
  let total = 0;
  if (orders) {
    orders.forEach(order => {
      if (order.orderType === 'OfflineCharge') {
        order.orderItems.forEach(item => {
          total = +(total + item.amountDue).toFixed(12);
          if (
            item.productType !== 'Tax' &&
            item.productType !== 'RegistrationTypeServiceFee' &&
            item.productType !== 'PaymentTypeServiceFee'
          ) {
            subtotal = +(subtotal + item.amountDue).toFixed(12);
          }
        });
      }
    });
  }
  return { subtotal, total };
}

export function getPostRegPaymentPricingInfo(
  orders: $TSFixMe,
  webPaymentData: $TSFixMe,
  accessToken: $TSFixMe,
  partialPaymentSetting?: $TSFixMe
): $TSFixMe {
  const token = accessToken.split(' ');
  const totalAmount =
    partialPaymentSetting?.paymentAmountOption === PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT
      ? partialPaymentSetting.paymentAmount
      : getTotals(orders).total;
  return {
    postRegPaymentData: {
      totalAmount,
      cardType: webPaymentData.cardType,
      paymentDistribution: getPaymentDistributions(orders)
    },
    continueCheckout: true,
    checkoutInfo: {
      paymentMethodType: webPaymentData.cardType,
      paymentType: PAYMENT_TYPE.ONLINE,
      paymentAmount: totalAmount,
      paymentDetail: {
        amount: totalAmount,
        paymentMethodMode: 'UseNewPaymentMethod',
        browserLandingURL: addQueryParams(window.location.href, { fromRedirect: 'true' }).replace(/(^\w+:|^)\/\//, ''),
        contextId: webPaymentData.contextId,
        coreBearerToken: token[1]
      }
    }
  };
}

/**
 * This method is called only for Service Fees with Post Reg Payments
 * to pass checkout info object when startRegCartCheckout is called for
 * continuing checkout
 */
export function getCheckoutInfoForPostServiceFees(
  webPaymentData: $TSFixMe,
  regCartPricing: $TSFixMe,
  accessToken: $TSFixMe
): $TSFixMe {
  const token = accessToken.split(' ');
  const totalAmount = regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee;
  return {
    paymentMethodType: webPaymentData.cardType,
    paymentType: PAYMENT_TYPE.ONLINE,
    paymentAmount: totalAmount,
    paymentDetail: {
      amount: totalAmount,
      paymentMethodMode: 'UseNewPaymentMethod',
      browserLandingURL: addQueryParams(window.location.href, { fromRedirect: 'true' }).replace(/(^\w+:|^)\/\//, ''),
      contextId: webPaymentData.contextId,
      coreBearerToken: token[1]
    }
  };
}
