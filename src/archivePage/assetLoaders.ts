import '@cvent/event-ui-webpack/polyfill';

import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('event-guestside-site/src/archivePage/assetLoaders');

import { initializeLogging } from '../errorHandling/loggingAndErrors';

import LookupClient from 'event-widgets/clients/LookupClient';
import EventSnapshotClient from '../clients/EventSnapshotClient';
import WebsiteContentClient from '../clients/WebsiteContentClient';
import EventGuestClient from '../clients/EventGuestClient';

async function loadArchivedEventAssets(appSettings) {
  const eventId = appSettings.eventId;

  initializeLogging(appSettings, eventId);

  LOG.info(`Client Version ${(global as $TSFixMe).version}`);

  const baseUrl = `${appSettings.serviceBaseUrl}/v1/`;

  const clients = {
    eventSnapshotClient: new EventSnapshotClient(
      baseUrl,
      eventId,
      appSettings.environment,
      appSettings?.experiments?.granularSiteLoading
    ),
    lookupClient: new LookupClient(baseUrl, eventId, appSettings.environment),
    websiteContentClient: new WebsiteContentClient(baseUrl, eventId, appSettings.environment),
    eventGuestClient: new EventGuestClient(baseUrl, eventId, appSettings.environment)
  };

  const assetLoadingPromises = Promise.all([
    clients.eventSnapshotClient.getAccountSnapshot(eventId),
    clients.eventSnapshotClient.getEventSnapshot(eventId, {
      registrationTypeId: null,
      registrationPathId: null,
      registrationPackId: undefined
    }),
    clients.websiteContentClient.getEventArchivePageData(eventId, appSettings.eventSnapshotVersion),
    clients.lookupClient.getTimezone(appSettings.eventTimezoneId, appSettings.cultureCode),
    clients.eventGuestClient.getSiteEditorCore(eventId, appSettings.eventSnapshotVersion)
  ]);

  const [
    [accountSnapshot, eventSnapshot, eventArchivePageData, eventTimezoneResponse, siteEditor],
    { default: startAppRenderFn }
  ] = await Promise.all([assetLoadingPromises, import(/* webpackChunkName: "appRenderer" */ './main')]);

  void startAppRenderFn(appSettings, {
    assets: {
      accountSnapshot,
      eventSnapshot: {
        ...eventSnapshot,
        siteEditor
      },
      eventArchivePageData,
      eventTimezone: eventTimezoneResponse
    }
  });
}
(global as $TSFixMe).loadAssets = loadArchivedEventAssets;
