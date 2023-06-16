import { connect } from 'react-redux';
import { getEventTimezone } from '../redux/reducer';
import { adjustTimeZoneTimesForEvent } from 'event-widgets/redux/selectors/event';
import { getSelectedTimezone, getTimeZoneForEventTimeWidgets } from 'event-widgets/redux/selectors/timezone';
import { openTimeZoneDialog } from '../dialogs';
import RegistrationDeadlineWidget from 'event-widgets/lib/RegistrationDeadline/RegistrationDeadlineWidget';

/**
 * Data wrapper for the registration deadline widget.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const {
      text: { translate, translateDate, translateTime }
    } = state;
    const eventTimezone = getEventTimezone(state);
    const selectedTimeZone = getSelectedTimezone(state);
    let eventInfo = {
      closeDate: state.event.closeDate
    };
    eventInfo = adjustTimeZoneTimesForEvent(eventInfo, selectedTimeZone, eventTimezone);
    const timeZone = getTimeZoneForEventTimeWidgets(eventTimezone, selectedTimeZone, translate);
    return {
      date: eventInfo.closeDate,
      label: props.config.editableText,
      timeZone,
      translateDate,
      translateTime
    };
  },
  {
    switchTimeZone: openTimeZoneDialog
  }
)(RegistrationDeadlineWidget);
