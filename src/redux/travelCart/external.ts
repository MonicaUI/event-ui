import Logger from '@cvent/nucleus-logging';
import { getIn } from 'icepick';
import {
  travelCartUpdated,
  clearUserSessionData,
  updateUnsavedCreditCard,
  removeUnSavedTravelAnswers
} from './actions';
import { SET_SELECTED_AIR_REQUEST_ID, SET_SELECTED_AIR_ACTUAL_ID, SET_SELECTED_GROUP_FLIGHT_ID } from './actionTypes';
import { updateTravelCartAndUpdateInState, persistTravelCartAndUpdateState, updateTravelCreditCard } from './internal';
import { getRegCart } from '../selectors/shared';
import { loadAirportsForTravelCart } from '../airports';
import { getPrimaryRegistrationId, getAttendeeId, getEventRegistrations } from '../registrationForm/regCart/selectors';
import { loadAirportsForEventAndTravelCart } from '../airports';
import { updateRegistrantInformationInTravelBookings, hasAnyTravelItem } from '../../utils/travelUtils';
import { getTravelCartSnapshotVersion } from './selectors';
import { loadTravelSnapshotVersion } from 'event-widgets/redux/modules/eventTravel';
import { updateTravelAnswers } from './travelAnswers';

const LOG = new Logger('redux/travelCart/external');

/**
 * Restores the travel cart from the backend into the state
 * @param {*} travelCartId The travel cart id corresponding to which the travel cart should be loaded
 */
export function restoreTravelCartIntoState(travelCartId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { travelApiClient }
    } = getState();
    try {
      const travelCart = await travelApiClient.getTravelCart(travelCartId);
      await dispatch(travelCartUpdated(travelCart));
      await dispatch(clearUserSessionData());
      await dispatch(loadTravelSnapshotVersion(getTravelCartSnapshotVersion(getState())));
      await dispatch(loadAirportsForEventAndTravelCart());
      LOG.debug(`restore travel cart with id ${travelCartId} was successful`);
    } catch (error) {
      LOG.error(`restore travel cart with id ${travelCartId} failed`, error);
      throw error;
    }
  };
}

/**
 * Persists the current travel cart in the state to backend
 * Used for making sure that the travel cart stays alive during the registration
 */
function persistTravelCart(travelForm, saveTravelCreditCard) {
  return async (dispatch, getState) => {
    const { cart, isCartCreated } = travelForm;
    // persist travel credit card
    let updatedCart = await dispatch(updateTravelCreditCard(cart, saveTravelCreditCard));
    // persist travelAnswers
    updatedCart = await dispatch(updateTravelAnswers(updatedCart));
    await persistTravelCartAndUpdateState(updatedCart, isCartCreated, dispatch, getState());
    await dispatch(updateUnsavedCreditCard(null)); // Clear credit card from userSession object
    await dispatch(removeUnSavedTravelAnswers()); // Clear travel answers from userSession object
  };
}

/**
 * Update reg type and admission item ids in travel cart corresponding to the values in reg cart
 * if anything has changed
 */
export function updateRegTypeAndAdmissionItemIdsInTravelBookings() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { travelApiClient },
      travelCart: { cart, isCartCreated }
    } = state;
    if (!isCartCreated) {
      return;
    }
    const regCart = getRegCart(state);
    const modifiedResult = updateRegistrantInformationInTravelBookings(cart.bookings, regCart);
    if (modifiedResult.hasAnyBookingChanged) {
      await updateTravelCartAndUpdateInState(
        travelApiClient,
        {
          ...cart,
          bookings: modifiedResult.bookings
        },
        dispatch
      );
    }
  };
}

/**
 * Restores the transient travel cart corresponding to the regcart in state, if applicable
 */
export function restoreTransientTravelCartIntoState(forceLoadTransientCart?: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { travelApiClient },
      event,
      defaultUserSession: { isPlanner, isTestMode }
    } = state;
    const regCart = getRegCart(state);

    const travelConfigs = getIn(event, ['eventFeatureSetup', 'travelAndHousing']);
    if (
      ((regCart && !regCart.regCartId) || forceLoadTransientCart) &&
      travelConfigs &&
      (travelConfigs.hotelAccomodations || getIn(travelConfigs, ['airTravel', 'enabled']) || travelConfigs.carRental)
    ) {
      let bookingIdOverrides = {};
      const eventRegistrations = getEventRegistrations(regCart);
      Object.keys(eventRegistrations).forEach(
        eventRegId =>
          (bookingIdOverrides = {
            ...bookingIdOverrides,
            [getAttendeeId(regCart, eventRegId)]: eventRegId
          })
      );
      try {
        const response = await travelApiClient.getTransientTravelCart(
          getAttendeeId(regCart, getPrimaryRegistrationId(regCart)),
          true,
          { isForPlanner: isPlanner, isForTestMode: isTestMode, travelBookingIdOverrides: bookingIdOverrides }
        );
        // if response is successful set travelCart into state
        if (response.travelCart) {
          await dispatch(travelCartUpdated(response.travelCart));
          dispatch(loadAirportsForTravelCart());
        }
      } catch (error) {
        if (!(error.responseStatus && error.responseStatus === 404)) {
          throw error;
        }
      }
    }
  };
}

