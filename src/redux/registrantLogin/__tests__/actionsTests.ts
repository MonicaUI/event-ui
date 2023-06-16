import { openPartialRegistrationConfirmationDialog } from '../../../dialogs/PartialRegistrationConfirmationDialog';
import { loginRegistrant, logoutRegistrant } from '../actions';
import EventGuestClient from '../../../clients/EventGuestClient';
import RegCartClient from '../../../clients/RegCartClient';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/prodCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { ServiceError } from '@cvent/event-ui-networking';
import { LOG_OUT_REGISTRANT_SUCCESS } from '../actionTypes';

delete window.location;
// @ts-expect-error Type '{ assign: Mock() => void, []>; }' is missing the following properties from type 'Location'...
window.location = { assign: jest.fn(() => () => {}) };

jest.mock('../../../dialogs/PartialRegistrationConfirmationDialog', () => {
  return {
    openPartialRegistrationConfirmationDialog: jest.fn(() => () => ({}))
  };
});
jest.mock('../../../clients/RegCartClient', () => {
  return {
    identifyByConfirm: jest.fn(() => {})
  };
});
jest.mock('../../../clients/EventGuestClient', () => {
  return {
    logout: jest.fn(() => {})
  };
});

const state = {
  clients: {
    eventGuestClient: EventGuestClient,
    regCartClient: RegCartClient
  },
  userSession: {},
  defaultUserSession: {},
  text: {
    translate: x => x
  },
  event: {
    eventLocalesSetup: {},
    eventSecuritySetupSnapshot: {}
  },
  registrantLogin: {
    form: {}
  }
};

(RegCartClient as $TSFixMe).identifyByConfirm.mockImplementation(() => {
  throw new ServiceError(
    'identify by confirm failed',
    { status: 422 },
    { headers: { get() {} } },
    {
      validationMessages: [
        {
          severity: 'Error',
          localizationKey: 'REGAPI.LOOKUP_REGCART_BY_CONFIRM_NOT_FOUND'
        }
      ]
    }
  );
});

describe('loginRegistrant', () => {
  test('identifyByConfirm fails due to Elasticsearch delays, timeout modal is shown', async () => {
    const store = createStoreWithMiddleware(
      combineReducers({
        website: (x = {}) => x,
        text: (x = {}) => x,
        regCartStatus: (x = {}) => x,
        clients: (x = {}) => x,
        registrantLogin: (x = {}) => x,
        event: (x = {}) => x,
        userSession: (x = {}) => x,
        defaultUserSession: (x = {}) => x,
        experiments: (x = {}) => x,
        timezones: (x = {}) => x
      }),
      state
    );

    try {
      await store.dispatch(loginRegistrant({}, true));
      expect(openPartialRegistrationConfirmationDialog).toHaveBeenCalled();
    } catch (error) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('it should not reach here');
    }
  });
});

