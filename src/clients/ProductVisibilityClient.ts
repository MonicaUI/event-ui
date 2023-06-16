import {
  fetchAndRetryIfServerBusy,
  RequestBuilder,
  SESSION_HEADER_EVENT_ID,
  ServiceError
} from '@cvent/event-ui-networking';
import { logoutRegistrant } from '../redux/registrantLogin/actions';
import { redirectToPage } from '../redux/pathInfo';

const addOptionalQueryParam = (requestBuilder, name, value) => {
  return value ? requestBuilder.query(name, value) : requestBuilder;
};

export default class ProductVisibilityClient {
  baseUrl: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  constructor(baseUrl: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
    this.baseUrl = `${baseUrl}product-visibility/`;
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
   * Retrieves the visible products for the registrant.
   * @param options - Optional parameters when retrieving visible products.
   * @param options.version Indicates which version of the event snapshot to use.
   *    If not specified, the latest will be used.
   */
  async getVisibleProducts(accessToken: $TSFixMe, eventId: $TSFixMe, options = {}): Promise<$TSFixMe> {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'version' does not exist on type '{}'.
      version,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'admissionId' does not exist on type '{}'... Remove this comment to see the full error message
      admissionId,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'registrationTypeId' does not exist on ty... Remove this comment to see the full error message
      registrationTypeId,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'primaryRegistrationTypeId' does not exis... Remove this comment to see the full error message
      primaryRegistrationTypeId,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'registrationPathId' does not exist on ty... Remove this comment to see the full error message
      registrationPathId,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'attendeeType' does not exist on type '{}... Remove this comment to see the full error message
      attendeeType,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'widgetType' does not exist on type '{}'.
      widgetType,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'widgetId' does not exist on type '{}'.
      widgetId
    } = options;
    let requestBuilder = this._getRequestBuilder(`v1/event/${eventId}/products`).get();
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', version);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'admissionId', admissionId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationTypeId', registrationTypeId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'primaryRegistrationTypeId', primaryRegistrationTypeId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationPathId', registrationPathId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'attendeeType', attendeeType);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'widgetType', widgetType);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'widgetId', widgetId);
    const request = requestBuilder.auth(accessToken).build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (response.status === 401) {
      // assume we've timed out
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await logoutRegistrant();
      redirectToPage('');
    } else if (!response.ok) {
      throw await ServiceError.create(`Get visible products failed for eventId: ${String(eventId)}`, response, request);
    }
    return await response.json();
  }
}
