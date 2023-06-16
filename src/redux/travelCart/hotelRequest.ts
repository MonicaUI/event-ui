import uuid from 'uuid';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import { uniq } from 'lodash';
import { getDateOnlyString } from 'event-widgets/utils/dateUtils';

/**
 * called from save room request, when a new booking needs to be saved
 * @param existingTravelBookings
 * @param requestedRoomBookings
 * @returns {[*]}
 */
export function getUpdatedTravelBookings(existingTravelBookings: $TSFixMe, requestedRoomBookings: $TSFixMe): $TSFixMe {
  let travelBookings = [...existingTravelBookings];
  const requestedBookings = [];
  const requestGroupId = String(uuid.v4());
  requestedRoomBookings.forEach(requestedRoomBooking => {
    requestedBookings.push(getHotelRoomBookingWithId(requestedRoomBooking, requestGroupId));
  });

  requestedBookings.forEach(requestedBooking => {
    const existingTravelBooking = travelBookings.find(
      booking => booking.id === requestedBooking.preferences.hotelAttendeeRegistrationId
    );
    // existing booking for current reg id.
    if (existingTravelBooking) {
      travelBookings = addHotelRoomBookingToExistingTravelBooking(
        travelBookings,
        existingTravelBooking,
        requestedBooking
      );
    } else {
      // if new booking for current reg id
      travelBookings = addHotelRoomBookingToNewTravelBooking(travelBookings, requestedBooking);
    }
  });
  return travelBookings;
}

/**
 * removes the rooms selected in case of clear selection
 * @param {*} initialTravelBookings
 * @param {*} roomRequestsToCancel
 */
export function removeRoomsSelected(initialTravelBookings: $TSFixMe, roomRequestsToCancel: $TSFixMe): $TSFixMe {
  const travelBookingIdsToUpdate = uniq(roomRequestsToCancel.map(h => h.attendeeRegistrationId));
  return [
    ...initialTravelBookings.filter(booking => !travelBookingIdsToUpdate.includes(booking.id)),
    ...initialTravelBookings
      .filter(booking => travelBookingIdsToUpdate.includes(booking.id))
      .map(booking => {
        const toCancel = roomRequestsToCancel.filter(h => h.attendeeRegistrationId === booking.id).map(h => h.id);
        return {
          ...booking,
          hotelRoomBookings: [
            ...booking.hotelRoomBookings.filter(h => !toCancel.includes(h.id)),
            ...booking.hotelRoomBookings
              .filter(h => h.hotelReservationDetailId && toCancel.includes(h.id)) // those not already in sql
              .map(hotelRoomBooking => ({
                ...hotelRoomBooking,
                requestedAction: REQUESTED_ACTION.CANCEL // those already in sql
              }))
          ]
        };
      })
  ];
}

/**
 * Adds unique ids to the hotel room booking
 * @param {*} requestedRoomBooking
 * @param {*} requestGroupId
 */
function getHotelRoomBookingWithId(requestedRoomBooking, requestGroupId) {
  return {
    ...requestedRoomBooking,
    id: requestedRoomBooking.id || String(uuid.v4()),
    requestGroupId: requestedRoomBooking.requestGroupId || requestGroupId
  };
}

/**
 * adds the object newBooking to hotelRoomBookings
 * @param hotelRoomBookings
 * @param newBooking
 * @returns {[*,*]}
 */
function addHotelRoomBookingToList(hotelRoomBookings, newBooking) {
  const updatedHotelRoomBookings = [
    ...hotelRoomBookings,
    {
      ...newBooking,
      requestedAction: REQUESTED_ACTION.BOOK,
      quantity: 1
    }
  ];
  return updatedHotelRoomBookings;
}

/**
 * Merge the existing booking and new booking and then update the hotelRoomBookings list with the merged object
 * @param {*} hotelRoomBookings list of room bookings to update the merged object in
 * @param {*} newBooking New booking object
 * @param {*} existingRoomBooking Existing booking object
 */
function updateBookingListAfterMergingNewExistingBooking(hotelRoomBookings, newBooking, existingRoomBooking) {
  let requestedAction;
  if (existingRoomBooking.hotelReservationDetailId) {
    requestedAction = newBooking.isDeleted ? REQUESTED_ACTION.CANCEL : REQUESTED_ACTION.MODIFY;
  } else {
    if (newBooking.isDeleted) {
      return [...hotelRoomBookings.filter(b => b.id !== newBooking.id)];
    }
    requestedAction = REQUESTED_ACTION.BOOK;
  }
  return [
    ...hotelRoomBookings.filter(b => b.id !== newBooking.id),
    { ...existingRoomBooking, ...newBooking, requestedAction }
  ];
}

function addHotelRoomBookingToExistingTravelBooking(travelBookings, existingTravelBooking, requestedRoomBooking) {
  const existingHotelRoomBookings = existingTravelBooking.hotelRoomBookings || [];
  let newHotelRoomBookings;
  if (existingHotelRoomBookings.length > 0) {
    /*
     * check if the updated booking exists in the initialBookings list,
     * if yes, get using id and update, else add
     */
    const existingRoomBooking = existingHotelRoomBookings.find(roomData => {
      return roomData.id === requestedRoomBooking.id;
    });

    if (existingRoomBooking) {
      newHotelRoomBookings = updateBookingListAfterMergingNewExistingBooking(
        existingHotelRoomBookings,
        requestedRoomBooking,
        existingRoomBooking
      );
    } else {
      // this might be a case when existing booking is a cancelled one and user is trying to add a new one
      newHotelRoomBookings = addHotelRoomBookingToList(existingHotelRoomBookings, requestedRoomBooking);
    }
  } else {
    // no hotel bookings exist, simply add the new booking to a blank list
    newHotelRoomBookings = [...addHotelRoomBookingToList([], requestedRoomBooking)];
  }
  return [
    ...travelBookings.filter(
      travelBooking => travelBooking.id !== requestedRoomBooking.preferences.hotelAttendeeRegistrationId
    ),
    { ...existingTravelBooking, requestedAction: REQUESTED_ACTION.BOOK, hotelRoomBookings: newHotelRoomBookings }
  ];
}

function addHotelRoomBookingToNewTravelBooking(travelBookings, requestedRoomBooking) {
  return [
    ...travelBookings.filter(
      travelBooking => travelBooking.id !== requestedRoomBooking.preferences.hotelAttendeeRegistrationId
    ),
    {
      id: requestedRoomBooking.preferences.hotelAttendeeRegistrationId,
      hotelRoomBookings: [...addHotelRoomBookingToList([], requestedRoomBooking)]
    }
  ];
}

/**
 * Updating checkinDate and checkoutDate from UTC date to event timezone's date
 * @param {Object} booking
 * @returns {Object}
 */
function transformHotelRoomBookingsDates(booking) {
  const newBooking = { ...booking };
  if (booking.checkinDate) {
    newBooking.checkinDate = getDateOnlyString(booking.checkinDate);
  }
  if (booking.checkoutDate) {
    newBooking.checkoutDate = getDateOnlyString(booking.checkoutDate);
  }
  return newBooking;
}

/**
 * Transforming hotelRoomBookings
 * @param {Array<Object>} hotelRoomBookings
 * @returns {Array<Object>}
 */
export function transformHotelRoomBookings(hotelRoomBookings = []): $TSFixMe {
  return hotelRoomBookings.map(booking => {
    return transformHotelRoomBookingsDates(booking);
  });
}
