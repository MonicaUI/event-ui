import React, { useState, useCallback } from 'react';
import AlreadyRegisteredDialogStyles from '../AlreadyRegisteredAndContactPlanner/AlreadyRegisteredDialog.less';
import Login from './Login';
import { Accepted, PendingApproval } from 'event-widgets/utils/InviteeStatus';
import ResendConfirmation from './ResendConfirmation';
import Transition from 'nucleus-core/containers/Transition';
import { RECOGNIZE_KNOWN_INVITEE } from '@cvent/event-ui-experiments';
import SlideLeftAnimation from '../AlreadyRegisteredAndContactPlanner/SlideLeftAnimation.less';
import SlideRightAnimation from '../AlreadyRegisteredAndContactPlanner/SlideRightAnimation.less';
import { injectTestId } from '@cvent/nucleus-test-automation';

import { resolve } from '@cvent/nucleus-dynamic-css';
import StandardDialog from '../shared/StandardDialog';

const checkKnownInvitee = (inviteeStatus, flexProductVersion) => {
  return (
    flexProductVersion >= RECOGNIZE_KNOWN_INVITEE && (inviteeStatus === Accepted || inviteeStatus === PendingApproval)
  );
};

/**
 * A dialog which allows a registrant to log in or resend their confirmation email.
 */
export const AlreadyRegisteredDialog = (props: $TSFixMe): $TSFixMe => {
  const [isDisplayResendConfirmation, setDisplayResendConfirmation] = useState(false);
  const [isKnownInvitee, setKnownInvitee] = useState(checkKnownInvitee(props.inviteeStatus, props.flexProductVersion));

  const getTransitionStyle = {
    defaultName: 'slidingPanel',
    classes: isDisplayResendConfirmation ? SlideLeftAnimation : SlideRightAnimation,
    transitionAppearTimeout: 500,
    transitionEnterTimeout: 500,
    transitionLeaveTimeout: 500
  };

  const {
    title,
    onClose,
    login,
    resendConfirmation,
    translate,
    style,
    classes,
    inviteeFirstName,
    inviteeLastName,
    onBackToLogin
  } = props;

  const displayResendConfirmation = useCallback(() => {
    setDisplayResendConfirmation(true);
  }, []);

  const displayLogin = useCallback(() => {
    setDisplayResendConfirmation(false);
  }, []);

  const displayInviteeInformation = useCallback(() => {
    setKnownInvitee(!isKnownInvitee);
  }, [isKnownInvitee]);

  const navigateBack = useCallback(() => {
    setDisplayResendConfirmation(false);
    onBackToLogin();
  }, [onBackToLogin]);

  return (
    <StandardDialog {...props} title={translate(title)} onClose={onClose} style={style} classes={classes} skipAutoFocus>
      <Transition {...getTransitionStyle}>
        {isKnownInvitee && !isDisplayResendConfirmation && (
          <div
            {...resolve(props, 'subTitle')}
            className={AlreadyRegisteredDialogStyles.instructionalText}
            {...injectTestId('welcome-text')}
          >
            {translate('EventGuestSide_Welcome_Text_resx', { inviteeFirstName, inviteeLastName })}
          </div>
        )}
        {isKnownInvitee && !isDisplayResendConfirmation && (
          <div
            {...resolve(props, 'subHeader')}
            className={AlreadyRegisteredDialogStyles.instructionalText}
            {...injectTestId('not-first-name-text')}
          >
            <p>{translate('EventGuestSide_Enter_Confirmation_Number_resx')}</p>
            <p>
              {translate('EventGuestSide_Not_FirstName_Text_resx', { inviteeFirstName, inviteeLastName })}
              <span onClick={displayInviteeInformation} className={AlreadyRegisteredDialogStyles.clearTextInstruction}>
                <u>{translate('EventGuestSide_ClearField_resx')}</u>
              </span>
            </p>
          </div>
        )}
        {!isDisplayResendConfirmation && (
          <div key="loginForm" className={AlreadyRegisteredDialogStyles.panel} {...resolve(props, 'panel')}>
            <Login
              {...login}
              {...injectTestId('login-form')}
              onResendConfirmationClick={displayResendConfirmation}
              translate={translate}
              style={style}
              classes={classes}
              isKnownInvitee={isKnownInvitee}
            />
          </div>
        )}
        {isDisplayResendConfirmation && (
          <div
            key="resendConfirmationForm"
            className={AlreadyRegisteredDialogStyles.panel}
            {...resolve(props, 'panel')}
          >
            <ResendConfirmation
              {...resendConfirmation}
              {...injectTestId('resend-confirmation-')}
              onNavigateBack={navigateBack}
              onClose={displayLogin}
              translate={translate}
              style={style}
              classes={classes}
            />
          </div>
        )}
      </Transition>
    </StandardDialog>
  );
};