const requireSaving = (regCart, travelForm) => {
  return hasAnyTravelItem(travelForm) && !(regCart.regCancel && travelForm.cart.status === 'TRANSIENT');
};

/**
 * saves the current travel registration form to backend if needed
 * @param saveTravelCreditCard
 * @returns {Function}
 */
export function saveTravelRegistration(saveTravelCreditCard: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      travelCart: travelForm,
      registrationForm: { regCart }
    } = getState();
    if (requireSaving(regCart, travelForm)) {
      await dispatch(persistTravelCart(travelForm, saveTravelCreditCard));
    }
  };
}

/**
 * Retrieves a TravelCart from service when restoring the registration form
 * @param regCart
 * @returns {Function}
 */
export const restoreTravelRegistration = (regCart: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    // when invitee starts reg cancel, we load the transient cart, so can again load transient cart
    if (regCart.regCancel) {
      await dispatch(restoreTransientTravelCartIntoState(true));
    } else if (regCart.hasTravel) {
      await dispatch(restoreTravelCartIntoState(regCart.regCartId));
    }
  };
};

/**
 * start cancellation flow for travel
 * @returns {Function}
 */
export const startTravelCancellation = () => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    /*
     * The actual cancel travel cart has requestStatus props for all bookings set to CANCEL, from that
     * we won't be able to tell whether the bookings were already cancelled or are coming for getting cancelled.
     * Therefore we're using the transient travel cart, where those props would be accurate for our purpose.
     * In case later we need any data specific to travel cancellation, we'd require loading the actual cancel cart then.
     */
    dispatch(restoreTransientTravelCartIntoState(true));
  };
};

/**
 * To add value to selectedGroupFlightIds in state
 */
export function setSelectedGroupFlightId(selectedGroupFlightId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const selectedGroupFlightIds = [...getState().travelCart.userSession.groupFlights.selectedGroupFlightIds];
    if (!selectedGroupFlightIds.includes(selectedGroupFlightId)) {
      selectedGroupFlightIds.push(selectedGroupFlightId);
      dispatch({
        type: SET_SELECTED_GROUP_FLIGHT_ID,
        payload: {
          selectedGroupFlightIds
        }
      });
    }
  };
}

/**
 * To remove value from selectedGroupFlightIds in state
 * @param {Arrar<string>} idsToRemove
 */
export function removeSelectedGroupFlightIds(idsToRemove = []) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const selectedGroupFlightIds = getState().travelCart.userSession.groupFlights.selectedGroupFlightIds || [];

    if (selectedGroupFlightIds.length > 0 && idsToRemove.length > 0) {
      const filteredIds = selectedGroupFlightIds.filter(existingId => {
        if (!idsToRemove.includes(existingId)) {
          return existingId;
        }
      });
      dispatch({
        type: SET_SELECTED_GROUP_FLIGHT_ID,
        payload: {
          selectedGroupFlightIds: filteredIds
        }
      });
    }
  };
}

/**
 * To add value to selectedAirRequestIds in state
 */
export function setSelectedAirRequestId(selectedAirRequestId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const selectedAirRequestIds = [...getState().travelCart.userSession.airRequest.selectedAirRequestIds];
    if (!selectedAirRequestIds.includes(selectedAirRequestId)) {
      selectedAirRequestIds.push(selectedAirRequestId);
      dispatch({
        type: SET_SELECTED_AIR_REQUEST_ID,
        payload: {
          selectedAirRequestIds
        }
      });
    }
  };
}

/**
 * To remove value from selectedAirRequestIds in state
 * @param {Arrar<string>} idsToRemove
 */
export function removeSelectedAirRequestIds(idsToRemove = []) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const selectedAirRequestIds = getState().travelCart.userSession.airRequest.selectedAirRequestIds || [];

    if (selectedAirRequestIds.length > 0 && idsToRemove.length > 0) {
      const filteredIds = selectedAirRequestIds.filter(existingId => {
        if (!idsToRemove.includes(existingId)) {
          return existingId;
        }
      });
      dispatch({
        type: SET_SELECTED_AIR_REQUEST_ID,
        payload: {
          selectedAirRequestIds: filteredIds
        }
      });
    }
  };
}

/**
 * To add value to selectedAirActualIds in state
 */
export function setSelectedAirActualId(selectedAirActualId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const selectedAirActualIds = [...getState().travelCart.userSession.airActual.selectedAirActualIds];
    if (!selectedAirActualIds.includes(selectedAirActualId)) {
      selectedAirActualIds.push(selectedAirActualId);
      dispatch({
        type: SET_SELECTED_AIR_ACTUAL_ID,
        payload: {
          selectedAirActualIds
        }
      });
    }
  };
}

/**
 * To remove value from selectedAirActualIds in state
 * @param {Arrar<string>} idsToRemove
 */
export function removeSelectedAirActualIds(idsToRemove = []) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const selectedAirActualIds = getState().travelCart.userSession.airActual.selectedAirActualIds || [];

    if (selectedAirActualIds.length > 0 && idsToRemove.length > 0) {
      const filteredIds = selectedAirActualIds.filter(existingId => {
        if (!idsToRemove.includes(existingId)) {
          return existingId;
        }
      });
      dispatch({
        type: SET_SELECTED_AIR_ACTUAL_ID,
        payload: {
          selectedAirActualIds: filteredIds
        }
      });
    }
  };
}
