/**
 * These selectors pertain to whoever is currently moving through registration. To shorten naming
 * these selectors do not mention the word current. It is ideal when importing this module to
 * import all as a collection. i.e "import * as currentRegistrant from './currentRegistrant'"
 *
 * At the moment the current registrant is just determined by choosing the first event registration.
 * this will need to change once group/guest registration is in place
 */
import { createSelector } from 'reselect';
import {
  defaultRegistrationTypeId,
  getVisibleRegistrationTypes as getVisibleRegistrationTypesUtil
} from 'event-widgets/utils/registrationType';
import {
  getEventRegistrations,
  getPrimaryRegistrationId,
  getGuestsOfRegistrant,
  getUnSelectedAdmissionItem,
  getAttendeePersonalInformation,
  getRegistrationPathId as getRegistrationPathIdFromRegCart,
  isRegistrationModification as isRegistrationModificationFromRegCart,
  isRegistrationCancellation as isRegistrationCancellationFromRegCart,
  isRegApprovalRequired as isRegApprovalRequiredFromRegCart,
  isNewRegistration as isNewRegistrationFromRegCart,
  doesRegCartExist as doesRegCartExistFromRegCart,
  getEventRegistration as getEventRegistrationFromRegCart,
  getAttendee as getAttendeeFromRegCart,
  getAttendeeId as getAttendeeIdFromRegCart,
  getAttendeeStandardFieldAnswer as getAttendeeStandardFieldAnswerFromRegCart,
  getAttendeeCustomFieldAnswer as getAttendeeCustomFieldAnswerFromRegCart,
  getAttendeeQuestionAnswer as getAttendeeQuestionAnswerFromRegCart,
  getAdminPersonalInformation as getAdminPersonalInformationFromRegCart,
  getAdmissionItems as getAdmissionItemsFromRegCart,
  getConfirmationNumber as getConfirmationNumberFromRegCart,
  getSelectedAdmissionItem as getSelectedAdmissionItemFromRegCart,
  getMultipleSelectedAdmissionItems as getAllEventRegSelectedAdmissionItem,
  getSelectedSessions as getSelectedSessionsFromRegCart,
  getSessions as getSessionsFromRegCart,
  getSelectedWaitlistedSessions as getSelectedSessionWaitlistsFromRegCart,
  getQuantityItems as getQuantityItemsFromRegCart,
  getDonationItems as getDonationItemsFromRegCart
} from '../registrationForm/regCart/selectors';
import { REGISTRATION_SOURCE_TYPES, REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import {
  getTravelCart,
  getTravelBooking as getTravelBookingForRegistrant,
  getHotelRoomBookings as getHotelRoomBookingsForRegistrant,
  getActivePasskeyBookings as getActivePasskeyBookingsForRegistrant
} from '../travelCart/selectors';
import { getRegCart, admissionItemIsVisible } from './shared';
import { getAdmissionItems as getAdmissionItemsFromEvent,
  getEventId, isPasskeyEnabled, getRegistrationTypeSettings as getRegistrationTypeSettingsFromEvent,
  getGuestRegistrationTypeSettings, getOptionalSessions, isAdmissionItemsEnabled,
  getAdmissionItem, getPersonalInformationModificationSetting } from './event';
import { getEventQuestionById, getSubQuestionsByParentQuestionId, getProductQuestion, getRegistrationPath }
  from 'event-widgets/redux/selectors/appData';
import { getRegistrationTypeIdFromUserSession } from '../userSession';
import { values, pickBy, get, isEmpty, filter, some, mapValues } from 'lodash';
import { getIn } from 'icepick';
import * as EventStatus from 'event-widgets/clients/EventStatus';
import * as fromAppData from 'event-widgets/redux/selectors/appData';
import { getTravelAnswerData, buildTravelQuestionAnswerPath,
  questionHasVisibilityLogic, createAnswer } from '../../utils/questionUtils';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import { REGISTRATION_TYPE_ID_FIELD_ID } from '@cvent/event-fields/fieldIds';
import { DATE_CHANGE_SUCCESS } from 'nucleus-core/forms/PickADateBase';
import { PRIVATE_ALL_TARGETED_LISTS, PRIVATE_LIMITED_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import StandardContactAddressSubFields from 'event-widgets/lib/StandardContactFields/StandardContactAddressSubFields';
import { ATTENDEE_TYPE_INVITEE_AND_GUEST } from 'event-widgets/lib/HotelRequest/utils/HotelRequestUtil';

export const getRegistrationTypes = (state) => {
  return getIn(state, ['event', 'registrationTypes']) || {};
};

export function getEventRegistrationId(stateOrRegistrationForm) {
  if (!stateOrRegistrationForm) {
    return undefined;
  }

  // Allow this function to take either the top-level state or the registrationForm property
  const registrationForm = (stateOrRegistrationForm && stateOrRegistrationForm.registrationForm)
    || stateOrRegistrationForm;

  const regCart = registrationForm && registrationForm.regCart;
  if (!regCart) {
    return undefined;
  }

  const eventRegistrationIds = Object.keys(getEventRegistrations(regCart));

  if (eventRegistrationIds.length === 1) {
    return eventRegistrationIds[0];
  }

  if (registrationForm.currentEventRegistrationId &&
      typeof registrationForm.currentEventRegistrationId === 'string') {
    return registrationForm.currentEventRegistrationId;
  }

  return getPrimaryRegistrationId(regCart);
}

/**
 * RegCart has associated event snapshot version. App should use that version whenever working with the cart.
 */
export const getRegCartEventSnapshotVersion = createSelector(
  getRegCart, getEventId, (regCart, eventId) => get(regCart, ['eventSnapshotVersions', eventId]));

export const isRegistrationModification = createSelector(getRegCart, isRegistrationModificationFromRegCart);

export const isRegistrationCancellation = createSelector(getRegCart, isRegistrationCancellationFromRegCart);

export const isRegApprovalRequired = createSelector(getRegCart, isRegApprovalRequiredFromRegCart);

export const isNewRegistration = createSelector(getRegCart, isNewRegistrationFromRegCart);

/**
 * returns true if regcart exists in the state and has an ID
 */
export const doesRegCartExist = createSelector(getRegCart, doesRegCartExistFromRegCart);

export const getModificationStartRegCart = (state) => {
  return isRegistrationModification(state)
    ? state.regCartStatus && state.regCartStatus.modificationStartRegCart
    : undefined;
};

export const getEventRegistration = createSelector(
  getRegCart, getEventRegistrationId, getEventRegistrationFromRegCart);

export const getAttendee = createSelector(getRegCart, getEventRegistrationId, getAttendeeFromRegCart);

export const getAttendeeId = createSelector(getRegCart, getEventRegistrationId, getAttendeeIdFromRegCart);

export const getAttendeeStandardFieldAnswer = (state, fieldPath) => {
  return getAttendeeStandardFieldAnswerFromRegCart(
    getRegCart(state),
    getEventRegistrationId(state),
    fieldPath);
};

export const getAttendeeCustomFieldAnswer = (state, customFieldId) => {
  return getAttendeeCustomFieldAnswerFromRegCart(
    getRegCart(state),
    getEventRegistrationId(state),
    customFieldId);
};

export const getCurrentGuestStandardFieldAnswer = (state, pathTokens) => {
  return getIn(state, [
    'registrationForm',
    'currentGuestEventRegistration',
    'attendee',
    'personalInformation',
    ...pathTokens]);
};

export const getCurrentGuestCustomFieldAnswer = (state, customFieldId) => {
  return getIn(state, [
    'registrationForm',
    'currentGuestEventRegistration',
    'attendee',
    'personalInformation',
    'customFields',
    customFieldId]);
};

export const getAttendeeQuestionAnswer = (state, questionId) => {
  return getAttendeeQuestionAnswerFromRegCart(
    getRegCart(state),
    getEventRegistrationId(state),
    questionId);
};

const defaultFileUploadAnswer = Object.freeze([]);
export const getFileUploadAnswer = (answer) => {
  const savedAnswer = answer && answer.answers && answer.answers.find(entry => entry.answerType === 'Text');
  const fileName = savedAnswer && savedAnswer.text;
  const uploads = { files: [{ fileName, path: savedAnswer ? savedAnswer.path : '' }] };
  return fileName ? uploads : defaultFileUploadAnswer;
};

export const getRegistrationTypeId = createSelector(
  getEventRegistration,
  getRegistrationTypeIdFromUserSession,
  (eventRegistration, initialRegistrationTypeId) =>
    (eventRegistration && eventRegistration.registrationTypeId) || initialRegistrationTypeId);

const getGuestDefaultRegTypeId = state => state.userSession.regTypeId;

export const isGroupRegistration = (state) => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['groupRegistration']) || false;
};

