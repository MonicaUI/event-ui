import { isRegistrationPage } from '../redux/website/registrationProcesses';
import { getRegistrationPathIdForPage } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';

/**
 * checks if the event is passcode protected
 */
export const checkEventPasscodeProtected = (
  authenticationType: $TSFixMe,
  authenticationLocation: $TSFixMe,
  pageId: $TSFixMe,
  state: $TSFixMe,
  authenticationRegistrationPaths: $TSFixMe,
  isValidPassword: $TSFixMe
): $TSFixMe => {
  switch (authenticationType) {
    case 0: {
      return false; // None selected
    }
    case 1: {
      return false; // In case of external auth we dont need to show password dialog
    }
    case 2: {
      if (authenticationLocation === 0) {
        return !isValidPassword; // Site password has been enabled
      } else if (authenticationLocation === 1 && isRegistrationPage(state, pageId)) {
        return !isValidPassword;
      } else if (
        authenticationLocation === 2 &&
        authenticationRegistrationPaths &&
        authenticationRegistrationPaths.includes(
          getRegistrationPathIdForPage(state.website.pluginData.registrationProcessNavigation, pageId)
        )
      ) {
        return !isValidPassword;
      }
      return false;
    }
    default:
      return false;
  }
};
