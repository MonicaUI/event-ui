import { pickBy, isEmpty, size, mapValues, has } from 'lodash';
import { setIn, getIn, merge, push, updateIn } from 'icepick';
import uuid from 'uuid';
import Logger from '@cvent/nucleus-logging';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { loadAvailableCapacityCounts } from '../../capacity';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import {
  getAdmissionItems,
  getSessions,
  isRegistrationModification,
  getSelectedAdmissionItem,
  getGuestsOfRegistrant,
  getWaitlistSessions,
  getRegistrationTypeId,
  getRegistrationPathId,
  getSessionBundles
} from './selectors';
import {
  updateAdmissionItemRegistration,
  updateSessionRegistration,
  updateSessionWaitlist,
  getInitialProductRegistrations,
  setAdminRegOnProductionSelection
} from './internal';
import {
  UPDATE_REG_CART_PENDING,
  UPDATE_REG_CART_FAILURE_FOR_GUEST,
  UPDATE_REG_CART_SUCCESS,
  SET_CURRENT_GUEST_EVENT_REGISTRATION,
  CLEAR_CURRENT_GUEST_EVENT_REGISTRATION
} from './actionTypes';
import { SAVING_REGISTRATION } from '../../registrationIntents';
import { getUpdateErrors, findKnownErrorResourceKey } from '../errors';
import { openKnownErrorDialog } from '../../../dialogs';
import { getDefaultAdmissionItemIdSelectionForRegType } from '../../selectors/event';
import {
  isProductVisibleForEventRegistration,
  getEventRegistrationId,
  isAutoAssignRegTypeApplicableForEventRegistration
} from '../../selectors/currentRegistrant';
import { isGuestProductSelectionEnabledOnRegPath } from '../../selectors/currentRegistrationPath';
import { populateVisibleProducts } from '../../visibleProducts';
import { evaluateQuestionVisibilityLogic } from '../../actions';
import { handleRegTypeConflictFromServiceValidationResult } from '../../../dialogs/selectionConflictDialogs';
import { REGISTRATION_SOURCE_TYPES, REQUESTED_ACTIONS } from 'event-widgets/constants/Request';

const LOG = new Logger('redux/registrationForm/regCart/guests');

function shouldAutoAssignRegType(isFlexAutoAssignRegTypeExperimentEnabled, lastGuestAdded, savedRegCart) {
  return (
    isFlexAutoAssignRegTypeExperimentEnabled &&
    lastGuestAdded?.eventRegistrationId &&
    !!isAutoAssignRegTypeApplicableForEventRegistration(savedRegCart, lastGuestAdded.eventRegistrationId)
  );
}

function setAutoAssignRegTypeIdForEventRegistration(savedRegCart, lastGuestAdded) {
  return {
    ...lastGuestAdded,
    autoAssignRegTypeForEventRegistration: true,
    registrationTypeId: getRegistrationTypeId(savedRegCart, lastGuestAdded.eventRegistrationId)
  };
}

