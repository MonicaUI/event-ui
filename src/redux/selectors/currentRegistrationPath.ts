import { getRegCart } from './shared';
import { getDefaultRegistrationPath, getRegistrationPath } from 'event-widgets/redux/selectors/appData';
import {
  getEventRegistrations,
  getRegistrationPathId as getRegistrationPathIdRegCart
} from '../registrationForm/regCart/selectors';
import { getActiveRegistrationTypes, getEventRegistrationId, isGroupMember } from './currentRegistrant';
import { getIn } from 'icepick';
import { pickBy } from 'lodash';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { createSelector } from 'reselect';
import { PageField } from '@cvent/flex-event-shared';

/**
 * Gets the id of the registration path for the current user. The current registrant will always
 * be available for a registrant.
 */
export function getRegistrationPathId(state: $TSFixMe): $TSFixMe {
  const regCart = getRegCart(state);
  const registrationId = getEventRegistrationId(state.registrationForm);

  return getRegistrationPathIdRegCart(regCart, registrationId);
}

/**
 * Get the id of the registration path for the current user or the default if not in the registration process
 */
export function getRegistrationPathIdOrDefault(state: $TSFixMe): $TSFixMe {
  try {
    const regPathId = getRegistrationPathId(state);
    if (!regPathId) {
      throw new Error('no registration path for current eventRegistration found');
    }
    return regPathId;
  } catch (ex) {
    const regPath = getDefaultRegistrationPath(state.appData);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return regPath && regPath.id;
  }
}

/**
 * Get the id of the registration path for the current user or null if not in the registration process
 */
export function getRegistrationPathIdOrNull(state: $TSFixMe): $TSFixMe {
  try {
    return getRegistrationPathId(state);
  } catch (ex) {
    return null;
  }
}

export function getRegistrationPageFields(state: $TSFixMe): PageField[] {
  const registrationPageIndex = 1;
  return Object.values(
    getIn(state.appData, ['registrationSettings', 'registrationPaths'])[getRegistrationPathId(state)]
      .registrationPageFields[registrationPageIndex].registrationFields
  );
}

export function requireRegApproval(state: $TSFixMe): $TSFixMe {
  if (getEventRegistrationId(state.registrationForm)) {
    return getIn(state.appData, ['registrationSettings', 'registrationPaths'])[getRegistrationPathId(state)]
      .requireRegApproval;
  }
}

export function getPaymentSettings(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathId(state);
  return state.appData.registrationPathSettings[regPathId].paymentSettings;
}

/**
 * check whether "apply payment credits" setting is enabled on current reg path
 */
export function getPaymentCreditsEnabled(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathIdOrDefault(state);
  const registrationPathSettings = state.appData.registrationPathSettings[regPathId];
  /**
   * when current regPathID is not added in registrationPathSettings before accessing this method,
   * i.e. in case of switching regPath of group member,
   * registrationPathSettings variable renders undefined.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return registrationPathSettings && registrationPathSettings.applyPaymentCredits;
}

export function isGuestProductSelectionEnabledOnRegPath(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathIdOrDefault(state);
  const registrationPath = regPathId && getRegistrationPath(state.appData, regPathId);
  return !!(
    registrationPath && getIn(registrationPath, ['guestRegistrationSettings', 'isGuestProductSelectionEnabled'])
  );
}

export function isGuestRegistrationTypeSelectionEnabledOnRegPath(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathIdOrDefault(state);
  const registrationPath = regPathId && getRegistrationPath(state.appData, regPathId);
  return !!(
    registrationPath &&
    getIn(registrationPath, ['guestRegistrationSettings', 'isGuestRegistrationTypeSelectionEnabled'])
  );
}

/**
 * Gets the registration type ids available for group members on the current registration path
 * @param {*} registrationPathId current registration path
 */
function getRegistrationTypeIdsForGroupMembers(state, registrationPathId) {
  const registrationPath = getRegistrationPath(state.appData, registrationPathId);
  if (!registrationPath) {
    return [];
  }
  if (!registrationPath?.groupRegistrationSettings?.registrationTypeSettings?.limitVisibility) {
    return Object.keys(getActiveRegistrationTypes(state));
  }
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    registrationPath.groupRegistrationSettings &&
    registrationPath.groupRegistrationSettings.registrationTypeSettings &&
    registrationPath.groupRegistrationSettings.registrationTypeSettings.categorizedRegistrationTypes
  );
}

