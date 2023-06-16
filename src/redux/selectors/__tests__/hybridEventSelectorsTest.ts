import { ATTENDEE_TYPE } from 'event-widgets/constants/Attendee';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import {
  getHasCurrentRegistrationAtLeastOneInPersonAttendee,
  getHasCurrentRegistrationAtLeastOneVirtualAttendee
} from '../hybridEventSelectors';

const getState = ({
  currentEventRegistrationId,
  leaderAttendingFormat,
  leaderGuestAttendingFormat,
  memberAttendingFormat,
  memberGuestAttendingFormat,
  eventAttendingFormat
}) => ({
  registrationForm: {
    currentEventRegistrationId,
    regCart: {
      groupRegistration: true,
      eventRegistrations: {
        leader: {
          attendeeType: ATTENDEE_TYPE.GROUP_LEADER,
          registrationPathId: 'leaderRegPathId',
          attendingFormatId: leaderAttendingFormat
        },
        member: {
          attendeeType: ATTENDEE_TYPE.ATTENDEE,
          registrationPathId: 'memberRegPathId',
          primaryRegistrationId: 'leader',
          attendingFormatId: memberAttendingFormat
        },
        leaderGuest: {
          attendeeType: ATTENDEE_TYPE.GUEST,
          eventRegistrationId: 'leaderGuest',
          primaryRegistrationId: 'leader',
          registrationPathId: 'leaderRegPathId',
          registrationTypeId: 'rt1',
          requestedAction: REQUESTED_ACTIONS.REGISTER,
          attendingFormatId: leaderGuestAttendingFormat
        },
        memberGuest: {
          attendeeType: ATTENDEE_TYPE.GUEST,
          eventRegistrationId: 'memberGuest',
          primaryRegistrationId: 'member',
          registrationPathId: 'memberRegPathId',
          registrationTypeId: 'rt2',
          requestedAction: REQUESTED_ACTIONS.REGISTER,
          attendingFormatId: memberGuestAttendingFormat
        }
      }
    }
  },
  event: {
    attendingFormat: eventAttendingFormat
  },
  website: {},
  appData: {
    registrationSettings: {
      registrationPaths: {
        leaderRegPathId: {
          id: 'leaderRegPathId',
          allowGroupRegistration: true,
          groupRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: true,
              categorizedRegistrationTypes: ['rt1']
            }
          },
          guestRegistrationSettings: {
            isGuestRegistrationEnabled: true
          }
        },
        memberRegPathId: {
          id: 'memberRegPathId',
          allowGroupRegistration: true,
          groupRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: true,
              categorizedRegistrationTypes: ['rt2']
            }
          },
          guestRegistrationSettings: {
            isGuestRegistrationEnabled: true
          }
        }
      }
    }
  }
});

