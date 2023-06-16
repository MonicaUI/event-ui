import cookieConsent from 'cvent-cookieconsent';
import 'cvent-cookieconsent/build/cookieconsent.min.css';
import { getPrivacyPolicyLink } from 'event-widgets/utils/privacyPolicyUtils';
import {
  shouldShowCookieBanner,
  shouldShowCookieBannerLink,
  getComplianceSettings,
  getCookieBannerSettings,
  shouldTieSocialMediaToCookieBanner
} from 'event-widgets/redux/selectors/complianceSettings';
import { ALLOW, ALLPAGES_BANNER, INITIALIZATION_BANNER, OPT_IN_TYPE, BASIC_TYPE } from '../utils/CookieConstants';
import { getCurrentPageId, getPagePath } from '../redux/pathInfo';
import { loadGoogleAnalytics, registerBannerCodeSnippet } from '../utils/cookieConsentUtils';
import resolveDatatagsForCodeSnippets from '../utils/datatagUtils';
import { setCookieConsent } from '../redux/cookieConsent/action';

let cookieStatus = '';

export function getCookieStatus(): $TSFixMe {
  return cookieStatus;
}

export default function showCookieConsent(dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe {
  const state = getState();
  const { event, text, account } = state;
  if (
    !event ||
    !getComplianceSettings(state) ||
    !getCookieBannerSettings(state) ||
    !text ||
    !text.translate ||
    typeof text.translate !== 'function'
  ) {
    return;
  }
  const eventId = event.id;
  const enabled = shouldShowCookieBanner(state) && !state.defaultUserSession.isPlanner;
  const showLink = shouldShowCookieBannerLink(state);
  const language = event.languageId || event.cultureCode;
  const translate = text.translate;
  /**
   * Hookup method for cookie banner, This method is called when cookie status changes.
   * @param status is the current value cookie banner as selected by the user.
   */
  const onStatusChange = async status => {
    cookieStatus = status;
    dispatch(setCookieConsent(status));
    registerBannerCodeSnippetAndGoogleAnalytics(status, event, account);
    await dispatch(resolveDatatagsForCodeSnippets());
    runInitializationCodeSnippetsForBanner(status);
    sendGoogleAnalytics(state, status);
  };
  /**
   * Hookup method for cookie banner, This method is called at the time of initialization and also return the
   * last saved cookie consent value.
   * @param status is the current value cookie banner as selected by the user.
   */
  const onInitialise = async status => {
    registerBannerCodeSnippetAndGoogleAnalytics(status, event, account);
    cookieStatus = status;
    dispatch(setCookieConsent(status));
    await dispatch(resolveDatatagsForCodeSnippets());
    runInitializationCodeSnippetsForBanner(status);
  };

  const type = getCookieBannerType(state);

  const basicConfig = {
    showLink,
    cookie: { identifier: eventId },
    language,
    content: {
      message: translate('EventGuestSide_CookieConsent_Text__resx'),
      link: translate('EventGuestSide_CookieConsent_PrivacyPolicy__resx'),
      dismiss: translate('EventGuestSide_CookieConsent_Dismiss__resx'),
      href: getPrivacyPolicyLink(language, 'cookies')
    },
    elements: {
      messagelink:
        '<span id="cookieconsent:desc" class="cc-message">{{message}}<br /><a aria-label="' +
        translate('EventGuestSide_CookieConsent_PrivacyPolicyLink_ARIA__resx') +
        ' role=button tabindex="0" class="cc-link" href="{{href}}" rel="noopener nofollow" target="_blank">{{link}}</a></span>'
    }
  };

  const optInConfig = {
    ...basicConfig,
    ...{
      revokeBtn: '<div style="display: none;"/>',
      type,
      onStatusChange,
      onInitialise,
      palette: {
        button: { border: '#0099E0', text: '#ffffff', paddingTop: 'none' },
        highlight: { border: '#0099E0', text: '#0099E0', background: '#ffffff' }
      },
      content: {
        message: translate('EventGuestSide_ConditionalCookieConsent_Dismiss__resx'),
        allow: translate('EventGuestSide_AnalyticsCookieConsent_Allow__resx'),
        dismiss: translate('EventGuestSide_EssentialCookieConsent_Allow__resx'),
        close: '\uE935'
      },
      elements: {
        message:
          '<span id="cookieconsent:desc" class="cc-message" style="margin-right: 20px; align-self: start;">{{message}}</span>',
        messagelink:
          '<span id="cookieconsent:desc" class="cc-message" style="margin-right: 20px; align-self: start;">{{message}}<br /><a aria-label="' +
          translate('EventGuestSide_CookieConsent_PrivacyPolicyLink_ARIA__resx') +
          ' role=button tabindex="0" class="cc-link" href="{{href}}" rel="noopener nofollow" target="_blank">{{link}}</a></span>',
        dismiss:
          '<a aria-label="dismiss cookie message" tabindex="0" class="cc-btn cc-dismiss" style= "font-size: 15px; text-decoration: none; margin-bottom: 10px" onMouseOver="this.style.color=\'#ffffff\'" onmouseout="this.style.color=\'#0099E0\'">{{dismiss}}</a>',
        allow:
          '<a aria-label="allow cookies" tabindex="0" class="cc-btn cc-allow" style= "font-size: 15px; margin-bottom: 10px">{{allow}}</a>'
      },
      compliance: {
        'opt-in':
          '<div class="cc-compliance cc-highlight" style="align-self: start; display: block;"}>{{dismiss}}{{allow}}</div>'
      }
    }
  };

  const nonMobileConfig = {
    elements: {
      close:
        '<span aria-label="dismiss cookie message" tabindex="0" class="cc-close" style="right: calc(48% - 520px);">{{close}}</span>'
    },
    compliance: {
      'opt-in': '<div class="cc-compliance cc-highlight" style="align-self: start;">{{dismiss}}{{allow}}</div>'
    }
  };

  if (enabled) {
    cookieConsent(getConfig(type, basicConfig, optInConfig, nonMobileConfig));
  } else {
    void runCodeSnippetTiedWithBannerWhenCookieBannerIsDisabled(event, account, dispatch);
  }
}

/*
 * Based on whether code-snippet is added in the event, isDropGoogleAnalyticsToCookieBannerTied is on or
 * tieSocialMediaToCookieBanner is on, cookie banner type will be changed from 'basic' to 'opt-in' and
 * vice-versa. This opt-in ensures to show two buttons on cookie banner.
 */
export function getCookieBannerType(state: $TSFixMe): $TSFixMe {
  const { event, account, experiments } = state;

  return (isFlexTieCookieBannerToAnalyticsEnabled(experiments) && isCookieBannerWithAnalyticsEnabled(event, account)) ||
    (shouldDisplayOptInBannerForSocialMedia(experiments) && shouldTieSocialMediaToCookieBanner(state))
    ? OPT_IN_TYPE
    : BASIC_TYPE;
}

/**
 * This method runs initialization type code snippet at the time of getting onStatusChange or onInitialise hookup
 * methods are called by cookie banner. This also serves the use cases when user clicks on cookie banner first time, be
 * it on any page, it ensures to run AllPages_Banner on that page too, further AllPages_Banner are to be run by
 * routerHandler
 * @param status
 * @param store
 */
function runInitializationCodeSnippetsForBanner(status = ALLOW) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (window.CVENT && window.CVENT.runTriggerHandlers) {
    if (status && status === ALLOW) {
      window.CVENT.runTriggerHandlers(INITIALIZATION_BANNER);
      window.CVENT.runTriggerHandlers(ALLPAGES_BANNER);
    }
  }
}

