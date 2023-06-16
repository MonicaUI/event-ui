/* eslint-env jest */
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { createRouteHandlers } from '../routeHandlers';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';
import getStoreForTest from 'event-widgets/utils/testUtils';
import registrationFormReducer from '../../redux/registrationForm/reducer';
import loadCookieConsent from '../loadCookieConsent';
import { EMBEDDED_REGISTRATION_ROOT } from '../../redux/pathInfo';
import { ServiceError } from '@cvent/event-ui-networking';
import { openKnownErrorDialog } from '../../dialogs/KnownErrorDialog';

jest.mock('../../redux/selectors/shared', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../../redux/selectors/shared'),
  shouldOpenSsoDialog: () => false
}));

const mockRestoreRegImpl = jest.fn();
jest.mock('../../redux/registrationForm/regCart', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../../redux/registrationForm/regCart'),
  restoreRegistration: jest.fn(() => {
    return async () => {
      mockRestoreRegImpl();
    };
  })
}));

const mockBeginNewRegistrationImpl = jest.fn(() => ({}));
jest.mock('../../routing/startRegistration', () => ({
  __esModule: true,
  beginNewRegistration: jest.fn(args => {
    return async () => {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      mockBeginNewRegistrationImpl(args);
    };
  })
}));

jest.mock('../../dialogs/KnownErrorDialog', () => {
  const fn = jest.fn();
  return {
    openKnownErrorDialog: () => fn
  };
});

const attendeeLoginClient = {
  authorize: jest.fn(() => {})
};

jest.mock('../../utils/confirmationUtil', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../../utils/confirmationUtil'),
  getConfirmationPageIdForInvitee: jest.fn(() => {
    return async () => {
      return 'confirmation:1234';
    };
  })
}));

window.scrollTo = () => {};

const identifyByContactId = jest.fn();
const EVENT_ID = 'the-event-id';
const ACCESS_TOKEN = 'the-access-token';
const CONTACT_ID = 'the-contact-id';
const REGCART_FOR_VERIFIED_CONTACT = { eventId: 'event-id', status: 'TRANSIENT' };
const mockedRegClientBehaviour = jest.fn(() => {
  const request = {
    headers: {
      HttpLogPageLoadId: 'HttpLogPageLoadId',
      HttpLogRequestId: 'HttpLogPageLoadId',
      get: () => {}
    }
  };
  const createResponse = {
    regCart: {},
    validationMessages: [
      {
        severity: 'Error',
        localizationKey: 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED'
      }
    ],
    text: () =>
      '{"validationMessages": [{"severity": "Error", "localizationKey": "REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED"}]}'
  };
  throw new ServiceError('RegModCart failed', createResponse, request, JSON.parse(createResponse.text()));
});

