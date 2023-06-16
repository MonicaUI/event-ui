/* eslint-env jest */
/* eslint-disable jest/no-conditional-expect,jest/no-try-expect */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  startRegistration,
  saveRegistration,
  finalizeRegistration,
  startCancelRegistration,
  finalizeCancelRegistration,
  startModification,
  startDeclineRegistration,
  finalizeDeclineRegistration,
  startWaitlistRegistration,
  finalizeWaitlistRegistration,
  addGroupMemberInRegCart
} from '..';
import { restoreRegistration, resumePartialRegistration } from '../restore';
import { selectAdmissionItem } from '../admissionItems';
import { loadCountryStates } from '../../../states';
import { updateDiscountCodes } from '../../../../widgets/PaymentWidget/actions';
import { restoreTravelRegistration } from '../../../travelCart/external';
import { updateGuestCountWithLoading } from '../../../../widgets/GuestRegistrationWidget/GuestRegistration';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import { updateIn, setIn, dissoc } from 'icepick';
import { REGISTERING, SAVING_REGISTRATION } from '../../../registrationIntents';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CapacityClient = require('event-widgets/clients/CapacityClient').default;
import appData from './appData.json';
import {
  openGuestProductCapacityReachedDialog,
  validateNoAvailableAdmissionItemOrEventCapacity,
  validateNoWaitlistedSessionCapacity
} from '../../../../dialogs/selectionConflictDialogs/GuestProductCapacityReachedDialog';
import { openGuestProductSelectionDialog } from '../../../../dialogs/GuestProductSelectionDialogs';
import { getUpdateErrors } from '../../errors';
import { openNoAdmissionItemAvailableForRegistrationTypeDialog } from '../../../../dialogs/NoAdmissionItemAvailableForRegistrationTypeDialog';
import { hasRegTypeCapacityWarning } from '../../warnings';
import { openCapacityReachedDialog } from '../../../../dialogs/CapacityReachedDialog';
import { openKnownErrorDialog } from '../../../../dialogs/KnownErrorDialog';
import { getAdmissionItems, getRegistrationTypeId, getEventRegistrationId } from '../../../selectors/currentRegistrant';
import { combineReducers } from 'redux';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import regCartReducer from '../reducer';
import registrationFormReducer from '../../reducer';
import { ServiceError } from '@cvent/event-ui-networking';
import { applyPartialEventRegistrationUpdate } from '../partialUpdates';
import { switchSession, selectSession, unSelectSession } from '../sessions';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { promptToTakeOverRegistration } from '../../../../initializeMultiTabTracking';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
// eslint-disable-next-line jest/no-mocks-import
import { getState, RegCartClient, response } from '../__mocks__/regCart';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../../../../widgets/PaymentWidget/__mocks__/apolloClient';
import { openEventTemporaryClosedErrorDialog } from '../../../../dialogs/EventTemporaryClosedErrorDialog';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { setAirRequestOptOutChoice } from '../workflow';
import { TRAVEL_OPT_OUT_CHOICE } from 'event-widgets/utils/travelConstants';
import { beginNewRegistration } from '../../../../routing/startRegistration';
import * as actionsModule from '../../regCartPayment/actions';
jest.mock('../../../../routing/startRegistration', () => {
  return {
    beginNewRegistration: jest.fn()
  };
});
const clearInapplicableSelectedPaymentMethodSpy = jest.spyOn(actionsModule, 'clearInapplicableSelectedPaymentMethod');
jest.mock('../../../../widgets/PaymentWidget/getRegCartPricingAction', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: async (state, _) => {
    return state;
  }
}));

jest.mock('../../../../dialogs/selectionConflictDialogs/GuestProductCapacityReachedDialog', () => {
  const fn = jest.fn();
  return {
    openGuestProductCapacityReachedDialog: () => fn,
    validateNoAvailableAdmissionItemOrEventCapacity: jest.fn(),
    validateNoWaitlistedSessionCapacity: jest.fn()
  };
});

jest.mock('../../../../initializeMultiTabTracking', () => {
  return {
    promptToTakeOverRegistration: jest.fn()
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const errors = require('../../errors');
errors.getUpdateErrors.isGuestProductAvailabilityError = jest.fn();
errors.getUpdateErrors.isAddGroupMemberNotAvailableError = jest.fn();
errors.getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError = jest.fn();
errors.getUpdateErrors.isDiscountCapacityInsufficient = jest.fn();
errors.getUpdateErrors.isProductAvailabilityError = jest.fn();
errors.getUpdateErrors.isKnownError = jest.fn();
errors.getUpdateErrors.isEventTemporaryClosed = jest.fn();
errors.getUpdateErrors.isProductAvailabilityErrorInHybridEvent = jest.fn();

jest.mock('../../../../dialogs//GuestProductSelectionDialogs', () => {
  const fn = jest.fn();
  return {
    openGuestProductSelectionDialog: () => fn
  };
});

jest.mock('../../../actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../actions'),
    filterEventSnapshot: () => () => {},
    loadRegistrationContent: () => () => {}
  };
});

jest.mock('../../../../dialogs//NoAdmissionItemAvailableForRegistrationTypeDialog', () => {
  const fn = jest.fn();
  return {
    openNoAdmissionItemAvailableForRegistrationTypeDialog: () => fn
  };
});
jest.mock('../../../../dialogs/CapacityReachedDialog', () => {
  const fn = jest.fn();
  return {
    openCapacityReachedDialog: () => fn
  };
});
jest.mock('../../../../dialogs/KnownErrorDialog', () => {
  const fn = jest.fn();
  return {
    openKnownErrorDialog: () => fn
  };
});
jest.mock('../../../../dialogs//EventTemporaryClosedErrorDialog', () => {
  const fn = jest.fn();
  return {
    openEventTemporaryClosedErrorDialog: () => fn
  };
});
jest.mock('../../warnings');

const partialRegCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'INPROGRESS',
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      attendee: {
        personalInformation: {
          emailAddress: 'lroling-384934@j.mail'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      confirmationNumber: '123456789',
      productRegistrations: [],
      registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
    }
  }
};

const selectedAdmissionItemId = '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c';
const selectedSessionId = 'a550c1a7-ed00-5e55-1045-500000000000';
const dummyCapacitySummaries = {
  'c0215717-5640-4e9d-b790-36047f14bf21': {
    capacityId: 'c0215717-5640-4e9d-b790-36047f14bf21',
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  },
  '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c': {
    capacityId: selectedAdmissionItemId,
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  }
};
RegCartClient.prototype.getCapacitySummaries = jest.fn(() => {
  return dummyCapacitySummaries;
});

const mockStore = state => {
  const apolloClient = mockApolloClient(state.regCartPricing);
  const middlewares = [thunk.withExtraArgument({ apolloClient })];
  return configureMockStore(middlewares)(state);
};
const baseUrl = '/event_guest/v1/';
const eventId = EventSnapshot.eventSnapshot.id;
const environment = 'S408';
const accessToken = 'BEARER TOKEN';
const createError = responseBody => ({
  responseStatus: 422,
  responseBody,
  httpLogRequestId: 'requestHeader',
  httpLogPageLoadId: 'pageLoadId',
  errorDateTime: new Date()
});

jest.mock('uuid', () => {
  return {
    v4: jest
      .fn()
      .mockReturnValueOnce('01')
      .mockReturnValueOnce('02')
      .mockReturnValueOnce('03')
      .mockReturnValueOnce('04')
      .mockReturnValueOnce('05')
      .mockReturnValueOnce('06')
      .mockReturnValueOnce('07')
      .mockReturnValueOnce('07')
      .mockReturnValueOnce('08')
      .mockReturnValueOnce('09')
      .mockReturnValueOnce('010')
      .mockReturnValueOnce('011')
      .mockReturnValueOnce('012')
      .mockReturnValueOnce('02')
      .mockReturnValueOnce('013')
      .mockReturnValueOnce('014')
      .mockReturnValueOnce('015')
      .mockReturnValueOnce('016')
      .mockReturnValueOnce('017')
      .mockReturnValueOnce('018')
      .mockReturnValueOnce('019')
      .mockReturnValueOnce('020')
      .mockReturnValueOnce('021')
      .mockReturnValueOnce('022')
  };
});

// fresh references in each test cases
let store;
let regCartClient;
let travelApiClient;
beforeEach(() => {
  jest.clearAllMocks(); // clear counters in jest mock functions
  store = mockStore(getState());
  regCartClient = store.getState().clients.regCartClient;
  travelApiClient = store.getState().clients.travelApiClient;
});

afterEach(() => {
  // eslint-disable-next-line jest/no-standalone-expect
  expect(promptToTakeOverRegistration).not.toHaveBeenCalled();
});

test('restores registration', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const travelExternal = require('../../../travelCart/external');
  travelExternal.restoreTravelRegistration = jest.fn(() => ({ type: 'travel/restoreTravelFormDummyAction' }));

  await store.dispatch(restoreRegistration(''));
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.identifyByConfirm).not.toHaveBeenCalled();
  expect(restoreTravelRegistration).toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('restores registration with modCart', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const travelExternal = require('../../../travelCart/external');
  travelExternal.restoreTravelRegistration = jest.fn(() => ({ type: 'travel/restoreTravelFormDummyAction' }));

  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      regMod: true
    };
  });
  regCartClient.identifyByConfirm = jest.fn(() => {
    return {
      regCart: {
        ...response.regCart,
        regMod: true
      }
    };
  });

  await store.dispatch(restoreRegistration(''));
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.identifyByConfirm).toHaveBeenCalledTimes(1);
  expect(restoreTravelRegistration).toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('restores registration with modCart for secure login', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const travelExternal = require('../../../travelCart/external');
  travelExternal.restoreTravelRegistration = jest.fn(() => ({ type: 'travel/restoreTravelFormDummyAction' }));
  store = mockStore(
    Object.assign({}, getState(), {
      event: {
        ...getState().event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
        }
      }
    })
  );

  const { regCartClient: mockRegCartClient, eventGuestClient: mockEventGuestClient } = store.getState().clients;

  mockRegCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      regMod: true
    };
  });

  mockEventGuestClient.identifyByContactId = jest.fn(() => {
    return {
      ...response.regCart,
      regMod: true
    };
  });

  await store.dispatch(restoreRegistration(''));
  expect(mockRegCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(mockEventGuestClient.identifyByContactId).toHaveBeenCalledTimes(1);
  expect(restoreTravelRegistration).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('restores registration with locale', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const travelExternal = require('../../../travelCart/external');
  travelExternal.restoreTravelRegistration = jest.fn(() => ({ type: 'travel/restoreTravelFormDummyAction' }));

  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      regMod: true,
      localeId: 1033
    };
  });
  regCartClient.identifyByConfirm = jest.fn(() => {
    return {
      regCart: {
        ...response.regCart,
        regMod: true
      }
    };
  });

  await store.dispatch(restoreRegistration(''));
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.identifyByConfirm).toHaveBeenCalledTimes(1);
  expect(restoreTravelRegistration).toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('restores partial registration', async () => {
  await store.dispatch(resumePartialRegistration('162bc94e-36fc-4b8a-9017-24fd1f1875b7', partialRegCart));
  expect(regCartClient.resumePartialRegCart).toHaveBeenCalledTimes(1);
});