/**
 * Only if there is any entry for banner is present, two button will be shown.
 * @param event
 * @param account
 * @returns {boolean|*}
 */
function isCookieBannerWithAnalyticsEnabled(event, account) {
  const { googleAnalyticsSettings, eventCodeSnippets } = event;
  const {
    settings: { accountCodeSnippets }
  } = account;

  const isDropCodeSnippetToCookieBannerTied =
    eventCodeSnippets &&
    accountCodeSnippets &&
    Object.values(eventCodeSnippets).filter(e =>
      Object.values(accountCodeSnippets).some(
        a => (a as $TSFixMe).codeSnippetId === (e as $TSFixMe).id && (a as $TSFixMe).isDropCodeSnippetToCookieBannerTied
      )
    ).length > 0;
  return (
    isDropCodeSnippetToCookieBannerTied ||
    (googleAnalyticsSettings?.isDropGoogleAnalyticsToCookieBannerTied && !!googleAnalyticsSettings.trackingId)
  );
}

/**
 * To check if it's a mobile window
 * @returns {boolean}
 */
function isMobile() {
  const maxMobileViewScreenSize = 480;
  const screenSize = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  return screenSize < maxMobileViewScreenSize;
}

/**
 * @returns boolean true, when tie cookie banner to analytics experiment is enabled for the account
 */
