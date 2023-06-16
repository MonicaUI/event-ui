import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import Content from '../Content';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import ReadOnlyContent from 'nucleus-widgets/renderers/readOnlyContent';
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

const rootLayoutItemId = initialState.website.pages.regProcessStep1.rootLayoutItemIds[0];
const layoutItemsFromState = initialState.website.layoutItems;
const layoutItemsFromProps = {
  'id-test': {
    id: 'id-test',
    layout: {
      type: 'container',
      cellSize: 1,
      colspan: 2,
      parentId: null,
      childIds: ['test-123456789']
    },
    config: {
      style: {}
    }
  }
};
const pageFromProps = {
  id: 'page:1234567',
  name: 'page_from_props',
  rootLayoutItemIds: ['id-1'],
  type: 'PAGE',
  layoutItems: layoutItemsFromProps
};

describe('Content', () => {
  test('uses layout items from state when not passed as prop', () => {
    const page = mount(
      <Provider store={store}>
        <Content rootLayoutItemId={rootLayoutItemId} />
      </Provider>
    );
    expect(page.find(ReadOnlyContent).props().layoutItems).toEqual(layoutItemsFromState);
  });
  test('uses layout items from props when passed', () => {
    const page = mount(
      <Provider store={store}>
        <Content rootLayoutItemId={rootLayoutItemId} page={pageFromProps} />
      </Provider>
    );
    expect(page.find(ReadOnlyContent).props().layoutItems).toEqual(layoutItemsFromProps);
  });
});
