import {
  admissionItemIsVisible,
  sessionIsVisible,
  sessionIsRegisterable,
  getRegPackId,
  regCartHasGroupMembers,
  isSsoInviteeFlow,
  getAllRegistrantRegPathIds,
  determineRegCartIdToAbort,
  shouldDisplayOnGroupRegistrationPopup
} from '../shared';
import {
  createRegistrationType,
  createAdmissionItem,
  createProductAdmissionItem,
  createSession,
  createProductSession
} from '../../../testUtils';
import { InviteeStatusId } from 'event-widgets/utils/InviteeStatus';

describe('Admission item is visible when', () => {
  test('No registration type limiting exists', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const result = admissionItemIsVisible(registrationType.id, admissionItem);
    expect(result).toBeTruthy();
  });

  test('Registration type allows admission item', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      applicableContactTypes: [registrationType.id]
    };
    const result = admissionItemIsVisible(registrationType.id, admissionItem);
    expect(result).toBeTruthy();
  });

  test('includeClosedAdmissionItems allows closed admission item', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      isOpenForRegistration: false
    };
    const options = { includeClosedAdmissionItems: true };
    const result = admissionItemIsVisible(registrationType.id, admissionItem, options);
    expect(result).toBeTruthy();
  });

  test('Admission item was previously registered for', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      applicableContactTypes: ['otherRegistrationTypeId']
    };
    const options = { registeredAdmissionItem: createProductAdmissionItem(admissionItem) };
    const result = admissionItemIsVisible(registrationType.id, admissionItem, options);
    expect(result).toBeTruthy();
  });
});

describe('Admission item is NOT visible when', () => {
  test('Registration type does not allow admission item', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      applicableContactTypes: ['otherRegistrationTypeId']
    };
    const result = admissionItemIsVisible(registrationType.id, admissionItem);
    expect(result).toBeFalsy();
  });

  test('Admission item is closed for registration', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      isOpenForRegistration: false
    };
    const result = admissionItemIsVisible(registrationType.id, admissionItem);
    expect(result).toBeFalsy();
  });
});

describe('Session is visible when', () => {
  test('No registration type limiting exists', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = createSession();
    const result = sessionIsVisible(registrationType.id, admissionItem, session);
    expect(result).toBeTruthy();
  });

  test('Registration type allows sessions', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      associatedRegistrationTypes: [registrationType.id]
    };
    const result = sessionIsVisible(registrationType.id, admissionItem, session);
    expect(result).toBeTruthy();
  });

  test('includeClosedSessions allows closed sessions', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      isOpenForRegistration: false
    };
    const options = { includeClosedSessions: true };
    const result = sessionIsVisible(registrationType.id, admissionItem, session, options);
    expect(result).toBeTruthy();
  });

  test('Session was previously registered for', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      associatedRegistrationTypes: ['otherRegistrationTypeId']
    };
    const options = { registeredSessions: { [session.id]: createProductSession(session) } };
    const result = sessionIsVisible(registrationType.id, admissionItem, session, options);
    expect(result).toBeTruthy();
  });
});

describe('Session is NOT visible when', () => {
  test('Registration type does not allow session', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      associatedRegistrationTypes: ['otherRegistrationTypeId']
    };
    const result = sessionIsVisible(registrationType.id, admissionItem, session);
    expect(result).toBeFalsy();
  });

  test('Session is closed for registration', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      isOpenForRegistration: false
    };
    const result = sessionIsVisible(registrationType.id, admissionItem, session);
    expect(result).toBeFalsy();
  });

  test('Session is included with registration', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      isIncludedSession: true
    };
    const result = sessionIsVisible(registrationType.id, admissionItem, session);
    expect(result).toBeFalsy();
  });

  test('Admission item does not allow session, session newly registered', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      limitOptionalSessionsToSelect: true,
      availableOptionalSessions: ['otherSessionId']
    };
    const session = createSession();
    const result = sessionIsVisible(registrationType.id, admissionItem, session);
    expect(result).toBeFalsy();
  });

  test('Admission item does not allow session, session already registered - old behaviour/experiment', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      limitOptionalSessionsToSelect: true,
      availableOptionalSessions: ['otherSessionId']
    };
    const session = createSession();
    const options = { registeredSessions: { [session.id]: createProductSession(session) } };
    const result = sessionIsVisible(registrationType.id, admissionItem, session, options);
    expect(result).toBeTruthy();
  });

  test('Admission item does not allow session, session already registered', () => {
    const registrationType = createRegistrationType();
    const admissionItem = {
      ...createAdmissionItem(),
      limitOptionalSessionsToSelect: true,
      availableOptionalSessions: ['otherSessionId']
    };
    const session = createSession();
    const options = {
      registeredSessions: { [session.id]: createProductSession(session) },
      alwaysCheckAdmissionItemAvailability: true
    };
    const result = sessionIsVisible(registrationType.id, admissionItem, session, options);
    expect(result).toBeFalsy();
  });
});

