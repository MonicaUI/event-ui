import {
  transformAirActuals,
  getNewAirActualId,
  getUpdatedTravelBookingsForAirActuals,
  removeAirActuals
} from '../airActuals';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';

jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('uuid')
  };
});

const airActualToAdd = {
  travellerInfo: {},
  currencyId: 1,
  totalTicketPrice: 2000,
  requestedAction: REQUESTED_ACTION.BOOK,
  flightDetails: [
    {
      id: 'flight-1',
      requestedAction: REQUESTED_ACTION.BOOK
    }
  ]
};

const AIR_ACTUAL_RESERVATION_ID = 'dummy-reservation-id';
const AIR_ACTUAL_RESERVATION_DETAIL_ID = 'dummy-reservation-detail-id';
const BOOKING_ID = 'dummy-reg-id';

const flightDetailsWithReservationId = {
  id: 'flight-1',
  airReservationActualDetailId: AIR_ACTUAL_RESERVATION_DETAIL_ID
};

const existingAirActualWithReservationId = {
  ...airActualToAdd,
  flightDetails: [
    {
      ...flightDetailsWithReservationId,
      requestedAction: REQUESTED_ACTION.BOOK
    }
  ],
  id: 'existing-air-actual-1',
  airReservationActualId: AIR_ACTUAL_RESERVATION_ID,
  requestedAction: REQUESTED_ACTION.BOOK
};

const travelBookingsForModify = [
  {
    id: BOOKING_ID,
    airActuals: [
      {
        ...existingAirActualWithReservationId
      }
    ],
    requestedAction: REQUESTED_ACTION.BOOK
  }
];

describe('getUpdatedTravelBookingsForAirActuals() method', () => {
  test('should add air actual, when there are no travel booking present', () => {
    const res = getUpdatedTravelBookingsForAirActuals([], airActualToAdd, 'dummy-reg-id');
    expect(res).toEqual([
      {
        id: 'dummy-reg-id',
        airActuals: [
          {
            ...airActualToAdd,
            flightDetails: [
              {
                id: 'flight-1',
                requestedAction: 'BOOK'
              }
            ],
            requestedAction: 'BOOK',
            id: 'uuid'
          }
        ]
      }
    ]);
  });

  test('should add air actual, when there is existing travel booking present', () => {
    const existingTravelBookings = [
      {
        id: 'dummy-reg-id',
        airBookings: [],
        requestedAction: 'BOOK'
      }
    ];
    const res = getUpdatedTravelBookingsForAirActuals(existingTravelBookings, airActualToAdd, 'dummy-reg-id');
    expect(res).toEqual([
      {
        id: 'dummy-reg-id',
        airBookings: [],
        airActuals: [
          {
            ...airActualToAdd,
            flightDetails: [
              {
                id: 'flight-1',
                requestedAction: 'BOOK'
              }
            ],
            requestedAction: 'BOOK',
            id: 'uuid'
          }
        ],
        requestedAction: 'BOOK'
      }
    ]);
  });

  test('should update existing air actual in a newReg', () => {
    const existingAirActualWithId = {
      ...airActualToAdd,
      id: 'existing-air-actual-1'
    };

    const existingTravelBookings = [
      {
        id: 'dummy-reg-id',
        airActuals: [
          {
            ...existingAirActualWithId
          }
        ],
        requestedAction: 'BOOK'
      }
    ];

    const updatedAirActual = {
      ...existingAirActualWithId,
      totalTicketPrice: 3000
    };

    const res = getUpdatedTravelBookingsForAirActuals(existingTravelBookings, updatedAirActual, 'dummy-reg-id');
    expect(res).toEqual([
      {
        ...existingTravelBookings[0],
        airActuals: [
          {
            ...updatedAirActual
          }
        ]
      }
    ]);
  });

  test('should set MODIFY status only for air actual if modified', () => {
    // updated air actual and flights dont have requested action property
    const updatedAirActual = {
      ...existingAirActualWithReservationId,
      flightDetails: [
        {
          ...flightDetailsWithReservationId
        }
      ],
      passengerNote: 'updatedNote'
    };

    const res = getUpdatedTravelBookingsForAirActuals(travelBookingsForModify, updatedAirActual, 'dummy-reg-id');
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        airActuals: [
          {
            ...updatedAirActual,
            requestedAction: REQUESTED_ACTION.MODIFY, // air actual should be modified
            flightDetails: [
              {
                ...flightDetailsWithReservationId,
                requestedAction: REQUESTED_ACTION.BOOK // flight should not be modified
              }
            ]
          }
        ]
      }
    ]);
  });

  test('should set MODIFY status for air actual and flights if modified', () => {
    // updated air actual and flights dont have requested action property
    const updatedAirActual = {
      ...existingAirActualWithReservationId,
      flightDetails: [
        {
          ...flightDetailsWithReservationId,
          airlineName: 'updatedName'
        }
      ]
    };

    const res = getUpdatedTravelBookingsForAirActuals(travelBookingsForModify, updatedAirActual, 'dummy-reg-id');
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        airActuals: [
          {
            ...updatedAirActual,
            requestedAction: REQUESTED_ACTION.MODIFY, // whenever flight updates, air actual should be modified
            flightDetails: [
              {
                ...updatedAirActual.flightDetails[0],
                requestedAction: REQUESTED_ACTION.MODIFY // flight should be modified
              }
            ]
          }
        ]
      }
    ]);
  });

  test('should set CANCEL status for flights if removed from air actual', () => {
    // flight details removed
    const updatedAirActual = {
      ...existingAirActualWithReservationId,
      flightDetails: [],
      passengerNote: 'updatedNote'
    };

    const res = getUpdatedTravelBookingsForAirActuals(travelBookingsForModify, updatedAirActual, 'dummy-reg-id');
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        airActuals: [
          {
            ...updatedAirActual,
            requestedAction: REQUESTED_ACTION.MODIFY,
            flightDetails: [
              {
                ...existingAirActualWithReservationId.flightDetails[0],
                requestedAction: REQUESTED_ACTION.CANCEL // flight should be cancelled
              }
            ]
          }
        ]
      }
    ]);
  });

  test('should add flights to existing air actual', () => {
    // flight details added
    const updatedAirActual = {
      ...existingAirActualWithReservationId,
      flightDetails: [
        {
          ...flightDetailsWithReservationId
        },
        {
          id: 'flight-2'
        }
      ],
      passengerNote: 'updatedNote'
    };

    const res = getUpdatedTravelBookingsForAirActuals(travelBookingsForModify, updatedAirActual, 'dummy-reg-id');
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        airActuals: [
          {
            ...updatedAirActual,
            requestedAction: REQUESTED_ACTION.MODIFY,
            flightDetails: [
              {
                ...updatedAirActual.flightDetails[0],
                requestedAction: REQUESTED_ACTION.BOOK
              },
              {
                ...updatedAirActual.flightDetails[1],
                requestedAction: REQUESTED_ACTION.BOOK // new flight
              }
            ]
          }
        ]
      }
    ]);
  });
});

