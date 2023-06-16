import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import Logger from '@cvent/nucleus-logging';
import { travelCartUpdated } from './actions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { transformAirBookings } from './airRequest';
import { transformHotelRoomBookings } from './hotelRequest';
import { transformCreditCard as transformCreditCardForTravelCart } from './creditCard';
import { transformAirActuals } from './airActuals';
const LOG = new Logger('redux/modules/travelCart/internal');
import { getRegCart } from '../selectors/shared';
import { isRegApprovalRequired } from '../registrationForm/regCart/selectors';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import removeKeys from 'nucleus-core/utils/removeKeys';
import { transformCreditCardToAccountCardType } from 'event-widgets/utils/creditCardUtils';
import * as currentRegistrant from '../selectors/currentRegistrant';
import {
  getUpdatedTravelBookings as getUpdatedTravelBookingsForCreditCard,
  removeCreditCardFromState
} from './creditCard';
import { updateRegistrantInformationInTravelBookings } from '../../utils/travelUtils';
import { transformTravelAnswers } from './travelAnswers';
import { TRAVEL_ANSWER_REQUESTED_ACTIONS } from '../../utils/questionUtils';

/**
 * returns true, if passed booking has any kind of air actuals
 * @param booking
 * @returns {*}
 */
function hasNonEmptyAirActualsInBooking(booking) {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.airActuals && booking.airActuals.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.groupFlightBookings && booking.groupFlightBookings.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.concurAirActuals && booking.concurAirActuals.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.pnrAirActuals && booking.pnrAirActuals.length)
  );
}

/**
 * returns true, if passed booking has empty hotelRoomBookings and airBookings
 * @param booking
 * @returns {*}
 */
function hasNonEmptyBookings(booking) {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.hotelRoomBookings && booking.hotelRoomBookings.length) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.airBookings && booking.airBookings.length) ||
    hasNonEmptyAirActualsInBooking(booking) || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (booking.travelAnswers && booking.travelAnswers.length) ||
    hasCreditCardAndTravelReservation(booking)
  );
}

function hasCreditCardAndTravelReservation(booking) {
  return booking.creditCard && (booking.creditCard.creditCardDetails || booking.travelReservationId);
}

/**
 * returns true, if booking's requestedAction is cancel
 * @param {Array} bookings
 * @returns {boolean}
 */
function hasCancelledBookings(bookings) {
  return (
    bookings &&
    !bookings.some(
      h => h.requestedAction !== REQUESTED_ACTION.CANCEL && h.requestedAction !== TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
    )
  );
}

/* eslint complexity: ["error", 13]*/
function transformCartRequest(travelCart, isPlannerApprovalRequired) {
  return {
    ...travelCart,
    isPlannerApprovalRequired,
    bookings: travelCart.bookings.filter(hasNonEmptyBookings).map(booking => {
      /*
       * if cart booking has all room bookings and air bookings with cancel requested action
       * then modify booking action as cancel.
       */
      let modifiedBooking = booking;
      if (
        hasCancelledBookings(booking.hotelRoomBookings) &&
        hasCancelledBookings(booking.airBookings) &&
        hasCancelledBookings(booking.airActuals) &&
        hasCancelledBookings(booking.pnrAirActuals) &&
        hasCancelledBookings(booking.groupFlightBookings) &&
        hasCancelledBookings(booking.travelAnswers) &&
        (booking.hotelRoomBookings.length ||
          booking.airBookings.length ||
          booking.airActuals.length ||
          booking.pnrAirActuals.length ||
          booking.groupFlightBookings.length ||
          booking.travelAnswers.length)
      ) {
        modifiedBooking = {
          ...booking,
          requestedAction: REQUESTED_ACTION.CANCEL
        };
      }
      return {
        ...modifiedBooking,
        airBookings: transformAirBookings(modifiedBooking.airBookings),
        hotelRoomBookings: transformHotelRoomBookings(modifiedBooking.hotelRoomBookings),
        creditCard: transformCreditCardForTravelCart(modifiedBooking.creditCard),
        airActuals: transformAirActuals(modifiedBooking.airActuals),
        concurAirActuals: transformAirActuals(modifiedBooking.concurAirActuals),
        pnrAirActuals: transformAirActuals(modifiedBooking.pnrAirActuals),
        travelAnswers: transformTravelAnswers(modifiedBooking.travelAnswers)
      };
    })
  };
}

