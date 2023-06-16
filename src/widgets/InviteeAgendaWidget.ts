import { connect } from 'react-redux';
import AgendaWidget from 'event-widgets/lib/Agenda/AgendaWidget';
import { getEventTimezone, RootState } from '../redux/reducer';
import { getAccountSessionCategories, getSessionCustomFieldDefinitions } from 'event-widgets/redux/selectors/account';
import { getSpeakerCategories } from 'event-widgets/redux/selectors';
import { getWebsiteSpeakers, isGuestRegistrationEnabled } from 'event-widgets/redux/selectors/event';
import { getSessionCategoryListOrders } from '../redux/selectors/event';
import { openTimeZoneDialog } from '../dialogs';
import { getSelectedTimezone } from 'event-widgets/redux/selectors/timezone';
import { isPostRegistrationPage } from '../redux/website/registrationProcesses';
import { getCurrentPageId } from '../redux/pathInfo';
import { GUESTS_AGENDA_RELEASE_VARIANT } from '@cvent/event-ui-experiments';
import { ATTENDEE_TYPE } from 'event-widgets/constants/Attendee';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import { isVirtual } from 'event-widgets/utils/AttendingFormatUtils';
import { getRegistrationPathIdOrNull } from '../redux/selectors/currentRegistrationPath';
import { isNameFormatUpdateEnabled } from '../ExperimentHelper';

/* Check if the invitee is a Guest */
const isGuest = invitee => {
  return invitee.attendeeType === ATTENDEE_TYPE.GUEST;
};

/* Check if the invitee is an Attendee */
const isAttendee = invitee => {
  return invitee.attendeeType === ATTENDEE_TYPE.ATTENDEE;
};

/* Check if the invitee is a Group Leader */
const isGroupLeader = invitee => {
  return invitee.attendeeType === ATTENDEE_TYPE.GROUP_LEADER;
};

/* Gets the invitees with the guests available in the regCart */
const getInviteesWithGuests = (regCart, translate, allowGuestDetails) => {
  const eventRegistrations = regCart?.eventRegistrations || {};
  const registrations = Object.values(eventRegistrations);
  const inviteeWithGuests = [];
  registrations.forEach(registration => {
    if (
      (isAttendee(registration) || isGroupLeader(registration) || (allowGuestDetails && isGuest(registration))) &&
      (registration as $TSFixMe).requestedAction === 'REGISTER'
    ) {
      const attendeeType = (registration as $TSFixMe).attendeeType;
      const eventRegistrationId = (registration as $TSFixMe).eventRegistrationId;
      const primaryRegistrationId = (registration as $TSFixMe).primaryRegistrationId;
      const firstName = (registration as $TSFixMe).attendee?.personalInformation?.firstName || '';
      const lastName = (registration as $TSFixMe).attendee?.personalInformation?.lastName || '';
      const attendeeId = (registration as $TSFixMe).attendee?.attendeeId;
      let fullName = '';
      if (isAttendee(registration) || isGroupLeader(registration)) {
        const youStr = translate('EventWidgets_Agenda_AttendeeDropdown_You__resx');
        fullName = `${firstName} ${lastName} ${youStr}`;
      } else {
        fullName = `${firstName} ${lastName}`;
      }

      inviteeWithGuests.push({
        fullName,
        firstName,
        lastName,
        eventRegistrationId,
        primaryRegistrationId,
        attendeeType,
        attendeeId
      });
    }
  });

  return inviteeWithGuests;
};

/* Find the Group Leader from the list of invitees */
const findGroupLeader = inviteesDetail => {
  return inviteesDetail.find(invitee => isGroupLeader(invitee));
};

/* Find the Attendee from the list of invitees */
const findPrimaryAttendee = inviteesDetail => {
  return inviteesDetail.find(invitee => isAttendee(invitee));
};

/* Finds the guests associated with the primary invitee passed to the method */
const findGuestsForPrimaryInvitee = (primaryInvitee, inviteesDetail) => {
  const invitees = [];
  const eventRegIdForPrimaryInvitee = primaryInvitee.eventRegistrationId;
  const isPrimaryAttendeeGroupLeader = isGroupLeader(primaryInvitee);
  const isPrimaryAttendeeAttendee = isAttendee(primaryInvitee);
  inviteesDetail.forEach(invitee => {
    if (
      (isGuest(invitee) && invitee.primaryRegistrationId === eventRegIdForPrimaryInvitee) ||
      (isPrimaryAttendeeGroupLeader && isGroupLeader(invitee)) ||
      (isPrimaryAttendeeAttendee && isAttendee(invitee))
    ) {
      invitees.push(invitee);
    }
  });

  return invitees;
};

