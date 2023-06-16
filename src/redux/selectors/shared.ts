/**
 * The shared selectors are general selectors that other selector files may require.
 * They are not put directly into index.js to prevent circular references.
 */
import { productOpen } from 'event-widgets/utils/product';
import { find, flatMap, merge, keys, filter } from 'lodash';
import { PRODUCT_STATUS } from 'event-widgets/utils/ProductStatus';
import { getNonGuestRegistrationsForDisplay } from 'event-widgets/utils/eventRegistration';
import { getEventRegistrations } from '../registrationForm/regCart/selectors';
import { createSelector } from 'reselect';
import { getIn } from 'icepick';
import { getRegistrationPackId } from '../defaultUserSession';
import { InviteeStatusId } from 'event-widgets/utils/InviteeStatus';
import { PUBLIC } from 'event-widgets/clients/RegistrationPathType';
import { mapToArray } from 'nucleus-widgets/utils/arrayToMap';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getCountryCodesJsonPath as getAppCountryCodesJsonPath } from 'event-widgets/redux/selectors/appData';
import { SessionRegistrations } from '../types';

export const EMPTY_ARRAY = Object.freeze([]);

export const getRegistrationForm = (state: $TSFixMe): $TSFixMe => state.registrationForm;

export const areRegistrationActionsDisabled = (state: $TSFixMe): $TSFixMe =>
  !!getRegistrationForm(state)?.preventRegistration;

/**
 * PROD-122664: To disable buttons to avoid concurrent RegCart update requests.
 */
export const isRegCartUpdateInProgress = (state: $TSFixMe): $TSFixMe => {
  return (
    state.dialogContainer !== undefined &&
    state.dialogContainer.isLoading + state.dialogContainer.pageTransitionLoading > 0
  );
};

export function getRegCart(state: $TSFixMe): $TSFixMe {
  const registrationForm = getRegistrationForm(state);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return registrationForm && registrationForm.regCart;
}

export const getRegistrationPaths = (state: $TSFixMe): $TSFixMe => state.appData.registrationSettings.registrationPaths;

export const getDefaultRegPathId = (state: $TSFixMe): $TSFixMe => {
  const regPaths = mapToArray(state?.appData?.registrationSettings.registrationPaths);
  const defaultRegPath = find(regPaths, rp => rp.isDefault);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return defaultRegPath && defaultRegPath.id;
};

const EXTERNAL_AUTHENTICATION_TYPE = 1;
const SPECIFIC_REGISTRATION_PATH_AUTH_LOCATION = 2;

/**
 * Determines if the admission item is visible for the given registration type. A visible
 * admission item can be selected by a registrant.
 *
 * @param {*} options.registeredAdmissionItem During registration modification
 *  a prior selected admission item will be visible even if it would normally not be shown.
 * @param {*} options.includeClosedAdmissionItems Determines if closed admission items should
 *  be shown. Used during planner registration to allow a planner to select closed admission item.
 */
export function admissionItemIsVisible(
  registrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe,
  options?: $TSFixMe
): $TSFixMe {
  const { registeredAdmissionItem, includeClosedAdmissionItems = false } = options || {};
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const registeredAdmissionItemId = registeredAdmissionItem && registeredAdmissionItem.productId;
  const selectedDuringInitialRegistration = admissionItem.id === registeredAdmissionItemId;
  const visibleForRegistration = includeClosedAdmissionItems || productOpen(admissionItem);
  const visibleForRegistrationType =
    admissionItem.applicableContactTypes.length === 0 ||
    admissionItem.applicableContactTypes.includes(registrationTypeId);

  return selectedDuringInitialRegistration || (visibleForRegistration && visibleForRegistrationType);
}

/**
 * Determines if the session is visible for the given registration type.
 */
export function sessionIsVisibleForRegistrationType(registrationTypeId: $TSFixMe, session: $TSFixMe): $TSFixMe {
  const associatedRegistrationTypes = session.associatedRegistrationTypes || [];
  return associatedRegistrationTypes.length === 0 || associatedRegistrationTypes.includes(registrationTypeId);
}

