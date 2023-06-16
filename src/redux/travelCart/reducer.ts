import { LOG_OUT_REGISTRANT_SUCCESS } from '../registrantLogin/actionTypes';
import {
  INITIATE_CANCEL_REGISTRATION_SUCCESS,
  CREATE_REG_CART_SUCCESS,
  RESTORE_PARTIAL_CART_SUCCESS,
  CREATE_PLACEHOLDER_REG_CART_SUCCESS
} from '../registrationForm/regCart/actionTypes';
import {
  RESTORE_TRAVEL_CART,
  UPDATE_TRAVEL_CART_SUCCESS,
  TRAVEL_CART_NOT_FOUND,
  SET_SELECTED_AIR_ACTUAL_ID,
  SET_SELECTED_AIR_REQUEST_ID,
  SET_AIR_REQUEST_SUMMARY_VIEW,
  SET_AIR_ACTUAL_SUMMARY_VIEW,
  CLEAR_USER_SESSION_DATA,
  TOGGLE_OWN_AIR_TRAVEL_RESERVATION,
  TOGGLE_OWN_HOTEL_ACCOMMODATION,
  UPDATE_CREDIT_CARD,
  SET_EXPANDED_HOTELS,
  SET_ANOTHER_HOTEL_REQUEST,
  SET_HOTEL_REQUEST_SUMMARY_VIEW,
  RESET_USER_SESSION_TRAVEL_DATA,
  SEARCH_ROOMMATE_SUCCESS,
  SET_ROOMMATE_DATA,
  SET_TRAVEL_ANSWER_FIELD,
  REMOVE_TRAVEL_ANSWERS,
  SET_GROUP_FLIGHT_SUMMARY_VIEW,
  SET_SELECTED_GROUP_FLIGHT_ID,
  UPDATE_TRAVEL_ANSWERS
} from './actionTypes';
import { setIn } from 'icepick';

const initialState = {
  cart: {
    bookings: []
  },
  isCartCreated: false,
  roommates: {
    requestedFrom: [], // roommates who have already selected current registrant as roommate
    availableRoommates: {
      // other registrants/invitees that the current registrant can select as a roommate
      all: [], // all roommates returned by searches
      keywordSearch: {} // map of search by search terms
    }
  },
  userSession: {
    airRequest: { ownBooking: false, showSummary: true, selectedAirRequestIds: [] },
    hotelRequest: { ownBooking: {}, isSummaryView: false, expandedHotels: [], isMakingAnotherRequest: false },
    creditCard: null,
    airActual: { showSummary: true, selectedAirActualIds: [] },
    groupFlights: { showSummary: true, selectedGroupFlightIds: [] },
    travelAnswers: {}
  }
};