describe('Session is registerable when', () => {
  test('Session is included with event', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = {
      ...createSession(),
      isIncludedSession: true
    };
    const result = sessionIsRegisterable(registrationType.id, admissionItem, session);
    expect(result).toBeTruthy();
  });

  test('Session is associated to admission item', () => {
    const registrationType = createRegistrationType();
    const session = {
      ...createSession(),
      associatedRegistrationTypes: ['otherRegistrationTypeId']
    };
    const admissionItem = {
      ...createAdmissionItem(),
      associatedOptionalSessions: [session.id]
    };
    const result = sessionIsRegisterable(registrationType.id, admissionItem, session);
    expect(result).toBeTruthy();
  });

  test('Session is visible', () => {
    const registrationType = createRegistrationType();
    const admissionItem = createAdmissionItem();
    const session = createSession();
    const result = sessionIsRegisterable(registrationType.id, admissionItem, session);
    expect(result).toBeTruthy();
  });
});

describe('getAllRegistrantRegPathIds', () => {
  test('Works for multiple registrations', () => {
    const state = {
      registrationForm: {
        regCart: {
          eventRegistrations: {
            reg1: {
              registrationPathId: 'registrationPathId1'
            },
            reg2: {
              registrationPathId: 'registrationPathId2'
            },
            reg3: {
              registrationPathId: 'registrationPathId2'
            }
          }
        }
      }
    };

    const regPaths = getAllRegistrantRegPathIds(state);
    expect(regPaths.length).toBe(3);
  });

  test('Works for no registrations', () => {
    const state = {
      registrationForm: {
        regCart: {}
      }
    };

    const regPaths = getAllRegistrantRegPathIds(state);
    expect(regPaths.length).toBe(0);
  });

  test('Works for missing reg paths', () => {
    const state = {
      registrationForm: {
        regCart: {
          eventRegistrations: {
            reg1: {
              registrationPathId: 'registrationPathId1'
            },
            reg2: {},
            reg3: {
              registrationPathId: ''
            }
          }
        }
      }
    };

    const regPaths = getAllRegistrantRegPathIds(state);
    expect(regPaths.length).toBe(1);
  });
});

describe('Registration Package suit', () => {
  test('RegPack Id retrieved from regCart', () => {
    const state = {
      registrationForm: {
        regCart: {
          regPackId: 'dummy_regPack1'
        }
      }
    };
    const regPackId = getRegPackId(state);
    expect(regPackId).toBe('dummy_regPack1');
  });

  test('RegPack Id retrieved from userSession', () => {
    const state = {
      defaultUserSession: {
        defaultRegPackId: 'dummy_regPack2'
      }
    };
    const regPackId = getRegPackId(state);
    expect(regPackId).toBe('dummy_regPack2');
  });

  test('RegCart regPackId overrides user session regPackId', () => {
    const state = {
      registrationForm: {
        regCart: {
          regPackId: 'dummy_regPack1'
        }
      },
      defaultUserSession: {
        defaultRegPackId: 'dummy_regPack2'
      }
    };
    const regPackId = getRegPackId(state);
    expect(regPackId).toBe('dummy_regPack1');
  });

  test('Registration without regPack', () => {
    const regPackId = getRegPackId({});
    expect(regPackId).toBe(undefined);
  });

  test('regCartHasGroupMembers only includes attendees with status Accepted or PendingApproval', () => {
    const trueState = {
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '522c373f-e74d-4b51-a9da-018ad948743c': {
              attendee: {
                inviteeStatus: InviteeStatusId.Accepted
              }
            },
            '737e6f91-88ef-48dc-b1f9-1c8adb256910': {
              attendee: {
                inviteeStatus: InviteeStatusId.PendingApproval
              }
            }
          }
        }
      }
    };
    expect(regCartHasGroupMembers(trueState)).toBe(true);

    const falseState = {
      registrationForm: {
        regCart: {
          eventRegistrations: {
            '522c373f-e74d-4b51-a9da-018ad948743c': {
              attendee: {
                inviteeStatus: InviteeStatusId.Declined
              }
            },
            '737e6f91-88ef-48dc-b1f9-1c8adb256910': {
              attendee: {
                inviteeStatus: InviteeStatusId.Cancelled
              }
            }
          }
        }
      }
    };
    expect(regCartHasGroupMembers(falseState)).toBe(false);
  });

  test('Sso Invitee flow will be invalid if it is Planner mode', () => {
    const falseState = {
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: false,
            allowSecureHTTPPost: true,
            allowSSOLogin: true
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 1
        }
      },
      userSession: {
        inviteeId: 'inviteeId',
        isSsoAdmin: false
      },
      defaultUserSession: {
        isPlanner: true
      }
    };
    expect(isSsoInviteeFlow(falseState)).toBeFalsy();
  });

  test('Sso Invitee flow will be invalid if external auth is disabled in event', () => {
    const falseState = {
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: false,
            allowSecureHTTPPost: true,
            allowSSOLogin: true
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 0
        }
      },
      userSession: {
        inviteeId: 'inviteeId',
        isSsoAdmin: false
      },
      defaultUserSession: {
        isPlanner: false
      }
    };
    expect(isSsoInviteeFlow(falseState)).toBeFalsy();
  });

  test('Sso Invitee flow will be valid if external auth is enabled in both event and account', () => {
    const falseState = {
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: false,
            allowSecureHTTPPost: true,
            allowSSOLogin: true
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 1
        }
      },
      userSession: {
        inviteeId: 'inviteeId',
        isSsoAdmin: false
      },
      defaultUserSession: {
        isPlanner: false
      }
    };
    expect(isSsoInviteeFlow(falseState)).toBeTruthy();
  });
  test('Sso Invitee flow will be invalid if external auth is not enabled in specific reg path', () => {
    const falseState = {
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: false,
            allowSecureHTTPPost: true,
            allowSSOLogin: true
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 1,
          authenticationLocation: 2,
          authenticatedRegistrationPaths: []
        }
      },
      userSession: {
        inviteeId: 'inviteeId',
        isSsoAdmin: false
      },
      defaultUserSession: {
        isPlanner: false
      }
    };
    expect(isSsoInviteeFlow(falseState, 'regpath1')).toBeFalsy();
  });
  test('Sso Invitee flow will be valid if external auth is enabled in specific reg path and reg path isincluded in authenticated reg paths', () => {
    const falseState = {
      account: {
        settings: {
          accountSecuritySettings: {
            allowHTTPPost: false,
            allowSecureHTTPPost: true,
            allowSSOLogin: true
          }
        }
      },
      event: {
        eventSecuritySetupSnapshot: {
          authenticationType: 1,
          authenticationLocation: 2,
          authenticatedRegistrationPaths: ['regpath1']
        }
      },
      userSession: {
        inviteeId: 'inviteeId',
        isSsoAdmin: false
      },
      defaultUserSession: {
        isPlanner: false
      }
    };
    expect(isSsoInviteeFlow(falseState, 'regpath1')).toBeTruthy();
  });
});

