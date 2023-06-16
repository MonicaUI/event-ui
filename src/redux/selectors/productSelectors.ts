import {
  pick,
  isEqual,
  pickBy,
  mapValues,
  get,
  values,
  compact,
  orderBy,
  keys,
  assign,
  has,
  map,
  remove,
  filter,
  partition,
  isEmpty,
  difference,
  forEach,
  find,
  groupBy,
  uniq
} from 'lodash';
import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';
import { getIn, setIn } from 'icepick';
import { getRegCart } from './shared';
import {
  getUnRegisteredSessions as getUnRegisteredSessionsFromRegCart,
  getGuestsOfRegistrant,
  getSelectedAdmissionItem as getSelectedAdmissionItemByRegId
} from '../registrationForm/regCart/selectors';
import { REGISTRATION_SOURCE_TYPES, REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import {
  getEventRegistration,
  getEventRegistrationId,
  getSelectedSessionsFromAllRegistrant,
  getSelectedSessionsFromAllRegistrantForWaitlist,
  getRegistrationTypeIdForAgenda,
  getSelectedSessions,
  getSelectedWaitlistedSessionsFromAllRegistrant,
  isRegistrationModification,
  modificationStartFromEventRegistrationId,
  getSelectedQuantityItems,
  getSelectedDonationItems
} from './currentRegistrant';
import { getRegistrationTypeIdFromUserSession } from '../userSession';
import { getSelectedSessions as getSessionsFromRegCart } from '../registrationForm/regCart/selectors';
import { sessionStatus } from 'event-widgets/redux/selectors/event';
import { getAdvancedSessionRules } from './event';
import { isGuestProductSelectionEnabledOnRegPath } from './currentRegistrationPath';
import { EventRegistration, MembershipItemRegistration } from '@cvent/flex-event-shared/target/guestside';
import { SessionGroupSnapshot, SessionSnapshot } from '@cvent/flex-event-shared';

function getEventRegistrationsFromState(state): Record<string, EventRegistration> {
  return getIn(state, ['registrationForm', 'regCart', 'eventRegistrations']);
}

/**
 * get the visible products sort key from state by event registration id
 */
const getVisibleProductsSortKeys = (visibleProducts, eventRegistrationId) =>
  get(visibleProducts, [eventRegistrationId, 'sortKeys']);

export const getEventRegistrationForPrimaryRegistrant = createSelector(
  getRegCart,
  getEventRegistrationId,
  getFilteredEventRegistrationById
);

const getFilteredEventRegistration = (eventReg: EventRegistration) => {
  let filteredEventRegistration = pick(eventReg, [
    'attendeeType',
    'primaryRegistrationId',
    'requestedAction',
    'displaySequence',
    'eventRegistrationId',
    'productRegistrations',
    'sessionRegistrations',
    'sessionBundleRegistrations',
    'sessionWaitlists',
    'registrationTypeId',
    'quantityItemRegistrations',
    'attendingFormatId'
  ]);
  filteredEventRegistration = {
    ...filteredEventRegistration,
    attendee: {
      personalInformation: {
        firstName: getIn(eventReg, ['attendee', 'personalInformation', 'firstName'] as const),
        lastName: getIn(eventReg, ['attendee', 'personalInformation', 'lastName'] as const)
      }
    }
  };
  return filteredEventRegistration;
};

function getFilteredEventRegistrationById(regCart, eventRegistrationId) {
  if (!eventRegistrationId) {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const eventReg = regCart && regCart.eventRegistrations ? regCart.eventRegistrations[eventRegistrationId] : {};
  return getFilteredEventRegistration(eventReg);
}

const getEventRegistrationsForCurrentRegistrantAndGuests = createSelector(getEventRegistrationsFromState, eventRegs => {
  if (!eventRegs) {
    return undefined;
  }

  const filteredEventRegistrations = {};
  Object.values(eventRegs).forEach(eventReg => {
    filteredEventRegistrations[(eventReg as $TSFixMe).eventRegistrationId] = getFilteredEventRegistration(eventReg);
  });
  return filteredEventRegistrations;
});

const createGetCurrentRegistrantAndGuestsSelector = createSelectorCreator(defaultMemoize, isEqual, isEqual);

const createGetUnRegisteredSessionsSelector = createSelectorCreator(defaultMemoize, isEqual);

const getGuestsEventRegistrationId = createSelector(
  getEventRegistrationId,
  getRegCart,
  (primaryEventRegistrationId, regCart) => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (regCart && regCart.eventRegistrations) {
      const filteredGuests = [];
      Object.values(regCart.eventRegistrations).forEach(eventReg => {
        const isGuest =
          (eventReg as $TSFixMe).attendeeType === 'GUEST' &&
          (eventReg as $TSFixMe).primaryRegistrationId === primaryEventRegistrationId;
        const isRequestedActionRegister =
          (eventReg as $TSFixMe).requestedAction && (eventReg as $TSFixMe).requestedAction === 'REGISTER';
        if (isGuest && isRequestedActionRegister) {
          filteredGuests.push(pick(eventReg, ['eventRegistrationId', 'displaySequence']));
        }
      });
      return filteredGuests.sort((first, second) => first.displaySequence - second.displaySequence);
    }
    return undefined;
  }
);

const createGetPrimaryAndGuestVisibleEventRegistrationSelector = createSelectorCreator(defaultMemoize, isEqual);

const createGetPrimaryAndGuestSortedVisibleSessionsSelector = createSelectorCreator(defaultMemoize, isEqual);

/**
 * gets the current event registrant and the guests associated to the current registrant
 */
export const getCurrentRegistrantAndGuests = createGetCurrentRegistrantAndGuestsSelector(
  getEventRegistrationsForCurrentRegistrantAndGuests,
  getEventRegistrationForPrimaryRegistrant,
  (eventRegistrations, primary) => {
    if (!primary) {
      return [];
    }
    if (eventRegistrations) {
      const filteredGuests = [];
      Object.values(eventRegistrations).forEach(eventReg => {
        const isGuest =
          (eventReg as $TSFixMe).attendeeType === 'GUEST' &&
          (eventReg as $TSFixMe).primaryRegistrationId === primary.eventRegistrationId;
        const isRequestedActionRegister =
          (eventReg as $TSFixMe).requestedAction && (eventReg as $TSFixMe).requestedAction === 'REGISTER';
        if (isGuest && isRequestedActionRegister) {
          filteredGuests.push(eventReg);
        }
      });
      const primarysGuests = filteredGuests.sort((first, second) => first.displaySequence - second.displaySequence);
      return [primary, ...primarysGuests];
    }
    return [primary];
  }
);

/**
 * Gets and array of all unique registration type ids for the current event registrant
 * and the guests associated to the current registrant
 */
export const getRegistrationTypeIdsForCurrentRegistrantsAndGuests = createSelector(
  getCurrentRegistrantAndGuests,
  currentRegistrants => uniq(currentRegistrants.map(reg => reg.registrationTypeId))
);

/**
 * gets the current event registrant and the guests associated to the current registrant
 */
export const getCurrentRegistrantAndGuestsForWaitlist = createGetCurrentRegistrantAndGuestsSelector(
  getEventRegistrationsForCurrentRegistrantAndGuests,
  getEventRegistrationForPrimaryRegistrant,
  (eventRegistrations, primary) => {
    if (eventRegistrations) {
      const filteredGuests = [];
      Object.values(eventRegistrations).forEach(eventReg => {
        const isGuest =
          (eventReg as $TSFixMe).attendeeType === 'GUEST' &&
          (eventReg as $TSFixMe).primaryRegistrationId === primary.eventRegistrationId;
        if (isGuest) {
          filteredGuests.push(eventReg);
        }
      });
      const primarysGuests = filteredGuests.sort((first, second) => first.displaySequence - second.displaySequence);
      return [primary, ...primarysGuests];
    }
    return [primary];
  }
);

export const getPrimaryAndGuestSelectedSessions = createSelector(
  getCurrentRegistrantAndGuests,
  getSelectedSessionsFromAllRegistrant
);

export const getPrimaryAndGuestSelectedSessionsForWaitlist = createSelector(
  getCurrentRegistrantAndGuestsForWaitlist,
  getSelectedSessionsFromAllRegistrantForWaitlist
);

export const getPrimaryAndGuestSelectedWaitlistedSessions = createSelector(
  getCurrentRegistrantAndGuestsForWaitlist,
  getSelectedWaitlistedSessionsFromAllRegistrant
);

/**
 * Check if any registrant is on waitlist (not pending addition to waitlist)
 */
export function isAnyRegistrantOnNonPendingSessionWaitlist(state: $TSFixMe, sessionId: $TSFixMe): $TSFixMe {
  const eventRegistrations = getEventRegistrationsFromState(state);
  return Object.values(eventRegistrations).some(eventReg => {
    const sessionReg = getIn(eventReg, ['sessionWaitlists', sessionId]);
    return sessionReg && sessionReg.waitlistStatus === 'WAITLISTED';
  });
}

/**
 * Check if session is being updated
 */
export function isSessionBeingUpdated(state: $TSFixMe, sessionId: $TSFixMe): $TSFixMe {
  const {
    spinnerSelection: { pendingSpinnerSelection }
  } = state;
  return sessionId === pendingSpinnerSelection;
}

export const getWaitlistSessionMetaData = createSelector(
  getPrimaryAndGuestSelectedSessionsForWaitlist,
  (state, sessionId) => sessionId,
  (waitlistedSessions, sessionId) => {
    return waitlistedSessions[sessionId] || undefined;
  }
);

/**
 * Gets waitlisted Sessions for specific session group
 */
export const getSelectedWaitlistSessionsInSessionGroup = createSelector(
  getPrimaryAndGuestSelectedSessionsForWaitlist,
  (state, sessionGroup) => sessionGroup,
  (waitlistedSessions, sessionGroup) => {
    const waitlistedSessionsInSessionGroup = {};
    Object.values(waitlistedSessions).forEach(session => {
      if (
        has(sessionGroup.sessions, session.productId) &&
        session.requestedAction !== REQUESTED_ACTIONS.LEAVE_WAITLIST
      ) {
        waitlistedSessionsInSessionGroup[session.productId] = session;
      }
    });

    return waitlistedSessionsInSessionGroup;
  }
);

export const getSessionRegistrationCount = createSelector(
  getCurrentRegistrantAndGuests,
  (state, sessionId) => sessionId,
  (eventRegistrations, sessionId) => {
    let count = 0;
    if (!eventRegistrations) {
      return count;
    }
    count = eventRegistrations
      .map(eventRegistration => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const sessions = (eventRegistration && eventRegistration.sessionRegistrations) || {};
        const registeredSessions = pickBy(
          sessions,
          session =>
            session.productId === sessionId &&
            session.requestedAction === REQUESTED_ACTIONS.REGISTER &&
            session.registrationSourceType !== 'AdmissionItem' &&
            session.registrationSourceType !== 'Track'
        );
        return Object.keys(registeredSessions).length;
      })
      .reduce((a, b) => a + b, 0);
    return count;
  }
);

