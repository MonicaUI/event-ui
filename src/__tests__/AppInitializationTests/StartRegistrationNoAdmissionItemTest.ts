import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import RegCartClient from '../../clients/RegCartClient';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../dialogs/__mocks__/documentElementMock';
getMockedMessageContainer();

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;

jest.mock('../../clients/RegCartClient', () => {
  const { setIn } = jest.requireActual<$TSFixMe>('icepick');
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createRegCart = jest.fn((authToken, regCart) => {
    return {
      regCart: {
        ...regCart,
        regCartId: 'regCartId',
        eventRegistrations: setIn(
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

test('Shows the no admission item dialog, when creating a reg cart, if that validation is present', async () => {
  (RegCartClient.prototype.createRegCart as $TSFixMe).mockImplementation(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.ADMISSION_ITEM_EXACTLY_ONE'
          }
        ]
      }
    };
  });

  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      plannerRegSettings: {
        exitUrl: '/fakeUrl'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'regProcessStep1',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
