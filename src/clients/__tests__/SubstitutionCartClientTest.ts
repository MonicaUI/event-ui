import SubstitutionCartClient from '../SubstitutionCartClient';

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

const client = new SubstitutionCartClient('https://example.com/regBase/', 'eventId', 'dev', 'standard');
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

test('SubstitutionCartClient.getSubstitutionCart matches snapshot', async () => {
  const cart = {
    substitutionCart: {
      acctId: 'acctId',
      eventId: 'eventId',
      contactId: 'contactId',
      inviteeId: 'inviteeId',
      status: 'INPROGRESS',
      accountSnapshotVersion: 'accountSnapshotVersion',
      eventSnapshotVersion: {
        eventId: 'eventSnapshotVersion'
      },
      travelSnapshotVersion: {
        eventId: 'travelSnapshotVersion'
      },
      substitutionCartId: 'substitutionCartId',
      substituentInformation: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress@abc.xyz'
      }
    }
  };
  setMockResponse(cart, {});
  const response = await client.getSubstitutionCart('substitutionCartId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]?.[0].url).toEqual(
    'https://example.com/regBase/registration/v1/substitute/substitutionCartId?environment=dev'
  );
  expect(response).toBe(cart);
});

test('SubstitutionCartClient.createSubstitutionCart matches snapshot', async () => {
  const cart = {
    substitutionCart: {
      acctId: 'acctId',
      eventId: 'eventId',
      contactId: 'contactId',
      inviteeId: 'inviteeId',
      status: 'INPROGRESS',
      accountSnapshotVersion: 'accountSnapshotVersion',
      eventSnapshotVersion: {
        eventId: 'eventSnapshotVersion'
      },
      travelSnapshotVersion: {
        eventId: 'travelSnapshotVersion'
      },
      substitutionCartId: 'substitutionCartId',
      substituentInformation: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress@abc.xyz'
      }
    }
  };
  setMockResponse(cart, {});
  const response = await client.createSubstitutionCart({
    eventId: 'eventId',
    contactId: 'contactId',
    inviteeId: 'inviteeId',
    substituentInformation: {
      firstName: 'firstName',
      lastName: 'lastName',
      emailAddress: 'emailAddress@abc.xyz'
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]?.[0].url).toBe('https://example.com/regBase/registration/v1/substitute?environment=dev');
  expect(response).toBe(cart);
});

test('SubstitutionCartClient.updateSubstitutionCart matches snapshot', async () => {
  const cart = {
    substitutionCart: {
      acctId: 'acctId',
      eventId: 'eventId',
      contactId: 'contactId',
      inviteeId: 'inviteeId',
      status: 'INPROGRESS',
      accountSnapshotVersion: 'accountSnapshotVersion',
      eventSnapshotVersion: {
        eventId: 'eventSnapshotVersion'
      },
      travelSnapshotVersion: {
        eventId: 'travelSnapshotVersion'
      },
      substitutionCartId: 'substitutionCartId',
      substituentInformation: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress@abc.xyz'
      }
    }
  };
  setMockResponse(cart, {});
  const response = await client.updateSubstitutionCart(
    {
      eventId: 'eventId',
      contactId: 'contactId',
      inviteeId: 'inviteeId',
      status: 'INPROGRESS',
      accountSnapshotVersion: 'accountSnapshotVersion',
      eventSnapshotVersion: {
        eventId: 'eventSnapshotVersion'
      },
      travelSnapshotVersion: {
        eventId: 'travelSnapshotVersion'
      },
      substitutionCartId: 'substitutionCartId',
      substituentInformation: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress@abc.xyz'
      }
    },
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
    'substitutionCartId'
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]?.[0].url).toBe(
    'https://example.com/regBase/registration/v1/substitute/substitutionCartId?environment=dev'
  );
  expect(response).toBe(cart);
});

test('SubstitutionCartClient.checkoutSubstitutionCart matches snapshot', async () => {
  const cart = {
    substitutionCart: {
      acctId: 'acctId',
      eventId: 'eventId',
      contactId: 'contactId',
      inviteeId: 'inviteeId',
      status: 'QUEUED',
      accountSnapshotVersion: 'accountSnapshotVersion',
      eventSnapshotVersion: {
        eventId: 'eventSnapshotVersion'
      },
      travelSnapshotVersion: {
        eventId: 'travelSnapshotVersion'
      },
      substitutionCartId: 'substitutionCartId',
      substituentInformation: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress@abc.xyz'
      }
    }
  };
  setMockResponse(cart, {});
  const response = await client.checkoutSubstitutionCart('substitutionCartId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]?.[0].url).toBe(
    'https://example.com/regBase/registration/v1/substitute/substitutionCartId/checkout?environment=dev'
  );
  expect(response).toBe(cart);
});

test('SubstitutionCartClient.deleteSubstitutionCart matches snapshot', async () => {
  await client.deleteSubstitutionCart('substitutionCartId');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]?.[0].url).toBe(
    'https://example.com/regBase/registration/v1/substitute/substitutionCartId?environment=dev'
  );
});

test('SubstitutionCartClient.abortSubstitutionCart matches snapshot', async () => {
  await client.abortSubstitutionCart('substitutionCartId');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]?.[0].url).toBe(
    'https://example.com/regBase/registration/v1/substitute/substitutionCartId/abort?environment=dev'
  );
});
