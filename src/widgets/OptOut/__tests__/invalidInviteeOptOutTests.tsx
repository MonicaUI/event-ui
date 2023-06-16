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
import { act } from 'react-dom/test-utils';

const someContact = { some: 'contact' };

const accessToken = 'some token';
const event = { id: 'some-event-id' };
const inviteeId = undefined;

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

  expect(mockStore.getState().optOut).toEqual({}); // do not make a client call to reutrn any contact
});

test('Verify opt-out page do not call the opt-out endpoint', async () => {
  const mockStore = createStore(reducer, initialState, applyMiddleware(thunk));
  const pageHandler = createOptOutPageHandler(mockStore);

  const replace = jest.fn();
  const nextRouterState = { history: { replace } };

  await pageHandler(nextRouterState);

  expect(initialState.clients.eventGuestClient.optOut).not.toHaveBeenCalled(); // do not make optOut client calls
  expect(replace).toHaveBeenCalledWith('optInOut');
  const rootLayoutItemId = mockStore.getState().website.pages.optInOut.rootLayoutItemIds[0];
  expect(rootLayoutItemId).toBeTruthy();

  const pageElement = (
    <Provider store={mockStore}>
      <Content rootLayoutItemId={rootLayoutItemId} />
    </Provider>
  );
  const renderedPage = renderer.create(pageElement);
  await import('../invalidInviteeContent'); // Let widget components load
  renderedPage.update(pageElement);
  await waitWithAct();
  expect(renderedPage).toMatchSnapshot();

  // eventWebsiteNavigation didn't get removed when loading content
  expect(mockStore.getState().website.pluginData.eventWebsiteNavigation).toStrictEqual(
    EventSnapshot.eventSnapshot.siteEditor.website.pluginData.eventWebsiteNavigation
  );
});
