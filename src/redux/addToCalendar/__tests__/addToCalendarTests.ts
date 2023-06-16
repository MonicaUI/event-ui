import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { loadAddToCalendarProviders, loadEventCalendarUrl, loadSessionCalendarUrl } from '../actions';
import addToCalendarReducer from '../reducer';
import { CALENDAR_EVENT_ID } from '../../../utils/addToCalendarUtils';
import { CalendarType } from '../../../dialogs/DownloadCalendarDialog/CalendarDownloadFileType';

const addToCalendarProvidersResponse = {
  calendarProviders: {
    Google: {
      calendarProviderId: 2,
      calendarProviderName: 'Google',
      calendarProviderSequence: 30,
      calendarProviderIcon: 'icon_google.gif',
      calendarProviderURL:
        'http://www.google.com/calendar/event?action=TEMPLATE&text=<<TITLE>>&dates=<<STARTDATE>>/<<ENDDATE>>&location=<<LOCATION>>&trp=false&details=<<DESCRIPTION>>',
      calendarProviderDesc: ''
    },
    MSN: {},
    Yahoo: {}
  }
};
const calendarServiceResponse = {
  calendarType: 'google',
  calendarUrl:
    'http://www.google.com/calendar/event?action=TEMPLATE&text=Are You a Event?&dates=20210206T230000Z/20210207T000000Z&location=&trp=false&details=',
  encodedFileName: null,
  errorResponse: null
};

const getCalendarProvidersMock = jest.fn();
getCalendarProvidersMock.mockReturnValue(
  new Promise(resolve => {
    return resolve(addToCalendarProvidersResponse);
  })
);
const getEventCalendarMock = jest.fn();
getEventCalendarMock.mockReturnValue(
  new Promise(resolve => {
    return resolve(calendarServiceResponse);
  })
);
const getSessionCalendarMock = jest.fn();
getSessionCalendarMock.mockReturnValue(
  new Promise(resolve => {
    return resolve(calendarServiceResponse);
  })
);
const initialState = {
  clients: {
    lookupClient: {
      getCalendarProviders: getCalendarProvidersMock
    },
    calendarClient: {
      getEventCalendar: getEventCalendarMock,
      getSessionCalendar: getSessionCalendarMock
    }
  },
  accessToken: 'some token'
};

const initialStateWithCalendarProviders = {
  ...initialState,
  calendarProviders: {
    ...addToCalendarProvidersResponse.calendarProviders
  }
};

const getState = (state = initialState) => state;
function clearMocksAndCreateStore(mockState = initialState) {
  jest.clearAllMocks();
  return createStore(
    (state, action) => {
      return {
        ...state,
        calendarProviders: addToCalendarReducer((state as $TSFixMe).calendarProviders, action)
      };
    },
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { lookupClient: { get... Remove this comment to see the full error message
    getState(mockState),
    applyMiddleware(thunk)
  );
}

describe('Load add to calendar providers using oslo-lookups service proxied via guestside', () => {
  test('not present in state via api call', async () => {
    const mockStore = clearMocksAndCreateStore(initialState);
    await mockStore.dispatch(loadAddToCalendarProviders());
    expect(getCalendarProvidersMock).toHaveBeenCalledTimes(1);
    expect((mockStore.getState() as $TSFixMe).calendarProviders).toEqual(
      addToCalendarProvidersResponse.calendarProviders
    );
  });

  test('already present in state without api call', async () => {
    const mockStore = clearMocksAndCreateStore(initialStateWithCalendarProviders);
    await mockStore.dispatch(loadAddToCalendarProviders());
    expect(getCalendarProvidersMock).toHaveBeenCalledTimes(0);
    expect((mockStore.getState() as $TSFixMe).calendarProviders).toEqual(
      addToCalendarProvidersResponse.calendarProviders
    );
  });
});

describe('Load calendar uris using calendar service directly', () => {
  test('event calendar not present in state via api call', async () => {
    const mockStore = clearMocksAndCreateStore(initialState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await (mockStore.dispatch as AppDispatch)(loadEventCalendarUrl(CalendarType.GOOGLE));
    expect(getEventCalendarMock).toHaveBeenCalledTimes(1);
    expect((mockStore.getState() as $TSFixMe).calendarProviders).toBeDefined();
    expect((mockStore.getState() as $TSFixMe).calendarProviders.google[CALENDAR_EVENT_ID]).toEqual(
      calendarServiceResponse.calendarUrl
    );
  });

  test('event calendar not present in state via api call for outlook', async () => {
    const mockStore = clearMocksAndCreateStore(initialState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await (mockStore.dispatch as AppDispatch)(loadEventCalendarUrl(CalendarType.OUTLOOK));
    expect(getEventCalendarMock).toHaveBeenCalledTimes(1);
    expect((mockStore.getState() as $TSFixMe).calendarProviders).toBeDefined();
    expect((mockStore.getState() as $TSFixMe).calendarProviders.outlook[CALENDAR_EVENT_ID]).toEqual(
      calendarServiceResponse.calendarUrl
    );
  });

  test('session calendar not present in state via api call', async () => {
    const mockStore = clearMocksAndCreateStore(initialState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await (mockStore.dispatch as AppDispatch)(loadSessionCalendarUrl(CalendarType.GOOGLE, 'session-id'));
    expect(getSessionCalendarMock).toHaveBeenCalledTimes(1);
    expect((mockStore.getState() as $TSFixMe).calendarProviders).toBeDefined();
    expect((mockStore.getState() as $TSFixMe).calendarProviders.google['session-id']).toEqual(
      calendarServiceResponse.calendarUrl
    );
  });

  test('session calendar not present in state via api call 1', async () => {
    const mockStore = clearMocksAndCreateStore(initialState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await (mockStore.dispatch as AppDispatch)(loadSessionCalendarUrl(CalendarType.OUTLOOK, 'session-id'));
    expect(getSessionCalendarMock).toHaveBeenCalledTimes(1);
    expect((mockStore.getState() as $TSFixMe).calendarProviders).toBeDefined();
    expect((mockStore.getState() as $TSFixMe).calendarProviders.outlook['session-id']).toEqual(
      calendarServiceResponse.calendarUrl
    );
  });
});
