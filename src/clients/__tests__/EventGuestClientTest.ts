import EventGuestClient from '../EventGuestClient';

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

test('EventGuestClient.logout matches snapshot', async () => {
  const client = new EventGuestClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.logout('authToken', 'eventId', 'userType');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventGuestClient.optout matches snapshot', async () => {
  const client = new EventGuestClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.optOut('authToken', 'eventId', 'inviteeId', 'guestId', 'contactId', 'optOutStatus');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventGuestClient.getWebsiteContent matches snapshot', async () => {
  const client = new EventGuestClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.getWebsiteContent('eventId', 'snapshotVersion', 'registrationTypeId');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventGuestClient.getRegistrationContent matches snapshot', async () => {
  const client = new EventGuestClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.getRegistrationContent('authToken', 'snapshotVersion', 'pageVariety', 'regPathId', 'registrationTypeId');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('EventGuestClient.identifyByContactId is called correctly', async () => {
  const client = new EventGuestClient('https://example.com/reg/', 'eventId', 'dev');
  setMockResponse({
    regCart: {
      eventRegistrations: [
        {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: [{ questionId: 'q1', answer: {} }],
            personalInformation: {
              customFields: [{ questionId: 'q2', answer: {} }]
            }
          }
        }
      ]
    }
  });
  const response = await client.identifyByContactId('authToken', 'eventId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventGuestClient.abortRegCartAndLogout is called correctly', async () => {
  const client = new EventGuestClient('https://example.com/', 'eventId', 'dev');
  const mockBeacon = jest.fn();
  global.navigator.sendBeacon = mockBeacon;
  await client.abortRegCartAndLogout('eventId', 'userType');
  const url = 'https://example.com/reg/regAbort?environment=dev&eventId=eventId&userType=userType';
  expect(global.navigator.sendBeacon).toHaveBeenCalledWith(url);
});

test('EventGuestClient.rescindAbortRegCartAndLogoutRequest is called correctly', async () => {
  const client = new EventGuestClient('https://example.com/', 'eventId', 'dev');
  await client.rescindAbortRegCartAndLogoutRequest('authtoken', 'eventId', 'userType');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
});

test('EventGuestClient.getRelatedContacts matches snapshot', async () => {
  const client = new EventGuestClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

  await client.getRelatedContacts('authToken', 'eventId', 'regCartId', 'contactId', 10);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});
