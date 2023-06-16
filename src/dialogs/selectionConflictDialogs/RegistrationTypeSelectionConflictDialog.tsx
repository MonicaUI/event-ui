import React from 'react';
import { returnToProcessStart } from './SelectionConflictDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './SelectionConflictDialog.less';
import { clearHotelRoomRequests, clearAirRequests, clearGroupFlights } from '../../redux/travelCart';
import { filterEventSnapshot } from '../../redux/actions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  updateGuestsInRegCart,
  updateRegCartWithGuests,
  updateAdmissionItemRegistration,
  setCurrentGuestEventRegistration,
  removeGroupMembersFromRegCart,
  setAirRequestOptOutChoice
} from '../../redux/registrationForm/regCart';
import { getLastSavedRegCart } from '../../redux/registrationForm/regCart/internal';
import { applyPartialEventRegistrationUpdate } from '../../redux/registrationForm/regCart';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import { openPrivateEventErrorDialog } from '../PrivateEventErrorDialog';
import { setIn } from 'icepick';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import {
  isGroupMember,
  getEventRegistrationId,
  getTemporaryGuestEventRegistration
} from '../../redux/selectors/currentRegistrant';
import { getRegCart } from '../../redux/selectors/shared';
import {
  getRegistrationPathIdOrDefault,
  isGuestProductSelectionEnabledOnRegPath
} from '../../redux/selectors/currentRegistrationPath';
import { getEventId } from '../../redux/selectors/event';
import { getSelectedAdmissionItem } from '../../redux/registrationForm/regCart/selectors';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { updateQuantity } from '../../redux/registrationForm/regCart/quantityItems';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
import StandardDialog from '../shared/StandardDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { handleOptionalSessionsConflicts } from '../../redux/registrationForm/regCart/sessions';
import { updateDonationAmount } from '../../redux/registrationForm/regCart/donationItems';
import {
  buildRegTypeSelectionConflictDialogResults,
  buildUnregisterSessionBundlesInput,
  handleRegTypeConflictSessionBundles
} from '../../redux/registrationForm/regCart/sessionBundles';
import { routeToNewRegPath } from '../../widgets/RegistrationTypeWidget/RegistrationTypeWidget';
import { shouldUseAirOptOutFeature } from '../../ExperimentHelper';
import { TRAVEL_OPT_OUT_CHOICE } from 'event-widgets/utils/travelConstants';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

function canProceedWithoutUserConfirmation(state, validationResults) {
  const eventRegistrationId = getEventRegistrationId(state);
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    validationResults[eventRegistrationId] && validationResults[eventRegistrationId].canProceedWithoutUserConfirmation
  );
}

/**
 * A dialog which allows the registrant to confirm their new registration type selection when the registration type
 * will cause ui validation errors in their registration cart during updating registration type validation process.
 * If they decide to choose the new registration type, any invalid items will be removed and they will be brought
 * to the beginning of registration in order to update their selections.
 */
export function handleRegistrationTypeSelectionConflict(
  validationResults: $TSFixMe,
  updateGuestDetails?: $TSFixMe,
  onCloseAdditionalActions?: $TSFixMe,
  onContinueAdditionalActions?: $TSFixMe
) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const boundCancelSelection = () => {
      dispatch(closeDialogContainer());
      if (onCloseAdditionalActions) {
        dispatch(onCloseAdditionalActions());
      }
    };
    const boundContinueSelection = async () =>
      await dispatch(
        withLoading(continueSelection)(validationResults, updateGuestDetails, onContinueAdditionalActions)
      );
    if (canProceedWithoutUserConfirmation(getState(), validationResults)) {
      void boundContinueSelection();
      return;
    }
    dispatch(openRegistrationTypeConflictDialog(boundContinueSelection, boundCancelSelection));
  };
}

/**
 * A dialog which allows the registrant to confirm their new registration type selection when the registration type
 * will cause reg service validation errors while updating their update registration cart request.
 * If they decide to choose the new registration type, any invalid items will be removed and they will be brought
 * to the beginning of registration in order to update their selections.
 */
