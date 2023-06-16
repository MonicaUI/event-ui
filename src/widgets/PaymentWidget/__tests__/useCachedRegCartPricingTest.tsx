import React from 'react';
import configureStore from '../../../redux/configureStore';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { Provider } from 'react-redux';
import { useCachedRegCartPricing } from '../useCachedRegCartPricing';
// eslint-disable-next-line jest/no-mocks-import
import { MOCK_GET_REG_CART_PRICING } from '../__mocks__/useCachedRegCartPricing';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks } from '../__mocks__/apolloClient';
jest.mock('../useCachedRegCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../useCachedRegCartPricing'),
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
jest.mock('../regCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../regCartPricing'),
  getRegCartPricingGQL: () => {
    return MOCK_GET_REG_CART_PRICING;
  }
}));

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
      },
      '02ecb4d5-ea33-4044-9d10-51eb65b1e78a': {
        paymentSettings: {}
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
          },
          allowDiscountCodes: true,
          allowOverlappingSessions: true,
          allowWaitlist: true,
          allowsGroupRegistration: true,
          allowsSessionSelection: true,
          associatedRegistrationTypes: [],
          cancellation: {
            enabled: true
          },
          code: 'EventSiteEditor_RegistrationPath_DefaultName__resx',
          groupRegistrationSettings: {
            isGroupRegistrationEnabled: false,
            maxGroupRegistrantsAllowed: 10,
            registrationTypeSettings: {
              limitVisibility: false,
              categorizedRegistrationTypes: []
            }
          },
          groupSettings: {
            maxGroupMembersAllowed: 0
          },
          guestRegistrationSettings: {
            isGuestProductSelectionEnabled: true,
            isGuestRegistrationEnabled: true,
            maxGuestsAllowedOnRegPath: 5
          },
          isActive: true,
          isDefault: true,
          name: 'EventSiteEditor_RegistrationPath_DefaultName__resx'
        }
      }
    }
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  registrationForm: {
    discountCodeStatus: '',
    ignoreTaxes: false,
    ignoreServiceFee: false,
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
      }
    },
    currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
    currentGuestEventRegistration: {},
    errors: {},
    regCart: {
      ignoreTaxes: false,
      ignoreServiceFee: false,
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
        guest2: {
          // without discount name. UI does not sort non-auto apply discount by name.
          discountCode: 'guest2',
          isAutoApplied: false
        }
      },
      volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
          attendee: {
            personalInformation: {
              firstName: 'm',
              lastName: 'd'
            }
          },
          attendeeType: 'ATTENDEE',
          displaySequence: 1,
          eventId: '1efacd58-d0aa-4984-929e-7a65648270bb',
          registrationPathId: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
          requestedAction: 'REGISTER',
          sessionRegistrations: {
            '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
              includedInAgenda: false,
              productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
              registrationSourceType: 'Included',
              requestedAction: 'REGISTER'
            },
            'bd0d311c-68a8-4706-bee1-2ca42023a339': {
              includedInAgenda: false,
              productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
              registrationSourceType: 'Selected',
              requestedAction: 'REGISTER'
            }
          }
        },
        '55e6409a-1f00-4c67-b586-9666229d9dc9': {
          eventRegistrationId: '55e6409a-1f00-4c67-b586-9666229d9dc9',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
          attendee: {
            personalInformation: {
              firstName: 'abc',
              lastName: 'Guest 02'
            }
          },
          attendeeType: 'GUEST',
          displaySequence: 2,
          eventId: '1efacd58-d0aa-4984-929e-7a65648270bb',
          registrationPathId: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
          requestedAction: 'REGISTER',
          sessionRegistrations: {
            '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
              includedInAgenda: false,
              productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
              registrationSourceType: 'Included',
              requestedAction: 'REGISTER'
            },
            'bd0d311c-68a8-4706-bee1-2ca42023a339': {
              includedInAgenda: false,
              productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
              registrationSourceType: 'Selected',
              requestedAction: 'REGISTER'
            }
          }
        },
        '8587d261-af1d-423d-a406-eb305ca124f3': {
          eventRegistrationId: '8587d261-af1d-423d-a406-eb305ca124f3',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
          attendee: {
            personalInformation: {
              firstName: 'def',
              lastName: 'Guest 01'
            }
          },
          attendeeType: 'GUEST',
          displaySequence: 1,
          eventId: '1efacd58-d0aa-4984-929e-7a65648270bb',
          registrationPathId: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
          requestedAction: 'REGISTER',
          sessionRegistrations: {
            '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
              includedInAgenda: false,
              productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
              registrationSourceType: 'Included',
              requestedAction: 'REGISTER'
            },
            'bd0d311c-68a8-4706-bee1-2ca42023a339': {
              includedInAgenda: false,
              productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
              registrationSourceType: 'Selected',
              requestedAction: 'REGISTER'
            }
          }
        }
      },
      groupRegistration: false,
      regCartId: 'a81a9d4d-cfa8-4464-bf8f-7e51d94a3f13',
      status: 'INPROGRESS'
    },
    validationMessages: []
  },
  regCartPricing: {
    isEditPrice: false,
    isEditRefund: false,
    netFeeAmountCharge: 1200,
    netFeeAmountRefund: 0,
    productFeeAmountCharge: 1200,
    productSubTotalAmountCharge: 1200,
    productFeeAmountRefund: 0,
    productSubTotalAmountRefund: 0,
    regCartId: 'a81a9d4d-cfa8-4464-bf8f-7e51d94a3f13',
    plannerOverriddenProductFees: {},
    plannerOverriddenProductRefunds: {},
    eventRegistrationPricings: [
      {
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        productFeeAmountCharge: 400,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 400,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 400,
        netFeeAmountRefund: 0,
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
            productType: 'Session',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
                productPriceTierBaseFeeAmountPerItem: 400,
                productFeeAmountPerItem: 400,
                productFeeAmount: 400,
                productSubTotalAmount: 400,
                netFeeAmount: 400
              }
            ],
            pricingRefunds: [],
            productFeeAmountCharge: 400,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 400,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 400,
            netFeeAmountRefund: 0
          },
          {
            productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
            productType: 'Session',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
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
          },
          {
            productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
            productType: 'AdmissionItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
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
      },
      {
        eventRegistrationId: '8587d261-af1d-423d-a406-eb305ca124f3',
        productFeeAmountCharge: 400,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 400,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 400,
        netFeeAmountRefund: 0,
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
            productType: 'Session',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
                productPriceTierBaseFeeAmountPerItem: 400,
                productFeeAmountPerItem: 400,
                productFeeAmount: 400,
                productSubTotalAmount: 400,
                netFeeAmount: 400
              }
            ],
            pricingRefunds: [],
            productFeeAmountCharge: 400,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 400,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 400,
            netFeeAmountRefund: 0
          },
          {
            productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
            productType: 'Session',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
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
          },
          {
            productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
            productType: 'AdmissionItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
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
      },
      {
        eventRegistrationId: '55e6409a-1f00-4c67-b586-9666229d9dc9',
        productFeeAmountCharge: 400,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 400,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 400,
        netFeeAmountRefund: 0,
        regCartStatus: {},
        registrantLogin: {},
        routing: {},
        productPricings: [
          {
            productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
            productType: 'Session',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
                productPriceTierBaseFeeAmountPerItem: 400,
                productFeeAmountPerItem: 400,
                productFeeAmount: 400,
                productSubTotalAmount: 400,
                netFeeAmount: 400
              }
            ],
            pricingRefunds: [],
            productFeeAmountCharge: 400,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 400,
            productSubTotalAmountRefund: 0,
            netFeeAmountCharge: 400,
            netFeeAmountRefund: 0
          },
          {
            productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
            productType: 'Session',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
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
          },
          {
            productId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
            productType: 'AdmissionItem',
            pricingCharges: [
              {
                quantity: 1,
                quantityPrevious: 0,
                feeId: 'cc456b54-8897-4924-b287-30a0fb8592f1',
                priceTierId: '5420a3c6-0aea-4ab0-a210-a110039fadcb',
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
  event: {
    eventFeatureSetup: {
      fees: {
        merchantAccountId: 'merchantAccountId',
        fees: true,
        discounts: true,
        taxes: true,
        serviceFees: true
      }
    }
  },
  regCartStatus: {
    lastSavedRegCart: {}
  },
  travelCart: {
    cart: {}
  },
  experiments: {}
};

const apolloClientMocks = getApolloClientMocks(initialState);

const defaultProps = {
  style: {},
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  config: {
    shared: {
      paymentInstructions: 'Payment Instructions',
      orderHeader: 'Order Header',
      paymentHeader: 'Payment Header'
    }
  },
  ignoreServiceFees: false,
  ignoreTaxes: false,
  id: 'widget:payment',
  'data-cvent-id': 'widget-Payment-widget:payment'
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TestComponent = _props => {
  const query = useCachedRegCartPricing();
  const regCartPricing = (query as $TSFixMe).data?.pricing?.regCartPricing;
  return <pre>{JSON.stringify(regCartPricing, null, 2)}</pre>;
};

const mountComponent = async () => {
  const component = mount(
    <Provider store={configureStore(initialState, {})}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
        <TestComponent {...defaultProps} />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('useCachedRegCartPricing', () => {
  it('should render with query result', async () => {
    const component = await mountComponent();
    expect(component).toMatchSnapshot();
  });
});
