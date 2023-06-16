import { getAvailableGroupRegTypeCapacities, getAvailableRegTypeCapacities } from '../regTypeCapacities';
import { setIn, getIn } from 'icepick';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';

jest.mock('../../redux/pathInfo', () => {
  return {
    getCurrentPageId: jest.fn()
  };
});

jest.mock('../../redux/website/registrationProcesses', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/website/registrationProcesses'),
    POST_REGISTRATION: {
      isTypeOfPage: jest.fn(() => false)
    }
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

const initialState = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        'TEST-REGISTRATION-PATH': {
          isDefault: true,
          id: 'TEST-REGISTRATION-PATH',
          associatedRegistrationTypes: [],
          requireRegApproval: false,
          guestRegistrationSettings: {
            isGuestRegistrationTypeSelectionEnabled: true,
            maxGuestsAllowedOnRegPath: 5,
            registrationTypeSettings: {
              limitVisibility: true,
              categorizedRegistrationTypes: [
                'TEST-REGISTRATION-TYPE-3',
                'TEST-REGISTRATION-TYPE-2',
                'TEST-REGISTRATION-TYPE-4',
                'TEST-CLOSED-REGISTRATION-TYPE'
              ],
              quotas: {
                'TEST-REGISTRATION-TYPE-2': 1,
                'TEST-REGISTRATION-TYPE-3': 1,
                'TEST-REGISTRATION-TYPE-4': 1
              }
            }
          },
          groupRegistrationSettings: {
            maxGroupRegistrantsAllowed: 10,
            registrationTypeSettings: {
              limitVisibility: true,
              categorizedRegistrationTypes: [
                'TEST-REGISTRATION-TYPE-2',
                'TEST-REGISTRATION-TYPE-3',
                'TEST-CLOSED-REGISTRATION-TYPE'
              ],
              quotas: {
                'TEST-REGISTRATION-TYPE-3': 3
              }
            }
          }
        },
        'TEST-REGISTRATION-PATH-2': {
          isDefault: false,
          id: 'TEST-REGISTRATION-PATH-2',
          associatedRegistrationTypes: ['TEST-REGISTRATION-TYPE-1'],
          requireRegApproval: true,
          guestRegistrationSettings: {
            isGuestRegistrationTypeSelectionEnabled: true,
            maxGuestsAllowedOnRegPath: 5,
            registrationTypeSettings: {
              limitVisibility: true,
              categorizedRegistrationTypes: [
                'TEST-REGISTRATION-TYPE-3',
                'TEST-REGISTRATION-TYPE-2',
                'TEST-REGISTRATION-TYPE-4',
                'TEST-CLOSED-REGISTRATION-TYPE'
              ],
              quotas: {
                'TEST-REGISTRATION-TYPE-2': 1,
                'TEST-REGISTRATION-TYPE-3': 1,
                'TEST-REGISTRATION-TYPE-4': 1
              }
            }
          },
          groupRegistrationSettings: {
            maxGroupRegistrantsAllowed: 10,
            registrationTypeSettings: {
              limitVisibility: true,
              categorizedRegistrationTypes: [
                'TEST-REGISTRATION-TYPE-1',
                'TEST-REGISTRATION-TYPE-2',
                'TEST-REGISTRATION-TYPE-3',
                'TEST-CLOSED-REGISTRATION-TYPE'
              ],
              quotas: {
                'TEST-REGISTRATION-TYPE-2': 1
              }
            }
          }
        }
      }
    }
  },
  registrationForm: {
    currentEventRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
    regCart: {
      groupRegistration: true,
      eventRegistrations: {
        'TEST-PRIMARY-REGISTRATION-ID': {
          eventRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
          requestedAction: 'REGISTER',
          attendee: { isGroupMember: false },
          attendeeType: 'GROUP_LEADER',
          eventId: 'TEST-EVENT-ID',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
          registrationTypeId: 'TEST-REGISTRATION-TYPE-2',
          registrationPathId: 'TEST-REGISTRATION-PATH'
        },
        'TEST-GUEST-1': {
          eventRegistrationId: 'TEST-GUEST-1',
          requestedAction: 'REGISTER',
          attendee: { isGroupMember: false },
          attendeeType: 'GUEST',
          eventId: 'TEST-EVENT-ID',
          primaryRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
          registrationTypeId: 'TEST-REGISTRATION-TYPE-2',
          registrationPathId: 'TEST-REGISTRATION-PATH'
        },
        'TEST-GUEST-2': {
          eventRegistrationId: 'TEST-GUEST-2',
          requestedAction: 'REGISTER',
          attendee: { isGroupMember: false },
          attendeeType: 'GUEST',
          eventId: 'TEST-EVENT-ID',
          primaryRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
          registrationTypeId: 'TEST-REGISTRATION-TYPE-4',
          registrationPathId: 'TEST-REGISTRATION-PATH'
        },
        'TEST-GROUP-MEMBER-1': {
          eventRegistrationId: 'TEST-GROUP-MEMBER-1',
          requestedAction: 'REGISTER',
          attendee: { isGroupMember: true },
          attendeeType: 'ATTENDEE',
          eventId: 'TEST-EVENT-ID',
          primaryRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
          registrationTypeId: 'TEST-REGISTRATION-TYPE-2',
          registrationPathId: 'TEST-REGISTRATION-PATH'
        }
      }
    }
  },
  event: {
    id: 'TEST-EVENT-ID',
    capacityId: 'TEST-EVENT-CAPACITY-ID',
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationTypes: true,
        registrationApproval: true
      }
    },
    registrationTypes: {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
        name: '',
        isOpenForRegistration: true
      },
      'TEST-REGISTRATION-TYPE-1': {
        id: 'TEST-REGISTRATION-TYPE-1',
        name: 'RegType1',
        isOpenForRegistration: true
      },
      'TEST-REGISTRATION-TYPE-2': {
        id: 'TEST-REGISTRATION-TYPE-2',
        name: 'RegType2',
        isOpenForRegistration: true
      },
      'TEST-REGISTRATION-TYPE-3': {
        id: 'TEST-REGISTRATION-TYPE-3',
        name: 'RegType3',
        isOpenForRegistration: true
      },
      'TEST-REGISTRATION-TYPE-4': {
        id: 'TEST-REGISTRATION-TYPE-4',
        name: 'RegType4',
        isOpenForRegistration: true
      },
      'TEST-CLOSED-REGISTRATION-TYPE': {
        id: 'TEST-CLOSED-REGISTRATION-TYPE',
        name: 'RegType4',
        isOpenForRegistration: false
      }
    }
  },
  capacity: {
    'TEST-EVENT-CAPACITY-ID': {
      capacityId: 'TEST-EVENT-CAPACITY-ID',
      totalCapacityAvailable: 300,
      availableCapacity: 6
    },
    'TEST-EVENT-ID::00000000-0000-0000-0000-000000000000': {
      capacityId: 'TEST-EVENT-ID::00000000-0000-0000-0000-000000000000',
      totalCapacityAvailable: -1,
      availableCapacity: -1
    },
    'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-1': {
      capacityId: 'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-1',
      totalCapacityAvailable: -1,
      availableCapacity: -1
    },
    'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-2': {
      capacityId: 'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-2',
      totalCapacityAvailable: -1,
      availableCapacity: -1
    },
    'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-3': {
      capacityId: 'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-3',
      totalCapacityAvailable: 25,
      availableCapacity: 3
    },
    'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-4': {
      capacityId: 'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-4',
      totalCapacityAvailable: 10,
      availableCapacity: 0
    },
    'TEST-CLOSED-REGISTRATION-TYPE': {
      capacityId: 'TEST-CLOSED-REGISTRATION-TYPE',
      totalCapacityAvailable: 10,
      availableCapacity: 10
    }
  },
  accountLimits: {
    perEventLimits: {
      maxNumberOfGuests: { limit: 10 },
      minNumberOfGuests: { limit: 0 }
    }
  },
  defaultUserSession: {
    isPlanner: false
  },
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  }
};

