/* eslint-disable @typescript-eslint/await-thenable */
/* global */
import { ServiceError } from '@cvent/event-ui-networking';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import {
  requestConfirmationDeny,
  requestConfirmation,
  requestSubstituteRegistration,
  removeSubstitutionCart,
  abortOriginalSubstitutionCart,
  requestSubstituteRegistrationWithLoading,
  getConfirmationWithLoading
} from '../actions';
import reducer from '../reducer';
import { redirectToPage } from '../../pathInfo';
import { hasAccessToWebsitePages } from '../../selectors/event';

const accessToken = 'some token';
const substituentInformation = {
  firstName: 'firstName',
  lastName: 'lastName',
  emailAddress: 'emailAddress@abc.xyz'
};
const defaultSubstitutionCart = {
  acctId: 'acctId',
  eventId: 'eventId',
  contactId: 'contactId',
  inviteeId: 'inviteeId',
  substitutionCartId: 'substitutionCartId',
  accountSnapshotVersion: 'accountSnapshotVersion',
  eventSnapshotVersion: {
    eventId: 'eventSnapshotVersion'
  },
  travelSnapshotVersion: {
    eventId: 'travelSnapshotVersion'
  },
  substituentInformation
};

const getResponseWithGivenStatusAndSubstituentInformation = (status, substituentInfo) => {
  return {
    substitutionCart: {
      ...defaultSubstitutionCart,
      status,
      substituentInformation: substituentInfo
    },
    validationMessages: []
  };
};
const response = getResponseWithGivenStatusAndSubstituentInformation('INPROGRESS', substituentInformation);

jest.mock('../../pathInfo', () => ({
  ...jest.requireActual<$TSFixMe>('../../pathInfo'),
  __esModule: true,
  redirectToPage: jest.fn(() => () => {})
}));

jest.mock('../../selectors/event', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../selectors/event'),
    hasAccessToWebsitePages: jest.fn()
  };
});

const initialState = {
  clients: {
    substitutionCartClient: {
      createSubstitutionCart: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(response);
        })
      ),
      updateSubstitutionCart: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(response);
        })
      ),
      checkoutSubstitutionCart: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(response);
        })
      ),
      getSubstitutionCart: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(response);
        })
      ),
      abortSubstitutionCart: jest.fn().mockReturnValue(
        new Promise(resolve => {
          resolve(response);
        })
      )
    }
  },
  accessToken,
  event: {
    id: 'eventId',
    version: 'version'
  },
  pathInfo: {
    rootPath: 'events/dummyId',
    currentPageId: 'confirmation'
  },
  defaultUserSession: {
    isPreview: 'standard'
  },
  userSession: {
    regTypeId: '',
    persistRegType: false
  },
  account: {
    version: 'version'
  },
  eventTravel: {
    travelSnapshotVersion: 'travelSnapshotVersion'
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        'event-registration-id': {
          registrationPathId: 'test-registration-path-id',
          attendee: {
            personalInformation: {
              contactId: 'contactId'
            },
            attendeeId: 'attendeeId'
          }
        }
      }
    }
  },
  registrationSubstitution: {
    showConcurrentActionMessage: false,
    cartAborted: false,
    substituteRegistrationSuccess: false,
    substituteRegistrationError: false,
    showConfirmationMessage: false,
    hasConfirmed: false,
    autoFocus: true,
    substitutionForm: {
      firstName: 'firstName',
      lastName: 'lastName',
      emailAddress: 'emailAddress@abc.xyz'
    },
    validationList: null,
    substitutionCart: null,
    originalSubstitutionCart: null
  }
};
const getState = (state = initialState) => state;
function clearMocksAndCreateStore(mockState = initialState) {
  jest.clearAllMocks();
  return createStore(
    (state, action) => {
      return {
        ...state,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ showConcurrentActionMessage: b... Remove this comment to see the full error message
        registrationSubstitution: reducer(state.registrationSubstitution, action)
      };
    },
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    getState(mockState),
    applyMiddleware(thunk)
  );
}
const mockStore = clearMocksAndCreateStore();

