/* global */
import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openSingleSignOnRegistrationDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { beginNewRegistration, startAdminRegistration } from '../../../routing/startRegistration';
import { wait } from '../../../testUtils';
import { openPrivateEventErrorDialog } from '../../PrivateEventErrorDialog';
import EventGuestAttendeeClient from '../../../clients/EventGuestAttendeeClient';
import { MockedProvider } from '@apollo/client/testing';

const regCart = {
  eventRegistrationPricings: [
    {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001'
    }
  ],
  regCartId: 'ed86b8ee-8982-4395-ae24-336a3dc8e234',
  productSubTotalAmountRefund: '0',
  productFeeAmountRefund: '0'
};

const externalAuthClient = {};
const eventGuestsideAttendeeClient = new EventGuestAttendeeClient();

jest.mock('../../../routing/startRegistration');
(startAdminRegistration as $TSFixMe).mockImplementation(() => () => {});
(beginNewRegistration as $TSFixMe).mockImplementation(() => () => {});

jest.mock('../../PrivateEventErrorDialog');
(openPrivateEventErrorDialog as $TSFixMe).mockImplementation(() => () => {});

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    regCart: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    accessToken: (x = {}) => x,
    user: (x = {}) => x,
    event: (x = {}) => x,
    externalAuthentication: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      resolver: {
        date: () => 'some date',
        currency: x => x
      }
    },
    externalAuthentication: { hasDialogBeenOpened: false },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    regCart: {
      regCart
    },
    userSession: {
      authenticatedContact: 'authenticatedContact',
      hasRegisteredInvitees: false
    },
    clients: { externalAuthClient, eventGuestsideAttendeeClient },
    accessToken: 'accessToken',
    event: { eventFeatureSetup: { other: { contactSnapshot: false } } }
  }
);

const registeredInviteeStore = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    regCart: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    accessToken: (x = {}) => x,
    user: (x = {}) => x,
    event: (x = {}) => x,
    externalAuthentication: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      resolver: {
        date: () => 'some date',
        currency: x => x
      }
    },
    externalAuthentication: { hasDialogBeenOpened: false },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    regCart: {
      regCart
    },
    userSession: {
      authenticatedContact: 'authenticatedContact',
      hasRegisteredInvitees: true,
      registeredInvitees: [
        {
          firstName: 'one',
          lastName: 'one',
          inviteeStub: '49aceaaa-018b-4953-8f84-bd4cb5a99a61',
          confirmationNumber: 'K4N8KNGRMJ6',
          emailAddress: 'one@j.mail',
          isAdmin: false
        },
        {
          firstName: 'three',
          lastName: 'three',
          inviteeStub: '5ad730cb-2d1b-488a-b04a-2fb94eda6dd4',
          confirmationNumber: 'T4N2K798KY6',
          emailAddress: 'three@j.mail',
          isAdmin: false
        },
        {
          firstName: 'two',
          lastName: 'two',
          inviteeStub: '18446598-ef68-4e5c-b791-584305047337',
          confirmationNumber: 'BLNZLJHPLD7',
          emailAddress: 'two@j.mail',
          isAdmin: false
        }
      ]
    },
    clients: { externalAuthClient, eventGuestsideAttendeeClient },
    accessToken: 'accessToken',
    event: { eventFeatureSetup: { other: { contactSnapshot: false } } }
  }
);

const registeredInviteeStoreAdminRegistered = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    regCart: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    accessToken: (x = {}) => x,
    user: (x = {}) => x,
    event: (x = {}) => x,
    externalAuthentication: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      resolver: {
        date: () => 'some date',
        currency: x => x
      }
    },
    externalAuthentication: { hasDialogBeenOpened: false },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    regCart: {
      regCart
    },
    userSession: {
      authenticatedContact: 'authenticatedContact',
      hasRegisteredInvitees: true,
      registeredInvitees: [
        {
          firstName: 'one',
          lastName: 'one',
          inviteeStub: '49aceaaa-018b-4953-8f84-bd4cb5a99a61',
          confirmationNumber: 'K4N8KNGRMJ6',
          emailAddress: 'one@j.mail',
          isAdmin: true
        },
        {
          firstName: 'three',
          lastName: 'three',
          inviteeStub: '5ad730cb-2d1b-488a-b04a-2fb94eda6dd4',
          confirmationNumber: 'T4N2K798KY6',
          emailAddress: 'three@j.mail',
          isAdmin: false
        },
        {
          firstName: 'two',
          lastName: 'two',
          inviteeStub: '18446598-ef68-4e5c-b791-584305047337',
          confirmationNumber: 'BLNZLJHPLD7',
          emailAddress: 'two@j.mail',
          isAdmin: false
        }
      ]
    },
    clients: { externalAuthClient, eventGuestsideAttendeeClient },
    accessToken: 'accessToken',
    event: { eventFeatureSetup: { other: { contactSnapshot: false } } }
  }
);