export const getAttendeeType = (state, eventRegistrationId) => {
  const eventReg = getEventRegistrationFromRegCart(getRegCart(state), eventRegistrationId);
  return eventReg && eventReg.attendeeType;
};

/**
 * Return whether current registrant is admin, with given regCart
 * Add isNewRegistration && admin here to handle invitee search delay in identifyByConfirm
 */
export const isAdminRegistrationFromRegCart = (regCart) => {
  return regCart?.isAdmin || isNewRegistrationFromRegCart(regCart) && !!regCart?.admin;
};

/**
 * Return whether current registrant is admin
 */
export const isAdminRegistration = createSelector(
  getRegCart,
  (regCart) => isAdminRegistrationFromRegCart(regCart)
);

/**
 * Gets the registration path for the current registrant.
 */
export const getRegistrationPathId = createSelector(getRegCart, getEventRegistrationId,
  getRegistrationPathIdFromRegCart);

/**
 * Get registrant confirmation info to re-login.
 *
 * First try to get info from registrantLogin form unless the user can change their id fields.
 * If this form is empty, means the page/registration has been refreshed at some point.
 * If the person is an admin, get info from userSession, otherwise get it from regCart.
 */
export const getConfirmationInfo = (state, currRegCart) => {
  const regCart = currRegCart || getRegCart(state);
  const primaryEventRegId = getPrimaryRegistrationId(regCart);
  const isAdmin = isAdminRegistrationFromRegCart(regCart);
  const registrationPathId = getRegistrationPathIdFromRegCart(regCart, primaryEventRegId);
  const idFieldsAreReadOnly = isAdmin || !isRegistrationModificationFromRegCart(regCart)
    || !getPersonalInformationModificationSetting(state, registrationPathId);
  let emailAddress;
  let confirmationNumber;
  if (idFieldsAreReadOnly) {
    // if user can't have changed their id confirmation fields, retrieve from login form
    const registrantLoginForm = getIn(state, ['registrantLogin', 'currentLogin']);
    emailAddress = registrantLoginForm.emailAddress;
    confirmationNumber = registrantLoginForm.confirmationNumber;
  }
  if (!emailAddress || !confirmationNumber) {
    let adminConfirmationNumber;
    let adminEmailAddress;
    adminConfirmationNumber = isAdmin && getIn(state, ['userSession', 'confirmationNumber']);
    adminEmailAddress = isAdmin && getIn(state, ['userSession', 'emailAddress']);
    confirmationNumber = isAdmin && adminConfirmationNumber ? adminConfirmationNumber :
      getConfirmationNumberFromRegCart(regCart, primaryEventRegId);
    emailAddress = isAdmin && adminEmailAddress ? adminEmailAddress :
      getAttendeePersonalInformation(regCart, primaryEventRegId).emailAddress;
  }
  return { emailAddress, confirmationNumber };
};

export const isGroupLeader = (state, eventRegistrationId) => {
  /*
   * TODO: For backwards compatibility, not including this condition.
   * if (!isGroupRegistration(state)) {
   * return false;
   * }
   */

  return getAttendeeType(state, eventRegistrationId) === 'GROUP_LEADER';
};

// Only returns true of members of a group, single reg case will return false
export const isGroupMember = (state, eventRegistrationId) => {
  if (!isGroupRegistration(state)) {
    return false;
  }

  return getAttendeeType(state, eventRegistrationId) === 'ATTENDEE';
};

export const getAttendeeRegistrationStatus = (state, eventRegistrationId) => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'registrationStatus']);
};

export const isAttendeeRegistered = (state, eventRegistrationId) => {
  return getAttendeeRegistrationStatus(state, eventRegistrationId) === 'REGISTERED';
};

export const getAdminPersonalInformation = createSelector(getRegCart, getAdminPersonalInformationFromRegCart);

/**
 * Get registration types that are open for registration
 */
export const getActiveRegistrationTypes = createSelector(
  getRegistrationTypes,
  state => (state.defaultUserSession && state.defaultUserSession.isPlanner),
  state => isAttendeeRegistered(state, getEventRegistrationId(state)),
  (registrationTypes, isPlanner, alreadyRegistered) => {
    if (alreadyRegistered || isPlanner) {
      return registrationTypes;
    }
    if (Object.keys(registrationTypes).length > 0) {
      return pickBy(registrationTypes, registrationType => {
        return registrationType.isOpenForRegistration;
      });
    }
    return registrationTypes;
  });


/**
 * Get registration types that's visible to the registrant.
 */
export const getVisibleRegistrationTypes = createSelector(
  getActiveRegistrationTypes,
  (state, regPathId) => getRegistrationTypeSettingsFromEvent(state, regPathId),
  getGuestDefaultRegTypeId,
  (state, regPathId, regTypeId) => regTypeId,
  getVisibleRegistrationTypesUtil
);

export const getVisibleRegistrationTypesForGuestDialog = createSelector(
  getActiveRegistrationTypes,
  (state, regPathId) => getGuestRegistrationTypeSettings(state, regPathId),
  (state, regPathId, regTypeId) => regTypeId,
  getVisibleRegistrationTypesUtil
);

/**
 * Get registration types that have at least one admission item available (not closed and not at capacity)
 * and checks the associated session capacity to see if admission item will be selectable (FLEX-23871)
 * Returns a Map<RegistrationTypeId, Boolean>.  Reg types that have at least one admission item available
 * are true, ones that do not are false
 */
