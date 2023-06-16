/* global */
import { getUpdatedTravelBookings, removeGroupFlightRequests } from '../groupFlight';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import getStoreForTest from 'event-widgets/utils/testUtils';
import reducer from '../reducer';
import { clearGroupFlights, saveGroupFlightRequests } from '../workflow';
import { setSelectedGroupFlightId, removeSelectedGroupFlightIds } from '../external';

jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('uuid')
  };
});

import { persistTravelCartAndUpdateState } from '../internal';
jest.mock('../internal', () => {
  return {
    persistTravelCartAndUpdateState: jest.fn(() => Promise.resolve({}))
  };
});
(persistTravelCartAndUpdateState as $TSFixMe).mockImplementation(() => {
  return dispatch => {
    dispatch({
      type: '[MOCK]/persistTravelCartAndUpdateState',
      payload: {}
    });
  };
});

jest.mock('event-widgets/redux/modules/eventTravel', () => {
  return {
    ...jest.requireActual<$TSFixMe>('event-widgets/redux/modules/eventTravel'),
    __esModule: true,
    loadGroupFlightCapacities: jest.fn(() => () => Promise.resolve({}))
  };
});

jest.mock('../../registrationForm/regCart/workflow', () => {
  return {
    updateTravelFlagInRegCart: jest.fn(() => () => Promise.resolve({}))
  };
});

const groupFlightToAdd = {
  travellerInfo: {},
  outboundGroupFlightId: 'OUTBOUND',
  returnGroupFlightId: 'RETURN',
  requestedAction: REQUESTED_ACTION.BOOK,
  attendeeRegistrationId: 'dummy-reg-id'
};

const AIR_ACTUAL_RESERVATION_ID = 'dummy-reservation-id';
const BOOKING_ID = 'dummy-reg-id';

const existingGroupFlightBookingWithReservationId = {
  ...groupFlightToAdd,
  id: 'existing-group-flight-booking-1',
  airReservationActualId: AIR_ACTUAL_RESERVATION_ID,
  requestedAction: REQUESTED_ACTION.BOOK
};

const travelBookingsForAdd = [
  {
    id: BOOKING_ID,
    groupFlightBookings: [
      {
        id: 'FLIGHT',
        ...groupFlightToAdd
      }
    ],
    airBookings: [],
    hotelRoomBookings: [{ id: 'HOTEL' }],
    airActuals: [],
    requestedAction: REQUESTED_ACTION.BOOK
  }
];

const travelBookingsForModify = [
  {
    id: BOOKING_ID,
    groupFlightBookings: [
      {
        ...existingGroupFlightBookingWithReservationId
      }
    ],
    requestedAction: REQUESTED_ACTION.BOOK
  }
];

describe('getUpdatedTravelBookings() method', () => {
  test('should add group flight booking, when there are no travel booking present', () => {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
    const res = getUpdatedTravelBookings([], [groupFlightToAdd], 'dummy-reg-id');
    expect(res).toEqual([
      {
        id: 'dummy-reg-id',
        groupFlightBookings: [
          {
            ...groupFlightToAdd,
            requestedAction: 'BOOK',
            id: 'uuid'
          }
        ]
      }
    ]);
  });

  test('should add group flight booking, when there is existing travel booking present', () => {
    const existingTravelBookings = [
      {
        id: 'dummy-reg-id',
        groupFlightBookings: [],
        requestedAction: 'BOOK'
      }
    ];
    const res = getUpdatedTravelBookings(existingTravelBookings, [groupFlightToAdd]);
    expect(res).toEqual([
      {
        id: 'dummy-reg-id',
        groupFlightBookings: [
          {
            ...groupFlightToAdd,
            requestedAction: 'BOOK',
            id: 'uuid'
          }
        ],
        requestedAction: 'BOOK'
      }
    ]);
  });

  test('should update existing group flight in a newReg', () => {
    const existingGroupFlightBookingWithId = {
      ...groupFlightToAdd,
      id: 'existing-group-flight-booking-1'
    };

    const existingTravelBookings = [
      {
        id: 'dummy-reg-id',
        groupFlightBookings: [
          {
            ...existingGroupFlightBookingWithId
          }
        ],
        requestedAction: 'BOOK'
      }
    ];

    const updatedGroupFlightBooking = {
      ...existingGroupFlightBookingWithId,
      outboundGroupFlightId: null
    };

    const res = getUpdatedTravelBookings(existingTravelBookings, [updatedGroupFlightBooking]);
    expect(res).toEqual([
      {
        ...existingTravelBookings[0],
        groupFlightBookings: [
          {
            ...updatedGroupFlightBooking
          }
        ]
      }
    ]);
  });

  test('should set MODIFY status only for group flight is modified', () => {
    const updatedGroupFlightBooking = {
      ...existingGroupFlightBookingWithReservationId,
      outboundGroupFlightId: null
    };

    const res = getUpdatedTravelBookings(travelBookingsForModify, [updatedGroupFlightBooking]);
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        groupFlightBookings: [
          {
            ...updatedGroupFlightBooking,
            requestedAction: REQUESTED_ACTION.MODIFY // group flight should be modified
          }
        ]
      }
    ]);
  });
});

