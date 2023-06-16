import PaymentWidgetWrapper from '../PaymentWidget';
import Form from 'nucleus-form/src/components/Form';
import React from 'react';
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import configureStore from '../../redux/configureStore';
import { MockedProvider } from '@apollo/client/testing';
import { mount } from 'enzyme';
import { Grid } from 'nucleus-core/layout/flexbox';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import icepick, { setIn, getIn } from 'icepick';
import { cloneDeep, mapValues } from 'lodash';
import { getPaymentInfo } from '../../redux/selectors/payment';
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
import { setCreditCardField, setSelectedPaymentMethod } from '../../redux/registrationForm/regCartPayment/actions';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { SET_REG_CART_PAYMENT_FIELD_VALUE } from '../../redux/registrationForm/regCart/actionTypes';
import {
  CREDIT_CARD_FOR_LATER_PROCESSING_WEBPAYMENTS_FORM_VARIANT,
  FEATURE_RELEASE_DEVELOPMENT_VARIANT
} from '@cvent/event-ui-experiments';
import { membershipItemsVar } from 'event-widgets/lib/MembershipItems/useMembershipItems';
import { allSessionBundlesVar } from 'event-widgets/lib/Sessions/useVisibleSessionBundles';
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
  defaultUserSession: {},
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

const regCartPricingWithRefundsAndNoTotal = {
  productFeeAmountCharge: 0,
  productFeeAmountRefund: 20,
  productSubTotalAmountCharge: 0,
  productSubTotalAmountRefund: 20,
  netFeeAmountCharge: 0,
  netFeeAmountChargeWithPaymentAmountServiceFee: 0,
  netFeeAmountRefund: 20,
  inviteeTypeServiceFeePricingCharges: {},
  paymentTypeServiceFeePricingCharges: {},
  inviteeTypeServiceFeePricingRefunds: {},
  paymentTypeServiceFeePricingRefunds: {},
  taxPricingCharges: {},
  taxPricingRefunds: {},
  plannerOverriddenProductFees: {},
  plannerOverriddenProductRefunds: {},
  isEditPrice: false,
  isEditRefund: false,
  eventRegistrationPricings: [
    {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      productFeeAmountCharge: 0,
      productFeeAmountRefund: 20,
      productSubTotalAmountCharge: 0,
      productSubTotalAmountRefund: 20,
      netFeeAmountCharge: 0,
      netFeeAmountChargeWithPaymentTypeServiceFee: 0,
      netFeeAmountRefund: 20,
      productPricings: [
        {
          productId: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
          productType: 'QuantityItem',
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 20,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 20,
          netFeeAmountCharge: 0,
          netFeeAmountRefund: 20,
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
            }
          ]
        }
      ]
    }
  ]
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
  membershipItemsVar([]);
  allSessionBundlesVar({});
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
            <PaymentWidgetWrapper {...props} />
          </Grid>
        </Form>
      </MockedProvider>
    </Provider>
  );
  await waitWithAct();
  await widget.update();
  return widget;
};
const mountWidget2 = async state => {
  resetReactiveVars();
  const mergedState = {
    ...cloneDeep(state),
    experiments: {}
  };
  const middleware = [thunk];
  mockStore = configureMockStore(middleware);
  mockStore = mockStore(mergedState);
  const props = { ...defaultProps };
  const widget = mount(
    <Provider store={mockStore}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={getApolloClientMocks(mergedState)} addTypeName={false}>
        <Form>
          <Grid>
            <PaymentWidgetWrapper {...props} />
          </Grid>
        </Form>
      </MockedProvider>
    </Provider>
  );
  await waitWithAct();
  await widget.update();
  return widget;
};

