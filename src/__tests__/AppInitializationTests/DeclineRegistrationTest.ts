import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const mockDeclineRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    regDecline: true,
    eventRegistrations: {
      'event-registrations-key': {
        confirmationNumber: 'fake-number',
        attendee: {
          attendeeId: 'fake-attendeeId',
          personalInformation: {
            emailAddress: 'fake-email-address'
          }
        },
        registrationPathId: 'todoThisShouldBeRegPathId'
      }
    }
  },
  validationMessages: []
};

jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.createDeclineRegistrationCart = jest.fn(() => mockDeclineRegCartResponse);
  return MockRegCartClient;
});

jest.mock('../../clients/EventPersonaClient', () => {
  function MockEventPersonaClient() {}
  MockEventPersonaClient.prototype.identifyInvitee = jest.fn(() => ({ inviteeStatus: 'Accepted' }));
  return MockEventPersonaClient;
});

test('declines and shows decline confirmation when visiting a decline link', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        inviteeId: 'fakeInviteeId'
      },
      eventLaunchWizardSettings: '{}'
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
