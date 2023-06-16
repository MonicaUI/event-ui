import { CREDIT_CARD_FOR_LATER_PROCESSING_WEBPAYMENTS_FORM_VARIANT } from '@cvent/event-ui-experiments';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { setIn } from 'icepick';
import {
  getTaxesInfo,
  getServiceFeeInfo,
  getPaymentInfo,
  isPaymentTypeServiceFeeEnabled,
  shouldUseWebpaymentsForm
} from '../payment';
import { allSessionBundlesVar as sessionBundles } from 'event-widgets/lib/Sessions/useVisibleSessionBundles';
import { ProductType } from 'event-widgets/utils/ProductType';

const setCreditCardPaymentField = (inState, field, val) =>
  setIn(inState, ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', field], val);

const regCartPricing = {
  regCartId: 'c6f29d9b-b43b-4988-a820-55737100abd3',
  productFeeAmountCharge: 200,
  productFeeAmountRefund: 0,
  productSubTotalAmountCharge: 200,
  productSubTotalAmountRefund: 0,
  netFeeAmountCharge: 223.5,
  netFeeAmountRefund: 0,
  inviteeTypeServiceFeePricingCharges: {
    '8dad2349-f766-4938-aeec-e43d2b07e8e5': {
      id: '8dad2349-f766-4938-aeec-e43d2b07e8e5',
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': '11a70cad-3ceb-49dd-b5f4-74b4a3db3eb5'
      },
      attendeeBreakdowns: [
        {
          attendeeType: 'ATTENDEE',
          amount: 20.0,
          eventRegistrationId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      totalInviteeTypeServiceFeeAmount: 20.0
    },
    '4eb6c17b-8211-4490-a375-0f16066344f1': {
      id: '4eb6c17b-8211-4490-a375-0f16066344f1',
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': '6fb8a700-9a41-4b46-a758-9b1294df3d77'
      },
      attendeeBreakdowns: [
        {
          attendeeType: 'ATTENDEE',
          amount: 10.0,
          eventRegistrationId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      totalInviteeTypeServiceFeeAmount: 10.0
    }
  },
  paymentTypeServiceFeePricingCharges: {
    'a9b51664-78ac-40f1-bfc4-c19f987bde48': {
      id: 'a9b51664-78ac-40f1-bfc4-c19f987bde48',
      totalServiceFeeAmount: 125.0,
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': 'dc6ae5e1-160f-42db-8919-4aa5a1cbd80f'
      },
      inviteeBreakdowns: [
        {
          attendeeType: 'ATTENDEE',
          amount: 125.0,
          eventRegistrationId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      totalPaymentTypeServiceFeeAmount: 125.0
    },
    '7de747f2-b7e9-4b92-a5a6-46d4bb1e6f65': {
      id: '7de747f2-b7e9-4b92-a5a6-46d4bb1e6f65',
      totalServiceFeeAmount: 40.0,
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': '20f413e1-1e17-4f53-aa49-6b3eee2608aa'
      },
      inviteeBreakdowns: [
        {
          attendeeType: 'ATTENDEE',
          amount: 40.0,
          eventRegistrationId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      totalPaymentTypeServiceFeeAmount: 40.0
    }
  },
  taxPricingCharges: {
    '3cb8d2a2-4801-45a8-9e2d-5b5d3fe8d89b': {
      id: '3cb8d2a2-4801-45a8-9e2d-5b5d3fe8d89b',
      totalTaxAmount: 10.5,
      taxProductBreakdowns: [
        {
          amount: 10.5,
          productType: 'AdmissionItem',
          productId: '2d293e0d-09da-4220-a987-25c6a1265294',
          eventRegId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': 'c446095a-022c-4c9d-8ca9-5667253dd15f'
      }
    },
    '490e1d10-cef1-436d-a974-9dad7a814b68': {
      id: '490e1d10-cef1-436d-a974-9dad7a814b68',
      totalTaxAmount: 4.5,
      taxProductBreakdowns: [
        {
          amount: 4.5,
          productType: 'Session',
          productId: '2cedce8a-df92-4058-b5c3-cbc7de022065',
          eventRegId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': '2adecad5-2e77-4580-9178-b3be8a832202'
      }
    },
    '780fd32b-354e-49fd-afb0-be7694da98c2': {
      id: '780fd32b-354e-49fd-afb0-be7694da98c2',
      totalTaxAmount: 8.5,
      taxProductBreakdowns: [
        {
          amount: 8.5,
          productType: 'Session',
          productId: '2cedce8a-df92-4058-b5c3-cbc7de022065',
          eventRegId: '00000000-0000-0000-0000-000000000001'
        }
      ],
      primaryRegToOrderDetailIds: {
        '00000000-0000-0000-0000-000000000001': '2434aa3b-337c-42d1-95e3-c2d8968b8e9f'
      }
    }
  },
  taxPricingRefunds: {},
  eventRegistrationPricings: [
    {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      productFeeAmountCharge: 200,
      productFeeAmountRefund: 0,
      productSubTotalAmountCharge: 200,
      productSubTotalAmountRefund: 0,
      netFeeAmountCharge: 223.5,
      netFeeAmountRefund: 0,
      productPricings: [
        {
          productId: '2d293e0d-09da-4220-a987-25c6a1265294',
          productType: 'AdmissionItem',
          pricingCharges: [
            {
              productType: 'AdmissionItem',
              quantity: 1,
              quantityPrevious: 0,
              feeId: '9f6054e7-ba5a-472c-890e-840e668186b2',
              priceTierId: '056ac521-38de-44b8-abdd-fb05e3b981fa',
              productPriceTierBaseFeeAmountPerItem: 150,
              productFeeAmountPerItem: 150,
              productFeeAmount: 150,
              productSubTotalAmount: 150,
              netFeeAmount: 150,
              chargeOrderDetailId: 'ead84892-4feb-4edf-9219-a3e7c10aa7a1'
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 150,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 150,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 160.5,
          netFeeAmountRefund: 0
        },
        {
          productId: '2cedce8a-df92-4058-b5c3-cbc7de022065',
          productType: 'Session',
          pricingCharges: [
            {
              productType: 'Session',
              quantity: 1,
              quantityPrevious: 0,
              feeId: 'e885f0b1-7d85-4f26-a492-0428eb007a85',
              priceTierId: 'f00e309c-518c-4402-9476-4c6af6bda384',
              productPriceTierBaseFeeAmountPerItem: 50,
              productFeeAmountPerItem: 50,
              productFeeAmount: 50,
              productSubTotalAmount: 50,
              netFeeAmount: 50,
              chargeOrderDetailId: 'fe84a8e7-d105-4ecd-a456-64df03c4d04f'
            }
          ],
          pricingRefunds: [],
          productFeeAmountCharge: 50,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 50,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 63,
          netFeeAmountRefund: 0
        }
      ]
    }
  ],
  plannerOverriddenProductFees: {},
  plannerOverriddenProductRefunds: {},
  isEditPrice: false,
  isEditRefund: false
};

const event = {
  eventFeatureSetup: {
    fees: {
      taxes: true,
      serviceFees: true
    }
  },
  products: {
    taxes: {
      '3cb8d2a2-4801-45a8-9e2d-5b5d3fe8d89b': {
        id: '3cb8d2a2-4801-45a8-9e2d-5b5d3fe8d89b',
        name: 'admission tax',
        active: true,
        code: 'admission tax',
        feeId: '94e2405b-61ca-47b6-b125-b8e19b394b87',
        priceTierId: 'b389c31f-f009-4742-9a45-946f5ba9c5ea',
        feeAdjustmentType: 2,
        amountPercentage: 7,
        order: 3,
        applicableTaxes: [],
        selectedAdmissionItems: ['2d293e0d-09da-4220-a987-25c6a1265294'],
        selectedTracks: [],
        selectedSessions: [],
        selectedOptionalItems: [],
        selectedHotelRoomFees: [],
        selectedServiceFees: [],
        selectedGroupFlights: []
      },
      '490e1d10-cef1-436d-a974-9dad7a814b68': {
        id: '490e1d10-cef1-436d-a974-9dad7a814b68',
        name: 'madison tax',
        active: true,
        code: 'madison tax',
        feeId: 'ee0e6592-bbdd-4b5a-b0ba-862ebf6382c3',
        priceTierId: '1f4a8df6-bb37-4f01-9169-1565788f557e',
        feeAdjustmentType: 2,
        amountPercentage: 9,
        order: 1,
        applicableTaxes: [],
        selectedAdmissionItems: [],
        selectedTracks: [],
        selectedSessions: ['2cedce8a-df92-4058-b5c3-cbc7de022065'],
        selectedOptionalItems: [],
        selectedHotelRoomFees: [],
        selectedServiceFees: [],
        selectedGroupFlights: []
      },
      '780fd32b-354e-49fd-afb0-be7694da98c2': {
        id: '780fd32b-354e-49fd-afb0-be7694da98c2',
        name: 'session tax',
        active: true,
        code: 'session tax',
        feeId: 'e4bf2048-aa2b-4c30-bc62-e2f0fec02de2',
        priceTierId: 'f71ceb43-3785-49bb-b0ed-6d90a4ba1be1',
        feeAdjustmentType: 2,
        amountPercentage: 17,
        order: 2,
        applicableTaxes: [],
        selectedAdmissionItems: [],
        selectedTracks: [],
        selectedSessions: ['2cedce8a-df92-4058-b5c3-cbc7de022065'],
        selectedOptionalItems: [],
        selectedHotelRoomFees: [],
        selectedServiceFees: [],
        selectedGroupFlights: []
      }
    },
    serviceFees: {
      '4eb6c17b-8211-4490-a375-0f16066344f1': {
        active: true,
        refundable: false,
        amount: 10.0,
        applyType: 0,
        adjustmentType: 1,
        inviteeType: 3,
        serviceFeeType: 50,
        applicableContactTypes: [],
        applicablePaymentMethods: [],
        displayOrder: 6,
        code: 'WHO -1',
        id: '4eb6c17b-8211-4490-a375-0f16066344f1',
        name: 'Who they are -1',
        type: 'RegistrationTypeServiceFee',
        defaultFeeId: '6360e160-5ea5-47ee-a665-a7ca876afb60',
        fees: {
          '6360e160-5ea5-47ee-a665-a7ca876afb60': {
            chargePolicies: [
              {
                id: '6c5d3418-6505-4001-91b3-6d3ccee781a7',
                isActive: true,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 10.0,
                maximumRefundAmount: 0.0
              }
            ],
            refundPolicies: [
              {
                id: '6c5d3418-6505-4001-91b3-6d3ccee781a7',
                isActive: true,
                refundType: 2,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 0
              }
            ],
            isActive: true,
            isRefundable: false,
            registrationTypes: [],
            name: 'Who they are -1',
            id: '6360e160-5ea5-47ee-a665-a7ca876afb60',
            amount: 10.0,
            glCodes: []
          }
        }
      },
      '8dad2349-f766-4938-aeec-e43d2b07e8e5': {
        active: true,
        refundable: false,
        amount: 20.0,
        applyType: 0,
        adjustmentType: 1,
        inviteeType: 3,
        serviceFeeType: 50,
        applicableContactTypes: [],
        applicablePaymentMethods: [],
        displayOrder: 3,
        code: 'WHO - 2',
        id: '8dad2349-f766-4938-aeec-e43d2b07e8e5',
        name: 'Who they are - 2',
        type: 'RegistrationTypeServiceFee',
        defaultFeeId: 'c94311b7-4ee7-4096-ae69-fc1d6788b07b',
        fees: {
          'c94311b7-4ee7-4096-ae69-fc1d6788b07b': {
            chargePolicies: [
              {
                id: 'ae029984-77d0-420c-88d5-e36a568b8798',
                isActive: true,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 20.0,
                maximumRefundAmount: 0.0
              }
            ],
            refundPolicies: [
              {
                id: 'ae029984-77d0-420c-88d5-e36a568b8798',
                isActive: true,
                refundType: 2,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 0
              }
            ],
            isActive: true,
            isRefundable: false,
            registrationTypes: [],
            name: 'Who they are - 2',
            id: 'c94311b7-4ee7-4096-ae69-fc1d6788b07b',
            amount: 20.0,
            glCodes: []
          }
        }
      },
      'a9b51664-78ac-40f1-bfc4-c19f987bde48': {
        active: true,
        refundable: false,
        amount: 25.0,
        applyType: 0,
        adjustmentType: 2,
        inviteeType: 0,
        serviceFeeType: 51,
        applicableContactTypes: [],
        applicablePaymentMethods: [
          'Visa',
          'MasterCard',
          'AmericanExpress',
          'Discover',
          'DinersClub',
          'Cash',
          'Check',
          'MoneyOrder',
          'Credit',
          'PurchaseOrder',
          'Invoice',
          'BankTransfer',
          'Other',
          'PaymentCredits',
          'Other2',
          'Other3'
        ],
        displayOrder: 5,
        code: 'How they pay subtotal - 2',
        id: 'a9b51664-78ac-40f1-bfc4-c19f987bde48',
        name: 'How they pay subtotal - 2',
        type: 'PaymentTypeServiceFee',
        defaultFeeId: '393edc2a-31e1-4d01-a60b-cada4ad9fbb0',
        fees: {
          '393edc2a-31e1-4d01-a60b-cada4ad9fbb0': {
            chargePolicies: [
              {
                id: '85a719fa-ebad-4e4d-b6a6-44dc1f2aacb1 ',
                isActive: true,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 25.0,
                maximumRefundAmount: 0.0
              }
            ],
            refundPolicies: [
              {
                id: '85a719fa-ebad-4e4d-b6a6-44dc1f2aacb1',
                isActive: true,
                refundType: 2,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 0
              }
            ],
            isActive: true,
            isRefundable: false,
            registrationTypes: [],
            name: 'How they pay subtotal - 2',
            id: '393edc2a-31e1-4d01-a60b-cada4ad9fbb0',
            amount: 25.0,
            glCodes: []
          }
        }
      },
      '7de747f2-b7e9-4b92-a5a6-46d4bb1e6f65': {
        active: true,
        refundable: false,
        amount: 40.0,
        applyType: 0,
        adjustmentType: 1,
        inviteeType: 0,
        serviceFeeType: 51,
        applicableContactTypes: [],
        applicablePaymentMethods: [
          'Visa',
          'MasterCard',
          'AmericanExpress',
          'Discover',
          'DinersClub',
          'Cash',
          'Check',
          'MoneyOrder',
          'Credit',
          'PurchaseOrder',
          'Invoice',
          'BankTransfer',
          'Other',
          'PaymentCredits',
          'Other2',
          'Other3'
        ],
        displayOrder: 2,
        code: 'How they pay -- subtotal',
        id: '7de747f2-b7e9-4b92-a5a6-46d4bb1e6f65',
        name: 'How they pay -- subtotal',
        type: 'PaymentTypeServiceFee',
        defaultFeeId: '08ab3024-14f5-433d-ad64-3096502a55d7',
        fees: {
          '08ab3024-14f5-433d-ad64-3096502a55d7': {
            chargePolicies: [
              {
                id: '834cab16-07ec-471b-bb98-5f7f6437b8c9',
                isActive: true,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 40.0,
                maximumRefundAmount: 0.0
              }
            ],
            refundPolicies: [
              {
                id: '834cab16-07ec-471b-bb98-5f7f6437b8c9',
                isActive: true,
                refundType: 2,
                effectiveUntil: '2999-12-31T00:00:00.000Z',
                amount: 0
              }
            ],
            isActive: true,
            isRefundable: false,
            registrationTypes: [],
            name: 'How they pay -- subtotal',
            id: '08ab3024-14f5-433d-ad64-3096502a55d7',
            amount: 40.0,
            glCodes: []
          }
        }
      }
    }
  }
};

const taxPricingType = 'taxPricingCharges';

test('getTaxesInfo returns the tax info in the order specified by planner for tax pricing', () => {
  // verify that initial is unordered
  let originalIsOrdered = true;
  const unorderedTaxInfo = event.products.taxes;
  const unorderedTaxInfoLength = Object.keys(unorderedTaxInfo).length;
  for (let i = 0; i < unorderedTaxInfoLength; i++) {
    if (unorderedTaxInfo[Object.keys(unorderedTaxInfo)[i]].order !== i + 1) {
      originalIsOrdered = false;
      break;
    }
  }
  expect(originalIsOrdered).toBeFalsy();

  // verify that returned tax info is ordered
  const taxInfo = getTaxesInfo(regCartPricing, event, taxPricingType);
  const taxInfoLength = Object.keys(taxInfo).length;
  for (let i = 0; i < taxInfoLength; i++) {
    expect(taxInfo[Object.keys(taxInfo)[i]].taxes.taxSortOrder).toBe(i + 1);
  }
});

test('getServiceFeeInfo returns the service fee info in the order specified by planner', () => {
  // verify that initial is unordered
  let originalIsOrdered = true;
  const unorderedServiceFeeInfo = event.products.serviceFees;
  const unorderedServiceFeeInfoLength = Object.keys(unorderedServiceFeeInfo).length;
  for (let i = 0; i < unorderedServiceFeeInfoLength; i++) {
    if (unorderedServiceFeeInfo[Object.keys(unorderedServiceFeeInfo)[i]].order !== i + 1) {
      originalIsOrdered = false;
      break;
    }
  }
  expect(originalIsOrdered).toBeFalsy();

  // verify that returned service info is ordered
  const serviceFeeInfo = getServiceFeeInfo(regCartPricing, event);
  const serviceFeeInfoLength = Object.keys(serviceFeeInfo).length;
  let totalFees = 0;
  for (let i = 0; i < serviceFeeInfoLength; i++) {
    totalFees = totalFees + serviceFeeInfo[i].serviceFees.serviceFeeAmount;
  }

  // epxect value should be the sum of all the service fee applied
  expect(totalFees).toBe(195);

  originalIsOrdered = true;
  const previousServiceFeeDisplayOrder = serviceFeeInfo[0].serviceFees.serviceFeeDisplayOrder;
  // value that service Fees are displayed in sorted order
  for (let i = 1; i < serviceFeeInfoLength; i++) {
    if (serviceFeeInfo[0].serviceFees.serviceFeeDisplayOrder < previousServiceFeeDisplayOrder) {
      originalIsOrdered = false;
      break;
    }
  }
  expect(originalIsOrdered).toBeTruthy();
});

test('getPaymentInfo returns the payment info to display for order summary', () => {
  const initialState = {
    appData: {
      registrationPathSettings: {
        eventRegistrationId: {
          paymentSettings: {
            creditCard: {
              enabled: true,
              label: 'EventWidgets_Payment_CreditCard_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false,
              securityCodeRequired: true
            },
            payPal: {
              additionalDetails: {
                label: 'EventWidgets_Payment_PayPal_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_PayPal_DefaultText__resx'
            },
            cyberSourceSecureAcceptance: {
              additionalDetails: {
                label: 'EventWidgets_Payment_CyberSource_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_CyberSource_DefaultText__resx'
            },
            authorizeDotNet: {
              additionalDetails: {
                label: 'EventWidgets_Payment_AuthorizeDotNet_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_AuthorizeDotNet_DefaultText__resx'
            },
            touchNet: {
              additionalDetails: {
                label: 'EventWidgets_Payment_TouchNet_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_TouchNet_DefaultText__resx'
            },
            check: {
              enabled: true,
              label: 'EventWidgets_Payment_Check_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            offline: {
              optionOne: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionOne_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              },
              optionTwo: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionTwo_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              },
              optionThree: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionThree_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              }
            },
            purchaseOrder: {
              enabled: true,
              label: 'EventWidgets_Payment_PurchaseOrder_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_PurchaseOrder_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            noPayment: {
              enabled: false,
              label: 'EventGuestSide_Payment_NoPayment_Label__resx'
            }
          }
        }
      },
      registrationSettings: {
        registrationPaths: {
          '02ecb4d5-ea33-4044-9d10-51eb65b1e78a': {
            id: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
            accessRules: {
              invitationListAccess: {
                allowedInvitationListIds: [],
                isEmailOnlyInvite: true,
                allowedInvitationListsIds: []
              }
            }
          },
          allowDiscountCodes: true
        }
      }
    },
    clients: {
      regcartClient: {}
    },
    website: {
      siteInfo: {
        sharedConfigs: {
          ContactWidget: {}
        }
      }
    },
    registrationForm: {
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
        },
        ignoreTaxes: false,
        ignoreServiceFees: false
      },
      currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
      regCart: {
        ignoreTaxes: false,
        ignoreServiceFees: false,
        ignoreServiceFee: true,
        discounts: {
          auto1: {
            discountCode: 'auto1',
            discountName: 'Auto1',
            isAutoApplied: true,
            autoApplyPriority: 1
          },
          auto2: {
            discountCode: 'auto2',
            discountName: 'auto2',
            isAutoApplied: true,
            autoApplyPriority: 1
          }
        },
        volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                firstName: 'm',
                lastName: 'd'
              }
            },
            sessionRegistrations: {}
          }
        }
      }
    },
    regCartPricing: {
      productSubTotalAmountCharge: 30,
      netFeeAmountCharge: 30,
      netFeeAmountChargeWithPaymentAmountServiceFee: 30,
      productFeeAmountRefund: 0,
      productSubTotalAmountRefund: 0,
      netFeeAmountRefund: 0,
      eventRegistrationPricings: [
        {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productFeeAmountCharge: 30,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 30,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 30,
          netFeeAmountRefund: 0,
          plannerOverriddenProductFees: {},
          regCartStatus: {},
          registrantLogin: {},
          routing: {},
          productPricings: [
            {
              productId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
              productType: 'QuantityItem',
              pricingCharges: [
                {
                  quantity: 2,
                  quantityPrevious: 0,
                  feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                  priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 5,
                  productFeeAmount: 20,
                  productSubTotalAmount: 10,
                  netFeeAmount: 10,
                  originalAmountCharged: 30
                },
                {
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                  priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 4.99,
                  productFeeAmount: 10,
                  productSubTotalAmount: 4.99,
                  netFeeAmount: 4.99,
                  originalAmountCharged: 30
                }
              ],
              pricingRefunds: [
                {
                  quantity: 2,
                  quantityPrevious: 3,
                  feeId: '65a3595f-8bd6-4ad0-a5ab-f76a71ae53a3',
                  priceTierId: '51cc062b-16e8-46c8-9df5-bc2bf2b3b4b5',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 10,
                  productFeeAmount: 20,
                  productSubTotalAmount: 20,
                  netFeeAmount: 20,
                  chargeOrderDetailId: '44702478-e6ce-4bea-b520-f8f5d4ff5801',
                  originalAmountCharged: 10
                },
                {
                  quantity: 5,
                  quantityPrevious: 5,
                  feeId: '65a3595f-8bd6-4ad0-a5ab-f76a71ae53a3',
                  priceTierId: '51cc062b-16e8-46c8-9df5-bc2bf2b3b4b5',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 10,
                  productFeeAmount: 50,
                  productSubTotalAmount: 50,
                  netFeeAmount: 50,
                  chargeOrderDetailId: 'bea9885f-a937-41fd-9586-5ce312f1abac',
                  originalAmountCharged: 10
                }
              ],
              productFeeAmountCharge: 0,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 0,
              productSubTotalAmountRefund: 10,
              netFeeAmountCharge: 0,
              netFeeAmountRefund: 10
            },
            {
              productId: '4c1928f4-c8d1-11eb-b8bc-0242ac130003',
              productType: ProductType.SESSION_BUNDLE,
              pricingCharges: [
                {
                  productType: ProductType.SESSION_BUNDLE,
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: '8ef89088-c8d1-11eb-b8bc-0242ac130003',
                  priceTierId: 'a07bcf78-c8d1-11eb-b8bc-0242ac130003',
                  productPriceTierBaseFeeAmountPerItem: 100,
                  productFeeAmountPerItem: 100,
                  productFeeAmount: 100,
                  productSubTotalAmount: 100,
                  netFeeAmount: 100,
                  chargeOrderDetailId: 'badab244-c8d1-11eb-b8bc-0242ac130003'
                }
              ],
              pricingRefunds: [],
              productFeeAmountCharge: 100,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 100,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 100,
              netFeeAmountRefund: 0
            }
          ]
        }
      ]
    },
    account: {
      merchantAccounts: [
        {
          processorId: 1,
          merchantAccountId: 'merchantAccountId',
          creditCards: ['Visa', 'Master']
        }
      ]
    },
    eventTravel: {
      hotelsData: {
        hotels: []
      },
      airData: {
        airRequestSetup: {}
      }
    },
    event: {
      selectedPaymentTypesSnapshot: {
        paymentMethodTypes: ['Visa', 'MasterCard']
      },
      products: {
        serviceFees: {
          'b272f019-8a00-487a-a640-938a836e74e7': {
            active: true,
            refundable: false,
            amount: 10.0,
            applyType: 0,
            adjustmentType: 1,
            inviteeType: 0,
            serviceFeeType: 51,
            applicableContactTypes: [],
            applicablePaymentMethods: ['Visa'],
            displayOrder: 2,
            code: 'how they pay - amount',
            id: 'b272f019-8a00-487a-a640-938a836e74e7',
            name: 'how they pay - amount',
            type: 'PaymentTypeServiceFee',
            defaultFeeId: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
            fees: {
              'e0e1f3ff-6c37-44cf-a454-6aca7712cea3': {
                chargePolicies: [
                  {
                    id: 'e03a820d-8396-44d9-a95a-5e471c5ec6ed',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 10.0,
                    maximumRefundAmount: 0.0
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: false,
                registrationTypes: [],
                name: 'how they pay - amount',
                id: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
                amount: 10.0,
                glCodes: []
              }
            }
          }
        },
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
    visibleProducts: {
      Widget: {
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
        },
        sessionProducts: {},
        quantityItems: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': {
            isOpenForRegistration: true,
            associatedRegistrationTypes: [],
            displayOrder: 1,
            code: '',
            description: '',
            id: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            capacityId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            name: 'Quantity Item with fee',
            status: 2,
            type: 'QuantityItem',
            defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
            fees: {
              'd139c987-c733-481f-a081-dc2a05ada52b': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'quantity item fee',
                id: 'd139c987-c733-481f-a081-dc2a05ada52b',
                amount: 2000,
                chargePolicies: [
                  {
                    id: 'e12b7b0e-20ad-410d-b658-7b5bcb32ae26',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 2000,
                    maximumRefundAmount: 2000
                  }
                ],
                refundPolicies: [
                  {
                    id: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                    isActive: true,
                    refundType: 1,
                    effectiveUntil: '2017-09-30T00:00:00.000Z',
                    amount: 10
                  }
                ]
              }
            }
          }
        },
        sortKeys: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': ['2017-11-13T23:00:00.000Z']
        }
      }
    },
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x
    },
    countries: {
      countries: { us: 'US' }
    },
    userSession: {},
    defaultUserSession: {}
  };

  sessionBundles({
    '4c1928f4-c8d1-11eb-b8bc-0242ac130003': {
      id: '4c1928f4-c8d1-11eb-b8bc-0242ac130003',
      name: 'Session Bundle 1',
      productDisplayOrder: 1
    }
  });

  const paymentInfo = getPaymentInfo(initialState, initialState.regCartPricing);

  expect(paymentInfo.order.attendees[0].subtotal).toEqual(30);

  const firstProduct = paymentInfo.order.attendees[0].products[0];

  expect(firstProduct.type).toEqual('QuantityItem');
  expect(firstProduct.name).toEqual('Quantity Item with fee');

  expect(firstProduct.quantity).toEqual(1);
  expect(firstProduct.additionalCharges[0].quantity).toEqual(2);
  expect(firstProduct.subtotalBeforeDiscount).toEqual(30);
  expect(firstProduct.totalQuantity).toEqual(3);

  expect(paymentInfo.refund.attendees[0].products[0].quantity).toEqual(2);
  expect(paymentInfo.refund.attendees[0].products[1].quantity).toEqual(5);

  /* Verify Session Bundle paymentInfo */
  const sessionBundleProduct = paymentInfo.order.attendees[0].products[1];
  expect(sessionBundleProduct.type).toEqual(ProductType.SESSION_BUNDLE);
  expect(sessionBundleProduct.name).toEqual('Session Bundle 1');
  expect(sessionBundleProduct.subtotalBeforeDiscount).toEqual(100);
});

test('check if payment type service is applied or not', () => {
  const initialState = {
    appData: {
      registrationPathSettings: {
        eventRegistrationId: {
          paymentSettings: {
            creditCard: {
              enabled: true,
              label: 'EventWidgets_Payment_CreditCard_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false,
              securityCodeRequired: true
            },
            payPal: {
              additionalDetails: {
                label: 'EventWidgets_Payment_PayPal_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_PayPal_DefaultText__resx'
            },
            cyberSourceSecureAcceptance: {
              additionalDetails: {
                label: 'EventWidgets_Payment_CyberSource_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_CyberSource_DefaultText__resx'
            },
            authorizeDotNet: {
              additionalDetails: {
                label: 'EventWidgets_Payment_AuthorizeDotNet_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_AuthorizeDotNet_DefaultText__resx'
            },
            touchNet: {
              additionalDetails: {
                label: 'EventWidgets_Payment_TouchNet_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_TouchNet_DefaultText__resx'
            },
            check: {
              enabled: true,
              label: 'EventWidgets_Payment_Check_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            offline: {
              optionOne: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionOne_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              },
              optionTwo: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionTwo_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              },
              optionThree: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionThree_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              }
            },
            purchaseOrder: {
              enabled: true,
              label: 'EventWidgets_Payment_PurchaseOrder_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_PurchaseOrder_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            noPayment: {
              enabled: false,
              label: 'EventGuestSide_Payment_NoPayment_Label__resx'
            }
          }
        }
      },
      registrationSettings: {
        registrationPaths: {
          '02ecb4d5-ea33-4044-9d10-51eb65b1e78a': {
            id: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
            accessRules: {
              invitationListAccess: {
                allowedInvitationListIds: [],
                isEmailOnlyInvite: true,
                allowedInvitationListsIds: []
              }
            }
          },
          allowDiscountCodes: true
        }
      }
    },
    clients: {
      regcartClient: {}
    },
    website: {
      siteInfo: {
        sharedConfigs: {
          ContactWidget: {}
        }
      }
    },
    registrationForm: {
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
        },
        ignoreTaxes: false,
        ignoreServiceFees: false
      },
      currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
      regCart: {
        ignoreTaxes: false,
        ignoreServiceFees: false,
        ignoreServiceFee: true,
        discounts: {
          auto1: {
            discountCode: 'auto1',
            discountName: 'Auto1',
            isAutoApplied: true,
            autoApplyPriority: 1
          },
          auto2: {
            discountCode: 'auto2',
            discountName: 'auto2',
            isAutoApplied: true,
            autoApplyPriority: 1
          }
        },
        volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                firstName: 'm',
                lastName: 'd'
              }
            },
            sessionRegistrations: {}
          }
        }
      }
    },
    regCartPricing: {
      productSubTotalAmountCharge: 30,
      netFeeAmountCharge: 30,
      netFeeAmountChargeWithPaymentAmountServiceFee: 30,
      productFeeAmountRefund: 0,
      productSubTotalAmountRefund: 0,
      netFeeAmountRefund: 0,
      eventRegistrationPricings: [
        {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productFeeAmountCharge: 30,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 30,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 30,
          netFeeAmountRefund: 0,
          plannerOverriddenProductFees: {},
          regCartStatus: {},
          registrantLogin: {},
          routing: {},
          productPricings: [
            {
              productId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
              productType: 'QuantityItem',
              pricingCharges: [
                {
                  quantity: 3,
                  quantityPrevious: 0,
                  feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                  priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 0,
                  productFeeAmount: 30,
                  productSubTotalAmount: 30,
                  netFeeAmount: 10,
                  originalAmountCharged: 30
                }
              ],
              pricingRefunds: [],
              productFeeAmountCharge: 0,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 0,
              productSubTotalAmountRefund: 10,
              netFeeAmountCharge: 0,
              netFeeAmountRefund: 10
            }
          ]
        }
      ]
    },
    account: {
      merchantAccounts: [
        {
          processorId: 1,
          merchantAccountId: 'merchantAccountId',
          creditCards: ['Visa', 'Master']
        }
      ]
    },
    eventTravel: {
      hotelsData: {
        hotels: []
      },
      airData: {
        airRequestSetup: {}
      }
    },
    event: {
      selectedPaymentTypesSnapshot: {
        paymentMethodTypes: ['Visa', 'MasterCard']
      },
      products: {
        serviceFees: {
          'b272f019-8a00-487a-a640-938a836e74e7': {
            active: true,
            refundable: false,
            amount: 10.0,
            applyType: 0,
            adjustmentType: 1,
            inviteeType: 0,
            serviceFeeType: 51,
            applicableContactTypes: [],
            applicablePaymentMethods: ['Visa'],
            displayOrder: 2,
            code: 'how they pay - amount',
            id: 'b272f019-8a00-487a-a640-938a836e74e7',
            name: 'how they pay - amount',
            type: 'PaymentTypeServiceFee',
            defaultFeeId: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
            fees: {
              'e0e1f3ff-6c37-44cf-a454-6aca7712cea3': {
                chargePolicies: [
                  {
                    id: 'e03a820d-8396-44d9-a95a-5e471c5ec6ed',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 10.0,
                    maximumRefundAmount: 0.0
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: false,
                registrationTypes: [],
                name: 'how they pay - amount',
                id: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
                amount: 10.0,
                glCodes: []
              }
            }
          }
        },
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
    visibleProducts: {
      Widget: {
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
        },
        sessionProducts: {},
        quantityItems: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': {
            isOpenForRegistration: true,
            associatedRegistrationTypes: [],
            displayOrder: 1,
            code: '',
            description: '',
            id: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            capacityId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            name: 'Quantity Item with fee',
            status: 2,
            type: 'QuantityItem',
            defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
            fees: {
              'd139c987-c733-481f-a081-dc2a05ada52b': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'quantity item fee',
                id: 'd139c987-c733-481f-a081-dc2a05ada52b',
                amount: 2000,
                chargePolicies: [
                  {
                    id: 'e12b7b0e-20ad-410d-b658-7b5bcb32ae26',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 2000,
                    maximumRefundAmount: 2000
                  }
                ],
                refundPolicies: [
                  {
                    id: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                    isActive: true,
                    refundType: 1,
                    effectiveUntil: '2017-09-30T00:00:00.000Z',
                    amount: 10
                  }
                ]
              }
            }
          }
        },
        sortKeys: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': ['2017-11-13T23:00:00.000Z']
        }
      }
    },
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x
    },
    countries: {
      countries: { us: 'US' }
    },
    userSession: {}
  };

  const isPaymentTypeServiceEnabled = isPaymentTypeServiceFeeEnabled(
    initialState.registrationForm.regCart,
    initialState.regCartPricing,
    initialState.event
  );
  expect(isPaymentTypeServiceEnabled).toBeTruthy();
});

