import React from 'react';
import { mount } from 'enzyme';
import { act } from '@testing-library/react';
import renderer from 'react-test-renderer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import {
  initializeFetchWithSessionTimeout,
  fetchWithSessionTimeout,
  SessionTimedOutError
} from '../SessionTimedOutDialog';
import dialogContainer, { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { wait } from '../../testUtils';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import EventGuestClient from '../../clients/EventGuestClient';
import { Provider } from 'react-redux';
import { logoutRegistrant } from '../../redux/registrantLogin/actions';
import { redirectToPage } from '../../redux/pathInfo';
import { hasAccessToWebsitePages } from '../../redux/selectors/event';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../__mocks__/documentElementMock';
getMockedMessageContainer();

jest.mock('../../clients/EventGuestClient');
jest.mock('../../redux/pathInfo', () => ({
  ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
  __esModule: true,
  redirectToPage: jest.fn(() => () => {})
}));
jest.mock('nucleus-core/containers/Transition');

let mockResponse;
jest.mock('@cvent/nucleus-networking', () => {
  return {
    ...jest.requireActual<$TSFixMe>('@cvent/nucleus-networking'),
    __esModule: true,
    fetchAndRetryIfServerBusy: () => mockResponse
  };
});
jest.mock('../../redux/website/selectors', () => ({
  ...jest.requireActual<$TSFixMe>('../../redux/website/selectors'),
  __esModule: true,
  isRegistrationPage: () => true
}));

jest.mock('../../redux/registrantLogin/actions', () => ({
  loginRegistrant: jest.fn(() => () => {}),
  logoutRegistrant: jest.fn(() => () => {})
}));

jest.mock('../../redux/selectors/event', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/selectors/event'),
    hasAccessToWebsitePages: jest.fn()
  };
});

const initialState = {
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  defaultUserSession: {
    isPlanner: false
  },
  pathInfo: {
    currentPageId: 'page1'
  },
  website: {
    theme: EventSnapshot.eventSnapshot.siteEditor.website.theme,
    pages: {
      postRegPage1: {
        id: 'postRegPage1',
        rootLayoutItemIds: ['id-3']
      },
      postRegPage2: {
        id: 'postRegPage2',
        rootLayoutItemIds: ['id-4']
      },
      confirmation: {
        id: 'confirmation',
        rootLayoutItemIds: ['temp-1469646842471']
      }
    },
    layoutItems: {
      'temp-1469646842471': {
        layout: {
          childIds: ['temp-1469646842439'],
          type: 'container'
        },
        id: 'temp-1469646842471'
      },
      'temp-1469646842439': {
        layout: {
          childIds: ['temp-1469646842440'],
          parentId: 'temp-1469646842471'
        },
        id: 'temp-1469646842439'
      },
      'temp-1469646842440': {
        layout: {
          childIds: ['row:241d35e0-d8d9-4860-b4e1-235616a2922a'],
          parentId: 'temp-1469646842439'
        },
        id: 'temp-1469646842440'
      },
      'row:241d35e0-d8d9-4860-b4e1-235616a2922a': {
        layout: {
          type: 'row',
          childIds: ['Video'],
          parentId: 'temp-1469646842440'
        },
        id: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
      },
      Video: {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
        },
        id: 'Video',
        widgetType: 'Video'
      }
    },
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          0: {
            pageIds: ['regProcessStep1', 'regProcessStep2'],
            id: 'todoThisShouldBeRegPathId',
            confirmationPageId: 'confirmation',
            postRegPageIds: ['confirmation'],
            registrationCancellationPageIds: ['registrationCancellationPage:bf70431d-16ee-49d2-aa19-6df2496f651c'],
            registrationDeclinePageIds: ['registrationDecline'],
            eventWaitlistPageIds: ['waitlistPage'],
            registrationPendingApprovalPageIds: ['registrationPendingApprovalPage'],
            registrationApprovalDeniedPageIds: ['registrationApprovalDeniedPage'],
            guestRegistrationPageIds: ['guestRegistrationPage:45a8c623-7f5f-487b-88c0-1fead8bdc785']
          }
        }
      }
    }
  },
  appData: EventSnapshot.eventSnapshot.siteEditor.eventData,
  clients: { eventGuestClient: new EventGuestClient() },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventReg1: {
          eventRegistrationId: 'eventReg1',
          confirmationNumber: 'CONF12345'
        }
      }
    }
  }
};

