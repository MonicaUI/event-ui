import React from 'react';
import EventIdentityConfirmationWidget from '../EventIdentityConfirmationWidget';
import { shallow } from 'enzyme';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import { setIn } from 'icepick';
import { PRIVATE_ALL_TARGETED_LISTS, PRIVATE_LIMITED_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import { ACTIVE } from '../../../../../pkgs/event-widgets/clients/EventStatus';

const loadMetaDataFunction = jest.fn(() => {
  return {};
});
let regMod = false;
let attendeeType = 'GROUP_LEADER';
function getState() {
  return {
    registrationForm: {
      regCart: {
        regMod,
        groupRegistration: false,
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'regPathId',
            eventRegistrationId: 'eventRegId',
            attendeeType
          }
        }
      }
    },
    website: {
      ...pageContainingWidgetFixture('pageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              pageIds: ['pageId']
            }
          }
        }
      },
      siteInfo: {
        sharedConfigs: {}
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            registrationTypeSettings: {
              limitVisibility: false
            },
            guestRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: false
              }
            },
            identityConfirmation: {
              administratorRegistrationEnabled: true
            }
          }
        }
      }
    },
    widgetFactory: {
      loadMetaData: loadMetaDataFunction
    },
    userSession: {
      inviteeId: 'fake-invitee-id'
    },
    defaultUserSession: {},
    event: {
      status: ACTIVE
    },
    account: {
      settings: {}
    }
  };
}
const subscribe = () => {};
async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}
const props = {
  store: { getState, subscribe, dispatch },
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  style: {},
  config: {
    displayText: ''
  },
  classes: {},
  id: 'widgetId'
};

describe('EventIdentityConfirmationWidget', () => {
  test('should render with admin fields', () => {
    const widget = shallow(<EventIdentityConfirmationWidget {...props} />);
    expect(widget).toMatchSnapshot();
  });

  test('should not render admin fields during reg mod', () => {
    regMod = true;
    const widget = shallow(<EventIdentityConfirmationWidget {...props} />);
    expect(widget).toMatchSnapshot();
    regMod = false;
  });

  test('should not render admin fields for group member', () => {
    attendeeType = 'ATTENDEE';
    const widget = shallow(<EventIdentityConfirmationWidget {...props} />);
    expect(widget).toMatchSnapshot();
    attendeeType = 'GROUP_LEADER';
  });
  test('should not render clear field if event is private and EmailOnly', () => {
    let initialState = getState();
    initialState = setIn(
      initialState,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'accessRules',
        'invitationListAccess',
        'type'
      ],
      PRIVATE_ALL_TARGETED_LISTS
    );
    initialState = setIn(
      initialState,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'accessRules',
        'invitationListAccess',
        'isEmailOnlyInvite'
      ],
      true
    );

    function getInitialState() {
      return initialState;
    }
    const defaultProps = {
      store: { getState: getInitialState, subscribe, dispatch },
      translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
      style: {},
      config: {
        displayText: ''
      },
      classes: {},
      id: 'widgetId'
    };
    const wrapper = shallow(<EventIdentityConfirmationWidget {...defaultProps} />).dive();
    expect(wrapper.find('IdentityConfirmationWidget').props().onClear).toBe(undefined);
  });
  test('should not render clear field if the person is on a select invitation list(Private Event) and EmailOnly', () => {
    let initialState = getState();
    initialState = setIn(
      initialState,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'accessRules',
        'invitationListAccess',
        'type'
      ],
      PRIVATE_LIMITED_TARGETED_LISTS
    );
    initialState = setIn(
      initialState,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'accessRules',
        'invitationListAccess',
        'isEmailOnlyInvite'
      ],
      true
    );

    function getInitialState() {
      return initialState;
    }
    const defaultProps = {
      store: { getState: getInitialState, subscribe, dispatch },
      translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
      style: {},
      config: {
        displayText: ''
      },
      classes: {},
      id: 'widgetId'
    };
    const wrapper = shallow(<EventIdentityConfirmationWidget {...defaultProps} />).dive();
    expect(wrapper.find('IdentityConfirmationWidget').props().onClear).toBe(undefined);
  });
  test('should disable the admin check box in SSO invitee flow', () => {
    const initialState = getState();
    const newState = {
      ...initialState,
      registrationForm: {
        ...initialState.registrationForm,
        regCart: {
          ...initialState.registrationForm.regCart,
          admin: {
            disableAdminRegistrationInSso: true
          }
        }
      },
      userSession: {
        ...initialState.userSession,
        isSsoAdmin: false
      },
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: false,
            allowSSOLogin: true,
            allowSecureHTTPPost: true
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 1
        }
      }
    };

    function getInitialState() {
      return newState;
    }

    const newDefaultProps = {
      store: { getState: getInitialState, subscribe, dispatch },
      translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
      style: {},
      config: {
        displayText: ''
      },
      classes: {},
      id: 'widgetId'
    };
    const wrapper = shallow(<EventIdentityConfirmationWidget {...newDefaultProps} />).dive();
    expect(wrapper.find('IdentityConfirmationWidget').prop('showAdminRegCheckbox')).toBeFalsy();
  });
  test('should not render clear field if external Auth is enabled in event', () => {
    const initialState = getState();

    const newState = {
      ...initialState,
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: true,
            allowSSOLogin: false,
            allowSecureHTTPPost: false
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 1
        }
      }
    };

    function getInitialState() {
      return newState;
    }
    const defaultProps = {
      store: { getState: getInitialState, subscribe, dispatch },
      translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
      style: {},
      config: {
        displayText: ''
      },
      classes: {},
      id: 'widgetId'
    };
    const wrapper = shallow(<EventIdentityConfirmationWidget {...defaultProps} />).dive();
    expect(wrapper.find('IdentityConfirmationWidget').props().isExternalAuthEnabled).toBeTruthy();
  });
});
