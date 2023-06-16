import { optOutReducer } from '../redux';
import { createOptOutPageHandler, prepareForOptOutPageLoad } from '..';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import websiteReducer from '../../../redux/website';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import WidgetFactory from '../../../widgetFactory';
import Content from 'nucleus-guestside-site/src/containers/Content';
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import OptOutButtonWidget from '../widgets/OptOutButtonWidget';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';

const someContact = { some: 'contact' };

const accessToken = 'some token';
const event = { id: 'some-event-id' };
const inviteeId = 'some-invitee-id';

const initialState = {
  clients: {
    eventGuestClient: {
      optOut: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(someContact);
        })
      ),
      getOptOutStatus: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(someContact);
        })
      )
    }
  },
  accessToken,
  userSession: { inviteeId },
  event,
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  widgetFactory: new WidgetFactory(),
  pathInfo: {
    rootPath: ''
  },
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  }
};
function reducer(state, action) {
  return {
    ...state,
    optOut: optOutReducer(state.optOut, action),
    website: websiteReducer(state.website, action)
  };
}

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

test('Prepare page load gets status', async () => {
  const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
  await mockStore.dispatch(prepareForOptOutPageLoad());

  expect(mockStore.getState().optOut).toEqual({ some: 'contact' });
});

test('Verify page content is loaded', async () => {
  const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));

  const pageHandler = createOptOutPageHandler(mockStore);

  const replace = jest.fn();
  const nextRouterState = { history: { replace } };

  await pageHandler(nextRouterState);
  expect(replace).toHaveBeenCalledWith('optInOut');
  const rootLayoutItemId = mockStore.getState().website.pages.optInOut.rootLayoutItemIds[0];
  expect(rootLayoutItemId).toBeTruthy();

  const pageElement = (
    <Provider store={mockStore}>
      <Content rootLayoutItemId={rootLayoutItemId} />
    </Provider>
  );
  const renderedPage = renderer.create(pageElement);
  await import('../content'); // Let widget components load
  renderedPage.update(pageElement);
  await waitWithAct();
  expect(renderedPage).toMatchSnapshot();

  // eventWebsiteNavigation didn't get removed when loading content
  expect(mockStore.getState().website.pluginData.eventWebsiteNavigation).toBe(
    EventSnapshot.eventSnapshot.siteEditor.website.pluginData.eventWebsiteNavigation
  );
});

test('Prepare page load gets status for contact', async () => {
  // remove invitee from session to ensure we don't fall back on trying to opt out the invitee on session
  const state = {
    ...initialState,
    userSession: {}
  };
  // add contact id to URL
  window.history.pushState({}, 'Opt Out', '?c=1234');
  const mockStore = createStore(reducer, state, applyMiddleware(thunk));
  await mockStore.dispatch(prepareForOptOutPageLoad());
  expect(mockStore.getState().optOut).toEqual({ some: 'contact' });
});

test('Verify page content is loaded for contact', async () => {
  const state = {
    ...initialState,
    userSession: {}
  };
  window.history.pushState({}, 'Opt Out', '?c=1234');
  const mockStore = createStore(reducer, state, applyMiddleware(thunk));
  const pageHandler = createOptOutPageHandler(mockStore);
  const replace = jest.fn();
  const nextRouterState = { history: { replace } };
  await pageHandler(nextRouterState);
  expect(replace).toHaveBeenCalledWith('optInOut?c=1234');
  const rootLayoutItemId = mockStore.getState().website.pages.optInOut.rootLayoutItemIds[0];
  expect(rootLayoutItemId).toBeTruthy();
  const pageElement = (
    <Provider store={mockStore}>
      <Content rootLayoutItemId={rootLayoutItemId} />
    </Provider>
  );
  const renderedPage = renderer.create(pageElement);
  await import('../content'); // Let widget components load
  renderedPage.update(pageElement);
  await waitWithAct();
  expect(renderedPage).toMatchSnapshot();
});

test.each([true, false])('OptOutButtonWidget produces props from state: optOutStatus %s', optOutStatus => {
  const state = {
    ...initialState,
    optOut: {
      optOutStatus
    }
  };
  const defaultProps = {
    config: {
      text: 'text',
      alternateText: 'alternateText'
    }
  };
  const mockStore = createStore(reducer, state, applyMiddleware(thunk));
  const widget = shallow(<OptOutButtonWidget store={mockStore} {...defaultProps} />);
  const props = widget.find(ButtonWidget).props();
  expect(props).toMatchObject({
    optOutStatus,
    config: {
      text: optOutStatus ? 'text' : 'alternateText'
    },
    clickHandler: expect.any(Function)
  });
});
