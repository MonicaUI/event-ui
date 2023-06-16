import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { ServiceError } from '@cvent/event-ui-networking';
import { beginNewRegistration, startAdminRegistration } from '../../routing/startRegistration';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { openEventAttendingFormatSwitchDialog, openPrivateEventErrorDialog } from '../../dialogs';
import { openKnownErrorDialog } from '../../dialogs/KnownErrorDialog';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;

function RegCartClient() {}

jest.mock('../../dialogs/KnownErrorDialog', () => ({
  openKnownErrorDialog: jest.fn(() => async () => {})
}));

jest.mock('../../dialogs', () => {
  const fn = jest.fn();
  return {
    ...jest.requireActual<$TSFixMe>('../../dialogs'),
    openPrivateEventErrorDialog: () => fn,
    openEventAttendingFormatSwitchDialog: () => fn
  };
});

jest.mock('../../clients/RegCartClient', () => {
  const { setIn } = jest.requireActual<$TSFixMe>('icepick');
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createRegCart = jest.fn((authToken, regCart) => {
    return {
      regCart: {
        ...regCart,
        regCartId: 'regCartId',
        eventRegistrations: setIn(
          regCart.eventRegistrations,
          ['00000000-0000-0000-0000-000000000001', 'registrationPathId'],
          'todoThisShouldBeRegPathId'
        ),
        eventSnapshotVersions: {
          [mockEventId]: 'eventSnapshotVersion'
        }
      },
      validationMessages: []
    };
  });
  return MockRegCartClient;
});

jest.mock('../../redux/capacity');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../../redux/capacity').loadAvailableCapacityCounts.mockImplementation(() => () => {});
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('shows first reg page and starts registration when going to a registration page', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'regProcessStep2',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
});

const initialState = {
  accessToken: '',
  userSession: {},
  defaultUserSession: {
    eventId
  },
  text: {
    translate: x => x
  },
  clients: {
    regCartClient: new RegCartClient()
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        registrationPath1: {
          id: 'registrationPath1',
          isDefault: true
        }
      }
    }
  },
  website: {
    pluginData: {
      eventWebsiteNavigation: {
        defaultPageId: 'page1'
      }
    },
    theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
  },
  pathInfo: {
    rootPath: '/',
    currentPageId: 'page2'
  },
  multiLanguageLocale: { locale: 'en-US' },
  event: { eventLocalesSetup: { eventLocales: [] } }
};