const getMockStore = (
  eventCode,
  verifiedAttendee = false,
  postRegistrationAuthType = PostRegistrationAuthType.CONFIRMATION_NUMBER_AND_EMAIL,
  googleAnalyticsSettings?,
  isEmbeddedReg = false
) => {
  if (verifiedAttendee) {
    identifyByContactId.mockReturnValue(
      Promise.resolve({
        regCart: REGCART_FOR_VERIFIED_CONTACT
      })
    );
  }
  const mockReducer = (state, action) => {
    return {
      ...state,
      registrationForm: registrationFormReducer(state.registrationForm, action)
    };
  };
  return getStoreForTest(mockReducer, {
    account: {
      settings: {
        accountSecuritySettings: {}
      }
    },
    clients: {
      attendeeLoginClient,
      regCartClient: {
        createRegModCart: mockedRegClientBehaviour,
        createCancelRegistrationCart: mockedRegClientBehaviour
      },
      eventGuestClient: {
        identifyByContactId,
        getRegistrationContent: jest.fn(() => {
          return { registrationPath: {} };
        })
      },
      productVisibilityClient: {
        getRegCartVisibleProducts: jest.fn()
      }
    },
    accessToken: ACCESS_TOKEN,
    appData: {
      registrationSettings: {
        registrationPaths: []
      }
    },
    website: {
      pluginData: {
        eventWebsiteNavigation: {
          defaultPageId: 'summary',
          disabledPageIds: []
        }
      },
      pages: {
        alreadyRegistered: {
          type: 'PAGE'
        },
        confirmation: {
          type: 'PAGE',
          rootLayoutItemIds: []
        }
      }
    },
    websitePassword: {
      isValidPassword: false
    },
    userSession: {
      eventCode,
      verifiedAttendee,
      contactId: verifiedAttendee ? CONTACT_ID : undefined,
      regCartId: verifiedAttendee ? 'stale-reg-cart-id' : undefined,
      inviteeId: verifiedAttendee ? 'inviteeId' : undefined
    },
    defaultUserSession: {
      eventId: EVENT_ID,
      isPlanner: false,
      isPreview: false
    },
    registrantLogin: { form: {} },
    event: {
      id: 5,
      isArchived: false,
      eventSecuritySetupSnapshot: {
        authenticationType: 0,
        authenticationLocation: '',
        authenticatedRegistrationPaths: '',
        postRegistrationAuthType
      },
      cultureCode: 'en-US',
      complianceSettings: {
        cookieBannerSettings: {
          showCookieBanner: true
        }
      },
      googleAnalyticsSettings
    },
    experiments: {
      flexTieCookieBannerToAnalyticsExperimentVariant: 1
    },
    pathInfo: {
      rootPath: isEmbeddedReg ? EMBEDDED_REGISTRATION_ROOT : '',
      currentPageId: 'summary'
    },
    isEmbeddedRegistration: isEmbeddedReg,
    text: {
      translate: () => {}
    },
    externalAuthentication: {
      arriveFromDialog: {}
    }
  });
};

afterEach(() => {
  attendeeLoginClient.authorize.mockClear();
});

test('Routing to register will begin a new registration for a known invitee', async () => {
  const store = getMockStore('eventCode', true);
  await createRouteHandlers(store).startRegistration(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {}
      }
    },
    store
  );
  expect(mockBeginNewRegistrationImpl).toHaveBeenCalled();
});

test('Routing to reg mod will throw a validation', async () => {
  const store = getMockStore('eventCode', true);
  await createRouteHandlers(store).modifyRegistration(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {}
      }
    },
    store
  );
  expect(openKnownErrorDialog()).toHaveBeenCalled();
});

test('Routing to cancel mod will throw a validation', async () => {
  const store = getMockStore('eventCode', true);
  await createRouteHandlers(store).cancelRegistration(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {}
      }
    },
    store
  );
  expect(openKnownErrorDialog()).toHaveBeenCalled();
});

test('Routing to register will begin a new registration for embedded registration', async () => {
  const store = getMockStore('eventCode', true, undefined, undefined, true);
  await createRouteHandlers(store).startRegistration(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {
          pageId: 'register'
        }
      }
    },
    store
  );
  expect(mockBeginNewRegistrationImpl).toHaveBeenLastCalledWith(
    expect.objectContaining({
      isEmbeddedRegistration: true
    })
  );
});

test('Routing to alreadyregistered will redirect to attendee login, if secure login is enabled', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);
  await createRouteHandlers(store).page(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {
          pageId: 'alreadyRegistered'
        },
        path: {}
      }
    },
    store,
    { isFirstRender: true }
  );
  expect(attendeeLoginClient.authorize).toHaveBeenCalled();
});

test('Routing to confirmationpage will reload regCart in state after login for verified attendee', async () => {
  const store = getMockStore('eventCode', true, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);
  const oldState = store.getState();

  // verify that old state doesn't have a regCart loaded
  expect(oldState.registrationForm.regCart.status).toBeFalsy();

  const routerContext = {
    history: {
      replace: () => {}
    },
    match: {
      params: {
        pageId: 'confirmationPage'
      },
      path: {}
    }
  };

  await createRouteHandlers(store).confirmationPage(routerContext, store, { isFirstRender: true });

  // verify that contact login was fired
  expect(identifyByContactId).toHaveBeenCalledWith(ACCESS_TOKEN, EVENT_ID, CONTACT_ID);

  // verify state was updated
  const newState = store.getState();
  expect(newState.registrationForm.regCart).toEqual({ ...REGCART_FOR_VERIFIED_CONTACT, regRetrieval: true });

  // verify stale regCart is not restored
  expect(mockRestoreRegImpl).toHaveBeenCalledTimes(0);
});

