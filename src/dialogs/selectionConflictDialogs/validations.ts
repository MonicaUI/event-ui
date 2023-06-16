/**
 * Validations against the current cart when either the Registration Type or Admission Item or
 * parent custom contact field choice changes.
 */
import {
  allowsSessionSelection,
  getRegCart,
  admissionItemIsVisible,
  allowsGuestRegistration,
  getAssociatedRegistrationPathId,
  sessionIsRegisterable,
  sessionIsAssociatedToAdmissionItem,
  sessionGroupIsVisible,
  sessionIsVisible,
  allowsQuantityItemSelection,
  quantityItemIsVisible,
  optionalItemIsVisibleForAdmissionItem,
  optionalItemIsVisibleForRegistrationType,
  donationItemIsVisible,
  allowsDonationItemSelection,
  sessionIsVisibleForAdmissionItem
} from '../../redux/selectors/shared';
import {
  getRegistrationTypeId,
  getEventRegistrationId,
  isGroupMember,
  getVisibleRegistrationTypes,
  getSelectedAdmissionItemDefinition,
  getAttendeeCustomFieldAnswer,
  modificationStart,
  getModificationStartRegCart,
  isGroupLeader,
  getSelectedAdmissionItem,
  isRegistrationModification,
  modificationStartForCurrentGuest,
  getCurrentGuestCustomFieldAnswer,
  getSelectedQuantityItems
} from '../../redux/selectors/currentRegistrant';
import {
  getRegistrationPathId,
  getRegistrationTypeForGroupMembers
} from '../../redux/selectors/currentRegistrationPath';
import {
  isWidgetReviewed,
  sessionsAppearOnPageBeforeRegistrationType,
  quantityItemsAppearOnPageBeforeAdmissionItems,
  quantityItemsAppearOnPageBeforeRegistrationType
} from '../../redux/website/pageContentsWithGraphQL';
import {
  getAdmissionItems,
  getSiteEditorRegistrationPath,
  getGuestRegistrationTypeSettings,
  getAdvancedSessionRules,
  isGroupRegistrationEnabled,
  getAdvancedQuantityItemRules
} from '../../redux/selectors/event';
import {
  getChoicesFilteredByLinkLogic,
  getChildCustomFieldsByParentCustomFieldId
} from 'event-widgets/redux/selectors/account';
import { getValues } from '../../widgets/QuestionsAndFields/customFieldSelectors';
import { map, intersectionBy, pickBy, isEmpty, uniq, filter, has, each, values, flatMap } from 'lodash';
import Logger from '@cvent/nucleus-logging';
import { speculativelyValidateSessionAdvancedRules } from 'event-widgets/lib/Sessions/validations/advancedRules';
const LOG = new Logger('event-guestside-site/src/containers/selectionConflictDialogs/validations');
import {
  getSelectedSessions,
  getRegisteredSessionsSourceTypeNotWithSessionBundle,
  getSelectedAdmissionItem as getSelectedAdmissionItemRegCart,
  isGuest,
  getRegistrationTypeId as getRegistrationTypeIdRegCart,
  getGuestsOfRegistrant,
  getNumberOfGroupMembers,
  getSessions as getSessionsRegCart,
  getQuantityItems as getQuantityItemsRegCart,
  getDonationItems as getDonationItemsRegCart,
  isRegApprovalRequired,
  getSelectedWaitlistedSessions
} from '../../redux/registrationForm/regCart/selectors';
import * as registrationTypeUtils from 'event-widgets/utils/registrationType';
import {
  validateAirRequestAdvancedRules,
  validateHotelBookings,
  validateAirRequests,
  validateHotelBookingAdvancedRules,
  validateGroupFlightRequests
} from './travelValidations';
import { productErrors, travelCartErrors } from '../../redux/registrationForm/errors';
import { overlap } from '../../utils/overlapUtil';
import {
  getSelectedSessionDefinitions,
  getPrimaryAndGuestSortedVisibleSessions,
  getSessionGroups,
  getPrimarySortedVisibleQuantityItems,
  getSelectedQuantityItemDefinitions,
  getSelectedDonationItemDefinitions,
  getPrimarySortedVisibleDonationItems
} from '../../redux/selectors/productSelectors';
import { getRegTypeCapacityIds } from 'event-widgets/redux/modules/capacity';
import { getRegPackId } from '../../redux/selectors/shared';
import { speculativelyValidateQuantityItemAdvancedRules } from 'event-widgets/lib/QuantityItems/validations/advancedRules';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import { customFieldShouldUseChoiceIds } from 'event-widgets/utils/multiLanguageUtils';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import { buildIdConfirmationDialogRegTypeConflictResults } from '../../redux/registrationForm/regCart/sessionBundles';
import { getIn } from 'icepick';

async function validateAdvancedSessionRulesForRegTypeSelection(state, registrationTypeId, admissionItem, apolloClient) {
  const sessionsBeforeRegistrationType = await sessionsAppearOnPageBeforeRegistrationType(state, apolloClient);
  if (!sessionsBeforeRegistrationType) {
    // Don't enforce rules yet, because the user will go through session selection on a later page
    return { isValid: true };
  }
  return validateAdvancedSessionRules(state, registrationTypeId, admissionItem);
}

function getFlattenedSessions(state) {
  return flatMap(getPrimaryAndGuestSortedVisibleSessions(state), session => [session, ...values(session.sessions)]);
}

function areAllValidationResultsValid(...validationResults) {
  return validationResults.every(validationResult => validationResult.isValid);
}

/**
 * Validates the current registrants cart for a given registration type. The results returned
 * indicate if the cart is still valid for the registration type, and if not, which items
 * are invalid. This is useful to determine if a newly selected registration type
 * causes an invalid cart. This should only be used to validate the *USER* changing their own registration type, other
 * changes should use the error messages returned by event-registration-service
 *
 * @param {*} state The state containing the current registrant
 * @param {*} registrationTypeId The registration type id to validate against the cart.
 */