beforeEach(() => {
  (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
});

test('requestConfirmationDeny Method', async () => {
  let newState = {
    ...initialState,
    registrationSubstitution: {
      ...initialState.registrationSubstitution,
      substitutionCart: {
        acctId: 'acctId',
        eventId: 'eventId',
        contactId: 'contactId',
        inviteeId: 'inviteeId',
        substitutionCartId: 'substitutionCartId',
        status: 'INPROGRESS',
        accountSnapshotVersion: 'accountSnapshotVersion',
        eventSnapshotVersion: {
          eventId: 'eventSnapshotVersion'
        },
        travelSnapshotVersion: {
          eventId: 'travelSnapshotVersion'
        },
        substituentInformation: {
          firstName: 'firstName',
          lastName: 'lastName',
          emailAddress: 'emailAddress@abc.xyz'
        }
      }
    }
  };
  const store = clearMocksAndCreateStore(newState);
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe) => $TSFixMe... Remove this comment to see the full error message
  await store.dispatch(requestConfirmationDeny());
  newState = store.getState();
  expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
  expect(newState.registrationSubstitution).toMatchSnapshot();
});

describe('Test requestConfirmation', () => {
  test('On creation of substitution cart', async () => {
    await mockStore.dispatch(getConfirmationWithLoading());
    const newState = mockStore.getState();
    expect(newState.clients.substitutionCartClient.createSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeTruthy();
    expect(newState.registrationSubstitution.substitutionCart).not.toBe(null);
  });
  test('When validation is encountered upon creation', async () => {
    const mockResponse = {
      substitutionCart: {
        eventId: 'eventId',
        contactId: 'contactId',
        inviteeId: 'inviteeId',
        substituentInformation: {
          firstName: 'firstName',
          lastName: 'lastName',
          emailAddress: 'emailAddress@abc.xyz'
        }
      },
      validationMessages: [
        {
          localizationKey: 'REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_BLOCKED'
        }
      ]
    };
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          createSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(mockResponse);
            })
          )
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.createSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect(newState.registrationSubstitution.validationList).not.toBe(null);
    expect(newState.registrationSubstitution.cartAborted).toBeFalsy();
    expect((newState.registrationSubstitution as $TSFixMe).disableSubmitButton).toBeFalsy();
    expect(newState.registrationSubstitution.validationList[0]).toBe(
      'EventWidgets_SubstituteReg_DomainValidation__resx'
    );
  });
  test('When validation is encountered upon creation for concurrent action', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          createSubstitutionCart: jest.fn(async () => {
            const request = {
              headers: {
                HttpLogPageLoadId: 'HttpLogPageLoadId',
                HttpLogRequestId: 'HttpLogPageLoadId',
                get: () => {}
              }
            };
            const createResponse = {
              substitutionCart: {},
              validationMessages: [
                {
                  severity: 'Error',
                  localizationKey: 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED'
                }
              ],
              text: () =>
                '{"validationMessages": [{"severity": "Error", "localizationKey": "REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED"}]}'
            };
            throw await ServiceError.create('requestConfirmation failed', createResponse, request);
          })
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.createSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect(newState.registrationSubstitution.validationList).not.toBe(null);
    expect(newState.registrationSubstitution.cartAborted).toBeFalsy();
    expect((newState.registrationSubstitution as $TSFixMe).disableSubmitButton).toBeFalsy();
    expect(newState.registrationSubstitution.validationList[0]).toBe(
      'EventWidgets_SubstituteReg_ConcurrentActionFailure__resx'
    );
  });
  test('On creation of concurrent substitution cart', async () => {
    const mockResponse = {
      substitutionCart: {
        eventId: 'eventId',
        contactId: 'contactId',
        inviteeId: 'inviteeId',
        substituentInformation: {
          firstName: 'firstNameConcurrent',
          lastName: 'lastNameConcurrent',
          emailAddress: 'emailAddressConcurrent@abc.xyz'
        }
      },
      validationMessages: [
        {
          severity: 'Warning',
          localizationKey: 'REGAPI.REGAPI_CONCURRENTACTIONS_EXISTING_LOCKHOLDER'
        }
      ]
    };
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          createSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(mockResponse);
            })
          )
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.createSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect(newState.registrationSubstitution.showConcurrentActionMessage).toBeTruthy();
    expect(newState.registrationSubstitution.validationList).toBe(null);
    expect(newState.registrationSubstitution.originalSubstitutionCart).not.toBe(null);
  });
  test('When validation is encountered upon creation for concurrentCart', async () => {
    const mockResponse = {
      validationMessages: [
        {
          localizationKey: 'REGAPI.DUPLICATE_SUBSTITUTION_FOR_SUBSTITUENT'
        }
      ]
    };
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          createSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(mockResponse);
            })
          )
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.createSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect((newState.registrationSubstitution as $TSFixMe).disableSubmitButton).toBeTruthy();
    expect(newState.registrationSubstitution.validationList[0]).toBe(
      'EventWidgets_SubstituteReg_DuplicateSubstitution__resx'
    );
  });
  test('On modification of substitution cart', async () => {
    const mockResponse = getResponseWithGivenStatusAndSubstituentInformation('INPROGRESS', {
      firstName: 'firstNameNew',
      lastName: 'lastNameNew',
      emailAddress: 'emailAddressNew@abc.xyz'
    });
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          updateSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(mockResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionForm: {
          firstName: 'firstNameNew',
          lastName: 'lastNameNew',
          emailAddress: 'emailAddressNew@abc.xyz'
        },
        substitutionCart: {
          status: 'INPROGRESS',
          ...defaultSubstitutionCart
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.updateSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeTruthy();
  });
  test('On modification of substitution cart but cart was aborted by concurrent user', async () => {
    const mockResponse = null;
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          updateSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(reject => {
              reject(mockResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionForm: {
          firstName: 'firstNameNew',
          lastName: 'lastNameNew',
          emailAddress: 'emailAddressNew@abc.xyz'
        },
        substitutionCart: {
          status: 'INPROGRESS',
          ...defaultSubstitutionCart
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.updateSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
  });
  test('On modification of substitution cart but cart was aborted by concurrent user and other cart did not acquire lock yet', async () => {
    const modResponse = {
      validationMessages: [
        {
          severity: 'Error',
          localizationKey: 'REGAPI.SUBSITUTION_CART_CANCELLED'
        }
      ]
    };
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          updateSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(reject => {
              reject(modResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionForm: {
          firstName: 'firstNameNew',
          lastName: 'lastNameNew',
          emailAddress: 'emailAddressNew@abc.xyz'
        },
        substitutionCart: {
          status: 'INPROGRESS',
          ...defaultSubstitutionCart
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.updateSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
  });
  test('When validation is encountered upon updation', async () => {
    const mockResponse = {
      substitutionCart: {
        eventId: 'eventId',
        contactId: 'contactId',
        inviteeId: 'inviteeId',
        substituentInformation: {
          firstName: 'firstNameNew',
          lastName: 'lastNameNew',
          emailAddress: 'emailAddressNew@abc.xyz'
        }
      },
      validationMessages: [
        {
          localizationKey: 'REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_BLOCKED'
        }
      ]
    };
    jest.clearAllMocks();
    const newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          updateSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(mockResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionForm: {
          firstName: 'firstNameNew',
          lastName: 'lastNameNew',
          emailAddress: 'emailAddressNew@abc.xyz'
        },
        substitutionCart: {
          status: 'INPROGRESS',
          ...defaultSubstitutionCart
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    const newStateAfterRequestingConfirmation = store.getState();
    expect(
      newStateAfterRequestingConfirmation.clients.substitutionCartClient.updateSubstitutionCart
    ).toHaveBeenCalled();
    expect(newStateAfterRequestingConfirmation.registrationSubstitution.showConfirmationMessage).toBeFalsy();
    expect(newStateAfterRequestingConfirmation.registrationSubstitution.validationList).not.toBe(null);
    expect(newStateAfterRequestingConfirmation.registrationSubstitution.validationList[0]).toBe(
      'EventWidgets_SubstituteReg_DomainValidation__resx'
    );
    expect(
      newStateAfterRequestingConfirmation.registrationSubstitution.substitutionCart.substituentInformation
    ).not.toStrictEqual(newState.registrationSubstitution.substitutionForm);
  });
  test('When nothing to update on Updation', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          status: 'INPROGRESS',
          ...defaultSubstitutionCart
        }
      }
    };
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestConfirmation());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.updateSubstitutionCart).not.toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConfirmationMessage).toBeTruthy();
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
});

describe('Test requestSubstituteRegistration', () => {
  test('On success registration substitution', async () => {
    const checkoutResponse = getResponseWithGivenStatusAndSubstituentInformation('QUEUED', substituentInformation);
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          checkoutSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(checkoutResponse);
            })
          ),
          waitForSubstitutionCartCheckoutCompletion: jest.fn()
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestSubstituteRegistration());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.checkoutSubstitutionCart).toHaveBeenCalled();
    expect(newState.clients.substitutionCartClient.waitForSubstitutionCartCheckoutCompletion).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart.status).toEqual('COMPLETED');
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
  test('On checkout failure', async () => {
    const checkoutResponse = {
      ...getResponseWithGivenStatusAndSubstituentInformation('QUEUED', substituentInformation),
      validationMessages: [
        {
          localizationKey: 'REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_BLOCKED'
        }
      ]
    };
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          checkoutSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(checkoutResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    await store.dispatch(requestSubstituteRegistrationWithLoading());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.checkoutSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart.status).toEqual('FAILED');
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
  test('On checkout failure because cart was aborted and other cart acquired lock', async () => {
    const checkoutResponse = null;
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          checkoutSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(reject => {
              reject(checkoutResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestSubstituteRegistration());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.checkoutSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
    expect(newState.registrationSubstitution.hasConfirmed).toBeFalsy();
  });
  test('On checkout failure because cart was aborted and other cart did not acquire lock yet', async () => {
    const checkoutResponse = {
      validationMessages: [
        {
          severity: 'Error',
          localizationKey: 'REGAPI.SUBSITUTION_CART_CANCELLED'
        }
      ]
    };
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          checkoutSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(reject => {
              reject(checkoutResponse);
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestSubstituteRegistration());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.checkoutSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
    expect(newState.registrationSubstitution.hasConfirmed).toBeFalsy();
  });
  test('On checkout successful but dequeue failed', async () => {
    const checkoutResponse = getResponseWithGivenStatusAndSubstituentInformation('QUEUED', substituentInformation);
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          checkoutSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve(checkoutResponse);
            })
          ),
          waitForSubstitutionCartCheckoutCompletion: jest.fn(() => {
            throw new Error();
          })
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(requestSubstituteRegistration());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.checkoutSubstitutionCart).toHaveBeenCalled();
    expect(newState.clients.substitutionCartClient.waitForSubstitutionCartCheckoutCompletion).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart.status).toEqual('FAILED');
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
});

describe('Test removeSubstitutionCart', () => {
  test('when no cart is created', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          deleteSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.deleteSubstitutionCart).not.toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
  test('On successful removal of cart', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          deleteSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.deleteSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
  test('On successful removal of cart when aborted and log out the user', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        eventGuestClient: {
          logout: jest.fn(() => {})
        },
        substitutionCartClient: {
          deleteSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        },
        cartAborted: true
      },
      experiments: {
        flexPersistRegType: true
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'experiments' is missing in type '{ clien... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.deleteSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    expect(newState.clients.eventGuestClient.logout).toHaveBeenCalled();
    // redirect to summary page since Website is On
    expect(redirectToPage).toHaveBeenCalledWith('summary');
  });
  test('When cart has been checked out and registrant must be logged out', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        eventGuestClient: {
          logout: jest.fn(() => {})
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'COMPLETED'
        }
      },
      experiments: {
        flexPersistRegType: true
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'experiments' is missing in type '{ clien... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.eventGuestClient.logout).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    // Redirect to summary page since website is ON
    expect(redirectToPage).toHaveBeenCalledWith('summary');
  });
  test('On successful removal of cart when aborted and user should be redirected to registration page', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        eventGuestClient: {
          logout: jest.fn(() => {})
        },
        substitutionCartClient: {
          deleteSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        },
        cartAborted: true
      },
      experiments: {
        flexPersistRegType: true
      }
    };
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'experiments' is missing in type '{ clien... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.deleteSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    expect(newState.clients.eventGuestClient.logout).toHaveBeenCalled();
    // redirect to registration page since Website is Off
    expect(redirectToPage).toHaveBeenCalledWith('register');
  });
  test('When cart has been checked out aand registrant should be redirected to registration page', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        eventGuestClient: {
          logout: jest.fn(() => {})
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'COMPLETED'
        }
      },
      experiments: {
        flexPersistRegType: true
      }
    };
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'experiments' is missing in type '{ clien... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.eventGuestClient.logout).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    // Redirect to registration page since website is OFF
    expect(redirectToPage).toHaveBeenCalledWith('register');
  });
  test('When cart has been checked out with failures and registrant must not be logged out and delete the cart', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        eventGuestClient: {
          logout: jest.fn(() => {})
        },
        substitutionCartClient: {
          deleteSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'FAILED'
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.deleteSubstitutionCart).toHaveBeenCalled();
    expect(newState.clients.eventGuestClient.logout).not.toHaveBeenCalled();
    expect(newState.registrationSubstitution).toMatchSnapshot();
  });
  test('User is not redirected on successful removal of cart when aborted and log out the user with OAuth on', async () => {
    jest.clearAllMocks();
    const logoutResponse = { oktaLogoutUrl: 'https://www.dummy-logout.com' };
    const getLogoutResponse = jest.fn();
    getLogoutResponse.mockReturnValue(
      new Promise(resolve => {
        return resolve(logoutResponse);
      })
    );
    let newState = {
      ...initialState,
      clients: {
        eventGuestClient: {
          logout: getLogoutResponse
        },
        substitutionCartClient: {
          deleteSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        substitutionCart: {
          ...defaultSubstitutionCart,
          status: 'INPROGRESS'
        },
        cartAborted: true
      },
      experiments: {
        flexPersistRegType: true
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { eventGuestClient: {... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2741) FIXME: Property 'experiments' is missing in type '{ clien... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.registrationSubstitution.cartAborted).toBeTruthy();
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(removeSubstitutionCart());
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ clients: { substitutionCartClient: { creat... Remove this comment to see the full error message
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.deleteSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
    expect(newState.clients.eventGuestClient.logout).toHaveBeenCalled();
    // redirect to summary page since Website is On
    expect(redirectToPage).not.toHaveBeenCalled();
  });
});

describe('Test abortSubstitutionCart', () => {
  test('On successful abort of cart', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          abortSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(resolve => {
              resolve({ isSuccessful: true });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        originalSubstitutionCart: {
          ...defaultSubstitutionCart
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(abortOriginalSubstitutionCart());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.abortSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.showConcurrentActionMessage).toBeFalsy();
    expect(newState.registrationSubstitution.originalSubstitutionCart).toBe(null);
    expect(newState.registrationSubstitution.substitutionCart).toBe(null);
  });
  test('When no originalCart exist - should never happen', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState
    };
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(abortOriginalSubstitutionCart());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.abortSubstitutionCart).toBeCalledTimes(0);
    expect(newState.registrationSubstitution.substituteRegistrationError).toBeTruthy();
  });
  test('On un-successful abort of cart', async () => {
    jest.clearAllMocks();
    let newState = {
      ...initialState,
      clients: {
        substitutionCartClient: {
          abortSubstitutionCart: jest.fn().mockReturnValue(
            new Promise(reject => {
              reject({ isSuccessful: false });
            })
          )
        }
      },
      registrationSubstitution: {
        ...initialState.registrationSubstitution,
        originalSubstitutionCart: {
          ...defaultSubstitutionCart
        }
      }
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { substitutionCartCli... Remove this comment to see the full error message
    const store = clearMocksAndCreateStore(newState);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(dispatch: $TSFixMe, getState: $... Remove this comment to see the full error message
    await store.dispatch(abortOriginalSubstitutionCart());
    newState = store.getState();
    expect(newState.clients.substitutionCartClient.abortSubstitutionCart).toHaveBeenCalled();
    expect(newState.registrationSubstitution.substituteRegistrationError).toBeTruthy();
    expect(newState.registrationSubstitution.substitutionCart).not.toBeNull();
  });
});
