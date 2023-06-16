import { connect } from 'react-redux';
import VideoWidget from 'event-widgets/lib/Video/VideoWidget';
import { getAttendeeId } from '../redux/selectors/currentRegistrant';
import { getCurrentPageName } from '../redux/website/selectors';
import { LIVESTREAM_RELEASE_VARIANT } from '@cvent/event-ui-experiments';
import { areCookiesAllowedForSocialMedia } from '../utils/cookieConsentUtils';

function recordVideoViewActivity(videoTitle) {
  return (dispatch, getState) => {
    const state = getState();
    const attendeeId = getAttendeeId(state);
    const pageName = getCurrentPageName(state);

    // For now we are only tracking this for confirmed attendees. Next phase, we will track this for invitees
    if (attendeeId) {
      const {
        event: { id: eventId },
        clients: { eventGuestClient },
        accessToken
      } = getState();

      const fact = {
        type: 'event_website_play_video',
        eventId,
        attendeeId,
        pageName,
        videoTitle,
        timeSpentWatchingVideo: 0
      };

      if (eventGuestClient.publishAttendeeActivityFact) {
        eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
      }
    }
  };
}

const mapStateToProps = (state: $TSFixMe) => {
  const areCookiesAllowed = areCookiesAllowedForSocialMedia(state);
  return {
    allowLiveStream: state?.experiments?.flexProductVersion >= LIVESTREAM_RELEASE_VARIANT,
    areCookiesAllowed
  };
};

/**
 * Data wrapper for connecting the Video Widget.
 */
export default connect(mapStateToProps, { recordVideoViewActivity })(VideoWidget);
