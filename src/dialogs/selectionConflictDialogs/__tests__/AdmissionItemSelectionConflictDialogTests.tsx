import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainerReducer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import {
  wait,
  createAdmissionItem,
  createSession,
  createConflictRegCartWithGuests,
  createQuantityItem,
  createDonationItem
} from '../../../testUtils';
import registrationForm from '../../../redux/registrationForm/reducer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { openAdmissionItemSelectionConflictDialog } from '../AdmissionItemSelectionConflictDialog';

let regCartInternal;
let travelWorkflow;
const regCartWithGuestReg = createConflictRegCartWithGuests();

beforeEach(() => {
  jest.resetModules();
  regCartInternal = require('../../../redux/registrationForm/regCart/internal');
  regCartInternal.updateAdmissionItemRegistration = jest.fn(() => {});
  travelWorkflow = require('../../../redux/travelCart/workflow');
  travelWorkflow.clearAirRequests = jest.fn(() => ({ type: 'DummyAction' }));
});

jest.mock('../../../dialogs/shared/getDialogContainerStyle', () => jest.fn(() => ({ type: 'DummyAction' })));
jest.mock('../actions');
jest.mock('../../../redux/registrationForm/regCart/partialUpdates');
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
  handleOptionalSessionsConflicts: jest.fn(() => ({ type: 'DummyAction' })),
  slowSessionSelection: jest.fn(() => true)
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sessionsUpdate = require('../../../redux/registrationForm/regCart/sessions');
// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
getMockedMessageContainer();

test('Dialog indicates there is an invalid session', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
      isValid: false,
      newAdmissionItem: createAdmissionItem(),
      sessionsValidationResults: {
        isValid: false,
        invalidSessions: [createSession()]
      },
      sessionsCountValidationResults: {
        isValid: true,
        isBelowSessionCount: false,
        isAboveSessionCount: false,
        sessionsCount: 1,
        minSessionCount: 0
      },
      sessionGroupValidationResults: {
        isValid: true
      }
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are required session group', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: [createSession()]
    },
    sessionsCountValidationResults: {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: 1,
      minSessionCount: 0
    },
    sessionGroupValidationResults: {
      isValid: false
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are not enough sessions', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = createSessionCountResults({
    isBelowSessionCount: true,
    isAboveSessionCount: false,
    sessionsCount: 1,
    minSessionCount: 2
  });
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are too many sessions', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = createSessionCountResults({
    isBelowSessionCount: false,
    isAboveSessionCount: true,
    sessionsCount: 3,
    minSessionCount: 0,
    maxSessionCount: 2
  });
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are not the exact amount of sessions', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = createSessionCountResults({
    isBelowSessionCount: true,
    isAboveSessionCount: true,
    sessionsCount: 3,
    minSessionCount: 2,
    maxSessionCount: 2
  });
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are invalid quantity items', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionsCountValidationResults: {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: 1,
      minSessionCount: 0
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    quantityItemValidationResults: {
      isValid: false,
      invalidQuantityItems: [createQuantityItem()]
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are invalid donation items', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionsCountValidationResults: {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: 1,
      minSessionCount: 0
    },
    sessionGroupValidationResults: {
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
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue alters cart with invalid quantity items for single user', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: false,
      invalidSessions: [createSession()]
    },
    sessionsCountValidationResults: {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: 1,
      minSessionCount: 0
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    airRequestAdvancedRuleValidationResults: {
      isValid: false,
      invalidAirBookings: [{}, {}]
    },
    quantityItemValidationResults: {
      isValid: false,
      invalidQuantityItems: [createQuantityItem()]
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
  expect(quantityUpdate.updateQuantity).toHaveBeenCalledWith(expect.any(String), expect.any(String), 0);
});

test('Clicking continue alters cart with invalid quantity items for single user 1', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: false,
      invalidSessions: [createSession()]
    },
    sessionsCountValidationResults: {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: 1,
      minSessionCount: 0
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    airRequestAdvancedRuleValidationResults: {
      isValid: false,
      invalidAirBookings: [{}, {}]
    },
    quantityItemValidationResults: {
      isValid: false,
      invalidQuantityItems: [createQuantityItem()],
      invalidQuantityItemCounts: {
        quantityItemAId: 4
      }
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
  expect(quantityUpdate.updateQuantity).toHaveBeenCalledWith(expect.any(String), 'quantityItemAId', 4);
});