export const getSessionBundleRegistrationCount = createSelector(
  getCurrentRegistrantAndGuests,
  (state, sessionBundleId) => sessionBundleId,
  (eventRegistrations, sessionBundleId) => {
    let count = 0;
    if (!eventRegistrations) {
      return count;
    }
    count = eventRegistrations
      .map(eventRegistration => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const sessionBundles = (eventRegistration && eventRegistration.sessionBundleRegistrations) || {};
        const registeredSessionBundles = pickBy(
          sessionBundles,
          sessionBundle =>
            sessionBundle.productId === sessionBundleId && sessionBundle.requestedAction === REQUESTED_ACTIONS.REGISTER
        );
        return Object.keys(registeredSessionBundles).length;
      })
      .reduce((a, b) => a + b, 0);
    return count;
  }
);

export const getMembershipItemRegistration = createSelector(
  getEventRegistration,
  (eventReg: EventRegistration): MembershipItemRegistration => {
    return eventReg?.membershipItemRegistrations ?? {};
  }
);

export const getContactId = createSelector(getEventRegistration, (eventReg: EventRegistration): string => {
  return eventReg?.attendee?.personalInformation?.contactId;
});

export const getSessionUnregisterCount = createSelector(
  getCurrentRegistrantAndGuests,
  (state, sessionId) => sessionId,
  (eventRegistrations, sessionId) => {
    let count = 0;
    if (!eventRegistrations) {
      return count;
    }
    count = eventRegistrations
      .map(eventRegistration => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const sessions = (eventRegistration && eventRegistration.sessionRegistrations) || {};
        const unRegisteringSessions = pickBy(
          sessions,
          session => session.productId === sessionId && session.requestedAction === REQUESTED_ACTIONS.UNREGISTER
        );
        return Object.keys(unRegisteringSessions).length;
      })
      .reduce((a, b) => a + b, 0);
    return count;
  }
);

