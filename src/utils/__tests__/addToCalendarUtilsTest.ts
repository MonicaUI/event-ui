import {
  getCalendarUrl,
  formatDownloadIcsFileUrl,
  CALENDAR_EVENT_ID,
  getGoogleCalendar,
  isFlexAddToGoogleCalendarVirtualEventVariant,
  isFlexAddToGoogleCalendarInPersonEventVariant,
  isFlexAddToGoogleCalendarEnabledVariant,
  getEventInfo,
  getEventCalendarDescription,
  getCalendarSettings
} from '../addToCalendarUtils';
import { CalendarType } from '../../dialogs/DownloadCalendarDialog/CalendarDownloadFileType';

const addToCalendarState = {
  google: {
    [CALENDAR_EVENT_ID]:
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Flex Virtual Event&dates=20210205T230000Z/20210206T030000Z&location=https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;&trp=false&details=Flex event description<br/><br/>Event URL: https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;"',
    'some-session-Id':
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Flex Virtual Session&dates=20210205T230000Z/20210206T030000Z&location=https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;&trp=false&details=Flex session description<br/><br/>Session URL: https://cvent.zoom.us/j/94720449889?pwd=Y2JIZjlmN1I4dU0yOE9NNndmTE1Cdz09&from=msft;'
  }
};

const mockEventInfo = {
  title: 'Event1',
  startDate: '2099-01-01T20:20:00Z',
  endDate: '2099-01-01T21:20:00Z',
  location: 'US',
  description: 'ConnectHub'
};

const mockState = {
  appData: {
    calendarSettings: {
      descriptionSource: 'some-ds',
      customDescription: 'some-cd'
    }
  },
  text: {
    translate: c => c
  },
  event: {
    ...mockEventInfo
  }
};