test('Clicking continue alters cart with invalid quantity items for primary and guest', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
      isValid: false,
      newAdmissionItem: createAdmissionItem(),
      sessionsValidationResults: {
        isValid: false,
        invalidSessions: [createSession()]
      },
      sessionsCountValidationResults: {
        isValid: true,
        isBelowSessionCount: false,
        isAboveSessionCount: false,
        sessionsCount: 1,
        minSessionCount: 0
      },
      sessionGroupValidationResults: {
        isValid: true
      },
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      },
      quantityItemValidationResults: {
        isValid: false,
        invalidQuantityItems: [createQuantityItem()]
      }
    },
    guestEventRegId: {
      isValid: false,
      newAdmissionItem: createAdmissionItem(),
      sessionsValidationResults: {
        isValid: false,
        invalidSessions: [createSession()]
      },
      sessionsCountValidationResults: {
        isValid: true,
        isBelowSessionCount: false,
        isAboveSessionCount: false,
        sessionsCount: 1,
        minSessionCount: 0
      },
      sessionGroupValidationResults: {
        isValid: true
      },
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      },
      quantityItemValidationResults: {
        isValid: true,
        invalidQuantityItems: []
      }
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
  expect(quantityUpdate.updateQuantity).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid sessions for primary and guest', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
      isValid: false,
      newAdmissionItem: createAdmissionItem(),
      sessionsValidationResults: {
        isValid: false,
        invalidSessions: [createSession()]
      },
      sessionsCountValidationResults: {
        isValid: true,
        isBelowSessionCount: false,
        isAboveSessionCount: false,
        sessionsCount: 1,
        minSessionCount: 0
      },
      sessionGroupValidationResults: {
        isValid: true
      },
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      }
    },
    guestEventRegId: {
      isValid: false,
      newAdmissionItem: createAdmissionItem(),
      sessionsValidationResults: {
        isValid: false,
        invalidSessions: [createSession()]
      },
      sessionsCountValidationResults: {
        isValid: true,
        isBelowSessionCount: false,
        isAboveSessionCount: false,
        sessionsCount: 1,
        minSessionCount: 0
      },
      sessionGroupValidationResults: {
        isValid: true
      },
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      }
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid sessions if conflicts exists for guest only', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    guestEventRegId: {
      isValid: false,
      newAdmissionItem: createAdmissionItem(),
      sessionsValidationResults: {
        isValid: false,
        invalidSessions: [createSession()]
      },
      sessionsCountValidationResults: {
        isValid: true,
        isBelowSessionCount: false,
        isAboveSessionCount: false,
        sessionsCount: 1,
        minSessionCount: 0
      },
      sessionGroupValidationResults: {
        isValid: true
      },
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      }
    }
  };
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid donation item', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: false,
      invalidSessions: [createSession()]
    },
    sessionsCountValidationResults: {
      isValid: true,
      isBelowSessionCount: false,
      isAboveSessionCount: false,
      sessionsCount: 1,
      minSessionCount: 0
    },
    sessionGroupValidationResults: {
      isValid: true
    },
    airRequestAdvancedRuleValidationResults: {
      isValid: false,
      invalidAirBookings: [{}, {}]
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
  store.dispatch(openAdmissionItemSelectionConflictDialog(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
  expect(donationUpdate.updateDonationAmount).toHaveBeenCalled();
});

function createSessionCountResults(sessionCountValidationResults) {
  return {
    isValid: false,
    newAdmissionItem: createAdmissionItem(),
    sessionsValidationResults: {
      isValid: true,
      invalidSessions: []
    },
    sessionsCountValidationResults: {
      ...sessionCountValidationResults,
      isValid: false
    },
    sessionGroupValidationResults: {
      isValid: true
    }
  };
}

function createDialogContainer(store) {
  return mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );
}

const eventSnapshotClient = {
  getVisibleProducts: jest.fn(() => ({ Sessions: {} }))
};

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
      defaultUserSession: (x = {}) => x,
      registrationForm,
      regCartStatus: (x = {}) => x
    }),
    {
      text: {
        translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
      },
      registrationForm: {
        regCart: regCartWithGuestReg
      },
      regCartStatus: {
        lastSavedRegCart: regCartWithGuestReg
      },
      clients: { productVisibilityClient: eventSnapshotClient },
      website: EventSnapshot.eventSnapshot.siteEditor.website
    }
  );
}
