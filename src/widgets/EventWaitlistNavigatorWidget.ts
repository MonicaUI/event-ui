import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LinearPageNavigatorWidget from 'nucleus-widgets/lib/LinearPageNavigator/LinearPageNavigatorWidget';
import { getDefaultWebsitePageId } from '../redux/website';
import { getCurrentPageId } from '../redux/pathInfo';
import { finalizeWaitlistRegistration } from '../redux/registrationForm/regCart';
import { getUpdateErrors, getRegisterErrors, getCheckoutErrors } from '../redux/registrationForm/errors';
import {
  openAlreadyRegisteredDialog,
  openEventWaitlistDialog,
  openEventStatusDialog,
  openPrivateEventErrorDialog,
  openKnownErrorDialog,
  startNewRegistrationAndNavigateToRegistration
} from '../dialogs';
import { findKnownErrorResourceKey } from '../redux/registrationForm/errors';
import withForm from 'nucleus-form/src/components/withForm';
import InvalidFormError from 'nucleus-form/src/utils/InvalidFormError';
import { delayedScrollToFirstFormError } from '../utils/formUtils';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { showLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { logoutPlanner } from '../redux/registrantLogin/actions';
import { CLOSED } from 'event-widgets/clients/EventStatus';
import { WAITLIST } from '../redux/website/registrationProcesses';
import { hasAccessToWebsitePages } from '../redux/selectors/event';
import { redirectToDefaultPageOrStartNewRegistration } from '../routing/startRegistration';

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
 * Navigates back to default website page.
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
 * Finalize the waitlist registration
 * On success: route to the default(summary) page
 */
const onCompleteRequest = submitForm => {
  return async (dispatch, getState) => {
    // eslint-disable-next-line complexity
    async function submitAction() {
      const defaultPage = getDefaultWebsitePageId(getState()) || 'summary';
      const {
        defaultUserSession: { isPlanner },
        plannerRegSettings: { successUrl }
      } = getState();
      const areWebsitePagesAccessible = hasAccessToWebsitePages(getState());
      try {
        await dispatch(finalizeWaitlistRegistration());
      } catch (error) {
        if (getRegisterErrors.isInviteeRegistered(error)) {
          return dispatch(
            openAlreadyRegisteredDialog({
              title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
              instructionalText: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_InstructionalText__resx',
              prepopulateForm: true
            })
          );
        } else if (getRegisterErrors.isInviteeAlreadyWaitlistedForClosedEvent(error)) {
          await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
          return dispatch(openEventWaitlistDialog());
        } else if (getUpdateErrors.isKnownError(error)) {
          return await dispatch(openKnownErrorDialog(findKnownErrorResourceKey(error.responseBody.validationMessages)));
        } else if (getUpdateErrors.isEventClosed(error)) {
          return await dispatch(openEventStatusDialog(CLOSED, getState().text.translate));
        } else if (
          getUpdateErrors.isPrivateEvent(error) ||
          getCheckoutErrors.isPrivateEvent(error) ||
          getUpdateErrors.isAttendeeNotAllowedByCustomLogic(error) ||
          getCheckoutErrors.isAttendeeNotAllowedByCustomLogic()
        ) {
          return await dispatch(openPrivateEventErrorDialog());
        } else if (getUpdateErrors.isEventOpenForWaitlist(error)) {
          return await dispatch(startNewRegistrationAndNavigateToRegistration());
        }

        throw error;
      }
      if (isPlanner) {
        dispatch(showLoadingDialog());
        await dispatch(logoutPlanner(successUrl));
      } else {
        await dispatch(redirectToDefaultPageOrStartNewRegistration(defaultPage, areWebsitePagesAccessible));
        dispatch(openEventWaitlistDialog());
      }
    }
    await submitForm(submitAction);
  };
};

/**
 * Connects the RegistrationWaitlistNavigator widget to the application.
 */
export default withForm(undefined, formActions => ({ submitForm: formActions.submitForm }))(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      return {
        pageIds: WAITLIST.forPathContainingWidget(props.id).pageIds(state),
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
