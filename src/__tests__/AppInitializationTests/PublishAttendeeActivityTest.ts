import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { recordLoginSuccessActivity } from '../../redux/registrantLogin/actions';
import EventGuestClient from '../../clients/EventGuestClient';
import { RECORD_FACT } from 'nucleus-widgets/utils/analytics/actions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { recordViewSpeakerProfileActivity } from '../../widgets/Speakers/SpeakersWidget';

const mockStore = configureMockStore([thunk]);
const eventId = 'id';

jest.mock('../../clients/EventGuestClient', () => {
  return {
    publishAttendeeActivityFact: jest.fn(() => () => {})
  };
});

const state = {
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  clients: {
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
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  defaultUserSession: {
    eventId
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventId: {
          attendee: {
            attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
          }
        }
      }
    }
  }
};

test('Verify that the endpoint to publish attendee activity fact is called when login success activity is recorded', async () => {
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
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      event: {
        ...state.event
      },
      userSession: {
        contactId: 'contactId'
      }
    }
  );
  await store.dispatch(recordLoginSuccessActivity());
  expect((EventGuestClient as $TSFixMe).publishAttendeeActivityFact).toHaveBeenCalled();
});

test('publishes activity fact for speaker profile view for unknown user', async () => {
  const s = mockStore({
    ...state,
    registrationForm: {
      regCart: {
        eventRegistrations: {
          '00000000-0000-0000-0000-00000000': {}
        }
      }
    }
  });
  await s.dispatch(recordViewSpeakerProfileActivity('6ea3bc8d-c556-42f1-a351-53c720a4adfd'));

  expect(s.getActions()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: RECORD_FACT
      })
    ])
  );
});
