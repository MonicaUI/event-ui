import {
  buildRegTypeSelectionConflictDialogResults,
  buildIdConfirmationDialogRegTypeConflictResults,
  buildUnregisterSessionBundlesInput,
  handleRegTypeConflictSessionBundles,
  getSessionBundleToUpdate,
  _getSessionCapacityIdsForChangedSessionBundles
} from '../sessionBundles';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';

function createConflictSessionBundleParams() {
  return [
    {
      eventRegistrationId: 'invitee-reg',
      productId: 'sessionBundle1',
      productType: 'Track',
      registrationTypeId: 'newRegTypeId'
    },
    {
      eventRegistrationId: 'invitee-reg',
      productId: 'sessionBundle2',
      productType: 'Track',
      registrationTypeId: 'newRegTypeId'
    }
  ];
}

describe('sessionBundleCartErrorValidationConverter', () => {
  test('buildRegTypeSelectionConflictDialogResults returns invalid validation results', () => {
    const params = createConflictSessionBundleParams();
    const results = buildRegTypeSelectionConflictDialogResults(params);
    expect(results).toBeDefined();

    const { regTypeId, sessionBundleValidationResults } = results;
    expect(regTypeId).toBeDefined();
    expect(regTypeId).toBe('newRegTypeId');

    expect(sessionBundleValidationResults).toBeDefined();
    expect(Object.keys(sessionBundleValidationResults).length).toBe(1);
    expect(Object.keys(sessionBundleValidationResults)[0]).toBe('invitee-reg');
    expect(sessionBundleValidationResults['invitee-reg']).toBeDefined();

    const inviteeRegValidationResult = sessionBundleValidationResults['invitee-reg'];
    expect(inviteeRegValidationResult.newRegistrationTypeId).toBe('newRegTypeId');

    const inviteeSessionBundleValidationResults = inviteeRegValidationResult.sessionBundlesValidationResults;
    expect(inviteeSessionBundleValidationResults).toBeDefined();
    expect(inviteeSessionBundleValidationResults.invalidSessionBundles.length).toBe(2);
    expect(inviteeSessionBundleValidationResults.invalidSessionBundles[0]).toBe('sessionBundle1');
    expect(inviteeSessionBundleValidationResults.invalidSessionBundles[1]).toBe('sessionBundle2');
  });

  test('buildIdConfirmationDialogRegTypeConflictResults returns invalid validation results', () => {
    const params = createConflictSessionBundleParams();
    const results = buildIdConfirmationDialogRegTypeConflictResults(params);
    expect(results).toBeDefined();

    const { isValid, invalidSessionBundles } = results;
    expect(isValid).toBeFalsy();
    expect(invalidSessionBundles).toBeDefined();
    expect(invalidSessionBundles.length).toBe(2);
    expect(invalidSessionBundles[0]).toBe('sessionBundle1');
    expect(invalidSessionBundles[1]).toBe('sessionBundle2');
  });

  test('buildIdConfirmationDialogRegTypeConflictResults returns valid validation results', () => {
    const result = buildIdConfirmationDialogRegTypeConflictResults();
    expect(result).toBeDefined();

    const { isValid, invalidSessionBundles } = result;
    expect(isValid).toBeTruthy();
    expect(invalidSessionBundles).toBeDefined();
    expect(invalidSessionBundles.length).toBe(0);
  });
});