export function isOverlappingSessionsAllowedOnRegPath(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathIdOrDefault(state);
  const registrationPath = regPathId && getRegistrationPath(state.appData, regPathId);
  const overlapNotDefined = registrationPath && registrationPath.allowOverlappingSessions === undefined;
  return overlapNotDefined ? true : registrationPath.allowOverlappingSessions;
}

export function getLeadersRegistrationPathId(state: $TSFixMe): $TSFixMe {
  const currentEventRegistrantId = getEventRegistrationId(state);
  if (isGroupMember(state, currentEventRegistrantId)) {
    const eventRegistrations = getEventRegistrations(getRegCart(state));
    const leaderId = getIn(eventRegistrations, [currentEventRegistrantId, 'primaryRegistrationId']);
    return getIn(eventRegistrations, [leaderId, 'registrationPathId']);
  }
  return getRegistrationPathId(state);
}

/**
 * gets an array of registration type ids and text (the reg type name) which are available for
 * the current registration's group members on the current registration path
 * @param {*} state state
 * @param {*} explicitlyFilterRegTypes set this if you want to filter out the active registration types
 */
export function getRegistrationTypeForGroupMembers(state: $TSFixMe, filterInactiveRegTypes = false): $TSFixMe {
  const registrationTypeIds = getRegistrationTypeIdsForGroupMembers(state, getLeadersRegistrationPathId(state));
  let registrationTypes = getActiveRegistrationTypes(state);
  /*
   * All selectors used to calculate the active registration types use the concept of current registrant.
   * when adding new group members, the current registrantion id is NOT set to the new registration.
   * In order to fix that, we need to explicitly pass in a parameter to filter out inactive reg types
   */
  if (filterInactiveRegTypes) {
    registrationTypes = pickBy(registrationTypes, registrationType => {
      return registrationType.isOpenForRegistration;
    });
  }
  return registrationTypeIds
    .filter(id => id !== '00000000-0000-0000-0000-000000000000' && Object.keys(registrationTypes).includes(id))
    .map(id => {
      const registrationTypeDefinition = registrationTypes[id];
      return {
        id: registrationTypeDefinition.id,
        text: registrationTypeDefinition.name,
        attendingFormat: registrationTypeDefinition?.attendingFormat ?? AttendingFormat.INPERSON
      };
    });
}

export function partialRegistrationEnabledOnRegPath(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathIdOrDefault(state);
  if (regPathId) {
    const regPath = getRegistrationPath(state.appData, regPathId);
    return regPath.allowPartialRegistration;
  }
}

export function partialRegistrationEnabledInAccount(state: $TSFixMe): $TSFixMe {
  const allowPartialRegistration = state?.account?.settings?.allowPartialRegistration;
  return allowPartialRegistration === null || allowPartialRegistration === undefined || allowPartialRegistration;
}

export const isGuestRegistrationEnabled = createSelector(
  state => getRegistrationPathIdOrDefault(state),
  state => (state as $TSFixMe).appData,
  (regPathId, appData) => {
    const registrationPath = regPathId && getRegistrationPath(appData, regPathId);
    return !!(registrationPath && getIn(registrationPath, ['guestRegistrationSettings', 'isGuestRegistrationEnabled']));
  }
);

export const getMinGuestsAllowedOnRegPath = createSelector(
  state => getRegistrationPathIdOrDefault(state),
  state => (state as $TSFixMe).appData,
  (regPathId, appData) => {
    const registrationPath = regPathId && getRegistrationPath(appData, regPathId);
    return (
      (registrationPath && getIn(registrationPath, ['guestRegistrationSettings', 'minGuestsAllowedOnRegPath'])) || 0
    );
  }
);

// Gets partial payment setting in the selected reg path
export function getPartialPaymentSettings(state: $TSFixMe): $TSFixMe {
  const regPathId = getRegistrationPathIdOrDefault(state);
  return state.appData.registrationPathSettings[regPathId].partialPaymentSettings;
}