export const getRegTypeHasAvailableAdmissionItemMap = createSelector(
  getRegistrationTypes,
  getAdmissionItemsFromEvent,
  getOptionalSessions,
  (state) => { return state.capacity; },
  (state, guestCount) => guestCount,
  (state) => (state.defaultUserSession && state.defaultUserSession.isPlanner),
  (registrationTypes, admissionItems, sessions, capacities, guestCount, isPlanner) => {
    return mapValues(registrationTypes, (regType) => {
      return some(admissionItems, admissionItem => {
        if (admissionItemIsVisible(regType.id, admissionItem, { includeClosedAdmissionItems: isPlanner })) {
          // if planner return true since they can choose closed adm items
          if (isPlanner) {
            return true;
          }
          const admissionItemHasUnlimitedCapacity =
          getIn(capacities, [admissionItem.capacityId, 'totalCapacityAvailable']) === -1;
          const admissionItemAvailableCapacity =
          getIn(capacities, [admissionItem.capacityId, 'availableCapacity']);
          const hasAssociatedSessions = !isEmpty(admissionItem.associatedOptionalSessions);
          let lowestAssociatedSessionCapacity = -1;

          if (hasAssociatedSessions) {
            const capacityIds = admissionItem.associatedOptionalSessions.map(id => {
              return sessions && sessions[id] && sessions[id].capacityId;
            });
            const sessionCapacities = Object.values(capacities).filter(capacity =>
              capacityIds.includes(capacity.capacityId) && capacity.availableCapacity !== -1);
            lowestAssociatedSessionCapacity = isEmpty(sessionCapacities) ? -1
              : sessionCapacities.reduce((acc, loc) => {
                const accCap = capacities[acc.capacityId] && capacities[acc.capacityId].availableCapacity;
                const locCap = capacities[loc.capacityId].availableCapacity;
                return accCap < locCap ? acc : loc;
              }).availableCapacity;
          }
          return (admissionItemHasUnlimitedCapacity || admissionItemAvailableCapacity > (guestCount || 0)) &&
            (lowestAssociatedSessionCapacity === -1 || lowestAssociatedSessionCapacity > (guestCount || 0));
        }
      });
    });
  });

/**
 * Gets the admission items within the regcart. This will also include admission items the user
 * is unregistering for. Use getSelectedAdmissionItem to get the admission item which is being
 * registered for.
 */
export const getAdmissionItems = createSelector(getRegCart, getEventRegistrationId, getAdmissionItemsFromRegCart);

/**
 * Gets the current registrants selected admission item if one is available. This admission
 * item is in the form of a Product Registration. To get easy access to the admission items
 * definition from the snapshot use the getSelectedAdmissionItemDefinition.
 */
export const getSelectedAdmissionItem = createSelector(getRegCart, getEventRegistrationId,
  getSelectedAdmissionItemFromRegCart);

/**
 * Gets the selected admission item for all the event registrations where if one is available. This admission
 * item is in the form of a Product Registration. To get easy access to the admission items
 * definition from the snapshot use the getSelectedAdmissionItemDefinition.
 */
export const getMultipleSelectedAdmissionItems = createSelector(getRegCart, getAllEventRegSelectedAdmissionItem);

/**
 * Gets the selected admission item from the regCart for the guest that is currently being added / edited
 */
export const getSelectedAdmissionItemForCurrentGuest = createSelector(getRegCart, getTemporaryGuestEventRegistrationId,
  getSelectedAdmissionItemFromRegCart);

/**
 * Gets the snapshot definition of the current registrants selected admission item if one is available.
 */
export const getSelectedAdmissionItemDefinition = createSelector(
  getAdmissionItemsFromEvent,
  getSelectedAdmissionItem,
  (admissionItems, selectedAdmissionItem) => {
    return selectedAdmissionItem && admissionItems[selectedAdmissionItem.productId];
  });

export const getSelectedSessionsFromAllRegistrant = (eventRegistrations) => {
  const selectedSessions = {};
  eventRegistrations.forEach((eventReg) => {
    const currSelectedSessions = (eventReg && eventReg.sessionRegistrations) || {};
    Object.values(currSelectedSessions).forEach((session) => {
      if (session.requestedAction === 'REGISTER') {
        selectedSessions[session.productId] = session;
      }
    });
  });
  return selectedSessions;
};

export const getSelectedSessionsFromAllRegistrantForWaitlist = (eventRegistrations) => {
  const selectedSessions = {};
  eventRegistrations.forEach((eventReg) => {
    const currSelectedSessions = (eventReg && eventReg.sessionWaitlists) || {};
    Object.values(currSelectedSessions).forEach((session) => {
      if (selectedSessions[session.productId] &&
        selectedSessions[session.productId].waitlistStatus === 'PENDING') {
        return;
      }
      selectedSessions[session.productId] = session;
    });
  });
  return selectedSessions;
};
// get All selected waitlisted session
export const getSelectedWaitlistedSessionsFromAllRegistrant = (eventRegistrations) => {
  const selectedSessions = {};
  eventRegistrations.forEach((eventReg) => {
    const currSelectedSessions = (eventReg && eventReg.sessionWaitlists) || {};
    Object.values(currSelectedSessions).forEach((session) => {
      selectedSessions[session.productId] = session;
    });
  });
  return selectedSessions;
};

export const getSelectedSessions = createSelector(getRegCart, getEventRegistrationId, getSelectedSessionsFromRegCart);

export const getSelectedQuantityItems = createSelector(getRegCart, getEventRegistrationId, getQuantityItemsFromRegCart);

export const getSelectedDonationItems = createSelector(getRegCart, getEventRegistrationId, getDonationItemsFromRegCart);

export const getSelectedSessionWaitlists = createSelector(getRegCart, getEventRegistrationId,
  getSelectedSessionWaitlistsFromRegCart);

/**
 * Gets the selected sessions from the regCart for the guest that is currently being added / edited
 */
export const getSelectedSessionsForCurrentGuest = createSelector(getRegCart, getTemporaryGuestEventRegistrationId,
  getSelectedSessionsFromRegCart);

export const getConfirmationNumber = createSelector(
  getRegCart, getEventRegistrationId, getConfirmationNumberFromRegCart);

/**
 * gets the current registrant's travel booking container object from the travelCart
 */
export const getTravelBooking = createSelector(
  getTravelCart, getEventRegistrationId, getTravelBookingForRegistrant
);

/**
 * gets the current registrant's hotel room bookings from the travelCart
 */
export const getHotelRoomBookings = createSelector(
  getTravelCart, getEventRegistrationId, getHotelRoomBookingsForRegistrant
);

/**
 * tells you whether the current registrant has any non-cancelled passkey bookings, if passkey is enabled for event
 */
export const getActivePasskeyBookings = createSelector(
  isPasskeyEnabled, getTravelCart, getEventRegistrationId, getActivePasskeyBookingsForRegistrant
);

/**
 * Get field value from top level of the reg cart
 * @returns field value, or undefined
 */
const getFromRegCart = (state, fieldName) => {
  return getIn(getRegCart(state), [fieldName]);
};

/**
 * Login is actually on server side. regCart calls estabilish server-side session.
 * The logic here just determines UI presentations like navigator and logout button.
 */
