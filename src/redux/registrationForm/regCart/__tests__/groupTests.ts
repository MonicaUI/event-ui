import {
  removeEventRegistrationFromRegCart,
  removeGroupMembersFromRegCart,
  getVisibleRegTypes,
  navigateToGroupMemberRegistration
} from '../group';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import * as guests from '../guests';
import { loadRegistrationContent } from '../../../actions';
import { AppDispatch } from '../../../reducer';

// @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(regCartWithUpdates: any, should... Remove this comment to see the full error message
jest.spyOn(guests, 'updateGuestsInRegCart').mockImplementation((regCartWithUpdates, shouldAddTempGuestInfo = false) => {
  return dispatch => {
    dispatch({
      type: '[MOCK]/updateGuestsInRegCart',
      payload: {
        regCartWithUpdates,
        shouldAddTempGuestInfo
      }
    });
  };
});

jest.mock('../../../actions', () => {
  return {
    filterEventSnapshot: jest.fn(() => () => {}),
    loadRegistrationContent: jest.fn(() => () => {})
  };
});

jest.mock('../../../pathInfo', () => {
  return {
    routeToFirstPageOfRegistrationForGroup: jest.fn(() => () => {})
  };
});

describe('removeEventRegistrationFromRegCart', () => {
  it('should return a REMOVE_EVENT_REGISTRATION_ID action', () => {
    expect(removeEventRegistrationFromRegCart('test-id')).toMatchSnapshot();
  });
});

describe('thunk action creators', () => {
  const initialState = {
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId'
          }
        }
      }
    },
    eventSnapshotVersion: 'eventSnapshotVersion',
    registrationForm: {
      regCart: {
        groupRegistration: true,
        eventRegistrations: {
          groupLeader1: {
            eventRegistrationId: 'groupLeader1',
            attendeeType: 'GROUP_LEADER',
            requestedAction: 'REGISTER',
            displaySequence: 1
          },
          groupMember1: {
            eventRegistrationId: 'groupMember1',
            primaryRegistrationId: 'groupLeader1',
            attendeeType: 'ATTENDEE',
            requestedAction: 'REGISTER',
            displaySequence: 2
          },
          guest1: {
            eventRegistrationId: 'guest1',
            primaryRegistrationId: 'groupMember1',
            attendeeType: 'GUEST',
            requestedAction: 'REGISTER',
            displaySequence: 3
          }
        }
      }
    },
    actions: []
  };

  let getState = () => ({});

  const reducer = jest.fn((state = initialState, action) => {
    getState = () => state;
    // this prevents radomized @@redux/init entries from being added to snapshots which breaks predictability
    if (!action.type.includes('@@redux/INIT')) {
      state.actions.push(action);
    }
    return state;
  });

  const store = createStore(reducer, applyMiddleware(thunkMiddleware));

  describe('removeGroupMembersFromRegCart', () => {
    it('should dispatch actions', async () => {
      await (store.dispatch as AppDispatch)(removeGroupMembersFromRegCart(['groupMember1']));

      expect(reducer).toHaveBeenCalledTimes(2);
      expect(getState()).toMatchSnapshot();
    });
  });

  describe('navigateToGroupMemberRegistration', () => {
    it('test new reg content loaded after group member navigation', async () => {
      await store.dispatch(navigateToGroupMemberRegistration('groupMember1'));

      const state = store.getState();
      expect(
        state.actions.filter(
          action =>
            action.type === 'event-guestside-site/regCart/SET_CURRENT_EVENT_REGISTRATION_ID' &&
            action.payload.currentEventRegistrationId === 'groupMember1'
        ).length
      ).toBe(1);
      expect(loadRegistrationContent).toHaveBeenCalled();
    });
  });
});

describe('getVisibleRegistrationTypes', () => {
  it('should generate the proper visible registration types', () => {
    const initialState = {
      appData: {
        registrationSettings: {
          registrationPaths: {
            registrationPath1: {
              accessRules: {
                invitationListAccess: {
                  type: 2,
                  isEmailOnlyInvite: true
                }
              },
              associatedRegistrationTypes: ['registrationType1'],
              name: 'Registration Path 1 - Hidden'
            },
            registrationPath2: {
              accessRules: {
                invitationListAccess: {
                  type: 1,
                  isEmailOnlyInvite: false
                }
              },
              associatedRegistrationTypes: ['registrationType2'],
              name: 'Registration Path 2 - Visible'
            },
            registrationPath3: {
              accessRules: {
                invitationListAccess: {
                  type: 1,
                  isEmailOnlyInvite: false
                }
              },
              associatedRegistrationTypes: ['registrationType3'],
              name: 'Registration Path 3 - Visible'
            }
          }
        }
      }
    };
    const openRegTypes = [
      {
        id: 'registrationType1',
        name: 'Reg Type 1 - Hidden'
      },
      {
        id: 'registrationType2',
        name: 'Reg Type 2 - Visible'
      },
      {
        id: 'registrationType3',
        name: 'Reg Type 3 - Visible'
      }
    ];
    const visibleRegTypes = getVisibleRegTypes(openRegTypes, initialState, false, null);
    expect(visibleRegTypes).toEqual([
      {
        id: 'registrationType2',
        name: 'Reg Type 2 - Visible'
      },
      {
        id: 'registrationType3',
        name: 'Reg Type 3 - Visible'
      }
    ]);
  });
  it('test visible registration types for public events', () => {
    const initialState = {
      appData: {
        registrationSettings: {
          registrationPaths: {
            registrationPath1: {
              accessRules: {
                invitationListAccess: {
                  type: 1,
                  isEmailOnlyInvite: true
                }
              },
              associatedRegistrationTypes: ['registrationType1'],
              name: 'Registration Path 1 - Hidden'
            },
            registrationPath2: {
              accessRules: {
                invitationListAccess: {
                  type: 1,
                  isEmailOnlyInvite: false
                }
              },
              associatedRegistrationTypes: ['registrationType2'],
              name: 'Registration Path 2 - Visible'
            },
            registrationPath3: {
              accessRules: {
                invitationListAccess: {
                  type: 1,
                  isEmailOnlyInvite: false
                }
              },
              associatedRegistrationTypes: ['registrationType3'],
              name: 'Registration Path 3 - Visible'
            }
          }
        }
      }
    };
    const openRegTypes = [
      {
        id: 'registrationType1',
        name: 'Reg Type 1 - Hidden'
      },
      {
        id: 'registrationType2',
        name: 'Reg Type 2 - Visible'
      },
      {
        id: 'registrationType3',
        name: 'Reg Type 3 - Visible'
      }
    ];
    const visibleRegTypes = getVisibleRegTypes(openRegTypes, initialState, false, null);
    expect(visibleRegTypes).toEqual(openRegTypes);
  });
});
