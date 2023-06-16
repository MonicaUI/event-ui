/* eslint-env jest */
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import thunk from 'redux-thunk';
import { REGISTERING } from '../../../registrationIntents';
import { updateIn, setIn } from 'icepick';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import pageContainingWidgetFixture from '../../../../testUtils/pageContainingWidgetFixture';
import { set, cloneDeep } from 'lodash';
import { setRegistrationTypeId } from '../registrationTypes';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../../../reducer';
import { clearInapplicableSelectedPaymentMethod } from '../../regCartPayment/actions';
jest.mock('../../regCartPayment/actions', () => ({
  ...jest.requireActual<$TSFixMe>('../../regCartPayment/actions'),
  clearInapplicableSelectedPaymentMethod: jest.fn(
    jest.requireActual<$TSFixMe>('../../regCartPayment/actions').clearInapplicableSelectedPaymentMethod
  ),
  setCreditCardPaymentType: jest.fn(
    jest.requireActual<$TSFixMe>('../../regCartPayment/actions').setCreditCardPaymentType
  ),
  setCreditCardField: jest.fn(jest.requireActual<$TSFixMe>('../../regCartPayment/actions').setCreditCardField)
}));
import { handleRegTypeConflictFromServiceValidationResult } from '../../../../dialogs/selectionConflictDialogs';
jest.mock('../../../../dialogs/selectionConflictDialogs', () => ({
  ...jest.requireActual<$TSFixMe>('../../../../dialogs/selectionConflictDialogs'),
  handleRegTypeConflictFromServiceValidationResult: jest.fn(
    jest.requireActual<$TSFixMe>('../../../../dialogs/selectionConflictDialogs')
      .handleRegTypeConflictFromServiceValidationResult
  )
}));

function RegCartClient() {}
function EventSnapshotClient() {}
function EventGuestClient() {}
function CapacityClient() {}

const eventId = EventSnapshot.eventSnapshot.id;
const accessToken = '';

const registrationTypes = {
  attendee: {
    id: 'attendee',
    name: 'Attendee',
    isOpenForRegistration: true
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    isOpenForRegistration: true
  },
  employee: {
    id: 'employee',
    name: 'Employee',
    isOpenForRegistration: true
  },
  student: {
    id: 'student',
    name: 'Student',
    isOpenForRegistration: false
  },
  guest: {
    id: 'guest',
    name: 'Guest',
    isOpenForRegistration: true
  }
};

const regCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'INPROGRESS',
  eventSnapshotVersions: {
    eventId: 'fake-eventSnapshot-version'
  },
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      eventId,
      attendee: {
        personalInformation: {
          contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
          emailAddress: 'lroling-384934@j.mail',
          firstName: 'Luke',
          lastName: 'Roling',
          primaryAddressType: 'WORK'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      attendeeType: 'ATTENDEE',
      productRegistrations: [
        {
          productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ],
      sessionRegistrations: {},
      donationItemRegistrations: {
        donationItem2: {
          productId: 'donationItem2',
          amount: '7'
        }
      },
      registrationTypeId: 'vip',
      registrationPathId: 'regPathId'
    }
  }
};

const response = {
  // mock response with getters to always use fresh copy
  get regCart() {
    return {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
      status: 'INPROGRESS',
      eventSnapshotVersions: {
        eventId: 'fake-eventSnapshot-version'
      },
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          attendee: {
            personalInformation: {
              emailAddress: 'lroling-384934@j.mail'
            },
            attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
          },
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          productRegistrations: [
            {
              productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      }
    };
  }
};

const baseState = {
  accessToken,
  account: {},
  eventSnapshotVersion: 'fake-eventSnapshot-version',
  version: 'fake-eventSnapshot-version',
  clients: {
    regCartClient: new RegCartClient(),
    eventSnapshotClient: new EventSnapshotClient(),
    eventGuestClient: new EventGuestClient(),
    capacityClient: new CapacityClient()
  },
  regCartStatus: {
    registrationIntent: REGISTERING,
    lastSavedRegCart: regCart
  },
  text: {
    locale: 'en',
    translate: jest.fn()
  },
  event: {
    registrationTypes,
    capacityId: 'event_capacity',
    eventSnapshotVersion: 'fake-eventSnapshot-version',
    version: 'fake-eventSnapshot-version',
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationTypes: true
      },
      fees: {
        fees: true
      },
      agendaItems: {
        admissionItems: false
      }
    },
    products: {
      sessionContainer: {}
    }
  },
  website: {
    ...pageContainingWidgetFixture('pageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId']
          },
          newRegPathId: {
            id: 'newRegPathId',
            pageIds: ['newPageId']
          }
        }
      }
    },
    theme: {
      global: {},
      sections: {}
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          registrationTypeSettings: {
            limitVisibility: false
          },
          guestRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: false
            }
          },
          accessRules: {
            invitationListAccess: {
              isEmailOnlyInvite: false
            }
          },
          associatedRegistrationTypes: ['vip', 'employee'],
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
          }
        },
        newRegPathId: {
          registrationTypeSettings: {
            limitVisibility: false
          },
          guestRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: false
            }
          },
          accessRules: {
            invitationListAccess: {
              isEmailOnlyInvite: false
            }
          },
          associatedRegistrationTypes: ['attendee', 'student', 'guest'],
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
          }
        }
      }
    },
    registrationPathSettings: {
      regPathId: {
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
      },
      newRegPathId: {
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
    }
  },
  userSession: {
    isPreview: false
  },
  registrationForm: {
    regCartPayment: {
      selectedPaymentMethod: 'creditCard',
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
    regCart
  },
  capacity: {},
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  },
  travelCart: {},
  visibleProducts: {
    Sessions: {
      '00000000-0000-0000-0000-000000000001': {
        admissionItems: {},
        sessionProducts: {}
      }
    }
  }
};