// eslint-disable-next-line complexity
export async function validateUserRegistrationTypeSelection(
  state: $TSFixMe,
  registrationTypeId: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  ignoreAdmissionItemsWidgetPlacement: $TSFixMe,
  apolloClient: $TSFixMe
): Promise<$TSFixMe> {
  let admissionItem;
  const regCart = getRegCart(state);
  const selectedAdmissionItem = getSelectedAdmissionItemRegCart(regCart, eventRegistrationId);
  const admissionItems = getAdmissionItems(state);
  // eslint-disable-next-line prefer-const
  admissionItem = selectedAdmissionItem && admissionItems[selectedAdmissionItem.productId];
  const admissionItemValidationResults = validateAdmissionItem(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId
  );
  const sessionsValidationResults = validateSessions(
    state,
    registrationTypeId,
    admissionItem,
    null,
    eventRegistrationId
  );
  const sessionGroupValidationResults = await validateSessionGroups(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId,
    apolloClient
  );
  const sessionAdvancedRuleValidationResults = await validateAdvancedSessionRulesForRegTypeSelection(
    state,
    registrationTypeId,
    admissionItem,
    apolloClient
  );
  const guest = isGuest(regCart, eventRegistrationId);
  // If we are running validations for guest, assume guest reg is always allowed.
  let guestRegistrationsValidationResults = { isValid: true, guestCount: 0, invalidGuestRegistrations: [] };
  if (!guest) {
    const {
      regCartStatus: { lastSavedRegCart }
    } = state;
    const previousRegistrationTypeId = getRegistrationTypeIdRegCart(lastSavedRegCart, eventRegistrationId);
    guestRegistrationsValidationResults = validateGuestRegistrations(
      state,
      registrationTypeId,
      previousRegistrationTypeId
    );
  }
  const airRequestValidationResults = validateAirRequests(state, registrationTypeId, guest);
  const airRequestAdvancedRuleValidationResults = validateAirRequestAdvancedRules(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId,
    guest
  );
  const hotelBookingValidationResults = validateHotelBookings(
    state,
    registrationTypeId,
    eventRegistrationId,
    admissionItem
  );
  const hotelBookingAdvancedRuleValidationResults = validateHotelBookingAdvancedRules(
    state,
    registrationTypeId,
    admissionItem
  );
  const groupFlightBookingValidationResults = validateGroupFlightRequests(
    state,
    registrationTypeId,
    eventRegistrationId
  );
  let groupRegistrationValidationResults = {
    isValid: true
  };
  const quantityItemValidationResults = validateQuantityItems(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId
  );
  const quantityItemAdvancedRuleValidationResults = await validateAdvancedQuantityItemRulesForRegTypeSelection(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId,
    apolloClient
  );
  const donationItemValidationResults = validateDonationItems(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId
  );
  // run this only if the group leader changes their reg type
  if (isGroupLeader(state, eventRegistrationId)) {
    groupRegistrationValidationResults = validateGroupRegistrations(state, registrationTypeId);
  }
  const isValid = areAllValidationResultsValid(
    admissionItemValidationResults,
    sessionsValidationResults,
    sessionGroupValidationResults,
    sessionAdvancedRuleValidationResults,
    guestRegistrationsValidationResults,
    airRequestValidationResults,
    airRequestAdvancedRuleValidationResults,
    hotelBookingValidationResults,
    hotelBookingAdvancedRuleValidationResults,
    groupRegistrationValidationResults,
    quantityItemValidationResults,
    quantityItemAdvancedRuleValidationResults,
    donationItemValidationResults,
    groupFlightBookingValidationResults
  );
  /*
   * Same as isValid, except ignoring admission item conflicts that can be cleared without confirmation from the user
   * because admission item selection is later in the registration process
   */
  const canProceedWithoutUserConfirmation =
    (admissionItemValidationResults.isValid ||
      (!(await isWidgetReviewed(state, { widgetType: 'AdmissionItems' })) && !ignoreAdmissionItemsWidgetPlacement)) &&
    areAllValidationResultsValid(
      sessionsValidationResults,
      sessionGroupValidationResults,
      sessionAdvancedRuleValidationResults,
      guestRegistrationsValidationResults,
      airRequestValidationResults,
      airRequestAdvancedRuleValidationResults,
      hotelBookingValidationResults,
      hotelBookingAdvancedRuleValidationResults,
      groupRegistrationValidationResults,
      quantityItemValidationResults,
      quantityItemAdvancedRuleValidationResults,
      donationItemValidationResults,
      groupFlightBookingValidationResults
    );
  if (!isValid) {
    const invalidAdmissionItemName =
      !admissionItemValidationResults.isValid && admissionItemValidationResults.admissionItem
        ? `admission item ${admissionItemValidationResults.admissionItem.name}`
        : '';
    const invalidSessionNames = !sessionsValidationResults.isValid
      ? `session(s) ${sessionsValidationResults.invalidSessions.map(session => session.name).join(',')}`
      : '';
    const invalidSessionGroupNames = !sessionGroupValidationResults.isValid
      ? `session group(s) ${sessionGroupValidationResults.invalidSessionGroups
          .map(sessionGroup => sessionGroup.name)
          .join(',')}`
      : '';
    const invalidQuantityItemNames = !quantityItemValidationResults.isValid
      ? `quantity item(s) ${quantityItemValidationResults.invalidQuantityItems
          .map(quantityItem => quantityItem.name)
          .join(',')}`
      : '';
    const invalidDonationItemNames = !donationItemValidationResults.isValid
      ? `donation item(s) ${donationItemValidationResults.invalidDonationItems
          .map(donationItem => donationItem.name)
          .join(',')}`
      : '';
    LOG.info(`Registration type ${registrationTypeId} is not valid for:
      ${invalidAdmissionItemName} ${invalidSessionNames} ${invalidSessionGroupNames} ${invalidQuantityItemNames}
      ${invalidDonationItemNames}`);
  }
  return {
    isValid,
    canProceedWithoutUserConfirmation,
    newRegistrationTypeId: registrationTypeId,
    admissionItemValidationResults,
    sessionsValidationResults,
    sessionGroupValidationResults,
    sessionAdvancedRuleValidationResults,
    guestRegistrationsValidationResults,
    airRequestAdvancedRuleValidationResults,
    hotelBookingValidationResults,
    airRequestValidationResults,
    hotelBookingAdvancedRuleValidationResults,
    groupRegistrationValidationResults,
    quantityItemValidationResults,
    quantityItemAdvancedRuleValidationResults,
    donationItemValidationResults,
    groupFlightBookingValidationResults
  };
}

