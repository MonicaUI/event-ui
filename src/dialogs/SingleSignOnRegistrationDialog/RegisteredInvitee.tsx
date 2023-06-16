import React from 'react';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import { injectTestId, resolveTestId } from '@cvent/nucleus-test-automation';
import formatAttendeeName from 'event-widgets/utils/formatAttendeeName';
import {
  // @ts-expect-error ts-migrate(2305) FIXME: Module '"*.less"' has no exported member 'register... Remove this comment to see the full error message
  registeredInviteesListContainer,
  // @ts-expect-error ts-migrate(2305) FIXME: Module '"*.less"' has no exported member 'inviteeI... Remove this comment to see the full error message
  inviteeInformationContainer,
  // @ts-expect-error ts-migrate(2305) FIXME: Module '"*.less"' has no exported member 'manageIn... Remove this comment to see the full error message
  manageInviteeInformationContainer,
  // @ts-expect-error ts-migrate(2305) FIXME: Module '"*.less"' has no exported member 'manageIn... Remove this comment to see the full error message
  manageInviteeInformationLink
} from './SingleSignOnRegistrationDialog.less';

function createNameForInvitee(firstName, middleName, lastName, isAdmin, translate) {
  return isAdmin
    ? translate('EventGuestSide_Sso_AdminName__resx', {
        attendeeName: formatAttendeeName({ firstName, middleName, lastName })
      })
    : formatAttendeeName({ firstName, middleName, lastName });
}

type Props = {
  translate: $TSFixMeFunction;
  style: $TSFixMe;
  classes: $TSFixMe;
  registeredInvitee?: $TSFixMe;
  dispatchToConfirmationPage?: $TSFixMeFunction;
};

export class RegisteredInvitee extends React.Component<Props> {
  render(): $TSFixMe {
    const { registeredInvitee, translate, dispatchToConfirmationPage } = this.props;
    const { firstName, middleName, lastName, emailAddress, confirmationNumber, isAdmin } = registeredInvitee;
    return (
      <div className={registeredInviteesListContainer}>
        <div
          {...resolve(this.props, 'body')}
          {...resolveTestId(this.props, '-name')}
          className={inviteeInformationContainer}
        >
          {createNameForInvitee(firstName, middleName, lastName, isAdmin, translate)}
        </div>
        <div {...resolve(this.props, 'body')} className={manageInviteeInformationContainer}>
          <a
            {...injectTestId('manage-link')}
            {...select(this.props, 'primaryButton')}
            className={manageInviteeInformationLink}
            onClick={dispatchToConfirmationPage.bind(null, emailAddress, confirmationNumber)}
          >
            {translate('EventGuestside_SSO_Admin_ManageExistingReg__resx')}
          </a>
        </div>
      </div>
    );
  }
}
