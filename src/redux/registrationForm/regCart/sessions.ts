import { getIn, setIn } from 'icepick';
import { getLastSavedRegCart, canSessionBeWailisted } from './internal';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getRegCart } from '../../selectors/shared';
import {
  getGuestsOfRegistrant,
  getSessions,
  getWaitlistSessions,
  getSelectedSessions,
  getUnRegisteredSessions,
  getSelectedWaitlistedSessions,
  getUnSelectedWaitlistedSessions,
  isRegistrationModification
} from './selectors';
import { SESSION_THRESHOLD } from './partialUpdates';
import { isGuestProductSelectionEnabledOnRegPath } from '../../selectors/currentRegistrationPath';
import {
  getAttendee,
  isGroupRegistration,
  isProductVisibleForEventRegistration,
  isRegApprovalRequired
} from '../../selectors/currentRegistrant';
import { getPrimaryAndGuestSortedVisibleSessions } from '../../selectors/productSelectors';
import { openGuestProductSelectionDialogFromSessions } from '../../../dialogs';
import { removeSessionForSelectingWaitlist } from '../../sessionsInWaitlist';
import { removeSessionForWaitlistingGuests } from '../../waitlistSelectionForGuests';
import { isEmpty } from 'lodash';
import { isPlannerRegistration } from '../../defaultUserSession';
import { SAVING_REGISTRATION } from '../../registrationIntents';
import {
  UPDATE_REG_CART_SESSION_PENDING,
  UPDATE_REG_CART_SESSION_SUCCESS,
  UPDATE_REG_CART_SESSION_FAILURE
} from './actionTypes';
import Logger from '@cvent/nucleus-logging';
import { loadAvailableSessionCapacityCounts } from '../../capacity';
import { getAllSessionCapacityIds } from 'event-widgets/redux/modules/capacity';
import { getUpdateErrors } from '../errors';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { openCapacityReachedDialog } from '../../../dialogs';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import { evaluateQuestionVisibilityLogic } from '../../actions';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';

const LOG = new Logger('redux/registrationForm/regCart/sessions');

export const WAITLIST_STATUS = {
  WAITLISTED: 'WAITLISTED',
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED'
};
export const PRODUCT_STATUS = {
  ACTIVE: 2,
  CLOSED: 3,
  CANCELLED: 7
};

const isWaitlisted = sessionRegistration =>
  sessionRegistration.requestedAction === REQUESTED_ACTIONS.WAITLIST ||
  sessionRegistration.requestedAction === REQUESTED_ACTIONS.LEAVE_WAITLIST;

const WAITLIST_CAPACITYID_SUFFIX = 'waitlist';
const overrideCapacityIdIfWaitlist = productId => `${productId}_${WAITLIST_CAPACITYID_SUFFIX}`;

const filterUndefinedValuesFromArray = sessionRegistrationsToUpdate =>
  sessionRegistrationsToUpdate.filter(x => x !== undefined);

function getRegistrationSourceType(isForWaitlistingSession, eventReg, sessionId) {
  const registrationSourceType =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    eventReg.sessionRegistrations && eventReg.sessionRegistrations[sessionId]
      ? eventReg.sessionRegistrations[sessionId].registrationSourceType
      : 'Selected';
  return isForWaitlistingSession ? null : registrationSourceType;
}