export async function regTypeCapacityFull(state: $TSFixMe, regPathId: $TSFixMe): Promise<$TSFixMe> {
  const {
    event,
    accessToken,
    clients: { capacityClient }
  } = state;
  const regTypeId = getRegistrationTypeId(state);
  const registrationId = getEventRegistrationId(state);
  const groupMember = isGroupMember(state, registrationId);
  const regTypes = groupMember
    ? getRegistrationTypeForGroupMembers(state)
    : getVisibleRegistrationTypes(state, regPathId, regTypeId);
  const defaultRegTypeAttendingFormat =
    event?.registrationTypes[registrationTypeUtils.defaultRegistrationTypeId]?.attendingFormat ??
    AttendingFormat.INPERSON;
  const allRegTypes = [
    ...regTypes,
    { id: registrationTypeUtils.defaultRegistrationTypeId, attendingFormat: defaultRegTypeAttendingFormat }
  ];
  const regPackId = getRegPackId(state);
  const regTypeCapacityIds = getRegTypeCapacityIds(event, allRegTypes, regPackId);
  // There will always be at least one reg type - no reg type.
  const capacities = await capacityClient.getCapacitySummaries(accessToken, regTypeCapacityIds);
  const fullCapacities = filter(capacities, c => c.totalCapacityAvailable > 0 && c.availableCapacity <= 0);
  return fullCapacities.length === Object.keys(capacities).length;
}
/**
 * Validates the current registrants cart for a given admission item.  The results returned
 * indicate if the cart is still valid for the admission item, and if not, which items
 * are invalid. This is useful to determine if a newly selected admission item
 * causes an invalid cart.
 *
 * @param {*} state The state containing the current registrant
 * @param {*} admissionItem The Admission item to validate against the cart.
 */
// eslint-disable-next-line complexity
export async function validateAdmissionItemChange(
  state: $TSFixMe,
  admissionItem: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  sessionsAppearOnPageBeforeAdmissionItems: $TSFixMe,
  apolloClient: $TSFixMe
): Promise<$TSFixMe> {
  let registrationTypeId;
  let originalAdmissionItem;
  if (!eventRegistrationId) {
    registrationTypeId = getRegistrationTypeId(state);
    originalAdmissionItem = getSelectedAdmissionItemDefinition(state);
  } else {
    const regCart = getRegCart(state);
    registrationTypeId = getRegistrationTypeIdRegCart(regCart, eventRegistrationId);
    const selectedAdmissionItem = getSelectedAdmissionItemRegCart(regCart, eventRegistrationId);
    const admissionItems = getAdmissionItems(state);
    originalAdmissionItem = selectedAdmissionItem && admissionItems[selectedAdmissionItem.productId];
  }
  const sessionsValidationResults = validateSessions(
    state,
    registrationTypeId,
    admissionItem,
    originalAdmissionItem,
    eventRegistrationId
  );
  const sessionGroupValidationResults = await validateSessionGroups(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId,
    apolloClient
  );
  const sessionsCountValidationResults = validateSessionsCount(
    state,
    registrationTypeId,
    admissionItem,
    originalAdmissionItem,
    eventRegistrationId,
    sessionsAppearOnPageBeforeAdmissionItems
  );
  const sessionOverlapValidationResults = validateSessionOverlap(
    state,
    admissionItem,
    eventRegistrationId,
    sessionsAppearOnPageBeforeAdmissionItems
  );
  const advancedRuleValidationResults = validateAdvancedSessionRules(
    state,
    eventRegistrationId,
    registrationTypeId,
    admissionItem
  );
  const airRequestAdvancedRuleValidationResults = validateAirRequestAdvancedRules(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId,
    isGuest(getRegCart(state), eventRegistrationId)
  );
  const hotelBookingValidationResults = validateHotelBookings(
    state,
    registrationTypeId,
    eventRegistrationId,
    admissionItem
  );
  const hotelBookingAdvancedRuleValidationResults = validateHotelBookingAdvancedRules(
    state,
    registrationTypeId,
    admissionItem
  );
  const quantityItemValidationResults = validateQuantityItems(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId
  );
  const quantityItemAdvancedRuleValidationResults = await validateAdvancedQuantityItemRulesForAdmissionItemSelection(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId,
    apolloClient
  );
  const donationItemValidationResults = validateDonationItems(
    state,
    registrationTypeId,
    admissionItem,
    eventRegistrationId
  );
  const includedSessionWaitlistValidationResults = validateIncludedSessionWaitisted(
    state,
    admissionItem,
    eventRegistrationId
  );
  const sessionWaitlistValidationResults = validateWaitlistedSession(state, admissionItem, eventRegistrationId);
  const isValid = areAllValidationResultsValid(
    sessionsValidationResults,
    sessionsCountValidationResults,
    sessionOverlapValidationResults,
    sessionGroupValidationResults,
    airRequestAdvancedRuleValidationResults,
    hotelBookingValidationResults,
    hotelBookingAdvancedRuleValidationResults,
    quantityItemValidationResults,
    quantityItemAdvancedRuleValidationResults,
    donationItemValidationResults,
    includedSessionWaitlistValidationResults,
    sessionWaitlistValidationResults
  );
  if (!isValid) {
    const invalidSessionNames = !sessionsValidationResults.isValid
      ? `session(s) ${sessionsValidationResults.invalidSessions.map(session => session.name).join(',')}`
      : '';
    const invalidSessionGroupNames = !sessionGroupValidationResults.isValid
      ? `session group(s) ${sessionGroupValidationResults.invalidSessionGroups
          .map(sessionGroup => sessionGroup.name)
          .join(',')}`
      : '';
    const overlappingSessionCount = !sessionOverlapValidationResults.isValid
      ? `Overlapping sessions count ${sessionOverlapValidationResults.overlapCount}`
      : '';
    const invalidSessionCount = !sessionsCountValidationResults.isValid
      ? `session count ${sessionsCountValidationResults.sessionsCount} is invalid`
      : '';
    const invalidQuantityItemNames = !quantityItemValidationResults.isValid
      ? `quantity item(s) ${quantityItemValidationResults.invalidQuantityItems
          .map(quantityItem => quantityItem.name)
          .join(',')}`
      : '';
    const invalidDonationItemNames = !donationItemValidationResults.isValid
      ? `donation item(s) ${donationItemValidationResults.invalidDonationItems
          .map(donationItem => donationItem.name)
          .join(',')}`
      : '';
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (admissionItem && admissionItem.name) {
      LOG.info(`Admission Item ${admissionItem.name} is not valid for:
      ${invalidSessionNames} ${invalidSessionGroupNames} ${invalidSessionCount} ${overlappingSessionCount}
      ${invalidQuantityItemNames} ${invalidDonationItemNames}`);
    }
  }
  return {
    isValid,
    newAdmissionItem: admissionItem,
    sessionsValidationResults,
    sessionGroupValidationResults,
    sessionsCountValidationResults,
    sessionOverlapValidationResults,
    advancedRuleValidationResults,
    airRequestAdvancedRuleValidationResults,
    hotelBookingValidationResults,
    hotelBookingAdvancedRuleValidationResults,
    quantityItemValidationResults,
    quantityItemAdvancedRuleValidationResults,
    donationItemValidationResults,
    includedSessionWaitlistValidationResults,
    sessionWaitlistValidationResults
  };
}

