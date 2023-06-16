import WebsitePasswordClient from '../WebsitePasswordClient';

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
  return {
    ...RequestBuilderModule,
    RequestBuilder: MockRequestBuilder,
    fetchAndRetryIfServerBusy: jest.fn(() => {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    })
  };
});

test('WebsitePasswordClient.verifyPassword matches snapshot', async () => {
  const client = new WebsitePasswordClient('https://example.com/', 'eventId', 'dev');

  await client.verifyPassword('eventId', 'password');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

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
  return {
    ...RequestBuilderModule,
    RequestBuilder: MockRequestBuilder,
    fetchAndRetryIfServerBusy: jest.fn(() => {
      return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    })
  };
});

test('WebsitePasswordClient.verifyPassword matches snapshot 1', async () => {
  const client = new WebsitePasswordClient('https://example.com/', 'eventId', 'dev');
  await client.verifyPassword('eventId', 'password');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});
