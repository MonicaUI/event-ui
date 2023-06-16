import {
  getRegistrationPathIdOrDefault,
  isGuestRegistrationTypeSelectionEnabledOnRegPath
} from '../redux/selectors/currentRegistrationPath';
import {
  getPrimaryRegistrationId,
  getGuestsOfRegistrant,
  getNumberOfGroupMembers
} from '../redux/registrationForm/regCart/selectors';
import { getEventRegistrationId, getRegTypeHasAvailableAdmissionItemMap } from '../redux/selectors/currentRegistrant';
import { isAdmissionItemsEnabled, getSiteEditorRegistrationPath } from '../redux/selectors/event';
import { pickBy, mapKeys, mapValues } from 'lodash';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { getCurrentPageId } from '../redux/pathInfo';
import { getAssociatedRegistrationPathId, getRegPackId } from '../redux/selectors/shared';
import { POST_REGISTRATION } from '../redux/website/registrationProcesses';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';

function remainingQuotaForRegType(state, regTypeId, quota, forGuests) {
  /*
   * quota will be null in several cases:
   * 1) when we are not checking for guests or for group members
   * 2) when limitVisibility has been turned off
   * 3) when we are checking for guests and the regType widget is not present on the guest modal
   */
  if (quota == null) {
    return Infinity;
  }

  const attendeeType = forGuests ? 'GUEST' : 'ATTENDEE';
  const primaryRegistrantId = forGuests
    ? getEventRegistrationId(state)
    : getPrimaryRegistrationId(state.registrationForm.regCart);
  const eventRegistrations = state.registrationForm.regCart.eventRegistrations;
  const usedCount = Object.values(eventRegistrations).filter(reg => {
    return (
      (reg as $TSFixMe).registrationTypeId === regTypeId &&
      (reg as $TSFixMe).attendeeType === attendeeType &&
      /*
       * the following case is so that we do not count the current registrant's own selection against
       * them. otherwise this would, for example, disable the *already selected* item in the
       * RegistrationTypeWidget if the quota were maxed out
       * reg.eventRegistrationId !== currentRegId &&
       */
      (reg as $TSFixMe).primaryRegistrationId === primaryRegistrantId
    );
  }).length;

  return Math.max(0, quota - usedCount);
}

