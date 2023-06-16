import uuid from 'uuid';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import { uniq } from 'lodash';

/**
 * Method to save the given group flight bookings into the corresponding existing travel bookings
 */
export function getUpdatedTravelBookings(
  existingTravelBookings: $TSFixMe,
  requestedFlightBookings: $TSFixMe
): $TSFixMe {
  let travelBookings = [...existingTravelBookings];
  const requestedBookings = [];
  requestedFlightBookings.forEach(requestedFlightBooking => {
    requestedBookings.push(getFlightBookingWithId(requestedFlightBooking));
  });

  requestedBookings.forEach(requestedBooking => {
    const existingTravelBooking = travelBookings.find(
      booking => booking.id === requestedBooking.attendeeRegistrationId
    );
    // existing booking for current reg id.
    if (existingTravelBooking) {
      travelBookings = addFlightBookingToExistingTravelBooking(travelBookings, existingTravelBooking, requestedBooking);
    } else {
      // if new booking for current reg id
      travelBookings = addFlightBookingToNewTravelBooking(travelBookings, requestedBooking);
    }
  });
  return travelBookings;
}

/**
 * Removes the group flight bookings from the travel bookings
 */
export function removeGroupFlightRequests(
  initialTravelBookings: $TSFixMe,
  groupFlightBookingsToCancel: $TSFixMe
): $TSFixMe {
  const travelBookingIdsToUpdate = uniq(groupFlightBookingsToCancel.map(a => a.attendeeRegistrationId));
  return [
    ...initialTravelBookings.filter(booking => !travelBookingIdsToUpdate.includes(booking.id)),
    ...initialTravelBookings
      .filter(booking => travelBookingIdsToUpdate.includes(booking.id))
      .map(booking => {
        const toCancel = groupFlightBookingsToCancel
          .filter(a => a.attendeeRegistrationId === booking.id)
          .map(a => a.id);
        return {
          ...booking,
          groupFlightBookings: [
            ...booking.groupFlightBookings.filter(a => !toCancel.includes(a.id)),
            ...booking.groupFlightBookings
              .filter(a => a.airReservationActualId && toCancel.includes(a.id)) // those not already in sql
              .map(groupFlightBooking => ({
                ...groupFlightBooking,
                requestedAction: REQUESTED_ACTION.CANCEL // those already in sql
              }))
          ]
        };
      })
  ];
}

function addFlightBookingToExistingTravelBooking(travelBookings, existingTravelBooking, requestedFlightBooking) {
  const existingFlightBookings = existingTravelBooking.groupFlightBookings || [];
  let newFlightBookings;
  if (existingFlightBookings.length > 0) {
    /*
     * check if the updated booking exists in the initialBookings list,
     * if yes, get using id and update, else add
     */
    const existingFlightBooking = existingFlightBookings.find(flight => {
      return flight.id === requestedFlightBooking.id;
    });

    if (existingFlightBooking) {
      newFlightBookings = updateSpecificFlightBookingInList(
        existingFlightBookings,
        requestedFlightBooking,
        existingFlightBooking.id
      );
    } else {
      // this might be a case when existing booking is a cancelled one and user is trying to add a new one
      newFlightBookings = addFlightBookingToList(existingFlightBookings, requestedFlightBooking);
    }
  } else {
    // no group flight bookings exist, simply add the new booking to a blank list
    newFlightBookings = [...addFlightBookingToList([], requestedFlightBooking)];
  }
  return [
    ...travelBookings.filter(travelBooking => travelBooking.id !== requestedFlightBooking.attendeeRegistrationId),
    { ...existingTravelBooking, requestedAction: REQUESTED_ACTION.BOOK, groupFlightBookings: newFlightBookings }
  ];
}

function updateSpecificFlightBookingInList(flightBookings, newBooking, existingFlightBookingId) {
  return [
    ...flightBookings.filter(b => b.id !== existingFlightBookingId),
    {
      ...newBooking,
      requestedAction: newBooking.airReservationActualId ? REQUESTED_ACTION.MODIFY : REQUESTED_ACTION.BOOK
    }
  ];
}

function addFlightBookingToNewTravelBooking(travelBookings, requestedFlightBooking) {
  return [
    ...travelBookings.filter(travelBooking => travelBooking.id !== requestedFlightBooking.attendeeRegistrationId),
    {
      id: requestedFlightBooking.attendeeRegistrationId,
      groupFlightBookings: [...addFlightBookingToList([], requestedFlightBooking)]
    }
  ];
}

function getFlightBookingWithId(requestedFlightBooking) {
  return {
    ...requestedFlightBooking,
    id: requestedFlightBooking.id || String(uuid.v4())
  };
}

function addFlightBookingToList(flightBookings, newBooking) {
  const updatedFlightBookings = [
    ...flightBookings,
    {
      ...newBooking,
      requestedAction: REQUESTED_ACTION.BOOK
    }
  ];
  return updatedFlightBookings;
}