let guestCount = 2;

function addGuest(state, regType) {
  const newGuestId = `TEST-GUEST-${++guestCount}`;
  const newGuest = {
    eventRegistrationId: newGuestId,
    requestedAction: 'REGISTER',
    attendee: { isGroupMember: false },
    attendeeType: 'GUEST',
    eventId: 'TEST-EVENT-ID',
    primaryRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
    registrationTypeId: regType,
    registrationPathId: 'TEST-REGISTRATION-PATH'
  };

  let newState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations', newGuestId], newGuest);

  const eventCapacityPath = ['capacity', state.event.capacityId, 'availableCapacity'];
  newState = setIn(newState, eventCapacityPath, getIn(newState, eventCapacityPath) - 1);

  const regTypeCapacityPath = ['capacity', `${state.event.id}::${regType}`, 'availableCapacity'];
  newState = setIn(newState, regTypeCapacityPath, getIn(newState, regTypeCapacityPath) - 1);

  return newState;
}

function addNGuests(state, regType, n) {
  let newState = state;
  for (let i = 0; i < n; i++) newState = addGuest(newState, regType);
  return newState;
}

let groupMemberCount = 1;

function addGroupMember(state, regType) {
  const newGroupMemberId = `TEST-GROUP-MEMBER-${++groupMemberCount}`;
  const newGroupMember = {
    eventRegistrationId: newGroupMemberId,
    requestedAction: 'REGISTER',
    attendee: { isGroupMember: true },
    attendeeType: 'ATTENDEE',
    eventId: 'TEST-EVENT-ID',
    primaryRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
    registrationTypeId: regType,
    registrationPathId: 'TEST-REGISTRATION-PATH'
  };

  let newState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations', newGroupMemberId], newGroupMember);

  const eventCapacityPath = ['capacity', state.event.capacityId, 'availableCapacity'];
  newState = setIn(newState, eventCapacityPath, getIn(newState, eventCapacityPath) - 1);

  const regTypeCapacityPath = ['capacity', `${state.event.id}::${regType}`, 'availableCapacity'];
  newState = setIn(newState, regTypeCapacityPath, getIn(newState, regTypeCapacityPath) - 1);

  return newState;
}

