jest.mock('../../../redux/pathInfo', () => {
  return {
    routeToPage: jest.fn(() => () => {})
  };
});
import React from 'react';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openStartNewRegistrationDialogDuringRegistration, openStartNewRegistrationDialogFromPageLanding } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { wait } from '../../../testUtils';
import registrantLogin from '../../../redux/registrantLogin';
import { beginNewRegistration } from '../../../routing/startRegistration';
import { filterEventSnapshot } from '../../../redux/actions';
import { keyBy } from 'lodash';
import { logoutRegistrant } from '../../../redux/registrantLogin/actions';
import { abortRegCart } from '../../../redux/registrationForm/regCart/workflow';

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});
jest.mock('../../../routing/startRegistration');
(beginNewRegistration as $TSFixMe).mockImplementation(() => () => {});

jest.mock('../../../redux/actions', () => {
  return {
    filterEventSnapshot: jest.fn(() => () => {}),
    loadRegistrationContent: jest.fn(() => () => {}),
    loadGuestRegistrationContent: jest.fn(() => () => {})
  };
});

jest.mock('../../../redux/capacity');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../../../redux/capacity').loadAvailableCapacityCounts.mockImplementation(() => () => {});

jest.mock('../../../redux/registrantLogin/actions', () => {
  return {
    logoutRegistrant: jest.fn(() => () => {})
  };
});
jest.mock('../../../redux/registrationForm/regCart/workflow', () => {
  return {
    abortRegCart: jest.fn(() => () => {})
  };
});

