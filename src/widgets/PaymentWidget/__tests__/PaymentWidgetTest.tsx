import React from 'react';
import configureStore from '../../../redux/configureStore';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import PaymentWidget from '..';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { Provider } from 'react-redux';
import { merge } from 'lodash';
import Form from 'nucleus-form/src/components/Form';
import { Grid } from 'nucleus-core/layout/flexbox';
// eslint-disable-next-line jest/no-mocks-import
import { MOCK_GET_REG_CART_PRICING } from '../__mocks__/useCachedRegCartPricing';
import { MINIMUM_PAYMENT_AMOUNT_TYPE } from 'event-widgets/utils/paymentConstant';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import HotelsDataFixture from 'event-widgets/lib/HotelRequest/HotelsDataFixture.json';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient, RegCartClientWithServiceError } from '../__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient, getApolloClientMocks } from '../__mocks__/apolloClient';
import { updateDiscountCodes } from '../actions';
import { setIn } from 'icepick';
jest.mock('../getRegCartPricingAction', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: async (state, _) => {
    return state;
  }
}));
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
import {
  isEditPriceVar,
  isEditRefundVar,
  plannerOverriddenProductFeesVar,
  plannerOverriddenProductRefundsVar,
  plannerOverriddenProductFeesSavedVar,
  plannerOverriddenProductRefundsSavedVar
} from '../regCartPricing';
jest.mock('../regCartPricing', () => ({
  ...jest.requireActual<$TSFixMe>('../regCartPricing'),
  getRegCartPricingGQL: () => {
    return MOCK_GET_REG_CART_PRICING;
  }
}));

jest.mock('../actions', () => ({
  ...jest.requireActual<$TSFixMe>('../actions'),
  updateDiscountCodes: jest.fn(() => () => {})
}));

const mockOpenAlreadyRegisteredDialog = jest.fn();
jest.mock('../../../dialogs/AlreadyRegisteredDialog', () => ({
  openAlreadyRegisteredDialog: () => () => {
    mockOpenAlreadyRegisteredDialog();
  }
}));

