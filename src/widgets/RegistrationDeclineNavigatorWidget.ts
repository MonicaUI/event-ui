import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { getDefaultWebsitePageId } from '../redux/website';
import { getCurrentPageId } from '../redux/pathInfo';
import { finalizeDeclineRegistration } from '../redux/registrationForm/regCart';
import { getUpdateErrors, getDeclineErrors } from '../redux/registrationForm/errors';
import { findKnownErrorResourceKey } from '../redux/registrationForm/errors';
import {
  openDeclineRegistrationDialog,
  openKnownErrorDialog,
  openPrivateRegistrationPathDialog,
  openAlreadyRegisteredDialog
} from '../dialogs';
import withForm from 'nucleus-form/src/components/withForm';
import InvalidFormError from 'nucleus-form/src/utils/InvalidFormError';
import { delayedScrollToFirstFormError } from '../utils/formUtils';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { showLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { logoutPlanner } from '../redux/registrantLogin/actions';
import { logoutRegistrant } from '../redux/registrantLogin/actions';
import { getAttendeeId } from '../redux/selectors/currentRegistrant';
import qs from 'querystring';
import { DECLINE } from '../redux/website/registrationProcesses';
import { FINALIZE_CHECKOUT_PENDING } from '../redux/registrationForm/regCart/actionTypes';
import { NOT_REGISTERING, REGISTERING } from '../redux/registrationIntents';
import { hasAccessToWebsitePages } from '../redux/selectors/event';
import { redirectToDefaultPageOrStartNewRegistration } from '../routing/startRegistration';

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

/**
 * Navigates back to default website page. For planner decline it will navigate to the provided url.
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
    } else {
      const defaultPageId = getDefaultWebsitePageId(getState());
      const areWebsitePagesAccessible = hasAccessToWebsitePages(getState());
      await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPageId, areWebsitePagesAccessible));
    }
  };
}

/**
 * Finalize the decline registration
 * On success: route to the default(summary) page
 */
const onCompleteRequest = submitForm => {
  return async (dispatch, getState) => {
    if (
      getState().regCartStatus.registrationIntent !== NOT_REGISTERING &&
      getState().regCartStatus.registrationIntent !== REGISTERING
    ) {
      return;
    }
    const areWebsitePagesAccessible = hasAccessToWebsitePages(getState());
    async function submitAction() {
      const {
        defaultUserSession: { isPlanner },
        plannerRegSettings: { successUrl }
      } = getState();
      try {
        dispatch({ type: FINALIZE_CHECKOUT_PENDING, payload: { checkoutProgress: 0 } });
        await dispatch(finalizeDeclineRegistration());
      } catch (error) {
        const defaultPage = getDefaultWebsitePageId(getState()) || 'summary';

        if (getDeclineErrors.isInviteeRegistered(error)) {
          await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
          return await dispatch(
            openAlreadyRegisteredDialog({ title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx' })
          );
        } else if (getDeclineErrors.isInviteeDeclined(error)) {
          await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
          return await dispatch(openDeclineRegistrationDialog());
        } else if (getDeclineErrors.isPrivateRegistrationPath(error)) {
          await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
          return await dispatch(openPrivateRegistrationPathDialog());
        } else if (getUpdateErrors.isKnownError(error)) {
          return await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
        }
        throw error;
      }
      if (isPlanner) {
        dispatch(showLoadingDialog());
        const inviteeId = getAttendeeId(getState());
        await dispatch(logoutPlanner(addInviteeIdToUrl(successUrl, inviteeId)));
      } else {
        const defaultPage = getDefaultWebsitePageId(getState()) || 'summary';
        await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
        dispatch(openDeclineRegistrationDialog());
        if (areWebsitePagesAccessible) {
          await dispatch(logoutRegistrant());
        }
      }
    }
    await submitForm(submitAction);
  };
};

/**
 * Connects the RegistrationDeclineNavigator widget to the application.
 */
export default withForm(undefined, formActions => ({ submitForm: formActions.submitForm }))(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      return {
        pageIds: DECLINE.forPathContainingWidget(props.id).pageIds(state),
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
