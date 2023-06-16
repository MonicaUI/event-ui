import RegistrationSummaryWidget from '../RegistrationSummaryWidget';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import configureStore from '../../redux/configureStore';
import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MockedProvider } from '@apollo/client/testing';
import { merge } from 'lodash';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';
import AddGroupMember from 'event-widgets/lib/RegistrationSummary/AddGroupMember';
import ProductsTable from 'event-widgets/lib/RegistrationSummary/ProductsTable';
import WidgetFactory from '../../widgetFactory';
import { dstInfo } from '../../../fixtures/EasternTimeDstInfoFixture';
import { Provider } from 'react-redux';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../PaymentWidget/__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks } from '../PaymentWidget/__mocks__/apolloClient';
import {
  _getVisibleSessionBundlesPath,
  GET_VISIBLE_SESSION_BUNDLES
} from 'event-widgets/lib/Sessions/useVisibleSessionBundles';
import createCache from '../../apollo/apolloCache';
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

jest.mock('event-widgets/redux/modules/text', () => {
  const initialState = {
    translate: mockTranslate,
    translateWithDatatags: mockTranslate,
    translateDate: mockTranslate,
    translateTime: mockTranslate,
    resolver: {
      currency: mockTranslate
    }
  };
  const reducer = () => initialState;
  return reducer;
});

jest.mock('nucleus-widgets/lib/withMappedWidgetConfig', () => {
  return C => {
    return props => {
      return <C {...props} />;
    };
  };
});

function mockTranslate(res, opts) {
  return opts ? `${res}:${JSON.stringify(opts)}` : res;
}

