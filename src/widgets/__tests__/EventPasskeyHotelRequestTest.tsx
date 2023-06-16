import React from 'react';
import EventPasskeyHotelRequest from '../EventPasskeyHotelRequest';
import { shallow } from 'enzyme';

const noOp = jest.fn();
const subscribe = noOp;

function getState() {
  return {
    registrationForm: {
      regCart: {
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            attendee: {
              personalInformation: {
                contactIdEncoded: 'UW0yb6e4SeWHLA8_WRFJyg'
              }
            }
          }
        }
      }
    },
    eventTravel: {
      hotelsData: {
        hotels: [],
        passkeySetup: {
          attendeeTypeMappingBy: '',
          attendeeTypeMappings: {}
        }
      }
    },
    travelCart: {
      cart: {
        bookings: []
      }
    },
    event: {
      timezone: 35
    },
    text: {
      translateDate: ''
    },
    timezones: {
      35: {
        id: 35,
        name: 'Eastern Time',
        nameResourceKey: 'Event_Timezone_Name_35__resx',
        plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
        hasDst: true,
        utcOffset: -300,
        abbreviation: 'ET',
        abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
        dstInfo: []
      }
    }
  };
}

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const defaultProps = {
  store: { dispatch, getState, subscribe },
  style: {},
  config: {},
  hideWidget: false,
  translate: jest.fn()
};

describe('EventPasskeyHotelRequest produces props from state', () => {
  test('should match', () => {
    const widget = shallow(<EventPasskeyHotelRequest {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
