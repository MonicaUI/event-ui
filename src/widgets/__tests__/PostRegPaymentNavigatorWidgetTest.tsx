import React from 'react';
import { loginRegistrant } from '../../redux/registrantLogin/actions';
jest.mock('../../redux/pathInfo');
jest.mock('../../redux/registrationForm/regCart', () => ({
  saveRegistration: x => x,
  finalizeCancelRegistration: x => x
}));
jest.mock('../../redux/registrantLogin/actions', () => ({
  logoutRegistrant: () => {},
  loginRegistrant: jest.fn()
}));
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    getDefaultWebsitePageId: () => 'website1'
  };
});

import { shallow } from 'enzyme';
import PostRegPaymentNavigatorWidgetTest from '../RegistrationPostRegPaymentNavigatorWidget';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { REGISTERING } from '../../redux/registrationIntents';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import EventGuestClient from '../../clients/EventGuestClient';
import { mount } from 'enzyme/build/index';
import Form from 'nucleus-form/src/components/Form';
import { Grid } from 'nucleus-core/layout/flexbox';
import { Provider } from 'react-redux';
import { routeToPage } from '../../redux/pathInfo';

jest.mock('../../clients/EventGuestClient');
jest.mock('../../utils/confirmationUtil', () => ({
  getConfirmationPageIdForInvitee: () => () => Promise.resolve('confirmationPageId')
}));

(loginRegistrant as $TSFixMe).mockImplementation(() => {
  return dispatch1 => {
    dispatch1({
      type: '[MOCK]/loginRegistrant',
      payload: {}
    });
  };
});

const eventPersonaClient = {
  identifyInvitee: () => Promise.resolve({ inviteeStatus: InviteeStatus.NoResponse })
};

function getState() {
  return {
    text: { translate: x => x },
    registrationForm: {
      warnings: {},
      regCart: {
        eventRegistrations: {
          REG1: {
            id: 'REG1',
            attendeeType: 'ATTENDEE',
            attendee: {
              personalInformation: {
                emailAddress: 'tony@stark.com'
              }
            },
            confirmationNumber: 'CONFIRMNUM'
          }
        }
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
      ...pageContainingWidgetFixture('cancellationPageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              pageIds: ['pageId'],
              cancellationPageIds: ['cancellationPageId'],
              confirmationPageId: 'confirmationPageId'
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            cancellation: {
              enabled: true
            },
            isDefault: true
          }
        }
      }
    },
    postRegistrationPaymentData: {
      isCheckingOut: false
    },
    clients: { eventPersonaClient, eventGuestClient: new EventGuestClient() }
  };
}
async function dispatch(action) {
  if (typeof action === 'function') {
    return await action(dispatch, getState);
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

let mockStore;
const mountWidget = () => {
  mockStore = { dispatch, subscribe, getState };
  return mount(
    <Provider store={mockStore}>
      <Form>
        <Grid>
          <PostRegPaymentNavigatorWidgetTest {...defaultProps} />
        </Grid>
      </Form>
    </Provider>
  );
};

describe('Tests for RegistrationPostRegPaymentNavigatorWidget', () => {
  test('Checking if it is rendering properly', () => {
    const component = mountWidget();
    expect(component).toMatchSnapshot('Widget Renders');
  });
});

describe('RegistrationNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to the confirmation page on exit', async () => {
    const wrapper = shallow(<PostRegPaymentNavigatorWidgetTest {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(routeToPage).toHaveBeenCalledWith('confirmationPageId');
  });
});
