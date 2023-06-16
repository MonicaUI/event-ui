/**
 * API client for communicating with the event snapshot service. We proxy this call through the guest side service
 * in order to filter out snapshot data we want to keep private to the system.
 */
import { logError } from 'nucleus-widgets/utils/ApiHelpers';
import {
  fetchAndRetryIfServerBusy,
  RequestBuilder,
  SESSION_HEADER_EVENT_ID,
  ServiceError
} from '@cvent/event-ui-networking';

import Logger from '@cvent/nucleus-logging';
const LOG = new Logger('EventSnapshotClient');

const addOptionalQueryParam = (requestBuilder, name, value) => {
  return value ? requestBuilder.query(name, value) : requestBuilder;
};

/**
 * The event snapshot service client.
 */
export default class EventSnapshotClient {
  baseUrl: string;
  environment: string;
  eventId: string;
  granularWebsiteLoading: boolean;
  isFlexBearerAuthRemovalOn: boolean;
  constructor(
    baseUrl?: string,
    eventId?: string,
    environment?: string,
    granularWebsiteLoading = false,
    isFlexBearerAuthRemovalOn = false
  ) {
    this.baseUrl = `${baseUrl}snapshot/`;
    this.eventId = eventId;
    this.environment = environment;
    this.granularWebsiteLoading = granularWebsiteLoading;
    this.isFlexBearerAuthRemovalOn = isFlexBearerAuthRemovalOn;
  }
  _getRequestBuilder(urlPath = ''): RequestBuilder {
    const builder = new RequestBuilder({ url: `${this.baseUrl}${urlPath}` })
      .header(SESSION_HEADER_EVENT_ID, this.eventId)
      .withCookies();
    return this.environment ? builder.query('environment', this.environment) : builder;
  }

