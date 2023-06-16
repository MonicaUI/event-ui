import AttendeeOrderClient from '../AttendeeOrderClient';
import attendeeOrdersResponse from './fixtures/attendeeOrdersResponse.json';

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
const client = new AttendeeOrderClient('https://example.com/orders/', 'eventId', 'dev', 'standard');

test('Attendee orders GET  matches snapshot', async () => {
  setMockResponse(
    {
      ...attendeeOrdersResponse
    },
    {}
  );
  const response = await client.getAttendeeOrders('event-123', 'attendeeId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});
