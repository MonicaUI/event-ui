import { getTotals, getPostRegPaymentPricingInfo } from '../reducer';
import { FINALIZE_POSTREG_CHECKOUT_PENDING, FINALIZE_POSTREG_CHECKOUT_COMPLETE } from '../actionTypes';
import reducer from '../reducer';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { addQueryParams } from '../../../utils/queryUtils';
import { PAYMENT_AMOUNT_OPTION } from 'event-widgets/utils/paymentConstant';

const orders = [
  {
    orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
    attendeeId: 'fbe827fd-9cc7-4a6f-a3d9-26ab948f4020',
    groupMemberTitle: 'Member',
    submittedOn: '2020-01-02T13:23:56.000Z',
    orderType: 'OfflineCharge',
    orderItems: [
      {
        itemId: '7baadcd6-fbbe-4c82-ab14-af73615fb516',
        registrantId: '352184f5-9e34-467e-88e5-1c9e9a33bdbf',
        firstName: 'express',
        lastName: 'ticketing',
        productType: 'AdmissionItem',
        itemPrice: 10.0,
        itemName: 'A1',
        quantity: 1,
        amount: 10.0,
        amountPaid: 0.0,
        amountDue: 10.0
      },
      {
        itemId: '8baadcd6-fbbe-4c82-ab14-af73615fb516',
        registrantId: '352184f5-9e34-467e-88e5-1c9e9a33bdbf',
        firstName: 'express',
        lastName: 'ticketing',
        productType: 'AdmissionItem',
        itemPrice: 10.0,
        itemName: 'A1',
        quantity: 1,
        amount: 15.0,
        amountPaid: 0.0,
        amountDue: 12.0
      },
      {
        itemId: '9baadcd6-fbbe-4c82-ab14-af73615fb516',
        registrantId: '352184f5-9e34-467e-88e5-1c9e9a33bdbf',
        firstName: 'express',
        lastName: 'ticketing',
        productType: 'Tax',
        itemPrice: 10.0,
        itemName: 'A1',
        quantity: 1,
        amount: 12,
        amountPaid: 0.0,
        amountDue: 2
      }
    ]
  }
];

describe('getTotals method', () => {
  test('tests getting total and subtotal of orders', () => {
    expect(getTotals(orders)).toEqual({ total: 24, subtotal: 22 });
  });
});

describe('getTotals method 1', () => {
  test('tests getting total and subtotal of orders', () => {
    const webPaymentData = {
      contextId: 'id',
      cardType: 'visa'
    };
    const paymentDistribution = [
      {
        attendeeId: 'fbe827fd-9cc7-4a6f-a3d9-26ab948f4020',
        orders: [
          {
            orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
            orderDetailId: '7baadcd6-fbbe-4c82-ab14-af73615fb516',
            amountIntended: 10
          },
          {
            orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
            orderDetailId: '8baadcd6-fbbe-4c82-ab14-af73615fb516',
            amountIntended: 12
          },
          {
            orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
            orderDetailId: '9baadcd6-fbbe-4c82-ab14-af73615fb516',
            amountIntended: 2
          }
        ]
      }
    ];

    expect(getPostRegPaymentPricingInfo(orders, webPaymentData, 'BEARER 123')).toEqual({
      postRegPaymentData: {
        totalAmount: 24,
        cardType: webPaymentData.cardType,
        paymentDistribution
      },
      continueCheckout: true,
      checkoutInfo: {
        paymentMethodType: webPaymentData.cardType,
        paymentType: PAYMENT_TYPE.ONLINE,
        paymentAmount: 24,
        paymentDetail: {
          amount: 24,
          paymentMethodMode: 'UseNewPaymentMethod',
          browserLandingURL: addQueryParams(window.location.href, { fromRedirect: 'true' }).replace(
            /(^\w+:|^)\/\//,
            ''
          ),
          contextId: webPaymentData.contextId,
          coreBearerToken: '123'
        }
      }
    });
  });
});

describe('getpostRegPricing partial payment', () => {
  test('tests getting total with partial payment', () => {
    const webPaymentData = {
      contextId: 'id',
      cardType: 'visa'
    };
    const paymentDistribution = [
      {
        attendeeId: 'fbe827fd-9cc7-4a6f-a3d9-26ab948f4020',
        orders: [
          {
            orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
            orderDetailId: '7baadcd6-fbbe-4c82-ab14-af73615fb516',
            amountIntended: 10
          },
          {
            orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
            orderDetailId: '8baadcd6-fbbe-4c82-ab14-af73615fb516',
            amountIntended: 12
          },
          {
            orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
            orderDetailId: '9baadcd6-fbbe-4c82-ab14-af73615fb516',
            amountIntended: 2
          }
        ]
      }
    ];

    const partialPaymentSetting = {
      paymentAmountOption: PAYMENT_AMOUNT_OPTION.PARTIAL_PAYMENT,
      paymentAmount: 20
    };

    expect(getPostRegPaymentPricingInfo(orders, webPaymentData, 'BEARER 123', partialPaymentSetting)).toEqual({
      postRegPaymentData: {
        totalAmount: 20,
        cardType: webPaymentData.cardType,
        paymentDistribution
      },
      continueCheckout: true,
      checkoutInfo: {
        paymentMethodType: webPaymentData.cardType,
        paymentType: 'Online',
        paymentAmount: 20,
        paymentDetail: {
          amount: 20,
          paymentMethodMode: 'UseNewPaymentMethod',
          browserLandingURL: 'web-fake.cvent.com/?fromRedirect=true',
          contextId: webPaymentData.contextId,
          coreBearerToken: '123'
        }
      }
    });
  });
});

test('submission locks during checkout', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
  let state = reducer({}, { type: FINALIZE_POSTREG_CHECKOUT_PENDING });
  expect(state.isCheckingOut).toBeTruthy();
  state = reducer(state, { type: FINALIZE_POSTREG_CHECKOUT_COMPLETE });
  expect(state.isCheckingOut).toBeFalsy();
});