describe('Tests for PaymentWidget', () => {
  beforeEach(() => {
    resetReactiveVars();
  });
  test('Checking if it is rendering properly', async () => {
    const component = await mountWidget(initialState);
    expect(component).toMatchSnapshot('Widget Renders');
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot();

    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    expect(component).toMatchSnapshot('Credit Card Form displayed');
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'state updated to match creditcard selection'
    );

    component.find('#creditCard-paymentMethodType').simulate('change', { target: { value: '1' } });

    component.find('#creditCard-number').simulate('change', { target: { value: 'number' } });

    component.find('#creditCard-name').simulate('change', { target: { value: 'name' } });

    component.find('#creditCard-expirationMonth').simulate('change', { target: { value: '2' } });

    component.find('#creditCard-expirationYear').simulate('change', { target: { value: '5' } });

    component.find('#creditCard-address1').simulate('change', { target: { value: 'address1' } });

    component.find('#creditCard-address2').simulate('change', { target: { value: 'address2' } });

    component.find('#creditCard-country').simulate('change', { target: { value: '0' } });

    component.find('#creditCard-city').simulate('change', { target: { value: 'city' } });

    component.find('#creditCard-state-text').simulate('change', { target: { value: 'state' } });

    component.find('#creditCard-zip').simulate('change', { target: { value: 'zip' } });

    expect(component).toMatchSnapshot('credit form snapshot');
    component
      .find('[data-cvent-id="paymentMethod-purchaseOrder"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    expect(component).toMatchSnapshot();
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'state updated to match purchaseOrder selection'
    );
    component
      .find('[data-cvent-id="paymentMethod-check"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    expect(component).toMatchSnapshot();
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'state updated to match check selection'
    );
    component
      .find('[data-cvent-id="paymentMethod-payPal"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    expect(component).toMatchSnapshot();
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'state updated to match payPal selection'
    );
  });

  test('Checking if payPal/cyberSourceSecureAcceptance is enabled when not in testmode', async () => {
    const updatedInitialState = setIn(initialState, ['defaultUserSession', 'isTestMode'], false);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot();
    expect(
      component.find('[data-cvent-id="paymentMethod-payPal"]').find('input').html().includes('disabled=""')
    ).toBeFalsy();
    expect(
      component
        .find('[data-cvent-id="paymentMethod-cyberSourceSecureAcceptance"]')
        .find('input')
        .html()
        .includes('disabled=""')
    ).toBeFalsy();
  });

  test('Checking if payPal/cyberSourceSecureAcceptance is disabled for preview mode', async () => {
    const updatedInitialState = setIn(initialState, ['defaultUserSession', 'isPreview'], true);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot();
    expect(
      component.find('[data-cvent-id="paymentMethod-payPal"]').find('input').html().includes('disabled=""')
    ).toBeTruthy();
    expect(
      component
        .find('[data-cvent-id="paymentMethod-cyberSourceSecureAcceptance"]')
        .find('input')
        .html()
        .includes('disabled=""')
    ).toBeTruthy();
  });

  test('Checking if payPal/cyberSourceSecureAcceptance is disabled in testmode', async () => {
    const updatedInitialState = setIn(initialState, ['defaultUserSession', 'isTestMode'], true);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot();
    expect(
      component.find('[data-cvent-id="paymentMethod-payPal"]').find('input').html().includes('disabled=""')
    ).toBeTruthy();
    expect(
      component
        .find('[data-cvent-id="paymentMethod-cyberSourceSecureAcceptance"]')
        .find('input')
        .html()
        .includes('disabled=""')
    ).toBeTruthy();
  });

  test('Checking if Planner Reg Payment Widget is rendering properly', async () => {
    const updatedInitialState = setIn(initialState, ['defaultUserSession', 'isPlanner'], true);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Renders');
    component.find('[data-cvent-id="override-prices-edit"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Edit Refunds Mode');
    component.find('[data-cvent-id="override-prices-save"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Save Refunds Mode');
    component.find('[data-cvent-id="override-prices-edit"]').at(2).simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Edit Prices Mode');
    component.find('[data-cvent-id="override-prices-save"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Save Prices Mode');
    component.find('[data-cvent-id="override-prices-addremove-taxes"]').first().simulate('click');
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Remove Taxes Mode');
    component.find('[data-cvent-id="override-prices-addremove-taxes"]').first().simulate('click');
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Include Taxes Mode');
    component.find('[data-cvent-id="override-prices-addremove-servicefees"]').first().simulate('click');
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Remove Service Fee Mode');
    component.find('[data-cvent-id="override-prices-addremove-servicefees"]').first().simulate('click');
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Include Service Fee Mode');
  });

  test('Check credit card expiration date validation', async () => {
    const component = await mountWidget(initialState);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });
    expect(component).toMatchSnapshot();
    component.find('#creditCard-paymentMethodType').simulate('change', { target: { value: '1' } });
    component.find('#creditCard-expirationMonth').simulate('focus');
    component
      .find('#creditCard-expirationMonth')
      .simulate('change', { target: { value: (new Date().getMonth() - 1).toString() } });
    component.find('#creditCard-expirationYear').simulate('change', { target: { value: '0' } });
    component.find('#creditCard-expirationMonth').simulate('blur');
    expect(component).toMatchSnapshot('should generate validation error');
    component.find('#creditCard-expirationMonth').simulate('focus');
    component
      .find('#creditCard-expirationMonth')
      .simulate('change', { target: { value: new Date().getMonth().toString() } });
    component.find('#creditCard-expirationMonth').simulate('blur');
    expect(component).toMatchSnapshot('should hide validation error');
  });

  test('Check that default country is populated', async () => {
    const stateWithDefaultCountry = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'eventRegistrationId', 'paymentSettings', 'creditCard', 'defaultCountry'],
      { name: 'wales', value: 'GB3' }
    );
    const component = await mountWidget(stateWithDefaultCountry);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot('default country populated in state');
  });
});