function getSessionAssociationCountByRegistrationSourceType(registrationSourceType) {
  return createSelector(
    getCurrentRegistrantAndGuests,
    (state, sessionId) => sessionId,
    (eventRegistrations, sessionId) => {
      let count = 0;
      if (!eventRegistrations) {
        return count;
      }
      count = eventRegistrations
        .map(eventRegistration => {
          const sessions = eventRegistration?.sessionRegistrations || {};
          const associatedSessions = pickBy(
            sessions,
            session =>
              session.productId === sessionId &&
              session.registrationSourceType === registrationSourceType &&
              session.requestedAction === REQUESTED_ACTIONS.REGISTER
          );
          return Object.keys(associatedSessions).length;
        })
        .reduce((a, b) => a + b, 0);
      return count;
    }
  );
}

export const getSessionCountWithAdmissionItemAssociation =
  getSessionAssociationCountByRegistrationSourceType('AdmissionItem');

export const getSessionCountWithSessionBundleAssociation = getSessionAssociationCountByRegistrationSourceType('Track');

export const getSessionWaitlistCount = createSelector(
  getCurrentRegistrantAndGuests,
  (state, sessionId) => sessionId,
  (eventRegistrations, sessionId) => {
    let count = 0;
    if (!eventRegistrations) {
      return count;
    }
    count = eventRegistrations
      .map(eventRegistration => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const sessions = (eventRegistration && eventRegistration.sessionWaitlists) || {};
        const waitlistedSessions = pickBy(
          sessions,
          session => session.productId === sessionId && session.requestedAction === REQUESTED_ACTIONS.WAITLIST
        );
        return Object.keys(waitlistedSessions).length;
      })
      .reduce((a, b) => a + b, 0);
    return count;
  }
);

export const getSessionUnWaitlistCount = createSelector(
  getCurrentRegistrantAndGuests,
  (state, sessionId) => sessionId,
  (eventRegistrations, sessionId) => {
    let count = 0;
    if (!eventRegistrations) {
      return count;
    }
    count = eventRegistrations
      .map(eventRegistration => {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        const sessions = (eventRegistration && eventRegistration.sessionWaitlists) || {};
        const unWaitlistedSessions = pickBy(
          sessions,
          session => session.productId === sessionId && session.requestedAction === REQUESTED_ACTIONS.LEAVE_WAITLIST
        );
        return Object.keys(unWaitlistedSessions).length;
      })
      .reduce((a, b) => a + b, 0);
    return count;
  }
);

/**
 * Returns quantity item info for primary
 * {
 *  quantityItemId: {
 *    eventRegistrationId,
 *    attendee: regcart.eventRegistrations[id].attendee,
 *    quantity: quantityItemRegistration.quantity
 *  }
 * }
 * This is needed for updating the quantity item widget button text and the remaining capacity count.
 */
