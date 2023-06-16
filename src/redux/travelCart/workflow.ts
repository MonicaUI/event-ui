import { getIn } from 'icepick';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import Logger from '@cvent/nucleus-logging';
import { getRegCart } from '../selectors/shared';
import { isRegApprovalRequired, getAttendeeId, getSelectedAdmissionItem } from '../registrationForm/regCart/selectors';
import { getEventRegistrationId, getRegistrationTypeId } from '../selectors/currentRegistrant';
import { getRegistrationPathIdOrDefault } from '../selectors/currentRegistrationPath';
import {
  getUpdatedTravelBookings as getUpdatedTravelBookingsForRoomRequests,
  removeRoomsSelected
} from './hotelRequest';
import {
  getUpdatedTravelBookings as getUpdatedTravelBookingsForGroupFlightRequests,
  removeGroupFlightRequests
} from './groupFlight';
import { getUpdatedTravelBookingsForAirRequests, removeAirRequests, getNewAirRequestId } from './airRequest';
import {
  getUpdatedTravelBookingsForAirActuals,
  getNewAirActualId,
  removeAirActuals,
  removePnrAirActuals
} from './airActuals';
import { removeTravelAnswers, removeTravelAlternateAnswers, removeAllTravelAnswers } from './travelAnswers';
import { openConfirmationDialog } from '../../dialogs';
import { persistTravelCartAndUpdateState } from './internal';
import {
  toggleOwnAirTravelReservation,
  showAirTravelSummaryView,
  setRoommateSearch,
  toggleAirActualSummaryView,
  setRoommateData,
  toggleGroupFlightSummaryView,
  updateTravelAnswersInUserSession
} from './actions';
import {
  loadHotelsRoomsCapacities,
  loadGroupFlightCapacities,
  REQUESTED_ACTION
} from 'event-widgets/redux/modules/eventTravel';
import { shouldAutoRedirectToConcur } from 'event-widgets/redux/selectors/eventTravel';
import { isWidgetOnPath } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import {
  setSelectedAirRequestId,
  removeSelectedAirRequestIds,
  setSelectedAirActualId,
  removeSelectedAirActualIds,
  removeSelectedGroupFlightIds
} from './external';
import { hasAnyTravelItem } from '../../utils/travelUtils';
import { getEventId } from '../selectors/event';
import { updateTravelFlagInRegCart } from '../registrationForm/regCart';
import * as currentRegistrant from '../selectors/currentRegistrant';
import { filterRoommates as filterRoommatesByKeyword } from 'event-widgets/lib/HotelRequest/utils/LookupRoommateUtil';
import { ROOMMATE_MATCHING_TYPE } from 'event-widgets/utils/travelConstants';
import { RoommateIdType } from 'event-widgets/utils/travelUtils';

const LOG = new Logger('redux/travelCart/workflow');
const MIN_LENGTH_FOR_SEARCH = 3;

const excludeEmptyBookingsFilter = booking =>
  (booking.groupFlightBookings && booking.groupFlightBookings.length > 0) ||
  booking.airBookings.length > 0 ||
  booking.hotelRoomBookings.length > 0 ||
  booking.airActuals.length > 0 ||
  booking.creditCard ||
  (booking.pnrAirActuals && booking.pnrAirActuals.length > 0) ||
  (booking.travelAnswers && booking.travelAnswers.length > 0);

