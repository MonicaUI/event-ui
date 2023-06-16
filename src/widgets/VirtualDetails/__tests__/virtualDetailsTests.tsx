import React from 'react';
import { virtualDetailsReducer, VIRTUAL_DETAILS_PAGE } from '../redux';
import { prepareForVirtualDetailsPageLoad } from '../redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { isBeforeStartTime, currentTimeIsInRangeOf } from 'event-widgets/redux/modules/timezones';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import WidgetFactory from '../../../widgetFactory';
import websiteReducer from '../../../redux/website';
import Content from 'nucleus-guestside-site/src/containers/Content';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { act } from 'react-dom/test-utils';

jest.mock('../../../../../../pkgs/event-widgets/redux/modules/timezones', () => {
  return {
    currentTimeIsInRangeOf: jest.fn(),
    isBeforeStartTime: jest.fn()
  };
});

jest.mock('../inviteeInfo', () => {
  return {
    useInvitee: jest.fn().mockReturnValue(() => {})
  };
});

const attendeeSpecificWebcastData = {
  data: [
    {
      attendee: { id: '7387632a-6096-4a95-b784-2437e574014f' },
      event: { id: '05e318cc-3a69-4ae3-9496-0e6c6f7db99a' },
      id: '50a97e39-a074-4ef9-a4f8-4b3821d308d5',
      join: {
        code: 'attendee specific data password for event',
        href: 'attendee specific data url for event'
      },
      session: {},
      webcast: { id: '3c3cbdf3-fa4c-4135-bc14-c421254adb8b' }
    },
    {
      attendee: { id: '7387632a-6096-4a95-b784-2437e574014f' },
      event: { id: '05e318cc-3a69-4ae3-9496-0e6c6f7db99a' },
      id: '0bcba57f-1cc7-4bcb-b79b-e97f033f868e',
      join: {
        code: 'attendee specific data password for session',
        href: 'attendee specific data url for session'
      },
      session: { id: '89a5f53b-4542-446c-93ff-df5e769de644' },
      webcast: { id: '96e14a86-b713-4e78-a0ae-dc644f2d88dd' }
    }
  ],
  paging: {}
};

const sessionProducts = {
  '89a5f53b-4542-446c-93ff-df5e769de644': {
    code: '',
    id: '89a5f53b-4542-446c-93ff-df5e769de644',
    name: 'session 1',
    type: 'Session',
    startTime: '2021-04-05T22:00:00.000Z',
    endTime: '2021-04-05T23:00:00.000Z',
    status: 2,
    webcast: {
      id: '96e14a86-b713-4e78-a0ae-dc644f2d88dd',
      joiningURL: 'generic session url',
      joiningCode: 'generic session password',
      recordingURL: 'session recording url',
      recordingCode: 'session recording password'
    }
  }
};

const initialState = {
  clients: {
    universalWebcastClient: {
      getAttendeeLinkData: jest.fn().mockReturnValue(new Promise(resolve => resolve(attendeeSpecificWebcastData)))
    },
    productVisibilityClient: {
      getVisibleProducts: jest.fn().mockReturnValue(new Promise(resolve => resolve(sessionProducts)))
    }
  },
  selectedTimeZone: {},
  text: { eventTimezone: {}, translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx) },
  visibleProducts: {
    Widget: { sessionProducts }
  },
  widgetFactory: new WidgetFactory(),
  event: {
    startDate: '2021-04-05T22:00:00Z',
    endDate: '2021-04-06T02:00:00Z',
    status: 2,
    webcast: {
      id: '3c3cbdf3-fa4c-4135-bc14-c421254adb8b',
      joiningURL: 'generic event url',
      joiningCode: 'generic event password',
      recordingURL: 'event recording url',
      recordingCode: 'event recording password'
    }
  },
  userSession: { inviteeId: 'some-invitee-id' },
  defaultUserSession: { eventId: 'some-event-id' },
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  pathInfo: {
    rootPath: ''
  }
};

function reducer(state, action) {
  return {
    ...state,
    virtualDetails: virtualDetailsReducer(state.virtualDetails, action),
    website: websiteReducer(state.website, action)
  };
}

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

