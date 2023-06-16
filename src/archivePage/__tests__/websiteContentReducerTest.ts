import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import websiteContentReducer from '../websiteContentReducer';
import { transformAndLoadEventArchivedPageData } from '../actions';
import { loadEventSnapshotAndTransform } from '../../redux/actions';
import transformEventData from 'event-widgets/utils/transformEventData';
import { omit } from 'lodash';
import v1PageMigrations from 'nucleus-widgets/migrations/website/v1/pages';

const eventId = 'some-event-id';
const defaultArchivePagedTitle = 'EventSiteEditor_DefaultPageTitle_ArchivePage__resx';
const publishedArchivedPageTitle = 'Fake Archived Event Title';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultArchivePageData = require('../fixtures/defaultArchivePageData.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const EventSnapshot = require('../../../fixtures/EventSnapshot.json');

const getMockArchivePageDataResponse = isPublishedData => {
  return isPublishedData
    ? {
        ...defaultArchivePageData,
        pages: {
          eventArchivePage: {
            ...defaultArchivePageData.pages.eventArchivePage,
            title: publishedArchivedPageTitle
          }
        }
      }
    : defaultArchivePageData;
};

const getEventSnapshotResponse = isPublishedData => {
  return isPublishedData
    ? {
        ...EventSnapshot.eventSnapshot,
        siteEditor: {
          ...EventSnapshot.eventSnapshot.siteEditor,
          website: {
            ...EventSnapshot.eventSnapshot.siteEditor.website,
            pages: {
              ...EventSnapshot.eventSnapshot.siteEditor.website.pages,
              eventArchivePage: {
                ...defaultArchivePageData.pages.eventArchivePage,
                title: publishedArchivedPageTitle
              }
            },
            layoutItems: {
              ...EventSnapshot.eventSnapshot.siteEditor.website.layoutItems,
              ...defaultArchivePageData.layoutItems
            }
          }
        }
      }
    : omit(EventSnapshot.eventSnapshot, 'siteEditor.website.pluginData.eventArchivePageNavigation');
};

const getState = hasArchivePage => ({
  clients: {
    websiteContentClient: {
      getEventArchivePageData: jest.fn().mockReturnValue(getMockArchivePageDataResponse(hasArchivePage))
    },
    eventSnapshotClient: {
      getEventSnapshot: jest.fn().mockReturnValue(getEventSnapshotResponse(hasArchivePage))
    }
  },
  defaultUserSession: { eventId },
  account: EventSnapshot.accountSnapshot,
  appData: transformEventData(
    EventSnapshot.eventSnapshot.siteEditor.eventData,
    EventSnapshot.accountSnapshot,
    EventSnapshot.eventSnapshot,
    EventSnapshot.eventSnapshot.siteEditor.website
  )
});

let mockStoreWithArchivePage;
let mockStoreWithoutArchivePage;

beforeEach(() => {
  jest.clearAllMocks();
  const reducer = (state, action) => {
    return {
      ...state,
      website: websiteContentReducer(state.website, action)
    };
  };
  mockStoreWithArchivePage = createStore(reducer, getState(true), applyMiddleware(thunk));
  mockStoreWithoutArchivePage = createStore(reducer, getState(false), applyMiddleware(thunk));
});

describe('loadEventArchivePageData', () => {
  it('merges published archive page data into website for events with archive page data', async () => {
    await mockStoreWithArchivePage.dispatch(loadEventSnapshotAndTransform());
    const initialWebsite = mockStoreWithArchivePage.getState().website;
    initialWebsite.pages = v1PageMigrations(initialWebsite.pages);

    const eventArchivePageData = await mockStoreWithArchivePage
      .getState()
      .clients.websiteContentClient.getEventArchivePageData();

    // const eventArchivePageData = await mockStoreWithArchivePage.dispatch(loadEventArchivedPageData());
    mockStoreWithArchivePage.dispatch(transformAndLoadEventArchivedPageData(eventArchivePageData));

    const updatedWebsite = mockStoreWithArchivePage.getState().website;
    expect(updatedWebsite.pages.eventArchivePage.title).toEqual(publishedArchivedPageTitle);

    /*
     * right now, events with archive page data already have that data present in the snapshot
     * this is ensuring that the archive page reducer does not corrupt it
     * by inserting something that should not be inserted
     */
    expect(updatedWebsite).toEqual(initialWebsite);
  });

  it('merges default archive page data into website for events without archive page data', async () => {
    await mockStoreWithoutArchivePage.dispatch(loadEventSnapshotAndTransform());
    const initialWebsite = mockStoreWithoutArchivePage.getState().website;
    expect(initialWebsite.pages).not.toHaveProperty('eventArchivePage');
    expect(initialWebsite.pluginData).not.toHaveProperty('eventArchivePageNavigation');

    const eventArchivePageData = await mockStoreWithoutArchivePage
      .getState()
      .clients.websiteContentClient.getEventArchivePageData();
    // const eventArchivePageData = await mockStoreWithoutArchivePage.dispatch(loadEventArchivedPageData());
    mockStoreWithoutArchivePage.dispatch(transformAndLoadEventArchivedPageData(eventArchivePageData));

    const updatedWebsite = mockStoreWithoutArchivePage.getState().website;
    expect(updatedWebsite.pages).toHaveProperty('eventArchivePage');
    expect(updatedWebsite.pluginData).toHaveProperty('eventArchivePageNavigation');
    expect(updatedWebsite.pages.eventArchivePage.title).toEqual(defaultArchivePagedTitle);
  });
});
