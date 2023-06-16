import React from 'react';
import { closeDialogContainer, openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import PaymentAmountServiceFeeConfirmationPostRegDialog from './PaymentAmountServiceFeeConfirmationPostRegDialog';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openPaymentAmountServiceFeeConfirmationPostRegDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialogConfig = {
      style: getState().website.theme.global
    };
    const dialog = <PaymentAmountServiceFeeConfirmationPostRegDialog dialogConfig={dialogConfig} />;

    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
