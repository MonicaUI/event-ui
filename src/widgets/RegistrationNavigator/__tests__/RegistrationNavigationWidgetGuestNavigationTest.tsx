import React from 'react';
import { shallow } from 'enzyme';
import RegistrationNavigatorWidgetWrapper, { LinearPageNavigatorWidget } from '../RegistrationNavigatorWidget';
import { REGISTERING } from '../../../redux/registrationIntents';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import { openGuestNavigationConflictDialog } from '../../../dialogs/selectionConflictDialogs';
import { setIn } from 'icepick';
import EventGuestClient from '../../../clients/EventGuestClient';
import { isWidgetReviewed } from '../../../redux/website/pageContents';
import { finalizeRegistration } from '../../../redux/registrationForm/regCart';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../../PaymentWidget/__mocks__/regCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../../PaymentWidget/__mocks__/apolloClient';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
jest.mock('../../PaymentWidget/getRegCartPricingAction', () => ({
  __esModule: true,
  default: async state => {
    return state;
  }
}));

jest.mock('../../../clients/EventGuestClient');
jest.mock('../../../redux/pathInfo');
jest.mock('../../../redux/registrationForm/regCart');
jest.mock('../../../dialogs/selectionConflictDialogs', () => {
  return {
    openGuestNavigationConflictDialog: jest.fn()
  };
});
jest.mock('../../../redux/website/pageContents');
jest.mock('../../../utils/datatagUtils', () => {
  return {
    fetchAllDatatagResolutions: jest.fn(),
    invalidateDatatagCache: jest.fn()
  };
});
let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Development;
jest.mock('../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            registrationType: {
              validation: {
                onPageBeforeIdentityConfirmation: true
              }
            },
            quantityItems: {
              validation: {
                onPageBeforeIdentityConfirmation: true
              }
            }
          }
        }
      }
    }
  })
}));
const sessions = {
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
};

const defaultPartialState = {
  account: {},
  registrationForm: {
    currentEventRegistrationId: 'primaryEventRegId',
    regCart: {
      eventRegistrations: {}
    },
    regCartPayment: {},
    warnings: {}
  },
  registrantLogin: {
    form: {}
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
        optionalSessions: sessions
      }
    },
    complianceSettings: {
      cookieBannerSettings: {
        showCookieBanner: false
      }
    }
  },
  visibleProducts: {
    Sessions: new Proxy(
      {},
      {
        get() {
          return {
            sessionProducts: sessions
          };
        }
      }
    )
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
      },
      regProcessStep2: {
        id: 'regProcessStep2',
        rootLayoutItemIds: ['id-4']
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
    },
    registrationPathSettings: {
      regPathId: {}
    }
  },
  text: {
    translate: value => value,
    resolver: {
      fetchAllDataTags: value => value
    }
  },
  pathInfo: {
    currentPageId: 'regProcessStep1'
  },
  clients: {
    eventGuestClient: new EventGuestClient(),
    regCartClient: new RegCartClient()
  },
  partialPaymentSettings: {
    paymentAmountOption: {
      value: 1
    },
    paymentAmount: 23
  }
};

const defaultAdmissionItemInfo = {
  productId: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
  productType: 'AdmissionItem',
  quantity: 1,
  requestedAction: 'REGISTER',
  registrationSourceType: 'Selected'
};

const getPrimaryRegistration = (admissionItem?) => {
  const primaryRegistration = {
    primaryEventRegId: {
      eventRegistrationId: 'primaryEventRegId',
      registrationPathId: 'regPathId',
      attendeeType: 'ATTENDEE',
      productRegistrations: []
    }
  };
  if (!admissionItem) {
    return primaryRegistration;
  }
  primaryRegistration.primaryEventRegId.productRegistrations.push(admissionItem);
  return primaryRegistration;
};

const getGuestRegistration = (eventRegId, admissionItem?) => {
  const guestRegistration = {
    [eventRegId]: {
      eventRegistrationId: eventRegId,
      registrationPathId: 'regPathId',
      primaryRegistrationId: 'primaryEventRegId',
      attendeeType: 'GUEST',
      requestedAction: 'REGISTER',
      productRegistrations: []
    }
  };
  if (!admissionItem) {
    return guestRegistration;
  }
  guestRegistration[eventRegId].productRegistrations.push(admissionItem);
  return guestRegistration;
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
      return await action(dispatch, getState, { apolloClient });
    }
  }
  const props = {
    ...defaultPropsNoStore,
    store: { dispatch, subscribe, getState }
  };
  return props;
};

