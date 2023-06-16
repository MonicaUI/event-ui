import { resolve, select } from '@cvent/nucleus-dynamic-css';
import { textEmailAddress, textRequired } from '@cvent/nucleus-form-validations';

import AlreadyRegisteredDialogStyles from '../AlreadyRegisteredAndContactPlanner/AlreadyRegisteredDialog.less';
import Form from 'nucleus-form/src/components/Form';
import React from 'react';
import SubmitButton from 'nucleus-form/src/components/SubmitButton';
import Textbox from 'nucleus-form/src/components/inputs/Textbox';
import { defaultMemoize } from 'reselect';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import Button from 'nucleus-core/buttons/Button';

type Props = {
  instructionalText?: string;
  registerNowText: string;
  emailAddress?: string;
  confirmationNumber?: string;
  onChange: $TSFixMeFunction;
  onSubmit: $TSFixMeFunction;
  onResendConfirmationClick: $TSFixMeFunction;
  errorMessage?: string;
  translate: $TSFixMeFunction;
  isKnownInvitee?: boolean;
};

/**
 * Displays a simple form which allows registrant to login with their emailAddress and confirmationNumber
 * number. A link is also provided to allow the user to resend their confirmation number if they have
 * forgotten it.
 */
export default class Login extends React.Component<Props> {
  getEmailAddressValidations = defaultMemoize(translate => {
    return {
      required: textRequired(translate),
      email: textEmailAddress(translate)
    };
  });
  getConfirmationNumberValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });
  render(): $TSFixMe {
    const {
      instructionalText,
      registerNowText,
      emailAddress,
      confirmationNumber,
      onChange,
      onSubmit,
      onResendConfirmationClick,
      errorMessage,
      translate,
      isKnownInvitee
    } = this.props;
    return (
      <div {...resolveTestId(this.props)}>
        <Form>
          {!isKnownInvitee && (
            <div {...resolve(this.props, 'body')} className={AlreadyRegisteredDialogStyles.instructionalText}>
              {instructionalText
                ? translate(instructionalText)
                : translate('EventWidgets_AlreadyRegistered_InstructionalText__resx', {
                    registerNow: translate(registerNowText)
                  })}
            </div>
          )}
          {!isKnownInvitee && (
            <Textbox
              {...injectTestId('email-address')}
              {...select(this.props, 'form')}
              fieldName="emailAddress"
              label={translate('EventWidgets_Fields_EmailAddress__resx')}
              value={emailAddress}
              required
              validations={this.getEmailAddressValidations(translate)}
              onChange={onChange}
              autoFocus
            />
          )}
          <Textbox
            {...injectTestId('confirmation-number')}
            {...select(this.props, 'form')}
            fieldName="confirmationNumber"
            label={translate('EventWidgets_Fields_ConfirmationNumber__resx')}
            value={confirmationNumber}
            required
            validations={this.getConfirmationNumberValidations(translate)}
            onChange={onChange}
          />
          <div className={`${AlreadyRegisteredDialogStyles.element}`}>
            <Button
              {...injectTestId('resend-confirmation-button')}
              {...select(this.props, 'linkButton')}
              kind="linkButton"
              onClick={onResendConfirmationClick}
              title={translate('EventWidgets_AlreadyRegistered_ForgotConfirmationButton__resx')}
            />
          </div>
          {errorMessage && (
            <div {...injectTestId('error-message')} className={AlreadyRegisteredDialogStyles.errorMessages}>
              {errorMessage}
            </div>
          )}
          <SubmitButton {...injectTestId('submit-button')} {...resolve(this.props, 'button')} onSubmit={onSubmit}>
            {translate('EventWidgets_AlreadyRegistered_Login__resx')}
          </SubmitButton>
        </Form>
      </div>
    );
  }
}