function setIsPlanner(state, isPlanner) {
  return setIn(state, ['defaultUserSession', 'isPlanner'], isPlanner);
}

function addNGroupMembers(state, regType, n) {
  let newState = state;
  for (let i = 0; i < n; i++) newState = addGroupMember(newState, regType);
  return newState;
}

function limitGuestRegTypeVisibility(state, limitVisibility) {
  return setIn(
    state,
    [
      'appData',
      'registrationSettings',
      'registrationPaths',
      'TEST-REGISTRATION-PATH',
      'guestRegistrationSettings',
      'registrationTypeSettings',
      'limitVisibility'
    ],
    limitVisibility
  );
}

describe('Test reg type capacities, quotas, and limits', () => {
  let state = initialState;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
  {
    const result = getAvailableRegTypeCapacities(state);
    it('Should not be full for ordinary registrants', () => {
      expect(result.isFull).toBe(false);
    });
    it('Should show 5 available reg types for ordinary registrants', () => {
      expect(result.regTypeCapacitiesAvailable.length).toBe(5);
    });
    it('Should show no reg type as the first one', () => {
      expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    });
  }

  {
    const result = getAvailableGroupRegTypeCapacities(state);
    it('Should not be full for group members', () => {
      expect(result.isFull).toBe(false);
    });
    it('Should show 2 available reg types for group members', () => {
      expect(result.regTypeCapacitiesAvailable.length).toBe(2);
    });
  }

  {
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    it('Should not be full for guests', () => {
      expect(result.isFull).toBe(false);
    });
    it('Should show 3 available reg types for guests', () => {
      expect(result.regTypeCapacitiesAvailable.length).toBe(3);
    });
    it('Should show 3 available guest slots', () => {
      expect(result.guestCapacityAvailable).toBe(3);
    });
    it('Should show TEST-REGISTRATION-TYPE-3 as the first reg type for guests', () => {
      expect(result.regTypeCapacitiesAvailable[0].id).toBe('TEST-REGISTRATION-TYPE-3');
    });
    it('Should show available capacity of 1 for TEST-REGISTRATION-TYPE-3 for guests', () => {
      expect(result.regTypeCapacitiesAvailable[0].available).toBe(1);
    });
  }

  {
    // Tests applicable for Hybrid event
    const customState = {
      ...state,
      event: {
        ...state.event,
        attendingFormat: AttendingFormat.HYBRID,
        registrationTypes: {
          ...state.event.registrationTypes,
          'TEST-REGISTRATION-TYPE-5': {
            id: 'TEST-REGISTRATION-TYPE-5',
            name: 'RegType5',
            attendingFormat: AttendingFormat.VIRTUAL,
            isOpenForRegistration: true
          },
          'TEST-REGISTRATION-TYPE-6': {
            id: 'TEST-REGISTRATION-TYPE-6',
            name: 'RegType6',
            attendingFormat: AttendingFormat.VIRTUAL,
            isOpenForRegistration: true
          }
        }
      },
      capacity: {
        ...state.capacity,
        'registrationtype::TEST-EVENT-ID::TEST-REGISTRATION-TYPE-5::virtual': {
          capacityId: 'registrationtype::TEST-EVENT-ID::TEST-REGISTRATION-TYPE-5::virtual',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        },
        'registrationtype::TEST-EVENT-ID::TEST-REGISTRATION-TYPE-6::virtual': {
          capacityId: 'registrationtype::TEST-EVENT-ID::TEST-REGISTRATION-TYPE-6::virtual',
          totalCapacityAvailable: 5,
          availableCapacity: 0
        }
      }
    };

    const result = getAvailableRegTypeCapacities(customState);
    it('Should show 7 available reg types for ordinary registrants', () => {
      expect(result.regTypeCapacitiesAvailable.length).toBe(7);
    });
    it('Should show unlimited capacity for virtual registration type TEST-REGISTRATION-TYPE-5', () => {
      expect(
        result.regTypeCapacitiesAvailable.find(regType => regType.id === 'TEST-REGISTRATION-TYPE-5').available
      ).toBe(Infinity);
    });
    it('Should show full capacity for virtual registration type TEST-REGISTRATION-TYPE-6', () => {
      expect(
        result.regTypeCapacitiesAvailable.find(regType => regType.id === 'TEST-REGISTRATION-TYPE-6').available
      ).toBe(0);
    });
  }

  {
    // Tests when event attending format is Virtual
    const customState = {
      ...state,
      event: {
        ...state.event,
        attendingFormat: AttendingFormat.VIRTUAL,
        registrationTypes: {
          ...state.event.registrationTypes,
          'TEST-REGISTRATION-TYPE-5': {
            id: 'TEST-REGISTRATION-TYPE-5',
            name: 'RegType5',
            attendingFormat: AttendingFormat.VIRTUAL,
            isOpenForRegistration: true
          },
          'TEST-REGISTRATION-TYPE-6': {
            id: 'TEST-REGISTRATION-TYPE-6',
            name: 'RegType6',
            attendingFormat: AttendingFormat.INPERSON,
            isOpenForRegistration: true
          }
        }
      },
      capacity: {
        ...state.capacity,
        'registrationtype::TEST-EVENT-ID::TEST-REGISTRATION-TYPE-5::virtual': {
          capacityId: 'registrationtype::TEST-EVENT-ID::TEST-REGISTRATION-TYPE-5::virtual',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        },
        'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-6': {
          capacityId: 'TEST-EVENT-ID::TEST-REGISTRATION-TYPE-6',
          totalCapacityAvailable: 5,
          availableCapacity: 0
        }
      }
    };

    const result = getAvailableRegTypeCapacities(customState);
    it('Should show 7 available reg types for ordinary registrants 1', () => {
      expect(result.regTypeCapacitiesAvailable.length).toBe(7);
    });
    it('Should show invalid capacity for virtual registration type TEST-REGISTRATION-TYPE-5', () => {
      expect(
        result.regTypeCapacitiesAvailable.find(regType => regType.id === 'TEST-REGISTRATION-TYPE-5').available
      ).toBe(NaN);
    });
    it('Should show capacity full for inperson registration type TEST-REGISTRATION-TYPE-6', () => {
      expect(
        result.regTypeCapacitiesAvailable.find(regType => regType.id === 'TEST-REGISTRATION-TYPE-6').available
      ).toBe(0);
    });
  }
  {
    state = addGuest(state, 'TEST-REGISTRATION-TYPE-3');
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    it('Should show available capacity of 0 for TEST-REGISTRATION-TYPE-3 for guests', () => {
      expect(result.regTypeCapacitiesAvailable[0].available).toBe(0);
    });
    it('Should be full for guests', () => {
      expect(result.isFull).toBe(true);
    });
  }

  {
    state = addNGroupMembers(state, 'TEST-REGISTRATION-TYPE-3', 2);
    const result = getAvailableGroupRegTypeCapacities(state);
    it('Should show TEST-REGISTRATION-TYPE-3 as the second entry for group members', () => {
      expect(result.regTypeCapacitiesAvailable[1].id).toBe('TEST-REGISTRATION-TYPE-3');
    });
    it('Should show available capacity of 0 for TEST-REGISTRATION-TYPE-3 for group members', () => {
      expect(result.regTypeCapacitiesAvailable[1].available).toBe(0);
    });
  }

  {
    const result = getAvailableRegTypeCapacities(state);
    it('Should show TEST-REGISTRATION-TYPE-3 as full for ordinary registrants', () => {
      expect(
        result.regTypeCapacitiesAvailable.find(regType => regType.id === 'TEST-REGISTRATION-TYPE-3').available
      ).toBe(0);
    });
  }

  {
    state = limitGuestRegTypeVisibility(state, false);
    state = setIsPlanner(state, true);
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    it('Should not show full capacities for guests', () => {
      expect(result.regTypeCapacitiesAreFull).toBe(false);
    });
    it('Should not be full for guests 1', () => {
      expect(result.isFull).toBe(false);
    });
  }

  {
    state = addNGuests(state, 'TEST-REGISTRATION-TYPE-1', 7);
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    it('Should not show full capacities for guests 1', () => {
      expect(result.regTypeCapacitiesAreFull).toBe(false);
    });
    it('Should show 0 available guest slots', () => {
      expect(result.guestCapacityAvailable).toBe(0);
    });
    it('Should be full for guests 1', () => {
      expect(result.isFull).toBe(true);
    });
    it('Should show infinity in event capacity', () => {
      expect(result.eventCapacityAvailable).toBe(Infinity);
    });
  }

  {
    state = addNGroupMembers(state, 'TEST-REGISTRATION-TYPE-2', 3);
    state = setIsPlanner(state, false);
    const result = getAvailableGroupRegTypeCapacities(state);
    it('Should show 0 event capacity', () => {
      expect(result.eventCapacityAvailable).toBe(0);
    });
    it('Should show full event capacity', () => {
      expect(result.eventCapacityIsFull).toBe(true);
    });
    it('Should show 4 available group member slots', () => {
      expect(result.groupCapacityAvailable).toBe(4);
    });
    it('Should be full for group members', () => {
      expect(result.isFull).toBe(true);
    });
  }
});

