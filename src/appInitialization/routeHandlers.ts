import { getDefaultWebsitePageId, getPageId, pageExists, isWebsiteVarietyPage } from '../redux/website';
import {
  evaluateQuestionVisibilityLogic,
  filterEventSnapshot,
  getRedirectPageIdIfOnWrongPath,
  loadEventSnapshotAndTransform,
  loadGuestRegistrationContent,
  loadMultipleRegistrationContent,
  loadRegistrationContent,
  setReferrer,
  getStartPageForCurrentRegPath
} from '../redux/actions';
import { logoutRegistrant, loginRegistrant } from '../redux/registrantLogin/actions';
import {
  getPagePath,
  redirectToPage,
  routeToPage,
  setCurrentPage,
  getCurrentPageId,
  routeToPageWithoutQueryString
} from '../redux/pathInfo';
import {
  pageTransitionShowLoading,
  pageTransitionHideLoading,
  hideLoadingOnError
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { SET_CURRENT_EVENT_REGISTRATION_ID } from '../redux/registrationForm/regCart/actionTypes';
import {
  findKnownErrorResourceKey,
  getCancelErrors,
  getDeclineErrors,
  getModErrors,
  getModAndCancelErrors
} from '../redux/registrationForm/errors';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import {
  finalizeDeclineRegistration,
  removeEventRegistrationFromRegCart,
  restoreRegistration,
  saveRegistration,
  startCancelRegistration,
  startDeclineRegistration,
  startModification,
  startWaitlistRegistration
} from '../redux/registrationForm/regCart';
import { startPostRegistrationPaymentPage } from '../redux/postRegistrationPayment';
import { populateRegCartVisibleProducts } from '../redux/visibleProducts';
import { handleRegistrantRemovalInTravelCart, startTravelCancellation } from '../redux/travelCart';
import {
  getPrimaryAttendee,
  getPrimaryRegistrationId,
  isPlaceholderRegCart,
  isWaitlistCart
} from '../redux/registrationForm/regCart/selectors';
import { createOptOutPageHandler, prepareForOptOutPageLoad } from '../widgets/OptOut';
import { createUnsubscribePageHandler, prepareForUnsubscribePageLoad } from '../widgets/Unsubscribe';
import loadPageResources from 'nucleus-widgets/utils/layout/loadPageResources';
import {
  openAlreadyRegisteredDialog,
  openDeclineRegistrationDialog,
  openEventStatusDialog,
  openEventWaitlistDialog,
  openPrivateRegistrationPathDialog,
  openSingleSignOnRegistrationDialog,
  openStartNewRegistrationDialogFromPageLanding,
  openTransactionInProcessingErrorDialog
} from '../dialogs';
import { openWebsitePasswordDialog } from '../dialogs/WebsitePasswordDialog';
import { ACTIVE, PENDING, CLOSED, CANCELLED, COMPLETED } from 'event-widgets/clients/EventStatus';
import { mapValues, some } from 'lodash';
import initializeMultiTabTracking, {
  forceTabToActive,
  handlePageChange,
  isOtherActiveTabOnDeclineStartPage,
  isOtherActiveTabOnRegistrationStartPage,
  promptToTakeOverRegistration
} from '../initializeMultiTabTracking';
import { getPageWithRegistrationSummary, isWidgetPresentOnCurrentPage } from '../redux/website/pageContents';
import Logger from '@cvent/nucleus-logging';
import {
  addGroupMemberEventRegIdToUrl,
  containsRegistrationSummary,
  containsSubmitPayment,
  getCurrentEventRegistrationIdFromURL,
  urlStrippedCurrentEventRegistrationId
} from '../utils/registrationUtils';
import {
  loadRegistrationContentForRegApproval,
  setPendingApprovalStatus,
  updateInviteeStatusAndContactIdInStore
} from '../redux/persona';
import {
  beginNewRegistration,
  startAdminRegistration,
  disableRegistrationAndRedirectToRegistrationStart
} from '../routing/startRegistration';
import { getQueryParam, stripQueryParams } from '../utils/queryUtils';
import qs from 'querystring';
import querystring from 'querystring';
import { InviteeStatusById } from 'event-widgets/utils/InviteeStatus';
// Selectors
import {
  getConfirmationInfo,
  getEventRegistrationId,
  getRegCartEventSnapshotVersion,
  getRegistrationTypeId,
  isAdminRegistration,
  isGroupLeader,
  isGroupRegistration,
  isLoggedIn,
  isNewRegistration,
  isRegistrationCancellation,
  isRegistrationModification
} from '../redux/selectors/currentRegistrant';
import {
  canWaitlist,
  getSiteEditorRegistrationPath,
  isWaitlistEnabled,
  requireRegApproval,
  isOAuthOnInEvent,
  hasAccessToWebsitePages,
  hasNoAccessAlreadyRegisteredPage
} from '../redux/selectors/event';
import {
  getAssociatedRegistrationPathId,
  getRegCart,
  isHTTPPostOrSSOOnInAccount,
  isOAuthOnInAccount,
  shouldOpenSsoDialog,
  getAllRegistrantRegPathIds,
  isSingleSignOn,
  determineRegCartIdToAbort,
  areRegistrationActionsDisabled
} from '../redux/selectors/shared';
import {
  getRegistrationPathIdOrDefault,
  getRegistrationPathIdOrNull
} from '../redux/selectors/currentRegistrationPath';
import { getArchivePageId } from '../redux/website/selectors';
import { isPlannerRegMod, setSsoFlowSelectionInUserSession } from '../redux/userSession';
import {
  APPROVAL_DENIED,
  CANCELLATION,
  DECLINE,
  GUEST_REGISTRATION,
  isPostRegistrationPage,
  isRegistrationPage,
  PENDING_APPROVAL,
  POST_REGISTRATION,
  POST_REGISTRATION_PAYMENT,
  REGISTRATION,
  WAITLIST
} from '../redux/website/registrationProcesses';
import { createConfirmationPageHandler } from '../routing/confirmationPage';
import { checkEventPasscodeProtected } from '../utils/securityUtils';
import { shouldShowCookieBanner } from 'event-widgets/redux/selectors/complianceSettings';
import { ALLOW, ALLPAGES_BANNER } from '../utils/CookieConstants';
import { getCookieStatus } from './loadCookieConsent';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import resolveDatatagsForCodeSnippets, { fetchAllDatatagResolutions } from '../utils/datatagUtils';
import { prepareForVirtualDetailsPageLoad } from '../widgets/VirtualDetails/redux';
import { openKnownErrorDialog } from '../dialogs/KnownErrorDialog';
import { recordWebsitePageViewActivity } from './routeHandlersActivity';

const LOG = new Logger('event-guestside-site/src/routeHandlers');

const guestSideOnlyPaths = {
  UNSUBSCRIBE: 'unsubscribe',
  OPT_OUT: 'opt-out',
  VIRTUAL_DETAILS: 'virtualDetails'
};
const guestSideOnlyPageIds = {
  UNSUBSCRIBE_SUBSCRIBE: 'unsubscribeSubscribe',
  OPT_IN_OUT: 'optInOut',
  VIRTUAL_DETAILS: 'virtualDetails'
};

const shouldRedirectFromRegistrationPage = (state, isModification) => {
  if (state.event.isArchived) {
    return false;
  }
  return (
    (state.event.status === COMPLETED && !state.defaultUserSession.isPlanner) ||
    (state.event.status === CLOSED &&
      !canWaitlist(state, getAssociatedRegistrationPathId(state, state.userSession.regTypeId)) &&
      !isModification &&
      !state.defaultUserSession.isPlanner) ||
    state.event.status === CANCELLED
  );
};

const shouldDisplayEventStatusDialog = (state, pageId, path) => {
  return (
    state.event.status === CANCELLED ||
    ((state.event.status === CLOSED || state.event.status === COMPLETED) &&
      (path.endsWith('register') || isRegistrationPage(state, pageId)))
  );
};
/**
 * A function to call at the beginning of every route that executes any event
 * status related logic to determine if things like redirects or informational
 * dialogs need to happen.
 * @returns {boolean} True if a redirect is triggered, false otherwise.
 */
// eslint-disable-next-line complexity
async function executeEventStatusRules(store, nextRouterState, routerContext, { isModification = false } = {}) {
  const state = store.getState();

  const {
    defaultUserSession: { isPlanner, isPreview },
    event: { isArchived }
  } = state;
  const {
    history,
    match: {
      params: { pageId },
      path
    }
  } = nextRouterState;

  if (
    isArchived &&
    !isPlanner &&
    !isPreview &&
    !some(Object.values(guestSideOnlyPaths), guestSideOnlyPath => path.endsWith(guestSideOnlyPath)) &&
    (!pageId || !some(Object.values(guestSideOnlyPageIds), guestSideOnlyPageId => pageId === guestSideOnlyPageId))
  ) {
    history.replace(getPagePath(state, getArchivePageId(state.website.pluginData)));
    return true;
  }

  const isWebsitePageAccessible = hasAccessToWebsitePages(state);
  if (!isWebsitePageAccessible && isWebsiteVarietyPage(state, pageId)) {
    const regPageId = await store.dispatch(getStartPageForCurrentRegPath(REGISTRATION));
    // Redirect to the first page of registration
    history.replace(getPagePath(state, regPageId));
    return true;
  }

  // Only execute this logic on the initial website load.
  if (routerContext.isFirstRender) {
    routerContext.isFirstRender = false; // eslint-disable-line no-param-reassign
    // Check the event status to see if we need to open the dialog.
    if (shouldRedirectFromRegistrationPage(state, isModification)) {
      if (shouldDisplayEventStatusDialog(state, pageId, path)) {
        store.dispatch(openEventStatusDialog(state.event.status, state.text.translate));
      }

      // Check if we also need to redirect.
      if (needsRedirection(state, pageId, path)) {
        if (isWebsitePageAccessible) {
          history.replace(getPagePath(state, getDefaultWebsitePageId(state)));
        } else {
          await store.dispatch(
            disableRegistrationAndRedirectToRegistrationStart(page => history.replace(getPagePath(state, page)))
          );
        }
        return true;
      }
    } else {
      initializeMultiTabTracking(store, pageId);
    }
  }
  return false;
}

/**
 * A function that determines whether we should trigger a redirect
 * PROD-120444, return false if the registrant is arriving from AH
 * and the next page is the confirmation page and the event is closed or completed
 */
function needsRedirection(state, pageId, path) {
  const {
    event: {
      eventSecuritySetupSnapshot: { postRegistrationAuthType }
    }
  } = state;

  // If we are being redirected by AH
  // And the event is closed or completed then do not trigger a redirect
  if (postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE) {
    return !((state.event.status === CLOSED || state.event.status === COMPLETED) && path.endsWith('confirmationpage'));
  }

  // If the next page is a registration or a guest registration page then trigger a redirect
  return !pageId || REGISTRATION.isTypeOfPage(state, pageId) || GUEST_REGISTRATION.isTypeOfPage(state, pageId);
}

/**
 * A function to run code snippets for all pages
 */
async function runCodeSnippets(dispatch, getState) {
  const state = getState();
  const {
    defaultUserSession: { isTestMode, isPlanner, isPreview }
  } = state;
  if (isTestMode || (!isPlanner && !isPreview)) {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (window.CVENT && window.CVENT.runTriggerHandlers) {
      await dispatch(resolveDatatagsForCodeSnippets());
      window.CVENT.runTriggerHandlers('AllPages');
      // if cookie banner is disabled than all the code snippets should run. User consent on allow button isn't needed
      const isCookieBannerEnabled = shouldShowCookieBanner(state) && !state.defaultUserSession.isPlanner;
      if (!isCookieBannerEnabled || getCookieStatus() === ALLOW) {
        window.CVENT.runTriggerHandlers(ALLPAGES_BANNER);
      }
    }
  }
}

/**
 * A function to send google analytics data
 */
function sendGoogleAnalytics(state) {
  const {
    event: { googleAnalyticsSettings },
    defaultUserSession: { isTestMode, isPlanner, isPreview }
  } = state;
  const currentPageId = getCurrentPageId(state);
  if (!isPlanner && !isPreview && !isTestMode && currentPageId) {
    if ((window as $TSFixMe).ga) {
      const isCookieBannerEnabled = shouldShowCookieBanner(state);
      if (
        !isCookieBannerEnabled ||
        !googleAnalyticsSettings?.isDropGoogleAnalyticsToCookieBannerTied ||
        (googleAnalyticsSettings?.isDropGoogleAnalyticsToCookieBannerTied && getCookieStatus() === ALLOW)
      ) {
        /*
         * if cookie banner is disabled than all the google analytics should run.
         * User consent on allow button isn't needed
         */
        (window as $TSFixMe).ga('set', 'page', getPagePath(state, currentPageId));
        (window as $TSFixMe).ga('send', 'pageview');
      }
    }
  }
}

/**
 * A function to call at the end of every entry route handler to update the current page
 */
const pageUpdateHandler = async (store, nextRouterState) => {
  if (nextRouterState.match.params.pageId) {
    store.dispatch(setCurrentPage(nextRouterState.match.params.pageId));
  }

  /*
   * send google analytics page view
   * whenever a new route is clicked
   * only for guest side in standard mode
   */
  sendGoogleAnalytics(store.getState());

  await store.dispatch(fetchAllDatatagResolutions());
  // run code snippets for all pages
  void runCodeSnippets(store.dispatch, store.getState);

  if (window) {
    window.scrollTo(0, 0);
  }
};

/**
 * Creates a new route handler which manages the common functionality of all route handlers.
 * This includes permissions to enter the route and loading displays if any aynchronous
 * operations within the route handler are taking too long.
 */
const manageRouteHandler = (route, store, routerContext, eventStatusRuleOptions = undefined) => {
  return async (nextRouterState, currentRouteInfo) => {
    const state = store.getState();
    const { pageId } = nextRouterState.match.params;
    const {
      defaultUserSession: { isPlanner },
      event: {
        eventSecuritySetupSnapshot: { authenticationType, authenticationLocation, authenticatedRegistrationPaths }
      }
    } = state;

    if (
      !isPlanner &&
      checkEventPasscodeProtected(
        authenticationType,
        authenticationLocation,
        pageId,
        { appData: state.appData, website: state.website },
        authenticatedRegistrationPaths,
        state.userSession.verifiedWebsitePassword
      )
    ) {
      store.dispatch(openWebsitePasswordDialog());
    }
    // Just return early if event status rules trigger a redirect.
    const redirectBasedOnEventRules = await executeEventStatusRules(
      store,
      nextRouterState,
      routerContext,
      eventStatusRuleOptions
    );
    if (redirectBasedOnEventRules) {
      void pageUpdateHandler(store, nextRouterState);
      return;
    }
    store.dispatch(pageTransitionShowLoading());
    try {
      await route(nextRouterState, currentRouteInfo);
    } catch (error) {
      store.dispatch(hideLoadingOnError());
      throw error;
    }
    void pageUpdateHandler(store, nextRouterState);
    recordWebsitePageViewActivity(store, pageId);
    store.dispatch(pageTransitionHideLoading());
    /*
     * This is needed because of https://jira.cvent.com/browse/PROD-98887
     * For chrome only, in some cases scroll jumps below loading icon when the loading icon is hidden
     */
    if (window) {
      window.scrollTo(0, 0);
    }
  };
};

const createIndexHandler = store => async nextRouterState => {
  const state = store.getState();
  const {
    userSession: { authenticatedContact, ssoFlowSelected, isSsoAdmin }
  } = state;
  const {
    match: {
      params: { pageId }
    }
  } = nextRouterState;

  // If attendee is coming from SSO authentication, then we need to show the SSO dialog
  if (shouldOpenSsoDialog(state, authenticatedContact, ssoFlowSelected) && !isPostRegistrationPage(state, pageId)) {
    return await startAdminRegOrOpenSSODialog(isSsoAdmin, store);
  }
  nextRouterState.history.replace(getPagePath(state, getDefaultWebsitePageId(state)));
};

export function setCurrentRegistrant(currentEventRegistrationId: $TSFixMe): $TSFixMe {
  return {
    type: SET_CURRENT_EVENT_REGISTRATION_ID,
    payload: {
      currentEventRegistrationId
    }
  };
}

/*
 * While resuming an abandoned reg from planner side,
 * we bypass the popup (openStartNewRegistrationDialog) and
 * trigger the abandoned regcart resumption flow
 */
async function resumeAbandonReg(store) {
  await store.dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrDefault(store.getState())));
  await store.dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrDefault(store.getState())));
  await store.dispatch(populateRegCartVisibleProducts());
  const routeToPageId = REGISTRATION.forCurrentRegistrant().startPageId(store.getState());
  store.dispatch(forceTabToActive(routeToPageId));
  store.dispatch(routeToPage(routeToPageId));
}

