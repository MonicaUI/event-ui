import { getRegCart } from '../../redux/selectors/shared';
import { getPrimaryAttendee } from '../../redux/registrationForm/regCart/selectors';
import { getRegistrationPathIdOrDefault } from '../../redux/selectors/currentRegistrationPath';
import { GROUP_POLICY_USED_TYPE } from 'event-widgets/lib/DeemFlightRequest/deemFlightRequestUtils';

/**
 * Utility function to return Deem flight request settings.
 * @returns {Object}
 */
export function getDeemFlightRequestSettings(state: $TSFixMe): $TSFixMe {
  const registrationPathId = getRegistrationPathIdOrDefault(state);
  const travelSettings = state.appData.registrationSettings.registrationPaths[registrationPathId].travelSettings;
  return travelSettings?.deemFlightRequestSettings;
}

/**
 * handler for Go to Deem button
 * @returns {Function}
 */
export function redirectToDeem() {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    const deemRequestSettings = getDeemFlightRequestSettings(state);
    const regCart = getRegCart(state);
    const primaryAttendee = getPrimaryAttendee(regCart);

    let redirectionUrl = `${state.deemUrl}?i=${primaryAttendee.attendeeId}`;
    // get parameters value for Regular group policy
    switch (deemRequestSettings.regularGroupPolicy) {
      case GROUP_POLICY_USED_TYPE.EXISTING_POLICY:
        redirectionUrl =
          `${redirectionUrl}&regularExistingPolicyName=${deemRequestSettings.regularGroupPolicyExisting}` +
          '&regularNewPolicyName=';
        break;
      case GROUP_POLICY_USED_TYPE.NEW_POLICY:
        redirectionUrl =
          `${redirectionUrl}&regularExistingPolicyName=` +
          `&regularNewPolicyName=${deemRequestSettings.regularGroupPolicyNew}`;
        break;
      default:
        redirectionUrl = `${redirectionUrl}&regularExistingPolicyName=&regularNewPolicyName=`;
        break;
    }

    // get parameters value for Guest group policy
    switch (deemRequestSettings.guestGroupPolicy) {
      case GROUP_POLICY_USED_TYPE.EXISTING_POLICY:
        redirectionUrl =
          `${redirectionUrl}&guestExistingPolicyName=${deemRequestSettings.guestGroupPolicyExisting}` +
          '&guestNewPolicyName=';
        break;
      case GROUP_POLICY_USED_TYPE.NEW_POLICY:
        redirectionUrl =
          `${redirectionUrl}&guestExistingPolicyName=` +
          `&guestNewPolicyName=${deemRequestSettings.guestGroupPolicyNew}`;
        break;
      default:
        redirectionUrl = `${redirectionUrl}&guestExistingPolicyName=&guestNewPolicyName=`;
        break;
    }
    // Open the deem redirection URL in a new tab
    window.open(redirectionUrl, null);
  };
}
