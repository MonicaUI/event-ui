import React from 'react';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import { mount } from 'enzyme';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import dialogContainerReducer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import {
  wait,
  createRegistrationType,
  createAdmissionItem,
  createSession,
  createRegCartWithGuestRegistrations,
  createConflictRegCartWithGuests,
  createQuantityItem,
  createDonationItem,
  createConflictRegCartWithOptOutFlags,
  createConflictRegCartWithAirOptOutChoiceSetToBooked
} from '../../../testUtils';

import {
  handleRegistrationTypeSelectionConflict,
  handleRegTypeConflictFromServiceValidationResult
} from '../RegistrationTypeSelectionConflictDialog';

jest.mock('../../../redux/registrationForm/regCart/registrationTypes');

let regCart;
let travelWorkflow;
let regCartInternal;
beforeEach(() => {
  jest.resetModules();
  regCart = require('../../../redux/registrationForm/regCart');
  regCart.unSelectAdmissionItem = jest.fn(() => ({ type: 'DummyAction' }));
  regCartInternal = require('../../../redux/registrationForm/regCart/internal');
  regCartInternal.updateAdmissionItemRegistration = jest.fn(() => {});
  travelWorkflow = require('../../../redux/travelCart/workflow');
  travelWorkflow.clearAirRequests = jest.fn(() => ({ type: 'DummyAction' }));
  travelWorkflow.clearGroupFlights = jest.fn(() => ({ type: 'DummyAction' }));
  regCartInternal.setAirRequestOptOutChoice = jest.fn(() => {});
});

jest.mock('../../../redux/registrationForm/regCart/guests');
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
jest.mock('../../../redux/registrationForm/regCart/sessionBundles', () => ({
  buildRegTypeSelectionConflictDialogResults: jest.fn(),
  buildUnregisterSessionBundlesInput: jest.fn(() => [{ type: 'DummyAction' }]),
  handleRegTypeConflictSessionBundles: jest.fn(() => ({ type: 'DummyAction' }))
}));
jest.mock('../../../widgets/RegistrationTypeWidget/RegistrationTypeWidget', () => ({
  routeToNewRegPath: jest.fn(() => ({ type: 'DummyAction' }))
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
jest.mock('../../../redux/actions', () => ({
  filterEventSnapshot: jest.fn(() => ({ type: 'DummyAction' }))
}));
jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => ({ type: 'DummyAction' }))
}));
jest.mock('../../../redux/registrationForm/regCart/partialUpdates');

const regCartWithGuestReg = createConflictRegCartWithGuests();
const regCartWithOptOutFlags = createConflictRegCartWithOptOutFlags();
const regCartWithOptOutChoice = createConflictRegCartWithAirOptOutChoiceSetToBooked();
const updateGuestDetails = jest.fn(() => () => {});

// eslint-disable-next-line jest/no-mocks-import
import { getMockedMessageContainer } from '../../__mocks__/documentElementMock';
import { TRAVEL_OPT_OUT_CHOICE } from 'event-widgets/utils/travelConstants';
import { FEATURE_RELEASE_DEVELOPMENT_VARIANT } from '@cvent/event-ui-experiments';

getMockedMessageContainer();

const initialState = {
  text: {
    translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
  },
  registrationForm: {
    currentEventRegistrationId: 'eventRegistrationId',
    currentGuestEventRegistration: {
      eventRegistrationId: 'guestEventRegId'
    },
    regCart: regCartWithGuestReg
  },
  regCartStatus: {
    lastSavedRegCart: regCartWithGuestReg
  },
  website: EventSnapshot.eventSnapshot.siteEditor.website,
  experiments: {
    featureRelease: FEATURE_RELEASE_DEVELOPMENT_VARIANT
  },
  event: {
    createdDate: new Date('2021-08-27T18:29:00Z')
  }
};

test('Dialog indicates there is an invalid admission item', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationTypeId: createRegistrationType().id,
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is an invalid session', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationTypeId: createRegistrationType().id,
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there are required session groups', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationTypeId: createRegistrationType().id,
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is an invalid admission item and invalid session', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationTypeId: createRegistrationType().id,
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue when there is invalid session when Guest change reg type will update Guest Evt Reg', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    guestEventRegId: {
      isValid: false,
      newRegistrationTypeId: createRegistrationType().id,
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
    }
  };
  sessionsUpdate.handleOptionalSessionsConflicts.mockImplementation(() => {
    return {
      type: 'UnregisterSessions',
      sessionRegistrations: {}
    };
  });
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults, updateGuestDetails));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(updateGuestDetails).toHaveBeenCalled();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../../redux/registrationForm/regCart/guests').setCurrentGuestEventRegistration).toHaveBeenCalled();
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/guests').setCurrentGuestEventRegistration
  ).toHaveBeenCalledWith({
    eventRegistrationId: 'guestEventRegId',
    type: 'UnregisterSessions',
    sessionRegistrations: {}
  });
  expect(
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
  ).not.toHaveBeenCalled();
});