describe('removeAirActuals() method', () => {
  test('should remove selected air actual from travel booking', () => {
    const existingAirActualWithId = {
      ...airActualToAdd,
      id: 'existing-air-actual-1'
    };

    const existingTravelBookings = [
      {
        id: 'dummy-reg-id',
        airActuals: [
          {
            ...existingAirActualWithId
          }
        ],
        requestedAction: 'BOOK'
      }
    ];

    const airActualToCancel = {
      ...existingAirActualWithId,
      attendeeRegistrationId: 'dummy-reg-id'
    };

    const res = removeAirActuals(existingTravelBookings, [airActualToCancel]);
    expect(res).toEqual([
      {
        ...existingTravelBookings[0],
        airActuals: []
      }
    ]);
  });

  test('should set CANCEL status for air actual and its flights', () => {
    const airActualToCancel = {
      ...existingAirActualWithReservationId,
      attendeeRegistrationId: BOOKING_ID
    };

    const res = removeAirActuals(travelBookingsForModify, [airActualToCancel]);
    expect(res).toEqual([
      {
        ...travelBookingsForModify[0],
        airActuals: [
          {
            ...existingAirActualWithReservationId,
            requestedAction: REQUESTED_ACTION.CANCEL,
            flightDetails: [
              {
                ...airActualToCancel.flightDetails[0],
                requestedAction: REQUESTED_ACTION.CANCEL // flights should be cancelled along with air actual
              }
            ]
          }
        ]
      }
    ]);
  });
});

describe('transformAirActuals() method', () => {
  const airActuals = [
    {
      id: 'id-1',
      flightDetails: [
        {
          departureDate: new Date(2019, 9, 13),
          arrivalDate: new Date(2019, 9, 15)
        }
      ]
    }
  ];

  const updateAirActuals = [
    {
      id: 'id-1',
      flightDetails: [
        {
          departureDate: '2019-10-13',
          arrivalDate: '2019-10-15'
        }
      ]
    }
  ];

  test('should update dates', () => {
    expect(transformAirActuals(airActuals)).toEqual(updateAirActuals);
  });
});

describe('getNewAirActualId() method', () => {
  const oldTravelBookings = [
    {
      id: 'eventRegId-1',
      airActuals: [
        {
          id: 'airActualId-1'
        }
      ]
    }
  ];
  const newTravelBookings = [
    {
      id: 'eventRegId-1',
      airActuals: [
        {
          id: 'airActualId-1'
        },
        {
          id: 'airActualId-2'
        }
      ]
    }
  ];

  test('should return new airActual id if new air actual is added', () => {
    expect(getNewAirActualId(oldTravelBookings, newTravelBookings, 'eventRegId-1')).toBe('airActualId-2');
  });

  test('should return undefined if no new air actual is added', () => {
    expect(getNewAirActualId(newTravelBookings, newTravelBookings, 'eventRegId-1')).toBeUndefined();
  });
});
