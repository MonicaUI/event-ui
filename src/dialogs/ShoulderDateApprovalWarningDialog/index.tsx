import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import ShoulderDateApprovalWarningDialogStyles from './ShoulderDateApprovalWarningDialog.less';
import ShoulderDateApprovalWarningDialog from './ShoulderDateApprovalWarningDialog';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openShoulderDateApprovalWarningDialog = (
  confirmCallback: $TSFixMe,
  shoulderDates: $TSFixMe,
  roomRates: $TSFixMe,
  eventTimezone: $TSFixMe
) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialogConfig = {
      style: getState().website.theme.global
    };
    const dialog = (
      <ShoulderDateApprovalWarningDialog
        dialogConfig={dialogConfig}
        translate={getState().text.translate}
        translateDate={getState().text.translateDate}
        translateCurrency={getState().text.resolver.currency}
        confirmCallback={confirmCallback}
        shoulderDates={shoulderDates}
        roomRates={roomRates}
        eventTimezone={eventTimezone}
      />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: ShoulderDateApprovalWarningDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
