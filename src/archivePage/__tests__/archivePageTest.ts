import renderArchivePageMainApp from '../testUtils/renderArchivePageMainApp';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fakeEventId = '11111111-2222-3333-4444-555555555555';

describe('Rendering the main App for archived events', () => {
  it('shows published archived page when event with archived page data is archived', async () => {
    window.CVENT = {
      codeSnippets: {},
      codeSnippetsWithResolvedDatatags: {}
    };
    const archivedMainApp = await renderArchivePageMainApp(
      {
        defaultUserSession: { eventId: fakeEventId },
        eventContext: { isPlanner: true },
        cultureCode: 'en-US'
      },
      event => ({
        ...event,
        isArchived: true
      }),
      archivePage => ({
        ...archivePage,
        pages: {
          ...archivePage.pages,
          eventArchivePage: {
            ...archivePage.pages.eventArchivePage,
            title: 'Fake Event Archive Page Title'
          }
        },
        websitePassword: {}
      })
    );
    await wait(0);
    expect(archivedMainApp).toMatchSnapshot();
  });

  it('shows default archived page when event without archive page data is archived', async () => {
    window.CVENT = {
      codeSnippets: {},
      codeSnippetsWithResolvedDatatags: {}
    };
    const archivedMainApp = await renderArchivePageMainApp(
      {
        defaultUserSession: { eventId: fakeEventId },
        eventContext: { isPlanner: true },
        cultureCode: 'en-US'
      },
      event => ({
        ...event,
        isArchived: true
      }),
      archivePage => archivePage
    );
    await wait(0);
    expect(archivedMainApp).toMatchSnapshot();
  });

  it('shows published archived page when event is not planner/preview', async () => {
    window.CVENT = {
      codeSnippets: {},
      codeSnippetsWithResolvedDatatags: {}
    };
    const archivedMainApp = await renderArchivePageMainApp(
      {
        defaultUserSession: { eventId: fakeEventId },
        eventContext: {},
        cultureCode: 'en-US'
      },
      event => ({
        ...event,
        isArchived: true
      }),
      archivePage => ({
        ...archivePage,
        pages: {
          ...archivePage.pages,
          eventArchivePage: {
            ...archivePage.pages.eventArchivePage,
            title: 'Fake Event Archive Page Title'
          }
        },
        websitePassword: {}
      })
    );
    await wait(0);
    expect(archivedMainApp).toMatchSnapshot();
  });
});
