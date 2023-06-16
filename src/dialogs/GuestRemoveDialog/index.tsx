import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import GuestRemoveDialogStyles from '../shared/Confirmation.less';
import GuestRemoveDialog from './GuestRemoveDialog';
import Logger from '@cvent/nucleus-logging';
import { injectTestId } from '@cvent/nucleus-test-automation';

const LOG = new Logger('/containers/GuestRemoveDialog');

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openGuestRemoveDialog = (eventRegId: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    LOG.debug('Requested to remove guest with id {}', eventRegId);
    const dialogConfig = {
      style: getState().website.theme.global
    };
    const dialog = (
      <GuestRemoveDialog {...injectTestId('guest-remove-dialog')} dialogConfig={dialogConfig} eventRegId={eventRegId} />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: GuestRemoveDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
