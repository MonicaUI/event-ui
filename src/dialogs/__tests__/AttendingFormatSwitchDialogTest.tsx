import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openEventAttendingFormatSwitchDialog } from '../AttendingFormatSwitchDialog';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

jest.mock('nucleus-core/containers/Transition');

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
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    }
  }
);

describe('AttendingFormatSwitchDialog Test', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('open attending format switch dialog with correct properties', () => {
    store.dispatch(openEventAttendingFormatSwitchDialog());
    dialog.update();
    expect(store.getState().dialogContainer.dialog.children.props.title).toBe(
      'EventGuestSide_EventAttendingFormatSwitch_Title__resx'
    );
    expect(store.getState().dialogContainer.dialog.children.props.message).toBe(
      'EventGuestSide_EventAttendingFormatSwitch_Message__resx'
    );
    expect(store.getState().dialogContainer.dialog.children.props.subMessage).toBe(
      'EventGuestSide_EventAttendingFormatSwitch_SubMessage__resx'
    );
  });
});
