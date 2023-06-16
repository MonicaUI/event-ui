import uuid from 'uuid';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import { uniq } from 'lodash';
import { getDateOnlyString } from 'event-widgets/utils/dateUtils';

/**
 * Adds or updates the given air booking in the passed existing travel bookings
 * @param {*} existingTravelBookings The existing travel bookings array
 * @param {*} requestedAirBooking The air booking to add/update
 * @param {*} eventRegistrationId The event reg id for the registrant against whom bookings are being added/updated
 * @param {*} attendeeRegTypeId
 * @param {*} selectedAdmissionItemId
 * @returns {Array}
 */
export function getUpdatedTravelBookingsForAirRequests(
  existingTravelBookings: $TSFixMe,
  requestedAirBooking: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe {
  const requestedBooking = getAirBookingWithId(requestedAirBooking);
  // if there are no bookings in travel booking, then set the air bookings and return
  if (!existingTravelBookings.length) {
    return [
      {
        id: eventRegistrationId,
        airBookings: [...addAirBookingToList([], requestedBooking)]
      }
    ];
  }
  const existingTravelBooking = existingTravelBookings.find(booking => booking.id === eventRegistrationId);
  // existing booking for current reg id.
  if (existingTravelBooking) {
    const existingAirBookings = existingTravelBooking.airBookings || [];
    let newAirBookings;
    if (existingAirBookings.length > 0) {
      /*
       * check if the updated booking exists in the initialBookings list,
       * if yes, get using id and update, else add
       */
      let existingAirBooking;
      if (existingAirBookings.length) {
        existingAirBooking = existingAirBookings.find(airData => {
          return airData.id === requestedBooking.id;
        });
      }

      if (existingAirBooking) {
        newAirBookings = updateSpecificAirBookingInList(existingAirBookings, requestedBooking, existingAirBooking.id);
      } else {
        // this might be a case when existing booking is a cancelled one and user is trying to add a new one
        newAirBookings = addAirBookingToList(existingAirBookings, requestedBooking);
      }
    } else {
      // no air bookings exist, simply add the new booking to a blank list
      newAirBookings = [...addAirBookingToList([], requestedBooking)];
    }
    return [
      ...existingTravelBookings.filter(travelBooking => travelBooking.id !== eventRegistrationId),
      {
        ...existingTravelBooking,
        requestedAction: REQUESTED_ACTION.BOOK,
        airBookings: newAirBookings
      }
    ];
  }
  // if new booking for current reg id
  return [
    ...existingTravelBookings.filter(travelBooking => travelBooking.id !== eventRegistrationId),
    {
      id: eventRegistrationId,
      airBookings: [...addAirBookingToList([], requestedBooking)]
    }
  ];
}

function getAirBookingWithId(requestedAirBooking) {
  return {
    ...requestedAirBooking,
    id: requestedAirBooking.id ? requestedAirBooking.id : String(uuid.v4())
  };
}

function addAirBookingToList(airBookings, newBooking) {
  return [
    ...airBookings,
    {
      ...newBooking,
      requestedAction: REQUESTED_ACTION.BOOK
    }
  ];
}

function updateSpecificAirBookingInList(airBookings, newBooking, existingAirBookingId) {
  return [
    ...airBookings.filter(b => b.id !== existingAirBookingId),
    {
      ...newBooking,
      requestedAction: newBooking.airReservationDetailId ? REQUESTED_ACTION.MODIFY : REQUESTED_ACTION.BOOK
    }
  ];
}

/**
 * removes the air requests in case of clear selection
 * @param {Array<Object>} initialTravelBookings
 * @param {Array<Object>} airBookingsToCancel
 * @returns {Array}
 */
export function removeAirRequests(initialTravelBookings: $TSFixMe, airBookingsToCancel: $TSFixMe): $TSFixMe {
  const travelBookingIdsToUpdate = uniq(airBookingsToCancel.map(a => a.attendeeRegistrationId));
  return [
    ...initialTravelBookings.filter(booking => !travelBookingIdsToUpdate.includes(booking.id)),
    ...initialTravelBookings
      .filter(booking => travelBookingIdsToUpdate.includes(booking.id))
      .map(booking => {
        const toCancel = airBookingsToCancel.filter(a => a.attendeeRegistrationId === booking.id).map(a => a.id);
        return {
          ...booking,
          airBookings: [
            ...booking.airBookings.filter(a => !toCancel.includes(a.id)),
            ...booking.airBookings
              .filter(a => a.airReservationDetailId && toCancel.includes(a.id)) // those not already in sql
              .map(airBooking => ({
                ...airBooking,
                requestedAction: REQUESTED_ACTION.CANCEL // those already in sql
              }))
          ]
        };
      })
  ];
}

/**
 * Returns airRequest id from existing and new bookings
 * @param {Array} oldTravelBookings
 * @param {Array} newTravelBookings
 * @param {string} eventRegistrationId
 * @returns {string}
 */
export function getNewAirRequestId(
  oldTravelBookings = [],
  newTravelBookings: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe {
  const oldBooking = oldTravelBookings.find(booking => booking.id === eventRegistrationId) || {};
  const newBooking = newTravelBookings.find(booking => booking.id === eventRegistrationId);

  const oldAirBookingIds =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (oldBooking.airBookings &&
      oldBooking.airBookings.map(booking => {
        return booking.id;
      })) ||
    [];
  const newAirBookingIds =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    newBooking.airBookings &&
    newBooking.airBookings.map(booking => {
      return booking.id;
    });

  return newAirBookingIds.filter(id => !oldAirBookingIds.includes(id))[0];
}

/**
 * Update departure date, return date and dateOfBirth from UTC date to event timezone's date
 * @param {Object} booking
 * @returns {Object}
 */
function transformAirBookingDates(booking) {
  const newBooking = {
    ...booking,
    travellerInfo: {
      ...booking.travellerInfo
    }
  };
  if (booking.departureDate) {
    newBooking.departureDate = getDateOnlyString(booking.departureDate);
  }
  if (booking.returnDate) {
    newBooking.returnDate = getDateOnlyString(booking.returnDate);
  }
  if (booking.travellerInfo.dateOfBirth) {
    newBooking.travellerInfo.dateOfBirth = getDateOnlyString(booking.travellerInfo.dateOfBirth);
  }
  return newBooking;
}
/**
 * Update departure and return date from UTC date to event timezone's date
 * @param {Array<Object>} airBookings
 * @returns {Array}
 */
export function transformAirBookings(airBookings = []): $TSFixMe {
  return airBookings.map(booking => {
    return transformAirBookingDates(booking);
  });
}
