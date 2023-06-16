import { some, values, pickBy, uniqBy } from 'lodash';
import { getIn } from 'icepick';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import Logger from '@cvent/nucleus-logging';
import { REQUESTED_ACTIONS, REGISTRATION_SOURCE_TYPES } from 'event-widgets/constants/Request';

const LOG = new Logger('RegCartSelectors');

export const getEventRegistrations = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (regCart && regCart.eventRegistrations) || {};
};

export const hasTravel = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (regCart && regCart.hasTravel) || false;
};

export const getEventRegistration = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  if (eventRegistrationId) {
    const eventRegistration = getEventRegistrations(regCart);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return eventRegistration && eventRegistration[eventRegistrationId];
  }
  return undefined;
};

export const isWaitlistCart = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (regCart && regCart.regWaitList) || false;
};

export const getAttendee = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return eventRegistration && eventRegistration.attendee;
};

export const getAttendeeId = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const attendee = getAttendee(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return attendee && attendee.attendeeId;
};

export const getAttendeePersonalInformation = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const attendee = getAttendee(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return attendee && attendee.personalInformation;
};

export const getAdminPersonalInformation = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return regCart && regCart.admin;
};

export const hasAttendeeWithEmailAddress = (regCart: $TSFixMe, emailAddress: $TSFixMe): $TSFixMe => {
  return some(getEventRegistrations(regCart), eventReg => {
    const existingEmail = getIn(eventReg, ['attendee', 'personalInformation', 'emailAddress']);
    if (existingEmail) {
      return existingEmail.toLowerCase() === emailAddress.toLowerCase();
    }
    return false;
  });
};

export const getAttendeeStandardFieldAnswer = (
  regCart: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  fieldPath: $TSFixMe
): $TSFixMe => {
  const personalInformation = getAttendeePersonalInformation(regCart, eventRegistrationId);
  if (!personalInformation) {
    return undefined;
  }
  return Array.isArray(fieldPath) ? getIn(personalInformation, fieldPath) : personalInformation[fieldPath];
};

export const getAttendeeCustomFieldAnswers = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const personalInformation = getAttendeePersonalInformation(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (personalInformation && personalInformation.customFields) || {};
};

export const getAttendeeCustomFieldAnswer = (
  regCart: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  customFieldId: $TSFixMe
): $TSFixMe => {
  return getAttendeeCustomFieldAnswers(regCart, eventRegistrationId)[customFieldId];
};

export const getAttendeeQuestionAnswers = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const attendee = getAttendee(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (attendee && attendee.eventAnswers) || {};
};

export const getAttendeeQuestionAnswer = (
  regCart: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  questionId?: $TSFixMe
): $TSFixMe => {
  return getAttendeeQuestionAnswers(regCart, eventRegistrationId)[questionId];
};

export const getProducts = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventRegistration && eventRegistration.productRegistrations) || [];
};

export const getRegistrationTypeId = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventRegistration && eventRegistration.registrationTypeId) || defaultRegistrationTypeId;
};

export const getRegistrationPathId = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  if (!eventRegistration) {
    throw new Error(`no event registration with id of current event registration ${eventRegistrationId}`);
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return eventRegistration && eventRegistration.registrationPathId;
};

const addProduct = (products, product) => {
  return { ...products, [product.productId]: product };
};

export const getAdmissionItems = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const productRegistrations = getProducts(regCart, eventRegistrationId);
  return productRegistrations.filter(product => product.productType === 'AdmissionItem').reduce(addProduct, {});
};

export const getSelectedAdmissionItem = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const admissionItems = values(getAdmissionItems(regCart, eventRegistrationId)).filter(
    product => product.requestedAction === REQUESTED_ACTIONS.REGISTER
  );
  if (admissionItems.length > 1) {
    // Ignore issue with regCartId being unknown field to work with created regCarts.
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = regCart && regCart.regCartId;
    const regCartMessage = regCartId ? `RegCartId: ${regCartId}` : 'Occurred Prior to RegCart creation';
    LOG.error(`An attempt to get the regCarts selected Admission Item resulted in two admission items being present
      which is not allowed. ${regCartMessage}`);
  }
  return admissionItems[0];
};

export const getMultipleSelectedAdmissionItems = (regCart: $TSFixMe): $TSFixMe => {
  const eventRegistrationIds = Object.keys(getEventRegistrations(regCart));
  const admissionItems = [];
  eventRegistrationIds.forEach(eventRegistrationId => {
    const admissionItem = getSelectedAdmissionItem(regCart, eventRegistrationId);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (admissionItem && admissionItem.productId) {
      admissionItems.push(admissionItem);
    }
  });
  return uniqBy(admissionItems, admissionItem => admissionItem.productId);
};

export const getUnSelectedAdmissionItem = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const admissionItems = values(getAdmissionItems(regCart, eventRegistrationId)).filter(
    product => product.requestedAction === REQUESTED_ACTIONS.UNREGISTER
  );
  if (admissionItems.length > 1) {
    // Ignore issue with regCartId being unknown field to work with created regCarts.
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = regCart && regCart.regCartId;
    const regCartMessage = regCartId ? `RegCartId: ${regCartId}` : 'Occurred Prior to RegCart creation';
    LOG.error(`An attempt to get the regCarts selected Admission Item resulted in two admission items being present
      which is not allowed. ${regCartMessage}`);
  }
  return admissionItems[0];
};

