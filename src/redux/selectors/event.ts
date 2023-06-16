import { getIn } from 'icepick';

import {
  getSessionCategoryListOrders as getSessionCategoryListOrdersFromEvent,
  isAdmissionItemsEnabled as isAdmissionItemsEnabledFromEvent,
  isDiscountCodesEnabled as isDiscountCodesEnabledFromEvent,
  isFeesEnabled as isFeesEnabledFromEvent,
  isWaitlistEnabled as isWaitlistEnabledFromEvent,
  getOptionalSessions as getOptionalSessionsFromEvent,
  getAdmissionItems as getAdmissionItemsFromEvent,
  canAccessWebsitePages,
  cannotAccessAlreadyRegisteredPage
} from 'event-widgets/redux/selectors/event';
import { admissionItemIsVisible } from './shared';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import {
  getContactField as getContactFieldFromAppData,
  getContactFieldJsonPath as getContactFieldJsonPathFromAppData,
  getContactSubFieldJsonPath as getContactSubFieldJsonPathFromAppData,
  getRegistrationPath
} from 'event-widgets/redux/selectors/appData';
import { CLOSED } from 'event-widgets/clients/EventStatus';
import { values, filter } from 'lodash';
import { defaultMemoize, createSelector } from 'reselect';
import { isPasskeyEnabled as isPasskeyEnabledInEvent } from 'event-widgets/redux/selectors/eventTravel';
import { utcToDisplayDate } from 'event-widgets/redux/modules/timezones';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';

const EMPTY_OBJECT = Object.freeze({});

export const getEventId = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['event', 'id']);
};

/**
 * Get event snapshot version
 * @param state
 * @returns eventSnapshotVersion
 */
export const getEventSnapshotVersion = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['event', 'version']);
};

export const getEventAttendingFormat = (state: $TSFixMe): $TSFixMe => {
  return state.event?.attendingFormat ?? AttendingFormat.INPERSON;
};

export const getAdmissionItems = getAdmissionItemsFromEvent;

export const getAdmissionItem = (state: $TSFixMe, admissionItemId: $TSFixMe): $TSFixMe => {
  return getAdmissionItems(state)[admissionItemId];
};

export const getOptionalSessions = (state: $TSFixMe): $TSFixMe => {
  return getOptionalSessionsFromEvent(state.event);
};

export const isFeesEnabled = (state: $TSFixMe): $TSFixMe => {
  return isFeesEnabledFromEvent(state.event);
};

export const isDiscountCodesEnabled = (state: $TSFixMe): $TSFixMe => {
  return isDiscountCodesEnabledFromEvent(state);
};

export const isAdmissionItemsEnabled = (state: $TSFixMe): $TSFixMe => {
  return isAdmissionItemsEnabledFromEvent(state.event);
};

export const isSessionBundlesEnabled = (state: $TSFixMe): $TSFixMe => {
  return state.event.eventFeatureSetup?.agendaItems?.tracks;
};

export const getSessionCategoryListOrders = (state: $TSFixMe): $TSFixMe => {
  return getSessionCategoryListOrdersFromEvent(state.event);
};

export const isWaitlistEnabled = (state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe => {
  // Event level check first
  if (!isWaitlistEnabledFromEvent(state.event)) {
    return false;
  }
  const isRegistrationPathWaitistAllowed = getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    registrationPathId,
    'allowWaitlist'
  ]);
  /*
   * The business rules at the registration path level are that:
   * 1. default is ON
   */
  return isRegistrationPathWaitistAllowed === undefined || isRegistrationPathWaitistAllowed;
};

export const canWaitlist = (state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe =>
  CLOSED === state.event.status && isWaitlistEnabled(state, registrationPathId);

export const requireRegApproval = (state: $TSFixMe): $TSFixMe => {
  const isRegistrationPathRegApprovalRequired = getIn(state, [
    'registrationForm',
    'regCart',
    'registrationApprovalRequired'
  ]);
  return !!isRegistrationPathRegApprovalRequired;
};

const sanitizedRegistrationTypeSettings = defaultMemoize(registrationTypeSettings => {
  return (
    registrationTypeSettings && {
      ...registrationTypeSettings,
      limitVisibility: registrationTypeSettings.limitVisibility || false
    }
  );
});

export function getRegistrationTypeSettings(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  return sanitizedRegistrationTypeSettings(
    state.appData.registrationSettings.registrationPaths[registrationPathId].registrationTypeSettings
  );
}

export function getGuestRegistrationTypeSettings(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  return sanitizedRegistrationTypeSettings(
    state.appData.registrationSettings.registrationPaths[registrationPathId].guestRegistrationSettings
      .registrationTypeSettings
  );
}

export function isGroupRegistrationEnabled(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  const hasGroupRegistrationFeatureEnabled =
    getIn(state.event, ['eventFeatureSetup', 'registrationProcess', 'groupRegistration']) || false;
  if (!hasGroupRegistrationFeatureEnabled) {
    return false;
  }
  const isGroupRegistrationAllowed = getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    registrationPathId,
    'allowsGroupRegistration'
  ]);
  return !!isGroupRegistrationAllowed;
}