export const isLoggedIn = createSelector(
  getConfirmationNumber,
  (state) => getFromRegCart(state, 'status'),
  (state) => getFromRegCart(state, 'regMod'),
  (state) => getFromRegCart(state, 'regCancel'),
  (state) => getFromRegCart(state, 'postRegPayment'),
  (state) => getIn(state, ['userSession', 'verifiedAttendee']),
  (confirmationNumber, status, regMod, regCancel, postRegPayment, verifiedAttendee) => {
    return (confirmationNumber && status !== 'INPROGRESS') || regMod || regCancel || postRegPayment || verifiedAttendee || false;
  }
);

/**
 * Get optional session ids from the reg cart for the provided event registration
 */
const getOptionalSessionIdsFromRegCart = (regCart, eventRegistrationId) =>
  filter(getSessionsFromRegCart(regCart, eventRegistrationId),
    ({registrationSourceType}) => {
      return registrationSourceType !== REGISTRATION_SOURCE_TYPES.INCLUDED;
    })
  .map(({productId}) => productId);

/**
 * The following selectors allow access into the information from the original or
 * previously modified registration for use during the current registration modification.
 *
 * Because of the heavy use of reselect here, getRegId must be a function
 */
const modificationStartByEventRegistrationId = (getRegId) => ({
  getEventRegistration: createSelector(
    getModificationStartRegCart, getRegId, getEventRegistrationFromRegCart),
  getAttendee: createSelector(getModificationStartRegCart, getRegId, getAttendeeFromRegCart),
  getAttendeeId: createSelector(
    getModificationStartRegCart, getRegId, getAttendeeIdFromRegCart),
  getAttendeeStandardFieldAnswer: (state, fieldPath) => {
    return getAttendeeStandardFieldAnswerFromRegCart(
      getModificationStartRegCart(state),
      getRegId(state),
      fieldPath);
  },
  getAttendeeCustomFieldAnswer: (state, customFieldId) => {
    return getAttendeeCustomFieldAnswerFromRegCart(
      getModificationStartRegCart(state),
      getRegId(state),
      customFieldId);
  },
  getAttendeeQuestionAnswer: (state, questionId) => {
    return getAttendeeQuestionAnswerFromRegCart(
      getModificationStartRegCart(state),
      getRegId(state),
      questionId);
  },
  getRegistrationTypeId: createSelector(
    getModificationStartRegCart,
    getRegId,
    getRegistrationTypeId),
  getRegisteredAdmissionItem: createSelector(
    getModificationStartRegCart, getRegId, getSelectedAdmissionItemFromRegCart),
  getRegisteredSessions: createSelector(
    getModificationStartRegCart, getRegId, getSessionsFromRegCart),
  getConfirmationNumber: createSelector(
    getModificationStartRegCart, getRegId, getConfirmationNumberFromRegCart),
  getRegisteredQuantityItems: createSelector(
    getModificationStartRegCart, getRegId, getQuantityItemsFromRegCart),
  getRegisteredOptionalSessionIds: createSelector(
    getModificationStartRegCart, getRegId, getOptionalSessionIdsFromRegCart
  )
});

// Default use for mod start is the current registrant, so pass the selector to get that
export const modificationStart =
  modificationStartByEventRegistrationId(getEventRegistrationId);

// Sometimes you need the guest's pre-mod information instead though
export const modificationStartForCurrentGuest =
  modificationStartByEventRegistrationId(getTemporaryGuestEventRegistrationId);

// Default use for mod start is the current registrant, so pass the selector to get that
export const modificationStartFromEventRegistrationId =
 (eventRegistrationId) => modificationStartByEventRegistrationId(() => eventRegistrationId);

export const isProductVisibleForEventRegistration = (visibleProducts, productId, eventRegistrationId) => {
  const visibleProductsForSessionsWidget = visibleProducts.Sessions;
  if (!(visibleProductsForSessionsWidget && productId && eventRegistrationId)) {
    return false;
  }
  const eventRegistrtionVisibleProducts = visibleProductsForSessionsWidget[eventRegistrationId];
  if (!eventRegistrtionVisibleProducts) {
    return false;
  }
  if (eventRegistrtionVisibleProducts.admissionItems[productId] ||
    eventRegistrtionVisibleProducts.sessionProducts[productId]) {
    return true;
  }
  const sessionGroup = values(eventRegistrtionVisibleProducts.sessionProducts).find(sessionProduct => {
    return sessionProduct.sessions && sessionProduct.sessions[productId];
  });
  if (sessionGroup) {
    return true;
  }
  return false;
};

const isAdmissionItemQuestionVisible = (state, productQuestion, isWidgetPlacedOnGuestModal, eventRegistrationId) => {
  let admissionItem;
  if (eventRegistrationId) {
    admissionItem = getSelectedAdmissionItemFromRegCart(getRegCart(state), eventRegistrationId);
  } else {
    admissionItem = isWidgetPlacedOnGuestModal ?
      getSelectedAdmissionItemForCurrentGuest(state) : getSelectedAdmissionItem(state);
  }
  return !!(admissionItem &&
    productQuestion.productQuestionAssociations.includes(admissionItem.productId));
};

const isSessionQuestionVisible = (state, productQuestion, isWidgetPlacedOnGuestModal, eventRegistrationId) => {
  let selectedSessions;
  if (eventRegistrationId) {
    selectedSessions = getSelectedSessionsFromRegCart(getRegCart(state), eventRegistrationId);
  } else {
    selectedSessions = isWidgetPlacedOnGuestModal ?
      getSelectedSessionsForCurrentGuest(state) : getSelectedSessions(state);
  }
  return !!(selectedSessions &&
    productQuestion.productQuestionAssociations.some(
      associatedProductId => Object.keys(selectedSessions).includes(associatedProductId)));
};

const isProductQuestionVisible = (state, productQuestion, isWidgetPlacedOnGuestModal, eventRegistrationId) => {
  return productQuestion && (isAdmissionItemQuestionVisible(state, productQuestion, isWidgetPlacedOnGuestModal,
    eventRegistrationId) || isSessionQuestionVisible(state, productQuestion, isWidgetPlacedOnGuestModal,
    eventRegistrationId));
};

export const getQuestionAnswer = ({
  state, questionId, isQuestionPlacedOnGuestModal, eventRegistrationId, bookingId
}) => {
  let eventRegistration;
  const isTravelQuestion = !!fromAppData.getTravelQuestion(state.appData, questionId);
  if (isTravelQuestion) {
    const path = buildTravelQuestionAnswerPath(questionId, bookingId);
    return getTravelAnswerData(state, path, eventRegistrationId);
  }

  if (eventRegistrationId) {
    eventRegistration = getEventRegistrationFromRegCart(getRegCart(state), eventRegistrationId);
  } else {
    eventRegistration = isQuestionPlacedOnGuestModal ? state.registrationForm.currentGuestEventRegistration
      : getEventRegistration(state);
  }
  return getIn(eventRegistration, ['attendee', 'eventAnswers', questionId]);
};