jest.mock('../../../redux/registrationForm/regCart', () => ({
  updateRegCart: (state, regCartClient, accessToken, regCart) => {
    // Call a mock client. Triggers a ServiceError in some test cases.
    regCartClient.updateRegCart();
    // Return the updated reg cart that was passed in to mock successful request.
    return Promise.resolve({ regCart, validationMessages: [] });
  }
}));
const loadMetaDataFunction = () => {
  return {
    appDataFieldPaths: {
      paymentSettings: 'registrationPathSettings.eventRegistrationId.paymentSettings',
      partialPaymentSettings: 'registrationPathSettings.eventRegistrationId.partialPaymentSettings'
    }
  };
};

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
          discountCode: 'Guest2',
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
          'bd0d311c-68a8-4706-bee1-2ca42023a339': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2017-11-13T23:00:00.000Z',
            endTime: '2017-11-14T00:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            code: '',
            description: '',
            id: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
            capacityId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
            name: 'session 02',
            status: 2,
            type: 'Session',
            defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
            fees: {
              'd139c987-c733-481f-a081-dc2a05ada52b': {
                isActive: true,
                isRefundable: true,
                registrationTypes: [],
                name: 'Complimentary',
                id: 'd139c987-c733-481f-a081-dc2a05ada52b',
                amount: 0,
                chargePolicies: [
                  {
                    id: 'e12b7b0e-20ad-410d-b658-7b5bcb32ae26',
                    isActive: true,
                    effectiveUntil: '2999-12-31T00:00:00.000Z',
                    amount: 0,
                    maximumRefundAmount: 0
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
        includedSessions: {
          '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2017-11-13T23:00:00.000Z',
            endTime: '2017-11-14T00:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: true,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            code: '',
            description: '',
            id: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
            capacityId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
            name: 'session 01',
            status: 2,
            type: 'Session',
            defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
            fees: {}
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
        '57d0761e-43b8-46f1-a719-366d8c8f63a1': {
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
          id: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          capacityId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          name: 'Event Registration',
          status: 2,
          type: 'AdmissionItem',
          defaultFeeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
          fees: {}
        }
      }
    },
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
  defaultUserSession: { isPlanner: false },
  eventTravel: {
    hotelsData: HotelsDataFixture
  },
  partialPaymentSettings: {
    enabled: true,
    enabledOnPostRegPaymentPage: false,
    minimumPaymentAmountType: MINIMUM_PAYMENT_AMOUNT_TYPE.AMOUNT,
    minimumPaymentAmount: '20',
    paymentDistributionMethodType: '1',
    productPriorityList: []
  },
  visibleProducts: {
    Widget: {
      admissionItems: {
        '57d0761e-43b8-46f1-a719-366d8c8f63a1': {
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
          id: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          capacityId: '57d0761e-43b8-46f1-a719-366d8c8f63a1',
          name: 'Event Registration',
          status: 2,
          type: 'AdmissionItem',
          defaultFeeId: 'e3f9f003-c24d-4d0e-8b07-33d0e843e660',
          fees: {}
        }
      },
      sessionProducts: {
        'bd0d311c-68a8-4706-bee1-2ca42023a339': {
          categoryId: '00000000-0000-0000-0000-000000000000',
          startTime: '2017-11-13T23:00:00.000Z',
          endTime: '2017-11-14T00:00:00.000Z',
          isOpenForRegistration: true,
          isIncludedSession: false,
          registeredCount: 0,
          associatedWithAdmissionItems: [],
          availableToAdmissionItems: [],
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 0,
          code: '',
          description: '',
          id: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
          capacityId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
          name: 'session 02',
          status: 2,
          type: 'Session',
          defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
          fees: {
            'd139c987-c733-481f-a081-dc2a05ada52b': {
              isActive: true,
              isRefundable: true,
              registrationTypes: [],
              name: 'Complimentary',
              id: 'd139c987-c733-481f-a081-dc2a05ada52b',
              amount: 0,
              chargePolicies: [
                {
                  id: 'e12b7b0e-20ad-410d-b658-7b5bcb32ae26',
                  isActive: true,
                  effectiveUntil: '2999-12-31T00:00:00.000Z',
                  amount: 0,
                  maximumRefundAmount: 0
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
        },
        '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
          categoryId: '00000000-0000-0000-0000-000000000000',
          startTime: '2017-11-13T23:00:00.000Z',
          endTime: '2017-11-14T00:00:00.000Z',
          isOpenForRegistration: true,
          isIncludedSession: true,
          registeredCount: 0,
          associatedWithAdmissionItems: [],
          availableToAdmissionItems: [],
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 0,
          code: '',
          description: '',
          id: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
          capacityId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
          name: 'session 01',
          status: 2,
          type: 'Session',
          defaultFeeId: 'd139c987-c733-481f-a081-dc2a05ada52b',
          fees: {}
        }
      },
      sortKeys: {
        'bd0d311c-68a8-4706-bee1-2ca42023a339': ['2017-11-13T23:00:00.000Z'],
        '3253430c-d19a-421b-9592-70b8b2b7c4c5': ['2017-11-13T23:00:00.000Z']
      }
    }
  },
  experiments: {},
  webPaymentsSettings: {
    webPaymentsEndpoint: 'test.com',
    webPaymentsDefaultApplicationId: 'defaultId',
    webPaymentsPermanentApplicationId: 'permanentId'
  },
  regCartStatus: {
    lastSavedRegCart: {}
  },
  travelCart: {
    cart: {}
  }
};

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

const resetReactiveVars = () => {
  plannerOverriddenProductFeesVar({});
  plannerOverriddenProductRefundsVar({});
  plannerOverriddenProductFeesSavedVar({});
  plannerOverriddenProductRefundsSavedVar({});
  isEditPriceVar(false);
  isEditRefundVar(false);
};

let mockStore;
const mountComponent = async (optionalProps = {}, optionalState = {}) => {
  resetReactiveVars();
  const mergedState = merge({}, initialState, optionalState);
  const props = merge({}, defaultProps, optionalProps);
  const apolloClient = mockApolloClient(mergedState);
  mockStore = configureStore(mergedState, {}, { apolloClient });
  const component = mount(
    <Provider store={mockStore}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={getApolloClientMocks(mergedState)} addTypeName={false}>
        <Form>
          <Grid>
            <PaymentWidget {...props} />
          </Grid>
        </Form>
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

function runTests() {
  it('should render', async () => {
    const customState = {
      clients: { regCartClient: new RegCartClient() }
    };
    const component = await mountComponent({}, customState);
    expect(component).toMatchSnapshot();
  });

  it('should trigger discount application for new discount code', async () => {
    const customState = {
      clients: { regCartClient: new RegCartClient() }
    };
    const component = await mountComponent({}, customState);
    component
      .find('#discountCodesInputField')
      .hostNodes()
      .simulate('change', { target: { value: 'guest1' } });
    component.find('[data-cvent-id="select-discount-button"]').hostNodes().simulate('click');
    await waitWithAct();
    await component.update();
    expect(updateDiscountCodes).toHaveBeenCalledWith('guest1', false, null, null, null);
  });

  it('should trigger removal of discount application for discount code', async () => {
    const customState = {
      clients: { regCartClient: new RegCartClient() }
    };
    const component = await mountComponent({}, customState);
    component.find('[data-cvent-id="discountCode-remove-link"]').hostNodes().simulate('click');
    await waitWithAct();
    await component.update();
    expect(updateDiscountCodes).toHaveBeenCalledWith('Guest2', true, null, null, null);
  });

  it('remove taxes in planner reg mode', async () => {
    const plannerProps = {
      isRefund: false,
      isTaxesEnabled: true
    };
    const customState = {
      clients: { regCartClient: new RegCartClient() },
      registrationForm: { regCart: { ignoreTaxes: false } },
      defaultUserSession: { isPlanner: true }
    };
    const component = await mountComponent(plannerProps, customState);
    component.find('[data-cvent-id="override-prices-addremove-taxes"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Remove Tax Mode');
  });

  it('add taxes in planner reg mode', async () => {
    const plannerProps = {
      isRefund: false,
      isTaxesEnabled: true
    };
    const customState = {
      clients: { regCartClient: new RegCartClient() },
      registrationForm: { regCart: { ignoreTaxes: true } },
      defaultUserSession: { isPlanner: true }
    };
    const component = await mountComponent(plannerProps, customState);
    component.find('[data-cvent-id="override-prices-addremove-taxes"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Include Tax Mode');
  });

  it('remove service fees in planner reg mode', async () => {
    const plannerProps = {
      isRefund: false,
      isServiceFeeEnabled: true
    };
    const customState = {
      clients: { regCartClient: new RegCartClient() },
      registrationForm: { regCart: { ignoreServiceFee: false } },
      defaultUserSession: { isPlanner: true }
    };
    const component = await mountComponent(plannerProps, customState);
    component.find('[data-cvent-id="override-prices-addremove-servicefees"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Remove Service Fee Mode');
  });

  it('add service fees in planner reg mode', async () => {
    const plannerProps = {
      isRefund: false,
      isServiceFeeEnabled: true
    };
    const customState = {
      clients: { regCartClient: new RegCartClient() },
      registrationForm: { regCart: { ignoreServiceFee: true } },
      defaultUserSession: { isPlanner: true }
    };
    const component = await mountComponent(plannerProps, customState);
    component.find('[data-cvent-id="override-prices-addremove-servicefees"]').first().simulate('click');
    await waitWithAct();
    await component.update();
    expect(component).toMatchSnapshot('Planner Reg Payment Widget Include Service Fee Mode');
  });

  it('handles existing invitee error when updating reg cart', async () => {
    const customState = {
      clients: { regCartClient: new RegCartClientWithServiceError() }
    };
    const component = await mountComponent({}, customState);
    component
      .find('[data-cvent-id="paymentMethod-offline.optionOne"]')
      .first()
      .find('input')
      .first()
      .simulate('change');
    await waitWithAct();
    await component.update();
    expect(mockOpenAlreadyRegisteredDialog).toHaveBeenCalled();
  });

  it('webPaymentsApplicationId is set to the default when payment type is online', async () => {
    const webAppId = jest.requireActual<$TSFixMe>('..').getWebPaymentsApplicationId(initialState);
    expect(webAppId).toBe('defaultId');
  });

  it('webPaymentsApplicationId is set to the permenant id when payment type is offline', async () => {
    const stateWithCCLP = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );

    const webAppId = jest.requireActual<$TSFixMe>('..').getWebPaymentsApplicationId(stateWithCCLP);
    expect(webAppId).toBe('permanentId');
  });
}

describe('PaymentWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  runTests();
});
