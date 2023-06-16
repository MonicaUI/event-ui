import React from 'react';
import StandardDialog from './shared/StandardDialog';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import DialogStyles from './styles/InvalidPhoneDialog.less';
import { withStyles, withCancelAndConfirmButtons } from './ThemedDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';
import { scrollToFieldAndFocus } from './shared/dialogUtils';
import type { AppThunk } from '../redux/reducer';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

type CallbackFn = () => AppThunk<Promise<void>>;

/**
 * A dialog which notifies the user that the format of their mobile number is invalid. Pressing ESC,
 * or the X in the corner will close the dialog, the continue button will close the dialog and proceed
 * with the registration process, and the reenter button will close the dialog and scroll and focus on
 * the text input box for the mobile number.
 */

export const openInvalidPhoneNumberDialog = (ignoreWarningAndContinueRegistration: CallbackFn): AppThunk => {
  return (dispatch, getState) => {
    const {
      text: { translate }
    } = getState();

    const boundCancelSelection = () => {
      dispatch(closeDialogContainer());
    };
    const boundContinueSelection = async (): Promise<void> => {
      return await dispatch(continueAndCloseDialog(ignoreWarningAndContinueRegistration));
    };
    const boundReenterSelection = () => {
      dispatch(closeDialogContainer());
      scrollToFieldAndFocus(Fields.mobile.id);
    };

    const dialog = (
      <Dialog
        title={translate('Registration_PersonalInformation_PhoneNumberFormat_Error_BannerHeader__resx')}
        message={translate('Registration_PersonalInformation_PhoneNumberFormat_Error_Header__resx')}
        subMessage={translate('Registration_PersonalInformation_PhoneNumberFormat_Error_Body__resx')}
        primaryButtonText={translate('Registration_PersonalInformation_PhoneNumberFormat_Button_EnterNew__resx')}
        secondaryButtonText={translate('Registration_PersonalInformation_PhoneNumberFormat_Button_Keep__resx')}
        cancel={boundContinueSelection}
        onClose={boundCancelSelection}
        confirm={boundReenterSelection}
        classes={DialogStyles}
      />
    );

    dispatch(
      openDialogContainer(dialog, boundCancelSelection, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};

function continueAndCloseDialog(ignoreWarningAndContinueRegistration: CallbackFn): AppThunk<Promise<void>> {
  return async dispatch => {
    dispatch(closeDialogContainer());
    void dispatch(ignoreWarningAndContinueRegistration());
  };
}