describe('Tests for PaymentWidget with guests', () => {
  beforeEach(() => {
    resetReactiveVars();
  });
  test('Check guest with products is rendered if its group reg', async () => {
    const regCart = getIn(initialState, ['registrationForm', 'regCart']);
    let updatedRegCart = setIn(regCart, ['groupRegistration'], true);
    const guestEventRegistration = {
      eventRegistrationId: '00000000-0000-0000-0000-000000000002',
      attendee: {
        personalInformation: {
          firstName: 'Atreus',
          lastName: 'jkActuallyLoki'
        }
      },
      primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
      requestedAction: 'REGISTER',
      attendeeType: 'GUEST',
      displaySequence: 1,
      sessionRegistrations: {}
    };
    updatedRegCart = setIn(
      updatedRegCart,
      ['eventRegistrations', guestEventRegistration.eventRegistrationId],
      guestEventRegistration
    );
    const updatedInitialState = setIn(initialState, ['registrationForm', 'regCart'], updatedRegCart);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot('Widget Renders with guest info');
  });

  test('Check guest with zero fee products are rendered if its group reg', async () => {
    const regCart = getIn(initialState, ['registrationForm', 'regCart']);
    let updatedRegCart = setIn(regCart, ['groupRegistration'], true);
    const guestEventRegistration1 = {
      eventRegistrationId: '00000000-0000-0000-0000-000000000002',
      attendee: {
        personalInformation: {
          firstName: 'Atreus',
          lastName: 'jkActuallyLoki'
        }
      },
      primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
      requestedAction: 'REGISTER',
      attendeeType: 'GUEST',
      displaySequence: 1,
      sessionRegistrations: {}
    };
    const guestEventRegistration2 = {
      eventRegistrationId: '00000000-0000-0000-0000-000000000003',
      attendee: {
        personalInformation: {
          firstName: 'Freeloading',
          lastName: 'Freeloader'
        }
      },
      primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
      requestedAction: 'REGISTER',
      attendeeType: 'GUEST',
      displaySequence: 2,
      sessionRegistrations: {}
    };
    updatedRegCart = setIn(
      updatedRegCart,
      ['eventRegistrations', guestEventRegistration1.eventRegistrationId],
      guestEventRegistration1
    );
    updatedRegCart = setIn(
      updatedRegCart,
      ['eventRegistrations', guestEventRegistration2.eventRegistrationId],
      guestEventRegistration2
    );
    const updatedInitialState = setIn(initialState, ['registrationForm', 'regCart'], updatedRegCart);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot('Widget Renders with guests who have zero fee products');
  });

  test('Check primary and guest are rendered if primary does have any charges but guest does', async () => {
    const regCart = getIn(initialState, ['registrationForm', 'regCart']);
    let updatedRegCart = setIn(regCart, ['groupRegistration'], true);
    const guestEventRegistration1 = {
      eventRegistrationId: '00000000-0000-0000-0000-000000000002',
      attendee: {
        personalInformation: {
          firstName: 'Liara',
          lastName: "T'Soni"
        }
      },
      primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
      requestedAction: 'REGISTER',
      attendeeType: 'GUEST',
      displaySequence: 1,
      sessionRegistrations: {}
    };
    const guestEventRegistration2 = {
      eventRegistrationId: '00000000-0000-0000-0000-000000000003',
      attendee: {
        personalInformation: {
          firstName: 'Garrus',
          lastName: 'Vakarian'
        }
      },
      primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
      requestedAction: 'REGISTER',
      attendeeType: 'GUEST',
      displaySequence: 2,
      sessionRegistrations: {}
    };
    updatedRegCart = setIn(
      updatedRegCart,
      ['eventRegistrations', guestEventRegistration1.eventRegistrationId],
      guestEventRegistration1
    );
    updatedRegCart = setIn(
      updatedRegCart,
      ['eventRegistrations', guestEventRegistration2.eventRegistrationId],
      guestEventRegistration2
    );
    const updatedRegCartPricing = {
      productSubTotalAmountCharge: 10,
      netFeeAmountCharge: 10,
      productFeeAmountRefund: 210,
      productSubTotalAmountRefund: 210,
      netFeeAmountRefund: 0,
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
          productPricings: []
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
        }
      ]
    };
    let updatedInitialState = setIn(initialState, ['registrationForm', 'regCart'], updatedRegCart);
    updatedInitialState = setIn(updatedInitialState, ['regCartPricing'], updatedRegCartPricing);
    const component = await mountWidget(updatedInitialState);
    expect(component).toMatchSnapshot('Widget Renders with primary and guest');
  });
});