function updateRegCartWithGuestsAdmissionItem(regCart, currentRegistrantId, lastSavedRegCart, productId) {
  // Get all admission items i.e admission item with 'REGISTER' and 'UNREGISTER' as requested action
  const currentRegistrantAdmissionItems = getAdmissionItems(regCart, currentRegistrantId);
  const primaryAdmissionItem = getSelectedAdmissionItem(regCart, currentRegistrantId);
  const currentRegistrantGuests = getGuestsOfRegistrant(regCart, currentRegistrantId);
  const primaryLastSavedAdmissionItem = getSelectedAdmissionItem(lastSavedRegCart, currentRegistrantId);
  const isRegMod = isRegistrationModification(regCart);
  if (
    currentRegistrantGuests.length === 0 ||
    !currentRegistrantAdmissionItems ||
    isEmpty(currentRegistrantAdmissionItems) ||
    !primaryAdmissionItem
  ) {
    return regCart;
  }
  const primaryChoseSameAdmissionItem =
    productId === primaryAdmissionItem.productId
      ? primaryLastSavedAdmissionItem && primaryLastSavedAdmissionItem.productId === primaryAdmissionItem.productId
      : true;
  let regCartWithGuestUpdates = regCart;
  currentRegistrantGuests.forEach(guestReg => {
    const guestSelectedAdmissionItem = getSelectedAdmissionItem(regCart, guestReg.eventRegistrationId);
    const shouldUpdatePreviousGuestSelections =
      productId === primaryAdmissionItem.productId
        ? guestSelectedAdmissionItem &&
          guestSelectedAdmissionItem.productId !== productId &&
          primaryChoseSameAdmissionItem
        : false;
    /**
     * FLEX-25013 - During regMod only a guest who previously registered for a adm item can get the
     * adm item back if the primary doesn't have visibility to the adm item. Since we don't pass in productId
     * when we set a adm item to unregister. If the adm item is set to 'UNREGISTER' and has matching productId
     * that means it was reselected by primary so give it back to the guest who had previously registered
     */
    const guestAdmissionItems = getAdmissionItems(regCart, guestReg.eventRegistrationId);
    const reselectAdmissionItem = Object.values(currentRegistrantAdmissionItems).some(admissionItem => {
      const admissionItemContainedByGuest =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, no-prototype-builtins
        guestAdmissionItems && guestAdmissionItems.hasOwnProperty((admissionItem as $TSFixMe).productId);
      const isAdmissionItemBeingUnregistered =
        admissionItemContainedByGuest && (admissionItem as $TSFixMe).requestedAction === 'UNREGISTER';
      return isRegMod && isAdmissionItemBeingUnregistered && productId === (admissionItem as $TSFixMe).productId;
    });
    if (
      !guestSelectedAdmissionItem ||
      !primaryChoseSameAdmissionItem ||
      shouldUpdatePreviousGuestSelections ||
      reselectAdmissionItem
    ) {
      const guestRegUpdates = {
        ...guestReg,
        ...updateAdmissionItemRegistration(
          regCart,
          guestReg.eventRegistrationId,
          reselectAdmissionItem ? productId : primaryAdmissionItem.productId
        )
      };
      regCartWithGuestUpdates = setIn(
        regCartWithGuestUpdates,
        ['eventRegistrations', guestReg.eventRegistrationId],
        guestRegUpdates
      );
    }
  });
  return regCartWithGuestUpdates;
}