const getAllTravelBookings = (travelBookings = []) => {
  return travelBookings.reduce(
    // eslint-disable-next-line complexity
    (accumulator, tb) => {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (tb && tb.airBookings && tb.airBookings.length) {
        accumulator.airBookings.push(...tb.airBookings.map(ab => ({ ...ab, attendeeRegistrationId: tb.id })));
      }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (tb && tb.hotelRoomBookings && tb.hotelRoomBookings.length) {
        accumulator.hotelRoomBookings.push(
          ...tb.hotelRoomBookings.map(ab => ({ ...ab, attendeeRegistrationId: tb.id }))
        );
      }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (tb && tb.airActuals && tb.airActuals.length) {
        accumulator.airActuals.push(...tb.airActuals.map(ab => ({ ...ab, attendeeRegistrationId: tb.id })));
      }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (tb && tb.pnrAirActuals && tb.pnrAirActuals.length) {
        accumulator.pnrAirActuals.push(...tb.pnrAirActuals.map(ab => ({ ...ab, attendeeRegistrationId: tb.id })));
      }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (tb && tb.groupFlightBookings && tb.groupFlightBookings.length) {
        accumulator.groupFlightBookings.push(
          ...tb.groupFlightBookings.map(ab => ({ ...ab, attendeeRegistrationId: tb.id }))
        );
      }
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (tb && tb.travelAnswers && tb.travelAnswers.length) {
        accumulator.travelAnswers.push(...tb.travelAnswers.map(ab => ({ ...ab, attendeeRegistrationId: tb.id })));
      }
      return accumulator;
    },
    {
      airBookings: [],
      hotelRoomBookings: [],
      airActuals: [],
      pnrAirActuals: [],
      groupFlightBookings: [],
      travelAnswers: []
    }
  );
};

/**
 * Saves hotel room requests in the travel cart and then persists the travel cart
 * @param {*} roomRequestsData the room request data to put in the travel cart
 */
export function saveHotelRoomRequests(roomRequestsData: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { travelCart } = state;
    const WIDGET_TYPE = 'HotelRequest';
    const updatedTravelBookings = getUpdatedTravelBookingsForRoomRequests(
      travelCart.cart.bookings || [],
      roomRequestsData
    );
    // Remove alternate answers for current attendee from bookings and from user sessions
    const { cart, userSession } = removeTravelAlternateAnswers(state, updatedTravelBookings, WIDGET_TYPE);

    await dispatch(updateTravelAnswersInUserSession(userSession.travelAnswers));
    await persistTravelCartUpdateRegCartFlagAndPricing(cart, travelCart.isCartCreated, dispatch, getState);
    await dispatch(loadHotelsRoomsCapacities(state.experiments?.featureRelease, getRegistrationTypeId(state)));
  };
}

/**
 * Saves group flight requests in the travel cart and then persists the travel cart
 * if a callback function is passed, its called after the cart persistence is done
 */
export const saveGroupFlightRequests = (groupFlightsData: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { travelCart } = state;
    const {
      userSession: {
        groupFlights: { selectedGroupFlightIds }
      }
    } = travelCart;
    const WIDGET_TYPE = 'GroupFlight';
    const updatedTravelBookings = getUpdatedTravelBookingsForGroupFlightRequests(
      travelCart.cart.bookings || [],
      groupFlightsData
    );
    // Remove alternate answers for current attendee from bookings and from user sessions
    const { cart, userSession } = removeTravelAlternateAnswers(state, updatedTravelBookings, WIDGET_TYPE);

    await dispatch(updateTravelAnswersInUserSession(userSession.travelAnswers));
    await persistTravelCartUpdateRegCartFlagAndPricing(cart, travelCart.isCartCreated, dispatch, getState);
    await dispatch(loadGroupFlightCapacities());
    dispatch(toggleGroupFlightSummaryView(true));
    await dispatch(removeSelectedGroupFlightIds(selectedGroupFlightIds));
  };
};

/**
 * Saves air requests in the travel cart and then persists the travel cart
 * @param {*} airRequestData the air request data to put in the travel cart
 * @param {string} eventRegistrationId the attendee identifier against which the user submitted the booking
 */
