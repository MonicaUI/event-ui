import React from 'react';
import { returnToProcessStart } from './SelectionConflictDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import DialogStyles from './SelectionConflictDialog.less';
import {
  applyPartialEventRegistrationUpdate,
  updateAdmissionItemRegistration
} from '../../redux/registrationForm/regCart';
import { getLastSavedRegCart, updateSessionWaitlist } from '../../redux/registrationForm/regCart/internal';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { clearAirRequests, clearHotelRoomRequests } from '../../redux/travelCart';

import { getRegCart } from '../../redux/selectors/shared';
import {
  getEventRegistration,
  getEventRegistrationId,
  guests,
  isRegistrationModification
} from '../../redux/selectors/currentRegistrant';
import { getEventRegistration as getEventRegistrationRegCart } from '../../redux/registrationForm/regCart/selectors';
import { populateVisibleProducts, populateRegCartVisibleProducts } from '../../redux/visibleProducts';
import { updateQuantity } from '../../redux/registrationForm/regCart/quantityItems';
import { updateDonationAmount } from '../../redux/registrationForm/regCart/donationItems';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
import StandardDialog from '../shared/StandardDialog';
import { handleOptionalSessionsConflicts } from '../../redux/registrationForm/regCart/sessions';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

const areHotelRoomBookingsInvalid = hotelBookingValidationResults => {
  return (
    hotelBookingValidationResults &&
    !hotelBookingValidationResults.isValid &&
    hotelBookingValidationResults.invalidTravelBookings &&
    hotelBookingValidationResults.invalidTravelBookings.length > 0
  );
};

/**
 * A dialog which allows the registrant to confirm their new admission item selection when the admission item
 * will cause errors in their registration cart. If they decide to choose the new admission item,
 * any invalid sessions will be removed and they will be brought to the beginning of registration
 * in order to update their selections.
 */
