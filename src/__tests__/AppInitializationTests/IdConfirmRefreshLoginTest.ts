import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { PostRegistrationAuthType } from 'event-widgets/utils/postRegistrationAuthType';

const eventId = EventSnapshot.eventSnapshot.id;
const fakePath = `/${eventId}/`;
const eventRegistrationId = '11111111-1111-1111-1111-111111111111';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regMod: true,
    eventSnapshotVersions: {
      [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
    },
    eventRegistrations: {
      [eventRegistrationId]: {
        registrationTypeId: 'regTypeId',
        registrationPathId: 'regPathId',
        sessionWaitlists: {},
        attendeeType: 'ATTENDEE'
      }
    }
  },
  validationMessages: []
};

const mockRegistrationProcess = {
  registrationPathId: 'regPathId',
  pageVariety: 'REGISTRATION',
  pageIds: [],
  pages: {},
  layoutItems: {},
  registrationPath: {
    id: 'regPathId',
    registrationPageFields: [],
    modification: {}
  }
};
jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.getRegCart = jest.fn(() => mockConfirmedRegCartResponse.regCart);
  MockRegCartClient.prototype.identifyByConfirm = jest.fn(() => mockConfirmedRegCartResponse);
  return MockRegCartClient;
});
jest.mock('../../clients/EventGuestClient', () => {
  function MockEventGuestClient() {}
  MockEventGuestClient.prototype.identifyByContactId = jest.fn(() => mockConfirmedRegCartResponse);
  MockEventGuestClient.prototype.getWebsiteContent = jest.fn(() => Promise.resolve({}));
  MockEventGuestClient.prototype.getRegistrationContent = jest.fn(() => mockRegistrationProcess);
  return MockEventGuestClient;
});

test('verify id confirmation is called when confirmation number, email and invitee is present without regcartid', async () => {
  jest.clearAllMocks();
  await renderMainApp(
    {
      eventContext: {
        eventId,
        confirmationNumber: 'fake-confirmation-number',
        emailAddress: 'd',
        inviteeId: 's'
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
  expect(require('../../clients/RegCartClient').prototype.identifyByConfirm).toHaveBeenCalled();
});

test('Verify that endpoint to get a reg cart by contact id is called when attendee is already logged in and reloads the page, and event is using secure code verification', async () => {
  await renderMainApp(
    {
      eventContext: {
        eventId,
        emailAddress: 'd',
        inviteeId: 's',
        contactId: 'contactId'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'confirmation',
    event => ({
      ...event,
      status: eventStatus.ACTIVE,
      eventSecuritySetupSnapshot: {
        postRegistrationAuthType: PostRegistrationAuthType.SECURE_VERIFICATION_CODE
      }
    })
  );
  await wait(0);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/EventGuestClient').prototype.identifyByContactId).toHaveBeenCalled();
});