function updateRegCartWithGuestsSessions(
  regCart,
  currentRegistrantId,
  lastSavedRegCart,
  productId,
  isSessionVisibleToPrimary
) {
  // Copy all sessions to guest, sessions with both 'UNREGISTER' and 'REGISTER' as requested action are copied.
  const currentRegistrantAllSessions = getSessions(regCart, currentRegistrantId);
  // fetches all the waitlisted sessions for the current registrant.
  const currentRegistrantAllWaitlistedSessions = getWaitlistSessions(regCart, currentRegistrantId);
  const currentRegistrantGuests = getGuestsOfRegistrant(regCart, currentRegistrantId);
  const isRegMod = isRegistrationModification(regCart);
  /**
   * For FLEX-21900 - This gets the previously registered items so we don't change those selections if switching paths
   * from where guests choose their own items to guest get the same as the primary
   */
  const currentRegistrantLastSavedRegisteredGuests = getGuestsOfRegistrant(lastSavedRegCart, currentRegistrantId);
  // If no sessions to Register / unregistered, nothing to do here, exit
  if (
    currentRegistrantGuests.length === 0 ||
    ((!currentRegistrantAllSessions || isEmpty(currentRegistrantAllSessions)) &&
      (!currentRegistrantAllWaitlistedSessions || isEmpty(currentRegistrantAllWaitlistedSessions)))
  ) {
    return regCart;
  }
  // get all optional sessions which are being registered / unregistered for by primary
  const primaryOptionalSessions = pickBy(
    currentRegistrantAllSessions,
    session =>
      session.registrationSourceType !== REGISTRATION_SOURCE_TYPES.ADMISSION_ITEM &&
      session.registrationSourceType !== REGISTRATION_SOURCE_TYPES.INCLUDED &&
      session.registrationSourceType !== REGISTRATION_SOURCE_TYPES.SESSION_BUNDLE
  );
  let regCartWithGuestUpdates = regCart;
  currentRegistrantGuests.forEach(guestReg => {
    let updatedGuestReg = regCartWithGuestUpdates.eventRegistrations[guestReg.eventRegistrationId];
    // if new guest copy all sessions from the primary
    const isNewGuest = !currentRegistrantLastSavedRegisteredGuests.find(
      eventReg => eventReg.eventRegistrationId === guestReg.eventRegistrationId
    );
    // copy all optional sessions which are being registered and unregister any sessions for guest
    Object.values(primaryOptionalSessions).forEach(
      // eslint-disable-next-line complexity
      session => {
        const sessionContainedByGuest =
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          updatedGuestReg.sessionRegistrations && // eslint-disable-next-line no-prototype-builtins
          updatedGuestReg.sessionRegistrations.hasOwnProperty(session.productId);
        const isSessionBeingUnregistered = sessionContainedByGuest && session.requestedAction === 'UNREGISTER';
        const isNewOrRegisteredSession = session.requestedAction === 'REGISTER';
        // if the session wasn't previously registered for register it for guests already in the cart
        const shouldUpdatePreviousGuestSelections =
          session.productId === productId && session.requestedAction === 'REGISTER';
        /**
         * FLEX-25013 - During regMod only a guest who previously registered for a session can get the
         * session back if the primary doesn't have visibility to the session. Since we don't pass in productId
         * when we set a session to unregister. If the session is set to 'UNREGISTER' and has matching productId
         * that means it was reselected by primary so give it back to the guest with previously registered
         */
        const reselectSession =
          isRegMod && productId === session.productId && isSessionBeingUnregistered && !isSessionVisibleToPrimary;
        if (
          isSessionBeingUnregistered ||
          (isNewGuest && isNewOrRegisteredSession) ||
          shouldUpdatePreviousGuestSelections
        ) {
          const guestRegUpdates = {
            ...updatedGuestReg,
            ...updateSessionRegistration(
              updatedGuestReg.sessionRegistrations,
              session.productId,
              isNewOrRegisteredSession || reselectSession ? 'REGISTER' : 'UNREGISTER'
            )
          };
          regCartWithGuestUpdates = setIn(
            regCartWithGuestUpdates,
            ['eventRegistrations', guestReg.eventRegistrationId],
            guestRegUpdates
          );
          updatedGuestReg = regCartWithGuestUpdates.eventRegistrations[guestReg.eventRegistrationId];
        }
      }
    );
    // copy all waitlisted sessions being joined/left for guest.
    Object.values(currentRegistrantAllWaitlistedSessions).forEach(
      // eslint-disable-next-line complexity
      session => {
        const sessionContainedByGuest =
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          updatedGuestReg.sessionWaitlists && // eslint-disable-next-line no-prototype-builtins
          updatedGuestReg.sessionWaitlists.hasOwnProperty((session as $TSFixMe).productId);
        const isSessionBeingUnwaitlisted =
          sessionContainedByGuest && (session as $TSFixMe).requestedAction === 'LEAVE_WAITLIST';
        const isNewOrWaitlistedSession = (session as $TSFixMe).requestedAction === 'WAITLIST';

        const shouldUpdatePreviousGuestSelections =
          (session as $TSFixMe).productId === productId && (session as $TSFixMe).requestedAction === 'WAITLIST';

        const reselectSession =
          isRegMod &&
          productId === (session as $TSFixMe).productId &&
          isSessionBeingUnwaitlisted &&
          !isSessionVisibleToPrimary;
        if (
          isSessionBeingUnwaitlisted ||
          (isNewGuest && isNewOrWaitlistedSession) ||
          shouldUpdatePreviousGuestSelections
        ) {
          const guestRegUpdates = {
            ...updatedGuestReg,
            ...updateSessionWaitlist(
              updatedGuestReg.sessionWaitlists,
              (session as $TSFixMe).productId,
              isNewOrWaitlistedSession || reselectSession ? 'WAITLIST' : 'LEAVE_WAITLIST'
            )
          };
          regCartWithGuestUpdates = setIn(
            regCartWithGuestUpdates,
            ['eventRegistrations', guestReg.eventRegistrationId],
            guestRegUpdates
          );
          updatedGuestReg = regCartWithGuestUpdates.eventRegistrations[guestReg.eventRegistrationId];
        }
      }
    );
  });
  return regCartWithGuestUpdates;
}

