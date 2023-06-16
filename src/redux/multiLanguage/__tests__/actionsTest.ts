import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  loadLanguage,
  getLocaleIdFromCultureCode,
  getCultureCodeFromLocaleId,
  loadLanguageFromLocale
} from '../actions';
import { loadLanguageManagementSettings } from '../../actions';
import * as getMatchingLocale from 'event-widgets/utils/getMatchingLocale';

jest.mock('../../actions');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

let store;

beforeEach(() => {
  jest.clearAllMocks();
  const getCountriesMock = jest.fn();
  const getStatesMock = jest.fn();
  getCountriesMock.mockReturnValue(
    Promise.resolve({
      countries: {
        PA: {
          code: 'PA',
          sort: 999,
          name: 'Panama',
          nameResourceKey: 'cvt_lu2_0172',
          isoCode: 591,
          requireZipCodeFlag: false,
          metroAreaGroupId: 19,
          id: 174,
          alphaThreeCode: 'PAN'
        },
        US: {
          code: 'US',
          sort: 999,
          name: 'USA',
          nameResourceKey: 'cvt_lu2_0001',
          isoCode: 1,
          requireZipCodeFlag: false,
          metroAreaGroupId: 123,
          id: 450,
          alphaThreeCode: 'USA'
        }
      },
      translations: {
        en: {
          cvt_lu2_0001: 'United States',
          cvt_lu2_0172: 'Panama'
        }
      }
    })
  );
  getStatesMock.mockReturnValue(
    Promise.resolve({
      states: {
        VA: {
          code: 'VA',
          sort: 1,
          name: 'Virginia',
          nameResourceKey: 'cvt_lu2_0002',
          countryCode: 'US'
        },
        PA: {
          code: 'PA',
          sort: 2,
          name: 'Pennsylvania',
          nameResourceKey: 'cvt_lu2_0003',
          countryCode: 'US'
        }
      },
      translations: {
        en: {
          cvt_lu2_0002: 'Virginia',
          cvt_lu2_0003: 'Pennsylvania'
        }
      }
    })
  );
  function getState() {
    return {
      account: {
        settings: {
          defaultCultureCode: 'en-US'
        }
      },
      appData: {
        registrationSettings: {
          registrationPaths: []
        }
      },
      event: {
        id: 'eventId',
        cultureCode: 'en-US',
        eventLocalesSetup: {
          eventLocales: [
            {
              localeId: 1033,
              cultureCode: 'en-US',
              languageName: 'English',
              default: false
            },
            {
              localeId: 1025,
              cultureCode: 'fn-FN',
              languageName: 'Finnish',
              default: true
            }
          ]
        }
      },
      multiLanguageLocale: {
        loadedLanguages: ['fn-FN']
      },
      text: {
        resolver: {
          registerTranslations: jest.fn()
        },
        translate: jest.fn(x => x)
      },
      clients: {
        userTextClient: {
          getUserTextForLocale: jest.fn(),
          translationSnapshotClient: {
            getAccountTranslations: jest.fn(),
            getEventTranslations: jest.fn()
          }
        },
        lookupClient: {
          getCountries: getCountriesMock,
          getStates: getStatesMock
        }
      },
      experiments: {
        isUserTextLoadedOnlyForSecondaryLanguage: true
      },
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-000000000000': {
              attendee: {
                personalInformation: {
                  homeAddress: {
                    countryCode: 'US'
                  }
                }
              }
            }
          }
        }
      }
    };
  }
  store = mockStore(getState());
});