describe('logoutRegistrant', () => {
  const mockUserSessionReducer = (x = {}, action) => {
    if (action.type === LOG_OUT_REGISTRANT_SUCCESS) {
      return {
        ...x,
        regTypeId: action.payload?.regTypeId ?? '',
        persistRegType: action.payload?.persistRegType ?? false
      };
    }
    return x;
  };
  test('when experiement is ON and persisRegType is true should persist regType from userSession', async () => {
    const stateWithPersistRegTypeTrue = {
      ...state,
      experiments: {
        flexPersistRegType: true
      },
      userSession: {
        regTypeId: 'REG_TYPE_PRE_DEFINED_IN_QUERY_PARAM',
        persistRegType: true
      }
    };
    const store = createStoreWithMiddleware(
      combineReducers({
        website: (x = {}) => x,
        text: (x = {}) => x,
        regCartStatus: (x = {}) => x,
        clients: (x = {}) => x,
        registrantLogin: (x = {}) => x,
        event: (x = {}) => x,
        userSession: mockUserSessionReducer,
        defaultUserSession: (x = {}) => x,
        experiments: (x = {}) => x,
        timezones: (x = {}) => x
      }),
      stateWithPersistRegTypeTrue
    );

    try {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
      await store.dispatch(logoutRegistrant({}, true));
      expect(store.getState().userSession.regTypeId).toEqual('REG_TYPE_PRE_DEFINED_IN_QUERY_PARAM');
      expect(store.getState().userSession.persistRegType).toBeTruthy();
    } catch (error) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('it should not reach here');
    }
  });
  test('when experiement is ON and persisRegType is false should NOT persist regType from userSession', async () => {
    const stateWithPersistRegTypeFalse = {
      ...state,
      experiments: {
        flexPersistRegType: true
      },
      userSession: {
        regTypeId: 'REG_TYPE_SELECT_DURING_REGISTRATION_PROCESS',
        persistRegType: false
      }
    };
    const store = createStoreWithMiddleware(
      combineReducers({
        website: (x = {}) => x,
        text: (x = {}) => x,
        regCartStatus: (x = {}) => x,
        clients: (x = {}) => x,
        registrantLogin: (x = {}) => x,
        event: (x = {}) => x,
        userSession: mockUserSessionReducer,
        defaultUserSession: (x = {}) => x,
        experiments: (x = {}) => x,
        timezones: (x = {}) => x
      }),
      stateWithPersistRegTypeFalse
    );

    try {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
      await store.dispatch(logoutRegistrant({}, true));
      expect(store.getState().userSession.regTypeId).toEqual('');
      expect(store.getState().userSession.persistRegType).toBeFalsy();
    } catch (error) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('it should not reach here');
    }
  });
  test('when experiement is OFF and persisRegType is true should not persist regType from userSession', async () => {
    const stateWithPersistRegTypeTrue = {
      ...state,
      experiments: {
        flexPersistRegType: false
      },
      userSession: {
        regTypeId: 'REG_TYPE_PRE_DEFINED_IN_QUERY_PARAM',
        persistRegType: true
      }
    };
    const store = createStoreWithMiddleware(
      combineReducers({
        website: (x = {}) => x,
        text: (x = {}) => x,
        regCartStatus: (x = {}) => x,
        clients: (x = {}) => x,
        registrantLogin: (x = {}) => x,
        event: (x = {}) => x,
        userSession: mockUserSessionReducer,
        defaultUserSession: (x = {}) => x,
        experiments: (x = {}) => x,
        timezones: (x = {}) => x
      }),
      stateWithPersistRegTypeTrue
    );

    try {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 2.
      await store.dispatch(logoutRegistrant({}, true));
      expect(store.getState().userSession.regTypeId).toEqual('');
      expect(store.getState().userSession.persistRegType).toBeFalsy();
    } catch (error) {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
      jest.fail('it should not reach here');
    }
  });

  test(
    'verify user is not redirected to okta logout url when logoutRegistrant if url is not returned from logout ' +
      'endpoint',
    async () => {
      const stateWithoutOAuthLogoutUrl = {
        clients: {
          eventGuestClient: {
            logout: jest.fn(() => {})
          }
        }
      };

      const store = createStoreWithMiddleware(
        combineReducers({
          website: (x = {}) => x,
          text: (x = {}) => x,
          regCartStatus: (x = {}) => x,
          clients: (x = {}) => x,
          registrantLogin: (x = {}) => x,
          event: (x = {}) => x,
          userSession: mockUserSessionReducer,
          defaultUserSession: (x = {}) => x,
          experiments: (x = {}) => x,
          timezones: (x = {}) => x
        }),
        stateWithoutOAuthLogoutUrl
      );

      await store.dispatch(logoutRegistrant());
      expect(window.location.assign).toHaveBeenCalledTimes(0);
    }
  );

  test('verify user is redirected to okta logout url when logoutRegistrant if url is returned from logout endpoint', async () => {
    const logoutResponse = { oktaLogoutUrl: 'https://www.dummy-logout.com' };
    const getLogoutResponse = jest.fn();
    getLogoutResponse.mockReturnValue(
      new Promise(resolve => {
        return resolve(logoutResponse);
      })
    );

    const stateWithOAuthLogoutUrl = {
      clients: {
        eventGuestClient: {
          logout: getLogoutResponse
        }
      }
    };

    const store = createStoreWithMiddleware(
      combineReducers({
        website: (x = {}) => x,
        text: (x = {}) => x,
        regCartStatus: (x = {}) => x,
        clients: (x = {}) => x,
        registrantLogin: (x = {}) => x,
        event: (x = {}) => x,
        userSession: mockUserSessionReducer,
        defaultUserSession: (x = {}) => x,
        experiments: (x = {}) => x,
        timezones: (x = {}) => x
      }),
      stateWithOAuthLogoutUrl
    );

    await store.dispatch(logoutRegistrant());
    expect(window.location.assign).toHaveBeenCalledWith(logoutResponse.oktaLogoutUrl);
  });
});
