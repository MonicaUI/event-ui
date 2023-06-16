import { createSelector } from 'reselect';
import CalendarDescriptionSource from '../dialogs/DownloadCalendarDialog/CalendarDescriptionSource';
import moment from 'moment';
import { getIn } from 'icepick';
import qs from 'querystring';
import { CalendarType } from '../dialogs/DownloadCalendarDialog/CalendarDownloadFileType';

const TITLE = '<<TITLE>>';
const STARTDATE = '<<STARTDATE>>';
const ENDDATE = '<<ENDDATE>>';
const LOCATION = '<<LOCATION>>';
const DESCRIPTION = '<<DESCRIPTION>>';
const EMPTY_STUB = '00000000-0000-0000-0000-000000000000';
/*
 * We are not saving the actual eventId for mapping in redux state as eventId is unique to any event
 * But for sessions, we are maintaining the mapping between actual sessionId and sessionCalendarUrl
 */
export const CALENDAR_EVENT_ID = EMPTY_STUB;

export const AddToCalendarExperiment = {
  ICS_CALENDAR_VARIANT: 0,
  GOOGLE_CALENDAR_FOR_INPERSON_VARIANT: 1,
  GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT: 2,
  OUTLOOK_ICS_ICAL_CALENDAR_VARIANT: 3
};

const formatDate = date => {
  let formattedDate = `${moment.utc(date).format('YYYY-MM-DDTHH:mm:ss')}Z`;
  formattedDate = formattedDate.replace(/-/g, '');
  return formattedDate.replace(/:/g, '');
};

/**
 * This method creates url for ics calendar when called using calendarService
 */
const calendarServicePathForIcs = (calendarBasePath, eventId, sessionId, queryParamString, calendarType) => {
  const extendedPath = `${calendarBasePath}calendar/v1/calendars/${calendarType}/events/${eventId}`;

  return sessionId
    ? `${extendedPath}/sessions/${sessionId}?${queryParamString}`
    : `${extendedPath}?${queryParamString}`;
};

/**
 * The method created url for ics calendar when called using guestSideService
 */
const guestSideServicePathForIcs = (calendarBasePath, eventId, sessionId, queryParamString) => {
  const extendedPath = `${calendarBasePath}event/ical/${eventId}`;

  return sessionId ? `${extendedPath}/${sessionId}?${queryParamString}` : `${extendedPath}?${queryParamString}`;
};

export function formatDownloadIcsFileUrl({
  calendarBasePath,
  environment,
  locale,
  sessionId,
  previewToken,
  testModeHash,
  eventId,
  addToCalendarEnabled,
  calendarType,
  attendeeId
}: {
  calendarBasePath?: $TSFixMe;
  environment?: $TSFixMe;
  locale?: $TSFixMe;
  sessionId?: $TSFixMe;
  previewToken?: $TSFixMe;
  testModeHash?: $TSFixMe;
  eventId?: $TSFixMe;
  addToCalendarEnabled?: $TSFixMe;
  calendarType?: $TSFixMe;
  attendeeId?: $TSFixMe;
}): $TSFixMe {
  const queryParams = {};

  if (environment) {
    (queryParams as $TSFixMe).environment = environment;
  }

  if (locale) {
    (queryParams as $TSFixMe).locale = locale;
  }

  if (previewToken) {
    (queryParams as $TSFixMe).previewToken = previewToken;
  } else if (testModeHash) {
    (queryParams as $TSFixMe).tm = testModeHash;
  }

  if (attendeeId) {
    (queryParams as $TSFixMe).inviteeId = attendeeId;
  }

  const queryParamString = qs.stringify(queryParams);
  return addToCalendarEnabled
    ? calendarServicePathForIcs(calendarBasePath, eventId, sessionId, queryParamString, calendarType)
    : guestSideServicePathForIcs(calendarBasePath, eventId, sessionId, queryParamString);
}

export function downloadEventIcsFile(
  calendarBasePath: $TSFixMe,
  environment: $TSFixMe,
  previewToken: $TSFixMe,
  testModeHash: $TSFixMe,
  eventId: $TSFixMe,
  addToCalendarEnabled: $TSFixMe,
  calendarType: $TSFixMe,
  attendeeId: $TSFixMe,
  locale: $TSFixMe
): $TSFixMe {
  const calendarPathUrl = formatDownloadIcsFileUrl({
    calendarBasePath,
    environment,
    locale,
    previewToken,
    testModeHash,
    eventId,
    addToCalendarEnabled,
    calendarType,
    attendeeId
  });
  global.location.replace(calendarPathUrl);
}

