import React from 'react';
import ApptsMeetingInterestWidget from '../ApptsMeetingInterestWidget';
import { mount } from 'enzyme';

const loadMetaDataFunction = jest.fn(() => {
  return {};
});

function getState() {
  return {
    appointments: {
      appointmentEvent: { isValid: true },
      exhibitors: [{ id: 'testId', name: 'Test Exhibitor' }]
    },
    countries: {
      countries: {}
    },
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
      siteInfo: {
        sharedConfigs: {}
      }
    },
    widgetFactory: {
      loadMetaData: loadMetaDataFunction
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            isDefault: true
          }
        }
      }
    }
  };
}

const subscribe = () => {};
const defaultProps = {
  classes: {},
  style: {
    palette: {},
    elements: { link: {} },
    itemNameContainer: { customSettings: { spacing: { padding: { paddingTop: 10 } } } }
  },
  translate: c => c,
  store: { dispatch, getState, subscribe }
};
const defaultPropsV1 = {
  ...defaultProps,
  config: {
    appData: {
      companyList: ['Company A', 'Company B']
    }
  }
};
const defaultPropsV2 = {
  ...defaultProps,
  config: { appData: { version: 2 } }
};

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

describe('ApptsMeetingInterestWidget', () => {
  test('should match snapshot - old version', () => {
    const widget = mount(<ApptsMeetingInterestWidget {...defaultPropsV1} />);
    expect(widget.props()).toMatchSnapshot();
  });

  test('should match snapshot - new version', () => {
    const widget = mount(<ApptsMeetingInterestWidget {...defaultPropsV2} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
