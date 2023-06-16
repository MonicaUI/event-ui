// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
getMockedMessageContainer();

import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainerReducer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import {
  wait,
  createRegistrationType,
  createAdmissionItem,
  createSession,
  createRegCartWithGuestRegistrations,
  createQuantityItem,
  createDonationItem
} from '../../../testUtils';
import { openIdConfirmationConflictDialog } from '../IdConfirmationConflictDialog';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';

let regCartGuests;
beforeEach(() => {
  jest.resetModules();
  regCartGuests = require('../../../redux/registrationForm/regCart/guests');
  regCartGuests.updateGuestsInRegCart = jest.fn(() => ({ type: 'DummyAction' }));
});

jest.mock('../../../redux/registrationForm/regCart/admissionItems');
jest.mock('../../../redux/registrationForm/regCart/quantityItems', () => ({
  updateQuantity: jest.fn(() => ({ type: 'DummyAction' }))
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const quantityUpdate = require('../../../redux/registrationForm/regCart/quantityItems');
jest.mock('../../../redux/registrationForm/regCart/donationItems', () => ({
  updateDonationAmount: jest.fn(() => ({ type: 'DummyAction' }))
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const donationUpdate = require('../../../redux/registrationForm/regCart/donationItems');
jest.mock('../../../redux/registrationForm/regCart/sessions', () => ({
  unSelectSession: jest.fn(() => ({ type: 'DummyAction' }))
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sessionUpdate = require('../../../redux/registrationForm/regCart/sessions');
jest.mock('../../../redux/registrationForm/regCart/sessionBundles', () => ({
  buildUnregisterSessionBundlesInput: jest.fn(() => ({ type: 'DummyAction' })),
  handleRegTypeConflictSessionBundles: jest.fn(() => ({ type: 'DummyAction' }))
}));
jest.mock('../../../redux/selectors/currentRegistrationPath', () => ({
  isGuestProductSelectionEnabledOnRegPath: jest.fn(() => {
    return true;
  }),
  getRegistrationPathIdOrDefault: jest.fn(() => ({ type: 'DummyAction' }))
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sessionBundlesUpdate = require('../../../redux/registrationForm/regCart/sessionBundles');
jest.mock('../../../dialogs/shared/getDialogContainerStyle', () => jest.fn(() => ({ type: 'DummyAction' })));
jest.mock('../../../redux/selectors/currentRegistrant', () => ({
  getEventRegistrationId: jest.fn(() => 'eventRegistrationId')
}));
jest.mock('../../../redux/selectors/event', () => ({
  getEventId: jest.fn(() => 'eventId')
}));
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

test('Dialog indicates there is an invalid admission item', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: false,
      admissionItem: createAdmissionItem()
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is an invalid session', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true,
      admissionItem: createAdmissionItem()
    },
    sessionsValidationResults: {
      isValid: false,
      invalidSessions: [createSession()]
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are required session groups', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true,
      admissionItem: createAdmissionItem()
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: [createSession()]
    },
    sessionGroupValidationResults: {
      isValid: false
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are invalid quantity items', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: false,
      invalidQuantityItems: [createQuantityItem()]
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are invalid donation items', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    },
    donationItemValidationResults: {
      isValid: false,
      invalidDonationItems: [createDonationItem()]
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is an invalid admission item and invalid session', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: false,
      admissionItem: createAdmissionItem()
    },
    sessionsValidationResults: {
      isValid: false,
      invalidSessions: [createSession()]
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue alters cart with invalid admission item and sessions', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: false,
      admissionItem: createAdmissionItem()
    },
    sessionsValidationResults: {
      isValid: false,
      invalidSessions: [createSession()]
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn(() => ({ type: 'DummyAction' }));
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionUpdate.unSelectSession).toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../../redux/registrationForm/regCart/admissionItems').unSelectAdmissionItem).toHaveBeenCalled();

  expect(callback).toHaveBeenCalled();
});

test('Clicking continue when no invalid session bundle will not handle session bundles', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: true,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true,
      admissionItem: ''
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionBundleValidationResults: {
      isValid: true,
      invalidSessionBundles: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn(() => ({ type: 'DummyAction' }));
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionBundlesUpdate.handleRegTypeConflictSessionBundles).not.toHaveBeenCalled();
});

test('Clicking continue when there is invalid session bundle will handle invalid session bundles', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true,
      admissionItem: ''
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionBundleValidationResults: {
      isValid: false,
      invalidSessionBundles: ['invalidSessionBundleId']
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn(() => ({ type: 'DummyAction' }));
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionBundlesUpdate.handleRegTypeConflictSessionBundles).toHaveBeenCalled();
  expect(sessionBundlesUpdate.handleRegTypeConflictSessionBundles).toHaveBeenCalledTimes(1);
});

test('Dialog indicates there is no guest registration allowed', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  regCartGuests.updateRegCartWithGuests = jest.fn(() => createRegCartWithGuestRegistrations());
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: false,
      guestCount: 0
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const callback = jest.fn();
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue alters cart with no guest registrations', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  regCartGuests.updateRegCartWithGuests = jest.fn(() => createRegCartWithGuestRegistrations());
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: false,
      guestCount: 0
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    }
  };
  const continueCallback = jest.fn(() => () => {});
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, continueCallback));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(continueCallback).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid admission item and sessions 1', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: false,
      invalidQuantityItems: [createQuantityItem()]
    }
  };
  const callback = jest.fn(() => ({ type: 'DummyAction' }));
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(quantityUpdate.updateQuantity).toHaveBeenCalled();
  expect(callback).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid donation item', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationType: createRegistrationType(),
    admissionItemValidationResults: {
      isValid: true
    },
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    guestRegistrationsValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: true,
      invalidQuantityItems: []
    },
    donationItemValidationResults: {
      isValid: false,
      invalidDonationItems: [createDonationItem()]
    }
  };
  const callback = jest.fn(() => ({ type: 'DummyAction' }));
  await store.dispatch(openIdConfirmationConflictDialog(validationResults, callback));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(donationUpdate.updateDonationAmount).toHaveBeenCalled();
  expect(callback).toHaveBeenCalled();
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
      website: EventSnapshot.eventSnapshot.siteEditor.website
    }
  );
}