describe('RegApproval GM scenarios', () => {
  const state = {
    ...initialState,
    registrationForm: {
      ...initialState.registrationForm,
      regCart: {
        groupRegistration: true,
        eventRegistrations: {
          'TEST-PRIMARY-REGISTRATION-ID': {
            eventRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
            requestedAction: 'REGISTER',
            attendee: { isGroupMember: false },
            attendeeType: 'GROUP_LEADER',
            eventId: 'TEST-EVENT-ID',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
            registrationTypeId: 'TEST-REGISTRATION-TYPE-2',
            registrationPathId: 'TEST-REGISTRATION-PATH-2'
          }
        }
      }
    }
  };

  it('GL on path 2 should only return 2 regTypes', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const result = getAvailableGroupRegTypeCapacities(state);
    /*
     * Even though has visibiity to type 1,2, and 3. since 1 is tied to a path with regApproval on,
     * only return type 2 and 3
     */
    expect(result.regTypeCapacitiesAvailable.length).toBe(2);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('TEST-REGISTRATION-TYPE-2');
    expect(result.regTypeCapacitiesAvailable[1].id).toBe('TEST-REGISTRATION-TYPE-3');
  });

  it('should return defaultregType when default path has approval off, limitVisibility on, and noCategorized regTypes', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const testState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            'TEST-REGISTRATION-PATH-2': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH-2'],
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10,
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: []
                }
              }
            }
          }
        }
      }
    };
    const result = getAvailableGroupRegTypeCapacities(testState);

    expect(result.regTypeCapacitiesAvailable.length).toBe(1);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('should return default regType when defaultPath has approval and limitVisibility on, and noCategorized regTypes', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const testState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            'TEST-REGISTRATION-PATH': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH'],
              requireRegApproval: true
            },
            'TEST-REGISTRATION-PATH-2': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH-2'],
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10,
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: []
                }
              }
            }
          }
        }
      }
    };
    const result = getAvailableGroupRegTypeCapacities(testState);

    expect(result.regTypeCapacitiesAvailable.length).toBe(0);
    expect(result.regTypeCapacitiesAreFull).toBe(true);
    expect(result.isFull).toBe(true);
  });

  it('should return default regType when categorized regtype for group has been deleted', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const testState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            'TEST-REGISTRATION-PATH': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH']
            },
            'TEST-REGISTRATION-PATH-2': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH-2'],
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10,
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: ['TEST-REGISTRATION-TYPE-DELETED']
                }
              }
            }
          }
        }
      }
    };
    const result = getAvailableGroupRegTypeCapacities(testState);
    expect(result.regTypeCapacitiesAvailable.length).toBe(0);
    expect(result.isFull).toBe(false);
  });

  it('shouldnt return any regTypes when all paths have reg approval on', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const testState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            'TEST-REGISTRATION-PATH': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH'],
              requireRegApproval: true
            }
          }
        }
      }
    };

    const result = getAvailableGroupRegTypeCapacities(testState);

    expect(result.regTypeCapacitiesAvailable.length).toBe(0);
    expect(result.regTypeCapacitiesAreFull).toBe(true);
    expect(result.isFull).toBe(true);
  });

  it('should return all types not associated with path 2 when limitVisinility is off', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const testState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            'TEST-REGISTRATION-PATH-2': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH-2'],
              associatedRegistrationTypes: ['TEST-REGISTRATION-TYPE-2', 'TEST-REGISTRATION-TYPE-4'],
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 10,
                registrationTypeSettings: {
                  limitVisibility: false,
                  categorizedRegistrationTypes: []
                }
              }
            }
          }
        }
      }
    };
    const result = getAvailableGroupRegTypeCapacities(testState);

    expect(result.regTypeCapacitiesAvailable.length).toBe(3);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.regTypeCapacitiesAvailable[1].id).toBe('TEST-REGISTRATION-TYPE-1');
    expect(result.regTypeCapacitiesAvailable[2].id).toBe('TEST-REGISTRATION-TYPE-3');
  });

  it('should be full for group member when limitVisibility on, noCategorized regTypes, and group capacity full', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../redux/website/registrationProcesses').POST_REGISTRATION.isTypeOfPage.mockImplementation(() => true);
    const testState = {
      ...state,
      appData: {
        ...state.appData,
        registrationSettings: {
          ...state.appData.registrationSettings,
          registrationPaths: {
            ...state.appData.registrationSettings.registrationPaths,
            'TEST-REGISTRATION-PATH-2': {
              ...state.appData.registrationSettings.registrationPaths['TEST-REGISTRATION-PATH-2'],
              groupRegistrationSettings: {
                maxGroupRegistrantsAllowed: 0,
                registrationTypeSettings: {
                  limitVisibility: true,
                  categorizedRegistrationTypes: []
                }
              }
            }
          }
        }
      }
    };
    const result = getAvailableGroupRegTypeCapacities(testState);

    expect(result.regTypeCapacitiesAvailable.length).toBe(1);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.isFull).toBe(true);
  });
});

