import EventFooterWidget from 'event-widgets/lib/EventFooter/EventFooterWidget';
import { connect } from 'react-redux';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import { createSelector } from 'reselect';
import { switchCcpaDialogMode, makeCcpaComplianceRequest } from '../redux/privacy/actions';

const primaryEventRegistrationInfoSelector = state => currentRegistrant.getEventRegistration(state);
const guestEventRegistrationInfoSelector = state => currentRegistrant.getRegisteredStatusGuests(state);

const getPrimaryEventRegistrationInfo = createSelector(
  primaryEventRegistrationInfoSelector,
  primaryEventRegistration => {
    let primaryEventRegistrationInfo = {};
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (primaryEventRegistration && primaryEventRegistration.attendee) {
      primaryEventRegistrationInfo = {
        firstName: primaryEventRegistration.attendee.personalInformation.firstName,
        lastName: primaryEventRegistration.attendee.personalInformation.lastName,
        emailAddress: primaryEventRegistration.attendee.personalInformation.emailAddress,
        eventRegistrationId: primaryEventRegistration.eventRegistrationId,
        attendeeEntityId: primaryEventRegistration.attendee.personalInformation.contactId
      };
    }
    return primaryEventRegistrationInfo;
  }
);

const getIsAttendeeRegistered = createSelector(primaryEventRegistrationInfoSelector, primaryEventRegistration => {
  if (primaryEventRegistration) {
    return !!primaryEventRegistration.confirmationNumber;
  }
  return false;
});

const getGuestsEventRegistrations = createSelector(guestEventRegistrationInfoSelector, guestsEventRegistrations => {
  return guestsEventRegistrations.map(item => {
    return {
      firstName: item.attendee.personalInformation.firstName,
      lastName: item.attendee.personalInformation.lastName,
      eventRegistrationId: item.eventRegistrationId,
      emailAddress: item.attendee.personalInformation.emailAddress,
      attendeeEntityId: item.attendee.attendeeId
    };
  });
});

export default connect(
  (state: $TSFixMe) => {
    const isAdminReg = currentRegistrant.getAdminPersonalInformation(state);
    return {
      primaryEventRegistrationInfo: getPrimaryEventRegistrationInfo(state),
      guestsEventRegistrationsInfo: getGuestsEventRegistrations(state),
      isAttendeeRegistered: getIsAttendeeRegistered(state),
      isAdminReg,
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      ccpaDialogMode: state.privacy && state.privacy.ccpa.dialogMode,
      isPlanner: state.defaultUserSession.isPlanner
    };
  },
  {
    switchCcpaDialogMode,
    makeCcpaComplianceRequest
  }
)(EventFooterWidget);
