import React from 'react';
import { returnToProcessStart } from './SelectionConflictDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './SelectionConflictDialog.less';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { removeGuestByEventRegistrationId, updateGuestsInRegCart } from '../../redux/registrationForm/regCart';
import { getRegCart } from '../../redux/selectors/shared';
import { isEmpty } from 'lodash';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
import StandardDialog from '../shared/StandardDialog';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

/**
 * A dialog which notifies the user that they have to either go back and pick admission items
 * for their guests or the guests without admission items will be removed.
 */
export function openGuestNavigationConflictDialog(guestEventRegIdsToRemove: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      text: { translate }
    } = getState();
    const boundContinueSelection = () => dispatch(returnToProcessStart());
    const boundCancelSelection = async () => {
      return await dispatch(withLoading(cancelSelection)(guestEventRegIdsToRemove));
    };
    const dialog = (
      <Dialog
        {...injectTestId('guestNavigation-confirmation-conflict-dialog')}
        title={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Title__resx')}
        message={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Title__resx')}
        subMessage={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_InformationalText__resx')}
        content={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_InstructionalText__resx')}
        primaryButtonText={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Ok__resx')}
        confirm={boundContinueSelection}
        secondaryButtonText={translate('EventGuestSide_AdmissionItemRegistrationTypeConflict_Cancel__resx')}
        cancel={boundCancelSelection}
        onClose={boundCancelSelection}
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

/**
 * Removes any guests that are missing an admission item
 */
export function cancelSelection(guestEventRegIdsToRemove: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const regCart = getRegCart(getState());
    dispatch(closeDialogContainer());
    if (isEmpty(guestEventRegIdsToRemove)) {
      return;
    }
    let regCartWithRemovedGuests = regCart;
    for (const guestEventRegId of guestEventRegIdsToRemove) {
      regCartWithRemovedGuests = await removeGuestByEventRegistrationId(regCartWithRemovedGuests, guestEventRegId);
    }
    await dispatch(updateGuestsInRegCart(regCartWithRemovedGuests, false));
  };
}
