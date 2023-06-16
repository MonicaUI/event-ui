import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer, { GET_SPEAKER_DOCUMENT, loadSpeakerDocuments } from '../speakerDocument';

const speakerDocuments = {
  speaker1: {
    document1: {
      id: 'document1',
      type: 'DOCUMENT',
      name: 'Agenda Document',
      uri: 'https://abc.pdf',
      size: 234446,
      extension: 'pdf',
      thumbnailUri: '',
      creationDate: '2020-02-04T14:19:30.033Z',
      lastModifiedDate: '2020-02-04T14:19:30.033Z',
      alternateText: ''
    }
  }
};

const getDocumentAction = {
  type: GET_SPEAKER_DOCUMENT
};

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('Speaker document payload', () => {
  (getDocumentAction as $TSFixMe).payload = speakerDocuments;
  expect(reducer(speakerDocuments, getDocumentAction)).toMatchSnapshot();
});

test('Speaker document empty payload', () => {
  (getDocumentAction as $TSFixMe).payload = {};
  expect(reducer(speakerDocuments, getDocumentAction)).toMatchSnapshot();
});

const getSpeakerDocumentsMock = jest.fn();
const initialState = {
  clients: {
    eventGuestClient: {
      getSpeakerDocuments: getSpeakerDocumentsMock
    }
  },
  defaultUserSession: {
    eventId: 'test-event'
  },
  eventSnapshotVersion: 'abcd',
  accessToken: 'some token',
  speakerDocuments: {
    speaker1: {}
  }
};
const getState = (state = initialState) => state;
function clearMocksAndCreateStore(mockState = initialState) {
  jest.clearAllMocks();
  return createStore(
    (state, action) => {
      return {
        ...state,
        currencies: reducer((state as $TSFixMe).currencies, action)
      };
    },
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    getState(mockState),
    applyMiddleware(thunk)
  );
}
let mockStore;
beforeEach(() => {
  mockStore = clearMocksAndCreateStore();
});

describe('Load speaker Documents', () => {
  test('Load documents not present in state call api', async () => {
    await mockStore.dispatch(loadSpeakerDocuments('speaker2'));
    expect(getSpeakerDocumentsMock).toHaveBeenCalledTimes(1);
  });

  test('Load documents present in state does not call api', async () => {
    await mockStore.dispatch(loadSpeakerDocuments('speaker1'));
    expect(getSpeakerDocumentsMock).toHaveBeenCalledTimes(0);
  });
});