/**
 * Determines if the session is visible for the given admission item. If no admission
 * item is present the session is considered visible.
 */
export function sessionIsVisibleForAdmissionItem(admissionItem: $TSFixMe, session: $TSFixMe): $TSFixMe {
  return (
    !admissionItem ||
    !admissionItem.limitOptionalSessionsToSelect ||
    admissionItem.availableOptionalSessions.includes(session.id)
  );
}

/**
 * Determines if the optional item is visible for the given registration type.
 */
export function optionalItemIsVisibleForRegistrationType(
  registrationTypeId: $TSFixMe,
  optionalItem: $TSFixMe
): $TSFixMe {
  const associatedRegistrationTypes = optionalItem.associatedRegistrationTypes || [];
  return associatedRegistrationTypes.length === 0 || associatedRegistrationTypes.includes(registrationTypeId);
}

/**
 * Determines if the optional item is visible for the given admission item. If no admission
 * item is present the optional item is considered visible.
 */
export function optionalItemIsVisibleForAdmissionItem(admissionItem: $TSFixMe, optionalItem: $TSFixMe): $TSFixMe {
  return (
    !admissionItem ||
    !admissionItem.limitOptionalItemsToSelect ||
    admissionItem.applicableOptionalItems.includes(optionalItem.id)
  );
}

/**
 * Determines if the session is visible for the given registration type and admission item. A
 * visible session can be selected by the registrant.
 *
 * @param {*} options.registeredSessions During registration modification, any prior sessions explicitly
 *  selected by the registrant will be visible even if it would normally not be shown, except when it is set to be
 *  not visible for a newly selected admission item
 * @param {*} options.includeClosedSessions Determines if closed sessions should
 *  be shown. Used during planner registration to allow a planner to select closed sessions.
 * @param {*} options.alwaysCheckAdmissionItemAvailability Experiment - whether to force remove any session that is not
 * visible for the newly selected admission item during reg mod
 */
export function sessionIsVisible(
  registrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe,
  session: $TSFixMe,
  options?: {
    registeredSessions?: SessionRegistrations;
    includeClosedSessions?: boolean;
    regPathAllowsSessionSelection?: boolean;
    alwaysCheckAdmissionItemAvailability?: boolean;
  }
): $TSFixMe {
  const {
    registeredSessions = {},
    includeClosedSessions = false,
    regPathAllowsSessionSelection = true,
    alwaysCheckAdmissionItemAvailability = false
  } = options || {};
  if (alwaysCheckAdmissionItemAvailability) {
    if (!sessionIsVisibleForAdmissionItem(admissionItem, session)) {
      return false; // FLEX-74930
    }
    const registeredSession = registeredSessions[session.id];
    const isAlreadyRegistered = registeredSession?.registrationSourceType === 'Selected';
    if (isAlreadyRegistered) {
      return true;
    }
    if (!regPathAllowsSessionSelection) {
      return false;
    }
    const visibleForRegistration =
      !session.isIncludedSession &&
      (includeClosedSessions || productOpen(session)) &&
      session.status !== PRODUCT_STATUS.CANCELLED;

    return visibleForRegistration && sessionIsVisibleForRegistrationType(registrationTypeId, session);
  }
  const registeredSession = registeredSessions[session.id];
  const selectedDuringInitialRegistration =
    registeredSession && registeredSession.registrationSourceType === 'Selected';
  const visibleForRegistration =
    !session.isIncludedSession &&
    (includeClosedSessions || productOpen(session)) &&
    session.status !== PRODUCT_STATUS.CANCELLED;

  return (
    selectedDuringInitialRegistration ||
    (!session.isIncludedSession &&
      visibleForRegistration &&
      regPathAllowsSessionSelection &&
      sessionIsVisibleForRegistrationType(registrationTypeId, session) &&
      sessionIsVisibleForAdmissionItem(admissionItem, session))
  );
}

