import React from 'react';
jest.mock('../../redux/pathInfo');
jest.mock('../../redux/registrationForm/regCart');
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    getDefaultWebsitePageId: () => 'website1'
  };
});
jest.mock('../../clients/EventGuestClient');
jest.mock('../../clients/RegCartClient');
jest.mock('../../redux/registrantLogin/actions');

import { shallow } from 'enzyme';
import GuestModalNavigatorWidget from '../GuestModalNavigatorWidget';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { REGISTERING } from '../../redux/registrationIntents';
import {
  updateGuestDetails,
  updateGuestsInRegCart,
  removeGuestByEventRegistrationId
} from '../../redux/registrationForm/regCart';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import pageContainingWidgetFixture from '../../../fixtures/EventSnapshotWithGuestRegPage.json';

jest.mock('../../redux/registrationForm/regCart', () => ({
  updateGuestDetails: jest.fn(() => () => {}),
  removeGuestByEventRegistrationId: jest.fn(() => () => {}),
  updateGuestsInRegCart: jest.fn(() => () => {}),
  clearTemporaryGuestInformation: jest.fn(() => () => {})
}));

function getState() {
  return {
    text: { translate: x => x },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          mockEventRegId: {
            registrationPathId: 'todoThisShouldBeRegPathId'
          }
        }
      },
      warnings: {},
      currentGuestEventRegistration: {
        eventRegistrationId: 'mockEventRegId'
      }
    },
    regCartStatus: {
      registrationIntent: REGISTERING
    },
    defaultUserSession: {
      isPlanner: false
    },
    plannerRegSettings: {
      exitUrl: 'https://www.google.com/'
    },
    event: {
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000'
        }
      }
    },
    website: {
      ...pageContainingWidgetFixture,
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            todoThisShouldBeRegPathId: {
              id: 'todoThisShouldBeRegPathId',
              pageIds: ['pageId'],
              guestPageIds: ['guestPageId']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          todoThisShouldBeRegPathId: {
            id: 'todoThisShouldBeRegPathId',
            isDefault: true,
            identityConfirmation: {
              administratorRegistrationEnabled: false
            }
          }
        }
      }
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
  nucleusForm: createLocalNucleusForm(),
  config: {
    displayText: {
      backward: 'backward',
      forward: 'forward',
      complete: 'complete',
      exit: 'exit'
    }
  },
  classes: {},
  style: {},
  translate: x => x,
  store: { dispatch, subscribe, getState },
  id: 'widgetId'
};

describe('GuestModalNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates guest details on clicking add', async () => {
    const wrapper = shallow(<GuestModalNavigatorWidget {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(updateGuestDetails).toHaveBeenCalled();
  });

  it('removes guest on clicking cancel', async () => {
    const wrapper = shallow(<GuestModalNavigatorWidget {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(removeGuestByEventRegistrationId).toHaveBeenCalled();
    expect(updateGuestsInRegCart).toHaveBeenCalled();
  });
});
