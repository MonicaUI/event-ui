import React from 'react';
import SubstituteRegistrationStyles from './SubstituteRegistration.less';
import DialogMessage from '../AlreadyRegisteredAndContactPlanner/DialogMessage';
import Transition from 'nucleus-core/containers/Transition';
import SlideLeftAnimation from '../AlreadyRegisteredAndContactPlanner/SlideLeftAnimation.less';
import SlideRightAnimation from '../AlreadyRegisteredAndContactPlanner/SlideRightAnimation.less';
import DialogHeader from '../shared/DialogHeader';
import SubstitutionForm from './SubstitutionForm';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import ConfirmationStyles from '../shared/Confirmation.less';
import Button from 'nucleus-core/buttons/Button';
const TRANSITION_TIME_OUT = 500;
let reverseTransition = false;

type Props = {
  title: string;
  requestClose: $TSFixMeFunction;
  translate: $TSFixMeFunction;
  onSubmit: $TSFixMeFunction;
  onChange: $TSFixMeFunction;
  resetSubstituteRegistration: $TSFixMeFunction;
  substituteRegistrationSuccess: boolean;
  substituteRegistrationError: boolean;
  autoFocus: boolean;
  classes: $TSFixMe;
  style: $TSFixMe;
  firstName: string;
  lastName: string;
  emailAddress: string;
  hasConfirmed: boolean;
  showConfirmationMessage: boolean;
  denyConfirmation: $TSFixMeFunction;
  getConfirmation: $TSFixMeFunction;
  validationList?: $TSFixMe[];
  showConcurrentActionMessage?: boolean;
  cartAborted?: boolean;
  abortOriginalSubstitutionCart?: $TSFixMeFunction;
  disableSubmitButton?: boolean;
};

