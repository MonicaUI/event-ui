import reducer from '../index';
import registrationFormReducer from '../../registrationForm/reducer';
import regCartStatusReducer from '../../regCartStatus';
import appDataReducer from '../../appData';
import { restoreTravelCartIntoState } from '../external';
import {
  saveHotelRoomRequests,
  clearHotelRoomRequests,
  handleRegistrantRemovalInTravelCart,
  removeStaleBookings,
  saveAirRequests
} from '../workflow';
import getStoreForTest from 'event-widgets/utils/testUtils';
import travelCartFixture from './fixtures/travelCartFixtures.json';
import timezones from './fixtures/timezonesFixture.json';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';

jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('3b93b16a-ab0c-410d-b1e1-a4c1ac31dfa5')
  };
});

jest.mock('../../selectors/currentRegistrationPath', () => {
  return {
    isGuestProductSelectionEnabledOnRegPath: jest.fn(() => true)
  };
});

import { loadTravelSnapshotVersion } from 'event-widgets/redux/modules/eventTravel';
import { ROOMMATE_MATCHING_TYPE } from 'event-widgets/utils/travelConstants';
import { RESTORE_PARTIAL_CART_SUCCESS } from '../../registrationForm/regCart/actionTypes';

jest.mock('event-widgets/redux/modules/eventTravel', () => {
  return {
    ...jest.requireActual<$TSFixMe>('event-widgets/redux/modules/eventTravel'),
    __esModule: true,
    loadTravelSnapshotVersion: jest.fn(() => ({
      type: '[MOCK]/loadTravelSnapshotVersion',
      payload: {}
    }))
  };
});

jest.mock('event-widgets/utils/dateUtils', () => {
  return {
    getLocalDateFromEventDateString: c => c,
    getDateOnlyString: c => c
  };
});

jest.mock('../../selectors/currentRegistrant', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../selectors/currentRegistrant'),
    getEventRegistration: jest.fn(() => ({ eventRegistrationId: 'DUMMY_BOOKING_ID' }))
  };
});

test('Save room request in empty travel cart, then clear travel cart', async () => {
  const createTravelCartMock = jest.fn();
  createTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.createTravelCartResult));
  const updateTravelCartMock = jest.fn();
  updateTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.updateTravelCartResult));
  const updateRegCartMock = jest.fn((token, cart) => Promise.resolve({ regCart: cart }));
  const getCapacitySummariesMock = jest.fn();

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        capacityClient: {
          getCapacitySummaries: getCapacitySummariesMock
        },
        travelApiClient: {
          createTravelCart: createTravelCartMock,
          updateTravelCart: updateTravelCartMock
        },
        regCartClient: {
          updateRegCart: updateRegCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.hotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      timezones,
      appData: appDataReducer(state.appData, action, state),
      eventSnapshotVersion: 'EVENT_SNAPSHOT_VERSION',
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const testRegCart = {
    regMod: false,
    regCartId: 'DUMMY_CART_ID',
    isRegApprovalRequired: true,
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    }
  };
  const testAppData = {
    registrationSettings: {
      travelQuestions: {
        DUMMY_QUESTION_ID: {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.HOTEL_QUESTIONS
            }
          }
        },
        DUMMY_ALTERNATE_QUESTION_ID: {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS
            }
          }
        }
      }
    }
  };
  const testTravelCart = {
    cart: {
      bookings: [
        {
          ...travelCartFixture.createTravelCartResult.travelCart.bookings[0],
          hotelRoomBookings: [],
          airActuals: [],
          airBookings: [],
          groupFlightBookings: [],
          concurAirActuals: [],
          pnrAirActuals: [],
          travelAnswers: [
            {
              // Alternate hotel request answer
              questionId: 'DUMMY_ALTERNATE_QUESTION_ID',
              requestBookingId: '00000000-0000-0000-0000-000000000000',
              answers: [{}],
              requestedAction: 'VIEW'
            },
            {
              // Hotel request answer
              questionId: 'DUMMY_QUESTION_ID',
              requestBookingId: travelCartFixture.createTravelCartResult.travelCart.bookings[0].hotelRoomBookings[0].id,
              answers: [],
              requestedAction: 'VIEW'
            },
            {
              // Alternate hotel request answer
              questionId: 'DUMMY_ALTERNATE_QUESTION_ID_2',
              requestBookingId: '00000000-0000-0000-0000-000000000000',
              answers: [{}],
              requestedAction: 'ADD'
            },
            {
              // Hotel request answer
              questionId: 'DUMMY_QUESTION_ID_2',
              requestBookingId: travelCartFixture.createTravelCartResult.travelCart.bookings[0].hotelRoomBookings[0].id,
              answers: [],
              requestedAction: 'ADD'
            }
          ]
        }
      ]
    },
    userSession: {
      travelAnswers: {}
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart },
    travelCart: testTravelCart,
    appData: testAppData,
    eventSnapshotVersion: 'EVENT_SNAPSHOT_VERSION'
  });
  const dummyRoomRequest = travelCartFixture.createTravelCartResult.travelCart.bookings[0].hotelRoomBookings[0];

  // Save a room request
  getCapacitySummariesMock.mockReturnValue(Promise.resolve(travelCartFixture.capacityMap));
  await store.dispatch(saveHotelRoomRequests([dummyRoomRequest]));
  expect(store.getState()).toMatchSnapshot();
  expect(createTravelCartMock).toBeCalledWith({
    ...travelCartFixture.createTravelCartResult.travelCart,
    bookings: [
      {
        ...travelCartFixture.createTravelCartResult.travelCart.bookings[0],
        airBookings: [],
        airActuals: [],
        creditCard: undefined,
        groupFlightBookings: [],
        concurAirActuals: [],
        pnrAirActuals: [],
        travelAnswers: [
          {
            questionId: 'DUMMY_ALTERNATE_QUESTION_ID',
            requestBookingId: '00000000-0000-0000-0000-000000000000',
            answers: [{}],
            requestedAction: 'DELETE'
          },
          {
            questionId: 'DUMMY_QUESTION_ID',
            requestBookingId: travelCartFixture.createTravelCartResult.travelCart.bookings[0].hotelRoomBookings[0].id,
            answers: [],
            requestedAction: 'VIEW'
          },
          {
            questionId: 'DUMMY_ALTERNATE_QUESTION_ID_2',
            requestBookingId: '00000000-0000-0000-0000-000000000000',
            answers: [{}],
            requestedAction: 'ADD'
          },
          {
            questionId: 'DUMMY_QUESTION_ID_2',
            requestBookingId: travelCartFixture.createTravelCartResult.travelCart.bookings[0].hotelRoomBookings[0].id,
            answers: [],
            requestedAction: 'ADD'
          }
        ]
      }
    ],
    eventId: 'EVENT_ID'
  });
  expect(updateRegCartMock).toBeCalledWith(
    'DUMMY_ACCESS_TOKEN',
    {
      ...travelCartFixture.updateRegCartResultWithIsRegApprovalRequired.regCart,
      hasTravel: true
    },
    undefined
  );
  expect(getCapacitySummariesMock).toBeCalledWith('DUMMY_ACCESS_TOKEN', travelCartFixture.capacityIds);

  // Remove the room request submitted above
  await store.dispatch(clearHotelRoomRequests([{ ...dummyRoomRequest, attendeeRegistrationId: 'DUMMY_BOOKING_ID' }]));

  expect(store.getState()).toMatchSnapshot();
  expect(updateTravelCartMock).toBeCalledWith({
    ...travelCartFixture.updateTravelCartResult.travelCart,
    eventId: 'EVENT_ID'
  });
  expect(updateRegCartMock).toBeCalledWith(
    'DUMMY_ACCESS_TOKEN',
    {
      ...travelCartFixture.updateRegCartResultWithIsRegApprovalRequired.regCart,
      hasTravel: true
    },
    undefined
  );
  expect(getCapacitySummariesMock).toBeCalledWith('DUMMY_ACCESS_TOKEN', travelCartFixture.capacityIds);
});

