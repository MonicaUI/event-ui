import RegisterNowWidgetWrapper from '../RegisterButton/RegisterNowWidget';
import React from 'react';
import * as EventStatus from 'event-widgets/clients/EventStatus';
import renderer from 'react-test-renderer';
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
jest.mock('../../dialogs/StartNewRegistrationDialog', () => {
  return { openStartNewRegistrationDialogDuringRegistration: jest.fn(() => () => {}) };
});
import { redirectToExternalAuth, redirectToOAuthURL, routeToPage } from '../../redux/pathInfo';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { shallow } from 'enzyme';
import { openStartNewRegistrationDialogDuringRegistration } from '../../dialogs/StartNewRegistrationDialog';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AlreadyRegisteredDialog = require('../../dialogs/AlreadyRegisteredDialog');
AlreadyRegisteredDialog.openAlreadyRegisteredDialog = jest.fn(() => () => {});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const currentRegistrant = require('../../redux/selectors/currentRegistrant');
import configureStore from '../../redux/configureStore';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import { Accepted, Visited } from 'event-widgets/utils/InviteeStatus';

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
      currentPageId: 'summary',
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
      isPreview: false
    },
    account: {
      settings: {
        accountSecuritySettings: {}
      }
    },
    clients: {
      attendeeLoginClient
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
    link: {
      enabled: true,
      text: 'Already Registered Link text'
    },
    text: 'Register Now',
    style: {}
  },
  kind: 'button',
  classes: {},
  style: {},
  translate: text => text,
  store: { dispatch, getState, subscribe }
};

