import EventSnapshotClient from '../EventSnapshotClient';
import travelAirportsData from '../../../fixtures/travelAirportsData.json';
import { ServiceError } from '@cvent/event-ui-networking';
import { fetchAndRetryIfServerBusy } from '@cvent/nucleus-networking';

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
        headers: {
          get(header) {
            return mockHeaders[header];
          },
          has(header) {
            return !!mockHeaders[header];
          }
        },
        json: () => Promise.resolve(mockResponse),
        status: (mockResponse as $TSFixMe).status || 200,
        // @ts-expect-error Property 'ok' does not exist on type '{}'.ts(2339)
        ok: mockResponse.ok == null ? true : mockResponse.ok
      });
    })
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setMockResponse } = require('@cvent/nucleus-networking');

const client = new EventSnapshotClient('https://example.com/eventEmailBase/', 'eventId', 'dev');

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy.mockClear();
});

test('EventSnapshotClient.getEventTravelAirports response matches snapshot', async () => {
  setMockResponse(travelAirportsData, {});
  const response = await client.getEventTravelAirports('eventSnapshotVersion', 'travelSnapshotVersion');

  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventSnapshotClient.getEventTravelAirports returns blank if 204 error', async () => {
  setMockResponse({ status: 204 });
  const response = await client.getEventTravelAirports('eventSnapshotVersion', 'travelSnapshotVersion');
  const fetch = fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(response).toMatchObject({ airports: [] });
});

test('EventSnapshotClient.getEventTravelAirports service is not called if travelSnapshotVersion is empty', async () => {
  const response = await client.getEventTravelAirports('eventSnapshotVersion', '');
  const fetch = fetchAndRetryIfServerBusy;
  expect(fetch).not.toHaveBeenCalled();
  expect(response).toMatchObject({ airports: [] });
});

test('EventSnapshotClient.getAccountSnapshot response matches snapshot', async () => {
  setMockResponse({ fakeAccountSnapshot: true }, { AccountSnapshotVersion: 'accountSnapshotVersion' });
  const response = await client.getAccountSnapshot('eventId', { version: 'accountSnapshotVersion' });
  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventSnapshotClient.getAccountSnapshot response matches snapshot 1', async () => {
  setMockResponse({ fakeAccountSnapshot: true }, { AccountSnapshotVersion: 'accountSnapshotVersion' });
  const response = await client.getAccountSnapshot('eventId', {
    version: 'accountSnapshotVersion',
    eventSnapshotVersion: 'eventSnapshotVersion'
  });
  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventSnapshotClient.getEventSnapshot response matches snapshot', async () => {
  setMockResponse({ fakeEventSnapshot: true }, { EventSnapshotVersion: 'eventSnapshotVersion' });
  const response = await client.getEventSnapshot('eventId', {
    version: 'eventSnapshotVersion',
    registrationTypeId: 'registrationTypeId'
  });
  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventSnapshotClient.isLatestSnapshot matches snapshot', async () => {
  setMockResponse(
    {
      latestAccountSnapshotId: 'accountSnapshotVersion',
      latestEventSnapshotId: 'eventSnapshotVersion'
    },
    {}
  );
  const response = await client.isLatestSnapshotVersion('eventId', 'accountSnapshotVersion', 'eventSnapshotVersion');
  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toBe(true);
});

test('EventSnapshotClient.getVisibleProducts matches snapshot', async () => {
  setMockResponse(
    {
      admissionItems: { admissionItemId: { id: 'admissionItemId' } },
      sessionProducts: {}
    },
    {}
  );
  const response = await client.getVisibleProducts('accessToken', 'eventId', {
    version: 'eventSnapshotVersion',
    registrationTypeId: 'registrationTypeId',
    widgetType: 'Agenda',
    widgetId: 'agendaWidgetId'
  });
  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('EventSnapshotClient.getRegCartVisibleProducts matches snapshot', async () => {
  setMockResponse(
    {
      admissionItems: { admissionItemId: { id: 'admissionItemId' } },
      sessionProducts: {}
    },
    {}
  );
  const response = await client.getVisibleProducts('accessToken', 'eventId', {
    version: 'eventSnapshotVersion',
    regCartId: 'regCartId'
  });
  const fetch = fetchAndRetryIfServerBusy as jest.MockedFunction<typeof fetchAndRetryIfServerBusy>;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

class NoErrorThrownError extends Error {}

const getError = async call => {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error) {
    return error;
  }
};

test('EventSnapshotClient.getRegCartVisibleProductsdoes creates an error when response is not ok', async () => {
  setMockResponse({ ok: false });
  const spyServiceError = jest.spyOn(ServiceError, 'create');
  const error = await getError(async () =>
    client.getRegCartVisibleProducts('accessToken', 'eventId', {
      version: 'eventSnapshotVersion',
      regCartId: 'regCartId'
    })
  );

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  expect(spyServiceError).toHaveBeenCalledWith(
    'Get reg cart visible products failed for eventId: eventId',
    expect.any(Object),
    expect.any(Object)
  );
});

test('EventSnapshotClient.getVisibleProducts creates an error when response is not ok', async () => {
  setMockResponse({ ok: false });
  const spyServiceError = jest.spyOn(ServiceError, 'create');
  const error = await getError(async () =>
    client.getVisibleProducts('accessToken', 'eventId', {
      version: 'eventSnapshotVersion',
      regCartId: 'regCartId'
    })
  );

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  expect(spyServiceError).toHaveBeenCalledWith(
    'Get visible products failed for eventId: eventId',
    expect.any(Object),
    expect.any(Object)
  );
});

test('EventSnapshotClient.getAccountSnapshot creates an error when response is not ok', async () => {
  setMockResponse({ ok: false });
  const spyServiceError = jest.spyOn(ServiceError, 'create');
  const error = await getError(async () => client.getAccountSnapshot('eventId'));

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  expect(spyServiceError).toHaveBeenCalledWith(
    'Account snapshot load failed eventId: eventId',
    expect.any(Object),
    expect.any(Object)
  );
});

test('EventSnapshotClient.getEventSnapshot creates an error when response is not ok', async () => {
  setMockResponse({ ok: false });
  const spyServiceError = jest.spyOn(ServiceError, 'create');
  const error = await getError(async () => client.getEventSnapshot('eventId'));

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  expect(spyServiceError).toHaveBeenCalledWith(
    'Event snapshot load failed eventId: eventId',
    expect.any(Object),
    expect.any(Object)
  );
});

test('EventSnapshotClient.getEventTravelSnapshot creates an error when response is not ok', async () => {
  setMockResponse({ ok: false });
  const spyServiceError = jest.spyOn(ServiceError, 'create');
  const error = await getError(async () => client.getEventTravelSnapshot('eventId', {}));

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  expect(spyServiceError).toHaveBeenCalledWith(
    'Event Travel snapshot load failed eventId: eventId',
    expect.any(Object),
    expect.any(Object)
  );
});

test('EventSnapshotClient.getEventTravelAirports creates an error when response is not ok', async () => {
  setMockResponse({ ok: false });
  const spyServiceError = jest.spyOn(ServiceError, 'create');
  const error = await getError(async () =>
    client.getEventTravelAirports('eventSnapshotVersion', 'travelSnapshotVersion')
  );

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  expect(spyServiceError).toHaveBeenCalledWith(
    'Event Travel airports load failed; eventId: eventId',
    expect.any(Object),
    expect.any(Object)
  );
});