describe('getCalendarUrl', () => {
  const calendarUrl =
    'http://www.google.com/calendar/event?action=TEMPLATE&text=<<TITLE>>&dates=<<STARTDATE>>/<<ENDDATE>>&location=<<LOCATION>>&trp=false&details=<<DESCRIPTION>>';

  const sessionInfo = {
    title: 'Session1',
    startTime: '2099-01-01T20:20:00.000Z',
    endTime: '2099-01-01T21:20:00.000Z',
    location: 'US',
    description: 'BasedOnAI'
  };

  test('opened google calendar should have event description', () => {
    const calendarDescription = {
      descriptionSource: 'event'
    };
    const actualUrl = getCalendarUrl(calendarUrl, mockEventInfo, true, calendarDescription);
    const expectedUrl =
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Event1&dates=20990101T202000Z/20990101T212000Z&location=US&trp=false&details=ConnectHub';
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('opened google calendar should have custom event description', () => {
    const calendarDescription = {
      descriptionSource: 'custom',
      customDescription: 'CustomDescription'
    };
    const actualUrl = getCalendarUrl(calendarUrl, mockEventInfo, true, calendarDescription);
    const expectedUrl =
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Event1&dates=20990101T202000Z/20990101T212000Z&location=US&trp=false&details=CustomDescription';
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('opened google calendar should have custom event description 1', () => {
    const calendarDescription = {
      descriptionSource: 'none'
    };
    const actualUrl = getCalendarUrl(calendarUrl, mockEventInfo, true, calendarDescription);
    const expectedUrl =
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Event1&dates=20990101T202000Z/20990101T212000Z&location=US&trp=false&details=';
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('opened google calendar should have session information with session description', () => {
    const actualUrl = getCalendarUrl(calendarUrl, sessionInfo);
    const expectedUrl =
      'http://www.google.com/calendar/event?action=TEMPLATE&text=Session1&dates=20990101T202000Z/20990101T212000Z&location=US&trp=false&details=BasedOnAI';
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('getGoogleCalendar should return correct google event calendar url', () => {
    const eventCalendarUrl = getGoogleCalendar(addToCalendarState);
    expect(addToCalendarState.google[CALENDAR_EVENT_ID]).toEqual(eventCalendarUrl);
  });

  test('getGoogleCalendar should return correct google session calendar url', () => {
    const sessionCalendarUrl = getGoogleCalendar(addToCalendarState, 'some-session-Id');
    expect(addToCalendarState.google['some-session-Id']).toEqual(sessionCalendarUrl);
  });

  test('isFlexAddToGoogleCalendarVirtualEventVariant should return true for matching virtual variant', () => {
    const mockGoogleState = {
      experiments: {
        flexAddToGoogleCalendarExperimentVariant: 2
      }
    };
    expect(isFlexAddToGoogleCalendarVirtualEventVariant(mockGoogleState)).toBe(true);
  });

  test('isFlexAddToGoogleCalendarVirtualEventVariant should return true for matching in-person variant', () => {
    const mockGoogleState = {
      experiments: {
        flexAddToGoogleCalendarExperimentVariant: 1
      }
    };
    expect(isFlexAddToGoogleCalendarInPersonEventVariant(mockGoogleState)).toBe(true);
  });

  test('isFlexAddToGoogleCalendarEnabledVariant should return false for google not enabled', () => {
    const mockGoogleState = {
      experiments: {
        flexAddToGoogleCalendarExperimentVariant: 0
      }
    };
    expect(isFlexAddToGoogleCalendarEnabledVariant(mockGoogleState)).toBe(false);
  });

  test('getEventInfo selector for google calendar should return correct results', () => {
    const eventInfo = getEventInfo(mockState);
    expect(eventInfo).toEqual(mockEventInfo);
  });

  test('getCalendarSettings and getEventCalendarDescription', () => {
    const calendarSettings = getCalendarSettings(mockState);
    expect(calendarSettings).toEqual(mockState.appData.calendarSettings);

    const eventCalendarDescription = getEventCalendarDescription(calendarSettings);
    expect(eventCalendarDescription.descriptionSource).toEqual('some-ds');
    expect(eventCalendarDescription.customDescription).toEqual('some-cd');
  });
});

describe('formatDownloadEventIcsFileUrl', () => {
  const testData = {
    calendarBasePath: 'somePath',
    environment: 'someEnvironment',
    locale: 'someLocale',
    sessionId: 'someSession',
    previewToken: 'preview',
    testModeHash: 'test',
    eventId: 'some-event-id',
    attendeeId: '0-0-0-0-0'
  };

  test('url should only contain environment', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?environment=${testData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      environment: testData.environment,
      eventId: testData.eventId,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url should only contain locale', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?locale=${testData.locale}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      locale: testData.locale,
      eventId: testData.eventId,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url should only contain previewToken', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?previewToken=${testData.previewToken}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      previewToken: testData.previewToken,
      eventId: testData.eventId,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url should only contain testModeHash', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?tm=${testData.testModeHash}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      testModeHash: testData.testModeHash,
      eventId: testData.eventId,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url should only contain one token if given both a previewToken and testModeHash', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?previewToken=${testData.previewToken}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      previewToken: testData.previewToken,
      testModeHash: testData.testModeHash,
      eventId: testData.eventId,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url should only contain session id and environment', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}/${testData.sessionId}?environment=${testData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      sessionId: testData.sessionId,
      environment: testData.environment,
      eventId: testData.eventId,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url contains all parameters', () => {
    const extendedPath = `${testData.calendarBasePath}event/ical/${testData.eventId}`;
    const expectedUrl = `${extendedPath}/${testData.sessionId}?environment=${testData.environment}&locale=${testData.locale}&previewToken=${testData.previewToken}&inviteeId=${testData.attendeeId}`;
    const actualUrl = formatDownloadIcsFileUrl(testData);
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url points to guestSideService for event when experiment is off', () => {
    const customTestData = {
      ...testData,
      addToCalendarEnabled: false
    };
    const extendedPath = `${customTestData.calendarBasePath}event/ical/${customTestData.eventId}`;
    const expectedUrl = `${extendedPath}?environment=${testData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: customTestData.calendarBasePath,
      environment: customTestData.environment,
      eventId: customTestData.eventId,
      addToCalendarEnabled: customTestData.addToCalendarEnabled,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url points to guestSideService for session when experiment is off', () => {
    const customTestData = {
      ...testData,
      sessionId: 'some-session-id',
      addToCalendarEnabled: false
    };
    const extendedPath = `${customTestData.calendarBasePath}event/ical/${customTestData.eventId}`;
    const expectedUrl = `${extendedPath}/${customTestData.sessionId}?environment=${testData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: customTestData.calendarBasePath,
      environment: customTestData.environment,
      sessionId: customTestData.sessionId,
      eventId: customTestData.eventId,
      addToCalendarEnabled: customTestData.addToCalendarEnabled,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url points to calendarService for event when experiment is on', () => {
    const customTestData = {
      ...testData,
      addToCalendarEnabled: true
    };
    const extendedPath = `${customTestData.calendarBasePath}calendar/v1/calendars/ics/events/${customTestData.eventId}`;
    const expectedUrl = `${extendedPath}?environment=${customTestData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: customTestData.calendarBasePath,
      environment: customTestData.environment,
      eventId: customTestData.eventId,
      addToCalendarEnabled: customTestData.addToCalendarEnabled,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url points to calendarService for session when experiment is on', () => {
    const customTestData = {
      ...testData,
      sessionId: 'some-session_id',
      addToCalendarEnabled: true
    };
    const extendedPath = `${customTestData.calendarBasePath}calendar/v1/calendars/ics/events/${customTestData.eventId}`;
    const expectedUrl = `${extendedPath}/sessions/${customTestData.sessionId}?environment=${customTestData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: customTestData.calendarBasePath,
      environment: customTestData.environment,
      sessionId: customTestData.sessionId,
      eventId: customTestData.eventId,
      addToCalendarEnabled: customTestData.addToCalendarEnabled,
      calendarType: CalendarType.ICS
    });
    expect(expectedUrl).toEqual(actualUrl);
  });
});

describe('formatDownloadEventIcsFileUrl for apple calendar', () => {
  const testData = {
    calendarBasePath: 'somePath/',
    environment: 'someEnvironment',
    locale: 'someLocale',
    sessionId: 'someSession',
    previewToken: 'preview',
    testModeHash: 'test',
    eventId: 'some-event-id',
    calendarType: CalendarType.ICAL,
    addToCalendarEnabled: true,
    attendeeId: '0-0-0-0-0'
  };

  test('url should only contain environment', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?environment=${testData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      environment: testData.environment,
      eventId: testData.eventId,
      calendarType: CalendarType.ICAL,
      addToCalendarEnabled: testData.addToCalendarEnabled
    });
    expect(expectedUrl).toEqual(actualUrl);
  });

  test('url should only contain locale', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?locale=${testData.locale}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      locale: testData.locale,
      eventId: testData.eventId,
      calendarType: testData.calendarType,
      addToCalendarEnabled: testData.addToCalendarEnabled
    });
    expect(actualUrl).toEqual(expectedUrl);
  });

  test('url should only contain previewToken', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?previewToken=${testData.previewToken}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      previewToken: testData.previewToken,
      eventId: testData.eventId,
      calendarType: testData.calendarType,
      addToCalendarEnabled: testData.addToCalendarEnabled
    });
    expect(actualUrl).toEqual(expectedUrl);
  });

  test('url should only contain testModeHash', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?tm=${testData.testModeHash}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      testModeHash: testData.testModeHash,
      eventId: testData.eventId,
      calendarType: testData.calendarType,
      addToCalendarEnabled: testData.addToCalendarEnabled
    });
    expect(actualUrl).toEqual(expectedUrl);
  });

  test('url should only contain one token if given both a previewToken and testModeHash', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}?previewToken=${testData.previewToken}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      previewToken: testData.previewToken,
      testModeHash: testData.testModeHash,
      eventId: testData.eventId,
      calendarType: testData.calendarType,
      addToCalendarEnabled: testData.addToCalendarEnabled
    });
    expect(actualUrl).toEqual(expectedUrl);
  });

  test('url should only contain session id and environment', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}/sessions/${testData.sessionId}?environment=${testData.environment}`;
    const actualUrl = formatDownloadIcsFileUrl({
      calendarBasePath: testData.calendarBasePath,
      sessionId: testData.sessionId,
      environment: testData.environment,
      eventId: testData.eventId,
      calendarType: testData.calendarType,
      addToCalendarEnabled: testData.addToCalendarEnabled
    });
    expect(actualUrl).toEqual(expectedUrl);
  });

  test('url contains all parameters', () => {
    const extendedPath = `${testData.calendarBasePath}calendar/v1/calendars/ical/events/${testData.eventId}`;
    const expectedUrl = `${extendedPath}/sessions/${testData.sessionId}?environment=${testData.environment}&locale=${testData.locale}&previewToken=${testData.previewToken}&inviteeId=${testData.attendeeId}`;
    const actualUrl = formatDownloadIcsFileUrl(testData);
    expect(actualUrl).toEqual(expectedUrl);
  });
});
