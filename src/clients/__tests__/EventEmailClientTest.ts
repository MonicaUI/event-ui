import EventEmailClient from '../EventEmailClient';

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

test('EventEmailClient.resendConfirmationEmail matches snapshot', async () => {
  const client = new EventEmailClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.resendConfirmationEmail('eventId', 'flastname@example.com', 'firstName', 'lastName');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventEmailClient.sendPlannerEmail matches snapshot', async () => {
  const client = new EventEmailClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.sendPlannerEmail('eventId', 'flastname@example.com', 'message');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventEmailClient.getSubscriptionStatus matches snapshot', async () => {
  const client = new EventEmailClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.getSubscriptionStatus('eventId', 'inviteeId');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventEmailClient.setSubscriptionStatus matches snapshot', async () => {
  const client = new EventEmailClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.setSubscriptionStatus('eventId', 'inviteeId', 'success');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});
