import {
  isRegistrationModification,
  isNewRegistration,
  isRegApprovalRequired,
  getAttendeeId,
  getConfirmationInfo
} from '../redux/selectors/currentRegistrant';
import { getRegCart } from '../redux/selectors/shared';
import { setPendingApprovalStatus } from '../redux/persona';
import { showLoadingDialog, hideLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { shouldShowCookieBanner } from 'event-widgets/redux/selectors/complianceSettings';
import { getCookieStatus } from '../appInitialization/loadCookieConsent';
import { ALLOW, REGISTRATION_CONVERSION_BANNER } from '../utils/CookieConstants';
import { routeToPage, routeToPageWithoutQueryString } from '../redux/pathInfo';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import { autoRedirectToConcurFromConfirmationPage } from '../redux/travelCart/workflow';
import { setRegistrationIdInUserSession } from '../redux/userSession';
import {
  getEventRegistration as getEventRegistrationRegCart,
  getPrimaryRegistrationId,
  getAttendeePersonalInformation,
  getConfirmationNumber
} from '../redux/registrationForm/regCart/selectors';
import { abortRegCart } from '../redux/registrationForm/regCart';
import { loginRegistrant, logoutPlanner } from '../redux/registrantLogin/actions';
import { addQueryParams } from '../utils/queryUtils';
import { openPartialRegistrationConfirmationDialog } from '../dialogs';
import resolveDatatagsForCodeSnippets, { fetchAllDatatagResolutions } from '../utils/datatagUtils';

// function to logIn registrant to get the completed regCart after completing/canceling a mod
export const loadConfirmedRegCart = ({ abortCurrentRegCart, regCartHadElasticsearchDelay }: $TSFixMe = {}) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(showLoadingDialog());
    if (getRegCart(getState()).isAdmin) {
      dispatch(setRegistrationIdInUserSession()); // reset registration id
    }
    const {
      registrationForm: { regCart }
    } = getState();
    const isGroupLeaderFlag =
      getEventRegistrationRegCart(regCart, getPrimaryRegistrationId(regCart)).attendeeType === 'GROUP_LEADER';
    /**
     * use currentLogin info, as the form will be changed if Already registered
     * modal pops up during registration.
     */
    const isInitialAdminReg = isNewRegistration(getState()) && regCart.admin;
    let emailAddress;
    let confirmationNumber;
    let primaryEmailAddress;
    let primaryConfirmationNumber;
    // if initial reg and reg Cart has admin, relogin as admin.
    if (isInitialAdminReg) {
      emailAddress = regCart.admin.emailAddress;
      confirmationNumber = regCart.adminConfirmationNumber;
      // we need primary info if admin login failed due to sync issue.
      primaryEmailAddress = getAttendeePersonalInformation(regCart, getPrimaryRegistrationId(regCart)).emailAddress;
      primaryConfirmationNumber = getConfirmationNumber(regCart, getPrimaryRegistrationId(regCart));
    } else if (isGroupLeaderFlag || isRegistrationModification(getState())) {
      const registrantConfirmationInfo = getConfirmationInfo(getState());
      emailAddress = registrantConfirmationInfo.emailAddress;
      confirmationNumber = registrantConfirmationInfo.confirmationNumber;
    }
    if (emailAddress && confirmationNumber) {
      const confirmationInfo = {
        emailAddress,
        confirmationNumber,
        primaryEmailAddress,
        primaryConfirmationNumber
      };
      if (abortCurrentRegCart) {
        await dispatch(abortRegCart());
      }
      await dispatch(loginRegistrant(confirmationInfo, regCartHadElasticsearchDelay));
    }
    dispatch(hideLoadingDialog());
  };
};

export async function redirectToConfirmation(
  regStatus: $TSFixMe,
  dispatch: $TSFixMe,
  getState: $TSFixMe,
  includeQueryString = true
): Promise<$TSFixMe> {
  if (regStatus.statusCode === 'TIME_OUT_EXPIRED') {
    dispatch(openPartialRegistrationConfirmationDialog());
  }
  const {
    defaultUserSession: { isPlanner },
    plannerRegSettings: { successUrl }
  } = getState();
  const isRegMod = isRegistrationModification(getState());
  const isNewReg = isNewRegistration(getState());
  await dispatch(fetchAllDatatagResolutions());
  if (isRegApprovalRequired(getState())) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    await dispatch(setPendingApprovalStatus(getState()));
  }
  const inviteeId = getAttendeeId(getState());
  if (isPlanner) {
    dispatch(showLoadingDialog());
    await dispatch(logoutPlanner(addQueryParams(successUrl, { inviteestub: inviteeId })));
  } else {
    await dispatch(
      loadConfirmedRegCart({
        regCartHadElasticsearchDelay: regStatus.allAttendeeDataSyncedToES === false
      })
    );
    // run reg conversion code snippets
    const enabled = shouldShowCookieBanner(getState());
    if (!isRegMod) {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (window.CVENT && window.CVENT.runTriggerHandlers) {
        await dispatch(resolveDatatagsForCodeSnippets());
        window.CVENT.runTriggerHandlers('RegistrationConversion');
        if (getCookieStatus() === ALLOW || !enabled) {
          window.CVENT.runTriggerHandlers(REGISTRATION_CONVERSION_BANNER);
        }
      }
    }
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    dispatch(routeToPage(await dispatch(getConfirmationPageIdForInvitee(getState()))));
    if (includeQueryString) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      dispatch(routeToPage(await dispatch(getConfirmationPageIdForInvitee(getState()))));
    } else {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      dispatch(routeToPageWithoutQueryString(await dispatch(getConfirmationPageIdForInvitee(getState()))));
    }
    setTimeout(() => dispatch(autoRedirectToConcurFromConfirmationPage(regStatus, isNewReg)));
  }
}
