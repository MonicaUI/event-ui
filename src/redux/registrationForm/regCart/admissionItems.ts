import {
  getAttendee,
  isGroupRegistration,
  isProductVisibleForEventRegistration,
  isRegApprovalRequired,
  getAdmissionItemsCapacityMap
} from '../../selectors/currentRegistrant';
import { getIn } from 'icepick';
import {
  getAdmissionItems,
  getGuestsOfRegistrant,
  getSelectedAdmissionItem,
  isRegistrationModification
} from './selectors';
import { updateAdmissionItemRegistration } from './internal';
import { applyPartialEventRegistrationUpdate } from './partialUpdates';
import { populateRegCartVisibleProducts, populateVisibleProducts } from '../../visibleProducts';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { sessionsAppearOnPageBeforeAdmissionItems } from '../../website/pageContentsWithGraphQL';
import { getLastSavedRegCart } from './internal';
import { getAdmissionItem } from '../../selectors/event';
import { openGuestProductSelectionDialog } from '../../../dialogs';
import { isEmpty } from 'lodash';
import { getActiveHotelRoomBookings } from '../../travelCart/selectors';
import { clearHotelRoomRequests } from '../../travelCart';
import { EVENT_HOTEL_VISIBILITY_OPTION } from 'event-widgets/utils/travelConstants';

/**
 * Update the regcart with the new admission item
 */
export function selectAdmissionItem(
  eventRegistrationId: $TSFixMe,
  admissionItemId: $TSFixMe,
  shouldOpenGuestProductSelectionDialog = false,
  openAdmissionItemSelectionConflictDialog?: $TSFixMe,
  shouldOpenConflictDialogForAdmissionItemChange?: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const lastSavedRegCart = getLastSavedRegCart(getState);
    const isAdmissionItemVisibleForPrimary = isProductVisibleForEventRegistration(
      getState().visibleProducts,
      admissionItemId,
      eventRegistrationId
    );
    const requestedAction = !isAdmissionItemVisibleForPrimary ? 'UNREGISTER' : 'REGISTER';
    // Handle complex guest admission selection if needed
    if (shouldOpenGuestProductSelectionDialog) {
      const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
      const guestEventRegs = getGuestsOfRegistrant(lastSavedRegCart, eventRegistrationId);
      return await dispatch(
        handleAdmissionItemSelectionForComplexGuests(
          admissionItemId,
          lastSavedRegCart,
          eventRegistrationId,
          currentEventReg,
          guestEventRegs,
          openAdmissionItemSelectionConflictDialog,
          shouldOpenConflictDialogForAdmissionItemChange
        )
      );
    }
    const eventRegUpdates = updateAdmissionItemRegistration(
      lastSavedRegCart,
      eventRegistrationId,
      admissionItemId,
      requestedAction
    );
    await dispatch(applyPartialEventRegistrationUpdate(eventRegistrationId, eventRegUpdates, null, admissionItemId));
    const isRegMod = isRegistrationModification(lastSavedRegCart);
    if (isRegMod) {
      await dispatch(populateRegCartVisibleProducts());
    } else {
      await dispatch(populateVisibleProducts());
    }
  };
}

export function unSelectAdmissionItem(eventRegistrationId: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const lastSavedRegCart = getLastSavedRegCart(getState);
    const eventRegUpdates = updateAdmissionItemRegistration(lastSavedRegCart, eventRegistrationId);
    await dispatch(applyPartialEventRegistrationUpdate(eventRegistrationId, eventRegUpdates));
    const isRegMod = isRegistrationModification(lastSavedRegCart);
    if (isRegMod) {
      await dispatch(populateRegCartVisibleProducts());
    } else {
      await dispatch(populateVisibleProducts());
    }
  };
}

/**
 * remove hotel room bookings from travel cart for given event registration
 */
const removeHotelRequestsForEventRegistration = eventRegistrationId => async (dispatch, getState) => {
  const travelCart = getIn(getState(), ['travelCart', 'cart']);
  const hotelRoomBookings = travelCart && getActiveHotelRoomBookings(travelCart, eventRegistrationId);
  const hotelsData = getIn(getState(), ['eventTravel', 'hotelsData']);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const visibilityOption = hotelsData && hotelsData.eventHotelVisibilityOption;
  if (
    visibilityOption &&
    visibilityOption === EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM &&
    hotelRoomBookings &&
    hotelRoomBookings.length > 0
  ) {
    await dispatch(clearHotelRoomRequests(hotelRoomBookings));
  }
};

