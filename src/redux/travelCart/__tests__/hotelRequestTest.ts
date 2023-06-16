import { transformHotelRoomBookings, getUpdatedTravelBookings } from '../hotelRequest';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';

const hotelRoomBookings = [
  {
    id: 'aa0e7b41-ec09-4efe-94c4-1490b026b60c',
    requestedAction: 'BOOK',
    checkinDate: new Date(2019, 9, 13), // '2019-10-13T00:00:00.000Z'
    checkoutDate: new Date(2019, 9, 14) // '2019-10-14T00:00:00.000Z'
  }
];

const updatedhotelRoomBookings = [
  {
    id: 'aa0e7b41-ec09-4efe-94c4-1490b026b60c',
    requestedAction: 'BOOK',
    checkinDate: '2019-10-13',
    checkoutDate: '2019-10-14'
  }
];

describe('transformHotelRoomBookings() method', () => {
  describe('should update dates', () => {
    test('should update checkin and checkout dates', () => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
      const res = transformHotelRoomBookings(hotelRoomBookings, AirTravelData.eventTimezone);
      expect(res).toEqual(updatedhotelRoomBookings);
    });
  });
});

describe('getUpdatedTravelBookings() method', () => {
  /*
   * use case: when we make an update travel cart request that updates quantity, then that updated quantity is not
   * reflected in next update call. So, for an existing booking, quantity should always be taken from state i.e.
   * existing booking
   */
  test('should not override quantity from existing booking', () => {
    // existing room booking has quantity 2
    const roomQuantity = 2;
    const existingTravelBookings = [
      {
        id: 'BOOKING_1',
        requestedAction: 'BOOK',
        hotelRoomBookings: [
          { ...hotelRoomBookings[0], id: 'HOTEL_BOOKING_1', requestedAction: 'BOOK', quantity: roomQuantity }
        ]
      }
    ];

    const requestedRoomBookings = [
      { ...hotelRoomBookings[0], id: 'HOTEL_BOOKING_1', preferences: { hotelAttendeeRegistrationId: 'BOOKING_1' } }
    ];

    const updatedTravelBookings = getUpdatedTravelBookings(existingTravelBookings, requestedRoomBookings);
    expect(updatedTravelBookings[0].hotelRoomBookings[0].quantity).toEqual(roomQuantity);
  });
});

test('Travel booking requested action turns to BOOK when adding a hotel booking to it', () => {
  const updatedTravelBookings = getUpdatedTravelBookings(
    [
      {
        id: 'BOOKING_1',
        requestedAction: 'CANCEL',
        hotelRoomBookings: [{ ...hotelRoomBookings[0], id: 'HOTEL_BOOKING_1', requestedAction: 'CANCEL' }]
      }
    ],
    [{ ...hotelRoomBookings[0], preferences: { hotelAttendeeRegistrationId: 'BOOKING_1' } }]
  );
  expect(updatedTravelBookings[0].requestedAction).toEqual('BOOK');
});

test('Hotel Room booking requested action should be chnaged to CANCEL when removing a room booking', () => {
  const existingTravelBookings = [
    {
      id: 'BOOKING_1',
      requestedAction: 'CANCEL',
      hotelRoomBookings: [
        {
          ...hotelRoomBookings[0],
          hotelReservationDetailId: 'hrdId_1',
          id: 'HOTEL_BOOKING_1',
          requestedAction: 'CANCEL'
        }
      ]
    }
  ];

  const requestedRoomBookings = [
    {
      ...hotelRoomBookings[0],
      id: 'HOTEL_BOOKING_1',
      hotelReservationDetailId: 'hrdId_1',
      isDeleted: true,
      preferences: { hotelAttendeeRegistrationId: 'BOOKING_1' }
    }
  ];

  const updatedTravelBookings = getUpdatedTravelBookings(existingTravelBookings, requestedRoomBookings);
  expect(updatedTravelBookings[0].hotelRoomBookings[0].requestedAction).toEqual('CANCEL');
});

test("Remove the room booking if deleted and is newly added (Doesn't exists in the cart)", () => {
  const existingTravelBookings = [
    {
      id: 'BOOKING_1',
      requestedAction: 'CANCEL',
      hotelRoomBookings: [{ ...hotelRoomBookings[0], id: 'HOTEL_BOOKING_1', requestedAction: 'CANCEL' }]
    }
  ];

  const requestedRoomBookings = [
    {
      ...hotelRoomBookings[0],
      id: 'HOTEL_BOOKING_1',
      isDeleted: true,
      preferences: { hotelAttendeeRegistrationId: 'BOOKING_1' }
    }
  ];

  const updatedTravelBookings = getUpdatedTravelBookings(existingTravelBookings, requestedRoomBookings);
  expect(updatedTravelBookings[0].hotelRoomBookings).toEqual([]);
});

test("If a booking is not deleted, it's status should be set as BOOK)", () => {
  const existingTravelBookings = [
    {
      id: 'BOOKING_1',
      requestedAction: 'CANCEL',
      hotelRoomBookings: [{ ...hotelRoomBookings[0], id: 'HOTEL_BOOKING_1', requestedAction: 'CANCEL' }]
    }
  ];

  const requestedRoomBookings = [
    {
      ...hotelRoomBookings[0],
      id: 'HOTEL_BOOKING_1',
      isDeleted: false,
      preferences: { hotelAttendeeRegistrationId: 'BOOKING_1' }
    }
  ];

  const updatedTravelBookings = getUpdatedTravelBookings(existingTravelBookings, requestedRoomBookings);
  expect(updatedTravelBookings[0].hotelRoomBookings[0].requestedAction).toEqual('BOOK');
});
