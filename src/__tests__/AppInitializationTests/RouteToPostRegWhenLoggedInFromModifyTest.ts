import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import mockEventSnapshot from '../../../fixtures/EventSnapshot.json';
import myHistory from '../../myHistory';
import { act } from '@testing-library/react';
import RegCartClient from '../../clients/RegCartClient';

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
    eventSnapshotVersions: mockEventSnapshotVersions,
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

jest.mock('../../clients/RegCartClient');
(RegCartClient.prototype.createCancelRegistrationCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve({
    regCart: {
      regCartId: 'regCartId',
      status: 'INPROGRESS',
      regCancel: true,
      eventRegistrations: {
        'event-registrations-key': {
          confirmationNumber: 'fake-number',
          registrationPathId: 'todoThisShouldBeRegPathId'
        }
      },
      eventSnapshotVersions: mockEventSnapshotVersions
    },
    validationMessages: []
  })
);
(RegCartClient.prototype.calculateRegCartPricing as $TSFixMe).mockImplementation(() => Promise.resolve({}));
(RegCartClient.prototype.getRegCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse.regCart)
);
(RegCartClient.prototype.getCapacitySummaries as $TSFixMe).mockImplementation(() => Promise.resolve({}));
(RegCartClient.prototype.getRegCartPricing as $TSFixMe).mockImplementation(() => Promise.resolve({}));
(RegCartClient.prototype.createRegModCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve({
    regCart: {
      regCartId: 'regCartId',
      status: 'INPROGRESS',
      regMod: true,
      eventRegistrations: {
        'event-registrations-key': {
          confirmationNumber: 'fake-number',
          registrationPathId: 'todoThisShouldBeRegPathId'
        }
      },
      eventSnapshotVersions: mockEventSnapshotVersions
    },
    validationMessages: []
  })
);

jest.mock('../../clients/EventPersonaClient', () => {
  function MockEventPersonaClient() {}
  MockEventPersonaClient.prototype.identifyInvitee = jest.fn(() => Promise.resolve({ inviteeStatus: 'Accepted' }));
  return MockEventPersonaClient;
});

test('logged in from /modifyRegistration then route to Post Reg page', async () => {
  // @ts-expect-error ts-migrate(2740) FIXME: Type '{}' is missing the following properties from... Remove this comment to see the full error message
  global.location = {};
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
  expect(RegCartClient.prototype.createRegModCart).toHaveBeenCalledWith(
    'BEARER fakeToken',
    undefined,
    undefined,
    mockEventId,
    null
  );
  expect(RegCartClient.prototype.identifyByConfirm).not.toHaveBeenCalled();
});