function updateRegCartWithGuestsSessionBundles(regCart, currentRegistrantId) {
  const currentRegistrantGuests = getGuestsOfRegistrant(regCart, currentRegistrantId);
  const currentRegistrantSessionBundles = getSessionBundles(regCart, currentRegistrantId);

  if (isEmpty(currentRegistrantGuests) || isEmpty(currentRegistrantSessionBundles)) {
    return regCart;
  }
  return updateIn(regCart, ['eventRegistrations'], eventRegistrations =>
    mapValues(eventRegistrations, eventRegistration => {
      if (eventRegistration.primaryRegistrationId !== currentRegistrantId) {
        return eventRegistration;
      }

      return updateIn(eventRegistration, ['sessionBundleRegistrations'], sessionBundleRegistrations => {
        // Unregister any session bundle registrations that the current registrant doesn't have
        const updatedSessionBundleRegistrations = mapValues(sessionBundleRegistrations, sessionBundleRegistration =>
          updateIn(sessionBundleRegistration, ['requestedAction'], requestedAction => {
            if (!has(currentRegistrantSessionBundles, [sessionBundleRegistration.productId])) {
              return REQUESTED_ACTIONS.UNREGISTER;
            }
            return requestedAction;
          })
        );
        // Add any session bundle registrations from the current registrant that this event registration is missing
        // Overwrite requestedAction if necessary
        return merge(updatedSessionBundleRegistrations, currentRegistrantSessionBundles);
      });
    })
  );
}

export function updateGuestsToMatchPrimaryReg(
  regCart: $TSFixMe,
  currentRegistrantId: $TSFixMe,
  state: $TSFixMe,
  productId?: $TSFixMe
): $TSFixMe {
  let updatedRegCart = regCart;

  const {
    regCartStatus: { lastSavedRegCart }
  } = state;
  const isSessionVisibleToPrimary = isProductVisibleForEventRegistration(
    state.visibleProducts,
    productId,
    currentRegistrantId
  );
  const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
  if (!isGuestProductSelectionEnabled) {
    updatedRegCart = updateRegCartWithGuestsAdmissionItem(
      updatedRegCart,
      currentRegistrantId,
      lastSavedRegCart,
      productId
    );
    updatedRegCart = updateRegCartWithGuestsSessionBundles(updatedRegCart, currentRegistrantId);
    updatedRegCart = updateRegCartWithGuestsSessions(
      updatedRegCart,
      currentRegistrantId,
      lastSavedRegCart,
      productId,
      isSessionVisibleToPrimary
    );
  }

  return updatedRegCart;
}

