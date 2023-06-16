import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PartialRegDialog from './PartialRegDialog';
import PartialRegDialogStyles from './PartialRegDialog.less';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openPartialRegDialog = (regCart: $TSFixMe, validationMessages?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialogConfig = {
      style: getState().website.theme.global
    };
    const dialog = (
      <PartialRegDialog dialogConfig={dialogConfig} regCart={regCart} validationMessages={validationMessages} />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: PartialRegDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
