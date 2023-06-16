import { stripInviteeFromUrl } from '../LogoutButtonWidget';

jest.mock('../../../redux/pathInfo', () => {
  return {
    getPagePath: jest.fn(() => 'url?MarketoID=marketo-id'),
    getCurrentPageId: jest.fn(() => 'summary'),
    isInviteeInUrl: jest.fn(() => false),
    routeToPage: jest.fn(),
    routeToUrl: jest.fn(),
    setNavigationDialogConfig: jest.fn()
  };
});
jest.mock('../../../redux/registrantLogin/actions');
jest.mock('../../../redux/selectors/currentRegistrant');
jest.mock('../../../redux/actions');
jest.mock('../../../redux/registrantLogin/actions');

import React from 'react';
import WebsiteNavigatorWidgetWrapper from '../WebsiteNavigatorWidget';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { Provider } from 'react-redux';
import WebsiteNavigatorWidget from 'nucleus-widgets/lib/WebsiteNavigator/WebsiteNavigatorWidget';
import { filterEventSnapshot } from '../../../redux/actions';
import { getCurrentPageId, getPagePath, routeToPage, routeToUrl } from '../../../redux/pathInfo';
import { logoutRegistrant } from '../../../redux/registrantLogin/actions';
import { isLoggedIn } from '../../../redux/selectors/currentRegistrant';
import EventGuestSideWidgetFactory from '../../../widgetFactory/index';
import { mount } from 'enzyme';
import LogoutButtonWidget from '../LogoutButtonWidget';
import ContainerlessButtonWidget from 'nucleus-widgets/lib/Button/ContainerlessButtonWidget';
import transformEventData from 'event-widgets/utils/transformEventData';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { setIn } from 'icepick';

const getState = (isPlanner = false, persona = {}, disablePostRegPageIds = false, isTestMode = false) => {
  const website = EventSnapshot.eventSnapshot.siteEditor.website;
  let eventWebsiteNavigation = website.pluginData.eventWebsiteNavigation;
  if (disablePostRegPageIds) {
    eventWebsiteNavigation = {
      defaultPageId: 'summary',
      // @ts-expect-error ts-migrate(2741) FIXME: Property '"postRegPages"' is missing in type '{}' ... Remove this comment to see the full error message
      navigationGroups: {},
      childIds: ['summary'],
      disabledPageIds: [],
      webLinkOnlyPageIds: []
    };
  }
  const updatedWebsite = setIn(website, ['pluginData', 'eventWebsiteNavigation'], eventWebsiteNavigation);
  return {
    website: updatedWebsite,
    event: EventSnapshot.eventSnapshot,
    appData: transformEventData(
      EventSnapshot.eventSnapshot.siteEditor.eventData,
      EventSnapshot.accountSnapshot,
      EventSnapshot.eventSnapshot,
      EventSnapshot.eventSnapshot.siteEditor.website
    ),
    pathInfo: {
      currentPageId: 'summary',
      rootPath: 'url'
    },
    widgetFactory: {
      loadMetaData: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadMetaData(x),
      loadComponent: x => (new EventGuestSideWidgetFactory() as $TSFixMe).loadComponent(x)
    },
    text: {
      translate: value => value,
      resolver: {
        fetchAllDataTags: value => value
      }
    },
    userSession: {},
    defaultUserSession: {
      isPlanner,
      isTestMode
    },
    eventSnapshotVersion: 'dummy_event_snapshot_version',
    registrationForm: {
      regCart: {
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'todoThisShouldBeRegPathId'
          }
        }
      }
    },
    persona
  };
};

const config = {
  shared: {
    pageLinksArrangement: 'HORIZONTAL',
    logo: {
      altText: '',
      asset: {},
      hyperlink: ''
    },
    logoutButton: {
      display: true,
      text: 'WebsiteNavigatorWidget_LogoutButtonText_default__resx'
    },
    registerButton: {
      alreadyRegisteredLink: {
        display: false,
        text: 'WebsiteNavigatorWidget_AlreadyRegisteredLinkText_default__resx'
      },
      display: true,
      text: '_registerNowWidget_textConfig__resx'
    }
  }
};

