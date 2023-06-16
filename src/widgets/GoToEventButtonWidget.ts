import { connect } from 'react-redux';
import { getAttendeeId } from '../redux/selectors/currentRegistrant';
import { createSelector } from 'reselect';
import { widgetWithBehavior } from 'event-widgets/lib/GoToEvent';
import { recordVisitAttendeeHubActivity } from '../redux/attendeeActivities/visitAttendeeHubActivity';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('event-guestside-site/src/widgets/GoToEventButtonWidget.js');

const getAttendeeHubLink = createSelector(
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'attendeeExperience' does not exist on ty... Remove this comment to see the full error message
  state => state.attendeeExperience.url,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'event' does not exist on type 'unknown'.
  state => state.event.id,
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'userSession' does not exist on type 'unk... Remove this comment to see the full error message
  state => state.userSession?.verifiedAttendee,
  getAttendeeId,
  (baseUrl, eventId, isVerified, attendeeId) => {
    return `${baseUrl}events/${eventId}${!!attendeeId && !isVerified ? `?inviteeId=${attendeeId}` : ''}`;
  }
);

const GoToEventButtonWidget = widgetWithBehavior({
  recordVisitAttendeeHubActivity: (...args) => {
    return async (dispatch, getState) => {
      try {
        // @ts-expect-error ts-migrate(2556) FIXME: Expected 1 arguments, but got 0 or more.
        await recordVisitAttendeeHubActivity(...args)(dispatch, getState);
      } catch (error) {
        LOG.error('Failed to record AttendeeHub Visit activity.', error);
      }
    };
  }
});

/**
 * Data wrapper for the WAX Go to Event Button widget.
 */
export default connect((state: $TSFixMe, ownProps: $TSFixMe) => {
  const showWidget = state.attendeeExperience?.isEventWebAppPublished;
  return {
    config: ownProps.config,
    attendeeHubLink: getAttendeeHubLink(state),
    hideWidget: !showWidget
  };
}, {})(GoToEventButtonWidget);
