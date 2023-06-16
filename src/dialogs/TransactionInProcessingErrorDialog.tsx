import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import TransactionInProcessingErrorDialogStyles from './styles/DialogError.less';
import { routeToHomePage } from '../redux/pathInfo';
import getDialogContainerStyle from './shared/getDialogContainerStyle';

export const openTransactionInProcessingErrorDialog = (subMessage?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = async () => {
      await dispatch(closeDialogContainer());
      dispatch(routeToHomePage());
    };

    const dialog = (
      <StandardDialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('EventGuestSide_TransactionInProcessing_Error_Message__resx')}
        subMessage={translate(subMessage) || translate('EventGuestside_ApiError_TransactionInProcessing__resx')}
        icon="lock"
        iconModifier="error"
        classes={TransactionInProcessingErrorDialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: TransactionInProcessingErrorDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
