import RegistrationCancellationRefundWidgetWrapper from '../RegistrationCancellationRefundWidget';
import Form from 'nucleus-form/src/components/Form';
import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import configureStore from '../../redux/configureStore';
import { MockedProvider } from '@apollo/client/testing';
import { mount } from 'enzyme';
import { Grid } from 'nucleus-core/layout/flexbox';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import { cloneDeep } from 'lodash';
import { setIn } from 'icepick';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../PaymentWidget/__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks, mockApolloClient } from '../PaymentWidget/__mocks__/apolloClient';
// eslint-disable-next-line jest/no-mocks-import
import { MOCK_GET_REG_CART_PRICING } from '../PaymentWidget/__mocks__/useCachedRegCartPricing';
jest.mock('../PaymentWidget/getRegCartPricingAction', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: async (state, _) => {
    return state;
  }
}));
jest.mock('../PaymentWidget/useCachedRegCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../PaymentWidget/useCachedRegCartPricing'),
  __esModule: true,
  getTravelCartForQuery: () => {
    return JSON.stringify({});
  },
  lastSavedRegCartForQuery: () => {
    return JSON.stringify({});
  },
  getPaymentInfoForQuery: () => {
    return JSON.stringify({});
  }
}));
import {
  isEditPriceVar,
  isEditRefundVar,
  plannerOverriddenProductFeesVar,
  plannerOverriddenProductRefundsVar,
  plannerOverriddenProductFeesSavedVar,
  plannerOverriddenProductRefundsSavedVar
} from '../PaymentWidget/regCartPricing';
import Refund from 'event-widgets/lib/OrderRefund/Refund';
jest.mock('../PaymentWidget/regCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../PaymentWidget/regCartPricing'),
  getRegCartPricingGQL: () => {
    return MOCK_GET_REG_CART_PRICING;
  }
}));

jest.mock('react-responsive', () => jest.fn(({ children }) => children));

jest.mock('../../redux/states', () => ({
  loadCountryStates: () => () => {}
}));
jest.mock('../../redux/registrationForm/regCart', () => ({
  updateRegCart: (state, regCartClient, accessToken, regCart) => {
    // Call a mock client. Triggers a ServiceError in some test cases.
    regCartClient.updateRegCart();
    // Return the updated reg cart that was passed in to mock successful request.
    return Promise.resolve({ regCart, validationMessages: [] });
  }
}));
jest.mock('react-responsive', () => jest.fn(({ children }) => children));
jest.mock('../../redux/registrationForm/regCartPayment/actions', () => ({
  ...jest.requireActual<$TSFixMe>('../../redux/registrationForm/regCartPayment/actions'),
  setSelectedPaymentMethod: jest.fn(
    jest.requireActual<$TSFixMe>('../../redux/registrationForm/regCartPayment/actions').setSelectedPaymentMethod
  ),
  setCreditCardField: jest.fn(
    jest.requireActual<$TSFixMe>('../../redux/registrationForm/regCartPayment/actions').setCreditCardField
  )
}));

const loadMetaDataFunction = () => {
  return {
    appDataFieldPaths: {
      paymentSettings: 'registrationPathSettings.eventRegistrationId.paymentSettings',
      partialPaymentSettings: 'registrationPathSettings.eventRegistrationId.partialPaymentSettings'
    }
  };
};

const allowDiscountCodes = true;