export const getQuantityItemInfoForPrimary = createSelector(
  // Selector arguments
  getEventRegistrationForPrimaryRegistrant,
  // Result function
  primaryEventReg => {
    const quantityItemInfo = {};
    if (!primaryEventReg) {
      return quantityItemInfo;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const allQuantityItems = (primaryEventReg && primaryEventReg.quantityItemRegistrations) || {};
    const selectedQuantityItems = pickBy(allQuantityItems, quantityItem => quantityItem.quantity >= 0);
    let reg = {
      eventRegistrationId: primaryEventReg.eventRegistrationId,
      attendee: primaryEventReg.attendee
    };
    Object.values({ ...selectedQuantityItems }).forEach(quantityItems => {
      const quantityItemId = (quantityItems as $TSFixMe).productId;
      reg = setIn(reg, ['quantity'], (quantityItems as $TSFixMe).quantity);
      // place the event reg in the respective bucket.
      quantityItemInfo[quantityItemId] = reg;
    });
    return quantityItemInfo;
  }
);

export const getDonationItemsForCurrentReg = createSelector(getEventRegistration, eventReg => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'donationItemRegistrations' does not exis... Remove this comment to see the full error message
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (eventReg && eventReg.donationItemRegistrations) || {};
});

export const getUnRegisteredSessions = createGetUnRegisteredSessionsSelector(
  getRegCart,
  getEventRegistrationId,
  getUnRegisteredSessionsFromRegCart
);

export const isSessionBeingUnregistered = createGetUnRegisteredSessionsSelector(
  getUnRegisteredSessions,
  (state, sessionId) => sessionId,
  (unregisteredSessions, sessionId) => {
    return !!find(unregisteredSessions, s => s.productId === sessionId);
  }
);

/**
 * get the visible event registration for primary and guest session groups
 * for session group that's not visible for current selected admission item, we skip the validation.
 */
export const getPrimaryAndGuestVisibleEventRegistration = createGetPrimaryAndGuestVisibleEventRegistrationSelector(
  getGuestsEventRegistrationId,
  state => state.visibleProducts.Sessions,
  getEventRegistrationId,
  isGuestProductSelectionEnabledOnRegPath,
  (guestEventRegistrationIds, visibleProducts, eventRegistrationId, isGuestProductSelectionEnabled) => {
    const skipValidationSessionGroups =
      get(visibleProducts, [eventRegistrationId, 'skipValidationItems'] as $TSFixMe) || [];
    const visibleEventRegistrationForPrimaryAndGuests = mapValues(
      get(visibleProducts, [eventRegistrationId, 'sessionProducts'] as $TSFixMe),
      session => {
        if (session.type !== 'Session' && !skipValidationSessionGroups.includes(session.id)) {
          return { visibleEventReg: [eventRegistrationId] };
        }
      }
    );
    if (!isGuestProductSelectionEnabled) {
      return visibleEventRegistrationForPrimaryAndGuests;
    }
    guestEventRegistrationIds.forEach(eventReg => {
      if (!eventReg) {
        return;
      }
      const guestEventRegistrationId = eventReg.eventRegistrationId;
      const guestSessions = values(get(visibleProducts, [guestEventRegistrationId, 'sessionProducts']));
      const guestSkipValidationSessionGroups =
        get(visibleProducts, [guestEventRegistrationId, 'skipValidationItems']) || [];
      guestSessions.forEach(guestSession => {
        const primaryGuestSession = visibleEventRegistrationForPrimaryAndGuests[guestSession.id];
        if (!primaryGuestSession) {
          if (guestSession.type !== 'Session' && !guestSkipValidationSessionGroups.includes(guestSession.id)) {
            visibleEventRegistrationForPrimaryAndGuests[guestSession.id] = {
              visibleEventReg: [guestEventRegistrationId]
            };
          }
        } else if (guestSession.type !== 'Session' && !guestSkipValidationSessionGroups.includes(guestSession.id)) {
          if (!primaryGuestSession.visibleEventReg.find(eventRegId => eventRegId === guestEventRegistrationId)) {
            primaryGuestSession.visibleEventReg.push(guestEventRegistrationId);
          }
        }
      });
    });
    return visibleEventRegistrationForPrimaryAndGuests;
  }
);

/**
 * get the sorted visible quantity items for the current registrant without guest products
 */
export const getPrimarySortedVisibleQuantityItems = createSelector(
  getEventRegistrationId,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts.Sessions,
  (eventRegistrationId, visibleProducts) => get(visibleProducts, [eventRegistrationId, 'quantityItems'] as $TSFixMe)
);

/**
 * get the sorted visible donation items for the current registrant
 */
export const getPrimarySortedVisibleDonationItems = createSelector(
  getEventRegistrationId,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts.Sessions,
  (eventRegistrationId, visibleProducts) =>
    get(visibleProducts, [eventRegistrationId, 'donationItems'] as $TSFixMe) || {}
);

/**
 * get the sorted visible admission items for the current registrant without guest products
 */
export const getPrimarySortedVisibleAdmissionItems = createSelector(
  getEventRegistrationId,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts.Sessions,
  (eventRegistrationId, visibleProducts) => get(visibleProducts, [eventRegistrationId, 'admissionItems'] as $TSFixMe)
);

/**
 * get the merged sorted admission items for the current registrant and guests
 */
