import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { routeToPage } from '../../redux/pathInfo';
import history from '../../myHistory';
import { act } from '@testing-library/react';

let mockStore = null;
jest.mock('../../redux/configureStore', () => {
  const configureStore = jest.requireActual<$TSFixMe>('../../redux/configureStore').default;
  return (...args) => {
    mockStore = configureStore(...args);
    return mockStore;
  };
});

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('changes to a different page when requested and then allows back navigation', async () => {
  let mainApp;
  await act(async () => {
    mainApp = await renderMainApp(
      {
        eventContext: {
          eventId
        },
        eventLaunchWizardSettings: '{}'
      },
      fakePath,
      event => ({
        ...event,
        status: eventStatus.ACTIVE
      })
    );
    await wait(0);
  });
  expect(mainApp.getDOMNode()).toMatchSnapshot();

  await act(async () => {
    mockStore.dispatch(routeToPage('page:12345678-1234-1234-1234-1234567890123456'));
    await wait(0);
  });
  expect(mainApp.getDOMNode()).toMatchSnapshot();

  await act(async () => {
    history.goBack();
    await wait(0);
  });
  expect(mainApp.getDOMNode()).toMatchSnapshot();
});
