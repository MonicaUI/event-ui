import TravelApiClient from '../TravelApiClient';
import travelCartResponse from './fixtures/travelCartResponse.json';
import hotelRoomCapacityResponse from './fixtures/hotelRoomCapacityResponse.json';

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
const baseUrl = 'https://example.com/travelBase/';
const client = new TravelApiClient(baseUrl, 'eventId', 'dev', 'standard', 'planner');

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy.mockClear();
  let time = 1234;
  // eslint-disable-next-line no-extend-native
  Date.prototype.getTime = () => {
    // eslint-disable-line no-extend-native
    return (time += 1000);
  };
});

test('travelApiClient.createTravelCart matches snapshot', async () => {
  setMockResponse(
    {
      ...travelCartResponse
    },
    {}
  );
  const response = await client.createTravelCart({
    ...travelCartResponse.travelCart
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('travelApiClient.updateTravelCart matches snapshot', async () => {
  setMockResponse(
    {
      ...travelCartResponse
    },
    {}
  );
  const response = await client.updateTravelCart({
    ...travelCartResponse.travelCart
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('travelApiClient.getTransientTravelCart matches snapshot', async () => {
  setMockResponse(
    {
      ...travelCartResponse
    },
    {}
  );
  const response = await client.getTransientTravelCart('inviteeId', true, { blah: 'blah' });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('travelApiClient.getTravelCart matches snapshot', async () => {
  setMockResponse(
    {
      ...travelCartResponse
    },
    {}
  );
  const response = await client.getTravelCart('inviteeId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('travelApiClient.getRoommates matches snapshot', async () => {
  setMockResponse(
    {
      ...travelCartResponse
    },
    {}
  );
  const response = await client.getRoommates('inviteeId', 'params', 'version-1');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('travelApiClient.getHotelRoomCapacitySummaries call with apollo client', async () => {
  const mockHotelRoomCapacityResponse = {
    ...hotelRoomCapacityResponse
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const apolloClient = require('@apollo/client');
  jest.mock('@apollo/client', () => ({
    query: jest.fn(async () => {
      return {
        data: {
          response: mockHotelRoomCapacityResponse
        }
      };
    })
  }));
  const response = await client.getHotelRoomCapacitySummaries(false, 'regTypeId1', apolloClient);
  expect(apolloClient.query).toHaveBeenCalled();
  const args = {
    eventId: 'eventId',
    environment: 'env'
  };
  expect(apolloClient.query.mock.calls[0][0].variables.pathFunction({ args })).toContain(baseUrl);
  expect(response).toEqual(mockHotelRoomCapacityResponse);
});