export function saveAirRequests({ attendeeRegistrationId: selectedEventRegistrationId, ...airRequestData }: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { travelCart } = state;
    const WIDGET_TYPE = 'AirRequest';
    const updatedTravelBookings = getUpdatedTravelBookingsForAirRequests(
      travelCart.cart.bookings || [],
      airRequestData,
      selectedEventRegistrationId
    );
    // Remove alternate answers for current attendee from bookings
    const { cart, userSession } = removeTravelAlternateAnswers(state, updatedTravelBookings, WIDGET_TYPE);

    await dispatch(updateTravelAnswersInUserSession(userSession.travelAnswers));
    await persistTravelCartUpdateRegCartFlagAndPricing(cart, travelCart.isCartCreated, dispatch, getState);
    const newRequestId = airRequestData.id
      ? airRequestData.id
      : getNewAirRequestId(travelCart.cart.bookings, cart.bookings, selectedEventRegistrationId);
    await dispatch(setSelectedAirRequestId(newRequestId));
    dispatch(showAirTravelSummaryView(true));
  };
}

/**
 * Saves air actuals in the travel cart and then persists the travel cart
 * @param {string} selectedEventRegistrationId
 * @param {*} airActualData the air actual data to put in the travel cart
 */
export function saveAirActuals({ attendeeRegistrationId, ...airActualData }: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { travelCart } = state;
    const WIDGET_TYPE = 'AirActual';
    const updatedTravelBookings = getUpdatedTravelBookingsForAirActuals(
      travelCart.cart.bookings || [],
      airActualData,
      attendeeRegistrationId
    );
    // Remove alternate answers for current attendee from bookings
    const { cart, userSession } = removeTravelAlternateAnswers(state, updatedTravelBookings, WIDGET_TYPE);

    await dispatch(updateTravelAnswersInUserSession(userSession.travelAnswers));
    await persistTravelCartUpdateRegCartFlagAndPricing(cart, travelCart.isCartCreated, dispatch, getState);
    const newRequestId = airActualData.id
      ? airActualData.id
      : getNewAirActualId(travelCart.cart.bookings, cart.bookings, attendeeRegistrationId);
    dispatch(setSelectedAirActualId(newRequestId));
    await dispatch(toggleAirActualSummaryView(true));
  };
}

/**
 * Displays confirmation dialog for clearing room request
 * @param {*} requests room requests id that need to be be cleared
 */
export function openHotelRequestDeleteConfirmation(requests: $TSFixMe) {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      openConfirmationDialog({
        title: 'EventWidgets_HotelRequest_CancelRequest__resx',
        subMessage: 'EventWidgets_HotelRequest_CancelRequest_Instruction__resx',
        confirm: async () => {
          await dispatch(clearHotelRoomRequests(requests));
          dispatch(closeDialogContainer());
        },
        cancel: () => {
          dispatch(closeDialogContainer());
        }
      })
    );
  };
}

/**
 * Clears the hotel room requests of a hotel and specific room type and then persists the travel cart
 * @param {array} roomRequestIds the request ids, the request corresponding to which will be cleared
 */
export function clearHotelRoomRequests(roomRequests: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { travelCart } = state;
    let updatedBookings = removeRoomsSelected(travelCart.cart.bookings, roomRequests).filter(
      excludeEmptyBookingsFilter
    );
    updatedBookings = removeTravelAnswers(
      updatedBookings,
      roomRequests.map(request => request.id)
    );
    const updatedCart = {
      ...travelCart.cart,
      bookings: [...updatedBookings]
    };
    await persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, travelCart.isCartCreated, dispatch, getState);
    await dispatch(loadHotelsRoomsCapacities(state.experiments?.featureRelease, getRegistrationTypeId(state)));
  };
}

/**
 * Clears the air requests then persists the travel cart
 * @param {Array<Object>} airRequests list of air requests needs to be deleted
 */
export function clearAirRequests(airRequests: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { travelCart } = state;
    let updatedBookings = removeAirRequests(travelCart.cart.bookings, airRequests).filter(excludeEmptyBookingsFilter);
    updatedBookings = removeTravelAnswers(
      updatedBookings,
      airRequests.map(request => request.id)
    );
    const updatedCart = {
      ...travelCart.cart,
      bookings: [...updatedBookings]
    };
    await persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, travelCart.isCartCreated, dispatch, getState);
    airRequests.forEach(request => {
      dispatch(removeSelectedAirRequestIds([request.id]));
    });
  };
}

