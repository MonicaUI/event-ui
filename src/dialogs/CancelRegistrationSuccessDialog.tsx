import React from 'react';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import StandardDialog from './shared/StandardDialog';
import DialogStyles from './styles/DialogConfirmation.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openCancelRegistrationSuccessConfirmationDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const translate = getState().text.translate;
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        title={translate('EventGuestSide_CancelRegistration_SuccessTitle__resx')}
        message={translate('EventGuestSide_CancelRegistration_SuccessCancellation_Message__resx')}
        subMessage={translate('EventGuestSide_CancelRegistration_SuccessMessage__resx')}
        icon="cancelRegistration"
        classes={DialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