function addGuestsToRegCart(state, eventId, regCart, guestCount, currentRegistrantId, translate, nullRegType) {
  /*
   * While adding guests:
   * 1) first change guests with 'UNREGISTER' requested action to 'REGISTER' and update their products
   * to the primary's
   * 2) If more guests need to be added, add new event reg objects
   */
  let regCartWithGuestUpdates = regCart;

  const currentRegistrantGuestCount = getGuestsOfRegistrant(regCart, currentRegistrantId).length;

  const existingDisplaySequences = getGuestsOfRegistrant(regCart, currentRegistrantId, null).map(
    guest => guest.displaySequence
  );
  const maxExistingDisplaySequence = existingDisplaySequences.length ? Math.max(...existingDisplaySequences) : 0;

  // Add new eventReg objects for guests if needed
  for (let i = 0; i < guestCount - currentRegistrantGuestCount; i++) {
    // The last name is going to be set to "Guest XX" which gets picked up by the reg API
    const translatedGuestText = translate('Registration_RegistrationSummary_GuestPlaceholderName__resx', {
      count: (currentRegistrantGuestCount + i + 1).toString().padStart(2, '0')
    });
    const newEventRegId = String(uuid.v4());

    const primaryAdmissionItem = getSelectedAdmissionItem(regCartWithGuestUpdates, currentRegistrantId);
    const productRegistrations = !isGuestProductSelectionEnabledOnRegPath(state)
      ? (primaryAdmissionItem && [primaryAdmissionItem]) || []
      : getInitialProductRegistrations(state);
    regCartWithGuestUpdates = setIn(regCartWithGuestUpdates, ['eventRegistrations', newEventRegId], {
      eventId,
      eventRegistrationId: newEventRegId,
      attendee: {
        personalInformation: {
          lastName: translatedGuestText,
          customFields: {}
        },
        eventAnswers: {}
      },
      attendeeType: 'GUEST',
      primaryRegistrationId: currentRegistrantId,
      productRegistrations: nullRegType ? [] : productRegistrations,
      requestedAction: 'REGISTER',
      displaySequence: maxExistingDisplaySequence + i + 1,
      sessionRegistrations: {},
      sessionBundleRegistrations: {},
      registrationTypeId: nullRegType ? null : defaultRegistrationTypeId
    });
  }
  return regCartWithGuestUpdates;
}

export function removeGuestByEventRegistrationId(regCart: $TSFixMe, eventRegistrationIdToRemove: $TSFixMe): $TSFixMe {
  return setIn(regCart, ['eventRegistrations', eventRegistrationIdToRemove, 'requestedAction'], 'UNREGISTER');
}

function removeGuestsFromRegCart(event, eventId, regCart, guestCount, currentRegistrantId) {
  let regCartWithGuestUpdates = regCart;
  const currentRegistrantsGuests = getGuestsOfRegistrant(regCart, currentRegistrantId).sort(
    (first, second) => first.displaySequence - second.displaySequence
  );
  const guestsToRemove = currentRegistrantsGuests.length - guestCount;
  for (let i = 0; i < guestsToRemove; i++) {
    regCartWithGuestUpdates = removeGuestByEventRegistrationId(
      regCartWithGuestUpdates,
      currentRegistrantsGuests.pop().eventRegistrationId
    );
  }
  return regCartWithGuestUpdates;
}

export function updateRegCartWithGuests(
  state: $TSFixMe,
  eventId: $TSFixMe,
  regCart: $TSFixMe,
  guestCount: $TSFixMe,
  currentRegistrantId: $TSFixMe,
  translate: $TSFixMe,
  nullRegType = false
): $TSFixMe {
  const currentRegistrantGuestCount = getGuestsOfRegistrant(regCart, currentRegistrantId).length;
  // TODO: Sort guests by displaySequence once we start persisting them across sessions

  let regCartWithGuestUpdates = regCart;
  if (currentRegistrantGuestCount === guestCount) {
    return updateGuestsToMatchPrimaryReg(regCart, currentRegistrantId, state);
  }

  if (currentRegistrantGuestCount < guestCount) {
    regCartWithGuestUpdates = addGuestsToRegCart(
      state,
      eventId,
      regCart,
      guestCount,
      currentRegistrantId,
      translate,
      nullRegType
    );
  }

  if (currentRegistrantGuestCount > guestCount) {
    regCartWithGuestUpdates = removeGuestsFromRegCart(state.event, eventId, regCart, guestCount, currentRegistrantId);
  }
  return updateGuestsToMatchPrimaryReg(regCartWithGuestUpdates, currentRegistrantId, state);
}

