import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import NavigatorWidget, { NavigatorWidgetProps } from '../NavigatorWidget';
import { expect } from '@jest/globals';
import { cloneDeep, set } from 'lodash';
import { getNextPage } from '../../../redux/website/navigation';

jest.mock('../../../redux/website/navigation', () => ({
  getNextPage: jest.fn(() => Promise.resolve({ id: 'page2' }))
}));

const baseState = {
  text: {
    locale: 'en'
  },
  pathInfo: {
    currentPageId: 'page1'
  },
  event: {
    registrationTypes: {},
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationTypes: true
      },
      agendaItems: {
        admissionItems: false
      }
    },
    id: 'EVENT_ID',
    version: 'VERSION'
  },
  website: {
    ...pageContainingWidgetFixture('pageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId']
          }
        }
      }
    }
  },
  appData: {},
  userSession: {
    regCartId: 'REG_CART_ID'
  },
  defaultUserSession: {
    isPreview: false
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventRegId: {
          registrationPathId: 'regPathId'
        }
      },
      regCartId: 'REG_CART_ID'
    }
  },
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  },
  experiments: {
    graphQLForEventCapacitiesVariant: 1
  },
  environment: 'TEST'
};

const reducer = state => state;

const createMockStore = state => {
  const apolloClient = {};
  return createStore(reducer, state, applyMiddleware(thunk.withExtraArgument({ apolloClient })));
};

const cloneState = state => {
  const clonedState = cloneDeep(state);
  set(
    clonedState,
    ['widgetFactory', 'loadMetaData'],
    jest.fn(() => {
      return {};
    })
  );
  return clonedState;
};

const mountComponent = async (props: Partial<NavigatorWidgetProps>, state?) => {
  const mockStore = createMockStore(state);
  const mergedProps: NavigatorWidgetProps = {
    config: {
      displayText: {
        backward: 'Previous',
        forward: 'Next',
        complete: 'Summary',
        exit: 'Cancel'
      }
    },
    style: {},
    classes: {},
    translate: text => text,
    pageIds: ['page1', 'page2'],
    onNavigateRequest: () => {},
    onCompleteRequest: () => {},
    onExitRequest: () => {},
    ...props
  };
  const component = mount(
    <Provider store={mockStore}>
      <MockedProvider mocks={[]} addTypename={false}>
        <NavigatorWidget {...mergedProps} />
      </MockedProvider>
    </Provider>
  );
  await component.update();
  return component;
};

const wait = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

describe('NavigatorWidget', () => {
  it('should render', async () => {
    const initialState = cloneState(baseState);
    const component = await mountComponent({}, initialState);
    expect(component).toMatchSnapshot();
  });
  it('should use getNextPage graphql query on forward navigation', async () => {
    const initialState = cloneState(baseState);
    const onNavigateRequest = jest.fn();
    const props = {
      onNavigateRequest
    };
    const component = await mountComponent(props, initialState);
    component.find('[id="forward"]').hostNodes().simulate('click');
    await wait(0);
    expect(getNextPage).toHaveBeenCalledWith('page1', expect.any(String), expect.any(String), expect.any(Object));
    expect(onNavigateRequest).toHaveBeenCalledWith('page2', true);
  });
});
