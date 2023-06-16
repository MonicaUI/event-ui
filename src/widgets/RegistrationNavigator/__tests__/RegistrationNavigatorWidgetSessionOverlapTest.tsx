import React from 'react';
import { shallow } from 'enzyme';
import RegistrationNavigatorWidgetWrapper, { LinearPageNavigatorWidget } from '../RegistrationNavigatorWidget';
import { REGISTERING } from '../../../redux/registrationIntents';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import { openSessionOverlapWarningDialog } from '../../../dialogs/SessionOverlapWarningDialog';
import { setIn } from 'icepick';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../../PaymentWidget/__mocks__/apolloClient';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
jest.mock('../../../redux/pathInfo', () => {
  return {
    getCurrentPageId: () => 'regProcessStep1',
    routeToPage: () => () => ({ type: 'DO_NOTHING' })
  };
});
jest.mock('../../../redux/registrationForm/regCart');
jest.mock('../../../dialogs//SessionOverlapWarningDialog');
let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Development;
jest.mock('../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

const mockQuantityItemsBeforeIdentityConfirm = true;
jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            quantityItems: {
              validation: {
                onPageBeforeIdentityConfirmation: mockQuantityItemsBeforeIdentityConfirm
              }
            }
          }
        }
      }
    }
  })
}));

const sessionProducts = {
  sessionProducts: {
    'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18': {
      categoryId: '00000000-0000-0000-0000-000000000000',
      startTime: '2018-09-03T22:00:00.000Z',
      endTime: '2018-09-03T23:00:00.000Z',
      isOpenForRegistration: true,
      isIncludedSession: false,
      registeredCount: 0,
      associatedWithAdmissionItems: [],
      availableToAdmissionItems: [],
      associatedRegistrationTypes: [],
      sessionCustomFieldValues: {},
      displayPriority: 0,
      showOnAgenda: true,
      speakerIds: {},
      code: '',
      description: '',
      id: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
      capacityId: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
      name: 'Session 1',
      status: 2,
      type: 'Session',
      defaultFeeId: '00000000-0000-0000-0000-000000000000',
      fees: {}
    },
    'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30': {
      categoryId: '00000000-0000-0000-0000-000000000000',
      startTime: '2018-09-03T22:00:00.000Z',
      endTime: '2018-09-03T23:00:00.000Z',
      isOpenForRegistration: true,
      isIncludedSession: false,
      registeredCount: 0,
      associatedWithAdmissionItems: [],
      availableToAdmissionItems: [],
      associatedRegistrationTypes: [],
      sessionCustomFieldValues: {},
      displayPriority: 0,
      showOnAgenda: true,
      speakerIds: {},
      code: '',
      description: '',
      id: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
      capacityId: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
      name: 'Session 2',
      status: 2,
      type: 'Session',
      defaultFeeId: '00000000-0000-0000-0000-000000000000',
      fees: {}
    }
  },
  sortKeys: {
    'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18': [
      '08:00',
      '2019-06-07 22:00:00:000',
      '2147483647',
      '',
      '9223372036854775807'
    ],
    'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30': [
      '08:00',
      '2019-06-07 22:00:00:000',
      '2147483647',
      '',
      '9223372036854775807'
    ]
  }
};

