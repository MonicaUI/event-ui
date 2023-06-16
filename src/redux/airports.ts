import { getIn } from 'icepick';
import { getAirActualsFromBooking } from './travelCart/airActuals';
import { ALL_AIR_ACTUALS_SOURCES } from 'event-widgets/utils/travelConstants';
import baseReducer, {
  getAirportIdsFromSnapshot,
  loadAirports,
  setAirports
} from 'event-widgets/redux/modules/airports';
export { setAirports };

const SEARCH_AIRPORTS_SUCCESS = 'event-guestside-site/airports/SEARCH_AIRPORTS_SUCCESS';

const MIN_LENGTH_FOR_SEARCH = 3;

export function setAirportSearch(searchText: $TSFixMe, airports: $TSFixMe): $TSFixMe {
  return { type: SEARCH_AIRPORTS_SUCCESS, payload: { searchText, airports } };
}

const getAirportIdsFromTravelCart = state => {
  const bookings = getIn(state, ['travelCart', 'cart', 'bookings']);
  const airportsToFetch = [];
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (bookings && bookings.length) {
    bookings.forEach(b => {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (b.airBookings && b.airBookings.length) {
        b.airBookings.forEach(ab => {
          if (ab.departureFrom) {
            airportsToFetch.push(ab.departureFrom);
          }
          if (ab.departureTo) {
            airportsToFetch.push(ab.departureTo);
          }
        });
      }
      const allAirActuals = getAirActualsFromBooking(b, ALL_AIR_ACTUALS_SOURCES);
      if (allAirActuals.length) {
        allAirActuals.forEach(airActual => {
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (airActual.flightDetails && airActual.flightDetails.length) {
            airActual.flightDetails.forEach(fd => {
              if (fd.departureFrom) {
                airportsToFetch.push(fd.departureFrom);
              }
              if (fd.arrivalTo) {
                airportsToFetch.push(fd.arrivalTo);
              }
            });
          }
        });
      }
    });
  }
  return airportsToFetch;
};

/**
 * Creates a thunked action to load the required airports for an existing travel cart.
 */
export const loadAirportsForTravelCart =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const airportsToFetch = getAirportIdsFromTravelCart(getState());
    if (airportsToFetch.length) {
      await dispatch(loadAirports(airportsToFetch));
    }
  };

/**
 * Creates a thunked action to load the required airports for an event.
 */
export const loadAirportsForEvent =
  (eventSnapshotVersion: $TSFixMe, travelSnapshotVersion: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventSnapshotClient }
    } = getState();
    const { airports } = await eventSnapshotClient.getEventTravelAirports(eventSnapshotVersion, travelSnapshotVersion);
    dispatch(setAirports(airports));
  };

/**
 * Creates a thunked action to load the required airports for an event and the loaded travel cart
 */
export const loadAirportsForEventAndTravelCart =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const airportsFromSnapshot = getAirportIdsFromSnapshot(state);
    const airportsFromTravelCart = getAirportIdsFromTravelCart(state);
    const allAirportsToFetch = [...airportsFromSnapshot, ...airportsFromTravelCart];
    if (allAirportsToFetch.length) {
      await dispatch(loadAirports(allAirportsToFetch));
    }
  };

/**
 * Creates a thunked action to load airports by search text.
 * @param searchText The text to search for.
 */
export const loadAirportsForSuggestions =
  (searchText: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { lookupClient }
    } = getState();
    if (searchText && searchText.length >= MIN_LENGTH_FOR_SEARCH) {
      const response = await lookupClient.searchAirports(searchText);
      const { airports } = response;
      dispatch(setAirportSearch(searchText, airports));
    }
  };

const initialState = {
  searchResults: {}
};

export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case SEARCH_AIRPORTS_SUCCESS: {
      return {
        ...state,
        ...action.payload.airports,
        searchResults: {
          ...state.searchResults,
          [action.payload.searchText]: action.payload.airports
        }
      };
    }
    default: {
      return baseReducer(state, action);
    }
  }
}
