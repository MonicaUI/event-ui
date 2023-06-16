import { transformAirBookings, getUpdatedTravelBookingsForAirRequests } from '../airRequest';
import AirTravelData from 'event-widgets/lib/AirRequest/AirTravelFixture.json';

const airBookings = [
  {
    id: 'aa0e7b41-ec09-4efe-94c4-1490b026b60c',
    requestedAction: 'BOOK',
    departureDate: new Date(2019, 9, 13), // '2019-10-13T23:00:00.000Z',
    returnDate: new Date(2019, 9, 14), // '2019-10-14T02:00:00.000Z',
    travellerInfo: {
      dateOfBirth: new Date(2019, 9, 1) // '2019-10-01T05:00:00.000Z'
    }
  }
];

const updatedairBookings = [
  {
    id: 'aa0e7b41-ec09-4efe-94c4-1490b026b60c',
    requestedAction: 'BOOK',
    departureDate: '2019-10-13',
    returnDate: '2019-10-14',
    travellerInfo: {
      dateOfBirth: '2019-10-01'
    }
  }
];

describe('transformAirBookings() method', () => {
  describe('should update dates', () => {
    test('should update dob, departure & return date', () => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
      const res = transformAirBookings(airBookings, AirTravelData.eventTimezone);
      expect(res).toEqual(updatedairBookings);
    });
  });
});

test('Travel booking requested action turns to BOOK when adding a air booking to it', () => {
  const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests(
    [
      {
        id: 'BOOKING_1',
        requestedAction: 'CANCEL',
        airBookings: [{ ...airBookings[0], id: 'AIR_BOOKING_1', requestedAction: 'CANCEL' }]
      }
    ],
    { ...airBookings[0] },
    'BOOKING_1'
  );
  expect(updatedTravelBookings[0].requestedAction).toEqual('BOOK');
});
