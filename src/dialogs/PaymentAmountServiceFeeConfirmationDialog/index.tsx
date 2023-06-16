import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PaymentAmountServiceFeeConfirmationDialogStles from './PaymentAmountServiceFeeConfirmationDialog.less';
import PaymentAmountServiceFeeConfirmationDialog from './PaymentAmountServiceFeeConfirmationDialog';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openPaymentAmountServiceFeeConfirmationDialog = (submitForm?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialogConfig = {
      style: getState().website.theme.global
    };
    const dialog = <PaymentAmountServiceFeeConfirmationDialog dialogConfig={dialogConfig} submitForm={submitForm} />;
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: PaymentAmountServiceFeeConfirmationDialogStles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
