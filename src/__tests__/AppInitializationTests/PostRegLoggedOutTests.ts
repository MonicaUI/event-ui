import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';
import { SELECTED_TIMEZONE } from '../../redux/timeZoneSelection';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
jest.mock('../../redux/timeZoneSelection', () => {
  return {
    SELECTED_TIMEZONE: jest.fn(() => () => {})
  };
});

const eventId = 'id';

function getState() {
  return {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    clients: {
      eventGuestClient: {
        logout: jest.fn(() => {})
      }
    },
    registrantLogin: {
      form: {
        emailAddress: 'email',
        confirmationNumber: 'confirmationNumber'
      }
    },
    regCart: {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
      status: 'INPROGRESS',
      eventRegistration: {
        '00000000-0000-0000-0000-000000000001': {
          attendee: {
            personalInformation: {
              emailAddress: 'lroling-384934@j.mail'
            },
            timeZonePreference: 1,
            attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
          },
          confirmationNumber: '123456789',
          productRegistrations: [],
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      }
    },
    event: {
      id: eventId,
      timezone: 35
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
    userSession: {},
    experiments: {}
  };
}

test('verify SELECTED_TIMEZONE have been called when logoutRegistrant', async () => {
  const store = mockStore(getState());

  await store.dispatch(logoutRegistrant());
  const action = store.getActions();
  expect(action[1].type).toEqual(SELECTED_TIMEZONE);
});

test('verify SELECTED_TIMEZONE have not been called when logoutRegistrant', async () => {
  const store = mockStore({
    ...getState(),
    event: {
      id: eventId
    }
  });

  await store.dispatch(logoutRegistrant());
  const action = store.getActions();
  expect(action[1].type).not.toEqual(SELECTED_TIMEZONE);
});
