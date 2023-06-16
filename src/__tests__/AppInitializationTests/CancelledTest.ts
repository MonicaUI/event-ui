import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../dialogs/__mocks__/documentElementMock';
getMockedMessageContainer();

const eventId = '11111111-2222-3333-4444-555555555555';
const rootPath = `/${eventId}/`;
const summaryPath = rootPath + 'summary';
const registerPath = rootPath + 'register';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('shows message when event is cancelled and accessing root path', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    rootPath,
    event => ({
      ...event,
      status: eventStatus.CANCELLED
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
test('shows message when event is cancelled and accessing summary path', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    summaryPath,
    event => ({
      ...event,
      status: eventStatus.CANCELLED
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
test('shows message when event is cancelled and accessing register path', async () => {
  const mainApp = await renderMainApp(
    {
      eventContext: {
        eventId
      },
      eventLaunchWizardSettings: '{}'
    },
    registerPath,
    event => ({
      ...event,
      status: eventStatus.CANCELLED
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
