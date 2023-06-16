import { connect } from 'react-redux';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { setSubstituteRegistrantFields } from '../../redux/registrationSubstitution/reducer';
import {
  removeSubstitutionCart,
  requestConfirmationDeny,
  requestSubstituteRegistrationWithLoading,
  getConfirmationWithLoading,
  abortOriginalSubstitutionCart
} from '../../redux/registrationSubstitution/actions';
import SubstituteRegistrationStyles from './SubstituteRegistration.less';
import FormElementStyles from 'nucleus-core/less/cv/Forms.less';
import TextInputStyles from 'nucleus-core/less/cv/TextInput.less';
import FormLabelStyles from 'nucleus-core/less/cv/Labels.less';
import SubstituteRegistrationForm from './SubstituteRegistrationForm';
import { withStyles } from '../ThemedDialog';
import { defaultMemoize } from 'reselect';
import DialogStyles from '../styles/StandardDialog.less';

const classes = {
  ...DialogStyles,
  ...SubstituteRegistrationStyles,
  ...TextInputStyles,
  form: {
    ...FormElementStyles,
    ...TextInputStyles,
    inputContainer: FormElementStyles.inputContainerOnRight,
    element: SubstituteRegistrationStyles.element,
    label: {
      ...FormLabelStyles,
      label: FormLabelStyles.labelOnTop
    },
    errorMessages: {
      container: FormElementStyles.errorContainer,
      errorText: FormElementStyles.errorText
    }
  }
};

const SubstituteRegistrationDialog = withStyles(SubstituteRegistrationForm);

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

const onSubmit = () => {
  return dispatch => {
    dispatch(requestSubstituteRegistrationWithLoading());
  };
};

const resetSubstituteRegistrationUponClose = () => {
  return dispatch => {
    dispatch(removeSubstitutionCart());
  };
};

const getDialogTitle = defaultMemoize(
  (showConfirmationMessage, hasConfirmed, substituteRegistrationSuccess, defaultTitle) => {
    if (showConfirmationMessage) {
      return 'SubstituteReg_ConfirmationHeader__resx';
    } else if (hasConfirmed && substituteRegistrationSuccess) {
      return 'SubstituteReg_SuccessMsgHeader__resx';
    }
    return defaultTitle;
  }
);

export default defaultMemoize(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const {
        registrationSubstitution: {
          substitutionForm: { firstName, lastName, emailAddress },
          autoFocus,
          showConfirmationMessage,
          hasConfirmed,
          substituteRegistrationSuccess,
          substituteRegistrationError,
          validationList,
          showConcurrentActionMessage,
          cartAborted,
          disableSubmitButton
        }
      } = state;
      return {
        ...props.dialogTitle,
        classes,
        title: getDialogTitle(showConfirmationMessage, hasConfirmed, substituteRegistrationSuccess, props.dialogTitle),
        styles: { ...props.widgetStyles.popupWindowStyles },
        translate: state.text.translate,
        substituteRegistrationSuccess,
        substituteRegistrationError,
        firstName,
        lastName,
        emailAddress,
        autoFocus,
        showConfirmationMessage,
        hasConfirmed,
        validationList,
        showConcurrentActionMessage,
        cartAborted,
        disableSubmitButton
      };
    },
    {
      requestClose: boundCloseDialog,
      onSubmit,
      onChange: setSubstituteRegistrantFields,
      getConfirmation: getConfirmationWithLoading,
      denyConfirmation: requestConfirmationDeny,
      resetSubstituteRegistration: resetSubstituteRegistrationUponClose,
      abortOriginalSubstitutionCart
    }
  )
)(SubstituteRegistrationDialog);