export function sessionGroupIsVisible(sessionGroup: $TSFixMe, options: $TSFixMe): $TSFixMe {
  const { includeClosedSessionGroups = false, registeredSessions = {}, sessions = {} } = options || {};
  const containsRegisteredSession = find(sessions, session => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const registeredSession = registeredSessions && registeredSessions[session.id];
    return registeredSession && registeredSession.registrationSourceType === 'Selected';
  });
  const visibleForRegistration = includeClosedSessionGroups || productOpen(sessionGroup) || containsRegisteredSession;
  return visibleForRegistration;
}

/**
 * Determines if the session is associated to the admission item. An associated session is automatically
 * added to the registrants cart without fees.
 */
export function sessionIsAssociatedToAdmissionItem(admissionItem: $TSFixMe, session: $TSFixMe): $TSFixMe {
  const sessionsAssociatedWithAdmissionItem = admissionItem ? admissionItem.associatedOptionalSessions : [];
  return sessionsAssociatedWithAdmissionItem.includes(session.id);
}

/**
 * Determines if the session is registerable for the given registration type and admission item. A registerable
 * session is one that a registrant can select, is included with the event, or associated to an admission item.
 *
 * @param {*} options.registeredSessions See sessionIsVisible()
 * @param {*} options.includeClosedSessions See sessionIsVisible()
 * @param {*} options.alwaysCheckAdmissionItemAvailability See sessionIsVisible()
 */
export function sessionIsRegisterable(
  registrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe,
  session: $TSFixMe,
  options?: $TSFixMe
): $TSFixMe {
  return (
    session.isIncludedSession ||
    sessionIsAssociatedToAdmissionItem(admissionItem, session) ||
    sessionIsVisible(registrationTypeId, admissionItem, session, options)
  );
}

/**
 * Determines if the quantity item is visible for the given registration type and admission item. A
 * visible quantity item can be selected by the registrant.
 *
 * @param {*} options.registeredQuantityItems During registration modification amy prior quantity item
 *  explicitly selected by the registrant will be visible even if it would normally not be shown.
 * @param {*} options.includeClosedQuantityItems Determines if closed quantity items should
 *  be shown. Used during planner registration to allow a planner to select closed quantity items.
 */
export function quantityItemIsVisible(
  registrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe,
  quantityItem: $TSFixMe,
  options: $TSFixMe
): $TSFixMe {
  const {
    registeredQuantityItems = {},
    includeClosedQuantityItems = false,
    regPathAllowsQuantityItemSelection = true
  } = options || {};
  const selectedDuringInitialRegistration = registeredQuantityItems[quantityItem.id];
  const visibleForRegistration =
    (includeClosedQuantityItems || productOpen(quantityItem)) && quantityItem.status !== PRODUCT_STATUS.CANCELLED;

  return (
    !!selectedDuringInitialRegistration ||
    (visibleForRegistration &&
      regPathAllowsQuantityItemSelection &&
      optionalItemIsVisibleForRegistrationType(registrationTypeId, quantityItem) &&
      optionalItemIsVisibleForAdmissionItem(admissionItem, quantityItem))
  );
}

/**
 * Determines if the donation item is visible for the given registration type and admission item. A
 * visible donation item can be selected by the registrant.
 */
export function donationItemIsVisible(
  registrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe,
  donationItem: $TSFixMe,
  options: $TSFixMe
): $TSFixMe {
  const { includeClosedDonationItems = false, regPathAllowsDonationItemSelection = true } = options || {};
  const visibleForRegistration =
    (includeClosedDonationItems || productOpen(donationItem)) && donationItem.status !== PRODUCT_STATUS.CANCELLED;

  return (
    visibleForRegistration &&
    regPathAllowsDonationItemSelection &&
    optionalItemIsVisibleForRegistrationType(registrationTypeId, donationItem) &&
    optionalItemIsVisibleForAdmissionItem(admissionItem, donationItem)
  );
}