const applyGuestSessionSelection = (
  sessionId,
  currentPrimaryRegId,
  selectedEventRegIds,
  eventRegistrations,
  forWaitlistingAttendees
) => {
  return async (dispatch, getState) => {
    dispatch(closeDialogContainer());
    const state = getState();
    const sessionRegistrationsToUpdate = [];
    const regCart = getRegCart(state);
    for (const eventRegistrationId of Object.keys(selectedEventRegIds)) {
      if (!selectedEventRegIds[eventRegistrationId]) {
        return;
      }

      const selectedEventRegIdObject = selectedEventRegIds[eventRegistrationId];
      const eventRegSessions = getSessions(regCart, eventRegistrationId);
      const eventWaitlistSessions = getWaitlistSessions(regCart, eventRegistrationId);
      if (selectedEventRegIdObject.isSelected) {
        if (
          selectedEventRegIdObject.registeredForProductInGroup &&
          sessionId !== selectedEventRegIdObject.registeredProductId
        ) {
          sessionRegistrationsToUpdate.push(
            ...(await dispatch(
              switchSessionRegistration(
                eventRegistrationId,
                selectedEventRegIdObject.registeredProductId,
                sessionId,
                forWaitlistingAttendees
              )
            ))
          );
        }
        sessionRegistrationsToUpdate.push(
          getSessionToBeUpdated(state, eventRegistrationId, sessionId, forWaitlistingAttendees)
        );

        if (!forWaitlistingAttendees && selectedEventRegIdObject.isWaitlisted) {
          /*
           * This case happens when an invitee is waitlisted in Bulk Reg and the user decides to
           * Select that invitee in Session capacity. So now, this invitee will be removed from waitlist.
           */
          sessionRegistrationsToUpdate.push(
            getSessionToBeUpdated(state, eventRegistrationId, sessionId, !forWaitlistingAttendees, false)
          );
        }
        // eslint-disable-next-line no-prototype-builtins
      } else if (eventRegSessions.hasOwnProperty(sessionId) || eventWaitlistSessions.hasOwnProperty(sessionId)) {
        // Unregister or leave the waitlist for the session if they previously had it and they are now unselected
        sessionRegistrationsToUpdate.push(
          getSessionToBeUpdated(state, eventRegistrationId, sessionId, forWaitlistingAttendees, false)
        );
      }
    }
    await dispatch(updateSessions(filterUndefinedValuesFromArray(sessionRegistrationsToUpdate)));
    await dispatch(evaluateQuestionVisibilityLogic(null, true, false));
  };
};

/**
 * handles optional sessions conflicts based on whether to use new sessions endpoint
 * or existing workflow
 */
export function handleOptionalSessionsConflicts(eventRegistrationId: $TSFixMe, invalidSessions: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    const sessionRegistrationsToBeUpdated = invalidSessions.map(invalidSession => {
      return {
        eventRegistrationId,
        productId: invalidSession.id,
        requestedAction: REQUESTED_ACTIONS.UNREGISTER,
        registrationSourceType: 'Selected'
      };
    });
    const sessionRegUpdate = await dispatch(updateSessions(sessionRegistrationsToBeUpdated, eventRegistrationId));
    await dispatch(evaluateQuestionVisibilityLogic(null, true, false));
    return sessionRegUpdate;
  };
}

type SessionRegistrationToUpdate = {
  eventRegistrationId: string;
  productId: string;
  registrationSourceType?: string;
  requestedAction: string;
};

function getOptimisticCapacityUpdates(sessionRegistrations) {
  return Object.values(sessionRegistrations)
    .map(sessionRegistration => {
      switch ((sessionRegistration as $TSFixMe).requestedAction) {
        case REQUESTED_ACTIONS.REGISTER:
          return { capacityId: (sessionRegistration as $TSFixMe).productId, change: -1 };
        case REQUESTED_ACTIONS.UNREGISTER:
          return { capacityId: (sessionRegistration as $TSFixMe).productId, change: 1 };
        case REQUESTED_ACTIONS.WAITLIST:
          return { capacityId: overrideCapacityIdIfWaitlist((sessionRegistration as $TSFixMe).productId), change: -1 };
        case REQUESTED_ACTIONS.LEAVE_WAITLIST:
          return { capacityId: overrideCapacityIdIfWaitlist((sessionRegistration as $TSFixMe).productId), change: 1 };
        default:
          return null;
      }
    })
    .filter(change => change);
}

