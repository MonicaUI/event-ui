import * as eventStatus from 'event-widgets/clients/EventStatus';
import { stripQueryParams, addQueryParams } from './queryUtils';
import qs from 'querystring';
import getAllWidgetsOnPage from 'nucleus-widgets/utils/layout/getAllWidgetsOnPage';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { getSiteEditorRegistrationPath } from '../redux/selectors/event';
import { getAssociatedRegistrationPathId, EMPTY_ARRAY } from '../redux/selectors/shared';
import { isAttendeeRegistered, getEventRegistrationId } from '../redux/selectors/currentRegistrant';
import { requireRegApproval } from '../redux/selectors/event';
import { InviteeStatusId } from 'event-widgets/utils/InviteeStatus';
import { setIn, getIn } from 'icepick';
import { REGISTERING } from '../redux/registrationIntents';

export const canModifyRegistrationWithEventStatus = (event: $TSFixMe): $TSFixMe => {
  const isClosed = event.status === eventStatus.CLOSED;
  const isActive = event.status === eventStatus.ACTIVE;
  const isPending = event.status === eventStatus.PENDING;
  const isInTestMode = event.isInTestMode;
  return isActive || isClosed || (isPending && isInTestMode);
};

export const canModifyRegistration = (event: $TSFixMe, deadline: $TSFixMe): $TSFixMe => {
  const pastDeadline = deadline < new Date();
  return canModifyRegistrationWithEventStatus(event) && !pastDeadline;
};

/**
 * check whether invitee can do reg mod/cancel based on their status.
 */
export const isModifyOrCancelOpen = (
  eventReg: $TSFixMe,
  deadline: $TSFixMe,
  pendingEnabled: $TSFixMe,
  enabled: $TSFixMe
): $TSFixMe => {
  // may need to seperate pending approval deadline and accepted deadline later.
  const isWithinDeadline = !deadline || new Date(deadline) > new Date();
  if (eventReg.attendee.inviteeStatus === InviteeStatusId.Accepted) {
    return isWithinDeadline && enabled;
  }
  // status: pending approval. If pendingEnabled not exist, use enabled.
  return pendingEnabled !== null && pendingEnabled !== undefined
    ? isWithinDeadline && pendingEnabled
    : isWithinDeadline && enabled;
};

export const getCurrentEventRegistrationIdFromURL = (url: $TSFixMe): $TSFixMe => {
  const query = qs.parse(url.split('?')[1]) || {};
  return (
    query && {
      currentEventRegistrationId: query.cer,
      memberCompletedReg: query.mcr
    }
  );
};

export function containsRegistrationSummary(website: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  let hasRegSum = false;
  getAllWidgetsOnPage(website, pageId).forEach(object => {
    if (object.widgetType === 'RegistrationSummary') {
      hasRegSum = true;
    }
  });
  return hasRegSum;
}

export function containsSubmitPayment(website: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  let hasSubmitPaymentWidget = false;
  getAllWidgetsOnPage(website, pageId).forEach(object => {
    if (object.widgetType === 'SubmitPayment') {
      hasSubmitPaymentWidget = true;
    }
  });
  return hasSubmitPaymentWidget;
}

export const urlStrippedCurrentEventRegistrationId = (url: $TSFixMe): $TSFixMe => {
  return stripQueryParams(url, ['cer', 'mcr']);
};

export const urlStrippedRetryAttempt = (url: $TSFixMe): $TSFixMe => {
  return stripQueryParams(url, ['retryAttempt']);
};

export const addRetryAttempt = (url: $TSFixMe): $TSFixMe => {
  return addQueryParams(url, { retryAttempt: 'true' });
};

export function addGroupMemberEventRegIdToUrl(
  url: $TSFixMe,
  eventRegId: $TSFixMe,
  memberCompletedReg = false
): $TSFixMe {
  const params = { cer: eventRegId, mcr: memberCompletedReg };
  return addQueryParams(urlStrippedCurrentEventRegistrationId(url), params);
}

function isRegistrationFinalised(state, isRegistrationApproved) {
  return (
    isRegistrationApproved || (isAttendeeRegistered(state, getEventRegistrationId(state)) && !requireRegApproval(state))
  );
}

/*
 * For a non-planner if group leader's registration is approved, they should not be able to add a group member
 * if both the event and the reg path of the group member have reg approval enabled
 */