test('restores registration without paymentInfo', async () => {
  store = createStoreWithMiddleware(
    combineReducers({
      regCart: regCartReducer,
      clients: (x = {}) => x
    }),
    {
      clients: { regCartClient }
    }
  );
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      paymentInfo: {}
    };
  });
  await store.dispatch(restoreRegistration(''));
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(store.getState().regCart.paymentInfo).toEqual(null);
});

test('restores partial registration 1', async () => {
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.resumePartialRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      paymentInfo: {}
    };
  });
  await store.dispatch(resumePartialRegistration());
  expect(regCartClient.resumePartialRegCart).toHaveBeenCalledTimes(1);
});

const emptyRegCart = {
  regPackId: undefined,
  httpReferrer: 'cvent.com',
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      eventId,
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      attendee: {
        personalInformation: {},
        eventAnswers: {},
        referenceId: undefined
      },
      productRegistrations: [],
      registrationPathId: undefined,
      registrationTypeId: undefined,
      externalRegistrationContactId: ''
    }
  },
  localeId: 1033
};

test('creates an empty regCart', async () => {
  await store.dispatch(startRegistration({ eventId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.createRegCart).toHaveBeenCalledWith(
    accessToken,
    emptyRegCart,
    undefined,
    undefined,
    undefined,
    '',
    undefined,
    eventId,
    undefined
  );
  expect(store.getActions()).toMatchSnapshot();
});

const initialEmbeddedRegCart = {
  ...emptyRegCart,
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      ...emptyRegCart.eventRegistrations['00000000-0000-0000-0000-000000000001'],
      registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
    }
  },
  regCartId: '',
  embeddedRegistration: true
};

test('creates an temporary reg cart for embedded reg', async () => {
  const initialState = getState();
  store = mockStore(
    Object.assign({}, initialState, {
      registrationForm: {
        ...initialState.registrationForm,
        regCart: initialEmbeddedRegCart
      },
      appData: {
        ...initialState.appData,
        registrationSettings: {
          ...initialState.appData.registrationSettings,
          registrationPaths: {
            ...initialState.appData.registrationSettings.registrationPaths,
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              ...initialState.appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40'],
              id: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
              isDefault: true
            }
          }
        }
      }
    })
  );
  const theResponse = await store.dispatch(startRegistration({ eventId, isEmbeddedRegistration: true }));
  expect(theResponse.regCart).toStrictEqual(initialEmbeddedRegCart);
  expect(store.getActions()).toMatchSnapshot();
});

