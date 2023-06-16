jest.mock('../../clients/EventSnapshotClient');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const eventSnapshotClient = require('../../clients/EventSnapshotClient').default.prototype;

import { loadEventSnapshotAndTransform } from '../actions';

import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import reducer from '../reducer';

const { accountSnapshot } = EventSnapshot;
const eventSnapshotVersion = 'fIQoY_yI8DDWAUEtQw69TRSXXqKFSabH';
const eventSnapshot = { ...EventSnapshot.eventSnapshot, version: eventSnapshotVersion };

const accessToken = '';

import transformEventSnapshot from 'event-widgets/utils/transformEventSnapshot';
import transformEventData from 'event-widgets/utils/transformEventData';
import transformWebsite from 'event-widgets/utils/transformWebsite';

import { LOAD_EVENT_SNAPSHOT } from '../actionTypes';

function getState() {
  return {
    accessToken,
    clients: {
      eventSnapshotClient
    },
    event: {
      eventFeatureSetup: {
        fees: {
          fees: true
        }
      },
      products: EventSnapshot.eventSnapshot.products,
      id: EventSnapshot.eventSnapshot.id
    },
    account: accountSnapshot,
    appData: transformEventData(
      EventSnapshot.eventSnapshot.siteEditor.eventData,
      EventSnapshot.accountSnapshot,
      EventSnapshot.eventSnapshot,
      EventSnapshot.eventSnapshot.siteEditor.website
    ),
    registrationForm: {
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart: {
        regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
        status: 'INPROGRESS',
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'todoThisShouldBeRegPathId'
          }
        }
      }
    }
  };
}

let mockStore;

const createLoadEventSnapshotAction = async (eventSnapshotData, accountSnapshotData) => {
  const { siteEditor } = eventSnapshotData;
  const event = transformEventSnapshot(eventSnapshotData);
  return {
    type: LOAD_EVENT_SNAPSHOT,
    payload: {
      event,
      version: eventSnapshotData.version,
      appData: transformEventData(siteEditor.eventData, accountSnapshotData, event, siteEditor.website),
      website: await transformWebsite(siteEditor.website, accountSnapshotData)
    }
  };
};

beforeEach(() => {
  mockStore = createStore(reducer, getState(), applyMiddleware(thunk));
  eventSnapshotClient.initialize();
  // before loading the event snapshot, the property 'eventSnapshotVersion' in the state should be 'undefined'
  // eslint-disable-next-line jest/no-standalone-expect
  expect(mockStore.getState()).toHaveProperty('eventSnapshotVersion');
  // eslint-disable-next-line jest/no-standalone-expect
  expect(mockStore.getState().eventSnapshotVersion).not.toBeDefined();
});

test('verify eventSnapshotVersion in store', async () => {
  mockStore.dispatch(await createLoadEventSnapshotAction(eventSnapshot, accountSnapshot));
  expect(mockStore.getState()).toHaveProperty('eventSnapshotVersion');
  expect(mockStore.getState().eventSnapshotVersion).toBeDefined();
  expect(mockStore.getState().eventSnapshotVersion).toBe(eventSnapshotVersion);
});

test('verify loadEventSnapshotAndTransform from actions module', async () => {
  await mockStore.dispatch(loadEventSnapshotAndTransform(eventSnapshotVersion));
  expect(mockStore.getState()).toHaveProperty('eventSnapshotVersion');
  expect(mockStore.getState().eventSnapshotVersion).toBeDefined();
  expect(mockStore.getState().eventSnapshotVersion).toBe(eventSnapshotVersion);
});

test('verify loadEventSnapshotAndTransform (lastest) from actions module', async () => {
  await mockStore.dispatch(loadEventSnapshotAndTransform(null));
  expect(mockStore.getState()).toHaveProperty('eventSnapshotVersion');
  expect(mockStore.getState().eventSnapshotVersion).toBeDefined();
  expect(mockStore.getState().eventSnapshotVersion).toBe(eventSnapshotClient.getLatestEventSnapshot().version);
});