const initialState = {
  accessToken: '',
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
            securityCodeRequired: true,
            processOffline: false
          },
          payPal: {
            additionalDetails: {
              label: 'EventWidgets_Payment_PayPal_DefaultText__resx',
              makeRequired: false
            },
            displayAdditionalDetails: false,
            enabled: true,
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
            enabled: true,
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
          wpm: {
            additionalDetails: {
              label: 'EventWidgets_Payment_WPM_DefaultText__resx',
              makeRequired: false
            },
            displayAdditionalDetails: false,
            enabled: false,
            instructionalText: '',
            merchantAccount: 'a7e4d4c7-79b3-4ccd-b103-6ad85adca895',
            label: 'EventWidgets_Payment_WPM_DefaultText__resx'
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
              type: PRIVATE_ALL_TARGETED_LISTS,
              allowedInvitationListIds: [],
              isEmailOnlyInvite: true,
              allowedInvitationListsIds: []
            }
          }
        },
        allowDiscountCodes
      }
    }
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  website: {
    siteInfo: {
      sharedConfigs: {
        ContactWidget: {}
      }
    }
  },
  widgetFactory: {
    loadMetaData: loadMetaDataFunction
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
      regCartId: '00000000-0000-0000-0000-000000000001',
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
        },
        guest1: {
          discountCode: 'guest1',
          discountName: 'Guest1',
          isAutoApplied: false
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
          registrationPathId: 'eventRegistrationId',
          sessionRegistrations: {}
        }
      }
    }
  },
  regCartPricing: {
    productSubTotalAmountCharge: 10,
    netFeeAmountCharge: 10,
    netFeeAmountChargeWithPaymentAmountServiceFee: 10,
    productFeeAmountRefund: 210,
    productSubTotalAmountRefund: 210,
    netFeeAmountRefund: 210,
    eventRegistrationPricings: [
      {
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        productFeeAmountCharge: 210,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 210,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 210,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb',
            productType: 'AdmissionItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
                priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                productPriceTierBaseFeeAmountPerItem: 10000,
                productFeeAmountPerItem: 10,
                productFeeAmount: 10000,
                productSubTotalAmount: 10,
                netFeeAmount: 10
              }
            ],
            pricingRefunds: [
              {
                originalAmountCharged: 10
              }
            ],
            productFeeAmountCharge: 10,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 10,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 10,
            netFeeAmountRefund: 0
          },
          {
            productId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            productType: 'Session',
            pricingCharges: [],
            pricingRefunds: [
              {
                quantity: 1,
                quantityPrevious: 1,
                feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                productPriceTierBaseFeeAmountPerItem: 0,
                productFeeAmountPerItem: 0,
                productFeeAmount: 10,
                productSubTotalAmount: 10,
                netFeeAmount: 10,
                originalAmountCharged: 10
              }
            ],
            productFeeAmountCharge: 0,
            productFeeAmountRefund: 10,
            productSubTotalAmountCharge: 0,
            productSubTotalAmountRefund: 10,
            netFeeAmountCharge: 0,
            netFeeAmountRefund: 10
          }
        ]
      },
      {
        eventRegistrationId: '00000000-0000-0000-0000-000000000002',
        productFeeAmountCharge: 210,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 210,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 210,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb',
            productType: 'AdmissionItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
                priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                productPriceTierBaseFeeAmountPerItem: 10000,
                productFeeAmountPerItem: 10,
                productFeeAmount: 10000,
                productSubTotalAmount: 10,
                netFeeAmount: 10
              }
            ],
            pricingRefunds: [
              {
                originalAmountCharged: 10
              }
            ],
            productFeeAmountCharge: 10,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 10,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 10,
            netFeeAmountRefund: 0
          },
          {
            productId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            productType: 'Session',
            pricingCharges: [],
            pricingRefunds: [
              {
                quantity: 1,
                quantityPrevious: 1,
                feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                productPriceTierBaseFeeAmountPerItem: 0,
                productFeeAmountPerItem: 0,
                productFeeAmount: 10,
                productSubTotalAmount: 10,
                netFeeAmount: 10,
                originalAmountCharged: 10
              }
            ],
            productFeeAmountCharge: 0,
            productFeeAmountRefund: 10,
            productSubTotalAmountCharge: 0,
            productSubTotalAmountRefund: 10,
            netFeeAmountCharge: 0,
            netFeeAmountRefund: 10
          }
        ]
      },
      {
        eventRegistrationId: '00000000-0000-0000-0000-000000000003',
        productFeeAmountCharge: 0,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 0,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 0,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'ee2f1ab5-7275-4b4c-b808-9b3494ed5ceb',
            productType: 'AdmissionItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
                priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                productPriceTierBaseFeeAmountPerItem: 0,
                productFeeAmountPerItem: 0,
                productFeeAmount: 0,
                productSubTotalAmount: 0,
                netFeeAmount: 0
              }
            ],
            pricingRefunds: [
              {
                originalAmountCharged: 10
              }
            ],
            productFeeAmountCharge: 0,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 0,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 0,
            netFeeAmountRefund: 0
          },
          {
            productId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            productType: 'Session',
            pricingCharges: [],
            pricingRefunds: [
              {
                quantity: 1,
                quantityPrevious: 1,
                feeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
                priceTierId: '8190ffd7-fc9c-476b-a95c-0715f9812627',
                productPriceTierBaseFeeAmountPerItem: 0,
                productFeeAmountPerItem: 0,
                productFeeAmount: 0,
                productSubTotalAmount: 0,
                netFeeAmount: 0,
                originalAmountCharged: 0
              }
            ],
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
        eventRegistrationId: '00000000-0000-0000-0000-000000000004',
        productFeeAmountCharge: 0,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 0,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 0,
        netFeeAmountRefund: 0,
        plannerOverriddenProductFees: {},
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: '6cb5dff4-c64b-4242-a4ff-ab952ff2028e',
            productType: 'HotelItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
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
  account: {
    merchantAccounts: [
      {
        processorId: 1,
        merchantAccountId: 'merchantAccountId',
        creditCards: ['Visa', 'Master']
      }
    ]
  },
  event: {
    selectedPaymentTypesSnapshot: {
      paymentMethodTypes: ['Visa', 'MasterCard']
    },
    products: {
      sessionContainer: {
        optionalSessions: {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2017-11-13T23:00:00.000Z',
            endTime: '2017-11-14T00:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 10,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            code: '',
            description: '',
            id: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            capacityId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
            name: 'session 2 fee',
            status: 2,
            type: 'Session',
            defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
            fees: {
              'd139c987-c733-481f-a081-dc2a05ada52b': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'session 2 fee',
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
        }
      },
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
      },
      quantityItems: {
        'ce8784ca-0373-4560-9d74-3ff58d15c151': {
          id: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
          capacityId: 'ce8784ca-0373-4560-9d74-3ff58d15c151'
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
      sessionProducts: {
        '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': {
          categoryId: '00000000-0000-0000-0000-000000000000',
          startTime: '2017-11-13T23:00:00.000Z',
          endTime: '2017-11-14T00:00:00.000Z',
          isOpenForRegistration: true,
          isIncludedSession: false,
          registeredCount: 10,
          associatedWithAdmissionItems: [],
          availableToAdmissionItems: [],
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 0,
          code: '',
          description: '',
          id: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
          capacityId: '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4',
          name: 'session 2 fee',
          status: 2,
          type: 'Session',
          defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
          fees: {
            'd139c987-c733-481f-a081-dc2a05ada52b': {
              isActive: true,
              isRefundable: true,
              registrationTypes: [],
              name: 'session 2 fee',
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
      quantityItems: {
        'ce8784ca-0373-4560-9d74-3ff58d15c151': {
          id: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
          capacityId: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
          type: 'QuantityItem',
          name: 'a quantity item'
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
    translate: x => x,
    locale: 'en'
  },
  countries: {
    countries: { us: 'US' }
  },
  userSession: {},
  defaultUserSession: {
    isPlanner: false
  },
  partialPaymentSettings: {
    enabled: true,
    enabledOnPostRegPaymentPage: false,
    minimumPaymentAmountType: '1',
    minimumPaymentAmount: '20',
    paymentDistributionMethodType: '1',
    productPriorityList: []
  },
  eventTravel: {
    hotelsData: {
      hotels: []
    }
  },
  regCartStatus: {
    lastSavedRegCart: {}
  },
  travelCart: {
    cart: {}
  }
};

const defaultProps = {
  config: {
    shared: {
      paymentInstructions: 'Payment Instructions',
      orderHeader: 'Order Header',
      paymentHeader: 'Payment Header'
    }
  },
  isTaxesEnabled: true,
  isServiceFeeEnabled: true,
  ignoreServiceFees: false,
  ignoreTaxes: false,
  style: {},
  id: 'widget:payment',
  'data-cvent-id': 'widget-Payment-widget:payment',
  translate: x => x
};

const waitWithAct = async (time = 0) => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, time));
  });
};

const resetReactiveVars = () => {
  plannerOverriddenProductFeesVar({});
  plannerOverriddenProductRefundsVar({});
  plannerOverriddenProductFeesSavedVar({});
  plannerOverriddenProductRefundsSavedVar({});
  isEditPriceVar(false);
  isEditRefundVar(false);
};

let mockStore;
const mountWidget = async (state, useWebPaymentsForm?, featureReleaseVariant?) => {
  resetReactiveVars();
  const mergedState = {
    ...cloneDeep(state),
    experiments: {
      isFlexRegWebPaymentEnabled: useWebPaymentsForm || false,
      featureRelease: featureReleaseVariant || 0
    }
  };
  const apolloClient = mockApolloClient(mergedState.regCartPricing);
  mockStore = configureStore(mergedState, {}, { apolloClient });
  const props = { ...defaultProps };
  const widget = mount(
    <Provider store={mockStore}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={getApolloClientMocks(mergedState)} addTypeName={false}>
        <Form>
          <Grid>
            <RegistrationCancellationRefundWidgetWrapper {...props} />
          </Grid>
        </Form>
      </MockedProvider>
    </Provider>
  );
  await waitWithAct();
  await widget.update();
  return widget;
};

describe('RegistrationCancellationRefundWidget', () => {
  beforeEach(() => {
    resetReactiveVars();
  });
  test('Renders Refund widget with correct total', async () => {
    const component = await mountWidget(initialState);
    const refundWidget = component.find(Refund);
    expect(refundWidget).toHaveLength(1);
    // eslint-disable-next-line jest/valid-expect
    expect(refundWidget.someWhere(wrapper => wrapper.text() === initialState.regCartPricing.productFeeAmountRefund));
  });
  test('Refund widget allows planner to edit refunds', async () => {
    const updatedInitialState = setIn(initialState, ['defaultUserSession', 'isPlanner'], true);
    const component = await mountWidget(updatedInitialState);
    component.find('[data-cvent-id="override-prices-edit"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component.exists('[data-cvent-id="override-prices-save"]')).toBeTruthy();

    const editRefundInput = component
      .find('[data-cvent-id="orderSummary-edit-price-textbox"]')
      .first()
      .find('input')
      .first();
    const refundAmount = '3.14';
    editRefundInput.simulate('change', { target: { value: refundAmount } });
    expect(plannerOverriddenProductRefundsSavedVar()).toEqual({});

    component.find('[data-cvent-id="override-prices-save"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component.exists('[data-cvent-id="override-prices-edit"]')).toBeTruthy();

    expect(plannerOverriddenProductRefundsSavedVar()).toHaveProperty(
      '00000000-0000-0000-0000-000000000001.undefined',
      refundAmount
    );
    // eslint-disable-next-line jest/valid-expect
    expect(component.someWhere(wrapper => wrapper.text() === refundAmount));
  });
});
