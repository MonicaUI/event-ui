import { startRegistration, startWaitlistRegistration } from '../redux/registrationForm/regCart';
import {
  findKnownErrorResourceKey,
  getCheckoutErrors,
  getRegisterErrors,
  getUpdateErrors,
  isExcludedByPrivacySettings,
  isProductCapacityReached,
  getUpdateResponseValidations
} from '../redux/registrationForm/errors';
import {
  openAlreadyRegisteredDialog,
  openEventAttendingFormatSwitchDialog,
  openEventStatusDialog,
  openEventTemporaryClosedErrorDialog,
  openEventWaitlistDialog,
  openNoAdmissionItemAvailableForRegistrationTypeDialog,
  openPrivateEventErrorDialog,
  openKnownErrorDialog,
  startNewRegistrationAndNavigateToRegistration
} from '../dialogs';
import { redirectToExternalAuth, redirectToPage, routeToPage, getCurrentPageId } from '../redux/pathInfo';
import { getDefaultWebsitePageId } from '../redux/website';
import { updateAdmin, disableRegistration } from '../redux/registrationForm/regCart/actions';
import { isWaitlistEnabled, hasAccessToWebsitePages } from '../redux/selectors/event';
import { getAssociatedRegistrationPathId, getDefaultRegPathId } from '../redux/selectors/shared';
import {
  evaluateQuestionVisibilityLogic,
  loadGuestRegistrationContent,
  loadRegistrationContent,
  getStartPageForCurrentRegPath
} from '../redux/actions';
import { REGISTRATION, WAITLIST } from '../redux/website/registrationProcesses';
import { getRegistrationPathIdOrNull } from '../redux/selectors/currentRegistrationPath';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { logoutPlanner } from '../redux/registrantLogin/actions';
import { getRegistrationTypeId, getAdminPersonalInformation } from '../redux/selectors/currentRegistrant';
import * as registrationTypeUtils from 'event-widgets/utils/registrationType';
import { hasRegTypeCapacityWarning } from '../redux/registrationForm/warnings';
import { regTypeCapacityFull } from '../dialogs/selectionConflictDialogs';
import { getPageWithRegistrationType } from '../redux/website/pageContents';
import { abortRegCart } from '../redux/registrationForm/regCart/workflow';
import { openCapacityReachedDialog } from '../dialogs/CapacityReachedDialog';
import { loadAvailableCapacityCounts } from '../redux/capacity';
import { isPlaceholderRegCart } from '../redux/registrationForm/regCart/selectors';
import { resetAndAbortRegCart } from '../redux/registrationForm/regCart/embeddedRegistration';

/**
 * If website pages are accessible then routes to the passed default page or
 * start a new registration and navigates to first registration page
 */
export const redirectToDefaultPageOrStartNewRegistration = (
  defaultPage: $TSFixMe,
  areWebsitePagesAccessible: $TSFixMe
) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    if (areWebsitePagesAccessible) {
      dispatch(routeToPage(defaultPage));
    } else {
      await dispatch(startNewRegistrationAndNavigateToRegistration());
    }
  };
};

/**
 * Disables registration actions and redirects to the first registration page
 */
export const disableRegistrationAndRedirectToRegistrationStart = (changePage: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const defaultRegPath = getDefaultRegPathId(getState());
    dispatch(disableRegistration(defaultRegPath));
    const regPage = await dispatch(getStartPageForCurrentRegPath(REGISTRATION));
    changePage(regPage);
  };
};

