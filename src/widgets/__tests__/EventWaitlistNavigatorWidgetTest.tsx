import React from 'react';
jest.mock('../../redux/pathInfo');
jest.mock('../../redux/registrationForm/regCart', () => ({
  saveRegistration: x => x,
  finalizeWaitlistRegistration: x => x
}));
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    getDefaultWebsitePageId: () => 'website1'
  };
});
import { shallow } from 'enzyme';
import EventWaitlistNavigatorWidgetWrapper from '../EventWaitlistNavigatorWidget';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { REGISTERING } from '../../redux/registrationIntents';
import { routeToPage } from '../../redux/pathInfo';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import pageContainingWidgetFixture from '../../testUtils/pageContainingWidgetFixture';
import { startNewRegistrationAndNavigateToRegistration } from '../../dialogs';
import { hasAccessToWebsitePages } from '../../redux/selectors/event';

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

function getState() {
  return {
    text: { translate: x => x },
    registrationForm: {
      warnings: {}
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
      ...pageContainingWidgetFixture('pageId', 'widgetId'),
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            regPathId: {
              id: 'regPathId',
              pageIds: ['pageId'],
              eventWaitlistPageIds: ['waitlistPageId']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            registrationTypeSettings: {
              limitVisibility: false
            },
            isDefault: true
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

describe('RegistrationNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
  });

  it('navigates to the default website page on exit', async () => {
    const wrapper = shallow(<EventWaitlistNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(routeToPage).toHaveBeenCalledWith('website1');
  });

  it('navigates to registration start if website pages are not accessible on exit', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    const wrapper = shallow(<EventWaitlistNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onExitRequest();
    expect(routeToPage).not.toHaveBeenCalled();
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });

  it('submits form on complete', async () => {
    const wrapper = shallow(<EventWaitlistNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(routeToPage).toHaveBeenCalledWith('website1');
  });

  it('submits form on complete and redirects to registration start when website pages are not accessible', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    const wrapper = shallow(<EventWaitlistNavigatorWidgetWrapper {...defaultProps} />).dive();
    const widget = wrapper.find(LinearPageNavigatorWidget);
    await widget.props().onCompleteRequest();
    expect(routeToPage).not.toHaveBeenCalled();
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });
});