async function restoreReg(initialState, regCartId, store, nextRouterState, isAnyPageCurrentlyDisplayed) {
  await store.dispatch(restoreRegistration(regCartId));
  const updatedState = store.getState();
  if (initialState.userSession.isAbandonedReg) {
    await resumeAbandonReg(store);
    return;
  }
  /*
   * Check to see if we have an abandoned waitlist cart
   * If we do, logout the user and go to the waitlist page
   */
  if (
    isWaitlistCart(updatedState.registrationForm.regCart) &&
    (updatedState.registrationForm.regCart.status === 'INPROGRESS' ||
      updatedState.registrationForm.regCart.status === 'COMPLETED')
  ) {
    await store.dispatch(logoutRegistrant());
    await store.dispatch(
      beginNewRegistration({
        changePageOverride: pageId => nextRouterState.history.replace(getPagePath(initialState, pageId))
      })
    );
    return;
  }
  handlePageBehindDialog(isAnyPageCurrentlyDisplayed, nextRouterState, store);
  await Promise.all([store.dispatch(populateRegCartVisibleProducts())]);
  await reloadWebsiteIfNeeded(updatedState, store);
  if (isWaitlistCart(updatedState.registrationForm.regCart)) {
    await store.dispatch(logoutRegistrant());
    store.dispatch(openEventWaitlistDialog());
  } else {
    store.dispatch(
      openStartNewRegistrationDialogFromPageLanding({
        title: '_registerNowWidget_textConfig__resx',
        style: initialState.website.theme.global
      })
    );
  }
}