/**
 * Action to set the current guest info to be edited/added
 * @param {Object} guestEventRegistration event registration of guest to be edited/added
 * @param addGuestFromRelatedContacts the property set to true when related contact can be added as guest
 */
export function setCurrentGuestEventRegistration(
  guestEventRegistration: $TSFixMe,
  addGuestFromRelatedContacts = false
): $TSFixMe {
  const {
    attendee: { personalInformation }
  } = guestEventRegistration;
  let eventReg = guestEventRegistration;
  /**
   * When we add a guest to the regCart we just give them a lastName. So when we set the current guest before
   * we open the guest details modal if they are missing a firstName set the instance last name to empty so it
   * doesn't populate with GUEST XX in the lastName field.
   */
  if (!personalInformation.firstName && !addGuestFromRelatedContacts) {
    eventReg = setIn(guestEventRegistration, ['attendee', 'personalInformation', 'lastName'], '');
  }
  if (!guestEventRegistration.registrationTypeId) {
    eventReg = setIn(eventReg, ['registrationTypeId'], defaultRegistrationTypeId);
  }
  return {
    type: SET_CURRENT_GUEST_EVENT_REGISTRATION,
    payload: {
      currentGuestEventRegistration: eventReg || {}
    }
  };
}

/**
 * Calls the registration api to update the number of guests or guest info / answers.
 * Also, it handles any capacity related issues that may happen due to this update.
 * @param {RegCart} regCartWithGuestUpdates reg cart object with guests
 */
