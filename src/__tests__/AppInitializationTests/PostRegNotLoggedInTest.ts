import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('shows default page when going to a post reg page without being logged in', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    fakePath + 'confirmation',
    event => ({
      ...event,
      status: eventStatus.ACTIVE
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
