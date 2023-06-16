import { connect } from 'react-redux';
import { getWebsiteSpeakersWithCategories, getSpeakerCategories } from 'event-widgets/redux/selectors';
import getDialogContainerStyle from '../../dialogs/shared/getDialogContainerStyle';
import { loadSpeakerDocuments } from '../../redux/speakerDocument';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getSpeakerDocuments } from '../../redux/selectors/shared';
import {
  recordUnknownSpeakerFileDownloadActivity,
  recordUnknownViewSpeakerProfileActivity
} from './viewSpeakerProfileActivity';
import { widgetWithBehavior } from 'event-widgets/lib/Speakers/SpeakersWidget';
import { getAttendeeId } from '../../redux/selectors/currentRegistrant';
import type { AsyncAppThunk } from '../../redux/reducer';

export type speakerDocument = {
  name: string;
  extension: string;
  id: string;
};

export function recordSpeakerFileDownloadActivity(speakerId: string, document: speakerDocument): AsyncAppThunk {
  return async (dispatch, getState) => {
    if (speakerId) {
      const {
        event: { id: eventId },
        clients: { eventGuestClient },
        accessToken,
        environment
      } = getState();
      const attendeeId = getAttendeeId(getState());
      const fileName = document.name;
      const fileType = document.extension;
      const documentId = document.id;
      const fact = {
        type: 'event_website_speaker_file_download',
        eventId,
        attendeeId,
        speakerId,
        fileName,
        fileType,
        documentId,
        env: environment
      };
      if (attendeeId) {
        await eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
      } else {
        dispatch(recordUnknownSpeakerFileDownloadActivity(fact));
      }
    }
  };
}

export function recordViewSpeakerProfileActivity(speakerId: string): AsyncAppThunk {
  return async (dispatch, getState) => {
    if (speakerId) {
      const {
        event: { id: eventId },
        clients: { eventGuestClient },
        accessToken,
        environment
      } = getState();

      const attendeeId = getAttendeeId(getState());

      const fact = {
        type: 'event_website_speaker_profile_view',
        eventId,
        attendeeId,
        speakerId,
        env: environment
      };
      if (attendeeId) {
        await eventGuestClient.publishAttendeeActivityFact(accessToken, fact);
      } else {
        dispatch(recordUnknownViewSpeakerProfileActivity(fact));
      }
    }
  };
}

const SpeakersWidget = widgetWithBehavior({
  recordViewSpeakerProfileActivity,
  recordSpeakerFileDownloadActivity
});

/**
 * Data wrapper for the Speakers widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const speakers = getWebsiteSpeakersWithCategories(state);
    const speakerCategories = getSpeakerCategories(state);
    return {
      speakers,
      speakerCategories,
      dialogContainerStyle: getDialogContainerStyle(state),
      getSpeakerDocuments
    };
  },
  {
    loadSpeakerDocuments: withLoading(loadSpeakerDocuments)
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      loadSpeakerDocuments: dispatchProps.loadSpeakerDocuments.bind(null)
    };
  }
)(SpeakersWidget);
