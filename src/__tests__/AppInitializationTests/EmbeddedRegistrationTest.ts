import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

const eventId = '11111111-2222-3333-4444-555555555555';
const path = `/embedded-registration/${eventId}/`;

delete window.location;
// @ts-expect-error ts-migrate(2739) FIXME: Type 'URL' is missing the following properties fro... Remove this comment to see the full error message
window.location = new URL(`http://cvent.com${path}/`);

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const appSettings = {
  viewRoot: '/embedded-registration',
  eventContext: {
    eventId
  },
  eventLaunchWizardSettings: '{}'
};

test('throws error if access is not allowed', async () => {
  try {
    await renderMainApp(appSettings, path + 'register', event => ({
      ...event,
      status: eventStatus.ACTIVE
    }));
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'fail' does not exist on type 'typeof jes... Remove this comment to see the full error message
    jest.fail('it should not reach here');
  } catch (error) {
    // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
    expect(error).toHaveProperty('message', 'Request to embedded registration not allowed');
  }
});

test('shows first reg page and starts registration when going to a registration page', async () => {
  const mainApp = await renderMainApp(
    {
      ...appSettings,
      experiments: {
        isFlexEmbeddedRegistrationEnabled: true
      }
    },
    path + 'register',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
