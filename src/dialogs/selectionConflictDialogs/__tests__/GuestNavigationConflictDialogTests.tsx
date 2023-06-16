import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainerReducer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { wait } from '../../../testUtils';
import { setIn } from 'icepick';
import { returnToProcessStart } from '../actions';
import { openGuestNavigationConflictDialog } from '../GuestNavigationConflictDialog';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';

getMockedMessageContainer();

let regCartGuests;
beforeEach(() => {
  regCartGuests = require('../../../redux/registrationForm/regCart/guests');
  regCartGuests.updateGuestsInRegCart = jest.fn(() => () => {});
});

jest.mock('../../../dialogs/shared/getDialogContainerStyle', () => jest.fn(() => ({ type: 'DummyAction' })));
jest.mock('../../../redux/actions', () => ({
  filterEventSnapshot: jest.fn(() => ({ type: 'DummyAction' })),
  loadRegistrationContent: () => () => {}
}));
jest.mock('../actions');

const guestEventRegIds = ['dummyGuestEventRegId1', 'dummyGuestEventRegId2'];

const regCartWithGuestRegs = {
  regCartId: 'd996d434-d088-44fb-8339-2831a2d0f93c',
  status: 'INPROGRESS',
  groupRegistration: false,
  eventRegistrations: {
    primaryEventRegId: {
      eventRegistrationId: 'primaryEventRegId',
      attendee: {
        isGroupMember: false
      },
      attendeeType: 'ATTENDEE',
      displaySequence: 1,
      productRegistrations: [],
      requestedAction: 'REGISTER',
      primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
      registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
      registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
    },
    [guestEventRegIds[0]]: {
      eventRegistrationId: guestEventRegIds[0],
      attendee: {
        isGroupMember: false
      },
      attendeeType: 'GUEST',
      displaySequence: 1,
      productRegistrations: [],
      requestedAction: 'REGISTER',
      primaryRegistrationId: 'primaryEventRegId',
      registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
      registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
    },
    [guestEventRegIds[1]]: {
      eventRegistrationId: guestEventRegIds[1],
      attendee: {
        isGroupMember: false
      },
      attendeeType: 'GUEST',
      displaySequence: 1,
      productRegistrations: [],
      requestedAction: 'REGISTER',
      primaryRegistrationId: 'primaryEventRegId',
      registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
      registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
    }
  }
};

test('Dialog indicates that guests that dont have admission items are present', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);

  store.dispatch(openGuestNavigationConflictDialog(guestEventRegIds));

  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue routes to first page of registration', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);

  store.dispatch(openGuestNavigationConflictDialog(guestEventRegIds));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);

  expect(returnToProcessStart).toHaveBeenCalled();
});

test('Clicking cancel removes the guests without admissionItem', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);

  store.dispatch(openGuestNavigationConflictDialog(guestEventRegIds));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="cancel-selection"]').hostNodes().simulate('click');
  await wait(0);
  let regCartWithRemovedGuests = setIn(
    regCartWithGuestRegs,
    ['eventRegistrations', guestEventRegIds[0], 'requestedAction'],
    'UNREGISTER'
  );
  regCartWithRemovedGuests = setIn(
    regCartWithRemovedGuests,
    ['eventRegistrations', guestEventRegIds[1], 'requestedAction'],
    'UNREGISTER'
  );
  expect(regCartGuests.updateGuestsInRegCart).toHaveBeenCalledWith(regCartWithRemovedGuests, false);
});

function createDialogContainer(store) {
  return mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );
}

function createStore() {
  return createStoreWithMiddleware(
    combineReducers({
      account: (x = {}) => x,
      dialogContainer: dialogContainerReducer,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      website: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      registrationForm: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x
    }),
    {
      text: {
        translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
      },
      registrationForm: {
        currentEventRegistrationId: 'eventRegistrationId',
        regCart: regCartWithGuestRegs
      },
      website: EventSnapshot.eventSnapshot.siteEditor.website
    }
  );
}