test('converts temporary reg cart and creates real cart when embedded reg progresses past first page', async () => {
  const initialState = getState();
  store = mockStore(
    Object.assign({}, initialState, {
      registrationForm: {
        ...initialState.registrationForm,
        regCart: initialEmbeddedRegCart
      },
      appData: {
        ...initialState.appData,
        registrationSettings: {
          ...initialState.appData.registrationSettings,
          registrationPaths: {
            ...initialState.appData.registrationSettings.registrationPaths,
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              ...initialState.appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40'],
              id: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
              isDefault: true
            }
          }
        }
      },
      accountSnapshotVersion: 'accountSnapshotVersionId',
      eventSnapshotVersion: 'eventSnapshotVersionId'
    })
  );
  const { regCartClient: mockRegCartClient } = store.getState().clients;
  await store.dispatch(startRegistration({ eventId }));
  const convertedEmbeddedRegCart = dissoc(initialEmbeddedRegCart, 'regCartId');
  expect(mockRegCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(mockRegCartClient.createRegCart).toHaveBeenCalledWith(
    accessToken,
    convertedEmbeddedRegCart,
    undefined,
    undefined,
    undefined,
    '',
    undefined,
    eventId,
    { account: 'accountSnapshotVersionId', event: 'eventSnapshotVersionId' }
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart with defaultRegTypeId', async () => {
  const defaultRegTypeId = 'abcdefgh-1234-4321-qwer-e2781d247f98';
  const updatedRegCart = JSON.parse(JSON.stringify(response.regCart));
  (Object.values(updatedRegCart.eventRegistrations)[0] as $TSFixMe).registrationTypeId = defaultRegTypeId;
  regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
  await store.dispatch(startRegistration({ eventId, regTypeId: defaultRegTypeId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart with contactId', async () => {
  const contactId = '408665a5-4cfc-4515-a7a1-04bb6aad8b20';
  const initialRegCart = {
    eventRegistrations: {
      '00000000-0000-0000-0000-000000000001': {
        eventId,
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        attendee: {
          personalInformation: {},
          eventAnswers: {}
        },
        productRegistrations: [],
        externalRegistrationContactId: ''
      }
    },
    httpReferrer: 'cvent.com',
    localeId: 1033
  };
  await store.dispatch(startRegistration({ eventId, contactId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.createRegCart).toHaveBeenCalledWith(
    accessToken,
    initialRegCart,
    contactId,
    undefined,
    undefined,
    '',
    undefined,
    eventId,
    undefined
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart with contactId and defaultRegTypeId', async () => {
  const defaultRegTypeId = 'abcdefgh-1234-4321-qwer-e2781d247f98';
  const contactId = '408665a5-4cfc-4515-a7a1-04bb6aad8b20';
  const initialRegCart = {
    eventRegistrations: {
      '00000000-0000-0000-0000-000000000001': {
        eventId,
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        attendee: {
          personalInformation: {},
          eventAnswers: {}
        },
        productRegistrations: [],
        registrationTypeId: 'abcdefgh-1234-4321-qwer-e2781d247f98',
        externalRegistrationContactId: ''
      }
    },
    httpReferrer: 'cvent.com',
    localeId: 1033
  };
  const updatedRegCart = JSON.parse(JSON.stringify(response.regCart));
  (Object.values(updatedRegCart.eventRegistrations)[0] as $TSFixMe).registrationTypeId = defaultRegTypeId;
  regCartClient.updateRegCart = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
  await store.dispatch(startRegistration({ eventId, contactId, regTypeId: defaultRegTypeId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.createRegCart).toHaveBeenCalledWith(
    accessToken,
    initialRegCart,
    contactId,
    undefined,
    undefined,
    '',
    undefined,
    eventId,
    undefined
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart using inviteeId for not planner reg', async () => {
  const inviteeId = 'aac17ae9-74b8-4687-ae9e-e2781d247f98';
  const initialRegCart = {
    eventRegistrations: {
      '00000000-0000-0000-0000-000000000001': {
        eventId,
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        attendee: {
          personalInformation: {},
          eventAnswers: {}
        },
        productRegistrations: [],
        externalRegistrationContactId: ''
      }
    },
    httpReferrer: 'cvent.com',
    localeId: 1033
  };
  await store.dispatch(startRegistration({ eventId, inviteeId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.createRegCart).toHaveBeenCalledWith(
    accessToken,
    initialRegCart,
    undefined,
    inviteeId,
    undefined,
    '',
    undefined,
    eventId,
    undefined
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart using inviteeId for planner reg', async () => {
  const inviteeId = 'aac17ae9-74b8-4687-ae9e-e2781d247f98';
  const registrationTypeId = 'abcdefgh-1234-4321-qwer-e2781d247f98';
  const state = getState();
  state.defaultUserSession.isPlanner = true;
  store = mockStore(state);

  const initialRegCart = {
    regPackId: undefined,
    eventRegistrations: {
      '00000000-0000-0000-0000-000000000001': {
        eventId,
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        attendee: {
          personalInformation: {},
          eventAnswers: {},
          referenceId: undefined
        },
        productRegistrations: [],
        registrationPathId: undefined,
        registrationTypeId,
        externalRegistrationContactId: ''
      }
    },
    httpReferrer: 'cvent.com',
    localeId: 1033
  };
  await store.dispatch(startRegistration({ eventId, inviteeId, regTypeId: registrationTypeId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.createRegCart).toHaveBeenCalledWith(
    accessToken,
    initialRegCart,
    undefined,
    inviteeId,
    undefined,
    '',
    undefined,
    eventId,
    undefined
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart for test mode event', async () => {
  const initialState = {
    ...getState(),
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    defaultUserSession: {
      ...getState().defaultUserSession,
      isTestMode: true
    }
  };
  store = mockStore(initialState);
  await store.dispatch(startRegistration({ eventId }));
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('saves regCart with updated information at every step', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
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
      productRegistrations: [
        {
          productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ]
    };
  });
  const guestRegistrationSettings = {
    isGuestRegistrationAllowed: true,
    isGuestProductSelectionEnabled: true
  };
  const initialState = {
    ...getState(),
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: updatedRegCart
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths,
          '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
            guestRegistrationSettings
          }
        }
      }
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.updateRegCart = jest.fn(() => {
    return {
      regCart: updatedRegCart
    };
  });
  await store.dispatch(saveRegistration());
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(
    accessToken,
    initialState.registrationForm.regCart,
    undefined
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('checks out the registration with offline payment', async () => {
  const pricingInfo = { paymentDetail: {}, paymentAmount: 98, paymentType: PAYMENT_TYPE.OFFLINE };
  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      status: 'COMPLETED'
    };
  });
  await store.dispatch(finalizeRegistration());
  expect(regCartClient.calculateRegCartPricing).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledTimes(1);
  expect(regCartClient.waitForRegCartCheckoutCompletion).toHaveBeenCalledTimes(1);
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  // travel cart shouldn't be fetched post checkout as "hasTravel" is false
  expect(travelApiClient.getTravelCart).toHaveBeenCalledTimes(0);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledWith(
    accessToken,
    getState().registrationForm.regCart.regCartId,
    pricingInfo,
    getState().testSettings.registrationCheckoutTimeout
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('checks out registration with travel', async () => {
  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      hasTravel: true,
      status: 'COMPLETED'
    };
  });
  await store.dispatch(finalizeRegistration());
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  // travel cart should have been fetched after checkout
  expect(travelApiClient.getTravelCart).toHaveBeenCalledTimes(1);
});

test('checks out the registration with no payment', async () => {
  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCartPayment: {
        selectedPaymentMethod: 'noPayment',
        pricingInfo: {
          noPayment: {
            paymentType: PAYMENT_TYPE.NO_PAYMENT
          }
        }
      }
    }
  };
  store = mockStore(initialState);
  const pricingInfo = { paymentAmount: 0, paymentType: PAYMENT_TYPE.NO_PAYMENT };
  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      status: 'COMPLETED'
    };
  });
  await store.dispatch(finalizeRegistration());
  expect(regCartClient.calculateRegCartPricing).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledTimes(1);
  expect(regCartClient.waitForRegCartCheckoutCompletion).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledWith(
    accessToken,
    getState().registrationForm.regCart.regCartId,
    pricingInfo,
    getState().testSettings.registrationCheckoutTimeout
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('checks out the registration with online payment', async () => {
  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCartPayment: {
        selectedPaymentMethod: 'creditCard',
        pricingInfo: {
          creditCard: {
            paymentMethodKey: 'creditCard',
            paymentType: PAYMENT_TYPE.ONLINE,
            paymentMethodType: 'Visa',
            number: '4111111111111111',
            name: 'ak',
            cVV: '123',
            expirationMonth: '7',
            expirationYear: '2017',
            address1: '1965 Us road',
            address2: '',
            address3: '',
            country: 'US',
            city: 'Mclean',
            state: 'VA',
            zip: '22012'
          }
        }
      }
    },
    regCartPricing: {
      netFeeAmountCharge: 98,
      netFeeAmountChargeWithPaymentAmountServiceFee: 98
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  const pricingInfo = {
    paymentAmount: 98,
    paymentDetail: {
      browserLandingURL: 'web-fake.cvent.com/',
      creditCard: {
        address1: '1965 Us road',
        address2: '',
        address3: '',
        cVV: '123',
        city: 'Mclean',
        country: 'US',
        expirationDate: '2017-07',
        expirationMonth: '7',
        expirationYear: '2017',
        name: 'ak',
        number: '4111111111111111',
        paymentMethodKey: 'creditCard',
        state: 'VA',
        type: 'Visa',
        zip: '22012'
      },
      paymentMethodMode: 'UseNewPaymentMethod'
    },
    paymentMethodType: 'Visa',
    paymentType: PAYMENT_TYPE.ONLINE
  };
  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      status: 'COMPLETED'
    };
  });
  await store.dispatch(finalizeRegistration());
  expect(regCartClient.calculateRegCartPricing).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledTimes(1);
  expect(regCartClient.waitForRegCartCheckoutCompletion).toHaveBeenCalledTimes(1);
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledWith(
    accessToken,
    getState().registrationForm.regCart.regCartId,
    pricingInfo,
    getState().testSettings.registrationCheckoutTimeout
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('checks out the registration with online payment using webpayments form', async () => {
  const contextId = 'FAKE_CONTEXT_ID';

  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCartPayment: {
        selectedPaymentMethod: 'creditCard',
        pricingInfo: {
          creditCard: {
            paymentMethodKey: 'creditCard',
            paymentType: PAYMENT_TYPE.ONLINE,
            paymentMethodType: 'Visa',
            contextId
          }
        }
      }
    },
    regCartPricing: {
      netFeeAmountCharge: 98,
      netFeeAmountChargeWithPaymentAmountServiceFee: 98
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  const pricingInfo = {
    paymentAmount: 98,
    paymentDetail: {
      browserLandingURL: 'web-fake.cvent.com/',
      contextId,
      coreBearerToken: accessToken.split(' ')[1],
      paymentMethodMode: 'UseNewPaymentMethod',
      creditCard: null
    },
    paymentMethodType: 'Visa',
    paymentType: PAYMENT_TYPE.ONLINE
  };
  regCartClient.getRegCart = jest.fn(() => {
    return {
      ...response.regCart,
      status: 'COMPLETED'
    };
  });
  await store.dispatch(finalizeRegistration());
  expect(regCartClient.calculateRegCartPricing).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledTimes(1);
  expect(regCartClient.waitForRegCartCheckoutCompletion).toHaveBeenCalledTimes(1);
  expect(regCartClient.getRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledWith(
    accessToken,
    getState().registrationForm.regCart.regCartId,
    pricingInfo,
    getState().testSettings.registrationCheckoutTimeout
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('updates the regcart with a selected admission item and rest of the regcart remains same', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const regCartWithRegTypeId = setIn(
    response.regCart,
    ['eventRegistrations', eventRegistrationId, 'registrationTypeId'],
    '4e271dd1-8e5c-4a95-95f5-da6897d64e5d'
  );
  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartWithRegTypeId
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    visibleProducts: {
      ...(getState as $TSFixMe).visibleProducts,
      ...response.visibleProducts
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  const updatedRegCart = updateIn(regCartWithRegTypeId, ['eventRegistrations', eventRegistrationId], eventReg => {
    return {
      ...eventReg,
      productRegistrations: [
        {
          productId: selectedAdmissionItemId,
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ]
    };
  });
  regCartClient.updateRegCart = jest.fn(() => {
    return {
      regCart: updatedRegCart
    };
  });
  regCartClient.getCapacitySummaries = jest.fn(() => {
    return dummyCapacitySummaries;
  });

  const capacityIds = [
    'sessionDId',
    'sessionEId',
    'sessionFId',
    'sessionGId',
    'a550c1a7-ed00-5e55-1045-500000000000',
    'c0215717-5640-4e9d-b790-36047f14bf21',
    '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
    'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
    'event_capacity',
    'dd48b4c4-672e-431c-be8d-5abfec299844::00000000-0000-0000-0000-000000000000',
    'dd48b4c4-672e-431c-be8d-5abfec299844::90def55d-3f9d-4726-b32d-871cf7b550db',
    'dd48b4c4-672e-431c-be8d-5abfec299844::4e271dd1-8e5c-4a95-95f5-da6897d64e5d'
  ];
  await store.dispatch(selectAdmissionItem('00000000-0000-0000-0000-000000000001', selectedAdmissionItemId));
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, updatedRegCart);
  expect(regCartClient.getCapacitySummaries).toHaveBeenCalledWith(accessToken, updatedRegCart.regCartId, capacityIds);
  expect(store.getActions()).toMatchSnapshot();
});

test('updates the regcart with an admission item with associated session', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const travelExternal = require('../../../travelCart/external');
  travelExternal.updateRegTypeAndAdmissionItemIdsInTravelBookings = jest.fn(() => ({
    type: 'updateRegTypeAndAdmissionItemIdsInTravelBookingsDummyAction'
  }));
  const admItemIdWithAssociatedSession = 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d';
  const admItemIdWithoutAssociatedSession = Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0];
  const associatedSessionId = Object.keys(response.products.sessionContainer.optionalSessions)[0];
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  let regCartAssociatedAdmItem = setIn(
    response.regCart,
    ['eventRegistrations', eventRegistrationId, 'productRegistrations', 0, 'productId'],
    admItemIdWithAssociatedSession
  );
  regCartAssociatedAdmItem = setIn(
    response.regCart,
    ['eventRegistrations', eventRegistrationId, 'sessionRegistrations', associatedSessionId],
    {
      sessionId: associatedSessionId,
      requestedAction: 'REGISTER',
      registrationSourceType: 'AdmissionItem',
      registrationSourceParentId: admItemIdWithAssociatedSession
    }
  );
  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      ...response.products,
      ...response.registrationTypes
    },
    appData,
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartAssociatedAdmItem
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    visibleProducts: {
      ...(getState as $TSFixMe).visibleProducts,
      ...response.visibleProducts
    }
  };
  store = mockStore(initialState);
  const updatedRegCart = updateIn(regCartAssociatedAdmItem, ['eventRegistrations', eventRegistrationId], eventReg => {
    return {
      ...eventReg,
      productRegistrations: [
        {
          productId: admItemIdWithoutAssociatedSession,
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ],
      sessionRegistrations: {}
    };
  });
  RegCartClient.prototype.updateRegCart = jest.fn(() => {
    return {
      regCart: updatedRegCart
    };
  });
  await store.dispatch(selectAdmissionItem('00000000-0000-0000-0000-000000000001', admItemIdWithoutAssociatedSession));
  expect(travelExternal.updateRegTypeAndAdmissionItemIdsInTravelBookings).toHaveBeenCalled();
  expect(RegCartClient.prototype.updateRegCart).toHaveBeenCalledTimes(1);
  expect(RegCartClient.prototype.updateRegCart).toHaveBeenCalledWith(accessToken, updatedRegCart);
  expect(store.getActions()).toMatchSnapshot();
});

test('start cancel registration', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const confirmationNumber = 'ABC123';
  const cancellingRegCart = setIn(
    response.regCart,
    ['eventRegistrations', eventRegistrationId, 'confirmationNumber'],
    confirmationNumber
  );
  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCart: cancellingRegCart
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  await store.dispatch(startCancelRegistration());
  expect(regCartClient.createCancelRegistrationCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('finalizing canceling of registration', async () => {
  const pricingInfo = { paymentType: PAYMENT_TYPE.OFFLINE };
  RegCartClient.prototype.getRegCart = jest.fn(() => ({
    ...response.regCart,
    status: 'COMPLETED'
  }));
  await store.dispatch(finalizeCancelRegistration());
  expect(RegCartClient.prototype.calculateRegCartPricing).toHaveBeenCalledTimes(1);
  expect(RegCartClient.prototype.startRegCartCheckout).toHaveBeenCalledTimes(1);
  expect(RegCartClient.prototype.waitForRegCartCheckoutCompletion).toHaveBeenCalledTimes(1);
  expect(RegCartClient.prototype.getRegCart).toHaveBeenCalledTimes(1);
  expect(RegCartClient.prototype.startRegCartCheckout).toHaveBeenCalledWith(
    accessToken,
    getState().registrationForm.regCart.regCartId,
    pricingInfo,
    getState().testSettings.registrationCheckoutTimeout
  );
  expect(store.getActions()).toMatchSnapshot();
});

test('inititates the modification of registration', async () => {
  await store.dispatch(startModification());
  expect(RegCartClient.prototype.createRegModCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('invitee declines the registration', async () => {
  const inviteeId = 'aac17ae9-74b8-4687-ae9e-e2781d247f98';
  const initialState = {
    ...getState(),
    userSession: {
      inviteeId
    },
    defaultUserSession: {
      eventId
    }
  };
  store = mockStore(initialState);
  await store.dispatch(startDeclineRegistration(inviteeId));
  expect(RegCartClient.prototype.createDeclineRegistrationCart).toHaveBeenCalledWith(
    accessToken,
    eventId,
    inviteeId,
    undefined,
    true,
    undefined,
    undefined
  );
  await store.dispatch(finalizeDeclineRegistration());
  expect(RegCartClient.prototype.startRegCartCheckout).toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('unknown invitee declines the registration', async () => {
  const regTypeId = 'regType';
  const initialState = {
    ...getState(),
    defaultUserSession: {
      eventId
    },
    userSession: {
      regTypeId
    }
  };
  store = mockStore(initialState);
  await store.dispatch(startDeclineRegistration(null, regTypeId));
  expect(RegCartClient.prototype.createDeclineRegistrationCart).toHaveBeenCalledWith(
    accessToken,
    eventId,
    null,
    regTypeId,
    true,
    undefined,
    undefined
  );
  await store.dispatch(finalizeDeclineRegistration());
  expect(RegCartClient.prototype.startRegCartCheckout).toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('enroll event registration waitlist', async () => {
  const inviteeId = 'aac17ae9-74b8-4687-ae9e-e2781d247f98';
  const initialState = {
    ...getState(),
    userSession: {
      inviteeId
    },
    defaultUserSession: {
      eventId
    }
  };
  store = mockStore(initialState);
  await store.dispatch(startWaitlistRegistration(inviteeId));
  expect(RegCartClient.prototype.createWaitlistRegistrationCart).toHaveBeenCalledWith(accessToken, eventId, inviteeId);
  await store.dispatch(finalizeWaitlistRegistration());
  expect(RegCartClient.prototype.startRegCartCheckout).toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('load states for a specified country that has already loaded states', async () => {
  const countryCode = 'US';
  const initialState = {
    ...getState(),
    text: {
      locale: 'en'
    },
    states: {
      US: {
        states: {
          id: 11,
          code: 'AL',
          categoryId: 1,
          nameResourceKey: 'cvt_lu3_0011',
          name: 'Alabama',
          categoryName: 'U.S. States',
          categoryNameResourceKey: 'cvt_lu4_0001',
          categoryOrder: 10,
          countryCode: 'US'
        },
        locale: 'en'
      }
    }
  };
  store = mockStore(initialState);
  await store.dispatch(loadCountryStates(countryCode));
  expect(store.getActions()).toMatchSnapshot();
});

// selector test
test('get admission item registrations from regCart', async () => {
  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  const admissionItemRegs = getAdmissionItems(initialState);
  expect(admissionItemRegs).toMatchSnapshot();
});
// Selector tests below
test('gets current registration type id', async () => {
  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  const typeId = getRegistrationTypeId(initialState);
  expect(typeId).toMatchSnapshot();
});

test('get current event registration id', async () => {
  const initialState = {
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  const eventRegistrationId = getEventRegistrationId(initialState);
  expect(eventRegistrationId).toMatchSnapshot();
});

test('unable to get current event registration id', async () => {
  const initialState = {
    ...getState(),
    registrationForm: {}
  };
  const eventRegistrationId = getEventRegistrationId(initialState);
  expect(eventRegistrationId).toMatchSnapshot();
});

test('throws error creating a regCart', async () => {
  regCartClient.createRegCart = jest.fn(() => {
    throw new Error();
  });
  try {
    await store.dispatch(startRegistration({ eventId }));
  } catch (error) {
    expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  }
});

test('throws error saving a regCart with updated information', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
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
      }
    };
  });
  const initialState = {
    ...getState(),
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    regCart: updatedRegCart
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.updateRegCart = jest.fn(() => {
    throw new Error();
  });
  try {
    await store.dispatch(saveRegistration());
  } catch (error) {
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  }
});

test('throws error updating the regcart with a selected admission item', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.updateRegCart = jest.fn(() => {
    throw new Error();
  });
  try {
    await store.dispatch(selectAdmissionItem('00000000-0000-0000-0000-000000000001', selectedAdmissionItemId));
  } catch (error) {
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  }
});

test('throws known error during partialUpdating the regcart when stackable discount is auto applied and non-stackable discount is consumed', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    regCartPricing: response.regCartPricing,
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.updateRegCart = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      // eslint-disable-line no-throw-literal
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.DISCOUNT_NONSTACKABLE'
          }
        ]
      }
    };
  });

  (getUpdateErrors.isProductAvailabilityError as $TSFixMe).mockImplementation(() => {
    return false;
  });
  (getUpdateErrors.isKnownError as $TSFixMe).mockImplementation(() => {
    return true;
  });

  await store.dispatch(
    applyPartialEventRegistrationUpdate(
      '00000000-0000-0000-0000-000000000001',
      { registrationTypeId: '00000000-0000-0000-0000-000000000002' },
      {},
      selectedAdmissionItemId,
      false
    )
  );
  expect(openKnownErrorDialog()).toHaveBeenCalled();
});

test('throws product error during partialUpdating when product is not available in hybrid event', async () => {
  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      attendingFormat: AttendingFormat.HYBRID
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    regCartPricing: response.regCartPricing,
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  regCartClient.updateRegCart = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      // eslint-disable-line no-throw-literal
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE'
          }
        ]
      }
    };
  });

  (getUpdateErrors.isProductAvailabilityErrorInHybridEvent as $TSFixMe).mockImplementation(() => {
    return true;
  });
  (getUpdateErrors.isKnownError as $TSFixMe).mockImplementation(() => {
    return false;
  });

  await store.dispatch(
    applyPartialEventRegistrationUpdate(
      '00000000-0000-0000-0000-000000000001',
      { registrationTypeId: '00000000-0000-0000-0000-000000000002' },
      {},
      selectedAdmissionItemId,
      false
    )
  );
  expect(openCapacityReachedDialog()).toHaveBeenCalled();
});

test('last saved regCart and updated regCart is same', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {},
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  initialState.regCartStatus.lastSavedRegCart = initialState.registrationForm.regCart; // reference equality
  store = mockStore(initialState);
  await store.dispatch(saveRegistration());
  expect(regCartClient.updateRegCart).not.toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('does not updates the regcart with a selected admission item that is currently updating', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: SAVING_REGISTRATION,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    }
  };
  store = mockStore(initialState);
  await store.dispatch(selectAdmissionItem('00000000-0000-0000-0000-000000000001', selectedAdmissionItemId));
  expect(regCartClient.updateRegCart).not.toHaveBeenCalled();
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a group regCart', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
  const initialState = {
    ...getState(),
    appData,
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart,
      currentEventRegistrationId: groupLeaderEventRegId
    },
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    pathInfo: {
      rootPath: 'evsrc/redux/modules/registrationForm/regCart/__tests__/regCartTests.jsents/dummyId',
      currentPageId: '617b1dc3-3ddb-4468-8087-049a4e6e51e8'
    },
    website: {
      ...getState().website,
      pluginData: {
        ...getState().website.pluginData,
        registrationProcessNavigation: {
          ...getState().website.pluginData.registrationProcessNavigation,
          registrationPaths: {
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              pageIds: [
                'regProcessStep1',
                'regPage:0cc99264-e900-43b2-a995-91b920ff2a33',
                'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
              ],
              id: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
              confirmationPageId: 'confirmation',
              postRegPageIds: ['confirmation']
            }
          }
        }
      }
    }
  };
  store = mockStore(initialState);

  const regCartWithNewEventReg = {
    ...response.regCart,
    eventRegistrations: {
      ...response.regCart.eventRegistrations,
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'GROUP_LEADER',
        registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
      },
      '02': {
        eventId,
        eventRegistrationId: '02',
        attendee: {
          personalInformation: {},
          eventAnswers: {}
        },
        attendeeType: 'ATTENDEE',
        primaryRegistrationId: groupLeaderEventRegId,
        productRegistrations: [
          {
            productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        registrationTypeId: '00000000-0000-0000-0000-000000000000'
      }
    }
  };
  RegCartClient.prototype.updateRegCart = jest.fn(() => {
    return {
      regCart: regCartWithNewEventReg
    };
  });
  await store.dispatch(addGroupMemberInRegCart(eventId));

  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartWithNewEventReg);
  expect(store.getActions()).toMatchSnapshot();
});

test('starts reg mod if button is clicked form post reg page', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
  const initialState = {
    ...getState(),
    appData,
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart,
      currentEventRegistrationId: groupLeaderEventRegId
    },
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    pathInfo: {
      rootPath: 'events/dummyId',
      currentPageId: 'confirmation'
    },
    website: {
      ...getState().website,
      pluginData: {
        ...getState().website.pluginData,
        registrationProcessNavigation: {
          ...getState().website.pluginData.registrationProcessNavigation,
          registrationPaths: {
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              pageIds: [
                'regProcessStep1',
                'regPage:0cc99264-e900-43b2-a995-91b920ff2a33',
                'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
              ],
              id: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
              confirmationPageId: 'confirmation',
              postRegPageIds: ['confirmation']
            }
          }
        }
      }
    },
    visibleProducts: {
      ...getState().visibleProducts,
      ...response.visibleProducts
    }
  };
  store = mockStore(initialState);

  const regCartWithNewEventReg = {
    ...response.regCart,
    eventRegistrations: {
      ...response.regCart.eventRegistrations,
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'GROUP_LEADER'
      },
      '03': {
        eventId,
        eventRegistrationId: '03',
        attendee: {
          personalInformation: {},
          eventAnswers: {}
        },
        attendeeType: 'ATTENDEE',
        primaryRegistrationId: groupLeaderEventRegId,
        productRegistrations: [
          {
            productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        registrationTypeId: '00000000-0000-0000-0000-000000000000'
      }
    }
  };

  RegCartClient.prototype.updateRegCart = jest.fn(() => {
    return {
      regCart: regCartWithNewEventReg
    };
  });
  await store.dispatch(addGroupMemberInRegCart(eventId));

  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartWithNewEventReg);
  expect(regCartClient.createRegModCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('add 3 guests to reg cart', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  await store.dispatch(updateGuestCountWithLoading(3));
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: groupLeaderEventRegId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {},
    sessionBundleRegistrations: {}
  };
  const regCartWithNewGuests = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        displaySequence: 1,
        ...guestRegDetails
      },
      '05': {
        eventRegistrationId: '05',
        displaySequence: 2,
        ...guestRegDetails
      },
      '06': {
        eventRegistrationId: '06',
        displaySequence: 3,
        ...guestRegDetails
      }
    }
  };
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  (validateNoWaitlistedSessionCapacity as $TSFixMe).mockImplementation(() => {
    return false;
  });
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartWithNewGuests);
  expect(store.getActions()).toMatchSnapshot();
});