test('Dialog indicates there is an invalid air booking conflicting with air request reg settings', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationTypeId: createRegistrationType().id,
    airRequestValidationResults: {
      isValid: false,
      invalidAirBookings: [
        {
          id: 'primaryInviteeAirBookingId',
          isForOther: false
        },
        {
          id: 'othersAirBookingId',
          isForOther: true
        },
        {
          id: 'guestAirBookingId',
          isForOther: false
        }
      ]
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is an invalid group flight booking conflicting with the group flightreg path setup', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    isValid: false,
    newRegistrationTypeId: createRegistrationType().id,
    groupFlightBookingValidationResults: {
      isValid: false,
      invalidGroupFlightBookings: [
        {
          id: 'BOOKING_ID_1',
          outboundGroupFlightId: 'GF_OB_1',
          returnGroupFlightId: 'GF_R_1'
        }
      ]
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue alters reg cart with invalid admission item and sessions and removes air/group flight bookings from travel cart in case of invalid air/group flight bookings', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
      isValid: false,
      newRegistrationTypeId: createRegistrationType().id,
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
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      },
      airRequestValidationResults: {
        isValid: false,
        invalidAirBookings: [
          {
            id: 'primaryInviteeAirBookingId',
            isForOther: false
          },
          {
            id: 'othersAirBookingId',
            isForOther: true
          },
          {
            id: 'guestAirBookingId',
            isForOther: false
          }
        ]
      },
      groupFlightBookingValidationResults: {
        isValid: false,
        invalidGroupFlightBookings: [
          {
            id: 'BOOKING_ID_1',
            outboundGroupFlightId: 'GF_OB_1',
            returnGroupFlightId: 'GF_R_1'
          }
        ]
      },
      quantityItemValidationResults: {
        isValid: true,
        invalidQuantityItems: []
      }
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(sessionsUpdate.handleOptionalSessionsConflicts).toHaveBeenCalled();
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
  expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
  expect(travelWorkflow.clearGroupFlights).toHaveBeenCalled();
});

test('Dialog indicates there is no guest registration allowed', () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../redux/registrationForm/regCart/guests').updateRegCartWithGuests.mockImplementation(() =>
    createRegCartWithGuestRegistrations()
  );
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is invalid quantity items', () => {
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Dialog indicates there is invalid donation items', () => {
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
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  expect(dialogContainer).toMatchSnapshot();
});

test('Clicking continue alters cart with no guest registrations', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../redux/registrationForm/regCart/guests').updateRegCartWithGuests.mockImplementation(() =>
    createRegCartWithGuestRegistrations()
  );
  const validationResults = {
    eventRegistrationId: {
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
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  expect(require('../../../redux/registrationForm/regCart/guests').updateRegCartWithGuests).toHaveBeenCalled();
});

test('Clicking continue for guest modal conflicts updates and calls regAPI with temporary guest info', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../redux/registrationForm/regCart/guests').updateRegCartWithGuests.mockImplementation(() =>
    createConflictRegCartWithGuests()
  );
  const validationResults = {
    guestEventRegId: {
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
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults, updateGuestDetails));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(updateGuestDetails).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid quantity items', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
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
        isValid: true,
        guestCount: 0
      },
      quantityItemValidationResults: {
        isValid: false,
        invalidQuantityItems: [createQuantityItem()]
      }
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(quantityUpdate.updateQuantity).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid donation item', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
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
        isValid: true,
        guestCount: 0
      },
      quantityItemValidationResults: {
        isValid: true,
        invalidQuantityItems: []
      },
      donationItemValidationResults: {
        isValid: false,
        invalidDonationItems: [createDonationItem()]
      }
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(donationUpdate.updateDonationAmount).toHaveBeenCalled();
});

test('Clicking continue alters cart with invalid admission items', async () => {
  const store = createStore();
  const dialogContainer = createDialogContainer(store);
  const validationResults = {
    eventRegistrationId: {
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
        isValid: true,
        guestCount: 0
      },
      quantityItemValidationResults: {
        isValid: true
      }
    }
  };
  store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
  dialogContainer.update();
  dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
  await wait(0);
  expect(regCartInternal.updateAdmissionItemRegistration).toHaveBeenCalled();
});