describe('Tests for PaymentWidget with quantity items', () => {
  beforeEach(() => {
    resetReactiveVars();
  });
  const quantityItemRegCartPricing = {
    productSubTotalAmountCharge: 10,
    netFeeAmountCharge: 10,
    productFeeAmountRefund: 0,
    productSubTotalAmountRefund: 0,
    netFeeAmountRefund: 0,
    plannerOverriddenProductFees: {},
    plannerOverriddenProductRefunds: {},
    eventRegistrationPricings: [
      {
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        productFeeAmountCharge: 10,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 10,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 10,
        netFeeAmountRefund: 0,
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
            productType: 'QuantityItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
                priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                productPriceTierBaseFeeAmountPerItem: 10,
                productFeeAmountPerItem: 10,
                productFeeAmount: 10,
                productSubTotalAmount: 10,
                netFeeAmount: 10
              }
            ],
            pricingRefunds: [],
            productFeeAmountCharge: 10,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 10,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 10,
            netFeeAmountRefund: 0
          }
        ]
      }
    ]
  };

  test('Check quantity items prices are rendered', async () => {
    const updatedInitialState = setIn(initialState, ['regCartPricing'], quantityItemRegCartPricing);
    let component = await mountWidget(updatedInitialState);
    component = component.find('[data-cvent-id="widget-Payment-widget:payment-origSubTotal"]');
    expect(component).toMatchSnapshot('Widget Renders with quantity item info');
  });

  test('Check quantity items are rendered with planner overriden prices', async () => {
    const updatedRegCartPricing = {
      ...quantityItemRegCartPricing,
      eventRegistrationPricings: [
        {
          ...quantityItemRegCartPricing.eventRegistrationPricings[0],
          productPricings: [
            {
              productId: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
              productType: 'QuantityItem',
              pricingCharges: [
                {
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
                  priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 10,
                  productFeeAmount: 10,
                  productSubTotalAmount: 10,
                  netFeeAmount: 10
                },
                {
                  quantity: 1,
                  quantityPrevious: 0,
                  feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
                  priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
                  productPriceTierBaseFeeAmountPerItem: 10,
                  productFeeAmountPerItem: 5,
                  productFeeAmount: 10,
                  productSubTotalAmount: 5,
                  netFeeAmount: 5
                }
              ],
              pricingRefunds: [],
              productFeeAmountCharge: 20,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 15,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 15,
              netFeeAmountRefund: 0
            }
          ]
        }
      ],
      plannerOverriddenProductFees: {
        '00000000-0000-0000-0000-000000000001': {
          'ce8784ca-0373-4560-9d74-3ff58d15c151': 20.0
        }
      }
    };

    let updatedInitialState = setIn(initialState, ['defaultUserSession', 'isPlanner'], true);
    updatedInitialState = setIn(updatedInitialState, ['regCartPricing'], updatedRegCartPricing);
    const paymentWidgetComponent = await mountWidget(updatedInitialState);
    plannerOverriddenProductFeesVar(updatedRegCartPricing.plannerOverriddenProductFees);
    await paymentWidgetComponent.update();
    paymentWidgetComponent.find('[data-cvent-id="override-prices-edit"]').first().simulate('click');
    await waitWithAct();
    await paymentWidgetComponent.update();
    expect(paymentWidgetComponent).toMatchSnapshot('Widget renders a single text input for split charges');
    paymentWidgetComponent.find('[data-cvent-id="override-prices-save"]').first().simulate('click');
    await waitWithAct();
    await paymentWidgetComponent.update();
    const subtotalComponent = paymentWidgetComponent.find(
      '[data-cvent-id="widget-Payment-widget:payment-origSubTotal"]'
    );

    // snapshot shows the edited 20 price instead of the 10
    expect(subtotalComponent).toMatchSnapshot('Widget Renders with planner override price for quantity items');
  });

  test('Check quantity items refunds are rendered', async () => {
    const updatedRegCartPricing = {
      productFeeAmountCharge: 0,
      productFeeAmountRefund: 20,
      productSubTotalAmountCharge: 0,
      productSubTotalAmountRefund: 20,
      netFeeAmountCharge: 0,
      netFeeAmountChargeWithPaymentAmountServiceFee: 0,
      netFeeAmountRefund: 20,
      inviteeTypeServiceFeePricingCharges: {},
      paymentTypeServiceFeePricingCharges: {},
      inviteeTypeServiceFeePricingRefunds: {},
      paymentTypeServiceFeePricingRefunds: {},
      taxPricingCharges: {},
      taxPricingRefunds: {},
      plannerOverriddenProductFees: {},
      plannerOverriddenProductRefunds: {},
      isEditPrice: false,
      isEditRefund: false,
      eventRegistrationPricings: [
        {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 20,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 20,
          netFeeAmountCharge: 0,
          netFeeAmountChargeWithPaymentTypeServiceFee: 0,
          netFeeAmountRefund: 20,
          productPricings: [
            {
              productId: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
              productType: 'QuantityItem',
              productFeeAmountCharge: 0,
              productFeeAmountRefund: 20,
              productSubTotalAmountCharge: 0,
              productSubTotalAmountRefund: 20,
              netFeeAmountCharge: 0,
              netFeeAmountRefund: 20,
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
                }
              ]
            }
          ]
        }
      ]
    };

    const updatedInitialState = setIn(initialState, ['regCartPricing'], updatedRegCartPricing);
    let component = await mountWidget(updatedInitialState);
    component = component.find('[data-cvent-id="widget-Payment-widget:payment-refundTotal"]');
    expect(component).toMatchSnapshot('Widget Renders with quantity item refund info');
  });

  test('Check quantity items zero dollar refunds are rendered', async () => {
    const updatedRegCartPricing = {
      productFeeAmountCharge: 0,
      productFeeAmountRefund: 0,
      productSubTotalAmountCharge: 0,
      productSubTotalAmountRefund: 0,
      netFeeAmountCharge: 0,
      netFeeAmountChargeWithPaymentAmountServiceFee: 0,
      netFeeAmountRefund: 0,
      inviteeTypeServiceFeePricingCharges: {},
      paymentTypeServiceFeePricingCharges: {},
      inviteeTypeServiceFeePricingRefunds: {},
      paymentTypeServiceFeePricingRefunds: {},
      taxPricingCharges: {},
      taxPricingRefunds: {},
      plannerOverriddenProductFees: {},
      plannerOverriddenProductRefunds: {},
      isEditPrice: false,
      isEditRefund: false,
      eventRegistrationPricings: [
        {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          netFeeAmountChargeWithPaymentTypeServiceFee: 0,
          netFeeAmountRefund: 0,
          productPricings: [
            {
              productId: 'ce8784ca-0373-4560-9d74-3ff58d15c151',
              productType: 'QuantityItem',
              productFeeAmountCharge: 0,
              productFeeAmountRefund: 0,
              productSubTotalAmountCharge: 0,
              productSubTotalAmountRefund: 0,
              netFeeAmountCharge: 0,
              netFeeAmountRefund: 0,
              pricingRefunds: [
                {
                  quantity: 2,
                  quantityPrevious: 3,
                  feeId: '65a3595f-8bd6-4ad0-a5ab-f76a71ae53a3',
                  priceTierId: '51cc062b-16e8-46c8-9df5-bc2bf2b3b4b5',
                  productPriceTierBaseFeeAmountPerItem: 0,
                  productFeeAmountPerItem: 0,
                  productFeeAmount: 0,
                  productSubTotalAmount: 0,
                  netFeeAmount: 0,
                  chargeOrderDetailId: '44702478-e6ce-4bea-b520-f8f5d4ff5801',
                  originalAmountCharged: 10
                }
              ]
            }
          ]
        }
      ]
    };

    const updatedInitialState = setIn(initialState, ['regCartPricing'], updatedRegCartPricing);
    let component = await mountWidget(updatedInitialState);
    component = component.find('[data-cvent-id="widget-Payment-widget:payment-refundTotal"]');
    expect(component).toMatchSnapshot('Widget Renders with quantity item zero dollar refund info');
  });
  test('Check quantity items split charges are rendered', async () => {
    // Undiscounted, unsplit charge
    const baseCharge = {
      quantity: 4,
      quantityPrevious: 0,
      feeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
      priceTierId: 'c1c0f4c5-0ca6-4fe0-a9b6-b81038e94dc7',
      productPriceTierBaseFeeAmountPerItem: 10,
      productFeeAmountPerItem: 10,
      productFeeAmount: 40,
      productSubTotalAmount: 40,
      netFeeAmount: 40
    };

    const splitCharges = [
      {
        ...baseCharge,
        quantity: 3,
        productPriceTierBaseFeeAmountPerItem: 10,
        productFeeAmountPerItem: 5,
        productFeeAmount: 30,
        productSubTotalAmount: 15,
        netFeeAmount: 15
      },
      {
        ...baseCharge,
        quantity: 1,
        productPriceTierBaseFeeAmountPerItem: 10,
        productFeeAmountPerItem: 4.99,
        productFeeAmount: 10,
        productSubTotalAmount: 4.99,
        netFeeAmount: 4.99
      }
    ];

    const pricing = cloneDeep(quantityItemRegCartPricing);
    const quantityItemPricing = pricing.eventRegistrationPricings[0].productPricings[0];
    quantityItemPricing.pricingCharges = splitCharges;

    const updatedInitialState = {
      ...cloneDeep(initialState),
      regCartPricing: pricing
    };

    const component = await mountWidget(updatedInitialState);

    expect(getPaymentInfo(updatedInitialState, pricing)).toMatchSnapshot('Payment info for split charges');

    expect(component).toMatchSnapshot('Quantity item split charges');
  });
});

