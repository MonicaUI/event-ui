import EventPersonaClient from '../EventPersonaClient';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';

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
jest.mock('../../dialogs/SessionTimedOutDialog', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fetchWithSessionTimeout: require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setMockResponse } = require('@cvent/nucleus-networking');

const client = new EventPersonaClient('https://example.com/regBase/', 'eventId', 'dev', 'standard');

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy.mockClear();
});

test('EventPersonaClient.identifyInvitee matches snapshot', async () => {
  const inviteeId = 'inviteeId';
  setMockResponse({ persona: { eventId: 'eventId', inviteeId, status: InviteeStatus.NoResponse } }, {});
  const response = await client.identifyInvitee('authToken', inviteeId);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventPersonaClient.identifyInvitee when contact id is required', async () => {
  const inviteeId = 'inviteeId';
  const contactId = 'contactId';
  setMockResponse({ persona: { eventId: 'eventId', inviteeId, status: InviteeStatus.NoResponse, contactId } }, {});
  const response = await client.identifyInvitee('authToken', inviteeId, true);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});
