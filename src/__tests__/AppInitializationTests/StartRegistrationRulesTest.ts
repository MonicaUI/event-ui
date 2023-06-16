import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import RegCartClient from '../../clients/RegCartClient';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../dialogs/__mocks__/documentElementMock';
getMockedMessageContainer();

jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}

  MockRegCartClient.prototype.createRegCart = jest.fn((authToken, regCart) => {
    return Promise.resolve({ regCart: { ...regCart, regCartId: 'regCartId' }, validationMessages: [] });
  });
  return MockRegCartClient;
});
jest.mock('../../clients/EventGuestClient');

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const errorCode = 'REGAPI.CAPACITY_UNAVAILABLE';
test(`For error code ${errorCode} returned by createRegCart show event closed pop up `, async () => {
  (RegCartClient.prototype.createRegCart as $TSFixMe).mockImplementation(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: errorCode
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
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'regProcessStep1',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
});
