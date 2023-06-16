import RegCartClient, { convertRegCart } from '../RegCartClient';
import { ServiceError } from '@cvent/event-ui-networking';

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
        json: () => Promise.resolve(mockResponse),
        text: () => JSON.stringify(mockResponse)
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

const client = new RegCartClient('https://example.com/regBase/', 'eventId', 'dev', 'standard');

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

test('RegCartClient.getRegCart matches snapshot', async () => {
  setMockResponse(
    {
      eventRegistrations: [
        {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: [{ questionId: 'q1', answers: null }],
            personalInformation: {
              customFields: [{ questionId: 'q2', answers: null }]
            }
          }
        }
      ]
    },
    {}
  );
  const response = await client.getRegCart('authToken', 'regCartId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.createRegCart matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.createRegCart(
    'authToken',
    {
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: [] }
            },
            personalInformation: {
              customFields: {
                q2: { questionId: 'q2', answers: [] }
              }
            }
          }
        }
      }
    },
    'contactId'
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.createRegCart request with snapshot versions matches snapshot', async () => {
  const regCart = {
    embeddedRegistration: true,
    eventRegistrations: [
      {
        eventRegistrationId: 'er1',
        attendee: {
          personalInformation: {
            customFields: []
          },
          eventAnswers: []
        }
      }
    ]
  };
  setMockResponse(
    {
      regCart
    },
    {}
  );
  await client.createRegCart('authToken', regCart, undefined, undefined, undefined, undefined, undefined, 'eventId', {
    account: 'acctSnapVersion',
    event: 'evtSnapVersion'
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('RegCartClient.createRegCartFromLink matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.createRegCartFromLink('authToken', 'inviteeId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.resumePartialRegCart matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.resumePartialRegCart('authToken', 'regCartId', 'regCartId2');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.searchPartialRegCart matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.searchPartialRegCart(
    'authToken',
    {
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: null }
            },
            personalInformation: {
              customFields: {
                q2: { questionId: 'q2', answers: null }
              }
            }
          }
        }
      }
    },
    false
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.createTestModeRegCartFromLink matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: [] }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: [] }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.createTestModeRegCartFromLink('authToken', 'inviteeId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.updateRegCart matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.updateRegCart(
    'authToken',
    {
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: null }
            },
            personalInformation: {
              customFields: {
                q2: { questionId: 'q2', answers: null }
              }
            }
          }
        }
      }
    },
    'inviteeId'
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.updateRegCartQuantityItemRegistrations matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            },
            quantityItemRegistrations: {
              quantityItemId1: {
                productId: 'quantityItemId1',
                quantity: 3
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.updateRegCartQuantityItemRegistrations('authToken', 'regCartId', {
    eventRegistrationId: 'er1',
    quantityItemId: 'quantityItemId1',
    quantity: 3
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.updatePaymentCreditsInCart matched snapshot', async () => {
  setMockResponse(
    {
      regCartId: 'reg-cart-id',
      eventRegistrations: [
        {
          eventRegistrationId: 'er1',
          attendee: {
            availablePaymentCredits: 90,
            eventAnswers: [{ questionId: 'q1', answers: null }],
            personalInformation: {
              customFields: [{ questionId: 'q2', answers: null }]
            }
          }
        }
      ]
    },
    {}
  );

  const response = await client.updatePaymentCreditsInRegCart('authToken', 'reg-cart-id');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.calculateRegCartPricing matches snapshot', async () => {
  setMockResponse({ fakePricingResult: true }, {});
  const response = await client.calculateRegCartPricing('authToken', 'regCartId', { fakePaymentInfo: true });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.startRegCartCheckout matches snapshot', async () => {
  setMockResponse({ fakeStartCheckoutResult: true }, {});
  const response = await client.startRegCartCheckout('authToken', 'regCartId', { fakePaymentInfo: true }, '2000');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.waitForRegCartCheckoutCompletion matches snapshot', async () => {
  const responses = [
    { statusCode: 'PROCESSING' },
    { statusCode: 'PAYMENT_INITIATED' },
    { statusCode: 'INPROGRESS', paymentInfo: {} },
    { statusCode: 'QUEUED' },
    { statusCode: 'COMPLETED' }
  ];
  let responseNumber = 0;
  setMockResponse(responses[responseNumber++], {});
  const onProgress = () => {
    setMockResponse(responses[responseNumber++], {});
  };
  const response = await client.waitForRegCartCheckoutCompletion('authToken', 'regCartId', onProgress, {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ pollingStrategy: { quickPollin... Remove this comment to see the full error message
    pollingStrategy: {
      quickPollingTries: 2,
      quickPollingInterval: 0,
      normalPollingInterval: 0
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalledTimes(5);
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(fetch.mock.calls[1]).toMatchSnapshot();
  expect(fetch.mock.calls[2]).toMatchSnapshot();
  expect(fetch.mock.calls[3]).toMatchSnapshot();
  expect(fetch.mock.calls[4]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.waitForRegCartCheckoutCompletion throws ServiceError when FAILED', async () => {
  const responses = [{ statusCode: 'PROCESSING' }, { statusCode: 'FAILED' }];
  let responseNumber = 0;
  setMockResponse(responses[responseNumber++], {});
  const onProgress = () => {
    setMockResponse(responses[responseNumber++], {});
  };
  // eslint-disable-next-line jest/valid-expect-in-promise
  await client
    .waitForRegCartCheckoutCompletion('authToken', 'regCartId', onProgress, {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ pollingStrategy: { quickPollin... Remove this comment to see the full error message
      pollingStrategy: {
        quickPollingTries: 0,
        quickPollingInterval: 0,
        normalPollingInterval: 0
      }
    })
    .then(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('should not resolve');
    })
    .catch(e => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toBeInstanceOf(ServiceError);
    });
});

test('RegCartClient.waitForRegCartCheckoutCompletion throws ServiceError when ABANDONED', async () => {
  const responses = [{ statusCode: 'PROCESSING' }, { statusCode: 'ABANDONED' }];
  let responseNumber = 0;
  setMockResponse(responses[responseNumber++], {});
  const onProgress = () => {
    setMockResponse(responses[responseNumber++], {});
  };
  // eslint-disable-next-line jest/valid-expect-in-promise
  await client
    .waitForRegCartCheckoutCompletion('authToken', 'regCartId', onProgress, {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ pollingStrategy: { quickPollin... Remove this comment to see the full error message
      pollingStrategy: {
        quickPollingTries: 0,
        quickPollingInterval: 0,
        normalPollingInterval: 0
      }
    })
    .then(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('should not resolve');
    })
    .catch(e => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toBeInstanceOf(ServiceError);
    });
});

test('RegCartClient.waitForRegCartCheckoutCompletion throws ServiceError when CANCELLED', async () => {
  const responses = [{ statusCode: 'PROCESSING' }, { statusCode: 'CANCELLED' }];
  let responseNumber = 0;
  setMockResponse(responses[responseNumber++], {});
  const onProgress = () => {
    setMockResponse(responses[responseNumber++], {});
  };
  // eslint-disable-next-line jest/valid-expect-in-promise
  await client
    .waitForRegCartCheckoutCompletion('authToken', 'regCartId', onProgress, {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ pollingStrategy: { quickPollin... Remove this comment to see the full error message
      pollingStrategy: {
        quickPollingTries: 0,
        quickPollingInterval: 0,
        normalPollingInterval: 0
      }
    })
    .then(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('should not resolve');
    })
    .catch(e => {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(e).toBeInstanceOf(ServiceError);
    });
});

test('RegCartClient.createDeclineRegistrationCart with inviteeId matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.createDeclineRegistrationCart('authToken', 'event-Id', 'invitee-Id');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});
test('RegCartClient.createDeclineRegistrationCart with registrationTypeId matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.createDeclineRegistrationCart('authToken', 'event-Id', null, 'registrationTypeId');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});
test('RegCartClient.createWaitlistRegistrationCart matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.createWaitlistRegistrationCart('authToken', 'event-Id', 'invitee-Id');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.getCapacitySummaries matches snapshot', async () => {
  const capacityIds = ['11111111-1111-1111-1111-1111111111', '11111111-2222-3333-4444-555555555555'];
  setMockResponse(
    {
      [capacityIds[0]]: {
        capacityId: '11111111-2222-3333-4444-555555555555::00000000-0000-0000-0000-000000000000',
        totalCapacityAvailable: 2,
        availableCapacity: 1,
        active: true
      },
      [capacityIds[1]]: {
        capacityId: '11111111-2222-3333-4444-555555555555',
        totalCapacityAvailable: 2,
        availableCapacity: 1,
        active: true
      }
    },
    {}
  );
  const response = await client.getCapacitySummaries('authToken', 'regCartId', capacityIds);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.getCapacitySummariesOnPageLoad matches snapshot', async () => {
  const capacityIds = ['11111111-1111-1111-1111-1111111111', '11111111-2222-3333-4444-555555555555'];
  setMockResponse(
    {
      [capacityIds[0]]: {
        capacityId: '11111111-2222-3333-4444-555555555555::00000000-0000-0000-0000-000000000000',
        totalCapacityAvailable: 2,
        availableCapacity: 1,
        active: true
      },
      [capacityIds[1]]: {
        capacityId: '11111111-2222-3333-4444-555555555555',
        totalCapacityAvailable: 2,
        availableCapacity: 1,
        active: true
      }
    },
    {}
  );
  const response = await client.getCapacitySummariesOnPageLoad('authToken', 'regCartId', capacityIds);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.initiateRegModAsync matches snapshot', async () => {
  setMockResponse('newRegCartId');
  const response = await client.initiateRegModAsync(
    'authToken',
    'inviteeId',
    'confirmationNumber',
    'eventId',
    'performedByContactId'
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.evaluateVisibilityLogic matches snapshot', async () => {
  const questionIds = ['81da10b1-93aa-4d3e-bd8b-2627479057f9', '7fb1deb8-aa4d-4dee-9a05-6613cb2bdc6c'];
  const answers = [
    {
      questionId: 'f2d06883-e9e1-4f94-a265-e5f60028e038',
      answers: null
    },
    {
      questionId: 'ab7c8aee-ac28-4b1c-949a-e9c607efb067',
      answers: [
        {
          answerType: 'Text',
          answer: 'yeet'
        }
      ]
    }
  ];
  const requestPayload = {
    'b42bf35f-7c18-4f56-a4ca-b04b91bd0c41': {
      questionIds,
      answers
    }
  };

  setMockResponse({
    'b42bf35f-7c18-4f56-a4ca-b04b91bd0c41': {
      [questionIds[0]]: true,
      [questionIds[1]]: false
    }
  });

  const response = await client.evaluateVisibilityLogic(
    'authToken',
    requestPayload,
    'eventSnapshotVersion',
    'eventId',
    'regCartId'
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.updateRegCartSessionRegistrations matches snapshot', async () => {
  setMockResponse(
    {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'er1',
            attendee: {
              eventAnswers: [{ questionId: 'q1', answers: null }],
              personalInformation: {
                customFields: [{ questionId: 'q2', answers: null }]
              }
            },
            sessionRegistrations: {
              sessionId1: {
                productId: 'sessionId1',
                requestedAction: 'REGISTER'
              }
            }
          }
        ]
      }
    },
    {}
  );
  const response = await client.updateRegCartSessionRegistrations('authToken', 'regCartId', {
    eventRegistrationId: 'er1',
    productId: 'sessionId1',
    requestedAction: 'REGISTER',
    registrationSourceType: 'Selected'
  });

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

describe('Tests convertRegCart', () => {
  const initialFileAnswerUrl = 'https://file.com';
  const initialProfileImageUrl = 'https://img-src.com';
  const expectedFileAnswerUrl = 'https%3A%2F%2Ffile.com';
  const expectedProfileImageUrl = 'https%3A%2F%2Fimg-src.com';

  test('with new file upload answer', async () => {
    const newRegCart = convertRegCart({
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: [{ uRL: initialFileAnswerUrl }] }
            },
            personalInformation: {
              customFields: {
                q2: { questionId: 'q2', answers: null }
              }
            }
          }
        }
      }
    });
    expect(newRegCart).toMatchSnapshot();

    const actualFileAnswerUrl = newRegCart.eventRegistrations[0].attendee.eventAnswers[0].answers[0].uRL;
    const actualProfileImageUrl = newRegCart.eventRegistrations[0].attendee.personalInformation?.profileImage;
    expect(actualFileAnswerUrl).toEqual(expectedFileAnswerUrl);
    expect(actualProfileImageUrl).toBeUndefined();
  });

  test('with new profile image answer', async () => {
    const newRegCart = convertRegCart({
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: null }
            },
            personalInformation: {
              profileImage: {
                imageUri: initialProfileImageUrl
              },
              customFields: {
                q2: { questionId: 'q2', answers: null }
              }
            }
          }
        }
      }
    });
    expect(newRegCart).toMatchSnapshot();

    const actualFileAnswerUrl = newRegCart.eventRegistrations[0].attendee.eventAnswers[0]?.answers;
    const actualProfileImageUrl = newRegCart.eventRegistrations[0].attendee.personalInformation.profileImage.imageUri;
    expect(actualFileAnswerUrl).toEqual([]);
    expect(actualProfileImageUrl).toEqual(expectedProfileImageUrl);
  });

  test('with new file upload and profile image answers', async () => {
    const newRegCart = convertRegCart({
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: [{ uRL: initialFileAnswerUrl }] }
            },
            personalInformation: {
              profileImage: {
                imageUri: initialProfileImageUrl
              },
              customFields: {
                q2: { questionId: 'q2', answers: null }
              }
            }
          }
        }
      }
    });
    expect(newRegCart).toMatchSnapshot();

    const actualFileAnswerUrl = newRegCart.eventRegistrations[0].attendee.eventAnswers[0].answers[0].uRL;
    const actualProfileImageUrl = newRegCart.eventRegistrations[0].attendee.personalInformation.profileImage.imageUri;
    expect(actualFileAnswerUrl).toEqual(expectedFileAnswerUrl);
    expect(actualProfileImageUrl).toEqual(expectedProfileImageUrl);
  });

  test('with added, then removed file upload answer', async () => {
    const newRegCart = convertRegCart({
      eventRegistrations: {
        er1: {
          eventRegistrationId: 'er1',
          attendee: {
            eventAnswers: {
              q1: { questionId: 'q1', answers: [] }
            },
            personalInformation: {
              customFields: {
                q2: { questionId: 'q2', answers: null }
              }
            }
          }
        }
      }
    });
    expect(newRegCart).toMatchSnapshot();
    expect(newRegCart.eventRegistrations[0].attendee.eventAnswers[0].answers).toEqual([]);
  });
});

test('RegCartClient.identifyByConfirm matches snapshot', async () => {
  setMockResponse(
    {
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
    },
    {}
  );
  const response = await client.identifyByConfirm('authToken', 'eventId', 'flastname@example.com', 'FAKECONFNUM');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.createRegModCart matches snapshot', async () => {
  setMockResponse(
    {
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
    },
    {}
  );
  const response = await client.createRegModCart('authToken');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});

test('RegCartClient.createCancelRegistrationCart matches snapshot', async () => {
  setMockResponse(
    {
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
    },
    {}
  );
  const response = await client.createCancelRegistrationCart('authToken');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
  expect(response).toMatchSnapshot();
});
