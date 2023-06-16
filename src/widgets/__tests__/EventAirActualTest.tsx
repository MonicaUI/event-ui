import React from 'react';
import EventAirActual from '../EventAirActual';
import { shallow } from 'enzyme';
import AirActualData from 'event-widgets/lib/AirActualSummary/AirActualFixture';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';

jest.mock('event-widgets/utils/travelUtils', () => {
  return {
    transformEventDates: state => ({
      ...state.event,
      timezone: {
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
    }),
    getCurrencySymbol: () => 'Double Dollars'
  };
});

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
      translateTime: () => {}
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
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          'b8e50dbf-7437-4eec-a964-bc27d79d0373': {
            travelSettings: {
              hotelRequestSettings: {
                roommateRequestSettings: {
                  allowRequestFullRoom: true,
                  allowRoommatePreference: true,
                  roommatePreferenceOption: 'visible'
                }
              }
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

const subscribe = jest.fn();
const defaultProps = {
  classes: {},
  style: {},
  translate: c => c,
  store: { dispatch, getState, subscribe }
};

describe('EventAirActual produces props from state', () => {
  test('should match', () => {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: {}; style: {}; translate: (c: any... Remove this comment to see the full error message
    const widget = shallow(<EventAirActual {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
