import React from 'react';
import ContactPlannerStyles from './ContactPlanner.less';
import ContactForm from './ContactForm';
import DialogMessage from '../AlreadyRegisteredAndContactPlanner/DialogMessage';
import Transition from 'nucleus-core/containers/Transition';
import SlideLeftAnimation from '../AlreadyRegisteredAndContactPlanner/SlideLeftAnimation.less';
import SlideRightAnimation from '../AlreadyRegisteredAndContactPlanner/SlideRightAnimation.less';
import DialogHeader from '../shared/DialogHeader';
const TRANSITION_TIME_OUT = 500;
let reverseTransition = false;

type Props = {
  title: string;
  senderEmailAddress?: string;
  message?: string;
  requestClose: $TSFixMeFunction;
  translate: $TSFixMeFunction;
  onChange: $TSFixMeFunction;
  onSubmit: $TSFixMeFunction;
  contactInfo: $TSFixMe;
  resetContactForm: $TSFixMeFunction;
  resetContactPlanner: $TSFixMeFunction;
  contactPlannerSuccess?: boolean;
  contactPlannerError?: boolean;
  autoFocus?: boolean;
};

export default function ContactPlannerForm({
  title,
  senderEmailAddress,
  message,
  requestClose,
  translate,
  onChange,
  onSubmit,
  contactInfo,
  resetContactForm,
  contactPlannerSuccess,
  contactPlannerError,
  resetContactPlanner,
  autoFocus,
  ...rest
}: Props): $TSFixMe {
  function handleClose() {
    requestClose();
    resetContactForm();
    resetContactPlanner();
  }
  function setReverseTransition() {
    reverseTransition = true;
    setTimeout(() => (reverseTransition = false), TRANSITION_TIME_OUT);
  }
  const transitionOptions = {
    defaultName: 'contactPlannerPanel',
    classes: reverseTransition ? SlideRightAnimation : SlideLeftAnimation,
    transitionAppearTimeout: TRANSITION_TIME_OUT,
    transitionEnterTimeout: TRANSITION_TIME_OUT,
    transitionLeaveTimeout: TRANSITION_TIME_OUT
  };
  const contactPlannerComplete = contactPlannerSuccess || contactPlannerError;
  return (
    <div className={ContactPlannerStyles.dialogContainer}>
      <DialogHeader
        text={translate(title)}
        onClose={handleClose}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        style={(rest as $TSFixMe).style}
        classes={(rest as $TSFixMe).classes}
      />
      <Transition {...transitionOptions}>
        {!contactPlannerComplete && (
          <div key="contactForm" className={ContactPlannerStyles.panel}>
            <ContactForm
              {...rest}
              senderEmailAddress={senderEmailAddress}
              message={message}
              onChange={onChange}
              translate={translate}
              onSubmit={onSubmit}
              contactInfo={contactInfo}
              autoFocus={autoFocus}
            />
          </div>
        )}
        {contactPlannerSuccess && (
          <div key="contactPlannerSuccess" className={ContactPlannerStyles.panel}>
            <DialogMessage
              {...rest}
              translate={translate}
              type="success"
              title={translate('EventWidgets_ContactPlanner_SuccessTitle__resx')}
              message={translate('EventWidgets_ContactPlanner_SuccessMessage__resx')}
            />
          </div>
        )}
        {contactPlannerError && (
          <div key="contactPlannerError" className={ContactPlannerStyles.panel}>
            <DialogMessage
              {...rest}
              translate={translate}
              type="error"
              title={translate('EventWidgets_ContactPlanner_ErrorTitle__resx')}
              message={translate('EventWidgets_ContactPlanner_MessageLabel__resx')}
              onBackClick={() => {
                setReverseTransition();
                resetContactPlanner();
              }}
            />
          </div>
        )}
      </Transition>
    </div>
  );
}
