import {
  clearCachedPricing,
  getCachedRegCartPricing,
  getRegCartPricingGQL,
  isOverrideProductFeesValid,
  isOverrideProductRefundsValid,
  regCartPaymentParams
} from '../regCartPricing';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../__mocks__/apolloClient';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { MINIMUM_PAYMENT_AMOUNT_TYPE } from 'event-widgets/utils/paymentConstant';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import HotelsDataFixture from 'event-widgets/lib/HotelRequest/HotelsDataFixture.json';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../__mocks__/regCartClient';

const extractArgValueFromDirective = doc =>
  doc.definitions[0].selectionSet.selections[0].directives[0].arguments.find(a => a.name.value === 'method').value
    .value;

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

const regCartPricing = {
  regCartId: '29d1ae28-057e-4f27-bcc9-39c1fac01726',
  productFeeAmountCharge: 0,
  productFeeAmountRefund: 0,
  productSubTotalAmountCharge: 0,
  productSubTotalAmountRefund: 0,
  netFeeAmountCharge: 0,
  netFeeAmountChargeWithPaymentAmountServiceFee: 0,
  netFeeAmountRefund: 0,
  paymentCreditsForEventReg: {},
  inviteeTypeServiceFeePricingCharges: {},
  paymentTypeServiceFeePricingCharges: {},
  inviteeTypeServiceFeePricingRefunds: {},
  paymentTypeServiceFeePricingRefunds: {},
  taxPricingCharges: {},
  taxPricingRefunds: {},
  eventRegistrationPricings: [
    {
      eventRegistrationId: 'e3839584-c6e0-4404-aeea-69144b98d920',
      productFeeAmountCharge: 0,
      productFeeAmountRefund: 0,
      productSubTotalAmountCharge: 0,
      productSubTotalAmountRefund: 0,
      netFeeAmountCharge: 0,
      netFeeAmountChargeWithPaymentTypeServiceFee: 0,
      netFeeAmountRefund: 0,
      productPricings: [
        {
          productId: 'ee64c57d-c713-40f0-8424-84dac823ddf4',
          productType: 'Session',
          pricingRefunds: [
            {
              quantity: 1,
              quantityPrevious: 1,
              feeId: '5768ee1b-a219-4304-9901-1fb37ef448ae',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0,
              amountToBePaid: 0,
              chargeOrderDetailId: 'ffb4983e-26d9-4e9c-a7ca-e92ae31dd53e',
              originalAmountCharged: 90
            }
          ],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          creditsApplied: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          productSubTotalAmountChargeAfterCredits: 0,
          netFeeAmountRefund: 0
        },
        {
          productId: '14db2488-2394-4314-8816-501730980b42',
          productType: 'AdmissionItem',
          pricingRefunds: [
            {
              quantity: 1,
              quantityPrevious: 1,
              feeId: '12dc6603-3b0d-4d9f-b5bb-e1c6b86f689b',
              productPriceTierBaseFeeAmountPerItem: 0,
              productFeeAmountPerItem: 0,
              productFeeAmount: 0,
              productSubTotalAmount: 0,
              netFeeAmount: 0,
              amountToBePaid: 0,
              chargeOrderDetailId: '168996ee-00f7-4d82-a7ab-6935060f9082',
              originalAmountCharged: 40
            }
          ],
          productFeeAmountCharge: 0,
          productFeeAmountRefund: 0,
          productSubTotalAmountCharge: 0,
          creditsApplied: 0,
          productSubTotalAmountRefund: 0,
          netFeeAmountCharge: 0,
          productSubTotalAmountChargeAfterCredits: 0,
          netFeeAmountRefund: 0
        }
      ]
    }
  ],
  plannerOverriddenProductFees: {
    'e3839584-c6e0-4404-aeea-69144b98d920': {}
  },
  plannerOverriddenProductRefunds: {
    'e3839584-c6e0-4404-aeea-69144b98d920': {
      'ffb4983e-26d9-4e9c-a7ca-e92ae31dd53e': 110,
      '168996ee-00f7-4d82-a7ab-6935060f9082': 11
    }
  },
  isEditPrice: false,
  isEditRefund: true
};

describe('regCartPricing', () => {
  it('generates GraphQL query with correct method', () => {
    expect(extractArgValueFromDirective(getRegCartPricingGQL('PUT'))).toStrictEqual('PUT');
    expect(extractArgValueFromDirective(getRegCartPricingGQL('GET'))).toStrictEqual('GET');
  });

  it('gets regCartPricing from cache', () => {
    const apolloClient = mockApolloClient({});
    const cachedPricing = getCachedRegCartPricing('', apolloClient);
    expect(cachedPricing).toEqual({
      plannerOverriddenProductFees: {},
      plannerOverriddenProductRefunds: {}
    });
  });

  it('evicts regCartPricing from cache', () => {
    const regCartId = '0000-0000-0000-0000';
    const apolloClient = mockApolloClient({});
    const mockEvict = jest.fn();
    apolloClient.cache.evict.mockImplementation(mockEvict);
    clearCachedPricing(regCartId, apolloClient);
    expect(mockEvict).toBeCalledWith({ id: `RegCartPricing:{"regCartId":"${regCartId}"}` });
  });

  it('validates overridden product fees', () => {
    const validOverriddenFees = {
      '00000000-0000-0000-0000-000000000001': {
        'ee64c57d-c713-40f0-8424-84dac823ddf4': '90',
        '14db2488-2394-4314-8816-501730980b42': '40'
      }
    };
    const invalidOverriddenFees = {
      '00000000-0000-0000-0000-000000000001': {
        'ee64c57d-c713-40f0-8424-84dac823ddf4': '-90',
        '14db2488-2394-4314-8816-501730980b42': '40'
      }
    };
    expect(isOverrideProductFeesValid(validOverriddenFees)).toEqual(true);
    expect(isOverrideProductFeesValid(invalidOverriddenFees)).toEqual(false);
  });

  it('validates overridden product refunds', () => {
    const validOverriddenRefunds = {
      'e3839584-c6e0-4404-aeea-69144b98d920': {
        'ffb4983e-26d9-4e9c-a7ca-e92ae31dd53e': '20',
        '168996ee-00f7-4d82-a7ab-6935060f9082': '11'
      }
    };
    const invalidOverriddenRefunds = {
      'e3839584-c6e0-4404-aeea-69144b98d920': {
        'ffb4983e-26d9-4e9c-a7ca-e92ae31dd53e': '110',
        '168996ee-00f7-4d82-a7ab-6935060f9082': '11'
      }
    };
    expect(isOverrideProductRefundsValid(validOverriddenRefunds, regCartPricing)).toEqual(true);
    expect(isOverrideProductRefundsValid(invalidOverriddenRefunds, regCartPricing)).toEqual(false);
  });

  it('calculates reg cart payment params', () => {
    expect(regCartPaymentParams(initialState)).toMatchSnapshot();
  });
});