const getParentSelectedChoices = createSelector(
  ({ state, parentQuestionId }) => getEventQuestionById(state.appData, parentQuestionId),
  ({ state, parentQuestionId, isWidgetPlacedOnGuestModal, eventRegistrationId, bookingId }) =>
    getQuestionAnswer({
      state, questionId: parentQuestionId, isQuestionPlacedOnGuestModal: isWidgetPlacedOnGuestModal,
      eventRegistrationId, bookingId
    }),
  ({ state }) => state.text.translate,
  (parentQuestion, parentQuestionSelectedValues, translate) => {
    if (!parentQuestionSelectedValues) {
      return false;
    }
    const selectedValues = parentQuestionSelectedValues.answers.filter(
      entry => entry.answerType === 'Choice').map(entry => entry.choice);
    const otherAnswer = parentQuestionSelectedValues.answers.find(entry => entry.answerType === 'Other');
    const hasNA = !!parentQuestionSelectedValues.answers.find(entry => entry.answerType === 'NA');
    if (hasNA) {
      selectedValues.push(parentQuestion.question.questionTypeInfo.naAnswer.text);
    } else if (otherAnswer) {
      const otherAnswerText = parentQuestion.question.questionTypeInfo.otherAnswer ?
        parentQuestion.question.questionTypeInfo.otherAnswer.text :
        translate('_question_choices_otherChoiceLabel__resx');
      selectedValues.push(otherAnswerText);
    }
    return selectedValues;
  }
);

export const isSubQuestionVisible = ({ state, questionId,
  parentQuestionId, isWidgetPlacedOnGuestModal, eventRegistrationId, bookingId }) => {
  const questionInfo = getEventQuestionById(state.appData, questionId);
  const selectedChoices = getParentSelectedChoices({ state, parentQuestionId, isWidgetPlacedOnGuestModal,
    eventRegistrationId, bookingId });
  if (selectedChoices) {
    const subQuestionLogicChoices = questionInfo.subQuestionLogicChoices;
    return subQuestionLogicChoices ?
      some(subQuestionLogicChoices, choice => selectedChoices.includes(choice.name)) : false;
  }
  return false;
};

const isSubQuestionVisibleDuringRegMod = (state, answer) => {
  const previousAnswer = answer.valueBeforeMod;
  const currentAnswer = answer.value;
  return (previousAnswer && (previousAnswer.answers && currentAnswer &&
    (typeof currentAnswer.toJSON !== 'function' || currentAnswer.toJSON().answers)));
};

/*
 * PROD-101263 if isGuest(guest reg page) is true and question is not GuestOnly and isVisible comes undefined
 * in that case visibility should be false
 * visibility should be true otherwise
 */
const getQuestionVisibilityLogic = (isVisible, additionalInfo, state, questionId,
  isWidgetPlacedOnGuestModal, eventRegistrationId) => {
  if (isViewingGuest(state) && isVisible === undefined && additionalInfo !== undefined &&
    additionalInfo.audienceType === 'InviteeOnly') {
    return false;
  }
  if (isVisible && questionHasVisibilityLogic(state, questionId)) {
    const registrationId = isWidgetPlacedOnGuestModal
      ? getTemporaryGuestEventRegistrationId(state)
      : eventRegistrationId || getEventRegistrationId(state);
    return !!isVisible && isVisible[registrationId];
  }
  return true;
};

export const isQuestionVisible = (state, config, answer, eventRegistrationId, bookingId) => {
  const { id: questionId, appData: { parentQuestionId, question: { isVisible },
    question: { additionalInfo } } } = config;
  if (parentQuestionId) {
    return isSubQuestionVisibleDuringRegMod(state, answer) ||
      isSubQuestionVisible({
        state,
        questionId,
        parentQuestionId,
        isWidgetPlacedOnGuestModal: answer.isWidgetPlacedOnGuestModal,
        eventRegistrationId,
        bookingId
      });
  }

  const isWidgetPlacedOnGuestModal = (answer && answer.isWidgetPlacedOnGuestModal) || false;

  let questionVisibilityLogic = getQuestionVisibilityLogic(isVisible, additionalInfo, state, questionId,
    isWidgetPlacedOnGuestModal, eventRegistrationId);

  const questionInfo = getProductQuestion(state.appData, questionId);
  const productVisibilityLogic = questionInfo ? isProductQuestionVisible(state, questionInfo,
    isWidgetPlacedOnGuestModal, eventRegistrationId) : true;
  return !!questionVisibilityLogic && !!productVisibilityLogic;
};

const defaultSelectedSessionFilters = Object.freeze({
  keywordFilterValue: '',
  selectedFilterChoices: {}
});
export const getSelectedSessionFilters = (state) => {
  return getIn(state, ['sessionFilters']) || defaultSelectedSessionFilters;
};

export const getSubQuestionsByParentId = (state, questionId) => {
  const questionInfo = getEventQuestionById(state.appData, questionId);
  return questionInfo.parentQuestionId ? null :
    getSubQuestionsByParentQuestionId(state.appData, questionId);
};

/* Returns true if its regMod and the cart contains members who were added during the mod */
export const regModCartContainsNewRegistrants = (state) => {
  if (isRegistrationModification(state) && isGroupRegistration(state)) {
    const regCart = getRegCart(state);
    const eventRegs = getIn(regCart, ['eventRegistrations']);
    return eventRegs && Object.values(eventRegs).filter((eventReg) => {
      return !(eventReg && eventReg.registrationStatus || false);
    }).length > 0 || false;
  }
  return false;
};

/* Returns whether attendee has accepted terms and conditions */
export const isTermsConditionsAccepted = (state, eventRegistrationId) => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'attendee', 'termsAndConditionsAccepted']);
};

/* Returns voucher code that attendee has entered. */
export const getVoucherCode = (state, eventRegistrationId) => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'appliedVoucher', 'voucherCode']);
};

export const getAllGuestsForCurrentRegistration = createSelector(
  getRegCart,
  getEventRegistrationId,
  getGuestsOfRegistrant
);

export const guests = (state, onlyNewGuests = false, requestedAction = 'REGISTER') => {
  const currentEventRegistrationId = getEventRegistrationId(state);
  const guestsOfRegistrant = getGuestsOfRegistrant(getRegCart(state), currentEventRegistrationId, requestedAction);

  return guestsOfRegistrant.filter(registration => !onlyNewGuests || !registration.registrationStatus);
};

/* Returns the number of guest attendee types from the list of event registrations */
export const guestRegistrantsCount = (state, onlyNewGuests = false,
  requestedAction = 'REGISTER') => {
  return guests(state, onlyNewGuests, requestedAction).length;
};

/* Based on event status and userSession state returns a boolean if user canRegister */
export const canRegister = (state) => {
  return state.event.status === EventStatus.ACTIVE
    || (state.event.status === EventStatus.PENDING && state.defaultUserSession.isTestMode)
    || (state.event.status === EventStatus.COMPLETED && state.defaultUserSession.isPlanner)
    || (state.defaultUserSession.isPreview && !state.event.isArchived
      && state.event.status !== EventStatus.CANCELLED
      && state.event.status !== EventStatus.PROCESSING
      && state.event.status !== EventStatus.NO_REGISTRATION_REQUIRED);
};
/* Based on event status, userSession state, and isLoggedIn status returns a boolean if user canLogin */
export const canLogin = (state) => {
  const loginAllowed = state.event.status === EventStatus.ACTIVE
    || state.event.status === EventStatus.COMPLETED
    || state.event.status === EventStatus.CLOSED
    || (state.event.status === EventStatus.PENDING && state.defaultUserSession.isTestMode)
    || (state.event.status === EventStatus.PENDING && state.defaultUserSession.isPreview);
  return loginAllowed && !isLoggedIn(state);
};

