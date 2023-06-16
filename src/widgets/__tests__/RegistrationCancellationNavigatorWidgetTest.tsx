import React from 'react';
import * as currentRegistrant from '../../redux/selectors/currentRegistrant';
import * as shared from '../../redux/selectors/shared';
import { loginRegistrant } from '../../redux/registrantLogin/actions';
jest.mock('../../redux/pathInfo');
jest.mock('../../redux/registrationForm/regCart', () => ({
  saveRegistration: x => x,
  finalizeCancelRegistration: x => x
}));
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    getDefaultWebsitePageId: () => 'website1'
  };
});

jest.mock('../../redux/userSession');

import { shallow } from 'enzyme';
import RegistrationCancellationNavigatorWidgetWrapper from '../RegistrationCancellationNavigatorWidget';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { REGISTERING } from '../../redux/registrationIntents';
import { routeToPage } from '../../redux/pathInfo';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import EventGuestClient from '../../clients/EventGuestClient';
import { startNewRegistrationAndNavigateToRegistration } from '../../dialogs';
import { hasAccessToWebsitePages } from '../../redux/selectors/event';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';

jest.mock('../../redux/registrantLogin/actions', () => ({
  logoutRegistrant: jest.fn(),
  loginRegistrant: jest.fn()
}));
jest.mock('../../dialogs', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../dialogs'),
    startNewRegistrationAndNavigateToRegistration: jest.fn()
  };
});
jest.mock('../../redux/selectors/event', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/selectors/event'),
    hasAccessToWebsitePages: jest.fn()
  };
});

jest.mock('../../clients/EventGuestClient');
jest.mock('../../utils/confirmationUtil', () => ({
  getConfirmationPageIdForInvitee: () => () => Promise.resolve('confirmationPageId')
}));

jest.spyOn(shared, 'isSingleSignOn').mockReturnValue(false);

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
      },
      theme: {
        global: {},
        sections: {}
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
    clients: { eventPersonaClient, eventGuestClient: new EventGuestClient() },
    registrantLogin: {
      currentLogin: {
        emailAddress: 'current@login.com',
        confirmationNumber: 'CURRENTLOGIN'
      }
    },
    persona: {},
    userSession: {
      authenticatedContact: true
    }
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

describe('RegistrationNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
  });

  it('navigates to the confirmation page on exit', async () => {
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(routeToPage).toHaveBeenCalledWith('confirmationPageId');
    const confirmationInfo = {
      emailAddress: 'tony@stark.com',
      confirmationNumber: 'CONFIRMNUM'
    };
    expect(loginRegistrant).toHaveBeenCalledWith(confirmationInfo);
  });

  it('navigates to the correct confirmation page and resets registration id on admin group memeber exit', async () => {
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(true);
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    const confirmationInfo = {
      emailAddress: 'current@login.com',
      confirmationNumber: 'CURRENTLOGIN'
    };
    expect(loginRegistrant).toHaveBeenCalledWith(confirmationInfo);
    expect(routeToPage).toHaveBeenCalledWith('confirmationPageId');
  });

  it('navigates to the correct confirmation page and resets registration id on admin group member cancellation', async () => {
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(true);
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    const confirmationInfo = {
      emailAddress: 'current@login.com',
      confirmationNumber: 'CURRENTLOGIN'
    };
    expect(loginRegistrant).toHaveBeenCalledWith(confirmationInfo);
    expect(routeToPage).toHaveBeenCalledWith('confirmationPageId');
  });

  it('navigates to the summary page on admin attendee cancellation for SSO flow', async () => {
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(true);
    jest.spyOn(shared, 'isSingleSignOn').mockReturnValue(true);
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(routeToPage).toHaveBeenCalledWith('summary');
    jest.spyOn(shared, 'isSingleSignOn').mockReturnValue(false);
  });

  it('submits form on complete', async () => {
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(false);
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(logoutRegistrant).toHaveBeenCalled();
    expect(routeToPage).toHaveBeenCalledWith('website1');
  });

  it('routes to registration start if website pages are not accessible on submit', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(false);
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(routeToPage).not.toHaveBeenCalled();
    expect(logoutRegistrant).not.toHaveBeenCalled();
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });

  it('navigates to default page on admin reg login registrant error', async () => {
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(true);
    const error = {
      responseBody: {
        validationMessages: [
          {
            localizationKey: 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND'
          }
        ]
      }
    };
    (loginRegistrant as $TSFixMe).mockImplementation(() => {
      throw error;
    });

    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(logoutRegistrant).toHaveBeenCalled();
    expect(routeToPage).toHaveBeenCalledWith('website1');
  });

  it('navigates to reg start page and start a new registration on admin reg login registrant error when website not accessible', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(true);
    const error = {
      responseBody: {
        validationMessages: [
          {
            localizationKey: 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND'
          }
        ]
      }
    };
    (loginRegistrant as $TSFixMe).mockImplementation(() => {
      throw error;
    });

    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(logoutRegistrant).not.toHaveBeenCalled();
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });
  it('throws an error if the validation message is not equal to REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND', async () => {
    jest.spyOn(currentRegistrant, 'isAdminRegistration').mockReturnValue(true);
    const error = {
      responseBody: {
        validationMessages: [
          {
            localizationKey: 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_EMAIL_MISMATCH'
          }
        ]
      }
    };
    (loginRegistrant as $TSFixMe).mockImplementation(() => {
      throw error;
    });
    const wrapper = shallow(<RegistrationCancellationNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    try {
      await widget.props().onCompleteRequest();
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
      expect(err.responseBody).toBe(error.responseBody);
    }
  });
});