const stateWithPaymentWidget = {
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  defaultUserSession: {
    isPlanner: false
  },
  pathInfo: {
    currentPageId: 'websitePage:f5f1940b-980e-4398-96f6-3b681ef5e4a3'
  },
  website: {
    theme: EventSnapshot.eventSnapshot.siteEditor.website.theme,
    pages: {
      'websitePage:f5f1940b-980e-4398-96f6-3b681ef5e4a3': {
        id: 'websitePage:f5f1940b-980e-4398-96f6-3b681ef5e4a3',
        rootLayoutItemIds: ['container:d199794b-1c0d-405c-bc05-3ebcff6a8a45']
      }
    },
    layoutItems: {
      'container:d199794b-1c0d-405c-bc05-3ebcff6a8a45': {
        layout: {
          type: 'container',
          childIds: ['sectionRow:95b5c27c-4fa1-4df7-9599-6291ffc120ea'],
          parentId: null
        },
        id: 'container:d199794b-1c0d-405c-bc05-3ebcff6a8a45'
      },
      'sectionRow:95b5c27c-4fa1-4df7-9599-6291ffc120ea': {
        layout: {
          type: 'sectionRow',
          childIds: ['sectionColumn:d01326fc-7763-475f-8d8e-45f09632da35'],
          parentId: 'container:d199794b-1c0d-405c-bc05-3ebcff6a8a45'
        },
        id: 'sectionRow:95b5c27c-4fa1-4df7-9599-6291ffc120ea'
      },
      'sectionColumn:d01326fc-7763-475f-8d8e-45f09632da35': {
        layout: {
          type: 'sectionColumn',
          childIds: ['row:30ef1d2a-eea9-4f62-a016-dad718966b08'],
          parentId: 'sectionRow:95b5c27c-4fa1-4df7-9599-6291ffc120ea'
        },
        id: 'sectionColumn:d01326fc-7763-475f-8d8e-45f09632da35'
      },
      'row:30ef1d2a-eea9-4f62-a016-dad718966b08': {
        layout: {
          type: 'row',
          childIds: ['widget:b344f3ac-5d4c-41c4-84e1-700e2a6b5289'],
          parentId: 'sectionColumn:d01326fc-7763-475f-8d8e-45f09632da35'
        },
        id: 'row:30ef1d2a-eea9-4f62-a016-dad718966b08'
      },
      'widget:b344f3ac-5d4c-41c4-84e1-700e2a6b5289': {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'row:30ef1d2a-eea9-4f62-a016-dad718966b08'
        },
        id: 'widget:b344f3ac-5d4c-41c4-84e1-700e2a6b5289',
        widgetType: 'Fees'
      }
    },
    pluginData: {
      eventWebsiteNavigation: {
        childIds: ['websitePage:f5f1940b-980e-4398-96f6-3b681ef5e4a3']
      }
    }
  },
  appData: EventSnapshot.eventSnapshot.siteEditor.eventData,
  clients: { eventGuestClient: new EventGuestClient() },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventReg1: {
          eventRegistrationId: 'eventReg1',
          confirmationNumber: 'CONF12345'
        }
      }
    }
  }
};

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    plannerRegSettings: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    website: (x = {}) => x,
    registrationForm: (x = {}) => x,
    pathInfo: (x = {}) => x,
    appData: (x = {}) => x,
    clients: (x = {}) => x
  }),
  initialState
);

beforeEach(() => {
  store.dispatch(closeDialogContainer());
  (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
});

const createDialogAfterExpiration = async (modifiedStore = store) => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ 'Cvent-Session-Expiry': number... Remove this comment to see the full error message
  mockResponse = { headers: new Headers({ 'Cvent-Session-Expiry': 1 }) };
  initializeFetchWithSessionTimeout(modifiedStore);
  fetchWithSessionTimeout({});
  await wait(10);

  const dialog = modifiedStore.getState().dialogContainer.dialog;
  expect(dialog.isOpen).toBeTruthy();
  let mountedComponent;
  await act(async () => {
    mountedComponent = mount(<Provider store={modifiedStore}>{dialog.children}</Provider>);
    await wait(0);
  });
  return mountedComponent;
};

