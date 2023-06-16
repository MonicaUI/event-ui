import GuestRegistrationWidget from 'event-widgets/lib/GuestRegistration/GuestRegistrationWidget';
import { connect } from 'react-redux';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import {
  openGuestProductCapacityReachedDialog,
  validateNoAvailableAdmissionItemOrEventCapacity,
  validateNoWaitlistedSessionCapacity
} from '../../dialogs/selectionConflictDialogs/GuestProductCapacityReachedDialog';
import { loadAvailableCapacityCounts } from '../../redux/capacity';
import {
  openCapacityReachedDialog,
  openEventStatusDialog,
  openGuestDetailsDialog,
  openGuestRemoveDialog
} from '../../dialogs';
import { updateGuestsInRegCart, updateRegCartWithGuests } from '../../redux/registrationForm/regCart';
import { removeStaleBookings as updateTravelBookings } from '../../redux/travelCart';
import Logger from '@cvent/nucleus-logging/lib/cjs/index';
import { getAvailableGuestRegTypeCapacities } from '../../utils/regTypeCapacities';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';

import {
  getEventRegistrationId,
  guestRegistrantsCount,
  getTotalAdmissionItemCapacityAvailable,
  getRegistrationTypeId
} from '../../redux/selectors/currentRegistrant';
import { getConfirmedGuestsForGuestWidget } from './GuestWidgetSelectors';
import {
  isGuestRegistrationTypeSelectionEnabledOnRegPath,
  getRegistrationPathIdOrDefault,
  isGuestProductSelectionEnabledOnRegPath,
  getMinGuestsAllowedOnRegPath
} from '../../redux/selectors/currentRegistrationPath';
import {
  getEventId,
  getGuestRegistrationTypeSettings,
  isAdmissionItemsEnabled,
  requireRegApproval,
  isClosedEvent
} from '../../redux/selectors/event';
import { getSelectedAdmissionItem } from '../../redux/registrationForm/regCart/selectors';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import { areRegistrationActionsDisabled, isRegCartUpdateInProgress } from '../../redux/selectors/shared';
import { populateVisibleProducts } from '../../redux/visibleProducts';
import { getCurrentPageId } from '../../redux/pathInfo';
import { isWidgetPresentOnCurrentPage } from '../../redux/website/pageContents';
import { CLOSED } from 'event-widgets/clients/EventStatus';
import { isGuestMinimumEnabled, isNameFormatUpdateEnabled } from '../../ExperimentHelper';

const LOG = new Logger('event-guestside-site/widgets/GuestRegistrationWidget/GuestRegistration');

const calculateCapacityWithGuests = async (guestCount, state, nullRegType = false, isAddGuestButton) => {
  const {
    registrationForm: { regCart },
    text: { translate }
  } = state;
  const currentRegistrantId = getEventRegistrationId(state);
  const eventId = getEventId(state);
  const regCartWithGuestUpdates = await updateRegCartWithGuests(
    state,
    eventId,
    regCart,
    guestCount,
    currentRegistrantId,
    translate,
    nullRegType
  );
  return {
    capacityFull: validateNoAvailableAdmissionItemOrEventCapacity(guestCount, state, isAddGuestButton),
    regCartWithGuestUpdates
  };
};

export const updateGuestCountWithLoading = withLoading((guestCount, isAddGuestButton) => {
  // eslint-disable-next-line complexity
  return async (dispatch, getState) => {
    const {
      text: { translate }
    } = getState();
    // make sure we have the latest capacity before validating anything
    await dispatch(loadAvailableCapacityCounts());
    const hasRegTypeWidget = isGuestRegistrationTypeSelectionEnabledOnRegPath(getState());
    // if limit is on but no categorizedRegTypes give them noRegType
    const regPathId = getRegistrationPathIdOrDefault(getState());
    const guestRegTypeSettings = getGuestRegistrationTypeSettings(getState(), regPathId) || {};
    const noCategorizedRegistrationTypes =
      guestRegTypeSettings.categorizedRegistrationTypes &&
      guestRegTypeSettings.categorizedRegistrationTypes.length === 0;
    const useNullRegType =
      guestRegTypeSettings.limitVisibility && noCategorizedRegistrationTypes
        ? false
        : isAddGuestButton && hasRegTypeWidget;
    const capacity = await calculateCapacityWithGuests(guestCount, getState(), useNullRegType, isAddGuestButton);
    const showCapacityReachedModal = capacity.capacityFull;
    if (showCapacityReachedModal && !getState().defaultUserSession.isPlanner) {
      return await dispatch(
        openCapacityReachedDialog({
          subMessage: translate('EventGuestSide_GuestUpdate_CapacityReachedError__resx')
        })
      );
    }
    const sessioncapFull = validateNoWaitlistedSessionCapacity(guestCount, getState());
    if (sessioncapFull) {
      if (!isAddGuestButton) {
        return await dispatch(openGuestProductCapacityReachedDialog(capacity.regCartWithGuestUpdates));
      }
      return await dispatch(
        openGuestProductCapacityReachedDialog(capacity.regCartWithGuestUpdates, updateGuestCountWithLoading)
      );
    }
    try {
      if (!isAddGuestButton) {
        // i.e. invitee can just choose number of guests, cannot add edit fields
        await dispatch(updateGuestsInRegCart(capacity.regCartWithGuestUpdates));
        LOG.debug('Updating travel bookings to remove bookings of removed guests');
        await dispatch(updateTravelBookings()); // since it depends on state, needs to go after regCart update
      } else {
        // i.e. invitee can enter guest details via a popup. can add one guest at a time
        const previousRegTypeId = getRegistrationTypeId(getState());
        // add temporary guest so that capacity validations are executed at the backend
        await dispatch(updateGuestsInRegCart(capacity.regCartWithGuestUpdates, true));
        const currentRegTypeId = getRegistrationTypeId(getState());
        // based on custom logic the reg type of primary may change
        if (
          previousRegTypeId !== currentRegTypeId &&
          isWidgetPresentOnCurrentPage(getState().website, 'Sessions', getCurrentPageId(getState()))
        ) {
          // update sessions
          await dispatch(populateVisibleProducts());
        }
        // open dialog for invitee to confirm the newly added temporary guest
        return dispatch(openGuestDetailsDialog(getState()));
      }
    } catch (error) {
      if (getUpdateErrors.isGuestProductAvailabilityError(error)) {
        await dispatch(loadAvailableCapacityCounts());
        if (!isAddGuestButton) {
          return await dispatch(openGuestProductCapacityReachedDialog(capacity.regCartWithGuestUpdates));
        }
        return await dispatch(
          openGuestProductCapacityReachedDialog(capacity.regCartWithGuestUpdates, updateGuestCountWithLoading)
        );
      } else if (getUpdateErrors.isEventClosed(error)) {
        return await dispatch(openEventStatusDialog(CLOSED, getState().text.translate));
      }
      throw error;
    }
  };
});