export function groupLeaderAndGroupMemberHaveCompatibleManualApprovalSettings(
  state: $TSFixMe,
  { isRegistrationApproved = false, knownMemberRegTypeId }: $TSFixMe = {}
): $TSFixMe {
  if (
    state?.defaultUserSession?.isPlanner ||
    !state?.event?.eventFeatureSetup?.registrationProcess?.registrationApproval ||
    !isRegistrationFinalised(state, isRegistrationApproved)
  ) {
    return true;
  }
  // if we know the reg type the group member is being associate to, return true if it doesn't requires approval
  if (knownMemberRegTypeId) {
    return !getSiteEditorRegistrationPath(state, getAssociatedRegistrationPathId(state, knownMemberRegTypeId))
      .requireRegApproval;
  }
  // otherwise, get all group member reg types and return true if any don't require approval
  const groupMemberRegTypes = getGroupMemberRegTypes(state);
  return (
    groupMemberRegTypes.length === 0 ||
    groupMemberRegTypes.some(regType => {
      const siteEditorRegPath = getSiteEditorRegistrationPath(state, getAssociatedRegistrationPathId(state, regType));
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      return !(siteEditorRegPath && siteEditorRegPath.requireRegApproval);
    })
  );
}

export function getGroupMemberRegTypes(state: $TSFixMe): $TSFixMe {
  const groupLeaderRegPath =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    state.appData &&
    state.appData.registrationSettings &&
    state.appData.registrationSettings.registrationPaths &&
    state.appData.registrationSettings.registrationPaths[getRegistrationPathIdOrDefault(state)];
  const groupMemberRegTypeSettings =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    groupLeaderRegPath &&
    groupLeaderRegPath.groupRegistrationSettings &&
    groupLeaderRegPath.groupRegistrationSettings.registrationTypeSettings;
  const groupMemberRegTypes =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    groupMemberRegTypeSettings && groupMemberRegTypeSettings.limitVisibility
      ? groupMemberRegTypeSettings.categorizedRegistrationTypes // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      : state.event && state.event.registrationTypes && Object.keys(state.event.registrationTypes);
  return groupMemberRegTypes || EMPTY_ARRAY;
}

/**
 * Update displayText with planner text of current locale for contactFieldsOrganizedByPath
 */
export function updateContactFieldsWithLocalizedText(
  contactFieldsOrganizedByPath = {},
  localizedUserText: $TSFixMe,
  eventLocales = []
): $TSFixMe {
  let transformedContactFields = contactFieldsOrganizedByPath;

  if (eventLocales.length > 1) {
    Object.keys(transformedContactFields).forEach(regPath => {
      Object.keys(transformedContactFields[regPath]).forEach(page => {
        const widgets = transformedContactFields[regPath][page] || [];
        transformedContactFields = updateDisplayText(
          widgets,
          transformedContactFields,
          regPath,
          page,
          localizedUserText
        );
      });
    });
  }

  return transformedContactFields;
}

/**
 * Update displayName of widgets in contactFieldsOrganizedByPath
 */
function updateDisplayText(widgets, contactFieldsOrganizedByPath, regPath, page, localizedUserText) {
  let transformedContactFields = contactFieldsOrganizedByPath;
  for (let widgetIndex = 0; widgetIndex < widgets.length; widgetIndex++) {
    const widget = transformedContactFields[regPath][page][widgetIndex];
    const defaultDisplayName = getIn(widget, ['config', 'displayName']);
    if (defaultDisplayName) {
      const userText = getIn(localizedUserText, ['localizations', localizedUserText.currentLocale]);
      if (userText) {
        const updatedText = userText['website.layoutItems.' + widget.id + '.config.displayName'];
        if (updatedText) {
          transformedContactFields = setIn(
            transformedContactFields,
            [regPath, page, widgetIndex, 'config', 'displayName'],
            updatedText
          );
          transformedContactFields = setIn(
            transformedContactFields,
            [regPath, page, widgetIndex, 'config', 'defaultDisplayName'],
            defaultDisplayName
          );
        }
      }
    }
  }
  return transformedContactFields;
}

/**
 * Determines whether a registration should be aborted, the conditions are:
 * - the flex_immediate_capacity_release experiment must be on variant 2
 * - no other tabs are open for the registration
 * - reg cart is in progress
 * - registration intent is registering
 */
export function shouldAbortRegistration(
  numOpenTabs?: $TSFixMe,
  regCartStatus?: $TSFixMe,
  registrationIntent?: $TSFixMe,
  experimentVariant?: $TSFixMe
): $TSFixMe {
  return (
    experimentVariant === 2 && numOpenTabs === 0 && regCartStatus === 'INPROGRESS' && registrationIntent === REGISTERING
  );
}
