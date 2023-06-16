import React from 'react';
import Textbox from 'nucleus-form/src/components/inputs/Textbox';
import TextArea from 'nucleus-form/src/components/inputs/TextArea';
import Form from 'nucleus-form/src/components/Form';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { textEmailAddress, textRequired } from '@cvent/nucleus-form-validations';
import { defaultMemoize } from 'reselect';
import SubmitButton from 'nucleus-form/src/components/SubmitButton';
import { getIn } from 'icepick';

type Props = {
  senderEmailAddress?: string;
  message?: string;
  translate: $TSFixMeFunction;
  onChange: $TSFixMeFunction;
  onSubmit: $TSFixMeFunction;
  contactInfo: {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    displayEmail?: boolean;
    company?: string;
    phoneNumber?: string;
  };
  autoFocus?: boolean;
  style?: $TSFixMe;
};

export default class ContactForm extends React.Component<Props> {
  formRef: $TSFixMe;

  constructor(props: Props) {
    super(props);
    this.formRef = React.createRef();
  }
  handleEnter = (e: $TSFixMe): $TSFixMe => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      const contactForm = this.formRef.current;
      const nucleusFormSubmit = getIn(contactForm, ['nucleusForm', 'actions', 'submitForm']);
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
  getMessageValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });
  render(): $TSFixMe {
    const { senderEmailAddress, message, translate, onSubmit, contactInfo, onChange, autoFocus, ...rest } = this.props;
    const { firstName, lastName, displayEmail, emailAddress, phoneNumber, company } = contactInfo;
    const textBoxStyles = {
      classes: (rest as $TSFixMe).classes.form,
      style: {
        label: rest.style.modalLabelStyles,
        textbox: rest.style.modalFieldStyles,
        errorMessages: {
          container: {
            textAlign: 'left'
          }
        }
      }
    };
    const textAreaStyles = {
      classes: (rest as $TSFixMe).classes.form,
      style: {
        label: rest.style.modalLabelStyles,
        textarea: rest.style.modalFieldStyles,
        errorMessages: {
          container: {
            textAlign: 'left'
          }
        }
      }
    };
    return (
      <Form ref={this.formRef}>
        <div {...resolve(rest, 'body', 'element', 'contactInfo')}>
          <div {...resolve(this.props, 'modalPlannerNameStyles')}>{`${firstName} ${lastName}`}</div>
          {displayEmail && <div {...resolve(this.props, 'modalPlannerNameStyles')}>{emailAddress}</div>}
          {company && <div {...resolve(this.props, 'modalPlannerNameStyles')}>{company}</div>}
          {phoneNumber && <div {...resolve(this.props, 'modalPlannerNameStyles')}>{phoneNumber}</div>}
        </div>
        <Textbox
          {...textBoxStyles}
          fieldName="senderEmailAddress"
          label={translate('EventWidgets_ContactPlanner_EmailLabel__resx')}
          value={senderEmailAddress}
          onChange={onChange}
          required
          validations={this.getEmailAddressValidations(translate)}
          onKeyPress={this.handleEnter}
          autoFocus={autoFocus}
        />
        <TextArea
          {...textAreaStyles}
          fieldName="message"
          label={translate('EventWidgets_ContactPlanner_MessageLabel__resx')}
          value={message}
          onChange={onChange}
          required
          validations={this.getMessageValidations(translate)}
          maxLength={{ limit: 1000 }}
        />
        <SubmitButton {...resolve(this.props, 'modalSendButtonStyles')} onSubmit={onSubmit}>
          {translate('EventWidgets_ContactPlanner_Send__resx')}
        </SubmitButton>
      </Form>
    );
  }
}
