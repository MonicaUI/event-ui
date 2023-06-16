import React from 'react';
import Form from 'nucleus-form/src/components/Form';
import Textbox from 'nucleus-form/src/components/inputs/Textbox';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import TextArea from 'nucleus-core/forms/elements/TextArea';
import Button from 'nucleus-core/buttons/Button';
import { getIn } from 'icepick';
import SubmitButton from 'nucleus-form/src/components/SubmitButton';
import SubstituteRegistrationStyles from '../SubstituteRegistrationDialog/SubstituteRegistration.less';

type Props = {
  classes?: $TSFixMe;
  style?: $TSFixMe;
  showAdditionalCommentSection?: boolean;
  onChange?: $TSFixMeFunction;
  onAddAnother?: $TSFixMeFunction;
  onSubmit?: $TSFixMeFunction;
  translate?: $TSFixMeFunction;
  autoFocus?: boolean;
  formData?: {
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    comments?: string;
  };
  onCancel?: $TSFixMeFunction;
  validation?: {
    firstNameValidation?: $TSFixMeFunction;
    lastNameValidation?: $TSFixMeFunction;
    emailAddressValidation?: $TSFixMeFunction;
  };
};

/*
 * Invitation Form that renders the form that is required to send invitation.
 */
export default class InvitationForm extends React.Component<Props> {
  formRef: $TSFixMe;
  constructor(props: Props) {
    super(props);
    this.formRef = React.createRef();
  }

  handleEnter = (e: $TSFixMe): $TSFixMe => {
    const { onSubmit } = this.props;
    if (e.key === 'Enter') {
      const invitationForwardingForm = this.formRef.current;
      const nucleusFormSubmit = getIn(invitationForwardingForm, ['nucleusForm', 'actions', 'submitForm']);
      if (nucleusFormSubmit) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        nucleusFormSubmit(onSubmit, { validateBeforeSubmit: true }).catch(__ => undefined);
      }
    }
  };

  render(): $TSFixMe {
    const {
      translate,
      onCancel,
      showAdditionalCommentSection,
      onChange,
      onAddAnother,
      onSubmit,
      formData: { firstName, lastName, emailAddress, comments },
      validation: { firstNameValidation, lastNameValidation, emailAddressValidation }
    } = this.props;
    return (
      <div>
        <Form ref={this.formRef}>
          <Textbox
            {...injectTestId('first-Name')}
            {...select(this.props, 'form')}
            fieldName="firstName"
            label={translate('StandardContactField_FirstName__resx')}
            value={firstName}
            onChange={onChange}
            required
            validations={firstNameValidation(translate)}
            onKeyPress={this.handleEnter}
            maxLength={30}
          />
          <Textbox
            {...injectTestId('last-Name')}
            {...select(this.props, 'form')}
            fieldName="lastName"
            label={translate('StandardContactField_LastName__resx')}
            value={lastName}
            onChange={onChange}
            required
            validations={lastNameValidation(translate)}
            onKeyPress={this.handleEnter}
            maxLength={50}
          />
          <Textbox
            {...injectTestId('email-Address')}
            {...select(this.props, 'form')}
            fieldName="emailAddress"
            label={translate('StandardContactField_EmailAddress__resx')}
            value={emailAddress}
            onChange={onChange}
            required
            validations={emailAddressValidation(translate)}
            onKeyPress={this.handleEnter}
            maxLength={80}
          />
          <SubmitButton
            {...injectTestId('add-another-button')}
            {...resolve(this.props, 'addAnotherButton')}
            onSubmit={onAddAnother}
          >
            {translate('EventWidgets_ForwardInv_AddAnotherButton__resx')}
          </SubmitButton>
          {showAdditionalCommentSection && (
            <TextArea
              {...injectTestId('additional-comment-section')}
              {...select(this.props, 'form')}
              fieldName="comments"
              label={translate('EventWidgets_ForwardInv_Comment__resx')}
              value={comments}
              onChange={onChange}
              onKeyPress={this.handleEnter}
              maxLength={{ limit: 100 }}
            />
          )}
          <div className={SubstituteRegistrationStyles.element}>
            <Button
              {...injectTestId('no-submit-button')}
              {...select(this.props, 'secondaryButton')}
              kind="secondaryButton"
              onClick={onCancel}
              title={translate('cancel_btn__resx')}
              aria-label={translate('cancel_btn__resx')}
            />
            <Button
              {...injectTestId('yes-submit-button')}
              {...select(this.props, 'primaryButton')}
              kind="primaryButton"
              onClick={onSubmit}
              title={translate('EventWidgets_ContactPlanner_Send__resx')}
              aria-label={translate('EventWidgets_ContactPlanner_Send__resx')}
            />
          </div>
        </Form>
      </div>
    );
  }
}