/**
 * Determine which admission item should be selected by default for an invitee. This will only exist if there is exactly
 * one visible admission item for their reg type.
 */
export function getDefaultAdmissionItemIdSelectionForRegType(state: $TSFixMe, registrationTypeId: $TSFixMe): $TSFixMe {
  const admissionItems = getAdmissionItems(state);
  const visibleItems = filter(admissionItems, admissionItem =>
    admissionItemIsVisible(registrationTypeId, admissionItem)
  );
  return visibleItems.length === 1 ? visibleItems[0].id : null;
}

export function getContactFieldJsonPath(
  state: $TSFixMe,
  widgetId: $TSFixMe,
  registrationFieldPageType: $TSFixMe,
  fieldId: $TSFixMe,
  ...subPaths: $TSFixMe[]
): $TSFixMe {
  const regPathId = getRegistrationPathIdForWidget(state, widgetId);
  return getContactFieldJsonPathFromAppData(regPathId, registrationFieldPageType, fieldId, ...subPaths);
}

export function getContactSubFieldJsonPath(
  state: $TSFixMe,
  widgetId: $TSFixMe,
  registrationFieldPageType: $TSFixMe,
  fieldId: $TSFixMe,
  ...subPaths: $TSFixMe[]
): $TSFixMe {
  const regPathId = getRegistrationPathIdForWidget(state, widgetId);
  return getContactSubFieldJsonPathFromAppData(regPathId, registrationFieldPageType, fieldId, ...subPaths);
}

export function getContactField(
  state: $TSFixMe,
  widgetId: $TSFixMe,
  registrationFieldPageType: $TSFixMe,
  fieldId: $TSFixMe
): $TSFixMe {
  const regPathId = getRegistrationPathIdForWidget(state, widgetId);
  return getContactFieldFromAppData(state.appData, regPathId, registrationFieldPageType, fieldId);
}

export function getSiteEditorRegistrationPath(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  return getRegistrationPath(state.appData, registrationPathId);
}

export function getSessionRegistrationRules(state: $TSFixMe): $TSFixMe {
  return getIn(state, ['event', 'registrationSettings', 'sessionRegistrationRules']) || EMPTY_OBJECT;
}

export const getAdvancedSessionRules = createSelector(getSessionRegistrationRules, sessionRegistrationRules => {
  return filter(values(sessionRegistrationRules), rule => rule.isActive);
});
export function isPasskeyEnabled(state: $TSFixMe): $TSFixMe {
  return isPasskeyEnabledInEvent(getIn(state, ['eventTravel']));
}

/**
 * Are website pages accessible for the current event?
 */
export const hasAccessToWebsitePages = (state: $TSFixMe): $TSFixMe => {
  const {
    isEmbeddedRegistration,
    defaultUserSession: { isPreview, isTestMode }
  } = state;
  return canAccessWebsitePages(state.event, isPreview || isTestMode) && !isEmbeddedRegistration;
};

/**
 * Returns false for non container events
 * Already registered page cannot be accessed when registration is off and
 * website is live for container events
 */
export const hasNoAccessAlreadyRegisteredPage = (state: $TSFixMe): $TSFixMe => {
  return cannotAccessAlreadyRegisteredPage(state.event);
};

export function getQuantityItemRegistrationRules(state: $TSFixMe): $TSFixMe {
  return getIn(state, ['event', 'registrationSettings', 'quantityItemRegistrationRules']) || EMPTY_OBJECT;
}

export function getPersonalInformationModificationSetting(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  return getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    registrationPathId,
    'allowPersonalInformationModification'
  ]);
}

export const getAdvancedQuantityItemRules = createSelector(
  getQuantityItemRegistrationRules,
  quantityItemRegistrationRules => {
    return filter(values(quantityItemRegistrationRules), rule => rule.isActive);
  }
);

export function getIdConfirmationReadOnlySetting(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  return getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    registrationPathId,
    'isIdConfirmationReadOnly'
  ]);
}

export function isExternalAuthOnInEvent(event: $TSFixMe): $TSFixMe {
  return event.eventSecuritySetupSnapshot && event.eventSecuritySetupSnapshot.authenticationType === 1;
}

export function isOAuthOnInEvent(event: $TSFixMe): $TSFixMe {
  return event.eventSecuritySetupSnapshot && event.eventSecuritySetupSnapshot.authenticationType === 3;
}

export function isSpecificRegPathAuthLocation(event: $TSFixMe): $TSFixMe {
  return event.eventSecuritySetupSnapshot && event.eventSecuritySetupSnapshot.authenticationLocation === 2;
}

export function isClosedEvent(state: $TSFixMe): $TSFixMe {
  if (state.event.status === CLOSED) {
    return true;
  }
  const timezone = state.timezones?.[state.event.timezone];
  if (!timezone) {
    return false;
  }
  const closeDate = new Date(state.event.closeDate);
  return closeDate < utcToDisplayDate(new Date().toISOString(), timezone);
}
