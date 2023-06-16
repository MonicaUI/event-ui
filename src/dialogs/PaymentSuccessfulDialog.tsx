import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import DialogStyles from './styles/DialogConfirmation.less';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openPaymentSuccessfulDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        title={translate('EventGuestSide_PaymentSuccessful_Message__resx')}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('EventGuestSide_PaymentSuccessful_Message__resx')}
        subMessage={translate('EventGuestSide_PaymentSuccessful_SubMessage__resx')}
        icon="selectCircle"
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
