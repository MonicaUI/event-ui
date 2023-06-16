import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { filterEventSnapshot } from '../../redux/actions';
import { loginRegistrant } from '../../redux/registrantLogin/actions';
import EventGuestClient from '../../clients/EventGuestClient';
import RegCartClient from '../../clients/RegCartClient';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { ServiceError } from '@cvent/event-ui-networking';

jest.mock('../../redux/actions', () => {
  return {
    filterEventSnapshot: jest.fn(() => () => {})
  };
});
jest.mock('../../redux/travelCart/external', () => {
  return {
    restoreTransientTravelCartIntoState: jest.fn(() => () => {})
  };
});

const eventId = 'id';
const eventRegistrationId1 = '11111111-1111-1111-1111-111111111111';
const eventRegistrationId2 = '22222222-2222-2222-2222-222222222222';

const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regMod: true,
    eventSnapshotVersions: {
      [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
    },
    eventRegistrations: {
      [eventRegistrationId1]: {
        registrationTypeId: eventRegistrationId1,
        registrationPathId: eventRegistrationId1,
        sessionWaitlists: {},
        attendeeType: 'GUEST'
      },
      [eventRegistrationId2]: {
        registrationTypeId: eventRegistrationId2,
        registrationPathId: eventRegistrationId2,
        sessionWaitlists: {},
        attendeeType: 'ATTENDEE'
      }
    }
  },
  validationMessages: []
};

jest.mock('../../clients/RegCartClient', () => {
  return {
    identifyByConfirm: jest.fn(() => mockConfirmedRegCartResponse)
  };
});

jest.mock('../../clients/EventGuestClient', () => {
  return {
    identifyByContactId: jest.fn(() => mockConfirmedRegCartResponse)
  };
});

const state = {
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  clients: {
    regCartClient: RegCartClient,
    eventGuestClient: EventGuestClient
  },
  registrantLogin: {
    form: {
      emailAddress: 'email',
      confirmationNumber: 'confirmationNumber'
    }
  },
  event: {
    id: eventId,
    eventLocalesSetup: { eventLocales: [] },
    eventSecuritySetupSnapshot: {}
  },
  timezones: [
    {
      id: 1,
      name: 'Samoa Time',
      nameResourceKey: 'Event_Timezone_Name_1__resx',
      plannerDisplayName: '(GMT-11:00) Samoa',
      abbreviation: 'ST',
      abbreviationResourceKey: 'Event_Timezone_Abbr_1__resx',
      dstInfo: [{}],
      hasDst: true,
      utcOffset: -660
    }
  ],
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  defaultUserSession: {
    eventId
  },
  accessToken: 'accessToken'
};

test('verify filterEventSnapshot have been called when regCart and eventRegistrations are present', async () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      text: (x = {}) => x,
      regCartStatus: (x = {}) => x,
      clients: (x = {}) => x,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      experiments: (x = {}) => x,
      timezones: (x = {}) => x
    }),
    state
  );

  await store.dispatch(loginRegistrant());
  expect(filterEventSnapshot).toHaveBeenCalledWith(undefined, eventRegistrationId2, eventRegistrationId2);
});

test('Verify that the endpoint to get a reg cart by contact id is called when user has completed attendee login', async () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      text: (x = {}) => x,
      regCartStatus: (x = {}) => x,
      clients: (x = {}) => x,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      experiments: (x = {}) => x,
      timezones: (x = {}) => x
    }),
    {
      ...state,
      event: {
        ...state.event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
        }
      },
      userSession: {
        contactId: 'contactId'
      }
    }
  );
  await store.dispatch(loginRegistrant());
  expect((EventGuestClient as $TSFixMe).identifyByContactId).toHaveBeenCalled();
});

test('Verify that the endpoint to get a reg cart by contact id is called when event is using secure code verification, and contact id is present in the reg cart.', async () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      text: (x = {}) => x,
      regCartStatus: (x = {}) => x,
      clients: (x = {}) => x,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      experiments: (x = {}) => x,
      registrationForm: (x = {}) => x,
      accessToken: (x = {}) => x,
      timezones: (x = {}) => x
    }),
    {
      ...state,
      event: {
        ...state.event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
        }
      },
      registrationForm: {
        regCart: {
          eventRegistrations: {
            eventRegistrationId: {
              attendee: {
                personalInformation: {
                  contactId: 'contactId'
                }
              }
            }
          }
        }
      }
    }
  );
  await store.dispatch(loginRegistrant());
  expect((EventGuestClient as $TSFixMe).identifyByContactId).toHaveBeenCalledWith('accessToken', 'id', 'contactId');
});

test('Verify attendee is redirected to attendee login, if secure login is enabled for the event but they attempt to login with confirmation number', async () => {
  (RegCartClient as $TSFixMe).identifyByConfirm.mockImplementation(() => {
    throw new ServiceError(
      'identify by confirm failed',
      { status: 422 },
      { headers: { get() {} } },
      {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.REGAPI_LOOKUP_REGCART_BY_CONFIRM_INVALID_AUTH_METHOD'
          }
        ]
      }
    );
  });
  const attendeeLoginClient = {
    authorize: jest.fn(() => () => {})
  };
  const store = createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      text: (x = {}) => x,
      regCartStatus: (x = {}) => x,
      clients: (x = {}) => x,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      experiments: (x = {}) => x,
      timezones: (x = {}) => x
    }),
    {
      ...state,
      event: {
        ...state.event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
        }
      },
      clients: {
        ...state.clients,
        attendeeLoginClient
      }
    }
  );
  await store.dispatch(loginRegistrant());
  expect(attendeeLoginClient.authorize).toHaveBeenCalled();
});

test('Verify that the endpoint to get a reg cart by confirm id is called when secure login is not enabled', async () => {
  (RegCartClient as $TSFixMe).identifyByConfirm.mockImplementation(() => mockConfirmedRegCartResponse);
  const store = createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      text: (x = {}) => x,
      regCartStatus: (x = {}) => x,
      clients: (x = {}) => x,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      experiments: (x = {}) => x,
      timezones: (x = {}) => x
    }),
    {
      ...state,
      event: {
        ...state.event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.CONFIRMATION_NUMBER_AND_EMAIL
        }
      }
    }
  );
  await store.dispatch(loginRegistrant());
  expect((RegCartClient as $TSFixMe).identifyByConfirm).toHaveBeenCalled();
});
