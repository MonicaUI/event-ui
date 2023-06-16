import { recordAttendeeUtmParameters } from '../attendeeActivities/attendeeUtmParameters';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

test('recording parameters - no reg cart, etc.', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token'
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).not.toHaveBeenCalled();
});

test('recording parameters with params', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          'registration-id': {
            id: 'registration-id',
            attendee: {
              attendeeId: 'attendee-id'
            }
          }
        },
        httpReferrer: 'http://www.cvent.com/?utm_source=test'
      }
    }
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).toHaveBeenCalledWith('test-token', {
    attendeeId: 'attendee-id',
    eventId: 'event-id',
    source: 'test',
    type: 'event_website_tracking_parameters'
  });
});

test('does not record parameters with no utm in referrer', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          'registration-id': {
            id: 'registration-id',
            attendee: {
              attendeeId: 'attendee-id'
            }
          }
        },
        httpReferrer: 'http://www.cvent.com/?otherparam=something'
      }
    }
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).not.toHaveBeenCalled();
});

test('does not record parameters with no referrer', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          'registration-id': {
            id: 'registration-id',
            attendee: {
              attendeeId: 'attendee-id'
            }
          }
        },
        httpReferrer: undefined
      }
    }
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).not.toHaveBeenCalled();
});

test('does not record parameters with no query string', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          'registration-id': {
            id: 'registration-id',
            attendee: {
              attendeeId: 'attendee-id'
            }
          }
        },
        httpReferrer: 'http://www.cvent.com'
      }
    }
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).not.toHaveBeenCalled();
});

test('does record parameters with mixed parameters in referrer', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          'registration-id': {
            id: 'registration-id',
            attendee: {
              attendeeId: 'attendee-id'
            }
          }
        },
        httpReferrer: 'http://www.cvent.com/?utm_source=test&utm_medium=medium&foo=bar'
      }
    }
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).toHaveBeenCalledWith('test-token', {
    attendeeId: 'attendee-id',
    eventId: 'event-id',
    source: 'test',
    medium: 'medium',
    type: 'event_website_tracking_parameters'
  });
});

test('does  record parameters with all utm in referrer', () => {
  const publishFacts = jest.fn();
  const store = mockStore({
    event: {
      id: 'event-id'
    },
    clients: {
      eventGuestClient: {
        publishAttendeeActivityFact: publishFacts
      }
    },
    accessToken: 'test-token',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          'registration-id': {
            id: 'registration-id',
            attendee: {
              attendeeId: 'attendee-id'
            }
          }
        },
        httpReferrer:
          'http://www.cvent.com/?otherparam=something&utm_source=source&utm_medium=med&utm_term=search+term&utm_content=content&utm_custom=custom&utm_campaign=camp'
      }
    }
  });
  store.dispatch(recordAttendeeUtmParameters());
  expect(publishFacts).toHaveBeenCalledWith('test-token', {
    attendeeId: 'attendee-id',
    eventId: 'event-id',
    source: 'source',
    medium: 'med',
    term: 'search term',
    content: 'content',
    custom: 'custom',
    campaign: 'camp',
    type: 'event_website_tracking_parameters'
  });
});
