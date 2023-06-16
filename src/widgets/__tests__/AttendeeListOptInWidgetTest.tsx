import React from 'react';
import AttendeeListOptInWidget from '../AttendeeListOptInWidget';
import { shallow } from 'enzyme';

function getState() {
  return {
    registrationForm: {
      regCart: {
        eventRegistrations: {
          eventReg1: {
            registrationPathId: '59ded85d-0b25-44bb-9780-c6dc8effb648'
          }
        }
      }
    },
    attendeeList: {
      attendeeEmailSuccess: false,
      attendeeEmailError: false
    }
  };
}

const subscribe = () => {};
const defaultProps = {
  classes: {},
  style: {},
  translate: c => c,
  store: { dispatch, getState, subscribe }
};

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

describe('AttendeeListOptInWidget', () => {
  test('should match snapshot', () => {
    const widget = shallow(<AttendeeListOptInWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
    expect(widget.props().children.props.isGuestRegistrationEnabled).toBeFalsy();
  });

  test('guest reg value should be true when both event and regPath has guest reg on', () => {
    const state = getState();
    function getLocalState() {
      return {
        ...state,
        event: {
          eventFeatureSetup: {
            registrationProcess: {
              guestRegistration: true
            }
          }
        },
        appData: {
          registrationSettings: {
            registrationPaths: {
              '59ded85d-0b25-44bb-9780-c6dc8effb648': {
                guestRegistrationSettings: {
                  isGuestRegistrationEnabled: true
                }
              }
            }
          }
        },
        website: {
          layoutItems: {
            'widget:a0bc032a-2277-4794-b44e-5825cfd161af': {
              id: 'widget:a0bc032a-2277-4794-b44e-5825cfd161af',
              widgetType: 'GuestRegistration',
              layout: {
                parentId: 'row:796efe9d-6572-44ce-bb07-4cbefe24e201',
                type: 'widget'
              }
            },
            'row:796efe9d-6572-44ce-bb07-4cbefe24e201': {
              id: 'row:796efe9d-6572-44ce-bb07-4cbefe24e201',
              layout: {
                parentId: 'temp-1469646842440',
                type: 'row'
              }
            },
            'temp-1469646842440': {
              id: 'temp-1469646842440',
              layout: {
                parentId: 'temp-1469646842439',
                type: 'sectionColumn'
              }
            },
            'temp-1469646842439': {
              id: 'temp-1469646842439',
              layout: {
                parentId: 'id-3',
                type: 'Section'
              }
            },
            'id-3': {
              id: 'id-3',
              layout: {
                parentId: null,
                type: 'container'
              }
            }
          },
          pages: {
            regProcessStep1: {
              rootLayoutItemIds: ['id-3']
            }
          },
          pluginData: {
            registrationProcessNavigation: {
              registrationPaths: {
                '59ded85d-0b25-44bb-9780-c6dc8effb648': {
                  pageIds: ['regProcessStep1']
                }
              }
            }
          }
        }
      };
    }
    const props = {
      ...defaultProps,
      store: { dispatch, getState: getLocalState, subscribe }
    };
    const widget = shallow(<AttendeeListOptInWidget {...props} />);
    expect(widget.props().children.props.isGuestRegistrationEnabled).toBeTruthy();
  });
});
