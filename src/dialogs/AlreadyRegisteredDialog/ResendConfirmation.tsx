import { resolve, select } from '@cvent/nucleus-dynamic-css';
import { textEmailAddress, textRequired } from '@cvent/nucleus-form-validations';
import AlreadyRegisteredDialogStyles from '../AlreadyRegisteredAndContactPlanner/AlreadyRegisteredDialog.less';
import DialogMessage from '../AlreadyRegisteredAndContactPlanner/DialogMessage';
import Form from 'nucleus-form/src/components/Form';
import React from 'react';
import SlideLeftAnimation from '../AlreadyRegisteredAndContactPlanner/SlideLeftAnimation.less';
import SlideRightAnimation from '../AlreadyRegisteredAndContactPlanner/SlideRightAnimation.less';
import SubmitButton from 'nucleus-form/src/components/SubmitButton';
import Textbox from 'nucleus-form/src/components/inputs/Textbox';
import Transition from 'nucleus-core/containers/Transition';
import { defaultMemoize } from 'reselect';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import Button from 'nucleus-core/buttons/Button';

type ResendConfirmationFormProps = {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  onChange: $TSFixMeFunction;
  onSubmit: $TSFixMeFunction;
  onClose: $TSFixMeFunction;
  dupMatchKeyType: 'EMAIL_ONLY' | 'EMAIL_LAST_FIRST_NAME';
  translate: $TSFixMeFunction;
};

/**
 * Displays a simple form for the user to enter in their credentials to resend their
 * confirmation email allowing them to log back in with their confirmation number.
 * The form will include firstname and lastname only if the account
 * specifies they are needed to match an invitee.
 */
class ResendConfirmationForm extends React.Component<ResendConfirmationFormProps> {
  handleEnter = event => {
    const { onSubmit } = this.props;
    if (event.key === 'Enter') {
      onSubmit();
    }
  };
  getEmailAddressValidations = defaultMemoize(translate => {
    return { required: textRequired(translate), email: textEmailAddress(translate) };
  });
  getFirstNameValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });
  getLastNameValidations = defaultMemoize(translate => {
    return { required: textRequired(translate) };
  });
  render() {
    const { firstName, lastName, emailAddress, onChange, onSubmit, onClose, dupMatchKeyType, translate } = this.props;
    const showFirstLastName = dupMatchKeyType === 'EMAIL_LAST_FIRST_NAME';
    return (
      <div {...resolveTestId(this.props)}>
        <Form>
          <div {...resolve(this.props, 'body')} className={AlreadyRegisteredDialogStyles.instructionalText}>
            {translate('EventWidgets_AlreadyRegistered_ResendConfirmationInstructions__resx')}
          </div>
          <Textbox
            {...injectTestId('email-address')}
            {...select(this.props, 'form')}
            fieldName="emailAddress"
            label={translate('EventWidgets_Fields_EmailAddress__resx')}
            value={emailAddress}
            required
            validations={this.getEmailAddressValidations(translate)}
            onChange={onChange}
            onKeyPress={this.handleEnter}
            autoFocus
          />
          {showFirstLastName && (
            <Textbox
              {...injectTestId('first-name')}
              {...select(this.props, 'form')}
              fieldName="firstName"
              label={translate('EventWidgets_Fields_FirstName__resx')}
              value={firstName}
              required
              validations={this.getFirstNameValidations(translate)}
              onChange={onChange}
              onKeyPress={this.handleEnter}
            />
          )}
          {showFirstLastName && (
            <Textbox
              {...injectTestId('last-name')}
              {...select(this.props, 'form')}
              fieldName="lastName"
              label={translate('EventWidgets_Fields_LastName__resx')}
              value={lastName}
              required
              validations={this.getLastNameValidations(translate)}
              onChange={onChange}
              onKeyPress={this.handleEnter}
            />
          )}
          <div className={`${AlreadyRegisteredDialogStyles.element}`}>
            <Button
              {...injectTestId('back-link')}
              {...select(this.props, 'backButton')}
              kind="backButton"
              onClick={onClose}
              title={`< ${translate('EventWidgets_AlreadyRegistered_BackButton__resx')}`}
            />
          </div>
          <SubmitButton {...injectTestId('submit-button')} {...resolve(this.props, 'button')} onSubmit={onSubmit}>
            {translate('EventWidgets_AlreadyRegistered_Submit__resx')}
          </SubmitButton>
        </Form>
      </div>
    );
  }
}

