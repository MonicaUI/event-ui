import { handleUserSessionTimeoutErrors } from '../errorHandling/userSessionTimeoutErrors';
import { isFlexBearerAuthRemovalOn } from '../ExperimentHelper';
import { getSpeakerDocuments } from './selectors/shared';
import { AsyncAppThunk } from './reducer';

export const GET_SPEAKER_DOCUMENT = 'event-guestside-site/speaker/GET_SPEAKER_DOCUMENT';

export function loadSpeakerDocuments(speakerId: string): AsyncAppThunk {
  return async (dispatch, getState) => {
    const state = getState();
    let documents = getSpeakerDocuments(state, speakerId);
    if (!documents) {
      const {
        accessToken,
        defaultUserSession: { eventId },
        eventSnapshotVersion,
        clients: { eventGuestClient }
      } = state;
      try {
        documents = await eventGuestClient.getSpeakerDocuments(
          accessToken,
          eventId,
          eventSnapshotVersion,
          speakerId,
          isFlexBearerAuthRemovalOn(state)
        );
      } catch (error) {
        if (isFlexBearerAuthRemovalOn(state) && error.responseStatus === 401) {
          return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
        }
        throw error;
      }
      dispatch({
        type: GET_SPEAKER_DOCUMENT,
        payload: getSpeakerDocumentsForStore(state, speakerId, documents)
      });
    }
  };
}

function getSpeakerDocumentsForStore(state, speakerId, documents) {
  const speakerDocuments = { ...state.speakerDocuments };
  speakerDocuments[speakerId] = documents;
  return speakerDocuments;
}

const defaultSpeakerDocument = Object.freeze({});

const reducer = (state = defaultSpeakerDocument, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case GET_SPEAKER_DOCUMENT:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