/**
 * Saves the passed travel cart to the backend and updates the state
 */
export async function updateTravelCartAndUpdateInState(
  travelCartClient: $TSFixMe,
  travelCart: $TSFixMe,
  dispatch: $TSFixMe
): Promise<$TSFixMe> {
  let response;
  try {
    response = await dispatch(
      withLoading(() => {
        return async (d, getState) => {
          const isPlannerApprovalRequired = isRegApprovalRequired(getRegCart(getState()));
          const transformedTravelCart = transformCartRequest(travelCart, isPlannerApprovalRequired);
          return await travelCartClient.updateTravelCart(transformedTravelCart);
        };
      })()
    );
    await dispatch(travelCartUpdated({ ...response.travelCart }));
    LOG.debug(`updateTravelCart with id ${travelCart.id} was successful`);
  } catch (error) {
    LOG.error(`updateTravelCart with id ${travelCart.id} failed`, error);
    dispatch(hideLoadingOnError());
    throw error;
  }
  return response;
}

/**
 * Creates the passed travel cart to the backend and updates the state
 */
export async function createTravelCartAndUpdateInState(
  travelCartClient: $TSFixMe,
  travelCart: $TSFixMe,
  dispatch: $TSFixMe
): Promise<$TSFixMe> {
  let response;
  try {
    response = await dispatch(
      withLoading(() => {
        return async (d, getState) => {
          const isPlannerApprovalRequired = isRegApprovalRequired(getRegCart(getState()));
          const transformedTravelCart = transformCartRequest(travelCart, isPlannerApprovalRequired);
          return await travelCartClient.createTravelCart(transformedTravelCart);
        };
      })()
    );
    await dispatch(travelCartUpdated(response.travelCart));
    LOG.debug(`createTravelCart with id ${travelCart.id} was successful`);
  } catch (error) {
    LOG.error(`createTravelCart with id ${travelCart.id} failed`, error);
    dispatch(hideLoadingOnError());
    throw error;
  }
  return response;
}

/**
 * transform credit card before creating credit card
 * @param {Object} creditCard
 * @returns {Object}
 */
function transformCreditCard(creditCard = {}) {
  let updatedCard = {
    ...creditCard,
    expMonth: (creditCard as $TSFixMe).expiryMonth,
    expYear: (creditCard as $TSFixMe).expiryYear
  };
  updatedCard = removeKeys(updatedCard, ['expiryMonth', 'expiryYear', 'cardType']);
  return {
    creditCard: { ...updatedCard }
  };
}

/**
 * transform credit card response
 * @param {Object} response
 * @returns {Object}
 */
function transformCreditCardResponse(response) {
  let updatedCard = {
    ...response.creditCard,
    expiryMonth: response.creditCard.expMonth,
    expiryYear: response.creditCard.expYear,
    cardType: transformCreditCardToAccountCardType(response.creditCard.cardType)
  };
  updatedCard = removeKeys(updatedCard, ['expMonth', 'expYear']);
  return {
    ...response,
    creditCard: { ...updatedCard }
  };
}

/**
 * Creating new credit card
 * @param {Object} creditCardClient
 * @param {string} accessToken
 * @param {Object} accessToken
 * @param {Function} dispatch
 * @returns {Object}
 */
async function createTravelCreditCard(creditCardClient, accessToken, creditCard, dispatch) {
  let response;
  try {
    response = await dispatch(
      withLoading(() => {
        return async () => {
          const transformedCreditCard = transformCreditCard(creditCard);
          return transformCreditCardResponse(
            await creditCardClient.createCreditCard(accessToken, transformedCreditCard)
          );
        };
      })()
    );
    LOG.debug(`creditCard with contextId ${response.contextId} was successful`);
  } catch (error) {
    LOG.error('creditCard failed', error);
    dispatch(hideLoadingOnError());
    throw error;
  }
  return response;
}

