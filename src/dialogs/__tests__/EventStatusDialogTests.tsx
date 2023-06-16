import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { openEventStatusDialog } from '../EventStatusDialog';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import React from 'react';
import { wait } from '../../testUtils';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

jest.mock('nucleus-core/containers/Transition');

const getStatusName = status => {
  switch (status) {
    case eventStatus.CLOSED:
      return 'CLOSED';
    case eventStatus.CANCELLED:
      return 'CANCELLED';
    case eventStatus.COMPLETED:
      return 'COMPLETED';
    case eventStatus.ACTIVE:
      return 'ACTIVE';
    case eventStatus.DELETED:
      return 'DELETED';
    case eventStatus.PENDING:
      return 'PENDING';
    case eventStatus.PROCESSING:
      return 'PROCESSING';
    case eventStatus.NO_REGISTRATION_REQUIRED:
      return 'NO_REGISTRATION_REQUIRED';
    default:
      return null;
  }
};

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    event: (x = {}) => x,
    userSessidon: (x = {}) => x,
    text: (x = {}) => x,
    plannerRegSettings: (x = {}) => x,
    website: (x = {}) => x
  }),
  {
    event: {
      title: 'Event Title'
    },
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    website: {
      theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
    }
  }
);

describe('EventStatusDialog', () => {
  [
    eventStatus.COMPLETED,
    eventStatus.CLOSED,
    eventStatus.CANCELLED,
    eventStatus.ACTIVE,
    eventStatus.DELETED,
    eventStatus.PENDING,
    eventStatus.PROCESSING,
    eventStatus.NO_REGISTRATION_REQUIRED
  ].forEach(status => {
    test(`matches snapshot when opened for ${getStatusName(status)} `, () => {
      const dialog1 = mount(
        <Provider store={store}>
          <DialogContainer spinnerMessage="spinnerMessage" message="message" />
        </Provider>
      );

      store.dispatch(openEventStatusDialog(status, x => x));
      expect(dialog1).toMatchSnapshot();
    });
  });

  test('clicking close works', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );

    store.dispatch(openEventStatusDialog(eventStatus.COMPLETED, x => x));

    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });
});
