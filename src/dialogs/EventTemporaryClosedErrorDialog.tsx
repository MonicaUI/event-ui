import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventTemporaryClosedErrorDialogStyles from './styles/DialogError.less';
import { routeToHomePage } from '../redux/pathInfo';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles } from './ThemedDialog';

const Dialog = withStyles(StandardDialog);

export const openEventTemporaryClosedErrorDialog = (subMessage?: $TSFixMe, shouldRouteToHomePage = true) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = async () => {
      await dispatch(closeDialogContainer());
      if (shouldRouteToHomePage) {
        dispatch(routeToHomePage());
      }
    };

    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('EventGuestSide_EventTemporaryClosed_Error_Message__resx')}
        subMessage={translate(subMessage) || translate('EventGuestSide_EventTemporaryClosed_Error_SubMessage__resx')}
        title={translate('EventGuestSide_EventTemporaryClosed_Title__resx')}
        icon="lock"
        iconModifier="error"
        classes={EventTemporaryClosedErrorDialogStyles}
      />
    );

    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: EventTemporaryClosedErrorDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
