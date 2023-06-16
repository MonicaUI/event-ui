import React from 'react';
import Textbox from 'nucleus-form/src/components/inputs/Textbox';
import SubmitButton from 'nucleus-form/src/components/SubmitButton';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { injectTestId } from '@cvent/nucleus-test-automation';
import Form from 'nucleus-form/src/components/Form';
import { getIn } from 'icepick';
import { defaultMemoize } from 'reselect';
import { textEmailAddress, textRequired } from '@cvent/nucleus-form-validations';

type Props = {
  classes: $TSFixMe;
  style: $TSFixMe;
  autoFocus: boolean;
  translate: $TSFixMeFunction;
  onSubmit: $TSFixMeFunction;
  firstName: string;
  lastName: string;
  emailAddress: string;
  onChange: $TSFixMeFunction;
  disableSubmitButton?: boolean;
};

export default class SubstitutionForm extends React.Component<Props> {
  formRef: $TSFixMe;
  constructor(props: Props) {
    super(props);
    this.formRef = React.createRef();
  }
  handleEnter = (e: $TSFixMe): $TSFixMe => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      const substitutionForm = this.formRef.current;
      const nucleusFormSubmit = getIn(substitutionForm, ['nucleusForm', 'actions', 'submitForm']);
      if (nucleusFormSubmit) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        nucleusFormSubmit(onSubmit, { validateBeforeSubmit: true }).catch(__ => undefined);
      }
    }
  };
  getEmailAddressValidations = defaultMemoize(translate => {
    return {
      required: textRequired(translate),
      email: textEmailAddress(translate)
    };
  });
  getFirstNameValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });
  getLastNameValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });
  render(): $TSFixMe {
    const {
      translate,
      onSubmit,
      firstName,
      lastName,
      emailAddress,
      autoFocus,
      onChange,
      disableSubmitButton,
      ...rest
    } = this.props;
    const substitutionTextBoxStyles = {
      classes: rest.classes.form,
      style: {
        label: rest.style.modalPopupLabelStyles,
        textbox: rest.style.modalPopupFieldStyles,
        errorMessages: {
          container: {
            textAlign: 'left'
          }
        }
      }
    };
    return (
      <div>
        <Form ref={this.formRef}>
          <Textbox
            {...substitutionTextBoxStyles}
            {...injectTestId('first-Name')}
            fieldName="firstName"
            label={translate('StandardContactField_FirstName__resx')}
            value={firstName}
            onChange={onChange}
            required
            validations={this.getFirstNameValidations(translate)}
            onKeyPress={this.handleEnter}
            autoFocus={autoFocus}
            maxLength={30}
          />
          <Textbox
            {...substitutionTextBoxStyles}
            {...injectTestId('last-Name')}
            fieldName="lastName"
            label={translate('StandardContactField_LastName__resx')}
            value={lastName}
            onChange={onChange}
            required
            validations={this.getLastNameValidations(translate)}
            onKeyPress={this.handleEnter}
            maxLength={50}
          />
          <Textbox
            {...substitutionTextBoxStyles}
            {...injectTestId('email-Address')}
            fieldName="emailAddress"
            label={translate('StandardContactField_EmailAddress__resx')}
            value={emailAddress}
            onChange={onChange}
            required
            validations={this.getEmailAddressValidations(translate)}
            onKeyPress={this.handleEnter}
            maxLength={80}
          />
          <SubmitButton
            {...resolve(this.props, 'modalSubmitButtonStyles')}
            {...injectTestId('submit-button')}
            onSubmit={onSubmit}
            disabled={disableSubmitButton}
          >
            {translate('EventWidgets_AlreadyRegistered_Submit__resx')}
          </SubmitButton>
        </Form>
      </div>
    );
  }
}