/**
 * Get id of the reg path associated with a given reg type
 */
export function getAssociatedRegistrationPathId(state: $TSFixMe, registrationTypeId: $TSFixMe): $TSFixMe {
  const registrationPaths = state.appData.registrationSettings.registrationPaths;
  const associatedRegPath = find(
    registrationPaths,
    rp =>
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      rp.associatedRegistrationTypes &&
      rp.associatedRegistrationTypes.length &&
      rp.associatedRegistrationTypes.includes(registrationTypeId)
  );
  if (associatedRegPath) {
    return associatedRegPath.id;
  }
  const defaultRegPath = find(registrationPaths, rp => rp.isDefault);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return defaultRegPath && defaultRegPath.id;
}

/**
 * Check whether a given reg path allows session selection
 */
export function allowsSessionSelection(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return state.appData.registrationSettings.registrationPaths[regPathId].allowsSessionSelection;
}

/**
 * Check whether a given reg path allows quantity item selection
 */
export function allowsQuantityItemSelection(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return state.appData.registrationSettings.registrationPaths[regPathId].allowsQuantityItemSelection;
}

/**
 * Check whether a given reg path allows donation item selection
 */
export function allowsDonationItemSelection(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    regPathId,
    'allowsDonationItemSelection'
  ]);
}

/**
 * Check whether a given reg path allows guest registration
 */
export function allowsGuestRegistration(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    state.appData.registrationSettings.registrationPaths[regPathId].guestRegistrationSettings &&
    state.appData.registrationSettings.registrationPaths[regPathId].guestRegistrationSettings.isGuestRegistrationEnabled
  );
}

/**
 *
 * @param {*} state
 */
// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
export const getCountries = (state: $TSFixMe): $TSFixMe => state.countries && state.countries.countries;

export const getCountriesAsChoices = createSelector(getCountries, countries =>
  Object.keys(countries || {}).map(code => ({
    text: countries[code].nameResourceKey,
    id: code
  }))
);

/**
 * Check whether a given reg path allows admin registration
 */
export function isAdministratorRegistrationEnabled(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return !!getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    regPathId,
    'identityConfirmation',
    'administratorRegistrationEnabled'
  ]);
}

/**
 * Check whether a given reg path allows group registration
 */
export function isGroupRegistrationEnabled(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return !!getIn(state, ['appData', 'registrationSettings', 'registrationPaths', regPathId, 'allowsGroupRegistration']);
}

/**
 * Check whether a given reg path uses automatic opt in for attendee list.
 */
export function isAttendeeListOptInAutomatic(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return (
    getIn(state, ['appData', 'registrationSettings', 'registrationPaths', regPathId, 'allowAttendeeListOptIn']) ===
    'AUTOMATIC'
  );
}

/**
 * Check whether a given reg path has vouchers enabled
 */
export function isVoucherEnabled(state: $TSFixMe, regPathId: $TSFixMe): $TSFixMe {
  return !!getIn(state, ['appData', 'registrationSettings', 'registrationPaths', regPathId, 'voucherEnabled']);
}

/**
 * Get the registration types that are associated with a private registration path
 */
export const getEmailOnlyRegistrationTypes = createSelector(
  state => getRegistrationPaths(state),
  registrationPaths => {
    return flatMap(
      Object.values(registrationPaths)
        .filter(
          regPath =>
            (regPath as $TSFixMe).accessRules.invitationListAccess.isEmailOnlyInvite &&
            (regPath as $TSFixMe).accessRules.invitationListAccess.type !== PUBLIC
        )
        .map(regPath => (regPath as $TSFixMe).associatedRegistrationTypes)
    );
  }
);

/**
 * returns all invitees (non guest) event registration ids
 */