/**
 * Create credit card, add to travel cart and updating in state
 * @param {Object} travelCart
 * @param {Function} dispatch
 * @param {Object} state
 * @returns {Object}
 */
async function persistTravelCreditCard(travelCart, dispatch, state) {
  const {
    accessToken,
    clients: { creditCardClient },
    travelCart: {
      userSession: { creditCard }
    }
  } = state;
  const { eventRegistrationId } = currentRegistrant.getEventRegistration(state);
  let updatedTravelBookings = travelCart.bookings || [];
  if (creditCard) {
    // if credit card data present, create and save to travel cart
    if (creditCard.number) {
      const response = await createTravelCreditCard(creditCardClient, accessToken, creditCard, dispatch);
      updatedTravelBookings = getUpdatedTravelBookingsForCreditCard(travelCart.bookings || [], eventRegistrationId, {
        contextId: response.contextId,
        creditCardDetails: { ...response.creditCard }
      });
    } else {
      // remove card from state
      updatedTravelBookings = removeCreditCardFromState(travelCart.bookings || [], eventRegistrationId);
    }
  }
  return updatedTravelBookings;
}

/**
 * Create credit card if widget in same page
 * @param {Object} travelCart
 * @param {string} saveTravelCreditCard
 * @returns {*}
 */
export function updateTravelCreditCard(travelCart: $TSFixMe, saveTravelCreditCard: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    let updatedTravelBookings = travelCart.bookings || [];
    if (saveTravelCreditCard) {
      // Save credit card data
      updatedTravelBookings = await persistTravelCreditCard(travelCart, dispatch, state);
    }
    const updatedCart = {
      ...travelCart,
      bookings: [...updatedTravelBookings]
    };
    return updatedCart;
  };
}

/**
 * Persists the travel cart in the current state to backend
 * If the travel has not been created on the backend yet, we first create it
 * @param {boolean} isCartCreated Whether the travel cart has already been created on the backend
 */
export async function persistTravelCartAndUpdateState(
  travelCart: $TSFixMe,
  isCartCreated: $TSFixMe,
  dispatch: $TSFixMe,
  {
    eventSnapshotVersion,
    clients: { travelApiClient },
    defaultUserSession: { eventId, isPreview, isPlanner },
    eventTravel: { travelSnapshotVersion },
    event: { isInTestMode },
    registrationForm: { regCart }
  }: {
    eventSnapshotVersion?: $TSFixMe;
    clients?: {
      travelApiClient?: $TSFixMe;
    };
    defaultUserSession?: {
      eventId?: $TSFixMe;
      isPreview?: $TSFixMe;
      isPlanner?: $TSFixMe;
    };
    eventTravel?: {
      travelSnapshotVersion?: $TSFixMe;
    };
    event?: {
      isInTestMode?: $TSFixMe;
    };
    registrationForm?: {
      regCart?: $TSFixMe;
    };
  }
): Promise<$TSFixMe> {
  const { regCartId, regMod } = regCart;
  const modifiedResult = updateRegistrantInformationInTravelBookings(travelCart.bookings, regCart);
  const modifiedTravelCart = { ...travelCart, bookings: modifiedResult.bookings };
  if (isCartCreated) {
    await updateTravelCartAndUpdateInState(travelApiClient, modifiedTravelCart, dispatch);
  } else {
    await createTravelCartAndUpdateInState(
      travelApiClient,
      {
        ...modifiedTravelCart,
        id: regCartId,
        eventId,
        eventSnapshotVersion,
        travelSnapshotVersion,
        isForTestMode: isInTestMode,
        isForPreview: isPreview,
        isForPlanner: isPlanner,
        requestedAction: regMod ? REQUESTED_ACTION.MODIFY : REQUESTED_ACTION.BOOK
      },
      dispatch
    );
  }
}