/**
 * Remove group flight requests from the travel cart
 */
export function clearGroupFlights(groupFlightRequests: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const { travelCart } = getState();
    let updatedBookings = removeGroupFlightRequests(travelCart.cart.bookings, groupFlightRequests).filter(
      excludeEmptyBookingsFilter
    );
    updatedBookings = removeTravelAnswers(
      updatedBookings,
      groupFlightRequests.map(request => request.id)
    );
    const updatedCart = {
      ...travelCart.cart,
      bookings: [...updatedBookings]
    };
    const selectedGroupFlightIds = travelCart.userSession.groupFlights.selectedGroupFlightIds;
    await persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, travelCart.isCartCreated, dispatch, getState);
    await dispatch(loadGroupFlightCapacities());
    groupFlightRequests
      .filter(request => selectedGroupFlightIds.includes(request.id))
      .forEach(async request => {
        dispatch(toggleGroupFlightSummaryView(true));
        await dispatch(removeSelectedGroupFlightIds([request.id]));
      });
  };
}

/**
 * removes airActual from travel cart and persists the travel cart
 * @param airActuals, airActuals to be deleted
 * @returns {Function}
 */
function clearAirActuals(airActuals) {
  return async (dispatch, getState) => {
    const { travelCart } = getState();
    let updatedBookings = removeAirActuals(travelCart.cart.bookings, airActuals).filter(excludeEmptyBookingsFilter);
    updatedBookings = removeTravelAnswers(
      updatedBookings,
      airActuals.map(request => request.id)
    );
    const updatedCart = {
      ...travelCart.cart,
      bookings: [...updatedBookings]
    };
    await persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, travelCart.isCartCreated, dispatch, getState);
    const idsToRemove = airActuals.map(a => a.id);
    dispatch(removeSelectedAirActualIds(idsToRemove));
  };
}

/**
 * Method to handle own reservation
 * @param {Array<Object>} airRequests list of air requests needs to be deleted
 */
export function onOwnAirTravelReservation(airRequests: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      eventTravel: {
        airData: { isOwnReservation }
      }
    } = state;
    if (airRequests.length && !isOwnReservation) {
      dispatch(
        openConfirmationDialog({
          title: 'EventWidgets_HotelRequest_CancelRequest__resx',
          subMessage: 'EventWidgets_AirRequestSummary_CancelYourCurrentAirRequest__resx',
          confirm: async () => {
            await dispatch(clearAirRequests(airRequests));
            await dispatch(toggleOwnAirTravelReservation());
            dispatch(closeDialogContainer());
          },
          cancel: () => {
            dispatch(closeDialogContainer());
          }
        })
      );
    } else {
      await dispatch(toggleOwnAirTravelReservation());
    }
  };
}

/**
 * Open confirmation dialog while clearing air requests
 * @param {Array<Object>} airRequests list of air requests needs to be deleted
 */
export function onClearAirRequests(airRequests: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(
      openConfirmationDialog({
        title: 'EventWidgets_HotelRequest_CancelRequest__resx',
        subMessage: 'EventWidgets_AirRequestSummary_CancelYourCurrentAirRequest__resx',
        confirm: async () => {
          await dispatch(clearAirRequests(airRequests));
          dispatch(closeDialogContainer());
        },
        cancel: () => {
          dispatch(closeDialogContainer());
        }
      })
    );
  };
}

/**
 * Open confirmation dialog while clearing air actuals
 * @param {Array<Object>} airActuals list of air actuals needs to be deleted
 */
export function onClearAirActuals(airActuals: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(
      openConfirmationDialog({
        title: 'EventWidgets_HotelRequest_CancelRequest__resx',
        subMessage: 'EventWidgets_AirActual_CancelYourCurrentAirActual__resx',
        confirm: async () => {
          await dispatch(clearAirActuals(airActuals));
          dispatch(closeDialogContainer());
        },
        cancel: () => {
          dispatch(closeDialogContainer());
        }
      })
    );
  };
}

