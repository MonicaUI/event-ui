import Logger from '@cvent/nucleus-logging';
import { RequestBuilder } from '@cvent/nucleus-networking';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { ServiceError } from '@cvent/event-ui-networking';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';

const LOG = new Logger('LimitsClient');

export default class LimitsClient {
  limitsBaseUrl;
  environment;
  eventId;

  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
    this.limitsBaseUrl = `${baseURL}limits/${eventId}`;
    this.environment = environment;
    this.eventId = eventId;
  }

  /**
   * Get limits for the account
   */
  async getAccountLimits(): Promise<$TSFixMe> {
    const request = new RequestBuilder({ url: `${this.limitsBaseUrl}` })
      .withCookies()
      .header(SESSION_HEADER_EVENT_ID, this.eventId)
      .header('Content-Type', 'application/json')
      .query('environment', this.environment)
      .get()
      .build();

    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting account limits', response, request);
      LOG.error('Error getting account limits', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }
}