test('Opens the known error dialog when invalid source id error is thrown', async () => {
  const state = {
    ...initialState,
    registrationForm: {
      regCart: {
        embeddedRegistration: true,
        regCartId: ''
      }
    }
  };
  const store = mockStore(state);
  const regCartClient = store.getState().clients.regCartClient;
  regCartClient.createRegCart = jest.fn(async () => {
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
          unLocalizedInternalMessage: 'Source ID invalid for an Event {{eventId}}',
          localizationKey: 'REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","unLocalizedInternalMessage":"Source ID invalid for an Event {{eventId}}","localizationKey":"REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH","parametersMap":{"eventRegistrationId":"00000000-0000-0000-0000-000000000001"},"subValidationMessageList":[]}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  await store.dispatch(beginNewRegistration());
  expect(openKnownErrorDialog).toHaveBeenCalled();
});

test('Opens the known error dialog when privacy settings error is thrown', async () => {
  const store = mockStore(initialState);
  const regCartClient = store.getState().clients.regCartClient;
  regCartClient.createRegCart = jest.fn(async () => {
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
          unLocalizedInternalMessage:
            'Privacy Settings have been configured such that {{eventRegistrationId}} is not allowed to register',
          localizationKey: 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","unLocalizedInternalMessage":"Privacy Settings have been configured such that {{eventRegistrationId}} is not allowed to register","localizationKey":"REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED","parametersMap":{"eventRegistrationId":"00000000-0000-0000-0000-000000000001"},"subValidationMessageList":[]}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  await store.dispatch(beginNewRegistration());
  expect(openPrivateEventErrorDialog()).toHaveBeenCalled();
});

test('Opens the Registration Type Error modal when reg type error is thrown', async () => {
  const store = mockStore(initialState);
  const regCartClient = store.getState().clients.regCartClient;
  regCartClient.createRegCart = jest.fn(async () => {
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
          unLocalizedInternalMessage:
            'RegType {{regType}} invalid for an Event {{eventId}} for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.REGTYPE_INVALID_FOR_EVENT',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","unLocalizedInternalMessage":"RegType {{regType}} invalid for an Event {{eventId}} for EventRegistration {{eventRegistrationId}}.","localizationKey":"REGAPI.REGTYPE_INVALID_FOR_EVENT","parametersMap":{"eventRegistrationId":"00000000-0000-0000-0000-000000000001"},"subValidationMessageList":[]}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  await store.dispatch(beginNewRegistration());
  const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
  const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
  expect(openKnownErrorDialog).toHaveBeenCalledWith(subMessage, message, expect.any(Function));
});

test('Opens the Event Attending Format Switch Error modal when event attending format switch validation is thrown', async () => {
  const store = mockStore(initialState);
  const regCartClient = store.getState().clients.regCartClient;
  regCartClient.createRegCart = jest.fn(async () => {
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
          unLocalizedInternalMessage:
            'Registration not available as planner has initiated attending format switch for event: {{eventId}}',
          localizationKey: 'REGAPI.EVENT_ATTENDING_FORMAT_SWITCH_IN_PROGRESS',
          parametersMap: {
            eventId: '2cf59100-1155-459a-8a4c-46c4f6e3ae80'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","unLocalizedInternalMessage":"Registration not available as planner has initiated attending format switch for event: {{eventId}}","localizationKey":"REGAPI.EVENT_ATTENDING_FORMAT_SWITCH_IN_PROGRESS","parametersMap":{"eventId": "2cf59100-1155-459a-8a4c-46c4f6e3ae80"}}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  await store.dispatch(beginNewRegistration());
  expect(openEventAttendingFormatSwitchDialog()).toHaveBeenCalled();
});

test('Opens the Event Attending Format Switch Error modal when event attending format switch validation is thrown during admin reg', async () => {
  const store = mockStore(initialState);
  const regCartClient = store.getState().clients.regCartClient;
  regCartClient.createRegCart = jest.fn(async () => {
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
          unLocalizedInternalMessage:
            'Registration not available as planner has initiated attending format switch for event: {{eventId}}',
          localizationKey: 'REGAPI.EVENT_ATTENDING_FORMAT_SWITCH_IN_PROGRESS',
          parametersMap: {
            eventId: '2cf59100-1155-459a-8a4c-46c4f6e3ae80'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","unLocalizedInternalMessage":"Registration not available as planner has initiated attending format switch for event: {{eventId}}","localizationKey":"REGAPI.EVENT_ATTENDING_FORMAT_SWITCH_IN_PROGRESS","parametersMap":{"eventId": "2cf59100-1155-459a-8a4c-46c4f6e3ae80"}}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  await store.dispatch(startAdminRegistration());
  expect(openEventAttendingFormatSwitchDialog()).toHaveBeenCalled();
});

test('login Registrant should not be called when new planner reg and Secure Verification code as postRegistrationAuthType', async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const registrantLoginActions = require('../../redux/registrantLogin/actions');
  const spy = jest.spyOn(registrantLoginActions, 'loginRegistrant');
  await renderMainApp(
    {
      eventContext: {
        eventId,
        contactId: 'contactId',
        isPlanner: true
      },
      eventLaunchWizardSettings: '{}',
      accessToken: 'BEARER plannerRegModToken-from-html',
      plannerRegSettings: {
        exitUrl: '/fakeUrl'
      }
    },
    fakePath + 'PlannerRegistration/Flex/regProcessStep1',
    event => ({
      ...event,
      id: eventId,
      status: eventStatus.ACTIVE,
      eventSecuritySetupSnapshot: {
        postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
      }
    })
  );
  await wait(0);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(spy).not.toHaveBeenCalled();
});
