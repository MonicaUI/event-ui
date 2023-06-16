import React from 'react';
import { Provider } from 'react-redux';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import gql from 'graphql-tag';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import { createCache } from '../apolloCache';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { createLink } from '../apolloLinkFetchRequest';

const eventId = '11111111-2222-3333-4444-555555555555';
const middleware = [thunk];
const mockStore = configureMockStore(middleware);

function getState() {
  return {
    userSession: {
      eventId: 'dummyEventId',
      isPreview: false,
      defaultRegPathId: 'dummyRegPathId'
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          primaryEventRegId: {
            eventRegistrationId: 'primaryEventRegId',
            registrationTypeId: '001',
            registrationPathId: 'testRegPath',
            sessionRegistrations: {
              '831e0045-86d3-4133-89a8-4f26172b9d10': {}
            }
          },
          guestEventRegId: {
            eventRegistrationId: 'guestEventRegId',
            primaryRegistrationId: 'primaryEventRegId',
            registrationTypeId: '001',
            registrationPathId: 'testRegPath',
            attendeeType: 'GUEST',
            sessionRegistrations: {
              '831e0045-86d3-4133-89a8-4f26172b9d10': {}
            }
          }
        }
      },
      currentGuestEventRegistration: {
        eventRegistrationId: 'guestEventRegId'
      }
    },
    eventSnapshotVersion: EventSnapshot.eventSnapshot.version,
    account: EventSnapshot.accountSnapshot,
    appData: {
      registrationSettings: {
        registrationPaths: {
          testRegPath: {
            id: 'testRegPath',
            isDefault: true,
            guestRegistrationSettings: {
              isGuestRegistrationEnabled: true
            }
          }
        }
      }
    },
    event: {
      id: 'eventId'
    },
    website: {
      pages: {
        summary: { id: 'summary', name: 'summary' },
        postregpages: { id: 'postregpages', name: 'postregpages' },
        website_custom1: { id: 'custom1', name: 'Page1' },
        website_custom2: { id: 'custom2', name: 'Page2' }
      },
      pluginData: {
        eventWebsiteNavigation: {
          childIds: ['summary', 'postregpages', 'custom1', 'custom2']
        }
      }
    }
  };
}

let store;
beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(getState());
});

describe('ApolloClient', () => {
  it('should render with ApolloProvider', () => {
    const apolloClient = new ApolloClient({
      link: createLink('some-base-url'),
      cache: createCache(store, {
        eventId
      }),
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{}' is not assignable to type 'string | stri... Remove this comment to see the full error message
      typeDefs: {}
    });

    const widget = mount(
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          <div></div>
        </ApolloProvider>
      </Provider>
    );
    expect(widget).toMatchSnapshot();
  });

  it('should query local eventId field', async () => {
    const apolloClient = new ApolloClient({
      link: createLink('some-base-url'),
      cache: createCache(store, {
        eventId
      }),
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{}' is not assignable to type 'string | stri... Remove this comment to see the full error message
      typeDefs: {}
    });

    const TEST_QUERY = gql`
      query Test {
        eventId @client
      }
    `;

    const response = await apolloClient.query({
      query: TEST_QUERY
    });

    expect(response).toMatchObject({ data: { eventId } });
  });
});
