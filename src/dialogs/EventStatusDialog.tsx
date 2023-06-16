import React from 'react';
import * as EventStatus from 'event-widgets/clients/EventStatus';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import StandardDialog from './shared/StandardDialog';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import EventStatusStyles from './EventStatusDialog.less';
import { withStyles } from './ThemedDialog';

import Logger from '@cvent/nucleus-logging';
const LOG = new Logger('EventStatusDialog');

const Dialog = withStyles(StandardDialog);

/**
 * Helper function to open the event status dialog.
 */
export const openEventStatusDialog = (eventStatus: $TSFixMe, translate: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    let title;
    let message;
    let subMessage;
    let icon;
    let iconModifier;
    switch (eventStatus) {
      case EventStatus.COMPLETED:
        title = 'EventGuestSide_EventStatusDialog_CompletedTitle__resx';
        subMessage = 'EventGuestSide_EventStatusDialog_CompletedMessage__resx';
        icon = 'time';
        iconModifier = 'success';
        break;
      case EventStatus.CLOSED:
        title = 'EventGuestSide_EventStatusDialog_ClosedTitle__resx';
        subMessage = 'EventGuestSide_EventStatusDialog_ClosedMessage__resx';
        icon = 'time';
        iconModifier = 'error';
        break;
      case EventStatus.CANCELLED:
        title = 'EventGuestSide_EventStatusDialog_CancelledTitle__resx';
        message = 'EventGuestSide_EventStatusDialog_CancelledMessage__resx';
        subMessage = 'EventGuestSide_EventStatusDialog_CancelledSubMessage__resx';
        icon = 'error';
        iconModifier = 'error';
        break;
      default:
        LOG.error(`Event status dialog opened with invalid status: '${eventStatus}'`);
    }
    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <Dialog
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        title={translate(title)}
        message={translate(message)}
        subMessage={translate(subMessage, {
          eventName: translate(getState().event.title)
        })}
        icon={icon}
        iconModifier={iconModifier}
        onClose={boundCloseDialog}
        classes={EventStatusStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: {
          dialogContainer: EventStatusStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
