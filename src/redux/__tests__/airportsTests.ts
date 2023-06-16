/* global */
import reducer, { setAirportSearch, loadAirportsForEvent, loadAirportsForTravelCart } from '../airports';
import travelAirportsData from '../../../fixtures/travelAirportsData.json';
import getStoreForTest from 'event-widgets/utils/testUtils';

const eventId = 'some-event-id';

const getMockStore = (getAirPortsMock, searchAirPortsMock) => {
  getAirPortsMock.mockReturnValue(
    Promise.resolve({
      airports: {
        123: {
          name: 'the airport',
          id: 123,
          code: 'abc'
        }
      }
    })
  );
  searchAirPortsMock.mockReturnValue(
    Promise.resolve({
      airports: {
        234: {
          name: '2nd airport',
          id: 234,
          code: 'def'
        }
      }
    })
  );

  const eventTravelAirportsMock = jest.fn();
  eventTravelAirportsMock.mockReturnValue(Promise.resolve(travelAirportsData));

  const mockReducer = (state, action) => {
    return {
      clients: {
        eventSnapshotClient: {
          getEventTravelAirports: eventTravelAirportsMock
        },
        lookupClient: {
          getAirports: getAirPortsMock,
          searchAirports: searchAirPortsMock
        }
      },
      event: {
        id: eventId,
        eventFeatureSetup: {
          travelAndHousing: {
            airTravel: {
              enabled: true
            }
          }
        }
      },
      eventTravel: {
        airData: {
          airRequestSetup: {
            restrictions: {
              limitDepartureAirportIds: [123]
            }
          },
          airActualSetup: {
            defaultSchedule: {}
          }
        }
      },
      travelCart: {
        cart: {
          bookings: [
            {
              id: 'ID_PRIMARY',
              airBookings: [{ departureFrom: 100 }],
              airActuals: [{ flightDetails: [{ departureFrom: 101 }] }]
            },
            {
              id: 'ID_GUEST',
              airBookings: [{ departureTo: 102 }],
              concurAirActuals: [{ flightDetails: [{ arrivalTo: 103 }] }]
            }
          ]
        }
      },
      airports: reducer(state.airports, action)
    };
  };
  return getStoreForTest(mockReducer, {
    airports: {
      999: {
        name: '999',
        code: 'XXX',
        city: 'cventnation'
      }
    }
  });
};

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('search airports', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ 1: { name: string; code: strin... Remove this comment to see the full error message
  const newState = reducer({ 1: { name: '1', code: '1' } }, setAirportSearch('txt', { 2: { name: '2', code: '2' } }));
  expect(newState).not.toBeNull();
  expect(newState).toHaveProperty('1', { name: '1', code: '1' });
  expect(newState.searchResults).not.toBeNull();
  expect(newState.searchResults).toHaveProperty('txt', { 2: { name: '2', code: '2' } });
});

describe('load airports for event', () => {
  test('matches snapshot', async () => {
    const getAirPortsMock = jest.fn();
    const searchAirPortsMock = jest.fn();
    const mockStore = getMockStore(getAirPortsMock, searchAirPortsMock);
    const preExistingAirportsCount = Object.keys(mockStore.getState().airports).length;

    await mockStore.dispatch(loadAirportsForEvent('eventSnapshotVersion', 'travelSnapshotVersion'));

    const airportCountAfterClientCall = Object.keys(mockStore.getState().airports).length;
    const airportCountInClientResponse = Object.keys(travelAirportsData.airports).length;

    expect(mockStore.getState().clients.eventSnapshotClient.getEventTravelAirports).toHaveBeenCalled();
    expect(mockStore.getState().clients.lookupClient.getAirports).not.toHaveBeenCalled();

    expect(preExistingAirportsCount + airportCountInClientResponse).toEqual(airportCountAfterClientCall);
    expect(mockStore.getState().airports).toMatchObject(travelAirportsData.airports);
  });
});

test('load airports from cart', async () => {
  const getAirPortsMock = jest.fn();
  const searchAirPortsMock = jest.fn();
  const mockStore = getMockStore(getAirPortsMock, searchAirPortsMock);
  await mockStore.dispatch(loadAirportsForTravelCart());
  expect(getAirPortsMock).toHaveBeenCalledTimes(1);
  expect(getAirPortsMock).toHaveBeenCalledWith([100, 101, 102, 103]);
});