// eslint-disable-next-line complexity
export function getAvailableRegTypeCapacities(
  state: $TSFixMe,
  attendeeType = null,
  alwaysShowNoRegTypeCapacity = false
): $TSFixMe {
  const forGuest = attendeeType === 'GUEST';
  const forGroupMember = attendeeType === 'GROUP';

  // get the stuff we need
  const noRegType = defaultRegistrationTypeId;
  const isPlanner = !!state.defaultUserSession.isPlanner;
  const regPath = state.appData.registrationSettings.registrationPaths[getRegistrationPathIdOrDefault(state)];
  const regSettings = forGuest
    ? regPath.guestRegistrationSettings
    : (forGroupMember ? regPath.groupRegistrationSettings : state.appData.registrationSettings) || {};
  const regTypeSettings = regSettings.registrationTypeSettings || {};
  const capacityIdSuffix = state.event.isInTestMode ? '_testmode' : '';
  const regPackId = getRegPackId(state);
  const capacityPrefix = regPackId ? `${regPackId}::` : `${state.event.id}::`;

  const { attendingFormat = AttendingFormat.INPERSON } = state.event;

  // virtual capacity prefix and suffix should be considered only if event is hybrid
  const virtualCapacityPrefix = shouldHybridFlowWork(attendingFormat) ? `registrationtype::${state.event.id}::` : '';
  const virtualCapacitySuffix = shouldHybridFlowWork(attendingFormat) ? `::virtual${capacityIdSuffix}` : '';

  const eventCapacitiesRemaining = {
    ...getRemainingCapacities(state, capacityPrefix, capacityIdSuffix),
    ...getRemainingCapacities(state, virtualCapacityPrefix, virtualCapacitySuffix)
  };

  // is visibility going to be limited?
  let limitVisibility = true;
  if (!forGuest && !forGroupMember) {
    limitVisibility = false;
  } else if (forGuest && !isGuestRegistrationTypeSelectionEnabledOnRegPath(state)) {
    limitVisibility = false;
  } else if (!regTypeSettings.limitVisibility) {
    limitVisibility = false;
  }

  /*
   * quotas will be an empty object if visibility is not limited
   * this includes several cases:
   * 1) when we are not checking for guests or for group members
   * 2) when limitVisibility has been turned off
   * 3) when we are checking for guests and the regType widget is not present on the guest modal
   * 4) when regTypes are not allowed in the event
   */
  const isRegTypesEnabled = state.event.eventFeatureSetup.registrationProcess.multipleRegistrationTypes;
  const regCartQuotas = (limitVisibility && isRegTypesEnabled && regTypeSettings.quotas) || {};

  // get the ordered list of visible regTypes, limited if necessary
  const allRegTypes = Object.values(state.event.registrationTypes || {});
  let regTypes = allRegTypes.filter(regType => regType && !!(regType as $TSFixMe).isOpenForRegistration);
  if (limitVisibility && isRegTypesEnabled) {
    // NOTE: Ordering of categorized reg types must be honored!
    regTypes = (regTypeSettings.categorizedRegistrationTypes || [])
      .map(id => regTypes.find(regType => id === (regType as $TSFixMe).id))
      .filter(e => !!e); // just to be safe
    // just to be safe
    /*
     * for guest:
     * this hacky flag is here because there is weird situation when the guest dropdown is used:
     * we need to set guests to have no reg type when they are initially added event though
     * it is "not allowed." Thus, we need to be able to see the capacity for no reg type
     * in order to know the max number of guests to allow to be added.
     * for group member:
     * PROD-126509 - when no reg type is selected in group members's
     * "Limit registration types available for group members" dropdown,
     * add noRegType in regTypes.
     */
    if (alwaysShowNoRegTypeCapacity) {
      const noRegTypeInfo = allRegTypes.find(regType => (regType as $TSFixMe).id === noRegType) || {
        name: '',
        id: noRegType
      };
      regTypes.splice(0, 0, noRegTypeInfo);
    }
  } else {
    regTypes.sort(
      (l, r) =>
        ((l as $TSFixMe).id === noRegType && -1) ||
        ((r as $TSFixMe).id === noRegType && 1) ||
        (l as $TSFixMe).name.localeCompare((r as $TSFixMe).name)
    );
  }

  if (eventCapacitiesRemaining[noRegType] == null) {
    eventCapacitiesRemaining[noRegType] = Infinity;
  }

  // calculate the remaining capacity for each visible regType (planner can override)
  let regTypeCapacitiesAvailable = [];
  for (const regType of regTypes) {
    if (isPlanner) {
      regTypeCapacitiesAvailable.push({ id: (regType as $TSFixMe).id, available: Infinity });
    } else {
      // check regType-specific limits
      const regCartQuotaRemaining = remainingQuotaForRegType(
        state,
        (regType as $TSFixMe).id,
        regCartQuotas[(regType as $TSFixMe).id],
        forGuest
      );
      const eventCapacityRemaining = eventCapacitiesRemaining[(regType as $TSFixMe).id];

      // use whichever limit is lesser
      const available = Math.min(regCartQuotaRemaining, eventCapacityRemaining);
      regTypeCapacitiesAvailable.push({ id: (regType as $TSFixMe).id, available });
    }
  }
  const regTypeHasAvailableAdmissionItemMap = getRegTypeHasAvailableAdmissionItemMap(state);
  const isAdmissionItemsEnabledFlag = isAdmissionItemsEnabled(state);
  const dontCheckNoRegTypeCapacity =
    (isRegTypesEnabled && !alwaysShowNoRegTypeCapacity && regTypeSettings.isRequired) || false;

  /*
   * FLEX-28867 if for Group and on the confirmationPage of an accepted/approved GL and regApproval is on
   * in the event only return regTypes that are linked to a regPath that has regApproval off.
   * TODO: remove when FLEX-27689 is implemented
   */
  const regApprovalFeatureEnabled = state.event.eventFeatureSetup.registrationProcess.registrationApproval;
  // Must be on real confirmation page, not on a pending approval page
  const isOnConfirmationPage = POST_REGISTRATION.isTypeOfPage(state, getCurrentPageId(state));
  if (forGroupMember && regApprovalFeatureEnabled && isOnConfirmationPage) {
    regTypeCapacitiesAvailable = regTypeCapacitiesAvailable.filter(regType => {
      return !getSiteEditorRegistrationPath(state, getAssociatedRegistrationPathId(state, regType.id))
        .requireRegApproval;
    });
  }

  /*
   * For group members, if admissionItems are enabled, the regTypes must have capacity
   * and an available admission Item to be considered available
   */
  let regTypeCapacitiesAreFull =
    isRegTypesEnabled &&
    !regTypeCapacitiesAvailable.some(({ id, available }) =>
      dontCheckNoRegTypeCapacity && id === noRegType
        ? false
        : available > 0 &&
          (forGroupMember && isAdmissionItemsEnabledFlag ? regTypeHasAvailableAdmissionItemMap[id] : true)
    );
  /*
   * if no categorizedRegTypes, 'no reg type' becomes an option,
   * even if 'limit visibility' is enabled, so long as its event-level capacity has not been filled
   */
  const noCategorizedRegTypes =
    regTypeSettings.categorizedRegistrationTypes && regTypeSettings.categorizedRegistrationTypes.length === 0;

  /*
   * FLEX-28867: if regApprovalEnabled and on the confirmation Page check if the default path requires
   * regApproval
   * TODO: remove this part of the check when FLEX-27689 is implemented
   */
  const defaultPathHasRegApproval =
    regApprovalFeatureEnabled && isOnConfirmationPage
      ? getSiteEditorRegistrationPath(state, getAssociatedRegistrationPathId(state, defaultRegistrationTypeId))
          .requireRegApproval
      : false;
  if (
    limitVisibility &&
    noCategorizedRegTypes &&
    eventCapacitiesRemaining[noRegType] > 0 &&
    !defaultPathHasRegApproval
  ) {
    if ((regTypes[0] as $TSFixMe)?.id !== noRegType) {
      regTypeCapacitiesAvailable.splice(0, 0, { id: noRegType, available: eventCapacitiesRemaining[noRegType] });
    }
    regTypeCapacitiesAreFull = false;
  }

  // check event capacity (planner can override)
  const eventCapacityInfo = Object.values(state.capacity || {}).find(
    c => (c as $TSFixMe).capacityId === state.event.capacityId
  ) || { totalCapacityAvailable: 0, availableCapacity: 0 };
  const eventCapacityAvailable =
    isPlanner || (eventCapacityInfo as $TSFixMe).totalCapacityAvailable === -1
      ? Infinity
      : Math.max(0, (eventCapacityInfo as $TSFixMe).availableCapacity);
  const eventCapacityIsFull = eventCapacityAvailable < 1;

  /*
   * check guest count limit (planner CAN override soft limit but CANNOT override account limit)
   * NOTE: The presence of `plannerMaxGuests` in the event snapshot is a temporary stop-gap until
   * we can query the limits service from guestside.
   * It should be updated when possible.
   */
  const plannerMaxGuests =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    state.limits && state.limits.perEventLimits && state.limits.perEventLimits.maxNumberOfGuests.limit;
  const guestCapacityMax = isPlanner ? plannerMaxGuests : regSettings.maxGuestsAllowedOnRegPath;
  const guestCapacity = !forGuest
    ? {}
    : {
        guestCapacityMax,
        guestCapacityAvailable: Math.max(
          0,
          (guestCapacityMax || 0) -
            getGuestsOfRegistrant(state.registrationForm.regCart, getEventRegistrationId(state)).length
        )
      };

  // check group size limit (planner CANNOT override)
  const groupCapacity = !forGroupMember
    ? {}
    : {
        groupCapacityMax: regSettings.maxGroupRegistrantsAllowed,
        groupCapacityAvailable: Math.max(
          0,
          regSettings.maxGroupRegistrantsAllowed - getNumberOfGroupMembers(state.registrationForm.regCart)
        )
      };

  // summary of all limits and capacities
  const isFull =
    regTypes?.length !== 0 &&
    (eventCapacityIsFull ||
      regTypeCapacitiesAreFull ||
      (forGuest && guestCapacity.guestCapacityAvailable < 1) ||
      (forGroupMember && groupCapacity.groupCapacityAvailable < 1));

  // report back all the things
  return {
    regTypeCapacitiesAvailable,
    regTypeCapacitiesAreFull,
    eventCapacityAvailable,
    eventCapacityIsFull,
    isFull,
    ...groupCapacity,
    ...guestCapacity
  };
}

