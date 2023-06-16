import { getLocalDateFromEventDateString } from 'event-widgets/utils/dateUtils';
import { transformCreditCardToAccountCardType } from 'event-widgets/utils/creditCardUtils';
import {
  RESTORE_TRAVEL_CART,
  UPDATE_TRAVEL_CART_SUCCESS,
  TRAVEL_CART_NOT_FOUND,
  SET_AIR_REQUEST_SUMMARY_VIEW,
  SET_AIR_ACTUAL_SUMMARY_VIEW,
  CLEAR_USER_SESSION_DATA,
  TOGGLE_OWN_AIR_TRAVEL_RESERVATION,
  SEARCH_ROOMMATE_SUCCESS,
  TOGGLE_OWN_HOTEL_ACCOMMODATION,
  UPDATE_CREDIT_CARD,
  RESET_USER_SESSION_TRAVEL_DATA,
  SET_EXPANDED_HOTELS,
  SET_ANOTHER_HOTEL_REQUEST,
  SET_HOTEL_REQUEST_SUMMARY_VIEW,
  SET_ROOMMATE_DATA,
  REMOVE_TRAVEL_ANSWERS,
  SET_GROUP_FLIGHT_SUMMARY_VIEW,
  UPDATE_TRAVEL_ANSWERS
} from './actionTypes';

