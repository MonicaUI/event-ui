import RegisterAnotherWidget from '../RegisterButton/RegisterAnotherWidget';
import React from 'react';
import * as EventStatus from 'event-widgets/clients/EventStatus';
import renderer from 'react-test-renderer';
let mockCurrentPageId;
jest.mock('../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
    __esModule: true,
    getCurrentPageId: () => mockCurrentPageId
  };
});
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { shallow } from 'enzyme';
import { openStartNewRegistrationDialogDuringRegistration } from '../../dialogs/StartNewRegistrationDialog';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AlreadyRegisteredDialog = require('../../dialogs/AlreadyRegisteredDialog');
AlreadyRegisteredDialog.openAlreadyRegisteredDialog = jest.fn(() => () => {});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const currentRegistrant = require('../../redux/selectors/currentRegistrant');
import configureStore from '../../redux/configureStore';

jest.mock('../../dialogs/StartNewRegistrationDialog', () => {
  return {
    openStartNewRegistrationDialogDuringRegistration: jest.fn(() => () => {})
  };
});

function getState() {
  return {
    event: {
      status: EventStatus.ACTIVE
    },
    pathInfo: {
      rootPath: '/root-path',
      currentPageId: 'regProcessStep1'
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
    defaultUserSession: {}
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
    text: 'Register Another',
    style: {}
  },
  kind: 'button',
  classes: {},
  style: {},
  translate: text => text,
  store: { dispatch, getState, subscribe }
};

describe('Tests for RegisterAnotherWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Checking if it is rendering properly when event is active and button is enabled', () => {
    const widget = renderer.create(<RegisterAnotherWidget {...defaultProps} />);
    expect(widget).toMatchSnapshot();
  });
  test('Check if registration dialog is triggered on click when current page id is registration page', async () => {
    mockCurrentPageId = 'regProcessStep1';
    const wrapper = shallow(<RegisterAnotherWidget {...defaultProps} />);
    const widget = wrapper.find(ButtonWidget);
    await widget.props().clickHandler(defaultProps);
    expect(openStartNewRegistrationDialogDuringRegistration).toHaveBeenCalled();
  });
  test('Check if registration dialog is triggered on click when user is logged in', async () => {
    mockCurrentPageId = 'regProcessStep1';
    currentRegistrant.isLoggedIn = jest.fn(() => true);
    const wrapper = shallow(<RegisterAnotherWidget {...defaultProps} />);
    const widget = wrapper.find(ButtonWidget);
    await widget.props().clickHandler(defaultProps);
    expect(openStartNewRegistrationDialogDuringRegistration).toHaveBeenCalled();
  });
  test('Checking if it is rendering properly when event is completed and button is disabled', () => {
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
    const widget = renderer.create(<RegisterAnotherWidget {...props} />);
    expect(widget).toMatchSnapshot();
  });
  test('Checking if it is rendering properly when event is completed and button is disabled, when user is LoggedIn', () => {
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
    const widget = renderer.create(<RegisterAnotherWidget {...props} />);
    expect(widget).toMatchSnapshot();
  });
});
