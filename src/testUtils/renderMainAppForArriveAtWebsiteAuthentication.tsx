import React from 'react';
import { mount } from 'enzyme';
import startAppRender from '../main';
import EventSnapshotClient from '../clients/EventSnapshotClient';
import RegCartClient from '../clients/RegCartClient';
import LookupClient from 'event-widgets/clients/LookupClient';
import CapacityClient from 'event-widgets/clients/CapacityClient';
import AppointmentsClient from 'event-widgets/clients/AppointmentsClient';
import EventGuestClient from '../clients/EventGuestClient';
import { startIntercepting, finishIntercepting } from 'react-dom';
import myHistory from '../myHistory';

jest.mock('event-widgets/redux/modules/text', () => {
  const translate = (resx, options = null) => (options ? `${resx}:${JSON.stringify(options)}` : resx);
  const initialState = {
    translate,
    translateWithDatatags: translate,
    translateDate(date) {
      return date.toISOString();
    },
    translateTime(date) {
      return date.toISOString();
    },
    locale: 'mock-locale',
    resolver: {
      registerTranslations: () => () => undefined
    }
  };
  const reducer = () => initialState;
  return reducer;
});
jest.mock('react-dom', () => {
  const ReactDOM = jest.requireActual<$TSFixMe>('react-dom');
  const realRender = ReactDOM.render;
  let interceptRenders = false;
  let interceptedComponents = [];
  ReactDOM.startIntercepting = () => {
    interceptRenders = true;
    interceptedComponents = [];
  };
  ReactDOM.finishIntercepting = () => {
    const result = interceptedComponents;
    interceptRenders = false;
    interceptedComponents = [];
    return result;
  };
  ReactDOM.render = (...args) => {
    if (interceptRenders) {
      interceptedComponents.push(args[0]);
      return;
    }
    return realRender(...args);
  };
  return ReactDOM;
});

jest.mock('../clients/EventSnapshotClient', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EventSnapshot = require('../../fixtures/EventSnapshotWithArriveAtWebsiteAuthentication.json');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EventTravelAirportsData = require('../../fixtures/travelAirportsData.json');
  EventSnapshot.eventSnapshot.version = 'eventSnapshotVersion';
  class MockEventSnapshotClient {
    static _eventModifier = x => x;
    async getEventSnapshot() {
      return MockEventSnapshotClient._eventModifier(EventSnapshot.eventSnapshot);
    }
    async getAccountSnapshot() {
      return EventSnapshot.accountSnapshot;
    }
    async getEventTravelAirports() {
      return EventTravelAirportsData;
    }
    async getEventTravelSnapshot() {
      return {};
    }
    static setEventModifier(f) {
      MockEventSnapshotClient._eventModifier = f;
    }
    async getVisibleProducts() {
      return {};
    }

    async getRegCartVisibleProducts() {
      return {};
    }
  }
  return MockEventSnapshotClient;
});
jest.mock('../clients/EventGuestClient');
jest.mock('../clients/EventEmailClient', () => {
  class MockEventEmailClient {
    async getSubscriptionStatus() {
      return {};
    }
    async setSubscriptionStatus() {
      return {};
    }
  }
  return MockEventEmailClient;
});
jest.mock('event-widgets/clients/LookupClient');
jest.mock('event-widgets/clients/CapacityClient');
jest.mock('event-widgets/clients/AppointmentsClient');
jest.mock('../clients/RegCartClient');
jest.mock('nucleus-core/dialog/Dialog', () => {
  // eslint-disable-next-line react/prop-types
  return ({ isOpen, header, children, actions }) => {
    return isOpen ? (
      <div className="mockNucleusCoreDialog">
        <h1>{header}</h1>
        <div>{children}</div>
        {actions && <div>{actions}</div>}
      </div>
    ) : null;
  };
});
jest.mock('nucleus-guestside-site/src/containers/Page', () => {
  // eslint-disable-next-line react/prop-types
  return ({ page }) => <div className="mockPage">{page.id}</div>;
});
jest.mock('nucleus-widgets/renderers/readOnlyContent', () => {
  // eslint-disable-next-line react/prop-types
  return ({ rootLayoutItemId }) => <div className="mockReadOnlyContent">{rootLayoutItemId}</div>;
});
jest.mock('@cvent/nucleus-remote-log-client', () => {
  class MockRemoteLogClient {
    debug() {}
    info() {}
    warn() {}
    error() {}
  }
  return MockRemoteLogClient;
});
// @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'localStorage' because it is a re... Remove this comment to see the full error message
window.localStorage = {
  getItem() {},
  setItem() {}
};
jest.mock('../myHistory', () => {
  const createHistory = jest.requireActual<$TSFixMe>('history').createMemoryHistory;
  return createHistory();
});
jest.mock('nucleus-widgets/utils/browserFeatureDetection', () => {
  return () => Promise.resolve(false);
});
function mockCodeSnippets() {
  window.CVENT = {};
  window.CVENT.runTriggerHandlers = jest.fn();
}

const fetchMockAssets = async clients => {
  return Promise.all([
    clients.eventSnapshotClient.getAccountSnapshot(),
    clients.eventSnapshotClient.getEventSnapshot(),
    clients.eventSnapshotClient.getEventTravelSnapshot(),
    clients.lookupClient.getTimezone(null, []),
    clients.lookupClient.getCurrencies(),
    clients.capacityClient.getCapacitySummaries(),
    clients.eventSnapshotClient.getEventTravelAirports(),
    clients.appointmentsClient.getApptEventDetails()
  ]);
};

export default async function renderMainApp(
  appSettings: $TSFixMe,
  startingPath: $TSFixMe,
  eventModifier: $TSFixMe
): Promise<$TSFixMe> {
  mockCodeSnippets();
  (EventSnapshotClient as $TSFixMe).setEventModifier(eventModifier);
  const mockClients = {
    eventSnapshotClient: new EventSnapshotClient(),
    lookupClient: new LookupClient(),
    regCartClient: new RegCartClient(),
    capacityClient: new CapacityClient(),
    appointmentsClient: new AppointmentsClient(),
    eventGuestClient: new EventGuestClient()
  };
  const [
    accountSnapshot,
    eventSnapshot,
    travelSnapshot,
    eventTimezoneResponse,
    currencyResponse,
    capacity,
    airportsResponse
  ] = await fetchMockAssets(mockClients);
  myHistory.push(startingPath);
  startIntercepting();

  await startAppRender(
    {
      ...appSettings,
      cultureCode: 'en',
      eventSnapshotVersion: 'eventSnapshotVersion',
      capacityIds: []
    },
    {
      clients: mockClients,
      assets: {
        accountSnapshot,
        eventSnapshot,
        travelSnapshot,
        eventTimezone: eventTimezoneResponse,
        currencies: currencyResponse.currencies,
        capacity,
        airports: airportsResponse.airports
      }
    },
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
    name
  );
  const [, mainAppComponent] = finishIntercepting();
  if (!mainAppComponent) {
    throw new Error('main did not render anything');
  }
  return mount(mainAppComponent);
}