describe('RegType Feature Off after setting up visibility settings for group/guest', () => {
  const state = {
    ...initialState,
    event: {
      ...initialState.event,
      eventFeatureSetup: {
        registrationProcess: {
          multipleRegistrationTypes: false
        }
      },
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000',
          name: '',
          isOpenForRegistration: true
        }
      }
    },
    registrationForm: {
      ...initialState.registrationForm,
      regCart: {
        groupRegistration: true,
        eventRegistrations: {
          'TEST-PRIMARY-REGISTRATION-ID': {
            eventRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
            requestedAction: 'REGISTER',
            attendee: { isGroupMember: false },
            attendeeType: 'GROUP_LEADER',
            eventId: 'TEST-EVENT-ID',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
            registrationTypeId: 'TEST-REGISTRATION-TYPE-2',
            registrationPathId: 'TEST-REGISTRATION-PATH-2'
          }
        }
      }
    }
  };

  it('GROUP: Should only return default regType since multipleRegistrationTypes feature is off', () => {
    const result = getAvailableGroupRegTypeCapacities(state);
    // Even though has visibiity to type 1,2, and 3. since the feature is off should only return default
    expect(result.regTypeCapacitiesAvailable.length).toBe(1);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.isFull).toBe(false);
  });

  it('GUEST: Should only return default regType since multipleRegistrationTypes feature is off', () => {
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    // Even though has visibiity to type 2,3, and 4. since the feature is off should only return default
    expect(result.regTypeCapacitiesAvailable.length).toBe(1);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.isFull).toBe(false);
  });

  it('isFull should be false when adm items feature on and has capacity', () => {
    const testState = {
      ...state,
      capacity: {
        ...state.capacity,
        'TEST-ADMISSION-ITEM': {
          capacityId: 'TEST-ADMISSION-ITEM',
          totalCapacityAvailable: -1,
          availableCapacity: -1
        }
      },
      event: {
        ...state.event,
        agendaItems: {
          admissionItems: true
        },
        products: {
          admissionItems: {
            'TEST-ADMISSION-ITEM': {
              capacityId: 'TEST-ADMISSION-ITEM',
              id: 'TEST-ADMISSION-ITEM',
              isOpenForRegistration: true,
              applicableContactTypes: []
            }
          }
        }
      }
    };
    const result = getAvailableRegTypeCapacities(testState, 'GUEST');
    // Even though has visibiity to type 2,3, and 4. since the feature is off should only return default
    expect(result.regTypeCapacitiesAvailable.length).toBe(1);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.isFull).toBe(false);
  });
});

