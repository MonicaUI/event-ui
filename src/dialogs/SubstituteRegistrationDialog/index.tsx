import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { turnOnAutoFocus } from '../../redux/registrationSubstitution/reducer';
import SubstituteRegistration from './SubstituteRegistration';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openSubstituteRegistrationDialog = (openDialogConfig: $TSFixMe, widgetStyles: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    dispatch(turnOnAutoFocus());
    const dialog = <SubstituteRegistration dialogTitle={openDialogConfig} widgetStyles={widgetStyles} />;
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};

export default openSubstituteRegistrationDialog;