const cloneState = state => {
  const clonedState = cloneDeep(state);
  set(
    clonedState,
    ['widgetFactory', 'loadMetaData'],
    jest.fn(() => {
      return {};
    })
  );
  return clonedState;
};

const createMockStore = state => {
  return createStore(reducer, state, applyMiddleware(thunk));
};

const registrationTypeCapacity = {
  regType_capacity_attendee: {
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  },
  regType_capacity_vip: {
    totalCapacityAvailable: 200,
    availableCapacity: 200,
    active: true
  },
  regType_capacity_employee: {
    totalCapacityAvailable: 10,
    availableCapacity: -1,
    active: true
  },
  regType_capacity_student: {
    totalCapacityAvailable: 10,
    availableCapacity: 10,
    active: true
  },
  regType_capacity_guest: {
    totalCapacityAvailable: 2,
    availableCapacity: 2,
    active: true
  }
};
RegCartClient.prototype.getCapacitySummaries = jest.fn(() => {
  return registrationTypeCapacity;
});
RegCartClient.prototype.calculateRegCartPricing = jest.fn(() => Promise.resolve({}));
RegCartClient.prototype.updateRegCart = jest.fn(() => response.regCart);
EventGuestClient.prototype.getWebsiteContent = jest.fn(() => Promise.resolve({}));
CapacityClient.prototype.getCapacitySummaries = jest.fn(() => {
  return registrationTypeCapacity;
});

const updateRegPathProcessOfflinePaymentSetting = (state, regpathId, processOffline) => {
  return setIn(
    state,
    ['appData', 'registrationPathSettings', regpathId, 'paymentSettings', 'creditCard', 'processOffline'],
    processOffline
  );
};