/*
 * If no page is currently being display, we need to show the default so that there is something behind the dialog
 * Otherwise, we will just stay on the page we were on
 */
function handlePageBehindDialog(isAnyPageCurrentlyDisplayed, nextRouterState, store) {
  if (!isAnyPageCurrentlyDisplayed) {
    nextRouterState.history.replace(getPagePath(store.getState(), getDefaultWebsitePageId(store.getState())));
  }
}

/*
 * PROD-77383: Website needs to be reloaded once store is updated with the session reg cart
 * because session reg cart might have a different reg path than the reg path website is loaded with.
 */
async function reloadWebsiteIfNeeded(updatedState, store) {
  const newRegPathId = (Object.values(updatedState.registrationForm.regCart.eventRegistrations)[0] as $TSFixMe)
    .registrationPathId;
  const newRegTypeId = (Object.values(updatedState.registrationForm.regCart.eventRegistrations)[0] as $TSFixMe)
    .registrationTypeId;
  if (
    newRegPathId &&
    !Object.keys(updatedState.appData.registrationSettings.registrationPaths).includes(newRegPathId)
  ) {
    await Promise.all([
      store.dispatch(filterEventSnapshot(updatedState.eventSnapshotVersion, newRegTypeId, newRegPathId)),
      store.dispatch(loadRegistrationContent(REGISTRATION, newRegPathId)),
      store.dispatch(loadGuestRegistrationContent(newRegPathId))
    ]);
  }
}

