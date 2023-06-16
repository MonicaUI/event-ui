import React from 'react';
import Form from 'nucleus-form/src/components/Form';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Grid } from 'nucleus-core/layout/flexbox';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';
import { Provider } from 'react-redux';
import configureStore from '../../redux/configureStore';
import PostRegistrationPaymentWidget from '../PostRegistrationPaymentWidget';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { finalizePostRegistrationPayment } from '../../redux/postRegistrationPayment';
import { cloneDeep } from 'lodash';
import { getOrderInfo, onComplete } from '../PostRegistrationPaymentWidget';
import { setIn } from 'icepick';
import { POST_REG_PARTIAL_PAYMENT_RELEASE_VARIANT } from '@cvent/event-ui-experiments';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { openPaymentSuccessfulDialog } from '../../dialogs/PaymentSuccessfulDialog';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../PaymentWidget/__mocks__/apolloClient';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../PaymentWidget/__mocks__/regCartClient';

function translate(res, opts) {
  return opts ? `${res}:${JSON.stringify(opts)}` : res;
}

function translateWithDatatags(res, opts) {
  return opts ? `${res}:${JSON.stringify(opts)}` : res;
}
const loadMetaDataFunction = () => {
  return { appDataFieldPaths: { paymentSettings: 'registrationPathSettings.eventRegistrationId.paymentSettings' } };
};

jest.mock('../../utils/confirmationUtil', () => ({
  getConfirmationPageIdForInvitee: jest.fn(() => async () => {})
}));

jest.mock('../../redux/postRegistrationPayment', () => ({
  finalizePostRegistrationPayment: jest.fn(() => async () => ({ statusCode: 'SUCCESS' }))
}));

jest.mock('../../dialogs/PaymentSuccessfulDialog', () => ({
  openPaymentSuccessfulDialog: jest.fn(() => async () => {})
}));

jest.mock('../../redux/pathInfo', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
  routeToPage: jest.fn(() => async () => {})
}));

const mockStore = state => {
  const apolloClient = mockApolloClient(state.regCartPricing);
  apolloClient.query = () => {
    return Promise.resolve({
      data: {
        pricing: {
          regCartPricing: state.regCartPricing
        }
      }
    });
  };
  const middlewares = [thunk.withExtraArgument({ apolloClient })];
  return configureMockStore(middlewares)(state);
};

const webPaymentsData = {
  cardType: 'Visa',
  contextId: '00000000-0000-0000-0000-000000000000'
};

