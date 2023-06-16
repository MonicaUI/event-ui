import {
  getCurrentRegistrantAndGuests,
  getRegistrationTypeIdsForCurrentRegistrantsAndGuests,
  isSessionBeingUnregistered
} from '../productSelectors';
import { ATTENDEE_TYPE } from 'event-widgets/constants/Attendee';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';

describe('current registrant and guests', () => {
  const state = {
    registrationForm: {
      currentEventRegistrationId: 'groupMember',
      regCart: {
        eventRegistrations: {
          groupLeader: {
            eventRegistrationId: 'groupLeader',
            attendeeType: ATTENDEE_TYPE.GROUP_LEADER,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationTypeId: 'a',
            primaryRegistrationId: '',
            attendee: {
              personalInformation: {
                firstName: 'foo',
                lastName: 'bar'
              }
            }
          },
          groupLeaderGuest: {
            eventRegistrationId: 'groupLeaderGuest',
            attendeeType: ATTENDEE_TYPE.GUEST,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationTypeId: 'b',
            primaryRegistrationId: 'groupLeader',
            attendee: {
              personalInformation: {
                firstName: 'foo',
                lastName: 'bar'
              }
            }
          },
          groupMember: {
            eventRegistrationId: 'groupMember',
            attendeeType: ATTENDEE_TYPE.ATTENDEE,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationTypeId: 'a',
            primaryRegistrationId: '',
            attendee: {
              personalInformation: {
                firstName: 'foo',
                lastName: 'bar'
              }
            }
          },
          groupMemberGuest1: {
            eventRegistrationId: 'groupMemberGuest1',
            attendeeType: ATTENDEE_TYPE.GUEST,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationTypeId: 'b',
            primaryRegistrationId: 'groupMember',
            attendee: {
              personalInformation: {
                firstName: 'foo',
                lastName: 'bar'
              }
            }
          },
          groupMemberGuest2: {
            eventRegistrationId: 'groupMemberGuest2',
            attendeeType: ATTENDEE_TYPE.GUEST,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationTypeId: 'b',
            primaryRegistrationId: 'groupMember',
            attendee: {
              personalInformation: {
                firstName: 'foo',
                lastName: 'bar'
              }
            }
          }
        }
      }
    }
  };

  describe('getCurrentRegistrantAndGuests', () => {
    it('should return the current registrant and its guests', () => {
      const result = getCurrentRegistrantAndGuests(state);
      const eventRegistrationsFromState = state.registrationForm.regCart.eventRegistrations;
      expect(result).toEqual(
        expect.arrayContaining([
          eventRegistrationsFromState.groupMember,
          eventRegistrationsFromState.groupMemberGuest1,
          eventRegistrationsFromState.groupMemberGuest2
        ])
      );
    });

    it('should return empty array when no primary registrant', () => {
      const newState = {};
      const result = getCurrentRegistrantAndGuests(newState);
      expect(result).toEqual([]);
    });
  });

  describe('getRegistrationTypeIdsForCurrentRegistrantsAndGuests', () => {
    it('should return the unique reg type ids of the current registrant and its guests', () => {
      const result = getRegistrationTypeIdsForCurrentRegistrantsAndGuests(state);
      expect(result).toEqual(expect.arrayContaining(['a', 'b']));
    });
  });
});
describe('isSessionBeingUnregistered', () => {
  const state = {
    registrationForm: {
      currentEventRegistrationId: 'attendee',
      regCart: {
        eventRegistrations: {
          attendee: {
            eventRegistrationId: 'attendee',
            attendeeType: ATTENDEE_TYPE.ATTENDEE,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            attendee: {
              personalInformation: {
                firstName: 'foo',
                lastName: 'bar'
              }
            },
            sessionRegistrations: {
              ' session ': {
                requestedAction: REQUESTED_ACTIONS.UNREGISTER,
                productId: 'session',
                includedInAgenda: false
              }
            }
          }
        }
      }
    }
  };
  test('should return session as unregistered when requested action is unregister', () => {
    const result = isSessionBeingUnregistered(state, 'session');
    expect(result).toEqual(true);
  });
});
