import { getRegCart } from './shared';
import { getEventRegistrationId } from './currentRegistrant';
import { getEventAttendingFormat } from './event';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';
import {
  getEventRegistration as getEventRegistrationFromRegCart,
  getGuestsOfRegistrant
} from '../registrationForm/regCart/selectors';
import { isGuestRegistrationEnabled } from './currentRegistrationPath';
import { createSelector } from 'reselect';

/**
 * Returns true if there is an in-person registration in current registration. This means that in the registration
 * at least one attendee (invitee or guest) has selected in-person regType. This applicable for Hybrid events only
 * as for in-person and virtual events, all reg types are treated as in-person regType, and so all attendees will be
 * treated as in-person attendee. Current Registration includes invitee and guest not group member. Group member is
 * total separate registration.
 */
export const getHasCurrentRegistrationAtLeastOneInPersonAttendee = createSelector(
  state => getRegCart(state),
  state => getEventRegistrationId(state),
  state => isGuestRegistrationEnabled(state),
  state => getEventAttendingFormat(state),
  (regCart, primaryRegId, isGuestOn, eventAttendingFormat) => {
    if (!shouldHybridFlowWork(eventAttendingFormat)) {
      return true;
    }
    const primaryEventReg = getEventRegistrationFromRegCart(regCart, primaryRegId);
    if (!regCart || !primaryRegId || !primaryEventReg) {
      return false;
    }
    if (!primaryEventReg.attendingFormatId || primaryEventReg.attendingFormatId === AttendingFormat.INPERSON) {
      return true;
    }
    const guestEventRegs = isGuestOn ? getGuestsOfRegistrant(regCart, primaryRegId, null) || [] : [];
    return guestEventRegs.some(guestEventReg => guestEventReg.attendingFormatId === AttendingFormat.INPERSON);
  }
);

/**
 * Returns true if there is atleast one virtual registration in current registration. This means that in the
 * registration at least one attendee (invitee or guest) has selected virtual regType. This applicable for
 * Hybrid events only as for in-person and virtual events, all reg types are treated as in-person regType, and so all
 * attendees will be treated as in-person attendee. Current Registration includes invitee and guest not group member as
 * group member is total separate registration.
 */
export const getHasCurrentRegistrationAtLeastOneVirtualAttendee = createSelector(
  state => getRegCart(state),
  state => getEventRegistrationId(state),
  state => isGuestRegistrationEnabled(state),
  state => getEventAttendingFormat(state),
  (regCart, primaryRegId, isGuestOn, eventAttendingFormat) => {
    if (!shouldHybridFlowWork(eventAttendingFormat)) {
      return false;
    }
    const primaryEventReg = getEventRegistrationFromRegCart(regCart, primaryRegId);
    if (!regCart || !primaryRegId || !primaryEventReg) {
      return false;
    }
    if (primaryEventReg.attendingFormatId === AttendingFormat.VIRTUAL) {
      return true;
    }
    const guestEventRegs = isGuestOn ? getGuestsOfRegistrant(regCart, primaryRegId, null) || [] : [];
    return guestEventRegs.some(guestEventReg => guestEventReg.attendingFormatId === AttendingFormat.VIRTUAL);
  }
);