const regCart = {
  eventRegistrations: {
    inviteeEvtRegId: {
      eventRegistrationId: 'inviteeEvtRegId',
      primaryRegistrationId: 'inviteeEvtRegId',
      attendee: {
        personalInformation: {
          firstName: 'invitee',
          lastName: 'invitee'
        }
      },
      attendeeType: 'ATTENDEE',
      displaySequence: 1,
      eventId: 'eventId',
      registrationPathId: 'regPathId',
      requestedAction: 'REGISTER',
      sessionRegistrations: {
        sessionId: {
          includedInAgenda: false,
          productId: 'sessionId',
          registrationSourceType: 'Track',
          requestedAction: 'REGISTER'
        }
      },
      sessionBundleRegistrations: {
        sessionBundleId: {
          requestedAction: 'REGISTER',
          productId: 'sessionBundleId'
        }
      }
    }
  },
  groupRegistration: false,
  regCartId: 'regCartId',
  status: 'INPROGRESS'
};
describe('handleRegTypeConflictSessionBundles with invalid session bundles', () => {
  const middleware = [thunk];
  const mockStore = configureMockStore(middleware);

  function getState() {
    return {
      userSession: {
        eventId: 'dummyEventId',
        isPreview: false,
        defaultRegPathId: 'dummyRegPathId'
      },
      registrationForm: {
        regCart
      }
    };
  }

  let store;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    store = mockStore(getState());
  });

  it('should call mutation and dispatch success action without GUEST', async () => {
    const inviteeSessionBundleUnRegisterInput = [
      {
        eventRegistrationId: 'inviteeEvtRegId',
        productId: 'sessionBundleId',
        requestedAction: 'UNREGISTER',
        registrationSourceType: 'Selected'
      }
    ];
    const mockInviteeUnregisterResponse = {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'inviteeEvtRegId',
            primaryRegistrationId: 'inviteeEvtRegId',
            attendee: {
              eventAnswers: [],
              personalInformation: {
                firstName: 'invitee',
                lastName: 'invitee',
                customFields: []
              }
            },
            attendeeType: 'ATTENDEE',
            displaySequence: 1,
            eventId: 'eventId',
            registrationPathId: 'regPathId',
            requestedAction: 'REGISTER',
            sessionRegistrations: {},
            sessionBundleRegistrations: {}
          }
        ],
        groupRegistration: false,
        regCartId: 'regCartId',
        status: 'INPROGRESS'
      },
      validationMessages: {}
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const apolloClient = require('@apollo/client');
    jest.mock('@apollo/client', () => ({
      mutate: jest.fn(async () => {
        return { data: { response: mockInviteeUnregisterResponse } };
      })
    }));

    const inviteeEvtRegUpdate = await store.dispatch(
      handleRegTypeConflictSessionBundles(apolloClient, regCart, inviteeSessionBundleUnRegisterInput)
    );
    expect(apolloClient.mutate).toHaveBeenCalled();
    expect(inviteeEvtRegUpdate).toBeUndefined();

    const actions = store.getActions();
    expect(actions).toBeDefined();
    expect(actions.length).toBe(2);
    expect(actions[0].type).toEqual('event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_PENDING');
    expect(actions[1].type).toEqual('event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS');
  });
  it('should call mutation and dispatch success action and return Guest Evt Reg with GUEST', async () => {
    const guestSessionBundleUnRegisterInput = [
      {
        eventRegistrationId: 'guestEvtRegId',
        productId: 'sessionBundleId',
        requestedAction: 'UNREGISTER',
        registrationSourceType: 'Selected'
      }
    ];
    const mockGuestUnregisterResponse = {
      regCart: {
        eventRegistrations: [
          {
            eventRegistrationId: 'guestEvtRegId',
            primaryRegistrationId: 'inviteeEvtRegId',
            attendee: {
              eventAnswers: [],
              personalInformation: {
                firstName: 'guest',
                lastName: 'guest',
                customFields: []
              }
            },
            attendeeType: 'GUEST',
            displaySequence: 1,
            eventId: 'eventId',
            registrationPathId: 'regPathId',
            requestedAction: 'REGISTER',
            sessionRegistrations: {},
            sessionBundleRegistrations: {}
          }
        ],
        groupRegistration: false,
        regCartId: 'regCartId',
        status: 'INPROGRESS'
      },
      validationMessages: {}
    };
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const apolloClient2 = require('@apollo/client');
    jest.mock('@apollo/client', () => ({
      mutate: jest.fn(async () => {
        return { data: { response: mockGuestUnregisterResponse } };
      })
    }));

    const guestEvtRegUpdate = await store.dispatch(
      handleRegTypeConflictSessionBundles(apolloClient2, regCart, guestSessionBundleUnRegisterInput, 'guestEvtRegId')
    );
    expect(apolloClient2.mutate).toHaveBeenCalled();
    expect(guestEvtRegUpdate).toBeDefined();
    expect(guestEvtRegUpdate.sessionBundleRegistrations).toMatchObject({});
    expect(guestEvtRegUpdate.sessionRegistrations).toMatchObject({});

    const actions = store.getActions();
    expect(actions).toBeDefined();
    expect(actions.length).toBe(2);
    expect(actions[0].type).toEqual('event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_PENDING');
    expect(actions[1].type).toEqual('event-guestside-site/regCart/UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS');
  });
});