/*
(ts-migrate) TODO: Migrate the remaining prop types
...ResendConfirmationForm.propTypes
*/
type ResendConfirmationProps = {
  successResendingConfirmation: boolean;
  failureResendingConfirmation: boolean;
  onNavigateBack: $TSFixMeFunction;
};

/**
 * Displays the ResendConfirmation form or the status of the prior resend.
 */
const ResendConfirmation = (props: ResendConfirmationProps): $TSFixMe => {
  const {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'firstName' does not exist on type 'Resen... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    firstName,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'lastName' does not exist on type 'Resend... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    lastName,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'emailAddress' does not exist on type 'Re... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    emailAddress,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onChange' does not exist on type 'Resend... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    onChange,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onClose' does not exist on type 'ResendC... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    onClose,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onSubmit' does not exist on type 'Resend... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    onSubmit,
    onNavigateBack,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'dupMatchKeyType' does not exist on type ... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    dupMatchKeyType,
    successResendingConfirmation,
    failureResendingConfirmation,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'translate' does not exist on type 'Resen... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    translate,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'classes' does not exist on type 'ResendC... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    classes,
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'style' does not exist on type 'ResendCon... Remove this comment to see the full error message
    // eslint-disable-next-line react/prop-types
    style
  } = props;

  const handleSubmit = () => {
    onSubmit();
  };

  const handleStatusMessageClose = () => {
    onNavigateBack();
  };

  const showForm = () => {
    return !successResendingConfirmation && !failureResendingConfirmation;
  };

  const getTransitionStyle = () => {
    return {
      defaultName: 'resendConfirmationSlidingPanel',
      classes: showForm() ? SlideRightAnimation : SlideLeftAnimation,
      transitionAppearTimeout: 500,
      transitionEnterTimeout: 500,
      transitionLeaveTimeout: 500
    };
  };

  return (
    <Transition {...getTransitionStyle()}>
      {showForm() && (
        <div key="resendConfirmationForm">
          <ResendConfirmationForm
            {...resolveTestId(props, 'form')}
            firstName={firstName}
            lastName={lastName}
            emailAddress={emailAddress}
            onChange={onChange}
            onSubmit={handleSubmit}
            onClose={onClose}
            dupMatchKeyType={dupMatchKeyType}
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            classes={classes}
            style={style}
            translate={translate}
          />
        </div>
      )}
      {successResendingConfirmation && (
        <div key="resendConfirmationSuccess" {...resolveTestId(props, 'success-message')}>
          <DialogMessage
            type="success"
            title={translate('EventWidgets_AlreadyRegistered_ConfirmationSentTitle__resx')}
            message={translate('EventWidgets_AlreadyRegistered_ConfirmationSentMessage__resx')}
            backButtonText={translate('EventWidgets_AlreadyRegistered_BackToLoginButton__resx')}
            onBackClick={handleStatusMessageClose}
            translate={translate}
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: "success"; title: any; message: any;... Remove this comment to see the full error message
            classes={classes}
            style={style}
          />
        </div>
      )}
      {failureResendingConfirmation && (
        <div key="resendConfirmationFailure" {...resolveTestId(props, 'failure-message')}>
          <DialogMessage
            type="error"
            message={translate('EventWidgets_AlreadyRegistered_ConfirmationSendFailureMessage__resx')}
            backButtonText={translate('EventWidgets_AlreadyRegistered_BackToLoginButton__resx')}
            onBackClick={handleStatusMessageClose}
            translate={translate}
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: "error"; message: any; backButtonTex... Remove this comment to see the full error message
            classes={classes}
            style={style}
          />
        </div>
      )}
    </Transition>
  );
};

export default ResendConfirmation;
