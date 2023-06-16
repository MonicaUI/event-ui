import fetchTextResolverDatatags, { resolveDataTagsForArchiveEvents } from '../datatags';
import { removeDataTags } from '../datatags';
import DataTagsResolutionClient from '../../clients/DataTagsResolutionClient';
import eventPersonaClient from '../../clients/EventPersonaClient';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../clients/DataTagsResolutionClient', () => {
  return {
    resolve: jest.fn(() => {
      return ['This is the first dataTag.', 'This is the second dataTag.'];
    }),
    resolveWithDefaultLanguage: jest.fn(() => {
      return ['This is the first French dataTag.', 'This is the second dataTag.'];
    })
  };
});

jest.mock('../../clients/EventPersonaClient', () => {
  return {
    identifyInvitee: jest.fn(() => {
      return {
        inviteeStatus: 'New'
      };
    })
  };
});
let store;

const datatags = ['{[E-ADDRESS]}', '{[E-CITY]}'];

const options = {
  successCallback: jest.fn(() => {})
};

const baseState = {
  clients: { DataTagsResolutionClient, eventPersonaClient },
  event: {
    cultureCode: 'en-US'
  },
  multiLanguageLocale: {
    locale: 'en-US'
  },
  userSession: {
    inviteeId: 'inviteeId'
  },
  pathInfo: {}
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchTextResolverDatatags', () => {
  it('calls the resolve function to retrieve dataTags for a single language event', async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          cultureCode: 'en-US',
          eventFeatureSetup: {
            website: {
              multipleLanguages: false
            }
          }
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolve).toHaveBeenCalledWith(datatags, 'en-US', 'en-US', undefined);
  });
  it('calls the resolve function to retrieve datatags for a single language English event in non-default region', async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          cultureCode: 'en-GB',
          eventFeatureSetup: {
            website: {
              multipleLanguages: false
            }
          }
        },
        multiLanguageLocale: {
          locale: 'en-GB'
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolve).toHaveBeenCalledWith(datatags, 'en-GB', 'en-GB', undefined);
  });
  it('calls the resolve function to retrieve dataTags for a secondary language in multi-language event', async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          cultureCode: 'fr-FR',
          eventLocalesSetup: {
            eventLocales: [
              {
                cultureCode: 'en-US'
              },
              {
                cultureCode: 'fr-FR'
              }
            ]
          },
          eventFeatureSetup: {
            website: {
              multipleLanguages: true
            }
          }
        },
        multiLanguageLocale: {
          locale: 'fr-FR'
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolveWithDefaultLanguage).toHaveBeenCalledWith(
      datatags,
      'fr-FR',
      'fr-FR',
      undefined
    );
  });
  it("calls the resolve function to retrieve datatags in event with multiple French languages where event's default culture code matches default language region", async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          cultureCode: 'fr',
          eventLocalesSetup: {
            eventLocales: [
              {
                cultureCode: 'fr-FR',
                isDefault: true
              },
              {
                cultureCode: 'fr-CA',
                isDefault: false
              }
            ]
          },
          eventFeatureSetup: {
            website: {
              multipleLanguages: true
            }
          }
        },
        multiLanguageLocale: {
          locale: 'fr'
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolveWithDefaultLanguage).toHaveBeenCalledWith(
      datatags,
      'fr-FR',
      'fr-FR',
      undefined
    );
  });
  it("calls the resolve function to retrieve datatags in event with multiple French languages where event's default culture code does not match the default language region", async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          cultureCode: 'fr-CA',
          eventLocalesSetup: {
            eventLocales: [
              {
                cultureCode: 'fr-FR',
                isDefault: false
              },
              {
                cultureCode: 'fr-CA',
                isDefault: true
              }
            ]
          },
          eventFeatureSetup: {
            website: {
              multipleLanguages: true
            }
          }
        },
        multiLanguageLocale: {
          locale: 'fr-CA'
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolveWithDefaultLanguage).toHaveBeenCalledWith(
      datatags,
      'fr-CA',
      'fr-CA',
      undefined
    );
  });
  it('calls the resolve function to retrieve datatags in default language in multi-language event', async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          eventLocalesSetup: {
            eventLocales: [
              {
                cultureCode: 'en-US'
              },
              {
                cultureCode: 'fr-FR'
              }
            ]
          },
          eventFeatureSetup: {
            website: {
              multipleLanguages: true
            }
          }
        },
        multiLanguageLocale: {
          locale: 'en-US'
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolveWithDefaultLanguage).toHaveBeenCalledWith(
      datatags,
      'en-US',
      'en-US',
      undefined
    );
  });
  it('calls the resolve function with the primary invitee info', async () => {
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          eventLocalesSetup: {
            eventLocales: [
              {
                cultureCode: 'en-US'
              }
            ]
          },
          eventFeatureSetup: {
            website: {
              multipleLanguages: false
            }
          }
        },
        registrationForm: {
          regCart: {
            eventRegistrations: {
              groupMemberRegId: {
                attendee: {
                  personalInformation: {
                    contactId: 'groupMemberContactId'
                  }
                },
                attendeeType: 'ATTENDEE'
              },
              groupLeaderRegId: {
                attendee: {
                  personalInformation: {
                    contactId: 'groupLeaderContactId'
                  }
                },
                attendeeType: 'GROUP_LEADER'
              }
            }
          }
        }
      };
    }
    store = mockStore(getState());

    await fetchTextResolverDatatags(store.dispatch, store.getState, datatags, options);
    expect((DataTagsResolutionClient as $TSFixMe).resolve).toHaveBeenCalledWith(
      datatags,
      'en-US',
      'en-US',
      'groupLeaderContactId'
    );
  });

  it('Remove the unresolved invitee stub data tag from a custom page web url', async () => {
    jest.clearAllMocks();
    function getState() {
      return {
        ...baseState
      };
    }
    store = mockStore(getState());
    let result = removeDataTags(
      ['https://staging.cvent.me/yXQenZ?i={[IN-INVITEE STUB BASE64]}&environment=S437&locale=en-US&pc=Speakers'],
      ['{[E-CUSTOM URL:Speakers]}'],
      store.getState
    );
    expect(result).toStrictEqual(['https://staging.cvent.me/yXQenZ?&environment=S437&locale=en-US&pc=Speakers']);
    result = removeDataTags(
      ['https://staging.cvent.me/yXQenZ?environment=S437&locale=en-US&pc=Speakers&i={[IN-INVITEE STUB BASE64]}'],
      ['{[E-CUSTOM URL:Speakers]}'],
      store.getState
    );
    expect(result).toStrictEqual(['https://staging.cvent.me/yXQenZ?environment=S437&locale=en-US&pc=Speakers&']);
  });
});

describe('resolveDataTagsForArchiveEvents', () => {
  it('calls the resolve function to retrieve dataTags for a archive events', async () => {
    const dataTagsResolutionClient = DataTagsResolutionClient;
    function getState() {
      return {
        ...baseState,
        event: {
          ...baseState.event,
          cultureCode: 'en-US',
          isArchived: true
        },
        clients: {
          dataTagsResolutionClient
        }
      };
    }

    store = mockStore(getState());

    await resolveDataTagsForArchiveEvents(store.dispatch, store.getState, datatags, options);
    expect((dataTagsResolutionClient as $TSFixMe).resolve).toHaveBeenCalledWith(datatags, 'en-US');
  });
});
