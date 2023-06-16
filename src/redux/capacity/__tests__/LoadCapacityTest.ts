import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import transformEventData from 'event-widgets/utils/transformEventData';
import {
  loadAvailableCapacityCounts,
  fetchCapacitySummaries,
  loadAvailableSessionCapacityCounts,
  loadAvailableSessionCapacityCountsForAgendaWidget
} from '..';
import { setIn } from 'icepick';

const regCartClient = {
  authorizeByConfirm: jest.fn(() => ({ accessToken: 'fakeAuthByConfirmToken' })),
  getCapacitySummaries: jest.fn(() => {}),
  getCapacitySummariesOnPageLoad: jest.fn(() => {})
};
const capacityClient = {
  getCapacitySummaries: jest.fn(() => {})
};
const eventEmailClient = {};

const eventSnapshotClient = {
  getAccountSnapshot: jest.fn(() => EventSnapshot.accountSnapshot),
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};

const dummyRegCartId = 'dummyRegCartId';
const dummyAccessToken = 'BEARER dummyToken';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const initialState = {
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  appData: transformEventData(
    EventSnapshot.eventSnapshot.siteEditor.eventData,
    EventSnapshot.accountSnapshot,
    EventSnapshot.eventSnapshot,
    EventSnapshot.eventSnapshot.siteEditor.website
  ),
  accessToken: dummyAccessToken,
  account: {
    settings: {
      dupMatchKeyType: 'EMAIL_ONLY'
    }
  },
  event: {
    eventFeatureSetup: {
      fees: {
        fees: true
      }
    },
    registrationTypes: EventSnapshot.eventSnapshot.registrationTypes,
    products: EventSnapshot.eventSnapshot.products,
    id: EventSnapshot.eventSnapshot.id,
    capacityId: 'event_capacity'
  },
  registrantLogin: {
    form: {
      firstName: 'firstName',
      lastName: 'lastName',
      emailAddress: 'emailAddress',
      confirmationNumber: 'confirmationNumber'
    },
    status: {
      login: {},
      resendConfirmation: {}
    }
  },
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  clients: { regCartClient, capacityClient, eventEmailClient, eventSnapshotClient },
  defaultUserSession: {
    isPreview: false
  },
  registrationForm: {}
};

let store;
beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(initialState);
});

describe('loadAvailableCapacityCounts tests', () => {
  test('calls regAPI capacity endpoint if valid regCartId is present in session', () => {
    const updatedStateWithRegCartId = setIn(initialState, ['userSession', 'regCartId'], dummyRegCartId);
    store = mockStore(updatedStateWithRegCartId);
    store.dispatch(loadAvailableCapacityCounts());
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalled();
    expect(regCartClient.getCapacitySummariesOnPageLoad).not.toHaveBeenCalled();
  });
  test('calls capacity service endpoint if valid regCartId is not present in state', () => {
    store = mockStore(initialState);
    store.dispatch(loadAvailableCapacityCounts());
    expect(capacityClient.getCapacitySummaries).toHaveBeenCalled();
  });
});

describe('fetchCapacitySummaries tests', () => {
  test('calls regAPI capacity endpoint (without session timeouts if valid regCartId is present', async () => {
    await fetchCapacitySummaries(regCartClient, capacityClient, dummyAccessToken, dummyRegCartId, [], false);
    expect(regCartClient.getCapacitySummariesOnPageLoad).toHaveBeenCalled();
    expect(regCartClient.getCapacitySummaries).not.toHaveBeenCalled();
  });
});