test('3 registered guests, add 1 more during regMod', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: groupLeaderEventRegId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {},
    sessionBundleRegistrations: {}
  };

  const guestRegModCart = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        displaySequence: 1,
        ...guestRegDetails
      },
      '05': {
        eventRegistrationId: '05',
        displaySequence: 2,
        ...guestRegDetails
      },
      '06': {
        eventRegistrationId: '06',
        displaySequence: 3,
        ...guestRegDetails
      }
    }
  };

  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegModCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  await store.dispatch(updateGuestCountWithLoading(4));

  const regModCartWithNewGuests = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        displaySequence: 1
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        displaySequence: 2
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        displaySequence: 3
      },
      '07': {
        eventRegistrationId: '07',
        ...guestRegDetails,
        displaySequence: 4,
        requestedAction: 'REGISTER'
      }
    }
  };
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regModCartWithNewGuests);
  expect(store.getActions()).toMatchSnapshot();
});

test('3 registered guests, remove 1 guest during regMod', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: groupLeaderEventRegId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {}
  };

  const guestRegModCart = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 1
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 2
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 3
      }
    }
  };

  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegModCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  await store.dispatch(updateGuestCountWithLoading(2));

  const regModCartWithNewGuests = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 1
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 2
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        requestedAction: 'UNREGISTER',
        displaySequence: 3
      }
    }
  };
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regModCartWithNewGuests);
  expect(store.getActions()).toMatchSnapshot();
});