  /**
   * Retrieves the account snapshot for the event.
   * @param eventId
   * @param options - Optional configuration when retrieving the account snapshot.
   * @param options.version Indicates which version of the event snapshot to use.
   *    If not specified, the latest will be used.
   */
  async getAccountSnapshot(eventId: string, options = {}): Promise<Record<string, unknown> | ServiceError> {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'version' does not exist on type '{}'.
    const { version, eventSnapshotVersion } = options;
    let requestBuilder = this._getRequestBuilder(`${eventId}/account`).get();
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', version);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'eventSnapshotVersion', eventSnapshotVersion);
    const request = requestBuilder.build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(`Account snapshot load failed eventId: ${String(eventId)}`, response, request);
    }
    const accountSnapshot = await response.json();
    return { ...accountSnapshot, version: response.headers.get('AccountSnapshotVersion') };
  }

  /**
   * Retrieves the event snapshot for the event.
   * @param eventId
   * @param options Optional configuration when retrieving the event snapshot.
   * @param options.version Indicates which version of the event snapshot to use.
   *    If not specified, the latest will be used.
   * @param options.registrationTypeId Used to filter the data specific for the chosen registration type.
   *    If not present, the default registration type will be used.
   */
  async getEventSnapshot(
    eventId: string,
    { version, registrationTypeId, registrationPathId, registrationPackId }: $TSFixMe = {}
  ): Promise<Record<string, unknown> | ServiceError> {
    let requestBuilder = this._getRequestBuilder(`${eventId}/event`).get();
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', version);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationTypeId', registrationTypeId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationPathId', registrationPathId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationPackId', registrationPackId);
    requestBuilder = requestBuilder.query('exclusions', [
      'RegistrationPages',
      'Sessions',
      ...(this.granularWebsiteLoading ? ['SiteEditor'] : [])
    ]);
    const request = requestBuilder.build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(`Event snapshot load failed eventId: ${String(eventId)}`, response, request);
    }
    const eventSnapshot = await response.json();
    return { ...eventSnapshot, version: response.headers.get('EventSnapshotVersion') };
  }

  /**
   * Checks if a snapshot version is still the latest version of the snapshot
   */
  isLatestSnapshotVersion(eventId: string, accountVersion: string, eventVersion: string): Promise<boolean> {
    const request = this._getRequestBuilder(`${eventId}/versions`).get().build();
    return fetchAndRetryIfServerBusy(request)
      .then(response => (response.ok ? response.json() : logError('isLatestSnapshotVersion', response)))
      .then(versions => {
        if (!versions.latestAccountSnapshotId || !versions.latestEventSnapshotId) {
          LOG.error('snapshot ids not in response', versions);
          return false;
        }
        return versions.latestAccountSnapshotId === accountVersion && versions.latestEventSnapshotId === eventVersion;
      });
  }

  /**
   * Retrieves the event travel snapshot for the event.
   * @param eventId
   * @param options Optional configuration when retrieving the event travel snapshot.
   * @returns {Promise.<{version}>}
   */
  async getEventTravelSnapshot(eventId: string, options: $TSFixMe): Promise<Record<string, unknown> | ServiceError> {
    const { version } = options;
    let requestBuilder = this._getRequestBuilder(`${eventId}/travel`).get().query('compactHotels', 'true');
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', version);
    const request = requestBuilder.build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(
        `Event Travel snapshot load failed eventId: ${String(eventId)}`,
        response,
        request
      );
    }
    const snapshot = await response.json();
    const travelSnapshotVersion = snapshot.version ? snapshot.version : response.headers.get('TravelSnapshotVersion');
    const travelSnapshot = snapshot.version ? snapshot.travelSnapshot : snapshot;
    return { travelSnapshot, travelSnapshotVersion };
  }

  async getEventTravelAirports(
    eventSnapshotVersion: string,
    travelSnapshotVersion: string
  ): Promise<Record<string, unknown> | ServiceError> {
    if (travelSnapshotVersion === '') {
      return { airports: [] };
    }

    let requestBuilder = this._getRequestBuilder(`${this.eventId}/airports`).get();
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', eventSnapshotVersion);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'travelSnapshotVersion', travelSnapshotVersion);
    const request = requestBuilder.build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(
        `Event Travel airports load failed; eventId: ${String(this.eventId)}`,
        response,
        request
      );
    }
    if (response.status === 204) {
      return { airports: [] };
    }
    return await response.json();
  }

  /**
   * Retrieves the visible products for the registrant.
   * @param options - Optional parameters when retrieving visible products.
   * @param options.version Indicates which version of the event snapshot to use.
   *    If not specified, the latest will be used.
   */
  async getVisibleProducts(accessToken: string, eventId: string, options = {}): Promise<string | ServiceError> {
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
    let requestBuilder = this._getRequestBuilder(`${eventId}/products`).get();
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', version);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'admissionId', admissionId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationTypeId', registrationTypeId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'primaryRegistrationTypeId', primaryRegistrationTypeId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'registrationPathId', registrationPathId);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'attendeeType', attendeeType);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'widgetType', widgetType);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'widgetId', widgetId);
    let request;
    if (this.isFlexBearerAuthRemovalOn) {
      request = requestBuilder.build();
    } else {
      request = requestBuilder.auth(accessToken).build();
    }
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(`Get visible products failed for eventId: ${String(eventId)}`, response, request);
    }
    return await response.json();
  }

  /**
   * Retrieves the visible products for the registrant by reg cart id
   * @param options - Optional parameters when retrieving visible products.
   * @param options.version Indicates which version of the event snapshot to use.
   *    If not specified, the latest will be used.
   */
  async getRegCartVisibleProducts(
    accessToken: string,
    eventId: string,
    options = {}
  ): Promise<Record<string, unknown> | ServiceError> {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'version' does not exist on type '{}'.
    const { version, regCartId } = options;
    let requestBuilder = this._getRequestBuilder(`${eventId}/modProducts`).get();
    requestBuilder = addOptionalQueryParam(requestBuilder, 'snapshotVersion', version);
    requestBuilder = addOptionalQueryParam(requestBuilder, 'regCartId', regCartId);
    let request;
    if (this.isFlexBearerAuthRemovalOn) {
      request = requestBuilder.build();
    } else {
      request = requestBuilder.auth(accessToken).build();
    }
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(
        `Get reg cart visible products failed for eventId: ${String(eventId)}`,
        response,
        request
      );
    }
    return await response.json();
  }
}