describe('handleRegTypeConflictSessionBundles with invalid session bundles', () => {
  it('Dialog indicates there is invalid session bundles', () => {
    const store = createStore();
    const dialogContainer = createDialogContainer(store);
    const validationResults = {
      isValid: false,
      newRegistrationType: createRegistrationType(),
      sessionBundlesValidationResults: {
        isValid: false,
        invalidSessionBundles: ['invalidSessionBundleId']
      }
    };
    store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
    expect(dialogContainer).toMatchSnapshot();
  });

  it('Clicking continue when no invalid session bundle will not handle session bundles', async () => {
    const store = createStore();
    const dialogContainer = createDialogContainer(store);
    const validationResults = [
      {
        eventRegistrationId: 'invitee-reg',
        productId: 'sessionBundle1',
        productType: 'Track',
        registrationTypeId: 'newRegTypeId'
      }
    ];
    sessionBundlesUpdate.buildRegTypeSelectionConflictDialogResults.mockImplementation(() => {
      return {
        regTypeId: 'newRegTypeId',
        sessionBundleValidationResults: {
          eventRegistrationId: {
            newRegistrationTypeId: 'newRegTypeId',
            sessionBundlesValidationResults: {
              invalidSessionBundles: [],
              isValid: true
            }
          }
        }
      };
    });
    store.dispatch(handleRegTypeConflictFromServiceValidationResult('eventRegistrationId', validationResults));
    dialogContainer.update();
    dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    await wait(0);
    expect(sessionBundlesUpdate.handleRegTypeConflictSessionBundles).not.toHaveBeenCalled();
  });

  it('Clicking continue when there is invalid session bundle will handle invalid session bundles', async () => {
    const store = createStore();
    const dialogContainer = createDialogContainer(store);
    const validationResults = {
      eventRegistrationId: {
        isValid: false,
        newRegistrationType: createRegistrationType(),
        sessionBundlesValidationResults: {
          isValid: false,
          invalidSessions: ['invalidSessionBundleId']
        }
      }
    };
    sessionBundlesUpdate.buildRegTypeSelectionConflictDialogResults.mockImplementation(() => {
      return {
        regTypeId: 'newRegTypeId',
        sessionBundleValidationResults: {
          eventRegistrationId: {
            newRegistrationTypeId: 'newRegTypeId',
            sessionBundlesValidationResults: {
              invalidSessionBundles: ['invalidSessionBundleId'],
              isValid: false
            }
          }
        }
      };
    });
    store.dispatch(handleRegTypeConflictFromServiceValidationResult('eventRegistrationId', validationResults));
    dialogContainer.update();
    dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    await wait(0);
    expect(sessionBundlesUpdate.handleRegTypeConflictSessionBundles).toHaveBeenCalled();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
    ).toHaveBeenCalled();
  });

  it('Guest Clicking continue when there is invalid session bundle will handle updateGuestDetail The air opt out flags remains the same ie OPT_OUT since no conflict', async () => {
    const primaryEventRegId = 'eventRegistrationId';
    const store = createStore();
    const dialogContainer = createDialogContainer(store);
    const validationResults = {
      guestEventRegId: {
        isValid: false,
        newRegistrationType: createRegistrationType(),
        sessionBundlesValidationResults: {
          isValid: false,
          invalidSessions: ['invalidSessionBundleId']
        }
      }
    };
    sessionBundlesUpdate.buildRegTypeSelectionConflictDialogResults.mockImplementation(() => {
      return {
        regTypeId: 'newRegTypeId',
        sessionBundleValidationResults: {
          guestEventRegId: {
            newRegistrationTypeId: 'newRegTypeId',
            sessionBundlesValidationResults: {
              invalidSessionBundles: ['invalidSessionBundleId'],
              isValid: false
            }
          }
        }
      };
    });
    sessionBundlesUpdate.handleRegTypeConflictSessionBundles.mockImplementation(() => {
      return {
        type: 'UnregisterSessionBundles',
        sessionBundleRegistrations: {},
        sessionRegistrations: {}
      };
    });
    store.dispatch(
      handleRegTypeConflictFromServiceValidationResult('guestEventRegId', validationResults, updateGuestDetails)
    );
    dialogContainer.update();
    dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    await wait(0);
    expect(sessionBundlesUpdate.handleRegTypeConflictSessionBundles).toHaveBeenCalled();
    expect(updateGuestDetails).toHaveBeenCalled();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../redux/registrationForm/regCart/guests').setCurrentGuestEventRegistration
    ).toHaveBeenCalled();
    expect(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../redux/registrationForm/regCart/guests').setCurrentGuestEventRegistration
    ).toHaveBeenCalledWith({
      eventRegistrationId: 'guestEventRegId',
      type: 'UnregisterSessionBundles',
      sessionBundleRegistrations: {},
      sessionRegistrations: {}
    });
    expect(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../../../redux/registrationForm/regCart/partialUpdates').applyPartialEventRegistrationUpdate
    ).not.toHaveBeenCalled();
    expect(
      store.getState().registrationForm.regCart.eventRegistrations[primaryEventRegId].attendee.airOptOutChoice
    ).toEqual(TRAVEL_OPT_OUT_CHOICE.OPT_OUT);
  });
});