/* Gets all the invitees present in the regcart */
export const getAllInvitees = (regCart: $TSFixMe, translate: $TSFixMe, allowGuestDetails: $TSFixMe): $TSFixMe => {
  const allInviteesDetail = getInviteesWithGuests(regCart, translate, allowGuestDetails);
  const groupLeaderDetail = findGroupLeader(allInviteesDetail);
  let inviteesDetail = [];
  /**
   * If Group Leader is present, then we need to pass the Group Leader with his/her guests.
   * Else we need to pass Attendee with his/her guests.
   */
  if (groupLeaderDetail) {
    inviteesDetail = findGuestsForPrimaryInvitee(groupLeaderDetail, allInviteesDetail);
  } else {
    const primaryAttendeeDetail = findPrimaryAttendee(allInviteesDetail);
    if (primaryAttendeeDetail) {
      inviteesDetail = findGuestsForPrimaryInvitee(primaryAttendeeDetail, allInviteesDetail);
    }
  }

  return inviteesDetail;
};

const getAttendeeSessionsData = (primary, guests) => {
  const attendees = {};
  if (primary?.sessionRegistrations) {
    attendees[primary.eventRegistrationId] = primary.sessionRegistrations;
  }

  guests.forEach(guest => {
    if (guest?.sessionRegistrations) {
      attendees[guest.eventRegistrationId] = guest.sessionRegistrations;
    }
  });
  return attendees;
};

const mapStateToProps = (state: RootState) => {
  const {
    appData,
    event,
    capacity,
    experiments,
    visibleProducts,
    registrationForm: { regCart },
    text: { translate, translateTime, translateDate }
  } = state;
  const eventTimezone = getEventTimezone(state);
  const selectedTimeZone = getSelectedTimezone(state);
  const sessionCategories = getAccountSessionCategories(state);
  const sessionCustomFieldDefinitions = getSessionCustomFieldDefinitions(state);
  const sessionCategoryListOrders = getSessionCategoryListOrders(state);
  const speakers = getWebsiteSpeakers(event);
  const speakerCategories = getSpeakerCategories(state);
  const isPostRegPage = isPostRegistrationPage(state, getCurrentPageId(state));
  const isInviteeAgenda = true;
  // Always allow the IndividualInviteesAgenda from this widget in Guestside
  const allowIndividualInviteesAgenda = true;
  // TODO: This property can be removed while removing experiment
  const allowGuestDetails = experiments?.flexProductVersion >= GUESTS_AGENDA_RELEASE_VARIANT;
  const registrationPathId = getRegistrationPathIdOrNull(state);
  const isGuestRegEnabled = isGuestRegistrationEnabled(event, appData, registrationPathId);
  const allowGuests = isGuestRegEnabled && allowGuestDetails;
  const guestDetails = getAllInvitees(regCart, translate, allowGuests);
  const hasVirtual = isVirtual(event);
  const primary = currentRegistrant.getEventRegistration(state) || {};
  const guests = currentRegistrant.getConfirmedGuests(state) || [];
  const attendeeSessionsData = getAttendeeSessionsData(primary, guests);
  const isGuestSide = true;
  const nameFormatUpdateEnabled = isNameFormatUpdateEnabled(state);
  return {
    translateTime,
    translateDate,
    sessionCategories,
    capacity,
    sessionCustomFieldDefinitions,
    sessionCategoryListOrders,
    speakerCategories,
    selectedTimeZone,
    isPostRegPage,
    isInviteeAgenda,
    eventTimezone,
    isGuestRegEnabled,
    guestDetails,
    nameFormatUpdateEnabled,
    allowIndividualInviteesAgenda,
    allowGuestDetails,
    hasVirtual,
    visibleProducts,
    attendeeSessionsData,
    speakers,
    isGuestSide
  };
};

const mapDispatchToProps = {
  switchTimeZone: openTimeZoneDialog
};

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps
  };
};

/**
 * Data wrapper for the Invitee Agenda widget
 */
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AgendaWidget);
