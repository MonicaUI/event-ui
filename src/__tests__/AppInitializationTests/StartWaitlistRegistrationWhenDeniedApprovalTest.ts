import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import * as eventClosedReason from 'event-widgets/clients/EventClosedReason';

jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createRegCart = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      // eslint-disable-line no-throw-literal
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION'
          }
        ]
      }
    };
  });
  MockRegCartClient.prototype.createWaitlistRegistrationCart = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      // eslint-disable-line no-throw-literal
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION',
            parametersMap: { inviteeStatus: 'DeniedApproval' }
          }
        ]
      }
    };
  });
  return MockRegCartClient;
});

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('starts waitlist registration when attemped to register a denied approval invitee', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}',
      experiments: '{}'
    },
    fakePath + 'register',
    event => ({
      ...event,
      status: eventStatus.CLOSED,
      closedReason: eventClosedReason.CAPACITY,
      eventFeatureSetup: {
        ...event.eventFeatureSetup,
        registrationProcess: {
          ...event.eventFeatureSetup.registrationProcess,
          eventWaitlist: true
        }
      }
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createWaitlistRegistrationCart).toHaveBeenCalled();
});