// fresh references in each test cases
let store;
let regCartClient;
let eventSnapshotClient;
let eventGuestClient;
describe('RegistrationTypeWidget switching paths from CCLP to non-CCLP -', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // clear counters in jest mock functions
  });

  test('on path with cclp off switching to path with it on', async () => {
    let initialState = cloneState(baseState);
    initialState = updateRegPathProcessOfflinePaymentSetting(initialState, 'newRegPathId', true);

    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const newRegType = 'attendee';
    const updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        registrationTypeId: newRegType,
        registrationPathId: 'newRegPathId'
      };
    });

    const mockRegistrationProcess = {
      registrationPathId: 'newRegPathId',
      pageVariety: 'REGISTRATION',
      pageIds: [],
      pages: {},
      layoutItems: {},
      registrationPath: {
        id: 'newRegPathId',
        registrationPageFields: [],
        modification: {}
      }
    };

    store = createMockStore(initialState);

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    eventSnapshotClient = store.getState().clients.eventSnapshotClient;
    eventSnapshotClient.getEventSnapshot = jest.fn(() => initialState.event);
    eventGuestClient = store.getState().clients.eventGuestClient;
    eventGuestClient.getRegistrationContent = jest.fn(() => mockRegistrationProcess);

    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.ONLINE
    );
    await store.dispatch(setRegistrationTypeId(eventRegistrationId, newRegType));

    expect(clearInapplicableSelectedPaymentMethod).toHaveBeenCalled();
    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.OFFLINE
    );
  });

  test('on path with cclp off switching to path with it off', async () => {
    let initialState = cloneState(baseState);
    initialState = updateRegPathProcessOfflinePaymentSetting(initialState, 'newRegPathId', false);

    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const newRegType = 'attendee';
    const updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        registrationTypeId: newRegType,
        registrationPathId: 'newRegPathId'
      };
    });

    const mockRegistrationProcess = {
      registrationPathId: 'newRegPathId',
      pageVariety: 'REGISTRATION',
      pageIds: [],
      pages: {},
      layoutItems: {},
      registrationPath: {
        id: 'newRegPathId',
        registrationPageFields: [],
        modification: {}
      }
    };

    store = createMockStore(initialState);

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    eventSnapshotClient = store.getState().clients.eventSnapshotClient;
    eventSnapshotClient.getEventSnapshot = jest.fn(() => initialState.event);
    eventGuestClient = store.getState().clients.eventGuestClient;
    eventGuestClient.getRegistrationContent = jest.fn(() => mockRegistrationProcess);

    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.ONLINE
    );
    await store.dispatch(setRegistrationTypeId(eventRegistrationId, newRegType));

    expect(clearInapplicableSelectedPaymentMethod).toHaveBeenCalled();
    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.ONLINE
    );
  });

  test('on path with cclp on switching to path with it off', async () => {
    let initialState = cloneState(baseState);
    initialState = updateRegPathProcessOfflinePaymentSetting(initialState, 'newRegPathId', false);
    initialState = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );

    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const newRegType = 'attendee';
    const updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        registrationTypeId: newRegType,
        registrationPathId: 'newRegPathId'
      };
    });

    const mockRegistrationProcess = {
      registrationPathId: 'newRegPathId',
      pageVariety: 'REGISTRATION',
      pageIds: [],
      pages: {},
      layoutItems: {},
      registrationPath: {
        id: 'newRegPathId',
        registrationPageFields: [],
        modification: {}
      }
    };

    store = createMockStore(initialState);

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    eventSnapshotClient = store.getState().clients.eventSnapshotClient;
    eventSnapshotClient.getEventSnapshot = jest.fn(() => initialState.event);
    eventGuestClient = store.getState().clients.eventGuestClient;
    eventGuestClient.getRegistrationContent = jest.fn(() => mockRegistrationProcess);

    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.OFFLINE
    );
    await store.dispatch(setRegistrationTypeId(eventRegistrationId, newRegType));

    expect(clearInapplicableSelectedPaymentMethod).toHaveBeenCalled();
    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.ONLINE
    );
  });

  test('on path with cclp on switching to path with it on', async () => {
    let initialState = cloneState(baseState);
    initialState = updateRegPathProcessOfflinePaymentSetting(initialState, 'newRegPathId', true);
    initialState = setIn(
      initialState,
      ['registrationForm', 'regCartPayment', 'pricingInfo', 'creditCard', 'paymentType'],
      PAYMENT_TYPE.OFFLINE
    );

    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const newRegType = 'attendee';
    const updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        registrationTypeId: newRegType,
        registrationPathId: 'newRegPathId'
      };
    });

    const mockRegistrationProcess = {
      registrationPathId: 'newRegPathId',
      pageVariety: 'REGISTRATION',
      pageIds: [],
      pages: {},
      layoutItems: {},
      registrationPath: {
        id: 'newRegPathId',
        registrationPageFields: [],
        modification: {}
      }
    };

    store = createMockStore(initialState);

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    eventSnapshotClient = store.getState().clients.eventSnapshotClient;
    eventSnapshotClient.getEventSnapshot = jest.fn(() => initialState.event);
    eventGuestClient = store.getState().clients.eventGuestClient;
    eventGuestClient.getRegistrationContent = jest.fn(() => mockRegistrationProcess);

    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.OFFLINE
    );
    await store.dispatch(setRegistrationTypeId(eventRegistrationId, newRegType));

    expect(clearInapplicableSelectedPaymentMethod).toHaveBeenCalled();
    expect(store.getState().registrationForm.regCartPayment.pricingInfo.creditCard.paymentType).toEqual(
      PAYMENT_TYPE.OFFLINE
    );
  });

  test('change reg type throw session bundle reg type conflict error', async () => {
    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const newRegType = 'attendee';

    const error = new Error('somethingWrong');
    (error as $TSFixMe).responseBody = {
      validationMessages: [
        {
          severity: 'Error',
          localizationKey: 'REGAPI.PRODUCT_REGTYPE_CONFLICT',
          parametersMap: {
            eventRegistrationId: 'evtRegId',
            productId: 'sessionBundleId',
            productType: 'Track',
            registrationTypeId: 'attendee'
          }
        }
      ]
    };
    store = createMockStore(baseState);

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => {
      throw error;
    });

    await store.dispatch(setRegistrationTypeId(eventRegistrationId, newRegType));
    expect(handleRegTypeConflictFromServiceValidationResult).toHaveBeenCalled();
  });
});
