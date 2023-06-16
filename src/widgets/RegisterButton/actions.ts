import { routeToPage, redirectToPage } from '../../redux/pathInfo';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';
import { openStartNewRegistrationDialogDuringRegistration } from '../../dialogs';
import * as currentRegistrant from '../../redux/selectors/currentRegistrant';
import { DECLINE, GUEST_REGISTRATION, REGISTRATION } from '../../redux/website/registrationProcesses';

/**
 * @param props.config.text Registration dialog text
 * @param props.style Styling for registration dialog
 * @param props.classes Classnames for registration dialog
 * Based on user state and current page
 * Dispatch actions either to redirect to registration start,
 * logout and redirect to 'register' page, or prompt with new registration dialog.
 * RegisterNow widget can exist in each of the conditions, all actions are available
 * RegisterAnother widget can only exists on post-reg pages,
 * openStartNewRegistrationDialog is the only available action
 */
export const promptToStartNewRegistration = (props: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const loggedIn = currentRegistrant.isLoggedIn(state);
    const registrationPage = REGISTRATION.isTypeOfCurrentPage(state) || GUEST_REGISTRATION.isTypeOfCurrentPage(state);
    const registrationDeclinePage = DECLINE.isTypeOfCurrentPage(state);
    const titleText = props.config.text.htmlContent
      ? props.config.text.htmlContent.replace(/<[^>]*>/g, '')
      : props.config.text;
    if (!loggedIn && !registrationPage && !registrationDeclinePage) {
      return dispatch(routeToPage('register'));
    }
    if (registrationDeclinePage) {
      await dispatch(logoutRegistrant());
      return dispatch(redirectToPage('register'));
    }
    return dispatch(
      openStartNewRegistrationDialogDuringRegistration({
        title: titleText,
        classes: { ...props.classes },
        style: props.style,
        startWithDefaultRegPath: props.startWithDefaultRegPath || false
      })
    );
  };
};