test('discount should not be applied for hotel items', () => {
  const initialState = {
    appData: {
      registrationPathSettings: {
        eventRegistrationId: {
          paymentSettings: {
            creditCard: {
              enabled: true,
              label: 'EventWidgets_Payment_CreditCard_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false,
              securityCodeRequired: true
            },
            payPal: {
              additionalDetails: {
                label: 'EventWidgets_Payment_PayPal_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_PayPal_DefaultText__resx'
            },
            cyberSourceSecureAcceptance: {
              additionalDetails: {
                label: 'EventWidgets_Payment_CyberSource_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_CyberSource_DefaultText__resx'
            },
            authorizeDotNet: {
              additionalDetails: {
                label: 'EventWidgets_Payment_AuthorizeDotNet_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_AuthorizeDotNet_DefaultText__resx'
            },
            touchNet: {
              additionalDetails: {
                label: 'EventWidgets_Payment_TouchNet_DefaultText__resx',
                makeRequired: false
              },
              displayAdditionalDetails: false,
              enabled: false,
              instructionalText: '',
              merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
              label: 'EventWidgets_Payment_TouchNet_DefaultText__resx'
            },
            check: {
              enabled: true,
              label: 'EventWidgets_Payment_Check_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            offline: {
              optionOne: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionOne_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              },
              optionTwo: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionTwo_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              },
              optionThree: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionThree_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              }
            },
            purchaseOrder: {
              enabled: true,
              label: 'EventWidgets_Payment_PurchaseOrder_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_PurchaseOrder_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            noPayment: {
              enabled: false,
              label: 'EventGuestSide_Payment_NoPayment_Label__resx'
            }
          }
        }
      },
      registrationSettings: {
        registrationPaths: {
          '02ecb4d5-ea33-4044-9d10-51eb65b1e78a': {
            id: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
            accessRules: {
              invitationListAccess: {
                allowedInvitationListIds: [],
                isEmailOnlyInvite: true,
                allowedInvitationListsIds: []
              }
            }
          },
          allowDiscountCodes: true
        }
      }
    },
    clients: {
      regcartClient: {}
    },
    website: {
      siteInfo: {
        sharedConfigs: {
          ContactWidget: {}
        }
      }
    },
    registrationForm: {
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
        },
        ignoreTaxes: false,
        ignoreServiceFees: false
      },
      currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
      regCart: {
        ignoreTaxes: false,
        ignoreServiceFees: false,
        ignoreServiceFee: true,
        discounts: {
          auto1: {
            discountCode: 'auto1',
            discountName: 'Auto1',
            isAutoApplied: true,
            autoApplyPriority: 1
          },
          auto2: {
            discountCode: 'auto2',
            discountName: 'auto2',
            isAutoApplied: true,
            autoApplyPriority: 1
          }
        },
        volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                firstName: 'm',
                lastName: 'd'
              }
            },
            sessionRegistrations: {}
          }
        }
      }
    },
    regCartPricing: {
      productSubTotalAmountCharge: 30,
      netFeeAmountCharge: 30,
      netFeeAmountChargeWithPaymentAmountServiceFee: 30,
      productFeeAmountRefund: 0,
      productSubTotalAmountRefund: 0,
      netFeeAmountRefund: 0,
      eventRegistrationPricings: [
        {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productFeeAmountCharge: 30,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 30,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 30,
          netFeeAmountRefund: 0,
          plannerOverriddenProductFees: {},
          regCartStatus: {},
          registrantLogin: {},
          routing: {},
          productPricings: [
            {
              productId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2b0',
              productType: 'HotelItem',
              pricingCharges: [
                {
                  productType: 'HotelItem',
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                  priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                  productPriceTierBaseFeeAmountPerItem: 0,
                  productFeeAmountPerItem: 0,
                  productFeeAmount: 550,
                  productSubTotalAmount: 550,
                  netFeeAmount: 550,
                  roomSharingOpted: false,
                  numberOfNights: 11
                }
              ],
              productFeeAmountCharge: 550,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 550,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 550,
              netFeeAmountRefund: 0
            }
          ]
        }
      ]
    },
    account: {
      merchantAccounts: [
        {
          processorId: 1,
          merchantAccountId: 'merchantAccountId',
          creditCards: ['Visa', 'Master']
        }
      ]
    },
    eventTravel: {
      hotelsData: {
        hotels: [
          {
            id: 'id-01',
            hotelId: 'hotelId-01',
            hotelName: 'hotel abc',
            order: 1,
            arrivalDate: '2018-07-10T00:00:00.000Z',
            departureDate: '2018-07-20T00:00:00.000Z',
            hotelRooms: {
              roomId1: {
                id: 'roomId1',
                name: 'Executive Room',
                minimumRequiredNights: 1,
                roomDetailsByDateAndRegType: [
                  {
                    date: '2018-07-15T00:00:00.000Z',
                    capacityId: 'cap1'
                  }
                ],
                isOpenForRegistration: true
              }
            }
          }
        ]
      },
      airData: {
        airRequestSetup: {}
      }
    },
    event: {
      selectedPaymentTypesSnapshot: {
        paymentMethodTypes: ['Visa', 'MasterCard']
      },
      products: {
        serviceFees: {
          'b272f019-8a00-487a-a640-938a836e74e7': {
            active: true,
            refundable: false,
            amount: 10.0,
            applyType: 0,
            adjustmentType: 1,
            inviteeType: 0,
            serviceFeeType: 51,
            applicableContactTypes: [],
            applicablePaymentMethods: ['Visa'],
            displayOrder: 2,
            code: 'how they pay - amount',
            id: 'b272f019-8a00-487a-a640-938a836e74e7',
            name: 'how they pay - amount',
            type: 'PaymentTypeServiceFee',
            defaultFeeId: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
            fees: {
              'e0e1f3ff-6c37-44cf-a454-6aca7712cea3': {
                chargePolicies: [
                  {
                    id: 'e03a820d-8396-44d9-a95a-5e471c5ec6ed',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 10.0,
                    maximumRefundAmount: 0.0
                  }
                ],
                refundPolicies: [],
                isActive: true,
                isRefundable: false,
                registrationTypes: [],
                name: 'how they pay - amount',
                id: 'e0e1f3ff-6c37-44cf-a454-6aca7712cea3',
                amount: 10.0,
                glCodes: []
              }
            }
          }
        },
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
    visibleProducts: {
      Widget: {
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
        },
        sessionProducts: {},
        quantityItems: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2b0': {
            isOpenForRegistration: true,
            associatedRegistrationTypes: [],
            displayOrder: 1,
            code: '',
            description: '',
            id: '0e1c5dcf-b735-4e1f-a1da-740223f5b2b0',
            capacityId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2b0',
            name: 'Quantity Item with fee',
            status: 2,
            type: 'HotelItem',
            defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
            fees: {
              'd139c987-c733-481f-a081-dc2a05ada52b': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'quantity item fee',
                id: 'd139c987-c733-481f-a081-dc2a05ada52b',
                amount: 2000,
                chargePolicies: [
                  {
                    id: 'e12b7b0e-20ad-410d-b658-7b5bcb32ae26',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 2000,
                    maximumRefundAmount: 2000
                  }
                ],
                refundPolicies: [
                  {
                    id: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                    isActive: true,
                    refundType: 1,
                    effectiveUntil: '2017-09-30T00:00:00.000Z',
                    amount: 10
                  }
                ]
              }
            }
          }
        },
        sortKeys: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': ['2017-11-13T23:00:00.000Z']
        }
      }
    },
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x
    },
    countries: {
      countries: { us: 'US' }
    },
    userSession: {},
    defaultUserSession: {}
  };

  const paymentInfo = getPaymentInfo(initialState, initialState.regCartPricing);
  const product = paymentInfo.order.attendees[0].products[0];
  expect(product.type).toEqual('HotelItem');

  const discount = product.originalPricePerItem - product.pricePerItem;
  expect(discount).toEqual(0);
});

