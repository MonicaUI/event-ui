import { getCookieBannerType } from '../loadCookieConsent';
import { BASIC_TYPE, OPT_IN_TYPE } from '../../utils/CookieConstants';

const getMockState = (
  isDropGoogleAnalyticsToCookieBannerTied,
  shouldTieSocialMediaToCookieBanner,
  experimentvariant
) => {
  return {
    account: {
      settings: {
        accountSecuritySettings: {}
      }
    },
    event: {
      id: 5,
      isArchived: false,
      eventSecuritySetupSnapshot: {
        authenticationType: 0,
        authenticationLocation: '',
        authenticatedRegistrationPaths: ''
      },
      complianceSettings: {
        cookieBannerSettings: {
          tieSocialMediaWithCookieBannerLink: shouldTieSocialMediaToCookieBanner
        }
      },
      googleAnalyticsSettings: {
        isDropGoogleAnalyticsToCookieBannerTied,
        trackingId: 'dummy_tracking_id'
      }
    },
    experiments: {
      flexTieCookieBannerToAnalyticsExperimentVariant: experimentvariant
    }
  };
};

describe('getCookieBannerType', () => {
  test('should return basic type when when experiment is off', () => {
    const state = getMockState(true, true, 0);
    expect(BASIC_TYPE).toEqual(getCookieBannerType(state));
  });
  test('should return opt_in type when compliance setting for tie social media to cookie banner is enabled', () => {
    const state = getMockState(false, true, 2);
    expect(OPT_IN_TYPE).toEqual(getCookieBannerType(state));
  });
  test('should retun opt_in type when google analytics is tied with cookie banner', () => {
    const state = getMockState(true, false, 2);
    expect(OPT_IN_TYPE).toEqual(getCookieBannerType(state));
  });
});