/**
 * Open confirmation dialog while clearing group flights
 * @param {Array<Object>} group flights needs to be deleted
 */
export function onClearGroupFlights(groupFlightRequests: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(
      openConfirmationDialog({
        title: 'EventWidgets_HotelRequest_CancelRequest__resx',
        subMessage: 'EventWidgets_AirActual_CancelYourCurrentAirActual__resx',
        confirm: async () => {
          await dispatch(clearGroupFlights(groupFlightRequests));
          dispatch(closeDialogContainer());
        },
        cancel: () => {
          dispatch(closeDialogContainer());
        }
      })
    );
  };
}

/* eslint complexity: ["error", 16]*/
const hasAnyValidTravelBooking = travelBooking => {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.airBookings && travelBooking.airBookings.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.hotelRoomBookings && travelBooking.hotelRoomBookings.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.groupFlightBookings && travelBooking.groupFlightBookings.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.airActuals && travelBooking.airActuals.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.pnrAirActuals && travelBooking.pnrAirActuals.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.creditCard && travelBooking.creditCard.creditCardDetails) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (travelBooking.travelAnswers && travelBooking.travelAnswers.length)
  );
};

/**
 * Removes the given bookings from the travel cart, currently only used for guest removal or changing guest count
 */
const removeTravelBookingsFromTravelCart = (travelBookingsToDelete, travelBookings) => {
  return async (dispatch, getState) => {
    const state = getState();
    const { travelCart } = state;
    const bookings = travelBookings || travelCart.cart.bookings;
    const { airBookings, hotelRoomBookings, airActuals, travelAnswers, groupFlightBookings, pnrAirActuals } =
      getAllTravelBookings(travelBookingsToDelete);
    let updatedBookings = removeAirRequests(bookings, airBookings);
    updatedBookings = removeRoomsSelected(updatedBookings, hotelRoomBookings);
    updatedBookings = removeAirActuals(updatedBookings, airActuals);
    updatedBookings = removePnrAirActuals(updatedBookings, pnrAirActuals);
    updatedBookings = removeGroupFlightRequests(updatedBookings, groupFlightBookings);
    updatedBookings = removeAllTravelAnswers(updatedBookings, travelAnswers);
    const updatedCart = {
      ...travelCart.cart,
      bookings: updatedBookings.filter(b => hasAnyValidTravelBooking(b))
    };
    return updatedCart;
  };
};

const unmatchRoommateAndSetEnlistSelf = hotelRoomBooking => {
  // no need to modify booking if it is in CANCEL state
  if (hotelRoomBooking.requestedAction === REQUESTED_ACTION.CANCEL) {
    return hotelRoomBooking;
  }

  const enlistSelfPreference = {
    roommateFirstName: '',
    roommateLastName: '',
    type: ROOMMATE_MATCHING_TYPE.ENLIST_SELF
  };

  return {
    ...hotelRoomBooking,
    preferences: {
      ...hotelRoomBooking.preferences,
      roommatePreferences: enlistSelfPreference
    },
    isRoommateMatched: false,
    requestedAction: hotelRoomBooking.hotelReservationDetailId ? REQUESTED_ACTION.MODIFY : REQUESTED_ACTION.BOOK
  };
};

/**
 * find booking having this guest as roommate, unmatch it and mark enlist-self
 */
const removeGuestAsRoommateFromRoomBookings = (guestRegistrationId, travelBookings) => {
  return travelBookings.map(travelBooking => {
    const updatedHotelRoomBookings = travelBooking.hotelRoomBookings.map(hrm => {
      if (
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        hrm.preferences &&
        hrm.preferences.roommatePreferences &&
        hrm.preferences.roommatePreferences.roommateId === guestRegistrationId
      ) {
        return unmatchRoommateAndSetEnlistSelf(hrm);
      }
      return hrm;
    });

    return {
      ...travelBooking,
      hotelRoomBookings: updatedHotelRoomBookings
    };
  });
};

