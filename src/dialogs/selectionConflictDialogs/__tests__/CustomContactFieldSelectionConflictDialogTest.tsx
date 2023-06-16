import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainerReducer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { wait, createCustomFieldAnswers, createInvalidChildCustomFieldAnswers } from '../../../testUtils';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { openContactCustomFieldChoiceSelectionConflictDialog } from '../CustomContactFieldChoiceSelectionConflictDialog';

beforeEach(() => {
  jest.resetModules();
});

jest.mock('../../../dialogs/shared/getDialogContainerStyle', () => jest.fn(() => ({ type: 'DummyAction' })));
jest.mock('../../../redux/selectors/currentRegistrationPath', () => ({
  getEventRegistrationId: jest.fn(() => 'eventRegistrationId')
}));
jest.mock('../actions');
jest.mock('../../../redux/selectors/productSelectors', () => ({
  getSelectedSessionDefinitions: jest.fn(() => {
    return {
      s1: {
        id: 's1',
        capacityId: 's1'
      }
    };
  }),
  getPrimaryAndGuestSortedVisibleAdmissionItems: jest.fn(() => [
    {
      id: '1',
      capacityId: '1'
    },
    {
      id: '2',
      capacityId: '2'
    }
  ]),
  getAllSortedSessionsForPrimaryAndGuest: jest.fn(() => [
    {
      id: 's1',
      capacityId: 's1'
    }
  ])
}));

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';

getMockedMessageContainer();

test('Dialog indicates there is an invalid choice', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    answer: createCustomFieldAnswers(),
    contactCustomFieldChoiceValidationResults: {
      isValid: false,
      invalidChildContactCustomFields: [createInvalidChildCustomFieldAnswers()]
    }
  };
  store.dispatch(openContactCustomFieldChoiceSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue alters cart with invalid choices', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    answer: createCustomFieldAnswers(),
    contactCustomFieldChoiceValidationResults: {
      isValid: false,
      invalidChildContactCustomFields: [createInvalidChildCustomFieldAnswers()]
    }
  };
  store.dispatch(openContactCustomFieldChoiceSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
});

test('Clicking cancel closes the dialog', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    answer: createCustomFieldAnswers(),
    contactCustomFieldChoiceValidationResults: {
      isValid: false,
      invalidChildContactCustomFields: [createInvalidChildCustomFieldAnswers()]
    }
  };
  store.dispatch(openContactCustomFieldChoiceSelectionConflictDialog(validationResults, false));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="cancel-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(dialogContainer.find('[class="dialogContainer"]').length).toBe(0);
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
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x
    }),
    {
      text: {
        translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
      },
      website: EventSnapshot.eventSnapshot.siteEditor.website
    }
  );
}
