import React from 'react';
import { render } from 'react-dom';

import Logger from '@cvent/nucleus-logging';
const LOG = new Logger('event-guestside-site/src/main');

import { loadCustomFonts } from 'nucleus-widgets/redux/modules/customFonts';
import locales from '../appInitialization/locales';
import Title from '../appInitialization/Title';
import { loadIntlWithLocale } from 'nucleus-text/intlLoaders/index';
import getMatchingLocale from 'nucleus-text/util/getMatchingLocale';
import { setCurrencyCode, setLocale } from 'nucleus-guestside-site/src/redux/modules/text';
import { createApp } from './App';
import {
  createLoadAccountSnapshotAction,
  createLoadEventSnapshotAction,
  loadLanguageManagementSettings
} from '../redux/actions';
import { transformAndLoadEventArchivedPageData } from './actions';
import reducer from './reducer';
import { loadLanguage } from '../redux/multiLanguage/actions';
import {
  eventSingleLanguageDefaultNotAccountDefault,
  registerTranslationsFromSnapshot,
  eventHasMultipleLanguages,
  findMatchingLocaleFromAvailableLocales
} from 'event-widgets/utils/multiLanguageUtils';
import querystring from 'querystring';

import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { loadEventTimezoneIntoStore } from '../redux/timezones';

// Get the event widget factory.
import WidgetFactory from '../widgetFactory';
import EventEmailClient from '../clients/EventEmailClient';
import WebsitePasswordClient from '../clients/WebsitePasswordClient';
import LookupClient from 'event-widgets/clients/LookupClient';
import TranslationSnapshotClient from 'event-widgets/clients/TranslationSnapshotClient';
import UserTextClient from 'event-widgets/clients/UserTextClient';
import resolveDatatagsForCodeSnippets from '../utils/datatagUtils';
import DataTagsResolutionClient from '../clients/DataTagsResolutionClient';
import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';