test('Save room request with multiple rooms in empty travel cart', async () => {
  const createTravelCartMock = jest.fn();
  createTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.createTravelCartWithMultipleRoomsResult));
  const updateRegCartMock = jest.fn((token, cart) => Promise.resolve({ regCart: cart }));
  const getCapacitySummariesMock = jest.fn();
  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        capacityClient: {
          getCapacitySummaries: getCapacitySummariesMock
        },
        travelApiClient: {
          createTravelCart: createTravelCartMock
        },
        regCartClient: {
          updateRegCart: updateRegCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.hotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      eventSnapshotVersion: 'EVENT_SNAPSHOT_VERSION',
      timezones,
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const testRegCart = {
    regMod: false,
    regCartId: 'DUMMY_CART_ID',
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart }
  });
  const dummyRoomRequest =
    travelCartFixture.createTravelCartWithMultipleRoomsResult.travelCart.bookings[0].hotelRoomBookings;

  // Save a room request
  await store.dispatch(saveHotelRoomRequests(dummyRoomRequest));
  expect(createTravelCartMock).toBeCalledWith({
    ...travelCartFixture.createTravelCartWithMultipleRoomsResult.travelCart,
    bookings: [
      {
        ...travelCartFixture.createTravelCartWithMultipleRoomsResult.travelCart.bookings[0],
        airBookings: [],
        airActuals: [],
        creditCard: undefined,
        travelAnswers: [],
        concurAirActuals: [],
        pnrAirActuals: [],
        requestedAction: 'BOOK'
      }
    ],
    eventId: 'EVENT_ID'
  });
});

test('Saving new hotel request after clearing selection sets hasTravel to true in reg cart', async () => {
  const updateTravelCartMock = jest.fn(cart => Promise.resolve({ travelCart: cart }));
  const updateRegCartMock = jest.fn((token, cart) => Promise.resolve({ regCart: cart }));

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        travelApiClient: {
          updateTravelCart: updateTravelCartMock
        },
        regCartClient: {
          updateRegCart: updateRegCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.emptyHotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      timezones,
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const dummyRoomRequest = travelCartFixture.dummyHotelRoomBookings[0];
  const testRegCart = {
    regCartId: 'DUMMY_CART_ID',
    hasTravel: false,
    regMod: false,
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        productRegistrations: []
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    travelCart: {
      cart: {
        bookings: [
          {
            id: 'DUMMY_BOOKING_ID',
            hotelRoomBookings: [],
            airActuals: [],
            pnrAirActuals: [],
            concurAirActuals: []
          }
        ]
      },
      userSession: {
        travelAnswers: {}
      },
      isCartCreated: true
    },
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart }
  });

  // Save the room request again
  await store.dispatch(saveHotelRoomRequests([dummyRoomRequest]));
  expect(store.getState()).toMatchSnapshot();
  expect(updateRegCartMock).toBeCalledWith(
    'DUMMY_ACCESS_TOKEN',
    {
      ...travelCartFixture.updateRegCartResult.regCart,
      hasTravel: true
    },
    undefined
  );
});

