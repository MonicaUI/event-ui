import { connect } from 'react-redux';
import AttendeeListWidget from 'event-widgets/lib/AttendeeList/AttendeeListWidget';
import { isLoggedIn, getAttendee } from '../redux/selectors/currentRegistrant';
import { sendAttendeeEmail, resetAttendeeEmail } from '../redux/attendeeList';
import { isNameFormatUpdateEnabled } from '../ExperimentHelper';

const sendEmail = sendAttendeeEmail;

const resetAttendeeEmailData = resetAttendeeEmail;

/**
 * Data wrapper for Attendee List widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const nameFormatUpdateEnabled = isNameFormatUpdateEnabled(state);
    return {
      isLoggedIn: isLoggedIn(state),
      attendee: getAttendee(state),
      attendeeEmailSuccess: state.attendeeList.attendeeEmailSuccess,
      attendeeEmailError: state.attendeeList.attendeeEmailError,
      nameFormatUpdateEnabled
    };
  },
  { sendEmail, resetAttendeeEmailData }
)(AttendeeListWidget);
