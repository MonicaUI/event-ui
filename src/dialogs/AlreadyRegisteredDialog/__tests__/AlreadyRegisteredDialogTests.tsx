import React from 'react';
import { mount } from 'enzyme';
import { openAlreadyRegisteredDialog } from '..';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import registrantLogin from '../../../redux/registrantLogin';
import registrationForm from '../../../redux/registrationForm/reducer';
import { RECOGNIZE_KNOWN_INVITEE } from '@cvent/event-ui-experiments';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { LOAD_ACCOUNT_SNAPSHOT } from '../../../redux/actionTypes';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import transformEventData from 'event-widgets/utils/transformEventData';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { personaReducer } from '../../../redux/persona';
import { loadRegistrationContent, setReferrer } from '../../../redux/actions';
import { act } from '@testing-library/react';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { onLogin } from '../index';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { EmailThrottleError } from '../../../clients/EventEmailClient';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));
jest.mock('../../../redux/actions', () => ({
  loadCombinedSnapshot: jest.fn(() => () => {}),
  loadRegistrationContent: jest.fn(() => () => {}),
  loadGuestRegistrationContent: jest.fn(() => () => {}),
  filterEventSnapshot: jest.fn(() => () => {}),
  setReferrer: jest.fn(() => () => {})
}));

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});

const regCartClient = {
  authorizeByConfirm: jest.fn(() => ({ accessToken: 'fakeAuthByConfirmToken' }))
};
const eventEmailClient = {};
function account(state = {}, action) {
  return action.type === LOAD_ACCOUNT_SNAPSHOT ? action.payload.account : state;
}
const eventSnapshotClient = {
  getAccountSnapshot: jest.fn(() => EventSnapshot.accountSnapshot),
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};

const actions = {
  loadRegistrationContent: jest.fn(() => loadRegistrationContent)
};

const eventPersonaClient = {};