export function updateGuestsInRegCart(regCartWithGuestUpdates: $TSFixMe, shouldAddTemporaryGuestInfo = false) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe, { apolloClient }: $TSFixMe = {}): Promise<$TSFixMe> => {
    let response;
    LOG.debug('updateGuestsInRegCart', regCartWithGuestUpdates);
    const {
      accessToken,
      regCartStatus: { lastSavedRegCart, registrationIntent },
      clients: { regCartClient },
      event,
      account,
      experiments: { isFlexAutoAssignRegTypeEnabled }
    } = getState();
    if (registrationIntent === SAVING_REGISTRATION) {
      return;
    }
    dispatch({ type: UPDATE_REG_CART_PENDING });
    const currentEventRegId = getEventRegistrationId(getState());
    const lastSavedAttendee = getIn(lastSavedRegCart, ['eventRegistrations', currentEventRegId, 'attendee']);
    let regCartToPost = setIn(
      regCartWithGuestUpdates,
      ['eventRegistrations', currentEventRegId, 'attendee'],
      lastSavedAttendee
    );
    // Remove admin infomation from regcart with updates
    regCartToPost = setAdminRegOnProductionSelection(lastSavedRegCart, regCartToPost);
    try {
      dispatch({
        type: UPDATE_REG_CART_PENDING
      });
      response = await regCartClient.updateRegCart(accessToken, regCartToPost);
      LOG.debug('updated event registrations for guests', regCartToPost);
      const lastGuestAdded = getGuestsOfRegistrant(regCartToPost, currentEventRegId).pop();
      // Add back the primary's info while saving to state
      const savedRegCart = response.regCart;
      const notSavedAttendee = getIn(regCartWithGuestUpdates, ['eventRegistrations', currentEventRegId, 'attendee']);
      let regCartWithUnsavedChanges = setIn(
        savedRegCart,
        ['eventRegistrations', currentEventRegId, 'attendee'],
        notSavedAttendee
      );
      // Put back unsaved Admin information
      regCartWithUnsavedChanges = setAdminRegOnProductionSelection(regCartWithGuestUpdates, regCartWithUnsavedChanges);
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: regCartWithUnsavedChanges,
          savedRegCart,
          validationMessages: response.validationMessages
        }
      });

      /*
       * We need to update the lastGuestAdded with regTypeId from savedRegCart in case of auto-assign regType
       * This feature is behind experiment: flex_auto_assign_reg_type_experiment and governed by a
       * flag: autoAssignRegTypeForEventRegistration in event registration object
       */
      const lastGuestAddedAutoAssignedRegTypeIfApplicable = shouldAutoAssignRegType(
        isFlexAutoAssignRegTypeEnabled,
        lastGuestAdded,
        savedRegCart
      )
        ? setAutoAssignRegTypeIdForEventRegistration(savedRegCart, lastGuestAdded)
        : lastGuestAdded;

      if (shouldAddTemporaryGuestInfo) {
        await dispatch(setCurrentGuestEventRegistration(lastGuestAddedAutoAssignedRegTypeIfApplicable));
      }
      await Promise.all([dispatch(loadAvailableCapacityCounts())]);
      if (lastGuestAddedAutoAssignedRegTypeIfApplicable) {
        // if current register still has a guest, check whether new guests added.
        Object.values(getGuestsOfRegistrant(regCartToPost, currentEventRegId)).forEach(eventReg => {
          if (
            !Object.keys(lastSavedRegCart.eventRegistrations).find(
              regCartEventRegistrationId => regCartEventRegistrationId === (eventReg as $TSFixMe).eventRegistrationId
            )
          ) {
            dispatch(populateVisibleProducts((eventReg as $TSFixMe).eventRegistrationId));
          }
        });
      }
      // Refetch session bundles to obtain new capacities
      apolloClient?.cache?.evict?.({ fieldName: 'products' });
      LOG.debug('update reg cart with guests success');
    } catch (error) {
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(regCartToPost, currentEventRegId),
          getRegistrationPathId(regCartToPost, currentEventRegId)
        )
      ) {
        return;
      }
      dispatch(hideLoadingOnError());
      dispatch({ type: UPDATE_REG_CART_FAILURE_FOR_GUEST, payload: { error } });

      throw error;
    }
    return response;
  };
}

export const clearTemporaryGuestInformation = () => {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch({ type: CLEAR_CURRENT_GUEST_EVENT_REGISTRATION });
    dispatch(evaluateQuestionVisibilityLogic(null, true, false));
  };
};

/**
 * Returns a shallow copy of the error with validation messages filtered by eventRegistrationId
 * @param error {Error} the original error
 * @param eventRegistrationId {String}
 * @returns {{responseBody: {validationMessages: T[]}}}
 */