export function beginNewRegistration({
  changePageOverride = null,
  abortExistingCartId,
  isEmbeddedRegistration = false
}: $TSFixMe = {}) {
  // eslint-disable-next-line complexity
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    // optionally abort an existing in-progress cart prior to creating new cart
    if (abortExistingCartId) {
      await dispatch(abortRegCart(abortExistingCartId));
    }

    // Use history.replace or normal route change depending on scenario.
    const changePage = changePageOverride || (pageId => dispatch(routeToPage(pageId)));

    const initialState = getState();
    const { inviteeId, contactId, defaultRegPathId, regTypeId } = initialState.userSession;
    const { eventId } = initialState.defaultUserSession;
    const isPlaceholder = isPlaceholderRegCart(initialState.registrationForm?.regCart);
    const isWebsitePageAccessible = hasAccessToWebsitePages(getState());
    const changePageBasisPageAccess = async () => {
      if (isWebsitePageAccessible) {
        changePage(getDefaultWebsitePageId(getState()));
      } else {
        await dispatch(disableRegistrationAndRedirectToRegistrationStart(changePage));
      }
    };
    const disableRegAndRedirectToRegStartBasisPageAccess = async () => {
      if (!isWebsitePageAccessible) {
        await dispatch(disableRegistrationAndRedirectToRegistrationStart(changePage));
      }
    };

    try {
      const response = await dispatch(
        startRegistration({ eventId, inviteeId, contactId, regTypeId, isEmbeddedRegistration })
      );
      if (
        isPlaceholder &&
        (getUpdateResponseValidations.isPrivateEvent(response) ||
          getUpdateResponseValidations.isAttendeeNotAllowedByCustomLogic(response))
      ) {
        await resetAndAbortRegCart(dispatch, initialState.registrationForm.regCart, response.regCart?.regCartId);
        await dispatch(openPrivateEventErrorDialog());
        return;
      }
    } catch (error) {
      if (
        isExcludedByPrivacySettings(error, getState()) ||
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0-1 arguments, but got 2.
        getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error, getState())
      ) {
        await dispatch(openPrivateEventErrorDialog());
        if (!isPlaceholder) {
          await changePageBasisPageAccess();
        }
        return;
      }
      if (
        getUpdateErrors.handleAuthError(
          error,
          getState().account,
          getState().event,
          getRegistrationTypeId(getState()),
          defaultRegPathId
        )
      ) {
        return;
      }
      if (getRegisterErrors.isEventAttendingFormatSwitchInProgress(error)) {
        await changePageBasisPageAccess();
        await dispatch(openEventAttendingFormatSwitchDialog());
        return;
      }
      if (getRegisterErrors.isInviteeRegistered(error)) {
        await changePageBasisPageAccess();
        await dispatch(
          openAlreadyRegisteredDialog({ title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx' })
        );
        return;
      }
      if (getRegisterErrors.isInviteeAlreadyWaitlistedForClosedEvent(error)) {
        await changePageBasisPageAccess();
        await dispatch(openEventWaitlistDialog());
        return;
      }
      if (getRegisterErrors.isRegTypeInvalidForEvent(error)) {
        const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
        const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
        await dispatch(openKnownErrorDialog(subMessage, message, redirectToSummaryPage));
        return;
      }
      if (getRegisterErrors.isSourceIdNoMatch(error)) {
        await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
        return;
      }

      if (getRegisterErrors.isEventTemporaryClosed(error)) {
        await dispatch(openEventTemporaryClosedErrorDialog());
        await disableRegAndRedirectToRegStartBasisPageAccess();
        return;
      }

      // handle capacity error during real cart creation of placeholder carts (ex. embedded registration)
      if (
        isPlaceholderRegCart(getState().registrationForm?.regCart) &&
        isProductCapacityReached(error, getState().event?.attendingFormat)
      ) {
        dispatch(loadAvailableCapacityCounts());
        await dispatch(openCapacityReachedDialog());
        return;
      }

      const waitlistEnabled = isWaitlistEnabled(
        getState(),
        getAssociatedRegistrationPathId(getState(), getState().userSession.regTypeId)
      );
      if ((getRegisterErrors.isEventClosed(error) || getRegisterErrors.isCapacityFull(error)) && waitlistEnabled) {
        try {
          await dispatch(startWaitlistRegistration(inviteeId));
        } catch (waitlistError) {
          if (getRegisterErrors.isInviteeRegistered(waitlistError)) {
            await changePageBasisPageAccess();
            await dispatch(openAlreadyRegisteredDialog({}));
            return;
          } else if (getRegisterErrors.isInviteeAlreadyWaitlistedForClosedEvent(waitlistError)) {
            await changePageBasisPageAccess();
            await dispatch(openEventWaitlistDialog());
            return;
          } else if (
            getRegisterErrors.isPrivateEvent(waitlistError) ||
            getRegisterErrors.isAttendeeNotAllowedByCustomLogic(waitlistError)
          ) {
            await dispatch(openPrivateEventErrorDialog());
            await changePageBasisPageAccess();
            return;
          } else if (getRegisterErrors.isEventTemporaryClosed(waitlistError)) {
            if (getRegisterErrors.isEventClosed(error)) {
              dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
              await disableRegAndRedirectToRegStartBasisPageAccess();
              return;
            }
            await dispatch(openEventTemporaryClosedErrorDialog());
            await disableRegAndRedirectToRegStartBasisPageAccess();
            return;
          }
          throw waitlistError;
        }
        await dispatch(loadRegistrationContent(WAITLIST, getRegistrationPathIdOrNull(getState())));
        changePage(WAITLIST.forCurrentRegistrant().startPageId(getState()));
        return;
      }
      if (getRegisterErrors.isRegistrationClosed(error) || getRegisterErrors.isEventClosed(error)) {
        await changePageBasisPageAccess();
        dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
        return;
      }
      if (getCheckoutErrors.admissionItemMissing(error)) {
        dispatch(openNoAdmissionItemAvailableForRegistrationTypeDialog(logoutPlannerAndRedirectToHome));
        return;
      }
      throw error;
    }
    const registrationTypeId = getRegistrationTypeId(getState());
    await dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(getState())));
    await dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(getState())));
    await dispatch(evaluateQuestionVisibilityLogic(null, true));
    if (
      registrationTypeId !== registrationTypeUtils.defaultRegistrationTypeId &&
      hasRegTypeCapacityWarning(getState())
    ) {
      const capacityFull = await regTypeCapacityFull(
        getState(),
        getAssociatedRegistrationPathId(getState(), registrationTypeId)
      );
      const regTypeWidgetDoesNotExist = !getPageWithRegistrationType(getState());
      if (capacityFull || regTypeWidgetDoesNotExist) {
        await changePageBasisPageAccess();
        dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
        return;
      }
    }
    changePage(REGISTRATION.forCurrentRegistrant().startPageId(getState()));
  };
}