const transformHotelRoomBookings = (roomBooking, id) => {
  const hotelRoomBooking = { ...roomBooking };
  hotelRoomBooking.attendeeRegistrationId = id;
  hotelRoomBooking.checkinDate = getLocalDateFromEventDateString(hotelRoomBooking.checkinDate);
  hotelRoomBooking.checkoutDate = getLocalDateFromEventDateString(hotelRoomBooking.checkoutDate);
  if (hotelRoomBooking.confirmedCheckinDate) {
    hotelRoomBooking.confirmedCheckinDate = getLocalDateFromEventDateString(hotelRoomBooking.confirmedCheckinDate);
  }
  if (hotelRoomBooking.confirmedCheckoutDate) {
    hotelRoomBooking.confirmedCheckoutDate = getLocalDateFromEventDateString(hotelRoomBooking.confirmedCheckoutDate);
  }
  if (hotelRoomBooking.originalCheckinDate) {
    hotelRoomBooking.originalCheckinDate = getLocalDateFromEventDateString(hotelRoomBooking.originalCheckinDate);
  }
  if (hotelRoomBooking.originalCheckoutDate) {
    hotelRoomBooking.originalCheckoutDate = getLocalDateFromEventDateString(hotelRoomBooking.originalCheckoutDate);
  }
  if (hotelRoomBooking.originalConfirmedCheckinDate) {
    hotelRoomBooking.originalConfirmedCheckinDate = getLocalDateFromEventDateString(
      hotelRoomBooking.originalConfirmedCheckinDate
    );
  }
  if (hotelRoomBooking.originalConfirmedCheckoutDate) {
    hotelRoomBooking.originalConfirmedCheckoutDate = getLocalDateFromEventDateString(
      hotelRoomBooking.originalConfirmedCheckoutDate
    );
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (hotelRoomBooking.plannerFields && hotelRoomBooking.plannerFields.plannerConfirmedCheckinDate) {
    hotelRoomBooking.plannerFields.plannerConfirmedCheckinDate = getLocalDateFromEventDateString(
      hotelRoomBooking.plannerFields.plannerConfirmedCheckinDate
    );
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (hotelRoomBooking.plannerFields && hotelRoomBooking.plannerFields.plannerConfirmedCheckoutDate) {
    hotelRoomBooking.plannerFields.plannerConfirmedCheckoutDate = getLocalDateFromEventDateString(
      hotelRoomBooking.plannerFields.plannerConfirmedCheckoutDate
    );
  }
  return hotelRoomBooking;
};

const transformAirActuals = airActual => {
  return {
    ...airActual,
    flightDetails: airActual.flightDetails.map(flightDetail => {
      return {
        ...flightDetail,
        arrivalDate: getLocalDateFromEventDateString(flightDetail.arrivalDate),
        departureDate: getLocalDateFromEventDateString(flightDetail.departureDate)
      };
    })
  };
};

const transformAirBookings = (airBooking, id) => {
  const airRequestBooking = { ...airBooking };
  const {
    departureDate = '',
    returnDate = '',
    travellerInfo: { dateOfBirth = '' }
  } = airRequestBooking;
  airRequestBooking.attendeeRegistrationId = id;
  airRequestBooking.departureDate = departureDate ? getLocalDateFromEventDateString(departureDate) : '';
  airRequestBooking.returnDate = returnDate ? getLocalDateFromEventDateString(returnDate) : '';
  airRequestBooking.travellerInfo.dateOfBirth = dateOfBirth ? getLocalDateFromEventDateString(dateOfBirth) : '';
  return airRequestBooking;
};

/**
 * Transforms the travel cart response before setting into the redux state
 * @param {Object} travelCart
 * @returns {Object}
 */
function transformCartResponse(travelCart) {
  const updatedTravelCart = { ...travelCart };
  if (updatedTravelCart) {
    updatedTravelCart.bookings = updatedTravelCart.bookings.map(booking => {
      const travelbooking = { ...booking };
      if (travelbooking.hotelRoomBookings) {
        travelbooking.hotelRoomBookings = travelbooking.hotelRoomBookings.map(hrb =>
          transformHotelRoomBookings(hrb, booking.id)
        );
      }
      if (travelbooking.airBookings) {
        travelbooking.airBookings = travelbooking.airBookings.map(ab => transformAirBookings(ab, booking.id));
      }
      if (travelbooking.airActuals) {
        travelbooking.airActuals = travelbooking.airActuals.map(transformAirActuals);
      }
      if (travelbooking.concurAirActuals) {
        travelbooking.concurAirActuals = travelbooking.concurAirActuals.map(transformAirActuals);
      }
      if (travelbooking.pnrAirActuals) {
        travelbooking.pnrAirActuals = travelbooking.pnrAirActuals.map(transformAirActuals);
      }
      if (travelbooking.groupFlightBookings) {
        travelbooking.groupFlightBookings = travelbooking.groupFlightBookings.map(gfb => {
          return { ...gfb, attendeeRegistrationId: booking.id };
        });
      }
      /*
       * when we delete credit card from UI on reg mod, it can be empty object from service
       * since there is card token in credit card which is internal field so the object is not null
       */
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (travelbooking.creditCard && travelbooking.creditCard.creditCardDetails) {
        travelbooking.creditCard = {
          ...travelbooking.creditCard,
          creditCardDetails: {
            ...travelbooking.creditCard.creditCardDetails,
            cardType: transformCreditCardToAccountCardType(travelbooking.creditCard.creditCardDetails.cardType)
          }
        };
      }
      return travelbooking;
    });
  }
  return updatedTravelCart;
}

export function travelCartUpdated(travelCart: $TSFixMe): $TSFixMe {
  return {
    type: UPDATE_TRAVEL_CART_SUCCESS,
    payload: { travelCart: transformCartResponse(travelCart) }
  };
}

export function updateUnsavedCreditCard(creditCard: $TSFixMe): $TSFixMe {
  return {
    type: UPDATE_CREDIT_CARD,
    payload: { creditCard }
  };
}

export function restoreTravelCartState(travelCartState: $TSFixMe): $TSFixMe {
  return {
    type: RESTORE_TRAVEL_CART,
    payload: travelCartState
  };
}

export function travelCartNotFound(travelCartId: $TSFixMe): $TSFixMe {
  return {
    type: TRAVEL_CART_NOT_FOUND,
    payload: { travelCartId }
  };
}

/**
 * Toggle ownAccommodation flag
 * @returns {{type: string, payload: {}}}
 */
export const toggleOwnAccommodation = (currentRegistrationId: $TSFixMe): $TSFixMe => {
  return {
    type: TOGGLE_OWN_HOTEL_ACCOMMODATION,
    payload: {
      currentRegistrationId
    }
  };
};

/**
 * Toggle ownReservation flag for air
 * @returns {{type: string, payload: {}}}
 */
export const toggleOwnAirTravelReservation = (): $TSFixMe => {
  return {
    type: TOGGLE_OWN_AIR_TRAVEL_RESERVATION,
    payload: {}
  };
};

/**
 * Clear user session data in the travel related state object
 */
export const clearUserSessionData = (): $TSFixMe => {
  return {
    type: CLEAR_USER_SESSION_DATA,
    payload: {}
  };
};

/**
 * To update showSummary flag in state
 * @param {boolean} showSummary
 * @returns {{type: string, payload: { showSummary: boolean }}}
 */
export const showAirTravelSummaryView = (showSummary: $TSFixMe): $TSFixMe => {
  return {
    type: SET_AIR_REQUEST_SUMMARY_VIEW,
    payload: {
      showSummary
    }
  };
};

/**
 * To reset travel widgets summary view in session
 * @returns {{payload: {}, type: string}}
 */
export const resetTravelWidgetsSummaryView = (): $TSFixMe => {
  return {
    type: RESET_USER_SESSION_TRAVEL_DATA,
    payload: {}
  };
};

/**
 * To update showSummary flag in state
 * @param {boolean} showSummary
 * @returns {{type: string, payload: { showSummary: boolean }}}
 */
export const showHotelRequestSummaryView = (showSummary: $TSFixMe): $TSFixMe => {
  return {
    type: SET_HOTEL_REQUEST_SUMMARY_VIEW,
    payload: {
      showSummary
    }
  };
};

/**
 * To update expanded hotels in state
 * @param expandedHotels
 * @returns {{payload: {expandedHotels: *}, type: string}}
 */
export const updateExpandedHotels = (expandedHotels: $TSFixMe): $TSFixMe => {
  return {
    type: SET_EXPANDED_HOTELS,
    payload: {
      expandedHotels
    }
  };
};

/**
 * To set if making another request is in progress
 * @returns {{payload: {}, type: string}}
 */
export const setAnotherHotelRequestFlag = (isMakingAnotherRequest: $TSFixMe): $TSFixMe => {
  return {
    type: SET_ANOTHER_HOTEL_REQUEST,
    payload: { isMakingAnotherRequest }
  };
};

/**
 * To update showSummary flag in state
 * @param {boolean} showSummary
 * @returns {{type: string, payload: { showSummary: boolean }}}
 */
export const toggleAirActualSummaryView = (showSummary: $TSFixMe): $TSFixMe => {
  return {
    type: SET_AIR_ACTUAL_SUMMARY_VIEW,
    payload: {
      showSummary
    }
  };
};

export const toggleGroupFlightSummaryView = (showSummary: $TSFixMe): $TSFixMe => {
  return {
    type: SET_GROUP_FLIGHT_SUMMARY_VIEW,
    payload: {
      showSummary
    }
  };
};

/**
 * To set roommate date in state
 */
export const setRoommateData = ({ requestedFrom = [], availableRoommates = [] } = {}): $TSFixMe => {
  return {
    type: SET_ROOMMATE_DATA,
    payload: {
      requestedFrom,
      availableRoommates
    }
  };
};

export function setRoommateSearch(searchText: $TSFixMe, roommates: $TSFixMe): $TSFixMe {
  return { type: SEARCH_ROOMMATE_SUCCESS, payload: { searchText, roommates } };
}

/**
 * To remove all travel answers from userSession
 */
export const removeUnSavedTravelAnswers = (): $TSFixMe => {
  return {
    type: REMOVE_TRAVEL_ANSWERS
  };
};

export const updateTravelAnswersInUserSession = (updatedAnswers: $TSFixMe): $TSFixMe => {
  return {
    type: UPDATE_TRAVEL_ANSWERS,
    payload: {
      updatedAnswers
    }
  };
};
