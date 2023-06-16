import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { getDefaultWebsitePageId } from '../redux/website';
import { getCurrentPageId, routeToPage } from '../redux/pathInfo';
import { saveRegistration, finalizeCancelRegistration } from '../redux/registrationForm/regCart';
import { getUpdateErrors } from '../redux/registrationForm/errors';
import { openKnownErrorDialog, openCancelRegistrationSuccessConfirmationDialog } from '../dialogs';
import { findKnownErrorResourceKey } from '../redux/registrationForm/errors';
import { logoutRegistrant, loginRegistrant } from '../redux/registrantLogin/actions';
import withForm from 'nucleus-form/src/components/withForm';
import InvalidFormError from 'nucleus-form/src/utils/InvalidFormError';
import { delayedScrollToFirstFormError } from '../utils/formUtils';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { showLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { logoutPlanner } from '../redux/registrantLogin/actions';
import qs from 'querystring';
import { getRegCart, isSingleSignOn } from '../redux/selectors/shared';
import {
  getPrimaryRegistrationId,
  getAttendeePersonalInformation,
  getConfirmationNumber
} from '../redux/registrationForm/regCart/selectors';
import {
  getAttendeeId,
  getEventRegistrationId,
  getAttendeeType,
  getConfirmationInfo
} from '../redux/selectors/currentRegistrant';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import { loadRegistrationContentForRegApproval } from '../redux/persona';
import { CANCELLATION } from '../redux/website/registrationProcesses';
import { isAdminRegistration } from '../redux/selectors/currentRegistrant';
import { setRegistrationIdInUserSession } from '../redux/userSession';
import { hasAccessToWebsitePages } from '../redux/selectors/event';
import { redirectToDefaultPageOrStartNewRegistration } from '../routing/startRegistration';
import { isInCheckoutVar } from './PaymentWidget/regCartPricing';

/**
 * Represent inviteeId as "inviteestub" in query params in the URL.
 * Specifically, preserves query.evtstub=eventId and removes potentially duplicated query.inviteeId and query.i
 */
function addInviteeIdToUrl(url, inviteeId) {
  const path = url.split('?')[0];
  const query = qs.parse(url.split('?')[1]) || {};
  // Planner Reg return URL expect inviteestub=${inviteeId} in the query
  query.inviteestub = inviteeId;
  delete query.inviteeId;
  // The i query param is the encoded version of the inviteeId.
  delete query.i;
  return path + (Object.keys(query).length ? `?${qs.stringify(query)}` : '');
}

/**
 * Wraps the submitForm action to detect if the failure was due to validations and
 * scrolls to error.
 */
const withScrollToFirstError = submitForm => {
  return async (...args) => {
    try {
      return await submitForm(...args);
    } catch (error) {
      if (error instanceof InvalidFormError) {
        delayedScrollToFirstFormError();
        return;
      }
      throw error;
    }
  };
};

function loginOnExit() {
  return async (dispatch, getState) => {
    const regCart = getRegCart(getState());
    const confirmationInfo = {
      emailAddress: getAttendeePersonalInformation(regCart, getPrimaryRegistrationId(regCart)).emailAddress,
      confirmationNumber: getConfirmationNumber(regCart, getPrimaryRegistrationId(regCart))
    };
    await dispatch(loginRegistrant(confirmationInfo));
  };
}

/**
 * Navigates back to confirmation (My Registration) page
 */
function onExitRequest() {
  return async (dispatch, getState) => {
    const {
      defaultUserSession: { isPlanner },
      plannerRegSettings: { exitUrl }
    } = getState();
    if (isPlanner) {
      dispatch(showLoadingDialog());
      await dispatch(logoutPlanner(exitUrl));
    } else if (
      isAdminRegistration(getState()) &&
      getAttendeeType(getState(), getEventRegistrationId(getState())) === 'ATTENDEE'
    ) {
      const registrantConfirmationInfo = getConfirmationInfo(getState());
      const emailAddress = registrantConfirmationInfo.emailAddress;
      const confirmationNumber = registrantConfirmationInfo.confirmationNumber;
      if (emailAddress && confirmationNumber) {
        const confirmationInfo = {
          emailAddress,
          confirmationNumber
        };
        await dispatch(loginRegistrant(confirmationInfo));
      }
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      const confirmationPageIdPromise = dispatch(getConfirmationPageIdForInvitee(getState()));
      dispatch(routeToPage(await confirmationPageIdPromise));
    } else {
      await dispatch(loadRegistrationContentForRegApproval());
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      const confirmationPageIdPromise = dispatch(getConfirmationPageIdForInvitee(getState()));
      // for admin reg we want to skip logging in as group leader
      if (!isAdminRegistration(getState())) {
        await dispatch(loginOnExit());
      }
      dispatch(routeToPage(await confirmationPageIdPromise));
    }
  };
}

/**
 * Finalize the cancellation
 * On success: 1. route to the default(summary) page 2. logout registrant
 */
const onCompleteRequest = submitForm => {
  return async (dispatch, getState) => {
    const {
      defaultUserSession: { isPlanner },
      plannerRegSettings: { successUrl }
    } = getState();
    async function submitAction() {
      try {
        await dispatch(saveRegistration());
        await dispatch(finalizeCancelRegistration());
      } catch (error) {
        if (getUpdateErrors.isKnownError(error)) {
          return await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
        }
      }

      if (isPlanner) {
        dispatch(showLoadingDialog());
        const inviteeId = getAttendeeId(getState());
        await dispatch(logoutPlanner(addInviteeIdToUrl(successUrl, inviteeId)));
      } else if (isSingleSignOn(getState().account) && getState().userSession.authenticatedContact) {
        await dispatch(routeToPage('summary'));
        await dispatch(openCancelRegistrationSuccessConfirmationDialog());
        await dispatch(logoutRegistrant());
      } else if (
        isAdminRegistration(getState()) &&
        getAttendeeType(getState(), getEventRegistrationId(getState())) === 'ATTENDEE'
      ) {
        dispatch(setRegistrationIdInUserSession()); // reset registration id
        const registrantConfirmationInfo = getConfirmationInfo(getState());
        const emailAddress = registrantConfirmationInfo.emailAddress;
        const confirmationNumber = registrantConfirmationInfo.confirmationNumber;
        if (emailAddress && confirmationNumber) {
          const confirmationInfo = {
            emailAddress,
            confirmationNumber
          };
          /**
           * We are catching error for this loginRegistration call in case of admin reg since,
           * the call to identifyByConfirm fails for the admin reg and returns 422 in case all
           * the invitee are cancelled by the admin. Before this code the guest side used to
           * hard error because of the 422 response by the identifyByConfirm network call.
           */
          try {
            await dispatch(loginRegistrant(confirmationInfo));
          } catch (error) {
            await dispatch(logoutRegistrantAndRouteToDefaultPage());
          }
        }
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        const confirmationPageIdPromise = dispatch(getConfirmationPageIdForInvitee(getState()));
        dispatch(routeToPage(await confirmationPageIdPromise));
        dispatch(openCancelRegistrationSuccessConfirmationDialog());
      } else {
        await dispatch(logoutRegistrantAndRouteToDefaultPage());
      }
    }
    try {
      isInCheckoutVar(true);
      await submitForm(submitAction);
    } finally {
      isInCheckoutVar(false);
    }
  };
};

function logoutRegistrantAndRouteToDefaultPage() {
  return async (dispatch, getState) => {
    const state = getState();
    const areWebsitePagesAccessible = hasAccessToWebsitePages(state);
    const defaultPage = getDefaultWebsitePageId(state) || 'summary';
    await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
    await dispatch(openCancelRegistrationSuccessConfirmationDialog());

    if (areWebsitePagesAccessible) {
      await dispatch(logoutRegistrant());
    }
  };
}

/**
 * Connects the RegistrationCancellationNavigator widget to the application.
 */
export default withForm(
  () => ({}),
  formActions => ({ submitForm: formActions.submitForm })
)(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      return {
        pageIds: CANCELLATION.forPathContainingWidget(props.id).pageIds(state),
        currentPageId: getCurrentPageId(state),
        disableForwardNavigation: false,
        reverseButtonOrderOnMobile: true
      };
    },
    (dispatch: $TSFixMe, props: $TSFixMe) =>
      bindActionCreators(
        {
          onExitRequest,
          onCompleteRequest: withLoading(onCompleteRequest.bind(null, withScrollToFirstError(props.submitForm)))
        },
        dispatch
      )
  )(LinearPageNavigatorWidget)
);