describe('buildUnregisterSessionBundlesInput', () => {
  const regCartwithGuest = {
    ...regCart,
    eventRegistrations: {
      ...regCart.eventRegistrations,
      guestEvtRegId: {
        eventRegistrationId: 'guestEvtRegId',
        primaryRegistrationId: 'inviteeEvtRegId',
        attendee: {
          personalInformation: {
            firstName: 'invitee',
            lastName: 'invitee'
          }
        },
        attendeeType: 'GUEST',
        displaySequence: 1,
        eventId: 'eventId',
        registrationPathId: 'regPathId',
        requestedAction: 'REGISTER',
        sessionRegistrations: {
          sessionId: {
            includedInAgenda: false,
            productId: 'sessionId',
            registrationSourceType: 'Track',
            requestedAction: 'REGISTER'
          }
        },
        sessionBundleRegistrations: {
          sessionBundleId: {
            requestedAction: 'REGISTER',
            productId: 'sessionBundleId'
          }
        }
      }
    }
  };
  it('should return result only including Invitee Reg with single session bundle when guest apply same product is OFF', () => {
    const result = buildUnregisterSessionBundlesInput(regCartwithGuest, 'inviteeEvtRegId', ['sessionBundleId'], false);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    const inviteeInput = result[0];
    expect(inviteeInput.eventRegistrationId).toBe('inviteeEvtRegId');
    expect(inviteeInput.productId).toBe('sessionBundleId');
    expect(inviteeInput.requestedAction).toBe('UNREGISTER');
  });

  it('should return result including Guest Reg with single session bundle when guest apply same product is ON', () => {
    const result = buildUnregisterSessionBundlesInput(regCartwithGuest, 'inviteeEvtRegId', ['sessionBundleId'], true);

    expect(result).toBeDefined();
    expect(result.length).toBe(2);

    const inviteeInput = result[0];
    expect(inviteeInput.eventRegistrationId).toBe('inviteeEvtRegId');
    expect(inviteeInput.productId).toBe('sessionBundleId');
    expect(inviteeInput.requestedAction).toBe('UNREGISTER');

    const guestInput = result[1];
    expect(guestInput.eventRegistrationId).toBe('guestEvtRegId');
    expect(guestInput.productId).toBe('sessionBundleId');
    expect(guestInput.requestedAction).toBe('UNREGISTER');
  });

  it('should return result including Guest Reg with multiple sessionBundleIds when guest apply same product is ON', () => {
    const result = buildUnregisterSessionBundlesInput(
      regCartwithGuest,
      'inviteeEvtRegId',
      ['sessionBundleId1', 'sessionBundleId2'],
      true
    );
    expect(result).toBeDefined();
    expect(result.length).toBe(4);
    const inviteeInput1 = result[0];
    expect(inviteeInput1.eventRegistrationId).toBe('inviteeEvtRegId');
    expect(inviteeInput1.productId).toBe('sessionBundleId1');
    expect(inviteeInput1.requestedAction).toBe('UNREGISTER');
    const inviteeInput2 = result[1];
    expect(inviteeInput2.eventRegistrationId).toBe('inviteeEvtRegId');
    expect(inviteeInput2.productId).toBe('sessionBundleId2');
    expect(inviteeInput2.requestedAction).toBe('UNREGISTER');
    const guestInput1 = result[2];
    expect(guestInput1.eventRegistrationId).toBe('guestEvtRegId');
    expect(guestInput1.productId).toBe('sessionBundleId1');
    expect(guestInput1.requestedAction).toBe('UNREGISTER');
    const guestInput2 = result[3];
    expect(guestInput2.eventRegistrationId).toBe('guestEvtRegId');
    expect(guestInput2.productId).toBe('sessionBundleId2');
    expect(guestInput2.requestedAction).toBe('UNREGISTER');
  });
});