const getInitialState = () => ({
  account: {
    contactCustomFields: {}
  },
  userSession: {},
  defaultUserSession: {
    isPlanner: false
  },
  capacity: {
    eventCapacityId: {
      availableCapacity: -1,
      capacityId: 'eventCapacityId',
      totalCapacityAvailable: -1
    },
    'eventId::00000000-0000-0000-0000-000000000000': {
      availableCapacity: -1,
      capacityId: 'eventId::00000000-0000-0000-0000-000000000000',
      totalCapacityAvailable: -1
    },
    '2819f92f-e09a-4463-b597-37f5ed1d4335': {
      availableCapacity: -1,
      capacityId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
      totalCapacityAvailable: -1
    }
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  event: {
    status: 2,
    eventFeatureSetup: {
      agendaItems: {
        admissionItems: true,
        sessions: true
      },
      registrationProcess: {},
      fees: {
        merchantAccountId: 'merchantAccountId',
        fees: true,
        discounts: true,
        taxes: true,
        serviceFees: true
      }
    },
    registrationTypes: {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
        isOpenForRegistration: true
      }
    },
    capacityId: 'eventCapacityId',
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
        sessionTracks: {},
        sessionCategoryListOrders: {}
      }
    },
    timezone: 35
  },
  widgetFactory: new WidgetFactory(),
  appData: {
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
    },
    timeZoneSetting: {
      displayTimeZone: true,
      selectedWidgets: ['registrationSummary']
    }
  },
  regCartPricing: {
    regCartId: '195cde70-ada7-4560-90fe-5514de0eddcd',
    productFeeAmountCharge: 0,
    productFeeAmountRefund: 0,
    productSubTotalAmountCharge: 0,
    productSubTotalAmountRefund: 0,
    netFeeAmountCharge: 0,
    netFeeAmountRefund: 0,
    eventRegistrationPricings: [
      {
        eventRegistrationId: 'b18958b2-bf64-4e2e-9c07-e13fd4b0f314',
        productFeeAmountCharge: 0,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 0,
        productSubTotalAmountRefund: 0,
        netFeeAmountCharge: 0,
        netFeeAmountRefund: 0,
        productPricings: []
      }
    ],
    plannerOverriddenProductFees: {},
    plannerOverriddenProductRefunds: {},
    isEditPrice: false,
    isEditRefund: false
  },
  pathInfo: {
    currentPageId: 'regProcessStep1'
  },
  website: {
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            confirmationPageId: 'confirmation',
            pageIds: ['regProcessStep1'],
            postRegPageIds: ['confirmation'],
            registrationPendingApprovalPageIds: ['pendingApproval']
          }
        }
      }
    },
    pages: {
      regProcessStep1: {
        id: 'regProcessStep1',
        rootLayoutItemIds: ['id-3']
      },
      confirmation: {
        id: 'confirmation',
        rootLayoutItemIds: ['temp-1469646842471']
      },
      pendingApproval: {
        id: 'pendingApproval',
        rootLayoutItemIds: ['container:fb41b933-a0a1-4696-8c51-f8b6bab2c610']
      }
    },
    layoutItems: {
      'id-3': {
        layout: {
          type: 'container',
          childIds: ['temp-1469646842439']
        },
        id: 'id-3'
      },
      'temp-1469646842439': {
        layout: {
          childIds: ['temp-1469646842440'],
          parentId: 'id-3'
        },
        id: 'temp-1469646842439'
      },
      'temp-1469646842440': {
        layout: {
          childIds: ['row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc', 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'],
          parentId: 'temp-1469646842439'
        },
        id: 'temp-1469646842440'
      },
      'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc': {
        layout: {
          type: 'row',
          childIds: ['widget:306adfac-e25d-45fd-a155-740e4a8dfcd4'],
          parentId: 'temp-1469646842440'
        },
        id: 'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc'
      },
      'widget:306adfac-e25d-45fd-a155-740e4a8dfcd4': {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc'
        },
        id: 'widget:306adfac-e25d-45fd-a155-740e4a8dfcd4',
        config: {
          registrationFieldPageType: 1,
          fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1'
        },
        widgetType: 'EventStandardContactFieldText'
      },
      'row:241d35e0-d8d9-4860-b4e1-235616a2922a': {
        layout: {
          type: 'row',
          childIds: ['widget:e4ec24be-a67e-4639-a8c3-65c3caa0558c'],
          parentId: 'temp-1469646842440'
        },
        id: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
      },
      'widget:e4ec24be-a67e-4639-a8c3-65c3caa0558c': {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
        },
        id: 'widget:e4ec24be-a67e-4639-a8c3-65c3caa0558c',
        config: {
          registrationFieldPageType: 1,
          id: '884e410c-176c-49f4-9923-2cfb05c48a0e'
        },
        widgetType: 'OpenEndedTextQuestion'
      },
      regSummaryWidget: {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'id-3'
        },
        config: {},
        id: 'regSummaryWidget'
      }
    },
    siteInfo: {
      sharedConfigs: {}
    }
  },
  text: {
    translate: mockTranslate,
    translateWithDatatags: mockTranslate,
    translateDate: mockTranslate,
    translateTime: mockTranslate,
    resolver: {
      currency: mockTranslate
    }
  },
  registrationForm: {
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
          }
        }
      }
    },
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
    }
  },
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
      dstInfo
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
      }
    }
  },
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  },
  multiLanguageLocale: {},
  appointments: {
    exhibitors: [{ id: 'testId', name: 'Test Exhibitor' }]
  },
  regCartStatus: {
    lastSavedRegCart: {}
  },
  travelCart: {
    cart: {}
  }
});

const defaultProps = {
  classes: {},
  style: {
    elements: {},
    palette: {}
  },
  translate: mockTranslate,
  translateWithDatatags: mockTranslate,
  config: {
    appData: {
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
      timeZoneSetting: {
        displayTimeZone: true,
        selectedWidgets: ['registrationSummary']
      }
    },
    registrationSummaryHeader: '_defaultPageTitle_regProcessStep3__resx',
    questions: {
      display: true,
      header: 'EventWidgets_RegistrationSummary_DefaultQuestionHeader__resx',
      displayType: 0
    },
    instructionalText: 'EventWidgets_RegistrationSummary_DefaultInstructionalText__resx',
    productsHeader: 'EventWidgets_RegistrationSummary_DefaultProductHeader__resx',
    displayAdmissionItems: true,
    displayOptionalSessions: true,
    displayIncludedSessions: true,
    displaySessionDate: true,
    groupRegButtonText: 'EventWidgets_RegistrationSummary_AddGroupMemberButton__resx',
    groupFlightInformation: {
      display: false
    }
  },
  id: 'regSummaryWidget',
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          id: 'regPathId',
          allowsGroupRegistration: true
        }
      }
    },
    timeZoneSetting: {
      displayTimeZone: true,
      selectedWidgets: ['registrationSummary']
    }
  }
};

