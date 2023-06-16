/* eslint-env jest */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  updateSessions,
  unSelectSession,
  selectSession,
  switchSession,
  handleOptionalSessionsConflicts
} from '../sessions';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import { updateIn } from 'icepick';
// eslint-disable-next-line jest/no-mocks-import
import {
  regCartId,
  primaryEventRegId,
  getState,
  dummyCapacitySummaries,
  selectedSessionId,
  waitlistedSessionId,
  response,
  RegCartClient,
  unSelectedSessionId,
  nonWaitlistedSessionId
} from '../__mocks__/sessions';
import * as guestsideCapacityActions from '../../../capacity';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { GraphQLSiteEditorDataReleases } from '../../../../ExperimentHelper';

const loadAvailableSessionCapacityCounts = jest.spyOn(guestsideCapacityActions, 'loadAvailableSessionCapacityCounts');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const errors = require('../../errors');
errors.getUpdateErrors.isProductAvailabilityError = jest.fn();
errors.getUpdateErrors.isProductAvailabilityErrorInHybridEvent = jest.fn();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pageContents = require('../../../website/pageContents');
pageContents.sessionsAppearOnSamePageAsPayment = jest.fn(() => false);

jest.mock('../../../../apollo/siteEditor/pageVarietyPathQueryHooks');