/**
 * Validates the current registrants cart for a given parent custom contact field selected choices.
 * The results returned indicate if the cart is still valid for selected parent custom field choices,
 * and if not, which items are invalid. This is useful to determine if a newly selected choices
 * causes an invalid cart.
 *
 * @param {*} state The state containing the current registrant
 * @param {*} customFieldId The contact custom field id to validate against the cart.
 * @param {*} answer The contact custom field choices to validate against the cart.
 */
export function validateContactCustomFieldChoiceChange(
  state: $TSFixMe,
  customFieldId: $TSFixMe,
  answer: $TSFixMe,
  onGuestPage: $TSFixMe
): $TSFixMe {
  const contactCustomFieldChoiceValidationResults = validateContactCustomFieldChoices(
    state,
    customFieldId,
    answer,
    onGuestPage
  );
  return {
    isValid: contactCustomFieldChoiceValidationResults.isValid,
    customFieldId,
    answer,
    contactCustomFieldChoiceValidationResults
  };
}

/**
 * Validates whether all child custom field choices that has advance link logic is valid for the
 * given parent custom field.
 * This takes into account the registrants past registration if they are performing a modification.
 */
function validateContactCustomFieldChoices(state, customFieldId, answer, onGuestPage) {
  const updatedContactCustomFields = [{ questionId: customFieldId, answer }];
  let customField;
  const invalidChildContactCustomFields = [];
  while (updatedContactCustomFields.length > 0) {
    customField = updatedContactCustomFields.shift();
    const customFields = [...validateChildCustomFieldChoicesByParentChoices(state, customField, onGuestPage)];
    if (customFields) {
      invalidChildContactCustomFields.push(...customFields);
      updatedContactCustomFields.push(...customFields);
    }
  }
  return {
    isValid: !invalidChildContactCustomFields.length,
    invalidChildContactCustomFields
  };
}

/**
 * Validates whether the child custom field choices that has advance link logic is valid for the
 * given parent custom field choices.
 * This takes into account the registrants past registration if they are performing a modification.
 */
function validateChildCustomFieldChoicesByParentChoices(state, parentCustomField, onGuestPage) {
  const invalidChildContactCustomFields = [];
  const childContactCustomFieldsMetadata = getChildCustomFieldsByParentCustomFieldId(
    state,
    parentCustomField.questionId
  );
  if (childContactCustomFieldsMetadata && childContactCustomFieldsMetadata.length > 0) {
    childContactCustomFieldsMetadata.forEach(ccf => {
      const selectedValues = getValues(
        (onGuestPage ? getCurrentGuestCustomFieldAnswer : getAttendeeCustomFieldAnswer)(state, ccf.question.id)
      );
      const previouslySelectedValues = getValues(
        (onGuestPage ? modificationStartForCurrentGuest : modificationStart).getAttendeeCustomFieldAnswer(
          state,
          ccf.question.id
        )
      );
      const allSelectedValues = uniq([...selectedValues, ...previouslySelectedValues]);
      const newFilteredChoices = getChoicesFilteredByLinkLogic(
        ccf.question,
        getValues(parentCustomField.answer),
        customFieldShouldUseChoiceIds(state.event, state.account)
      );
      const selectedValuesNotInChoices = allSelectedValues.filter(
        value => !newFilteredChoices.find(choice => choice.text === value)
      );
      if (selectedValuesNotInChoices.length) {
        const validFilteredValues = allSelectedValues.filter(value =>
          newFilteredChoices.find(choice => choice.text === value)
        );
        invalidChildContactCustomFields.push({
          questionId: ccf.question.id,
          answer:
            validFilteredValues && validFilteredValues.length > 0
              ? {
                  questionId: ccf.question.id,
                  answers: validFilteredValues.map(choice => ({ answerType: 'Choice', choice }))
                }
              : {
                  questionId: ccf.question.id,
                  answers: []
                }
        });
      }
    });
  }
  return invalidChildContactCustomFields;
}

/**
 * Validates whether the admission item is valid for the given registration type. This takes into account
 * the registrants past registration if they are performing a modification. No admission item
 * selected is considered valid to account for the case where it has not been selected yet.
 */
function validateAdmissionItem(state, registrationTypeId, admissionItem, eventRegistrationId) {
  let registeredAdmissionItem;
  if (!eventRegistrationId) {
    registeredAdmissionItem = modificationStart.getRegisteredAdmissionItem(state);
  } else {
    const modificationStartRegCart = getModificationStartRegCart(state);
    registeredAdmissionItem =
      modificationStartRegCart && getSelectedAdmissionItemRegCart(modificationStartRegCart, eventRegistrationId);
  }
  const isValid =
    !admissionItem || admissionItemIsVisible(registrationTypeId, admissionItem, { registeredAdmissionItem });
  return { isValid, admissionItem };
}