const waitWithAct = async (timeout = 0) => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, timeout));
  });
};

const mountComponent = async (optionalState = {}) => {
  const state = merge({}, getInitialState(), optionalState);
  const store = configureStore(state, {});

  const apolloClientMocks = getApolloClientMocks(state);

  const component = mount(
    <Provider store={store}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message */}
      <MockedProvider mocks={apolloClientMocks} addTypeName={false}>
        <RegistrationSummaryWidget {...defaultProps} type="RegistrationSummary" />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('Config', () => {
  test('It localizes questions', async () => {
    const customState = {
      config: {
        appData: {
          registrationSettings: {
            registrationQuestions: {
              123456: {
                parentQuestionId: 'parent-id-1',
                question: {
                  questionTypeInfo: {
                    choices: [{ id: 123, text: 'Localized' }]
                  }
                }
              }
            }
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              isDefault: true,
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              },
              modification: {
                deadline: '1900-01-01T00:00:00Z'
              }
            }
          },
          registrationQuestions: {
            123456: {
              parentQuestionId: 'parent-id-1',
              question: {
                questionTypeInfo: {
                  choices: [{ id: 123, text: 'Base' }]
                }
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      event: {
        status: 2,
        closeDate: '9999-10-27T03:59:00.000Z',
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: false
          }
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      registrationForm: {
        regCart: {
          registrationApprovalRequired: true,
          eventRegistrations: {
            'b18958b2-bf64-4e2e-9c07-e13fd4b0f314': {
              registrationStatus: 'REGISTERED'
            }
          }
        }
      },
      selectedTimeZone: {
        utcOffset: -240,
        value: 35,
        abbreviation: 'ET',
        abbreviationResourceKey: 'ET translation'
      },
      experiments: {}
    };
    const widget = await mountComponent(customState);
    expect(widget).toMatchSnapshot();
  });
});

describe('Tests for RegistrationSummaryWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('it matches snapshot', async () => {
    const widget = await mountComponent();
    expect(widget).toMatchSnapshot();
  });

  test('Add group member button display if reg mod date is passed', async () => {
    const customState = {
      capacity: {
        'eventId::eventCapacityId': {
          availableCapacity: -1,
          capacityId: 'eventId',
          totalCapacityAvailable: -1
        }
      },
      event: {
        id: 'eventId',
        eventFeatureSetup: {
          agendaItems: {
            admissionItems: false
          },
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: true
          }
        },
        capacityId: 'eventId',
        registrationTypes: {
          '00000000-0000-0000-0000-000000000000': {
            availableSessions: [],
            code: '',
            isOpenForRegistration: true,
            name: '',
            id: '00000000-0000-0000-0000-000000000000'
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              isDefault: true,
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              },
              modification: {
                deadline: '1900-01-01T00:00:00Z'
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      experiments: {}
    };
    const widget = await mountComponent(customState);
    expect(widget).toMatchSnapshot();
  });

  test('Add group member is disabled if on confirmation page and event is closed', async () => {
    const customState = {
      event: {
        status: 3,
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);

    const getButtonComponent = () => widget.find(AddGroupMember);

    expect(widget).toMatchSnapshot();
    expect(getButtonComponent().props().disabled).toBeTruthy();
  });

  test('Add group member isnt disabled if on confirmation page and event is active', async () => {
    const customState = {
      event: {
        status: 2,
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: true
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              isDefault: true,
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);

    const getButtonComponent = () => widget.find(AddGroupMember);

    expect(widget).toMatchSnapshot();
    expect(getButtonComponent().props().disabled).toBeFalsy();
  });

  test('Add group member is disabled if on confirmation page and event is active but pass closeDate', async () => {
    const customState = {
      event: {
        closeDate: '1999-10-27T03:59:00.000Z',
        status: 2,
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);

    const getButtonComponent = () => widget.find(AddGroupMember);

    expect(widget).toMatchSnapshot();
    expect(getButtonComponent().props().disabled).toBeTruthy();
  });

  test('Add group member is disabled if on pending approval page and event is closed', async () => {
    const customState = {
      event: {
        status: 3,
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: true
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'pendingApproval'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);

    const getButtonComponent = () => widget.find(AddGroupMember);

    expect(widget).toMatchSnapshot();
    expect(getButtonComponent().props().disabled).toBeTruthy();
  });

  test('Add group member isnt disabled if on pending approval page and event is active', async () => {
    const customState = {
      event: {
        status: 2,
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: true
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'pendingApproval'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);
    const getButtonComponent = () => widget.find(AddGroupMember);

    expect(widget).toMatchSnapshot();
    expect(getButtonComponent().props().disabled).toBeFalsy();
  });

  test('Add group member is disabled if on pending approval page and event is active but past closeDate', async () => {
    const customState = {
      event: {
        status: 2,
        closeDate: '1999-10-27T03:59:00.000Z',
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: true
          }
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: {
            regPathId: {
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10
              }
            }
          }
        },
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      pathInfo: {
        currentPageId: 'pendingApproval'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);
    const getButtonComponent = () => widget.find(AddGroupMember);

    expect(widget).toMatchSnapshot();
    expect(getButtonComponent().props().disabled).toBeTruthy();
  });

  test('Add group member is enabled if on confirmation page and event level pending approval is off', async () => {
    const customState = {
      event: {
        status: 2,
        closeDate: '9999-10-27T03:59:00.000Z',
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: false
          }
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      registrationForm: {
        regCart: {
          registrationApprovalRequired: true,
          eventRegistrations: {
            'b18958b2-bf64-4e2e-9c07-e13fd4b0f314': {
              registrationStatus: 'REGISTERED'
            }
          }
        }
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);
    const getButtonComponent = () => widget.find(AddGroupMember);
    expect(getButtonComponent().props().disabled).toBeFalsy();
  });

  test('Should pass correct parameters to fetch session bundles', async () => {
    const registeredSessionBundleId = 'a9e93b19-cccb-49c2-8135-97991998ae26';
    const registeredSessionBundleName = 'sessionBundle1';
    const initialState = getInitialState();
    const eventRegId = Object.keys(initialState.registrationForm.regCart.eventRegistrations)[0];
    const eventReg = {
      [eventRegId]: {
        ...initialState.registrationForm.regCart.eventRegistrations[eventRegId],
        sessionBundleRegistrations: {
          [registeredSessionBundleId]: {
            requestedAction: 'REGISTER',
            productId: registeredSessionBundleId
          }
        },
        sessionRegistrations: {
          '9272e9d2-ad86-4e41-9038-267c6d87d38b': {
            requestedAction: 'REGISTER',
            productId: '9272e9d2-ad86-4e41-9038-267c6d87d38b',
            registrationSourceType: 'Track',
            registrationSourceParentId: registeredSessionBundleId,
            includedInAgenda: false
          }
        }
      }
    };
    const state = {
      ...initialState,
      event: {
        ...initialState.event,
        eventFeatureSetup: {
          agendaItems: {
            admissionItems: true,
            sessions: true,
            optionalItems: true,
            tracks: true
          },
          registrationProcess: {}
        }
      }
    };
    // @ts-expect-error ts-migrate(2741) FIXME: Property ''b18958b2-bf64-4e2e-9c07-e13fd4b0f314'' ... Remove this comment to see the full error message
    state.registrationForm.regCart.eventRegistrations = eventReg;
    const getState = () => state;
    const store = { getState, subscribe: jest.fn(), dispatch: jest.fn() };

    const props = {
      ...defaultProps,
      config: {
        ...defaultProps.config,
        displaySessionBundles: true
      }
    };

    const apolloClientMocks = getApolloClientMocks(getState());
    apolloClientMocks.push({
      request: {
        query: GET_VISIBLE_SESSION_BUNDLES,
        variables: {
          registrationPathId: 'regPathId',
          selectedRegistrationTypeIds: ['00000000-0000-0000-0000-000000000000'],
          admissionId: '2819f92f-e09a-4463-b597-37f5ed1d4335',
          isPlanner: false,
          regCartId: null,
          eventId: '',
          environment: '',
          eventSnapshotVersion: '',
          pathFunction: _getVisibleSessionBundlesPath
        }
      },
      result: {
        data: {
          products: {
            snapshotVersion: 'VERSION',
            sessionBundles: {
              '51b3dfdf-2672-47b5-b3b0-19ac7458707c': {
                id: '51b3dfdf-2672-47b5-b3b0-19ac7458707c',
                description: '',
                name: 'sb3',
                code: 'sb3',
                defaultFeeId: 'd6fe8f7f-7ac5-450c-9458-025c293cece1',
                fees: {
                  'd6fe8f7f-7ac5-450c-9458-025c293cece1': {
                    chargePolicies: [
                      {
                        id: 'e5d5c38b-0121-45aa-8425-64d50cd799d1',
                        isActive: true,
                        effectiveUntil: '2999-12-31T00:00:00.000Z',
                        amount: 103,
                        maximumRefundAmount: 103,
                        isBeforeCurrentDate: false
                      }
                    ],
                    refundPolicies: [],
                    isActive: true,
                    isRefundable: true,
                    displayOnFeePage: true,
                    registrationTypes: [],
                    name: 'fee103',
                    id: 'd6fe8f7f-7ac5-450c-9458-025c293cece1',
                    amount: 103,
                    glCodes: []
                  }
                },
                productDisplayOrder: 1,
                applicableRegistrationTypes: [],
                capacity: {
                  availableCapacity: -1
                }
              },
              [registeredSessionBundleId]: {
                id: registeredSessionBundleId,
                description: '',
                name: registeredSessionBundleName,
                code: 'sb1',
                defaultFeeId: '4e41da1c-ed5a-4581-b150-a0e828413156',
                fees: {
                  '4e41da1c-ed5a-4581-b150-a0e828413156': {
                    chargePolicies: [
                      {
                        id: '139e8934-4c69-4133-b981-20f71ac3d4d8',
                        isActive: true,
                        effectiveUntil: '2999-12-31T00:00:00.000Z',
                        amount: 102,
                        maximumRefundAmount: 102,
                        isBeforeCurrentDate: false
                      }
                    ],
                    refundPolicies: [],
                    isActive: true,
                    isRefundable: true,
                    displayOnFeePage: true,
                    registrationTypes: [],
                    name: 'fee102',
                    id: '4e41da1c-ed5a-4581-b150-a0e828413156',
                    amount: 102,
                    glCodes: []
                  }
                },
                productDisplayOrder: 2,
                applicableRegistrationTypes: ['00000000-0000-0000-0000-000000000000'],
                capacity: {
                  availableCapacity: -1
                }
              }
            }
          }
        }
      }
    });

    const mountComponent_ = async () => {
      const component = mount(
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <Provider store={store}>
          <MockedProvider
            mocks={apolloClientMocks}
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any; addTypeName... Remove this comment to see the full error message
            addTypeName={false}
            cache={createCache(store, {
              eventId: '',
              environment: ''
            })}
          >
            <RegistrationSummaryWidget {...props} type="RegistrationSummary" />
          </MockedProvider>
        </Provider>
      );
      await waitWithAct(100);
      await component.update();
      return component;
    };
    const component = await mountComponent_();
    const sessionBundleComponentProps = component
      .findWhere(c => c.name() === 'SessionBundles')
      .first()
      .findWhere(c => c.name() === 'ProductRow' && c.prop('productId') === registeredSessionBundleId)
      .first()
      .props();
    expect(sessionBundleComponentProps.productId).toEqual(registeredSessionBundleId);
    expect(sessionBundleComponentProps.name).toEqual(registeredSessionBundleName);
  });
});

describe('TimeZone related tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('selected device timezone from timezone dialog updates the session timings', async () => {
    const customState = {
      appData: {
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      event: {
        status: 2,
        closeDate: '9999-10-27T03:59:00.000Z',
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: false
          }
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      registrationForm: {
        regCart: {
          registrationApprovalRequired: true,
          eventRegistrations: {
            'b18958b2-bf64-4e2e-9c07-e13fd4b0f314': {
              registrationStatus: 'REGISTERED'
            }
          }
        },
        selectedTimeZone: {
          utcOffset: 330,
          value: 1001,
          abbreviation: 'IST',
          abbreviationResourceKey: 'IST translation'
        }
      },
      selectedTimeZone: {
        utcOffset: 330,
        value: 1001,
        abbreviation: 'IST'
      },
      experiments: {}
    };

    const getTimezoneOffset = Date.prototype.getTimezoneOffset;
    // eslint-disable-next-line no-extend-native
    Date.prototype.getTimezoneOffset = () => {
      return -330;
    };

    const widget = await mountComponent(customState);

    const startTime = '2018-04-14T22:00:00.000Z';
    const endTime = '2018-04-14T23:00:00.000Z';
    const getProductsTableComponent = () => widget.find(ProductsTable);
    const sessions = getProductsTableComponent().getElement().props.sortedSessions;
    let k = 0;
    while (k < 3) {
      const adjustedStartTime = sessions[k].startTime;
      const adjustedEndTime = sessions[k].endTime;
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
      expect(differenceStart / 3600000).toBe(9.5); // The hour difference between IST and ET with daylight savings
      expect(differenceEnd / 3600000).toBe(9.5);
      k = k + 1;
    }
    expect(widget.find('[children=" IST translation"]').getElements().length).toBe(0);
    // eslint-disable-next-line no-extend-native
    Date.prototype.getTimezoneOffset = getTimezoneOffset;
  });

  test('selecting event timezone from timezone dialog does not change the session timings', async () => {
    const customState = {
      appData: {
        timeZoneSetting: {
          displayTimeZone: true,
          selectedWidgets: ['registrationSummary']
        }
      },
      event: {
        status: 2,
        closeDate: '9999-10-27T03:59:00.000Z',
        eventFeatureSetup: {
          registrationProcess: {
            groupRegistration: true,
            registrationApproval: false
          }
        }
      },
      pathInfo: {
        currentPageId: 'confirmation'
      },
      registrationForm: {
        regCart: {
          registrationApprovalRequired: true,
          eventRegistrations: {
            'b18958b2-bf64-4e2e-9c07-e13fd4b0f314': {
              registrationStatus: 'REGISTERED'
            }
          }
        }
      },
      selectedTimeZone: {
        utcOffset: -240,
        value: 35,
        abbreviation: 'ET',
        abbreviationResourceKey: 'ET translation'
      },
      experiments: {}
    };

    const widget = await mountComponent(customState);

    const startTime = '2018-04-14T22:00:00.000Z';
    const endTime = '2018-04-14T23:00:00.000Z';
    const getProductsTableComponent = () => widget.find(ProductsTable);
    const sessions = getProductsTableComponent().getElement().props.sortedSessions;
    let k = 0;
    while (k < 3) {
      const adjustedStartTime = sessions[k].startTime;
      const adjustedEndTime = sessions[k].endTime;
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      const differenceStart = new Date(adjustedStartTime) - new Date(startTime);
      // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
      const differenceEnd = new Date(adjustedEndTime) - new Date(endTime);
      expect(differenceStart / 3600000).toBe(0); // No change as selected timezone is the event timezone
      expect(differenceEnd / 3600000).toBe(0);
      k = k + 1;
    }
    expect(widget.find('[children=" ET translation"]').getElements().length).toBe(3);
  });
});
