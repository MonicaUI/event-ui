import {
  getAirBookingsToDisplay,
  hasAnyBookingsToProcess,
  hasAnyPaidHotelRoomBookings,
  getAirActualsToDisplay,
  getGroupFlightBookingsToDisplay,
  hasAnyHotelRoomBookingsWithShoulderDates,
  hasAnyHotelRoomBookingsWithBI,
  getAttendeeRegTypeAndAdmItemIds,
  getSelectedRoomsInHotelRequests,
  createDerivedRoomRegTypeAssociations
} from '../travelUtils';
import {
  getHotelRoomBookingsToDisplay,
  hasAnyTravelBookingForInviteeAndGuests,
  getCurrencyDetailsForAirActuals
} from '../travelUtils';
import { EVENT_HOTEL_VISIBILITY_OPTION } from 'event-widgets/utils/travelConstants';
import * as getWidgetModule from '../../redux/website/pageContents';

jest.mock('../../redux/selectors/currentRegistrant', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/selectors/currentRegistrant'),
    getEventRegistration: () => ({ eventRegistrationId: 'eventRegistrationIdOne' }),
    getConfirmedGuests: () => []
  };
});

const testEventRegistrationId = 'eventRegistrationIdOne';
const guestBookingId = 'guestBookingId';
const primaryRegHotelId = 'primaryRegHotelId';
const primaryRegRoomTypeId = 'primaryRegRoomTypeId';
const freeRegRoomTypeId = 'freeRegRoomTypeId';
const primaryRegTypeId = 'primaryRegTypeId';

const plannerApprovedCheckin = new Date('2019-01-10T20:20:00.000Z');
const shoulderDateBeforeCheckin = new Date('2019-01-11T20:20:00.000Z');
const checkinDate = new Date('2019-01-12T20:20:00.000Z');
const checkoutDate = new Date('2019-01-13T20:20:00.000Z');
const shoulderDateAfterCheckout = new Date('2019-01-14T20:20:00.000Z');
const plannerApprovedCheckout = new Date('2019-01-15T20:20:00.000Z');