const initialState = {
  defaultUserSession: {
    isPlanner: false
  },
  experiments: {
    flexProductVersion: POST_REG_PARTIAL_PAYMENT_RELEASE_VARIANT
  },
  event: {
    status: 2,
    eventFeatureSetup: {
      agendaItems: {
        admissionItems: true,
        sessions: true
      },
      registrationProcess: {}
    },
    registrationTypes: {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
        isOpenForRegistration: true
      }
    },
    capacityId: 'eventCapacityId',
    selectedPaymentTypesSnapshot: {
      paymentMethodTypes: ['Visa', 'MasterCard']
    },
    products: {
      admissionItems: {
        '2819f92f-e09a-4463-b597-37f5ed1d4335': {
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
          code: 'A1 Included Session',
          description: '',
          id: '2819f92f-e09a-4463-b597-37f5ed1d4335',
          capacityId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
          name: 'A1 Included Session',
          status: 2,
          type: 'AdmissionItem',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {}
        }
      },
      sessionContainer: {
        includedSessions: {
          '8e68e719-a008-4120-92ec-4525d83cd54c': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2018-04-14T22:00:00.000Z',
            endTime: '2018-04-14T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: true,
            registeredCount: 5,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 4,
            showOnAgenda: true,
            speakerIds: {},
            code: '',
            description: '',
            id: '8e68e719-a008-4120-92ec-4525d83cd54c',
            capacityId: '8e68e719-a008-4120-92ec-4525d83cd54c',
            name: 'Included 1',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          }
        },
        optionalSessions: {
          '08a7f564-5c0e-4aa3-99c1-34a27b789161': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2018-04-14T22:00:00.000Z',
            endTime: '2018-04-14T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 2,
            showOnAgenda: true,
            speakerIds: {},
            code: '',
            description: '',
            id: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
            capacityId: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
            name: 'Session 2',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          }
        },
        sessionGroups: {
          '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1': {
            id: '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1',
            name: 'Group 1',
            code: 'Group 1',
            description: '',
            placementDateTime: '2018-02-28T23:55:00.000Z',
            categoryId: '00000000-0000-0000-0000-000000000000',
            displayFormat: 1,
            displayOrder: 1,
            allowedSessionDisplayFields: [1, 2, 8],
            sessions: {
              '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
                categoryId: '00000000-0000-0000-0000-000000000000',
                startTime: '2018-04-14T22:00:00.000Z',
                endTime: '2018-04-14T23:00:00.000Z',
                isOpenForRegistration: true,
                isIncludedSession: false,
                registeredCount: 1,
                associatedWithAdmissionItems: [],
                availableToAdmissionItems: [],
                associatedRegistrationTypes: [],
                sessionCustomFieldValues: {},
                displayPriority: 0,
                showOnAgenda: true,
                speakerIds: {},
                code: '',
                description: '',
                id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
                capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
                name: 'Session 1',
                status: 2,
                type: 'Session',
                defaultFeeId: '00000000-0000-0000-0000-000000000000',
                fees: {}
              }
            },
            isPlacementTimeDisplayed: true,
            isSessionSelectionRequired: true,
            isOpenForRegistration: true
          }
        },
        sessionBundles: {},
        sessionCategoryListOrders: {}
      }
    },
    timezone: 35
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  appData: {
    registrationPathSettings: {
      regPathId: {
        paymentSettings: {},
        partialPaymentSettings: {}
      }
    },
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          id: 'regPathId',
          modification: {
            deadline: undefined
          },
          allowsGroupRegistration: true,
          guestRegistrationSettings: {
            isGuestRegistrationTypeSelectionEnabled: true,
            registrationTypeSettings: {
              isRequired: true
            }
          },
          registrationPageFields: {
            1: {
              registrationFields: {
                '56aeaca6-a0ad-4548-8afc-94d8d4361ba1': {
                  fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1',
                  fieldName: 'StandardContactField_FirstName__resx',
                  displayName: 'StandardContactField_FirstName__resx',
                  display: 2,
                  isCustomField: false
                }
              }
            }
          },
          apptSettings: {
            availabilitySettings: {
              availabilityConfigOption: 'availability',
              apptEventDayInfo: [
                {
                  date: '2019-12-12',
                  dateEnabled: true,
                  startTime: '09:00',
                  endTime: '17:00'
                }
              ]
            }
          }
        }
      },
      registrationQuestions: {
        '884e410c-176c-49f4-9923-2cfb05c48a0e': {
          questionServiceEntityType: 'RegistrationPathQuestion',
          eventId: 'd9c52a97-c958-471c-a785-bac50246e3f5',
          registrationPathQuestionAssociations: ['regPathId'],
          question: {
            questionTypeInfo: {
              questionType: 'OpenEndedText',
              answerFormatType: 'General',
              answerPlacementType: 'Below',
              openEndedType: 'OneLine',
              scores: []
            },
            additionalInfo: {
              additionalInfoType: 'RegistrationPathQuestionAdditionalInfo',
              required: false,
              active: true,
              hasSeparator: false,
              accountQuestion: false,
              internalDocument: false,
              order: 0,
              guestOrder: 0,
              subQuestionOrder: 0,
              surveyType: 'RegistrantSurvey',
              audienceType: 'InviteeAndGuest',
              includeInDataTag: 'OnlyWhenAnswered'
            },
            html: 'Your text question will go here.',
            id: '884e410c-176c-49f4-9923-2cfb05c48a0e',
            oldId: '884e410c-176c-49f4-9923-2cfb05c48a0e',
            isProductQuestion: false
          }
        }
      }
    }
  },
  pathInfo: {
    currentPageId: 'PostRegistrationPaymentPage'
  },
  text: {
    locale: 'en',
    translate,
    translateWithDatatags,
    translateDate: translate,
    translateTime: translate,
    resolver: {
      currency: translate
    }
  },
  website: {
    siteInfo: {
      sharedConfigs: {
        ContactWidget: {}
      }
    },
    theme: {
      global: {
        dialog: {
          body: {}
        }
      },
      sections: {}
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
      eventRegistrations: {
        'b18958b2-bf64-4e2e-9c07-e13fd4b0f314': {
          attendeeType: 'ATTENDEE',
          eventRegistrationId: 'b18958b2-bf64-4e2e-9c07-e13fd4b0f314',
          registrationPathId: 'regPathId',
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          attendee: {
            personalInformation: {
              firstName: 'testFirst'
            },
            attendeeId: 'a951ecfe-edae-40fc-9e2b-730a298ef643'
          },
          productRegistrations: [
            {
              requestedAction: 'REGISTER',
              productType: 'AdmissionItem',
              productId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
              quantity: 1
            }
          ],
          sessionRegistrations: {
            '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
              requestedAction: 'REGISTER',
              productId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
              registrationSourceType: 'Selected',
              includedInAgenda: false
            },
            '08a7f564-5c0e-4aa3-99c1-34a27b789161': {
              requestedAction: 'REGISTER',
              productId: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
              registrationSourceType: 'Selected',
              includedInAgenda: false
            },
            '8e68e719-a008-4120-92ec-4525d83cd54c': {
              requestedAction: 'REGISTER',
              productId: '8e68e719-a008-4120-92ec-4525d83cd54c',
              registrationSourceType: 'Included',
              includedInAgenda: false
            }
          },
          quantityItemRegistrations: {
            quantityItemId1: {
              productId: 'quantityItemId1',
              quantity: 4
            }
          }
        }
      }
    }
  },
  orders: [
    {
      orderId: '62f18482-b84a-436d-9654-008fab33cc23',
      attendeeId: '15d6acf3-901b-461d-a54a-76538c6529fe',
      groupMemberTitle: 'Member',
      submittedOn: '2019-10-28T14:07:11.000Z',
      orderType: 'OfflineCharge',
      orderItems: [
        {
          itemId: '42a2e2c7-7a4c-4e07-8865-5a5a19709d19',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productType: 'AdmissionItem',
          itemPrice: 500,
          itemName: 'Event Registration',
          quantity: 1,
          amount: 500,
          amountPaid: 0,
          amountDue: 500,
          productPriceTierAmount: 500
        },
        {
          itemId: '42a2e2c7-7a4c-4e07-8865-5a5a19709d19',
          registrantId: '72de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'sam',
          lastName: 'sam',
          productType: 'AdmissionItem',
          itemPrice: 500,
          itemName: 'Event Registration',
          quantity: 1,
          amount: 500,
          amountPaid: 0,
          amountDue: 500,
          productPriceTierAmount: 500
        },
        {
          itemId: '62a2e2c7-7a4c-4e07-8865-5a5a19709d19',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productType: 'Tax',
          itemPrice: 10,
          itemName: 'Event Registration',
          quantity: 1,
          amount: 10,
          amountPaid: 0,
          amountDue: 10,
          productPriceTierAmount: 10
        },
        {
          itemId: '197004f2-09eb-490b-a059-3254d354c7d0',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productId: '529ac64b-463a-4630-8ec3-851474c5e1cc',
          productType: 'HotelItem',
          productCode: '',
          itemPrice: 50,
          itemName: 'Deluxe',
          quantity: 1,
          amount: 50,
          amountPaid: 0,
          amountDue: 50,
          hotelOrder: {
            requestGroupId: 'd76146a8-4d9b-429e-b366-553acd1db80b',
            hotelReservationDetailId: 'a2c321c8-60a5-4af4-be7e-03bf5294e4fa',
            hotelId: '0b7fe912-fa33-46bb-8890-cbfcee323dad',
            checkInDate: '2033-06-17T00:00:00.000Z',
            checkOutDate: '2033-06-18T00:00:00.000Z'
          }
        },
        {
          itemId: '297004f2-09eb-490b-a059-3254d354c7d0',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productId: '529ac64b-463a-4630-8ec3-851474c5e1cc',
          productType: 'HotelItem',
          productCode: '',
          itemPrice: 50,
          itemName: 'Deluxe',
          quantity: 1,
          amount: 50,
          amountPaid: 0,
          amountDue: 50,
          hotelOrder: {
            requestGroupId: 'd76146a8-4d9b-429e-b366-553acd1db80b',
            hotelReservationDetailId: 'a2c321c8-60a5-4af4-be7e-03bf5294e4fa',
            hotelId: '0b7fe912-fa33-46bb-8890-cbfcee323dad',
            checkInDate: '2033-06-17T00:00:00.000Z',
            checkOutDate: '2033-06-18T00:00:00.000Z'
          }
        }
      ]
    },
    {
      orderId: '72f18482-b84a-436d-9654-008fab33cc23',
      attendeeId: '15d6acf3-901b-461d-a54a-76538c6529fe',
      groupMemberTitle: 'Member',
      submittedOn: '2019-10-28T14:07:11.000Z',
      orderType: 'OfflineCharge',
      orderItems: [
        {
          itemId: '597004f2-09eb-490b-a059-3254d354c7d0',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productId: '529ac64b-463a-4630-8ec3-851474c5e1cc',
          productType: 'HotelItem',
          productCode: '',
          itemPrice: 50,
          itemName: 'Deluxe',
          quantity: 1,
          amount: 50,
          amountPaid: 0,
          amountDue: 50,
          hotelOrder: {
            requestGroupId: 'd76146a8-4d9b-429e-b366-553acd1db80b',
            hotelReservationDetailId: 'b2c321c8-60a5-4af4-be7e-03bf5294e4fa',
            hotelId: '0b7fe912-fa33-46bb-8890-cbfcee323dad',
            checkInDate: '2033-06-17T00:00:00.000Z',
            checkOutDate: '2033-06-18T00:00:00.000Z'
          }
        },
        {
          itemId: '697004f2-09eb-490b-a059-3254d354c7d0',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productId: '529ac64b-463a-4630-8ec3-851474c5e1cc',
          productType: 'HotelItem',
          productCode: '',
          itemPrice: 50,
          itemName: 'Deluxe',
          quantity: 1,
          amount: 50,
          amountPaid: 0,
          amountDue: 50,
          hotelOrder: {
            requestGroupId: 'd76146a8-4d9b-429e-b366-553acd1db80b',
            hotelReservationDetailId: 'a2c321c8-60a5-4af4-be7e-03bf5294e4fa',
            hotelId: '0b7fe912-fa33-46bb-8890-cbfcee323dad',
            checkInDate: '2033-06-17T00:00:00.000Z',
            checkOutDate: '2033-06-18T00:00:00.000Z'
          }
        },
        {
          itemId: 'quantityItemId1',
          registrantId: '62de896b-7d58-45e4-ab97-dec5ee9bbe96',
          firstName: 'dfsan',
          lastName: 'indsfo',
          productType: 'QuantityItem',
          itemPrice: 40,
          itemName: 'Quantity Item Name',
          quantity: 4,
          amount: 40,
          amountPaid: 0,
          amountDue: 40,
          productPriceTierAmount: 10
        }
      ]
    }
  ],
  countries: {
    '': {
      code: '',
      nameResourceKey: ''
    },
    IN: {
      code: 'IN',
      nameResourceKey: 'translated-IN'
    }
  },
  regCartPricing: {
    netFeeAmountRefund: '0',
    inviteeTypeServiceFeePricingRefunds: {},
    eventRegistrationPricings: [
      {
        netFeeAmountRefund: '0',
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        netFeeAmountChargeWithPaymentTypeServiceFee: '145.2',
        productPricings: [],
        productFeeAmountCharge: '100',
        chargeRevenueShareFees: {
          salesTax: null,
          fees: null
        },
        merchantProcessingFees: {
          paymentAmount: '0',
          fee: '0'
        },
        productSubTotalAmountCharge: '100',
        netFeeAmountCharge: '121',
        transactionIdToRefundAmounts: {},
        refundMerchantProcessingFee: null,
        productSubTotalAmountRefund: '0',
        refundRevenueShareFees: {
          salesTax: null,
          fees: null
        },
        productFeeAmountRefund: '0'
      }
    ],
    productFeeAmountCharge: '100',
    netFeeAmountChargeWithPaymentAmountServiceFee: 145.2,
    paymentTypeServiceFeePricingRefunds: {},
    paymentTypeServiceFeePricingCharges: {
      '0e3d7926-a956-4158-8908-f76a0aa0a3e5': {
        primaryRegToOrderDetailIds: {
          '00000000-0000-0000-0000-000000000001': '09c2deca-f85a-4428-8006-952817d19131'
        },
        appliedOrder: '1',
        id: '0e3d7926-a956-4158-8908-f76a0aa0a3e5',
        feeApplyType: '1',
        totalPaymentTypeServiceFeeAmount: '12.1',
        inviteeBreakdowns: [
          {
            amount: '12.1',
            attendeeType: 'ATTENDEE',
            attendeeId: null,
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            orderDetailTaxFeeId: null
          }
        ]
      },
      'c05fd891-1f48-4f03-a416-3f3db7902af4': {
        primaryRegToOrderDetailIds: {
          '00000000-0000-0000-0000-000000000001': 'c4198c04-495e-4500-a0cf-2ba6ed29655a'
        },
        appliedOrder: '4',
        id: 'c05fd891-1f48-4f03-a416-3f3db7902af4',
        feeApplyType: '1',
        totalPaymentTypeServiceFeeAmount: '12.1',
        inviteeBreakdowns: [
          {
            amount: '12.1',
            attendeeType: 'ATTENDEE',
            attendeeId: null,
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            orderDetailTaxFeeId: null
          }
        ]
      }
    },
    productSubTotalAmountCharge: '100',
    inviteeTypeServiceFeePricingCharges: {},
    netFeeAmountCharge: '121',
    taxPricingCharges: {},
    transactionIdToRegCartPricingRefund: {},
    taxPricingRefunds: {},
    regCartId: 'ed86b8ee-8982-4395-ae24-336a3dc8e234',
    productSubTotalAmountRefund: '0',
    productFeeAmountRefund: '0'
  },
  eventTravel: {
    hotelsData: {
      isPasskeyEnabled: false
    },
    airData: AirTravelData.airData
  },
  timezones: {
    35: {
      id: 35,
      name: 'Eastern Time',
      nameResourceKey: 'Event_Timezone_Name_35__resx',
      plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
      hasDst: true,
      utcOffset: -300,
      abbreviation: 'ET',
      abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
      dstInfo: []
    }
  },
  currencies: {
    1: {
      id: 1,
      iSOCode: 123,
      nameOfSymbol: 'Double Dollars',
      symbol: '$$',
      name: 'Double Dollars',
      resourceKey: 'resourceKey1'
    }
  },
  visibleProducts: {
    Widget: {
      admissionItems: {
        '2819f92f-e09a-4463-b597-37f5ed1d4335': {
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
          code: 'A1 Included Session',
          description: '',
          id: '2819f92f-e09a-4463-b597-37f5ed1d4335',
          capacityId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
          name: 'A1 Included Session',
          status: 2,
          type: 'AdmissionItem',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {}
        }
      },
      sessionProducts: {
        '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
          categoryId: '00000000-0000-0000-0000-000000000000',
          startTime: '2018-04-14T22:00:00.000Z',
          endTime: '2018-04-14T23:00:00.000Z',
          isOpenForRegistration: true,
          isIncludedSession: false,
          registeredCount: 1,
          associatedWithAdmissionItems: [],
          availableToAdmissionItems: [],
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 0,
          showOnAgenda: true,
          speakerIds: {},
          code: '',
          description: '',
          id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
          capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
          name: 'Session 1',
          status: 2,
          type: 'Session',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {}
        },
        '08a7f564-5c0e-4aa3-99c1-34a27b789161': {
          categoryId: '00000000-0000-0000-0000-000000000000',
          startTime: '2018-04-14T22:00:00.000Z',
          endTime: '2018-04-14T23:00:00.000Z',
          isOpenForRegistration: true,
          isIncludedSession: false,
          registeredCount: 0,
          associatedWithAdmissionItems: [],
          availableToAdmissionItems: [],
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 2,
          showOnAgenda: true,
          speakerIds: {},
          code: '',
          description: '',
          id: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
          capacityId: '08a7f564-5c0e-4aa3-99c1-34a27b789161',
          name: 'Session 2',
          status: 2,
          type: 'Session',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {}
        },
        '8e68e719-a008-4120-92ec-4525d83cd54c': {
          categoryId: '00000000-0000-0000-0000-000000000000',
          startTime: '2018-04-14T22:00:00.000Z',
          endTime: '2018-04-14T23:00:00.000Z',
          isOpenForRegistration: true,
          isIncludedSession: true,
          registeredCount: 5,
          associatedWithAdmissionItems: [],
          availableToAdmissionItems: [],
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 4,
          showOnAgenda: true,
          speakerIds: {},
          code: '',
          description: '',
          id: '8e68e719-a008-4120-92ec-4525d83cd54c',
          capacityId: '8e68e719-a008-4120-92ec-4525d83cd54c',
          name: 'Included 1',
          status: 2,
          type: 'Session',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {}
        },
        '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1': {
          id: '6578f0ab-b554-43d6-8872-4bcf8b0fe1f1',
          name: 'Group 1',
          code: 'Group 1',
          description: '',
          placementDateTime: '2018-02-28T23:55:00.000Z',
          categoryId: '00000000-0000-0000-0000-000000000000',
          displayFormat: 1,
          displayOrder: 1,
          allowedSessionDisplayFields: [1, 2, 8],
          sessions: {
            '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
              categoryId: '00000000-0000-0000-0000-000000000000',
              startTime: '2018-04-14T22:00:00.000Z',
              endTime: '2018-04-14T23:00:00.000Z',
              isOpenForRegistration: true,
              isIncludedSession: false,
              registeredCount: 1,
              associatedWithAdmissionItems: [],
              availableToAdmissionItems: [],
              associatedRegistrationTypes: [],
              sessionCustomFieldValues: {},
              displayPriority: 0,
              showOnAgenda: true,
              speakerIds: {},
              code: '',
              description: '',
              id: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
              capacityId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
              name: 'Session 1',
              status: 2,
              type: 'Session',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              fees: {}
            }
          },
          isPlacementTimeDisplayed: true,
          isSessionSelectionRequired: true,
          isOpenForRegistration: true
        }
      },
      quantityItems: {
        quantityItem1: {
          id: 'quantityItemId1',
          capacityId: 'quantityItemId1',
          name: 'Quantity Item Name',
          code: 'Quantity Item Code',
          description: 'Quantity Item Description',
          defaultFeeId: 'fee1',
          fees: {
            fee1: {
              amount: 10,
              name: 'Fee 1',
              registrationTypes: [],
              chargePolicies: [
                {
                  amount: 10,
                  effectiveUntil: '2999-12-31T00:00:00.000Z',
                  isActive: true
                }
              ]
            }
          },
          displayOrder: 1,
          isOpenForRegistration: true,
          associatedRegistrationTypes: [],
          status: 2
        }
      }
    }
  },
  partialPaymentSettings: {},
  postRegistrationPaymentData: {
    isCheckingOut: false
  },
  accessToken: 'BEARER TOKEN'
};

