import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';

/**
 * The client to post CCPA compliance request.
 */
export default class CcpaComplianceClient {
  baseUrl: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  constructor(baseUrl: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
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
   * Post CCPA compliance request.
   * @param eventId - eventId of the event for which ccpa opt out request is made
   * @param ccpaComplianceRequests List of requests for which opt out request needs to be made
   */
  async makeCcpaComplianceRequest(ccpaComplianceRequests: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder('compliance/ccpa')
      .query('eventId', this.eventId)
      .post()
      .json(ccpaComplianceRequests)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    return { isSuccessful: response.status === 204 };
  }
}
