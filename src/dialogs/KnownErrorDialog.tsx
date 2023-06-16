import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from './styles/DialogError.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openKnownErrorDialog = (
  subMessage?: $TSFixMe,
  message?: $TSFixMe,
  additionalActions?: $TSFixMe,
  hideMessage?: $TSFixMe,
  headerText?: $TSFixMe
) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
      if (additionalActions && typeof additionalActions === 'function') {
        dispatch(additionalActions());
      }
    };
    const title = translate(headerText) || translate('EventGuestSide_KnownError_Title__resx');
    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={!hideMessage && (translate(message) || translate('EventGuestside_KnownError_Error__resx'))}
        subMessage={translate(subMessage)}
        title={title}
        icon="error"
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