const state = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          isDefault: true,
          isActive: true,
          associatedRegistrationTypes: [],
          id: 'regPathId'
        }
      }
    }
  },
  eventTravel: {
    hotelsData: {
      isHotelRequestEnabled: true,
      hotels: [
        {
          id: 'hotelId',
          isActive: true,
          roomTypes: [
            {
              id: 'room1Id',
              roomRate: [],
              isOpenForRegistration: true,
              associatedRegPathSettings: {
                regPathId: { allowCharge: true }
              }
            }
          ]
        }
      ]
    },
    airData: {
      isAirRequestFormEnabled: true,
      isAirActualFormEnabled: true,
      airActualSetup: {
        isPlannerDisplayOnly: false,
        displaySettings: {}
      }
    }
  },
  travelCart: {
    cart: {
      bookings: [
        {
          id: testEventRegistrationId,
          requestedAction: 'BOOK',
          airBookings: [
            {
              id: 'airBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'airBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'airBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          hotelRoomBookings: [
            {
              id: 'hotelRoomBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'hotelRoomBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'hotelRoomBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          airActuals: [
            {
              id: 'airActualIdOne',
              requestedAction: 'BOOK',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'airActualIdTwo',
              requestedAction: 'MODIFY',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'airActualIdThree',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            }
          ],
          groupFlightBookings: [
            {
              id: 'groupFlightIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'groupFlightIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'groupFlightIdThree',
              requestedAction: 'CANCEL'
            }
          ]
        },
        {
          id: 'bookingTwo',
          requestedAction: 'CANCEL',
          airBookings: [
            {
              id: 'newAirBookingIdOne',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newAirBookingIdTwo',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newAirBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          groupFlightBookings: [
            {
              id: 'newGroupFlightBookingIdOne',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newGroupFlightBookingIdTwo',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newGroupFlightBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          hotelRoomBookings: [
            {
              id: 'newHotelRoomBookingIdOne',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newHotelRoomBookingIdTwo',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newHotelRoomBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          airActuals: [
            {
              id: 'newAirActualIdOne',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'newAirActualIdTwo',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'newAirActualIdThree',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            }
          ]
        },
        {
          id: guestBookingId,
          requestedAction: 'BOOK',
          airBookings: [
            {
              id: 'guestAirBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'guestAirBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'guestAirBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          groupFlightBookings: [
            {
              id: 'guestGroupFlightBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'guestGroupFlightBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'guestGroupFlightBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          hotelRoomBookings: [
            {
              id: 'guestHotelRoomBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'guestHotelRoomBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'guestHotelRoomBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          airActuals: [
            {
              id: 'guestAirActualIdOne',
              requestedAction: 'BOOK',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'guestAirActualIdTwo',
              requestedAction: 'MODIFY',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'guestAirActualIdThree',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            }
          ]
        }
      ]
    }
  }
};

describe('travelUtils', () => {
  let airBookingsToDisplay = getAirBookingsToDisplay(state, testEventRegistrationId, []);
  test('> returns only air bookings for given registrationId', () => {
    expect(airBookingsToDisplay.primary).toHaveLength(2);
    expect(airBookingsToDisplay.primary[0]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
    expect(airBookingsToDisplay.primary[1]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
  });
  test('> returns only air bookings with BOOK or MODIFY', () => {
    expect(airBookingsToDisplay.primary[0]).toHaveProperty('requestedAction', 'BOOK');
    expect(airBookingsToDisplay.primary[1]).toHaveProperty('requestedAction', 'MODIFY');
  });
  test('should return air bookings for guests', () => {
    airBookingsToDisplay = getAirBookingsToDisplay(state, 'dummy', [guestBookingId]);
    expect(airBookingsToDisplay.guests).toHaveLength(2);
    expect(airBookingsToDisplay.guests[0]).toHaveProperty('attendeeRegistrationId', guestBookingId);
    expect(airBookingsToDisplay.guests[1]).toHaveProperty('attendeeRegistrationId', guestBookingId);
  });
});

describe('travelUtils 1', () => {
  let groupFlightBookingsToDisplay = getGroupFlightBookingsToDisplay(state, testEventRegistrationId, []);
  test('> returns only group flight bookings for given registrationId', () => {
    expect(groupFlightBookingsToDisplay.primary).toHaveLength(2);
    expect(groupFlightBookingsToDisplay.primary[0]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
    expect(groupFlightBookingsToDisplay.primary[1]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
  });
  test('> returns only group flight bookings with BOOK or MODIFY', () => {
    expect(groupFlightBookingsToDisplay.primary[0]).toHaveProperty('requestedAction', 'BOOK');
    expect(groupFlightBookingsToDisplay.primary[1]).toHaveProperty('requestedAction', 'MODIFY');
  });
  test('should return group flight bookings for guests', () => {
    groupFlightBookingsToDisplay = getGroupFlightBookingsToDisplay(state, 'dummy', [guestBookingId]);
    expect(groupFlightBookingsToDisplay.guests).toHaveLength(2);
    expect(groupFlightBookingsToDisplay.guests[0]).toHaveProperty('attendeeRegistrationId', guestBookingId);
    expect(groupFlightBookingsToDisplay.guests[1]).toHaveProperty('attendeeRegistrationId', guestBookingId);
  });
});

describe('travelUtils 2', () => {
  let hotelRoomBookingsToDisplay = getHotelRoomBookingsToDisplay(state, testEventRegistrationId, []);
  test('should return only hotel room bookings for given registrationId', () => {
    expect(hotelRoomBookingsToDisplay.primary).toHaveLength(2);
    expect(hotelRoomBookingsToDisplay.primary[0]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
    expect(hotelRoomBookingsToDisplay.primary[1]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
  });
  test('should return only hotel room bookings with BOOK or MODIFY', () => {
    expect(hotelRoomBookingsToDisplay.primary[0]).toHaveProperty('requestedAction', 'BOOK');
    expect(hotelRoomBookingsToDisplay.primary[1]).toHaveProperty('requestedAction', 'MODIFY');
  });
  test('should return hotel room bookings for guests', () => {
    hotelRoomBookingsToDisplay = getHotelRoomBookingsToDisplay(state, 'dummy', [guestBookingId]);
    expect(hotelRoomBookingsToDisplay.guests).toHaveLength(2);
    expect(hotelRoomBookingsToDisplay.guests[0]).toHaveProperty('attendeeRegistrationId', guestBookingId);
    expect(hotelRoomBookingsToDisplay.guests[1]).toHaveProperty('attendeeRegistrationId', guestBookingId);
    expect(hotelRoomBookingsToDisplay.guests[0]).toHaveProperty('requestedAction', 'BOOK');
    expect(hotelRoomBookingsToDisplay.guests[1]).toHaveProperty('requestedAction', 'MODIFY');
  });
});

describe('travelUtils 3', () => {
  let airActualsToDisplay = getAirActualsToDisplay(state, testEventRegistrationId, []);
  test('> returns only air actuals for given registrationId', () => {
    expect(airActualsToDisplay.primary).toHaveLength(2);
    expect(airActualsToDisplay.primary[0]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
    expect(airActualsToDisplay.primary[1]).toHaveProperty('attendeeRegistrationId', testEventRegistrationId);
  });
  test('> returns only air bookings with BOOK or MODIFY', () => {
    expect(airActualsToDisplay.primary[0]).toHaveProperty('requestedAction', 'BOOK');
    expect(airActualsToDisplay.primary[1]).toHaveProperty('requestedAction', 'MODIFY');
  });
  test('should return air bookings for guests', () => {
    airActualsToDisplay = getAirActualsToDisplay(state, 'dummy', [guestBookingId]);
    expect(airActualsToDisplay.guests).toHaveLength(2);
    expect(airActualsToDisplay.guests[0]).toHaveProperty('attendeeRegistrationId', guestBookingId);
    expect(airActualsToDisplay.guests[1]).toHaveProperty('attendeeRegistrationId', guestBookingId);
  });
  test('> Shouldnt return air actuals associated to group flights', () => {
    const modifiedState = {
      ...state,
      travelCart: {
        cart: {
          bookings: [
            {
              id: 'BOOKING_1',
              airActuals: [
                { id: 'NEW_AIR_ACTUAL', currencyId: 123, flightDetails: [] },
                { airReservationActualId: 'NON_GROUP_FLIGHT', currencyId: 123, flightDetails: [] },
                { airReservationActualId: 'GROUP_FLIGHT_1', currencyId: 123, flightDetails: [] },
                { airReservationActualId: 'GROUP_FLIGHT_2', currencyId: 123, flightDetails: [] }
              ],
              groupFlightBookings: [
                { id: 'NEW_GROUP_FLIGHT' },
                { airReservationActualId: 'GROUP_FLIGHT_1' },
                { airReservationActualId: 'GROUP_FLIGHT_2' }
              ]
            }
          ]
        }
      }
    };
    const { primary } = getAirActualsToDisplay(modifiedState, 'BOOKING_1', []);
    expect(primary.length).toBe(2); // First two will only be returned
    expect(primary.find(aa => aa.id === 'NEW_AIR_ACTUAL')).toBeTruthy();
    expect(primary.find(aa => aa.airReservationActualId === 'NON_GROUP_FLIGHT')).toBeTruthy();
    expect(primary.find(aa => aa.airReservationActualId === 'GROUP_FLIGHT_1')).toBeFalsy();
    expect(primary.find(aa => aa.airReservationActualId === 'GROUP_FLIGHT_2')).toBeFalsy();
  });
});

describe('hasAnyBookingsToProcess method', () => {
  const airBooking = {
    id: 'AIR_BOOKING_ONE',
    requestedAction: 'BOOK'
  };

  const hotelBooking = {
    id: 'HOTEL_BOOKING_ONE',
    requestedAction: 'MODIFY'
  };

  const groupFlightBooking = {
    id: 'GROUP_FLIGHT_BOOKING_ONE',
    requestedAction: 'MODIFY'
  };

  const airActual = {
    id: 'AIR_ACTUAL_ONE',
    requestedAction: 'MODIFY',
    sourceTypeId: 1
  };

  const eventTravelWithHotelRequestEnabled = {
    hotelsData: {
      isHotelRequestEnabled: true
    }
  };

  const eventTravelWithPasskeyEnabled = {
    hotelsData: {
      isPasskeyEnabled: true
    }
  };

  const getTravelCart = (
    hotelRequest,
    airRequest,
    airActualRequest,
    concurAirActuals,
    pnrAirAcutuals,
    groupFlightRequest
  ) => {
    return [
      {
        id: 'BOOKING_ONE',
        requestedAction: 'BOOK',
        airBookings: airRequest ? [airRequest] : [],
        groupFlightBookings: groupFlightRequest ? [groupFlightRequest] : [],
        hotelRoomBookings: hotelRequest ? [hotelRequest] : [],
        airActuals: airActualRequest ? [airActualRequest] : [],
        concurAirActuals: concurAirActuals ? [concurAirActuals] : [],
        pnrAirAcutuals: pnrAirAcutuals ? [pnrAirAcutuals] : []
      }
    ];
  };

  const getCart = (
    hotelRequest,
    airRequest?,
    airActualRequest?,
    concurAirActuals?,
    pnrAirAcutuals?,
    groupFlightRequest?
  ) => {
    return {
      cart: {
        bookings:
          !hotelRequest &&
          !airRequest &&
          !airActualRequest &&
          !concurAirActuals &&
          !pnrAirAcutuals &&
          !groupFlightRequest
            ? []
            : getTravelCart(
                hotelRequest,
                airRequest,
                airActualRequest,
                concurAirActuals,
                pnrAirAcutuals,
                groupFlightRequest
              )
      },
      userSession: {
        travelAnswers: {}
      }
    };
  };

  test('should return true if only air bookings are present', () => {
    const travelCart = getCart(null, airBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithHotelRequestEnabled)).toBeTruthy();
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return true if only hotel bookings are present with hotel request enabled', () => {
    const travelCart = getCart(hotelBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithHotelRequestEnabled)).toBeTruthy();
  });

  test('should return true if only group flight bookings are present', () => {
    const travelCart = getCart(null, null, null, null, null, groupFlightBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithHotelRequestEnabled)).toBeTruthy();
  });

  test('should return false if only hotel bookings are present with passkey enabled', () => {
    const travelCart = getCart(hotelBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeFalsy();
  });

  test('should return true if only hotel bookings are present with passkey enabled, with air actuals', () => {
    const travelCart = getCart(hotelBooking, null, airActual);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return true if hotel bookings are present with passkey enabled, with group flights', () => {
    const travelCart = getCart(hotelBooking, null, null, null, null, groupFlightBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return true if air bookings are present with air actuals', () => {
    const travelCart = getCart(null, airBooking, airActual);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return true if group flight bookings are present with air actuals', () => {
    const travelCart = getCart(null, null, airActual, null, null, groupFlightBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return true if air bookings are present with group flights', () => {
    const travelCart = getCart(null, airBooking, null, null, null, groupFlightBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return true if only air actuals bookings are present', () => {
    const travelCart = getCart(null, null, airActual);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
  });

  test('should return false if only concur air actuals are present', () => {
    const travelCart = getCart(null, null, null, airActual);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeFalsy();
  });

  test('should return false if only pnr air actuals are present', () => {
    const travelCart = getCart(null, null, null, null, airActual);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeFalsy();
  });

  test('should return false if only concur and pnr air actuals are present', () => {
    const travelCart = getCart(null, null, null, airActual, airActual);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeFalsy();
  });

  test('should return true if both air bookings and hotel bookings are present', () => {
    const travelCart = getCart(hotelBooking, airBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithHotelRequestEnabled)).toBeTruthy();
  });

  test('should return true if all types of bookings are present', () => {
    const travelCart = getCart(hotelBooking, airBooking, airActual, null, null, groupFlightBooking);
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithPasskeyEnabled)).toBeTruthy();
    expect(hasAnyBookingsToProcess(travelCart, eventTravelWithHotelRequestEnabled)).toBeTruthy();
  });
});

describe('hasAnyTravelBookingForInviteeAndGuests method', () => {
  test('should return true if air booking is present', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: [
            {
              id: testEventRegistrationId,
              requestedAction: 'BOOK',
              airBookings: [
                {
                  id: 'airBookingIdOne',
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyTravelBookingForInviteeAndGuests(newState, testEventRegistrationId, [])).toBeTruthy();
  });
  test('should return true if hotel booking is present', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: [
            {
              id: testEventRegistrationId,
              requestedAction: 'BOOK',
              hotelRoomBookings: [
                {
                  id: 'hotelRoomBookingIdOne',
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyTravelBookingForInviteeAndGuests(newState, testEventRegistrationId, [])).toBeTruthy();
  });
  test('should return false if no booking present', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: []
        }
      }
    };
    expect(hasAnyTravelBookingForInviteeAndGuests(newState, testEventRegistrationId, [])).toBeFalsy();
  });
  test('should return true if group flight booking is present', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: [
            {
              id: testEventRegistrationId,
              requestedAction: 'BOOK',
              groupFlightBookings: [
                {
                  id: 'airBookingIdOne',
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyTravelBookingForInviteeAndGuests(newState, testEventRegistrationId, [])).toBeTruthy();
  });
});

describe('hasAnyPaidHotelRoomBookings method', () => {
  const hotels = [
    {
      id: primaryRegHotelId,
      roomTypes: [
        {
          id: primaryRegRoomTypeId,
          roomRate: [
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: plannerApprovedCheckin,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: shoulderDateBeforeCheckin,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: checkinDate,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: checkoutDate,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: shoulderDateAfterCheckout,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: plannerApprovedCheckout,
              rate: 10
            }
          ]
        },
        {
          id: freeRegRoomTypeId,
          roomRate: [
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: plannerApprovedCheckin,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: shoulderDateBeforeCheckin,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: checkinDate,
              rate: 0
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: checkoutDate,
              rate: 0
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: shoulderDateAfterCheckout,
              rate: 10
            },
            {
              contactTypeId: primaryRegTypeId,
              roomRateDate: plannerApprovedCheckout,
              rate: 10
            }
          ]
        }
      ]
    }
  ];

  test('should return true if a paid hotel room booking exists', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: [
            {
              id: testEventRegistrationId,
              requestedAction: 'BOOK',
              registrationTypeId: primaryRegTypeId,
              hotelRoomBookings: [
                {
                  id: 'hotelRoomBookingIdOne',
                  hotelId: primaryRegHotelId,
                  roomTypeId: primaryRegRoomTypeId,
                  checkinDate: shoulderDateBeforeCheckin,
                  checkoutDate: shoulderDateAfterCheckout,
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyPaidHotelRoomBookings(newState, testEventRegistrationId, [], hotels)).toBeTruthy();
  });

  test('should return true if a paid hotel room booking exists based on planner fields', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: [
            {
              id: testEventRegistrationId,
              requestedAction: 'BOOK',
              registrationTypeId: primaryRegTypeId,
              hotelRoomBookings: [
                {
                  id: 'hotelRoomBookingIdOne',
                  hotelId: primaryRegHotelId,
                  roomTypeId: primaryRegRoomTypeId,
                  checkinDate: plannerApprovedCheckin,
                  checkoutDate: plannerApprovedCheckout,
                  requestedAction: 'BOOK',
                  plannerFields: {
                    plannerConfirmedCheckinDate: plannerApprovedCheckin,
                    plannerConfirmedCheckoutDate: plannerApprovedCheckout
                  }
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyPaidHotelRoomBookings(newState, testEventRegistrationId, [], hotels)).toBeTruthy();
  });

  test('should return false if all bookings are free or have paid pending shoulder dates and free event dates', () => {
    const newState = {
      travelCart: {
        cart: {
          bookings: [
            {
              id: testEventRegistrationId,
              requestedAction: 'BOOK',
              registrationTypeId: primaryRegTypeId,
              hotelRoomBookings: [
                {
                  id: 'hotelRoomBookingIdOne',
                  hotelId: primaryRegHotelId,
                  roomTypeId: freeRegRoomTypeId,
                  checkinDate: shoulderDateBeforeCheckin,
                  checkoutDate: shoulderDateAfterCheckout,
                  confirmedCheckinDate: checkinDate,
                  confirmedCheckoutDate: checkoutDate,
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyPaidHotelRoomBookings(newState, testEventRegistrationId, [], hotels)).toBeFalsy();
  });

  test('get currency list with details like currency symbol', () => {
    const currencies = {
      1: {
        id: '1',
        iSOCode: 123,
        nameOfSymbol: 'USD',
        symbol: '$',
        name: 'U.S. Dollar',
        resourceKey: 'resourceKey1'
      },
      2: {
        id: '2',
        iSOCode: 234,
        symbol: 'MXN',
        name: 'Mexican Peso',
        symbolName: 'MXN',
        resourceKey: 'resourceKey2'
      }
    };
    const accountCurrencies = [
      {
        id: 1,
        label: 'U.S. Dollar'
      }
    ];
    const newState = {
      account: {
        accountCurrencies
      },
      currencies
    };
    const currencyList = getCurrencyDetailsForAirActuals(newState);
    expect(currencyList).toHaveLength(1);
    expect(currencyList[0]).toHaveProperty('iSOCode', 123);
    expect(currencyList[0]).toHaveProperty('nameOfSymbol', 'USD');
    expect(currencyList[0]).toHaveProperty('symbol', '$');
    expect(currencyList[0]).toHaveProperty('label', 'U.S. Dollar');
  });
});

describe('hasAnyHotelRoomBookingsWithShoulderDates method >', () => {
  const hotels = [
    {
      id: primaryRegHotelId,
      arrivalDate: checkinDate,
      departureDate: checkoutDate,
      checkInShoulderDays: 2,
      checkOutShoulderDays: 2
    }
  ];
  const newState = {
    travelCart: {
      cart: {
        bookings: [
          {
            ...state.travelCart.cart.bookings[0],
            hotelRoomBookings: [
              {
                ...state.travelCart.cart.bookings[0].hotelRoomBookings[0],
                hotelId: primaryRegHotelId,
                checkinDate,
                checkoutDate
              }
            ]
          }
        ]
      }
    }
  };
  const newStateGuest = {
    travelCart: {
      cart: {
        bookings: [
          {
            ...state.travelCart.cart.bookings[2],
            hotelRoomBookings: [
              {
                ...state.travelCart.cart.bookings[2].hotelRoomBookings[0],
                hotelId: primaryRegHotelId,
                checkinDate,
                checkoutDate
              }
            ]
          }
        ]
      }
    }
  };
  describe('should return false if no hotel room booking has shoulder dates >', () => {
    test("for current registrant's hotel room bookings", () => {
      expect(hasAnyHotelRoomBookingsWithShoulderDates(newState, testEventRegistrationId, [], hotels)).toBeFalsy();
    });
    test("for guest's hotel room bookings", () => {
      expect(hasAnyHotelRoomBookingsWithShoulderDates(newStateGuest, [], [guestBookingId], hotels)).toBeFalsy();
    });
  });
  describe('should return true if at least one hotel room booking has shoulder dates >', () => {
    test("for current registrant's hotel room bookings", () => {
      const modifiedNewState = {
        travelCart: {
          cart: {
            bookings: [
              {
                ...newState.travelCart.cart.bookings[0],
                hotelRoomBookings: [
                  {
                    ...newState.travelCart.cart.bookings[0].hotelRoomBookings[0],
                    checkinDate: shoulderDateBeforeCheckin
                  }
                ]
              }
            ]
          }
        }
      };
      expect(
        hasAnyHotelRoomBookingsWithShoulderDates(modifiedNewState, testEventRegistrationId, [], hotels)
      ).toBeTruthy();
    });
    test("for guest's hotel room bookings", () => {
      const modifiedNewStateGuest = {
        travelCart: {
          cart: {
            bookings: [
              {
                ...newStateGuest.travelCart.cart.bookings[0],
                hotelRoomBookings: [
                  {
                    ...newStateGuest.travelCart.cart.bookings[0].hotelRoomBookings[0],
                    checkinDate: shoulderDateBeforeCheckin
                  }
                ]
              }
            ]
          }
        }
      };
      expect(
        hasAnyHotelRoomBookingsWithShoulderDates(modifiedNewStateGuest, [], [guestBookingId], hotels)
      ).toBeTruthy();
    });
  });
});

describe('hasAnyHotelRoomBookingsWithBI method >', () => {
  const selectedBIID = 'BillingInstructionIDOne';
  const dummyBIID = 'BillingInstructionIDSecond';
  const hotels = [
    {
      id: primaryRegHotelId,
      billingInstructionOverrides: [
        {
          contactTypeId: 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
          incidentalInstructionId: dummyBIID,
          overrideDate: shoulderDateBeforeCheckin,
          roomTaxInstructionId: dummyBIID
        }
      ],
      billingInstructions: [
        {
          contactTypeId: '00000000-0000-0000-0000-000000000000',
          incidentalInstructionId: dummyBIID,
          roomTaxInstructionId: dummyBIID
        }
      ],
      hasBillingInstructions: true
    }
  ];
  const newState = {
    travelCart: {
      cart: {
        bookings: [
          {
            id: testEventRegistrationId,
            requestedAction: 'BOOK',
            registrationTypeId: primaryRegTypeId,
            hotelRoomBookings: [
              {
                id: 'hotelRoomBookingIdOne',
                hotelId: primaryRegHotelId,
                requestedAction: 'BOOK'
              }
            ]
          }
        ]
      }
    }
  };
  test("should return false if current registrant's hotel room booking is not associated with selectedBIID", () => {
    expect(
      hasAnyHotelRoomBookingsWithBI(newState, testEventRegistrationId, primaryRegTypeId, hotels, selectedBIID)
    ).toBeFalsy();
  });
  test("should return true if current registrant's hotel room booking is associated with selectedBIID", () => {
    const modifiedHotels = [
      {
        ...hotels[0],
        billingInstructions: [
          {
            ...hotels[0].billingInstructions[0],
            incidentalInstructionId: selectedBIID
          }
        ]
      }
    ];
    expect(
      hasAnyHotelRoomBookingsWithBI(newState, testEventRegistrationId, primaryRegTypeId, modifiedHotels, selectedBIID)
    ).toBeTruthy();
  });
  describe("if current registrant's hotel room booking is applicable for overridden BI >", () => {
    const modifiedNewState = {
      travelCart: {
        cart: {
          bookings: [
            {
              ...newState.travelCart.cart.bookings[0],
              hotelRoomBookings: [
                {
                  ...newState.travelCart.cart.bookings[0].hotelRoomBookings[0],
                  checkinDate: shoulderDateBeforeCheckin
                }
              ]
            }
          ]
        }
      }
    };
    test('should return false if not associated with selectedBIID', () => {
      expect(
        hasAnyHotelRoomBookingsWithBI(modifiedNewState, testEventRegistrationId, primaryRegTypeId, hotels, selectedBIID)
      ).toBeFalsy();
    });
    test('should return true if associated with selectedBIID', () => {
      const modifiedHotels = [
        {
          ...hotels[0],
          billingInstructionOverrides: [
            {
              ...hotels[0].billingInstructionOverrides[0],
              incidentalInstructionId: selectedBIID
            }
          ]
        }
      ];
      expect(
        hasAnyHotelRoomBookingsWithBI(
          modifiedNewState,
          testEventRegistrationId,
          primaryRegTypeId,
          modifiedHotels,
          selectedBIID
        )
      ).toBeTruthy();
    });
  });
  test('should return false if billing instructions not enabled for the hotel', () => {
    const modifiedHotels = [
      {
        id: primaryRegHotelId,
        hasBillingInstructions: false
      }
    ];
    expect(
      hasAnyHotelRoomBookingsWithBI(newState, testEventRegistrationId, primaryRegTypeId, modifiedHotels, selectedBIID)
    ).toBeFalsy();
  });
});

describe('get primary and guest entity ids', () => {
  const visibilityOption = EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE;
  const primaryAndGuestRegTypeIds = ['regTypeIdA, regTypeIdB'];
  const primaryAndGuestAdmItemIds = ['AmdItemA, AmdItemB'];

  test('get reg types ids', () => {
    expect(
      getAttendeeRegTypeAndAdmItemIds(visibilityOption, primaryAndGuestRegTypeIds, primaryAndGuestAdmItemIds)
    ).toEqual(primaryAndGuestRegTypeIds);
  });

  test('get admission item ids', () => {
    const admItemVisibilityOption = EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM;
    expect(
      getAttendeeRegTypeAndAdmItemIds(admItemVisibilityOption, primaryAndGuestRegTypeIds, primaryAndGuestAdmItemIds)
    ).toEqual(primaryAndGuestAdmItemIds);
  });
});

describe('getSelectedRoomsInHotelRequests() method', () => {
  const attendeeRegTypeAndAdmItemIds = ['AdmItemA, AdmItemB'];
  const visibilityOption = EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM;
  const primaryHotelRequest = {
    id: 'primary-hotel-request',
    hotelId: 'hotel-1',
    roomTypeId: 'room-1'
  };
  const primaryExistingHotelRequest = {
    id: 'primary-hotel-request',
    hotelId: 'hotel-1',
    roomTypeId: 'room-1',
    hotelReservationDetailId: 'hotelReservationDetailId'
  };
  const hotelRequestsForCurrentInvitee = {
    primary: [
      {
        ...primaryHotelRequest
      }
    ],
    guests: [
      {
        id: 'guest-hotel-request',
        hotelId: 'hotel-1',
        roomTypeId: 'room-1'
      }
    ]
  };
  const hotels = [
    {
      id: 'hotel-1',
      roomTypes: [
        {
          id: 'room-1',
          associatedEntitySettings: {
            AdmItemA: {},
            AdmItemB: {}
          }
        }
      ]
    }
  ];

  describe('> guest side >', () => {
    const isPlanner = false;
    test('method should return all new valid bookings', () => {
      // should return both new hotel requests (primary and guest)
      expect(
        getSelectedRoomsInHotelRequests(
          hotelRequestsForCurrentInvitee,
          hotels,
          isPlanner,
          visibilityOption,
          'reg-path-id',
          attendeeRegTypeAndAdmItemIds
        )
      ).toHaveLength(2);
    });

    test('method should return existing valid bookings also', () => {
      const hotelRequestsWithExistingBooking = {
        ...hotelRequestsForCurrentInvitee,
        primary: [
          {
            ...primaryExistingHotelRequest
          }
        ]
      };
      // should return existing hotel requests of primary as well
      expect(
        getSelectedRoomsInHotelRequests(
          hotelRequestsWithExistingBooking,
          hotels,
          isPlanner,
          visibilityOption,
          'reg-path-id',
          attendeeRegTypeAndAdmItemIds
        )
      ).toHaveLength(2);
    });
  });

  describe('> planner side >', () => {
    test('method should return all new valid bookings', () => {
      const isPlanner = true;
      // should return both new hotel requests (primary and guest)
      expect(
        getSelectedRoomsInHotelRequests(
          hotelRequestsForCurrentInvitee,
          hotels,
          isPlanner,
          visibilityOption,
          'reg-path-id',
          attendeeRegTypeAndAdmItemIds
        )
      ).toHaveLength(2);
    });
    test('method should return all new valid bookings 1', () => {
      const hotelRequestsWithExistingBooking = {
        ...hotelRequestsForCurrentInvitee,
        primary: [
          {
            ...primaryExistingHotelRequest
          }
        ]
      };
      const isPlanner = true;
      // should not return existing request of primary
      expect(
        getSelectedRoomsInHotelRequests(
          hotelRequestsWithExistingBooking,
          hotels,
          isPlanner,
          visibilityOption,
          'reg-path-id',
          attendeeRegTypeAndAdmItemIds
        )
      ).toHaveLength(1);
    });
  });
});

describe('createDerivedRoomRegTypeAssociations() method', () => {
  const hotels = state.eventTravel.hotelsData.hotels;
  // reg path associated to two reg types
  const registrationPaths = {
    regPathId: {
      associatedRegistrationTypes: ['regTypeId1', 'regTypeId2']
    }
  };

  test('creates room -to- reg types associations', () => {
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      state,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      true,
      hotels,
      registrationPaths
    );

    expect(derivedRoomAssociations).toMatchSnapshot();
  });

  test('doesnt create associations when experiment is not enabled', () => {
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      state,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      false,
      hotels,
      registrationPaths
    );

    expect(Object.keys(derivedRoomAssociations).length).toBe(0);
  });

  test('doesnt create associations when visibility option is not reg path', () => {
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      state,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE,
      true,
      hotels,
      registrationPaths
    );

    expect(Object.keys(derivedRoomAssociations).length).toBe(0);
  });

  test('creates associations with default reg type when no reg type is associated to reg path', () => {
    const newRegistrationPaths = {
      regPathId: {
        associatedRegistrationTypes: [],
        isDefault: true
      }
    };
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      state,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      true,
      hotels,
      newRegistrationPaths
    );

    expect(derivedRoomAssociations).toMatchSnapshot();
  });

  test('creates associations with default reg type when reg paths are deleted', () => {
    hotels[0].roomTypes[0].associatedRegPathSettings = {
      regPathId: { allowCharge: true },
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ regPathId: { allowCharge: true; }; regPath... Remove this comment to see the full error message
      regPathId2: { allowCharge: true }
    };

    const newRegistrationPaths = {
      regPathId: {
        associatedRegistrationTypes: [],
        isDefault: true
      }
    };
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      state,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      true,
      hotels,
      newRegistrationPaths
    );

    // derived property should be exactly one, should not try to create for deleted reg path
    expect(Object.keys(derivedRoomAssociations).length).toBe(1);
  });
});

describe('test reg type associations if reg type widget is optional', () => {
  let mockRegTypeWidget;
  beforeEach(() => {
    mockRegTypeWidget = {
      id: 'widget:ae8fd4ce-dc4f-44c8-b74a-4355a5cc846e',
      layout: {
        colspan: 12,
        type: 'widget',
        cellSize: 4,
        childIds: [],
        parentId: 'row:831e8be0-03d2-447b-9991-26e81cd56379'
      },
      widgetType: 'RegistrationType',
      config: {
        displayText: 'EventSiteEditor_RegistrationTypeConfig_DisplayText__resx',
        displayType: 'List',
        required: false,
        labelPlacement: 'Above'
      }
    };

    const spy = jest.spyOn(getWidgetModule, 'getWidget');
    spy.mockReturnValue(mockRegTypeWidget);
  });

  const hotels = state.eventTravel.hotelsData.hotels;
  const newState = { ...state };
  newState.appData.registrationSettings.registrationPaths.regPathId.associatedRegistrationTypes = ['regType1'];
  (newState as $TSFixMe).event = {
    registrationTypes: {
      regType1: {},
      regType2: {},
      regType3: {},
      '00000000-0000-0000-0000-000000000000': {}
    }
  };

  test('creates associations with default reg type when reg type widget is optional', () => {
    hotels[0].roomTypes[0].associatedRegPathSettings = {
      regPathId: { allowCharge: true },
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ regPathId: { allowCharge: true; }; regPath... Remove this comment to see the full error message
      regPathId2: { allowCharge: true }
    };

    const roomId = hotels[0].roomTypes[0].id;

    const newRegistrationPaths = {
      regPathId: {
        associatedRegistrationTypes: ['regType1'],
        isDefault: true
      }
    };
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      newState,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      true,
      hotels,
      newRegistrationPaths
    );

    /*
     * derived property should be two, one for reg type associated and other for default reg type as reg type widget
     * is optional on reg path.
     */
    expect(Object.keys(derivedRoomAssociations[roomId]).length).toBe(2);
  });

  test('creates associations with all reg type when there is only one reg path', () => {
    hotels[0].roomTypes[0].associatedRegPathSettings = {
      regPathId: { allowCharge: true }
    };

    const roomId = hotels[0].roomTypes[0].id;

    const newRegistrationPaths = {
      regPathId: {
        associatedRegistrationTypes: [],
        isDefault: true
      }
    };
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      newState,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      true,
      hotels,
      newRegistrationPaths
    );

    /*
     * derived property should be 4:
     * 4 --> 3 reg types + 1 default
     */
    expect(Object.keys(derivedRoomAssociations[roomId]).length).toBe(4);
  });

  test('creates associations with all reg type when there is only one reg path and required widget', () => {
    // making widget as non optional
    mockRegTypeWidget.config.required = true;
    hotels[0].roomTypes[0].associatedRegPathSettings = {
      regPathId: { allowCharge: true }
    };

    const roomId = hotels[0].roomTypes[0].id;

    const newRegistrationPaths = {
      regPathId: {
        associatedRegistrationTypes: [],
        isDefault: true
      }
    };
    const derivedRoomAssociations = createDerivedRoomRegTypeAssociations(
      newState,
      EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH,
      true,
      hotels,
      newRegistrationPaths
    );

    /*
     * derived property should be 3:
     * 3 --> for the 3 reg types
     *
     * There will not be any mapping to default reg type as reg type widget is not optional
     */
    expect(Object.keys(derivedRoomAssociations[roomId]).length).toBe(3);
  });
});
