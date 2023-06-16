import React from 'react';
import PropTypes from 'prop-types';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { connect } from 'react-redux';
import { merge } from 'lodash';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import SubstituteRegistrationStyles from '../SubstituteRegistrationDialog/SubstituteRegistration.less';
import FormElementStyles from 'nucleus-core/less/cv/Forms.less';
import TextInputStyles from 'nucleus-core/less/cv/TextInput.less';
import FormLabelStyles from 'nucleus-core/less/cv/Labels.less';
import VariablesColors from 'nucleus-core/less/VariablesColors.less';
import clearImageInTheme from '../shared/clearImageInTheme';
import InvitationForwardingForm from './InvitationForwardingForm';
import { requestForwardingInvitations, resetInvitationForwarding } from '../../redux/invitationForwarding';

/*
 * Invitation Forwarding Dialog that renders the InvitationForwardingForm and passes all the required classes.
 */
class InvitationForwardingDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    style: PropTypes.object
  };
  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;
  getStyleObject() {
    return {
      ...this.props.style,
      dialogHeader: this.getElementInlineStyle('header'),
      title: this.getElementInlineStyle('title'),
      exit: this.getElementInlineStyle('exit'),
      form: {
        label: {
          label: this.getElementInlineStyle('label')
        },
        textbox: this.getElementInlineStyle('input'),
        error: { borderColor: VariablesColors.errorColor },
        errorMessages: {
          color: VariablesColors.errorColor,
          container: {
            textAlign: 'left'
          }
        }
      },
      link: this.getElementInlineStyle('link'),
      button: this.getElementInlineStyle('button'),
      dragHandle: this.getElementBackground('content2'),
      body: this.getElementInlineStyle('body1'),
      secondaryButton: this.getElementInlineStyle('secondaryButton'),
      primaryButton: this.getElementInlineStyle('primaryButton'),
      addAnotherButton: this.getElementInlineStyle('addAnotherButton')
    };
  }
  getClasses() {
    return {
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
  }
  render() {
    return <InvitationForwardingForm {...this.props} classes={this.getClasses()} style={this.getStyleObject()} />;
  }
}

const onSubmit = () => {
  return dispatch => {
    dispatch(requestForwardingInvitations());
  };
};

const dialogStyle = (globalTheme, sections) => {
  return {
    ...globalTheme,
    header: { styleMapping: 'header3' },
    title: { styleMapping: 'header2' },
    subTitle: { styleMapping: 'header4' },
    exit: { styleMapping: 'body1' },
    input: { styleMapping: 'input' },
    link: { styleMapping: 'link' },
    label: { styleMapping: 'label', customSettings: { text: { textAlign: 'left' } } },
    button: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' },
    primaryButton: { styleMapping: 'primaryButton' },
    content2: { ...clearImageInTheme(merge({}, globalTheme, sections.content2)), styleMapping: 'custom' },
    body1: { styleMapping: 'body1' },
    addAnotherButton: { styleMapping: 'primaryButton' }
  };
};
const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const { sections, global } = state.website.theme;
    return {
      title: props.dialogConfig.title,
      style: dialogStyle(global, sections),
      translate: state.text.translate,
      invitationForwardingSettings: {
        ...props.dialogConfig.invitationForwardingSettings,
        ...state.invitationForwarding
      }
    };
  },
  {
    requestClose: boundCloseDialog,
    onSubmit,
    resetInvitationForwarding
  }
)(InvitationForwardingDialog);