// eslint-disable-next-line complexity
export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  const { type, payload } = action;

  switch (type) {
    case RESTORE_TRAVEL_CART:
      return { ...payload } || { ...initialState };
    case UPDATE_TRAVEL_CART_SUCCESS:
      return {
        ...state,
        cart: {
          ...payload.travelCart
        },
        isCartCreated: true
      };
    case TRAVEL_CART_NOT_FOUND:
      return {
        ...state,
        cart: {
          id: payload.travelCartId
        },
        isCartCreated: false
      };
    case SET_ROOMMATE_DATA:
      return {
        ...state,
        roommates: {
          ...state.roommates,
          requestedFrom: payload.requestedFrom,
          availableRoommates: {
            ...state.roommates.availableRoommates,
            all: payload.availableRoommates,
            keywordSearch: {}
          }
        }
      };
    case SEARCH_ROOMMATE_SUCCESS:
      return {
        ...state,
        roommates: {
          ...state.roommates,
          availableRoommates: {
            ...state.roommates.availableRoommates,
            keywordSearch: {
              ...state.roommates.availableRoommates.keywordSearch,
              [payload.searchText]: payload.roommates
            }
          }
        }
      };
    case SET_SELECTED_AIR_REQUEST_ID:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          airRequest: {
            ...state.userSession.airRequest,
            selectedAirRequestIds: payload.selectedAirRequestIds
          }
        }
      };
    case SET_SELECTED_AIR_ACTUAL_ID:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          airActual: {
            ...state.userSession.airActual,
            selectedAirActualIds: payload.selectedAirActualIds
          }
        }
      };
    case SET_SELECTED_GROUP_FLIGHT_ID:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          groupFlights: {
            ...state.userSession.groupFlights,
            selectedGroupFlightIds: payload.selectedGroupFlightIds
          }
        }
      };
    case SET_AIR_REQUEST_SUMMARY_VIEW:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          airRequest: {
            ...state.userSession.airRequest,
            showSummary: payload.showSummary
          }
        }
      };
    case SET_AIR_ACTUAL_SUMMARY_VIEW:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          airActual: {
            ...state.userSession.airActual,
            showSummary: payload.showSummary
          }
        }
      };
    case SET_GROUP_FLIGHT_SUMMARY_VIEW:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          groupFlights: {
            ...state.userSession.groupFlights,
            showSummary: payload.showSummary
          }
        }
      };
    case CLEAR_USER_SESSION_DATA:
      return {
        ...state,
        userSession: { ...initialState.userSession }
      };
    case TOGGLE_OWN_AIR_TRAVEL_RESERVATION: {
      const userSession = !state.userSession.airRequest.ownBooking
        ? {
            ...state.userSession,
            airRequest: {
              ...state.userSession.airRequest,
              ownBooking: true,
              showSummary: true
            }
          }
        : {
            ...state.userSession,
            airRequest: {
              ...state.userSession.airRequest,
              ownBooking: false
            }
          };
      return {
        ...state,
        userSession
      };
    }
    case TOGGLE_OWN_HOTEL_ACCOMMODATION:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          // reset hotel request view to hotel request
          hotelRequest: {
            ...state.userSession.hotelRequest,
            ownBooking: {
              ...state.userSession.hotelRequest.ownBooking,
              [payload.currentRegistrationId]: !state.userSession.hotelRequest.ownBooking[payload.currentRegistrationId]
            },
            isSummaryView: false,
            expandedHotels: [],
            isMakingAnotherRequest: false
          }
        }
      };
    case SET_HOTEL_REQUEST_SUMMARY_VIEW:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          hotelRequest: {
            ...state.userSession.hotelRequest,
            isSummaryView: payload.showSummary
          }
        }
      };
    case SET_EXPANDED_HOTELS:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          hotelRequest: {
            ...state.userSession.hotelRequest,
            expandedHotels: payload.expandedHotels
          }
        }
      };
    case SET_ANOTHER_HOTEL_REQUEST:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          hotelRequest: {
            ...state.userSession.hotelRequest,
            isMakingAnotherRequest: payload.isMakingAnotherRequest
          }
        }
      };
    case RESET_USER_SESSION_TRAVEL_DATA:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          hotelRequest: {
            ...state.userSession.hotelRequest,
            isSummaryView: false,
            expandedHotels: [],
            isMakingAnotherRequest: false
          },
          airRequest: {
            ...state.userSession.airRequest,
            showSummary: true
          },
          airActual: {
            ...state.userSession.airActual,
            showSummary: true
          },
          groupFlights: {
            ...state.userSession.groupFlights,
            showSummary: true
          }
        }
      };
    case LOG_OUT_REGISTRANT_SUCCESS: // invitee logs out
    case INITIATE_CANCEL_REGISTRATION_SUCCESS: // invitee cancels reg
    case CREATE_REG_CART_SUCCESS: // When a fresh reg cart is created
    case CREATE_PLACEHOLDER_REG_CART_SUCCESS: // When an embedded reg temp cart is created
    case RESTORE_PARTIAL_CART_SUCCESS: // partial cart is restored
      return initialState;
    case UPDATE_CREDIT_CARD:
      return {
        ...state,
        userSession: {
          ...state.userSession,
          creditCard: payload.creditCard
            ? {
                ...payload.creditCard
              }
            : null
        }
      };
    case SET_TRAVEL_ANSWER_FIELD: {
      const { path, value, eventRegistrationId } = action.payload;
      return setIn(state, path, { ...value, eventRegistrationId });
    }
    case REMOVE_TRAVEL_ANSWERS: {
      return {
        ...state,
        userSession: {
          ...state.userSession,
          travelAnswers: {}
        }
      };
    }
    case UPDATE_TRAVEL_ANSWERS: {
      return {
        ...state,
        userSession: {
          ...state.userSession,
          travelAnswers: payload.updatedAnswers
        }
      };
    }
    default:
      return state;
  }
}