export function updateSessions(
  sessionRegistrationsToUpdate: SessionRegistrationToUpdate[],
  eventRegistrationId?: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    LOG.debug('updateSessions', sessionRegistrationsToUpdate);
    // if there are no session registrations to update then return
    if (sessionRegistrationsToUpdate.length === 0) {
      return;
    }
    const {
      accessToken,
      registrationForm: { regCart: cart },
      regCartStatus: { registrationIntent },
      clients: { regCartClient },
      event: { attendingFormat = AttendingFormat.INPERSON }
    } = getState();

    if (registrationIntent === SAVING_REGISTRATION) {
      return;
    }

    dispatch({ type: UPDATE_REG_CART_SESSION_PENDING });

    try {
      LOG.debug('updateRegCartSessionRegistrations', sessionRegistrationsToUpdate);
      const response = await regCartClient.updateRegCartSessionRegistrations(
        accessToken,
        cart.regCartId,
        sessionRegistrationsToUpdate
      );
      LOG.debug('updateRegCartSessionRegistrations success');
      if (response) {
        const savedRegCart = response.regCart;
        const regCartWithUnsavedChanges = prepareRegCartWithUnsavedChanges(
          sessionRegistrationsToUpdate,
          savedRegCart,
          cart
        );

        const optimisticCapacityUpdates = getOptimisticCapacityUpdates(sessionRegistrationsToUpdate);
        dispatch({
          type: UPDATE_REG_CART_SESSION_SUCCESS,
          payload: {
            regCart: regCartWithUnsavedChanges,
            savedRegCart,
            validationMessages: response.validationMessages,
            optimisticCapacityUpdates
          }
        });

        //
        await dispatch(refreshSomeCapacityCounts(optimisticCapacityUpdates));
        LOG.debug('refreshSomeCapacityCounts success');

        if (eventRegistrationId) {
          return {
            sessionRegistrations: savedRegCart.eventRegistrations[eventRegistrationId].sessionRegistrations
          };
        }
      }
    } catch (error) {
      LOG.info('updateSessions failed', error);
      dispatch({ type: UPDATE_REG_CART_SESSION_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      if (
        getUpdateErrors.isProductAvailabilityError(error) ||
        (shouldHybridFlowWork(attendingFormat) && getUpdateErrors.isProductAvailabilityErrorInHybridEvent(error))
      ) {
        dispatch(loadAvailableSessionCapacityCounts());
        return await dispatch(openCapacityReachedDialog());
      }
      throw error;
    }
  };
}

function prepareRegCartWithUnsavedChanges(sessionRegistrationsToUpdate, savedRegCart, cart) {
  // Put the information that was saved as part of selecting a product back in the unsaved reg cart
  const eventRegIdsToUpdateForWaitlistSessions = sessionRegistrationsToUpdate
    .filter(sessionRegistrationToUpdate => isWaitlisted(sessionRegistrationToUpdate))
    .map(sessionReg => sessionReg.eventRegistrationId);
  const eventRegIdsToUpdateForSessionRegistrations = sessionRegistrationsToUpdate
    .filter(sessionRegistrationToUpdate => !isWaitlisted(sessionRegistrationToUpdate))
    .map(sessionReg => sessionReg.eventRegistrationId);
  let regCartWithUnsavedChanges = cart;
  for (const eventRegistrationId of eventRegIdsToUpdateForWaitlistSessions) {
    const savedSessionRegistrationsByRegId = getIn(savedRegCart, [
      'eventRegistrations',
      eventRegistrationId,
      'sessionWaitlists'
    ]);
    regCartWithUnsavedChanges = setIn(
      regCartWithUnsavedChanges,
      ['eventRegistrations', eventRegistrationId, 'sessionWaitlists'],
      savedSessionRegistrationsByRegId
    );
  }
  for (const eventRegistrationId of eventRegIdsToUpdateForSessionRegistrations) {
    const savedSessionRegistrationsByRegId = getIn(savedRegCart, [
      'eventRegistrations',
      eventRegistrationId,
      'sessionRegistrations'
    ]);
    regCartWithUnsavedChanges = setIn(
      regCartWithUnsavedChanges,
      ['eventRegistrations', eventRegistrationId, 'sessionRegistrations'],
      savedSessionRegistrationsByRegId
    );
  }
  return regCartWithUnsavedChanges;
}

/**
 * Refreshes some capacity counts after changing session selection.
 *
 * If the total number of sessions is < SESSION_THRESHOLD, just update them all for optimal UX.
 *
 * If there are more, this would result in poor, so instead, refresh only capacities that were released by the update.
 */
function refreshSomeCapacityCounts(optimisticCapacityUpdates) {
  return async (dispatch, getState) => {
    const { event } = getState();
    /**
     * for events having # of sessions greater than the SESSION_THRESHOLD value:
     *
     * 1. Due to performance degradation for events with a large number of sessions, we will be passing
     * sessionId of the (un)selected sessions to loadAvailableSessionCapacityCounts(),
     * so that only the (un)selected session's capacity is loaded along
     * with that of all the admisison items, regTypes, and the event itself. These will then be merged
     * along with the rest of the sessions' capacities.
     *
     * 2. we would update the session capacity count through state/UI
     *  - ONLY after user succesfully REGISTER a new session and internal total count for that session not 0
     *  - we would still need to load real-time capacity for
     * that specific session via capacity service call if user UNREGISTER the session
     */
    const releasedCapacityIds = Object.values(optimisticCapacityUpdates)
      .filter(change => (change as $TSFixMe).change > 0)
      .map(change => (change as $TSFixMe).capacityId);
    const allCapacityIds = getAllSessionCapacityIds(event);
    const sessionCapacityIds = allCapacityIds.length > SESSION_THRESHOLD ? releasedCapacityIds : allCapacityIds;
    if (sessionCapacityIds.length > 0) {
      await dispatch(loadAvailableSessionCapacityCounts(sessionCapacityIds));
      LOG.debug('loadAvailableSessionCapacityCounts success');
    }
  };
}

function getRequestedAction(
  lastSavedRegCart,
  isForWaitlistingSession,
  eventRegistrationId,
  sessionId,
  visibleProducts,
  isSessionSelected,
  isIncludedSession
) {
  const isRegMod = isRegistrationModification(lastSavedRegCart);
  const isSessionVisibleForPrimary = isProductVisibleForEventRegistration(
    visibleProducts,
    sessionId,
    eventRegistrationId
  );
  // PROD-124970: Added isIncludedSession check since session can be included with adm item and limited
  // as well which makes it not reflect in the visible product list hence reading this session-flag from reg cart
  if ((isRegMod && !isSessionVisibleForPrimary && !isIncludedSession) || !isSessionSelected) {
    return isForWaitlistingSession ? REQUESTED_ACTIONS.LEAVE_WAITLIST : REQUESTED_ACTIONS.UNREGISTER;
  }
  return isForWaitlistingSession ? REQUESTED_ACTIONS.WAITLIST : REQUESTED_ACTIONS.REGISTER;
}

function getSessionToBeUpdated(state, eventRegistrationId, sessionId, forWaitlist, isSessionSelected = true) {
  const lastSavedRegCart = state.regCartStatus.lastSavedRegCart;
  const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
  const selectedSessions = getSelectedSessions(lastSavedRegCart, eventRegistrationId);
  const isIncludedSession =
    // eslint-disable-next-line no-prototype-builtins
    !!selectedSessions.hasOwnProperty(sessionId) &&
    selectedSessions[sessionId].registrationSourceType === 'AdmissionItem';
  const requestedAction = getRequestedAction(
    lastSavedRegCart,
    forWaitlist,
    eventRegistrationId,
    sessionId,
    state.visibleProducts,
    isSessionSelected,
    isIncludedSession
  );
  const registrationSourceType = getRegistrationSourceType(forWaitlist, currentEventReg, sessionId);
  if (!forWaitlist) {
    return {
      eventRegistrationId,
      productId: sessionId,
      requestedAction,
      registrationSourceType
    };
  } else if (canSessionBeWailisted(currentEventReg.sessionWaitlists, sessionId, state)) {
    return {
      eventRegistrationId,
      productId: sessionId,
      requestedAction,
      registrationSourceType
    };
  }
}

/*
 * If guest is added and are enabled to assign same registrations as primary registration, then
 * get guest session registrations to match primary session registration
 */
function getGuestSessionsToMatchPrimaryReg(
  primarySessionRegistrationsToUpdate,
  guestEventRegs,
  guestProductSelectionEnabledOnRegPath
) {
  const guestSessionsToBeUpdated = [];
  if (guestEventRegs.length > 0 && !guestProductSelectionEnabledOnRegPath) {
    guestEventRegs.forEach(guestReg => {
      guestSessionsToBeUpdated.push(
        ...filterUndefinedValuesFromArray(primarySessionRegistrationsToUpdate).map(primarySessionReg => {
          return {
            ...primarySessionReg,
            eventRegistrationId: guestReg.eventRegistrationId
          };
        })
      );
    });
  }
  return filterUndefinedValuesFromArray(guestSessionsToBeUpdated);
}

/**
 * Update the regcart with a new session item selection
 */
export function unSelectSession(eventRegistrationId: $TSFixMe, sessionId: $TSFixMe, isForLeavingWaitlist = false) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const lastSavedRegCart = getLastSavedRegCart(getState);
    const guestProductSelectionEnabledOnRegPath = isGuestProductSelectionEnabledOnRegPath(state);
    const guestEventRegs = getGuestsOfRegistrant(lastSavedRegCart, eventRegistrationId);

    // Handle complex guest session selection if needed
    if (guestEventRegs.length > 0 && guestProductSelectionEnabledOnRegPath) {
      const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
      return await dispatch(
        handleSessionSelectionForComplexGuests(
          sessionId,
          lastSavedRegCart,
          eventRegistrationId,
          currentEventReg,
          guestEventRegs
        )
      );
    }
    const sessionRegistrationsToUpdate = [];
    sessionRegistrationsToUpdate.push(
      getSessionToBeUpdated(state, eventRegistrationId, sessionId, isForLeavingWaitlist, false)
    );
    /*
     * If guest is added and are enabled to assign same registrations as primary registration, then
     * update session registrations to update with guests session registrations
     */
    sessionRegistrationsToUpdate.push(
      ...getGuestSessionsToMatchPrimaryReg(
        sessionRegistrationsToUpdate,
        guestEventRegs,
        guestProductSelectionEnabledOnRegPath
      )
    );
    await dispatch(updateSessions(filterUndefinedValuesFromArray(sessionRegistrationsToUpdate)));
    await dispatch(evaluateQuestionVisibilityLogic(null, true, false));
  };
}