const dialogStore = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    regCart: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    accessToken: (x = {}) => x,
    user: (x = {}) => x,
    event: (x = {}) => x,
    externalAuthentication: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      resolver: {
        date: () => 'some date',
        currency: x => x
      }
    },
    externalAuthentication: { hasDialogBeenOpened: true },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    regCart: {
      regCart
    },
    userSession: {
      authenticatedContact: 'authenticatedContact',
      hasRegisteredInvitees: false
    },
    clients: { externalAuthClient, eventGuestsideAttendeeClient },
    accessToken: 'accessToken',
    event: { eventFeatureSetup: { other: { contactSnapshot: false } } }
  }
);

describe('Single Sign on Reg Dialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <MockedProvider>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </MockedProvider>
    </Provider>
  );

  test('matches registered invitees snapshot when opened', () => {
    store.dispatch(openSingleSignOnRegistrationDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('click on admin Registration in reg dialog with registered invitees', async () => {
    (externalAuthClient as $TSFixMe).updateContact = jest.fn(() => {});
    store.dispatch(openSingleSignOnRegistrationDialog());
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(startAdminRegistration).toHaveBeenCalled();
  });

  test('click on invitee Registration in reg dialog with registered invitees', async () => {
    (externalAuthClient as $TSFixMe).createInvitee = jest.fn(() => ({ inviteeStub: 'inviteeStub' }));
    store.dispatch(openSingleSignOnRegistrationDialog());
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(beginNewRegistration).toHaveBeenCalled();
  });

  test('click on invitee Registration in reg dialog, private event, invitee not in invitation list', async () => {
    (externalAuthClient as $TSFixMe).createInvitee = jest.fn(() => {
      // eslint-disable-next-line no-throw-literal
      throw {
        responseStatus: 500,
        responseBody: {
          returnMessage: 'private event',
          returnCode: -3
        }
      };
    });
    store.dispatch(openSingleSignOnRegistrationDialog());
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(openPrivateEventErrorDialog).toHaveBeenCalled();
  });
});

describe('Single Sign on Reg Dialog with Registered Invitees', () => {
  const dialog = mount(
    <Provider store={registeredInviteeStore}>
      <MockedProvider>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </MockedProvider>
    </Provider>
  );

  test('matches snapshot when opened', () => {
    registeredInviteeStore.dispatch(openSingleSignOnRegistrationDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('click on admin Registration in reg dialog with Registered Invitees', async () => {
    (externalAuthClient as $TSFixMe).updateContact = jest.fn(() => {});
    registeredInviteeStore.dispatch(openSingleSignOnRegistrationDialog());
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(startAdminRegistration).toHaveBeenCalled();
  });

  test('click on invitee Registration in reg dialog with Registered Invitees', async () => {
    (externalAuthClient as $TSFixMe).createInvitee = jest.fn(() => ({ inviteeStub: 'inviteeStub' }));
    registeredInviteeStore.dispatch(openSingleSignOnRegistrationDialog());
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(beginNewRegistration).toHaveBeenCalled();
  });
});

describe('Single Sign on Reg Dialog with Registered Invitees and himself as Admin', () => {
  const dialog = mount(
    <Provider store={registeredInviteeStoreAdminRegistered}>
      <MockedProvider>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </MockedProvider>
    </Provider>
  );

  test('matches snapshot when opened', () => {
    registeredInviteeStoreAdminRegistered.dispatch(openSingleSignOnRegistrationDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('click on admin Registration in reg dialog with Registered Invitees and himself as Admin', async () => {
    (externalAuthClient as $TSFixMe).updateContact = jest.fn(() => {});
    registeredInviteeStoreAdminRegistered.dispatch(openSingleSignOnRegistrationDialog());
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(startAdminRegistration).toHaveBeenCalled();
  });
});

describe('Dialog header popup test', () => {
  const dialog = mount(
    <Provider store={dialogStore}>
      <MockedProvider>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </MockedProvider>
    </Provider>
  );
  test('render cross button when hasDialogBeenOpened flag is true', () => {
    dialogStore.dispatch(openSingleSignOnRegistrationDialog());
    expect(dialog).toMatchSnapshot();
  });
});