describe('RegType Feature Off, s', () => {
  const state = {
    ...initialState,
    event: {
      ...initialState.event,
      eventFeatureSetup: {
        registrationProcess: {
          multipleRegistrationTypes: false
        }
      },
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000',
          name: '',
          isOpenForRegistration: true
        }
      }
    },
    registrationForm: {
      ...initialState.registrationForm,
      regCart: {
        groupRegistration: true,
        eventRegistrations: {
          'TEST-PRIMARY-REGISTRATION-ID': {
            eventRegistrationId: 'TEST-PRIMARY-REGISTRATION-ID',
            requestedAction: 'REGISTER',
            attendee: { isGroupMember: false },
            attendeeType: 'GROUP_LEADER',
            eventId: 'TEST-EVENT-ID',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
            registrationTypeId: 'TEST-REGISTRATION-TYPE-2',
            registrationPathId: 'TEST-REGISTRATION-PATH-2'
          }
        }
      }
    }
  };

  it('GUEST: Should only return default regType since multipleRegistrationTypes feature is off', () => {
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    // Even though has visibiity to type 2,3, and 4. since the feature is off should only return default
    expect(result.regTypeCapacitiesAvailable.length).toBe(1);
    expect(result.regTypeCapacitiesAvailable[0].id).toBe('00000000-0000-0000-0000-000000000000');
    expect(result.isFull).toBe(false);
  });
});

describe('Planner max guest limit in state should be respected during planner reg', () => {
  let state = {
    ...initialState,
    limits: {
      perEventLimits: {
        maxNumberOfGuests: {
          limit: 6
        }
      }
    }
  };

  {
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    it('Should be the default max number of guests for reg path', () => {
      expect(result.guestCapacityMax).toBe(5);
    });
  }

  state = setIsPlanner(state, true);

  {
    // state = addNGuests(state, 'TEST-REGISTRATION-TYPE-1', 7);
    const result = getAvailableRegTypeCapacities(state, 'GUEST');
    it('Max should be account limit after changing to planner reg', () => {
      expect(result.guestCapacityMax).toBe(6);
    });
  }
});
