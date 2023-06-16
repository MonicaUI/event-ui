import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './styles/DialogError.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

/**
 * Helper function to open the event attending format switch dialog.
 */
export const openEventAttendingFormatSwitchDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <Dialog
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        title={translate('EventGuestSide_EventAttendingFormatSwitch_Title__resx')}
        message={translate('EventGuestSide_EventAttendingFormatSwitch_Message__resx')}
        subMessage={translate('EventGuestSide_EventAttendingFormatSwitch_SubMessage__resx')}
        icon="error"
        iconModifier="error"
        onClose={boundCloseDialog}
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
