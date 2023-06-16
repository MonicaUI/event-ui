import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { openSingleSignOnRegistrationDialog } from '../../dialogs';
import { act } from '@testing-library/react';
import { startAdminRegistration } from '../../routing/startRegistration';

const mockEventId = '11111111-2222-3333-4444-555555555555';
const eventId = mockEventId;
const fakePath = `/${eventId}/`;

jest.mock('../../dialogs', () => {
  const fn = jest.fn();
  return {
    ...jest.requireActual<$TSFixMe>('../../dialogs'),
    openSingleSignOnRegistrationDialog: () => fn
  };
});

jest.mock('../../routing/startRegistration', () => {
  const fn = jest.fn();
  return {
    ...jest.requireActual<$TSFixMe>('../../routing/startRegistration'),
    startAdminRegistration: () => fn
  };
});

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('shows sso dialog when going for registration page, when attendee is authenticated through SSO', async () => {
  await act(async () => {
    await renderMainApp(
      {
        eventContext: {
          eventId,
          authenticatedContact: 'authenticatedContact'
        },
        eventLaunchWizardSettings: '{}'
      },
      fakePath + 'register',
      event => ({
        ...event,
        status: eventStatus.ACTIVE
      })
    );
  });
  await wait(0);
  expect(openSingleSignOnRegistrationDialog()).toHaveBeenCalled();
});

test('shows sso dialog, when attendee is authenticated through SSO and ssoAdminFlag is blank', async () => {
  await act(async () => {
    await renderMainApp(
      {
        eventContext: {
          eventId,
          authenticatedContact: 'authenticatedContact',
          ssoAdminFlag: null
        },
        eventLaunchWizardSettings: '{}'
      },
      fakePath + 'register',
      event => ({
        ...event,
        status: eventStatus.ACTIVE
      })
    );
  });
  await wait(0);
  expect(openSingleSignOnRegistrationDialog()).toHaveBeenCalled();
});

test('do not show sso dialog, when attendee is authenticated through SSO and ssoAdminFlag is Yes', async () => {
  await act(async () => {
    await renderMainApp(
      {
        eventContext: {
          eventId,
          authenticatedContact: 'authenticatedContact',
          ssoAdminFlag: true
        },
        eventLaunchWizardSettings: '{}'
      },
      fakePath + 'register',
      event => ({
        ...event,
        status: eventStatus.ACTIVE
      })
    );
  });
  await wait(0);
  expect(startAdminRegistration()).toHaveBeenCalled();
});