/**
 * Update the regcart with a new session item selection
 */
export function selectSession(eventRegistrationId: $TSFixMe, sessionId: $TSFixMe, isForWaitlistingSession = false) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const lastSavedRegCart = getLastSavedRegCart(getState);
    const guestProductSelectionEnabledOnRegPath = isGuestProductSelectionEnabledOnRegPath(state);
    const guestEventRegs = getGuestsOfRegistrant(lastSavedRegCart, eventRegistrationId);

    // Handle complex guest session selection if needed
    if (guestEventRegs.length > 0 && guestProductSelectionEnabledOnRegPath) {
      const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
      return await dispatch(
        handleSessionSelectionForComplexGuests(
          sessionId,
          lastSavedRegCart,
          eventRegistrationId,
          currentEventReg,
          guestEventRegs
        )
      );
    }

    const sessionRegistrationsToUpdate = [];
    sessionRegistrationsToUpdate.push(
      getSessionToBeUpdated(state, eventRegistrationId, sessionId, isForWaitlistingSession)
    );

    // Need to unregister/unwaitlist a session if the session is changed to waitlisted/registered respectively
    sessionRegistrationsToUpdate.push(
      changeAlreadyUpdatedSession(state, eventRegistrationId, sessionId, isForWaitlistingSession)
    );

    /*
     * If guest is added and are enabled to assign same registrations as primary registration, then
     * update session registrations to update with guests session registrations
     */
    sessionRegistrationsToUpdate.push(
      ...getGuestSessionsToMatchPrimaryReg(
        sessionRegistrationsToUpdate,
        guestEventRegs,
        guestProductSelectionEnabledOnRegPath
      )
    );

    await dispatch(updateSessions(filterUndefinedValuesFromArray(sessionRegistrationsToUpdate)));
    await dispatch(evaluateQuestionVisibilityLogic(null, true, false));
  };
}