const state = {
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  appData: transformEventData(
    EventSnapshot.eventSnapshot.siteEditor.eventData,
    EventSnapshot.accountSnapshot,
    EventSnapshot.eventSnapshot,
    EventSnapshot.eventSnapshot.siteEditor.website
  ),
  account: {
    settings: {
      dupMatchKeyType: 'EMAIL_ONLY'
    }
  },
  event: {
    id: 'eventId',
    eventSecuritySetupSnapshot: {}
  },
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
  timezones: [
    {
      id: 1,
      name: 'Samoa Time',
      nameResourceKey: 'Event_Timezone_Name_1__resx',
      plannerDisplayName: '(GMT-11:00) Samoa',
      abbreviation: 'ST',
      abbreviationResourceKey: 'Event_Timezone_Abbr_1__resx',
      dstInfo: [{}],
      hasDst: true,
      utcOffset: -660
    }
  ],
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  clients: { regCartClient, eventEmailClient, eventSnapshotClient, eventPersonaClient },
  userSession: {},
  defaultUserSession: {
    isPreview: false
  },
  experiments: {}
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('AlreadyRegisteredDialog', () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      account,
      dialogContainer,
      registrantLogin,
      registrationForm,
      event: (x = {}) => x,
      website: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      userSession: (x = {}) => x,
      experiments: (x = {}) => x,
      persona: personaReducer,
      defaultUserSession: (x = {}) => x
    }),
    {
      ...state
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('sets referrer to null on close', async () => {
    (setReferrer as $TSFixMe).mockImplementation(() => ({ type: 'TEST_SET_REFERRER' }));
    await act(async () => {
      await store.dispatch(
        openAlreadyRegisteredDialog({
          title: 'title',
          registerNowText: 'registerNowText',
          instructionalText: 'instructionalText'
        })
      );
      dialog.update();
      dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
      await wait(100);
      dialog.update();
    });
    expect(setReferrer).toHaveBeenCalledWith(null);
  });

  test('matches snapshot when opened', () => {
    store.dispatch(
      openAlreadyRegisteredDialog({
        title: 'title',
        registerNowText: 'registerNowText',
        instructionalText: 'instructionalText'
      })
    );
    dialog.update();
    expect(dialog).toMatchSnapshot();
  });

  test('matches snapshot when login submit fails', () => {
    (regCartClient as $TSFixMe).identifyByConfirm = jest.fn(() => {
      const err = {
        responseStatus: 422,
        responseBody: {
          validationMessages: [
            {
              localizationKey: 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND'
            }
          ]
        }
      };
      throw err;
    });
    dialog.find('[data-cvent-id="confirmation-number"] input').simulate('keypress', { key: 'Enter' });
    expect(dialog).toMatchSnapshot();
  });

  test.skip('redirects when login submit succeeds', async () => {
    const identifiedInvitee = { inviteeStatus: InviteeStatus.Accepted };
    (eventPersonaClient as $TSFixMe).identifyInvitee = jest.fn(() => ({
      ...identifiedInvitee
    }));
    (regCartClient as $TSFixMe).identifyByConfirm = jest.fn(() => ({
      regCart: {
        id: 'regCartId',
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'todoThisShouldBeRegPathId'
          }
        }
      }
    }));
    dialog.find('[data-cvent-id="confirmation-number"] input').simulate('keypress', { key: 'Enter' });
    expect((regCartClient as $TSFixMe).identifyByConfirm).toHaveBeenCalled();
    await wait(0);
    expect(eventSnapshotClient.getAccountSnapshot).toHaveBeenCalled();
    await wait(0);
    expect(eventSnapshotClient.getEventSnapshot).toHaveBeenCalled();
    await wait(0);
    expect(actions.loadRegistrationContent).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    expect(require('../../../redux/pathInfo').routeToPage).toHaveBeenCalledWith('confirmation');
  });

  test.skip('redirects when login submit succeeds - pending approval', async () => {
    const identifiedInvitee = { inviteeStatus: InviteeStatus.PendingApproval };
    (eventPersonaClient as $TSFixMe).identifyInvitee = jest.fn(() => ({
      ...identifiedInvitee
    }));
    (regCartClient as $TSFixMe).identifyByConfirm = jest.fn(() => ({
      regCart: {
        id: 'regCartId',
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'todoThisShouldBeRegPathId'
          }
        }
      }
    }));
    store.dispatch(
      openAlreadyRegisteredDialog({
        title: 'title',
        registerNowText: 'registerNowText',
        instructionalText: 'instructionalText'
      })
    );
    dialog.find('[data-cvent-id="confirmation-number"] input').simulate('keypress', { key: 'Enter' });
    expect((regCartClient as $TSFixMe).identifyByConfirm).toHaveBeenCalled();
    await wait(0);
    expect(eventSnapshotClient.getAccountSnapshot).toHaveBeenCalled();
    await wait(0);
    expect(eventSnapshotClient.getEventSnapshot).toHaveBeenCalled();
    await wait(0);
    expect(actions.loadRegistrationContent).toHaveBeenCalled();
    await wait(0);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    expect(require('../../../redux/pathInfo').routeToPage).toHaveBeenCalledWith('registrationPendingApprovalPage');
  });

  test('matches snapshot after switching to email only resend confirmation', () => {
    store.dispatch(
      openAlreadyRegisteredDialog({
        title: 'title',
        registerNowText: 'registerNowText',
        instructionalText: 'instructionalText'
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="resend-confirmation-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test.skip('matches snapshot after switching back to login form', () => {
    dialog.find('[data-cvent-id="back-link"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test.skip('matches snapshot after typing in field', () => {
    dialog.find('[data-cvent-id="email-address"] input').simulate('change', { target: { value: 'otherEmailAddress' } });
    expect(dialog).toMatchSnapshot();
  });

  test('matches snapshot when resend confirmation request succeeds', async () => {
    (eventEmailClient as $TSFixMe).resendConfirmationEmail = jest.fn(() => {});
    dialog.find('[data-cvent-id="email-address"] input').simulate('keypress', { key: 'Enter' });
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });

  test('matches snapshot when resend confirmation request fails due to throttling', async () => {
    (eventEmailClient as $TSFixMe).resendConfirmationEmail = jest.fn(() => {
      throw new EmailThrottleError();
    });
    dialog.find('[data-cvent-id="email-address"] input').simulate('keypress', { key: 'Enter' });
    await wait(0);
    expect(dialog.find('[data-cvent-id="resend-confirmation-failure-message"]').text()).toEqual(
      expect.stringContaining('EventWidgets_AlreadyRegistered_ConfirmationSendFailureMessage__resx')
    );
    expect(dialog).toMatchSnapshot();
  });

  test('matches snapshot when closed', async () => {
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });
});

describe('AlreadyRegisteredDialog, dupMatchKeyType EMAIL_LAST_FIRST_NAME', () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      account,
      dialogContainer,
      registrantLogin,
      registrationForm,
      event: (x = {}) => x,
      website: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      userSession: (x = {}) => x,
      experiments: (x = {}) => x,
      persona: personaReducer,
      defaultUserSession: (x = {}) => x
    }),
    {
      ...state,
      account: {
        settings: {
          dupMatchKeyType: 'EMAIL_LAST_FIRST_NAME'
        }
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when switching to email/first name/last name resend confirmation form', () => {
    store.dispatch(
      openAlreadyRegisteredDialog({
        title: 'title',
        registerNowText: 'registerNowText',
        instructionalText: 'instructionalText'
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="resend-confirmation-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('matches snapshot when resend confirmation request succeeds', async () => {
    (eventEmailClient as $TSFixMe).resendConfirmationEmail = jest.fn(() => {});
    dialog.find('[data-cvent-id="email-address"] input').simulate('keypress', { key: 'Enter' });
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });
});

describe('AlreadyRegisteredDialog with attendee login enabled', () => {
  const attendeeLoginClient = {
    authorize: jest.fn(() => () => {})
  };
  const store = createStoreWithMiddleware(
    combineReducers({
      account,
      dialogContainer,
      registrantLogin,
      registrationForm,
      event: (x = {}) => x,
      website: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      persona: personaReducer,
      timezones: (x = {}) => x,
      experiments: (x = {}) => x
    }),
    {
      ...state,
      event: {
        ...state.event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
        }
      },
      clients: {
        ...state.clients,
        attendeeLoginClient
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('Dialog renders correctly', () => {
    store.dispatch(openAlreadyRegisteredDialog({}));
    dialog.update();
    expect(dialog).toMatchSnapshot();
  });

  test('Attendee is redirected to attendee login when they click log in.', async () => {
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(attendeeLoginClient.authorize).toHaveBeenCalled();
  });
});

describe('AlreadyRegisteredDialog onLogin method routes correctly', () => {
  const eventRegistrationId = '11111111-1111-1111-1111-111111111111';
  const mockConfirmedRegCartResponse = {
    regCart: {
      regCartId: 'regCartId',
      status: 'INPROGRESS',
      regMod: true,
      eventSnapshotVersions: {
        [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
      },
      eventRegistrations: {
        [eventRegistrationId]: {
          registrationTypeId: '11111111-1111-1111-1111-111111111111',
          registrationPathId: '11111111-1111-1111-1111-111111111111',
          sessionWaitlists: {}
        }
      }
    },
    validationMessages: []
  };

  const initialState = {
    ...state,
    clients: {
      ...state.clients
    }
  };

  test('for confirmed registration', async () => {
    (regCartClient as $TSFixMe).identifyByConfirm.mockReturnValue({
      ...mockConfirmedRegCartResponse,
      regCart: {
        ...mockConfirmedRegCartResponse.regCart,
        eventRegistrations: {
          ...mockConfirmedRegCartResponse.regCart.eventRegistrations,
          [eventRegistrationId]: {
            ...mockConfirmedRegCartResponse.regCart.eventRegistrations[eventRegistrationId],
            attendee: {
              inviteeStatus: 2
            }
          }
        }
      }
    });
    const store = mockStore(initialState);
    await store.dispatch(onLogin());
    expect(store.getActions()).toMatchSnapshot();
  });

  test('for confirmed registration - pending approval', async () => {
    const store = mockStore(initialState);
    await store.dispatch(onLogin());
    expect(store.getActions()).toMatchSnapshot();
  });
});

describe('AlreadyRegisteredDialog when known invitee', () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      account,
      dialogContainer,
      registrantLogin,
      registrationForm,
      event: (x = {}) => x,
      website: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      userSession: (x = {}) => x,
      experiments: (x = {}) => x,
      persona: personaReducer,
      defaultUserSession: (x = {}) => x
    }),
    {
      ...state,
      defaultUserSession: {
        isPreview: false
      },
      experiments: { flexProductVersion: RECOGNIZE_KNOWN_INVITEE }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('Verify welcome text is not rendered', () => {
    store.dispatch(
      openAlreadyRegisteredDialog({
        title: 'title',
        registerNowText: 'registerNowText',
        instructionalText: 'instructionalText'
      })
    );
    dialog.update();
    expect(dialog).toMatchSnapshot();
    expect(dialog.find('[data-cvent-id="welcome-text"]')).toEqual({});
  });

  const newStore = createStoreWithMiddleware(
    combineReducers({
      account,
      dialogContainer,
      registrantLogin,
      registrationForm,
      event: (x = {}) => x,
      website: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      userSession: (x = {}) => x,
      experiments: (x = {}) => x,
      persona: personaReducer,
      defaultUserSession: (x = {}) => x
    }),
    {
      ...state,
      userSession: {
        inviteeStatus: 'Accepted',
        lastName: 'LastName'
      },
      defaultUserSession: {
        isPreview: false
      },
      experiments: { flexProductVersion: RECOGNIZE_KNOWN_INVITEE }
    }
  );

  const newDialog = mount(
    <Provider store={newStore}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('Verify welcome text is rendered', () => {
    newStore.dispatch(
      openAlreadyRegisteredDialog({
        title: 'title',
        registerNowText: 'registerNowText',
        instructionalText: 'instructionalText'
      })
    );
    newDialog.update();
    expect(newDialog.find('[data-cvent-id="welcome-text"]')).toBeTruthy();
    expect(newDialog.find('[data-cvent-id="not-first-name-text"]')).toBeTruthy();
    expect(JSON.stringify(newDialog.find('[data-cvent-id="not-first-name-text"]').text())).toContain('LastName');
  });
});

describe('AlreadyRegisteredDialog with prepopulated email', () => {
  const TEST_EMAIL = 'email@domain.com';
  const store = createStoreWithMiddleware(
    combineReducers({
      account,
      dialogContainer,
      registrantLogin,
      registrationForm,
      event: (x = {}) => x,
      website: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      userSession: (x = {}) => x,
      experiments: (x = {}) => x,
      persona: personaReducer,
      defaultUserSession: (x = {}) => x
    }),
    {
      ...state,
      registrantLogin: {
        form: {
          firstName: '',
          lastName: '',
          emailAddress: '',
          confirmationNumber: ''
        },
        status: {
          login: {},
          resendConfirmation: {}
        }
      },
      registrationForm: {
        currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
        regCart: {
          eventRegistrations: {
            '00000000-0000-0000-0000-000000000001': {
              attendee: {
                personalInformation: {
                  emailAddress: TEST_EMAIL
                }
              }
            }
          }
        }
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('Verify email is prepopulated', () => {
    store.dispatch(openAlreadyRegisteredDialog({ prepopulateForm: true }));
    dialog.update();
    expect(dialog.find('input#emailAddress').props().value).toEqual(TEST_EMAIL);
  });
});
