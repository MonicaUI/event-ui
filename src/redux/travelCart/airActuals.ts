import uuid from 'uuid';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import { getDateOnlyString } from 'event-widgets/utils/dateUtils';
import { isEqual } from 'lodash';
import { hasTravel, getEventRegistration as getEventRegistrationRegCart } from '../registrationForm/regCart/selectors';
import { getRegCart } from '../selectors/shared';
import { getTravelBookingsForCurrentRegistrantAndGuests, getTravelCart } from './selectors';
import { getEventRegistration } from '../selectors/currentRegistrant';
import { AIR_ACTUAL_SOURCE_TYPE } from 'event-widgets/utils/travelConstants';

/**
 * Adds or updates the given air actuals in the passed existing travel bookings
 * @param {*} existingTravelBookings The existing travel bookings array
 * @param {*} requestedAirActual The air actuals to add/update
 * @param {*} eventRegistrationId The event reg id for the registrant against whom bookings are being added/updated
 * @returns {Array}
 */
export function getUpdatedTravelBookingsForAirActuals(
  existingTravelBookings: $TSFixMe,
  requestedAirActual: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe {
  const requestedBooking = getAirActualWithId(requestedAirActual);
  // if there are no air actuals in travel booking, then set the air actuals and return
  if (!existingTravelBookings.length) {
    return [
      {
        id: eventRegistrationId,
        airActuals: [...addAirActualToList([], requestedBooking)]
      }
    ];
  }
  const existingTravelBooking = existingTravelBookings.find(booking => booking.id === eventRegistrationId);
  // existing booking for current reg id.
  if (existingTravelBooking) {
    const existingAirActuals = existingTravelBooking.airActuals || [];
    let newAirActuals;
    if (existingAirActuals.length > 0) {
      /*
       * check if the updated booking exists in the initialBookings list,
       * if yes, get using id and update, else add
       */
      let existingAirActual;
      if (existingAirActuals.length) {
        existingAirActual = existingAirActuals.find(airData => {
          return airData.id === requestedBooking.id;
        });
      }

      if (existingAirActual) {
        newAirActuals = updateSpecificAirActualInList(existingAirActuals, requestedBooking, existingAirActual);
      } else {
        // this might be a case when existing booking is a cancelled one and user is trying to add a new one
        newAirActuals = addAirActualToList(existingAirActuals, requestedBooking);
      }
    } else {
      // no air actuals exist, simply add the new booking to a blank list
      newAirActuals = [...addAirActualToList([], requestedBooking)];
    }
    return [
      ...existingTravelBookings.filter(travelBooking => travelBooking.id !== eventRegistrationId),
      {
        ...existingTravelBooking,
        requestedAction: REQUESTED_ACTION.BOOK,
        airActuals: newAirActuals
      }
    ];
  }
  // if new booking for current reg id
  return [
    ...existingTravelBookings.filter(travelBooking => travelBooking.id !== eventRegistrationId),
    {
      id: eventRegistrationId,
      airActuals: [...addAirActualToList([], requestedBooking)]
    }
  ];
}

/**
 * Append unique keys to airActual object and flight details object
 * @param {*} requestedAirActual
 * @returns {Object}
 */
function getAirActualWithId(requestedAirActual) {
  return {
    ...requestedAirActual,
    id: requestedAirActual.id || String(uuid.v4()),
    flightDetails: requestedAirActual.flightDetails.map(flightDetail => {
      return {
        ...flightDetail,
        id: flightDetail.id || String(uuid.v4())
      };
    })
  };
}

/**
 * Append existing airActuals to new booking
 * @param {Array<Object>} airActuals
 * @param {Object} newBooking
 * @returns {Array}
 */
function addAirActualToList(airActuals, newBooking) {
  return [
    ...airActuals,
    {
      ...newBooking,
      requestedAction: REQUESTED_ACTION.BOOK,
      flightDetails: newBooking.flightDetails.map(flightDetail => {
        return {
          ...flightDetail,
          requestedAction: REQUESTED_ACTION.BOOK
        };
      })
    }
  ];
}

/**
 * sets requested action property and computes final set of flights for an air actual
 * @param requestedFlightDetails
 * @param existingFlightDetails
 * @returns {Array}
 */
function getUpdatedFlightDetails(requestedFlightDetails, existingFlightDetails) {
  const updatedFlightDetails = [];

  // Add to be cancelled flights (flights that were present in existing but are not present in requested)
  existingFlightDetails.forEach(existingFlight => {
    if (
      existingFlight.airReservationActualDetailId &&
      !requestedFlightDetails.find(flight => flight.id === existingFlight.id)
    ) {
      updatedFlightDetails.push({
        ...existingFlight,
        requestedAction: REQUESTED_ACTION.CANCEL
      });
    }
  });

  // Add modified and new flights (flights present in both requested and existing, flights newly added in requested)
  requestedFlightDetails.forEach(requestedFlight => {
    const existingFlight = existingFlightDetails.find(flight => flight.id === requestedFlight.id);
    const { requestedAction, ...existingFlightWithoutAction } = existingFlight || {
      requestedAction: REQUESTED_ACTION.BOOK
    };

    const isModified =
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      existingFlight &&
      existingFlight.airReservationActualDetailId &&
      !isEqual(existingFlightWithoutAction, requestedFlight);

    /**
     * flight can have three types of requested action
     * 1. can be a modified flight
     * 2. can have same status as existing flight
     * 3. can be a new flight
     */
    updatedFlightDetails.push({
      ...requestedFlight,
      requestedAction: isModified ? REQUESTED_ACTION.MODIFY : requestedAction
    });
  });

  return updatedFlightDetails;
}

/**
 * Update specific air actual data
 * @param {Array<Object>} airActuals, air actuals already in cart
 * @param {Object} requestedAirActual, air actual requested
 * @param {Object} existingAirActual, specific air actual in cart
 * @returns {Array}
 */
function updateSpecificAirActualInList(airActuals, requestedAirActual, existingAirActual) {
  return [
    ...airActuals.filter(b => b.id !== existingAirActual.id),
    {
      ...requestedAirActual,
      flightDetails: getUpdatedFlightDetails(requestedAirActual.flightDetails, existingAirActual.flightDetails),
      requestedAction: requestedAirActual.airReservationActualId ? REQUESTED_ACTION.MODIFY : REQUESTED_ACTION.BOOK
    }
  ];
}

/**
 * Updating airActual dates before sending to backend
 * @param {Object} booking
 * @returns {Object}
 */
function transformAirActualsDates(booking) {
  const newBooking = {
    ...booking,
    flightDetails: booking.flightDetails.map(flightDetail => {
      return {
        ...flightDetail,
        departureDate: getDateOnlyString(flightDetail.departureDate),
        arrivalDate: getDateOnlyString(flightDetail.arrivalDate)
      };
    })
  };
  return newBooking;
}

/**
 * Updating airActual data before sending to backend
 * @param {Array<Object>} airActuals
 * @returns {Array}
 */
export function transformAirActuals(airActuals: $TSFixMe): $TSFixMe {
  if (!airActuals) {
    return [];
  }
  return airActuals.map(booking => {
    return transformAirActualsDates(booking);
  });
}

/**
 * Returns airActual id from existing and new bookings
 * @param {Array} oldTravelBookings
 * @param {Array} newTravelBookings
 * @param {string} eventRegistrationId
 * @returns {string}
 */
export function getNewAirActualId(
  oldTravelBookings = [],
  newTravelBookings: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe {
  const oldBooking = oldTravelBookings.find(booking => booking.id === eventRegistrationId) || {};
  const newBooking = newTravelBookings.find(booking => booking.id === eventRegistrationId);

  const oldAirActualIds =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (oldBooking.airActuals &&
      oldBooking.airActuals.map(booking => {
        return booking.id;
      })) ||
    [];
  const newAirActualIds =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    newBooking.airActuals &&
    newBooking.airActuals.map(booking => {
      return booking.id;
    });

  return newAirActualIds.filter(id => !oldAirActualIds.includes(id))[0];
}

/**
 * updates travel bookings by removing the airActuals to be cancelled
 * @param initialTravelBookings
 * @param {Array<Object>} airActualsToCancel
 * @returns {Array<Object>}, updated travel bookings
 */
export function removeAirActuals(initialTravelBookings: $TSFixMe, airActualsToCancel: $TSFixMe): $TSFixMe {
  const travelBookingIdsToUpdate = airActualsToCancel.map(a => a.attendeeRegistrationId);
  const updatedTravelBookings = initialTravelBookings
    .filter(booking => travelBookingIdsToUpdate.includes(booking.id))
    .map(booking => {
      const airActualsToCancelIds = airActualsToCancel
        .filter(a => a.attendeeRegistrationId === booking.id)
        .map(a => a.id);
      return {
        ...booking,
        airActuals: [
          ...booking.airActuals.filter(a => !airActualsToCancelIds.includes(a.id)),
          ...booking.airActuals
            .filter(a => a.airReservationActualId && airActualsToCancelIds.includes(a.id)) // air actuals in sql
            .map(airActual => {
              return {
                ...airActual,
                flightDetails: airActual.flightDetails.map(flight => ({
                  // set cancel for all flights in air actual
                  ...flight,
                  requestedAction: REQUESTED_ACTION.CANCEL
                })),
                requestedAction: REQUESTED_ACTION.CANCEL
              };
            })
        ]
      };
    });
  return [
    ...initialTravelBookings.filter(booking => !travelBookingIdsToUpdate.includes(booking.id)),
    ...updatedTravelBookings
  ];
}

/**
 * updates travel bookings by removing the PNR airActuals to be cancelled
 * @param initialTravelBookings
 * @param {Array<Object>} pnrActualsToCancel
 * @returns {Array<Object>}, updated travel bookings
 */
export function removePnrAirActuals(initialTravelBookings: $TSFixMe, pnrActualsToCancel: $TSFixMe): $TSFixMe {
  const travelBookingIdsToUpdate = pnrActualsToCancel.map(a => a.attendeeRegistrationId);
  const updatedTravelBookings = initialTravelBookings
    .filter(booking => travelBookingIdsToUpdate.includes(booking.id))
    .map(booking => {
      return {
        ...booking,
        pnrAirActuals: [
          ...booking.pnrAirActuals.map(pnrAirActual => {
            return {
              ...pnrAirActual,
              flightDetails: pnrAirActual.flightDetails.map(flight => ({
                // set cancel for all flights in air actual
                ...flight,
                requestedAction: REQUESTED_ACTION.CANCEL
              })),
              requestedAction: REQUESTED_ACTION.CANCEL
            };
          })
        ]
      };
    });

  return [
    ...initialTravelBookings.filter(booking => !travelBookingIdsToUpdate.includes(booking.id)),
    ...updatedTravelBookings
  ];
}

/**
 * returns true, if at least one concur booking exists for any of current invitee and its guests
 * @param state
 * @returns {*}
 */
export function currentRegistrantOrGuestsHaveConcurBookings(state: $TSFixMe, eventRegistrationId?: $TSFixMe): $TSFixMe {
  /**
   * We cannot solely rely on hasTravel flag of reg cart as for transient cart we dont set hasTravel and we directly
   * call travel transient end point so a check of loaded travel cart in state would be sufficient in that case.
   */
  // if eventRegistrationId is valid, use the selected event reg. Otherwise get current registrant.
  const currentEventRegId = eventRegistrationId
    ? getEventRegistrationRegCart(getRegCart(state), eventRegistrationId) && eventRegistrationId
    : getEventRegistration(state) && getEventRegistration(state).eventRegistrationId;
  return (
    (hasTravel(getRegCart(state)) || getTravelCart(state)) &&
    currentEventRegId &&
    getTravelBookingsForCurrentRegistrantAndGuests(state, currentEventRegId).find(
      booking => booking.concurAirActuals && booking.concurAirActuals.length > 0
    )
  );
}

/**
 * Get air actuals array for the given travel booking of passed source types
 */
export const getAirActualsFromBooking = (travelBooking: $TSFixMe, sourceTypes: $TSFixMe): $TSFixMe => {
  const airActualList = [];
  // add cvent air actuals
  if (travelBooking && sourceTypes.includes(AIR_ACTUAL_SOURCE_TYPE.CVENT)) {
    airActualList.push(...(travelBooking.airActuals || []));
  }
  // add concur air actuals
  if (travelBooking && sourceTypes.includes(AIR_ACTUAL_SOURCE_TYPE.CONCUR)) {
    airActualList.push(...(travelBooking.concurAirActuals || []));
  }
  // add pnr air actuals
  if (travelBooking && sourceTypes.includes(AIR_ACTUAL_SOURCE_TYPE.PNR)) {
    airActualList.push(...(travelBooking.pnrAirActuals || []));
  }
  return airActualList;
};
