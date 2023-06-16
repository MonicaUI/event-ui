import React from 'react';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './SelectionConflictDialog.less';
import { unSelectAdmissionItem } from '../../redux/registrationForm/actions';
import { unSelectSession } from '../../redux/registrationForm/regCart/sessions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { updateGuestsInRegCart, updateRegCartWithGuests } from '../../redux/registrationForm/regCart';

import { getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import { getEventId } from '../../redux/selectors/event';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { updateQuantity } from '../../redux/registrationForm/regCart/quantityItems';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
import StandardDialog from '../shared/StandardDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { updateDonationAmount } from '../../redux/registrationForm/regCart/donationItems';
import { clearHotelRoomRequests } from '../../redux/travelCart';
import { isGuestProductSelectionEnabledOnRegPath } from '../../redux/selectors/currentRegistrationPath';
import {
  buildUnregisterSessionBundlesInput,
  handleRegTypeConflictSessionBundles
} from '../../redux/registrationForm/regCart/sessionBundles';
import { getRegCart } from '../../redux/selectors/shared';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

/**
 * A dialog which notifies the user that id confirmation has changed their registration type
 * causing errors in their registration cart. Once they confirm any invalid items will be removed
 * and the provided callback will be called
 */

export function openIdConfirmationConflictDialog(validationResults: $TSFixMe, callBack: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      text: { translate }
    } = getState();
    const boundContinueSelection = async () => {
      return await dispatch(withLoading(continueSelection)(validationResults, callBack));
    };
    const dialog = (
      <Dialog
        {...injectTestId('id-confirmation-conflict-dialog')}
        title={translate('EventGuestSide_IdConfirmationConflict_Title__resx')}
        message={translate('EventGuestSide_IdConfirmationConflict_Title__resx')}
        subMessage={translate('EventGuestSide_IdConfirmationConflict_InformationalText__resx')}
        content={translate('EventGuestSide_IdConfirmationConflict_InstructionalText__resx')}
        primaryButtonText={translate('EventGuestSide_IdConfirmationConflict_Ok__resx')}
        confirm={boundContinueSelection}
        onClose={boundContinueSelection}
        icon="attentionWarning"
        iconModifier="error"
        classes={DialogStyles}
      />
    );
    dispatch(
      openDialogContainer(dialog, undefined, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}

async function handleInvalidHotelRoomBookings(hotelBookingValidationResults, dispatch) {
  // remove any invalid hotel room bookings
  if (hotelBookingValidationResults && !hotelBookingValidationResults.isValid) {
    await dispatch(clearHotelRoomRequests(hotelBookingValidationResults.invalidHotelRoomBookings));
  }
}

/**
 * Removes any invalid sessions and admission items for the registration type type and selects the registration type.
 */
function continueSelection(validationResults, callBack) {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    if (validationResults) {
      const {
        admissionItemValidationResults,
        sessionsValidationResults,
        guestRegistrationsValidationResults,
        quantityItemValidationResults,
        donationItemValidationResults,
        hotelBookingValidationResults,
        sessionBundleValidationResults
      } = validationResults;
      const currentEventRegistrationId = getEventRegistrationId(getState());

      if (sessionsValidationResults && !sessionsValidationResults.isValid) {
        for (const session of sessionsValidationResults.invalidSessions) {
          await dispatch(unSelectSession(currentEventRegistrationId, session.id));
        }
      }

      if (admissionItemValidationResults && !admissionItemValidationResults.isValid) {
        await dispatch(unSelectAdmissionItem(currentEventRegistrationId));
      }

      if (quantityItemValidationResults && !quantityItemValidationResults.isValid) {
        for (const quantityItem of quantityItemValidationResults.invalidQuantityItems) {
          const updateCount =
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            (quantityItemValidationResults.invalidQuantityItemCounts &&
              quantityItemValidationResults.invalidQuantityItemCounts[quantityItem.id]) ||
            0;
          await dispatch(updateQuantity(currentEventRegistrationId, quantityItem.id, updateCount));
        }
      }

      // reset amount to 0 for conflicting donation items
      if (donationItemValidationResults && !donationItemValidationResults.isValid) {
        for (const donationItem of donationItemValidationResults.invalidDonationItems) {
          await dispatch(updateDonationAmount(donationItem.id, 0));
        }
      }

      if (sessionBundleValidationResults && !sessionBundleValidationResults.isValid) {
        const regCart = getRegCart(getState());
        const guestApplySameProductToAgenda = !isGuestProductSelectionEnabledOnRegPath(getState());
        const { invalidSessionBundles } = sessionBundleValidationResults;
        const sessionBundleUnRegisterInput = buildUnregisterSessionBundlesInput(
          regCart,
          currentEventRegistrationId,
          invalidSessionBundles,
          guestApplySameProductToAgenda
        );
        await dispatch(handleRegTypeConflictSessionBundles(apolloClient, regCart, sessionBundleUnRegisterInput));
      }

      await handleInvalidHotelRoomBookings(hotelBookingValidationResults, dispatch);

      if (!guestRegistrationsValidationResults.isValid) {
        const {
          registrationForm: { regCart }
        } = getState();
        const regCartWithGuestUpdates = await updateRegCartWithGuests(
          getState(),
          getEventId(getState()),
          regCart,
          guestRegistrationsValidationResults.guestCount,
          currentEventRegistrationId,
          getState().text.translate
        );
        await dispatch(updateGuestsInRegCart(regCartWithGuestUpdates));
      }
    }
    await dispatch(callBack());
    dispatch(closeDialogContainer());
  };
}