async function startArchivedEventAppRender(appSettings: $TSFixMe, preloadedData: $TSFixMe): Promise<$TSFixMe> {
  render(<div />, document.getElementById('react-mount'));
  // using require instead of import for conditional compilation;
  let createStoreWithMiddleware;
  const baseUrl = `${appSettings.serviceBaseUrl}/v1/`;
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    createStoreWithMiddleware = require('nucleus-guestside-site/src/redux/prodCreateStoreWithMiddleware').default;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    createStoreWithMiddleware = require('nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware').default;
  }
  const store = createStoreWithMiddleware(reducer, {
    account: { name: appSettings.accountName },
    environment: appSettings.environment,
    userSession: {
      verifiedWebsitePassword: appSettings.verifiedWebsitePassword
    },
    defaultUserSession: { eventId: appSettings.eventId },
    widgetFactory: new WidgetFactory(),
    clients: {
      eventEmailClient: new EventEmailClient(baseUrl, appSettings.eventId, appSettings.environment),
      websitePasswordClient: new WebsitePasswordClient(
        appSettings.serviceBaseUrl,
        appSettings.eventId,
        appSettings.environment
      ),
      lookupClient: new LookupClient(baseUrl, appSettings.eventId, appSettings.environment),
      translationSnapshotClient: new TranslationSnapshotClient(
        baseUrl,
        appSettings.eventId,
        appSettings.environment,
        null,
        true,
        false
      ),
      userTextClient: new UserTextClient(baseUrl, appSettings.eventId, appSettings.environment),
      dataTagsResolutionClient: new DataTagsResolutionClient(
        baseUrl,
        appSettings.eventId,
        appSettings.environment,
        getFullLanguageFromDefaultMapping(appSettings.cultureCode),
        appSettings.eventContext.isPreview
      )
    },
    multiLanguageLocale: {
      loadedLanguages: [],
      locale: appSettings.cultureCode
    },
    experiments: appSettings.experiments
  });
  store.dispatch(createLoadAccountSnapshotAction(preloadedData.assets.accountSnapshot));
  store.dispatch(await createLoadEventSnapshotAction(preloadedData.assets.eventSnapshot, store.getState().account));
  store.dispatch(transformAndLoadEventArchivedPageData(preloadedData.assets.eventArchivePageData));

  const {
    text,
    event,
    account: {
      customFonts = [],
      settings: { defaultCultureCode }
    },
    clients: { translationSnapshotClient }
  } = store.getState();
  store.dispatch(setLocale(appSettings.cultureCode));
  store.dispatch(
    loadEventTimezoneIntoStore(
      appSettings.eventTimezoneId,
      preloadedData.assets.eventTimezone.timeZones,
      preloadedData.assets.eventTimezone.translations
    )
  );
  const activeCustomFonts = customFonts.filter(font => font.isActive);
  if (activeCustomFonts.length > 0) {
    store.dispatch(loadCustomFonts(activeCustomFonts));
  }
  // Register Translations
  const translationsPromise = new Promise(getMatchingLocale(event.cultureCode, locales));
  await new Promise(resolve => loadIntlWithLocale(event.cultureCode, resolve));
  text.resolver.registerTranslations(await translationsPromise, 'default', event.cultureCode);
  store.dispatch(setCurrencyCode(event.eventCurrencySnapshot.isoAlphabeticCode));
  store.dispatch(loadLanguageManagementSettings());

  const queryParams = querystring.parse(window.location.search.slice(1));
  const promises = [];
  /**
   * PROD-107243 - In case of a multi-language event, we should initially have the translations of
   * default event language also so that the custom event level translations of some fields (if made by planner)
   * in other languages could be overwritten over them, when invitee arrives on the registration page
   * through invitation email
   */
  promises.push(store.dispatch(loadLanguage(event.cultureCode)));
  if (queryParams.locale && eventHasMultipleLanguages(event)) {
    promises.push(store.dispatch(loadLanguage(findMatchingLocaleFromAvailableLocales(queryParams.locale, event))));
  }
  if (eventSingleLanguageDefaultNotAccountDefault(store.getState().event, store.getState().account)) {
    promises.push(
      store.dispatch(
        registerTranslationsFromSnapshot(
          text.resolver,
          translationSnapshotClient,
          event.cultureCode,
          defaultCultureCode,
          event.cultureCode
        )
      )
    );
  }
  await Promise.all(promises);

  const App = createApp(appSettings.assetRoot || '/');

  render(
    <Provider store={store}>
      <div>
        <Title />
        <App />
        <DialogContainer
          spinnerMessage="EventGuestSide_SharedLoadingProgressWidget_SpinnerLoadingText__resx"
          message="EventGuestSide_SharedLoadingProgressWidget_MessageText__resx"
        />
      </div>
    </Provider>,
    document.getElementById('react-mount')
  );

  // remove devtools if browser plugin https://github.com/zalmoxisus/redux-devtools-extension present.
  if (process.env.NODE_ENV !== 'production') {
    if ((window as $TSFixMe).devToolsExtension) {
      LOG.info('using browser extension redux dev tools instead of normal redux dev tools');
    } else {
      const target = document.getElementById('react-mount');
      const devTarget = document.createElement('div');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const DevTools = require('nucleus-guestside-site/src/redux/DevTools').default;
      const devToolsElement = (
        <Provider store={store}>
          <DevTools />
        </Provider>
      );
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (target && target.parentNode) {
        target.parentNode.insertBefore(devTarget, target.nextSibling);
      } else {
        LOG.error('failed to insert devtools into DOM');
      }
      render(devToolsElement, devTarget);
    }
  }

  await store.dispatch(resolveDatatagsForCodeSnippets());
  runTriggerHandlers(appSettings.eventContext);
}

function runTriggerHandlers(eventContext) {
  const isPlanner = eventContext.isPlanner;
  const isPreview = eventContext.isPreview;
  const isTestMode = eventContext.isTestMode;
  if (isTestMode || (!isPlanner && !isPreview)) {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (window.CVENT && window.CVENT.runTriggerHandlers) {
      window.CVENT.runTriggerHandlers('AllPages');
    }
  }
}

export default startArchivedEventAppRender;