/**
 *
 * In this method we pass the admin contact Id and create the reg cart with admin details populated
 *
 */
export function startAdminRegistration({ changePageOverride = null, abortExistingCartId }: $TSFixMe = {}) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    // optionally abort an existing in-progress cart prior to creating new cart
    if (abortExistingCartId) {
      await dispatch(abortRegCart(abortExistingCartId));
    }

    // Use history.replace or normal route change depending on scenario.
    const changePage = changePageOverride || (pageId => dispatch(routeToPage(pageId)));

    const initialState = getState();
    const { authenticatedContact, regTypeId } = initialState.userSession;
    const { eventId } = initialState.defaultUserSession;
    try {
      await dispatch(startRegistration({ eventId, regTypeId, adminContactId: authenticatedContact }));
      const admin = getAdminPersonalInformation(getState());
      await dispatch(
        updateAdmin({
          ...admin,
          selectedValue: true
        })
      );
    } catch (error) {
      return handleStartAdminRegistrationError(error, dispatch, getState, changePage);
    }
    const registrationTypeId = getRegistrationTypeId(getState());
    await dispatch(loadRegistrationContent(REGISTRATION, getRegistrationPathIdOrNull(getState())));
    await dispatch(loadGuestRegistrationContent(getRegistrationPathIdOrNull(getState())));
    await dispatch(evaluateQuestionVisibilityLogic(null, true));
    if (
      registrationTypeId !== registrationTypeUtils.defaultRegistrationTypeId &&
      hasRegTypeCapacityWarning(getState())
    ) {
      const capacityFull = await regTypeCapacityFull(
        getState(),
        getAssociatedRegistrationPathId(getState(), registrationTypeId)
      );
      const regTypeWidgetDoesNotExist = !getPageWithRegistrationType(getState());
      if (capacityFull || regTypeWidgetDoesNotExist) {
        changePage(getDefaultWebsitePageId(getState()));
        dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
        return;
      }
    }
    changePage(REGISTRATION.forCurrentRegistrant().startPageId(getState()));
  };
}

async function handleStartAdminRegistrationError(error, dispatch, getState, changePage) {
  if (getRegisterErrors.hasExternalAuthenticationEnabled(error)) {
    redirectToExternalAuth(getState().event, getState().account);
    return;
  }
  if (getRegisterErrors.isEventAttendingFormatSwitchInProgress(error)) {
    changePage(getDefaultWebsitePageId(getState()));
    await dispatch(openEventAttendingFormatSwitchDialog());
    return;
  }
  if (getRegisterErrors.isValidEmailDomainForAdmin(error)) {
    await dispatch(
      openKnownErrorDialog(
        findKnownErrorResourceKey(error.responseBody.validationMessages),
        null,
        redirectToSummaryPage
      )
    );
    return;
  }
  if (getRegisterErrors.isEventTemporaryClosed(error)) {
    await dispatch(openEventTemporaryClosedErrorDialog());
    return;
  }
  if (getRegisterErrors.isRegistrationClosed(error) || getRegisterErrors.isEventClosed(error)) {
    changePage(getDefaultWebsitePageId(getState()));
    dispatch(openEventStatusDialog(eventStatus.CLOSED, getState().text.translate));
    return;
  }
  throw error;
}

function logoutPlannerAndRedirectToHome() {
  return (dispatch, getState) => {
    const {
      defaultUserSession: { isPlanner },
      plannerRegSettings: { exitUrl }
    } = getState();
    if (isPlanner) {
      dispatch(logoutPlanner(exitUrl));
    }
    dispatch(redirectToPage(getDefaultWebsitePageId(getState())));
  };
}
function redirectToSummaryPage() {
  return (dispatch, getState) => {
    const defaultWebsitePageId = getDefaultWebsitePageId(getState());
    if (getCurrentPageId(getState()) !== defaultWebsitePageId) {
      dispatch(redirectToPage(defaultWebsitePageId));
    }
  };
}