export function openAdmissionItemSelectionConflictDialog(validationResults: $TSFixMe, admissionItemUpdates?: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      text: { translate }
    } = getState();
    const boundCancelSelection = () => dispatch(closeDialogContainer());
    const boundContinueSelection = async () =>
      await dispatch(withLoading(continueSelection)(validationResults, admissionItemUpdates));
    const dialog = (
      <Dialog
        {...injectTestId('admission-item-selection-conflict-dialog')}
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
    return dispatch(
      openDialogContainer(dialog, boundCancelSelection, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}

/**
 * Removes any invalid sessions for the admission item and selects the admission item.
 */
function continueSelection(validationResults, admissionItemUpdates) {
  // eslint-disable-next-line complexity
  return async (dispatch, getState) => {
    const currentPrimaryEventRegId = getEventRegistrationId(getState());
    const guestRegs = guests(getState());
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const guestEventRegIds = guestRegs && guestRegs.map(guestReg => guestReg.eventRegistrationId);
    // Check If validations are only for the primary + guests(new format) or only for primary(old format)
    const validationsArePerRegistrant =
      // eslint-disable-next-line no-prototype-builtins
      validationResults.hasOwnProperty(currentPrimaryEventRegId) || // eslint-disable-next-line no-prototype-builtins
      guestEventRegIds.some(guestEventRegId => validationResults.hasOwnProperty(guestEventRegId));
    const regCart = getRegCart(getState());
    const donationItemsRemoved = {};

    /*
     * TODO: Once advanced rules and air request validations are per registrant (for primary and guest)
     * remove the if condition and everything within it.
     */
    if (!validationsArePerRegistrant) {
      const {
        sessionsValidationResults,
        airRequestAdvancedRuleValidationResults,
        newAdmissionItem,
        hotelBookingAdvancedRuleValidationResults,
        quantityItemValidationResults,
        includedSessionWaitlistValidationResults,
        donationItemValidationResults,
        hotelBookingValidationResults,
        sessionWaitlistValidationResults
      } = validationResults;
      const primaryEventReg = getEventRegistration(getState());
      // remove any conflicting air requests
      if (
        airRequestAdvancedRuleValidationResults &&
        !airRequestAdvancedRuleValidationResults.isValid &&
        airRequestAdvancedRuleValidationResults.invalidAirBookings &&
        airRequestAdvancedRuleValidationResults.invalidAirBookings.length > 0
      ) {
        await dispatch(clearAirRequests(airRequestAdvancedRuleValidationResults.invalidAirBookings));
      }
      const invalidHotelBookings = [];
      if (areHotelRoomBookingsInvalid(hotelBookingValidationResults)) {
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
      // remove any conflicting hotel room booking
      if (invalidHotelBookings.length > 0) {
        await dispatch(clearHotelRoomRequests(invalidHotelBookings));
      }
      const sessionRegUpdates = await dispatch(
        handleOptionalSessionsConflicts(primaryEventReg.eventRegistrationId, sessionsValidationResults.invalidSessions)
      );

      // remove conflicting quantity items
      if (quantityItemValidationResults && !quantityItemValidationResults.isValid) {
        for (const invalidQuantityItem of quantityItemValidationResults.invalidQuantityItems) {
          const updateCount =
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            (quantityItemValidationResults.invalidQuantityItemCounts &&
              quantityItemValidationResults.invalidQuantityItemCounts[invalidQuantityItem.id]) ||
            0;
          await dispatch(updateQuantity(currentPrimaryEventRegId, invalidQuantityItem.id, updateCount));
        }
      }

      // reset amount to 0 for conflicting donation items
      if (donationItemValidationResults && !donationItemValidationResults.isValid) {
        donationItemsRemoved[currentPrimaryEventRegId] = [];
        for (const donationItem of donationItemValidationResults.invalidDonationItems) {
          await dispatch(updateDonationAmount(donationItem.id, 0));
          donationItemsRemoved[currentPrimaryEventRegId].push(donationItem.id);
        }
      }

      let includedWaitlistSessionUpdates = primaryEventReg.sessionWaitlists;

      if (includedSessionWaitlistValidationResults && !includedSessionWaitlistValidationResults.isValid) {
        for (const invalidSession of includedSessionWaitlistValidationResults.invalidWaitlistedSession) {
          includedWaitlistSessionUpdates = updateSessionWaitlist(
            includedWaitlistSessionUpdates,
            invalidSession.id,
            REQUESTED_ACTIONS.LEAVE_WAITLIST,
            getState()
          );
        }
      }

      let waitlistSessionUpdates = primaryEventReg.sessionWaitlists;

      if (sessionWaitlistValidationResults && !sessionWaitlistValidationResults.isValid) {
        for (const invalidSession of sessionWaitlistValidationResults.invalidWaitlistedSession) {
          waitlistSessionUpdates = updateSessionWaitlist(
            waitlistSessionUpdates,
            invalidSession.id,
            REQUESTED_ACTIONS.LEAVE_WAITLIST,
            getState()
          );
        }
      }
      const primaryProductRegUpdates = {
        ...(await updateAdmissionItemRegistration(
          getLastSavedRegCart(getState),
          currentPrimaryEventRegId,
          newAdmissionItem.id,
          'REGISTER'
        )),
        ...sessionRegUpdates,
        ...includedWaitlistSessionUpdates,
        ...waitlistSessionUpdates
      };

      const guestProductRegUpdates = {};
      Object.values(guestEventRegIds).forEach(guestEventRegId => {
        // @ts-expect-error ts-migrate(2538) FIXME: Type 'unknown' cannot be used as an index type.
        guestProductRegUpdates[guestEventRegId] = {
          ...primaryProductRegUpdates
        };
      });

      await dispatch(
        applyPartialEventRegistrationUpdate(
          currentPrimaryEventRegId,
          primaryProductRegUpdates,
          guestProductRegUpdates,
          undefined,
          undefined,
          donationItemsRemoved
        )
      );

      const isRegMod = isRegistrationModification(getState());
      if (isRegMod) {
        await dispatch(populateRegCartVisibleProducts());
      } else {
        await dispatch(populateVisibleProducts());
      }

      await dispatch(returnToProcessStart());
      return dispatch(closeDialogContainer());
    }

    const productRegUpdates = {};
    for (const eventRegId of Object.keys(validationResults)) {
      const {
        sessionsValidationResults,
        airRequestAdvancedRuleValidationResults,
        newAdmissionItem,
        quantityItemValidationResults,
        includedSessionWaitlistValidationResults,
        donationItemValidationResults,
        hotelBookingValidationResults,
        sessionWaitlistValidationResults
      } = validationResults[eventRegId];
      const eventRegistration = getEventRegistrationRegCart(regCart, eventRegId);
      // remove any conflicting air requests
      if (
        airRequestAdvancedRuleValidationResults &&
        !airRequestAdvancedRuleValidationResults.isValid &&
        airRequestAdvancedRuleValidationResults.invalidAirBookings &&
        airRequestAdvancedRuleValidationResults.invalidAirBookings.length > 0
      ) {
        await dispatch(clearAirRequests(airRequestAdvancedRuleValidationResults.invalidAirBookings));
      }
      if (areHotelRoomBookingsInvalid(hotelBookingValidationResults)) {
        await dispatch(clearHotelRoomRequests(hotelBookingValidationResults.invalidTravelBookings));
      }
      const sessionRegUpdates = await dispatch(
        handleOptionalSessionsConflicts(eventRegId, sessionsValidationResults.invalidSessions)
      );

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

      let includedWaitlistSessionUpdates = eventRegistration.sessionWaitlists;

      if (includedSessionWaitlistValidationResults && !includedSessionWaitlistValidationResults.isValid) {
        for (const invalidSession of includedSessionWaitlistValidationResults.invalidWaitlistedSession) {
          includedWaitlistSessionUpdates = updateSessionWaitlist(
            includedWaitlistSessionUpdates,
            invalidSession.id,
            REQUESTED_ACTIONS.LEAVE_WAITLIST,
            getState()
          );
        }
      }

      let waitlistSessionUpdates = eventRegistration.sessionWaitlists;

      if (sessionWaitlistValidationResults && !sessionWaitlistValidationResults.isValid) {
        for (const invalidSession of sessionWaitlistValidationResults.invalidWaitlistedSession) {
          waitlistSessionUpdates = updateSessionWaitlist(
            waitlistSessionUpdates,
            invalidSession.id,
            REQUESTED_ACTIONS.LEAVE_WAITLIST,
            getState()
          );
        }
      }

      productRegUpdates[eventRegId] = {
        ...(await updateAdmissionItemRegistration(
          getLastSavedRegCart(getState),
          eventRegId,
          newAdmissionItem.id,
          'REGISTER'
        )),
        ...sessionRegUpdates,
        ...includedWaitlistSessionUpdates,
        ...waitlistSessionUpdates
      };
    }
    // Include any non conflicting admission item selections for other registrants
    const allProductRegUpdates = {
      ...(admissionItemUpdates || {}),
      ...productRegUpdates
    };
    await dispatch(
      applyPartialEventRegistrationUpdate(
        currentPrimaryEventRegId,
        productRegUpdates[currentPrimaryEventRegId],
        allProductRegUpdates,
        undefined,
        undefined,
        donationItemsRemoved
      )
    );

    const isRegMod = isRegistrationModification(getState());
    if (isRegMod) {
      await dispatch(populateRegCartVisibleProducts());
    } else {
      const promises = Object.entries(allProductRegUpdates).map(([key]) => dispatch(populateVisibleProducts(key)));
      await Promise.all(promises);
    }

    await dispatch(returnToProcessStart());
    dispatch(closeDialogContainer());
  };
}