export const getAdvancedRulesValidations = (state) => {
  return filter(state.registrationForm.validationMessages || [],
    validationMessage => validationMessage.localizationKey === 'REGAPI.SESSIONS_REGISTRATION_RULE_FAILED');
};

/**
 * Returns admissionItem info for primary + guests in the form
 * {
 *  admissionItemId: {
 *    registered: [{
 *      eventRegistrationId,
 *      attendee: regcart.eventRegistrations[id].attendee
 *    }],
 *    unRegistered: [{
 *      eventRegistrationId,
 *      attendee: regcart.eventRegistrations[id].attendee
 *    }]
 *  }
 * }
 * This is needed for updating the admission item widget button text and the remaining capacity count.
 */
export const getAdmissionItemInfoForPrimaryAndGuests = createSelector(
  // Selector arguments
  getRegCart,
  getEventRegistrationId,

  // Result function
  (regCart, primaryRegId) => {
    const primaryEventReg = getEventRegistrationFromRegCart(regCart, primaryRegId);
    const allGuestEventRegs = getGuestsOfRegistrant(regCart, primaryRegId, null);
    const primaryAndGuestEventRegs = allGuestEventRegs && allGuestEventRegs.concat(primaryEventReg);
    const admissionItemInfo = {};
    if (!regCart || !primaryRegId || !primaryEventReg) {
      return admissionItemInfo;
    }
    primaryAndGuestEventRegs.forEach((eventReg) => {
      // set all the registered attendees
      const registeredAdmissionItemId = (getSelectedAdmissionItemFromRegCart(regCart, eventReg.eventRegistrationId)
        || {}).productId;
      if (admissionItemInfo.hasOwnProperty(registeredAdmissionItemId)) {
        admissionItemInfo[registeredAdmissionItemId].registered.push({
          eventRegistrationId: eventReg.eventRegistrationId,
          attendee: eventReg.attendee
        });
      } else if (registeredAdmissionItemId) {
        admissionItemInfo[registeredAdmissionItemId] = {
          registered: [{
            eventRegistrationId: eventReg.eventRegistrationId,
            attendee: eventReg.attendee
          }],
          unRegistered: []
        };
      }
      // set all the unregistered attendees
      const unregisteredAdmissionItemId = (getUnSelectedAdmissionItem(regCart, eventReg.eventRegistrationId)
        || {}).productId;
      if (admissionItemInfo.hasOwnProperty(unregisteredAdmissionItemId)) {
        admissionItemInfo[unregisteredAdmissionItemId].unRegistered.push({
          eventRegistrationId: eventReg.eventRegistrationId,
          attendee: eventReg.attendee
        });
      } else if (unregisteredAdmissionItemId) {
        admissionItemInfo[unregisteredAdmissionItemId] = {
          registered: [],
          unRegistered: [{
            eventRegistrationId: eventReg.eventRegistrationId,
            attendee: eventReg.attendee
          }]
        };
      }
    });
    return admissionItemInfo;
  });

/**
 * gets the list of admission items that are registered based on allowed attendee type
 * if allowed attendee type is invitee, will only return primary adm item id
 */
export const getRegisteredAdmissionItemForPrimaryAndGuests = (state, allowedAttendeeTypes) => {
  const admissionItems = getAdmissionItemInfoForPrimaryAndGuests(state);
  const admItemIds = [];
  const isGuestOn = allowedAttendeeTypes === ATTENDEE_TYPE_INVITEE_AND_GUEST;
  const primaryRegId = getEventRegistrationId(state);
  // consider adm items that are registered
  for (let key in admissionItems) {
    if (admissionItems.hasOwnProperty(key)) {
      const admItem = admissionItems[key];
      if (admItem.registered && admItem.registered.length > 0) {
        if (isGuestOn || admItem.registered.some(item => item.eventRegistrationId === primaryRegId)) {
          // consider guest ids only if allowed attendee types includes guest
          admItemIds.push(key);
        }
      }
    }
  }
  return admItemIds;
};

/**
 * gets the list of registration types for primary and guest invitees based on allowed attendee types
 * if allowed attendee type == invitee, then only returns registration types of primary invitee
 */
export const getRegistrationTypesForPrimaryAndGuests = createSelector(
  // Selector arguments
  getRegCart,
  getEventRegistrationId,
  getRegistrationTypeIdFromUserSession,
  (state, allowedAttendeeTypes) => allowedAttendeeTypes,

  // Result function
  (regCart, primaryRegId, initialRegistrationTypeId, allowedAttendeeTypes) => {
    const regTypes = [];
    const isGuestOn = allowedAttendeeTypes === ATTENDEE_TYPE_INVITEE_AND_GUEST;
    const primaryEventReg = getEventRegistrationFromRegCart(regCart, primaryRegId);
    if (!regCart || !primaryRegId || !primaryEventReg) {
      return regTypes;
    }
    const allGuestEventRegs = isGuestOn ? getGuestsOfRegistrant(regCart, primaryRegId, null) : [];
    const primaryAndGuestEventRegs = allGuestEventRegs && allGuestEventRegs.concat(primaryEventReg);
    primaryAndGuestEventRegs.forEach((eventReg) => {
      const regTypeId = (eventReg && eventReg.registrationTypeId) || initialRegistrationTypeId;
      if (!regTypes.includes(regTypeId)) {
        regTypes.push(regTypeId);
      }
    });

    return regTypes;
  });

/**
 * Gets you the guest that the invitee wants to add but not yet has confirmed by hitting the ok/submit button.
 * Whenever the invitee shows intent to add a guest (opens the popup to add guest), we create
 * temporary eventRegistration against that in the backed so that capacity checks are applied.
 * @param state
 * @returns {*}
 */
export function getTemporaryGuestEventRegistrationId(state) {
  if (!state) {
    return undefined;
  }
  return getIn(state, ['registrationForm', 'currentGuestEventRegistration', 'eventRegistrationId']);
}

/* Returns whether guest is in edit mode for guest modal */
export const isGuestEditMode = (state) => {
  const eventRegistrationId = getTemporaryGuestEventRegistrationId(state);
  const regCart = getRegCart(state);
  return !!getIn(regCart, ['eventRegistrations', eventRegistrationId, 'attendee', 'isEditMode']);
};

export function isViewingGuest(state) {
  const regForm = state.registrationForm;
  let isGuest = false;

  if (regForm && regForm.currentGuestEventRegistration && regForm.currentGuestEventRegistration.eventRegistrationId) {
    isGuest = true;
  }

  return isGuest;
}

/**
 * Returns the current temporary guest information stored in the state.
 * @param state
 * @returns {*}
 */
export function getTemporaryGuestEventRegistration(state) {
  if (!state) {
    return undefined;
  }
  return getIn(state, ['registrationForm', 'currentGuestEventRegistration']);
}

