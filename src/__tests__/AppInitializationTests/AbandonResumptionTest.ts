import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const eventId = EventSnapshot.eventSnapshot.id;
const fakePath = `/${eventId}/`;
const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
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
  MockRegCartClient.prototype.createRegCart = jest.fn((authToken, regCart) => {
    return {
      regCart: {
        ...regCart,
        regCartId: 'regCartId',
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'registrationPathId'
          }
        }
      },
      validationMessages: []
    };
  });
  MockRegCartClient.prototype.getRegCart = jest.fn(() => mockConfirmedRegCartResponse.regCart);
  return MockRegCartClient;
});

test('resuming abandoned resigstration (existing regcart in the session) wont show register now popup', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        regCartId: 'existing-regcart-id',
        abandonedReg: true
      }
    },
    fakePath + 'register',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../clients/RegCartClient').prototype.createRegCart).not.toHaveBeenCalled();
});