function changeAlreadyUpdatedSession(state, eventRegistrationId, sessionId, forWaitlist) {
  // Need to unregister/unwaitlist a session if the session is changed to waitlisted/registered respectively
  const lastSavedRegCart = state.regCartStatus.lastSavedRegCart;
  const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
  const doesSessionNeedToBeUnWaitlisted =
    !forWaitlist &&
    getIn(currentEventReg, ['sessionWaitlists', sessionId])?.requestedAction === REQUESTED_ACTIONS.WAITLIST;
  const doesSessionNeedToBeUnRegistered =
    forWaitlist &&
    getIn(currentEventReg, ['sessionRegistrations', sessionId])?.requestedAction === REQUESTED_ACTIONS.REGISTER;
  if (!!doesSessionNeedToBeUnRegistered || !!doesSessionNeedToBeUnWaitlisted) {
    return getSessionToBeUpdated(state, eventRegistrationId, sessionId, !!doesSessionNeedToBeUnWaitlisted, false);
  }
}

function handleSessionSelectionForComplexGuests(
  sessionId,
  lastSavedRegCart,
  eventRegistrationId,
  currentEventReg,
  guestEventRegs
) {
  return async (dispatch, getState) => {
    const state = getState();
    const eventRegistrations = guestEventRegs;
    const currentAttendee = getAttendee(state);
    const allSessions = getPrimaryAndGuestSortedVisibleSessions(state) || {};
    const spinnerSelection = { spinnerSelectionId: sessionId };
    // Grab the session from list of all sessions and session groups
    let session = allSessions.find(s => s.id === sessionId);
    let selectedSessionInGroup;
    let selectedSessionGroup;
    Object.values(allSessions).forEach(sessionGroup => {
      if ((sessionGroup as $TSFixMe).sessions) {
        if (isEmpty(selectedSessionInGroup)) {
          selectedSessionInGroup = Object.values((sessionGroup as $TSFixMe).sessions).filter(
            s => (s as $TSFixMe).id === sessionId
          );
          selectedSessionGroup = sessionGroup;
          if (!session) {
            session = Object.values((sessionGroup as $TSFixMe).sessions).find(s => (s as $TSFixMe).id === sessionId);
          }
        }
      }
    });

    // By default, the waitlisting flow is false
    let forWaitlisting = false;

    if (getIn(state, ['waitlistSelectionForGuests', sessionId])) {
      /*
       * If the above condition comes out to be true, then,
       * we need to follow the path for waitlisting a session.
       */
      forWaitlisting = true;
      await dispatch(removeSessionForWaitlistingGuests(sessionId));
      const sessionTitle = session.name;
      const sessionStatus = session.status;
      const sessionCapacity = getIn(state, ['capacity', session.waitlistCapacityId, 'availableCapacity']);
      // in the case of waitlisting for sessions, even the planner cannot overshoot capacity.
      const overrideCapacity = false;
      const isGroupReg = isGroupRegistration(state);
      eventRegistrations.unshift({
        ...currentEventReg,
        attendee: {
          ...currentAttendee
        }
      });
      const eventRegSelections = {};
      const isRegApproval = isRegApprovalRequired(state);
      let selectedCount = 0;
      eventRegistrations.forEach(eventReg => {
        const eventRegId = eventReg.eventRegistrationId;
        const selectedSessions = getSelectedSessions(lastSavedRegCart, eventReg.eventRegistrationId);
        const waitlistedSessions = getSelectedWaitlistedSessions(lastSavedRegCart, eventReg.eventRegistrationId);
        const sessionIsVisible = isProductVisibleForEventRegistration(state.visibleProducts, sessionId, eventRegId);
        const unRegisteredSessions = getUnSelectedWaitlistedSessions(lastSavedRegCart, eventReg.eventRegistrationId);
        let registeredForProductInGroup = false;
        let registeredProductId;
        /**
         *  Goes through the session group and finds if registrants is already registered for
         *  a session in the group. This helps with creating the two dynamic lists in the modal
         *  and switching sessions in session groups
         */
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const sessionGroupSessions = (selectedSessionGroup && selectedSessionGroup.sessions) || {};
        Object.values(sessionGroupSessions).forEach(sessions => {
          if (
            // eslint-disable-next-line no-prototype-builtins
            (selectedSessions.hasOwnProperty((sessions as $TSFixMe).id) ||
              // eslint-disable-next-line no-prototype-builtins
              waitlistedSessions.hasOwnProperty((sessions as $TSFixMe).id)) &&
            !isEmpty(selectedSessionInGroup)
          ) {
            registeredForProductInGroup = true;
            registeredProductId = (sessions as $TSFixMe).id;
          }
        });
        // Checks whether to disable a person if the current session group has been closed by planner
        const isClosedSessionGroupVisible =
          isEmpty(selectedSessionInGroup) || selectedSessionGroup.isOpenForRegistration
            ? true
            : // eslint-disable-next-line no-prototype-builtins
              waitlistedSessions.hasOwnProperty(sessionId) || unRegisteredSessions.hasOwnProperty(sessionId);

        if (getIn(eventReg, ['sessionRegistrations', sessionId, 'requestedAction']) !== REQUESTED_ACTIONS.REGISTER) {
          eventRegSelections[eventRegId] = {
            // eslint-disable-next-line no-prototype-builtins
            isSelected: !!waitlistedSessions.hasOwnProperty(sessionId),
            isDisabled: !sessionIsVisible || !isClosedSessionGroupVisible,
            isIncluded:
              // eslint-disable-next-line no-prototype-builtins
              !!waitlistedSessions.hasOwnProperty(sessionId) &&
              waitlistedSessions[sessionId].registrationSourceType === 'AdmissionItem',
            registeredForProductInGroup,
            registeredProductId
          };
          selectedCount +=
            eventRegSelections[eventRegId].isSelected || eventRegSelections[eventRegId].isIncluded ? 1 : 0;
        }
      });
      const regApprovalCapacity =
        sessionCapacity !== -1 && sessionCapacity <= selectedCount ? 0 : sessionCapacity - selectedCount;

      const productCapacity = isRegApproval && sessionCapacity !== -1 ? regApprovalCapacity : sessionCapacity;

      await dispatch(
        openGuestProductSelectionDialogFromSessions(
          'EventGuestSide_SessionWaitlist_WaitlistAttendeesText__resx',
          sessionId,
          sessionTitle,
          productCapacity,
          overrideCapacity,
          eventRegSelections,
          eventRegistrations,
          eventRegistrationId,
          isGroupReg,
          applyGuestSessionSelection,
          null,
          null,
          forWaitlisting,
          sessionStatus,
          null,
          spinnerSelection
        )
      );

      return;
    }

    // This is the normal path of selecting the session from main capacity
    const sessionTitle = session.name;
    const sessionStatus = session.status;
    const sessionCapacity = getIn(state, ['capacity', session.capacityId, 'availableCapacity']);
    const overrideCapacity = !!getIn(state, ['defaultUserSession', 'isPlanner']);
    const isGroupReg = isGroupRegistration(state);
    eventRegistrations.unshift({
      ...currentEventReg,
      attendee: {
        ...currentAttendee
      }
    });
    const eventRegSelections = {};
    const isRegApproval = isRegApprovalRequired(state);
    let selectedCount = 0;
    // eslint-disable-next-line complexity
    eventRegistrations.forEach(eventReg => {
      const eventRegId = eventReg.eventRegistrationId;
      const selectedSessions = getSelectedSessions(lastSavedRegCart, eventReg.eventRegistrationId);
      const waitlistedSessions = getSelectedWaitlistedSessions(lastSavedRegCart, eventReg.eventRegistrationId);
      const sessionIsVisible = isProductVisibleForEventRegistration(state.visibleProducts, sessionId, eventRegId);
      const unRegisteredSessions = getUnRegisteredSessions(lastSavedRegCart, eventReg.eventRegistrationId);
      let registeredForProductInGroup = false;
      let registeredProductId;
      /**
       *  Goes through the session group and finds if registrants is already registered for
       *  a session in the group. This helps with creating the two dynamic lists in the modal
       *  and switching sessions in session groups
       */
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const sessionGroupSessions = (selectedSessionGroup && selectedSessionGroup.sessions) || {};
      Object.values(sessionGroupSessions).forEach(sessions => {
        if (
          // eslint-disable-next-line no-prototype-builtins
          (selectedSessions.hasOwnProperty((sessions as $TSFixMe).id) ||
            // eslint-disable-next-line no-prototype-builtins
            waitlistedSessions.hasOwnProperty((sessions as $TSFixMe).id)) &&
          !isEmpty(selectedSessionInGroup)
        ) {
          registeredForProductInGroup = true;
          registeredProductId = (sessions as $TSFixMe).id;
        }
      });
      // Checks whether to disable a person if the current session group has been closed by planner
      const isClosedSessionGroupVisible =
        isEmpty(selectedSessionInGroup) || selectedSessionGroup.isOpenForRegistration || isPlannerRegistration(state)
          ? true
          : // eslint-disable-next-line no-prototype-builtins
            selectedSessions.hasOwnProperty(sessionId) || unRegisteredSessions.hasOwnProperty(sessionId);

      let eventRegAlreadyWaitlisted = {};
      if (!forWaitlisting) {
        const waitlistRequestedAction = getIn(eventReg, ['sessionWaitlists', sessionId, 'requestedAction']);
        if (waitlistRequestedAction === REQUESTED_ACTIONS.WAITLIST) {
          eventRegAlreadyWaitlisted = {
            isWaitlisted: true
          };
        }
        const waitlistStatus = getIn(eventReg, ['sessionWaitlists', sessionId, 'waitlistStatus']);
        /*
         * This ensures that during Reg Mod, if the attendee is waitlisted and didn't receive the mail to register,
         * then this attendee should be disabled from the Popup.
         * Pending Status signifies that the attendee received the mail to register for the session.
         */
        if (lastSavedRegCart.regMod && waitlistStatus && waitlistStatus === WAITLIST_STATUS.PENDING) {
          eventRegAlreadyWaitlisted = {
            ...eventRegAlreadyWaitlisted,
            isDisabled: false
          };
        }
      }

      // eslint-disable-next-line no-prototype-builtins
      const isSelected = !!selectedSessions.hasOwnProperty(sessionId);
      eventRegSelections[eventRegId] = {
        isSelected,
        isDisabled:
          !sessionIsVisible ||
          !isClosedSessionGroupVisible ||
          (!isSelected && session.status === PRODUCT_STATUS.CLOSED && !overrideCapacity),
        isIncluded:
          selectedSessions?.[sessionId]?.registrationSourceType === 'AdmissionItem' ||
          selectedSessions?.[sessionId]?.registrationSourceType === 'Track',
        registeredForProductInGroup,
        registeredProductId,
        ...eventRegAlreadyWaitlisted
      };
      selectedCount += eventRegSelections[eventRegId].isSelected || eventRegSelections[eventRegId].isIncluded ? 1 : 0;
    });
    const regApprovalCapacity =
      sessionCapacity !== -1 && sessionCapacity <= selectedCount ? 0 : sessionCapacity - selectedCount;

    const productCapacity = isRegApproval && sessionCapacity !== -1 ? regApprovalCapacity : sessionCapacity;

    /*
     * FLEX-32140 for regApproval count the number selected and take it away from capacity since we don't
     * claim the capacity until planner approves
     */
    await dispatch(
      openGuestProductSelectionDialogFromSessions(
        'GuestProductSelection_SelectAttendees__resx',
        sessionId,
        sessionTitle,
        productCapacity,
        overrideCapacity,
        eventRegSelections,
        eventRegistrations,
        eventRegistrationId,
        isGroupReg,
        applyGuestSessionSelection,
        session.fees,
        session.defaultFeeId,
        forWaitlisting,
        sessionStatus,
        null,
        spinnerSelection
      )
    );
  };
}