test('Adding guests creates new guest registrations', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: groupLeaderEventRegId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {},
    sessionBundleRegistrations: {}
  };

  const guestRegModCart = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 1
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 2
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        requestedAction: 'UNREGISTER',
        displaySequence: 3
      }
    }
  };

  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegModCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);

  /*
   * We have 2 registered guests and 1 guest scheduled to be removed,
   *selecting the total guests to be 4 should only result in 1 guest being added
   */
  await store.dispatch(updateGuestCountWithLoading(4));

  const regModCartWithNewGuests = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 1
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 2
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        requestedAction: 'UNREGISTER',
        displaySequence: 3
      },
      '07': {
        eventRegistrationId: '07',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 4
      },
      '08': {
        eventRegistrationId: '08',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 5
      }
    }
  };
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regModCartWithNewGuests);
  expect(store.getActions()).toMatchSnapshot();
});

test('Removing guests removes new guests first', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: groupLeaderEventRegId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {}
  };

  const guestRegModCart = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        registrationStatus: 'REGISTERED'
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        registrationStatus: 'REGISTERED'
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        requestedAction: 'REGISTER'
      }
    }
  };

  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegModCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);

  /*
   * We have 2 registered guests and 1 new guest
   *selecting the total guests to be 4 should only result in 1 guest being added
   */
  await store.dispatch(updateGuestCountWithLoading(2));

  const regModCartWithNewGuests = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '04': {
        eventRegistrationId: '04',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        registrationStatus: 'REGISTERED'
      },
      '05': {
        eventRegistrationId: '05',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        registrationStatus: 'REGISTERED'
      },
      '06': {
        eventRegistrationId: '06',
        ...guestRegDetails,
        requestedAction: 'UNREGISTER'
      }
    }
  };
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regModCartWithNewGuests);
  expect(store.getActions()).toMatchSnapshot();
});

test('selecting session for primary also selects it for guests', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'REGISTER'
      }
    }
  };

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...guestRegCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  const updatedRegCart = {
    ...guestRegCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...guestRegCart.eventRegistrations[eventRegistrationId],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            registrationSourceType: 'Selected',
            requestedAction: 'REGISTER'
          }
        }
      },
      '01': {
        ...guestRegCart.eventRegistrations['01'],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            registrationSourceType: 'Selected',
            requestedAction: 'REGISTER'
          }
        }
      }
    }
  };

  regCartClient.updateRegCart = jest.fn(() => {
    return {
      regCart: updatedRegCart
    };
  });
  await store.dispatch(selectSession('00000000-0000-0000-0000-000000000001', selectedSessionId));
  expect(regCartClient.updateRegCart).not.toHaveBeenCalled();
  expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
});

test('unselecting session for primary also unselects it for guests', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            registrationSourceType: 'Selected',
            requestedAction: 'UNREGISTER'
          }
        }
      }
    }
  };

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...guestRegCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;
  const updatedRegCart = {
    ...guestRegCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...guestRegCart.eventRegistrations[eventRegistrationId],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            registrationSourceType: 'Selected',
            requestedAction: 'UNREGISTER'
          }
        }
      },
      '01': {
        ...guestRegCart.eventRegistrations['01'],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            registrationSourceType: 'Selected',
            requestedAction: 'UNREGISTER'
          }
        }
      }
    }
  };

  regCartClient.updateRegCart = jest.fn(() => {
    return {
      regCart: updatedRegCart
    };
  });
  await store.dispatch(unSelectSession('00000000-0000-0000-0000-000000000001', selectedSessionId));
  expect(regCartClient.updateRegCart).not.toHaveBeenCalled();
  expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
});

test('removes associated session for primary + guests on adm item change', async () => {
  const admItemIdWithAssociatedSession = 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d';
  const admItemIdWithoutAssociatedSession = Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0];
  const associatedSessionId = Object.keys(response.products.sessionContainer.optionalSessions)[0];
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'REGISTER'
      }
    }
  };

  let regCartAssociatedAdmItem = setIn(
    guestRegCart,
    ['eventRegistrations', eventRegistrationId, 'productRegistrations', 0, 'productId'],
    admItemIdWithAssociatedSession
  );
  regCartAssociatedAdmItem = setIn(regCartAssociatedAdmItem, ['eventRegistrations', '01', 'productRegistrations', 0], {
    productId: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
    productType: 'AdmissionItem',
    quantity: 1,
    requestedAction: 'REGISTER'
  });

  regCartAssociatedAdmItem = setIn(
    regCartAssociatedAdmItem,
    ['eventRegistrations', eventRegistrationId, 'sessionRegistrations', associatedSessionId],
    {
      sessionId: associatedSessionId,
      requestedAction: 'REGISTER',
      registrationSourceType: 'AdmissionItem',
      registrationSourceParentId: admItemIdWithAssociatedSession
    }
  );

  regCartAssociatedAdmItem = setIn(
    regCartAssociatedAdmItem,
    ['eventRegistrations', '01', 'sessionRegistrations', associatedSessionId],
    {
      sessionId: associatedSessionId,
      requestedAction: 'REGISTER',
      registrationSourceType: 'AdmissionItem',
      registrationSourceParentId: admItemIdWithAssociatedSession
    }
  );

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...regCartAssociatedAdmItem,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartAssociatedAdmItem
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    visibleProducts: {
      ...getState().visibleProducts,
      ...response.visibleProducts
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;

  const updatedRegCart = {
    ...regCartAssociatedAdmItem,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...regCartAssociatedAdmItem.eventRegistrations[eventRegistrationId],
        productRegistrations: [
          {
            productId: admItemIdWithoutAssociatedSession,
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {}
      },
      '01': {
        ...regCartAssociatedAdmItem.eventRegistrations['01'],
        productRegistrations: [
          {
            productId: admItemIdWithoutAssociatedSession,
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {}
      }
    }
  };
  RegCartClient.prototype.updateRegCart = jest.fn(() => {
    return {
      regCart: updatedRegCart
    };
  });
  await store.dispatch(selectAdmissionItem('00000000-0000-0000-0000-000000000001', admItemIdWithoutAssociatedSession));
  expect(RegCartClient.prototype.updateRegCart).toHaveBeenCalledTimes(1);
  expect(RegCartClient.prototype.updateRegCart).toHaveBeenCalledWith(accessToken, updatedRegCart);
  expect(store.getActions()).toMatchSnapshot();
});

test('does not add admItems / sessions being unregistered to new guests', async () => {
  const selectedAdmItem = Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0];
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {},
    sessionBundleRegistrations: {}
  };

  const regCartWithPrimaryProducts = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE',
        productRegistrations: [
          {
            productId: selectedAdmItem,
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'UNREGISTER'
          }
        ],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            registrationSourceType: 'Selected',
            requestedAction: 'UNREGISTER'
          }
        }
      }
    }
  };

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...regCartWithPrimaryProducts,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartWithPrimaryProducts
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;

  const updatedRegCart = {
    ...regCartWithPrimaryProducts,
    eventRegistrations: {
      ...regCartWithPrimaryProducts.eventRegistrations,
      '09': {
        ...guestRegDetails,
        eventRegistrationId: '09',
        displaySequence: 1
      }
    }
  };
  (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
    return false;
  });
  await store.dispatch(updateGuestCountWithLoading(1));
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, updatedRegCart);
  expect(store.getActions()).toMatchSnapshot();
});

test('capacity violated modal is called when update fails on capacity', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  RegCartClient.prototype.updateRegCart = jest.fn(() => {
    throw new Error();
  });
  (getUpdateErrors.isGuestProductAvailabilityError as $TSFixMe).mockImplementation(() => {
    return true;
  });
  (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
    return false;
  });
  await store.dispatch(updateGuestCountWithLoading(3));
  expect(openGuestProductCapacityReachedDialog()).toHaveBeenCalled();
});

test('included sessions are handled correctly for guest deregistration', async () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
  const includedSessionId = 'f335a3a9-81e1-4f4d-8538-05d23b96181d';
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: groupLeaderEventRegId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      [includedSessionId]: {
        includedInAgenda: false,
        productId: includedSessionId,
        registrationSourceType: 'Included',
        requestedAction: 'UNREGISTER'
      }
    },
    sessionBundleRegistrations: {}
  };

  const guestRegModCart = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...response.regCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE',
        sessionRegistrations: {
          [includedSessionId]: {
            includedInAgenda: false,
            productId: includedSessionId,
            registrationSourceType: 'Included',
            requestedAction: 'UNREGISTER'
          }
        }
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'UNREGISTER',
        displaySequence: 1
      }
    }
  };

  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...guestRegModCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegModCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
    return false;
  });
  await store.dispatch(updateGuestCountWithLoading(1));

  const regModCartWithNewGuests = {
    ...response.regCart,
    eventRegistrations: {
      [groupLeaderEventRegId]: {
        ...guestRegModCart.eventRegistrations[groupLeaderEventRegId],
        attendeeType: 'ATTENDEE'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'UNREGISTER',
        displaySequence: 1,
        sessionRegistrations: {
          ...guestRegDetails.sessionRegistrations,
          [includedSessionId]: {
            ...guestRegDetails.sessionRegistrations[includedSessionId],
            requestedAction: 'UNREGISTER'
          }
        },
        sessionBundleRegistrations: {}
      },
      '02': {
        eventRegistrationId: '02',
        ...guestRegDetails,
        requestedAction: 'REGISTER',
        displaySequence: 2,
        sessionRegistrations: {},
        sessionBundleRegistrations: {}
      }
    }
  };
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regModCartWithNewGuests);
  expect(store.getActions()).toMatchSnapshot();
});