// eslint-disable-next-line complexity
const createPageHandler = store => async nextRouterState => {
  let state = store.getState(); // remember to evaluate state again after dispatching any action that results in change
  const {
    clients: { attendeeLoginClient },
    userSession: { regCartId, authenticatedContact, ssoFlowSelected, isSsoAdmin, hasRegisteredInvitees },
    event: {
      eventSecuritySetupSnapshot: {
        authenticationType,
        authenticationLocation,
        authenticatedRegistrationPaths,
        postRegistrationAuthType
      }
    },
    externalAuthentication: { arriveFromDialog },
    // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
    experiments: { flexSsoAdminRegManage } = {}
  } = state;
  const {
    history,
    match: {
      params: { pageId }
    }
  } = nextRouterState;
  const isWebsitePageAccessible = hasAccessToWebsitePages(state);

  // If attendee is coming from SSO authentication, then we need to show the SSO dialog
  if (shouldOpenSsoDialog(state, authenticatedContact, ssoFlowSelected) && !isPostRegistrationPage(state, pageId)) {
    return await startAdminRegOrOpenSSODialog(isSsoAdmin, store);
  }

  // if page code is specified, redirect to that page. go to summary page if no page with that code is found
  const query = qs.parse(getPagePath(state, pageId).split('?')[1]) || {};
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (query && query.pc) {
    const newPageId = getPageId(state, query.pc);
    if (newPageId) {
      history.replace(stripQueryParams(getPagePath(state, newPageId), ['pc']));
    } else {
      history.replace(stripQueryParams(getPagePath(state, getDefaultWebsitePageId(state)), ['pc']));
    }
    return;
  }

  // check if event is passcode protected
  const isEventPasscodeProtected = checkEventPasscodeProtected(
    authenticationType,
    authenticationLocation,
    pageId,
    { appData: state.appData, website: state.website },
    authenticatedRegistrationPaths,
    !state.userSession.verifiedWebsitePassword
  );

  // PROD-83105: dont show already registered popup in case of passcode protected event
  if (pageId === 'alreadyRegistered' && (!isEventPasscodeProtected || state.userSession.verifiedWebsitePassword)) {
    // APEX-9665: redirect to summary page when already registered page is opened for container event with reg off and website live
    if (hasNoAccessAlreadyRegisteredPage(state)) {
      store.dispatch(routeToPageWithoutQueryString(getDefaultWebsitePageId(state)));
      return;
    }

    const {
      account,
      event,
      userSession: { emailAddress, confirmationNumber }
    } = state;

    // If the user is coming from OAuth or SSO or HTTP Post authentication then have to skip the pop up
    const isOAuthOn = isOAuthOnInAccount(account) && isOAuthOnInEvent(event);
    if ((isOAuthOn || isHTTPPostOrSSOOnInAccount(account)) && confirmationNumber) {
      const confirmationInfo = {
        emailAddress: emailAddress || '',
        confirmationNumber
      };
      await store.dispatch(loginRegistrant(confirmationInfo));
      await store.dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(state)));
      await store.dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(state)));
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      const confirmationPageId = await store.dispatch(getConfirmationPageIdForInvitee(state));
      store.dispatch(routeToPage(confirmationPageId));
      return;
    }
    store.dispatch(setReferrer('alreadyRegistered'));
    history.replace(getPagePath(state, getDefaultWebsitePageId(state)));
    if (postRegistrationAuthType === PostRegistrationAuthType.SECURE_VERIFICATION_CODE) {
      attendeeLoginClient.authorize();
    } else {
      store.dispatch(
        openAlreadyRegisteredDialog({
          title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx'
        })
      );
    }
    return;
  }

  const currentMemberEventRegistration =
    nextRouterState.match.params.pageId &&
    getCurrentEventRegistrationIdFromURL(getPagePath(state, nextRouterState.match.params.pageId));
  let isGroupReg = isGroupRegistration(state);
  // Handle page refresh and deep linking
  const cartExists = (getRegCart(state) || {}).regCartId;
  const postRegCartExists = (getRegCart(state) || {}).status === 'TRANSIENT';
  const registrationActionsDisabled = areRegistrationActionsDisabled(state);

  if (state.userSession.regCartId && !(cartExists || postRegCartExists)) {
    if (!registrationActionsDisabled) {
      await store.dispatch(restoreRegistration(regCartId));
    }
    state = store.getState();
    const currentEventRegistrationId = getEventRegistrationId(state);
    const isGroupLead = isGroupLeader(state, currentEventRegistrationId);
    // if admin/group leader on confirmation page and refresh, need to re-login.
    if (
      isPostRegistrationPage(state, pageId) &&
      containsRegistrationSummary(store.getState().website, pageId) &&
      (isAdminRegistration(store.getState()) || isGroupLead)
    ) {
      const { emailAddress, confirmationNumber } = getConfirmationInfo(state);
      if (emailAddress && confirmationNumber) {
        const confirmationInfo = {
          emailAddress,
          confirmationNumber
        };
        await store.dispatch(loginRegistrant(confirmationInfo));
      }
    } else if (!registrationActionsDisabled) {
      await store.dispatch(populateRegCartVisibleProducts());
      // Evaluate visibility logic for questions
      await store.dispatch(evaluateQuestionVisibilityLogic(null, true));
      state = store.getState();
      // restore currentEventRegistrationId from URL if needed
      isGroupReg = isGroupRegistration(state);
      if (
        pageId &&
        (REGISTRATION.isTypeOfPage(state, pageId) || GUEST_REGISTRATION.isTypeOfPage(state, pageId)) &&
        currentMemberEventRegistration.currentEventRegistrationId &&
        isGroupReg
      ) {
        // For pages before reg summary, it is set from URL
        await store.dispatch(setCurrentRegistrant(currentMemberEventRegistration.currentEventRegistrationId));
      }
    }

    // make sure registration content is loaded for non-default paths
    state = store.getState();
    await Promise.all([
      store.dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(state))),
      store.dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(state)))
    ]);
  }

  // Navigate to default page if the page does not exist.
  if (
    !some(Object.values(guestSideOnlyPageIds), guestSideOnlyPageId => pageId === guestSideOnlyPageId) &&
    !pageExists(store.getState(), pageId) &&
    isWebsitePageAccessible
  ) {
    history.replace(getPagePath(state, getDefaultWebsitePageId(state)));
    return;
  }

  /*
   * reload post reg content in order to display confirmation page drop down after reg mod on refresh
   */
  if (isRegistrationModification(store.getState())) {
    await store.dispatch(loadRegistrationContent(POST_REGISTRATION, getRegistrationPathIdOrDefault(state)));
  }
  /*
   * reload reg content in order to display reg summary info on confirmation page after refresh
   */
  if (isPostRegistrationPage(state, pageId) && containsRegistrationSummary(store.getState().website, pageId)) {
    state = store.getState();
    const currentEventRegistrationId = getEventRegistrationId(state);
    const isGroupLead = isGroupLeader(state, currentEventRegistrationId);
    const isRegMod = isRegistrationModification(state);
    const isRegCancel = isRegistrationCancellation(state);
    if ((isGroupLead || isAdminRegistration(state)) && (isRegMod || isRegCancel)) {
      // if group_leader or admin do regMod/regCancel, need re-login to get all registrants.
      const { emailAddress, confirmationNumber } = getConfirmationInfo(state);
      if (emailAddress && confirmationNumber) {
        const confirmationInfo = {
          emailAddress,
          confirmationNumber
        };
        await store.dispatch(loginRegistrant(confirmationInfo));
      }
    }

    await store.dispatch(loadMultipleRegistrationContent(getAllRegistrantRegPathIds(store.getState())));
    await store.dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(store.getState())));

    if (
      flexSsoAdminRegManage &&
      isSingleSignOn(state.account) &&
      authenticatedContact &&
      !arriveFromDialog &&
      hasRegisteredInvitees
    ) {
      await store.dispatch(openSingleSignOnRegistrationDialog());
    }
  }

  state = store.getState();
  const regCart = getRegCart(state) || {};
  if (isLoggedIn(state)) {
    if (isNewRegistration(state) && regCart.status !== 'INPROGRESS') {
      if (requireRegApproval(state)) {
        await Promise.all([
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
          store.dispatch(setPendingApprovalStatus(state)),
          store.dispatch(loadRegistrationContentForRegApproval())
        ]);
      }
    } else if (!isRegistrationModification(state)) {
      /**
       * Should only run when logged in and not currently in a reg mod (handled in refresh logic)
       * i.e. on the summary, fees, or agenda page while logged in
       */
      const attendee = getPrimaryAttendee(regCart);
      if (attendee) {
        await Promise.all([
          store.dispatch(updateInviteeStatusAndContactIdInStore(attendee)),
          store.dispatch(loadRegistrationContentForRegApproval(InviteeStatusById[attendee.inviteeStatus]))
        ]);
      }
    }
    await store.dispatch(loadRegistrationContent(POST_REGISTRATION, getRegistrationPathIdOrDefault(state)));
  }

  if (
    pageId &&
    isRegistrationPage(state, pageId) &&
    (regCart.status === 'COMPLETED' ||
      regCart.status === 'PROCESSING' ||
      regCart.status === 'QUEUED' ||
      regCart.status === 'PAYMENT_INITIATED' ||
      regCart.status === 'THIRD_PARTY_REDIRECT' ||
      regCart.status === 'THIRD_PARTY_REDIRECT_STARTED' ||
      (regCart.status === 'INPROGRESS' && regCart.paymentInfo && regCart.paymentInfo.paymentStatus === 'PaymentFailed'))
  ) {
    const navWidgetModule = import('../widgets/RegistrationNavigator/RegistrationNavigatorWidget');
    /*
     * Completed - Should take you to the confirmation page
     * Processing / Queued / Payment Initiated / Third Party Redirect - Continue to wait and poll reg cart status
     */
    if (regCart.status !== 'COMPLETED') {
      await store.dispatch(loadPageResources(store.getState().website, pageId));
    }
    const { continueRegistration } = await navWidgetModule;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    await store.dispatch(continueRegistration(state));
    return;
  }

  // If the page being accessed is on the wrong reg path, redirect to the right one
  const redirectPageId = await store.dispatch(getRedirectPageIdIfOnWrongPath(pageId));
  if (redirectPageId) {
    LOG.info(`redirecting to ${redirectPageId} because on wrong path`);
    history.replace(getPagePath(state, redirectPageId));
    return;
  }

  const URL = getPagePath(state, pageId);
  const currentEventRegistrationIdFromState = getEventRegistrationId(state);
  const primaryEventRegistrationId = getPrimaryRegistrationId(regCart);
  const currentEventRegistrationIdFromURL = getCurrentEventRegistrationIdFromURL(URL);
  // This is for switching back to group leaders eventRegistrationId when on a reg page with regSummary widget
  if (
    pageId &&
    isRegistrationPage(state, pageId) &&
    isWidgetPresentOnCurrentPage(state.website, 'RegistrationSummary', pageId) &&
    isGroupReg
  ) {
    // remove the eventRegistration if we got here without completing the group members registration.
    if (
      !currentMemberEventRegistration.memberCompletedReg &&
      currentEventRegistrationIdFromState !== primaryEventRegistrationId
    ) {
      LOG.debug('Removing travel bookings for the eventRegistration with id ', currentEventRegistrationIdFromState);
      await store.dispatch(handleRegistrantRemovalInTravelCart(currentEventRegistrationIdFromState));
      await store.dispatch(removeEventRegistrationFromRegCart(currentEventRegistrationIdFromState));
      // saveRegistration so that the removed event reg is persisted in reg API
      await store.dispatch(saveRegistration());
    }
    // return to the group leader's registration and update state so we can do further routing
    store.dispatch(setCurrentRegistrant(primaryEventRegistrationId));
    state = store.getState();
    // the leader could be on a different path with a different summary page, so redirect to the summary page
    let primaryRegSummaryPage = getPageWithRegistrationSummary(state);
    if (!primaryRegSummaryPage) {
      await store.dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrDefault(state)));
      await store.dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrDefault(state)));
      state = store.getState();
      primaryRegSummaryPage = getPageWithRegistrationSummary(state);
    }
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const primaryRegSummaryPathId = primaryRegSummaryPage && primaryRegSummaryPage.id;
    if (primaryRegSummaryPathId !== pageId) {
      history.replace(urlStrippedCurrentEventRegistrationId(getPagePath(state, primaryRegSummaryPathId)));
      return;
    }
    history.replace(urlStrippedCurrentEventRegistrationId(getPagePath(state, pageId)));
  } else if (pageId && isRegistrationPage(state, pageId)) {
    // Remove currentEventRegistrationId from URL if the id in the state is the group leaders or if there is a mismatch
    if (currentEventRegistrationIdFromURL && currentEventRegistrationIdFromState === primaryEventRegistrationId) {
      history.replace(urlStrippedCurrentEventRegistrationId(URL));
    } else if (
      currentEventRegistrationIdFromState &&
      currentEventRegistrationIdFromURL &&
      currentEventRegistrationIdFromURL !== currentEventRegistrationIdFromState
    ) {
      history.replace(
        addGroupMemberEventRegIdToUrl(urlStrippedCurrentEventRegistrationId(URL), currentEventRegistrationIdFromState)
      );
    }
  } else if (pageId && !isRegistrationPage(state, pageId)) {
    // Remove currentEventRegistrationId from URL
    store.dispatch(setCurrentRegistrant(primaryEventRegistrationId));
    history.replace(urlStrippedCurrentEventRegistrationId(getPagePath(state, pageId)));
  }

  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
  const fromRedirect = getQueryParam(queryParams, 'fromRedirect');
  if (
    POST_REGISTRATION_PAYMENT.isTypeOfPage(state, pageId) &&
    regCart.postRegPayment &&
    fromRedirect &&
    fromRedirect === 'true'
  ) {
    if (regCart.status !== 'COMPLETED') {
      await store.dispatch(loadPageResources(store.getState().website, pageId));
    }
    const postRegNavWidget = import('../widgets/RegistrationPostRegPaymentNavigatorWidget');
    /*
     * Completed - Should take you to the confirmation page
     * Processing / Queued / Payment Initiated / Third Party Redirect - Continue to wait and poll reg cart status
     */
    if (regCart.status !== 'COMPLETED') {
      await store.dispatch(loadPageResources(store.getState().website, pageId));
    }
    const { continuePostRegPayment } = await postRegNavWidget;
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    await store.dispatch(continuePostRegPayment(state));
    return;
  }

  if (
    !state.orders &&
    (POST_REGISTRATION_PAYMENT.isTypeOfPage(state, pageId) || containsSubmitPayment(store.getState().website, pageId))
  ) {
    await store.dispatch(startPostRegistrationPaymentPage());
  }
  /*
   * Individual pages access rules
   * 1. Registration pages require active Registration regCart
   */
  if (
    isRegistrationPage(state, pageId) &&
    (!regCart.regCartId || regCart.regDecline) &&
    !registrationActionsDisabled &&
    !isPlaceholderRegCart(getRegCart(store.getState()))
  ) {
    if (isPlannerRegMod(state)) {
      history.replace(getPagePath(state, 'modifyRegistration'));
    } else {
      history.replace(getPagePath(state, 'register'));
    }
    return;
  }
  /*
   * 2. Post Reg, registration pending approval, registration denied, and Cancellation pages
   * require user logged in (confirmed registration)
   */
  if (
    (POST_REGISTRATION.isTypeOfPage(state, pageId) ||
      CANCELLATION.isTypeOfPage(state, pageId) ||
      PENDING_APPROVAL.isTypeOfPage(state, pageId) ||
      APPROVAL_DENIED.isTypeOfPage(state, pageId)) &&
    !isLoggedIn(state)
  ) {
    history.replace(getPagePath(state, getDefaultWebsitePageId(state)));
    return;
  }
  // 3. Decline Survey page require active Decline regCart
  if (DECLINE.isTypeOfPage(state, pageId) && !(regCart.regCartId && regCart.regDecline)) {
    await store.dispatch(logoutRegistrant());
    store.dispatch(redirectToPage('decline'));
    return;
  }

  if (pageId === 'optInOut') {
    // dynamically inserted guestside-only pages
    await store.dispatch(prepareForOptOutPageLoad());
  } else if (pageId === 'unsubscribeSubscribe') {
    await store.dispatch(prepareForUnsubscribePageLoad());
  } else if (pageId === 'virtualDetails') {
    await store.dispatch(prepareForVirtualDetailsPageLoad());
  }

  /*
   * For the case when the user is redirected from Passkey Hotel Reservation side and to avoid breaking of
   * view rendering on reloading the page after it is loaded using these query params
   */
  if (pageId === 'confirmation' && queryParams && queryParams.passi && queryParams.returnFromPasskey) {
    history.replace(stripQueryParams(getPagePath(state, pageId), ['passi', 'returnFromPasskey']));
  }

  await store.dispatch(loadPageResources(store.getState().website, pageId));
  store.dispatch(handlePageChange(pageId));
};