describe('test for setting payment method/type', () => {
  beforeEach(() => {
    (setCreditCardField as $TSFixMe).mockClear();
    resetReactiveVars();
  });
  test('sets payment type to offline if on cclp path and paymentType isnt offline already', async () => {
    const stateWithCCLP = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'eventRegistrationId', 'paymentSettings', 'creditCard', 'processOffline'],
      true
    );
    let component = await mountWidget(stateWithCCLP);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'regCartPayment with processOffline true'
    );
    expect(setSelectedPaymentMethod).toHaveBeenCalledWith('creditCard');
    expect(mockStore.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.OFFLINE
    );

    component.unmount();

    // verify set credit card dispatches the right settings
    component = await mountWidget2(stateWithCCLP);
    const setPaymentType = jest.requireActual<$TSFixMe>(
      '../../redux/registrationForm/regCartPayment/actions'
    ).setCreditCardPaymentType;
    mockStore.dispatch(setPaymentType('creditCard'));
    const actions = mockStore.getActions();

    const expectedPayload = {
      path: ['pricingInfo', 'creditCard', 'paymentType'],
      value: PAYMENT_TYPE.OFFLINE
    };

    expect(actions[actions.length - 1].type).toEqual(SET_REG_CART_PAYMENT_FIELD_VALUE);
    expect(actions[actions.length - 1].payload).toEqual(expectedPayload);
  });

  test('doesnt set payment type to offline if on cclp path and paymentType is offline already', async () => {
    let stateWithCCLP = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'eventRegistrationId', 'paymentSettings', 'creditCard', 'processOffline'],
      true
    );
    stateWithCCLP = setIn(
      stateWithCCLP,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );
    let component = await mountWidget(stateWithCCLP);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'regCartPayment with processOffline true'
    );
    expect(setSelectedPaymentMethod).toHaveBeenCalledWith('creditCard');
    expect(setCreditCardField).not.toHaveBeenCalled();
    expect(mockStore.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.OFFLINE
    );

    component.unmount();
    // verify that the set payment field isn't called if already set to the type we need
    component = await mountWidget2(initialState);
    const setPaymentType = jest.requireActual<$TSFixMe>(
      '../../redux/registrationForm/regCartPayment/actions'
    ).setCreditCardPaymentType;
    mockStore.dispatch(setPaymentType('creditCard'));
    const actions = mockStore.getActions();
    actions.forEach(action => expect(action.type).not.toEqual(SET_REG_CART_PAYMENT_FIELD_VALUE));
  });

  test('sets payment type to online if was previously set to offline on cclp path and paymentType is offline already', async () => {
    const stateWithCCLP = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );
    let component = await mountWidget(stateWithCCLP);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot(
      'regCartPayment with processOffline true'
    );
    expect(setSelectedPaymentMethod).toHaveBeenCalledWith('creditCard');
    expect(mockStore.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.ONLINE
    );

    component.unmount();

    // verify set credit card dispatches the right settings
    component = await mountWidget2(stateWithCCLP);
    const setPaymentType = jest.requireActual<$TSFixMe>(
      '../../redux/registrationForm/regCartPayment/actions'
    ).setCreditCardPaymentType;
    mockStore.dispatch(setPaymentType('creditCard'));

    const actions = mockStore.getActions();
    const expectedPayload = {
      path: ['pricingInfo', 'creditCard', 'paymentType'],
      value: PAYMENT_TYPE.ONLINE
    };
    expect(actions[actions.length - 1].type).toEqual(SET_REG_CART_PAYMENT_FIELD_VALUE);
    expect(actions[actions.length - 1].payload).toEqual(expectedPayload);
  });

  test('keeps paymentType as online on path without cclp', async () => {
    let component = await mountWidget(initialState);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });
    expect(mockStore.getState().registrationForm.regCartPayment).toMatchSnapshot('defaultRegCartPayment');
    expect(setSelectedPaymentMethod).toHaveBeenCalledWith('creditCard');
    expect(setCreditCardField).not.toHaveBeenCalled();
    expect(mockStore.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.ONLINE
    );

    component.unmount();
    // verify that the set payment field isn't called if already set to the type we need
    component = await mountWidget2(initialState);
    const setPaymentType = jest.requireActual<$TSFixMe>(
      '../../redux/registrationForm/regCartPayment/actions'
    ).setCreditCardPaymentType;
    mockStore.dispatch(setPaymentType('creditCard'));
    const actions = mockStore.getActions();
    actions.forEach(action => expect(action.type).not.toEqual(SET_REG_CART_PAYMENT_FIELD_VALUE));
  });
});