export function handleRegTypeConflictFromServiceValidationResult(
  eventRegistrationId: $TSFixMe,
  serviceValidationResult: $TSFixMe,
  updateGuestDetails?: $TSFixMe,
  onCloseAdditionalActions?: $TSFixMe
) {
  return (dispatch: $TSFixMe): $TSFixMe => {
    const boundCancelSelection = () => {
      dispatch(closeDialogContainer());
      if (onCloseAdditionalActions) {
        dispatch(onCloseAdditionalActions());
      }
    };
    const { sessionBundleValidationResults, regTypeId: newRegTypeId } =
      buildRegTypeSelectionConflictDialogResults(serviceValidationResult);
    let boundContinueSelection = null;
    if (!updateGuestDetails) {
      boundContinueSelection = async () =>
        await dispatch(
          withLoading(continueSelection)(sessionBundleValidationResults, null, () =>
            routeToNewRegPath(eventRegistrationId, newRegTypeId)
          )
        );
    } else {
      boundContinueSelection = async () =>
        await dispatch(withLoading(continueSelection)(sessionBundleValidationResults, updateGuestDetails, null));
    }
    dispatch(openRegistrationTypeConflictDialog(boundContinueSelection, boundCancelSelection));
  };
}

function openRegistrationTypeConflictDialog(boundContinueSelection, boundCancelSelection) {
  return (dispatch, getState) => {
    const {
      text: { translate }
    } = getState();

    const dialog = (
      <Dialog
        {...injectTestId('registration-type-selection-conflict-dialog')}
        title={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Title__resx')}
        message={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Title__resx')}
        subMessage={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_InformationalText__resx')}
        content={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_InstructionalText__resx')}
        secondaryButtonText={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Cancel__resx')}
        cancel={boundCancelSelection}
        onClose={boundCancelSelection}
        primaryButtonText={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Ok__resx')}
        confirm={boundContinueSelection}
        icon="attentionWarning"
        iconModifier="error"
        classes={DialogStyles}
      />
    );

    dispatch(
      openDialogContainer(dialog, boundCancelSelection, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}

/**
 * Removes any invalid sessions and admission items for the registration type type and selects the registration type.
 */
function continueSelection(validationResults, updateGuestDetails, additionalActions) {
  // eslint-disable-next-line complexity
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    let newPrimaryRegistrationTypeId;
    let guestRegistrationsValidationResultsForPrimary;
    const primaryRegistrationId = getEventRegistrationId(getState());
    const productRegUpdates = {};
    const donationItemsRemoved = {};
    let removeGroupMembers = false;
    const state = getState();
    const regCart = getRegCart(state);
    let sessionBundleUnRegisterInput = [];
    for (const eventRegId of Object.keys(validationResults)) {
      const {
        admissionItemValidationResults,
        sessionsValidationResults,
        newRegistrationTypeId,
        guestRegistrationsValidationResults,
        airRequestAdvancedRuleValidationResults,
        hotelBookingValidationResults,
        airRequestValidationResults,
        hotelBookingAdvancedRuleValidationResults,
        quantityItemValidationResults,
        groupRegistrationValidationResults,
        groupFlightBookingValidationResults,
        donationItemValidationResults,
        sessionBundlesValidationResults
      } = validationResults[eventRegId];
      if (primaryRegistrationId === eventRegId) {
        newPrimaryRegistrationTypeId = newRegistrationTypeId;
        guestRegistrationsValidationResultsForPrimary = guestRegistrationsValidationResults;
      }

      if (groupRegistrationValidationResults && !groupRegistrationValidationResults.isValid) {
        removeGroupMembers = true;
      }

      const invalidGroupFlightBookings = [];
      // remove any conflicting group flights
      if (
        groupFlightBookingValidationResults &&
        !groupFlightBookingValidationResults.isValid &&
        groupFlightBookingValidationResults.invalidGroupFlightBookings &&
        groupFlightBookingValidationResults.invalidGroupFlightBookings.length > 0
      ) {
        invalidGroupFlightBookings.push(...groupFlightBookingValidationResults.invalidGroupFlightBookings);
      }
      if (invalidGroupFlightBookings.length > 0) {
        await dispatch(clearGroupFlights(invalidGroupFlightBookings));
      }

      const invalidAirBookings = [];
      // remove any conflicting air requests
      if (
        airRequestAdvancedRuleValidationResults &&
        !airRequestAdvancedRuleValidationResults.isValid &&
        airRequestAdvancedRuleValidationResults.invalidAirBookings &&
        airRequestAdvancedRuleValidationResults.invalidAirBookings.length > 0
      ) {
        invalidAirBookings.push(...airRequestAdvancedRuleValidationResults.invalidAirBookings);
      }
      if (
        airRequestValidationResults &&
        !airRequestValidationResults.isValid &&
        airRequestValidationResults.invalidAirBookings &&
        airRequestValidationResults.invalidAirBookings.length > 0
      ) {
        invalidAirBookings.push(...airRequestValidationResults.invalidAirBookings);
      }
      if (invalidAirBookings.length > 0) {
        // Marking the opt-out flag to NOT-APPLICABLE since all the booking for a single event registration
        // would be invalid
        if (shouldUseAirOptOutFeature(state)) {
          const attendee = state?.registrationForm?.regCart?.eventRegistrations[primaryRegistrationId].attendee;
          if (attendee.airOptOutChoice !== TRAVEL_OPT_OUT_CHOICE.NOT_APPLICABLE) {
            await dispatch(setAirRequestOptOutChoice(primaryRegistrationId, TRAVEL_OPT_OUT_CHOICE.NOT_APPLICABLE));
          }
        }
        await dispatch(clearAirRequests(invalidAirBookings));
      }

      const invalidHotelBookings = [];
      // remove any conflicting hotel room booking
      if (
        hotelBookingValidationResults &&
        !hotelBookingValidationResults.isValid &&
        hotelBookingValidationResults.invalidTravelBookings &&
        hotelBookingValidationResults.invalidTravelBookings.length > 0
      ) {
        invalidHotelBookings.push(...hotelBookingValidationResults.invalidTravelBookings);
      }
      if (
        hotelBookingAdvancedRuleValidationResults &&
        !hotelBookingAdvancedRuleValidationResults.isValid &&
        hotelBookingAdvancedRuleValidationResults.invalidHotelBookings &&
        hotelBookingAdvancedRuleValidationResults.invalidHotelBookings.length > 0
      ) {
        invalidHotelBookings.push(...hotelBookingAdvancedRuleValidationResults.invalidHotelBookings);
      }
      if (invalidHotelBookings.length > 0) {
        await dispatch(clearHotelRoomRequests(invalidHotelBookings));
      }

      if (sessionBundlesValidationResults && !sessionBundlesValidationResults.isValid) {
        const guestApplySameProductToAgenda = !isGuestProductSelectionEnabledOnRegPath(getState());
        const { invalidSessionBundles } = sessionBundlesValidationResults;
        const currentEvtRegSessionBundleUnregisterInput = buildUnregisterSessionBundlesInput(
          regCart,
          eventRegId,
          invalidSessionBundles,
          guestApplySameProductToAgenda
        );
        // aggregate all evt regs session bundle conflict input so we can update once
        sessionBundleUnRegisterInput = [...sessionBundleUnRegisterInput, ...currentEvtRegSessionBundleUnregisterInput];
      }

      if (sessionsValidationResults && !sessionsValidationResults.isValid) {
        const sessionRegUpdates = await dispatch(
          handleOptionalSessionsConflicts(eventRegId, sessionsValidationResults.invalidSessions)
        );
        productRegUpdates[eventRegId] = {
          ...sessionRegUpdates
        };
      }

      if (admissionItemValidationResults && !admissionItemValidationResults.isValid) {
        const selectedAdmissionItem = getSelectedAdmissionItem(regCart, eventRegId);
        const admissionItemAndSessionRegUpdates = await updateAdmissionItemRegistration(
          getLastSavedRegCart(getState),
          eventRegId,
          selectedAdmissionItem.productId,
          'UNREGISTER'
        );
        productRegUpdates[eventRegId] = {
          ...admissionItemAndSessionRegUpdates
        };
      }

      // remove conflicting quantity items
      if (quantityItemValidationResults && !quantityItemValidationResults.isValid) {
        for (const invalidQuantityItem of quantityItemValidationResults.invalidQuantityItems) {
          const updateCount =
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            (quantityItemValidationResults.invalidQuantityItemCounts &&
              quantityItemValidationResults.invalidQuantityItemCounts[invalidQuantityItem.id]) ||
            0;
          await dispatch(updateQuantity(eventRegId, invalidQuantityItem.id, updateCount));
        }
      }

      // reset amount to 0 for conflicting donation items
      if (donationItemValidationResults && !donationItemValidationResults.isValid) {
        donationItemsRemoved[eventRegId] = [];
        for (const donationItem of donationItemValidationResults.invalidDonationItems) {
          await dispatch(updateDonationAmount(donationItem.id, 0));
          donationItemsRemoved[eventRegId].push(donationItem.id);
        }
      }
    }

    if (sessionBundleUnRegisterInput.length > 0) {
      // find guest evt reg Id and update its product if handler is triggered on current single guest evt reg
      const currentGuestEvtRegId = updateGuestDetails ? Object.keys(validationResults)[0] : null;
      const guestSessionBundleAndSessionRegUpdate = await dispatch(
        handleRegTypeConflictSessionBundles(apolloClient, regCart, sessionBundleUnRegisterInput, currentGuestEvtRegId)
      );
      if (currentGuestEvtRegId && guestSessionBundleAndSessionRegUpdate) {
        productRegUpdates[currentGuestEvtRegId] = {
          ...guestSessionBundleAndSessionRegUpdate
        };
      }
    }

    // when updateGuestDetails is defined, meaning current handler is triggered on current single guest evt reg
    if (updateGuestDetails) {
      let guestEventRegistration = getTemporaryGuestEventRegistration(getState());
      guestEventRegistration = {
        ...guestEventRegistration,
        ...productRegUpdates[guestEventRegistration.eventRegistrationId]
      };
      await dispatch(setCurrentGuestEventRegistration(guestEventRegistration));
      await dispatch(updateGuestDetails());
      dispatch(closeDialogContainer());
      await dispatch(returnToProcessStart());
    } else {
      if (removeGroupMembers) {
        const eventRegistrations = regCart.eventRegistrations;
        const groupMemberRegIds = Object.values(eventRegistrations)
          .filter(eventReg => isGroupMember(state, (eventReg as $TSFixMe).eventRegistrationId))
          .map(eventReg => (eventReg as $TSFixMe).eventRegistrationId);
        await dispatch(removeGroupMembersFromRegCart(groupMemberRegIds));
      }
      await dispatch(
        applyPartialEventRegistrationUpdate(
          primaryRegistrationId,
          productRegUpdates[primaryRegistrationId],
          productRegUpdates,
          undefined,
          undefined,
          donationItemsRemoved
        )
      );
      if (guestRegistrationsValidationResultsForPrimary && !guestRegistrationsValidationResultsForPrimary.isValid) {
        let regCartWithGuestUpdates = regCart;
        const invalidGuestRegistrations = guestRegistrationsValidationResultsForPrimary.invalidGuestRegistrations || [];
        if (invalidGuestRegistrations.length > 0) {
          invalidGuestRegistrations.forEach(guestEventReg => {
            regCartWithGuestUpdates = setIn(
              regCartWithGuestUpdates,
              ['eventRegistrations', guestEventReg.eventRegistrationId, 'registrationTypeId'],
              defaultRegistrationTypeId
            );
          });
        } else {
          regCartWithGuestUpdates = await updateRegCartWithGuests(
            getState(),
            getEventId(getState()),
            regCart,
            guestRegistrationsValidationResultsForPrimary.guestCount,
            primaryRegistrationId,
            getState().text.translate
          );
        }
        await dispatch(updateGuestsInRegCart(regCartWithGuestUpdates));
      }

      if (additionalActions) {
        await dispatch(additionalActions());
      }
      await dispatch(
        postInvalidDataRemoval(
          primaryRegistrationId,
          newPrimaryRegistrationTypeId,
          !canProceedWithoutUserConfirmation(state, validationResults)
        )
      );
    }
  };
}

/**
 * performs reg type change and related operations after conflicts are removed
 */
function postInvalidDataRemoval(primaryRegistrationId, newRegistrationTypeId, goBackInProcess) {
  return async (dispatch, getState) => {
    try {
      await dispatch(
        applyPartialEventRegistrationUpdate(primaryRegistrationId, { registrationTypeId: newRegistrationTypeId })
      );
      await dispatch(
        filterEventSnapshot(
          getState().eventSnapshotVersion,
          newRegistrationTypeId,
          getRegistrationPathIdOrDefault(getState())
        )
      );
      if (goBackInProcess) {
        await dispatch(returnToProcessStart());
      }
      dispatch(closeDialogContainer());
    } catch (ex) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      if (getUpdateErrors.isPrivateEvent(ex, getState())) {
        dispatch(closeDialogContainer());
        return await dispatch(openPrivateEventErrorDialog());
      }
      throw ex;
    }
  };
}