describe('loadAvailableSessionCapacityCounts', () => {
  const mockedState = {
    accessToken: dummyAccessToken,
    clients: { regCartClient, capacityClient },
    event: {
      products: {
        sessionContainer: {
          optionalSessions: {
            LIMITED_SESSION_1: {
              id: 'LIMITED_SESSION_1',
              capacityId: 'LIMITED_SESSION_1',
              isWaitlistEnabled: false,
              waitlistCapacityId: 'LIMITED_SESSION_1_waitlist'
            },
            LIMITED_SESSION_2: {
              id: 'LIMITED_SESSION_2',
              capacityId: 'LIMITED_SESSION_2',
              isWaitlistEnabled: true,
              waitlistCapacityId: 'LIMITED_SESSION_2_UNLIMITED_waitlist'
            },
            UNLIMITED_SESSION: {
              id: 'UNLIMITED_SESSION',
              capacityId: 'UNLIMITED_SESSION',
              isWaitlistEnabled: true,
              waitlistCapacityId: 'UNLIMITED_SESSION_LIMITED_waitlist'
            }
          }
        }
      }
    },
    defaultUserSession: {
      isPreview: false
    },
    capacity: {
      LIMITED_SESSION_1: {
        active: true,
        availableCapacity: 19,
        capacityId: 'LIMITED_SESSION_1',
        totalCapacityAvailable: 19
      },
      LIMITED_SESSION_2: {
        active: true,
        availableCapacity: 5,
        capacityId: 'LIMITED_SESSION_2',
        totalCapacityAvailable: 10
      },
      LIMITED_SESSION_2_UNLIMITED_waitlist: {
        active: true,
        availableCapacity: -1,
        capacityId: 'LIMITED_SESSION_2_UNLIMITED_waitlist',
        totalCapacityAvailable: -1
      },
      UNLIMITED_SESSION: {
        active: true,
        availableCapacity: -1,
        capacityId: 'UNLIMITED_SESSION',
        totalCapacityAvailable: -1
      },
      UNLIMITED_SESSION_LIMITED_waitlist: {
        active: true,
        availableCapacity: 10,
        capacityId: 'UNLIMITED_SESSION_LIMITED_waitlist',
        totalCapacityAvailable: 10
      },
      OTHER_PRODUCT_CAPACITY_ID: {
        active: true,
        availableCapacity: -1,
        capacityId: 'OTHER_PRODUCT_CAPACITY_ID',
        totalCapacityAvailable: -1
      }
    },
    registrationForm: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loadAvailableSessionCapacityCounts with provided unlimited capacityIds should not call service', () => {
    const capacityIds = ['LIMITED_SESSION_2_UNLIMITED_waitlist', 'UNLIMITED_SESSION'];
    const updatedStateWithRegCartId = setIn(mockedState, ['userSession', 'regCartId'], dummyRegCartId);
    store = mockStore(updatedStateWithRegCartId);
    store.dispatch(loadAvailableSessionCapacityCounts(capacityIds));
    expect(regCartClient.getCapacitySummaries).not.toHaveBeenCalled();
    expect(regCartClient.getCapacitySummariesOnPageLoad).not.toHaveBeenCalled();
  });

  test('loadAvailableSessionCapacityCounts with capacityIds should exclude unlimited sessions', () => {
    const capacityIds = [
      'LIMITED_SESSION_1',
      'LIMITED_SESSION_2',
      'LIMITED_SESSION_2_UNLIMITED_waitlist',
      'UNLIMITED_SESSION',
      'UNLIMITED_SESSION_LIMITED_waitlist'
    ];
    const updatedStateWithRegCartId = setIn(mockedState, ['userSession', 'regCartId'], dummyRegCartId);
    store = mockStore(updatedStateWithRegCartId);
    store.dispatch(loadAvailableSessionCapacityCounts(capacityIds));
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalled();
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalledWith(dummyAccessToken, dummyRegCartId, [
      'LIMITED_SESSION_1',
      'LIMITED_SESSION_2',
      'UNLIMITED_SESSION_LIMITED_waitlist'
    ]);
    expect(regCartClient.getCapacitySummariesOnPageLoad).not.toHaveBeenCalled();
  });

  test('loadAvailableSessionCapacityCounts without provided capacityIds should exclude unlimited sessions', () => {
    const updatedStateWithRegCartId = setIn(mockedState, ['userSession', 'regCartId'], dummyRegCartId);
    store = mockStore(updatedStateWithRegCartId);
    store.dispatch(loadAvailableSessionCapacityCounts());
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalled();
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalledWith(dummyAccessToken, dummyRegCartId, [
      'LIMITED_SESSION_1',
      'LIMITED_SESSION_2',
      'UNLIMITED_SESSION_LIMITED_waitlist'
    ]);
    expect(regCartClient.getCapacitySummariesOnPageLoad).not.toHaveBeenCalled();
  });

  test('loadAvailableSessionCapacityCountsForAgendaWidget should load all event contained sessions', () => {
    const eventContainedSessionCapacities = [
      'LIMITED_SESSION_1',
      'LIMITED_SESSION_2',
      'LIMITED_SESSION_2_UNLIMITED_waitlist',
      'UNLIMITED_SESSION',
      'UNLIMITED_SESSION_LIMITED_waitlist'
    ];
    const updatedStateWithRegCartId = setIn(mockedState, ['userSession', 'regCartId'], dummyRegCartId);
    store = mockStore(updatedStateWithRegCartId);
    store.dispatch(loadAvailableSessionCapacityCountsForAgendaWidget());
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalled();
    expect(regCartClient.getCapacitySummaries).toHaveBeenCalledWith(
      dummyAccessToken,
      dummyRegCartId,
      eventContainedSessionCapacities
    );
    expect(regCartClient.getCapacitySummariesOnPageLoad).not.toHaveBeenCalled();
  });
});