describe('webpayments form cclp integration tests', () => {
  test('shows the webpayments form when in both correct experiments and payment type offline', async () => {
    let stateWithCCLP = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );
    stateWithCCLP = setIn(
      stateWithCCLP,
      ['appData', 'registrationPathSettings', 'eventRegistrationId', 'paymentSettings', 'creditCard', 'processOffline'],
      true
    );

    const component = await mountWidget(stateWithCCLP, true, CREDIT_CARD_FOR_LATER_PROCESSING_WEBPAYMENTS_FORM_VARIANT);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    await waitWithAct();
    await component.update();

    const temp = component.find('[data-cvent-id="credit-card-webpayment-form"]');
    expect(temp).toMatchSnapshot();
    expect(temp.length).toEqual(1);
  });

  test('doesnt show the webpayments form when in only one correct exp and payment type offline', async () => {
    let stateWithCCLP = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );
    stateWithCCLP = setIn(
      stateWithCCLP,
      ['appData', 'registrationPathSettings', 'eventRegistrationId', 'paymentSettings', 'creditCard', 'processOffline'],
      true
    );

    const component = await mountWidget(stateWithCCLP, true, 0);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    await waitWithAct();
    await component.update();

    const temp = component.find('[data-cvent-id="credit-card-payment-form"]');
    expect(temp).toMatchSnapshot();
    expect(temp.length).toEqual(1);
  });

  test('doesnt show the webpayments form when in the incorrect exp and paymenttype offline', async () => {
    let stateWithCCLP = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );
    stateWithCCLP = setIn(
      stateWithCCLP,
      ['appData', 'registrationPathSettings', 'eventRegistrationId', 'paymentSettings', 'creditCard', 'processOffline'],
      true
    );

    const component = await mountWidget(stateWithCCLP, false);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    await waitWithAct();
    await component.update();

    const temp = component.find('[data-cvent-id="credit-card-payment-form"]');
    expect(temp).toMatchSnapshot();
    expect(temp.length).toEqual(1);
  });

  test('shows the webpayments form when in the correct exp and paymentType is online', async () => {
    const component = await mountWidget(initialState, true);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    await waitWithAct();
    await component.update();

    const temp = component.find('[data-cvent-id="credit-card-webpayment-form"]');
    expect(temp).toMatchSnapshot();
    expect(temp.length).toEqual(1);
  });

  test('doesnt show the webpayments form when in the incorrect exp and paymentType is online', async () => {
    const component = await mountWidget(initialState, false);
    component
      .find('[data-cvent-id="paymentMethod-creditCard"]')
      .find('input')
      .simulate('change', { target: { checked: true } });

    await waitWithAct();
    await component.update();

    const temp = component.find('[data-cvent-id="credit-card-payment-form"]');

    expect(temp).toMatchSnapshot();
    expect(temp.length).toEqual(1);
  });
});