test('Routing to confirmationpage will redirect to right reg path confirmation page after login for verified attendee', async () => {
  const store = getMockStore('eventCode', true, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);

  const routerContext = {
    history: {
      replace: jest.fn(() => {})
    },
    match: {
      params: {
        pageId: 'confirmationPage'
      },
      path: {}
    }
  };

  await createRouteHandlers(store).confirmationPage(routerContext, store, { isFirstRender: true });
  // verify that it redirects to the right confirmation page
  expect(routerContext.history.replace).toHaveBeenCalledWith('confirmation:1234');
});

test('Routing to confirmationpage will reload regCart in state after login for verified attendee in a closed event', async () => {
  const store = getMockStore(
    'eventCode',
    true,
    PostRegistrationAuthType.SECURE_VERIFICATION_CODE,
    undefined,
    undefined,
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-5 arguments, but got 6.
    true
  );
  const oldState = store.getState();
  store.getState().experiments.isRouteToConfirmationEnabled = 1;
  store.getState().event.status = eventStatus.CLOSED;

  // verify that old state doesn't have a regCart loaded
  expect(oldState.registrationForm.regCart.status).toBeFalsy();

  const routerContext = {
    history: {
      replace: () => {}
    },
    match: {
      params: {
        pageId: undefined
      },
      path: '/event/eventStub/confirmationpage'
    }
  };

  await createRouteHandlers(store).confirmationPage(routerContext, store, { isFirstRender: true });

  // verify that contact login was fired
  expect(identifyByContactId).toHaveBeenCalledWith(ACCESS_TOKEN, EVENT_ID, CONTACT_ID);

  // verify state was updated
  const newState = store.getState();
  expect(newState.registrationForm.regCart).toEqual({ ...REGCART_FOR_VERIFIED_CONTACT, regRetrieval: true });

  // verify stale regCart is not restored
  expect(mockRestoreRegImpl).toHaveBeenCalledTimes(0);
});

test('Routing to confirmationpage will reload regCart in state after login for verified attendee in a completed event', async () => {
  const store = getMockStore(
    'eventCode',
    true,
    PostRegistrationAuthType.SECURE_VERIFICATION_CODE,
    undefined,
    undefined,
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1-5 arguments, but got 6.
    true
  );
  const oldState = store.getState();
  store.getState().experiments.isRouteToConfirmationEnabled = 1;
  store.getState().event.status = eventStatus.COMPLETED;

  // verify that old state doesn't have a regCart loaded
  expect(oldState.registrationForm.regCart.status).toBeFalsy();

  const routerContext = {
    history: {
      replace: () => {}
    },
    match: {
      params: {
        pageId: undefined
      },
      path: '/event/eventStub/confirmationpage'
    }
  };

  await createRouteHandlers(store).confirmationPage(routerContext, store, { isFirstRender: true });

  // verify that contact login was fired
  expect(identifyByContactId).toHaveBeenCalledWith(ACCESS_TOKEN, EVENT_ID, CONTACT_ID);

  // verify state was updated
  const newState = store.getState();
  expect(newState.registrationForm.regCart).toEqual({ ...REGCART_FOR_VERIFIED_CONTACT, regRetrieval: true });

  // verify stale regCart is not restored
  expect(mockRestoreRegImpl).toHaveBeenCalledTimes(0);
});

test('Routing to alreadyregistered will not redirect to attendee login if secure login is not enabled', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.CONFIRMATION_NUMBER_AND_EMAIL);
  await createRouteHandlers(store).page(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {
          pageId: 'alreadyRegistered'
        },
        path: {}
      }
    },
    store,
    { isFirstRender: true }
  );
  expect(attendeeLoginClient.authorize).not.toHaveBeenCalled();
});