/**
 * Validates whether the guest registrations are allowed for registration path
 * associated to given registration type and if all the guests selected regType is allowed
 * on new path
 */
function validateGuestRegistrations(state, registrationTypeId, previousRegistrationTypeId) {
  let currentRegPathAllowsGuestRegistration;
  if (previousRegistrationTypeId) {
    currentRegPathAllowsGuestRegistration = allowsGuestRegistration(
      state,
      getAssociatedRegistrationPathId(state, previousRegistrationTypeId)
    );
  } else {
    currentRegPathAllowsGuestRegistration = allowsGuestRegistration(state, getRegistrationPathId(state));
  }
  let isValid = true;
  let invalidGuestRegistrations = [];
  if (currentRegPathAllowsGuestRegistration) {
    const currentEventRegistrationId = getEventRegistrationId(state);
    const currentRegistrantGuests = getGuestsOfRegistrant(getRegCart(state), currentEventRegistrationId);
    const currentRegistrantGuestCount = currentRegistrantGuests.length;
    const newRegPathId = getAssociatedRegistrationPathId(state, registrationTypeId);
    const newRegPathAllowsGuestRegistration = allowsGuestRegistration(state, newRegPathId);
    const isGuestRegistrationTypeSelectionEnabledOnNewPath = getSiteEditorRegistrationPath(state, newRegPathId)
      .guestRegistrationSettings.isGuestRegistrationTypeSelectionEnabled;

    const newRegPathGuestRegistrationSettings = getGuestRegistrationTypeSettings(state, newRegPathId);

    invalidGuestRegistrations =
      newRegPathAllowsGuestRegistration && isGuestRegistrationTypeSelectionEnabledOnNewPath
        ? currentRegistrantGuests.filter(guestEventReg => {
            const guestRegType = guestEventReg.registrationTypeId;
            if (newRegPathGuestRegistrationSettings.limitVisibility) {
              return !newRegPathGuestRegistrationSettings.categorizedRegistrationTypes.includes(guestRegType);
            }
          })
        : [];
    isValid =
      !(currentRegistrantGuestCount > 0) ||
      (newRegPathAllowsGuestRegistration && !(invalidGuestRegistrations.length > 0));
  }
  return { isValid, guestCount: 0, invalidGuestRegistrations };
}

/**
 * Validates the current registrants sessions for the given Registration Type and Admission Item.
 * This takes into account the registrants past registration if they are performing a modification.
 *
 * Note: The associated sessions of a prior admission item is taken into account when checking
 * whether it is valid because when the new admission item is selected associated sessions of
 * the original admission item are automatically removed.
 *
 * Note: The associated session of a current session bundle is NOT taken into account because the
 * session was registered through a parent product and we still needs to keep it as registered, even
 * though that session may not have visibility due to current admission item session limitation.
 */
function validateSessions(state, registrationTypeId, admissionItem, originalAdmissionItem, eventRegistrationId) {
  let selectedSessions;
  let registeredSessions;
  let guest = false;
  if (!eventRegistrationId) {
    selectedSessions = getSelectedSessionDefinitions(state);
    registeredSessions = modificationStart.getRegisteredSessions(state);
  } else {
    const regCart = getRegCart(state);
    const sessions = getFlattenedSessions(state);
    const sessionsSelectedByRegistrant = getRegisteredSessionsSourceTypeNotWithSessionBundle(
      regCart,
      eventRegistrationId
    );
    selectedSessions = sessions.filter(session => has(sessionsSelectedByRegistrant, session.id));
    const modificationStartRegCart = getModificationStartRegCart(state);
    registeredSessions = modificationStartRegCart && getSessionsRegCart(modificationStartRegCart, eventRegistrationId);
    guest = isGuest(regCart, eventRegistrationId);
  }
  const primaryRegistrationTypeId = getRegistrationTypeId(state);
  /*
   * If we are running validations for the guest, whether or not session selection is allowed should be based
   *on the primary's reg path
   */
  const newRegPathId = !guest
    ? getAssociatedRegistrationPathId(state, registrationTypeId)
    : getAssociatedRegistrationPathId(state, primaryRegistrationTypeId);
  const regPathAllowsSessionSelection = allowsSessionSelection(state, newRegPathId);
  const alwaysCheckAdmissionItemAvailability = getIn(state, [
    'experiments',
    'alwaysCheckAdmissionItemAvailabilityOfSession'
  ]);
  const invalidSessions = selectedSessions.filter(session => {
    if (sessionIsAssociatedToAdmissionItem(originalAdmissionItem, session)) {
      return false;
    }
    return !sessionIsRegisterable(registrationTypeId, admissionItem, session, {
      registeredSessions,
      regPathAllowsSessionSelection,
      alwaysCheckAdmissionItemAvailability
    });
  });

  return { isValid: !invalidSessions.length, invalidSessions };
}

function validateAdvancedSessionRules(state, eventRegistrationId, registrationTypeId, admissionItem?) {
  if (!admissionItem) {
    return { isValid: true };
  }

  const advancedSessionRules = getAdvancedSessionRules(state);
  const regCart = getRegCart(state);
  const selectedSessions = getSelectedSessions(regCart, eventRegistrationId);

  return {
    isValid: speculativelyValidateSessionAdvancedRules(
      advancedSessionRules,
      registrationTypeId,
      admissionItem,
      selectedSessions
    )
  };
}
/**
 * Validates the current registrant selected a session within a required session groups
 * for the given Registration Type and Admission Item.
 * This takes into account the registrants past registration if they are performing a modification.
 * This does not throw error if the page that contains session widget have not been visited.
 *
 */
