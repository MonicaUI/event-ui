import { Action } from 'redux';
import { recordFact } from 'nucleus-widgets/utils/analytics/actions';
import { UnknownFact } from '../../redux/analytics';

/**
 * A fact that indicates speaker document download from the speaker modals
 */
export function recordUnknownSpeakerFileDownloadActivity(speakerDocumentDownloadFact: UnknownFact): Action {
  return recordFact({
    type: 'unknown_flex_activities',
    activity_type: 'unknown_activity.event_website_speaker_file_download',
    event_id: speakerDocumentDownloadFact.eventId,
    environment: speakerDocumentDownloadFact.env,
    object_id: speakerDocumentDownloadFact.speakerId,
    document_id: speakerDocumentDownloadFact.documentId,
    data: {
      file_name: speakerDocumentDownloadFact.fileName,
      file_type: speakerDocumentDownloadFact.fileType
    }
  });
}

/**
 * A fact that indicates speaker profile view from the speaker modals
 */
export function recordUnknownViewSpeakerProfileActivity(speakerViewFact: UnknownFact): Action {
  return recordFact({
    type: 'unknown_flex_activities',
    activity_type: 'unknown_activity.event_website_speaker_profile_view',
    event_id: speakerViewFact.eventId,
    environment: speakerViewFact.env,
    object_id: speakerViewFact.speakerId
  });
}