export const getPrimaryAndGuestSortedVisibleAdmissionItems = createSelector(
  getEventRegistrationId,
  getRegistrationTypeIdFromUserSession,
  getRegCart,
  state => state.visibleProducts.Sessions,
  (primaryRegId, initialRegTypeId, regCart, visibleProducts) => {
    const allGuestEventRegs = getGuestsOfRegistrant(regCart, primaryRegId, null);
    const visibleProductsForPrimaryAndGuests = {
      ...get(visibleProducts, [primaryRegId, 'admissionItems'] as $TSFixMe)
    };

    // If guest can select their own reg type and guests exist
    allGuestEventRegs.forEach(guestEventReg => {
      if (!guestEventReg) {
        return;
      }
      const guestEventRegId = guestEventReg.eventRegistrationId;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (visibleProducts && visibleProducts[guestEventRegId]) {
        Object.values(visibleProducts[guestEventRegId].admissionItems).forEach(admissionItem => {
          // If guest admission item isn't in visible products, add it.
          if (!visibleProductsForPrimaryAndGuests[(admissionItem as $TSFixMe).id]) {
            // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
            visibleProductsForPrimaryAndGuests[(admissionItem as $TSFixMe).id] = { ...admissionItem };
          }
        });
      }
    });
    return visibleProductsForPrimaryAndGuests;
  }
);

/* Get sorted sessions based on sort keys ascending ordered */

export const getSortedSessionsBasedOnSortKeys = (sortKeys: $TSFixMe, products: $TSFixMe): $TSFixMe => {
  const sortedKeys = orderBy(values(map(sortKeys, (v, k) => ({ id: k, sortKey: v }))), ['sortKey'], ['asc']);
  return compact(map(sortedKeys, sortedKey => products.find(session => session.id === sortedKey.id)));
};
/**
 * get the sorted visible sessions for the current registrant without guest products
 */
export const getPrimarySortedVisibleSessions = createSelector(
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts.Sessions,
  getEventRegistrationId,
  (visibleProducts, eventRegistrationId) => {
    const visibleProductsForPrimary = values(
      get(visibleProducts, [eventRegistrationId, 'sessionProducts'] as $TSFixMe)
    );
    const primarySortKeys = { ...getVisibleProductsSortKeys(visibleProducts, eventRegistrationId) };
    return getSortedSessionsBasedOnSortKeys(primarySortKeys, visibleProductsForPrimary);
  }
);

/**
 * get the sorted visible sessions for the given event registration id
 */
