import { getIn } from 'icepick';
import { getGuestsRegistrationIdsOfRegistrant } from '../registrationForm/regCart/selectors';
import { getRegCart } from '../selectors/shared';

export const getTravelRegForm = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['travelCart']);
};

/**
 * gets the actual travel cart object from the travel cart/form wrapper state object
 * @param state
 * @returns {*}
 */
export const getTravelCart = (state: $TSFixMe): $TSFixMe => {
  const travelForm = getTravelRegForm(state);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return travelForm && travelForm.cart;
};

/**
 * gets you all the travel bookings from the actual travel cart
 * @param travelCart
 * @returns {*|Array}
 */
export const getTravelBookings = (travelCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (travelCart && travelCart.bookings) || [];
};

/**
 * gets all the travel bookings filtered by the given event registrations
 * @param state
 * @param eventRegistrationIds
 * @returns {Array}
 */
export function getTravelBookingsByEventRegistrations(state: $TSFixMe, eventRegistrationIds: $TSFixMe): $TSFixMe {
  const travelBookings = getIn(state, ['travelCart', 'cart', 'bookings']) || [];
  return travelBookings.filter(booking => eventRegistrationIds.includes(booking.id));
}

/**
 * Get the travel bookings for the current registrant and its registered guests
 */
export function getTravelBookingsForCurrentRegistrantAndGuests(
  state: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe {
  const guestRegIds = getGuestsRegistrationIdsOfRegistrant(getRegCart(state), eventRegistrationId);
  return getTravelBookingsByEventRegistrations(state, [eventRegistrationId, ...guestRegIds]);
}

export const getTravelCartSnapshotVersion = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['travelCart', 'cart', 'travelSnapshotVersion']);
};

export const getTravelBooking = (travelCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  return getTravelBookings(travelCart).find(b => b.id === eventRegistrationId);
};

export const getHotelRoomBookings = (travelCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const travelBooking = getTravelBooking(travelCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (travelBooking && travelBooking.hotelRoomBookings) || [];
};

/**
 * get hotel room bookings with request action = `BOOK`
 */
export const getActiveHotelRoomBookings = (travelCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const travelBooking = getTravelBooking(travelCart, eventRegistrationId);
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking &&
      travelBooking.hotelRoomBookings &&
      travelBooking.hotelRoomBookings.filter(b => b.requestedAction === 'BOOK')) ||
    []
  );
};

export const getActivePasskeyBookings = (
  isPasskeyEnabled: $TSFixMe,
  travelCart: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe => {
  return (
    isPasskeyEnabled && getHotelRoomBookings(travelCart, eventRegistrationId).filter(b => b.requestedAction === 'BOOK')
  );
};

export const getAllHotelRoomBookings = (travelCart: $TSFixMe): $TSFixMe => {
  const bookings = getTravelBookings(travelCart);
  const hotelRoomBookings = [];
  bookings.forEach(b => b.hotelRoomBookings && hotelRoomBookings.push(...b.hotelRoomBookings));
  return hotelRoomBookings;
};

/**
 * Get event travel snapshot version
 * @param state
 * @returns event travel snapshot version
 */
export const getTravelSnapshotVersion = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['eventTravel', 'travelSnapshotVersion']);
};
