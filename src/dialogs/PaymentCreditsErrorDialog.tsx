import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PaymentCreditsErrorDialogStyles from './styles/DialogError.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';
import { updatePaymentCreditsInRegCart } from '../redux/registrationForm/regCart';

const Dialog = withStyles(StandardDialog);

export const openPaymentCreditsErrorDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = async () => {
      // refresh credits in cart and fetch the updated pricing before closing the dialog
      await dispatch(updatePaymentCreditsInRegCart());
      dispatch(closeDialogContainer());
    };

    const errorMessage = `${translate('EventWidgets_PaymentCredits_UpdatedModalFirstLine__resx')}
    ${translate('EventWidgets_PaymentCredits_UpdatedModalSecondLine__resx')}`;
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        title={translate('EventWidgets_PaymentCredits_UpdatedModal__resx')}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        subMessage={errorMessage}
        icon="attentionWarning"
        iconModifier="error"
        classes={PaymentCreditsErrorDialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: PaymentCreditsErrorDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
