import { ServiceError } from '@cvent/event-ui-networking';
import { beginNewRegistration } from '../../routing/startRegistration';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { openPrivateEventErrorDialog, openEventStatusDialog } from '../../dialogs';
import { isWebsiteVarietyPage } from '../../redux/website';
import { getStartPageForCurrentRegPath } from '../../redux/actions';
import getStoreForTest from 'event-widgets/utils/testUtils';
import registrationFormReducer from '../../redux/registrationForm/reducer';

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;

const mockedVarietyPageValue = true;
jest.mock('../../redux/website', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website'),
    __esModule: true,
    isWebsiteVarietyPage: jest.fn()
  };
});
(isWebsiteVarietyPage as $TSFixMe).mockImplementation(() => mockedVarietyPageValue);

const regPageId = 'regProcessStep1';
jest.mock('../../redux/actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/actions'),
    getStartPageForCurrentRegPath: jest.fn()
  };
});
(getStartPageForCurrentRegPath as $TSFixMe).mockImplementation(() => async () => regPageId);

jest.mock('../../dialogs', () => {
  const fn = jest.fn();
  return {
    ...jest.requireActual<$TSFixMe>('../../dialogs'),
    openPrivateEventErrorDialog: () => fn,
    openEventStatusDialog: () => fn
  };
});

jest.mock('../../redux/capacity');
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('../../redux/capacity').loadAvailableCapacityCounts.mockImplementation(() => () => {});

const createRegCartMock = jest.fn();
const getMockReducer =
  ({ eventOverrides = {} }) =>
  (state, action) => {
    return {
      accessToken: '',
      userSession: {},
      defaultUserSession: {
        eventId
      },
      text: {
        translate: x => x
      },
      clients: {
        regCartClient: {
          createRegCart: createRegCartMock
        }
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
      registrationForm: registrationFormReducer(state.registrationForm, action),
      website: {
        pluginData: {
          eventWebsiteNavigation: {
            defaultPageId: 'page1',
            childIds: ['page1']
          }
        },
        theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
      },
      pathInfo: {
        rootPath: '/'
      },
      multiLanguageLocale: { locale: 'en-US' },
      event: { eventLocalesSetup: { eventLocales: [] }, ...eventOverrides }
    };
  };

const dummyEventRegId = '00000000-0000-0000-0000-000000000001';
const verifyRegCart = state => {
  const regCart = state.registrationForm.regCart;
  expect(regCart.regCartId).toBe('');
  expect(regCart.eventRegistrations[dummyEventRegId]).toBeTruthy();
  expect(regCart.eventRegistrations[dummyEventRegId].eventRegistrationId).toBe(dummyEventRegId);
};

test('Opens error dialog when privacy settings error is thrown and disables reg actions', async () => {
  const store = getStoreForTest(
    getMockReducer({
      eventOverrides: {
        isContainerEvent: true,
        containerFeatures: { isWebsiteEnabled: true, websiteStatus: 'WEBSITE_NOT_LIVE' }
      }
    }),
    {}
  );
  createRegCartMock.mockImplementation(async () => {
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
          localizationKey: 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","localizationKey":"REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED","parametersMap":{"eventRegistrationId":"00000000-0000-0000-0000-000000000001"},"subValidationMessageList":[]}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  const changePageMock = jest.fn();
  await store.dispatch(beginNewRegistration({ changePageOverride: changePageMock }));
  expect(openPrivateEventErrorDialog()).toHaveBeenCalled();
  verifyRegCart(store.getState());
  expect(store.getState().registrationForm.preventRegistration).toBeTruthy();
  expect(changePageMock).toHaveBeenCalledWith(regPageId);
});

test('Opens error dialog when event registration is closed and disables reg actions', async () => {
  const store = getStoreForTest(
    getMockReducer({
      eventOverrides: {
        isContainerEvent: true,
        containerFeatures: { isWebsiteEnabled: true, websiteStatus: 'WEBSITE_NOT_LIVE' }
      }
    }),
    {}
  );
  createRegCartMock.mockImplementation(async () => {
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
          localizationKey: 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","localizationKey":"REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION","parametersMap":{"eventRegistrationId":"00000000-0000-0000-0000-000000000001"},"subValidationMessageList":[]}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  const changePageMock = jest.fn();
  await store.dispatch(beginNewRegistration({ changePageOverride: changePageMock }));
  expect(openEventStatusDialog()).toHaveBeenCalled();
  verifyRegCart(store.getState());
  expect(store.getState().registrationForm.preventRegistration).toBeTruthy();
  expect(changePageMock).toHaveBeenCalledWith(regPageId);
});

test('Opens error dialog when capacity is unavailable and disables reg actions', async () => {
  const store = getStoreForTest(
    getMockReducer({
      eventOverrides: {
        isContainerEvent: true,
        containerFeatures: { isWebsiteEnabled: true, websiteStatus: 'WEBSITE_NOT_LIVE' }
      }
    }),
    {}
  );
  createRegCartMock.mockImplementation(async () => {
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
          localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          }
        }
      ],
      text: () =>
        '{"validationMessages":[{"severity":"Error","localizationKey":"REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE","parametersMap":{"eventRegistrationId":"00000000-0000-0000-0000-000000000001"},"subValidationMessageList":[]}]}'
    };
    throw await ServiceError.create('createRegCart failed', createResponse, request);
  });
  const changePageMock = jest.fn();
  await store.dispatch(beginNewRegistration({ changePageOverride: changePageMock }));
  expect(openEventStatusDialog()).toHaveBeenCalled();
  verifyRegCart(store.getState());
  expect(store.getState().registrationForm.preventRegistration).toBeTruthy();
  expect(changePageMock).toHaveBeenCalledWith(regPageId);
});
