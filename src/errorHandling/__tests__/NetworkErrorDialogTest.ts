/* eslint-env jest */
import { create } from 'react-test-renderer';
import { runNetworkErrorHandler } from '../loggingAndErrors';
import { initializeNetworkErrorDialog } from '../NetworkErrorDialog';
import { openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

jest.mock('nucleus-guestside-site/src/redux/modules/dialogContainer');
jest.mock('@cvent/nucleus-networking', () => {
  return {
    httpLogPageLoadId: 'fake-page-load-id'
  };
});

Date.now = () => new Date('2019-09-10T00:00:00.000Z').valueOf();

const store = {
  getState() {
    return {
      website: {
        theme: EventSnapshot.eventSnapshot.siteEditor.website.theme
      },
      text: {
        translate: resx => resx
      }
    };
  },
  dispatch(action) {
    if (typeof action === 'function') {
      return store.dispatch(action(store.dispatch, store.getState));
    }
  }
};

test('NetworkErrorDialog matches snapshot', () => {
  initializeNetworkErrorDialog(store);

  runNetworkErrorHandler();

  expect(openDialogContainer).toHaveBeenCalled();
  const dialog = openDialogContainer.mock.calls[0][0];
  const component = create(dialog);
  expect(component).toMatchSnapshot();
});