test('Get mod cart and cancel the booking', async () => {
  const getModTravelCartMock = jest.fn();
  getModTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.getModTravelCartResult));

  const updateModTravelCartResultWithCancel = jest.fn();
  updateModTravelCartResultWithCancel.mockReturnValue(
    Promise.resolve(travelCartFixture.updateModTravelCartResultWithCancel)
  );

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        travelApiClient: {
          updateTravelCart: updateModTravelCartResultWithCancel,
          getTravelCart: getModTravelCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.emptyHotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35,
        eventFeatureSetup: {
          travelAndHousing: {
            hotelAccomodations: true,
            airTravel: {
              enabled: false
            }
          }
        }
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      timezones,
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const testRegCart = {
    regCartId: 'DUMMY_CART_ID',
    regMod: true,
    hasTravel: true,
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart }
  });
  // Get mod cart in state
  await store.dispatch(restoreTravelCartIntoState('DUMMY_CART_ID'));
  expect(loadTravelSnapshotVersion).toBeCalledWith('TRAVEL_SNAPSHOT_VERSION');

  expect(store.getState()).toMatchSnapshot();
  expect(getModTravelCartMock).toBeCalledWith('DUMMY_CART_ID');

  // Remove the room request in mod cart
  const dummyRoomRequest = travelCartFixture.getModTravelCartResult.bookings[0].hotelRoomBookings[0];
  await store.dispatch(clearHotelRoomRequests([{ ...dummyRoomRequest, attendeeRegistrationId: 'DUMMY_BOOKING_ID' }]));

  expect(store.getState()).toMatchSnapshot();
  expect(updateModTravelCartResultWithCancel).toBeCalledWith({
    ...travelCartFixture.updateModTravelCartResultWithCancel.travelCart,
    bookings: [
      {
        ...travelCartFixture.updateModTravelCartResultWithCancel.travelCart.bookings[0],
        airBookings: [],
        airActuals: [],
        concurAirActuals: [],
        pnrAirActuals: [],
        hotelRoomBookings: [
          {
            ...travelCartFixture.updateModTravelCartResultWithCancel.travelCart.bookings[0].hotelRoomBookings[0],
            checkinDate: '2015-06-22',
            checkoutDate: '2015-06-23'
          }
        ],
        creditCard: undefined,
        travelAnswers: [],
        groupFlightBookings: []
      }
    ],
    eventId: 'EVENT_ID'
  });
});

test('Get travel cart with a cancelled booking and save a new booking', async () => {
  const getModTravelCartMock = jest.fn();
  getModTravelCartMock.mockReturnValue(
    Promise.resolve(travelCartFixture.updateModTravelCartResultWithCancel.travelCart)
  );

  const updateModTravelCartWithTwoBookingsMock = jest.fn();
  updateModTravelCartWithTwoBookingsMock.mockReturnValue(
    Promise.resolve(travelCartFixture.updateModTravelCartWithTwoBookingsResult)
  );

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        travelApiClient: {
          updateTravelCart: updateModTravelCartWithTwoBookingsMock,
          getTravelCart: getModTravelCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.emptyHotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35,
        eventFeatureSetup: {
          travelAndHousing: {
            hotelAccomodations: true,
            airTravel: {
              enabled: false
            }
          }
        }
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      timezones,
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const testRegCart = {
    regCartId: 'DUMMY_CART_ID',
    regMod: true,
    hasTravel: true,
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart }
  });
  // Get mod cart in state
  await store.dispatch(restoreTravelCartIntoState('DUMMY_CART_ID'));
  expect(loadTravelSnapshotVersion).toBeCalledWith('TRAVEL_SNAPSHOT_VERSION');

  expect(store.getState()).toMatchSnapshot();
  expect(getModTravelCartMock).toBeCalledWith('DUMMY_CART_ID');

  const dummyRoomRequest1 =
    travelCartFixture.updateModTravelCartWithTwoBookingsResult.travelCart.bookings[0].hotelRoomBookings[1];

  // Save a room request
  await store.dispatch(saveHotelRoomRequests([dummyRoomRequest1]));

  expect(store.getState()).toMatchSnapshot();
  const expectedBooking = { ...travelCartFixture.updateModTravelCartWithTwoBookingsResult.travelCart.bookings[0] };
  delete expectedBooking.groupFlightBookings;
  expect(updateModTravelCartWithTwoBookingsMock).toBeCalledWith({
    ...travelCartFixture.updateModTravelCartWithTwoBookingsResult.travelCart,
    bookings: [
      {
        ...expectedBooking,
        airBookings: [],
        airActuals: [],
        creditCard: undefined,
        travelAnswers: [],
        concurAirActuals: [],
        pnrAirActuals: [],
        requestedAction: 'BOOK'
      }
    ],
    eventId: 'EVENT_ID'
  });
});