describe('test cases when invitee comes to this page for event webcast details', () => {
  test('verify state stores attendee specific webcast details if present', async () => {
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.code).toEqual('attendee specific data password for event');
    expect(mockStore.getState().virtualDetails.url).toEqual('attendee specific data url for event');
    expect(mockStore.getState().virtualDetails.isPassed).toBeFalsy();
    expect(mockStore.getState().virtualDetails.pageToDisplay).toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state stores generic webcast data if attendee specific webcast details are not present', async () => {
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const webcastData = {
      data: [
        {
          attendee: { id: '7387632a-6096-4a95-b784-2437e574014f' },
          event: { id: '05e318cc-3a69-4ae3-9496-0e6c6f7db99a' },
          id: '0bcba57f-1cc7-4bcb-b79b-e97f033f868e',
          join: {
            code: 'attendee specific data password for session',
            href: 'attendee specific data url for session'
          },
          session: { id: '89a5f53b-4542-446c-93ff-df5e769de644' },
          webcast: { id: '96e14a86-b713-4e78-a0ae-dc644f2d88dd' }
        }
      ]
    };
    const initState = {
      ...initialState,
      clients: {
        universalWebcastClient: {
          getAttendeeLinkData: jest.fn().mockReturnValue(new Promise(resolve => resolve(webcastData)))
        }
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.code).toEqual('generic event password');
    expect(mockStore.getState().virtualDetails.url).toEqual('generic event url');
    expect(mockStore.getState().virtualDetails.type).toEqual('event');
    expect(mockStore.getState().virtualDetails.isPassed).toBeFalsy();
    expect(mockStore.getState().virtualDetails.pageToDisplay).toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state store recording url and password if event has passed', async () => {
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.code).toEqual('event recording password');
    expect(mockStore.getState().virtualDetails.url).toEqual('event recording url');
    expect(mockStore.getState().virtualDetails.type).toEqual('event');
    expect(mockStore.getState().virtualDetails.isPassed).toBeTruthy();
    expect(mockStore.getState().virtualDetails.pageToDisplay).toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state does not store pageToDisplay as VIRTUAL_DETAILS_PAGE when event has passed and no recording url is available', async () => {
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const initState = {
      ...initialState,
      event: {
        webcast: {
          id: '3c3cbdf3-fa4c-4135-bc14-c421254adb8b',
          joiningURL: 'generic event url',
          joiningCode: 'generic event password'
        }
      }
    };

    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.pageToDisplay).not.toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state does not store pageToDisplay as VIRTUAL_DETAILS_PAGE when event is cancelled', async () => {
    const initState = {
      ...initialState,
      event: {
        ...initialState.event,
        status: 7
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.pageToDisplay).not.toEqual(VIRTUAL_DETAILS_PAGE);
  });
});

describe('test cases when invitee comes to this page for session webcast details', () => {
  test('verify state stores attendee specific webcast details if present', async () => {
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.code).toEqual('attendee specific data password for session');
    expect(mockStore.getState().virtualDetails.url).toEqual('attendee specific data url for session');
    expect(mockStore.getState().virtualDetails.type).toEqual('session');
    expect(mockStore.getState().virtualDetails.isPassed).toBeFalsy();
    expect(mockStore.getState().virtualDetails.pageToDisplay).toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state stores generic webcast data if attendee specific webcast details are not present', async () => {
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const webcastData = {
      data: [
        {
          attendee: { id: '7387632a-6096-4a95-b784-2437e574014f' },
          event: { id: '05e318cc-3a69-4ae3-9496-0e6c6f7db99a' },
          id: '50a97e39-a074-4ef9-a4f8-4b3821d308d5',
          join: {
            code: ' attendee specific data password for event',
            href: 'attendee specific data url for event'
          },
          session: {},
          webcast: { id: '3c3cbdf3-fa4c-4135-bc14-c421254adb8b' }
        }
      ]
    };
    const initState = {
      ...initialState,
      clients: {
        ...initialState.clients,
        universalWebcastClient: {
          getAttendeeLinkData: jest.fn().mockReturnValue(new Promise(resolve => resolve(webcastData)))
        }
      }
    };

    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.code).toEqual('generic session password');
    expect(mockStore.getState().virtualDetails.url).toEqual('generic session url');
    expect(mockStore.getState().virtualDetails.type).toEqual('session');
    expect(mockStore.getState().virtualDetails.isPassed).toBeFalsy();
    expect(mockStore.getState().virtualDetails.pageToDisplay).toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state store recording url and password if session has passed', async () => {
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.code).toEqual('session recording password');
    expect(mockStore.getState().virtualDetails.url).toEqual('session recording url');
    expect(mockStore.getState().virtualDetails.type).toEqual('session');
    expect(mockStore.getState().virtualDetails.isPassed).toBeTruthy();
    expect(mockStore.getState().virtualDetails.pageToDisplay).toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state does not store pageToDisplay as VIRTUAL_DETAILS_PAGE when session has passed and no recording url is available', async () => {
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const initState = {
      ...initialState,
      visibleProducts: {
        Widget: {
          sessionProducts: {
            '89a5f53b-4542-446c-93ff-df5e769de644': {
              code: '',
              id: '89a5f53b-4542-446c-93ff-df5e769de644',
              name: 'session 1',
              type: 'Session',
              startTime: '2021-04-05T22:00:00.000Z',
              endTime: '2021-04-05T23:00:00.000Z',
              webcast: {
                id: '96e14a86-b713-4e78-a0ae-dc644f2d88dd',
                joiningURL: 'generic session url',
                joiningCode: 'generic session password'
              }
            }
          }
        }
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.pageToDisplay).not.toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state does not store pageToDisplay as VIRTUAL_DETAILS_PAGE when session is cancelled', async () => {
    const initState = {
      ...initialState,
      visibleProducts: {
        Widget: {
          sessionProducts: {
            '89a5f53b-4542-446c-93ff-df5e769de644': {
              ...initialState.visibleProducts.Widget.sessionProducts['89a5f53b-4542-446c-93ff-df5e769de644'],
              status: 7
            }
          }
        }
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.pageToDisplay).not.toEqual(VIRTUAL_DETAILS_PAGE);
  });

  test('verify state does not store pageToDisplay as VIRTUAL_DETAILS_PAGE when sessionId is invalid or session is deleted in test mode', async () => {
    const initState = {
      ...initialState,
      visibleProducts: {
        Widget: {
          sessionProducts: {}
        }
      }
    };

    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    expect(mockStore.getState().virtualDetails.pageToDisplay).not.toEqual(VIRTUAL_DETAILS_PAGE);
  });
});