/**
 * Updates the regcart by unregistering the deselected session and registering the selected session
 */
export function switchSession(
  eventRegistrationId: $TSFixMe,
  unSelectedSessionId: $TSFixMe,
  selectedSessionId: $TSFixMe,
  isForWaitlistingSession = false
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const lastSavedRegCart = getLastSavedRegCart(getState);
    const guestProductSelectionEnabledOnRegPath = isGuestProductSelectionEnabledOnRegPath(state);
    const guestEventRegs = getGuestsOfRegistrant(lastSavedRegCart, eventRegistrationId);

    // Handle complex guest session selection if needed
    if (guestEventRegs.length > 0 && guestProductSelectionEnabledOnRegPath) {
      const currentEventReg = getIn(lastSavedRegCart, ['eventRegistrations', eventRegistrationId]);
      return await dispatch(
        handleSessionSelectionForComplexGuests(
          selectedSessionId,
          lastSavedRegCart,
          eventRegistrationId,
          currentEventReg,
          guestEventRegs
        )
      );
    }

    const sessionRegistrationsToUpdate = await dispatch(
      switchSessionRegistration(eventRegistrationId, unSelectedSessionId, selectedSessionId, isForWaitlistingSession)
    );
    /*
     * If guest is added and are enabled to assign same registrations as primary registration, then
     * update session registrations to update with guests session registrations
     */
    sessionRegistrationsToUpdate.push(
      ...getGuestSessionsToMatchPrimaryReg(
        sessionRegistrationsToUpdate,
        guestEventRegs,
        guestProductSelectionEnabledOnRegPath
      )
    );
    await dispatch(updateSessions(sessionRegistrationsToUpdate));
    await dispatch(evaluateQuestionVisibilityLogic(null, true, false));
  };
}

