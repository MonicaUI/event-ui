import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { ServiceError } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('EventGuestAttendeeClient');

/**
 * The client to manage a event guest attendee information.
 */
export default class EventGuestAttendeeClient {
  environment: $TSFixMe;
  eventGuestAttendeeBaseUrl;
  request;
  constructor(environment?: $TSFixMe) {
    this.eventGuestAttendeeBaseUrl = '/event-guestside-attendee/v1';
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.eventGuestAttendeeBaseUrl });
  }

  /**
   * Gets a list of invitees admin has registered using the adminId
   * which has been already authenticated through SSO
   */
  async getRegisteredInvitees(authToken: $TSFixMe, adminId: $TSFixMe, contactSnapshot: $TSFixMe): Promise<$TSFixMe> {
    LOG.debug('create Invitee');
    const request = this.request
      .url(`${this.eventGuestAttendeeBaseUrl}/admin/invitees`)
      .query('environment', this.environment)
      .query('adminId', adminId)
      .query('hasContactSnapshot', contactSnapshot)
      .auth(authToken)
      .get()
      .build();
    const response = await fetchAndRetryIfServerBusy(request);

    if (!response.ok) {
      const error = await ServiceError.create('getting all registered invitees failed', response, request);
      LOG.info('Error getting registered invitees', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  buildRequestForRegisteredInvitees(authToken: $TSFixMe, adminId: $TSFixMe, contactSnapshot: $TSFixMe): $TSFixMe {
    return this.request
      .url(this.eventGuestAttendeeBaseUrl + '/admin/invitees')
      .query('environment', this.environment)
      .query('adminId', adminId)
      .query('hasContactSnapshot', contactSnapshot)
      .auth(authToken)
      .get()
      .build();
  }
}
