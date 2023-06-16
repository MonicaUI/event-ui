import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openTransactionInProcessingErrorDialog } from '../TransactionInProcessingErrorDialog';
import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { wait } from '../../testUtils';
import { routeToHomePage } from '../../redux/pathInfo';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

jest.mock('../../redux/pathInfo', () => ({
  routeToHomePage: jest.fn(() => () => {})
}));

jest.mock('nucleus-core/containers/Transition');

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    defaultUserSession: {
      isPlanner: false
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    }
  }
);

describe('TransactionInProcessingErrorDialog', () => {
  test('matches snapshot when opened', () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openTransactionInProcessingErrorDialog());
    expect(dialog).toMatchSnapshot();
  });
  test('make sure close handler is set up', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openTransactionInProcessingErrorDialog());
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(routeToHomePage).toBeCalled();
  });
});
