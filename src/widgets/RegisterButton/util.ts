import { openAlreadyRegisteredDialog } from '../../dialogs';
import { isHTTPPostOrSSOOnInAccount, isOAuthOnInAccount } from '../../redux/selectors/shared';
import { isExternalAuthOnInEvent, isOAuthOnInEvent, isSpecificRegPathAuthLocation } from '../../redux/selectors/event';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import {
  getCurrentPageId,
  getPagePath,
  isInviteeInUrl,
  redirectToExternalAuth,
  redirectToOAuthURL
} from '../../redux/pathInfo';
import { Accepted, PendingApproval } from 'event-widgets/utils/InviteeStatus';
import { canLogin } from '../../redux/selectors/currentRegistrant';
import * as EventStatus from 'event-widgets/clients/EventStatus';

export function createLinkClickHandler(title: $TSFixMe, registerNowText: $TSFixMe) {
  return (): $TSFixMe =>
    async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
      const {
        event: {
          eventSecuritySetupSnapshot: { postRegistrationAuthType }
        },
        clients: { attendeeLoginClient },
        defaultUserSession: { isPreview },
        account,
        event
      } = getState();
      if (!isPreview && handleAuthenticationRedirection(account, event)) {
        return;
      } else if (postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE) {
        await attendeeLoginClient.authorize();
      } else {
        await dispatch(
          openAlreadyRegisteredDialog({
            title,
            registerNowText
          })
        );
      }
    };
}

export function isAlreadyRegisteredLinkDisabled(state: $TSFixMe): $TSFixMe {
  const {
    defaultUserSession: { isPlanner, isPreview, isTestMode },
    event: { isArchived }
  } = state;
  return (isArchived || !canLogin(state) || !shouldShowLinkToInvitee(state)) && !isPlanner && !isPreview && !isTestMode;
}

export function isEventCancelled(state: $TSFixMe): $TSFixMe {
  return state.event.status === EventStatus.CANCELLED;
}

function shouldShowLinkToInvitee(state) {
  /*
   * Already registered link should be shown when no invitee has been identified.
   * If an invitee has been identified, we should not show the link when its status is not in an accepted status
   */
  return (
    !isInviteeInUrl(getPagePath(state, getCurrentPageId(state))) ||
    [Accepted, PendingApproval].includes(state.userSession.inviteeStatus)
  );
}

function handleAuthenticationRedirection(account, event) {
  if (isHTTPPostOrSSOOnInAccount(account) && isExternalAuthOnInEvent(event)) {
    if (!isSpecificRegPathAuthLocation(event)) {
      redirectToExternalAuth(event, account);
      return true;
    }
  } else if (isOAuthOnInAccount(account) && isOAuthOnInEvent(event)) {
    if (!isSpecificRegPathAuthLocation(event)) {
      redirectToOAuthURL(event);
      return true;
    }
  }
  return false;
}