export default function SubstituteRegistrationForm({
  title,
  requestClose,
  translate,
  onSubmit,
  onChange,
  resetSubstituteRegistration,
  substituteRegistrationSuccess,
  substituteRegistrationError,
  autoFocus,
  firstName,
  lastName,
  emailAddress,
  hasConfirmed,
  showConfirmationMessage,
  getConfirmation,
  denyConfirmation,
  validationList,
  showConcurrentActionMessage,
  cartAborted,
  abortOriginalSubstitutionCart,
  disableSubmitButton,
  ...rest
}: Props): $TSFixMe {
  function handleClose() {
    requestClose();
    resetSubstituteRegistration();
  }
  function setReverseTransition() {
    reverseTransition = true;
    setTimeout(() => (reverseTransition = false), TRANSITION_TIME_OUT);
  }
  const transitionOptions = {
    defaultName: 'substituteRegistrationPanel',
    classes: reverseTransition ? SlideRightAnimation : SlideLeftAnimation,
    transitionAppearTimeout: TRANSITION_TIME_OUT,
    transitionEnterTimeout: TRANSITION_TIME_OUT,
    transitionLeaveTimeout: TRANSITION_TIME_OUT
  };
  function abortOriginalCart() {
    setReverseTransition();
    abortOriginalSubstitutionCart();
  }
  function denyConfirmationClicked() {
    setReverseTransition();
    denyConfirmation();
  }
  const buttonText = {
    buttonTextNo: 'SubstituteReg_Back__resx',
    buttonTextYes: 'SubstituteReg_Submit__resx',
    buttonTextAbortTheir: 'SubstituteReg_ConcurrentActionAbortTheir__resx',
    buttonTextAbortMine: 'SubstituteReg_ConcurrentActionAbortMine__resx'
  };
  const transferRegistrationButtonStyle = {
    style: {
      button: rest.style.modalSubmitButtonStyles
    }
  };
  const substituteRegistrationComplete = substituteRegistrationSuccess || substituteRegistrationError;
  const styleObject = {
    classes: {
      dialogContainer: SubstituteRegistrationStyles.dialogContainer,
      panel: SubstituteRegistrationStyles.panel,
      headerText: SubstituteRegistrationStyles.headerText,
      instructionalText: SubstituteRegistrationStyles.instructionalText,
      errorMessages: SubstituteRegistrationStyles.errorMessages,
      cancelRegistrationModalText: ConfirmationStyles.cancelRegistrationModalText
    }
  };
  return (
    <div {...resolve(styleObject, 'dialogContainer')}>
      <DialogHeader
        {...injectTestId('Dialog-Header')}
        text={translate(title)}
        onClose={handleClose}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        style={rest.style}
        classes={rest.classes}
      />
      <Transition {...transitionOptions}>
        {!substituteRegistrationComplete &&
          !hasConfirmed &&
          !showConfirmationMessage &&
          !showConcurrentActionMessage &&
          !cartAborted && (
            <div {...resolve(styleObject, 'panel')} key="identity">
              <div {...resolve(rest, 'body')}>
                <h2 {...resolve(rest, 'modalHeaderStyles')} {...resolve(styleObject, 'headerText')}>
                  {translate('SubstituteReg_Header__resx')}
                </h2>
                <p {...resolve(rest, 'modalInstructionalTextStyles')} {...resolve(styleObject, 'instructionalText')}>
                  {translate('SubstituteReg_Instruction__resx')}
                </p>
              </div>
              {validationList &&
                validationList.length > 0 &&
                validationList.map(validation => {
                  return (
                    <div {...injectTestId('error-message')} {...resolve(styleObject, 'errorMessages')} key={validation}>
                      {translate(validation)}
                    </div>
                  );
                })}
              <SubstitutionForm
                classes={rest.classes}
                style={rest.style}
                autoFocus={autoFocus}
                translate={translate}
                onSubmit={getConfirmation}
                firstName={firstName}
                lastName={lastName}
                emailAddress={emailAddress}
                onChange={onChange}
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: any; style: any; autoFocus: boole... Remove this comment to see the full error message
                onCancel={handleClose}
                disableSubmitButton={disableSubmitButton}
              />
            </div>
          )}
        {showConcurrentActionMessage && (
          <div key="concurrentRegActionMessage" {...resolve(styleObject, 'panel')}>
            <div {...injectTestId('confirmation-form')}>
              <div {...resolve(rest, 'body')} {...resolve(styleObject, 'cancelRegistrationModalText')}>
                <h3
                  {...resolve(rest, 'header')}
                  {...resolve(rest, 'modalInstructionalTextStyles')}
                  {...resolve(styleObject, 'instructionalText')}
                >
                  {translate('SubstituteReg_ConcurrentAction__resx')}
                </h3>
              </div>
              <Button
                {...injectTestId('no-submit-button')}
                {...select(rest, 'secondaryButton')}
                kind="secondaryButton"
                onClick={abortOriginalCart}
                title={translate(buttonText.buttonTextAbortTheir)}
                aria-label={translate(buttonText.buttonTextAbortTheir)}
              />
              <Button
                {...injectTestId('yes-submit-button')}
                {...select(rest, 'primaryButton')}
                {...transferRegistrationButtonStyle}
                kind="primaryButton"
                onClick={handleClose}
                title={translate(buttonText.buttonTextAbortMine)}
                aria-label={translate(buttonText.buttonTextAbortMine)}
                autoFocus
              />
            </div>
          </div>
        )}
        {showConfirmationMessage && (
          <div key="confimationMessage" {...resolve(styleObject, 'panel')}>
            <div {...injectTestId('confirmation-form')}>
              <div {...resolve(rest, 'body')} {...resolve(styleObject, 'cancelRegistrationModalText')}>
                <h3
                  {...resolve(rest, 'header')}
                  {...resolve(rest, 'modalInstructionalTextStyles')}
                  {...resolve(styleObject, 'instructionalText')}
                >
                  {translate('SubstituteReg_Confirmation__resx')}
                </h3>
              </div>
              <Button
                {...injectTestId('no-submit-button')}
                {...select(rest, 'secondaryButton')}
                kind="secondaryButton"
                onClick={denyConfirmationClicked}
                title={translate(buttonText.buttonTextNo)}
                aria-label={translate(buttonText.buttonTextNo)}
              />
              <Button
                {...injectTestId('yes-submit-button')}
                {...select(rest, 'primaryButton')}
                {...transferRegistrationButtonStyle}
                kind="primaryButton"
                onClick={onSubmit}
                title={translate(buttonText.buttonTextYes)}
                aria-label={translate(buttonText.buttonTextYes)}
                autoFocus
              />
            </div>
          </div>
        )}
        {hasConfirmed && substituteRegistrationSuccess && (
          <div
            key="substituteRegistrationSuccess"
            {...resolve(rest, 'modalInstructionalTextStyles')}
            {...resolve(styleObject, 'instructionalText')}
          >
            <DialogMessage
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: any; translate: $TSFixMeFunction;... Remove this comment to see the full error message
              classes={rest.classes}
              translate={translate}
              type="success"
              message={translate('SubstituteReg_Success__resx', { FirstName: firstName, LastName: lastName })}
            />
          </div>
        )}
        {substituteRegistrationError && (
          <div
            key="substituteRegistrationError"
            {...resolve(rest, 'modalInstructionalTextStyles')}
            {...resolve(styleObject, 'instructionalText')}
          >
            <DialogMessage
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: any; translate: $TSFixMeFunction;... Remove this comment to see the full error message
              classes={rest.classes}
              translate={translate}
              type="error"
              title={translate('EventWidgets_ContactPlanner_ErrorTitle__resx')}
              onBackClick={() => {
                setReverseTransition();
                resetSubstituteRegistration();
              }}
            />
          </div>
        )}
        {cartAborted && (
          <div
            key="substituteRegistrationCartAborted"
            {...resolve(rest, 'modalInstructionalTextStyles')}
            {...resolve(styleObject, 'instructionalText')}
          >
            <DialogMessage
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ classes: any; translate: $TSFixMeFunction;... Remove this comment to see the full error message
              classes={rest.classes}
              translate={translate}
              type="error"
              title={translate('ConcurrentAction_CartAborted__resx')}
            />
          </div>
        )}
      </Transition>
    </div>
  );
}
