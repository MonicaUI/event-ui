import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createDeclineRegistrationCart = jest.fn(() => {
    // eslint-disable-next-line no-throw-literal
    throw {
      // eslint-disable-line no-throw-literal
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION',
            parametersMap: { inviteeStatus: 'PendingApproval' }
          }
        ]
      }
    };
  });
  return MockRegCartClient;
});

test('shows already registered dialog when someone who is pending approval to decline', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        inviteeId: 'fakeInviteeId'
      },
      eventLaunchWizardSettings: '{}',
      experiments: '{}'
    },
    fakePath + 'decline',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createDeclineRegistrationCart).toHaveBeenCalled();
});