export function getCalendarUrl(
  calendarProviderURL: $TSFixMe,
  eventOrSessionInfo: $TSFixMe,
  isEventCalendar = false,
  calendarDescription = {}
): $TSFixMe {
  const startDate = formatDate(isEventCalendar ? eventOrSessionInfo.startDate : eventOrSessionInfo.startTime);
  const endDate = formatDate(isEventCalendar ? eventOrSessionInfo.endDate : eventOrSessionInfo.endTime);
  let calendarUrl = calendarProviderURL.replace(TITLE, encodeURIComponent(eventOrSessionInfo.title));
  calendarUrl = calendarUrl.replace(STARTDATE, startDate);
  calendarUrl = calendarUrl.replace(ENDDATE, endDate);
  calendarUrl = calendarUrl.replace(LOCATION, encodeURIComponent(eventOrSessionInfo.location));
  if (
    isEventCalendar &&
    calendarDescription &&
    (calendarDescription as $TSFixMe).descriptionSource !== CalendarDescriptionSource.EVENT
  ) {
    calendarUrl =
      (calendarDescription as $TSFixMe).descriptionSource === CalendarDescriptionSource.CUSTOM
        ? calendarUrl.replace(DESCRIPTION, encodeURIComponent((calendarDescription as $TSFixMe).customDescription))
        : calendarUrl.replace(DESCRIPTION, '');
  } else {
    calendarUrl = calendarUrl.replace(DESCRIPTION, encodeURIComponent(eventOrSessionInfo.description));
  }
  return calendarUrl;
}

export const getEventInfo = createSelector(
  state => (state as $TSFixMe).text.translate,
  state => (state as $TSFixMe).event.title,
  state => (state as $TSFixMe).event.startDate,
  state => (state as $TSFixMe).event.endDate,
  state => (state as $TSFixMe).event.location,
  state => (state as $TSFixMe).event.description,
  (translate, title, startDate, endDate, location, description) => {
    return {
      title: translate(title),
      startDate,
      endDate,
      location: translate(location),
      description: translate(description)
    };
  }
);

export const getCalendarSettings = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['appData', 'calendarSettings']);
};

export const isMobileView = (): $TSFixMe => {
  const maxMobileViewScreenSize = 480;
  const screenSize = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  return screenSize < maxMobileViewScreenSize;
};

export function getEventCalendarDescription(calendarSettings: $TSFixMe): $TSFixMe {
  return {
    descriptionSource: calendarSettings.descriptionSource,
    customDescription: calendarSettings.customDescription
  };
}

/**
 * @returns preview token if present to be used in calendar service call
 */
export function getPreviewToken(isPreview: $TSFixMe, pathInfo: $TSFixMe): $TSFixMe {
  return isPreview ? pathInfo?.queryParams?.previewToken : null;
}

/**
 * @returns test mode hash if present to be used in calendar service call
 */
export function getTestModeHash(isTestMode: $TSFixMe, pathInfo: $TSFixMe): $TSFixMe {
  return isTestMode ? pathInfo?.queryParams?.tm : null;
}

/**
 * @returns true when outlook_ics_ical calendar virtual variant is ON for the account
 */
export function isAddToCalendarEnabled(state: $TSFixMe): $TSFixMe {
  return (
    state.experiments?.flexAddToGoogleCalendarExperimentVariant >=
    AddToCalendarExperiment.OUTLOOK_ICS_ICAL_CALENDAR_VARIANT
  );
}

/**
 * @returns true when google calendar virtual variant is ON for the account
 */
export function isFlexAddToGoogleCalendarVirtualEventVariant(state: $TSFixMe): $TSFixMe {
  return (
    state.experiments?.flexAddToGoogleCalendarExperimentVariant >=
    AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_VIRTUAL_VARIANT
  );
}

/**
 * @returns boolean true, when google calendar in person variant is ON for the account
 */
export function isFlexAddToGoogleCalendarInPersonEventVariant(state: $TSFixMe): $TSFixMe {
  return (
    state.experiments?.flexAddToGoogleCalendarExperimentVariant ===
    AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
  );
}

/**
 * @returns boolean true, when google calendar is enabled for that account
 */
export function isFlexAddToGoogleCalendarEnabledVariant(state: $TSFixMe): $TSFixMe {
  return (
    state.experiments?.flexAddToGoogleCalendarExperimentVariant >=
    AddToCalendarExperiment.GOOGLE_CALENDAR_FOR_INPERSON_VARIANT
  );
}

/**
 * @returns if sessionId is present in state, return google session calendar, else return google event calendar present
 * in state otherwise return undefined
 */
export function getGoogleCalendar(calendarState: $TSFixMe, entityId = CALENDAR_EVENT_ID): $TSFixMe {
  if (entityId !== CALENDAR_EVENT_ID) {
    return calendarState?.google?.[entityId];
  }
  return calendarState?.google?.[CALENDAR_EVENT_ID];
}

/**
 * @returns if sessionId is present in state, return google session calendar, else return outlook event calendar present
 * in state otherwise return undefined
 */
export function getOutlookCalendar(calendarState: $TSFixMe, entityId = CALENDAR_EVENT_ID): $TSFixMe {
  if (entityId !== CALENDAR_EVENT_ID) {
    return calendarState?.outlook?.[entityId];
  }
  return calendarState?.outlook?.[CALENDAR_EVENT_ID];
}

export function openCalendar(fileType: $TSFixMe, entityId: $TSFixMe, calendarProviders: $TSFixMe): $TSFixMe {
  if (fileType === CalendarType.GOOGLE) {
    return getGoogleCalendar(calendarProviders, entityId);
  } else if (fileType === CalendarType.OUTLOOK) {
    return getOutlookCalendar(calendarProviders, entityId);
  }
}