export const getAllInviteesRegistrationIds = createSelector(
  // Selector arguments
  getRegCart,
  // result function
  regCart => {
    const eventRegistrations = getEventRegistrations(regCart);
    return getNonGuestRegistrationsForDisplay(Object.values(eventRegistrations)).map(
      eventRegistration => eventRegistration.eventRegistrationId
    );
  }
);

/**
 * Returns all the active account hotel billing instructions present in the state
 */
export const getActiveAccountHotelBillingInstructions = (state: $TSFixMe): $TSFixMe => {
  return (
    (getIn(state, ['account', 'hotelBillingInstructions']) || EMPTY_ARRAY).filter(bi => bi.isActive) || EMPTY_ARRAY
  ).sort((one, two) => one.name.localeCompare(two.name));
};

/**
 * Returns the registration pack Id from the regCart
 */
export const getRegPackIdFromRegCart = (state: $TSFixMe): $TSFixMe => {
  const regCart = getRegCart(state);
  if (regCart && !!regCart.regPackId) {
    return regCart.regPackId;
  }
  return null;
};

/**
 * Returns the registration pack Id
 */
export const getRegPackId = (state: $TSFixMe): $TSFixMe => {
  /* During red mode the regpack Id will be present in the regCart */
  let registrationPackId = getRegPackIdFromRegCart(state);
  if (!registrationPackId) {
    registrationPackId = getRegistrationPackId(state);
  }
  return registrationPackId;
};

/**
 * Returns registration pages registration type visibility from the navigation.
 */
export const getRegistrationPagesRegTypeVisibility = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['website', 'pluginData', 'registrationProcessNavigation', 'regTypeVisibility']);
};
/**
 * Returns all pages pages registration type visibility from the navigation.
 */
export const getRegTypeVisibility = (state: $TSFixMe): $TSFixMe => {
  return merge(
    getIn(state, ['website', 'pluginData', 'registrationProcessNavigation', 'regTypeVisibility']),
    getIn(state, ['website', 'pluginData', 'eventWebsiteNavigation', 'regTypeVisibility'])
  );
};

export const getSpeakerDocuments = (state: $TSFixMe, speakerId: $TSFixMe): $TSFixMe => {
  return getIn(state, ['speakerDocuments', speakerId]);
};

export function isHTTPPostOrSSOOnInAccount(account: $TSFixMe): $TSFixMe {
  return (
    account.settings.accountSecuritySettings &&
    ((account.settings.accountSecuritySettings.allowHTTPPost &&
      !account.settings.accountSecuritySettings.allowSecureHTTPPost) ||
      (account.settings.accountSecuritySettings.allowSSOLogin &&
        account.settings.accountSecuritySettings.allowSecureHTTPPost))
  );
}

/**
 * Return whether the invitee should show up on group reg mod/cancel dialog
 * Adding regCartStatus === 'COMPLETED' to handle scenarios when invitee search delayed.
 */
export const shouldDisplayOnGroupRegistrationPopup = (
  eventRegistration: $TSFixMe,
  regCartStatus: $TSFixMe
): $TSFixMe => {
  return (
    (regCartStatus === 'COMPLETED' && !eventRegistration.attendee.inviteeStatus) ||
    eventRegistration.attendee.inviteeStatus === InviteeStatusId.Accepted ||
    eventRegistration.attendee.inviteeStatus === InviteeStatusId.PendingApproval
  );
};

export const regCartHasGroupMembers = (state: $TSFixMe): $TSFixMe => {
  const regCart = getRegCart(state);
  return (
    regCart.eventRegistrations &&
    keys(
      filter(
        regCart.eventRegistrations,
        eventReg =>
          eventReg.attendeeType !== 'GUEST' &&
          eventReg.attendee &&
          shouldDisplayOnGroupRegistrationPopup(eventReg, regCart.status)
      )
    ).length > 1
  );
};

export const isSingleSignOn = (account: $TSFixMe): $TSFixMe => {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    account.settings.accountSecuritySettings &&
    account.settings.accountSecuritySettings.allowSSOLogin &&
    account.settings.accountSecuritySettings.allowSecureHTTPPost
  );
};