const createStartRegistrationHandler =
  store =>
  async (nextRouterState, { isAnyPageCurrentlyDisplayed }) => {
    const initialState = store.getState();
    const {
      regCartId: regCartIdFromSession,
      authenticatedContact,
      ssoFlowSelected,
      isSsoAdmin,
      inviteeId
    } = initialState.userSession;
    const regCartIdFromState = (getRegCart(initialState) || {}).regCartId;

    // If attendee is coming from SSO authentication, then we need to show the SSO dialog
    if (shouldOpenSsoDialog(initialState, authenticatedContact, ssoFlowSelected)) {
      return await startAdminRegOrOpenSSODialog(isSsoAdmin, store);
    }

    // Don't restore reg cart from state if starting registration for known invitee
    if (!inviteeId && (regCartIdFromSession || regCartIdFromState)) {
      await restoreReg(
        initialState,
        regCartIdFromSession || regCartIdFromState,
        store,
        nextRouterState,
        isAnyPageCurrentlyDisplayed
      );
    } else {
      await store.dispatch(
        beginNewRegistration({
          changePageOverride: pageId => nextRouterState.history.replace(getPagePath(initialState, pageId)),
          abortExistingCartId: determineRegCartIdToAbort(initialState),
          isEmbeddedRegistration: initialState.isEmbeddedRegistration
        })
      );
    }
  };

