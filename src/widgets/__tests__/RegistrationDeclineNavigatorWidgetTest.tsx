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
import RegistrationDeclineNavigatorWidgetWrapper from '../RegistrationDeclineNavigatorWidget';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { CHECKED_OUT, NOT_REGISTERING } from '../../redux/registrationIntents';
import { routeToPage } from '../../redux/pathInfo';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import { startNewRegistrationAndNavigateToRegistration } from '../../dialogs';
import { hasAccessToWebsitePages } from '../../redux/selectors/event';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';

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

function getStateForWidget() {
  return {
    text: { translate: x => x },
    registrationForm: {
      warnings: {}
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
      ...pageContainingWidgetFixture('declinePageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            todoThisShouldBeRegPathId: {
              id: 'todoThisShouldBeRegPathId',
              pageIds: ['pageId'],
              declinePageIds: ['declinePageId']
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
            decline: {
              hasDeclinePage: true
            }
          }
        }
      }
    }
  };
}
const defaultProperties = {
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
  id: 'widgetId'
};

const subscribe = () => {};
describe('Tests for RegistrationDeclineNavigatorWidget', () => {
  const getState = () => {
    return {
      ...getStateForWidget(),
      regCartStatus: {
        registrationIntent: CHECKED_OUT
      }
    };
  };
  async function dispatch(action) {
    if (typeof action === 'function') {
      await action(dispatch, getState);
    }
  }
  const defaultProps = {
    store: { dispatch, subscribe, getState },
    ...defaultProperties
  };
  it('return from the function when isCheckingOut flag is true', async () => {
    const wrapper = shallow(<RegistrationDeclineNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(routeToPage).toHaveBeenCalledTimes(0);
  });
});

describe('RegistrationNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
  });
  const getState = () => {
    return {
      ...getStateForWidget(),
      regCartStatus: {
        registrationIntent: NOT_REGISTERING
      }
    };
  };
  async function dispatch(action) {
    if (typeof action === 'function') {
      await action(dispatch, getState);
    }
  }
  const defaultProps = {
    store: { dispatch, subscribe, getState },
    ...defaultProperties
  };

  it('navigates to the default website page on exit', async () => {
    const wrapper = shallow(<RegistrationDeclineNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(routeToPage).toHaveBeenCalledWith('website1');
  });

  it('navigates to registration start if website pages are not accessible on exit', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    const wrapper = shallow(<RegistrationDeclineNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(routeToPage).not.toHaveBeenCalled();
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });

  it('submits form on complete', async () => {
    const wrapper = shallow(<RegistrationDeclineNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(logoutRegistrant).toHaveBeenCalled();
    expect(routeToPage).toHaveBeenCalledWith('website1');
  });

  it('routes to registration start if website pages are not accessible on submit', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    const wrapper = shallow(<RegistrationDeclineNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(routeToPage).not.toHaveBeenCalled();
    expect(logoutRegistrant).not.toHaveBeenCalled();
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });
});
