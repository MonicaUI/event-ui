import { areCookiesAllowedForSocialMedia, registerBannerCodeSnippet } from '../cookieConsentUtils';
import { ALLPAGES_BANNER, INITIALIZATION_BANNER, REGISTRATION_CONVERSION_BANNER } from '../CookieConstants';

const accountCodeSnippet = {
  '1eed2074-66da-4cdc-9d64-cca173b20e4a': {
    codeSnippetId: '1eed2074-66da-4cdc-9d64-cca173b20e4a',
    codeSnippetDataTagCode: 'CODE SNIPPET 2',
    codeSnippetName: 'reg conversion yes',
    codeSnippetValue: "console.log('First code snippet')",
    codeSnippetStatus: 'Approved',
    isDropCodeSnippetToCookieBannerTied: true
  },
  '21e16c23-1b11-477a-bacf-efecd958e3f2': {
    codeSnippetId: '21e16c23-1b11-477a-bacf-efecd958e3f2',
    codeSnippetDataTagCode: 'AD2',
    codeSnippetName: 'Code snippet all page yes',
    codeSnippetValue: "console.log('Second code snippet')",
    codeSnippetStatus: 'Approved',
    isDropCodeSnippetToCookieBannerTied: true
  },
  '97c469bc-73c7-4ef3-98de-dc71868edeac': {
    codeSnippetId: '97c469bc-73c7-4ef3-98de-dc71868edeac',
    codeSnippetDataTagCode: 'AD',
    codeSnippetName: 'code snippet for all with No and approved',
    codeSnippetValue: "console.log('Third code snippet')",
    codeSnippetStatus: 'Approved',
    isDropCodeSnippetToCookieBannerTied: false
  },
  '998350ce-71e0-49e9-9970-6bfed546ff65': {
    codeSnippetId: '998350ce-71e0-49e9-9970-6bfed546ff65',
    codeSnippetDataTagCode: 'CODE SNIPPET 1',
    codeSnippetName: 'code snippet init yes',
    codeSnippetValue: "alert('I m initialisation');",
    codeSnippetStatus: 'Approved',
    isDropCodeSnippetToCookieBannerTied: true
  }
};

const eventCodeSnippet = {
  '1eed2074-66da-4cdc-9d64-cca173b20e4a': {
    id: '1eed2074-66da-4cdc-9d64-cca173b20e4a',
    applicableOn: 'RegistrationConversion',
    snippetTypeId: 'TriggerBased'
  },
  '21e16c23-1b11-477a-bacf-efecd958e3f2': {
    id: '21e16c23-1b11-477a-bacf-efecd958e3f2',
    applicableOn: 'AllPages',
    snippetTypeId: 'TriggerBased'
  },
  '97c469bc-73c7-4ef3-98de-dc71868edeac': {
    id: '97c469bc-73c7-4ef3-98de-dc71868edeac',
    applicableOn: 'RegistrationConversion',
    snippetTypeId: 'Initialization'
  }
};

describe('Load banner code snippet test', () => {
  test('> load only banner code snippets', () => {
    const codeSnippets = {};
    console.log = jest.fn();
    window.CVENT = {
      addTriggerHandlers(event, triggerHandler) {
        if (!codeSnippets[event]) {
          codeSnippets[event] = [];
        }
        codeSnippets[event].push(triggerHandler);
      }
    };
    registerBannerCodeSnippet(accountCodeSnippet, eventCodeSnippet);
    expect(codeSnippets[REGISTRATION_CONVERSION_BANNER].length).toBe(1);
    expect(codeSnippets[ALLPAGES_BANNER].length).toBe(1);
    expect(codeSnippets[INITIALIZATION_BANNER]).toBe(undefined);
  });
});

describe('Are Cookies allowed for social media', () => {
  test('If planner is viewing guest side, cookies should be allowed', () => {
    const state = {
      defaultUserSession: {
        isPlanner: true
      }
    };
    expect(areCookiesAllowedForSocialMedia(state)).toBeTruthy();
  });
  test('If flexTieCookieBannerToAnalyticsExperimentVariant experiment is not set to 2 or more, cookies should be allowed', () => {
    const state = {
      defaultUserSession: {
        isPlanner: false
      },
      experiments: {
        flexTieCookieBannerToAnalyticsExperimentVariant: 1
      }
    };
    expect(areCookiesAllowedForSocialMedia(state)).toBeTruthy();
  });
  test('If tieSocialMediaWithCookieBannerLink is off, cookies should be allowed', () => {
    const state = {
      defaultUserSession: {
        isPlanner: false
      },
      experiments: {
        flexTieCookieBannerToAnalyticsExperimentVariant: 2
      },
      event: {
        complianceSettings: {
          cookieBannerSettings: {
            tieSocialMediaWithCookieBannerLink: false
          }
        }
      }
    };
    expect(areCookiesAllowedForSocialMedia(state)).toBeTruthy();
  });
  test('If consent is not allow is off, cookies should not be allowed', () => {
    const state = {
      defaultUserSession: {
        isPlanner: false
      },
      experiments: {
        flexTieCookieBannerToAnalyticsExperimentVariant: 2
      },
      event: {
        complianceSettings: {
          cookieBannerSettings: {
            tieSocialMediaWithCookieBannerLink: true
          }
        }
      },
      cookieConsent: {
        status: 'dismiss'
      }
    };
    expect(areCookiesAllowedForSocialMedia(state)).toBeFalsy();
  });
  test('If consent is allow is off, cookies should not be allowed', () => {
    const state = {
      defaultUserSession: {
        isPlanner: false
      },
      experiments: {
        flexTieCookieBannerToAnalyticsExperimentVariant: 2
      },
      event: {
        complianceSettings: {
          cookieBannerSettings: {
            tieSocialMediaWithCookieBannerLink: true
          }
        }
      },
      cookieConsent: {
        status: 'allow'
      }
    };
    expect(areCookiesAllowedForSocialMedia(state)).toBeTruthy();
  });
});
