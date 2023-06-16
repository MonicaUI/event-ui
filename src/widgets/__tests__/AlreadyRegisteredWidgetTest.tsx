import React from 'react';
import AlreadyRegisteredWidgetWrapper from '../AlreadyRegisteredWidget';
import * as EventStatus from 'event-widgets/clients/EventStatus';
let mockCurrentPageId;
jest.mock('../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
    __esModule: true,
    getCurrentPageId: () => mockCurrentPageId,
    routeToPage: jest.fn(),
    redirectToOAuthURL: jest.fn(),
    redirectToExternalAuth: jest.fn()
  };
});
import { shallow } from 'enzyme';
import { redirectToExternalAuth, redirectToOAuthURL } from '../../redux/pathInfo';
import configureStore from '../../redux/configureStore';
import { Accepted } from 'event-widgets/utils/InviteeStatus';
import AlreadyRegisteredWidget from 'event-widgets/lib/AlreadyRegistered/AlreadyRegisteredWidget';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AlreadyRegisteredDialog = require('../../dialogs/AlreadyRegisteredDialog');
AlreadyRegisteredDialog.openAlreadyRegisteredDialog = jest.fn(() => () => {});

const attendeeLoginClient = {
  authorize: jest.fn(() => () => {})
};

function getState() {
  return {
    event: {
      status: EventStatus.ACTIVE,
      eventSecuritySetupSnapshot: {}
    },
    pathInfo: {
      currentPageId: 'register',
      rootPath: '/root-path'
    },
    website: {
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              pageIds: ['regProcessStep1', 'regProcessStep2']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            isDefault: true,
            isActive: true,
            associatedRegistrationTypes: []
          }
        }
      }
    },
    userSession: {
      inviteeStatus: Accepted
    },
    defaultUserSession: {
      isPlanner: false,
      isPreview: false,
      isTestMode: true
    },
    account: {
      settings: {
        accountSecuritySettings: {}
      }
    },
    clients: {
      attendeeLoginClient
    },
    text: {
      translate: text => text
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}
const subscribe = () => {};
const defaultProps = {
  config: {
    linkText: 'Already Registered Link text',
    linkDisabled: false,
    style: {}
  },
  classes: {},
  style: {},
  store: { dispatch, getState, subscribe }
};

describe('Tests for Already Registered Widget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Check if already registered dialog is triggered on click', async () => {
    mockCurrentPageId = 'regProcessStep1';
    const wrapper = shallow(<AlreadyRegisteredWidgetWrapper {...defaultProps} />);
    const widget = wrapper.find(AlreadyRegisteredWidget);
    await widget.props().linkClickHandler(defaultProps);
    expect(AlreadyRegisteredDialog.openAlreadyRegisteredDialog).toHaveBeenCalled();
  });
  test('check if redirection is happening if HTTP Post is enabled', () => {
    const state = {
      ...getState(),
      event: {
        id: 'eventId',
        eventSecuritySetupSnapshot: {
          authenticationType: 1,
          authenticationLocation: 1
        }
      },
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: true,
            allowSSOLogin: false,
            allowSecureHTTPPost: false,
            allowOAuth: false
          }
        }
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const wrapper = shallow(<AlreadyRegisteredWidgetWrapper {...props} />);
    const widget = wrapper.find(AlreadyRegisteredWidget);
    widget.props().linkClickHandler(props);
    expect(redirectToExternalAuth).toHaveBeenCalled();
  });
  test('check if redirection is happening if OAuth is enabled', () => {
    const state = {
      ...getState(),
      event: {
        id: 'eventId',
        eventSecuritySetupSnapshot: {
          authenticationType: 3,
          authenticationLocation: 0
        }
      },
      account: {
        settings: {
          accountSecuritySettings: {
            allowSSOLogin: false,
            allowSecureHTTPPost: false,
            allowOAuth: true
          }
        }
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const wrapper = shallow(<AlreadyRegisteredWidgetWrapper {...props} />);
    const widget = wrapper.find(AlreadyRegisteredWidget);
    widget.props().linkClickHandler(props);
    expect(redirectToOAuthURL).toHaveBeenCalled();
  });
  test('Check if already registered dialog is triggered on click if HTTP Post is enabled and authentication location is Specific Registration Path', async () => {
    const state = {
      ...getState(),
      event: {
        id: 'eventId',
        eventSecuritySetupSnapshot: {
          authenticationType: 1,
          authenticationLocation: 2
        }
      },
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: true,
            allowSSOLogin: false,
            allowSecureHTTPPost: false,
            allowOAuth: false
          }
        }
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const wrapper = shallow(<AlreadyRegisteredWidgetWrapper {...props} />);
    const widget = wrapper.find(AlreadyRegisteredWidget);
    await widget.props().linkClickHandler(defaultProps);
    expect(AlreadyRegisteredDialog.openAlreadyRegisteredDialog).toHaveBeenCalled();
  });

  test('check Already registered present in case of Test Mode, invitee has been identified as Visited', async () => {
    mockCurrentPageId = 'summary?i=38200224-1db9-476c-a416-a3fff14383ac';
    const state = getState();
    state.userSession.inviteeStatus = 'Visited';
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const wrapper = shallow(<AlreadyRegisteredWidgetWrapper {...props} />);
    const widget = wrapper.find(AlreadyRegisteredWidget);
    await widget.props().linkClickHandler(defaultProps);
    expect(AlreadyRegisteredDialog.openAlreadyRegisteredDialog).toHaveBeenCalled();
  });
});
