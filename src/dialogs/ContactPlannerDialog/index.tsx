import React from 'react';
import ContactPlanner from './ContactPlanner';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { turnOnAutoFocus } from '../../redux/contactForm';

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openContactPlannerDialog = (openDialogConfig: $TSFixMe, contactInfo: $TSFixMe, widgetStyles: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    dispatch(turnOnAutoFocus());
    const dialog = (
      <ContactPlanner dialogConfig={openDialogConfig} contactInfo={contactInfo} widgetStyles={widgetStyles} />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
