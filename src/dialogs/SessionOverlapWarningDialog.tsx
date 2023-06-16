import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import SessionOverlapWarningDialogStyles from './styles/DialogError.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';

export const openSessionOverlapWarningDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <StandardDialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        subMessage={translate('RegistrationProcess_Sessions_NoOverlapValidation__resx')}
        icon="error"
        iconModifier="error"
        classes={SessionOverlapWarningDialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: SessionOverlapWarningDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
