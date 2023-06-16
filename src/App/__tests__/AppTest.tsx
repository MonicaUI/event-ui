import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import EventGuestSideWidgetFactory from '../../widgetFactory';
import { GraphQLSiteEditorDataReleases } from '../../ExperimentHelper';
import { createApp, AppWithGraphQL, AppWithRedux } from '../index';
import * as ExperimentHelper from '../../ExperimentHelper';
import ApolloClient from '@apollo/client';

jest.mock('../PageRenderer');
jest.mock('@apollo/client', () => ({
  ...jest.requireActual<typeof ApolloClient>('@apollo/client'),
  useQuery: jest.fn().mockReturnValue({
    data: {
      event: {
        registrationPath: {
          page: EventSnapshot.eventSnapshot.siteEditor.website.pages.regProcessStep2
        }
      }
    }
  })
}));
jest.mock('../../redux/website/registrationProcesses', () => ({
  CANCELLATION: {
    isTypeOfPage: jest.fn(() => true)
  },
  DECLINE: {
    isTypeOfPage: jest.fn(() => true)
  },
  GUEST_REGISTRATION: {
    isTypeOfPage: jest.fn(() => true)
  },
  POST_REGISTRATION_PAYMENT: {
    isTypeOfPage: jest.fn(() => true)
  },
  REGISTRATION: {
    isTypeOfPage: jest.fn(() => true)
  },
  WAITLIST: {
    isTypeOfPage: jest.fn(() => true)
  }
}));

let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Development;
jest.mock('../../ExperimentHelper', () => ({
  ...jest.requireActual<typeof ExperimentHelper>('../../ExperimentHelper'),
  useGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

const initialState = {
  defaultUserSession: {
    isTestMode: false,
    isPlanner: false,
    isPreview: false
  },
  pathInfo: {
    currentPageId: 'test',
    queryParams: {
      hideHeaderFooter: ''
    }
  },
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  widgetFactory: {
    loadMetaData: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadMetaData(x),
    loadComponent: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadComponent(x)
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPath1: {
          isDefault: true,
          id: 'regPath1',
          name: 'regPath1',
          pageIds: Object.keys(EventSnapshot.eventSnapshot.siteEditor.website.pages)
        }
      }
    }
  },
  regCartStatus: {},
  registrationForm: {
    regCart: {
      regCartId: 'REG_CART_ID'
    }
  },
  event: {
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationPaths: true,
        multipleRegistrationTypes: true
      }
    },
    eventSecuritySetupSnapshot: {}
  },
  websitePassword: {
    isValidPassword: true
  }
};

const store = createStoreWithMiddleware(
  combineReducers({
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    website: (x = {}) => x,
    text: (x = {}) => x,
    widgetFactory: (x = {}) => x,
    appData: (x = {}) => x,
    pathInfo: (x = {}) => x,
    regCartStatus: (x = {}) => x,
    registrationForm: (x = {}) => x,
    event: (x = {}) => x,
    websitePassword: (x = {}) => x,
    isEmbeddedRegistration: (x = {}) => x
  }),
  initialState
);

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('RegistrationNavigatorWidget using %s site editor data', (_description, experimentStatus) => {
  const useGraphQLSiteEditorData = experimentStatus === GraphQLSiteEditorDataReleases.Development;
  beforeEach(() => {
    mockUseGraphQLSiteEditorData = experimentStatus;
  });
  describe('App', () => {
    test('renders correct wrappers based on experiment', async () => {
      const pageId = initialState.website.pages.regProcessStep1.id;
      const TestApp = createApp('');
      const component = mount(
        <Provider store={store}>
          <TestApp assetRoot="test" isPageUnderForm pageId={pageId} />
        </Provider>
      );
      expect(component.exists(AppWithGraphQL)).toEqual(useGraphQLSiteEditorData);
      expect(component.exists(AppWithRedux)).toEqual(!useGraphQLSiteEditorData);
    });
  });
});
