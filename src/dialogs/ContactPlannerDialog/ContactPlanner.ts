import { connect } from 'react-redux';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { setContactPlannerField, resetContactForm } from '../../redux/contactForm';
import { requestContactPlanner, resetContactPlanner } from '../../redux/contactPlanner';
import ContactPlannerForm from './ContactPlannerForm';
import { openPreviewModeWarningDialog } from '../PreviewModeWarningDialog';
import { withStyles } from '../ThemedDialog';

import DialogStyles from '../styles/StandardDialog.less';
import ContactPlannerStyles from './ContactPlanner.less';
import FormElementStyles from 'nucleus-core/less/cv/Forms.less';
import TextInputStyles from 'nucleus-core/less/cv/TextInput.less';
import FormLabelStyles from 'nucleus-core/less/cv/Labels.less';

const classes = {
  ...DialogStyles,
  ...ContactPlannerStyles,
  ...TextInputStyles,
  form: {
    ...FormElementStyles,
    ...TextInputStyles,
    inputContainer: FormElementStyles.inputContainerOnRight,
    element: ContactPlannerStyles.element,
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

const Dialog = withStyles(ContactPlannerForm);

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

const onSubmit = () => {
  return (dispatch, getState) => {
    const isPreview = getState().defaultUserSession.isPreview;
    if (isPreview) {
      dispatch(resetContactForm());
      dispatch(openPreviewModeWarningDialog());
    } else {
      dispatch(requestContactPlanner());
    }
  };
};

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const {
      contactForm: { senderEmailAddress, message, autoFocus }
    } = state;
    const { widgetStyles } = props;
    return {
      ...props.dialogConfig,
      classes,
      styles: { ...widgetStyles.contactUsModalStyles },
      senderEmailAddress,
      message,
      translate: state.text.translate,
      contactPlannerSuccess: state.contactPlanner.contactPlannerSuccess,
      contactPlannerError: state.contactPlanner.contactPlannerError,
      autoFocus
    };
  },
  {
    requestClose: boundCloseDialog,
    onSubmit,
    onChange: setContactPlannerField,
    resetContactForm,
    resetContactPlanner
  }
)(Dialog);