const eventGuestClient = {};
const eventData = EventSnapshot.eventSnapshot.siteEditor.eventData;
// Based on the UI state behavior, transform this array into object.
const registrationPathSettings = keyBy(eventData.registrationSettings.registrationPaths, 'id');
const state = {
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  website: {
    theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
  },
  clients: { eventGuestClient },
  event: {
    id: 'eventId'
  },
  defaultUserSession: {
    isPreview: false
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
  registrationForm: {
    regCart: {
      status: 'INPROGRESS',
      regCartId: 'regCartId'
    }
  },
  userSession: {},
  appData: {
    ...eventData,
    registrationSettings: {
      ...eventData.registrationSettings,
      registrationPaths: registrationPathSettings
    }
  }
};

describe('StartNewRegistrationDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
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

  test('matches snapshot when opened', () => {
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    expect(dialog).toMatchSnapshot();
  });
  test('closes register now dialog', () => {
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });
  test('starts new registration and navigates to registration page', async () => {
    (eventGuestClient as $TSFixMe).logout = jest.fn(() => {});
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(abortRegCart).toHaveBeenCalledTimes(1);
    expect(logoutRegistrant).toHaveBeenCalledTimes(1);
    expect(beginNewRegistration).toHaveBeenCalledTimes(1);
  });

  test('resume previous registration should not reload app data if registration path settingsexists or reg pack does not exist', async () => {
    (eventGuestClient as $TSFixMe).logout = jest.fn(() => {});
    store.dispatch(
      openStartNewRegistrationDialogFromPageLanding({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(abortRegCart).not.toHaveBeenCalled();
    expect(filterEventSnapshot).not.toHaveBeenCalled();
  });
});

describe('StartNewRegistrationDialog: restore registration', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      registrationForm: {
        regCart: {
          eventRegistrations: {
            eventRegistration: {
              registrationPathId: 'todoThisShouldBeRegPathId2'
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

  test('resume previous registration should reload app data if registration path settings not exists', async () => {
    (eventGuestClient as $TSFixMe).logout = jest.fn(() => {});
    store.dispatch(
      openStartNewRegistrationDialogFromPageLanding({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(filterEventSnapshot).toHaveBeenCalledTimes(1);
  });
});

describe('StartNewRegistrationDialog: restore reg pack registration', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      registrationForm: {
        regCart: {
          eventRegistrations: {
            eventRegistration: {
              registrationPathId: 'todoThisShouldBeRegPathId'
            }
          },
          regPackId: 'fake-regpack-id'
        }
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('resume previous registration should reload app data if registration path settings not exists', async () => {
    (eventGuestClient as $TSFixMe).logout = jest.fn(() => {});
    store.dispatch(
      openStartNewRegistrationDialogFromPageLanding({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(filterEventSnapshot).toHaveBeenCalledTimes(1);
  });
});

describe('StartNewRegistrationDialog: restore registration without reg pack', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      registrationForm: {
        regCart: {
          eventRegistrations: {
            eventRegistration: {
              registrationPathId: 'todoThisShouldBeRegPathId'
            }
          }
        }
      },
      userSession: {},
      defaultUserSession: {
        defaultRegPackId: 'fake-regpack-id'
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('resume previous registration without regpack and reset defaultRegPackId in usersession', async () => {
    (eventGuestClient as $TSFixMe).logout = jest.fn(() => {});
    store.dispatch(
      openStartNewRegistrationDialogFromPageLanding({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(filterEventSnapshot).toHaveBeenCalledTimes(0);
  });
});

describe('StartNewRegistrationDialog: when userSession has no invitee id', () => {
  /**
   * Change the test url with query params inivitee id.
   */
  const { location } = window;

  beforeAll(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = {
      ...location,
      search: '?i=fake-invitee-id'
    };
  });

  afterAll(() => {
    window.location = location;
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
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

  test('starts new registration and navigates to registration page, log out  current registrant if useSession doesn not have the invitee id.', async () => {
    (eventGuestClient as $TSFixMe).logout = jest.fn(() => {});
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(logoutRegistrant).toHaveBeenCalledTimes(1);
    expect(beginNewRegistration).toHaveBeenCalledTimes(1);
  });
});

describe('StartNewRegistrationDialog: when userSession has invitee id', () => {
  /**
   * Change the test url with query params inivitee id.
   */
  const { location } = window;

  beforeAll(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = {
      ...location,
      search: '?i=fake-invitee-id'
    };
  });

  afterAll(() => {
    window.location = location;
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      userSession: {
        inviteeId: 'fake-invitee-id'
      },
      defaultUserSession: {
        isPreview: false
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    expect(dialog).toMatchSnapshot();
  });

  test('closes register now dialog', () => {
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('starts new registration and navigates to registration page, not log out  current registrant if query param and useSession have the invitee id.', async () => {
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    // verify that the registrant will not be logged out
    expect(logoutRegistrant).not.toHaveBeenCalled();
    expect(beginNewRegistration).toHaveBeenCalledTimes(1);
  });
});

describe('StartNewRegistrationDialog: on post reg page', () => {
  /**
   * Change the test url with query params inivitee id.
   */
  const { location } = window;

  beforeAll(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = {
      ...location,
      search: '?i=fake-invitee-id'
    };
  });

  afterAll(() => {
    window.location = location;
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      registrationForm: {
        regCart: {
          status: 'COMPLETED'
        }
      },
      userSession: {
        inviteeId: 'fake-invitee-id'
      },
      defaultUserSession: {
        isPreview: false
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('try to start a new registration on post reg page should log out the invitee when invitee id exists', async () => {
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    // verify that the registrant will be logged out
    expect(logoutRegistrant).toHaveBeenCalledTimes(1);
    expect(beginNewRegistration).toHaveBeenCalledTimes(1);
  });
});

describe('StartNewRegistrationDialog: log in using confirmation number', () => {
  /**
   * Change the test url with query params inivitee id.
   */
  const { location } = window;

  beforeAll(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = {
      ...location,
      search: '?i=fake-invitee-id'
    };
  });

  afterAll(() => {
    window.location = location;
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      registrationForm: {
        regCart: {
          status: 'TRANSIENT'
        }
      },
      userSession: {
        inviteeId: 'fake-invitee-id'
      },
      defaultUserSession: {
        isPreview: false
      }
    }
  );

  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('try to start a new registration if the registrant logs in using confirmation number should log out the invitee when invitee id exists', async () => {
    store.dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: 'register another text',
        style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global
      })
    );
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    // verify that the registrant will be logged out
    expect(logoutRegistrant).toHaveBeenCalledTimes(1);
    expect(beginNewRegistration).toHaveBeenCalledTimes(1);
  });
});

describe('StartNewRegistrationDialog 1', () => {
  const { location } = window;

  beforeAll(() => {
    jest.clearAllMocks();
    delete window.location;
  });

  afterAll(() => {
    window.location = location;
  });

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
      accessToken: (x = {}) => x,
      registrantLogin,
      appData: (x = {}) => x,
      registrationForm: (x = {}) => x
    }),
    {
      ...state,
      userSession: {
        regTypeId: 'userSessionRegTypeId'
      }
    }
  );

  test('Should load regTypeId from session for query param rt', () => {
    window.location = {
      ...location,
      search: '?rt=foo'
    };

    expect(store.getState().userSession.regTypeId).toBe('userSessionRegTypeId');
  });

  test('Should load regTypeId from session for query param registrationTypeId', () => {
    window.location = {
      ...location,
      search: '?registrationTypeId=foo'
    };

    store.dispatch(openStartNewRegistrationDialogDuringRegistration());
    expect(store.getState().userSession.regTypeId).toBe('userSessionRegTypeId');
  });
});