export function getAvailableGroupRegTypeCapacities(state: $TSFixMe): $TSFixMe {
  // PROD-126509
  const regPath = state.appData.registrationSettings.registrationPaths[getRegistrationPathIdOrDefault(state)];
  const regSettings = regPath.groupRegistrationSettings || {};
  const regTypeSettings = regSettings.registrationTypeSettings || {};
  const alwaysShowNoRegTypeCapacity = regTypeSettings?.categorizedRegistrationTypes?.length === 0;
  return getAvailableRegTypeCapacities(state, 'GROUP', alwaysShowNoRegTypeCapacity);
}

export function getAvailableGuestRegTypeCapacities(state: $TSFixMe, alwaysShowNoRegTypeCapacity = false): $TSFixMe {
  return getAvailableRegTypeCapacities(state, 'GUEST', alwaysShowNoRegTypeCapacity);
}

function getRemainingCapacities(state, capacityPrefix, capacityIdSuffix) {
  return mapValues(
    mapKeys(
      pickBy(state.capacity || {}, (v, k) => k.startsWith(capacityPrefix)),
      (v, k) => k.replace(capacityPrefix, '').replace(capacityIdSuffix, '')
    ),
    v => (v.totalCapacityAvailable === -1 ? Infinity : Math.max(0, v.availableCapacity))
  );
}