export const getSortedVisibleSessionsForEventRegistration = (
  visibleProducts: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe => {
  const sessions = get(visibleProducts, ['Sessions', eventRegistrationId, 'sessionProducts']);
  const sortedVisibleSessions = [];
  if (sessions) {
    const partitionedSessions = partition(sessions, session => {
      return session.type !== 'Session' && session.sessions;
    });
    // adds sessions to sortedVisibleSessions
    Object.keys(partitionedSessions[1]).forEach(key => {
      sortedVisibleSessions[partitionedSessions[1][key].id] = { name: partitionedSessions[1][key].name };
    });
    const groups = partitionedSessions[0];
    // add sessions from session groups to sortedVisibleSessions
    groups.forEach(group => {
      Object.keys(group.sessions).forEach(groupSessionId => {
        sortedVisibleSessions[groupSessionId] = { name: group.sessions[groupSessionId].name };
      });
    });
  }
  return sortedVisibleSessions;
};

/**
 * get the included sessions for the given event registration id
 */
export const getIncludedSessionsForEventRegistration = (
  visibleProducts: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  eventRegistrations: $TSFixMe
): $TSFixMe => {
  const sessionRegistrations = get(eventRegistrations, [eventRegistrationId, 'sessionRegistrations']);
  // Get session registrations with 'included' type of sessions
  const includedSessionRegistrations = pickBy(
    sessionRegistrations,
    value => value.registrationSourceType === 'Included'
  );
  const registeredIncludedSessionIds = isEmpty(includedSessionRegistrations) ? [] : keys(includedSessionRegistrations);
  // Get session details for included sessions
  const includedSessions = pick(get(visibleProducts, ['Widget', 'sessionProducts']), registeredIncludedSessionIds);
  return includedSessions;
};

export const getSessionsVisibleToPrimary = createSelector(getPrimarySortedVisibleSessions, sessions => {
  let visibleSessions = [];
  sessions.forEach(session => {
    visibleSessions.push(session.id);
    if (session.sessions) {
      visibleSessions = visibleSessions.concat(map(session.sessions, sessionInGroup => sessionInGroup.id));
    }
  });
  return visibleSessions;
});

/**
 * get the merged sorted visible sessions for the current registrant and guests
 */
export const getPrimaryAndGuestSortedVisibleSessions = createGetPrimaryAndGuestSortedVisibleSessionsSelector(
  getGuestsEventRegistrationId,
  state => state.visibleProducts.Sessions,
  getEventRegistrationId,
  (guestEventRegistrationIds, visibleProducts, eventRegistrationId) => {
    const visibleProductsForPrimaryAndGuests = values(
      get(visibleProducts, [eventRegistrationId, 'sessionProducts'] as $TSFixMe)
    );
    const primaryAndGuestSortKeys = { ...getVisibleProductsSortKeys(visibleProducts, eventRegistrationId) };
    guestEventRegistrationIds.forEach(eventReg => {
      const guestEventRegistrationId = eventReg.eventRegistrationId;
      const guestSessions = values(get(visibleProducts, [guestEventRegistrationId, 'sessionProducts']));
      const guestSortKeys = getVisibleProductsSortKeys(visibleProducts, guestEventRegistrationId);
      guestSessions.forEach(guestSession => {
        const primaryGuestSessionIndex = visibleProductsForPrimaryAndGuests.findIndex(
          session => session.id === guestSession.id
        );
        if (primaryGuestSessionIndex === -1) {
          // guest session doesn't exist, add it
          visibleProductsForPrimaryAndGuests.push(guestSession);
          assign(primaryAndGuestSortKeys, { [guestSession.id]: guestSortKeys[guestSession.id] });
        } else if (guestSession.type !== 'Session') {
          const primaryGuestSession = visibleProductsForPrimaryAndGuests[primaryGuestSessionIndex];
          keys(guestSession.sessions).forEach(guestSessionInGroupId => {
            // add guest sessions within session group
            if (!has(primaryGuestSession.sessions, guestSessionInGroupId)) {
              visibleProductsForPrimaryAndGuests[primaryGuestSessionIndex] = {
                ...visibleProductsForPrimaryAndGuests[primaryGuestSessionIndex],
                sessions: {
                  ...visibleProductsForPrimaryAndGuests[primaryGuestSessionIndex].sessions,
                  [guestSessionInGroupId]: guestSession.sessions[guestSessionInGroupId]
                }
              };
            }
          });
        }
      });
    });
    return getSortedSessionsBasedOnSortKeys(primaryAndGuestSortKeys, visibleProductsForPrimaryAndGuests);
  }
);

const getAllSortedSessionsSelector = createSelector(
  getRegistrationTypeIdForAgenda,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts,
  (state, widgetType) => widgetType,
  (state, widgetType, widgetId) => widgetId,
  (state, widgetType, widgetId, limitByRegistrationType) => limitByRegistrationType,
  (state, widgetType, widgetId, limitByRegistrationType, shouldFilterCancelledSession) => shouldFilterCancelledSession,
  (
    calculatedRegistrationTypeId,
    visibleProducts,
    widgetType,
    widgetId = null,
    limitByRegistrationType = false,
    shouldFilterCancelledSession = true
  ) => {
    const widget = widgetId != null ? `${widgetType}:${widgetId}` : widgetType;
    let sessionProducts: (SessionSnapshot | SessionGroupSnapshot)[];
    if (limitByRegistrationType) {
      sessionProducts = values(get(visibleProducts, [widget, calculatedRegistrationTypeId, 'sessionProducts']));
    } else {
      sessionProducts = values(get(visibleProducts, [widget, 'sessionProducts']));
    }
    let sessions = remove(sessionProducts, product => !('sessions' in product) || !product.sessions);
    if (shouldFilterCancelledSession) {
      sessions = sessions.filter(session => !('status' in session) || session.status !== sessionStatus.cancelled);
    }
    return sessions;
  }
);

export const getAllSortedSessions = (
  state: $TSFixMe,
  widgetType: $TSFixMe,
  widgetId: $TSFixMe,
  limitByRegistrationType?: $TSFixMe
): $TSFixMe => getAllSortedSessionsSelector(state, widgetType, widgetId, limitByRegistrationType);

export const getAllSortedSessionsForWidget = (state: $TSFixMe): $TSFixMe =>
  getAllSortedSessionsSelector(state, 'Widget');

export const getAllSortedSessionsForPayments = (state: $TSFixMe): $TSFixMe =>
  getAllSortedSessionsSelector(state, 'Widget', null, false, false);

const getAllSortedAdmissionItemsSelector = createSelector(
  getRegistrationTypeIdForAgenda,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts,
  (state, widgetType) => widgetType,
  (state, widgetType, widgetId) => widgetId,
  (state, widgetType, widgetId, limitByRegistrationType) => limitByRegistrationType,
  (calculatedRegistrationTypeId, visibleProducts, widgetType, widgetId = null, limitByRegistrationType = false) => {
    const widget = widgetId != null ? `${widgetType}:${widgetId}` : widgetType;
    if (limitByRegistrationType) {
      return get(visibleProducts, [widget, calculatedRegistrationTypeId, 'admissionItems']);
    }
    return get(visibleProducts, [widget, 'admissionItems']);
  }
);
export const getAllSortedAdmissionItems = (
  state: $TSFixMe,
  widgetType: $TSFixMe,
  widgetId: $TSFixMe,
  limitByRegistrationType: $TSFixMe
): $TSFixMe => getAllSortedAdmissionItemsSelector(state, widgetType, widgetId, limitByRegistrationType);

export const getAllSortedAdmissionItemsForWidget = (state: $TSFixMe): $TSFixMe =>
  getAllSortedAdmissionItemsSelector(state, 'Widget');

const getAllSortedQuantityItemsSelector = createSelector(
  getRegistrationTypeIdForAgenda,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts,
  (state, widgetType) => widgetType,
  (state, widgetType, widgetId) => widgetId,
  (state, widgetType, widgetId, limitByRegistrationType) => limitByRegistrationType,
  (calculatedRegistrationTypeId, visibleProducts, widgetType, widgetId = null, limitByRegistrationType = false) => {
    const widget = widgetId != null ? `${widgetType}:${widgetId}` : widgetType;
    if (limitByRegistrationType) {
      return get(visibleProducts, [widget, calculatedRegistrationTypeId, 'quantityItems']);
    }
    return get(visibleProducts, [widget, 'quantityItems']);
  }
);
export const getAllSortedQuantityItems = (
  state: $TSFixMe,
  widgetType: $TSFixMe,
  widgetId: $TSFixMe,
  limitByRegistrationType: $TSFixMe
): $TSFixMe => getAllSortedQuantityItemsSelector(state, widgetType, widgetId, limitByRegistrationType);

export const getAllSortedQuantityItemsForWidget = (state: $TSFixMe): $TSFixMe =>
  getAllSortedQuantityItemsSelector(state, 'Widget');

const getAllSortedDonationItemsSelector = createSelector(
  getRegistrationTypeIdForAgenda,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'visibleProducts' does not exist on type ... Remove this comment to see the full error message
  state => state.visibleProducts,
  (state, widgetType) => widgetType,
  (state, widgetType, widgetId) => widgetId,
  (state, widgetType, widgetId, limitByRegistrationType) => limitByRegistrationType,
  (calculatedRegistrationTypeId, visibleProducts, widgetType, widgetId = null, limitByRegistrationType = false) => {
    const widget = widgetId != null ? `${widgetType}:${widgetId}` : widgetType;
    if (limitByRegistrationType) {
      return get(visibleProducts, [widget, calculatedRegistrationTypeId, 'donationItems']);
    }
    return get(visibleProducts, [widget, 'donationItems']);
  }
);
export const getAllSortedDonationItems = (
  state: $TSFixMe,
  widgetType: $TSFixMe,
  widgetId: $TSFixMe,
  limitByRegistrationType: $TSFixMe
): $TSFixMe => getAllSortedDonationItemsSelector(state, widgetType, widgetId, limitByRegistrationType);

export const getAllSortedDonationItemsForWidget = (state: $TSFixMe): $TSFixMe =>
  getAllSortedDonationItemsSelector(state, 'Widget');

export const getAllSortedSessionsForPrimaryAndGuest = createSelector(
  getPrimaryAndGuestSortedVisibleSessions,
  sessionAndSessionGroups => {
    let sessions = [];
    sessionAndSessionGroups.forEach(sessionOrSessionGroup => {
      if (sessionOrSessionGroup.sessions) {
        sessions = sessions.concat(values(sessionOrSessionGroup.sessions));
      } else {
        sessions.push(sessionOrSessionGroup);
      }
    });
    return sessions;
  }
);

/**
 * Gets the snapshot definition of the current registrants selected sessions if one is available.
 */
export const getSelectedSessionDefinitions = (
  state: $TSFixMe,
  widgetType = 'Sessions',
  widgetId?: $TSFixMe,
  sessionsSelected?: $TSFixMe
): $TSFixMe => {
  let sessions;
  switch (widgetType) {
    case 'Sessions':
      sessions = values(getAllSortedSessionsForPrimaryAndGuest(state));
      break;
    case 'InviteeAgenda':
    default:
      sessions = getAllSortedSessions(state, widgetType, widgetId);
      break;
  }
  const selectedSessions = sessionsSelected || getSelectedSessions(state);
  return sessions.filter(session => has(selectedSessions, session.id));
};

/**
 * Gets the snapshot definition of the current registrants selected quantity items if one is available.
 */
export const getSelectedQuantityItemDefinitions = (state: $TSFixMe, quantityItemsSelected?: $TSFixMe): $TSFixMe => {
  const quantityItems = values(getPrimarySortedVisibleQuantityItems(state));
  const selectedQuantityItems = quantityItemsSelected || getSelectedQuantityItems(state);
  return quantityItems.filter(quantityItem => has(selectedQuantityItems, quantityItem.id));
};

/**
 * Gets the snapshot definition of the current registrants selected donation items if one is available.
 */
export const getSelectedDonationItemDefinitions = (state: $TSFixMe, donationItemsSelected?: $TSFixMe): $TSFixMe => {
  const donationItems = values(getPrimarySortedVisibleDonationItems(state));
  const selectedDonationItems = donationItemsSelected || getSelectedDonationItems(state);
  return donationItems.filter(donationItem => has(selectedDonationItems, donationItem.id));
};

/**
 * Gets the snapshot definition of the current registrants guests selected sessions if one is available.
 */
export const getGuestSelectedSessionDefinitions = createSelector(
  getAllSortedSessionsForPrimaryAndGuest,
  getRegCart,
  getEventRegistrationId,
  (sessions, regCart, primaryRegId) => {
    const allGuestEventRegs = getGuestsOfRegistrant(regCart, primaryRegId, null);
    return sessions.filter(session => {
      let isSessionRegisteredFor;
      forEach(allGuestEventRegs, eventReg => {
        const registeredSessions = getSessionsFromRegCart(regCart, eventReg.eventRegistrationId);
        if (has(registeredSessions, session.id)) {
          isSessionRegisteredFor = true;
          return false;
        }
      });
      return isSessionRegisteredFor;
    });
  }
);

/**
 * Gets snapshot definition of the current registrants guests selected sessions separated by guest
 */
export const getGuestSelectedSessionDefinitionsByGuest = createSelector(
  getAllSortedSessionsForPrimaryAndGuest,
  getRegCart,
  getEventRegistrationId,
  (sessions, regCart, primaryRegId) => {
    const sessionsMap = new Map(sessions.map(session => [session.id, session]));
    const allGuestEventRegs = getGuestsOfRegistrant(regCart, primaryRegId, null);
    const guestSessionSelectionMap = new Map();
    allGuestEventRegs.forEach(eventReg => {
      const registeredSessions = getSessionsFromRegCart(regCart, eventReg.eventRegistrationId);
      let savedValue = [];
      let sessionInfo = [];
      for (const session in registeredSessions) {
        if (session != null) {
          sessionInfo = registeredSessions[session];
          if ((sessionInfo as $TSFixMe).requestedAction === 'REGISTER') {
            savedValue = guestSessionSelectionMap.get(eventReg.eventRegistrationId) || [];
            // Only conditionally set values into guestSessionSelectionMap to avoid lists like [undefined];
            const guestSessionSelectionValue = [
              ...savedValue,
              ...(sessionsMap.get(session) ? [sessionsMap.get(session)] : [])
            ];
            guestSessionSelectionMap.set(eventReg.eventRegistrationId, guestSessionSelectionValue);
          }
        }
      }
    });
    return guestSessionSelectionMap;
  }
);

export const getSessionGroups = createSelector(getPrimaryAndGuestSortedVisibleSessions, sessionAndSessionGroups =>
  filter(values(sessionAndSessionGroups), sessionGroup => sessionGroup.sessions)
);

const getOptionalSessionIdsByAction = registrant => {
  const optionalSessions = filter(registrant.sessionRegistrations, ({ registrationSourceType }) => {
    return registrationSourceType !== REGISTRATION_SOURCE_TYPES.INCLUDED;
  });
  const optionalSessionsByAction = groupBy(optionalSessions, ({ requestedAction }) => requestedAction);
  return {
    [REQUESTED_ACTIONS.REGISTER]: [],
    [REQUESTED_ACTIONS.UNREGISTER]: [],
    ...mapValues(optionalSessionsByAction, sessions => sessions.map(({ productId }) => productId))
  };
};

/**
 * Checks whether certain session validations should be skipped during reg mod
 * Compares selected sessions to register with existing registered sessions
 * before reg mod for individual attendees
 */
export const getSkipSessionValidationAttendees = (state: $TSFixMe): $TSFixMe => {
  const attendeeMap = {
    attendeesToSkipMinMaxValidation: [],
    attendeesToSkipAdvancedRulesValidation: [],
    attendeesToSkipOverlapValidation: []
  };
  if (!isRegistrationModification(state)) {
    return attendeeMap;
  }
  const sessionsToWhichRuleApply = getAdvancedSessionRules(state).reduce(
    (sessions, rule) => sessions.concat(rule.optionalSession),
    []
  );
  const hasIntersectionWithSessionRules = sessions => {
    return (
      !isEmpty(sessionsToWhichRuleApply) && sessions.some(sessionId => sessionsToWhichRuleApply.includes(sessionId))
    );
  };
  const currentRegistrants = getCurrentRegistrantAndGuests(state);

  currentRegistrants.forEach(registrant => {
    if (!registrant) {
      return;
    }
    const modStartSelectors = modificationStartFromEventRegistrationId(registrant.eventRegistrationId);

    const registeredAdmissionItem = modStartSelectors.getRegisteredAdmissionItem(state);
    const selectedAdmissionItem = getSelectedAdmissionItemByRegId(getRegCart(state), registrant.eventRegistrationId);
    const hasAdmissionItemSelectionChanged = registeredAdmissionItem?.productId !== selectedAdmissionItem?.productId;

    // optional sessions that have already been registered for
    const registeredSessionIdsForAttendee = modStartSelectors.getRegisteredOptionalSessionIds(state);
    // current optional session selection, including sessions that have already been registered for
    const optionalSessionsByAction = getOptionalSessionIdsByAction(registrant);
    const selectedSessionIdsForAttendee = optionalSessionsByAction[REQUESTED_ACTIONS.REGISTER];
    const unSelectedSessionIdsForAttendee = optionalSessionsByAction[REQUESTED_ACTIONS.UNREGISTER];

    const newlyChangedSessions = difference(selectedSessionIdsForAttendee, registeredSessionIdsForAttendee).concat(
      unSelectedSessionIdsForAttendee
    );

    // skip the validations if there was no change in session selection
    if (!isEmpty(selectedSessionIdsForAttendee) && isEmpty(newlyChangedSessions)) {
      // don't skip the minmax validation if the admission item was changed
      if (!hasAdmissionItemSelectionChanged) {
        attendeeMap.attendeesToSkipMinMaxValidation.push(registrant.eventRegistrationId);
      }
      attendeeMap.attendeesToSkipOverlapValidation.push(registrant.eventRegistrationId);
    }
    // skip the advanced rule validation if newly selected sessions don't have advanced rule associations,
    // unless the admission was changed
    if (
      !hasAdmissionItemSelectionChanged &&
      !isEmpty(selectedSessionIdsForAttendee) &&
      !hasIntersectionWithSessionRules(newlyChangedSessions)
    ) {
      attendeeMap.attendeesToSkipAdvancedRulesValidation.push(registrant.eventRegistrationId);
    }
  });

  return attendeeMap;
};
