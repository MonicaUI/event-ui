import CcpaComplianceClient from '../CcpaComplianceClient';

const ccpaComplianceRequests = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'JohnDoe@j.mail',
    attendeeEntityType: 'ATTENDEE',
    attendeeEntityId: 'attendee-entity-id'
  }
];

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
      return Promise.resolve({ status: 204, json: () => Promise.resolve({}) });
    })
  };
});

test('CcpaComplianceClient.makeCcpaComplianceRequest matches snapshot', async () => {
  const client = new CcpaComplianceClient('https://example.com/', 'eventId', 'dev');

  await client.makeCcpaComplianceRequest(ccpaComplianceRequests);
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
      return Promise.resolve({ status: 500, json: () => Promise.resolve({}) });
    })
  };
});

test('CcpaComplianceClient.makeCcpaComplianceRequest matches snapshot 1', async () => {
  const client = new CcpaComplianceClient('https://example.com/', 'eventId', 'dev');
  await client.makeCcpaComplianceRequest(ccpaComplianceRequests);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});