/**
 * gets you all the guests that the invitee has added in their registration
 * @param state
 * @returns {*}
 */
export function getConfirmedGuests(state) {
  if (!state) {
    return [];
  }
  const unconfirmedGuestEventRegId = getTemporaryGuestEventRegistrationId(state);
  const allGuests = guests(state, false);
  return allGuests.filter(eventReg => eventReg.eventRegistrationId !== unconfirmedGuestEventRegId
   || isGuestEditMode(state));
}

/**
 * get guests' event registrations that have 'REGISTERED' status. Note that removed guests also have 'REGISTERED'
 * status, so removed guests' registration are also returned.
 * @param state
 * @returns {*}
 */
export function getRegisteredStatusGuests(state) {
  if (!state) {
    return [];
  }
  const currentEventRegistrationId = getEventRegistrationId(state);
  const regCart = getRegCart(state);
  const isRegCartCompleted = regCart && regCart.status === 'COMPLETED';
  const guestsForRegister =
    getGuestsOfRegistrant(getRegCart(state), currentEventRegistrationId, REQUESTED_ACTIONS.REGISTER) || [];
  const guestsForUnregister =
    getGuestsOfRegistrant(getRegCart(state), currentEventRegistrationId, REQUESTED_ACTIONS.UNREGISTER) || [];

  // For a completed cart, get all guests
  return isRegCartCompleted ? guestsForRegister :
    // else get only "registered" guests
    guestsForRegister.concat(guestsForUnregister)
      .filter(eventReg => !!eventReg.confirmationNumber);
}

export const getTemporaryGuestStandardFieldAnswer = (state, fieldPath) => {
  const path = ['registrationForm', 'currentGuestEventRegistration', 'attendee', 'personalInformation', fieldPath];
  return getIn(state, path) || '';
};

export const shouldSecureContactFieldBePrepopulated = (state, widgetType) => {
  const guestEventReg = getTemporaryGuestEventRegistration(state);
  const attendee = isEmpty(guestEventReg) ? getAttendee(state) : guestEventReg.attendee;
  if (!attendee || !attendee.personalInformation) {
    return false;
  }

  if (widgetType === 'passportNumber' && attendee.personalInformation.isEncryptedPassportNumberPresent ||
    widgetType === 'socialSecurityNumber' && attendee.personalInformation.isEncryptedSocialSecurityNumberPresent ||
    widgetType === 'nationalIdentificationNumber' && attendee.personalInformation
      .isEncryptedNationalIdentificationNumberPresent) {
    return true;
  }
  return false;
};

export const getVisibleRegistrationTypesByPlannerSelection = createSelector(
  getRegistrationTypeSettingsFromEvent,
  registrationTypeSettings => registrationTypeSettings && registrationTypeSettings.categorizedRegistrationTypes || []
);

/**
 * This method filters gets the registration type id.
 * If user has a predefined registration type and reg cart has not been populated, use the predefined registration type.
 * If reg cart has been initialized, use the reg cart selected registration type.
 */
export const getRegistrationTypeIdForAgenda = createSelector(
  getRegistrationTypeId,
  getGuestDefaultRegTypeId,
  doesRegCartExist,
  (registrationTypeId, guestDefaultRegTypeId, regCartExist) => {
    return (!regCartExist && registrationTypeId === defaultRegistrationTypeId &&
        guestDefaultRegTypeId) ? guestDefaultRegTypeId : registrationTypeId;
  }
);

// this tracks the associated session capacity too and returns the lowest of both in map form
export const getAdmissionItemsCapacityMap = (state, admItems, guestRegTypes = []) => {
  if (!isAdmissionItemsEnabled(state)) {
    return {};
  }
  const admissionItems = admItems || getAdmissionItemsFromEvent(state);
  const admissionItemsCap = {};
  const sessions = getOptionalSessions(state);
  const capacities = state.capacity;
  const primaryVisibleProducts =
    state.visibleProducts &&
    state.visibleProducts.Sessions &&
    state.visibleProducts.Sessions[getEventRegistrationId(state)] &&
    state.visibleProducts.Sessions[getEventRegistrationId(state)].admissionItems || {};
  const isPlanner = state.defaultUserSession.isPlanner;

  Object.values(admissionItems).forEach(admissionItem => {
    const admissionItemHasUnlimitedCapacity =
      getIn(state, ['capacity', admissionItem.capacityId, 'totalCapacityAvailable']) === -1;
    const admissionItemAvailableCapacity =
      getIn(state, ['capacity', admissionItem.capacityId, 'availableCapacity']);
    const hasAssociatedSessions = admissionItem.associatedOptionalSessions &&
      admissionItem.associatedOptionalSessions.length > 0;
    let lowestAssociatedSessionCapacity = -1;
    /*
     * FLEX-23871 check the associated session capacity to see if admission item
     * will be selectable
     */
    if (hasAssociatedSessions) {
      const capacityIds = admissionItem.associatedOptionalSessions.map(id => {
        return sessions && sessions[id] && sessions[id].capacityId;
      });
      const sessionCapacities = capacities && Object.values(capacities).filter(capacity =>
        capacityIds.includes(capacity.capacityId) && capacity.availableCapacity !== -1);
      // return lowest capacity count
      lowestAssociatedSessionCapacity = isEmpty(sessionCapacities) ? -1
        : sessionCapacities.reduce((acc, loc) => {
          const accCap = capacities[acc.capacityId] && capacities[acc.capacityId].availableCapacity;
          const locCap = capacities[loc.capacityId].availableCapacity;
          return accCap < locCap ? acc : loc;
        }).availableCapacity;
    }

    admissionItemsCap[admissionItem.id] = {
      visibleToDefaultRegType: admissionItemIsVisible(defaultRegistrationTypeId, admissionItem),
      visibleToPrimary: !!primaryVisibleProducts[admissionItem.id],
      visibleToGuest: some(guestRegTypes, regType =>
        admissionItemIsVisible(regType.id, admissionItem, { includeClosedAdmissionItems: isPlanner }))
    };

    if (admissionItemHasUnlimitedCapacity) {
      admissionItemsCap[admissionItem.id] = {
        ...admissionItemsCap[admissionItem.id],
        availableCapacity: lowestAssociatedSessionCapacity === -1 ? admissionItemAvailableCapacity
          : lowestAssociatedSessionCapacity
      };
    } else {
      admissionItemsCap[admissionItem.id] = {
        ...admissionItemsCap[admissionItem.id],
        availableCapacity: lowestAssociatedSessionCapacity === -1 ? admissionItemAvailableCapacity
          : Math.min(lowestAssociatedSessionCapacity, admissionItemAvailableCapacity)
      };
    }
  });
  return admissionItemsCap;
};

/* Returns whether attendee is included in attendee list or not */
export const includeNameInAttendeeList = (state, eventRegistrationId) => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'attendee', 'displayOnAttendeeList']);
};

/* Returns whether attendee allows others to send email to her */
export const allowOthersToSendEmail = (state, eventRegistrationId) => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'attendee', 'receiveAttendeeEmail']);
};