/**
 * Removes the given booking from the travel cart, and then persists the cart
 */
export const handleRegistrantRemovalInTravelCart = (bookingIdToDelete: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      travelCart,
      registrationForm: {
        regCart: { hasTravel }
      }
    } = getState();
    const travelBookings = travelCart.cart.bookings;
    if (!hasTravel || !travelCart.cart || !travelBookings || travelBookings.length === 0) {
      return;
    }
    if (travelBookings.length) {
      const travelBookingsToDelete = travelBookings.filter(b => bookingIdToDelete === b.id);
      // handle (removal of) guests-as-roommates
      const updatedBookings = removeGuestAsRoommateFromRoomBookings(bookingIdToDelete, travelBookings);
      // handle bookings removal of guest
      const updatedCart = await dispatch(removeTravelBookingsFromTravelCart(travelBookingsToDelete, updatedBookings));

      await persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, travelCart.isCartCreated, dispatch, getState);
    }
  };
};

/**
 * find room bookings with unregistered guests as roommates, set them as enlist-self
 */
const removeUnregisteredGuestsAsRoommates = (eventRegistrations, travelBookings) => {
  return travelBookings.map(tb => {
    return {
      ...tb,
      hotelRoomBookings: tb.hotelRoomBookings.map(hrm => {
        if (
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          hrm.preferences &&
          hrm.preferences.roommatePreferences &&
          hrm.preferences.roommatePreferences.roommateIdType === RoommateIdType.GUEST_EVENT_REGISTRATION
        ) {
          const guestId = hrm.preferences.roommatePreferences.roommateId;
          if (!eventRegistrations[guestId] || eventRegistrations[guestId].requestedAction === 'UNREGISTER') {
            return unmatchRoommateAndSetEnlistSelf(hrm);
          }
        }
        return hrm;
      })
    };
  });
};

/**
 * removes the travel bookings for removed attendees/guests
 * @returns {Function}
 */
export function removeStaleBookings() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      travelCart,
      registrationForm: {
        regCart: { hasTravel, eventRegistrations }
      }
    } = getState();
    const travelBookings = travelCart.cart.bookings;
    if (!hasTravel || !travelCart.cart || !travelBookings || travelBookings.length === 0) {
      return;
    }
    if (travelBookings.length) {
      const travelBookingsToRemove = travelBookings.filter(
        tb => !eventRegistrations[tb.id] || eventRegistrations[tb.id].requestedAction === 'UNREGISTER'
      );
      const updatedTravelBookings = removeUnregisteredGuestsAsRoommates(eventRegistrations, travelBookings);
      const updatedCart = await dispatch(
        removeTravelBookingsFromTravelCart(travelBookingsToRemove, updatedTravelBookings)
      );

      await persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, travelCart.isCartCreated, dispatch, getState);
    }
  };
}

async function persistTravelCartUpdateRegCartFlagAndPricing(updatedCart, isCartCreated, dispatch, getState) {
  await persistTravelCartAndUpdateState(updatedCart, isCartCreated, dispatch, getState());
  const {
    registrationForm: {
      regCart: { hasTravel: regCartHasTravel }
    },
    travelCart
  } = getState();
  if (!regCartHasTravel && hasAnyTravelItem(travelCart)) {
    await dispatch(updateTravelFlagInRegCart(true));
  }
}

/**
 * Auto redirect the primary invitee to Concur, if applicable
 */
export const autoRedirectToConcurFromConfirmationPage =
  (regStatus = {}, isNewRegistration: $TSFixMe): $TSFixMe =>
  (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    const { eventTravel, website } = state;
    const shouldAutoRedirectInvitee =
      (regStatus as $TSFixMe).statusCode === 'COMPLETED' && // Reg cart should be Completed
      shouldAutoRedirectToConcur(eventTravel) && // And the auto redirection property should be turned on
      isNewRegistration && // And the registration should be a new registration
      !isRegApprovalRequired(getRegCart(state)) && // And reg approval shouldn't be required
      isWidgetOnPath(website, 'Concur', getRegistrationPathIdOrDefault(state)); // Concur widget should be on the current path
    // Concur widget should be on the current path

    if (shouldAutoRedirectInvitee) {
      dispatch(redirectToConcur(getEventRegistrationId(state)));
    }
  };

