import { setAddToCalendarProviders, setCalendarUrl } from './reducer';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('addToCalendar');

/**
 * Existing code which is getting uri from oslo-lookups service and doing all business stuff on presentation layer
 * @returns {function(*, *): Promise<void>}
 */
export const loadAddToCalendarProviders =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { lookupClient },
      calendarProviders
    } = getState();
    if (!(calendarProviders && Object.keys(calendarProviders).length > 0)) {
      const addToCalendarProvidersResponse = await lookupClient.getCalendarProviders();
      dispatch(setAddToCalendarProviders(addToCalendarProvidersResponse?.calendarProviders));
    }
  };

/**
 * New code which is getting event calendar uri from new calendar service and doing all business stuff on back-end
 * The new url will be saved in redux state so as to prevent further service calls
 */
export const loadEventCalendarUrl =
  (
    calendarType: string,
    inviteeId?: string,
    encodedInviteeId?: string,
    previewToken?: string,
    testModeHash?: string,
    cultureCode?: string
  ) =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const {
        clients: { calendarClient }
      } = getState();
      const eventCalendarResponse = await calendarClient.getEventCalendar(
        calendarType,
        inviteeId,
        encodedInviteeId,
        previewToken,
        testModeHash,
        cultureCode
      );
      const { calendarUrl } = eventCalendarResponse;
      await dispatch(setCalendarUrl(calendarType, calendarUrl));
    } catch (error) {
      LOG.error(`Error getting event calendar for calendarType:${calendarType}`, error);
    }
  };

/**
 * New code which is getting session calendar uri from new calendar service and doing all business stuff on back-end
 * The new url will be saved in redux state so as to prevent further service calls
 */
export const loadSessionCalendarUrl =
  (
    calendarType: string,
    sessionId: string,
    inviteeId?: string,
    encodedInviteeId?: string,
    previewToken?: string,
    testModeHash?: string,
    cultureCode?: string
  ) =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const {
        clients: { calendarClient }
      } = getState();
      const sessionCalendarResponse = await calendarClient.getSessionCalendar(
        calendarType,
        sessionId,
        inviteeId,
        encodedInviteeId,
        previewToken,
        testModeHash,
        cultureCode
      );
      const { calendarUrl } = sessionCalendarResponse;
      await dispatch(setCalendarUrl(calendarType, calendarUrl, sessionId));
    } catch (error) {
      LOG.error(`Error getting session calendar for calendarType:${calendarType} and sessionId:${sessionId}`, error);
    }
  };
