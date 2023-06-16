import { RequestBuilder } from '@cvent/nucleus-networking';
import { fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { ServiceError } from '@cvent/event-ui-networking';
import { ATTENDEE_TYPE } from '../../../../pkgs/event-widgets/constants/Attendee';

/**
 * The calendar service client to download iCal and google calendar event and session links.
 */
export default class CalendarClient {
  baseUrl: string;
  environment: string;
  eventId: string;
  constructor(baseUrl: string, eventId: string, environment: string) {
    this.baseUrl = `${baseUrl}calendar/v1/`;
    this.eventId = eventId;
    this.environment = environment;
  }
  _getRequestBuilder(urlPath = ''): RequestBuilder {
    const builder = new RequestBuilder({ url: `${this.baseUrl}${urlPath}` }).withCookies();
    return this.environment ? builder.query('environment', this.environment) : builder;
  }

  /**
   * Gets the event calendar url for the given calendarType
   * @param calendarType the calendar type supported such as ical, google
   * @param inviteeId the invitee for which the calendar link is requested
   * @param encodedInviteeId encoded invitee for which the calendar link is requested
   * @param previewToken previewToken for which the calendar link is requested
   * @param testModeHash testModeHash for which the calendar link is requested
   * @param cultureCode culture of the event
   * @returns {Promise<*>}
   */
  async getEventCalendar(
    calendarType: string,
    inviteeId: string,
    encodedInviteeId: string,
    previewToken: string,
    testModeHash: string,
    cultureCode: string
  ): Promise<{
    calendarType: string;
    calendarUrl: string;
  }> {
    const request = this._getRequestBuilder(`calendars/${calendarType}/events/${this.eventId}`)
      .query('inviteeId', inviteeId)
      .query('i', encodedInviteeId)
      .query('previewToken', previewToken)
      .query('tm', testModeHash)
      .query('locale', cultureCode)
      .get()
      .build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('getEventCalendar failed', response, request);
      throw error;
    }
    return await response.json();
  }

  /**
   * Gets the session calendar url for the given calendarType
   * @param calendarType the calendar type supported such as ical, google
   * @param sessionId the session for which the calendar link is requested
   * @param inviteeId the invitee for which the calendar link is requested
   * @param encodedInviteeId encoded invitee for which the calendar link is requested
   * @param previewToken previewToken for which the calendar link is requested
   * @param testModeHash testModeHash for which the calendar link is requested
   * @param locale culture of the event
   * @returns {Promise<*>}
   */
  async getSessionCalendar(
    calendarType: string,
    sessionId: string,
    inviteeId: string,
    encodedInviteeId: string,
    previewToken: string,
    testModeHash: string,
    locale: string
  ): Promise<{
    calendarType: string;
    calendarUrl: string;
  }> {
    const request = this._getRequestBuilder(`calendars/${calendarType}/events/${this.eventId}/sessions/${sessionId}`)
      .query('inviteeId', inviteeId)
      .query('i', encodedInviteeId)
      .query('previewToken', previewToken)
      .query('tm', testModeHash)
      .query('locale', locale)
      .get()
      .build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('getSessionCalendar failed', response, request);
      throw error;
    }
    return await response.json();
  }

  /**
   * Redirects the user either to the VirtualDetails page for webcast details or VAH depending upon conditions.
   * @param sessionId sessionId to which redirection needs to be done.
   * @param attendeeId attendee requesting to redirect.
   * @param attendeeType type of attendee requesting to redirect.
   * @returns {Promise<*>}
   */
  async redirectToVirtualEvent(sessionId: string, attendeeId: string, attendeeType: string): Promise<void> {
    const attendeeQueryParam = this.isPrimaryInvitee(attendeeType) ? 'inviteeId' : 'g';
    const request =
      this.baseUrl +
      `calendars/events/${this.eventId}/virtualSessionLink?` +
      `${attendeeQueryParam}=${attendeeId}` +
      `&sessionId=${sessionId}`;
    window.open(request, '_blank');
  }

  isPrimaryInvitee(attendeeType: string): boolean {
    return attendeeType === ATTENDEE_TYPE.ATTENDEE || attendeeType === ATTENDEE_TYPE.GROUP_LEADER;
  }
}
