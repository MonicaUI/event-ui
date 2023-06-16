import InviteeSearchClient from '../InviteeSearchClient';

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
  return {
    ...RequestBuilderModule,
    RequestBuilder: MockRequestBuilder,
    setMockResponse(response) {
      mockResponse = response;
    },
    fetchAndRetryIfServerBusy: jest.fn(() => {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockResponse) });
    })
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setMockResponse } = require('@cvent/nucleus-networking');

test('InviteeSearchClient.update timezone preference matches snapshot', async () => {
  const client = new InviteeSearchClient('https://example.com/reg/', 'eventId', 'dev');
  setMockResponse({}, {});
  const response = await client.updateInviteeTimeZonePreference('inviteeId', 0);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});