function isExternalAuthOnInEvent(event) {
  return event.eventSecuritySetupSnapshot.authenticationType === EXTERNAL_AUTHENTICATION_TYPE;
}

function isRegPathSpecificLinkNotEnabledOrRegPathIsIncluedInExternalAuth(event, regPathId) {
  return (
    event.eventSecuritySetupSnapshot.authenticationLocation !== SPECIFIC_REGISTRATION_PATH_AUTH_LOCATION ||
    event.eventSecuritySetupSnapshot.authenticatedRegistrationPaths.includes(regPathId)
  );
}

export const isOAuthOnInAccount = (account: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return account.settings.accountSecuritySettings && account.settings.accountSecuritySettings.allowOAuth;
};

export const shouldOpenSsoDialog = (
  state: $TSFixMe,
  authenticatedContact: $TSFixMe,
  ssoFlowSelected: $TSFixMe
): $TSFixMe => {
  return (
    isSingleSignOn(state.account) &&
    authenticatedContact &&
    !state.registrationForm.regCart.regCartId &&
    !ssoFlowSelected
  );
};

export const isSsoInviteeFlow = (state: $TSFixMe, regPathId?: $TSFixMe): $TSFixMe => {
  const {
    userSession: { inviteeId, isSsoAdmin },
    defaultUserSession: { isPlanner }
  } = state;
  return (
    isSingleSignOn(state.account) &&
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
    isExternalAuthOnInEvent(state.event, regPathId) &&
    isRegPathSpecificLinkNotEnabledOrRegPathIsIncluedInExternalAuth(state.event, regPathId) &&
    inviteeId &&
    !isSsoAdmin &&
    !isPlanner
  );
};

export function shouldMakeAdminFieldReadOnly(state: $TSFixMe): $TSFixMe {
  const { isSsoAdmin } = state.userSession;
  return isSingleSignOn(state.account) && isSsoAdmin;
}

export function getAllRegistrantRegPathIds(state: $TSFixMe): $TSFixMe {
  const regCart = getRegCart(state);
  const eventRegistrations = regCart.eventRegistrations;
  const regPathIds = [];

  if (eventRegistrations) {
    Object.values(eventRegistrations).forEach(eventReg => {
      if ((eventReg as $TSFixMe).registrationPathId) {
        regPathIds.push((eventReg as $TSFixMe).registrationPathId);
      }
    });
  }

  return regPathIds;
}

/**
 * Returns a reg cart id that should be aborted or undefined if no cart should be aborted. This is done prior to
 * creating a new reg cart
 * Carts can exist in the user session and/or in local state
 * - for carts only available in the session, we don't know the status. therefore to avoid an additional request to
 * retrieve the status we request abortion and rely on the server to process only requests for an in-progress cart
 * - for carts in local state, we only abort these if they are in-progress
 */
export function determineRegCartIdToAbort(state: $TSFixMe): $TSFixMe {
  const {
    // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
    userSession: { regCartId: sessionRegCartId } = {},
    // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
    registrationForm: { regCart: { regCartId: localRegCartId, status: localRegCartStatus } = {} } = {}
  } = state;
  if (sessionRegCartId && !localRegCartId) {
    // if only session cart exists, abort it
    return sessionRegCartId;
  }
  return localRegCartStatus === 'INPROGRESS' ? localRegCartId : undefined;
}

export function getCountryCodesJsonPath(
  state: $TSFixMe,
  widgetId: $TSFixMe,
  registrationFieldPageType: $TSFixMe,
  fieldId: $TSFixMe,
  ...subPaths: $TSFixMe[]
): $TSFixMe {
  const regPathId = getRegistrationPathIdForWidget(state, widgetId);
  // @ts-expect-error ts-migrate(2556) FIXME: Expected 3 arguments, but got 4 or more.
  return getAppCountryCodesJsonPath(regPathId, registrationFieldPageType, fieldId, ...subPaths);
}