const defaultPartialState = {
  registrationForm: {
    currentEventRegistrationId: 'primaryEventRegId',
    regCart: {
      eventRegistrations: {}
    },
    warnings: {}
  },
  regCartStatus: {
    registrationIntent: REGISTERING
  },
  userSession: {},
  defaultUserSession: {
    isPlanner: false
  },
  plannerRegSettings: {
    exitUrl: 'https://www.google.com/'
  },
  event: {
    registrationTypes: {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
        availableSessions: ['cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18', 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30'],
        isOpenForRegistration: true
      }
    },
    eventFeatureSetup: {
      agendaItems: {
        sessions: true
      }
    },
    products: {
      sessionContainer: {
        includedSessions: {},
        optionalSessions: {
          'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2018-09-03T22:00:00.000Z',
            endTime: '2018-09-03T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            showOnAgenda: true,
            speakerIds: {},
            code: '',
            description: '',
            id: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
            capacityId: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
            name: 'Session 1',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          },
          'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30': {
            categoryId: '00000000-0000-0000-0000-000000000000',
            startTime: '2018-09-03T22:00:00.000Z',
            endTime: '2018-09-03T23:00:00.000Z',
            isOpenForRegistration: true,
            isIncludedSession: false,
            registeredCount: 0,
            associatedWithAdmissionItems: [],
            availableToAdmissionItems: [],
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            showOnAgenda: true,
            speakerIds: {},
            code: '',
            description: '',
            id: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
            capacityId: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
            name: 'Session 2',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {}
          }
        }
      }
    }
  },
  website: {
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['regProcessStep1']
          }
        }
      },
      eventWebsiteNavigation: {
        defaultPageId: 'website1'
      }
    },
    pages: {
      regProcessStep1: {
        id: 'regProcessStep1',
        rootLayoutItemIds: ['id-3']
      }
    },
    layoutItems: {
      'id-3': {
        layout: {
          childIds: ['temp-1469646842439'],
          type: 'container'
        },
        id: 'id-3'
      },
      'temp-1469646842439': {
        layout: {
          childIds: ['temp-1469646842440'],
          parentId: 'id-3'
        },
        id: 'temp-1469646842439'
      },
      'temp-1469646842440': {
        layout: {
          childIds: ['row:14ee1cd8-816a-11e8-adc0-fa7ae01bbebc', 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'],
          parentId: 'temp-1469646842439'
        },
        id: 'temp-1469646842440'
      },
      'row:241d35e0-d8d9-4860-b4e1-235616a2922a': {
        layout: {
          type: 'row',
          childIds: ['registrationNavigatorWidget'],
          parentId: 'temp-1469646842440'
        },
        id: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
      },
      registrationNavigatorWidget: {
        layout: {
          type: 'widget',
          childIds: [],
          parentId: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
        },
        id: 'registrationNavigatorWidget'
      },
      'row:14ee1cd8-816a-11e8-adc0-fa7ae01bbebc': {
        layout: {
          type: 'row',
          childIds: ['widget:ca84404e-e84d-47c4-a2c9-0782829c18d9'],
          parentId: 'temp-1469646842440'
        },
        id: 'row:14ee1cd8-816a-11e8-adc0-fa7ae01bbebc'
      },
      'widget:ca84404e-e84d-47c4-a2c9-0782829c18d9': {
        layout: {
          colspan: 12,
          type: 'widget',
          childIds: [],
          cellSize: 4,
          parentId: 'row:14ee1cd8-816a-11e8-adc0-fa7ae01bbebc'
        },
        id: 'widget:ca84404e-e84d-47c4-a2c9-0782829c18d9',
        config: {
          filter: {
            selectedFilterOrder: [],
            displayKeywordFilter: false
          },
          headerText: 'EventWidgets_Sessions_SessionTitle__resx',
          allowOverlappingSessions: false,
          display: {
            sessionCustomField: false,
            description: true,
            fees: true,
            code: false,
            locationName: true,
            capacity: true
          },
          sort: {
            selectedSortOrder: ['startDate', 'startTime', 'category']
          }
        },
        widgetType: 'Sessions'
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          id: 'regPathId',
          isDefault: true,
          allowOverlappingSessions: false
        }
      }
    }
  },
  text: {
    translate: value => value
  },
  pathInfo: {
    currentPageId: 'regProcessStep1'
  },
  visibleProducts: {
    Sessions: {
      primaryEventRegId: { ...sessionProducts },
      guestEventRegId1: { ...sessionProducts },
      guestEventRegId2: { ...sessionProducts },
      groupMemberId: { ...sessionProducts },
      groupMemberId2: { ...sessionProducts },
      groupMemberGuestEventRegId1: { ...sessionProducts },
      groupMemberGuestEventRegId2: { ...sessionProducts }
    }
  }
};

const getPartialStateWithOverlapAllowed = () => {
  const state = { ...defaultPartialState };
  const stateWithOverlapAllowed = setIn(
    state,
    ['appData', 'registrationSettings', 'registrationPaths', 'regPathId', 'allowOverlappingSessions'],
    true
  );
  return stateWithOverlapAllowed;
};

