import React from 'react';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openGroupCancelRegistrationDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { wait } from '../../../testUtils';
import registrantLogin from '../../../redux/registrantLogin';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { personaReducer } from '../../../redux/persona';

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});
const eventGuestClient = {};
const identifiedInvitee = { inviteeStatus: InviteeStatus.NoResponse };
const eventPersonaClient = {
  identifyInvitee: jest.fn().mockReturnValue(
    new Promise(resolve => {
      resolve(identifiedInvitee);
    })
  )
};
const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    pathInfo: (x = {}) => x,
    clients: (x = {}) => x,
    event: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    plannerRegSettings: (x = {}) => x,
    accessToken: (x = {}) => x,
    registrantLogin,
    registrationForm: (x = {}) => x,
    appData: (x = {}) => x,
    persona: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    clients: { eventGuestClient, eventPersonaClient },
    event: {
      id: 'eventId'
    },
    defaultUserSession: {
      isPreview: false,
      isPlanner: false
    },
    plannerRegSettings: {
      exitURL: 'url'
    },
    accessToken: 'accessToken',
    registrantLogin: {
      form: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress',
        confirmationNumber: 'confirmationNumber'
      },
      status: {
        login: {},
        resendConfirmation: {}
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          todoThisShouldBeRegPathId: {
            id: 'todoThisShouldBeRegPathId',
            isDefault: true
          }
        }
      }
    },
    persona: personaReducer
  }
);

describe('GroupCancelDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(
      openGroupCancelRegistrationDialog(() => () => true, {
        title: 'Group Cancel',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    expect(dialog).toMatchSnapshot();
  });
  test('closes group cancel dialog', () => {
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('Exits registration normally on clicking yes', async () => {
    store.dispatch(
      openGroupCancelRegistrationDialog(() => () => true, {
        title: 'Group Cancel',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(1000);
  });
});