const defaultProps = {
  config: {
    shared: {
      paymentInstructions: 'Payment Instructions',
      orderHeader: 'Order Header',
      paymentHeader: 'Payment Header'
    }
  },
  style: {},
  id: 'widget:postRegistrationPayment',
  translate: x => x
};
const apolloClient = mockApolloClient();
const mountWidget = state => {
  const store = configureStore(cloneDeep(state), {}, { apolloClient });
  const props = { ...defaultProps };
  return mount(
    <Provider store={store}>
      <Form>
        <Grid>
          <PostRegistrationPaymentWidget {...props} />
        </Grid>
      </Form>
    </Provider>
  );
};

describe('Tests for PostRegistrationPaymentWidget', () => {
  test('Checking if it is rendering properly', () => {
    const component = mountWidget(initialState);
    expect(component).toMatchSnapshot('Widget Renders');
  });

  test('shows the partial payment component if it meets all requirements', () => {
    const partialPaymentSettings = {
      enabled: true,
      enabledOnPostRegPaymentPage: true,
      minimumPaymentAmountType: '1',
      minimumPaymentAmount: '20',
      paymentDistributionMethodType: '1',
      productPriorityList: []
    };

    const state = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'regPathId', 'partialPaymentSettings'],
      partialPaymentSettings
    );

    const component = mountWidget(state);
    expect(component).toMatchSnapshot();

    // Partial Payment section is shown if processOffline is off
    const partialPaymentContainer = component.find('[data-cvent-id="partial-payment-method-container"]');
    expect(partialPaymentContainer).toHaveLength(1);
  });

  test('dont show the partial payment component if not in correct experiment', () => {
    const partialPaymentSettings = {
      enabled: true,
      enabledOnPostRegPaymentPage: true,
      minimumPaymentAmountType: '1',
      minimumPaymentAmount: '20',
      paymentDistributionMethodType: '1',
      productPriorityList: []
    };

    let state = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'regPathId', 'partialPaymentSettings'],
      partialPaymentSettings
    );
    state = setIn(state, ['experiments'], { flexProductVersion: 65 });

    const component = mountWidget(state);
    expect(component).toMatchSnapshot();

    // Partial Payment section is shown if processOffline is off
    const partialPaymentContainer = component.find('[data-cvent-id="partial-payment-method-container"]');
    expect(partialPaymentContainer).toHaveLength(0);
  });

  test('doesnt shows the partial payment component if not enabled on payment widget', () => {
    const partialPaymentSettings = {
      enabled: false,
      enabledOnPostRegPaymentPage: true,
      minimumPaymentAmountType: '1',
      minimumPaymentAmount: '20',
      paymentDistributionMethodType: '1',
      productPriorityList: []
    };

    const state = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'regPathId', 'partialPaymentSettings'],
      partialPaymentSettings
    );

    const component = mountWidget(state);
    expect(component).toMatchSnapshot();

    // Partial Payment section is shown if processOffline is off
    const partialPaymentContainer = component.find('[data-cvent-id="partial-payment-method-container"]');
    expect(partialPaymentContainer).toHaveLength(0);
  });

  test('doesnt shows the partial payment component if not enabled on post reg payment widget', () => {
    const partialPaymentSettings = {
      enabled: true,
      enabledOnPostRegPaymentPage: false,
      minimumPaymentAmountType: '1',
      minimumPaymentAmount: '20',
      paymentDistributionMethodType: '1',
      productPriorityList: []
    };

    const state = setIn(
      initialState,
      ['appData', 'registrationPathSettings', 'regPathId', 'partialPaymentSettings'],
      partialPaymentSettings
    );

    const component = mountWidget(state);
    expect(component).toMatchSnapshot();

    // Partial Payment section is shown if processOffline is off
    const partialPaymentContainer = component.find('[data-cvent-id="partial-payment-method-container"]');
    expect(partialPaymentContainer).toHaveLength(0);
  });

  test('the getOrderInfo method', () => {
    expect(getOrderInfo(initialState)).toEqual({
      order: {
        subTotal: 1240,
        total: 1250,
        attendees: [
          {
            firstName: 'dfsan',
            lastName: 'indsfo',
            attendeeType: 'ATTENDEE',
            subtotal: 740,
            products: [
              {
                id: '42a2e2c7-7a4c-4e07-8865-5a5a19709d19',
                type: 'AdmissionItem',
                name: 'Event Registration',
                price: 500,
                originalPrice: 500,
                quantity: 1,
                originalPricePerItem: 500
              },
              {
                id: 'quantityItemId1',
                type: 'QuantityItem',
                name: 'Quantity Item Name',
                price: 40,
                originalPrice: 40,
                originalPricePerItem: 10,
                quantity: 4
              },
              {
                type: 'HotelItem',
                name: 'Deluxe',
                price: 200,
                originalPrice: 200,
                additionalInfo:
                  'EventWidgets_HotelRequest_MultipleRoomsMultipleNight__resx:{"numberOfRooms":2,"numberOfNights":3}'
              }
            ]
          },
          {
            firstName: 'sam',
            lastName: 'sam',
            attendeeType: 'ATTENDEE',
            subtotal: 500,
            products: [
              {
                id: '42a2e2c7-7a4c-4e07-8865-5a5a19709d19',
                type: 'AdmissionItem',
                name: 'Event Registration',
                price: 500,
                originalPrice: 500,
                quantity: 1,
                originalPricePerItem: 500
              }
            ]
          }
        ],
        additionalItems: [
          {
            id: '62a2e2c7-7a4c-4e07-8865-5a5a19709d19',
            name: 'Event Registration',
            originalPrice: 10,
            price: 10
          }
        ]
      }
    });
  });

  const waitWithAct = async () => {
    // Act is used because the Redux store is updated during wait
    return act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  };

  test('payment is finalized', async () => {
    const store = mockStore(initialState);
    await store.dispatch(onComplete(webPaymentsData));
    await waitWithAct();
    expect(finalizePostRegistrationPayment).toHaveBeenCalledTimes(1);
    expect(finalizePostRegistrationPayment).toHaveBeenCalledWith(webPaymentsData);
    expect(openPaymentSuccessfulDialog).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot('PostReg successful onComplete actions');
  });
});
