import React from 'react';
import DeemFlightRequestWidget from '../DeemFlightRequestWidget/DeemFlightRequestWidget';
import { shallow } from 'enzyme/build';

const redirectToDeem = jest.fn(() => {
  return {};
});

function translate(res, opts) {
  return opts ? `${res}:${JSON.stringify(opts)}` : res;
}

function getState() {
  return {
    appData: {
      registrationSettings: {
        registrationPaths: {
          '600b2fea-1aad-4fd1-80f6-0eb506f94ec0': {
            id: '600b2fea-1aad-4fd1-80f6-0eb506f94ec0',
            name: 'Temp Registration Path',
            travelSettings: {
              deemFlightRequestSettings: {
                displayDeemSection: 1,
                regularGroupPolicy: 'blank',
                regularGroupPolicyNew: '',
                guestGroupPolicy: 'blank',
                guestGroupPolicyNew: ''
              }
            },
            isDefault: true
          }
        }
      }
    },
    registrationForm: {
      regCart: {
        regCartId: '6b6cb8f0-812b-4ccc-b0af-e7ec08750fc5',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                firstName: 'John',
                lastName: 'Doe'
              }
            },
            attendeeType: 'ATTENDEE',
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            eventId: '4d57a132-93e5-4187-a25f-e06ad2f4bb67',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000000'
          }
        }
      }
    },
    eventTravel: {
      airData: {
        isDeemEnabled: true
      }
    }
  };
}

const mockFn = jest.fn();
const defaultProps = {
  classes: {},
  style: {
    elements: {},
    palette: {}
  },
  translate,
  store: { getState, subscribe: mockFn, dispatch: mockFn },
  config: {
    deemFlightRequestHeader: 'Deem Flight Request',
    instructionalText: 'For easy travel plans, book your flight through Deem.',
    goToDeemButtonText: 'Go to Deem'
  },
  onFlightRequest: redirectToDeem
};

describe('Tests for DeemFlightRequestWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should produce props from state', () => {
    const widget = shallow(<DeemFlightRequestWidget {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });

  test('should match', () => {
    const wrapper = shallow(<DeemFlightRequestWidget {...defaultProps} />);
    expect(wrapper.props().children.props).toMatchObject({
      isDeemEnabled: true,
      attendeeInfo: { firstName: 'John', lastName: 'Doe' }
    });
  });
});
