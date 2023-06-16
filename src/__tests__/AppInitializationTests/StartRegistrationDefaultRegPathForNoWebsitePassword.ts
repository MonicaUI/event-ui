import renderMainApp from '../../testUtils/renderMainAppForNoPassword';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { updateIn } from 'icepick';

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;

jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createRegCart = jest.fn((authToken, regCart) => {
    return {
      regCart: {
        ...regCart,
        regCartId: 'regCartId',
        eventRegistrations: jest
          .requireActual<$TSFixMe>('icepick')
          .setIn(
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

test('shows first reg page when coming in without reg type', async () => {
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
      status: eventStatus.ACTIVE,
      siteEditor: {
        website: {
          ...event.siteEditor.website,
          pluginData: updateIn(
            event.siteEditor.website.pluginData,
            ['registrationProcessNavigation', 'registrationPaths'],
            regPaths => ({
              todoThisShouldBeRegPathId: regPaths.todoThisShouldBeRegPathId,
              regPath2: {
                ...regPaths.todoThisShouldBeRegPathId,
                id: 'regPath2',
                pageIds: regPaths.todoThisShouldBeRegPathId.pageIds.map(id => id + ':regPath2')
              }
            })
          ),
          pages: {
            ...event.siteEditor.website.pages,
            'regProcessStep1:regPath2': {
              id: 'regProcessStep1:regPath2',
              name: '_defaultPageTitle_regProcessStep1__resx',
              title: '_defaultPageTitle_regProcessStep1__resx',
              version: 1,
              rootLayoutItemIds: ['id-3'],
              type: 'PAGE',
              templateId: 'template:a61a64b8-ecd4-464b-848e-c0ebe08026e4'
            }
          }
        },
        eventData: updateIn(event.siteEditor.eventData, ['registrationSettings', 'registrationPaths'], regPaths => [
          regPaths[0],
          {
            ...regPaths[0],
            id: 'regPath2',
            isDefault: false
          }
        ])
      },
      eventLocalesSetup: { eventLocales: [] }
    })
  );
  await wait(0);
  mainApp.update();
  expect(mainApp.find('PageRenderer').props().page.id).toBe('regProcessStep1');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
});
