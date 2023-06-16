import React from 'react';
import { mount } from 'enzyme';
import openConfirmationDialog from '../ConfirmationDialog';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

jest.mock('../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    website: (x = {}) => x,
    text: (x = {}) => x
  }),
  {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    }
  }
);

describe('ConfirmationDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(
      openConfirmationDialog({
        title: 'dummy title',
        subMessage: 'message',
        confirm: () => {},
        cancel: () => {}
      })
    );
    expect(dialog).toMatchSnapshot();
  });
});
