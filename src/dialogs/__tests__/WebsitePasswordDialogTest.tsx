import { mount } from 'enzyme';
import React from 'react';
import { openWebsitePasswordDialog } from '../WebsitePasswordDialog';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { setReferrer } from '../../redux/actions';
import { routeToPage } from '../../redux/pathInfo';
import { combineReducers } from 'redux';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { act } from '@testing-library/react';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

jest.mock('../../redux/actions');
jest.mock('../../redux/pathInfo');

const websitePasswordClient = {
  verifyPassword: jest.fn()
};

const translate = jest.fn();
describe('WebsitePasswordDialog tests', () => {
  let store;
  let dialog;
  let error;

  beforeEach(() => {
    store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        text: (x = {}) => x,
        website: (x = {}) => x,
        event: (x = {}) => x,
        clients: (x = {}) => x
      }),
      {
        text: {
          translate
        },
        website: {
          theme: EventSnapshot.eventSnapshot.siteEditor.website.theme,
          referrer: 'alreadyRegistered'
        },
        event: {
          id: 'eventId',
          title: 'Website Passcode Title'
        },
        clients: { websitePasswordClient }
      }
    );
    translate.mockImplementation(x => x);
    dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
  });

  it('Displays', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    expect(dialog).toMatchSnapshot();
  });
  it('Translate function is called with value as that of event title', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    expect(translate).toHaveBeenCalledWith('Website Passcode Title');
  });
  it('Displays empty message when input is empty on blur', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('blur');
    dialog.update();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error).toMatchSnapshot();
  });
  it('Displays empty message when input is empty on submit', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[data-cvent-id="submit-password-button"]').hostNodes().simulate('click');
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error).toMatchSnapshot();
  });
  it('Clears errors when onChange is called', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('blur');
    dialog.update();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error).toMatchSnapshot();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('change', 'passwordField', 'yeet');
    dialog.update();
    expect(dialog.find('[data-cvent-id="error-message"]').exists()).toBeFalsy();
  });
  it('Displays empty message when input is empty and Enter key is pressed', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('keypress', { key: 'Enter' });
    dialog.update();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error).toMatchSnapshot();
  });
  it('Displays incorrect message when input password is incorrect, on Enter keypress', async () => {
    websitePasswordClient.verifyPassword.mockImplementation(() => Promise.resolve({ ok: false }));
    await act(async () => {
      await store.dispatch(openWebsitePasswordDialog());
      dialog.update();
      dialog
        .find('[id="websitePassword"]')
        .hostNodes()
        .simulate('change', { target: { value: 'yeet' } });
      dialog.find('[id="websitePassword"]').hostNodes().simulate('keypress', { key: 'Enter' });
      await wait(100);
      dialog.update();
    });

    expect(websitePasswordClient.verifyPassword).toHaveBeenCalled();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error).toMatchSnapshot();
  });
  it('Displays incorrect message when input password is incorrect, on submit', async () => {
    websitePasswordClient.verifyPassword.mockImplementation(() => Promise.resolve({ ok: false }));
    await act(async () => {
      await store.dispatch(openWebsitePasswordDialog());
      dialog.update();
      dialog
        .find('[id="websitePassword"]')
        .hostNodes()
        .simulate('change', { target: { value: 'yeet' } });
      dialog.find('[data-cvent-id="submit-password-button"]').hostNodes().simulate('click');
      await wait(100);
      dialog.update();
    });
    expect(websitePasswordClient.verifyPassword).toHaveBeenCalled();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error).toMatchSnapshot();
  });
  it('redirects to referrer, on submit', async () => {
    websitePasswordClient.verifyPassword.mockImplementation(() => Promise.resolve({ ok: true }));
    (setReferrer as $TSFixMe).mockImplementation(() => ({ type: 'TEST_SET_REFERRER' }));
    (routeToPage as $TSFixMe).mockImplementation(() => ({ type: 'TEST_ROUTE_TO_PAGE' }));
    await act(async () => {
      await store.dispatch(openWebsitePasswordDialog());
      dialog.update();
      dialog
        .find('[id="websitePassword"]')
        .hostNodes()
        .simulate('change', { target: { value: 'yeet' } });
      dialog.find('[data-cvent-id="submit-password-button"]').hostNodes().simulate('click');
      await wait(100);
      dialog.update();
    });
    expect(setReferrer).toHaveBeenCalledWith(null);
    expect(routeToPage).toHaveBeenCalledWith('alreadyRegistered');
  });
});

