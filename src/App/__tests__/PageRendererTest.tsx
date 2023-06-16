import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import PageRenderer from '../PageRenderer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import { getDefaultWebsitePageId } from '../../redux/website';
import EventGuestSideWidgetFactory from '../../widgetFactory';

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
          name: 'regPath1'
        }
      }
    }
  },
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
    registrationForm: (x = {}) => x,
    event: (x = {}) => x,
    websitePassword: (x = {}) => x,
    isEmbeddedRegistration: (x = {}) => x
  }),
  initialState
);

describe('PageRenderer', () => {
  test('matches snapshot', () => {
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(page).toMatchSnapshot();
  });
  test('matches snapshot with preview banner', () => {
    initialState.defaultUserSession.isPreview = true;
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(page).toMatchSnapshot();
    initialState.defaultUserSession.isPreview = false;
  });
  test('matches snapshot with test mode banner', () => {
    initialState.defaultUserSession.isTestMode = true;
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(page).toMatchSnapshot();
    initialState.defaultUserSession.isTestMode = false;
  });
  test('matches snapshot with planner banner', () => {
    initialState.defaultUserSession.isPlanner = true;
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(page).toMatchSnapshot();
    initialState.defaultUserSession.isPlanner = false;
  });
  test('matches snapshot with planner banner 1', () => {
    initialState.websitePassword.isValidPassword = false;
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(page).toMatchSnapshot();
    initialState.websitePassword.isValidPassword = true;
  });
  test('uses templatePage from state when not passed as props', () => {
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const templatePageFromState = initialState.website.pages[initialState.website.pages[defaultPageId].templatePageId];
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(page.find(PageRenderer).props().templatePage).toEqual(templatePageFromState);
  });
  test('uses templatePage from props when passed in', () => {
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const templatePageFromProps = {
      id: 'test-page'
    };
    const page = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} templatePage={templatePageFromProps} />
      </Provider>
    );
    expect(page.find(PageRenderer).props().templatePage).toEqual(templatePageFromProps);
  });
  test('hideHeaderFooter flag results in hiding header/footer for embedded registration', () => {
    (initialState as $TSFixMe).isEmbeddedRegistration = true;
    const defaultPageId = getDefaultWebsitePageId(initialState);
    const pageWithHeaderFooter = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(pageWithHeaderFooter.exists('[data-cvent-id="header"]')).toBeTruthy();
    expect(pageWithHeaderFooter.exists('[data-cvent-id="footer"]')).toBeTruthy();

    initialState.pathInfo.queryParams.hideHeaderFooter = 'true';
    const pageWithoutHeaderFooter = mount(
      <Provider store={store}>
        <PageRenderer page={initialState.website.pages[defaultPageId]} />
      </Provider>
    );
    expect(pageWithoutHeaderFooter.exists('[data-cvent-id="header"]')).toBeFalsy();
    expect(pageWithoutHeaderFooter.exists('[data-cvent-id="footer"]')).toBeFalsy();
  });
  (initialState as $TSFixMe).isEmbeddedRegistration = false;
  initialState.pathInfo.queryParams.hideHeaderFooter = '';
});