describe('cases for matching snapshot for event', () => {
  test('should match snapshot for displaying event webcast data', async () => {
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display recording url and password if event has passed', async () => {
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and show generic message widget when event has passed and no recording url is available', async () => {
    window.history.pushState({}, 'Virtual Details', '?i=7387632a-6096-4a95-b784-2437e574014f');
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const initState = {
      ...initialState,
      event: {
        webcast: {
          id: '3c3cbdf3-fa4c-4135-bc14-c421254adb8b',
          joiningURL: 'generic event url',
          joiningCode: 'generic event password'
        }
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and show generic message widget when event is cancelled', async () => {
    const initState = {
      ...initialState,
      event: {
        ...initialState.event,
        status: 7
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display generic webcast data when attendeeId not present', async () => {
    const initState = {
      ...initialState,
      userSession: {}
    };
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });
});

describe('cases for matching snapshot for session', () => {
  test('should match snapshot for displaying session webcast data', async () => {
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    isBeforeStartTime.mockImplementation(() => true);
    currentTimeIsInRangeOf.mockImplementation(() => true);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display recording url and password if session has passed', async () => {
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display generic message widget when session has passed and no recording url is available', async () => {
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const initState = {
      ...initialState,
      visibleProducts: {
        Widget: {
          sessionProducts: {
            '89a5f53b-4542-446c-93ff-df5e769de644': {
              code: '',
              id: '89a5f53b-4542-446c-93ff-df5e769de644',
              name: 'session 1',
              type: 'Session',
              startTime: '2021-04-05T22:00:00.000Z',
              endTime: '2021-04-05T23:00:00.000Z',
              webcast: {
                id: '96e14a86-b713-4e78-a0ae-dc644f2d88dd',
                joiningURL: 'generic session url',
                joiningCode: 'generic session password'
              }
            }
          }
        }
      }
    };
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display generic message widget when session is cancelled', async () => {
    isBeforeStartTime.mockImplementation(() => false);
    currentTimeIsInRangeOf.mockImplementation(() => false);
    const initState = {
      ...initialState,
      visibleProducts: {
        Widget: {
          sessionProducts: {
            '89a5f53b-4542-446c-93ff-df5e769de644': {
              ...initialState.visibleProducts.Widget.sessionProducts['89a5f53b-4542-446c-93ff-df5e769de644'],
              status: 7
            }
          }
        }
      }
    };
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display generic message widget when attendeeId not present', async () => {
    const initState = {
      ...initialState,
      userSession: {}
    };
    window.history.pushState({}, 'Virtual Details', '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644');
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });

  test('should match snapshot and display session not available widget when sessionId is invalid or session is deleted in test mode', async () => {
    const initState = {
      ...initialState,
      visibleProducts: {
        Widget: {
          sessionProducts: {}
        }
      }
    };
    window.history.pushState(
      {},
      'Virtual Details',
      '?sessionId=89a5f53b-4542-446c-93ff-df5e769de644&i=7387632a-6096-4a95-b784-2437e574014f'
    );
    const mockStore = createStore(reducer, initState, applyMiddleware(thunk));
    await mockStore.dispatch(prepareForVirtualDetailsPageLoad());
    const rootLayoutItemId = mockStore.getState().website.pages.virtualDetails.rootLayoutItemIds[0];
    expect(rootLayoutItemId).toBeTruthy();
    const pageElement = (
      <Provider store={mockStore}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    const renderedPage = renderer.create(pageElement);
    await waitWithAct();
    expect(renderedPage).toMatchSnapshot();
  });
});