async function validateSessionGroups(state, registrationTypeId, admissionItem, eventRegistrationId, apolloClient) {
  const isSessionsWidgetReviewed = await isWidgetReviewed(state, { widgetType: 'Sessions' }, apolloClient);
  if (!isSessionsWidgetReviewed) {
    return {
      isValid: true,
      invalidSessionGroups: []
    };
  }
  let selectedSessions;
  let registeredSessions;
  if (!eventRegistrationId) {
    selectedSessions = getSelectedSessionDefinitions(state);
    registeredSessions = modificationStart.getRegisteredSessions(state);
  } else {
    const regCart = getRegCart(state);
    const sessions = getPrimaryAndGuestSortedVisibleSessions(state);
    const sessionsSelectedByRegistrant = getSelectedSessions(regCart, eventRegistrationId);
    selectedSessions = sessions.filter(session => has(sessionsSelectedByRegistrant, session.id));
    const modificationStartRegCart = getModificationStartRegCart(state);
    registeredSessions = getSessionsRegCart(modificationStartRegCart, eventRegistrationId);
  }
  const sessionGroups = getSessionGroups(state);
  // get a list of visible session groups
  const visibleSessionGroups = pickBy(sessionGroups, sessionGroup => {
    return sessionGroupIsVisible(sessionGroup, {
      registeredSessions,
      sessions: sessionGroup.sessions
    });
  });
  // filter the session groups based on available sessions within the group
  const availableSessionGroups = map(visibleSessionGroups, sessionGroup => {
    const visibleSessions = pickBy(sessionGroup.sessions, session => {
      return sessionIsVisible(registrationTypeId, admissionItem, session, { registeredSessions });
    });
    return isEmpty(visibleSessions) ? sessionGroup : { ...sessionGroup, visibleSessions };
  }).filter(sessionGroup => sessionGroup.sessions);
  // check if required session groups has selection
  const missingSelectedForRequiredSessionGroups = availableSessionGroups.filter(sessionGroup => {
    if (sessionGroup.isSessionSelectionRequired) {
      if (isEmpty(intersectionBy(map(sessionGroup.sessions), selectedSessions, 'id'))) {
        return sessionGroup;
      }
    }
  });
  return {
    isValid: isEmpty(missingSelectedForRequiredSessionGroups),
    invalidSessionGroups: missingSelectedForRequiredSessionGroups
  };
}

/**
 * Validates the current registrants session count will be valid for the given admission item. The validation
 * is only run if the SessionsWidget appears on a page before the AdmissionItemWidget so it does not cause
 * the validation to trip not allowing the user to move forward.
 *
 * Note: The session count is only derived from sessions the user actively selected. This excludes
 * included sessions and sessions associated with the Admission Item. The sessions associated
 * with a prior admission item are also excluded since they will be removed from the cart automatically
 * once the new admission item is selected
 */
function validateSessionsCount(
  state,
  registrationTypeId,
  admissionItem,
  originalAdmissionItem,
  eventRegistrationId,
  sessionsAppearOnPageBeforeAdmissionItems
) {
  let selectedSessions;
  let registeredSessions;
  if (!eventRegistrationId) {
    selectedSessions = getSelectedSessionDefinitions(state);
    registeredSessions = modificationStart.getRegisteredSessions(state);
  } else {
    const regCart = getRegCart(state);
    const sessions = values(getPrimaryAndGuestSortedVisibleSessions(state));
    const sessionsSelectedByRegistrant = getSelectedSessions(regCart, eventRegistrationId);
    selectedSessions = sessions.filter(session => has(sessionsSelectedByRegistrant, session.id));
    const modificationStartRegCart = getModificationStartRegCart(state);
    registeredSessions = getSessionsRegCart(modificationStartRegCart, eventRegistrationId);
  }
  const registrantSelectedSessions = selectedSessions.filter(session => {
    return (
      sessionIsVisible(registrationTypeId, admissionItem, session, { registeredSessions }) &&
      !sessionIsAssociatedToAdmissionItem(admissionItem, session) &&
      !sessionIsAssociatedToAdmissionItem(originalAdmissionItem, session)
    );
  });
  const selectedSessionsCount = registrantSelectedSessions.length;
  if (!admissionItem || !sessionsAppearOnPageBeforeAdmissionItems) {
    return {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: selectedSessionsCount,
      minSessionCount: 0
    };
  }

  const isBelowSessionCount = admissionItem.minimumNumberOfSessionsToSelect > selectedSessionsCount;
  const isAboveSessionCount =
    admissionItem.maximumNumberOfSessionsToSelect &&
    admissionItem.maximumNumberOfSessionsToSelect < selectedSessionsCount;
  return {
    isValid: !(isBelowSessionCount || isAboveSessionCount),
    isBelowSessionCount,
    isAboveSessionCount,
    sessionsCount: selectedSessionsCount,
    minSessionCount: admissionItem.minimumNumberOfSessionsToSelect,
    maxSessionCount: admissionItem.maximumNumberOfSessionsToSelect
  };
}

/**
 * Validates the current registrants session overlap.
 * The validation is only run if the SessionsWidget appears on a page before the AdmissionItemWidget so it
 * does not cause the validation to trip not allowing the user to move forward.
 */
function validateSessionOverlap(state, admissionItem, eventRegistrationId, sessionsAppearOnPageBeforeAdmissionItems) {
  let selectedSessions;
  const sessions = getFlattenedSessions(state);
  if (!eventRegistrationId) {
    selectedSessions = getSelectedSessionDefinitions(state);
  } else {
    const regCart = getRegCart(state);
    const sessionsSelectedByRegistrant = getSelectedSessions(regCart, eventRegistrationId);
    selectedSessions = sessions.filter(session => has(sessionsSelectedByRegistrant, session.id));
  }
  const admissionItemSessions = sessions.filter(session => {
    return sessionIsAssociatedToAdmissionItem(admissionItem, session);
  });
  if (admissionItemSessions) {
    selectedSessions = [...selectedSessions, ...admissionItemSessions];
  }

  if (!sessionsAppearOnPageBeforeAdmissionItems) {
    return {
      isValid: true,
      overlapCount: 0
    };
  }

  let overlapCount = 0;
  let result;
  const optionalSessions = [];
  each(selectedSessions, session => {
    if (!session.isIncludedSession) {
      optionalSessions.push(session);
    }
  });
  // eslint-disable-next-line prefer-const
  result = overlap(optionalSessions || []);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (result && result.overlap) {
    overlapCount++;
  }

  return {
    isValid: overlapCount === 0,
    overlapCount
  };
}