test('does not remove associated sessions for existing guests when adding new ones', async () => {
  const admItemIdWithAssociatedSession = 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d';
  const associatedSessionId = Object.keys(response.products.sessionContainer.optionalSessions)[0];
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];

  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };
  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        displaySequence: 1,
        requestedAction: 'REGISTER'
      }
    }
  };

  let regCartAssociatedAdmItem = setIn(
    guestRegCart,
    ['eventRegistrations', eventRegistrationId, 'productRegistrations', 0, 'productId'],
    admItemIdWithAssociatedSession
  );
  regCartAssociatedAdmItem = setIn(regCartAssociatedAdmItem, ['eventRegistrations', '01', 'productRegistrations', 0], {
    productId: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
    productType: 'AdmissionItem',
    quantity: 1,
    requestedAction: 'REGISTER'
  });

  regCartAssociatedAdmItem = setIn(
    regCartAssociatedAdmItem,
    ['eventRegistrations', eventRegistrationId, 'sessionRegistrations', associatedSessionId],
    {
      sessionId: associatedSessionId,
      requestedAction: 'REGISTER',
      registrationSourceType: 'AdmissionItem',
      registrationSourceParentId: admItemIdWithAssociatedSession
    }
  );

  regCartAssociatedAdmItem = setIn(
    regCartAssociatedAdmItem,
    ['eventRegistrations', '01', 'sessionRegistrations', associatedSessionId],
    {
      sessionId: associatedSessionId,
      requestedAction: 'REGISTER',
      registrationSourceType: 'AdmissionItem',
      registrationSourceParentId: admItemIdWithAssociatedSession
    }
  );

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...regCartAssociatedAdmItem,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartAssociatedAdmItem
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  regCartClient = store.getState().clients.regCartClient;

  const updatedRegCart = {
    ...regCartAssociatedAdmItem,
    eventRegistrations: {
      ...regCartAssociatedAdmItem.eventRegistrations,
      '013': {
        eventRegistrationId: '013',
        ...guestRegDetails,
        productRegistrations: [
          {
            productId: admItemIdWithAssociatedSession,
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        displaySequence: 2,
        sessionRegistrations: {},
        sessionBundleRegistrations: {}
      }
    }
  };
  (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
    return false;
  });
  await store.dispatch(updateGuestCountWithLoading(2));
  expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
  expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, updatedRegCart);
  expect(store.getActions()).toMatchSnapshot();
});

test('changing guest results in capacity reached modal when no adm/event capacity available', async () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    }
  };
  store = mockStore(initialState);
  (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
    return true;
  });
  await store.dispatch(updateGuestCountWithLoading(3));
  expect(openGuestProductCapacityReachedDialog()).not.toHaveBeenCalled();
});

test('setAirRequestOptOutChoice sets the airOptOutChoice for an attendee in an eventRegistration', async () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  await store.dispatch(setAirRequestOptOutChoice(eventRegistrationId, TRAVEL_OPT_OUT_CHOICE.BOOKED));
  expect(store.getActions()).toMatchSnapshot();
});

