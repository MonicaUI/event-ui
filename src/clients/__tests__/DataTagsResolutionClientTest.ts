import DataTagsResolutionClient from '../DataTagsResolutionClient';
import * as datatags from '../../redux/datatags';

jest.mock('@cvent/nucleus-networking', () => {
  const RequestBuilderModule = jest.requireActual<$TSFixMe>('@cvent/nucleus-networking');
  class MockRequestBuilder extends RequestBuilderModule.RequestBuilder {
    constructor(requestOptions = {}) {
      const newRequestOptions = {
        ...requestOptions,
        headers: {
          ...(requestOptions as $TSFixMe).headers,
          httplogpageloadid: 'httplogpageloadid',
          httplogrequestid: 'httplogrequestid'
        }
      };
      super(newRequestOptions);
    }
  }
  let mockResponse = {};
  let mockHeaders = {};
  return {
    ...RequestBuilderModule,
    RequestBuilder: MockRequestBuilder,
    setMockResponse(response, headers) {
      mockResponse = response;
      mockHeaders = headers;
    },
    fetchAndRetryIfServerBusy: jest.fn(() => {
      return Promise.resolve({
        ok: true,
        headers: {
          get(header) {
            return mockHeaders[header];
          },
          has(header) {
            return !!mockHeaders[header];
          }
        },
        clone() {
          return this;
        },
        json: () => Promise.resolve(mockResponse)
      });
    })
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setMockResponse } = require('@cvent/nucleus-networking');

const client = new DataTagsResolutionClient('https://example.com/regBase/', 'eventId', 'dev', 'en-US', false);

const emptyContactId = '00000000-0000-0000-0000-000000000000';

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy.mockClear();
});

test('DataTagsResolutionClient.resolve matches snapshot', async () => {
  setMockResponse(
    {
      eventId: [
        'resolved dataTag1',
        'resolved dataTag2',
        'https://example.com/regBase/summary',
        'https://example.com/regBase/decline'
      ]
    },
    {}
  );
  const response = await client.resolve(['dataTag1', 'dataTag2', '{[E-RSVP YES URL]}', '{[E-RSVP NO URL]}']);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('DataTagsResolutionClient.resolveWithDefaultLanguage matches snapshot', async () => {
  setMockResponse(
    {
      resolved: {
        [emptyContactId]: [
          'resolved dataTag1',
          'resolved dataTag2',
          'https://example.com/regBase/summary',
          'https://example.com/regBase/decline'
        ]
      }
    },
    {}
  );
  const response = await client.resolve(['dataTag1', 'dataTag2', '{[E-RSVP YES URL]}', '{[E-RSVP NO URL]}']);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

function getState() {
  return {
    pathInfo: {
      rootPath: '/00000000-00000000-00000000-00000000'
    },
    environment: 'S437'
  };
}

function getNewState() {
  return {
    pathInfo: {
      rootPath: '/'
    },
    environment: 'S437'
  };
}

test('datatags.removeDataTags matches snapshot for YES URL', async () => {
  const resolvedText = [
    'resolved dataTag1',
    'resolved dataTag2',
    'https://example.com/regBase?i={[IN-INVITEE STUB BASE64]}&environment=S437'
  ];
  const response = await datatags.removeDataTags(
    resolvedText,
    ['dataTag1', 'dataTag2', '{[E-RSVP YES URL]}'],
    getState
  );
  expect(response).toMatchSnapshot();
});

test('datatags.removeDataTags matches snapshot for NO URL', async () => {
  const resolvedText = [
    'resolved dataTag1',
    'resolved dataTag2',
    'https://example.com/regBase?i={[IN-INVITEE STUB BASE64]}&environment=S437'
  ];
  const response = await datatags.removeDataTags(
    resolvedText,
    ['dataTag1', 'dataTag2', '{[E-RSVP NO URL]}'],
    getNewState
  );
  expect(response).toMatchSnapshot();
});