const logoutRegistrantAndRedirectToSummaryPage = () => {
  return async dispatch => {
    await dispatch(logoutRegistrant());
    await dispatch(redirectToPage('summary'));
  };
};

const createModifyRegistrationHandler = store => async nextRouterState => {
  if (isOtherActiveTabOnRegistrationStartPage(store.getState())) {
    store.dispatch(promptToTakeOverRegistration());
    return;
  }
  try {
    await store.dispatch(startModification());
  } catch (error) {
    if (getModErrors.isTransactionInProcessingError(error)) {
      await store.dispatch(openTransactionInProcessingErrorDialog());
      return;
    }
    if (getModAndCancelErrors.isKnownError(error)) {
      await store.dispatch(
        openKnownErrorDialog(
          findKnownErrorResourceKey(error.responseBody.validationMessages),
          null,
          logoutRegistrantAndRedirectToSummaryPage,
          'EventGuestSide_RegistrationPaused_Error_Title'
        )
      );
      return;
    }
    throw error;
  }
  await Promise.all([
    store.dispatch(loadEventSnapshotAndTransform(getRegCartEventSnapshotVersion(store.getState()))),
    store.dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(store.getState()))),
    store.dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(store.getState())))
  ]);
  /*
   * The method evaluateQuestionVisibilityLogic is moved out of the combined calls as the
   *  evaluateQuestionVisibilityLogic's result was getting overridden by loadRegistrationContent result for
   *  a particular action. As a result, the question visibility was not getting respected on the first page.
   */
  await store.dispatch(evaluateQuestionVisibilityLogic(null, true));
  nextRouterState.history.replace(REGISTRATION.forCurrentRegistrant().startPagePath(store.getState()));
};