test('Get travel cart with 2 bookings and clear selection', async () => {
  const getModTravelCartMock = jest.fn();
  getModTravelCartMock.mockReturnValue(
    Promise.resolve(travelCartFixture.updateModTravelCartWithTwoBookingsResult.travelCart)
  );

  const updateModTravelCartResultWithCancelMock = jest.fn();
  updateModTravelCartResultWithCancelMock.mockReturnValue(
    Promise.resolve(travelCartFixture.updateModTravelCartResultWithCancel2)
  );

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        travelApiClient: {
          updateTravelCart: updateModTravelCartResultWithCancelMock,
          getTravelCart: getModTravelCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.emptyHotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35,
        eventFeatureSetup: {
          travelAndHousing: {
            hotelAccomodations: true,
            airTravel: {
              enabled: false
            }
          }
        }
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      timezones,
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const testRegCart = {
    regCartId: 'DUMMY_CART_ID',
    regMod: true,
    hasTravel: true,
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart }
  });
  // Get mod cart in state
  await store.dispatch(restoreTravelCartIntoState('DUMMY_CART_ID'));
  expect(loadTravelSnapshotVersion).toBeCalledWith('TRAVEL_SNAPSHOT_VERSION');

  expect(store.getState()).toMatchSnapshot();
  expect(getModTravelCartMock).toBeCalledWith('DUMMY_CART_ID');

  const dummyRoomRequest1 =
    travelCartFixture.updateModTravelCartWithTwoBookingsResult.travelCart.bookings[0].hotelRoomBookings[1];

  // Save a room request
  await store.dispatch(clearHotelRoomRequests([{ ...dummyRoomRequest1, attendeeRegistrationId: 'DUMMY_BOOKING_ID' }]));

  expect(store.getState()).toMatchSnapshot();
  expect(updateModTravelCartResultWithCancelMock).toBeCalledWith({
    ...travelCartFixture.updateModTravelCartResultWithCancel2.travelCart,
    bookings: [
      {
        ...travelCartFixture.updateModTravelCartResultWithCancel2.travelCart.bookings[0],
        airBookings: [],
        airActuals: [],
        creditCard: undefined,
        travelAnswers: [],
        groupFlightBookings: [],
        concurAirActuals: [],
        pnrAirActuals: []
      }
    ],
    eventId: 'EVENT_ID'
  });
});

test('For travel mod cart not existing, save a new booking and hasTravel to true', async () => {
  const createTravelCartMock = jest.fn();
  createTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.createTravelCartResultForRegMod));
  const updateRegCartMock = jest.fn((token, cart) => Promise.resolve({ regCart: cart }));

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      userSession: {},
      defaultUserSession: {
        eventId: 'EVENT_ID',
        isPreview: false,
        isPlanner: false
      },
      clients: {
        travelApiClient: {
          createTravelCart: createTravelCartMock
        },
        regCartClient: {
          updateRegCart: updateRegCartMock
        }
      },
      eventTravel: {
        hotelsData: travelCartFixture.emptyHotelsData,
        travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
      },
      event: {
        isInTestMode: false,
        timezone: 35
      },
      registrationForm: registrationFormReducer(state.registrationForm, action),
      regCartStatus: regCartStatusReducer(state.regCartStatus, action),
      travelCart: reducer(state.travelCart, action),
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      eventSnapshotVersion: 'EVENT_SNAPSHOT_VERSION',
      timezones,
      experiments: {
        flexProductVersion: 1
      }
    };
  };
  const testRegCart = {
    regMod: true,
    regCartId: 'DUMMY_CART_ID',
    hasTravel: false,
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'REG_TYPE_1',
        registrationPathId: 'REG_PATH_1',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        productRegistrations: [],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart }
  });
  const dummyRoomRequest = travelCartFixture.createTravelCartResult.travelCart.bookings[0].hotelRoomBookings[0];

  // Save a room request
  await store.dispatch(saveHotelRoomRequests([dummyRoomRequest]));
  expect(store.getState()).toMatchSnapshot();
  expect(createTravelCartMock).toBeCalledWith({
    ...travelCartFixture.createTravelCartResultForRegMod.travelCart,
    bookings: [
      {
        ...travelCartFixture.createTravelCartResultForRegMod.travelCart.bookings[0],
        airBookings: [],
        airActuals: [],
        creditCard: undefined,
        travelAnswers: [],
        concurAirActuals: [],
        pnrAirActuals: []
      }
    ],
    eventId: 'EVENT_ID'
  });
  expect(updateRegCartMock).toBeCalledWith(
    'DUMMY_ACCESS_TOKEN',
    {
      ...travelCartFixture.updateRegCartForRegModResult.regCart,
      hasTravel: true
    },
    undefined
  );
});

