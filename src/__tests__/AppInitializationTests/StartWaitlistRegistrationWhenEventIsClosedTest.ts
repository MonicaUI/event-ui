import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import * as eventClosedReason from 'event-widgets/clients/EventClosedReason';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../dialogs/__mocks__/documentElementMock';
getMockedMessageContainer();

jest.mock('../../clients/EventPersonaClient', () => {
  function MockEventPersonaClient() {}
  MockEventPersonaClient.prototype.identifyInvitee = jest.fn(() => ({ inviteeStatus: 'Visited' }));
  return MockEventPersonaClient;
});
jest.mock('../../clients/EventGuestClient');

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
  MockRegCartClient.prototype.createWaitlistRegistrationCart = jest.fn((authToken, regCart) => {
    return {
      regCart: {
        ...regCart,
        regCartId: 'regCartId',
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'todoThisShouldBeRegPathId'
          }
        }
      },
      validationMessages: []
    };
  });
  MockRegCartClient.prototype.getRegCart = jest.fn((authToken, regCartId) => {
    return {
      regCartId,
      status: 'COMPLETED',
      regWaitList: true,
      eventSnapshotVersions: {
        'fake-snapshot-id': 'fake-eventSnapshot-version'
      },
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          eventId: '11111111-2222-3333-4444-555555555555',
          attendee: {
            personalInformation: {
              contactId: 'fake-contact-id',
              firstName: 'Doug',
              lastName: 'Dimmadome',
              emailAddress: 'owner_of_the_dimsdale_dimmadome@j.mail',
              primaryAddressType: 'WORK'
            },
            attendeeId: 'fake-attendee-id'
          }
        },
        attendeeType: 'ATTENDEE',
        productRegistrations: [
          {
            productId: '00000000-0000-0000-0000-000000000001',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'WAITLIST'
          }
        ]
      }
    };
  });
  MockRegCartClient.prototype.getCapacitySummaries = jest.fn(() => {});
  return MockRegCartClient;
});

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;
let mainApp;

afterEach(() => {
  mainApp.unmount();
  jest.clearAllMocks();
});

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('starts waitlist registration when attemped to register a closed due to capacity but waitlist enabled event', async () => {
  mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
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

test('starts waitlist registration when attemped to register a closed due to non-capacity reason but waitlist enabled event', async () => {
  mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'register',
    event => ({
      ...event,
      status: eventStatus.CLOSED,
      closedReason: eventClosedReason.PLANNER_ACTION,
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

test('Shows event waitlist dialog when attempting to register and waitlist cart is in the browser session', async () => {
  mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        regCartId: 'fake-reg-cart-id',
        confirmationNumber: 'fake-confirmation-number',
        isTestMode: false
      },
      eventLaunchWizardSettings: '{}',
      experiments: {}
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
  expect(require('../../clients/RegCartClient').prototype.getRegCart).toHaveBeenCalledTimes(1);
});