async function dispatch(action) {
  if (typeof action === 'function') {
    return await action(dispatch, getState);
  }
}
const subscribe = () => {};
const store = { dispatch, subscribe, getState };
const props = {
  config,
  type: 'WebsiteNavigator',
  translate: (resx, options) => (options ? `${resx}:${JSON.stringify(options)}` : resx),
  style: EventSnapshot.eventSnapshot.siteEditor.website.theme.global,
  classes: {},
  id: 'widget:3c9b810e-05ef-444b-a5a9-a0e60b2a961d'
};

const stateWithUserText = {
  ...getState(),
  localizedUserText: {
    currentLocale: 'es-ES',
    localizations: {
      'es-ES': {
        'website.pages.summary.name': 'Summary name'
      }
    }
  }
};

const storeWithUserText = { dispatch, subscribe, getState: () => stateWithUserText };

describe('WebsiteNavigatorWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('navigates to page', async () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => false);
    const wrapper = mount(<WebsiteNavigatorWidgetWrapper {...props} store={store} />);
    const widget = wrapper.find(WebsiteNavigatorWidget);
    await widget.props().navigateToPage('summary');
    expect(routeToPage).toHaveBeenCalledWith('summary');
  });
  test('when user is not logged in it renders', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => false);
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={store}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });
  test('when user is logged in it renders', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => true);
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={store}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });
  test('when user is logged in with pending approval status', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => true);
    const newStore = {
      dispatch,
      subscribe,
      getState: () =>
        getState(false, {
          inviteeStatus: InviteeStatus.PendingApproval
        })
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={newStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });
  test('when user is logged in with approval denied status', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => true);
    const newStore = {
      dispatch,
      subscribe,
      getState: () =>
        getState(false, {
          inviteeStatus: InviteeStatus.DeniedApproval
        })
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={newStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });

  async function logout() {
    (isLoggedIn as $TSFixMe).mockImplementation(() => true);
    const component = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={store}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ config: { display: boolean; text: string; ... Remove this comment to see the full error message */}
        <LogoutButtonWidget {...props} config={config.shared.logoutButton} />
      </Provider>
    );
    const widget = component.find(ContainerlessButtonWidget);
    await widget.props().clickHandler(props);
  }

  test('Check if registrant logout is initiated when user clicks on logout button', async () => {
    await logout();
    expect(logoutRegistrant).toHaveBeenCalled();
    expect(routeToUrl).toHaveBeenCalled();
    expect(filterEventSnapshot).toHaveBeenCalled();
  });
  test('Check if registrant logout is initiated when user clicks on logout button and isInviteeRedirectedToOktaLogoutUrl is set to true', async () => {
    (logoutRegistrant as $TSFixMe).mockImplementation(() => () => true);
    await logout();
    expect(logoutRegistrant).toHaveBeenCalled();
    expect(routeToUrl).not.toHaveBeenCalled();
  });
  test('Check if registrant logout is initiated when user clicks on logout button and isInviteeRedirectedToOktaLogoutUrl is set to false', async () => {
    (logoutRegistrant as $TSFixMe).mockImplementation(() => () => false);
    await logout();
    expect(logoutRegistrant).toHaveBeenCalled();
    expect(routeToUrl).toHaveBeenCalled();
  });
  test('Check on registrant logout, defaultPageId for defaultRegType is used', async () => {
    (logoutRegistrant as $TSFixMe).mockImplementation(() => () => false);
    (getCurrentPageId as $TSFixMe).mockImplementation(() => 'confirmation');
    const updatedDefaultPageId = 'summary2';
    (filterEventSnapshot as $TSFixMe).mockImplementation(() => {
      getState().website.pluginData.eventWebsiteNavigation.defaultPageId = updatedDefaultPageId;
    });
    await logout();
    expect(filterEventSnapshot).toHaveBeenCalled();
    expect(getPagePath).toHaveBeenCalledWith(expect.anything(), updatedDefaultPageId);
  });
  test('does not renders when it is planner mode', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => false);
    const newStore = { dispatch, subscribe, getState: () => getState(true) };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={newStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });
  test(`that it does not fall over with null ptr exceptions when a re-render is caused by login actions,
    but the post reg content hasn't been loaded yet`, () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => true);
    const newStore = { dispatch, subscribe, getState: () => getState(false, {}, true) };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={newStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });
  test('renders when userText has data and currentLocaleId is set', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => false);
    (getCurrentPageId as $TSFixMe).mockImplementation(() => 'summary');
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={storeWithUserText}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.find('WebsiteNavigator').first()).toMatchSnapshot();
  });
  test('Check if marketo query params are removed after logout is initiated', async () => {
    const pathUrl = 'url?MarketoID=marketo-id';
    const strippedURL = 'url';
    expect(stripInviteeFromUrl(pathUrl)).toEqual(strippedURL);
  });
  test('Check if eloqua query params are removed after logout is initiated', async () => {
    const pathUrl = 'url?EloquaID=eloqua-id';
    const strippedURL = 'url';
    expect(stripInviteeFromUrl(pathUrl)).toEqual(strippedURL);
  });
  function registerNowWidgetNotVisibleOnGivenPage(pageId) {
    (isLoggedIn as $TSFixMe).mockImplementation(() => false);
    (getCurrentPageId as $TSFixMe).mockImplementation(() => pageId);
    const newStore = {
      dispatch,
      subscribe,
      getState: () => getState(false, {}, false, true)
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={newStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.containsMatchingElement(<span className="">_registerNowWidget_textConfig__resx</span>)).toBeFalsy();
  }
  test('Register now button is not visible if current page is optInOut in testMode', () => {
    registerNowWidgetNotVisibleOnGivenPage('optInOut');
  });
  test('Register now button is not visible if current page is unsubscribeSubscribe in testMode', () => {
    registerNowWidgetNotVisibleOnGivenPage('unsubscribeSubscribe');
  });
  test('Register now button is not visible in container events if website is off', () => {
    const containerEventStore = {
      dispatch,
      subscribe,
      getState: () => ({
        ...stateWithUserText,
        event: {
          ...stateWithUserText.event,
          isContainerEvent: true,
          containerFeatures: { isWebsiteEnabled: false }
        }
      })
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={containerEventStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.containsMatchingElement(<span className="">_registerNowWidget_textConfig__resx</span>)).toBeFalsy();
  });
  test('Register now button is not visible in container events if registration is off', () => {
    const containerEventStore = {
      dispatch,
      subscribe,
      getState: () => ({
        ...stateWithUserText,
        event: {
          ...stateWithUserText.event,
          isContainerEvent: true,
          containerFeatures: { isRegistrationEnabled: false }
        }
      })
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={containerEventStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.containsMatchingElement(<span className="">_registerNowWidget_textConfig__resx</span>)).toBeFalsy();
  });
  test('Website pages are not visible in container events if website is off', () => {
    const containerEventStore = {
      dispatch,
      subscribe,
      getState: () => ({
        ...stateWithUserText,
        event: {
          ...stateWithUserText.event,
          isContainerEvent: true,
          containerFeatures: { isRegistrationEnabled: true, isWebsiteEnabled: false }
        }
      })
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={containerEventStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.contains('_defaultPageTitle_summary__resx')).toBeFalsy();
  });

  test('Post reg pages are visible in container events even if website is off', () => {
    (isLoggedIn as $TSFixMe).mockImplementation(() => true);
    (getCurrentPageId as $TSFixMe).mockImplementation(() => 'confirmation');
    const containerEventStore = {
      dispatch,
      subscribe,
      getState: () => ({
        ...stateWithUserText,
        event: {
          ...stateWithUserText.event,
          isContainerEvent: true,
          containerFeatures: { isRegistrationEnabled: true, isWebsiteEnabled: false }
        }
      })
    };
    const widget = mount(
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <Provider store={containerEventStore}>
        <WebsiteNavigatorWidgetWrapper {...props} />
      </Provider>
    );
    expect(widget.contains('_defaultPageTitle_summary__resx')).toBeFalsy();
    expect(widget.contains('_pageManagement_postRegSectionHeader__resx')).toBeTruthy();
  });
});
