import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { ServiceError } from '@cvent/event-ui-networking';

async function fetchOrThrow(request, errorMessage) {
  const response = await fetchAndRetryIfServerBusy(request);
  if (!response.ok) {
    throw await ServiceError.create(errorMessage, response, request);
  }
  if (response.status === 204) {
    return;
  }
  return await response.json();
}

/**
 * The client to fetch website related content (including archive page data) for the event.
 */
export default class WebsiteContentClient {
  baseUrl: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  constructor(baseUrl?: $TSFixMe, eventId?: $TSFixMe, environment?: $TSFixMe) {
    this.baseUrl = baseUrl;
    this.eventId = eventId;
    this.environment = environment;
  }
  _getRequestBuilder(urlPath = ''): $TSFixMe {
    const builder = new RequestBuilder({ url: `${this.baseUrl}${urlPath}` })
      .header(SESSION_HEADER_EVENT_ID, this.eventId)
      .withCookies();
    return this.environment ? builder.query('environment', this.environment) : builder;
  }

  /**
   * Retrieves the archived page data for the event.
   * @param eventId - eventId of the event we want to fetch archive page data for
   * @param version Indicates which version of the website to use when fetching the archived page data.
   */
  async getEventArchivePageData(eventId: $TSFixMe, version: $TSFixMe): Promise<$TSFixMe> {
    const requestBuilder = this._getRequestBuilder(`websiteContent/${eventId}/eventArchivePage`)
      .query('snapshotVersion', version)
      .get();
    const request = requestBuilder.build();
    return await fetchOrThrow(request, `Failed to fetch archived page data for eventId: ${String(eventId)}`);
  }
}
