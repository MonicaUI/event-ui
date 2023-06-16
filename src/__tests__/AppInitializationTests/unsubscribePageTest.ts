import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('shows a opt out page when going to the URL for the page', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId,
        inviteeId: 'fake-invitee-id'
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'unsubscribe',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
