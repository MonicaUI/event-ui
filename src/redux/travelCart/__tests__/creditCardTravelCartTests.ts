import reducer from '../index';
import registrationFormReducer from '../../registrationForm/reducer';
import regCartStatusReducer from '../../regCartStatus';
import { saveTravelRegistration } from '../external';
// import { getUpdatedTravelBookingsForAirRequests, removeAirRequests } from '../airRequest';
import timezones from './fixtures/timezonesFixture.json';
import getStoreForTest from 'event-widgets/utils/testUtils';
import travelCartFixture from './fixtures/creditCardTravelCartFixtures.json';
import eventTravelReducer from 'event-widgets/redux/modules/eventTravel';

jest.mock('../../selectors/currentRegistrationPath', () => {
  return {
    isGuestProductSelectionEnabledOnRegPath: jest.fn(() => true)
  };
});

jest.mock('../../website/selectors', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../website/selectors'),
    __esModule: true,
    isWidgetPresentOnCurrentPage: jest.fn(() => true)
  };
});

jest.mock('../../reducer', () => {
  return {
    getCurrentPageId: jest.fn(() => true)
  };
});

jest.mock('../../../utils/travelUtils', () => {
  return {
    updateRegistrantInformationInTravelBookings: jest.fn(c => {
      return { bookings: c };
    }),
    hasAnyTravelItem: jest.fn(() => true)
  };
});

test('Save credit card in empty travel cart', async () => {
  const createTravelCartMock = jest.fn(cart => Promise.resolve({ travelCart: cart }));
  const updateRegCartMock = jest.fn((token, cart) => Promise.resolve({ regCart: cart }));
  const createCreditCardMock = jest.fn((token, card) =>
    Promise.resolve({
      contextId: 'dummyContextId',
      creditCard: card.creditCard
    })
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
      appData: {
        registrationSettings: {
          travelQuestions: []
        }
      },
      clients: {
        travelApiClient: {
          createTravelCart: createTravelCartMock,
          updateTravelCart: createTravelCartMock
        },
        regCartClient: {
          updateRegCart: updateRegCartMock
        },
        creditCardClient: {
          createCreditCard: createCreditCardMock
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
      eventSnapshotVersion: 'EVENT_SNAPSHOT_VERSION',
      timezones
    };
  };
  const testRegCart = {
    regMod: false,
    regCartId: 'DUMMY_CART_ID',
    eventRegistrations: {
      DUMMY_BOOKING_ID: {
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
        registrationPathId: 'REG_PATH_1',
        productRegistrations: [
          {
            productId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
            productType: 'AdmissionItem',
            requestedAction: 'REGISTER'
          }
        ]
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
        bookings: []
      },
      isCartCreated: false,
      userSession: {
        airRequest: { ownBooking: false, showSummary: false, selectedAirRequestIds: [] },
        creditCard: {
          ...travelCartFixture.creditCard
        },
        travelAnswers: {}
      }
    }
  });

  await store.dispatch(saveTravelRegistration(true));
  expect(store.getState()).toMatchSnapshot();
  expect(createCreditCardMock).toBeCalledWith('DUMMY_ACCESS_TOKEN', {
    creditCard: {
      ...travelCartFixture.creditCardForCreateRequest
    }
  });
  expect(createTravelCartMock).toBeCalledWith({
    ...travelCartFixture.travelCartWithCreditCard,
    bookings: [
      {
        airBookings: [],
        hotelRoomBookings: [],
        airActuals: [],
        creditCard: {
          contextId: 'dummyContextId',
          creditCardDetails: {
            ...travelCartFixture.creditCard,
            cardType: undefined
          }
        },
        id: undefined,
        travelAnswers: [],
        concurAirActuals: [],
        pnrAirActuals: []
      }
    ],
    eventId: 'EVENT_ID'
  });
});