describe('Guest product registrations on adding guests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // clear counters in jest mock functions
  });

  const guestRegistrationSettings = {
    isGuestRegistrationAllowed: true,
    isGuestProductSelectionEnabled: false
  };

  const regCart = {
    ...getState().registrationForm.regCart,
    eventRegistrations: {
      '00000000-0000-0000-0000-000000000001': {
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        eventId,
        attendee: {
          personalInformation: {
            emailAddress: 'lroling-384934@j.mail'
          },
          attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
        },
        confirmationNumber: '123456789',
        productRegistrations: [
          {
            productId: 'AD3',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        registrationTypeId: 'regType3',
        registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
      }
    }
  };

  const initialState = {
    ...getState(),
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths,
          '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
            guestRegistrationSettings
          }
        }
      }
    },
    event: {
      ...getState().event,
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000',
          name: '',
          isOpenForRegistration: true
        },
        regType1: {
          id: 'regType1',
          name: 'regType1',
          isOpenForRegistration: true
        },
        regType2: {
          id: 'regType2',
          name: 'regType2',
          isOpenForRegistration: true
        },
        regType3: {
          id: 'regType3',
          name: 'regType3',
          isOpenForRegistration: true
        }
      },
      products: {
        admissionItems: {
          '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c': {
            limitOptionalItemsToSelect: false,
            isOpenForRegistration: true,
            limitGuestsByContactType: false,
            includeWaitlistSessionsTowardsMaxiumumLimit: false,
            applicableContactTypes: ['00000000-0000-0000-0000-000000000000', 'regType1'],
            limitOptionalSessionsToSelect: false,
            includedOptionalSessions: [],
            applicableOptionalItems: [],
            minimumNumberOfSessionsToSelect: 0,
            applicableOptionalSessions: [],
            capacityByGuestContactTypes: [],
            displayOrder: 0,
            code: '',
            description: '',
            id: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
            capacityId: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
            name: 'AD1',
            status: 2,
            defaultFeeId: '00000000-0000-0000-0000-000000000000'
          },
          AD2: {
            limitOptionalItemsToSelect: false,
            isOpenForRegistration: true,
            limitGuestsByContactType: false,
            includeWaitlistSessionsTowardsMaxiumumLimit: false,
            applicableContactTypes: ['regType2'],
            limitOptionalSessionsToSelect: false,
            includedOptionalSessions: [],
            applicableOptionalItems: [],
            minimumNumberOfSessionsToSelect: 0,
            applicableOptionalSessions: [],
            capacityByGuestContactTypes: [],
            displayOrder: 0,
            code: '',
            description: '',
            id: 'AD2',
            capacityId: 'AD2',
            name: 'AD2',
            status: 2,
            defaultFeeId: '00000000-0000-0000-0000-000000000000'
          },
          AD3: {
            limitOptionalItemsToSelect: false,
            isOpenForRegistration: true,
            limitGuestsByContactType: false,
            includeWaitlistSessionsTowardsMaxiumumLimit: false,
            applicableContactTypes: ['regType3'],
            limitOptionalSessionsToSelect: false,
            includedOptionalSessions: [],
            applicableOptionalItems: [],
            minimumNumberOfSessionsToSelect: 0,
            applicableOptionalSessions: [],
            capacityByGuestContactTypes: [],
            displayOrder: 0,
            code: '',
            description: '',
            id: 'AD3',
            capacityId: 'AD3',
            name: 'AD3',
            status: 2,
            defaultFeeId: '00000000-0000-0000-0000-000000000000'
          }
        }
      }
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart,
      errors: {}
    }
  };

  test('with dropdown and no regType has visibility to one item and shared agenda', async () => {
    store = mockStore(initialState);
    const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
    const regCartWithNewGuests = {
      ...regCart,
      eventRegistrations: {
        [groupLeaderEventRegId]: {
          ...regCart.eventRegistrations[groupLeaderEventRegId]
        },
        '017': {
          eventRegistrationId: '017',
          displaySequence: 1,
          eventId,
          attendee: {
            personalInformation: {
              lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
              customFields: {}
            },
            eventAnswers: {}
          },
          attendeeType: 'GUEST',
          primaryRegistrationId: groupLeaderEventRegId,
          productRegistrations: [
            {
              productId: 'AD3',
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          requestedAction: 'REGISTER',
          sessionRegistrations: {},
          sessionBundleRegistrations: {}
        }
      }
    };

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: regCartWithNewGuests
      };
    });

    (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
      return false;
    });
    await store.dispatch(updateGuestCountWithLoading(1, false));
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    // since guests don't have visibility to regType 3 they should still get it anyway since shared agenda
    expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartWithNewGuests);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('with dropdown and no regType has visibility to one item and unique agenda', async () => {
    const state = {
      ...initialState,
      appData: {
        ...initialState.appData,
        registrationSettings: {
          ...appData.registrationSettings,
          registrationPaths: {
            ...appData.registrationSettings.registrationPaths,
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              guestRegistrationSettings: {
                isGuestRegistrationAllowed: true,
                isGuestProductSelectionEnabled: true
              }
            }
          }
        }
      }
    };
    store = mockStore(state);
    const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
    const regCartWithNewGuests = {
      ...regCart,
      eventRegistrations: {
        [groupLeaderEventRegId]: {
          ...regCart.eventRegistrations[groupLeaderEventRegId]
        },
        '018': {
          eventRegistrationId: '018',
          displaySequence: 1,
          eventId,
          attendee: {
            personalInformation: {
              lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
              customFields: {}
            },
            eventAnswers: {}
          },
          attendeeType: 'GUEST',
          primaryRegistrationId: groupLeaderEventRegId,
          productRegistrations: [
            {
              productId: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          requestedAction: 'REGISTER',
          sessionRegistrations: {},
          sessionBundleRegistrations: {}
        }
      }
    };

    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: regCartWithNewGuests
      };
    });
    (validateNoAvailableAdmissionItemOrEventCapacity as $TSFixMe).mockImplementation(() => {
      return false;
    });
    await store.dispatch(updateGuestCountWithLoading(1, false));
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    // guest should get auto assigned only visible adm item since is unique agenda
    expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartWithNewGuests);
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('Group reg with regtype feature off', () => {
  test('creates a group regCart sucessfully', async () => {
    const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
    const initialState = {
      ...getState(),
      appData,
      registrationForm: {
        ...getState().registrationForm,
        regCart: response.regCart,
        currentEventRegistrationId: groupLeaderEventRegId
      },
      regCartStatus: {
        lastSavedRegCart: response.regCart
      },
      pathInfo: {
        rootPath: 'evsrc/redux/modules/registrationForm/regCart/__tests__/regCartTests.jsents/dummyId',
        currentPageId: '617b1dc3-3ddb-4468-8087-049a4e6e51e8'
      },
      capacity: {
        ...getState().capacity,
        [`${eventId}::${defaultRegistrationTypeId}`]: {
          capacityId: `eventId${defaultRegistrationTypeId}`,
          totalCapacityAvailable: 1,
          availableCapacity: -5
        }
      },
      event: {
        ...getState().event,
        eventFeatureSetup: {
          ...getState().event.eventFeatureSetup,
          registrationProcess: {
            ...getState().event.eventFeatureSetup.registrationProcess,
            multipleRegistrationTypes: false
          }
        }
      },
      website: {
        ...getState().website,
        pluginData: {
          ...getState().website.pluginData,
          registrationProcessNavigation: {
            ...getState().website.pluginData.registrationProcessNavigation,
            registrationPaths: {
              '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
                pageIds: [
                  'regProcessStep1',
                  'regPage:0cc99264-e900-43b2-a995-91b920ff2a33',
                  'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
                ],
                id: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
                confirmationPageId: 'confirmation',
                postRegPageIds: ['confirmation']
              }
            }
          }
        }
      },
      registrationTypes: {
        [defaultRegistrationTypeId]: {
          id: defaultRegistrationTypeId,
          name: '',
          isOpenForRegistration: true
        }
      }
    };
    store = mockStore(initialState);

    const regCartWithNewEventReg = {
      ...response.regCart,
      eventRegistrations: {
        ...response.regCart.eventRegistrations,
        [groupLeaderEventRegId]: {
          ...response.regCart.eventRegistrations[groupLeaderEventRegId],
          attendeeType: 'GROUP_LEADER',
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        },
        '019': {
          eventId,
          eventRegistrationId: '019',
          attendee: {
            personalInformation: {},
            eventAnswers: {}
          },
          attendeeType: 'ATTENDEE',
          primaryRegistrationId: groupLeaderEventRegId,
          productRegistrations: [
            {
              productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          registrationTypeId: '00000000-0000-0000-0000-000000000000'
        }
      }
    };
    RegCartClient.prototype.updateRegCart = jest.fn(() => {
      return {
        regCart: regCartWithNewEventReg
      };
    });
    await store.dispatch(addGroupMemberInRegCart(eventId));

    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(regCartClient.updateRegCart).toHaveBeenCalledWith(accessToken, regCartWithNewEventReg);
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('group regType modal tests', () => {
  const groupLeaderEventRegId = Object.keys(response.regCart.eventRegistrations)[0];
  const initialState = {
    ...getState(),
    appData,
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart,
      currentEventRegistrationId: groupLeaderEventRegId
    },
    regCartStatus: {
      lastSavedRegCart: response.regCart
    },
    pathInfo: {
      rootPath: 'evsrc/redux/modules/registrationForm/regCart/__tests__/regCartTests.jsents/dummyId',
      currentPageId: '617b1dc3-3ddb-4468-8087-049a4e6e51e8'
    },
    website: {
      ...getState().website,
      pluginData: {
        ...getState().website.pluginData,
        registrationProcessNavigation: {
          ...getState().website.pluginData.registrationProcessNavigation,
          registrationPaths: {
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              pageIds: [
                'regProcessStep1',
                'regPage:0cc99264-e900-43b2-a995-91b920ff2a33',
                'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
              ],
              id: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
              confirmationPageId: 'confirmation',
              postRegPageIds: ['confirmation']
            }
          }
        }
      }
    }
  };
  test('opens regType dialog when no associated admItem', async () => {
    store = mockStore(initialState);
    RegCartClient.prototype.updateRegCart = jest.fn(() => {
      throw new Error();
    });
    (getUpdateErrors.isAddGroupMemberNotAvailableError as $TSFixMe).mockImplementation(() => {
      return false;
    });
    (getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError as $TSFixMe).mockImplementation(() => {
      return true;
    });
    await store.dispatch(addGroupMemberInRegCart(eventId));

    expect(openNoAdmissionItemAvailableForRegistrationTypeDialog()).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });

  test('opens reg mod past deadline dialog, when reg mod dealine is past.', async () => {
    store = createStoreWithMiddleware(
      combineReducers({
        clients: (x = {}) => x,
        registrationForm: registrationFormReducer,
        pathInfo: (x = {}) => x,
        accessToken: (x = {}) => x,
        account: (x = {}) => x,
        event: (x = {}) => x,
        travelCart: (x = {}) => x,
        testSettings: (x = {}) => x,
        regCartPricing: (x = {}) => x,
        userSession: (x = {}) => x,
        defaultUserSession: (x = {}) => x,
        website: (x = {}) => x,
        appData: (x = {}) => x,
        text: (x = {}) => x,
        registrantLogin: (x = {}) => x,
        visibleProducts: (x = {}) => x,
        regCartStatus: (x = {}) => x,
        limits: (x = {}) => x
      }),
      {
        ...initialState,
        clients: { regCartClient },
        pathInfo: {
          currentPageId: 'confirmation'
        }
      }
    );
    regCartClient.createRegModCart = jest.fn(async () => {
      const request = {
        headers: {
          HttpLogPageLoadId: 'HttpLogPageLoadId',
          HttpLogRequestId: 'HttpLogPageLoadId',
          get: () => {}
        }
      };
      const createResponse = {
        regCart: {},
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage:
              "Event {{eventId}} does not permit registration modification at this time. It's past the allowed modification date {{modificationDate}}.",
            localizationKey: 'REGAPI.REGMOD_PAST_MODIFICATION_DATE',
            parametersMap: {
              eventId,
              modificationDate: '1900-01-01T00:00:00Z'
            }
          }
        ],
        text: () =>
          '{"validationMessages": [{"severity": "Error","unLocalizedInternalMessage": "Event {{eventId}} does not permit registration modification at this time. Its past the allowed modification date {{modificationDate}}.","localizationKey": "REGAPI.REGMOD_PAST_MODIFICATION_DATE","parametersMap": {"eventId": "7cbc4b07-8c5b-40a8-b6ac-fc19091d5d42","modificationDate": "Mon May 20 04:00:00 GMT 2019"},"subValidationMessageList": []}]}'
      };
      throw await ServiceError.create('createRegModCart failed', createResponse, request);
    });
    await store.dispatch(addGroupMemberInRegCart(eventId));
    expect(openKnownErrorDialog()).toHaveBeenCalled();
    expect(store.getState().registrationForm.errors).toMatchSnapshot();
  });

  test('opens capacity reached dialog if there is a failure to accquire regType capacity', async () => {
    store = mockStore(initialState);
    RegCartClient.prototype.updateRegCart = jest.fn(() => {
      return {
        regCart: {},
        validationMessages: {}
      };
    });
    (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
      return true;
    });

    await store.dispatch(addGroupMemberInRegCart(eventId));

    expect(openCapacityReachedDialog()).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('Complex guest session modal tests', () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    sessionRegistrations: {
      sessionDId: {
        productId: 'sessionDId',
        productType: 'Session',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    },
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE',
        registrationPathId: 'regPathIdWithComplexGuest'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'REGISTER'
      }
    }
  };
  const guestRegistrationSettings = {
    isGuestRegistrationAllowed: true,
    isGuestProductSelectionEnabled: true
  };

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...guestRegCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths,
          regPathIdWithComplexGuest: {
            guestRegistrationSettings
          }
        }
      }
    },
    visibleProducts: {
      ...getState().visibleProducts,
      ...response.visibleProducts
    }
  };

  test('selecting session for complex guests opens modal', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    await store.dispatch(selectSession('00000000-0000-0000-0000-000000000001', selectedSessionId));
    expect(openGuestProductSelectionDialog()).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('unselecting session for complex guests opens modal', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    await store.dispatch(unSelectSession('00000000-0000-0000-0000-000000000001', selectedSessionId));
    expect(openGuestProductSelectionDialog()).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('switching session in session group for complex guests opens modal', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    await store.dispatch(switchSession('00000000-0000-0000-0000-000000000001', 'sessionDId', 'sessionEId'));
    expect(openGuestProductSelectionDialog()).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('Complex guest admissionItem modal tests', () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE',
        registrationPathId: 'regPathIdWithComplexGuest'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'REGISTER'
      }
    }
  };
  const guestRegistrationSettings = {
    isGuestRegistrationAllowed: true,
    isGuestProductSelectionEnabled: true
  };

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...guestRegCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths,
          regPathIdWithComplexGuest: {
            guestRegistrationSettings
          }
        }
      }
    },
    visibleProducts: {
      Sessions: {
        [eventRegistrationId]: {
          admissionItems: {},
          sessionProducts: {}
        }
      }
    }
  };

  test('selecting admissionItem for complex guests opens modal', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    await store.dispatch(selectAdmissionItem('00000000-0000-0000-0000-000000000001', selectedAdmissionItemId, true));
    expect(openGuestProductSelectionDialog()).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('Discount capacity insufficient modal tests', () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails01 = {
    eventId,
    attendee: {
      isGroupMember: false,
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx'
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    displaySequence: 1,
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const guestRegDetails02 = {
    eventId,
    attendee: {
      isGroupMember: false,
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx'
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    displaySequence: 2,
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    requestedAction: 'REGISTER'
  };

  const regCartWithGuests = {
    ...response.regCart,
    discounts: {
      guest1: {
        discountCode: 'guest1'
      }
    },
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE',
        registrationPathId: 'regPathIdWithGuestsForDiscount'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails01,
        requestedAction: 'REGISTER'
      },
      '02': {
        eventRegistrationId: '02',
        ...guestRegDetails02,
        requestedAction: 'REGISTER'
      }
    }
  };

  const guestRegistrationSettings = {
    isGuestRegistrationAllowed: true,
    isGuestProductSelectionEnabled: true
  };

  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        discounts: {},
        paymentInfo: {
          ignoreServiceFee: false,
          ignoreTaxes: false,
          orderTotal: 98,
          paymentRedirectRequired: false
        },
        ...regCartWithGuests,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartWithGuests
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths,
          regPathIdWithGuestsForDiscount: {
            guestRegistrationSettings
          }
        }
      }
    }
  };

  test('applying discount with insufficient capacity opens modal', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    try {
      await store.dispatch(updateDiscountCodes('guest1', false));
    } catch (error) {
      expect(getUpdateErrors.isDiscountCapacityInsufficient).toHaveBeenCalled();
    }
    expect(store.getState()).toMatchSnapshot();
  });

  test('applying discount with no capacity throws error', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    try {
      await store.dispatch(updateDiscountCodes('guest1', false));
    } catch (error) {
      (getUpdateErrors.isProductAvailabilityError as $TSFixMe).mockImplementation(() => {
        return true;
      });
    }
  });

  test('check discount application error for any known errors', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    try {
      await store.dispatch(updateDiscountCodes('guest1', false));
    } catch (error) {
      (getUpdateErrors.isKnownError as $TSFixMe).mockImplementation(() => {
        return true;
      });
    }
  });
});