describe('handleRegTypeConflict and set the airoptoutchoice correctly', () => {
  const createLocalStore = newState =>
    createStoreWithMiddleware(
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
        defaultUserSession: (x = {}) => x,
        regCartStatus: (x = {}) => x
      }),
      newState
    );

  const validationResultsLocal = {
    eventRegistrationId: {
      isValid: false,
      newRegistrationTypeId: createRegistrationType().id,
      admissionItemValidationResults: {
        isValid: true
      },
      sessionsValidationResults: {
        isValid: true
      },
      sessionGroupValidationResults: {
        isValid: true
      },
      guestRegistrationsValidationResults: {
        isValid: true
      },
      airRequestAdvancedRuleValidationResults: {
        isValid: false,
        invalidAirBookings: [{}, {}]
      },
      airRequestValidationResults: {
        isValid: false,
        invalidAirBookings: [
          {
            id: 'primaryInviteeAirBookingId',
            isForOther: false
          },
          {
            id: 'othersAirBookingId',
            isForOther: true
          },
          {
            id: 'guestAirBookingId',
            isForOther: false
          }
        ]
      },
      groupFlightBookingValidationResults: {
        isValid: false,
        invalidGroupFlightBookings: [
          {
            id: 'BOOKING_ID_1',
            outboundGroupFlightId: 'GF_OB_1',
            returnGroupFlightId: 'GF_R_1'
          }
        ]
      },
      quantityItemValidationResults: {
        isValid: true,
        invalidQuantityItems: []
      }
    }
  };

  const newLocalState = {
    ...initialState,
    registrationForm: {
      currentEventRegistrationId: 'eventRegistrationId',
      currentGuestEventRegistration: {
        eventRegistrationId: 'guestEventRegId'
      },
      regCart: regCartWithOptOutFlags
    },
    regCartStatus: {
      lastSavedRegCart: regCartWithOptOutFlags
    }
  };

  it('Clicking continue alters reg cart removes air booking travel cart in case of invalid air bookings and set correct optout flag', async () => {
    const primaryEventRegId = 'eventRegistrationId';
    const newState = { ...newLocalState };
    const store = createLocalStore(newState);
    const dialogContainer = createDialogContainer(store);
    const validationResults = { ...validationResultsLocal };
    store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
    dialogContainer.update();
    dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    await wait(0);
    expect(travelWorkflow.clearAirRequests).toHaveBeenCalled();
    expect(
      store.getState().registrationForm.regCart.eventRegistrations[primaryEventRegId].attendee.airOptOutChoice
    ).toEqual(TRAVEL_OPT_OUT_CHOICE.NOT_APPLICABLE);
  });

  it('Clicking continue alters reg cart removes Group Flight booking travel cart in case of invalid group flight bookings and keeps the optout choice unchanged since there is no invalid air request', async () => {
    const primaryEventRegId = 'eventRegistrationId';
    const newState = {
      ...newLocalState,
      registrationForm: {
        regCart: regCartWithOptOutChoice
      },
      regCartStatus: {
        lastSavedRegCart: regCartWithOptOutChoice
      }
    };
    const store = createLocalStore(newState);
    const dialogContainer = createDialogContainer(store);
    const validationResults = {
      ...validationResultsLocal,
      airRequestAdvancedRuleValidationResults: {
        isValid: true
      },
      airRequestValidationResults: {
        isValid: true
      }
    };
    store.dispatch(handleRegistrationTypeSelectionConflict(validationResults));
    dialogContainer.update();
    dialogContainer.find('[data-cvent-id="continue-selection"]').hostNodes().simulate('click');
    await wait(0);
    expect(travelWorkflow.clearGroupFlights).toHaveBeenCalled();
    expect(
      store.getState().registrationForm.regCart.eventRegistrations[primaryEventRegId].attendee.airOptOutChoice
    ).toEqual(TRAVEL_OPT_OUT_CHOICE.BOOKED);
  });
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
      defaultUserSession: (x = {}) => x,
      regCartStatus: (x = {}) => x
    }),
    initialState
  );
}
