import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventGuestClient from '../../clients/EventGuestClient';
import RegCartClient from '../../clients/RegCartClient';

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regMod: true,
    eventSnapshotVersions: {
      [mockEventId]: 'eventSnapshotVersion'
    },
    eventRegistrations: {
      'event-registrations-key': {
        confirmationNumber: 'fake-number',
        attendee: {
          attendeeId: 'fake-attendeeId',
          personalInformation: {
            emailAddress: 'fake-email-address'
          }
        },
        registrationPathId: 'todoThisShouldBeRegPathId',
        sessionWaitlists: {}
      }
    }
  },
  validationMessages: []
};
jest.mock('../../clients/RegCartClient');
(RegCartClient.prototype.getRegCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse.regCart)
);
(RegCartClient.prototype.getCapacitySummaries as $TSFixMe).mockImplementation(() => Promise.resolve({}));
(RegCartClient.prototype.createRegModCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse)
);
(RegCartClient.prototype.identifyByConfirm as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse)
);

jest.mock('../../clients/EventGuestClient');
EventGuestClient.prototype.publishAttendeeActivityFact = jest.fn(() => Promise.resolve({}));

test('modifying starts a reg mod cart and goes to the first reg page', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        regCartId: 'fake-reg-cart-id',
        confirmationNumber: 'fake-confirmation-number'
      },
      eventLaunchWizardSettings: '{}',
      accessToken: 'BEARER fakeToken'
    },
    fakePath + 'modifyRegistration',
    event => ({
      ...event,
      id: eventId,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  expect(RegCartClient.prototype.createRegModCart).toHaveBeenCalledWith(
    'BEARER fakeToken',
    undefined,
    undefined,
    mockEventId,
    null
  );
  expect(RegCartClient.prototype.identifyByConfirm).not.toHaveBeenCalled();
  expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
    '11111111-2222-3333-4444-555555555555',
    'eventSnapshotVersion',
    'REGISTRATION',
    'todoThisShouldBeRegPathId',
    '00000000-0000-0000-0000-000000000000'
  );
  expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
    '11111111-2222-3333-4444-555555555555',
    'eventSnapshotVersion',
    'POST_REGISTRATION',
    'todoThisShouldBeRegPathId',
    '00000000-0000-0000-0000-000000000000'
  );
});

test('planner regMod logs in registrant with plannerRegSettings', async () => {
  jest.clearAllMocks();
  const plannerViewRoot = `/planner-path/${eventId}`;
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        isPlanner: true
      },
      eventLaunchWizardSettings: '{}',
      accessToken: 'BEARER plannerRegModToken-from-html',
      viewRoot: plannerViewRoot, // load planner site on same fake root just for this test
      plannerRegSettings: {
        successUrl: '/fakeUrl',
        exitUrl: '/fakeUrl',
        modificationRequest: {
          emailAddress: 'abc@123.com',
          confirmationNumber: 'abc123'
        }
      }
    },
    `${plannerViewRoot}/modifyRegistration`,
    event => ({
      ...event,
      id: eventId,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  expect(RegCartClient.prototype.createRegModCart).toHaveBeenCalledWith(
    'BEARER plannerRegModToken-from-html',
    'fake-attendeeId',
    'fake-number',
    mockEventId,
    null
  );
  expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
    '11111111-2222-3333-4444-555555555555',
    'eventSnapshotVersion',
    'REGISTRATION',
    'todoThisShouldBeRegPathId',
    '00000000-0000-0000-0000-000000000000'
  );
  expect(EventGuestClient.prototype.getRegistrationContent).toHaveBeenCalledWith(
    '11111111-2222-3333-4444-555555555555',
    'eventSnapshotVersion',
    'POST_REGISTRATION',
    'todoThisShouldBeRegPathId',
    '00000000-0000-0000-0000-000000000000'
  );
});