function switchSessionRegistration(eventRegistrationId, unSelectedSessionId, selectedSessionId, forWaitlisting) {
  return async (dispatch, getState) => {
    const state = getState();
    let sessionRegistrationsToUpdate = [];
    sessionRegistrationsToUpdate.push(
      getSessionToBeUpdated(state, eventRegistrationId, selectedSessionId, forWaitlisting)
    );
    if (unSelectedSessionId !== selectedSessionId) {
      sessionRegistrationsToUpdate.push(
        getSessionToBeUpdated(state, eventRegistrationId, unSelectedSessionId, forWaitlisting, false)
      );
    }
    // Need to unregister/unwaitlist a session if the session is changed to waitlisted/registered respectively
    sessionRegistrationsToUpdate.push(
      changeAlreadyUpdatedSession(state, eventRegistrationId, unSelectedSessionId, forWaitlisting)
    );

    sessionRegistrationsToUpdate = filterUndefinedValuesFromArray(sessionRegistrationsToUpdate);
    const isUnselectedSessionLeavingWaitlist = sessionRegistrationsToUpdate.find(
      sessionReg => sessionReg && sessionReg.productId === unSelectedSessionId
    );
    if (
      isUnselectedSessionLeavingWaitlist &&
      isUnselectedSessionLeavingWaitlist.requestedAction === REQUESTED_ACTIONS.LEAVE_WAITLIST
    ) {
      dispatch(removeSessionForSelectingWaitlist(unSelectedSessionId));
    }
    return sessionRegistrationsToUpdate;
  };
}
