import React from 'react';
import CancelRegistration from './CancelRegistration';
import CancelRegistrationStyles from '../shared/Confirmation.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openCancelRegistrationDialog = (openDialogConfig: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialog = <CancelRegistration dialogConfig={openDialogConfig} />;
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: CancelRegistrationStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