describe('Tests for Order Summary widget visibility', () => {
  test('should not render order summary when total == 0', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .value();
    const component = await mountWidget(updatedInitialState, false, FEATURE_RELEASE_DEVELOPMENT_VARIANT);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(true);
    // refund order summary is still rendered
    expect(component.find('OrderSummary')).toHaveLength(1);
  });

  test('should render order summary widget when total == 0 but discount was applied', async () => {
    const updatedInitialState = setIn(initialState, ['regCartPricing'], regCartPricingWithRefundsAndNoTotal);
    const component = await mountWidget(updatedInitialState, false, FEATURE_RELEASE_DEVELOPMENT_VARIANT);

    await waitWithAct();
    await component.update();

    // Payment Order Summary widget should be rendered when registrant due is $0
    // but discount applied or payment credits applied resulting in $0
    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(false);
  });

  test('should render order summary widget for planner registration when total == 0 but at least one fee (session) created for an event', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      // remove discounts and fees
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .setIn(['defaultUserSession', 'isPlanner'] as const, true)
      .setIn(['event', 'products', 'serviceFees'] as const, {})
      .updateIn(['event', 'products', 'admissionItems'] as const, admItems => {
        return mapValues(admItems, admItem => setIn(admItem, ['fees'] as const, {}));
      })
      // set fee for a session
      .updateIn(['visibleProducts', 'Widget', 'sessionProducts'] as const, () => {
        return {
          '0e1c5dcf-b735-4e1f-a1da-740223f5b2d4': {
            fees: {
              'd139c987-c733-481f-a081-dc2a05ada52b': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'session 2 fee',
                id: 'd139c987-c733-481f-a081-dc2a05ada52b',
                amount: 2000,
                chargePolicies: [],
                refundPolicies: []
              }
            }
          }
        };
      })
      .value();
    const component = await mountWidget(updatedInitialState, false, FEATURE_RELEASE_DEVELOPMENT_VARIANT);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(false);
  });

  test('should render order summary widget for planner registration when total == 0 but at least one fee (quantity item) created for an event', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      // remove discounts and fees
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .setIn(['defaultUserSession', 'isPlanner'] as const, true)
      .setIn(['event', 'products', 'serviceFees'] as const, {})
      .updateIn(['event', 'products', 'admissionItems'] as const, admItems => {
        return Object.keys(admItems).reduce((result, id) => {
          // eslint-disable-next-line no-param-reassign
          result[id] = setIn(admItems[id], ['fees'] as const, {});
          return result;
        }, {});
      })
      .setIn(['visibleProducts', 'Widget', 'sessionProducts'] as const, {})
      // set fee for a quantity item
      .updateIn(['visibleProducts', 'Widget', 'quantityItems'] as const, () => {
        return {
          'ce8784ca-0373-4560-9d74-3ff58d15c151': {
            fees: {
              '65a3595f-8bd6-4ad0-a5ab-f76a71ae53a3': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'qi fee',
                id: '65a3595f-8bd6-4ad0-a5ab-f76a71ae53a3',
                amount: 2000,
                chargePolicies: [],
                refundPolicies: []
              }
            }
          }
        };
      })
      .value();
    const component = await mountWidget(updatedInitialState, false, FEATURE_RELEASE_DEVELOPMENT_VARIANT);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(false);
  });

  test('should render order summary widget for planner registration when total == 0 but at least one fee (membership item) created for an event', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      // remove discounts and fees
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .setIn(['defaultUserSession', 'isPlanner'] as const, true)
      .setIn(['event', 'products', 'serviceFees'] as const, {})
      .updateIn(['event', 'products', 'admissionItems'] as const, admItems => {
        return Object.keys(admItems).reduce((result, id) => {
          // eslint-disable-next-line no-param-reassign
          result[id] = setIn(admItems[id], ['fees'] as const, {});
          return result;
        }, {});
      })
      .setIn(['visibleProducts', 'Widget', 'sessionProducts'] as const, {})
      .value();

    const component = await mountWidget(updatedInitialState, false, FEATURE_RELEASE_DEVELOPMENT_VARIANT);
    membershipItemsVar([
      {
        id: 'id',
        code: 'm1',
        description: 'd1',
        name: 'membershipItem1',
        amount: 20,
        membershipItemId: 'id1',
        renewal: false
      }
    ]);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(false);
  });

  test('should not render for planner registration when total == 0 and no fees created for an event', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      // remove discounts and fees
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .setIn(['defaultUserSession', 'isPlanner'] as const, true)
      .setIn(['event', 'products', 'serviceFees'] as const, {})
      .setIn(['event', 'products', 'serviceFees'] as const, {})
      .updateIn(['event', 'products', 'admissionItems'] as const, admItems => {
        return Object.keys(admItems).reduce((result, id) => {
          // eslint-disable-next-line no-param-reassign
          result[id] = setIn(admItems[id], ['fees'] as const, {});
          return result;
        }, {});
      })
      .updateIn(['visibleProducts', 'Widget', 'sessionProducts'] as const, sessions => {
        return Object.keys(sessions).reduce((result, id) => {
          // eslint-disable-next-line no-param-reassign
          result[id] = setIn(sessions[id], ['fees'] as const, {});
          return result;
        }, {});
      })
      .value();

    const component = await mountWidget(updatedInitialState, false, FEATURE_RELEASE_DEVELOPMENT_VARIANT);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(true);
  });

  test('should render order summary widget when feature release < 15 and total > 0', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      .setIn(['productFeeAmountCharge'] as const, 20)
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .value();
    const component = await mountWidget(updatedInitialState, false, 0);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(false);
    // refund order summary is still rendered
    expect(component.find('OrderSummary')).toHaveLength(2);
  });

  test('should render order summary widget when feature release < 15 and total == 0', async () => {
    const updatedInitialState = icepick
      .chain(initialState)
      .setIn(['regCartPricing'] as const, regCartPricingWithRefundsAndNoTotal)
      .setIn(['registrationForm', 'regCart', 'discounts'] as const, {})
      .value();
    const component = await mountWidget(updatedInitialState, false, 0);

    await waitWithAct();
    await component.update();

    expect(component.find('PaymentWidget').prop('isOrderSummaryHidden')).toEqual(false);
    // refund order summary is still rendered
    expect(component.find('OrderSummary')).toHaveLength(2);
  });
});
