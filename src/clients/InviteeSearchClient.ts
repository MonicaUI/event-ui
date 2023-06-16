import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { ServiceError } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('InviteeSearchClient');

/**
 * The client to manage interaction with invitee search service
 */
export default class InviteeSearchClient {
  environment: $TSFixMe;
  inviteeSearchUrl;
  request;
  eventId;
  constructor(baseUrl: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
    this.inviteeSearchUrl = baseUrl + 'invitee_search/v1';
    this.eventId = eventId;
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.inviteeSearchUrl }).header(SESSION_HEADER_EVENT_ID, eventId);
  }

  /**
   * Update the invitee time zone preference
   */
  async updateInviteeTimeZonePreference(inviteeId: $TSFixMe, timeZonePreference: $TSFixMe): Promise<$TSFixMe> {
    LOG.debug('update Invitee time zone preference');
    const request = this.request
      .url(`${this.inviteeSearchUrl}/invitee/${inviteeId}/timezonePreference`)
      .query('environment', this.environment)
      .query('eventId', this.eventId)
      .put()
      .json({
        timeZonePreference
      })
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('update invitee time zone preference failed', response, request);
      LOG.info('Error during updating Invitee zone preference ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return response.status;
  }
}
