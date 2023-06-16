import React from 'react';
// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
import { mount } from 'enzyme/build';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { combineReducers } from 'redux';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { openPaymentAmountServiceFeeConfirmationPostRegDialog } from '../index';

getMockedMessageContainer();

jest.mock('nucleus-core/containers/Transition');

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x
  }),
  {
    text: { translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx) },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    }
  }
);

describe('PaymentAmountServiceFeeConfirmationDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openPaymentAmountServiceFeeConfirmationPostRegDialog());
    expect(dialog).toMatchSnapshot();
  });
});
