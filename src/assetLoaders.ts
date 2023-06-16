import '@cvent/event-ui-webpack/polyfill';

import EventSnapshotClient from './clients/EventSnapshotClient';
import LookupClient from 'event-widgets/clients/LookupClient';
import EventGuestClient from './clients/EventGuestClient';
import ProductVisibilityClient from './clients/ProductVisibilityClient';

import { getUserType } from './redux/defaultUserSession';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';

/**
 * Loads the travel snapshot from the backend.
 */
export const fetchTravelSnapshot = async (
  isTravelEnabledForEvent: boolean,
  eventId: string,
  eventSnapshotClient: EventSnapshotClient,
  travelSnapshotVersion: string
): Promise<$TSFixMe> => {
  if (isTravelEnabledForEvent) {
    return await eventSnapshotClient.getEventTravelSnapshot(eventId, { version: travelSnapshotVersion });
  }
};

export function buildClients(appSettings: $TSFixMe): $TSFixMe {
  const baseUrl = `${appSettings.serviceBaseUrl}/v1/`;
  const eventId = appSettings.eventContext.eventId;
  const eventSnapshotClient = new EventSnapshotClient(
    baseUrl,
    eventId,
    appSettings.environment,
    appSettings?.experiments?.granularSiteLoading,
    appSettings?.experiments?.flexBearerAuthRemoval
  );
  const productVisibilityClient = new ProductVisibilityClient(baseUrl, eventId, appSettings.environment);
  const clients = {
    eventSnapshotClient,
    lookupClient: new LookupClient(baseUrl, eventId, appSettings.environment),
    eventGuestClient: new EventGuestClient(baseUrl, eventId, appSettings.environment),
    productVisibilityClient: appSettings?.experiments?.useProductVisibilityService
      ? productVisibilityClient
      : eventSnapshotClient
  };
  return clients;
}
async function loadAssets(appSettings) {
  const baseUrl = `${appSettings.serviceBaseUrl}/v1/`;
  const initialDefaultRegTypeId = '00000000-0000-0000-0000-000000000000';
  const eventId = appSettings.eventContext.eventId;
  const userType = getUserType(appSettings.eventContext);
  const clients = buildClients(appSettings);

  const assetLoadingPromises = Promise.all([
    clients.eventSnapshotClient.getAccountSnapshot(eventId, {
      version: appSettings.accountSnapshotVersion,
      eventSnapshotVersion: appSettings.eventSnapshotVersion
    }),
    clients.eventSnapshotClient.getEventSnapshot(eventId, {
      version: appSettings.eventSnapshotVersion,
      registrationTypeId: initialDefaultRegTypeId,
      registrationPathId: null,
      registrationPackId: undefined
    }),
    fetchTravelSnapshot(
      appSettings.isTravelEnabled,
      eventId,
      clients.eventSnapshotClient,
      appSettings.travelSnapshotVersion
    ),
    clients.lookupClient.getTimezone(appSettings.eventTimezoneId, [appSettings.cultureCode]),
    clients.lookupClient.getCurrencies(appSettings.cultureCode),
    clients.eventSnapshotClient.getEventTravelAirports(
      appSettings.eventSnapshotVersion,
      appSettings.travelSnapshotVersion
    ),
    clients.eventGuestClient.getSiteEditorCore(eventId, appSettings.eventSnapshotVersion)
  ]);

  const startLogging = import(/* webpackChunkName: "logger" */ './errorHandling/loggingAndErrors').then(
    ({ initializeLogging }) => initializeLogging(appSettings, eventId)
  );

  const { default: RegCartClient } = await import(/* webpackChunkName: "regCartClient" */ './clients/RegCartClient');
  const { default: CapacityClient } = await import(
    /* webpackChunkName: "capacityClient" */ 'event-widgets/clients/CapacityClient'
  );
  clients.regCartClient = new RegCartClient(baseUrl, eventId, appSettings.environment, userType);
  clients.capacityClient = new CapacityClient(baseUrl, eventId, appSettings.environment);
  const mainPromise = import(/* webpackChunkName: "appRenderer" */ './main');

  const [
    [
      accountSnapshot,
      eventSnapshot,
      travelSnapshot,
      eventTimezoneResponse,
      currencyResponse,
      airportsResponse,
      siteEditor
    ],
    { default: startAppRenderFn }
  ] = await Promise.all([assetLoadingPromises, mainPromise, startLogging]);

  let capacity = [];
  const { attendingFormat = AttendingFormat.INPERSON } = eventSnapshot;

  if (AttendingFormat.HYBRID !== attendingFormat) {
    const getTheCapacities = import(/* webpackChunkName: "capacityFetcher" */ './redux/capacity').then(
      ({ fetchCapacitySummaries }) =>
        fetchCapacitySummaries(
          clients.regCartClient,
          clients.capacityClient,
          appSettings.accessToken,
          appSettings.eventContext.regCartId,
          appSettings.capacityIds,
          false
        )
    );

    capacity = await Promise.resolve(getTheCapacities);
  }

  void startAppRenderFn(appSettings, {
    clients,
    assets: {
      accountSnapshot,
      eventSnapshot: {
        ...eventSnapshot,
        siteEditor
      },
      travelSnapshot,
      eventTimezone: eventTimezoneResponse,
      currencies: currencyResponse.currencies,
      capacity,
      airports: airportsResponse.airports
    }
  });
}
(global as $TSFixMe).loadAssets = loadAssets;
