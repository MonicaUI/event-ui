import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './styles/DialogConfirmation.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openEventWaitlistDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('EventGuestSide_EventWaitlist_SuccessfulWaitlist_Message__resx')}
        subMessage={translate('EventGuestSide_EventWaitlist_SuccessfulWaitlist_SubMessage__resx')}
        title={translate('EventGuestside_EventWaitlist_WaitlistTitle__resx')}
        icon="eventWaitlist"
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