test('code snippet for banner test', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);
  const codeSnippets = {};
  console.log = jest.fn();
  window.CVENT = {
    addTriggerHandlers(event, triggerHandler) {
      if (!codeSnippets[event]) {
        codeSnippets[event] = [];
      }
      codeSnippets[event].push(triggerHandler);
    },
    runTriggerHandlers(event) {
      if (codeSnippets[event] && codeSnippets[event].length > 0) {
        const handlers = codeSnippets[event];
        for (let i = 0; i < handlers.length; i++) {
          handlers[i]();
        }
      }
    }
  };
  window.CVENT.addTriggerHandlers('AllPages_Banner', () => {
    console.log('Working');
  });
  await createRouteHandlers(store).page(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {
          pageId: 'alreadyRegistered'
        },
        path: {}
      }
    },
    store,
    { isFirstRender: true }
  );
  expect(console.log).toHaveBeenCalled();
});

test('load cookie consent test with cookie banner disabled', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);
  const codeSnippets = {};
  console.log = jest.fn();
  window.CVENT = {
    addTriggerHandlers(event, triggerHandler) {
      if (!codeSnippets[event]) {
        codeSnippets[event] = [];
      }
      codeSnippets[event].push(triggerHandler);
    },
    runTriggerHandlers(event) {
      if (codeSnippets[event] && codeSnippets[event].length > 0) {
        const handlers = codeSnippets[event];
        for (let i = 0; i < handlers.length; i++) {
          handlers[i]();
        }
      }
    }
  };
  window.CVENT.addTriggerHandlers('AllPages_Banner', () => {
    console.log('Working');
  });
  window.CVENT.addTriggerHandlers('Initialization_Banner', () => {
    console.log('Initialization Banner');

    loadCookieConsent(store.dispatch, store.getState);

    expect(console.log).toHaveBeenCalledWith('Working');
    expect(console.log).toHaveBeenCalledWith('Initialization Banner');
  });
});

test('load cookie consent test with cookie banner enabled', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);

  const codeSnippets = {};
  console.log = jest.fn();
  window.CVENT = {
    addTriggerHandlers(event, triggerHandler) {
      if (!codeSnippets[event]) {
        codeSnippets[event] = [];
      }
      codeSnippets[event].push(triggerHandler);
    },
    runTriggerHandlers(event) {
      if (codeSnippets[event] && codeSnippets[event].length > 0) {
        const handlers = codeSnippets[event];
        for (let i = 0; i < handlers.length; i++) {
          handlers[i]();
        }
      }
    }
  };
  window.CVENT.addTriggerHandlers('AllPages_Banner', () => {
    console.log('Working');
  });

  window.CVENT.addTriggerHandlers('Initialization_Banner', () => {
    console.log('Initialization Banner');
  });
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'toMatchSnapshot' does not exist on type ... Remove this comment to see the full error message
  expect.toMatchSnapshot(loadCookieConsent(store.dispatch, store.getState));
});

test('google analytics test when googleAnalyticsSettings is undefined', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.SECURE_VERIFICATION_CODE);
  (window as $TSFixMe).ga = jest.fn();
  await createRouteHandlers(store).page(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {
          pageId: 'alreadyRegistered'
        },
        path: {}
      }
    },
    store,
    { isFirstRender: true }
  );
  expect((window as $TSFixMe).ga).toHaveBeenCalledTimes(2);
});

test('google analytics test when googleAnalyticsSettings is available', async () => {
  const store = getMockStore('eventCode', false, PostRegistrationAuthType.SECURE_VERIFICATION_CODE, {
    isDropGoogleAnalyticsToCookieBannerTied: true
  });
  store.dispatch({ type: 'UPDATE_ANALYTICS', payload: true });
  (window as $TSFixMe).ga = jest.fn();
  await createRouteHandlers(store).page(
    {
      history: {
        replace: () => {}
      },
      match: {
        params: {
          pageId: 'alreadyRegistered'
        },
        path: {}
      }
    },
    store,
    { isFirstRender: true }
  );
  expect((window as $TSFixMe).ga).toHaveBeenCalledTimes(0);
});