const mockForwardRequest = async (initialState, registrations, eventRegistrationId?) => {
  const getState = () => {
    const state = { ...initialState };
    let updatedState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations'], registrations);
    if (eventRegistrationId) {
      updatedState = setIn(updatedState, ['registrationForm', 'currentEventRegistrationId'], 'primaryEventRegId');
    }
    return { ...updatedState };
  };
  const props = makeProps(getState);
  const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
  const widget = wrapper.find(LinearPageNavigatorWidget);
  await widget.props().onNavigateRequest('page1', true);
};

const mockCompleteRequest = async (initialState, registrations, eventRegistrationId?) => {
  const getState = () => {
    const state = { ...initialState };
    let updatedState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations'], registrations);
    if (eventRegistrationId) {
      updatedState = setIn(updatedState, ['registrationForm', 'currentEventRegistrationId'], 'primaryEventRegId');
    }
    return { ...updatedState };
  };
  const props = makeProps(getState);
  const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
  const widget = wrapper.find(LinearPageNavigatorWidget);
  await widget.props().onCompleteRequest();
};

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('RegistrationNavigatorWidget tests using %s site editor data', (_description, experimentStatus) => {
  describe('RegistrationNavigatorWidget forward request handles guests correctly', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });
    it('does not open navigation conflict if admission item widget is not reviewed', async () => {
      const guestEventRegIds = ['dummyGuestEventRegId1', 'dummyGuestEventRegId2'];
      const registrations = {
        ...getPrimaryRegistration(),
        ...getGuestRegistration(guestEventRegIds[0], defaultAdmissionItemInfo),
        ...getGuestRegistration(guestEventRegIds[1])
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => false);
      await mockForwardRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).not.toHaveBeenCalledWith();
    });

    it('does not open guest navigation conflict dialog when there are no guests', async () => {
      const registrations = {
        ...getPrimaryRegistration(defaultAdmissionItemInfo)
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => true);
      await mockForwardRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).not.toHaveBeenCalled();
    });

    it('does not open guest navigation conflict dialog when guests have admission item', async () => {
      const guestEventRegIds = ['dummyGuestEventRegId1'];
      const registrations = {
        ...getPrimaryRegistration(defaultAdmissionItemInfo),
        ...getGuestRegistration(guestEventRegIds[0], defaultAdmissionItemInfo)
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => true);
      await mockForwardRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).not.toHaveBeenCalled();
    });

    it('opens guest navigation conflict dialog with only those guests missing admission items', async () => {
      const guestEventRegIds = ['dummyGuestEventRegId1', 'dummyGuestEventRegId2'];
      const registrations = {
        ...getPrimaryRegistration(),
        ...getGuestRegistration(guestEventRegIds[0], defaultAdmissionItemInfo),
        ...getGuestRegistration(guestEventRegIds[1])
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => true);
      await mockForwardRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).toHaveBeenCalledWith([guestEventRegIds[1]]);
    });
  });

  describe('RegistrationNavigatorWidget complete request handles guests correctly', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
      finalizeRegistration.mockImplementation(() => () => Promise.resolve({ statusCode: 'COMPLETED' }));
    });

    it('does not open navigation conflict if admission item widget is not reviewed', async () => {
      const guestEventRegIds = ['dummyGuestEventRegId1', 'dummyGuestEventRegId2'];
      const registrations = {
        ...getPrimaryRegistration(),
        ...getGuestRegistration(guestEventRegIds[0], defaultAdmissionItemInfo),
        ...getGuestRegistration(guestEventRegIds[1])
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => false);
      await mockCompleteRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).not.toHaveBeenCalledWith();
    });

    it('does not open guest navigation conflict dialog when there are no guests', async () => {
      const registrations = {
        ...getPrimaryRegistration(defaultAdmissionItemInfo)
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => true);
      await mockCompleteRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).not.toHaveBeenCalled();
    });

    it('does not open guest navigation conflict dialog when guests have admission item', async () => {
      const guestEventRegIds = ['dummyGuestEventRegId1'];
      const registrations = {
        ...getPrimaryRegistration(defaultAdmissionItemInfo),
        ...getGuestRegistration(guestEventRegIds[0], defaultAdmissionItemInfo)
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => true);
      await mockCompleteRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).not.toHaveBeenCalled();
    });

    it('opens guest navigation conflict dialog with only those guests missing admission items', async () => {
      const guestEventRegIds = ['dummyGuestEventRegId1', 'dummyGuestEventRegId2'];
      const registrations = {
        ...getPrimaryRegistration(),
        ...getGuestRegistration(guestEventRegIds[0], defaultAdmissionItemInfo),
        ...getGuestRegistration(guestEventRegIds[1])
      };
      (isWidgetReviewed as $TSFixMe).mockImplementation(() => true);
      await mockCompleteRequest(defaultPartialState, registrations);
      expect(openGuestNavigationConflictDialog).toHaveBeenCalledWith([guestEventRegIds[1]]);
    });
  });
});
