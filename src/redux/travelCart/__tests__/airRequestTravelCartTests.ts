import reducer from '../index';
import registrationFormReducer from '../../registrationForm/reducer';
import regCartStatusReducer from '../../regCartStatus';
import appDataReducer from '../../appData';
import { saveAirRequests } from '../workflow';
import { getUpdatedTravelBookingsForAirRequests, removeAirRequests } from '../airRequest';
import timezones from './fixtures/timezonesFixture.json';
import getStoreForTest from 'event-widgets/utils/testUtils';
import travelCartFixture from './fixtures/airTravelCartFixtures.json';
import eventTravelReducer from 'event-widgets/redux/modules/eventTravel';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';

jest.mock('../../selectors/currentRegistrationPath', () => {
  return {
    isGuestProductSelectionEnabledOnRegPath: jest.fn(() => true)
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

test('Save air request in empty travel cart', async () => {
  const createTravelCartMock = jest.fn(cart => Promise.resolve({ travelCart: cart }));
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
          createTravelCart: createTravelCartMock,
          updateTravelCart: createTravelCartMock
        },
        regCartClient: {
          updateRegCart: updateRegCartMock
        }
      },
      eventTravel: eventTravelReducer(state.eventTravel, action),
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
      eventSnapshotVersion: 'EVENT_SNAPSHOT_VERSION',
      appData: appDataReducer(state.appData, action, state)
    };
  };
  const testRegCart = {
    regMod: false,
    regCartId: 'DUMMY_CART_ID',
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
        registrationPathId: 'REG_PATH_1',
        productRegistrations: [
          {
            productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
            productType: 'AdmissionItem',
            requestedAction: 'REGISTER'
          }
        ],
        attendee: {
          attendeeId: null,
          inviteeStatus: null,
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
          personalInformation: {
            contactId: null,
            emailAddress: 'dummy@j.mail',
            homeAddress: {
              state: 'Virginia',
              city: 'McLean',
              countryCode: 'US',
              country: 'USA',
              postalCode: 1234,
              stateCode: 'VA'
            },
            workAddress: {
              state: 'Virginia',
              city: 'McLean',
              countryCode: 'US',
              country: 'USA',
              postalCode: 1234,
              stateCode: 'VA'
            }
          }
        }
      },
      DUMMY_BOOKING_ID_TWO: {
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0373',
        registrationPathId: 'REG_PATH_2',
        productRegistrations: [
          {
            productId: '3349dc98-e303-4bf9-b698-e1bdae85f947',
            productType: 'AdmissionItem',
            requestedAction: 'REGISTER'
          }
        ]
      }
    }
  };
  const testAppData = {
    registrationSettings: {
      travelQuestions: {
        DUMMY_QUESTION_ID: {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_QUESTIONS
            }
          }
        },
        DUMMY_ALTERNATE_QUESTION_ID: {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS
            }
          }
        }
      }
    }
  };
  const store = getStoreForTest(mockReducer, {
    registrationForm: {
      regCart: testRegCart,
      regCartPayment: {}
    },
    regCartStatus: { lastSavedRegCart: testRegCart },
    eventTravel: {
      travelSnapshotVersion: 'TRAVEL_SNAPSHOT_VERSION',
      airData: {}
    },
    travelCart: {
      cart: {
        bookings: [
          {
            ...travelCartFixture.travelCartWithAirBooking.bookings[0],
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
                requestBookingId: travelCartFixture.travelCartWithAirBooking.bookings[0].airBookings[0].id,
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
                requestBookingId: travelCartFixture.travelCartWithAirBooking.bookings[0].airBookings[0].id,
                answers: [],
                requestedAction: 'ADD'
              }
            ]
          }
        ]
      },
      isCartCreated: false,
      userSession: {
        airRequest: { ownBooking: false, showSummary: false, selectedAirRequestIds: [] }
      }
    },
    appData: testAppData
  });
  const dummyAirRequest = {
    attendeeRegistrationId: 'DUMMY_BOOKING_ID',
    ...travelCartFixture.travelCartWithAirBooking.bookings[0].airBookings[0]
  };
  await store.dispatch(saveAirRequests(dummyAirRequest));
  expect(store.getState()).toMatchSnapshot();
  expect(createTravelCartMock).toBeCalledWith({
    ...travelCartFixture.travelCartWithAirBooking,
    bookings: [
      {
        ...travelCartFixture.travelCartWithAirBooking.bookings[0],
        hotelRoomBookings: [],
        airActuals: [],
        creditCard: undefined,
        concurAirActuals: [],
        pnrAirActuals: [],
        travelAnswers: [
          {
            // Alternate hotel request answer
            questionId: 'DUMMY_ALTERNATE_QUESTION_ID',
            requestBookingId: '00000000-0000-0000-0000-000000000000',
            answers: [{}],
            requestedAction: 'DELETE'
          },
          {
            // Hotel request answer
            questionId: 'DUMMY_QUESTION_ID',
            requestBookingId: travelCartFixture.travelCartWithAirBooking.bookings[0].airBookings[0].id,
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
            requestBookingId: travelCartFixture.travelCartWithAirBooking.bookings[0].airBookings[0].id,
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
      ...travelCartFixture.updateRegCartResult.regCart,
      hasTravel: true
    },
    undefined
  );
  expect(store.getState().travelCart.userSession.airRequest.showSummary).toBeTruthy();
  expect(store.getState().travelCart.userSession.airRequest.selectedAirRequestIds[0]).toBe(
    travelCartFixture.travelCartWithAirBooking.bookings[0].airBookings[0].id
  );

  // Adding 1 more request to test getNewAirRequestId method
  await store.dispatch(
    saveAirRequests({
      ...travelCartFixture.newAirRequest,
      attendeeRegistrationId: 'DUMMY_BOOKING_ID_TWO'
    })
  );
  expect(store.getState()).toMatchSnapshot();
  expect(store.getState().travelCart.userSession.airRequest.selectedAirRequestIds[1]).toBe(
    travelCartFixture.newAirRequest.id
  );
});

const EVENT_REG_ID = 'EVENT_REG_ID';
const DUMMY_AIR_BOOKING_ID = 'DUMMY_AIR_BOOKING';

describe('Update air bookings in travel cart >', () => {
  const travelBooking = { id: EVENT_REG_ID, airBookings: [] };
  const airBooking = { id: DUMMY_AIR_BOOKING_ID, attendeeRegistrationId: EVENT_REG_ID };

  test('Add air booking when no travel bookings exist at all', () => {
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests([], airBooking, EVENT_REG_ID);
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Add air booking when no travel booking exists for the given event reg id', () => {
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests(
      [{ ...travelBooking, id: 'EVENT_REG_ID2' }],
      airBooking,
      EVENT_REG_ID
    );
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Add air booking when no existing air bookings exist', () => {
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests([travelBooking], airBooking, EVENT_REG_ID);
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Add a new air booking when already air bookings exist in travel booking for given reg id', () => {
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests(
      [{ ...travelBooking, airBookings: [airBooking] }],
      { ...airBooking, id: 'DUMMY_AIR_BOOKING_ID2' },
      EVENT_REG_ID
    );
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Modify an air booking which was only been added during the course of a registration', () => {
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests(
      [{ ...travelBooking, airBookings: [airBooking] }],
      { ...airBooking, departureFrom: 473 },
      EVENT_REG_ID
    );
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Modify an already existing air booking when doing a mod', () => {
    const existingBooking = { ...airBooking, airReservationDetailId: 'I_EXIST_ALREADY' };
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests(
      [{ ...travelBooking, airBookings: [existingBooking] }],
      { ...existingBooking, departureFrom: 473 },
      EVENT_REG_ID
    );
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Cancel an already existing air booking when doing a mod', () => {
    const existingBooking = { ...airBooking, airReservationDetailId: 'I_EXIST_ALREADY' };
    const updatedTravelBookings = removeAirRequests(
      [{ ...travelBooking, airBookings: [existingBooking] }],
      [existingBooking]
    );
    expect(updatedTravelBookings).toMatchSnapshot();
  });

  test('Remove an air booking which was only been added during the course of a registration', () => {
    const updatedTravelBookings = removeAirRequests([{ ...travelBooking, airBookings: [airBooking] }], [airBooking]);
    expect(updatedTravelBookings).toMatchSnapshot();
  });
});