describe('getHasCurrentRegistrationAtLeastOneInPersonAttendee', () => {
  it('returns true when group leader is in person and its guest is virtual', async () => {
    const params = {
      currentEventRegistrationId: 'leader',
      leaderAttendingFormat: AttendingFormat.INPERSON,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.VIRTUAL,
      memberGuestAttendingFormat: AttendingFormat.VIRTUAL,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    const hasCurrentRegistrationAtLeastOneInPersonAttendee = getHasCurrentRegistrationAtLeastOneInPersonAttendee(state);
    expect(hasCurrentRegistrationAtLeastOneInPersonAttendee).toBeTruthy();
  });

  it('returns false when group leader is virtual and its guest is virtual', async () => {
    const params = {
      currentEventRegistrationId: 'leader',
      leaderAttendingFormat: AttendingFormat.VIRTUAL,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.INPERSON,
      memberGuestAttendingFormat: AttendingFormat.INPERSON,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    const hasCurrentRegistrationAtLeastOneInPersonAttendee = getHasCurrentRegistrationAtLeastOneInPersonAttendee(state);
    expect(hasCurrentRegistrationAtLeastOneInPersonAttendee).toBeFalsy();
  });

  it('returns true when group member is virtual and its guest is in person', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      leaderAttendingFormat: AttendingFormat.VIRTUAL,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.VIRTUAL,
      memberGuestAttendingFormat: AttendingFormat.INPERSON,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    const hasCurrentRegistrationAtLeastOneInPersonAttendee = getHasCurrentRegistrationAtLeastOneInPersonAttendee(state);
    expect(hasCurrentRegistrationAtLeastOneInPersonAttendee).toBeTruthy();
  });

  it('returns false when group member is virtual and its guest is virtual', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      leaderAttendingFormat: AttendingFormat.VIRTUAL,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.VIRTUAL,
      memberGuestAttendingFormat: AttendingFormat.VIRTUAL,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    const hasCurrentRegistrationAtLeastOneInPersonAttendee = getHasCurrentRegistrationAtLeastOneInPersonAttendee(state);
    expect(hasCurrentRegistrationAtLeastOneInPersonAttendee).toBeFalsy();
  });

  it('returns true for InPerson event', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      eventAttendingFormat: AttendingFormat.INPERSON
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ currentEventRegistrationId: st... Remove this comment to see the full error message
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneInPersonAttendee(state)).toBeTruthy();
  });

  it('returns true for Hybrid event', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      eventAttendingFormat: AttendingFormat.VIRTUAL
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ currentEventRegistrationId: st... Remove this comment to see the full error message
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneInPersonAttendee(state)).toBeTruthy();
  });
});

describe('getHasCurrentRegistrationAtLeastOneVirtualAttendee', () => {
  it('returns true when group leader is in person and its guest is virtual', async () => {
    const params = {
      currentEventRegistrationId: 'leader',
      leaderAttendingFormat: AttendingFormat.INPERSON,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.VIRTUAL,
      memberGuestAttendingFormat: AttendingFormat.VIRTUAL,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeTruthy();
  });

  it('returns true when group leader is virtual and its guest is virtual', async () => {
    const params = {
      currentEventRegistrationId: 'leader',
      leaderAttendingFormat: AttendingFormat.VIRTUAL,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.INPERSON,
      memberGuestAttendingFormat: AttendingFormat.INPERSON,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeTruthy();
  });

  it('returns false when group leader is inPerson and its guest is inPerson', async () => {
    const params = {
      currentEventRegistrationId: 'leader',
      leaderAttendingFormat: AttendingFormat.INPERSON,
      leaderGuestAttendingFormat: AttendingFormat.INPERSON,
      memberAttendingFormat: AttendingFormat.VIRTUAL,
      memberGuestAttendingFormat: AttendingFormat.VIRTUAL,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeFalsy();
  });

  it('returns true when group member is virtual and its guest is in person', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      leaderAttendingFormat: AttendingFormat.INPERSON,
      leaderGuestAttendingFormat: AttendingFormat.INPERSON,
      memberAttendingFormat: AttendingFormat.VIRTUAL,
      memberGuestAttendingFormat: AttendingFormat.INPERSON,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeTruthy();
  });

  it('returns false when group member is inperson and its guest is inperson', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      leaderAttendingFormat: AttendingFormat.VIRTUAL,
      leaderGuestAttendingFormat: AttendingFormat.VIRTUAL,
      memberAttendingFormat: AttendingFormat.INPERSON,
      memberGuestAttendingFormat: AttendingFormat.INPERSON,
      eventAttendingFormat: AttendingFormat.HYBRID
    };
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeFalsy();
  });

  it('returns false for InPerson event', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      eventAttendingFormat: AttendingFormat.INPERSON
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ currentEventRegistrationId: st... Remove this comment to see the full error message
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeFalsy();
  });

  it('returns false for Virtual event', async () => {
    const params = {
      currentEventRegistrationId: 'member',
      eventAttendingFormat: AttendingFormat.VIRTUAL
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ currentEventRegistrationId: st... Remove this comment to see the full error message
    const state = getState(params);
    expect(getHasCurrentRegistrationAtLeastOneVirtualAttendee(state)).toBeFalsy();
  });
});