describe('Tests for RegisterNowWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Checking if it is rendering properly when event is active and button is enabled', () => {
    mockCurrentPageId = 'summary';
    const widget = renderer.create(<RegisterNowWidgetWrapper {...defaultProps} />);
    expect(widget).toMatchSnapshot();
  });
  test('Check if registration process is triggered on click', async () => {
    mockCurrentPageId = 'summary';
    const component = shallow(<RegisterNowWidgetWrapper {...defaultProps} />);
    const widget = component.find(ButtonWidget);
    await widget.props().clickHandler(defaultProps);
    expect(routeToPage).toHaveBeenCalled();
  });
  test('Check if registration dialog is triggered on click when current page id is registration page', async () => {
    mockCurrentPageId = 'regProcessStep1';
    const wrapper = shallow(<RegisterNowWidgetWrapper {...defaultProps} />);
    const widget = wrapper.find(ButtonWidget);
    await widget.props().clickHandler(defaultProps);
    expect(openStartNewRegistrationDialogDuringRegistration).toHaveBeenCalled();
  });
  test('Check if registration dialog is triggered on click when user is logged in', async () => {
    mockCurrentPageId = 'summary';
    currentRegistrant.isLoggedIn = jest.fn(() => true);
    const wrapper = shallow(<RegisterNowWidgetWrapper {...defaultProps} />);
    const widget = wrapper.find(ButtonWidget);
    await widget.props().clickHandler(defaultProps);
    expect(openStartNewRegistrationDialogDuringRegistration).toHaveBeenCalled();
  });
  test('Check if already registered dialog is triggered on click', async () => {
    mockCurrentPageId = 'regProcessStep1';
    const wrapper = shallow(<RegisterNowWidgetWrapper {...defaultProps} />);
    const widget = wrapper.find(ButtonWidget);
    await widget.props().linkClickHandler(defaultProps);
    expect(AlreadyRegisteredDialog.openAlreadyRegisteredDialog).toHaveBeenCalled();
  });
  test('Check if redirect is done if attendee login is enabled', async () => {
    mockCurrentPageId = 'summary';
    const state = {
      ...getState(),
      event: {
        ...getState().event,
        eventSecuritySetupSnapshot: {
          postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
        }
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const wrapper = shallow(<RegisterNowWidgetWrapper {...props} />);
    const widget = wrapper.find(ButtonWidget);
    await widget.props().linkClickHandler(props);
    expect(attendeeLoginClient.authorize).toHaveBeenCalled();
  });
  test('Checking if it is rendering properly when event is completed and button is disabled and link is enabled', () => {
    const state = {
      ...getState(),
      event: {
        status: EventStatus.COMPLETED
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Checking if it is rendering properly when event is completed and button is disabled and link is disabled', () => {
    const state = {
      ...getState(),
      event: {
        status: EventStatus.COMPLETED
      },
      registrationForm: {
        regCart: {
          regMod: true
        }
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Checking if it is rendering properly when event is archived but neither in planner mode nor  in preview mode. Both the button and the link are disabled', () => {
    const state = {
      ...getState(),
      event: {
        status: EventStatus.COMPLETED,
        isArchived: true
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Checking if it is rendering properly when event is archived but in planner mode.  Both the button and the link are enabled', () => {
    const state = {
      ...getState(),
      event: {
        status: EventStatus.COMPLETED,
        isArchived: true
      },
      defaultUserSession: {
        ...getState().defaultUserSession,
        isPlanner: true
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Checking if it is rendering properly when event is archived but in preview mode.  Both the button and the link are enabled', () => {
    const state = {
      ...getState(),
      event: {
        status: EventStatus.COMPLETED,
        isArchived: true
      },
      defaultUserSession: {
        ...getState().defaultUserSession,
        isPreview: true
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('check if redirection is happening if OAuth is enabled and authentication Location is First arrive at Website', () => {
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
    const wrapper = shallow(<RegisterNowWidgetWrapper {...props} />);
    const widget = wrapper.find(ButtonWidget);
    widget.props().linkClickHandler(props);
    expect(redirectToOAuthURL).toHaveBeenCalled();
  });
  test('check if redirection is happening if HTTP Post is enabled and authentication location is Try to register', () => {
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
    const wrapper = shallow(<RegisterNowWidgetWrapper {...props} />);
    const widget = wrapper.find(ButtonWidget);
    widget.props().linkClickHandler(props);
    expect(redirectToExternalAuth).toHaveBeenCalled();
  });
  test('Check if already registered dialog is triggered on click ifHTTP Post is enabled and authentication location is Specific Registration Path', async () => {
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
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Check if already registered dialog is triggered on click if preview mode is ON', async () => {
    const state = {
      ...getState(),
      event: {
        id: 'eventId',
        eventSecuritySetupSnapshot: {
          authenticationType: 3
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
      },
      defaultUserSession: {
        isPreview: true
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Check already registered link not getting rendered for non accepted invitee', async () => {
    mockCurrentPageId = 'summary?i=invitee';
    const state = {
      ...getState(),
      userSession: {
        ...getState().userSession,
        inviteeStatus: Visited
      },
      pathInfo: {
        ...getState().pathInfo,
        currentPageId: 'summary?i=invitee'
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget.toJSON().children[1]).toBe(undefined);
  });
  test('Check already registered link getting rendered for accepted invitee', async () => {
    mockCurrentPageId = 'summary?i=invitee';
    const state = {
      ...getState(),
      userSession: {
        ...getState().userSession,
        inviteeStatus: Accepted
      },
      pathInfo: {
        ...getState().pathInfo,
        currentPageId: 'summary?i=invitee'
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget.toJSON().children[1].children[0].children[0]).toBe('Already Registered Link text');
  });
  test('Check already registered link getting rendered for no invitee in url but existing invitee status', async () => {
    mockCurrentPageId = 'summary';
    const state = {
      ...getState(),
      userSession: {
        ...getState().userSession,
        inviteeStatus: Visited
      }
    };
    const props = {
      ...defaultProps,
      store: configureStore(state)
    };
    const widget = renderer.create(<RegisterNowWidgetWrapper {...props} />);
    expect(widget.toJSON().children[1].children[0].children[0]).toBe('Already Registered Link text');
  });
});
