import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PrivateEventErrorDialogStyles from './styles/DialogError.less';
import { redirectToPage, routeToHomePage, routeToPage, getCurrentPageId } from '../redux/pathInfo';
import { logoutRegistrant, loginRegistrant } from '../redux/registrantLogin/actions';
import { loadRegistrationContentForRegApproval } from '../redux/persona';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import {
  isRegistrationModification,
  isGroupMember,
  getEventRegistrationId
} from '../redux/selectors/currentRegistrant';
import {
  getEventRegistration as getEventRegistrationRegCart,
  getPrimaryRegistrationId,
  getAttendeePersonalInformation,
  getConfirmationNumber
} from '../redux/registrationForm/regCart/selectors';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { getPageWithRegistrationSummary } from '../redux/website/pageContents';
import { hasAccessToWebsitePages } from '../redux/selectors/event';
import { SET_CURRENT_EVENT_REGISTRATION_ID } from '../redux/registrationForm/regCart/actionTypes';
import { getStartPageForCurrentRegPath } from '../redux/actions';
import { REGISTRATION } from '../redux/website/registrationProcesses';
import { withStyles } from './ThemedDialog';
import { startNewRegistrationAndNavigateToRegistration } from './index';

const Dialog = withStyles(StandardDialog);

export const openPrivateEventErrorDialog = (
  subMessage?: $TSFixMe,
  groupMemberRemoveCallback?: $TSFixMe,
  isSsoflow = false
) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = async () => {
      await dispatch(closeDialogContainer());
      // PROD-59063 during mod send registrant to confirmation page instead of homePage
      if (isRegistrationModification(getState())) {
        await dispatch(loadRegistrationContentForRegApproval());
        const {
          registrantLogin: { form },
          registrationForm: { regCart }
        } = getState();
        const isGroupLeaderFlag =
          getEventRegistrationRegCart(regCart, getPrimaryRegistrationId(regCart)).attendeeType === 'GROUP_LEADER';
        if (isGroupLeaderFlag) {
          const emailAddress = !form.emailAddress
            ? getAttendeePersonalInformation(regCart, getPrimaryRegistrationId(regCart)).emailAddress
            : form.emailAddress;
          const confirmationNumber = !form.confirmationNumber
            ? getConfirmationNumber(regCart, getPrimaryRegistrationId(regCart))
            : form.confirmationNumber;
          if (emailAddress && confirmationNumber) {
            const confirmationInfo = {
              emailAddress,
              confirmationNumber
            };
            await dispatch(loginRegistrant(confirmationInfo));
          }
        }

        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        return dispatch(routeToPage(await dispatch(getConfirmationPageIdForInvitee(getState()))));
      }

      /*
       * FLEX-26772 ID confirm is ran when pressed next so passed in the remove gm function since couldn't
       * import because would cause cycle. if group registration and on the gm path,
       * remove current gm and send to regSummary page
       */
      const currentEventRegistrationId = getEventRegistrationId(getState());
      if (
        isGroupMember(getState(), currentEventRegistrationId) &&
        groupMemberRemoveCallback &&
        typeof groupMemberRemoveCallback === 'function'
      ) {
        const {
          registrationForm: { regCart }
        } = getState();
        dispatch({
          type: SET_CURRENT_EVENT_REGISTRATION_ID,
          payload: {
            currentEventRegistrationId: getPrimaryRegistrationId(regCart)
          }
        });
        await dispatch(groupMemberRemoveCallback([currentEventRegistrationId]));
        return dispatch(routeToPage(getPageWithRegistrationSummary(getState()).id));
      }

      const isWebsitePageAccessible = hasAccessToWebsitePages(getState());
      let stillOnRegistrationPage = false;
      if (isSsoflow) {
        dispatch(redirectToPage('summary'));
      } else if (!isWebsitePageAccessible) {
        stillOnRegistrationPage = true;
        const currentPage = getCurrentPageId(getState());
        const regPageStart = await dispatch(getStartPageForCurrentRegPath(REGISTRATION));
        const isOnFirstRegPage = currentPage === regPageStart;
        if (!isOnFirstRegPage) {
          await dispatch(startNewRegistrationAndNavigateToRegistration());
        }
      } else {
        dispatch(routeToHomePage());
      }

      /*
       * need to wait until after routing to the home page because logging out the registrant while registration pages
       * render in the background can cause hard errors
       * and dont logout if we are staying on a registration page
       */
      if (!stillOnRegistrationPage) {
        dispatch(logoutRegistrant());
      }
    };

    const dialog = (
      <Dialog
        onClose={boundCloseDialog}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('EventGuestSide_PrivateEvent_Error_Message__resx')}
        subMessage={translate(subMessage) || translate('EventGuestSide_PrivateEvent_Error_SubMessage__resx')}
        title={translate('EventGuestSide_PrivateEvent_Title__resx')}
        iconModifier="error"
        classes={PrivateEventErrorDialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: PrivateEventErrorDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
