import path from 'path';
import querystring from 'querystring';

import Logger from '@cvent/nucleus-logging';
const LOG = new Logger('event-guestside-site/src/main');

import loadCookieConsent from './appInitialization/loadCookieConsent';
import history from './myHistory';
import { createRouteHandlers } from './appInitialization/routeHandlers';
import { loadCustomFonts } from 'nucleus-widgets/redux/modules/customFonts';
import { setCurrencyCode, setLocale } from 'nucleus-guestside-site/src/redux/modules/text';
import { withRoutes } from './appInitialization/routeHandlerComponent';
import { createApp } from './App';
import { eventSnapshotVersionVar, loadLandingPageContent, loadLanguageManagementSettings } from './redux/actions';
import { loadEventTimezoneIntoStore } from './redux/timezones';
import { initializeNetworkErrorDialog } from './errorHandling/NetworkErrorDialog';
import { loadLanguage } from './redux/multiLanguage/actions';
import detectBrowserFeatures from 'nucleus-widgets/utils/browserFeatureDetection';
import { initializePendoAnalytics } from './redux/analytics';

import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';
import Title from './appInitialization/Title';
import { Route, Redirect, Switch, Router } from 'react-router-dom';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';

// Get the event widget factory.
import WidgetFactory from './widgetFactory';
import TransparentWrapper from './dialogs/TransparentWrapper';

import { initializeFetchWithSessionTimeout } from './dialogs/SessionTimedOutDialog';
import configureStore from './redux/configureStore';
import SubstitutionCartClient from './clients/SubstitutionCartClient';
import TravelApiClient from './clients/TravelApiClient';
import EventEmailClient from './clients/EventEmailClient';
import PasskeyClient from './clients/PasskeyClient';
import FlexFileClient from './clients/FlexFileClient';
import DataTagsResolutionClient from './clients/DataTagsResolutionClient';
import ExternalAuthClient from './clients/ExternalAuthClient';
import InviteeSearchClient from './clients/InviteeSearchClient';
import WebsitePasswordClient from './clients/WebsitePasswordClient';
import CreditCardClient from './clients/CreditCardClient';
import EventPersonaClient from './clients/EventPersonaClient';
import AttendeeListClient from 'event-widgets/clients/AttendeeListClient';
import AppointmentsClient from 'event-widgets/clients/AppointmentsClient';
import CcpaComplianceClient from './clients/CcpaComplianceClient';
import AttendeeLoginClient from './clients/AttendeeLoginClient';
import LimitsClient from './clients/LimitsClient';
import ProductVisibilityClient from './clients/ProductVisibilityClient';
import locales from './appInitialization/locales';
import { loadIntlWithLocale } from 'nucleus-text/intlLoaders/index';
import getMatchingLocale from 'nucleus-text/util/getMatchingLocale';
import { createLoadAccountSnapshotAction, createLoadEventSnapshotAction } from './redux/actions';
import { loadTravelSnapshotDataIntoStore } from 'event-widgets/redux/modules/eventTravel';
import { loginRegistrantOnInitialLoad } from './redux/registrantLogin/actions';
import { setSelectedTimeZone } from './redux/timeZoneSelection';
import { setCurrencies } from './redux/currencies';
import { loadCapacityCounts } from 'event-widgets/redux/modules/capacity';
import { setAirports } from './redux/airports';
import EventFeeClient from 'event-widgets/clients/EventFeeClient';
import UserTextClient from 'event-widgets/clients/UserTextClient';
import AttendeeOrderClient from './clients/AttendeeOrderClient';
import { styleString } from '@cvent/carina-rich-text-renderer';
import TranslationSnapshotClient from 'event-widgets/clients/TranslationSnapshotClient';
import { getUserType } from './redux/defaultUserSession';
import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';
import {
  eventSingleLanguageDefaultNotAccountDefault,
  registerTranslationsFromSnapshot
} from 'event-widgets/utils/multiLanguageUtils';
import UniversalWebcastClient from '../../../pkgs/event-widgets/clients/UniversalWebcastClient';
import CalendarClient from './clients/CalendarClient';
import { convertEventTimezoneTranslations } from 'event-widgets/redux/selectors/timezone';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { SESSION_HEADER_EVENT_ID, SESSION_HEADER_USER_TYPE } from '@cvent/event-ui-networking';
import apolloCache from './apollo/apolloCache';
import { createLink } from './apollo/apolloLinkFetchRequest';
import {
  eventHasMultipleLanguages,
  findMatchingLocaleFromAvailableLocales
} from 'event-widgets/utils/multiLanguageUtils';
import { loadImageLookup } from 'nucleus-widgets/redux/modules/imageLookup';
import { invalidateDatatagCache } from './utils/datatagUtils';
import { getPersistRegType } from './utils/queryUtils';
import safeHtmlDecode from 'nucleus-widgets/utils/safeHtmlDecode';
import EventGuestAttendeeClient from './clients/EventGuestAttendeeClient';
import { isEmbeddedRegistrationWorkflow } from './redux/pathInfo';
import 'focus-visible';

