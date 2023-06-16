import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './styles/DialogConfirmation.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openPrivateRegistrationPathDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        title={translate('EventGuestSide_PrivateRegistrationPath_Message__resx')}
        message={translate('EventGuestSide_PrivateRegistrationPath_Message__resx')}
        subMessage={translate('EventGuestSide_PrivateRegistrationPath_SubMessage__resx')}
        icon="lock"
        iconModifier="error"
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
