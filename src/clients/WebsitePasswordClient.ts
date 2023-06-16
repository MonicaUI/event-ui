import { RequestBuilder } from '@cvent/nucleus-networking';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';

/**
 * The website password service client.
 */
export default class WebsitePasswordClient {
  baseUrl: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  constructor(baseUrl: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
    this.baseUrl = `${baseUrl}/v1/websitePassword/`;
    this.eventId = eventId;
    this.environment = environment;
  }
  _getRequestBuilder(urlPath = ''): $TSFixMe {
    const builder = new RequestBuilder({ url: `${this.baseUrl}${urlPath}` }).header(
      SESSION_HEADER_EVENT_ID,
      this.eventId
    );
    return this.environment ? builder.query('environment', this.environment) : builder;
  }

  /**
   * Verifies the password for the event
   * @param eventId
   * @param password - The password entered by the user to gain access for the website
   */
  async verifyPassword(eventId: $TSFixMe, password: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(`${eventId}`).post().json({ password }).build();
    const response = await fetchAndRetryIfServerBusy(request);
    return response;
  }
}
