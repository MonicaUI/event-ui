import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventGuestClient from '../../clients/EventGuestClient';
import RegCartClient from '../../clients/RegCartClient';

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

import { getRegCart } from '../../redux/selectors/shared';
import { restoreTravelCartIntoState, startTravelCancellation } from '../../redux/travelCart/external';

jest.mock('../../redux/travelCart/external', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/travelCart/external'),
    __esModule: true,
    restoreTravelCartIntoState: jest.fn(),
    startTravelCancellation: jest.fn()
  };
});

jest.mock('../../redux/selectors/shared', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/selectors/shared'),
    __esModule: true,
    getRegCart: jest.fn()
  };
});

(restoreTravelCartIntoState as $TSFixMe).mockImplementation(() => {
  return dispatch => {
    dispatch({
      type: '[MOCK]/restoreTravelCartIntoState',
      payload: {}
    });
  };
});
(startTravelCancellation as $TSFixMe).mockImplementation(() => {
  return dispatch => {
    dispatch({
      type: '[MOCK]/startTravelCancellation',
      payload: {}
    });
  };
});

const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regCancel: true,
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
(RegCartClient.prototype.identifyByConfirm as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse)
);
(RegCartClient.prototype.createCancelRegistrationCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse)
);

jest.mock('../../clients/EventGuestClient');
EventGuestClient.prototype.publishAttendeeActivityFact = jest.fn(() => Promise.resolve({}));

test('cancelRegistration starts a cancel regCart and goes to cancellation page', async () => {
  (getRegCart as $TSFixMe).mockImplementation(() => mockConfirmedRegCartResponse.regCart);
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
    fakePath + 'cancelRegistration',
    event => ({
      ...event,
      id: mockEventId,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  expect(RegCartClient.prototype.createCancelRegistrationCart).toHaveBeenCalledWith(
    'BEARER fakeToken',
    undefined,
    undefined,
    mockEventId,
    null
  );
  expect(RegCartClient.prototype.identifyByConfirm).not.toHaveBeenCalled();

  // verify that reg cancel flow also initiates travel cancellation
  expect(startTravelCancellation).toBeCalledWith('regCartId');
});

test('planner cancelRegistration logs in registrant with plannerRegSettings', async () => {
  jest.clearAllMocks();
  (getRegCart as $TSFixMe).mockImplementation(() => mockConfirmedRegCartResponse.regCart);
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
    `${plannerViewRoot}/cancelRegistration`,
    event => ({
      ...event,
      id: mockEventId,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
  expect(RegCartClient.prototype.createCancelRegistrationCart).toHaveBeenCalledWith(
    'BEARER plannerRegModToken-from-html',
    'fake-attendeeId',
    'fake-number',
    mockEventId,
    null
  );
  expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  expect(restoreTravelCartIntoState).not.toHaveBeenCalled();
});
