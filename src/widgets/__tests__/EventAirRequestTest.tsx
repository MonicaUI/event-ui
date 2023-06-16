import React from 'react';
import EventAirRequest from '../EventAirRequest';
import { shallow } from 'enzyme';
import { FEATURE_RELEASE_DEVELOPMENT_VARIANT } from '@cvent/event-ui-experiments';

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

let isAirRequestEnabled = true;

function getState() {
  return {
    appData: {
      registrationSettings: {
        registrationPaths: {
          registrationPath1: {
            id: 'registrationPath1',
            travelSettings: {
              airRequestSettings: {
                allowBookOwnFlights: true,
                allowModification: true,
                maxNumberOfAirRequestsPerAttendee: 2,
                requireAirRequest: true,
                allowedAttendeeTypes: 'invitee',
                ownReservationText: 'reservation'
              }
            }
          }
        }
      }
    },
    event: {
      timezone: 35,
      createdDate: new Date('2021-08-27T00:00:00Z'),
      products: {
        admissionItems: {
          '3349dc98-e303-4bf9-b698-e1bdae85f946': {
            id: '3349dc98-e303-4bf9-b698-e1bdae85f946'
          }
        }
      },
      registrationTypes: {
        'b8e50dbf-7437-4eec-a964-bc27d79d0372': {
          id: 'b8e50dbf-7437-4eec-a964-bc27d79d0372'
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          123456789: {
            eventRegistrationId: '123456789',
            registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
            registrationPathId: 'registrationPath1',
            productRegistrations: [
              {
                productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
                productType: 'AdmissionItem',
                requestedAction: 'REGISTER'
              }
            ]
          },
          confirmedGuest: {
            eventRegistrationId: 'confirmedGuest',
            attendeeType: 'GUEST',
            primaryRegistrationId: '123456789',
            registrationPathId: 'registrationPath1',
            requestedAction: 'REGISTER',
            productRegistrations: [
              {
                productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
                productType: 'AdmissionItem',
                requestedAction: 'REGISTER'
              }
            ]
          }
        }
      }
    },
    eventTravel: {
      airData: {
        isAirRequestFormEnabled: isAirRequestEnabled,
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
    travelCart: {
      cart: {
        bookings: [
          {
            airBookings: [
              {
                id: 123456789,
                requestedAction: 'BOOK'
              }
            ]
          }
        ]
      },
      userSession: {
        airRequest: {
          showSummary: true,
          ownBooking: false,
          selectedAirRequestIds: []
        }
      }
    },
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateDate: x => x
    },
    airports: {
      269: {
        id: 269,
        code: 'IAD',
        name: 'Dulles Intl',
        city: 'Washington',
        stateCode: 'DC',
        country: 'United States of America'
      }
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
    defaultUserSession: {
      isPlanner: false
    },
    experiments: { featureRelease: 0 }
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

describe('EventAirRequest', () => {
  test('should produce props from state', () => {
    const widget = shallow(<EventAirRequest {...defaultProps} />);
    expect(widget.props().children.props.isBehindOptOutExperiment).toBeFalsy();
    expect(widget.props()).toMatchSnapshot();
  });
  test('should render', () => {
    const widget = shallow(<EventAirRequest {...defaultProps} />);
    expect(widget).toMatchSnapshot();
  });
  test('should produce props isBehindOptOutExperiment flag set to true', () => {
    const state = getState();
    function getLocalState() {
      return {
        ...state,
        experiments: { featureRelease: FEATURE_RELEASE_DEVELOPMENT_VARIANT }
      };
    }
    const localProps = {
      ...defaultProps,
      store: { dispatch, getState: getLocalState, subscribe }
    };
    const widget = shallow(<EventAirRequest {...localProps} />);
    expect(widget.props().children.props.isBehindOptOutExperiment).toBeTruthy();
  });
  test('should use userText translation if existing', () => {
    const state = getState();
    function getLocalState() {
      return {
        ...state,
        localizedUserText: {
          currentLocale: 'de-DE',
          localizations: {
            'de-DE': {
              'appData.registrationSettings.registrationPaths.registrationPath1.travelSettings.airRequestSettings.ownReservationText':
                'customReservation'
            }
          }
        }
      };
    }
    const localProps = {
      ...defaultProps,
      store: { dispatch, getState: getLocalState, subscribe }
    };
    const widget = shallow(<EventAirRequest {...localProps} />);
    expect(widget.props().children.props.airData.airRequestSetup.airRequestSettings.ownReservationText).toBe(
      'customReservation'
    );
  });
  test('should not render when air request is not enabled', () => {
    isAirRequestEnabled = false;
    const widget = shallow(<EventAirRequest {...defaultProps} />);
    expect(widget).toMatchSnapshot();
    isAirRequestEnabled = true;
  });
});