const defaultSessionInfo = {
  'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18': {
    requestedAction: 'REGISTER',
    productId: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
    registrationSourceType: 'Selected',
    includedInAgenda: false
  }
};

const alternateSessionInfo = {
  'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30': {
    requestedAction: 'REGISTER',
    productId: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
    registrationSourceType: 'Selected',
    includedInAgenda: false
  }
};

const overlappingSessionInfo = { ...defaultSessionInfo, ...alternateSessionInfo };

const getPrimaryRegistration = (sessions?) => {
  let primaryRegistration = {
    primaryEventRegId: {
      eventRegistrationId: 'primaryEventRegId',
      registrationPathId: 'regPathId',
      attendeeType: 'ATTENDEE',
      sessionRegistrations: {}
    }
  };
  if (!sessions) {
    return primaryRegistration;
  }
  primaryRegistration = setIn(primaryRegistration, ['primaryEventRegId', 'sessionRegistrations'], sessions);
  return primaryRegistration;
};

const getGuestRegistration = sessions => {
  let guestRegistration = {
    guestEventRegId1: {
      eventRegistrationId: 'guestEventRegId1',
      registrationPathId: 'regPathId',
      primaryRegistrationId: 'primaryEventRegId',
      attendeeType: 'GUEST',
      requestedAction: 'REGISTER',
      sessionRegistrations: {}
    }
  };
  if (!sessions) {
    return guestRegistration;
  }
  guestRegistration = setIn(guestRegistration, ['guestEventRegId1', 'sessionRegistrations'], sessions);
  return guestRegistration;
};

const defaultTwoGuestsRegistration = {
  ...getGuestRegistration(defaultSessionInfo),
  guestEventRegId2: {
    eventRegistrationId: 'guestEventRegId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...defaultSessionInfo
    }
  }
};

const twoGuestsDifferentSessionsRegistration = {
  ...getGuestRegistration(defaultSessionInfo),
  guestEventRegId2: {
    eventRegistrationId: 'guestEventRegId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...alternateSessionInfo
    }
  }
};

const getGroupLeaderRegistration = (sessions?) => {
  let groupLeaderRegistration = {
    primaryEventRegId: {
      eventRegistrationId: 'primaryEventRegId',
      registrationPathId: 'regPathId',
      attendeeType: 'GROUP_LEADER',
      sessionRegistrations: {}
    }
  };
  if (!sessions) {
    return groupLeaderRegistration;
  }
  groupLeaderRegistration = setIn(groupLeaderRegistration, ['primaryEventRegId', 'sessionRegistrations'], sessions);
  return groupLeaderRegistration;
};

const getGroupMemberRegistration = (sessions?) => {
  let groupMemberRegistration = {
    groupMemberId: {
      eventRegistrationId: 'groupMemberId',
      registrationPathId: 'regPathId',
      primaryRegistrationId: 'primaryEventRegId',
      attendeeType: 'ATTENDEE',
      requestedAction: 'REGISTER',
      sessionRegistrations: {}
    }
  };
  if (!sessions) {
    return groupMemberRegistration;
  }
  groupMemberRegistration = setIn(groupMemberRegistration, ['groupMemberId', 'sessionRegistrations'], sessions);
  return groupMemberRegistration;
};

const sessionlessGroupMemberRegistration2 = {
  groupMemberId2: {
    eventRegistrationId: 'groupMemberId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'ATTENDEE',
    requestedAction: 'REGISTER',
    sessionRegistrations: {}
  }
};

const defaultGroupMemberRegistration2 = {
  groupMemberId2: {
    eventRegistrationId: 'groupMemberId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'ATTENDEE',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...defaultSessionInfo
    }
  }
};

const defaultGroupMemberGuestRegistration = {
  groupMemberGuestEventRegId1: {
    eventRegistrationId: 'groupMemberGuestEventRegId1',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...defaultSessionInfo
    }
  }
};

const alternateGroupMemberGuestRegistration = {
  groupMemberGuestEventRegId1: {
    eventRegistrationId: 'groupMemberGuestEventRegId1',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...alternateSessionInfo
    }
  }
};

