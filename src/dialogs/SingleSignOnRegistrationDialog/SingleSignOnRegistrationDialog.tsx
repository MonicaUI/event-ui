import React from 'react';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import SingleSignOnStyles from '../shared/Confirmation.less';
import DialogHeader from '../shared/DialogHeader';
import Button from 'nucleus-core/buttons/Button';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import AdminRegisteredInviteesList from './AdminRegisteredInviteesList';
// @ts-expect-error ts-migrate(2305) FIXME: Module '"*.less"' has no exported member 'manageIn... Remove this comment to see the full error message
import { manageInviteeHeaderContainer, panelStyles, ssoRegistrationText } from './SingleSignOnRegistrationDialog.less';

export const SingleSignOnRegistrationDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    title,
    adminRegistration,
    translate,
    inviteeRegistration,
    buttonText = {},
    contentDetails,
    hasRegisteredInvitees,
    dispatchToConfirmationPage,
    registeredInvitees,
    hasDialogBeenOpened,
    dispatchCloseIcon
  } = props;

  const {
    no: buttonTextNo = 'EventGuestSide_Sso_Admin__resx',
    yes: buttonTextYes = 'EventGuestSide_Sso_Invitee__resx'
  } = buttonText;

  const checkIfAdminRegistered = () => {
    return registeredInvitees && registeredInvitees.length > 0 && registeredInvitees[0].isAdmin;
  };

  const regAdminInstructionalText = () => {
    return !checkIfAdminRegistered()
      ? 'EventGuestSide_Sso_Admin_RegInstruction__resx'
      : 'EventGuestSide_Sso_Admin_RegInstruction_RegisterSomeoneElse__resx';
  };

  const singleSignOnPrompt = (
    <div {...injectTestId('singleSignOn-form')}>
      <div {...resolve(props, 'body')} className={ssoRegistrationText}>
        {/* @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2. */}
        {translate(regAdminInstructionalText(hasRegisteredInvitees, registeredInvitees))}
        {contentDetails && (
          <div {...resolve(props, 'detailsText')} className={SingleSignOnStyles.detailsText}>
            {contentDetails}
          </div>
        )}
      </div>
      {/* @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2. */}
      {!checkIfAdminRegistered(hasRegisteredInvitees, registeredInvitees) && (
        <Button
          {...injectTestId('yes-submit-button')}
          {...select(props, 'primaryButton')}
          kind="primaryButton"
          onClick={inviteeRegistration}
          title={translate(buttonTextYes)}
          aria-label={translate(buttonTextYes)}
        />
      )}
      <Button
        {...injectTestId('no-submit-button')}
        {...select(props, 'primaryButton')}
        kind="primaryButton"
        onClick={adminRegistration}
        title={translate(buttonTextNo)}
        aria-label={translate(buttonTextNo)}
      />
    </div>
  );

  return (
    <div {...resolveTestId(props)}>
      <DialogHeader
        onClose={hasDialogBeenOpened && dispatchCloseIcon}
        text={translate(title)}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        style={props.style}
        classes={props.classes}
      />
      <div className={panelStyles}>{singleSignOnPrompt}</div>
      {(hasRegisteredInvitees || checkIfAdminRegistered()) && (
        <div className={panelStyles}>
          <div className={manageInviteeHeaderContainer}>
            <span {...resolve(props, 'body')}>
              {' '}
              {translate('EventGuestSide_Sso_Admin_ModifyExistingRegInstruction___resx')}{' '}
            </span>
          </div>
          <AdminRegisteredInviteesList
            style={props.style}
            classes={props.classes}
            registeredInvitees={registeredInvitees}
            translate={translate}
            dispatchToConfirmationPage={dispatchToConfirmationPage}
          />
        </div>
      )}
    </div>
  );
};