describe('simple guests save registration auto-assign admission items tests', () => {
  const primaryEventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  let regCartWithGuestWithNoAdmItem = updateIn(
    response.regCart,
    ['eventRegistrations', primaryEventRegistrationId],
    eventReg => {
      return {
        ...eventReg,
        productRegistrations: [
          {
            productId: 'admissionItemBId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        registrationTypeId: '4e271dd1-8e5c-4a95-95f5-da6897d64e5d'
      };
    }
  );

  regCartWithGuestWithNoAdmItem = {
    ...regCartWithGuestWithNoAdmItem,
    eventRegistrations: {
      ...regCartWithGuestWithNoAdmItem.eventRegistrations,
      guest1: {
        eventRegistrationId: 'guest1',
        displaySequence: 1,
        attendee: {
          personalInformation: {
            lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
            customFields: {}
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        registrationTypeId: '00000000-0000-0000-0000-000000000000',
        requestedAction: 'REGISTER',
        sessionRegistrations: {}
      }
    }
  };
  const guestRegistrationSettings = {
    isGuestRegistrationAllowed: true,
    isGuestProductSelectionEnabled: false
  };
  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...regCartWithGuestWithNoAdmItem,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: regCartWithGuestWithNoAdmItem
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths,
          '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
            guestRegistrationSettings
          }
        }
      }
    },
    event: {
      ...getState().event,
      registrationTypes: {
        ...getState().event.registrationTypes,
        '4e271dd1-8e5c-4a95-95f5-da6897d64e5d': {
          id: '4e271dd1-8e5c-4a95-95f5-da6897d64e5d',
          name: 'RegType 1'
        }
      },
      products: {
        admissionItems: {
          admissionItemAId: {
            id: 'admissionItemAId',
            isOpenForRegistration: true,
            applicableContactTypes: ['00000000-0000-0000-0000-000000000000']
          },
          admissionItemBId: {
            id: 'admissionItemBId',
            isOpenForRegistration: true,
            applicableContactTypes: ['4e271dd1-8e5c-4a95-95f5-da6897d64e5d']
          }
        }
      }
    }
  };

  test('guest is auto-assigned primarys adm item no matter visibility', async () => {
    store = mockStore(initialState);

    RegCartClient.prototype.updateRegCart = jest.fn(() => {
      return {
        regCart: regCartWithGuestWithNoAdmItem
      };
    });

    await store.dispatch(saveRegistration());
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(2);
    expect(regCartClient.updateRegCart).toHaveBeenCalledWith(
      accessToken,
      initialState.registrationForm.regCart,
      undefined
    );
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('Guest Answers after partial upadate', () => {
  const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
  const guestRegDetails = {
    eventId,
    attendee: {
      personalInformation: {
        lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
        customFields: {}
      },
      eventAnswers: {
        '00000000-0000-0000-0000-0000000000010': {}
      }
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: eventRegistrationId,
    productRegistrations: [],
    registrationTypeId: '00000000-0000-0000-0000-000000000000',
    registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
    requestedAction: 'REGISTER'
  };

  const guestRegCart = {
    ...response.regCart,
    eventRegistrations: {
      [eventRegistrationId]: {
        ...response.regCart.eventRegistrations[eventRegistrationId],
        attendeeType: 'ATTENDEE',
        registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
      },
      '01': {
        eventRegistrationId: '01',
        ...guestRegDetails,
        requestedAction: 'REGISTER'
      }
    }
  };
  const initialState = {
    ...getState(),
    event: {
      ...getState().event,
      products: response.products,
      registrationTypes: response.registrationTypes
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...guestRegCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: guestRegCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths
        },
        productQuestions: {
          '00000000-0000-0000-0000-0000000000010': {
            registrationPathQuestionAssociations: ['411c6566-1e5a-4c38-b8e5-f63ab9239b40']
          }
        },
        registrationQuestions: {}
      }
    }
  };

  test('Guest product answers retained after partial update', async () => {
    store = mockStore(initialState);
    regCartClient = store.getState().clients.regCartClient;
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: {
          ...guestRegCart,
          eventRegistrations: {
            ...guestRegCart.eventRegistrations,
            '01': {
              eventRegistrationId: '01',
              requestedAction: 'REGISTER',
              ...guestRegDetails,
              attendee: {
                ...guestRegDetails.attendee,
                eventAnswers: {}
              }
            }
          }
        }
      };
    });
    await store.dispatch(
      applyPartialEventRegistrationUpdate(
        '00000000-0000-0000-0000-000000000001',
        {},
        {
          '01': ''
        },
        selectedAdmissionItemId,
        false
      )
    );
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('Hybrid events validation', () => {
  const initialState = {
    ...getState(),
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: {
        ...response.regCart,
        status: 'INPROGRESS'
      }
    },
    registrationForm: {
      ...getState().registrationForm,
      regCart: response.regCart
    },
    clients: {
      ...getState().clients,
      capacityClient: new CapacityClient(baseUrl, eventId, environment)
    },
    appData: {
      ...getState().appData,
      registrationSettings: {
        ...appData.registrationSettings,
        registrationPaths: {
          ...appData.registrationSettings.registrationPaths
        }
      }
    },
    event: {
      ...getState().event,
      attendingFormat: AttendingFormat.HYBRID,
      registrationTypes: {
        ...getState().event.registrationTypes,
        '4e271dd1-8e5c-4a95-95f5-da6897d64e5d': {
          id: '4e271dd1-8e5c-4a95-95f5-da6897d64e5d',
          name: 'RegType 1'
        }
      }
    }
  };

  test('opens eventTemporaryClosed modal for hybrid event when in-person/virtual event capacity reached for reg-type assigned via custom logic', async () => {
    // Arrange
    store = mockStore(initialState);
    const responseBody = {
      validationMessages: [
        {
          severity: 'Error',
          localizationKey: 'REGAPI.EVENT_TEMPORARY_NOT_OPEN_FOR_REGISTRATION'
        }
      ]
    };
    RegCartClient.prototype.updateRegCart = jest.fn(() => {
      throw createError(responseBody);
    });
    (getUpdateErrors.isEventTemporaryClosed as $TSFixMe).mockImplementation(() => {
      return true;
    });
    // Act
    await store.dispatch(saveRegistration());
    // Assert
    expect(regCartClient.updateRegCart).toHaveBeenCalledTimes(1);
    expect(openEventTemporaryClosedErrorDialog()).toHaveBeenCalled();
  });
});

describe('Embedded Registration tests', () => {
  const eventRegUpdates = {
    productRegistrations: [
      {
        productId: selectedAdmissionItemId,
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ]
  };

  test('creates reg cart when selecting admission item on first reg page', async () => {
    const embeddedRegState = {
      ...getState(),
      appData: {
        ...appData,
        pathInfo: {
          rootPath: '/embedded-registration',
          currentPageId: 'register'
        }
      },
      registrationForm: {
        ...getState().registrationForm,
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              attendee: {},
              productRegistrations: [],
              registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
            }
          },
          localeId: 1033,
          regCartId: '',
          embeddedRegistration: true
        }
      },
      regCartStatus: {}
    };
    const getEmbeddedRegState = () => {
      return embeddedRegState;
    };
    const theStore = {
      getState: getEmbeddedRegState,
      dispatch: async function dispatch(action) {
        if (typeof action === 'function') {
          return await action(theStore.dispatch, theStore.getState);
        } else if (action?.payload?.regCart) {
          embeddedRegState.registrationForm.regCart = action?.payload?.regCart;
        }
      }
    };
    (beginNewRegistration as jest.Mock).mockImplementation(() => {
      embeddedRegState.registrationForm.regCart = {
        ...embeddedRegState.registrationForm.regCart,
        regCartId: 'uuid'
      };
      embeddedRegState.regCartStatus = {
        lastSavedRegCart: {
          ...embeddedRegState.registrationForm.regCart
        }
      };
    });

    const { regCartClient: mockRegCartClient } = theStore.getState().clients;
    await theStore.dispatch(
      applyPartialEventRegistrationUpdate(
        '00000000-0000-0000-0000-000000000001',
        eventRegUpdates,
        {},
        selectedAdmissionItemId
      )
    );
    expect(beginNewRegistration).toHaveBeenCalled();
    expect(mockRegCartClient.updateRegCart).not.toHaveBeenCalled();
    expect(clearInapplicableSelectedPaymentMethodSpy).toHaveBeenCalled();
    expect(
      theStore.getState().registrationForm.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001']
        .productRegistrations.length
    ).toBe(1);
  });

  test('exits handler if attempt to create reg cart fails', async () => {
    const embeddedRegState = {
      ...getState(),
      appData: {
        ...appData,
        pathInfo: {
          rootPath: '/embedded-registration',
          currentPageId: 'register'
        }
      },
      registrationForm: {
        ...getState().registrationForm,
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              attendee: {},
              productRegistrations: [],
              registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
            }
          },
          localeId: 1033,
          regCartId: '',
          embeddedRegistration: true
        }
      }
    };
    const getEmbeddedRegState = () => {
      return embeddedRegState;
    };
    const theStore = {
      getState: getEmbeddedRegState,
      dispatch: async function dispatch(action) {
        if (typeof action === 'function') {
          return await action(theStore.dispatch, theStore.getState);
        } else if (action?.payload?.regCart) {
          embeddedRegState.registrationForm.regCart = action?.payload?.regCart;
        }
      }
    };

    const { regCartClient: mockRegCartClient } = theStore.getState().clients;
    await theStore.dispatch(
      applyPartialEventRegistrationUpdate(
        '00000000-0000-0000-0000-000000000001',
        eventRegUpdates,
        {},
        selectedAdmissionItemId
      )
    );
    expect(beginNewRegistration).toHaveBeenCalled();
    expect(mockRegCartClient.updateRegCart).not.toHaveBeenCalled();
    expect(clearInapplicableSelectedPaymentMethodSpy).not.toHaveBeenCalled();
    expect(
      theStore.getState().registrationForm.regCart.eventRegistrations['00000000-0000-0000-0000-000000000001']
        .productRegistrations.length
    ).toBe(0);
  });

  test('standard reg cart should not be affected', async () => {
    const regCart = {
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          attendee: {},
          productRegistrations: [],
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      },
      localeId: 1033,
      regCartId: 'uuid'
    };
    const standardRegState = {
      ...getState(),
      appData: {
        ...appData,
        pathInfo: {
          rootPath: '/embedded-registration',
          currentPageId: 'register'
        }
      },
      registrationForm: {
        ...getState().registrationForm,
        regCart
      },
      regCartStatus: {
        lastSavedRegCart: regCart
      }
    };
    const getStandardRegState = () => {
      return standardRegState;
    };
    const theStore = {
      getState: getStandardRegState,
      dispatch: async function dispatch(action) {
        if (typeof action === 'function') {
          return await action(theStore.dispatch, theStore.getState);
        } else if (action?.payload?.regCart) {
          standardRegState.registrationForm.regCart = action?.payload?.regCart;
        }
      }
    };
    RegCartClient.prototype.updateRegCart = jest.fn(() => {
      return {
        regCart
      };
    });

    const { regCartClient: mockRegCartClient } = theStore.getState().clients;
    await theStore.dispatch(
      applyPartialEventRegistrationUpdate(
        '00000000-0000-0000-0000-000000000001',
        eventRegUpdates,
        {},
        selectedAdmissionItemId
      )
    );
    expect(beginNewRegistration).not.toHaveBeenCalled();
    expect(mockRegCartClient.updateRegCart).toHaveBeenCalled();
    expect(clearInapplicableSelectedPaymentMethodSpy).toHaveBeenCalled();
  });
});
