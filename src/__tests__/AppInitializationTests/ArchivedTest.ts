import renderMainApp from '../../testUtils/renderMainApp';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('shows archived page when event is archived', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath,
    event => ({
      ...event,
      isArchived: true,
      siteEditor: {
        ...event.siteEditor,
        website: {
          ...event.siteEditor.website,
          pages: {
            ...event.siteEditor.website.pages,
            eventArchivePage: {
              id: 'eventArchivePage',
              templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4',
              rootLayoutItemIds: []
            }
          },
          pluginData: {
            ...event.siteEditor.website.pluginData,
            eventArchivePageNavigation: {
              defaultPageId: 'eventArchivePage',
              templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
            }
          }
        }
      }
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
