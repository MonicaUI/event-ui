import React from 'react';
import { mount } from 'enzyme';
import startArchivedEventAppRender from '../main';
import WebsiteContentClient from '../../clients/WebsiteContentClient';
import EventSnapshotClient from '../../clients/EventSnapshotClient';
import LookupClient from 'event-widgets/clients/LookupClient';
import { startIntercepting, finishIntercepting } from 'react-dom';
import { act } from '@testing-library/react';

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
jest.mock('../../clients/EventSnapshotClient', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const EventSnapshot = require('../../../fixtures/EventSnapshot.json');
  class MockEventSnapshotClient {
    static _eventSnapshotModifier = x => x;
    async getEventSnapshot() {
      return EventSnapshot.eventSnapshot;
    }
    async getAccountSnapshot() {
      return EventSnapshot.accountSnapshot;
    }
    static setEventModifier(f) {
      MockEventSnapshotClient._eventSnapshotModifier = f;
    }
  }
  return MockEventSnapshotClient;
});
jest.mock('../../clients/WebsiteContentClient', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const defaultArchivePageData = require('../fixtures/defaultArchivePageData.json');

  class MockWebsiteContentClient {
    static _archivePageDataModifier = x => x;
    async getEventArchivePageData() {
      return MockWebsiteContentClient._archivePageDataModifier(defaultArchivePageData);
    }
    static setArchivePageDataModifier(f) {
      MockWebsiteContentClient._archivePageDataModifier = f;
    }
  }
  return MockWebsiteContentClient;
});
jest.mock('event-widgets/clients/LookupClient');
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

const fetchMockAssets = async clients => {
  return Promise.all([
    clients.eventSnapshotClient.getAccountSnapshot(),
    clients.eventSnapshotClient.getEventSnapshot(),
    clients.lookupClient.getTimezone(null, []),
    clients.websiteContentClient.getEventArchivePageData()
  ]);
};

export default async function renderArchivePageMainApp(
  appSettings: $TSFixMe,
  eventModifier: $TSFixMe,
  websiteContentModifier: $TSFixMe
): Promise<$TSFixMe> {
  let result;
  await act(async () => {
    (EventSnapshotClient as $TSFixMe).setEventModifier(eventModifier);
    (WebsiteContentClient as $TSFixMe).setArchivePageDataModifier(websiteContentModifier);
    const mockClients = {
      eventSnapshotClient: new EventSnapshotClient(),
      lookupClient: new LookupClient(),
      websiteContentClient: new WebsiteContentClient()
    };
    const [accountSnapshot, eventSnapshot, eventTimezoneResponse, eventArchivePageData] = await fetchMockAssets(
      mockClients
    );
    startIntercepting();
    await startArchivedEventAppRender(
      appSettings,
      {
        clients: mockClients,
        assets: {
          accountSnapshot,
          eventSnapshot,
          eventTimezone: eventTimezoneResponse,
          eventArchivePageData
        }
      },
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
      name
    );
    const [, mainAppComponent] = finishIntercepting();
    if (!mainAppComponent) {
      throw new Error('main did not render anything');
    }
    result = mount(mainAppComponent);
  });
  return result;
}