const groupMemberTwoGuestsOverlappingSessions = {
  ...getGroupMemberRegistration(),
  ...defaultGroupMemberGuestRegistration,
  groupMemberGuestEventRegId2: {
    eventRegistrationId: 'groupMemberGuestEventRegId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...alternateSessionInfo
    }
  }
};

const alternateGroupMemberGuestRegistration2 = {
  groupMemberGuestEventRegId2: {
    eventRegistrationId: 'groupMemberGuestEventRegId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId2',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...alternateSessionInfo
    }
  }
};

const defaultTwoGroupMemberGuestsRegistration = {
  ...defaultGroupMemberGuestRegistration,
  groupMemberGuestEventRegId2: {
    eventRegistrationId: 'groupMemberGuestEventRegId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...defaultSessionInfo
    }
  }
};

const defaultGroupMemberGuestRegistrationWithOverlap = {
  groupMemberGuestEventRegId1: {
    eventRegistrationId: 'groupMemberGuestEventRegId1',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...overlappingSessionInfo
    }
  }
};

const sessionlessTwoGroupMembersRegistration = {
  ...getGroupMemberRegistration(),
  groupMemberId2: {
    eventRegistrationId: 'groupMemberId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'ATTENDEE',
    requestedAction: 'REGISTER',
    sessionRegistrations: {}
  }
};

const defaultTwoGroupMembersRegistration = {
  ...getGroupMemberRegistration(defaultSessionInfo),
  groupMemberId2: {
    eventRegistrationId: 'groupMemberId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'ATTENDEE',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...defaultSessionInfo
    }
  }
};

const twoGroupMembersDifferentSessionsRegistration = {
  ...getGroupMemberRegistration(defaultSessionInfo),
  groupMemberId2: {
    eventRegistrationId: 'groupMemberId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'primaryEventRegId',
    attendeeType: 'ATTENDEE',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...alternateSessionInfo
    }
  }
};

const defaultTwoGroupMembersWithGuestsRegistration = {
  ...sessionlessTwoGroupMembersRegistration,
  ...defaultGroupMemberGuestRegistration,
  groupMemberGuestEventRegId2: {
    eventRegistrationId: 'groupMemberGuestEventRegId2',
    registrationPathId: 'regPathId',
    primaryRegistrationId: 'groupMemberId2',
    attendeeType: 'GUEST',
    requestedAction: 'REGISTER',
    sessionRegistrations: {
      ...defaultSessionInfo
    }
  }
};

const subscribe = () => {};

const defaultPropsNoStore = {
  nucleusForm: createLocalNucleusForm(),
  config: {
    displayText: {
      backward: 'backward',
      forward: 'forward',
      complete: 'complete',
      exit: 'exit'
    }
  },
  classes: {},
  style: {},
  translate: x => x,
  id: 'registrationNavigatorWidget'
};

const apolloClient = mockApolloClient();
const makeProps = getState => {
  async function dispatch(action) {
    if (typeof action === 'function') {
      await action(dispatch, getState, { apolloClient });
    }
  }
  const props = {
    ...defaultPropsNoStore,
    store: { dispatch, subscribe, getState }
  };
  return props;
};