describe('getSessionBundleToUpdate', () => {
  it('should return object to register bundle', () => {
    const results = getSessionBundleToUpdate('eventRegistrationId', 'sessionBundleId', true);
    expect(results).toBeDefined();
    expect(results.requestedAction).toBe(REQUESTED_ACTIONS.REGISTER);
  });

  it('should return object to unregister bundle', () => {
    const results = getSessionBundleToUpdate('eventRegistrationId', 'sessionBundleId', false);
    expect(results).toBeDefined();
    expect(results.requestedAction).toBe(REQUESTED_ACTIONS.UNREGISTER);
  });
});

describe('_getSessionCapacityIdsForChangedSessionBundles', () => {
  const lastRegCart = {
    eventRegistrations: {
      eventReg1: {
        sessionBundleRegistrations: {
          bundle1: {
            requestedAction: 'REGISTER',
            productId: 'bundle1'
          }
        },
        sessionRegistrations: {
          session1: {
            requestedAction: 'REGISTER',
            productId: 'session1',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle1',
            includedInAgenda: false
          }
        }
      },
      eventReg2: {
        sessionBundleRegistrations: {
          bundle1: {
            requestedAction: 'REGISTER',
            productId: 'bundle1'
          },
          bundle2: {
            requestedAction: 'REGISTER',
            productId: 'bundle2'
          }
        },
        sessionRegistrations: {
          session1: {
            requestedAction: 'REGISTER',
            productId: 'session1',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle1',
            includedInAgenda: false
          },
          session2: {
            requestedAction: 'REGISTER',
            productId: 'session2',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle2',
            includedInAgenda: false
          },
          session3: {
            requestedAction: 'REGISTER',
            productId: 'session3',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle2',
            includedInAgenda: false
          },
          session4: {
            requestedAction: 'REGISTER',
            productId: 'session4',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle1',
            includedInAgenda: false
          }
        }
      }
    }
  };
  const newRegCart = {
    eventRegistrations: {
      eventReg1: {
        sessionBundleRegistrations: {
          bundle1: {
            requestedAction: 'REGISTER',
            productId: 'bundle1'
          }
        },
        sessionRegistrations: {
          session1: {
            requestedAction: 'REGISTER',
            productId: 'session1',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle1',
            includedInAgenda: false
          },
          session5: {
            requestedAction: 'REGISTER',
            productId: 'session5',
            registrationSourceType: 'Track',
            registrationSourceParentId: 'bundle1',
            includedInAgenda: false
          }
        }
      },
      eventReg2: {
        sessionBundleRegistrations: {},
        sessionRegistrations: {}
      }
    }
  };
  const sessionProducts = {
    session1: { capacityId: 'session1Capacity' },
    session2: { capacityId: 'session2Capacity' },
    session3: { capacityId: 'session3Capacity' },
    session4: { capacityId: 'session4Capacity' },
    session5: { capacityId: 'session5Capacity' }
  };

  it('should obtain capacity ids of changed included sessions', () => {
    const sessionBundleRegistrationsToUpdate = [getSessionBundleToUpdate('eventReg1', 'bundle1', true)];
    const actualResult = _getSessionCapacityIdsForChangedSessionBundles(
      sessionProducts,
      sessionBundleRegistrationsToUpdate,
      lastRegCart,
      newRegCart
    );
    const expectedResult = ['session1Capacity', 'session5Capacity'];
    expect(actualResult).toEqual(expectedResult);
  });
});