describe('loadLanguage', () => {
  it('should have LOAD_LANGUAGE, SET_LOCALE and SET_REG_CART_FIELD_VALUE action types dispatched, with empty UserText', async () => {
    (loadLanguageManagementSettings as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE_MANAGEMENT' }));
    await store.dispatch(loadLanguage('en-US'));
    expect(loadLanguageManagementSettings).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should have LOAD_LANGUAGE, SET_LOCALE and SET_REG_CART_FIELD_VALUE action types dispatched, with empty UserText using a locale not in the locales setup', async () => {
    (loadLanguageManagementSettings as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE_MANAGEMENT' }));
    await store.dispatch(loadLanguage('en-GB'));
    expect(loadLanguageManagementSettings).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should have only SET_LOCALE and SET_REG_CART_FIELD_VALUE actions dispatched', async () => {
    await store.dispatch(loadLanguage('fn-FN'));
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should have no actions dispatched', async () => {
    await store.dispatch(loadLanguage('fr-FR'));
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should trigger no actions with only 1 language for the event', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId',
          eventLocalesSetup: {
            eventLocales: [
              {
                localeId: 1033,
                cultureCode: 'en-US',
                languageName: 'English',
                default: false
              }
            ]
          }
        },
        multiLanguageLocale: {
          loadedLanguages: ['fn-FN']
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        },
        experiments: {
          isUserTextLoadedOnlyForSecondaryLanguage: true
        }
      };
    }
    store = mockStore(getState());
    await store.dispatch(loadLanguage('en-US'));
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should trigger no actions when eventLocalesSetup does not exist in event', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId'
        },
        multiLanguageLocale: {
          loadedLanguages: ['fn-FN']
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        },
        experiments: {
          isUserTextLoadedOnlyForSecondaryLanguage: true
        }
      };
    }
    store = mockStore(getState());
    await store.dispatch(loadLanguage('en-US'));
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should not load translations when loadedLanguages is undefined', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId'
        },
        multiLanguageLocale: {},
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        },
        experiments: {
          isUserTextLoadedOnlyForSecondaryLanguage: true
        }
      };
    }
    store = mockStore(getState());
    await store.dispatch(loadLanguage('en-US'));
    expect(store.getActions()).toMatchSnapshot();
  });
  it('should load translations when language is default', async () => {
    const getCountriesMock = jest.fn();
    const getStatesMock = jest.fn();
    const getUserTextForLocaleMock = jest.fn();
    getCountriesMock.mockReturnValue(
      Promise.resolve({
        countries: {
          PA: {
            code: 'PA',
            sort: 999,
            name: 'Panama',
            nameResourceKey: 'cvt_lu2_0172',
            isoCode: 591,
            requireZipCodeFlag: false,
            metroAreaGroupId: 19,
            id: 174,
            alphaThreeCode: 'PAN'
          },
          US: {
            code: 'US',
            sort: 999,
            name: 'USA',
            nameResourceKey: 'cvt_lu2_0001',
            isoCode: 1,
            requireZipCodeFlag: false,
            metroAreaGroupId: 123,
            id: 450,
            alphaThreeCode: 'USA'
          }
        },
        translations: {
          en: {
            cvt_lu2_0001: 'United States',
            cvt_lu2_0172: 'Panama'
          }
        }
      })
    );
    getStatesMock.mockReturnValue(
      Promise.resolve({
        states: {
          VA: {
            code: 'VA',
            sort: 1,
            name: 'Virginia',
            nameResourceKey: 'cvt_lu2_0002',
            countryCode: 'US'
          },
          PA: {
            code: 'PA',
            sort: 2,
            name: 'Pennsylvania',
            nameResourceKey: 'cvt_lu2_0003',
            countryCode: 'US'
          }
        },
        translations: {
          en: {
            cvt_lu2_0002: 'Virginia',
            cvt_lu2_0003: 'Pennsylvania'
          }
        }
      })
    );
    getUserTextForLocaleMock.mockReturnValue(
      Promise.resolve({
        data: {
          'English Translation': {
            text: 'English Translation'
          }
        }
      })
    );
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        appData: {
          registrationSettings: {
            registrationPaths: []
          }
        },
        event: {
          id: 'eventId',
          cultureCode: 'en-US',
          eventLocalesSetup: {
            eventLocales: [
              {
                localeId: 1033,
                cultureCode: 'en-US',
                languageName: 'English',
                default: true
              },
              {
                localeId: 1025,
                cultureCode: 'fn-FN',
                languageName: 'Finnish',
                default: false
              }
            ]
          }
        },
        multiLanguageLocale: {
          loadedLanguages: []
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          },
          translate: jest.fn(x => x)
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: getUserTextForLocaleMock,
            translationSnapshotClient: {
              getAccountTranslations: jest.fn(),
              getEventTranslations: jest.fn()
            }
          },
          lookupClient: {
            getCountries: getCountriesMock,
            getStates: getStatesMock
          }
        },
        experiments: {
          isUserTextLoadedOnlyForSecondaryLanguage: true
        },
        registrationForm: {
          regCart: {
            eventRegistrations: {
              '00000000-0000-0000-000000000000': {
                attendee: {
                  personalInformation: {
                    homeAddress: {
                      countryCode: 'US'
                    }
                  }
                }
              }
            }
          }
        }
      };
    }
    store = mockStore(getState());
    await store.dispatch(loadLanguage('en'));
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('loadLanguageFromLocale', () => {
  it('should call getFullLanguageFromDefaultMapping with en-US from a loadLanguageFromLocale call with 1033 when cultureCode of event is en-US', async () => {
    const getFullLanguageFromDefaultMappingSpy = jest.spyOn(getMatchingLocale, 'getFullLanguageFromDefaultMapping');
    await store.dispatch(loadLanguageFromLocale(1033));
    expect(getFullLanguageFromDefaultMappingSpy).toHaveBeenCalledWith('en-US');
  });
  it('should call getFullLanguageFromDefaultMapping with en-US from a loadLanguageFromLocale call with 1033 when cultureCode of event is en', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId',
          cultureCode: 'en',
          eventLocalesSetup: {
            eventLocales: [
              {
                localeId: 1033,
                cultureCode: 'en-US',
                languageName: 'English',
                default: true
              },
              {
                localeId: 1031,
                cultureCode: 'de-DE',
                languageName: 'Deutsch',
                default: true
              }
            ]
          }
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        }
      };
    }
    store = mockStore(getState());
    const getFullLanguageFromDefaultMappingSpy = jest.spyOn(getMatchingLocale, 'getFullLanguageFromDefaultMapping');
    await store.dispatch(loadLanguageFromLocale(1033));
    expect(getFullLanguageFromDefaultMappingSpy).toHaveBeenCalledWith('en-US');
  });
  it('should call getFullLanguageFromDefaultMapping with en-CA from a loadLanguageFromLocale call with 1033 when cultureCode of event is en', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId',
          cultureCode: 'en-CA',
          eventLocalesSetup: {
            eventLocales: [
              {
                localeId: 1033,
                cultureCode: 'en-US',
                languageName: 'English',
                default: true
              },
              {
                localeId: 1031,
                cultureCode: 'de-DE',
                languageName: 'Deutsch',
                default: true
              }
            ]
          }
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        }
      };
    }
    store = mockStore(getState());
    const getFullLanguageFromDefaultMappingSpy = jest.spyOn(getMatchingLocale, 'getFullLanguageFromDefaultMapping');
    await store.dispatch(loadLanguageFromLocale(1033));
    expect(getFullLanguageFromDefaultMappingSpy).toHaveBeenCalledWith('en-CA');
  });
  it('should call getFullLanguageFromDefaultMapping with de-DE from a loadLanguageFromLocale call with 1031 when cultureCode of event is de', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId',
          cultureCode: 'de',
          eventLocalesSetup: {
            eventLocales: [
              {
                localeId: 1031,
                cultureCode: 'de-DE',
                languageName: 'Deutsch',
                default: true
              },
              {
                localeId: 1033,
                cultureCode: 'en-US',
                languageName: 'English',
                default: true
              }
            ]
          }
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        }
      };
    }
    store = mockStore(getState());
    const getFullLanguageFromDefaultMappingSpy = jest.spyOn(getMatchingLocale, 'getFullLanguageFromDefaultMapping');
    await store.dispatch(loadLanguageFromLocale(1031));
    expect(getFullLanguageFromDefaultMappingSpy).toHaveBeenCalledWith('de-DE');
  });
  it('should call getFullLanguageFromDefaultMapping with de-AT from a loadLanguageFromLocale call with 1031 when cultureCode of event is de-AT', async () => {
    function getState() {
      return {
        account: {
          settings: {
            defaultCultureCode: 'en-US'
          }
        },
        event: {
          id: 'eventId',
          cultureCode: 'de-AT',
          eventLocalesSetup: {
            eventLocales: [
              {
                localeId: 1031,
                cultureCode: 'de-DE',
                languageName: 'Deutsch',
                default: true
              },
              {
                localeId: 1033,
                cultureCode: 'en-US',
                languageName: 'English',
                default: true
              }
            ]
          }
        },
        text: {
          resolver: {
            registerTranslations: jest.fn()
          }
        },
        clients: {
          userTextClient: {
            getUserTextForLocale: jest.fn()
          }
        }
      };
    }
    store = mockStore(getState());
    const getFullLanguageFromDefaultMappingSpy = jest.spyOn(getMatchingLocale, 'getFullLanguageFromDefaultMapping');
    await store.dispatch(loadLanguageFromLocale(1031));
    expect(getFullLanguageFromDefaultMappingSpy).toHaveBeenCalledWith('de-AT');
  });
});

