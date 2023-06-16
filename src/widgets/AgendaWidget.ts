import { connect } from 'react-redux';
import { widgetWithBehavior } from 'event-widgets/lib/Agenda/AgendaWidget';
import { getEventTimezone } from '../redux/reducer';
import { getAccountSessionCategories, getSessionCustomFieldDefinitions } from 'event-widgets/redux/selectors/account';
import {
  getSessionsWithSpeakers,
  adjustTimeZoneTimesForSessions,
  getSortedSessions
} from 'event-widgets/redux/selectors/website/sessions';
import { getSpeakerCategories } from 'event-widgets/redux/selectors';
import { getSelectedTimezone } from 'event-widgets/redux/selectors/timezone';
import { getWebsiteSpeakers } from 'event-widgets/redux/selectors/event';
import { getSessionCategoryListOrders } from '../redux/selectors/event';
import getDialogContainerStyle from '../dialogs/shared/getDialogContainerStyle';
import { getAllSortedSessions } from '../redux/selectors/productSelectors';
import { openTimeZoneDialog } from '../dialogs';
import { recordViewSpeakerProfileActivity } from './Speakers/SpeakersWidget';

const AgendaWidget = widgetWithBehavior({
  recordViewSpeakerProfileActivity
});

/**
 * Data wrapper for the Sessions widget
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const {
      text: { translate, translateDate, translateTime, locale }
    } = state;
    const eventTimezone = getEventTimezone(state);
    const selectedTimeZone = getSelectedTimezone(state);
    const sessionCategories = getAccountSessionCategories(state);
    const sessionCustomFieldDefinitions = getSessionCustomFieldDefinitions(state);
    const sortOrder = props.config?.sort?.selectedSortOrder || [];
    const sessions = getSortedSessions(
      getAllSortedSessions(
        state,
        'Agenda',
        props.id,
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        props.config.display && props.config.display.limitByRegistrationType
      ),
      sortOrder,
      eventTimezone,
      state.account,
      state.event
    );
    const sortedSessions = adjustTimeZoneTimesForSessions(sessions, selectedTimeZone, eventTimezone);
    const sessionCategoryListOrders = getSessionCategoryListOrders(state);
    const speakers = getWebsiteSpeakers(state.event);
    const speakerCategories = getSpeakerCategories(state);
    const sessionsWithSpeakers = getSessionsWithSpeakers(sortedSessions, speakers);
    return {
      locale,
      translateTime,
      translateDate,
      timeZone: translate(eventTimezone.abbreviationResourceKey),
      sessionCategories,
      capacity: state.capacity,
      sessionCustomFieldDefinitions,
      sessions: sessionsWithSpeakers,
      sessionCategoryListOrders,
      speakerCategories,
      dialogContainerStyle: getDialogContainerStyle(state),
      selectedTimeZone
    };
  },
  {
    switchTimeZone: openTimeZoneDialog
  }
)(AgendaWidget);
