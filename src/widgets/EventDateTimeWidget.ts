import { connect } from 'react-redux';
import { getEventTimezone } from '../redux/reducer';
import { adjustTimeZoneTimesForEvent } from 'event-widgets/redux/selectors/event';
import { getSelectedTimezone, getTimeZoneForEventTimeWidgets } from 'event-widgets/redux/selectors/timezone';
import { openTimeZoneDialog } from '../dialogs';
import EventDateTimeWidget from 'event-widgets/lib/EventDateTime/EventDateTimeWidget';

/**
 * Data wrapper for the event date time widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const {
      text: { translate, translateDate, translateTime }
    } = state;
    const eventTimezone = getEventTimezone(state);
    const selectedTimeZone = getSelectedTimezone(state);
    let eventInfo = {
      startDate: state.event.startDate,
      endDate: state.event.endDate
    };
    eventInfo = adjustTimeZoneTimesForEvent(eventInfo, selectedTimeZone, eventTimezone);
    const timeZone = getTimeZoneForEventTimeWidgets(eventTimezone, selectedTimeZone, translate);
    return {
      startDate: eventInfo.startDate,
      endDate: eventInfo.endDate,
      timeZone,
      translateDate,
      translateTime
    };
  },
  {
    switchTimeZone: openTimeZoneDialog
  }
)(EventDateTimeWidget);
