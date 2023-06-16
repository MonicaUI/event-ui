import { getTravelCart } from '../redux/travelCart/selectors';
import { nonCancelledFilter } from './travelUtils';
import { getGroupLeaderAttendeeId } from '../redux/registrationForm/regCart/selectors';

/**
 * Returns whether any type of booking including concur and pnr is present in the travel cart
 */
export function hasAnyValidBookingIncludingConcurAndPnr(state: $TSFixMe): $TSFixMe {
  const cart = getTravelCart(state);
  const groupLeaderAttendeeId = getGroupLeaderAttendeeId(state.registrationForm.regCart);
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    cart && cart.bookings && cart.bookings.length > 0 && hasAnyActiveBookings(groupLeaderAttendeeId, cart.bookings)
  );
}

/**
 * Checks if group leader is present or not and Returns whether any active valid booking is present for the 2 cases
 * If group leader is present it checks active valid bookings for him and its guests only.
 * @param state
 * @param bookings
 */
function hasAnyActiveBookings(groupLeaderAttendeeId, bookings) {
  let activeBookings = bookings;
  if (groupLeaderAttendeeId) {
    activeBookings = bookings.filter(
      booking =>
        booking.attendee.id === groupLeaderAttendeeId ||
        (booking.attendee.type === 'GUEST' && booking.attendee.primaryInviteeId === groupLeaderAttendeeId)
    );
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return activeBookings && activeBookings.some(booking => checkForValidBookings(booking));
}

/**
 * Returns True for any type of valid bookings present else returns false
 * @param booking
 */
function checkForValidBookings(booking) {
  return (
    booking &&
    (hasAnyBookings(booking.hotelRoomBookings) ||
      hasAnyBookings(booking.airBookings) ||
      hasAnyBookings(booking.airActuals) ||
      hasAnyBookings(booking.groupFlightBookings) ||
      hasAnyBookings(booking.concurAirActuals) ||
      hasAnyBookings(booking.pnrAirActuals))
  );
}

/**
 * Returns true if any active booking is present and false only if all bookings have requested action as CANCEL
 * @param bookingsArray
 */
function hasAnyBookings(bookingsArray) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return bookingsArray && bookingsArray.some(nonCancelledFilter);
}