// eslint-disable-next-line complexity
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const guestCount = guestRegistrantsCount(state);
    const hasRegTypeWidget = isGuestRegistrationTypeSelectionEnabledOnRegPath(state);
    const isRegTypesEnabled = state.event.eventFeatureSetup.registrationProcess.multipleRegistrationTypes;
    // Use noRegType when using the dropDown or if using button but no regType widget is present
    const isAddGuestButton = props.config.addGuestDisplayType === 'standardButton';
    const useNoRegType = !isAddGuestButton || (isAddGuestButton && !hasRegTypeWidget);
    /*
     * if guest reg type widget is present, pass the flag that forces inspection of
     * capacities for 'no reg type' cuz we will need that
     */
    const capacityInfo = getAvailableGuestRegTypeCapacities(state, useNoRegType);
    const isAdmItemsEnabled = isAdmissionItemsEnabled(state);
    const noAvailableAdmissionItem =
      validateNoAvailableAdmissionItemOrEventCapacity(guestCount + 1, state, isAddGuestButton) && isAdmItemsEnabled;
    const noRegType = defaultRegistrationTypeId;
    const regTypeCapacity = capacityInfo.regTypeCapacitiesAvailable.find(regType => regType.id === noRegType) || {
      available: Infinity
    };

    const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
    /**
     * in preview mode, reg approval, or when adm item doesn't auto select for primary.
     * capacity isn't taken so we have to subtract one from the total to
     * include the primaries spot from the totalAdmItemCapacity to get the actual remaining count
     */
    const {
      registrationForm: { regCart }
    } = state;
    const guests = getConfirmedGuestsForGuestWidget(state);
    const guestsWithReservedCapacity = guests.filter(guestReg =>
      getSelectedAdmissionItem(regCart, guestReg.eventRegistrationId)
    );
    // check if primary has an admission item and subtract one from the available count
    const primaryAdmissionItemReg = getSelectedAdmissionItem(regCart, getEventRegistrationId(state));
    // if primary has an admission item, check only this admission item's capacity.
    let totalAdmItemCapacity = getTotalAdmissionItemCapacityAvailable(
      state,
      isGuestProductSelectionEnabled,
      capacityInfo.regTypeCapacitiesAvailable,
      !isAddGuestButton,
      primaryAdmissionItemReg
    );

    const isPreviewOrRegApproval = state.defaultUserSession.isPreview || requireRegApproval(state);
    totalAdmItemCapacity =
      totalAdmItemCapacity -
      (guestCount - (isPreviewOrRegApproval ? 0 : guestsWithReservedCapacity.length)) -
      (!isPreviewOrRegApproval && primaryAdmissionItemReg ? 0 : 1);

    // to make sure dropdown limit isn't negative
    totalAdmItemCapacity = totalAdmItemCapacity < 0 ? 0 : totalAdmItemCapacity;
    const dropdownGuestLimit = isPlannerRegistration(state)
      ? capacityInfo.guestCapacityMax
      : guestCount +
        Math.min(
          capacityInfo.eventCapacityAvailable,
          capacityInfo.guestCapacityAvailable,
          regTypeCapacity.available,
          totalAdmItemCapacity
        );
    const regPathId = getRegistrationPathIdOrDefault(state);
    const disableGuestReg = areRegistrationActionsDisabled(state) || isRegCartUpdateInProgress(state);
    const minGuestRequired = getMinGuestsAllowedOnRegPath(state);
    const isGuestMinimumValidationEnabled = isGuestMinimumEnabled(state);
    const nameFormatUpdateEnabled = isNameFormatUpdateEnabled(state);
    return {
      regCartUpdateInProgress: isRegCartUpdateInProgress(state),
      guestCount,
      guestLimit: dropdownGuestLimit,
      minGuestRequired,
      hidden: state.event.eventFeatureSetup.registrationProcess.guestRegistration === false,
      guests,
      isGuestMinimumValidationEnabled,
      disabled: isPlannerRegistration(state)
        ? capacityInfo.guestCapacityAvailable < 1
        : capacityInfo.isFull || noAvailableAdmissionItem || disableGuestReg || isClosedEvent(state),
      guestRegTypeRequired:
        isRegTypesEnabled && hasRegTypeWidget && getGuestRegistrationTypeSettings(state, regPathId).isRequired,
      nameFormatUpdateEnabled
    };
  },
  {
    updateGuestCount: updateGuestCountWithLoading,
    guestRemoveHandler: openGuestRemoveDialog,
    guestEditHandler: openGuestDetailsDialog
  }
)(GuestRegistrationWidget);