describe('remove bookings', () => {
  const regCart = {
    regMod: false,
    regCartId: 'DUMMY_CART_ID',
    hasTravel: true,
    eventRegistrations: {
      primary: {
        eventRegistrationId: 'primary',
        registrationTypeId: 'regType',
        registrationPathId: 'regPath',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            },
            workAddress: {
              city: 'McLean',
              country: 'USA',
              countryCode: 'US',
              postalCode: '1234',
              state: 'Virginia',
              stateCode: 'VA'
            }
          },
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
        }
      }
    },
    isRegApprovalRequired: false
  };
  const originalTravelCart = {
    id: 'DUMMY_CART_ID',
    isPlannerApprovalRequired: false,
    attendee: {},
    bookings: [
      {
        id: 'primary',
        concurAirActuals: [],
        pnrAirActuals: [],
        attendee: {
          contactId: null,
          homeCityAddress: {
            city: 'McLean',
            countryCode: 'US',
            countryName: 'USA',
            postalCode: '1234',
            stateCode: 'VA',
            stateName: 'Virginia'
          },
          id: null,
          inviteeEmailAddress: 'dummy@j.mail',
          primaryInviteeId: null,
          primaryRegistrantTravelBookingId: '00000000-0000-0000-0000-000000000001',
          status: null,
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
          type: 'INVITEE',
          workCityAddress: {
            city: 'McLean',
            countryCode: 'US',
            countryName: 'USA',
            postalCode: '1234',
            stateCode: 'VA',
            stateName: 'Virginia'
          }
        },
        airBookings: [
          {
            id: 'air_aaa',
            requestedAction: 'BOOK',
            travellerInfo: {
              dateOfBirth: ''
            }
          }
        ],
        hotelRoomBookings: [
          {
            id: 'hotel_aaa',
            hotelReservationDetailId: 'hotel_reservation_detail_id',
            requestedAction: 'BOOK',
            checkinDate: '2020-07-29',
            checkoutDate: '2020-08-01'
          }
        ],
        travelAnswers: [
          {
            answers: [{ answerType: 'Choice', choice: 'dummy' }],
            questionId: 'dummy-question-id',
            requestBookingId: 'hotel_aaa',
            requestedAction: 'ADD'
          }
        ]
      },
      {
        id: 'guest1',
        attendee: {
          contactId: null,
          homeCityAddress: {
            city: 'McLean',
            countryCode: 'US',
            countryName: 'USA',
            postalCode: '1234',
            stateCode: 'VA',
            stateName: 'Virginia'
          },
          id: null,
          inviteeEmailAddress: 'dummy@j.mail',
          primaryInviteeId: null,
          primaryRegistrantTravelBookingId: 'primary',
          status: null,
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
          type: 'INVITEE',
          workCityAddress: {
            city: 'McLean',
            countryCode: 'US',
            countryName: 'USA',
            postalCode: '1234',
            stateCode: 'VA',
            stateName: 'Virginia'
          }
        },
        airBookings: [
          {
            id: 'air_guest_aaa',
            requestedAction: 'BOOK',
            travellerInfo: {
              dateOfBirth: ''
            }
          }
        ],
        concurAirActuals: [],
        pnrAirActuals: [],
        hotelRoomBookings: [
          {
            id: 'hotel_guest_aaa',
            requestedAction: 'BOOK',
            checkinDate: '2020-07-29',
            checkoutDate: '2020-08-01'
          }
        ],
        travelAnswers: [
          {
            answers: [{ answerType: 'Choice', choice: 'dummy' }],
            questionId: 'dummy-question-g-id',
            requestBookingId: 'hotel_guest_aaa',
            requestedAction: 'ADD'
          },
          {
            answers: [{ answerType: 'Choice', choice: 'dummy-2' }],
            questionId: 'dummy-question-g-id-2',
            requestBookingId: 'air_guest_aaa',
            requestedAction: 'ADD'
          }
        ]
      }
    ]
  };
  const transformedUpdatedTravelCart = {
    id: 'DUMMY_CART_ID',
    isPlannerApprovalRequired: false,
    attendee: {},
    bookings: [
      {
        id: 'primary',
        admissionItemId: null,
        registrationTypeId: 'regType',
        registrationPathId: 'regPath',
        airBookings: [
          {
            id: 'air_aaa',
            requestedAction: 'BOOK',
            travellerInfo: {
              dateOfBirth: ''
            }
          }
        ],
        hotelRoomBookings: [
          {
            id: 'hotel_aaa',
            hotelReservationDetailId: 'hotel_reservation_detail_id',
            requestedAction: 'BOOK',
            checkinDate: '2020-07-29',
            checkoutDate: '2020-08-01'
          }
        ],
        airActuals: [],
        attendee: {
          contactId: null,
          homeCityAddress: {
            city: 'McLean',
            countryCode: 'US',
            countryName: 'USA',
            postalCode: '1234',
            stateCode: 'VA',
            stateName: 'Virginia'
          },
          id: null,
          inviteeEmailAddress: 'dummy@j.mail',
          primaryInviteeId: null,
          primaryRegistrantTravelBookingId: '00000000-0000-0000-0000-000000000001',
          status: null,
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
          type: 'INVITEE',
          workCityAddress: {
            city: 'McLean',
            countryCode: 'US',
            countryName: 'USA',
            postalCode: '1234',
            stateCode: 'VA',
            stateName: 'Virginia'
          }
        },
        concurAirActuals: [],
        pnrAirActuals: [],
        creditCard: undefined,
        travelAnswers: [
          {
            answers: [{ answerType: 'Choice', choice: 'dummy' }],
            questionId: 'dummy-question-id',
            requestBookingId: 'hotel_aaa',
            requestedAction: 'ADD'
          }
        ]
      }
    ]
  };

  const hotelRoomBookingWithGuestRoommate = {
    ...originalTravelCart.bookings[0].hotelRoomBookings[0],
    hotelReservationDetailId: 'hotel_reservation_id',
    preferences: {
      isAdaAccessibilityOpted: false,
      isSmokingOpted: false,
      roommatePreferences: {
        roommateIdType: 'GUEST_EVENT_REGISTRATION',
        type: 'SEARCH',
        roommateId: 'guest1'
      },
      rewardsCode: '',
      specialRequestNotes: '',
      isRoomSharingOpted: true
    },
    quantity: 2,
    isRoommateMatchingFailed: false,
    isRoommateMatched: true
  };

  const hotelRoomBookingWithEnlistSelf = {
    ...hotelRoomBookingWithGuestRoommate,
    preferences: {
      ...hotelRoomBookingWithGuestRoommate.preferences,
      roommatePreferences: {
        roommateFirstName: '',
        roommateLastName: '',
        type: ROOMMATE_MATCHING_TYPE.ENLIST_SELF
      }
    },
    isRoommateMatched: false,
    requestedAction: 'MODIFY'
  };

  let updateTravelCartMock;
  let mockReducer;

  beforeEach(() => {
    const updatedTravelCart = {
      id: 'DUMMY_CART_ID',
      isPlannerApprovalRequired: false,
      attendee: {},
      bookings: [
        {
          id: 'primary',
          registrationTypeId: 'regType',
          registrationPathId: 'regPath',
          concurAirActuals: [],
          pnrAirActuals: [],
          airBookings: [
            {
              id: 'air_aaa',
              requestedAction: 'BOOK',
              travellerInfo: {
                dateOfBirth: ''
              }
            }
          ],
          hotelRoomBookings: [
            {
              id: 'hotel_aaa',
              requestedAction: 'BOOK',
              checkinDate: '2020-07-29T05:00:00.000Z',
              checkoutDate: '2020-08-01T05:00:00.000Z'
            }
          ]
        }
      ]
    };

    updateTravelCartMock = jest
      .fn()
      .mockReturnValue(new Promise(resolve => resolve({ travelCart: updatedTravelCart })));

    mockReducer = (state, action) => {
      return {
        accessToken: 'DUMMY_ACCESS_TOKEN',
        userSession: {},
        defaultUserSession: {
          eventId: 'EVENT_ID',
          isPreview: false,
          isPlanner: false
        },
        clients: {
          travelApiClient: {
            updateTravelCart: updateTravelCartMock
          },
          regCartClient: {
            updateRegCart: jest.fn()
          }
        },
        eventTravel: {
          hotelsData: travelCartFixture.emptyHotelsData,
          travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
        },
        event: {
          isInTestMode: false,
          timezone: 35
        },
        registrationForm: registrationFormReducer(state.registrationForm, action),
        regCartStatus: regCartStatusReducer(state.regCartStatus, action),
        travelCart: reducer(state.travelCart, action),
        timezones
      };
    };
  });

  test('> removeStaleBookings()', async () => {
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart,
        regCartPayment: {}
      },
      regCartStatus: { lastSavedRegCart: regCart },
      travelCart: {
        cart: originalTravelCart,
        isCartCreated: true
      }
    });
    await store.dispatch(removeStaleBookings());
    expect(store.getState()).toMatchSnapshot();
    expect(updateTravelCartMock).toBeCalledWith(transformedUpdatedTravelCart);
  });

  test('> removeStaleBookings() when guest is unregistered', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'UNREGISTER'
        }
      }
    };
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart,
        regCartPayment: {}
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: originalTravelCart,
        isCartCreated: true
      }
    });
    await store.dispatch(removeStaleBookings());
    expect(store.getState()).toMatchSnapshot();
    expect(updateTravelCartMock).toBeCalledWith(transformedUpdatedTravelCart);
  });

  test('> removeStaleBookings() in travel cart having guest roommate when guest is unregistered', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'UNREGISTER'
        }
      }
    };

    const travelCartWithGuestRoommate = {
      ...originalTravelCart,
      bookings: [
        {
          ...originalTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithGuestRoommate
            }
          ]
        }
      ]
    };

    const updatedCartWithEnlistSelf = {
      ...transformedUpdatedTravelCart,
      bookings: [
        {
          ...transformedUpdatedTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithEnlistSelf
            }
          ]
        }
      ]
    };
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart,
        regCartPayment: {}
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: travelCartWithGuestRoommate,
        isCartCreated: true
      }
    });
    await store.dispatch(removeStaleBookings());
    expect(updateTravelCartMock).toBeCalledWith(updatedCartWithEnlistSelf);
  });

  test('> removeStaleBookings() when guest is unregistered with only PNR air actuals', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'UNREGISTER',
          attendee: {
            attendeeId: null,
            inviteeStatus: null,
            personalInformation: {
              contactId: null,
              emailAddress: 'dummy@j.mail',
              homeAddress: {
                city: 'McLean',
                country: 'USA',
                countryCode: 'US',
                postalCode: '1234',
                state: 'Virginia',
                stateCode: 'VA'
              },
              workAddress: {
                city: 'McLean',
                country: 'USA',
                countryCode: 'US',
                postalCode: '1234',
                state: 'Virginia',
                stateCode: 'VA'
              }
            },
            targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
          }
        }
      }
    };
    const travelCartWithPNR = {
      ...originalTravelCart,
      bookings: [
        originalTravelCart.bookings.find(b => b.id === 'primary'),
        {
          ...originalTravelCart.bookings.find(b => b.id === 'guest1'),
          hotelRoomBookings: [],
          airBookings: [],
          pnrAirActuals: [
            {
              id: 'pnr',
              flightDetails: [],
              airReservationActualId: 'pnr'
            }
          ],
          travelAnswers: [],
          requestedAction: 'BOOK'
        }
      ]
    };
    const updatedTravelCartWithPNR = {
      ...originalTravelCart,
      bookings: [
        {
          ...originalTravelCart.bookings.find(b => b.id === 'primary'),
          admissionItemId: null,
          registrationTypeId: 'regType',
          registrationPathId: 'regPath',
          airActuals: [],
          creditCard: undefined
        },
        {
          ...originalTravelCart.bookings.find(b => b.id === 'guest1'),
          hotelRoomBookings: [],
          airBookings: [],
          pnrAirActuals: [
            {
              id: 'pnr',
              flightDetails: [],
              airReservationActualId: 'pnr',
              requestedAction: 'CANCEL'
            }
          ],
          travelAnswers: [],
          airActuals: [],
          admissionItemId: null,
          creditCard: undefined,
          registrationPathId: undefined,
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          requestedAction: 'BOOK'
        }
      ]
    };
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart,
        regCartPayment: {}
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: travelCartWithPNR,
        isCartCreated: true
      }
    });
    await store.dispatch(removeStaleBookings());
    expect(store.getState()).toMatchSnapshot();
    expect(updateTravelCartMock).toBeCalledWith(updatedTravelCartWithPNR);
  });

  test('> handleRegistrantRemovalInTravelCart()', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary'
        }
      }
    };
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: originalTravelCart,
        isCartCreated: true
      }
    });
    await store.dispatch(handleRegistrantRemovalInTravelCart('guest1'));
    expect(updateTravelCartMock).toBeCalledWith(transformedUpdatedTravelCart);
  });

  test('> should remove guest as roommate and make room booking unmatched and self enlisted', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary'
        }
      }
    };

    const travelCartWithGuestRoommate = {
      ...originalTravelCart,
      bookings: [
        {
          ...originalTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithGuestRoommate
            }
          ]
        }
      ]
    };

    const updatedCartWithEnlistSelf = {
      ...transformedUpdatedTravelCart,
      bookings: [
        {
          ...transformedUpdatedTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithEnlistSelf,
              requestedAction: 'MODIFY'
            }
          ]
        }
      ]
    };

    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: travelCartWithGuestRoommate,
        isCartCreated: true
      }
    });

    await store.dispatch(handleRegistrantRemovalInTravelCart('guest1'));
    expect(updateTravelCartMock).toBeCalledWith(updatedCartWithEnlistSelf);
  });

  test('> should not change requestedAction for a new booking when guest is cancelled', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary'
        }
      }
    };

    const travelCartWithNewBookingWithGuestRoommate = {
      ...originalTravelCart,
      bookings: [
        {
          ...originalTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithGuestRoommate,
              // new room booking
              hotelReservationDetailId: undefined
            }
          ]
        }
      ]
    };

    const updatedCartWithEnlistSelf = {
      ...transformedUpdatedTravelCart,
      bookings: [
        {
          ...transformedUpdatedTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithEnlistSelf,
              // requested action should not change
              hotelReservationDetailId: undefined,
              requestedAction: 'BOOK'
            }
          ]
        }
      ]
    };

    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: travelCartWithNewBookingWithGuestRoommate,
        isCartCreated: true
      }
    });

    await store.dispatch(handleRegistrantRemovalInTravelCart('guest1'));
    expect(updateTravelCartMock).toBeCalledWith(updatedCartWithEnlistSelf);
  });

  test('> should not change CANCEL room booking when guest is cancelled', async () => {
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary'
        }
      }
    };

    const travelCartWithCancelledBooking = {
      ...originalTravelCart,
      bookings: [
        {
          ...originalTravelCart.bookings[0],
          hotelRoomBookings: [
            {
              ...hotelRoomBookingWithGuestRoommate,
              requestedAction: 'CANCEL'
            }
          ]
        }
      ]
    };

    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: travelCartWithCancelledBooking,
        isCartCreated: true
      }
    });

    await store.dispatch(handleRegistrantRemovalInTravelCart('guest1'));
    expect(updateTravelCartMock).not.toBeCalledWith(travelCartWithCancelledBooking);
  });

  test('replace requested action as cancel for bookings, with all cancelled hotel room booking, air booking & air actuals', async () => {
    const transformedCart = {
      id: 'DUMMY_CART_ID',
      isPlannerApprovalRequired: false,
      attendee: {},
      bookings: [
        {
          id: 'primary',
          admissionItemId: null,
          registrationTypeId: 'regType',
          registrationPathId: 'regPath',
          airBookings: [
            {
              id: 'air_aaa',
              requestedAction: 'BOOK',
              travellerInfo: {
                dateOfBirth: ''
              }
            }
          ],
          hotelRoomBookings: [
            {
              id: 'hotel_aaa',
              requestedAction: 'BOOK',
              checkinDate: '2020-07-29',
              checkoutDate: '2020-08-01'
            }
          ],
          travelAnswers: [],
          airActuals: [],
          groupFlightBookings: [],
          creditCard: undefined,
          concurAirActuals: [],
          pnrAirActuals: [],
          attendee: {
            contactId: null,
            homeCityAddress: {
              city: 'McLean',
              countryCode: 'US',
              countryName: 'USA',
              postalCode: '1234',
              stateCode: 'VA',
              stateName: 'Virginia'
            },
            id: null,
            inviteeEmailAddress: 'dummy@j.mail',
            primaryInviteeId: null,
            primaryRegistrantTravelBookingId: '00000000-0000-0000-0000-000000000001',
            status: null,
            targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
            type: 'INVITEE',
            workCityAddress: {
              city: 'McLean',
              countryCode: 'US',
              countryName: 'USA',
              postalCode: '1234',
              stateCode: 'VA',
              stateName: 'Virginia'
            }
          }
        },
        {
          id: 'guest1',
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          admissionItemId: null,
          registrationPathId: undefined,
          airBookings: [],
          airActuals: [],
          hotelRoomBookings: [
            {
              id: 'hotel_guest_aaa',
              hotelReservationDetailId: 'hid',
              requestedAction: 'CANCEL',
              checkinDate: '2020-07-29',
              checkoutDate: '2020-08-01'
            }
          ],
          travelAnswers: [],
          attendee: {
            contactId: null,
            homeCityAddress: {
              city: 'McLean',
              countryCode: 'US',
              countryName: 'USA',
              postalCode: '1234',
              stateCode: 'VA',
              stateName: 'Virginia'
            },
            id: null,
            inviteeEmailAddress: 'dummy@j.mail',
            primaryInviteeId: null,
            primaryRegistrantTravelBookingId: 'primary',
            status: null,
            targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
            type: 'INVITEE',
            workCityAddress: {
              city: 'McLean',
              countryCode: 'US',
              countryName: 'USA',
              postalCode: '1234',
              stateCode: 'VA',
              stateName: 'Virginia'
            }
          },
          requestedAction: 'CANCEL',
          groupFlightBookings: [],
          creditCard: undefined,
          concurAirActuals: [],
          pnrAirActuals: []
        }
      ],
      requestedAction: 'MODIFY'
    };
    const originalCart = {
      id: 'DUMMY_CART_ID',
      isPlannerApprovalRequired: false,
      attendee: {},
      bookings: [
        {
          id: 'primary',
          airBookings: [
            {
              id: 'air_aaa',
              requestedAction: 'BOOK',
              travellerInfo: {
                dateOfBirth: ''
              }
            }
          ],
          airActuals: [],
          hotelRoomBookings: [
            {
              id: 'hotel_aaa',
              requestedAction: 'BOOK',
              checkinDate: '2020-07-29',
              checkoutDate: '2020-08-01'
            }
          ],
          travelAnswers: [],
          groupFlightBookings: [],
          concurAirActuals: [],
          pnrAirActuals: []
        },
        {
          id: 'guest1',
          airBookings: [],
          airActuals: [],
          hotelRoomBookings: [
            {
              hotelReservationDetailId: 'hid',
              id: 'hotel_guest_aaa',
              requestedAction: 'BOOK',
              checkinDate: '2020-07-29',
              checkoutDate: '2020-08-01'
            }
          ],
          travelAnswers: [],
          groupFlightBookings: [],
          concurAirActuals: [],
          pnrAirActuals: [],
          requestedAction: 'BOOK'
        }
      ],
      requestedAction: 'MODIFY'
    };
    const testRegCart = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          attendee: {
            attendeeId: null,
            inviteeStatus: null,
            personalInformation: {
              contactId: null,
              emailAddress: 'dummy@j.mail',
              homeAddress: {
                city: 'McLean',
                country: 'USA',
                countryCode: 'US',
                postalCode: '1234',
                state: 'Virginia',
                stateCode: 'VA'
              },
              workAddress: {
                city: 'McLean',
                country: 'USA',
                countryCode: 'US',
                postalCode: '1234',
                state: 'Virginia',
                stateCode: 'VA'
              }
            },
            targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
          }
        }
      }
    };
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: testRegCart
      },
      regCartStatus: { lastSavedRegCart: testRegCart },
      travelCart: {
        cart: originalCart,
        isCartCreated: true
      }
    });
    await store.dispatch(handleRegistrantRemovalInTravelCart('guest1'));
    expect(updateTravelCartMock).toBeCalledWith(transformedCart);
  });

  test('> remove existing travel cart when restoring partial reg cart', async () => {
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart,
        regCartPayment: {}
      },
      regCartStatus: { lastSavedRegCart: regCart },
      travelCart: {
        cart: originalTravelCart,
        isCartCreated: true
      }
    });
    await store.dispatch({ type: RESTORE_PARTIAL_CART_SUCCESS });
    expect(store.getState().travelCart).toMatchSnapshot();
  });
});