const mockValidations = async (initialState, registrations, eventRegistrationId?) => {
  const getState = () => {
    const state = { ...initialState };
    let updatedState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations'], registrations);
    if (eventRegistrationId) {
      updatedState = setIn(updatedState, ['registrationForm', 'currentEventRegistrationId'], eventRegistrationId);
    }
    return { ...updatedState };
  };
  const props = makeProps(getState);
  const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
  const widget = wrapper.find(LinearPageNavigatorWidget);
  await widget.props().onNavigateRequest('page1', true);
};

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('RegistrationNavigatorWidget tests using %s site editor data', (_description, experimentStatus) => {
  describe('RegistrationNavigatorWidget throws session overlap for individual validations with allow overlapping sessions OFF', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('handles session overlap for primary', async () => {
      await mockValidations(defaultPartialState, getPrimaryRegistration(overlappingSessionInfo));
      expect(openSessionOverlapWarningDialog).toHaveBeenCalled();
    });

    it('handles session overlap for guest', async () => {
      const guestSessionOverlapRegistration = {
        ...getPrimaryRegistration(),
        ...getGuestRegistration(overlappingSessionInfo)
      };
      await mockValidations(defaultPartialState, guestSessionOverlapRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalled();
    });

    it('handles session overlap for group leader', async () => {
      const groupLeaderOverlapRegistration = {
        ...getGroupLeaderRegistration(overlappingSessionInfo),
        ...getGroupMemberRegistration()
      };
      await mockValidations(defaultPartialState, groupLeaderOverlapRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalled();
    });

    it('handles session overlap for group member', async () => {
      const groupMemberOverlapRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(overlappingSessionInfo)
      };
      await mockValidations(defaultPartialState, groupMemberOverlapRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalled();
    });

    it('handles session overlap for guest of group member', async () => {
      const guestOfGroupMemberOverlapRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistrationWithOverlap
      };
      await mockValidations(defaultPartialState, guestOfGroupMemberOverlapRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalled();
    });
  });

  describe('RegistrationNavigatorWidget skips individual session overlap validations with allow overlapping sessions ON', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('allows primary to proceed with session overlap', async () => {
      await mockValidations(getPartialStateWithOverlapAllowed(), getPrimaryRegistration(overlappingSessionInfo));
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('allows guest to proceed with session overlap', async () => {
      const guestSessionOverlapRegistration = {
        ...getPrimaryRegistration(),
        ...getGuestRegistration(overlappingSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), guestSessionOverlapRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('allows group leader to proceed with session overlap', async () => {
      const groupLeaderOverlapRegistration = {
        ...getGroupLeaderRegistration(overlappingSessionInfo),
        ...getGroupMemberRegistration()
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupLeaderOverlapRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('allows group member to proceed with session overlap', async () => {
      const groupMemberOverlapRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(overlappingSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberOverlapRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('allows guest of group member to pass with session overlap', async () => {
      const guestOfGroupMemberOverlapRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistrationWithOverlap
      };
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestOfGroupMemberOverlapRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });
  });

  /**
   * A "shared" session indicates two attendees are going to the same session
   */
  describe('RegistrationNavigatorWidget shared session across registrations with allow overlapping sessions OFF', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('can proceed when primary and guest share a session', async () => {
      const primaryGuestSharedSessionRegistration = {
        ...getPrimaryRegistration(defaultSessionInfo),
        ...getGuestRegistration(defaultSessionInfo)
      };
      await mockValidations(defaultPartialState, primaryGuestSharedSessionRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when leader and group member share a session', async () => {
      const leaderGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(defaultSessionInfo)
      };
      await mockValidations(defaultPartialState, leaderGroupMemberSharedSessionRegistration);
      await mockValidations(defaultPartialState, leaderGroupMemberSharedSessionRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when leader and guest of group member share a session', async () => {
      const leaderGroupMemberGuestSharedSessionRegistration = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, leaderGroupMemberGuestSharedSessionRegistration);
      await mockValidations(defaultPartialState, leaderGroupMemberGuestSharedSessionRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when two guests share a session', async () => {
      const twoGuestsSharedSessionRegistration = {
        ...getPrimaryRegistration(),
        ...defaultTwoGuestsRegistration
      };
      await mockValidations(defaultPartialState, twoGuestsSharedSessionRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when guest and group member share a session', async () => {
      const groupMemberGuestSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(defaultSessionInfo)
      };
      await mockValidations(defaultPartialState, groupMemberGuestSharedSessionRegistration);
      await mockValidations(defaultPartialState, groupMemberGuestSharedSessionRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when guest and guest of group member share a session', async () => {
      const guestOfPrimaryAndGuestOfGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, guestOfPrimaryAndGuestOfGroupMemberSharedSessionRegistration);
      await mockValidations(
        defaultPartialState,
        guestOfPrimaryAndGuestOfGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when two group members share a session', async () => {
      const groupMembersSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...defaultTwoGroupMembersRegistration
      };
      await mockValidations(defaultPartialState, groupMembersSharedSessionRegistration);
      await mockValidations(defaultPartialState, groupMembersSharedSessionRegistration, 'groupMemberId');
      await mockValidations(defaultPartialState, groupMembersSharedSessionRegistration, 'groupMemberId2');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when group member and their guest share a session', async () => {
      const groupMemberAndGuestOfGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(defaultSessionInfo),
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, groupMemberAndGuestOfGroupMemberSharedSessionRegistration);
      await mockValidations(
        defaultPartialState,
        groupMemberAndGuestOfGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when group member and group member guest outside their group share a session', async () => {
      const groupMemberGuestUnassociatedGroupMemberOverlapAcrossRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberRegistration2,
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, groupMemberGuestUnassociatedGroupMemberOverlapAcrossRegistration);
      await mockValidations(
        defaultPartialState,
        groupMemberGuestUnassociatedGroupMemberOverlapAcrossRegistration,
        'groupMemberId'
      );
      await mockValidations(
        defaultPartialState,
        groupMemberGuestUnassociatedGroupMemberOverlapAcrossRegistration,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when two guests of same group member share a session', async () => {
      const twoGuestsOfGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultTwoGroupMemberGuestsRegistration
      };
      await mockValidations(defaultPartialState, twoGuestsOfGroupMemberSharedSessionRegistration);
      await mockValidations(defaultPartialState, twoGuestsOfGroupMemberSharedSessionRegistration, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when guests of two different group members share a session', async () => {
      const guestOfGroupMemberAndUnassociatedGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...defaultTwoGroupMembersWithGuestsRegistration
      };
      await mockValidations(defaultPartialState, guestOfGroupMemberAndUnassociatedGroupMemberSharedSessionRegistration);
      await mockValidations(
        defaultPartialState,
        guestOfGroupMemberAndUnassociatedGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      await mockValidations(
        defaultPartialState,
        guestOfGroupMemberAndUnassociatedGroupMemberSharedSessionRegistration,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });
  });

  describe('RegistrationNavigatorWidget shared session across registrations with allow overlapping sessions ON', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('can proceed when primary and guest share a session', async () => {
      const primaryGuestSharedSessionRegistration = {
        ...getPrimaryRegistration(defaultSessionInfo),
        ...getGuestRegistration(defaultSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), primaryGuestSharedSessionRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when leader and group member share a session', async () => {
      const leaderGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(defaultSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), leaderGroupMemberSharedSessionRegistration);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        leaderGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when leader and guest of group member share a session', async () => {
      const leaderGroupMemberGuestSharedSessionRegistration = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), leaderGroupMemberGuestSharedSessionRegistration);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        leaderGroupMemberGuestSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when two guests share a session', async () => {
      const twoGuestsSharedSessionRegistration = {
        ...getPrimaryRegistration(),
        ...defaultTwoGuestsRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), twoGuestsSharedSessionRegistration);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when guest and group member share a session', async () => {
      const groupMemberGuestSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(defaultSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberGuestSharedSessionRegistration);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberGuestSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when guest and guest of group member share a session', async () => {
      const guestOfPrimaryAndGuestOfGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestOfPrimaryAndGuestOfGroupMemberSharedSessionRegistration
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestOfPrimaryAndGuestOfGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when two group members share a session', async () => {
      const groupMembersSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...defaultTwoGroupMembersRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMembersSharedSessionRegistration);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMembersSharedSessionRegistration,
        'groupMemberId'
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMembersSharedSessionRegistration,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when group member and their guest share a session', async () => {
      const groupMemberAndGuestOfGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(defaultSessionInfo),
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberAndGuestOfGroupMemberSharedSessionRegistration
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberAndGuestOfGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when group member and group member guest outside their group share a session', async () => {
      const groupGuestUnassociatedGroupMemberOverlapAcrossRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberRegistration2,
        ...defaultGroupMemberGuestRegistration
      };
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupGuestUnassociatedGroupMemberOverlapAcrossRegistration
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupGuestUnassociatedGroupMemberOverlapAcrossRegistration,
        'groupMemberId'
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupGuestUnassociatedGroupMemberOverlapAcrossRegistration,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when two guests of same group member share a session', async () => {
      const twoGuestsOfGroupMemberSharedSessionRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultTwoGroupMemberGuestsRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), twoGuestsOfGroupMemberSharedSessionRegistration);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        twoGuestsOfGroupMemberSharedSessionRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed when guests of two different group members share a session', async () => {
      const guestsAcrossGroupMembersSharedSession = {
        ...getGroupLeaderRegistration(),
        ...defaultTwoGroupMembersWithGuestsRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), guestsAcrossGroupMembersSharedSession);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestsAcrossGroupMembersSharedSession,
        'groupMemberId'
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestsAcrossGroupMembersSharedSession,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });
  });

  describe('RegistrationNavigatorWidget session overlap across registrations with allow overlapping sessions OFF', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('can proceed with overlapping sessions across primary and guest registrations', async () => {
      const primaryGuestOverlapAcrossRegistrations = {
        ...getPrimaryRegistration(defaultSessionInfo),
        ...getGuestRegistration(alternateSessionInfo)
      };
      await mockValidations(defaultPartialState, primaryGuestOverlapAcrossRegistrations);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across leader and group member registrations', async () => {
      const leaderAndGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(alternateSessionInfo)
      };
      await mockValidations(defaultPartialState, leaderAndGroupMemberOverlapAcrossRegistrations);
      await mockValidations(defaultPartialState, leaderAndGroupMemberOverlapAcrossRegistrations, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across leader and guest of group member registrations', async () => {
      const leaderGroupMemberGuestOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, leaderGroupMemberGuestOverlapAcrossRegistrations);
      await mockValidations(defaultPartialState, leaderGroupMemberGuestOverlapAcrossRegistrations, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guest registrations', async () => {
      const guestsOverlapAcrossRegistrations = {
        ...getPrimaryRegistration(),
        ...twoGuestsDifferentSessionsRegistration
      };
      await mockValidations(defaultPartialState, guestsOverlapAcrossRegistrations);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guest and group member registrations', async () => {
      const groupMemberGuestOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(alternateSessionInfo)
      };
      await mockValidations(defaultPartialState, groupMemberGuestOverlapAcrossRegistrations);
      await mockValidations(defaultPartialState, groupMemberGuestOverlapAcrossRegistrations, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guest and guest of group member registrations', async () => {
      const guestOfPrimaryAndGuestOfGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, guestOfPrimaryAndGuestOfGroupMemberOverlapAcrossRegistrations);
      await mockValidations(
        defaultPartialState,
        guestOfPrimaryAndGuestOfGroupMemberOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across two group member registrations', async () => {
      const groupMembersOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...twoGroupMembersDifferentSessionsRegistration
      };
      await mockValidations(defaultPartialState, groupMembersOverlapAcrossRegistrations);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across group member and their guest registrations', async () => {
      const groupMemberAndGuestOfGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(defaultSessionInfo),
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(defaultPartialState, groupMemberAndGuestOfGroupMemberOverlapAcrossRegistrations);
      await mockValidations(
        defaultPartialState,
        groupMemberAndGuestOfGroupMemberOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across group member and a group member guest outside their group', async () => {
      const guestOfGroupMemberAndUnassociatedGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...alternateGroupMemberGuestRegistration,
        ...defaultGroupMemberRegistration2
      };
      await mockValidations(
        defaultPartialState,
        guestOfGroupMemberAndUnassociatedGroupMemberOverlapAcrossRegistrations
      );
      await mockValidations(
        defaultPartialState,
        guestOfGroupMemberAndUnassociatedGroupMemberOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across two guests of group member registrations', async () => {
      const twoGuestsOfGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...groupMemberTwoGuestsOverlappingSessions
      };
      await mockValidations(defaultPartialState, twoGuestsOfGroupMemberOverlapAcrossRegistrations);
      await mockValidations(defaultPartialState, twoGuestsOfGroupMemberOverlapAcrossRegistrations, 'groupMemberId');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guests of different group members registrations', async () => {
      const groupMemberGuestDifferentGroupOverlap = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistration,
        ...sessionlessGroupMemberRegistration2,
        ...alternateGroupMemberGuestRegistration2
      };
      await mockValidations(defaultPartialState, groupMemberGuestDifferentGroupOverlap);
      await mockValidations(defaultPartialState, groupMemberGuestDifferentGroupOverlap, 'groupMemberId');
      await mockValidations(defaultPartialState, groupMemberGuestDifferentGroupOverlap, 'groupMemberId2');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });
  });

  describe('RegistrationNavigatorWidget session overlap across registrations with allow overlapping sessions ON', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('can proceed with overlapping sessions across primary and guest registrations', async () => {
      const primaryGuestOverlapAcrossRegistrations = {
        ...getPrimaryRegistration(defaultSessionInfo),
        ...getGuestRegistration(alternateSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), primaryGuestOverlapAcrossRegistrations);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across leader and group member registrations', async () => {
      const leaderAndGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(alternateSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), leaderAndGroupMemberOverlapAcrossRegistrations);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        leaderAndGroupMemberOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across leader and guest of group member registrations', async () => {
      const leaderGroupMemberGuestOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), leaderGroupMemberGuestOverlapAcrossRegistrations);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        leaderGroupMemberGuestOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guest registrations', async () => {
      const guestSessionOverlapAcrossRegistrations = {
        ...getPrimaryRegistration(),
        ...twoGuestsDifferentSessionsRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), guestSessionOverlapAcrossRegistrations);
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guest and group member registrations', async () => {
      const groupMemberGuestOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(alternateSessionInfo)
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberGuestOverlapAcrossRegistrations);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberGuestOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guest and guest of group member registrations', async () => {
      const guestOfPrimaryAndGuestOfGroupMemberOverlapAcrossRegistration = {
        ...getGroupLeaderRegistration(),
        ...getGuestRegistration(defaultSessionInfo),
        ...getGroupMemberRegistration(),
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestOfPrimaryAndGuestOfGroupMemberOverlapAcrossRegistration
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        guestOfPrimaryAndGuestOfGroupMemberOverlapAcrossRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across two group member registrations', async () => {
      const groupMembersOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...twoGroupMembersDifferentSessionsRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMembersOverlapAcrossRegistrations);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMembersOverlapAcrossRegistrations,
        'groupMemberId'
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMembersOverlapAcrossRegistrations,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across group member and their guest registrations', async () => {
      const groupMemberAndGuestOfGroupMemberOverlapAcrossRegistrations = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(defaultSessionInfo),
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberAndGuestOfGroupMemberOverlapAcrossRegistrations
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberAndGuestOfGroupMemberOverlapAcrossRegistrations,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across group member and group member guest outside their group', async () => {
      const groupMemberOutsideGroupGuestOverlap = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberRegistration2,
        ...alternateGroupMemberGuestRegistration
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberOutsideGroupGuestOverlap);
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberOutsideGroupGuestOverlap, 'groupMemberId');
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberOutsideGroupGuestOverlap, 'groupMemberId2');
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across two guests of group member registrations', async () => {
      const twoGuestsOfGroupMemberOverlapAcrossRegistration = {
        ...getGroupLeaderRegistration(),
        ...groupMemberTwoGuestsOverlappingSessions
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), twoGuestsOfGroupMemberOverlapAcrossRegistration);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        twoGuestsOfGroupMemberOverlapAcrossRegistration,
        'groupMemberId'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });

    it('can proceed with overlapping sessions across guests of different group members registrations', async () => {
      const groupMemberGuestDifferentGroupOverlap = {
        ...getGroupLeaderRegistration(),
        ...getGroupMemberRegistration(),
        ...defaultGroupMemberGuestRegistration,
        ...sessionlessGroupMemberRegistration2,
        ...alternateGroupMemberGuestRegistration2
      };
      await mockValidations(getPartialStateWithOverlapAllowed(), groupMemberGuestDifferentGroupOverlap);
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberGuestDifferentGroupOverlap,
        'groupMemberId'
      );
      await mockValidations(
        getPartialStateWithOverlapAllowed(),
        groupMemberGuestDifferentGroupOverlap,
        'groupMemberId2'
      );
      expect(openSessionOverlapWarningDialog).toHaveBeenCalledTimes(0);
    });
  });
});
