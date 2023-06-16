import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { ServiceError } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('ExternalAuthClient');

/**
 * The client to manage a external authentication for the attendee.
 */
export default class ExternalAuthClient {
  environment: string;
  externalAuthBaseUrl;
  request;
  eventId;
  constructor(baseUrl: string, eventId: string, environment: string) {
    this.externalAuthBaseUrl = baseUrl + 'event-external-authentication/v1';
    this.eventId = eventId;
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.externalAuthBaseUrl }).header(SESSION_HEADER_EVENT_ID, eventId);
  }

  /**
   * Creates an invitee using the contactId which has been already authenticated through SSO
   */
  async createInvitee(contactStub: string, regPathId: string): Promise<$TSFixMe> {
    LOG.debug('create Invitee');
    const request = this.request
      .url(`${this.externalAuthBaseUrl}/${this.eventId}/invitee`)
      .query('environment', this.environment)
      .query('rp', regPathId)
      .post()
      .json(contactStub)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);

    if (!response.ok) {
      const error = await ServiceError.create('invitee creation failed', response, request);
      LOG.info('Error during creating Invitee ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Updates contact information of existing contact using the contactId
   * which has been already authenticated through SSO
   */
  async updateContact(contactStub: string): Promise<void> {
    LOG.debug('update contact');
    const request = this.request
      .url(`${this.externalAuthBaseUrl}/${this.eventId}/contact`)
      .query('environment', this.environment)
      .put()
      .json(contactStub)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('contact updation failed', response, request);
      LOG.info('Error during contact update ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return;
  }
}