/**
 * get validations from reg cart or travel cart errors
 */
export function getIdConfirmationValidationsFromCartError(state: $TSFixMe, cartError: $TSFixMe): $TSFixMe {
  const invalidSessionIds = productErrors.getInvalidSessionIds(cartError);
  const invalidSessions = getFlattenedSessions(state).filter(session => invalidSessionIds.includes(session.id));
  const invalidSessionGroups = Object.values(getSessionGroups(state)).filter(session =>
    invalidSessionIds.includes(session.id)
  );
  const admissionItemValidationResults = {
    isValid: !productErrors.isAdmissionItemInvalid(cartError),
    admissionItem: getSelectedAdmissionItem(state)
  };
  let sessionBundleValidationResults = { isValid: true, invalidSessionBundles: [] };
  const conflictSessionBundleParams = getUpdateErrors.getRegTypeConflictSessionBundleParams(cartError);
  if (conflictSessionBundleParams?.length > 0) {
    sessionBundleValidationResults = buildIdConfirmationDialogRegTypeConflictResults(conflictSessionBundleParams);
  }
  const sessionsValidationResults = { isValid: invalidSessions.length === 0, invalidSessions };
  const sessionGroupValidationResults = { isValid: invalidSessionGroups.length === 0, invalidSessionGroups };
  const groupRegistrationValidationResults = { isValid: !productErrors.isGroupRegistrationNotAllowed(cartError) };

  const invalidQuantityItemIds = productErrors.getInvalidQuanityItemIds(cartError);
  const invalidQuantityItems = values(getPrimarySortedVisibleQuantityItems(state)).filter(quantityItem =>
    invalidQuantityItemIds.includes(quantityItem.id)
  );
  const quantityItemValidationResults = { isValid: invalidQuantityItems.length === 0, invalidQuantityItems };

  const invalidDonationItemIds = productErrors.getInvalidDonationItemIds(cartError);
  const invalidDonationItems = values(getPrimarySortedVisibleDonationItems(state)).filter(donationItem =>
    invalidDonationItemIds.includes(donationItem.id)
  );
  const donationItemValidationResults = { isValid: invalidDonationItems.length === 0, invalidDonationItems };
  const invalidHotelRoomBookings = travelCartErrors.getInvalidHotelRoomBookings(state, cartError);
  const hotelBookingValidationResults = { isValid: invalidHotelRoomBookings.length === 0, invalidHotelRoomBookings };

  return {
    isValid:
      admissionItemValidationResults.isValid &&
      sessionsValidationResults.isValid &&
      sessionGroupValidationResults.isValid &&
      groupRegistrationValidationResults.isValid &&
      quantityItemValidationResults.isValid &&
      hotelBookingValidationResults.isValid &&
      donationItemValidationResults.isValid &&
      sessionBundleValidationResults.isValid,
    admissionItemValidationResults,
    sessionsValidationResults,
    sessionGroupValidationResults,
    sessionAdvancedRuleValidationResults: { isValid: true },
    guestRegistrationsValidationResults: { isValid: true, guestCount: 0 },
    airRequestValidationResults: { isValid: true },
    airRequestAdvancedRuleValidationResults: { isValid: true },
    hotelBookingValidationResults,
    hotelBookingAdvancedRuleValidationResults: { isValid: true },
    groupRegistrationValidationResults,
    quantityItemValidationResults,
    donationItemValidationResults,
    sessionBundleValidationResults
  };
}

function validateGroupRegistrations(state, regTypeId) {
  const regCart = getRegCart(state);
  const numberOfGroupMembers = getNumberOfGroupMembers(regCart);
  /*
   * if there are no group members, there will be no conflicts even if
   * the target reg path does not have group reg enabled.
   */
  if (numberOfGroupMembers === 0) {
    return {
      isValid: true
    };
  }
  const associatedRegPathId = getAssociatedRegistrationPathId(state, regTypeId);
  const hasGroupRegEnabled = isGroupRegistrationEnabled(state, associatedRegPathId);
  return {
    isValid: hasGroupRegEnabled
  };
}

/**
 * Validates the current registrants quantity items for the given Registration Type and Admission Item.
 * This takes into account the registrants past registration if they are performing a modification.
 */
function validateQuantityItems(state, registrationTypeId, admissionItem, eventRegistrationId) {
  let selectedQuantityItems;
  let selectedQuantityItemDefinitions;
  let registeredQuantityItems;
  let guest = false;
  const isRegMod = isRegistrationModification(state);

  if (!eventRegistrationId) {
    selectedQuantityItemDefinitions = getSelectedQuantityItemDefinitions(state);
    selectedQuantityItems = getSelectedQuantityItems(state);
    registeredQuantityItems = modificationStart.getRegisteredQuantityItems(state);
  } else {
    const regCart = getRegCart(state);
    const quantityItems = values(getPrimarySortedVisibleQuantityItems(state));
    selectedQuantityItems = getQuantityItemsRegCart(regCart, eventRegistrationId);
    selectedQuantityItemDefinitions = quantityItems.filter(q => has(selectedQuantityItems, q.id));
    const modificationStartRegCart = getModificationStartRegCart(state);
    registeredQuantityItems =
      modificationStartRegCart && getQuantityItemsRegCart(modificationStartRegCart, eventRegistrationId);
    guest = isGuest(regCart, eventRegistrationId);
  }
  // guests don't have quantity items
  if (guest) {
    return { isValid: true, invalidQuantityItems: [] };
  }

  const newRegPathId = getAssociatedRegistrationPathId(state, registrationTypeId);
  const regPathAllowsQuantityItemSelection = allowsQuantityItemSelection(state, newRegPathId);
  const invalidQuantityItemCounts = {};
  const invalidQuantityItems = selectedQuantityItemDefinitions.filter(quantityItem => {
    /**
     * During mod, if they have changed their admission item that no longer has visibility
     * to a previously registered quantity item, check to see if they upped the amount
     * and add it to the list of invalidQuantity items
     */
    if (
      isRegMod &&
      (!optionalItemIsVisibleForRegistrationType(registrationTypeId, quantityItem) ||
        !optionalItemIsVisibleForAdmissionItem(admissionItem, quantityItem))
    ) {
      const registeredQuantity =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        registeredQuantityItems &&
        registeredQuantityItems[quantityItem.id] &&
        registeredQuantityItems[quantityItem.id].quantity;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const currentQuantity = selectedQuantityItems[quantityItem.id] && selectedQuantityItems[quantityItem.id].quantity;
      // if currentQuantity is more add it to the list of items to be set back to registered amount
      if (currentQuantity > registeredQuantity) {
        invalidQuantityItemCounts[quantityItem.id] = registeredQuantity;
      }
    }

    return (
      !quantityItemIsVisible(registrationTypeId, admissionItem, quantityItem, {
        registeredQuantityItems,
        regPathAllowsQuantityItemSelection
      }) || !!invalidQuantityItemCounts[quantityItem.id]
    );
  });

  return { isValid: !invalidQuantityItems.length, invalidQuantityItems, invalidQuantityItemCounts };
}

