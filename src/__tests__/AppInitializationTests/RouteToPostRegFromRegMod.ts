import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import mockEventSnapshot from '../../../fixtures/EventSnapshot.json';
import myHistory from '../../myHistory';
import { act } from '@testing-library/react';
import EventGuestClient from '../../clients/EventGuestClient';

const mockEventId = mockEventSnapshot.eventSnapshot.id;
const fakePath = `/${mockEventId}/`;
const mockEventSnapshotVersions = {
  [mockEventId]: 'eventSnapshotVersion'
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regMod: true,
    eventSnapshotVersions: mockEventSnapshotVersions,
    groupRegistration: true,
    eventRegistrations: {
      'event-registrations-key': {
        id: 'event-registrations-key',
        confirmationNumber: 'fake-number',
        attendee: {
          attendeeId: 'fake-attendeeId',
          personalInformation: {
            emailAddress: 'fake-email-address'
          }
        },
        attendeeType: 'GROUP_LEADER',
        registrationPathId: 'todoThisShouldBeRegPathId',
        sessionWaitlists: {}
      }
    }
  },
  validationMessages: []
};

jest.mock('../../clients/RegCartClient', () => {
  function MockRegCartClient() {}
  MockRegCartClient.prototype.getRegCart = jest.fn(() => Promise.resolve(mockConfirmedRegCartResponse.regCart));
  MockRegCartClient.prototype.getCapacitySummaries = () => Promise.resolve({});
  MockRegCartClient.prototype.identifyByConfirm = () => Promise.resolve(mockConfirmedRegCartResponse);
  MockRegCartClient.prototype.createRegModCart = () => Promise.resolve(mockConfirmedRegCartResponse);
  return MockRegCartClient;
});

jest.mock('../../clients/EventPersonaClient', () => {
  function MockEventPersonaClient() {}
  MockEventPersonaClient.prototype.identifyInvitee = jest.fn(() => Promise.resolve({ inviteeStatus: 'Accepted' }));
  return MockEventPersonaClient;
});

jest.mock('../../clients/EventGuestClient');
EventGuestClient.prototype.publishAttendeeActivityFact = jest.fn(() => Promise.resolve({}));

test('logged in from /modifyRegistration then route to Post Reg page', async () => {
  let mainApp;
  await act(async () => {
    mainApp = await renderMainApp(
      {
        eventContext: {
          eventId: mockEventId,
          regCartId: 'fake-reg-cart-id',
          confirmationNumber: 'fake-confirmation-number'
        },
        eventLaunchWizardSettings: '{}',
        accessToken: 'BEARER fakeToken'
      },
      fakePath + 'modifyRegistration',
      event => ({
        ...event,
        status: eventStatus.ACTIVE
      })
    );
    await wait(0);
  });
  await act(async () => {
    myHistory.push(fakePath + 'confirmation');
    await wait(0);
  });
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