describe('SessionTimedOutDialog', () => {
  test('creates dialog after expiration time', async () => {
    const mountedComponent = await createDialogAfterExpiration();
    expect(mountedComponent).toMatchSnapshot();

    // Press the close button on the modal
    mountedComponent.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(logoutRegistrant).toBeCalled();
    expect(redirectToPage).toBeCalledWith('');
  });

  test('creates dialog after expiration time - on payment page', async () => {
    const modifiedStore = createStoreWithMiddleware(
      combineReducers({
        dialogContainer,
        text: (x = {}) => x,
        plannerRegSettings: (x = {}) => x,
        userSession: (x = {}) => x,
        defaultUserSession: (x = {}) => x,
        website: (x = {}) => x,
        registrationForm: (x = {}) => x,
        pathInfo: (x = {}) => x,
        appData: (x = {}) => x,
        clients: (x = {}) => x
      }),
      stateWithPaymentWidget
    );
    const mountedComponent = await createDialogAfterExpiration(modifiedStore);
    expect(mountedComponent).toMatchSnapshot();

    // Press the close button on the modal
    mountedComponent.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(logoutRegistrant).toBeCalled();
    expect(redirectToPage).toBeCalledWith('');
  });

  test('timeout dialog on closing redirects to /register path if website pages are not accessible', async () => {
    (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
    const mountedComponent = await createDialogAfterExpiration();

    // Press the close button on the modal
    mountedComponent.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(logoutRegistrant).toBeCalled();
    expect(redirectToPage).toBeCalledWith('register');
  });

  test('creates dialog after getting 401', async () => {
    mockResponse = { status: 401 };
    initializeFetchWithSessionTimeout(store);

    try {
      await fetchWithSessionTimeout({});
    } catch (ex) {
      // @ts-expect-error ts-migrate(2358) FIXME: The left-hand side of an 'instanceof' expression m... Remove this comment to see the full error message
      if (!ex instanceof SessionTimedOutError) {
        throw ex;
      }
    }
    await wait(10);

    const dialog = store.getState().dialogContainer.dialog;
    expect(dialog.isOpen).toBeTruthy();
    const dialogComponent = renderer.create(<Provider store={store}>{dialog.children}</Provider>);
    expect(dialogComponent).toMatchSnapshot();
  });
  test('suppress dialog after expiration time if Video widget dropped on postreg page', async () => {
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ 'Cvent-Session-Expiry': number... Remove this comment to see the full error message
    mockResponse = { headers: new Headers({ 'Cvent-Session-Expiry': 1 }) };
    store.getState().pathInfo.currentPageId = 'confirmation';
    initializeFetchWithSessionTimeout(store);

    fetchWithSessionTimeout({});
    await wait(10);

    const dialog = store.getState().dialogContainer.dialog;
    expect(dialog.isOpen).toBeFalsy();
    const dialogComponent = renderer.create(<Provider store={store}></Provider>);
    expect(dialogComponent).toMatchSnapshot();
  });
  test('creates dialog after getting 401 when Video widget dropped on PostReg page', async () => {
    mockResponse = { status: 401 };
    store.getState().pathInfo.currentPageId = 'confirmation';
    initializeFetchWithSessionTimeout(store);

    try {
      await fetchWithSessionTimeout({});
    } catch (ex) {
      // @ts-expect-error ts-migrate(2358) FIXME: The left-hand side of an 'instanceof' expression m... Remove this comment to see the full error message
      if (!ex instanceof SessionTimedOutError) {
        throw ex;
      }
    }
    await wait(10);

    const dialog = store.getState().dialogContainer.dialog;
    expect(dialog.isOpen).toBeTruthy();
    const dialogComponent = renderer.create(<Provider store={store}>{dialog.children}</Provider>);
    expect(dialogComponent).toMatchSnapshot();
  });
});
