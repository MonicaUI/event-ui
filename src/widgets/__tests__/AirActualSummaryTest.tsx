import React from 'react';
import AirActualSummary from '../AirActualSummary';
import { shallow } from 'enzyme';
import AirActualData from 'event-widgets/lib/AirActualSummary/AirActualFixture';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';

function getState() {
  return {
    event: {
      id: 'eventId',
      timezone: 35
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          '108155d8': {
            eventRegistrationId: '108155d8',
            eventId: 'eventId'
          }
        }
      }
    },
    travelCart: {
      cart: {
        bookings: [
          {
            id: '108155d8',
            airActuals: AirActualData.airActuals
          }
        ]
      }
    },
    airports: AirTravelData.airports,
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateTime: x => x
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
    },
    currencies: {
      1: {
        id: '1',
        iSOCode: 123,
        nameOfSymbol: 'Double Dollars',
        symbol: '$$',
        name: 'Double Dollars',
        resourceKey: 'resourceKey1'
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
  classes: {},
  style: {},
  translate: c => c,
  store: { dispatch, getState, subscribe }
};

describe('AirActualSummary produces props from state', () => {
  test('should match', () => {
    const widget = shallow(<AirActualSummary {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
