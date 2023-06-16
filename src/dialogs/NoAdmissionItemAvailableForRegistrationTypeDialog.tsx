import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogErrorStyles from './styles/DialogError.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openNoAdmissionItemAvailableForRegistrationTypeDialog = (additionalActions?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
      if (additionalActions && typeof additionalActions === 'function') {
        dispatch(additionalActions());
      }
    };
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('EventGuestSide_RegistrationTypeConflict_Title_resx')}
        subMessage={translate('EventGuestSide_RegistrationTypeError_NoAdmissionItemAvailableHelpText_resx')}
        title={translate('EventGuestSide_RegistrationTypeConflict_Title_resx')}
        icon="error"
        iconModifier="error"
        classes={DialogErrorStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: DialogErrorStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
