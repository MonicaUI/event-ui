import { getPaidRooms } from '../reducer';

const initialState = {
  eventTravel: {
    hotelsData: {
      hotels: [
        {
          id: '1',
          name: 'Seattle Marriott Waterfront',
          roomTypes: [
            {
              id: 'room-1-id',
              fee: {
                isActive: true
              }
            },
            {
              id: 'room-2-id',
              fee: {
                isActive: false
              }
            },
            {
              id: 'room-3-id'
            }
          ]
        }
      ]
    }
  }
};

describe('getPaidRooms() method', () => {
  test('should return paid rooms', () => {
    expect(getPaidRooms(initialState)).toEqual({
      'room-1-id': {
        id: 'room-1-id',
        fee: {
          isActive: true
        },
        hotelName: 'Seattle Marriott Waterfront'
      }
    });
  });
});