describe('getLocaleIdFromCultureCode', () => {
  it('get localeId from eventLocales with valid cultureCode', () => {
    const testCultureCode = 'en-US';
    const testEventLocales = [
      {
        localeId: 1033,
        cultureCode: 'en-US'
      }
    ];
    const actualLocaleId = getLocaleIdFromCultureCode(testCultureCode, testEventLocales);
    const expectedLocaleId = 1033;
    expect(expectedLocaleId).toEqual(actualLocaleId);
  });
  it('get null with invalid cultureCode', () => {
    const testCultureCode = 'en-US';
    const testEventLocales = [
      {
        localeId: 1031,
        cultureCode: 'de-DE'
      }
    ];
    const actualLocaleId = getLocaleIdFromCultureCode(testCultureCode, testEventLocales);
    const expectedLocaleId = null;
    expect(expectedLocaleId).toEqual(actualLocaleId);
  });
  it('get null with bad eventLocales', () => {
    const testCultureCode = 'en-US';
    const testEventLocales = undefined;
    const actualLocaleId = getLocaleIdFromCultureCode(testCultureCode, testEventLocales);
    const expectedLocaleId = null;
    expect(expectedLocaleId).toEqual(actualLocaleId);
  });
});

describe('getCultureCodeFromLocaleId', () => {
  it('get cultureCode from eventLocales with valid localeId', () => {
    const testLocaleId = 1033;
    const testEventCultureCode = 'en';
    const testEventLocales = [
      {
        localeId: 1033,
        cultureCode: 'en-US'
      }
    ];
    const actualCultureCode = getCultureCodeFromLocaleId(testLocaleId, testEventCultureCode, testEventLocales);
    const expectedCultureCode = 'en-US';
    expect(expectedCultureCode).toEqual(actualCultureCode);
  });
  it('get null with invalid localeId', () => {
    const testLocaleId = 1033;
    const testEventCultureCode = 'de';
    const testEventLocales = [
      {
        localeId: 1031,
        cultureCode: 'de-DE'
      }
    ];
    const actualCultureCode = getCultureCodeFromLocaleId(testLocaleId, testEventCultureCode, testEventLocales);
    const expectedCultureCode = null;
    expect(expectedCultureCode).toEqual(actualCultureCode);
  });
  it('get null with bad eventLocales', () => {
    const testLocaleId = 1033;
    const testEventCultureCode = 'de';
    const testEventLocales = undefined;
    const actualCultureCode = getCultureCodeFromLocaleId(testLocaleId, testEventCultureCode, testEventLocales);
    const expectedCultureCode = null;
    expect(expectedCultureCode).toEqual(actualCultureCode);
  });
});
