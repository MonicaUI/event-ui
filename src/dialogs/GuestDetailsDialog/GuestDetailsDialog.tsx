import React from 'react';
import GuestDetailsDialogStyles from './GuestDetailsDialog.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import Logger from '@cvent/nucleus-logging';
import {
  updateGuestsInRegCart,
  removeGuestByEventRegistrationId,
  clearTemporaryGuestInformation,
  setCurrentGuestEventRegistration
} from '../../redux/registrationForm/regCart';
import { setEventRegistrationFieldValue } from '../../redux/registrationForm/regCart/actions';
import loadPageResources from 'nucleus-widgets/utils/layout/loadPageResources';

// selectors
import { isGuestEditMode, getTemporaryGuestEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import { getRegistrationPathId } from '../../redux/selectors/currentRegistrationPath';
import {
  getEventRegistration,
  getRegistrationPathId as getRegistrationPathIdRegCart
} from '../../redux/registrationForm/regCart/selectors';
import { GUEST_REGISTRATION, getGuestDetailsPage } from '../../redux/website/registrationProcesses';
import { evaluateQuestionVisibilityLogic, loadRegistrationContent } from '../../redux/actions';
import GuestDetailsForm from './GuestDetailsForm';

const LOG = new Logger('/components/GuestRemoveDialog');

function setGuestEditMode(eventRegistrationId, value) {
  return setEventRegistrationFieldValue(eventRegistrationId, ['attendee', 'isEditMode'], value);
}

export const openGuestDetailsDialog = (guestRegistrationId?: $TSFixMe, editMode = true) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      registrationForm: { regCart }
    } = getState();
    let currentRegPathId = getRegistrationPathId(getState());
    /**
     * if the passed in parameter is a string then must have arrived through edit link
     * so set the passed in registrationId into currentGuest and make editMode true
     */
    if (guestRegistrationId && typeof guestRegistrationId === 'string') {
      const guestToBeEdited = getEventRegistration(regCart, guestRegistrationId);
      dispatch(setGuestEditMode(guestRegistrationId, editMode));
      await dispatch(setCurrentGuestEventRegistration(guestToBeEdited));
      currentRegPathId = getRegistrationPathIdRegCart(regCart, guestToBeEdited.primaryRegistrationId);
    }
    const currentGuestEventRegistrationId = getTemporaryGuestEventRegistrationId(getState());

    await dispatch(loadRegistrationContent(GUEST_REGISTRATION, currentRegPathId));
    const guestDetailsPage = getGuestDetailsPage(getState(), currentRegPathId);
    const dialogConfig = {
      style: getState().website.theme.global
    };

    const boundCloseDialog = async () => {
      if (isGuestEditMode(getState())) {
        await dispatch(clearTemporaryGuestInformation());
        return dispatch(closeDialogContainer());
      }
      const updatedRegCart = await removeGuestByEventRegistrationId(regCart, currentGuestEventRegistrationId);
      LOG.debug('Regcart after guest removal', updatedRegCart);
      dispatch(updateGuestsInRegCart(updatedRegCart));
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <GuestDetailsForm
        guestDetailsPage={guestDetailsPage}
        dialogConfig={dialogConfig}
        translate={getState().text.translate}
      />
    );

    await dispatch(loadPageResources(getState().website, guestDetailsPage.id));

    await dispatch(evaluateQuestionVisibilityLogic(null, true, true));
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: {
          dialogContainer: GuestDetailsDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
