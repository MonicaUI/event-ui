import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './styles/DialogError.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openCapacityReachedDialog = ({ message, subMessage }: $TSFixMe = {}) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <Dialog
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={message || translate('EventGuestSide_CapacityReached_Error__resx')}
        subMessage={subMessage || translate('EventGuestSide_ApiError_ProductClosed__resx')}
        title={translate('EventGuestSide_CapacityReached_Title__resx')}
        icon="error"
        iconModifier="error"
        translate={translate}
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
