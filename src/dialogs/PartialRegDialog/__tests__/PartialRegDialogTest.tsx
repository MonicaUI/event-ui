/* global */
import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openPartialRegDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { setCurrentRegistrant } from '../../../appInitialization/routeHandlers';
import { wait } from '../../../testUtils';
import { routeToPage } from '../../../redux/pathInfo';
import EventGuestClient from '../../../clients/EventGuestClient';

const eventRegistrationId = 'eventRegistrationId1';

const partialRegCart = {
  rootPath: '/',
  regCartId: 'regCartiId'
};

const regCartClient = {
  authorizeByConfirm: jest.fn(() => ({ accessToken: 'fakeAuthByConfirmToken' })),
  resumePartialRegCart: jest.fn(() => ({ regCart: partialRegCart }))
};

jest.mock('../../../clients/EventGuestClient');
const eventGuestClient = new EventGuestClient();

const eventSnapshotClient = {
  getRegCartVisibleProducts: jest.fn(() => ({}))
};

const capacityClient = {
  getCapacitySummaries: jest.fn(() => ({}))
};

jest.mock('../../../appInitialization/routeHandlers');
(setCurrentRegistrant as $TSFixMe).mockImplementation(() => () => {});

jest.mock('../../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/pathInfo'),
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

const regCart = {
  eventRegistrationPricings: [
    {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001'
    }
  ],
  regCartId: 'ed86b8ee-8982-4395-ae24-336a3dc8e234',
  productSubTotalAmountRefund: '0',
  productFeeAmountRefund: '0'
};

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    text: (x = {}) => x,
    website: (x = {}) => x,
    regCart: (x = {}) => x,
    clients: (x = {}) => x,
    appData: (x = {}) => x,
    event: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    registrationForm: (x = {}) => x,
    pathInfo: (x = {}) => x,
    account: (x = {}) => x
  }),
  {
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      resolver: {
        date: () => 'some date',
        currency: x => x
      }
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    clients: { regCartClient, eventGuestClient, eventSnapshotClient, capacityClient },
    regCart: {
      regCart
    },
    pathInfo: {
      currentPageId: 'test'
    },
    appData: {
      registrationSettings: {
        registrationPaths: {}
      }
    },
    registrationForm: {
      currentEventRegistrationId: [eventRegistrationId],
      regCart: {
        regCartId: 'regCartId',
        eventRegistrations: {
          [eventRegistrationId]: {
            eventRegistrationId,
            attendee: {
              personalInformation: {}
            },
            registrationPathId: 'regPathId1'
          }
        }
      }
    },
    event: {
      products: {
        quantityItems: {
          quantityItemId: {
            id: 'quantityItemId',
            capacityId: 'quantityItemId'
          }
        }
      }
    },
    account: {
      contactCustomFields: {}
    },
    userSession: {},
    defaultUserSession: {}
  }
);

describe('Partial Reg Dialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openPartialRegDialog(regCart));
    expect(dialog).toMatchSnapshot();
  });

  test('click on no partil reg dialog', () => {
    store.dispatch(openPartialRegDialog(regCart));
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('Click the update button, verify partial regCart got update in state', async () => {
    store.dispatch(openPartialRegDialog(regCart));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(0);
    expect(setCurrentRegistrant).toHaveBeenCalled();
    expect(routeToPage).toHaveBeenCalled();
  });
});