export const getSessions = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventRegistration && eventRegistration.sessionRegistrations) || {};
};

export const getSessionBundles = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  return eventRegistration?.sessionBundleRegistrations ?? {};
};

export const getQuantityItems = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventRegistration && eventRegistration.quantityItemRegistrations) || {};
};

export const getDonationItems = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventRegistration && eventRegistration.donationItemRegistrations) || {};
};

export const getWaitlistSessions = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventRegistration && eventRegistration.sessionWaitlists) || {};
};

export const getSelectedSessions = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const allSessions = (eventRegistration && eventRegistration.sessionRegistrations) || {};
  return pickBy(allSessions, session => session.requestedAction === REQUESTED_ACTIONS.REGISTER);
};

export const getRegisteredSessionsSourceTypeNotWithSessionBundle = (
  regCart: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const allSessions = (eventRegistration && eventRegistration.sessionRegistrations) || {};
  return pickBy(
    allSessions,
    session =>
      session.requestedAction === REQUESTED_ACTIONS.REGISTER &&
      session.registrationSourceType !== REGISTRATION_SOURCE_TYPES.SESSION_BUNDLE
  );
};

export const getUnRegisteredSessions = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const allSessions = (eventRegistration && eventRegistration.sessionRegistrations) || {};
  return pickBy(allSessions, session => session.requestedAction === REQUESTED_ACTIONS.UNREGISTER);
};

export const getSelectedWaitlistedSessions = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const allSessions = (eventRegistration && eventRegistration.sessionWaitlists) || {};
  return pickBy(allSessions, session => session.requestedAction === REQUESTED_ACTIONS.WAITLIST);
};

export const getUnSelectedWaitlistedSessions = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const allSessions = (eventRegistration && eventRegistration.sessionWaitlists) || {};
  return pickBy(allSessions, session => session.requestedAction === REQUESTED_ACTIONS.LEAVE_WAITLIST);
};

export const getConfirmationNumber = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventRegistration = getEventRegistration(regCart, eventRegistrationId);
  /*
   * The only time this has a confirmation number is with the PostCheckoutRegCart so it yells
   * that this doesn't exist. Since we are returning optional string this shouldn't be a problem
   * and lets all versions of the regcart use this option.
   */
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return eventRegistration && eventRegistration.confirmationNumber;
};

export const isRegistrationModification = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return !!(regCart && regCart.regMod);
};

export const isRegistrationCancellation = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return !!(regCart && regCart.regCancel);
};

export const isRegApprovalRequired = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return !!(regCart && regCart.registrationApprovalRequired);
};

export const isNewRegistration = (regCart: $TSFixMe): $TSFixMe => {
  return (
    regCart &&
    !regCart.regMod &&
    !regCart.regCancel &&
    !regCart.regDecline &&
    !regCart.regWaitList &&
    !regCart.regRetrieval
  );
};

export const doesRegCartExist = (regCart: $TSFixMe): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return !!(regCart && regCart.regCartId);
};

export const getPrimaryRegistrationId = (regCart: $TSFixMe): $TSFixMe => {
  const eventRegistrationIds = Object.keys(getEventRegistrations(regCart));
  const groupLeaderRegistrationId = eventRegistrationIds.find(eventRegId =>
    regCart.eventRegistrations[eventRegId].attendeeType
      ? regCart.eventRegistrations[eventRegId].attendeeType === 'GROUP_LEADER'
      : false
  );
  if (groupLeaderRegistrationId) {
    return groupLeaderRegistrationId;
  }
  /*
   * Need to check for attendee type registrations,
   * so that guest type registrations are not considered primary registrant.
   */
  const attendeeRegistrationId = eventRegistrationIds.find(eventRegId =>
    regCart.eventRegistrations[eventRegId].attendeeType
      ? regCart.eventRegistrations[eventRegId].attendeeType === 'ATTENDEE'
      : false
  );
  if (attendeeRegistrationId) {
    return attendeeRegistrationId;
  }
  return eventRegistrationIds.length > 0 ? eventRegistrationIds[0] : undefined;
};

/**
 * Returns the Group Leader Id if group registration is on else returns null
 * @param regCart
 * @returns {null|*}
 */
export const getGroupLeaderAttendeeId = (regCart: $TSFixMe): $TSFixMe => {
  if (regCart.groupRegistration) {
    return getAttendeeId(regCart, getPrimaryRegistrationId(regCart));
  }
  return undefined;
};