jest.mock('../../../../dialogs/CapacityReachedDialog', () => {
  return {
    openCapacityReachedDialog: () => jest.fn()
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const partialUpdates = require('../partialUpdates');
const middlewares = [thunk.withExtraArgument({ apolloClient: {} })];
const mockStore = configureMockStore(middlewares);

const regCartPricing = {
  regCartPricing: {
    netFeeAmountCharge: 0,
    netFeeAmountRefund: 0,
    productFeeAmountCharge: 0,
    productFeeAmountRefund: 0,
    productSubTotalAmountCharge: 0,
    productSubTotalAmountRefund: 0,
    regCartId
  }
};

RegCartClient.prototype.getCapacitySummaries = jest.fn(() => {
  return dummyCapacitySummaries;
});
RegCartClient.prototype.updateRegCartSessionRegistrations = jest.fn(() => ({ regCart: response.regCart }));

RegCartClient.prototype.updateRegCart = jest.fn(() => ({ regCart: response.regCart }));

RegCartClient.prototype.calculateRegCartPricing = jest.fn(() => regCartPricing);

let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Off;
jest.mock('../../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData,
  useGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('sessions using %s site editor data', (description, experimentStatus) => {
  // fresh references in each test cases
  let store;
  let regCartClient;
  let updatedRegCart;
  let eventRegistrationId;
  beforeEach(() => {
    jest.clearAllMocks(); // clear counters in jest mock functions
    store = mockStore(getState());
    regCartClient = store.getState().clients.regCartClient;
    eventRegistrationId = primaryEventRegId;
    partialUpdates.getAttendeeFieldValues = jest.fn(() => {
      return {
        personalInformation: {
          contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
          firstName: 'test',
          lastName: 'test',
          emailAddress: 'akdo@j.mail',
          primaryAddressType: 'WORK'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      };
    });
    mockUseGraphQLSiteEditorData = experimentStatus;
  });

  test('updates a regCart with session', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            requestedAction: REQUESTED_ACTIONS.REGISTER
          }
        }
      };
    });
    const sessionId = 'sessionId';
    const requestedAction = REQUESTED_ACTIONS.REGISTER;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    await store.dispatch(
      updateSessions([
        {
          eventRegistrationId,
          productId: sessionId,
          requestedAction,
          registrationSourceType: 'Selected'
        }
      ])
    );
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('handling session is unavailable error when trying to update session', async () => {
    const sessionId = 'sessionId';
    const requestedAction = REQUESTED_ACTIONS.REGISTER;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => {
      throw new Error();
    });
    try {
      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: sessionId,
            requestedAction,
            registrationSourceType: 'Selected'
          }
        ])
      );
    } catch (error) {
      errors.getUpdateErrors.isProductAvailabilityError.mockImplementation(() => {
        return true;
      });
      // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
      expect(store.getActions()).toMatchSnapshot();
    }
  });

  test('handling session is unavailable error when trying to update session in hybrid event', async () => {
    const newState = {
      ...getState(),
      event: {
        ...getState().event,
        attendingFormat: AttendingFormat.HYBRID
      }
    };
    errors.getUpdateErrors.isProductAvailabilityError.mockImplementation(() => {
      return false;
    });
    const customStore = mockStore(newState);
    regCartClient = customStore.getState().clients.regCartClient;
    const sessionId = 'sessionId';
    const requestedAction = REQUESTED_ACTIONS.REGISTER;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => {
      throw new Error();
    });
    try {
      await customStore.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: sessionId,
            requestedAction,
            registrationSourceType: 'Selected'
          }
        ])
      );
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
      expect(errors.getUpdateErrors.isProductAvailabilityErrorInHybridEvent).toHaveBeenCalled();
    }
  });

  test('unselect a session', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            requestedAction: REQUESTED_ACTIONS.UNREGISTER
          }
        }
      };
    });
    const sessionId = 'sessionId';
    const requestedAction = REQUESTED_ACTIONS.UNREGISTER;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    await store.dispatch(unSelectSession(eventRegistrationId, sessionId));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const sessionRegistrations =
      actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionRegistrations;
    expect(sessionRegistrations[selectedSessionId].requestedAction).toEqual(requestedAction);
  });

  test('select a session', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            requestedAction: REQUESTED_ACTIONS.REGISTER
          }
        }
      };
    });
    const sessionId = 'sessionId';
    const requestedAction = REQUESTED_ACTIONS.REGISTER;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    await store.dispatch(selectSession(eventRegistrationId, sessionId));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const sessionRegistrations =
      actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionRegistrations;
    expect(sessionRegistrations[selectedSessionId].requestedAction).toEqual(requestedAction);
  });

  test('not able to waitlist a session that cannot be waitlisted', async () => {
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    await store.dispatch(selectSession(eventRegistrationId, nonWaitlistedSessionId, true));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(0);
  });

  test('switch sessions', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            requestedAction: REQUESTED_ACTIONS.REGISTER
          },
          [unSelectedSessionId]: {
            productId: unSelectedSessionId,
            requestedAction: REQUESTED_ACTIONS.UNREGISTER
          }
        }
      };
    });
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    await store.dispatch(switchSession(eventRegistrationId, unSelectedSessionId, selectedSessionId, false));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const sessionRegistrations =
      actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionRegistrations;
    expect(sessionRegistrations[selectedSessionId].requestedAction).toEqual(REQUESTED_ACTIONS.REGISTER);
    expect(sessionRegistrations[unSelectedSessionId].requestedAction).toEqual(REQUESTED_ACTIONS.UNREGISTER);
  });

  test('switch sessions from regular to waitlist', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionRegistrations: {
          [unSelectedSessionId]: {
            productId: unSelectedSessionId,
            requestedAction: REQUESTED_ACTIONS.UNREGISTER
          }
        },
        sessionWaitlists: {
          [unSelectedSessionId]: {
            productId: unSelectedSessionId,
            requestedAction: REQUESTED_ACTIONS.WAITLIST
          }
        }
      };
    });
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    await store.dispatch(switchSession(eventRegistrationId, unSelectedSessionId, unSelectedSessionId, true));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const eventRegistration = actions[1].payload.regCart.eventRegistrations[eventRegistrationId];
    expect(eventRegistration.sessionRegistrations[unSelectedSessionId].requestedAction).toEqual(
      REQUESTED_ACTIONS.UNREGISTER
    );
    expect(eventRegistration.sessionWaitlists[unSelectedSessionId].requestedAction).toEqual(REQUESTED_ACTIONS.WAITLIST);
  });

  test('handle conflicted optional sessions while changing admission item/reg type', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionRegistrations: {
          [unSelectedSessionId]: {
            productId: unSelectedSessionId,
            requestedAction: REQUESTED_ACTIONS.UNREGISTER
          }
        }
      };
    });
    const invalidSessions = [
      {
        id: unSelectedSessionId
      }
    ];
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    const sessionRegUpdate = await store.dispatch(
      handleOptionalSessionsConflicts(eventRegistrationId, invalidSessions)
    );
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    expect(sessionRegUpdate).toBeDefined();
    expect(sessionRegUpdate.sessionRegistrations).toBeDefined();
    expect(sessionRegUpdate.sessionRegistrations).toEqual({
      unSelectedSessionId: {
        productId: unSelectedSessionId,
        requestedAction: REQUESTED_ACTIONS.UNREGISTER
      }
    });
    const actions = store.getActions();
    const sessionRegistrations =
      actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionRegistrations;
    expect(sessionRegistrations[unSelectedSessionId].requestedAction).toEqual(REQUESTED_ACTIONS.UNREGISTER);
  });

  test('join waitlist for a session', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionWaitlists: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            requestedAction: REQUESTED_ACTIONS.WAITLIST
          }
        }
      };
    });
    const requestedAction = REQUESTED_ACTIONS.WAITLIST;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));

    await store.dispatch(selectSession(eventRegistrationId, selectedSessionId, true));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const sessionWaitlists = actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionWaitlists;
    expect(sessionWaitlists[selectedSessionId].requestedAction).toEqual(requestedAction);
  });

  test('leave waitlist for a session', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionWaitlists: {
          [waitlistedSessionId]: {
            productId: waitlistedSessionId,
            requestedAction: REQUESTED_ACTIONS.LEAVE_WAITLIST
          }
        }
      };
    });
    const requestedAction = REQUESTED_ACTIONS.LEAVE_WAITLIST;
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));

    await store.dispatch(unSelectSession(eventRegistrationId, waitlistedSessionId, true));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const sessionWaitlists = actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionWaitlists;
    expect(sessionWaitlists[waitlistedSessionId].requestedAction).toEqual(requestedAction);
  });

  test('switching to join waitlist for a session when waitlisting is disabled', async () => {
    updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        sessionWaitlists: {
          [waitlistedSessionId]: {
            productId: waitlistedSessionId,
            requestedAction: REQUESTED_ACTIONS.WAITLIST
          }
        }
      };
    });
    regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));

    await store.dispatch(switchSession(eventRegistrationId, nonWaitlistedSessionId, waitlistedSessionId, true));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const actions = store.getActions();
    const sessionWaitlists = actions[1].payload.regCart.eventRegistrations[eventRegistrationId].sessionWaitlists;
    expect(sessionWaitlists[nonWaitlistedSessionId]).toBeUndefined();
  });

  describe('update session with capacity control from UI only', () => {
    test('unregister session should always make capacity service call with all event sessions capacity ids', async () => {
      // setup
      partialUpdates.SESSION_THRESHOLD = 100;
      // unregister session during initial registration will clear the session registration
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {}
        };
      });
      regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
      // execute
      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: 'limitedSelectedSession',
            requestedAction: REQUESTED_ACTIONS.UNREGISTER,
            registrationSourceType: 'Selected'
          }
        ])
      );
      // verify
      expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledTimes(1);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledWith([
        'sessionId',
        'limitedSelectedSession',
        'limitedUnSelectedSession',
        'unSelectedSessionId'
      ]);
      expect(store.getActions()).toMatchSnapshot();
    });
    test('register session should only make capacity service call if session counter is less than threshold', async () => {
      // setup
      partialUpdates.SESSION_THRESHOLD = 100;
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            limitedUnSelectedSession: {
              productId: 'limitedUnSelectedSession',
              requestedAction: REQUESTED_ACTIONS.REGISTER
            }
          }
        };
      });
      regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
      // execute
      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: 'limitedUnSelectedSession',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'Selected'
          }
        ])
      );
      // verify
      expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledTimes(1);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledWith([
        'sessionId',
        'limitedSelectedSession',
        'limitedUnSelectedSession',
        'unSelectedSessionId'
      ]);
      expect(store.getActions()).toMatchSnapshot();
    });
    test('register session should not make capacity service call if session counter is greater than threshold', async () => {
      // setup
      partialUpdates.SESSION_THRESHOLD = 2;
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            limitedUnSelectedSession: {
              productId: 'limitedUnSelectedSession',
              requestedAction: REQUESTED_ACTIONS.REGISTER
            }
          }
        };
      });
      regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
      // execute
      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: 'limitedUnSelectedSession',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'Selected'
          }
        ])
      );
      // verify
      expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledTimes(0);
      expect(store.getActions()).toMatchSnapshot();
    });
    test('re-register already registered session should not decrease session capacity count', async () => {
      // setup
      partialUpdates.SESSION_THRESHOLD = 2;
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            limitedSelectedSession: {
              productId: 'limitedSelectedSession',
              requestedAction: REQUESTED_ACTIONS.REGISTER
            }
          }
        };
      });
      regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
      // execute
      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: 'limitedSelectedSession',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'Selected'
          }
        ])
      );
      // verify
      expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledTimes(0);
      expect(store.getActions()).toMatchSnapshot();
    });
    test('unregister then register session during regMod which registered already should not decrease session capacity count', async () => {
      // setup
      partialUpdates.SESSION_THRESHOLD = 2;
      // fyi: unregister session during regMod will still return session registration but as unregistered
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            limitedSelectedSession: {
              productId: 'limitedSelectedSession',
              requestedAction: REQUESTED_ACTIONS.UNREGISTER
            }
          },
          regMod: true
        };
      });
      regCartClient.updateRegCartSessionRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
      // execute
      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: 'limitedSelectedSession',
            requestedAction: REQUESTED_ACTIONS.UNREGISTER,
            registrationSourceType: 'Selected'
          }
        ])
      );

      await store.dispatch(
        updateSessions([
          {
            eventRegistrationId,
            productId: 'limitedSelectedSession',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'Selected'
          }
        ])
      );
      // verify
      expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(2);
      expect(loadAvailableSessionCapacityCounts).toHaveBeenCalledTimes(1);
      expect(store.getActions()).toMatchSnapshot();
    });
  });

  describe('tests for sessions with product questions', () => {
    test('question visibility not called when session is selected for which no question exists', async () => {
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            [selectedSessionId]: {
              productId: selectedSessionId,
              requestedAction: REQUESTED_ACTIONS.REGISTER
            }
          }
        };
      });
      const sessionId = 'sessionId';
      regCartClient.evaluateVisibilityLogic = jest.fn(() => Object.assign({ eventRegistrationId: {} }));
      await store.dispatch(selectSession(eventRegistrationId, sessionId));
      expect(regCartClient.evaluateVisibilityLogic).not.toHaveBeenCalled();
    });

    test('question visibility called when session is selected for which question exists', async () => {
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            [selectedSessionId]: {
              productId: selectedSessionId,
              requestedAction: REQUESTED_ACTIONS.REGISTER
            }
          }
        };
      });
      const sessionId = 'sessionId';
      let localState = getState();
      const regPathId = Object.keys(localState.appData.registrationPathSettings)[0];
      localState = {
        ...localState,
        appData: {
          ...localState.appData,
          registrationSettings: {
            ...localState.appData.registrationSettings,
            productQuestions: {
              questionId: {
                productQuestionAssociations: ['limitedSelectedSession'],
                registrationPathQuestionAssociations: regPathId,
                question: {
                  visibilityLogic: {
                    filters: ['filter']
                  }
                }
              }
            }
          }
        }
      };
      store = mockStore(localState);
      regCartClient = store.getState().clients.regCartClient;
      regCartClient.evaluateVisibilityLogic = jest.fn(() => Object.assign({ eventRegistrationId: {} }));
      await store.dispatch(selectSession(eventRegistrationId, sessionId));
      expect(regCartClient.evaluateVisibilityLogic).toHaveBeenCalledTimes(1);
    });

    test('question visibility not called when session is unselected', async () => {
      updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
        return {
          ...eventReg,
          sessionRegistrations: {
            [selectedSessionId]: {
              productId: selectedSessionId,
              requestedAction: REQUESTED_ACTIONS.REGISTER
            }
          }
        };
      });
      const sessionId = 'sessionId';
      let localState = getState();
      const regPathId = Object.keys(localState.appData.registrationPathSettings)[0];
      localState = {
        ...localState,
        appData: {
          ...localState.appData,
          registrationSettings: {
            ...localState.appData.registrationSettings,
            productQuestions: {
              questionId: {
                productQuestionAssociations: [sessionId],
                registrationPathQuestionAssociations: regPathId,
                question: {
                  visibilityLogic: {
                    filters: ['filter']
                  }
                }
              }
            }
          }
        }
      };
      store = mockStore(localState);
      regCartClient = store.getState().clients.regCartClient;
      regCartClient.evaluateVisibilityLogic = jest.fn(() => Object.assign({ eventRegistrationId: {} }));
      await store.dispatch(unSelectSession(eventRegistrationId, sessionId));
      expect(regCartClient.evaluateVisibilityLogic).not.toHaveBeenCalled();
    });
  });
});
