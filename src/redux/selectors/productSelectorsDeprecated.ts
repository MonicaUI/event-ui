import { pickBy } from 'lodash';
import { getCurrentRegistrantAndGuests } from './productSelectors';
import { createSelector } from 'reselect';

/**
 * Returns session info for primary + guests in the form
 * {
 *  sessionId: {
 *    registered: [{
 *      eventRegistrationId,
 *      attendee: regcart.eventRegistrations[id].attendee
 *    }],
 *    associated: [{
 *      eventRegistrationId,
 *      attendee: regcart.eventRegistrations[id].attendee
 *    }],
 *    unRegistered: [{
 *      eventRegistrationId,
 *      attendee: regcart.eventRegistrations[id].attendee
 *    }]
 *  }
 * }
 * This is needed for updating the session widget button text and the remaining capacity count.
 * Note: a registered session can be in registered or associated
 */
export const getSessionInfoForPrimaryAndGuests = createSelector(
  // Selector arguments
  getCurrentRegistrantAndGuests,

  // Result function
  primaryAndGuestEventRegs => {
    const sessionInfo = {};
    if (!primaryAndGuestEventRegs) {
      return sessionInfo;
    }
    primaryAndGuestEventRegs.forEach(eventReg => {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const allSessions = (eventReg && eventReg.sessionRegistrations) || {};
      const registeredSessions = pickBy(allSessions, session => session.requestedAction === 'REGISTER');
      const unregisteredSessions = pickBy(allSessions, session => session.requestedAction === 'UNREGISTER');
      const associatedSessions = pickBy(registeredSessions, s => s.registrationSourceType === 'AdmissionItem');
      const reg = {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        eventRegistrationId: eventReg && eventReg.eventRegistrationId,
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        attendee: eventReg && eventReg.attendee
      };
      Object.keys({ ...registeredSessions, ...unregisteredSessions }).forEach(sessionId => {
        // create the empty object if this is the first time we are seeing this session id.
        // eslint-disable-next-line no-prototype-builtins
        if (!sessionInfo.hasOwnProperty(sessionId)) {
          sessionInfo[sessionId] = {
            registered: [],
            associated: [],
            unRegistered: []
          };
        }
        // place the event reg in the respective bucket.
        if (associatedSessions[sessionId]) {
          sessionInfo[sessionId].associated.push(reg);
        } else if (registeredSessions[sessionId]) {
          sessionInfo[sessionId].registered.push(reg);
        } else if (unregisteredSessions[sessionId]) {
          sessionInfo[sessionId].unRegistered.push(reg);
        }
      });
    });
    return sessionInfo;
  }
);

export const getSessionWaitlistInfoForPrimaryAndGuests = createSelector(
  // Selector arguments
  getCurrentRegistrantAndGuests,

  // Result function
  primaryAndGuestEventRegs => {
    const sessionWaitlistInfo = {};
    if (!primaryAndGuestEventRegs) {
      return sessionWaitlistInfo;
    }
    primaryAndGuestEventRegs.forEach(eventReg => {
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const allSessions = (eventReg && eventReg.sessionWaitlists) || {};
      const waitlistedSessions = pickBy(allSessions, session => session.requestedAction === 'WAITLIST');
      const unwaitlistedSessions = pickBy(allSessions, session => session.requestedAction === 'LEAVE_WAITLIST');
      const reg = {
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        eventRegistrationId: eventReg && eventReg.eventRegistrationId,
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        attendee: eventReg && eventReg.attendee
      };
      Object.keys({ ...waitlistedSessions, ...unwaitlistedSessions }).forEach(sessionId => {
        // create the empty object if this is the first time we are seeing this session id.
        // eslint-disable-next-line no-prototype-builtins
        if (!sessionWaitlistInfo.hasOwnProperty(sessionId)) {
          sessionWaitlistInfo[sessionId] = {
            waitlisted: [],
            unWaitlisted: []
          };
        }
        if (waitlistedSessions[sessionId]) {
          sessionWaitlistInfo[sessionId].waitlisted.push(reg);
        } else if (unwaitlistedSessions[sessionId]) {
          sessionWaitlistInfo[sessionId].unWaitlisted.push(reg);
        }
      });
    });
    return sessionWaitlistInfo;
  }
);