export const getGuestsOfRegistrant = (
  regCart: $TSFixMe,
  registrantId: $TSFixMe,
  requestedAction = REQUESTED_ACTIONS.REGISTER
): $TSFixMe => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (regCart && regCart.eventRegistrations) {
    let filteredGuests = Object.values(regCart.eventRegistrations).filter(
      eventRegistration =>
        (eventRegistration as $TSFixMe).attendeeType === 'GUEST' &&
        (eventRegistration as $TSFixMe).primaryRegistrationId === registrantId
    );
    if (requestedAction) {
      filteredGuests = filteredGuests.filter(eventRegistration => {
        return (
          (eventRegistration as $TSFixMe).requestedAction &&
          (eventRegistration as $TSFixMe).requestedAction === requestedAction
        );
      });
    }
    return filteredGuests.sort(
      (first, second) => (first as $TSFixMe).displaySequence - (second as $TSFixMe).displaySequence
    );
  }
  return undefined;
};

export const getGuestsRegistrationIdsOfRegistrant = (
  regCart: $TSFixMe,
  registrantId: $TSFixMe,
  requestedAction = REQUESTED_ACTIONS.REGISTER
): $TSFixMe => {
  return (getGuestsOfRegistrant(regCart, registrantId, requestedAction) || []).map(g => g.eventRegistrationId);
};

/* Filter all invitees and / or guests who are counted towards discount capacity */
export const getRegistrantsCountedTowardsDiscountCapacity = (
  regCart: $TSFixMe,
  allowableEventRegistrationsForDiscountCapacityMap: $TSFixMe
): $TSFixMe => {
  const discountCapacityRegistrantsIds = Object.keys(allowableEventRegistrationsForDiscountCapacityMap);
  const filteredRegistrants = Object.values(regCart.eventRegistrations).filter(eventRegistration =>
    discountCapacityRegistrantsIds.includes((eventRegistration as $TSFixMe).eventRegistrationId)
  );
  return filteredRegistrants;
};

/* Filter all invitees and / or guests who are eligible for receiving the discount */
export const getRegistrantsEligibleForDiscount = (
  regCart: $TSFixMe,
  allowableEventRegistrationsForDiscountCapacityMap: $TSFixMe,
  eventRegId: $TSFixMe
): $TSFixMe => {
  const discountEligibleRegistrantsIds = Object.values(allowableEventRegistrationsForDiscountCapacityMap[eventRegId])
    .join()
    .split(',');
  return discountEligibleRegistrantsIds.sort(
    (first, second) => (first as $TSFixMe).displaySequence - (second as $TSFixMe).displaySequence
  );
};

/* Get the allowableEventRegistrationsForDiscountCapacityMap from the error object */
export const getAllowableEventRegistrationsForDiscountCapacityMap = (errors: $TSFixMe): $TSFixMe => {
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    errors &&
    errors.error &&
    errors.error.responseBody &&
    errors.error.responseBody.validationMessages &&
    errors.error.responseBody.validationMessages[0] &&
    errors.error.responseBody.validationMessages[0].allowableEventRegistrationsForDiscountCapacityMap
  );
};

/* Get the availableCapacity from the error object */
export const getAvailableCapacity = (errors: $TSFixMe): $TSFixMe => {
  const availableCapacity =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    errors &&
    errors.error &&
    errors.error.responseBody &&
    errors.error.responseBody.validationMessages &&
    errors.error.responseBody.validationMessages[0] &&
    errors.error.responseBody.validationMessages[0].parametersMap &&
    errors.error.responseBody.validationMessages[0].parametersMap.availableCapacity;
  return parseInt(availableCapacity, 10);
};

export const isGuest = (regCart: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const eventReg = getEventRegistration(regCart, eventRegistrationId);
  return (eventReg && eventReg.attendeeType === 'GUEST') || false;
};

/**
 * It's not as simple as counting the number of attendees.
 * @param {*} eventRegs
 */
export const getNumberOfGroupMembers = (regCart: $TSFixMe): $TSFixMe => {
  const eventRegs = getEventRegistrations(regCart);
  const countsByAttendeeType = Object.values(eventRegs).reduce((counts, eventReg) => {
    const attendeeType = (eventReg as $TSFixMe).attendeeType;

    return {
      // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
      ...counts,
      [attendeeType]: counts[attendeeType] ? counts[attendeeType] + 1 : 1
    };
  }, {});

  // Is or was in group reg scenario
  if ((countsByAttendeeType as $TSFixMe).GROUP_LEADER) {
    return (countsByAttendeeType as $TSFixMe).ATTENDEE || 0;
  }

  // Single reg, so far
  if ((countsByAttendeeType as $TSFixMe).ATTENDEE === 1) {
    return 0;
  }

  /*
   * Weird situation. No group members, multiple attendee. Indicates a leaderless group, but
   * we don't support that within the same reg cart so this should never come up.
   */
  return (countsByAttendeeType as $TSFixMe).ATTENDEE;
};

export const getPrimaryAttendee = (regCart: $TSFixMe): $TSFixMe => {
  return getAttendee(regCart, getPrimaryRegistrationId(regCart));
};

export const getPrimaryContactIdFromRegCart = (regCart: $TSFixMe): $TSFixMe => {
  return getAttendee(regCart, getPrimaryRegistrationId(regCart)).personalInformation.contactId;
};

export const isPlaceholderRegCart = (regCart?: $TSFixMe): $TSFixMe => {
  return regCart?.embeddedRegistration === true && regCart?.regCartId === '';
};
