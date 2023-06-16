import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openInvalidPhoneNumberDialog } from '../InvalidPhoneNumberDialog';
import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { wait } from '../../testUtils';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';
import { scrollToFieldAndFocus } from '../shared/dialogUtils';

jest.mock('../shared/dialogUtils');

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

describe('InvalidPhoneNumberDialogTest', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openInvalidPhoneNumberDialog(null));
    expect(dialog).toMatchSnapshot();
  });
  test('close handler is set up', async () => {
    store.dispatch(openInvalidPhoneNumberDialog(null));
    dialog.update();
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(dialog.find('[class="dialogContainer"]').length).toBe(0);
  });
  test('continue handler is set up', () => {
    const callback = jest.fn();
    store.dispatch(openInvalidPhoneNumberDialog(callback));
    dialog.update();
    dialog.find('[data-cvent-id="cancel-selection"]').hostNodes().simulate('click');
    expect(callback).toHaveBeenCalled();
  });
  test('reenter phone number handler is set up, mobile field not found', () => {
    store.dispatch(openInvalidPhoneNumberDialog(null));
    dialog.update();
    dialog.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    expect(scrollToFieldAndFocus).toHaveBeenCalled();
  });
  test('reenter phone number handler is set up', () => {
    jest.useFakeTimers();

    const newInput = document.createElement('input');
    newInput.setAttribute('id', Fields.mobile.id);
    global.document.body.appendChild(newInput);

    store.dispatch(openInvalidPhoneNumberDialog(null));
    dialog.update();
    dialog.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');

    jest.runAllTimers();
    expect(scrollToFieldAndFocus).toHaveBeenCalled();
  });
});
