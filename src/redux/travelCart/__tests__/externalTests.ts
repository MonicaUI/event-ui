import reducer from '../index';
import {
  restoreTravelCartIntoState,
  restoreTransientTravelCartIntoState,
  updateRegTypeAndAdmissionItemIdsInTravelBookings
} from '../external';
import getStoreForTest from 'event-widgets/utils/testUtils';
import travelCartFixture from './fixtures/travelCartFixtures.json';
import timezones from './fixtures/timezonesFixture.json';
import { loadTravelSnapshotVersion } from 'event-widgets/redux/modules/eventTravel';

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
    getLocalDateFromEventDateString: c => c
  };
});

test('Restore travel cart into state', async () => {
  const getTravelCartMock = jest.fn();
  getTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.getTravelCartResult));
  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      clients: {
        travelApiClient: {
          getTravelCart: getTravelCartMock
        }
      },
      travelCart: reducer(state.travelCart, action),
      timezones,
      event: {
        timezone: 35,
        eventFeatureSetup: {
          travelAndHousing: {
            hotelAccomodations: true,
            airTravel: {
              enabled: false
            }
          }
        }
      }
    };
  };
  const store = getStoreForTest(mockReducer, {});
  await store.dispatch(restoreTravelCartIntoState('DUMMY_CART_ID'));
  expect(loadTravelSnapshotVersion).toBeCalledWith('TRAVEL_SNAPSHOT_VERSION');
  expect(store.getState()).toMatchSnapshot();
  expect(getTravelCartMock).toBeCalledWith('DUMMY_CART_ID');
});

test('Restore transient travel cart into state', async () => {
  const getTransientTravelCartMock = jest.fn();
  getTransientTravelCartMock.mockReturnValue(Promise.resolve(travelCartFixture.transientCartResponse));

  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      clients: {
        travelApiClient: {
          getTransientTravelCart: getTransientTravelCartMock
        }
      },
      userSession: {},
      defaultUserSession: {
        isPlanner: true,
        isTestMode: true
      },
      travelCart: reducer(state.travelCart, action),
      timezones,
      event: {
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
      registrationForm: {
        regCart: {
          eventRegistrations: {
            REG_ID: {
              attendee: {
                attendeeId: 'ATTENDEE_ID'
              }
            }
          }
        }
      }
    };
  };
  const store = getStoreForTest(mockReducer, {});
  await store.dispatch(restoreTransientTravelCartIntoState());
  expect(store.getState()).toMatchSnapshot();
  expect(getTransientTravelCartMock).toBeCalledWith('ATTENDEE_ID', true, {
    isForPlanner: true,
    isForTestMode: true,
    travelBookingIdOverrides: {
      ATTENDEE_ID: 'REG_ID'
    }
  });
});

