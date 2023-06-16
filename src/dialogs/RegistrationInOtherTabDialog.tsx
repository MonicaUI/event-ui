import React from 'react';
import { openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import StandardDialog from './shared/StandardDialog';
import EventStatusStyles from './EventStatusDialog.less';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { withStyles, withCancelAndConfirmButtons } from './ThemedDialog';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

/**
 * Helper function to open the event status dialog.
 */
export const openRegistrationInOtherTabDialog = (exitRegistration?: $TSFixMe, continueRegistration?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      text: { translate }
    } = getState();
    const dialog = (
      <Dialog
        title={translate('EventGuestsideSite_RegisteringInOtherTabDialog_Header__resx')}
        message={translate('EventGuestsideSite_RegisteringInOtherTabDialog_RegistrationIsOpenInAnotherTab__resx')}
        subMessage={translate('EventGuestsideSite_RegisteringInOtherTabDialog_ClickYesToContinueRegistration__resx')}
        icon="warning"
        secondaryButtonText={translate('EventWidgets_GenericText_No__resx')}
        primaryButtonText={translate('EventWidgets_GenericText_Yes__resx')}
        cancel={exitRegistration}
        confirm={continueRegistration}
        classes={EventStatusStyles}
        translate={translate}
      />
    );
    return dispatch(
      openDialogContainer(dialog, undefined, {
        classes: { dialogContainer: EventStatusStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