describe('update reg cart for travel >', () => {
  const lastSavedRegCart = {
    regCartId: 'DUMMY_CART_ID',
    eventRegistrations: {
      primary: {
        eventRegistrationId: 'primary'
      }
    }
  };

  let updateRegCartMock;
  let mockReducer;

  const airRequest = {
    attendeeRegistrationId: 'primary',
    requestedAction: 'BOOK',
    travellerInfo: {
      dateOfBirth: ''
    }
  };

  // only need the travel flag
  const updatedRegCartPartial = {
    hasTravel: true
  };

  beforeEach(() => {
    const travelCart = {
      id: 'DUMMY_CART_ID',
      isPlannerApprovalRequired: false,
      attendee: {},
      bookings: [
        {
          id: 'primary',
          airBookings: [airRequest]
        }
      ]
    };

    updateRegCartMock = jest.fn().mockReturnValue(new Promise(resolve => resolve({ regCart: updatedRegCartPartial })));

    mockReducer = (state, action) => {
      return {
        accessToken: 'DUMMY_ACCESS_TOKEN',
        userSession: {},
        defaultUserSession: {
          eventId: 'EVENT_ID',
          isPreview: false,
          isPlanner: false
        },
        clients: {
          travelApiClient: {
            createTravelCart: jest.fn().mockReturnValue(new Promise(resolve => resolve({ travelCart })))
          },
          regCartClient: {
            updateRegCart: updateRegCartMock
          }
        },
        eventTravel: {
          hotelsData: travelCartFixture.emptyHotelsData,
          travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION'
        },
        event: {
          isInTestMode: false,
          timezone: 35
        },
        registrationForm: registrationFormReducer(state.registrationForm, action),
        regCartStatus: regCartStatusReducer(state.regCartStatus, action),
        travelCart: reducer(state.travelCart, action),
        timezones
      };
    };
  });

  test('update travel flag in reg cart', async () => {
    // setup test data
    const store = getStoreForTest(mockReducer, {
      registrationForm: {
        regCart: {
          ...lastSavedRegCart,
          eventRegistrations: {
            ...lastSavedRegCart.eventRegistrations,
            primary: {
              ...lastSavedRegCart.eventRegistrations.primary,
              attendee: {
                personalInformation: {
                  firstName: 'testFirst',
                  lastName: 'testLast'
                }
              }
            }
          }
        },
        regCartPayment: {}
      },
      regCartStatus: { lastSavedRegCart }
    });

    // perform an action that triggers update
    await store.dispatch(saveAirRequests(airRequest));

    // verify regCart update was called with travel flag updated with the lastSavedCart and not latest
    expect(updateRegCartMock).toBeCalledWith(
      'DUMMY_ACCESS_TOKEN',
      { ...lastSavedRegCart, ...updatedRegCartPartial },
      undefined
    );

    // verify travel flag updated in lastSavedCart
    expect(store.getState().regCartStatus.lastSavedRegCart.hasTravel).toBeTruthy();

    // verify travel flag updated in latest cart in state
    expect(store.getState().registrationForm.regCart.hasTravel).toBeTruthy();
  });
});