test('Update RegType And Admission Item Ids and addresses In Travel Bookings', async () => {
  const updateTravelCartMock = jest.fn(cart => Promise.resolve({ travelCart: cart }));
  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      clients: {
        travelApiClient: {
          updateTravelCart: updateTravelCartMock
        }
      },
      registrationForm: {
        regCart: {
          regCartId: 'DUMMY_CART_ID',
          eventRegistrations: {
            DUMMY_BOOKING_ID: {
              registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
              registrationPathId: 'REG_PATH_ID',
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
              registrationPathId: 'REG_PATH_ID2',
              primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
              productRegistrations: [
                {
                  productId: '3349dc98-e303-4bf9-b698-e1bdae85f947',
                  productType: 'AdmissionItem',
                  requestedAction: 'REGISTER'
                }
              ],
              attendee: {
                attendeeId: null,
                inviteeStatus: null,
                personalInformation: {
                  contactId: null,
                  emailAddress: 'dummy@j.mail',
                  homeAddress: {
                    state: 'Virginia',
                    city: 'McLean',
                    countryCode: 'US'
                  },
                  workAddress: {
                    state: 'Virginia',
                    city: 'McLean',
                    countryCode: 'US'
                  }
                },
                targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
              }
            }
          }
        },
        regCartPayment: {}
      },
      travelCart: reducer(state.travelCart, action),
      timezones: {},
      event: {
        timezone: 35
      }
    };
  };
  const cart = {
    id: 'DUMMY_CART_ID',
    isPlannerApprovalRequired: false,
    bookings: [
      {
        id: 'DUMMY_BOOKING_ID',
        registrationPathId: 'REG_PATH_ID',
        admissionItemId: '3349dc98-e303-4bf9-b698-e1bdae85f940',
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
        airBookings: [
          {
            id: 'airBooking1_1',
            travellerInfo: {
              dateOfBirth: ''
            },
            requestedAction: 'BOOK'
          }
        ],
        creditCard: undefined,
        travelAnswers: [],
        hotelRoomBookings: [],
        airActuals: [],
        attendee: {
          homeCityAddress: {
            city: undefined,
            countryCode: undefined,
            countryName: undefined,
            postalCode: undefined,
            stateCode: undefined,
            stateName: undefined
          },
          contactId: undefined,
          id: undefined,
          inviteeEmailAddress: undefined,
          primaryInviteeId: null,
          primaryRegistrantTravelBookingId: undefined,
          status: undefined,
          targetListId: undefined,
          type: 'INVITEE',
          workCityAddress: {
            city: undefined,
            countryCode: undefined,
            countryName: undefined,
            postalCode: undefined,
            stateCode: undefined,
            stateName: undefined
          }
        },
        concurAirActuals: [],
        pnrAirActuals: []
      },
      {
        id: 'DUMMY_BOOKING_ID_TWO',
        registrationPathId: 'REG_PATH_ID2',
        admissionItemId: '3349dc98-e303-4bf9-b698-e1bdae85f947',
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0370',
        attendee: {
          contactId: null,
          homeCityAddress: {
            stateName: 'Virginia',
            city: 'McLean',
            countryCode: 'US',
            countryName: undefined,
            postalCode: undefined,
            stateCode: undefined
          },
          id: null,
          inviteeEmailAddress: 'dummy@j.mail',
          primaryInviteeId: null,
          primaryRegistrantTravelBookingId: '00000000-0000-0000-0000-000000000001',
          status: null,
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
          type: 'INVITEE',
          workCityAddress: {
            stateName: 'Virginia',
            city: 'McLean',
            countryCode: 'US',
            countryName: undefined,
            postalCode: undefined,
            stateCode: undefined
          }
        },
        airBookings: [
          {
            id: 'airBooking1_1',
            travellerInfo: {
              dateOfBirth: ''
            },
            requestedAction: 'BOOK'
          }
        ],
        creditCard: undefined,
        travelAnswers: [],
        hotelRoomBookings: [],
        airActuals: [],
        concurAirActuals: [],
        pnrAirActuals: []
      }
    ]
  };
  const store = getStoreForTest(mockReducer, {
    travelCart: {
      cart,
      isCartCreated: true
    }
  });
  await store.dispatch(updateRegTypeAndAdmissionItemIdsInTravelBookings());
  const modifiedCart = { ...cart };
  modifiedCart.bookings[0].admissionItemId = '3349dc98-e303-4bf9-b698-e1bdae85f946';
  modifiedCart.bookings[0].registrationTypeId = 'b8e50dbf-7437-4eec-a964-bc27d79d0372';
  modifiedCart.bookings[1].admissionItemId = '3349dc98-e303-4bf9-b698-e1bdae85f947';
  modifiedCart.bookings[1].registrationTypeId = 'b8e50dbf-7437-4eec-a964-bc27d79d0373';
  modifiedCart.bookings[1].attendee.homeCityAddress.countryCode = 'US';
  modifiedCart.bookings[1].attendee.homeCityAddress.stateName = 'Virginia';
  modifiedCart.bookings[1].attendee.homeCityAddress.city = 'McLean';
  modifiedCart.bookings[1].attendee.workCityAddress.countryCode = 'US';
  modifiedCart.bookings[1].attendee.workCityAddress.stateName = 'Virginia';
  modifiedCart.bookings[1].attendee.workCityAddress.city = 'McLean';
  modifiedCart.bookings[1].attendee.inviteeEmailAddress = 'dummy@j.mail';
  modifiedCart.bookings[1].attendee.primaryRegistrantTravelBookingId = '00000000-0000-0000-0000-000000000001';
  modifiedCart.bookings[1].attendee.targetListId = '780c72ba-d8d5-40ac-9ba8-38f3b81418d8';
  modifiedCart.bookings[1].attendee.type = 'INVITEE';
  expect(store.getState().travelCart.cart).toMatchSnapshot();
  expect(updateTravelCartMock).toBeCalledWith(modifiedCart);
});

