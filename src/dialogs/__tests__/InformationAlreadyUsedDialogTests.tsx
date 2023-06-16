import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openInformationAlreadyUsedDialog } from '../InformationAlreadyUsedDialog';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { wait } from '../../testUtils';
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

describe('InformationAlreadyUsedDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openInformationAlreadyUsedDialog());
    expect(dialog).toMatchSnapshot();
  });
  test('make sure close handler is set up', async () => {
    dialog.update();
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });
});
