import { Action, Store } from 'redux';
import { getIn } from 'icepick';
import { getAttendeeId } from '../redux/selectors/currentRegistrant';
import { recordFact } from 'nucleus-widgets/utils/analytics/actions';
import { UnknownFact } from '../redux/analytics';

/**
 * A function to call at the end of every entry route handler to publish website page view information
 */
export function recordWebsitePageViewActivity(store: Store, pageId: string): void {
  const state = store.getState();
  const {
    website: { pages },
    text: { translate },
    event: { id: eventId },
    clients: { eventGuestClient },
    environment,
    accessToken
  } = state;
  const attendeeId = getAttendeeId(state);

  if (pageId) {
    const page = getIn(pages, [pageId]) || {};
    const translatedPageName = translate(page.name);
    const fact = {
      type: 'event_website_page_view',
      eventId,
      attendeeId,
      pageName: translatedPageName,
      timeSpentOnPage: 0,
      env: environment
    };

    if (attendeeId) {
      if (eventGuestClient.publishAttendeeActivityFact) {
        eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
      }
    } else {
      store.dispatch(recordUnknownWebsitePageViewActivity(fact));
    }
  }
}

/**
 * A fact that indicates page views
 */
export function recordUnknownWebsitePageViewActivity(pageViewFact: UnknownFact): Action {
  return recordFact({
    type: 'unknown_flex_activities',
    activity_type: 'unknown_activity.event_website_page_view',
    event_id: pageViewFact.eventId,
    environment: pageViewFact.env,
    data: {
      page_name: pageViewFact.pageName
    }
  });
}
