import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import {
  getOrderedPostRegistrationWidgetsInAllRegistrationPaths,
  getOrderedWidgetsInAllRegistrationPaths
} from './pageContents';

/**
 * Get travel widgets for all registration paths
 * @param website
 * @param isPasskeyEnabled
 * @returns Map
 */
export function getTravelWidgets(website: $TSFixMe, isPasskeyEnabled: $TSFixMe): $TSFixMe {
  const regFieldPageType = registrationFieldPageType.Registration;
  const widgetTypes = ['AirRequest', 'HotelRequest', 'AirActual'];

  const registrationWidgets = getOrderedWidgetsInAllRegistrationPaths(website, widgetTypes);
  const travelWidgets = registrationWidgets;

  if (isPasskeyEnabled) {
    const postRegistrationWidgets = getOrderedPostRegistrationWidgetsInAllRegistrationPaths(website, [
      'PasskeyHotelRequest'
    ]);

    /*
     * Both postRegistrationWidgets & registrationWidgets dictionaries have the same registrationPaths keys
     * therefore, iterate anyone of them and merge the widgets of the Registration page type
     */
    if (postRegistrationWidgets) {
      Object.keys(registrationWidgets).forEach(registrationPath => {
        // when the Registration fieldPageType exists, then add/concat the post-reg widgets
        if (registrationWidgets[registrationPath][regFieldPageType]) {
          travelWidgets[registrationPath][regFieldPageType] = registrationWidgets[registrationPath][
            regFieldPageType
          ].concat(postRegistrationWidgets[registrationPath][regFieldPageType]);
        } else {
          travelWidgets[registrationPath][regFieldPageType] =
            postRegistrationWidgets[registrationPath][regFieldPageType];
        }
      });
    }
  }

  return travelWidgets;
}