describe('WebsitePasswordDialog tests for archived event', () => {
  let store;
  let dialog;
  let error;

  beforeEach(() => {
    store = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        text: (x = {}) => x,
        website: (x = {}) => x,
        event: (x = {}) => x,
        clients: (x = {}) => x
      }),
      {
        text: {
          translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
        },
        website: {
          theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
        },
        event: {
          id: 'eventId',
          title: 'Website Passcode Title',
          isArchived: true,
          eventSecuritySetupSnapshot: {
            authenticationLocation: 0,
            authenticationType: 2
          }
        },
        clients: { websitePasswordClient }
      }
    );
    dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
  });

  it('Displays', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    expect(dialog).toMatchSnapshot();
  });
  it('Displays empty message when input is empty on blur', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('blur');
    dialog.update();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error.props().children).toEqual('EventGuestSide_WebsitePassword_PasswordBlank_resx');
  });
  it('Displays empty message when input is empty on submit', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[data-cvent-id="submit-password-button"]').hostNodes().simulate('click');
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error.props().children).toEqual('EventGuestSide_WebsitePassword_PasswordBlank_resx');
  });
  it('Clears errors when onChange is called', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('blur');
    dialog.update();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error.props().children).toEqual('EventGuestSide_WebsitePassword_PasswordBlank_resx');
    dialog.find('[id="websitePassword"]').hostNodes().simulate('change', 'passwordField', 'yeet');
    dialog.update();
    expect(dialog.find('[data-cvent-id="error-message"]').exists()).toBeFalsy();
  });
  it('Displays empty message when input is empty and Enter key is pressed', async () => {
    await store.dispatch(openWebsitePasswordDialog());
    dialog.update();
    dialog.find('[id="websitePassword"]').hostNodes().simulate('keypress', { key: 'Enter' });
    dialog.update();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error.props().children).toEqual('EventGuestSide_WebsitePassword_PasswordBlank_resx');
  });
  it('Displays incorrect message when input password is incorrect, on Enter keypress', async () => {
    websitePasswordClient.verifyPassword.mockImplementation(() => Promise.resolve({ ok: false }));
    await act(async () => {
      await store.dispatch(openWebsitePasswordDialog());
      dialog.update();
      dialog
        .find('[id="websitePassword"]')
        .hostNodes()
        .simulate('change', { target: { value: 'yeet' } });
      dialog.find('[id="websitePassword"]').hostNodes().simulate('keypress', { key: 'Enter' });
      await wait(100);
      dialog.update();
    });
    expect(websitePasswordClient.verifyPassword).toHaveBeenCalled();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error.props().children).toEqual('EventGuestSide_WebsitePassword_PasswordInvalid__resx');
  });
  it('Displays incorrect message when input password is incorrect, on submit', async () => {
    websitePasswordClient.verifyPassword.mockImplementation(() => Promise.resolve({ ok: false }));
    await act(async () => {
      await store.dispatch(openWebsitePasswordDialog());
      dialog.update();
      dialog
        .find('[id="websitePassword"]')
        .hostNodes()
        .simulate('change', { target: { value: 'yeet' } });
      dialog.find('[data-cvent-id="submit-password-button"]').hostNodes().simulate('click');
      await wait(100);
      dialog.update();
    });
    expect(websitePasswordClient.verifyPassword).toHaveBeenCalled();
    error = dialog.find('[data-cvent-id="error-message"]').hostNodes();
    expect(error.props().children).toEqual('EventGuestSide_WebsitePassword_PasswordInvalid__resx');
  });
  it('calls verifyPassword on submit', async () => {
    websitePasswordClient.verifyPassword.mockImplementation(() => Promise.resolve({ ok: true }));
    await act(async () => {
      await store.dispatch(openWebsitePasswordDialog());
      dialog.update();
      dialog
        .find('[id="websitePassword"]')
        .hostNodes()
        .simulate('change', { target: { value: 'yeet' } });
      dialog.find('[data-cvent-id="submit-password-button"]').hostNodes().simulate('click');
      await wait(100);
      dialog.update();
    });
    expect(websitePasswordClient.verifyPassword).toHaveBeenCalled();
    expect(dialog.find('[data-cvent-id="error-message"]').exists()).toBeFalsy();
  });
});
