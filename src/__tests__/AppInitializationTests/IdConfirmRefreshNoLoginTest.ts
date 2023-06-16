import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

const eventId = EventSnapshot.eventSnapshot.id;
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regMod: false,
    eventSnapshotVersions: {
      [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
    },
    eventRegistrations: {
      'event-registrations-key': {
        confirmationNumber: 'fake-number',
        attendee: {
          attendeeId: 'fake-attendeeId',
          personalInformation: {
            emailAddress: 'fake-email-address'
          }
        }
      },
      registrationPathId: 'registrationPathId'
    }
  },
  validationMessages: []
};
jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.identifyByConfirm = jest.fn(() => mockConfirmedRegCartResponse);
  MockRegCartClient.prototype.getRegCart = jest.fn(() => mockConfirmedRegCartResponse.regCart);
  MockRegCartClient.prototype.getCapacitySummaries = () => Promise.resolve({});
  return MockRegCartClient;
});
jest.mock('../../clients/EventPersonaClient', () => {
  function MockEventPersonaClient() {}
  MockEventPersonaClient.prototype.identifyInvitee = jest.fn(() => ({ inviteeStatus: 'Accepted' }));
  return MockEventPersonaClient;
});

test('verify id confirmation is NOT called when confirmation number, email and invitee is present with regcartid', async () => {
  jest.clearAllMocks();
  await renderMainApp(
    {
      eventContext: {
        eventId,
        confirmationNumber: 'fake-confirmation-number',
        emailAddress: 'd',
        inviteeId: 's',
        regCartId: 'some'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'summary',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.identifyByConfirm).not.toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/EventPersonaClient').prototype.identifyInvitee).not.toHaveBeenCalled();
});