/*
 * testSettings allows settings to be changed in services by passing in query params.
 * For example, we can set the dequeueTimeout by passing a parameter
 */
function getTestSettings(queryParams) {
  return {
    registrationCheckoutTimeout: queryParams.registrationCheckoutTimeout
  };
}

// Register Translations
async function registerTranslations(textResolverFn, cultureCode) {
  const translationsPromise = new Promise(getMatchingLocale(cultureCode, locales));
  await new Promise(resolve => loadIntlWithLocale(cultureCode, resolve));
  textResolverFn.registerTranslations(await translationsPromise, 'default', cultureCode);
}

/** get the a web browser's current language */
const getDeviceLocale = () =>
  navigator.language ||
  (navigator as $TSFixMe).browserLanguage || // deprecated, but here for older browsers
  (navigator.languages || [])[0];

// eslint-disable-next-line complexity
async function startAppRender(appSettings: $TSFixMe, preloadedData: $TSFixMe): Promise<$TSFixMe> {
  render(<div />, document.getElementById('react-mount'));

  const viewRoot =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (window && window.location && window.location.pathname && '/' + window.location.pathname.split('/')[1]) ||
    appSettings.viewRoot;
  const queryParams = querystring.parse(window.location.search.slice(1));
  const persistRegType = getPersistRegType(queryParams);
  const testSettings = appSettings.eventContext.allowDevMode ? getTestSettings(queryParams) : {};
  const eventId = appSettings.eventContext.eventId;
  const plannerRegViewRoot = appSettings.viewRoot;
  const normalRegViewRoot = path.join(viewRoot, eventId);
  const rootPath = appSettings.eventContext.isPlanner ? plannerRegViewRoot : normalRegViewRoot;
  const baseUrl = `${appSettings.serviceBaseUrl}/v1/`;
  const analyticsUrl = appSettings.analyticsUrl;
  const analyticsUrlPath = appSettings.analyticsUrlPath;
  let eventLaunchWizardSettings = appSettings.eventLaunchWizardSettings;
  let webPaymentsSettings = appSettings.webPaymentsSettings;
  const httpReferrer = document.referrer;
  const isEmbeddedRegistration = isEmbeddedRegistrationWorkflow(appSettings?.viewRoot);

  // if request is for embedded registration, but the experiment is not enabled, redirect to error page
  if (isEmbeddedRegistration && !appSettings.experiments?.isFlexEmbeddedRegistrationEnabled) {
    throw new Error('Request to embedded registration not allowed');
  }

  if (!eventLaunchWizardSettings) {
    eventLaunchWizardSettings = {};
  } else {
    eventLaunchWizardSettings = JSON.parse(eventLaunchWizardSettings);
  }

  if (!webPaymentsSettings) {
    webPaymentsSettings = {};
  } else {
    webPaymentsSettings = JSON.parse(webPaymentsSettings);
  }

  const {
    isMerchantCPS = false,
    showBankAccount = false,
    merchantAccountId = null,
    openLaunchWizard = false,
    remittanceType = '',
    isSalesForceIdPresent = false
  } = eventLaunchWizardSettings;

  const {
    webPaymentsApplicationId = '',
    webPaymentsEndpoint = '',
    webPaymentsPermanentApplicationId = ''
  } = webPaymentsSettings;
  const userType = getUserType(appSettings.eventContext);

  const thunkContext = {};
  const store = configureStore(
    {
      account: { name: appSettings.accountName },
      accessToken: appSettings.accessToken,
      environment: appSettings.environment,
      testSettings,
      clients: {
        eventEmailClient: new EventEmailClient(baseUrl, eventId, appSettings.environment),
        lookupClient: preloadedData.clients.lookupClient,
        capacityClient: preloadedData.clients.capacityClient,
        regCartClient: preloadedData.clients.regCartClient,
        eventSnapshotClient: preloadedData.clients.eventSnapshotClient,
        productVisibilityClient: appSettings?.experiments?.useProductVisibilityService
          ? new ProductVisibilityClient(baseUrl, eventId, appSettings.environment)
          : preloadedData.clients.eventSnapshotClient,
        substitutionCartClient: new SubstitutionCartClient(baseUrl, eventId, appSettings.environment, userType),
        eventGuestClient: preloadedData.clients.eventGuestClient,
        externalAuthClient: new ExternalAuthClient(baseUrl, eventId, appSettings.environment),
        inviteeSearchClient: new InviteeSearchClient(baseUrl, eventId, appSettings.environment),
        travelApiClient: new TravelApiClient(
          baseUrl,
          eventId,
          appSettings.environment,
          userType,
          appSettings.createdBy
        ),
        eventPersonaClient: new EventPersonaClient(baseUrl, eventId, appSettings.environment, userType),
        flexFileClient: new FlexFileClient(baseUrl, eventId, appSettings.environment),
        DataTagsResolutionClient: new DataTagsResolutionClient(
          baseUrl,
          eventId,
          appSettings.environment,
          getFullLanguageFromDefaultMapping(appSettings.cultureCode),
          appSettings.eventContext.isPreview
        ),
        creditCardClient: new CreditCardClient(baseUrl, eventId, appSettings.environment, userType),
        passkeyClient: new PasskeyClient(baseUrl, eventId, appSettings.environment, userType),
        websitePasswordClient: new WebsitePasswordClient(appSettings.serviceBaseUrl, eventId, appSettings.environment),
        attendeeOrderClient: new AttendeeOrderClient(
          baseUrl,
          eventId,
          appSettings.environment,
          appSettings.accessToken
        ),
        attendeeListClient: new AttendeeListClient(
          baseUrl,
          eventId,
          appSettings.environment,
          null,
          appSettings.eventSnapshotVersion,
          preloadedData.assets.accountSnapshot.version
        ),
        appointmentsClient: new AppointmentsClient(baseUrl, eventId, appSettings.environment),
        eventFeeClient: new EventFeeClient(baseUrl, eventId, appSettings.environment),
        userTextClient: new UserTextClient(baseUrl, eventId, appSettings.environment, appSettings.accessToken),
        ccpaComplianceClient: new CcpaComplianceClient(baseUrl, eventId, appSettings.environment),
        attendeeLoginClient: new AttendeeLoginClient(baseUrl, eventId, appSettings.environment, userType),
        limitsClient: new LimitsClient(baseUrl, eventId, appSettings.environment),
        translationSnapshotClient: new TranslationSnapshotClient(
          baseUrl,
          eventId,
          appSettings.environment,
          null,
          true,
          false
        ),
        universalWebcastClient: new UniversalWebcastClient(
          baseUrl,
          eventId,
          appSettings.environment,
          appSettings.accessToken
        ),
        calendarClient: new CalendarClient(baseUrl, eventId, appSettings.environment),
        eventGuestsideAttendeeClient: new EventGuestAttendeeClient(appSettings.environment)
      },
      googleMap: {
        apiKey: appSettings.googleApiKey
      },
      appleMap: {
        token: appSettings.appleMapToken
      },
      pathInfo: {
        rootPath,
        eventId: appSettings.eventContext.eventId,
        pageId: '',
        navigationDialogConfig: { isOpen: false },
        baseUrl
      },
      defaultUserSession: {
        defaultRegPackId: appSettings.eventContext.registrationPackId,
        eventBuildWizardExitUrl: queryParams.eventBuildWizardExit || '',
        eventId: appSettings.eventContext.eventId,
        freeTrialPurchaseCta: appSettings.eventContext.freeTrialPurchaseCta || '',
        httpReferrer: httpReferrer || '',
        isFreeTrial: appSettings.eventContext.isFreeTrial || false,
        isPreview: appSettings.eventContext.isPreview,
        isPlanner: appSettings.eventContext.isPlanner,
        isTestMode: appSettings.eventContext.isTestMode,
        licenseTypeId: appSettings.eventContext.licenseTypeId || 1,
        showEventBuildWizardBanner: appSettings.eventContext.showEventBuildWizardBanner || false
      },
      userSession: {
        inviteeId: appSettings.eventContext.inviteeId,
        firstName: unescape(safeHtmlDecode(appSettings.eventContext.firstName)),
        lastName: unescape(safeHtmlDecode(appSettings.eventContext.lastName)),
        inviteeStatus: appSettings.eventContext.inviteeStatus,
        contactId: appSettings.eventContext.contactId,
        isAbandonedReg: appSettings.eventContext.abandonedReg,
        defaultRegPathId: appSettings.eventContext.registrationPathId,
        regCartId: appSettings.eventContext.regCartId,
        referenceId: appSettings.eventContext.referenceId,
        confirmationNumber: appSettings.eventContext.confirmationNumber,
        authenticatedContact: appSettings.eventContext.authenticatedContact,
        isSsoAdmin: appSettings.eventContext.ssoAdminFlag,
        verifiedAttendee: appSettings.eventContext.verifiedAttendee,
        verifiedWebsitePassword: appSettings.eventContext.verifiedWebsitePassword,
        emailAddress: appSettings.eventContext.emailAddress,
        isPlannerRegMod: queryParams.plannerRegMod === 'true',
        abortRegistrationSecondsDelay: appSettings.eventContext.abortRegistrationSecondsDelay || 0,
        eventCode: appSettings.eventContext.eventCode,
        hasRegisteredInvitees: appSettings.eventContext.hasRegisteredInvitees,
        regTypeId: appSettings.eventContext.registrationTypeId,
        persistRegType
      },
      plannerRegSettings: appSettings.plannerRegSettings,
      eventLaunchWizardSettings: {
        isMerchantCPS,
        showBankAccount,
        merchantAccountId,
        openLaunchWizard,
        remittanceType,
        isSalesForceIdPresent
      },
      postRegistrationPaymentData: {
        isCheckingOut: false
      },
      webPaymentsSettings: {
        webPaymentsDefaultApplicationId: webPaymentsApplicationId,
        webPaymentsEndpoint,
        webPaymentsPermanentApplicationId
      },
      partialPaymentSettings: {},
      accountSnapshotVersion: appSettings.accountSnapshotVersion,
      eventSnapshotVersion: appSettings.eventSnapshotVersion,
      travelSnapshotVersion: appSettings.travelSnapshotVersion,
      widgetFactory: new WidgetFactory(appSettings.experiments),
      attendeeList: {},
      websitePassword: {},
      multiLanguageLocale: {
        loadedLanguages: [],
        locale: appSettings.cultureCode
      },
      experiments: appSettings.experiments,
      attendeeExperience: {
        url: appSettings.attendeeExperienceUrl
      },
      appointmentsUrl: appSettings.appointmentsUrl,
      browserFeatures: await detectBrowserFeatures(),
      deemUrl: appSettings.deemUrl,
      isEmbeddedRegistration
    },
    {
      baseUrl: analyticsUrl,
      endpoint: analyticsUrlPath
    },
    thunkContext
  );

  initializeFetchWithSessionTimeout(store);

  const { imageLookup: eventSnapshotImageLookup } = preloadedData.assets.eventSnapshot;
  if (eventSnapshotImageLookup) {
    store.dispatch(loadImageLookup(eventSnapshotImageLookup));
  }
  const { imageLookup: accountSnapshotImageLookup } = preloadedData.assets.accountSnapshot;
  if (accountSnapshotImageLookup) {
    store.dispatch(loadImageLookup(accountSnapshotImageLookup));
  }
  store.dispatch(createLoadAccountSnapshotAction(preloadedData.assets.accountSnapshot));
  store.dispatch(await createLoadEventSnapshotAction(preloadedData.assets.eventSnapshot, store.getState().account));
  store.dispatch(setLocale(appSettings.cultureCode));

  await store.dispatch(loginRegistrantOnInitialLoad(appSettings.eventContext));

  const {
    text,
    account: {
      customFonts = [],
      settings: { defaultCultureCode },
      name
    },
    clients: { translationSnapshotClient },
    event,
    defaultUserSession,
    environment,
    accessToken
  } = store.getState();
  const {
    cultureCode,
    eventCurrencySnapshot: { isoAlphabeticCode }
  } = event;
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const isAllowDetectLanguages = event.eventLocalesSetup && event.eventLocalesSetup.isAllowDetectLanguages;
  await registerTranslations(text.resolver, appSettings.cultureCode);
  initializeNetworkErrorDialog(store); // After event snapshot (for theme) and translations (for localized text)

  store.dispatch(loadTravelSnapshotDataIntoStore(preloadedData.assets.travelSnapshot, appSettings.isTravelEnabled));
  store.dispatch(
    loadEventTimezoneIntoStore(
      appSettings.eventTimezoneId,
      preloadedData.assets.eventTimezone.timeZones,
      preloadedData.assets.eventTimezone.translations
    )
  );
  store.dispatch(setCurrencies(preloadedData.assets.currencies));
  store.dispatch(loadCapacityCounts(preloadedData.assets.capacity));
  store.dispatch(setAirports(preloadedData.assets.airports));

  const activeCustomFonts = customFonts.filter(font => font.isActive);
  if (activeCustomFonts.length > 0) {
    store.dispatch(loadCustomFonts(activeCustomFonts));
  }
  store.dispatch(setCurrencyCode(isoAlphabeticCode));
  store.dispatch(loadLanguageManagementSettings());
  store.dispatch(
    setSelectedTimeZone(
      convertEventTimezoneTranslations(
        text.translate,
        preloadedData.assets.eventTimezone.timeZones[appSettings.eventTimezoneId]
      )
    )
  );

  if (defaultUserSession.eventBuildWizardExitUrl) {
    const params = new URLSearchParams(window.location.search);
    store.dispatch(initializePendoAnalytics(params.get('previewToken'), accessToken, environment, name, baseUrl));
  }

  if (queryParams.queueittoken) {
    const params = new URLSearchParams(window.location.search);
    params.delete('queueittoken');
    history.replace({ search: params.toString() });
  }

  const promises = [];

  if (queryParams.locale && eventHasMultipleLanguages(event)) {
    promises.push(store.dispatch(loadLanguage(findMatchingLocaleFromAvailableLocales(queryParams.locale, event))));
  } else if (eventHasMultipleLanguages(event) && isAllowDetectLanguages && getDeviceLocale()) {
    promises.push(store.dispatch(loadLanguage(findMatchingLocaleFromAvailableLocales(getDeviceLocale(), event))));
  } else {
    promises.push(store.dispatch(loadLanguage(cultureCode)));
  }
  promises.push(store.dispatch(loadLandingPageContent(appSettings.eventContext.landingPageVariety)));
  if (eventSingleLanguageDefaultNotAccountDefault(store.getState().event, store.getState().account)) {
    promises.push(
      store.dispatch(
        registerTranslationsFromSnapshot(
          text.resolver,
          translationSnapshotClient,
          cultureCode,
          defaultCultureCode,
          cultureCode
        )
      )
    );
  }
  await Promise.all(promises);

  /**
   * Carina RTE styles need to be added forcibly here,
   * so as to render the descriptions (in HTML) coming from the Normandy RTE,
   * to render properly here, which are missing these styles, by default.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const richTextRendererStyles = document && document.getElementById('richTextRendererStyles');
  if (richTextRendererStyles && richTextRendererStyles.innerHTML === '') {
    const rteStyles = styleString ? styleString.split('.carina-rte-styles ').join('') : '';
    document.getElementById('richTextRendererStyles').innerHTML = rteStyles;
  }

  const apolloClient = new ApolloClient({
    link: createLink(
      baseUrl,
      appSettings.eventContext.isPlanner ? appSettings.plannerRegSettings.apolloServerBaseUrl : '',
      {
        [SESSION_HEADER_EVENT_ID]: eventId,
        [SESSION_HEADER_USER_TYPE]: userType
      }
    ),
    cache: apolloCache(store, {
      eventId,
      environment
    }),
    typeDefs: []
  });
  (thunkContext as $TSFixMe).apolloClient = apolloClient;
  eventSnapshotVersionVar(appSettings.eventSnapshotVersion);

  const App = createApp(appSettings.assetRoot || '/');
  const routeHandlers = createRouteHandlers(store);

  let fixtureRoute = null;
  if (process.env.NODE_ENV !== 'production') {
    fixtureRoute = <Redirect path={`${rootPath}/`} to={`/${appSettings.eventContext.eventId}`} component={App} />;
  }

  render(
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <div>
          <Title />
          {withRoutes(App, createOnEnterHandler => (
            <Router history={history}>
              <Switch>
                <Route
                  exact
                  path={`${rootPath}/register`}
                  component={createOnEnterHandler(routeHandlers.startRegistration)}
                />
                <Route
                  exact
                  path={`${rootPath}/modifyRegistration`}
                  component={createOnEnterHandler(routeHandlers.modifyRegistration)}
                />
                <Route
                  exact
                  path={`${rootPath}/cancelRegistration`}
                  component={createOnEnterHandler(routeHandlers.cancelRegistration)}
                />
                <Route
                  exact
                  path={`${rootPath}/decline`}
                  component={createOnEnterHandler(routeHandlers.declineRegistration)}
                />
                <Route exact path={`${rootPath}/opt-out`} component={createOnEnterHandler(routeHandlers.optOut)} />
                <Route
                  exact
                  path={`${rootPath}/postRegistrationPayment`}
                  component={createOnEnterHandler(routeHandlers.postRegistrationPayment)}
                />
                <Route
                  exact
                  path={`${rootPath}/unsubscribe`}
                  component={createOnEnterHandler(routeHandlers.unsubscribe)}
                />
                <Route exact path={`${rootPath}/waitlist`} component={createOnEnterHandler(routeHandlers.waitlist)} />
                <Route
                  exact
                  path={`${rootPath}/confirmationpage`}
                  component={createOnEnterHandler(routeHandlers.confirmationPage)}
                />
                <Route exact path={`${rootPath}/:pageId`} component={createOnEnterHandler(routeHandlers.page)} />
                <Route exact path={`${rootPath}/`} component={createOnEnterHandler(routeHandlers.index)} />
                {fixtureRoute}
              </Switch>
            </Router>
          ))}
          <DialogContainer
            spinnerMessage="EventGuestSide_SharedLoadingProgressWidget_SpinnerLoadingText__resx"
            message="EventGuestSide_SharedLoadingProgressWidget_MessageText__resx"
          />
          <TransparentWrapper />
        </div>
      </ApolloProvider>
    </Provider>,
    document.getElementById('react-mount')
  );
  invalidateDatatagCache();
  loadCookieConsent(store.dispatch, store.getState);

  // remove devtools if browser plugin https://github.com/zalmoxisus/redux-devtools-extension present.
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
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
}

export default startAppRender;