describe('shouldDisplayOnGroupRegistrationPopup', () => {
  test('RegCart status is completed', () => {
    const eventReg = {
      attendee: {}
    };
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'COMPLETED')).toBe(true);
    (eventReg.attendee as $TSFixMe).inviteeStatus = InviteeStatusId.Accepted;
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'COMPLETED')).toBe(true);
    (eventReg.attendee as $TSFixMe).inviteeStatus = InviteeStatusId.PendingApproval;
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'COMPLETED')).toBe(true);
    (eventReg.attendee as $TSFixMe).inviteeStatus = InviteeStatusId.Cancelled;
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'COMPLETED')).toBe(false);
  });

  test('RegCart status is TRANSIENT', () => {
    const eventReg = {
      attendee: {}
    };
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'TRANSIENT')).toBe(false);
    (eventReg.attendee as $TSFixMe).inviteeStatus = InviteeStatusId.Accepted;
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'TRANSIENT')).toBe(true);
    (eventReg.attendee as $TSFixMe).inviteeStatus = InviteeStatusId.PendingApproval;
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'TRANSIENT')).toBe(true);
    (eventReg.attendee as $TSFixMe).inviteeStatus = InviteeStatusId.Cancelled;
    expect(shouldDisplayOnGroupRegistrationPopup(eventReg, 'TRANSIENT')).toBe(false);
  });
});

describe('Determine RegCartId to abort', () => {
  const commonState = {
    userSession: {
      regCartId: undefined
    },
    registrationForm: {
      regCart: {
        regCartId: undefined,
        status: ''
      }
    }
  };
  test('Neither session or local in progress cart exists', () => {
    const state = {};
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).userSession = {};
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).userSession.regCartId = '';
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).registrationForm = {};
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).registrationForm.regCart = {};
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).registrationForm.regCart.regCartId = '';
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).registrationForm.regCart.regCartId = 'regCartId';
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
    (state as $TSFixMe).registrationForm.regCart.status = 'COMPLETED';
    expect(determineRegCartIdToAbort(state)).not.toBeDefined();
  });
  test('Session only cart', () => {
    commonState.userSession.regCartId = 'sessionCartId';
    expect(determineRegCartIdToAbort(commonState)).toBe('sessionCartId');
  });
  test('Session and local cart', () => {
    commonState.registrationForm.regCart.regCartId = 'localCartId';
    expect(determineRegCartIdToAbort(commonState)).not.toBeDefined();
    commonState.registrationForm.regCart.status = 'COMPLETED';
    expect(determineRegCartIdToAbort(commonState)).not.toBeDefined();
    commonState.registrationForm.regCart.status = 'INPROGRESS';
    expect(determineRegCartIdToAbort(commonState)).toBe('localCartId');
  });
});
