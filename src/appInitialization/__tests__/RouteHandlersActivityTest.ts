import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import EventGuestClient from '../../clients/EventGuestClient';
import { recordWebsitePageViewActivity } from '../routeHandlersActivity';
import { RECORD_FACT } from 'nucleus-widgets/utils/analytics/actions';

const mockStore = configureMockStore([thunk]);
const eventId = 'id';
const mockState = {
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
  }
};

test('publishes activity fact for page view for unknown user', async () => {
  const updatedMockState = {
    ...mockState,
    match: {
      params: {
        pageId: '00000000-0000-0000-0000-00000000'
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          '00000000-0000-0000-0000-00000000': {}
        }
      }
    }
  };
  const s = mockStore(updatedMockState);
  recordWebsitePageViewActivity(s, updatedMockState.match.params.pageId);
  expect(s.getActions()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: RECORD_FACT
      })
    ])
  );
});