export function filterErrorMessagesByRegId(error: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe {
  const guestValidationsMessages = (error?.responseBody?.validationMessages || []).filter(
    m => m?.parametersMap?.eventRegistrationId === eventRegistrationId
  );
  return {
    ...error,
    responseBody: {
      ...(error.responseBody || {}),
      validationMessages: guestValidationsMessages
    }
  };
}

export function setGuestAdmissionItem(state: $TSFixMe): $TSFixMe {
  const {
    registrationForm: { regCart, currentGuestEventRegistration = undefined }
  } = state;
  const currentGuestEventRegistrationId =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    currentGuestEventRegistration && currentGuestEventRegistration.eventRegistrationId;
  let guestEventRegistration = currentGuestEventRegistration;
  // if guest widget on same page as admission item set the admission item to default on save
  const hasNoAdmissionItem = size(getAdmissionItems(regCart, currentGuestEventRegistrationId)) === 0;
  // if guest can choose their own items then auto-assign them the default for their regType
  const isGuestProductSelectionEnabled = isGuestProductSelectionEnabledOnRegPath(state);
  if (hasNoAdmissionItem && isGuestProductSelectionEnabled) {
    const defaultAdmissionItemId = getDefaultAdmissionItemIdSelectionForRegType(
      state,
      currentGuestEventRegistration.registrationTypeId
    );
    if (defaultAdmissionItemId) {
      guestEventRegistration = setIn(
        guestEventRegistration,
        ['productRegistrations'],
        push(guestEventRegistration.productRegistrations, {
          productId: defaultAdmissionItemId,
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        })
      );
    }
  }
  const regCartWithAdmissionItem = setIn(
    regCart,
    ['eventRegistrations', currentGuestEventRegistrationId],
    guestEventRegistration
  );
  return regCartWithAdmissionItem;
}

export function updateGuestDetails(openGuestDetailsDialog?: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      registrationForm: { regCart, currentGuestEventRegistration = undefined }
    } = getState();
    const currentGuestEventRegistrationId =
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      currentGuestEventRegistration && currentGuestEventRegistration.eventRegistrationId;

    if (!(currentGuestEventRegistration || currentGuestEventRegistrationId)) {
      LOG.debug('Temporary guest info missing in state');
      return;
    }
    if (!regCart) {
      LOG.debug('RegCart missing in state');
      return;
    }
    const prevRegistrationTypeId = getIn(regCart, [
      'eventRegistrations',
      currentGuestEventRegistrationId,
      'registrationTypeId'
    ]);
    const prevAdmissionItem = getSelectedAdmissionItem(regCart, currentGuestEventRegistrationId);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const prevAdmissionItemId = prevAdmissionItem && prevAdmissionItem.productId;
    const regCartWithUpdatedGuestDetails = setGuestAdmissionItem(getState());
    const currentAdmissionItem = getSelectedAdmissionItem(
      regCartWithUpdatedGuestDetails,
      currentGuestEventRegistrationId
    );
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const currentAdmissionItemId = currentAdmissionItem && currentAdmissionItem.productId;
    const currentRegistrationTypeId = getIn(regCartWithUpdatedGuestDetails, [
      'eventRegistrations',
      currentGuestEventRegistrationId,
      'registrationTypeId'
    ]);
    try {
      await dispatch(updateGuestsInRegCart(regCartWithUpdatedGuestDetails, false));
      if (prevRegistrationTypeId !== currentRegistrationTypeId || prevAdmissionItemId !== currentAdmissionItemId) {
        await dispatch(populateVisibleProducts(currentGuestEventRegistrationId));
      }
      await dispatch(clearTemporaryGuestInformation());
    } catch (error) {
      if (getUpdateErrors.isGuestEmailIdInvalid(error)) {
        return await dispatch(
          openKnownErrorDialog(
            findKnownErrorResourceKey(error.responseBody.validationMessages),
            null,
            openGuestDetailsDialog
          )
        );
      }
      const sessionBundleRegTypeConflictValidations = getUpdateErrors.getRegTypeConflictSessionBundleParams(error);
      if (sessionBundleRegTypeConflictValidations?.length > 0) {
        const boundUpdateGuestDetails = updateGuestDetails.bind(null, openGuestDetailsDialog);
        return await dispatch(
          handleRegTypeConflictFromServiceValidationResult(
            currentGuestEventRegistrationId,
            sessionBundleRegTypeConflictValidations,
            boundUpdateGuestDetails,
            null
          )
        );
      }
      const guestError = filterErrorMessagesByRegId(error, currentGuestEventRegistrationId);
      if (getUpdateErrors.isKnownError(guestError)) {
        return await dispatch(
          openKnownErrorDialog(
            findKnownErrorResourceKey(guestError.responseBody.validationMessages),
            null,
            openGuestDetailsDialog
          )
        );
      }
      throw error;
    }
  };
}
