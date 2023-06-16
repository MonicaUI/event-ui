import renderMainApp from '../../testUtils/renderMainAppForExternalAuthentication';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';
import { routeToPage } from '../../redux/pathInfo';
import EventGuestClient from '../../clients/EventGuestClient';
import RegCartClient from '../../clients/RegCartClient';

jest.mock('../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
    __esModule: true,
    routeToPage: jest.fn()
  };
});

(routeToPage as $TSFixMe).mockImplementation(() => {
  return dispatch => {
    dispatch({
      type: '[MOCK]/routeToPage',
      payload: {}
    });
  };
});

const eventId = EventSnapshot.eventSnapshot.id;
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const eventRegistrationId = 'eventRegistrationId1';
const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regMod: true,
    eventRegistrations: {
      [eventRegistrationId]: {
        eventRegistrationId,
        attendee: {
          personalInformation: {}
        },
        registrationPathId: 'todoThisShouldBeRegPathId',
        sessionWaitlists: {}
      }
    },
    eventSnapshotVersions: {
      [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
    }
  },
  validationMessages: []
};

jest.mock('../../clients/RegCartClient');
(RegCartClient.prototype.getRegCart as $TSFixMe).mockImplementation(() => mockConfirmedRegCartResponse.regCart);
(RegCartClient.prototype.identifyByConfirm as $TSFixMe).mockImplementation(() => mockConfirmedRegCartResponse);

jest.mock('../../clients/EventGuestClient');
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ regCart: { regCartId: string; status:... Remove this comment to see the full error message
EventGuestClient.prototype.identifyByContactId = jest.fn(() => mockConfirmedRegCartResponse);

test('verify id confirmation is called when confirmation number, email and alreadyRegistered pop up is skipped during SSO', async () => {
  const accountSecuritySettings = {
    allowHTTPPost: false,
    allowSSOLogin: true,
    allowSecureHTTPPost: true
  };
  await renderMainApp(
    {
      eventContext: {
        eventId,
        confirmationNumber: 'fake-confirmation-number',
        emailAddress: 'd',
        inviteeId: 's'
      },
      eventLaunchWizardSettings: '{}',
      experiments: '{}'
    },
    fakePath + 'alreadyRegistered',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    }),
    accountSecuritySettings
  );
  await wait(0);
  expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  expect(routeToPage).toHaveBeenCalledWith('confirmation');
});

test('verify id confirmation is called when confirmation number, email and alreadyRegistered pop up is skipped for Http Post', async () => {
  const accountSecuritySettings = {
    allowHTTPPost: true,
    allowSSOLogin: false,
    allowSecureHTTPPost: false
  };
  await renderMainApp(
    {
      eventContext: {
        eventId,
        confirmationNumber: 'fake-confirmation-number',
        emailAddress: 'd',
        inviteeId: 's'
      },
      eventLaunchWizardSettings: '{}',
      experiments: '{}'
    },
    fakePath + 'alreadyRegistered',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    }),
    accountSecuritySettings
  );
  await wait(0);
  expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  expect(routeToPage).toHaveBeenCalledWith('confirmation');
});

test('verify id confirmation is called when confirmation number, email and alreadyRegistered pop up is skipped for OAuth', async () => {
  const accountSecuritySettings = {
    allowHTTPPost: false,
    allowSSOLogin: false,
    allowOauth: true,
    allowSecureHTTPPost: false
  };
  await renderMainApp(
    {
      eventContext: {
        eventId,
        confirmationNumber: 'fake-confirmation-number',
        emailAddress: 'd',
        inviteeId: 's'
      },
      eventLaunchWizardSettings: '{}',
      experiments: '{}'
    },
    fakePath + 'alreadyRegistered',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    }),
    accountSecuritySettings
  );
  await wait(0);
  expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  expect(routeToPage).toHaveBeenCalledWith('confirmation');
});

test('verify id confirmation is called when confirmation number is present and alreadyRegistered pop up is skipped for OAuth', async () => {
  const accountSecuritySettings = {
    allowHTTPPost: false,
    allowSSOLogin: false,
    allowOauth: true,
    allowSecureHTTPPost: false
  };
  await renderMainApp(
    {
      eventContext: {
        eventId,
        confirmationNumber: 'fake-confirmation-number',
        emailAddress: '',
        inviteeId: 's'
      },
      eventLaunchWizardSettings: '{}',
      experiments: '{}'
    },
    fakePath + 'alreadyRegistered',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    }),
    accountSecuritySettings
  );
  await wait(0);
  expect(RegCartClient.prototype.identifyByConfirm).toHaveBeenCalled();
  expect(routeToPage).toHaveBeenCalledWith('confirmation');
});
