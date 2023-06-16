import React from 'react';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { openGroupMemberRemoveDialog } from '..';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { handleRegistrantRemovalInTravelCart } from '../../../redux/travelCart/workflow';
import { removeGroupMembersFromRegCart } from '../../../redux/registrationForm/regCart';
import { wait } from '../../../testUtils';
import { createRestoreRegTypesAction } from '../../../redux/actions';

jest.mock('../../../redux/travelCart/workflow', () => {
  return {
    handleRegistrantRemovalInTravelCart: jest.fn(() => () => {})
  };
});
jest.mock('../../../redux/registrationForm/regCart', () => {
  return {
    removeGroupMembersFromRegCart: jest.fn(() => () => {})
  };
});

jest.mock('../../../redux/actions', () => {
  return {
    createRestoreRegTypesAction: jest.fn(() => () => {})
  };
});

const eventSnapshotClient = {
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    website: (x = {}) => x,
    text: (x = {}) => x,
    regCartStatus: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x
  }),
  {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    clients: { eventSnapshotClient },
    defaultUserSession: {
      eventId: 'dummyEventId'
    }
  }
);

describe('GroupMemberRemoveDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  test('matches snapshot when opened', () => {
    store.dispatch(openGroupMemberRemoveDialog('02'));
    expect(dialog).toMatchSnapshot();
  });

  test('click on cancel closes guest remove dialog', () => {
    store.dispatch(openGroupMemberRemoveDialog('02'));
    dialog.update();
    dialog.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(dialog).toMatchSnapshot();
  });

  test('updates the travel cart on clicking yes and remove the group member', async () => {
    store.dispatch(openGroupMemberRemoveDialog('02'));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(1);
    expect(handleRegistrantRemovalInTravelCart).toHaveBeenCalledWith('02');
  });

  test('updates the reg cart on clicking yes and remove the group member', async () => {
    store.dispatch(openGroupMemberRemoveDialog('02'));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(1);
    expect(removeGroupMembersFromRegCart).toHaveBeenCalledWith(['02']);
  });

  test('restores reg types in state on clicking yes and remove the group member', async () => {
    store.dispatch(openGroupMemberRemoveDialog('02'));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');
    await wait(1);
    expect(createRestoreRegTypesAction).toHaveBeenCalled();
  });
});