describe('removeGroupFlightRequests() method', () => {
  test('should remove selected group flight booking from travel booking', () => {
    const existingGroupFlightBookingWithId = {
      ...groupFlightToAdd,
      id: 'existing-group-flight-booking-1'
    };

    const existingTravelBookings = [
      {
        id: 'dummy-reg-id',
        groupFlightBookings: [
          {
            ...existingGroupFlightBookingWithId
          }
        ],
        requestedAction: 'BOOK'
      }
    ];

    const groupFlightBookingToCancel = {
      ...existingGroupFlightBookingWithId,
      attendeeRegistrationId: 'dummy-reg-id'
    };

    const res = removeGroupFlightRequests(existingTravelBookings, [groupFlightBookingToCancel]);
    expect(res).toEqual([
      {
        ...existingTravelBookings[0],
        groupFlightBookings: []
      }
    ]);
  });

  test('should set CANCEL status for group flight booking', () => {
    const groupFlightBookingToCancel = {
      ...existingGroupFlightBookingWithReservationId,
      attendeeRegistrationId: BOOKING_ID
    };

    const res = removeGroupFlightRequests(travelBookingsForModify, [groupFlightBookingToCancel]);
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        groupFlightBookings: [
          {
            ...existingGroupFlightBookingWithReservationId,
            requestedAction: REQUESTED_ACTION.CANCEL
          }
        ]
      }
    ]);
  });
});

const mockReducer = (state, action) => {
  return {
    travelCart: reducer(state.travelCart, action),
    event: { isInTestMode: true },
    eventTravel: { airData: {} },
    userSession: {},
    defaultUserSession: { isPlanner: false },
    registrationForm: { regCart: { hasTravel: true } }
  };
};
let store;

describe('clearGroupFlights() method', () => {
  test('Clears group flights from cart', async () => {
    store = getStoreForTest(mockReducer, {
      travelCart: {
        cart: {
          bookings: travelBookingsForAdd
        },
        userSession: { groupFlights: { showSummary: false, selectedGroupFlightIds: [] } }
      }
    });
    const added = { id: 'FLIGHT', ...groupFlightToAdd };
    await store.dispatch(setSelectedGroupFlightId('FLIGHT'));
    await store.dispatch(clearGroupFlights([added]));
    expect(store.getState().travelCart.userSession.groupFlights.showSummary).toBeTruthy();
    expect(store.getState().travelCart.userSession.groupFlights.selectedGroupFlightIds.length).toBe(0);
    const updatedCart = (persistTravelCartAndUpdateState as $TSFixMe).mock.calls[0][0];
    expect(updatedCart.bookings[0].groupFlightBookings).toStrictEqual([]);
    (persistTravelCartAndUpdateState as $TSFixMe).mockClear();
  });
});

describe('saveGroupFlightRequests() method', () => {
  test('Save group flights into cart', async () => {
    store = getStoreForTest(mockReducer, {
      travelCart: {
        cart: {
          bookings: travelBookingsForAdd
        },
        userSession: { groupFlights: { showSummary: false, selectedGroupFlightIds: [] } }
      }
    });
    const added = { ...groupFlightToAdd, id: 'FLIGHT_2' };
    await store.dispatch(setSelectedGroupFlightId('FLIGHT_2'));
    await store.dispatch(saveGroupFlightRequests([added]));
    const updatedCart = (persistTravelCartAndUpdateState as $TSFixMe).mock.calls[0][0];
    const groupFlightBookings = updatedCart.bookings[0].groupFlightBookings;
    expect(groupFlightBookings.length).toBe(2);
    expect(groupFlightBookings.find(f => f.id === 'FLIGHT')).toBeTruthy();
    expect(groupFlightBookings.find(f => f.id === 'FLIGHT_2')).toBeTruthy();
    expect(store.getState().travelCart.userSession.groupFlights.showSummary).toBeTruthy();
    expect(store.getState().travelCart.userSession.groupFlights.selectedGroupFlightIds.length).toBe(0);
    (persistTravelCartAndUpdateState as $TSFixMe).mockClear();
  });
});

describe('Selected group flight ids in state', () => {
  test('setSelectedGroupFlightId() should set the ids, removeSelectedGroupFlightIds() should remove them', async () => {
    store = getStoreForTest(mockReducer, {
      travelCart: {
        cart: {
          bookings: travelBookingsForAdd
        },
        userSession: { groupFlights: { showSummary: true, selectedGroupFlightIds: [] } }
      }
    });
    await store.dispatch(setSelectedGroupFlightId('FLIGHT_1'));
    expect(store.getState().travelCart.userSession.groupFlights.selectedGroupFlightIds.length).toBe(1);
    expect(store.getState().travelCart.userSession.groupFlights.selectedGroupFlightIds[0]).toBe('FLIGHT_1');

    await store.dispatch(removeSelectedGroupFlightIds(['FLIGHT_1', 'FLIGHT_2']));
    expect(store.getState().travelCart.userSession.groupFlights.selectedGroupFlightIds.length).toBe(0);
    (persistTravelCartAndUpdateState as $TSFixMe).mockClear();
  });
});
