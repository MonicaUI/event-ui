import { connect } from 'react-redux';
import AttendeeListOptInWidget from 'event-widgets/lib/AttendeeList/AttendeeListOptInWidget';
import { doesGuestRegistrationExistOnRegistrationPath } from 'event-widgets/redux/selectors/event';
import { setEventRegistrationFieldValue } from '../redux/registrationForm/regCart/actions';
import {
  getEventRegistrationId,
  includeNameInAttendeeList,
  allowOthersToSendEmail,
  getRegistrationPathId
} from '../redux/selectors/currentRegistrant';

export function setIncludeNameInAttendeeList(eventRegistrationId: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return setEventRegistrationFieldValue(eventRegistrationId, ['attendee', 'displayOnAttendeeList'], value);
}

export function setAllowOthersToSendEmail(eventRegistrationId: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return setEventRegistrationFieldValue(eventRegistrationId, ['attendee', 'receiveAttendeeEmail'], value);
}

/**
 * Data wrapper for AttendeeListOptIn widget
 */

export default connect(
  (state: $TSFixMe) => {
    const eventRegistrationId = getEventRegistrationId(state);
    const registrationPathId = getRegistrationPathId(state);

    return {
      eventRegistrationId,
      includeNameInAttendeeList: Boolean(includeNameInAttendeeList(state, eventRegistrationId)),
      allowOthersToSendEmail: Boolean(allowOthersToSendEmail(state, eventRegistrationId)),
      isGuestRegistrationEnabled: doesGuestRegistrationExistOnRegistrationPath(
        state.event,
        state.appData,
        state.website,
        registrationPathId
      )
    };
  },
  {
    onSetIncludeNameInAttendeeList: setIncludeNameInAttendeeList,
    onSetAllowOthersToSendEmail: setAllowOthersToSendEmail
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      onSetIncludeNameInAttendeeList: dispatchProps.onSetIncludeNameInAttendeeList.bind(
        null,
        stateProps.eventRegistrationId
      ),
      onSetAllowOthersToSendEmail: dispatchProps.onSetAllowOthersToSendEmail.bind(null, stateProps.eventRegistrationId)
    };
  }
)(AttendeeListOptInWidget);
