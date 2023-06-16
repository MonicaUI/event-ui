import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './styles/DialogConfirmation.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openDeclineRegistrationDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        title={translate('EventGuestSide_DeclineRegistration_Header__resx')}
        message={translate('EventGuestSide_DeclineRegistration_SuccessfulDecline_Message__resx')}
        subMessage={translate('EventGuestSide_DeclineRegistration_SuccessfulDecline_SubMessage__resx')}
        icon="registration"
        iconModifier="success"
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
