import React from 'react';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { openGroupRegistrationCancellationDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { InviteeStatusId } from 'event-widgets/utils/InviteeStatus';

const state = {
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId1: {
          cancellation: {
            enabled: true
          }
        }
      }
    }
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        '0bc2a08e-cde2-45f6-bc7f-d0f677013668': {
          attendee: {
            personalInformation: {
              firstName: 'Ian',
              lastName: 'Garcia'
            },
            inviteeStatus: InviteeStatusId.Accepted
          },
          registrationPathId: 'regPathId1',
          attendeeType: 'ATTENDEE',
          eventRegistrationId: '0bc2a08e-cde2-45f6-bc7f-d0f677013668'
        },
        'bcd51594-d0bb-4f51-9cdb-88f8e85addde': {
          attendee: {
            personalInformation: {
              firstName: 'Lonnie',
              lastName: 'Curtis'
            },
            inviteeStatus: InviteeStatusId.PendingApproval
          },
          registrationPathId: 'regPathId1',
          attendeeType: 'GROUP_LEADER',
          eventRegistrationId: 'bcd51594-d0bb-4f51-9cdb-88f8e85addde'
        },
        'c1f8b07a-ebd5-4051-be4a-15d6b5c96543': {
          attendee: {
            personalInformation: {
              firstName: 'Brittany',
              lastName: 'Richards'
            },
            inviteeStatus: InviteeStatusId.DeniedApproval
          },
          registrationPathId: 'regPathId1',
          attendeeType: 'ATTENDEE',
          eventRegistrationId: 'c1f8b07a-ebd5-4051-be4a-15d6b5c96543'
        },
        '82a42c25-d07b-4d84-afa5-73defb827c88': {
          attendee: {
            personalInformation: {
              firstName: 'Dwayne',
              lastName: 'Grant'
            }
          },
          registrationPathId: 'regPathId1',
          attendeeType: 'GUEST',
          eventRegistrationId: '82a42c25-d07b-4d84-afa5-73defb827c88'
        }
      }
    }
  }
};

describe('GroupRegistrationCancellationDialog', () => {
  const store = createStoreWithMiddleware(
    combineReducers({
      dialogContainer,
      website: (x = {}) => x,
      text: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x
    }),
    state
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openGroupRegistrationCancellationDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('eventRegistrations are present, except the ones denied approval and guests', () => {
    store.dispatch(openGroupRegistrationCancellationDialog());
    dialog.update();
    expect(dialog.find('a[id="0bc2a08e-cde2-45f6-bc7f-d0f677013668"]').length).toBe(1);
    expect(dialog.find('a[id="bcd51594-d0bb-4f51-9cdb-88f8e85addde"]').length).toBe(1);
    expect(dialog.find('a[id="c1f8b07a-ebd5-4051-be4a-15d6b5c96543"]').length).toBe(0);
    expect(dialog.find('a[id="82a42c25-d07b-4d84-afa5-73defb827c88"]').length).toBe(0);
  });
});

describe('GroupRegistrationCancellationDialog: with reg mod not allowed invitee', () => {
  const currState = {
    ...state,
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId1: {
            Cancellation: {
              enabled: false
            }
          }
        }
      }
    }
  };

  const store = createStoreWithMiddleware(
    combineReducers({
      dialogContainer,
      website: (x = {}) => x,
      text: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x
    }),
    currState
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openGroupRegistrationCancellationDialog({}));
    expect(dialog).toMatchSnapshot();
  });
});

describe('GroupRegistrationCancellationDialog: with reg mod deadline passed invitee', () => {
  const currState = {
    ...state,
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId1: {
            id: 'regPathId1',
            cancellation: {
              enabled: true,
              deadline: '2019-01-01T04:00:00.000Z'
            }
          }
        }
      }
    }
  };
  const store = createStoreWithMiddleware(
    combineReducers({
      dialogContainer,
      website: (x = {}) => x,
      text: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x
    }),
    currState
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openGroupRegistrationCancellationDialog());
    expect(dialog).toMatchSnapshot();
  });
});

describe('GroupRegistrationCancellationDialog: pending approval cancellation disabled', () => {
  const currState = {
    ...state,
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId1: {
            id: 'regPathId1',
            cancellation: {
              enabled: true,
              pendingEnabled: false
            }
          }
        }
      }
    }
  };
  const store = createStoreWithMiddleware(
    combineReducers({
      dialogContainer,
      website: (x = {}) => x,
      text: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x
    }),
    currState
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openGroupRegistrationCancellationDialog());
    expect(dialog).toMatchSnapshot();
  });

  test('eventRegistrations are present, except the ones denied approval and guests', () => {
    store.dispatch(openGroupRegistrationCancellationDialog());
    dialog.update();
    expect(dialog.find('a[id="0bc2a08e-cde2-45f6-bc7f-d0f677013668"]').length).toBe(1);
    expect(dialog.find('a[id="bcd51594-d0bb-4f51-9cdb-88f8e85addde"]').length).toBe(0);
    expect(dialog.find('a[id="c1f8b07a-ebd5-4051-be4a-15d6b5c96543"]').length).toBe(0);
    expect(dialog.find('a[id="82a42c25-d07b-4d84-afa5-73defb827c88"]').length).toBe(0);
  });
});
