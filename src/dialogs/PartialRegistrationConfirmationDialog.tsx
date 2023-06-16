import React from 'react';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import StandardDialog from './shared/StandardDialog';
import DialogStyles from './styles/DialogConfirmation.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openPartialRegistrationConfirmationDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const translate = getState().text.translate;
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        message={translate('EventGuestSide_RegistrationConfirmation_TimeoutTitle_resx')}
        subMessage={translate('EventGuestSide_RegistrationConfirmation_TimeoutMessage_resx')}
        title={translate('EventGuestSide_RegistrationConfirmation_Title__resx')}
        icon="registrationApproval"
        iconModifier="registrationApproval"
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
