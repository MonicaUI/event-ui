import { connect } from 'react-redux';
import PageBanner from './PageBanner';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { getRegistrationTypeId, getRegistrationTypes, doesRegCartExist } from '../redux/selectors/currentRegistrant';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { getRegistrationPaths } from '../redux/selectors/shared';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';

export function pageBannerWithTitle(title: $TSFixMe): $TSFixMe {
  return connect((state: $TSFixMe) => {
    let regType = null;
    let regPath = null;
    let isDefaultRegPath = false;

    if (doesRegCartExist(state)) {
      const regTypesEnabled =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        state.event.eventFeatureSetup.registrationProcess &&
        state.event.eventFeatureSetup.registrationProcess.multipleRegistrationTypes;
      const regPathsEnabled =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        state.event.eventFeatureSetup.registrationProcess &&
        state.event.eventFeatureSetup.registrationProcess.multipleRegistrationPaths;

      if (regTypesEnabled) {
        const regTypeId = getRegistrationTypeId(state);
        regType =
          regTypeId === defaultRegistrationTypeId
            ? 'EventGuestSide_PageBanner_NoRegistrationType__resx'
            : // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              getRegistrationTypes(state)[regTypeId] && getRegistrationTypes(state)[regTypeId].name;
      }

      if (regPathsEnabled) {
        const regPathId = getRegistrationPathIdOrDefault(state);
        regPath = regPathId && getRegistrationPaths(state)[regPathId];
        if (regPath) {
          isDefaultRegPath = regPath.isDefault;
          regPath = regPath.name;
        }
      }
    }

    return {
      ...injectTestId('preview'),
      bannerText: title,
      translate: state.text.translate,
      isDefaultRegPath,
      regPath: state.text.translate(regPath),
      regType: state.text.translate(regType)
    };
  })(PageBanner);
}

/**
 * Test mode page banner for event guestside site.
 */
export default pageBannerWithTitle('EventGuestSide_BannerText_Preview__resx');