/**
 * gets the remaining capacity of all available admission items. returns infinity if not enabled or
 * adm item has unlimited capacity
 * @param state
 * @returns {*}
 */
export const getTotalAdmissionItemCapacityAvailable = (state, isGuestProductSelectionEnabled,
  guestRegTypes, isGuestDropDown = false, primaryAdmissionItemReg = null) => {
  if (!isAdmissionItemsEnabled(state)) {
    return Infinity;
  }
  /*
   * PROD-75187 if primary already selected an admission item, and guest cannot select their own
   * product, only get the selected admission item capacity.
   */
  const primaryAdmissionItem = primaryAdmissionItemReg && !isGuestProductSelectionEnabled &&
    [getAdmissionItem(state, primaryAdmissionItemReg.productId)];
  const admissionItemsCapacityMap = getAdmissionItemsCapacityMap(state, primaryAdmissionItem, guestRegTypes);

  /*
   * FLEX-23871 check available admission item capacity and limit the guest dropdown to not be greater
   * than the number available
   */
  const visibleAdmItems = Object.values(admissionItemsCapacityMap).filter(admItem => {
    if (isGuestDropDown) {
      return isGuestProductSelectionEnabled ? admItem.visibleToDefaultRegType : admItem.visibleToPrimary;
    }
    return isGuestProductSelectionEnabled ? admItem.visibleToGuest : admItem.visibleToPrimary;
  }) || [];
  // filter out adm items with unlimited capacity
  const admItemsWithLimitedCap = visibleAdmItems.filter(admItem => admItem.availableCapacity !== -1)
    || [];
  // if the two lists are diff sizes then must been adm item with unlimited capacity else add all remaining spots
  const hasUnlimitedCap = admItemsWithLimitedCap.length !== visibleAdmItems.length
    || admItemsWithLimitedCap.length === 0;

  if (hasUnlimitedCap) {
    return Infinity;
  }

  // shared agenda check if the primaries visible adm items and return the max one
  return isGuestProductSelectionEnabled
    ? admItemsWithLimitedCap.length > 0 &&
      admItemsWithLimitedCap.reduce(
        (acc, loc) => (acc + loc.availableCapacity), 0)
    : admItemsWithLimitedCap.length > 0 &&
      admItemsWithLimitedCap.reduce(
        (acc, loc) => acc.availableCapacity >= loc.availableCapacity ? acc : loc).availableCapacity;
};

export const getAnswerForRegistrationTypeField = (fieldId, state, isGuest) => {
  if (!isGuest) {
    return createAnswer(fieldId, getRegistrationTypeId(state));
  }
  return createAnswer(fieldId, getIn(state,
    ['registrationForm', 'currentGuestEventRegistration', 'registrationTypeId']));
};

export const getAnswerForFieldId = (state, fieldId, isGuest = false, registration = getEventRegistration(state)) => {
  const isRegistrationTypeField = fieldId === REGISTRATION_TYPE_ID_FIELD_ID;
  if (isRegistrationTypeField) {
    return getAnswerForRegistrationTypeField(fieldId, state, isGuest);
  }
  const contactField = StandardContactFields[fieldId] || StandardContactAddressSubFields[fieldId];
  if (contactField) {
    const regApiPathTokens = contactField.regApiPath;
    const isDate = isDateField(contactField);
    let value = isGuest ?
      getCurrentGuestStandardFieldAnswer(state, regApiPathTokens) :
      getIn(registration, ['attendee', 'personalInformation', ...regApiPathTokens]);

    const isObfuscated = shouldSecureContactFieldBePrepopulated(state, regApiPathTokens[0]);
    /*
     * The value we use to create an answer doesn't really matter here for secure fields, because they can only us
     * is blank and not is blank as operators. So, we just neeed to use A value.
     */
    value = (value === undefined || value === '') && isObfuscated ? '000-001-0001' : value;
    return createAnswer(fieldId, value, isDate);
  }
  const customFieldAnswer = isGuest ?
    getCurrentGuestCustomFieldAnswer(state, fieldId) :
    getIn(registration, ['attendee', 'personalInformation', 'customFields', fieldId]);

  if (customFieldAnswer && customFieldAnswer.answers.length) {
    const answers = customFieldAnswer.answers;
    let statusCode;
    if (answers[0].text) {
      statusCode = answers[0].text.statusCode;
    }
    const isDate = statusCode === DATE_CHANGE_SUCCESS;
    const answerValues = answers.reduce((accumulator, answer) => {
      if (answer.answerType === 'Choice') {
        accumulator.push(answer.choice);
      } else {
        if (answer.text.date) {
          accumulator.push(answer.text.date);
        } else if (answer.text.length) {
          accumulator.push(answer.text);
        }
      }
      return accumulator;
    }, []);
    return createAnswer(fieldId, answerValues, isDate);
  }
  return createAnswer(fieldId);
};

export function isDateField(field) {
  let questionType;
  if (field && field.questionType) {
    questionType = field.questionType;
  }
  if (field && field.questionTypeInfo && field.questionTypeInfo.questionType) {
    questionType = field.questionTypeInfo.questionType;
  }

  return questionType &&
    (questionType.toLowerCase().indexOf('date') >= 0 || questionType.toLowerCase().indexOf('time') >= 0);
}
export const getContactId = (state) => {
  const attendee = getAttendee(state);

  if (attendee && attendee.personalInformation) {
    return attendee.personalInformation.contactId;
  }

  return null;
};

export const isOnPrivateRegPathOrWithLimitedTargetList = (state) => {
  const currentRegPathId = getRegistrationPathId(state);
  const eventType = getIn(state, ['appData', 'registrationSettings', 'registrationPaths', currentRegPathId,
    'accessRules', 'invitationListAccess', 'type']);
  return (eventType === PRIVATE_ALL_TARGETED_LISTS || eventType === PRIVATE_LIMITED_TARGETED_LISTS);
};

export const isOnEmailInviteOnlyRegPath = (state) => {
  const currentRegPathId = getRegistrationPathId(state);
  return getIn(state, ['appData', 'registrationSettings', 'registrationPaths', currentRegPathId,
    'accessRules', 'invitationListAccess', 'isEmailOnlyInvite']);
};

export const isOnProcessOfflineRegPath = (state) => {
  const currentRegPathId = getRegistrationPathId(state);
  const creditCardSettings = getIn(state, ['appData', 'registrationPathSettings', currentRegPathId,
    'paymentSettings', 'creditCard']);
  return creditCardSettings?.enabled && creditCardSettings?.processOffline;
};

export const isArriveFromPublicWeblink = (state) => {
  return !(getIn(state, ['userSession', 'inviteeId']) || getAttendeeId(state));
};

export const isPopulateKnownInviteeInformation = (state, registrationPathId) => {
  const registrationPath = getRegistrationPath(state.appData, registrationPathId);
  return getIn(registrationPath, ['identityConfirmation', 'populateKnownInviteeInformation']);
};

/**
 * Returns true when reg-type is auto-assigned in case of single required reg-type available
 */
export const isAutoAssignRegTypeApplicableForEventRegistration = (regCart, eventRegistrationId) => {
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'autoAssignRegTypeForEventRegistration']);
};
