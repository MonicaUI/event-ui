/* global*/
import React from 'react';
import { shallow } from 'enzyme/build';
import GroupFlight from '../GroupFlight';
import getStoreForTest from 'event-widgets/utils/testUtils';

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
    })
  };
});

jest.mock('event-widgets/redux/selectors/eventTravel', () => {
  return {
    getGroupFlightsSnapshotData: () => ({
      isGroupFlightEnabled: true,
      groupFlightSetup: { groupFlights: [] }
    })
  };
});

const mockReducer = () => {
  return {
    defaultUserSession: { isPlanner: true },
    eventTravel: {},
    event: {},
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateDate: x => x
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          REG_1: {
            registrationPathId: 'REG_PATH',
            eventRegistrationId: 'REG_1',
            attendeeType: 'ATTENDEE',
            attendee: { personalInformation: { firstName: 'Maynard', lastName: 'Keenan' } }
          },
          REG_2: {
            eventRegistrationId: 'REG_2',
            registrationPathId: 'REG_PATH',
            primaryRegistrationId: 'REG_1',
            attendeeType: 'GUEST',
            requestedAction: 'REGISTER',
            attendee: { personalInformation: { firstName: 'Danny', lastName: 'Carey' } }
          }
        }
      }
    },
    travelCart: {
      cart: {
        bookings: [
          {
            id: 'REG_1',
            groupFlightBookings: [{ id: 'GROUP_FLIGHT_1' }]
          },
          {
            id: 'REG_2',
            groupFlightBookings: [{ id: 'GROUP_FLIGHT_2' }]
          }
        ]
      },
      userSession: { groupFlights: { selectedGroupFlightIds: [] } }
    }
  };
};

const mockStore = getStoreForTest(mockReducer, {});

const defaultProps = {
  classes: {},
  style: {},
  translate: c => c,
  store: mockStore
};

describe('GroupFlightWidget', () => {
  test('should produce props from state', () => {
    const widget = shallow(<GroupFlight {...defaultProps} />);
    expect(widget.props()).toMatchSnapshot();
  });
});