function validateAdvancedQuantityItemRules(state, registrationTypeId, admissionItem, eventRegistrationId) {
  if (!admissionItem) {
    return { isValid: true };
  }
  let guest = false;
  if (eventRegistrationId) {
    const regCart = getRegCart(state);
    guest = isGuest(regCart, eventRegistrationId);
  }
  // guests don't have quantity items
  if (guest) {
    return { isValid: true };
  }
  const advancedQuantityItemRules = getAdvancedQuantityItemRules(state);
  const selectedQuantityItems = Object.values(getSelectedQuantityItems(state));

  return {
    isValid: speculativelyValidateQuantityItemAdvancedRules(
      advancedQuantityItemRules,
      registrationTypeId,
      admissionItem,
      selectedQuantityItems
    )
  };
}

async function validateAdvancedQuantityItemRulesForRegTypeSelection(
  state,
  registrationTypeId,
  admissionItem,
  eventRegistrationId,
  apolloClient
) {
  const quantityItemsBeforeRegistrationType = await quantityItemsAppearOnPageBeforeRegistrationType(
    state,
    apolloClient
  );
  if (!quantityItemsBeforeRegistrationType) {
    // Don't enforce rules yet, because the user will go through quantity item selection on a later page
    return { isValid: true };
  }
  return validateAdvancedQuantityItemRules(state, registrationTypeId, admissionItem, eventRegistrationId);
}

async function validateAdvancedQuantityItemRulesForAdmissionItemSelection(
  state,
  registrationTypeId,
  admissionItem,
  eventRegistrationId,
  apolloClient
) {
  const quantityItemsBeforeAdmissionItems = await quantityItemsAppearOnPageBeforeAdmissionItems(state, apolloClient);
  if (!quantityItemsBeforeAdmissionItems) {
    // Don't enforce rules yet, because the user will go through quantity item selection on a later page
    return { isValid: true };
  }
  return validateAdvancedQuantityItemRules(state, registrationTypeId, admissionItem, eventRegistrationId);
}

/**
 * Validates the current registrants donation items for the given Registration Type and Admission Item.
 */
function validateDonationItems(state, registrationTypeId, admissionItem, eventRegistrationId) {
  let selectedDonationItemDefinitions;
  if (!eventRegistrationId) {
    selectedDonationItemDefinitions = getSelectedDonationItemDefinitions(state);
  } else {
    const regCart = getRegCart(state);
    const donationItems = values(getPrimarySortedVisibleDonationItems(state));
    const selectedDonationItems = getDonationItemsRegCart(regCart, eventRegistrationId);
    selectedDonationItemDefinitions = donationItems.filter(donationItem => has(selectedDonationItems, donationItem.id));
  }
  const newRegPathId = getAssociatedRegistrationPathId(state, registrationTypeId);
  const regPathAllowsDonationItemSelection = allowsDonationItemSelection(state, newRegPathId);
  const isRegistrationApprovalRequired = isRegApprovalRequired(getRegCart(state));
  const isPlanner = isPlannerRegistration(state);
  let invalidDonationItems = selectedDonationItemDefinitions.filter(donationItem => {
    return !donationItemIsVisible(registrationTypeId, admissionItem, donationItem, {
      regPathAllowsDonationItemSelection
    });
  });

  if (!isPlanner && isRegistrationApprovalRequired) {
    const donationsToRemove = invalidDonationItems
      .filter(donationItem => {
        return !optionalItemIsVisibleForAdmissionItem(admissionItem, donationItem);
      })
      .map(donationItem => donationItem.id);

    invalidDonationItems = invalidDonationItems.filter(invalidItem => has(donationsToRemove, invalidItem.id));
  }

  return { isValid: !invalidDonationItems.length, invalidDonationItems };
}

/**
 * Validates if sessions include in new selection were waitlisted with original admissionitem in planner reg
 */
function validateIncludedSessionWaitisted(state, admissionItem, eventRegistrationId) {
  const isPlanner = isPlannerRegistration(state);
  const regCart = getRegCart(state);
  const selectedWaitlistedSession = values(getSelectedWaitlistedSessions(regCart, eventRegistrationId)).map(session => {
    return { id: session.productId };
  });
  const invalidWaitlistedSession = selectedWaitlistedSession.filter(session => {
    return isPlanner && sessionIsAssociatedToAdmissionItem(admissionItem, session);
  });

  return { isValid: !invalidWaitlistedSession.length, invalidWaitlistedSession };
}

/**
 * Validates if selected wailisted sessions are valid with current selected admission item
 */
function validateWaitlistedSession(state, admissionItem, eventRegistrationId) {
  const regCart = getRegCart(state);
  const selectedWaitlistedSession = values(getSelectedWaitlistedSessions(regCart, eventRegistrationId)).map(session => {
    return { id: session.productId };
  });
  const invalidWaitlistedSession = selectedWaitlistedSession.filter(session => {
    return !sessionIsVisibleForAdmissionItem(admissionItem, session);
  });

  return { isValid: !invalidWaitlistedSession.length, invalidWaitlistedSession };
}