const applyGuestAdmissionItemSelection = (
  openAdmissionItemSelectionConflictDialog,
  shouldOpenConflictDialogForAdmissionItemChange,
  admissionItemId,
  currentPrimaryRegId,
  selectedEventRegIds,
  eventRegistrations
) => {
  return async (dispatch, getState, { apolloClient }) => {
    dispatch(closeDialogContainer());
    const admissionItemUpdates = {};
    const validationsPerRegistrant = {};
    const lastSavedRegCart = getLastSavedRegCart(getState);
    let shouldOpenConflictModal = false;
    for (const eventReg of eventRegistrations) {
      const eventRegId = eventReg.eventRegistrationId;
      const eventRegAdmissionItems = getAdmissionItems(lastSavedRegCart, eventRegId);
      if (selectedEventRegIds[eventRegId].isSelected) {
        /**
         * If this registrant is selected, register them for the admission item
         * while unregistering them any previous ones (if any)
         *
         */
        const admissionItemValidations = await shouldOpenConflictDialogForAdmissionItemChange(
          getState(),
          eventRegId,
          admissionItemId,
          await sessionsAppearOnPageBeforeAdmissionItems(getState(), apolloClient)
        );
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (admissionItemValidations && admissionItemValidations.validationResults) {
          validationsPerRegistrant[eventRegId] = admissionItemValidations.validationResults;
        }
        shouldOpenConflictModal =
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          shouldOpenConflictModal || (admissionItemValidations && admissionItemValidations.shouldOpenConflictModal);
        admissionItemUpdates[eventRegId] = updateAdmissionItemRegistration(
          lastSavedRegCart,
          eventRegId,
          admissionItemId
        );
      } else if (
        // eslint-disable-next-line no-prototype-builtins
        eventRegAdmissionItems.hasOwnProperty(admissionItemId) &&
        eventRegAdmissionItems[admissionItemId].requestedAction === 'REGISTER'
      ) {
        // Unregister for the session if they previously had it and they are now unselected
        admissionItemUpdates[eventRegId] = updateAdmissionItemRegistration(
          lastSavedRegCart,
          eventRegId,
          admissionItemId,
          'UNREGISTER'
        );
        // clear out hotel room bookings if adm item is being unselected
        await dispatch(removeHotelRequestsForEventRegistration(eventRegId));
      }
    }
    if (shouldOpenConflictModal) {
      return await dispatch(openAdmissionItemSelectionConflictDialog(validationsPerRegistrant, admissionItemUpdates));
    }
    await dispatch(
      applyPartialEventRegistrationUpdate(
        currentPrimaryRegId,
        admissionItemUpdates[currentPrimaryRegId],
        admissionItemUpdates
      )
    );
    const isRegMod = isRegistrationModification(lastSavedRegCart);
    if (isRegMod) {
      await dispatch(populateRegCartVisibleProducts());
    } else {
      const promises = Object.entries(admissionItemUpdates).map(([key]) => dispatch(populateVisibleProducts(key)));
      await Promise.all(promises);
    }
  };
};

function handleAdmissionItemSelectionForComplexGuests(
  admissionItemId,
  lastSavedRegCart,
  eventRegistrationId,
  currentEventReg,
  guestEventRegs,
  openAdmissionItemSelectionConflictDialog,
  shouldOpenConflictDialogForAdmissionItemChange
) {
  return async (dispatch, getState) => {
    const state = getState();
    const eventRegistrations = guestEventRegs;
    const currentAttendee = getAttendee(state);
    const admissionItem = getAdmissionItem(state, admissionItemId) || {};
    const admissionItemTitle = admissionItem.name;
    // this tracks the associated session capacity too and returns the lowest of both
    const admissionItemCapacity = getAdmissionItemsCapacityMap(getState(), [admissionItem])[admissionItemId]
      .availableCapacity;
    const overrideCapacity = !!getIn(state, ['defaultUserSession', 'isPlanner']);
    const isGroupReg = isGroupRegistration(state);
    eventRegistrations.unshift({
      ...currentEventReg,
      attendee: {
        ...currentAttendee
      }
    });
    const eventRegSelections = {};
    let selectedCount = 0;
    eventRegistrations.forEach(eventReg => {
      const eventRegId = eventReg.eventRegistrationId;
      const selectedAdmissionItem = getSelectedAdmissionItem(lastSavedRegCart, eventReg.eventRegistrationId) || {};
      const isAdmissionItemSelectable = isProductVisibleForEventRegistration(
        state.visibleProducts,
        admissionItemId,
        eventRegId
      );
      eventRegSelections[eventRegId] = {
        isSelected: !!(selectedAdmissionItem.productId === admissionItemId),
        isDisabled: !isAdmissionItemSelectable,
        registeredForProductInGroup: !isEmpty(selectedAdmissionItem)
      };
      selectedCount += eventRegSelections[eventRegId].isSelected ? 1 : 0;
    });
    // curried function to provide ability to open conflict modal when product selection modal is confirmed.
    const boundApplyGuestAdmissionItemSelection = applyGuestAdmissionItemSelection.bind(
      null,
      openAdmissionItemSelectionConflictDialog,
      shouldOpenConflictDialogForAdmissionItemChange
    );
    /*
     * FLEX-32140 for regApproval count the number selected and take it away from capacity since we don't
     * claim the capacity until planner approves
     */
    const isRegApproval = isRegApprovalRequired(state);
    const regApprovalCapacity =
      admissionItemCapacity !== -1 && admissionItemCapacity <= selectedCount
        ? 0
        : admissionItemCapacity - selectedCount;
    await dispatch(
      openGuestProductSelectionDialog(
        'GuestProductSelection_SelectAttendees__resx',
        admissionItemId,
        admissionItemTitle,
        isRegApproval && admissionItemCapacity !== -1 ? regApprovalCapacity : admissionItemCapacity,
        overrideCapacity,
        eventRegSelections,
        eventRegistrations,
        eventRegistrationId,
        isGroupReg,
        boundApplyGuestAdmissionItemSelection,
        admissionItem.fees,
        admissionItem.defaultFeeId
      )
    );
  };
}
