import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import InvitationForwarding from './InvitationForwarding';
import { turnOnAutoFocus } from '../../redux/invitationForwarding';

export const boundCloseDialog = () => {
  return (dispatch: $TSFixMe): $TSFixMe => dispatch(closeDialogContainer());
};

export const openInvitationForwardingDialog = (openDialogConfig: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    dispatch(turnOnAutoFocus());
    const dialog = <InvitationForwarding dialogConfig={openDialogConfig} />;
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};

export default openInvitationForwardingDialog;