const createPostRegistrationPaymentHandler = store => async nextRouterState => {
  if (isOtherActiveTabOnRegistrationStartPage(store.getState())) {
    store.dispatch(promptToTakeOverRegistration());
    return;
  }
  const state = store.getState();
  if (!state.orders) {
    await store.dispatch(startPostRegistrationPaymentPage());
  }

  await Promise.all([
    store.dispatch(loadRegistrationContent(POST_REGISTRATION_PAYMENT, getRegistrationPathIdOrNull(store.getState())))
  ]);
  nextRouterState.history.replace(POST_REGISTRATION_PAYMENT.forCurrentRegistrant().startPagePath(store.getState()));
};

// eslint-disable-next-line complexity
const createDeclineRegistrationHandler = store => async nextRouterState => {
  const { history } = nextRouterState;
  const state = store.getState();
  const defaultWebsitePageId = getDefaultWebsitePageId(state);
  if (
    !(
      state.event.status === ACTIVE ||
      state.event.status === CLOSED ||
      (state.event.status === COMPLETED && state.defaultUserSession.isPlanner) ||
      (state.event.status === PENDING && (state.defaultUserSession.isPlanner || state.defaultUserSession.isTestMode))
    )
  ) {
    history.replace(getPagePath(state, defaultWebsitePageId));
    return;
  }
  const {
    userSession: { regCartId: regCartIdFromSession, inviteeId, regTypeId }
  } = state;
  // To prevent prior session causing 401 error. FLEX-12134 improves below:
  if (regCartIdFromSession && !isOtherActiveTabOnDeclineStartPage(state)) {
    await store.dispatch(logoutRegistrant());
  }

  let error = null;
  try {
    await store.dispatch(startDeclineRegistration(inviteeId, regTypeId));
  } catch (ex) {
    error = ex;
  }
  if (!error) {
    const regPathId = getRegistrationPathIdOrDefault(store.getState());
    let registrationSettings = getSiteEditorRegistrationPath(store.getState(), regPathId);
    if (!registrationSettings) {
      const registrationTypeId = getRegistrationTypeId(store.getState());
      await Promise.all([
        store.dispatch(filterEventSnapshot(store.getState().eventSnapshotVersion, registrationTypeId, regPathId)),
        store.dispatch(loadRegistrationContent(DECLINE, regPathId))
      ]);
      registrationSettings = getSiteEditorRegistrationPath(store.getState(), regPathId);
    }
    if (registrationSettings.decline.hasDeclinePage) {
      await Promise.all([
        store.dispatch(loadEventSnapshotAndTransform(getRegCartEventSnapshotVersion(store.getState()))),
        store.dispatch(loadRegistrationContent(DECLINE, getRegistrationPathIdOrNull(store.getState())))
      ]);
      // now that the registration content is loaded evaluate visibility logic
      await store.dispatch(evaluateQuestionVisibilityLogic(null, true));
      nextRouterState.history.replace(DECLINE.forCurrentRegistrant().startPagePath(store.getState()));
      return;
    }
    // event's created before Decline Survey feature exists: no decline page, just call services
    try {
      await store.dispatch(finalizeDeclineRegistration());
    } catch (ex) {
      error = ex;
    }
  }
  if (error) {
    if (getDeclineErrors.isInviteeRegistered(error)) {
      store.dispatch(
        openAlreadyRegisteredDialog({ title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx' })
      );
    } else if (getDeclineErrors.isInviteeDeclined(error)) {
      store.dispatch(openDeclineRegistrationDialog());
    } else if (getDeclineErrors.isInviteeStatusInvalid(error)) {
      LOG.warn('invitee status is invalid for requested action: Decline Registration', error);
    } else if (getDeclineErrors.isPrivateRegistrationPath(error)) {
      store.dispatch(openPrivateRegistrationPathDialog());
    } else {
      throw error;
    }
    history.replace(getPagePath(state, defaultWebsitePageId));
  }
};

const createCancelRegistrationHandler = store => async nextRouterState => {
  try {
    await store.dispatch(startCancelRegistration());
  } catch (error) {
    if (getCancelErrors.isTransactionInProcessingError(error)) {
      await store.dispatch(openTransactionInProcessingErrorDialog());
      return;
    }
    if (getModAndCancelErrors.isKnownError(error)) {
      await store.dispatch(
        openKnownErrorDialog(
          findKnownErrorResourceKey(error.responseBody.validationMessages),
          null,
          logoutRegistrantAndRedirectToSummaryPage,
          'EventGuestSide_RegistrationPaused_Error_Title'
        )
      );
      return;
    }
    throw error;
  }
  await Promise.all([
    store.dispatch(loadRegistrationContent(CANCELLATION, getRegistrationPathIdOrNull(store.getState()))),
    store.dispatch(loadEventSnapshotAndTransform(getRegCartEventSnapshotVersion(store.getState())))
  ]);
  await store.dispatch(startTravelCancellation(getRegCart(store.getState()).regCartId));
  /*
   * once registration content is loaded and pricing has been calculated, evaluate visibility logic for questions.
   * evaluate visibility logic is loaded in the end so that it does not get overridden by registration content
   * action, this way question visibility will get respected on first time page load.
   */
  await store.dispatch(evaluateQuestionVisibilityLogic(null, true));
  nextRouterState.history.replace(CANCELLATION.forCurrentRegistrant().startPagePath(store.getState()));
};
const createWaitlistHandler = store => async nextRouterState => {
  const state = store.getState();
  const {
    userSession: { inviteeId, regTypeId }
  } = state;
  if (
    state.defaultUserSession.isPlanner ||
    isWaitlistEnabled(state, getAssociatedRegistrationPathId(state, regTypeId))
  ) {
    await store.dispatch(startWaitlistRegistration(inviteeId));
    await store.dispatch(loadRegistrationContent(WAITLIST, getRegistrationPathIdOrNull(store.getState())));
    nextRouterState.history.replace(WAITLIST.forCurrentRegistrant().startPagePath(store.getState()));
    return;
  }
  nextRouterState.history.replace(getPagePath(state, getDefaultWebsitePageId(state)));
};

export const createRouteHandlers = (store: $TSFixMe): $TSFixMe => {
  const {
    defaultUserSession: { isPlanner, isPreview },
    event: { isArchived }
  } = store.getState();
  const routerContext = { isFirstRender: true };
  const routes = {
    index: createIndexHandler(store),
    page: createPageHandler(store),
    startRegistration: isArchived && !isPlanner && !isPreview ? () => {} : createStartRegistrationHandler(store),
    modifyRegistration: createModifyRegistrationHandler(store),
    postRegistrationPayment: createPostRegistrationPaymentHandler(store),
    declineRegistration: createDeclineRegistrationHandler(store),
    cancelRegistration: createCancelRegistrationHandler(store),
    waitlist: createWaitlistHandler(store),
    confirmationPage: createConfirmationPageHandler(store),
    optOut: createOptOutPageHandler(store),
    unsubscribe: createUnsubscribePageHandler(store)
  };
  return {
    ...mapValues(routes, route => manageRouteHandler(route, store, routerContext)),
    modifyRegistration: manageRouteHandler(routes.modifyRegistration, store, routerContext, { isModification: true }),
    postRegistrationPayment: manageRouteHandler(routes.postRegistrationPayment, store, routerContext),
    // skip first render handling for transient action URLS (real pages they redirect to should perform the check)
    declineRegistration: manageRouteHandler(routes.declineRegistration, store, { isFirstRender: false }),
    cancelRegistration: manageRouteHandler(routes.cancelRegistration, store, { isFirstRender: false }),
    optOut: manageRouteHandler(routes.optOut, store, { isFirstRender: false }),
    unsubscribe: manageRouteHandler(routes.unsubscribe, store, { isFirstRender: false })
  };
};

async function startAdminRegOrOpenSSODialog(isSsoAdmin, store) {
  if (isSsoAdmin) {
    await store.dispatch(setSsoFlowSelectionInUserSession(true));
    await store.dispatch(startAdminRegistration({ abortExistingCartId: determineRegCartIdToAbort(store.getState()) }));
  } else {
    await store.dispatch(openSingleSignOnRegistrationDialog());
  }
}
