import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import * as eventClosedReason from 'event-widgets/clients/EventClosedReason';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../dialogs/__mocks__/documentElementMock';
getMockedMessageContainer();

const eventId = '11111111-2222-3333-4444-555555555555';
const rootPath = `/${eventId}/`;
const summaryPath = rootPath + 'summary';
const registerPath = rootPath + 'register';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test("doesn't show message when event is closed and accessing root path", async () => {
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
      status: eventStatus.CLOSED
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
test("doesn't show message when event is closed and accessing summary path", async () => {
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
      status: eventStatus.CLOSED
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
test('shows message when event is closed and accessing register path', async () => {
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
      status: eventStatus.CLOSED
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
test('shows message when event is closed and waitlist disabled', async () => {
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
      status: eventStatus.CLOSED,
      eventFeatureSetup: {
        ...event.eventFeatureSetup,
        registrationProcess: {
          ...event.eventFeatureSetup.registrationProcess,
          eventWaitlist: false
        }
      }
    })
  );
  await wait(0);
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
test('do not show message when event is closed due to capacity and waitlist enabled', async () => {
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
});
test('do not show message when event is closed due to non-capacity reason and waitlist enabled', async () => {
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
});
