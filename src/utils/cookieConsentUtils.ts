import {
  ALLOW,
  ALLPAGES,
  ALLPAGES_BANNER,
  DENY,
  INITIALIZATION,
  INITIALIZATION_BANNER,
  REGISTRATION_CONVERSION_BANNER,
  TRIGGER_BASED
} from './CookieConstants';
import { getIn } from 'icepick';
import Logger from '@cvent/nucleus-logging';
import { shouldTieSocialMediaToCookieBanner } from 'event-widgets/redux/selectors/complianceSettings';

const LOG = new Logger('src/clients/cookieConsentUtils');

/**
 * This method register code snippets which are tied with cookie banner. To run them based on conditions
 * they gets added by specially appending _BANNER
 * @param accountCodeSnippets
 * @param eventCodeSnippets
 */
/* eslint-disable no-new-func */
export function registerBannerCodeSnippet(accountCodeSnippets: $TSFixMe, eventCodeSnippets: $TSFixMe): $TSFixMe {
  Object.values(eventCodeSnippets).forEach(eventCodeSnippet => {
    const accountCodeSnippetValue = accountCodeSnippets[(eventCodeSnippet as $TSFixMe).id];
    if (
      accountCodeSnippetValue?.codeSnippetId === (eventCodeSnippet as $TSFixMe).id &&
      accountCodeSnippetValue.isDropCodeSnippetToCookieBannerTied
    ) {
      const event = categoriesCodeSnippet(eventCodeSnippet);
      // Adding into window properties for later run
      try {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        window.CVENT.addTriggerHandlers(event, new Function(accountCodeSnippetValue?.codeSnippetValue?.toString()));
      } catch (e) {
        LOG.warn(
          'Error logging Not able to load code snippet -> ' + accountCodeSnippetValue?.codeSnippetValue?.toString()
        );
      }
    }
  });
}

/**
 * Helper method to segregate the condition
 * @param eventCodeSnippet
 * @returns {string|string}
 */
function categoriesCodeSnippet(eventCodeSnippet) {
  if (eventCodeSnippet.snippetTypeId === INITIALIZATION) {
    return INITIALIZATION_BANNER;
  } else if (eventCodeSnippet.snippetTypeId === TRIGGER_BASED) {
    return eventCodeSnippet.applicableOn === ALLPAGES ? ALLPAGES_BANNER : REGISTRATION_CONVERSION_BANNER;
  }
}

/**
 * This method load google analytics into dom when consent is provided by the user.
 * @param trackingId
 * @param anonymizeIp
 * @param isLinkerPluginEnabled
 */
export function loadGoogleAnalytics(
  trackingId: $TSFixMe,
  anonymizeIp: $TSFixMe,
  isLinkerPluginEnabled: $TSFixMe
): $TSFixMe {
  const script = document.createElement('script');
  const text = document.createTextNode(`(function(i,s,o,g,r,a,m){{i['GoogleAnalyticsObject']=r;i[r]=i[r]||
    function(){{(i[r].q=i[r].q||[]).push(arguments)}},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)}})
    (window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-${trackingId}', 'auto', {allowLinker: ${isLinkerPluginEnabled}});
    ga('set', 'anonymizeIp', ${anonymizeIp})`);
  script.appendChild(text as $TSFixMe);
  document.body.appendChild(script);
}

/**
 * Returns the status of cookie consent
 */
const getCookieConsentStatus = state => {
  return getIn(state, ['cookieConsent', 'status']) || DENY;
};

/**
 * This method check whether to allow cookie to be dropped on guestside for social media or not.
 */
export function areCookiesAllowedForSocialMedia(state: $TSFixMe): $TSFixMe {
  return (
    state.defaultUserSession.isPlanner ||
    !(state?.experiments.flexTieCookieBannerToAnalyticsExperimentVariant >= 2) ||
    !shouldTieSocialMediaToCookieBanner(state) ||
    getCookieConsentStatus(state) === ALLOW
  );
}