/**
 * handler for Concur book flight button
 * @param eventRegistrationId
 * @returns {Function}
 */
export function redirectToConcur(eventRegistrationId?: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    const {
      clients: { eventGuestClient },
      environment
    } = state;
    const regCart = getRegCart(state);
    const inviteeId = getAttendeeId(regCart, eventRegistrationId);
    const eventId = getEventId(state);
    const travelSnapshotVersion = getIn(state, ['eventTravel', 'travelSnapshotVersion']);
    const eventSnapshotVersion = getIn(state, ['eventSnapshotVersion']);
    const baseUrl = eventGuestClient.getBaseUrl();
    if (!travelSnapshotVersion || !eventSnapshotVersion) {
      LOG.error(`error finding snapshot versions to redirect to concur for ${inviteeId} for new request`);
    }
    let redirectionUrl =
      `${baseUrl}redirect/concur?eventId=${eventId}&inviteeId=${inviteeId}` +
      `&travelSnapshotVersion=${travelSnapshotVersion}&eventSnapshotVersion=${eventSnapshotVersion}`;
    if (environment) {
      redirectionUrl = `${redirectionUrl}&environment=${environment}`;
    }

    // Open the concur redirection URL in a new tab
    window.open(redirectionUrl, null);
  };
}

/**
 * call backend to search for roommates for the provided search term
 * @param searchText
 * @returns {Function}
 */
export const searchRoommates =
  (searchText: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    if (searchText && searchText.length >= MIN_LENGTH_FOR_SEARCH) {
      const state = getState();
      const allRoommates = state.travelCart.roommates.availableRoommates.all;
      const roommates = filterRoommatesByKeyword(allRoommates, searchText);
      dispatch(setRoommateSearch(searchText, roommates));
    }
  };

/**
 * loads roommate data into app state based on matching criteria for new hotel request
 * @returns {Function}
 */
export const loadRoommateData =
  ({
    hotelId,
    roomTypeId,
    checkInDate,
    checkOutDate,
    isSmokingOpted,
    isMale,
    registrationTypeId,
    hotelAttendeeRegistrationId
  }: {
    hotelId?: $TSFixMe;
    roomTypeId?: $TSFixMe;
    checkInDate?: $TSFixMe;
    checkOutDate?: $TSFixMe;
    isSmokingOpted?: $TSFixMe;
    isMale?: $TSFixMe;
    registrationTypeId?: $TSFixMe;
    hotelAttendeeRegistrationId?: $TSFixMe;
  }) =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { travelApiClient },
      eventTravel: { travelSnapshotVersion }
    } = state;
    const eventId = getEventId(state);
    const regCart = getRegCart(state);
    const eventRegId = getEventRegistrationId(state);
    const admissionItemId = (getSelectedAdmissionItem(regCart, eventRegId) || {}).productId;
    const registrationPathId = getRegistrationPathIdOrDefault(state);
    let contactId;

    if (currentRegistrant.getEventRegistrationId(state) === hotelAttendeeRegistrationId) {
      // contact id is valid only if hotel request is being made for primary invitee
      contactId = currentRegistrant.getContactId(state);
    }

    const params = {
      registrationPathId,
      isMale,
      isSmokingOpted,
      checkInDate,
      checkOutDate,
      roomTypeId,
      hotelId,
      registrationTypeId,
      contactId,
      admissionItemId
    };
    const roommateData = await travelApiClient.getRoommates(eventId, params, travelSnapshotVersion);
    const roommateDataToLoad = {
      requestedFrom: roommateData.requestedFrom,
      availableRoommates: roommateData.availableRoommates
    };
    dispatch(setRoommateData(roommateDataToLoad));
  };