test('No backend call when RegType And Admission Item Ids and addresses have not changed in reg cart', async () => {
  const updateTravelCartMock = jest.fn((token, cart) => Promise.resolve({ travelCart: cart }));
  const mockReducer = (state, action) => {
    return {
      accessToken: 'DUMMY_ACCESS_TOKEN',
      clients: {
        travelApiClient: {
          updateTravelCart: updateTravelCartMock
        }
      },
      registrationForm: {
        regCart: {
          regCartId: 'DUMMY_CART_ID',
          eventRegistrations: {
            DUMMY_BOOKING_ID: {
              registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
              registrationPathId: 'REG_PATH_ID',
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
              registrationPathId: 'REG_PATH_ID2',
              primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
              productRegistrations: [
                {
                  productId: '3349dc98-e303-4bf9-b698-e1bdae85f947',
                  productType: 'AdmissionItem',
                  requestedAction: 'REGISTER'
                }
              ],
              attendee: {
                attendeeId: null,
                inviteeStatus: null,
                personalInformation: {
                  contactId: null,
                  emailAddress: 'dummy@j.mail',
                  homeAddress: {
                    countryCode: 'US'
                  },
                  workAddress: {
                    countryCode: 'US'
                  }
                },
                targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8'
              }
            }
          }
        },
        regCartPayment: {}
      },
      travelCart: reducer(state.travelCart, action),
      timezones: {},
      event: {
        timezone: 35
      }
    };
  };
  const cart = {
    id: 'DUMMY_CART_ID',
    bookings: [
      {
        id: 'DUMMY_BOOKING_ID',
        registrationPathId: 'REG_PATH_ID',
        admissionItemId: '3349dc98-e303-4bf9-b698-e1bdae85f946',
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0372',
        attendee: {
          primaryInviteeId: null,
          type: 'INVITEE'
        }
      },
      {
        id: 'DUMMY_BOOKING_ID_TWO',
        registrationPathId: 'REG_PATH_ID2',
        admissionItemId: '3349dc98-e303-4bf9-b698-e1bdae85f947',
        registrationTypeId: 'b8e50dbf-7437-4eec-a964-bc27d79d0373',
        attendee: {
          contactId: null,
          homeCityAddress: {
            countryCode: 'US'
          },
          id: null,
          inviteeEmailAddress: 'dummy@j.mail',
          primaryInviteeId: null,
          primaryRegistrantTravelBookingId: '00000000-0000-0000-0000-000000000001',
          status: null,
          targetListId: '780c72ba-d8d5-40ac-9ba8-38f3b81418d8',
          type: 'INVITEE',
          workCityAddress: {
            countryCode: 'US'
          }
        }
      }
    ]
  };
  const store = getStoreForTest(mockReducer, {
    travelCart: {
      cart,
      isCartCreated: true
    }
  });
  await store.dispatch(updateRegTypeAndAdmissionItemIdsInTravelBookings());
  expect(store.getState().travelCart.cart).toMatchSnapshot();
  expect(updateTravelCartMock).not.toHaveBeenCalled();
});
