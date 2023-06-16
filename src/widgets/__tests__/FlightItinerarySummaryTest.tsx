import React from 'react';
import { shallow } from 'enzyme';
import AirActualData from 'event-widgets/lib/AirActualSummary/AirActualFixture';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';
import FlightItinerarySummary from '../FlightItinerarySummary';

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
    eventTravel: {
      airData: {
        isAirRequestFormEnabled: false,
        isGroupFlightEnabled: false,
        isAirActualFormEnabled: false,
        isGetThereEnabled: false,
        isConcurEnabled: false,
        isDeemEnabled: false,
        airRequestSetup: {
          secureFlightFieldsDisplay: 0,
          showTravellerNumber: true,
          tripFormat: 1,
          showTimePreference: true,
          timePreferenceType: 1,
          showSeatingPreference: true,
          showAgeCategory: true,
          showMealPreference: true,
          showSpecialRequirements: true,
          showAirlinePreference: true,
          allowedTicketTypes: [],
          defaultSchedule: {
            departureDate: '2018-08-05T00:00:00.000Z',
            departureDateUtc: '2018-08-05T00:00:00.000Z',
            returnDate: '2018-08-08T22:00:00.000Z',
            returnDateUtc: '2018-08-08T22:00:00.000Z',
            departureAirportId: 1855,
            arrivalAirportId: 290
          },
          restrictions: {
            earliestDepartureDate: '2018-08-05T00:00:00.000Z',
            earliestDepartureDateUtc: '2018-08-05T00:00:00.000Z',
            latestReturnDate: '2018-08-08T22:00:00.000Z',
            latestReturnDateUtc: '2018-08-08T22:00:00.000Z',
            limitDepartureAirportIds: [1419, 1855],
            limitArrivalAirportIds: [94, 290]
          },
          rules: [],
          isDepartureArrivalInformationRequired: false
        }
      }
    },
    airports: AirTravelData.airports,
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateTime: jest.fn()
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

describe('FlightItinerarySummary produces props from state', () => {
  test('should match', () => {
    const widget = shallow(<FlightItinerarySummary {...defaultProps} />);
    expect(widget.childAt(0).props()).toMatchObject({
      airActualsToDisplay: {
        guests: [],
        primary: AirActualData.airActuals
      },
      airports: AirTravelData.airports,
      event: {
        id: getState().event.id,
        timezone: getState().timezones[getState().event.timezone]
      },
      groupFlights: [],
      groupFlightsToDisplay: {
        guests: [],
        primary: []
      }
    });
  });
});
