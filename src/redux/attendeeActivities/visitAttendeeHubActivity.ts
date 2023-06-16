import { getAttendeeId } from '../selectors/currentRegistrant';
import { getCurrentPageName } from '../website/selectors';

export function recordVisitAttendeeHubActivity(buttonText: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      event: { id: eventId },
      clients: { eventGuestClient },
      accessToken
    } = getState();

    const attendeeId = getAttendeeId(getState());
    const pageName = getCurrentPageName(getState());

    if (attendeeId) {
      const fact = {
        type: 'event_website_visit_attendee_hub',
        eventId,
        attendeeId,
        pageName,
        buttonText
      };

      await eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
    }
  };
}