function isFlexTieCookieBannerToAnalyticsEnabled(experiments) {
  return experiments?.flexTieCookieBannerToAnalyticsExperimentVariant >= 1;
}

/**
 * @returns {boolean} Returns true when experiment is enabaled to tie social media to cookie banner
 */
function shouldDisplayOptInBannerForSocialMedia(experiments) {
  return experiments?.flexTieCookieBannerToAnalyticsExperimentVariant >= 2;
}

/**
 * To get the config based on types and mobile settings
 * @param type
 * @param basicConfig
 * @param optInConfig
 * @param mobileConfig
 * @returns {*|{elements: {close: *}}}
 */
function getConfig(type, basicConfig, optInConfig, nonMobileConfig) {
  const config = type === BASIC_TYPE ? basicConfig : optInConfig;
  if (!isMobile() && type === OPT_IN_TYPE) {
    return {
      ...config,
      elements: {
        ...config.elements,
        close: nonMobileConfig.elements.close
      },
      compliance: nonMobileConfig.compliance
    };
  }
  return config;
}

/**
 * Adding this function here to make sure. If user choose allow on any page google analytics is not
 * missed while making status change.
 */
function sendGoogleAnalytics(state, status) {
  const {
    event: { googleAnalyticsSettings },
    defaultUserSession: { isTestMode, isPlanner, isPreview }
  } = state;
  const currentPageId = getCurrentPageId(state);
  if (!isPlanner && !isPreview && !isTestMode) {
    if ((window as $TSFixMe).ga) {
      if (googleAnalyticsSettings?.isDropGoogleAnalyticsToCookieBannerTied && status === ALLOW && currentPageId) {
        (window as $TSFixMe).ga('set', 'page', getPagePath(state, currentPageId));
        (window as $TSFixMe).ga('send', 'pageview');
      }
    }
  }
}

/**
 * This method registers code snippet and google analytics if consent is provided by the user
 * @param status
 * @param event
 * @param account
 */
function registerBannerCodeSnippetAndGoogleAnalytics(status, event, account) {
  const { eventCodeSnippets, googleAnalyticsSettings } = event;
  const {
    settings: { accountCodeSnippets }
  } = account;
  if (status === ALLOW) {
    registerBannerCodeSnippet(accountCodeSnippets, eventCodeSnippets);
    if (googleAnalyticsSettings?.isDropGoogleAnalyticsToCookieBannerTied && !!googleAnalyticsSettings?.trackingId) {
      loadGoogleAnalytics(
        googleAnalyticsSettings.trackingId,
        googleAnalyticsSettings.isAnonymizeIpEnabled,
        googleAnalyticsSettings.isCrossDomainTrackingEnabled
      );
    }
  }
}
/*
 * In case cookie banner is not enabled. All the code snippets should run. As this method won't be run by
 * hookup method. Calling this explicitly to run Initialization_Banner and AllPages_Banner
 */
async function runCodeSnippetTiedWithBannerWhenCookieBannerIsDisabled(event, account, dispatch) {
  const { eventCodeSnippets } = event;
  const {
    settings: { accountCodeSnippets }
  } = account;
  // Explicitly registering in case the cookie banner shown is false
  if (accountCodeSnippets && eventCodeSnippets) {
    registerBannerCodeSnippet(accountCodeSnippets, eventCodeSnippets);
    await dispatch(resolveDatatagsForCodeSnippets());
    runInitializationCodeSnippetsForBanner();
  }
}