describe('shouldUseWebpaymentsForm tests', () => {
  const initialState = {
    experiments: {
      isFlexRegWebPaymentEnabled: true,
      featureRelease: 0
    },
    registrationForm: {
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
        },
        ignoreTaxes: false,
        ignoreServiceFees: false
      },
      currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
      regCart: {
        ignoreTaxes: false,
        ignoreServiceFees: false,
        ignoreServiceFee: true,
        discounts: {
          auto1: {
            discountCode: 'auto1',
            discountName: 'Auto1',
            isAutoApplied: true,
            autoApplyPriority: 1
          },
          auto2: {
            discountCode: 'auto2',
            discountName: 'auto2',
            isAutoApplied: true,
            autoApplyPriority: 1
          }
        },
        volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                firstName: 'm',
                lastName: 'd'
              }
            },
            sessionRegistrations: {}
          }
        }
      }
    }
  };

  test('should be false if not in webpayments exp', () => {
    const state = setIn(initialState, ['experiments', 'isFlexRegWebPaymentEnabled'], false);
    expect(shouldUseWebpaymentsForm(state)).toBeFalsy();
  });

  test('should be true if in webpayments exp and paymentType is Online', () => {
    const state = setCreditCardPaymentField(initialState, 'paymentType', PAYMENT_TYPE.ONLINE);
    expect(shouldUseWebpaymentsForm(state)).toBeTruthy();
  });

  test('should be false if in webpayments exp and paymentType is Offline and fetureRelease variant is in incorrect exp', () => {
    let state = setIn(initialState, ['experiments', 'featureRelease'], 0);
    state = setCreditCardPaymentField(state, 'paymentType', PAYMENT_TYPE.OFFLINE);
    expect(shouldUseWebpaymentsForm(state)).toBeFalsy();
  });

  test('should be true if in webpayments exp and paymentType is Offline and fetureRelease variant is in correct exp', () => {
    let state = setIn(
      initialState,
      ['experiments', 'featureRelease'],
      CREDIT_CARD_FOR_LATER_PROCESSING_WEBPAYMENTS_FORM_VARIANT
    );
    state = setCreditCardPaymentField(state, 'paymentType', PAYMENT_TYPE.OFFLINE);
    expect(shouldUseWebpaymentsForm(state)).toBeTruthy();
  });

  test('should be false if net amount to be paid is zero', () => {
    const currentRegCartPricing = { netFeeAmountCharge: 0 };
    expect(shouldUseWebpaymentsForm(initialState, currentRegCartPricing)).toBeFalsy();
  });

  test('should be true if net amount to be paid is non-zero', () => {
    const state = setIn(initialState, ['regCartPricing', 'netFeeAmountCharge'], 100);
    expect(shouldUseWebpaymentsForm(state)).toBeTruthy();
  });
});
