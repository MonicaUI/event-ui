import React from 'react';
import { shallow } from 'enzyme';
import RegistrationNavigatorWidgetWrapper, { LinearPageNavigatorWidget } from '../RegistrationNavigatorWidget';
import { REGISTERING } from '../../../redux/registrationIntents';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import { openTravelUnsavedInfoWarningDialog } from '../../../dialogs/TravelUnsavedInfoWarningDialog';
import { setIn } from 'icepick';
import { FEATURE_RELEASE_DEVELOPMENT_VARIANT } from '@cvent/event-ui-experiments';
import { setAirRequestOptOutChoice } from '../../../redux/registrationForm/regCart';
import { TRAVEL_OPT_OUT_CHOICE } from 'event-widgets/utils/travelConstants';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../../PaymentWidget/__mocks__/apolloClient';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';

jest.mock('../../../redux/pathInfo');
jest.mock('../../../redux/registrationForm/regCart');
jest.mock('../../../dialogs/TravelUnsavedInfoWarningDialog', () => {
  return {
    openTravelUnsavedInfoWarningDialog: jest.fn()
  };
});
jest.mock('../../../redux/website/pageContents');

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
  travelCart: {
    cart: { bookings: [] },
    userSession: {
      airRequest: { showSummary: true },
      hotelRequest: { isSummaryView: false, expandedHotels: [] },
      airActual: { showSummary: true },
      groupFlights: { showSummary: true }
    }
  },
  plannerRegSettings: {
    exitUrl: 'https://www.google.com/'
  },
  event: {
    registrationTypes: {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
        availableSessions: [],
        isOpenForRegistration: true
      }
    },
    createdDate: new Date('2021-08-27T18:29:00Z'),
    eventFeatureSetup: {
      agendaItems: {
        sessions: true
      }
    },
    products: {
      sessionContainer: {
        includedSessions: {},
        optionalSessions: {}
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
      }
    }
  },
  visibleProducts: {
    Sessions: {}
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
    translate: value => value,
    resolver: {
      fetchAllDataTags: value => value
    }
  },
  pathInfo: {
    currentPageId: 'regProcessStep1'
  },
  clients: {}
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

const getGuestRegistration = airOptOutChoice => {
  return {
    confirmedGuest: {
      attendee: { airOptOutChoice },
      eventRegistrationId: 'confirmedGuest',
      attendeeType: 'GUEST',
      primaryRegistrationId: 'primaryEventRegId',
      requestedAction: 'REGISTER'
    }
  };
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

const mockNavigationRequest = async (initialState, registrations, isForward) => {
  const getState = () => {
    const state = { ...initialState };
    const updatedState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations'], registrations);
    return { ...updatedState };
  };
  const props = makeProps(getState);
  const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
  const widget = wrapper.find(LinearPageNavigatorWidget);
  await widget.props().onNavigateRequest('page1', isForward);
};

const mockCompleteRequest = async (initialState, registrations) => {
  const getState = () => {
    const state = { ...initialState };
    const updatedState = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations'], registrations);
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
  describe('openTravelUnsavedInfoWarningDialog', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockUseGraphQLSiteEditorData = experimentStatus;
    });

    it('does not open TravelUnsavedInfoWarningDialog as no travel widget is expanded', async () => {
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(defaultPartialState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).not.toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog as air request is in expanded form', async () => {
      const newState = {
        ...defaultPartialState,
        experiments: { featureRelease: 0 },
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: true },
            hotelRequest: { isSummaryView: false, expandedHotels: [] },
            airActual: { showSummary: false }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    describe('- is behind air request opt out experiment', () => {
      const localState = {
        ...defaultPartialState,
        experiments: { featureRelease: FEATURE_RELEASE_DEVELOPMENT_VARIANT },
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: false },
            hotelRequest: { isSummaryView: true, expandedHotels: [] },
            airActual: { showSummary: true },
            groupFlights: { showSummary: true }
          }
        }
      };
      it('open TravelUnsavedInfoWarningDialog as air request is in expanded form but air request is not required', async () => {
        const newState = {
          ...localState,
          appData: {
            ...localState.appData,
            registrationSettings: {
              registrationPaths: {
                regPathId: {
                  ...localState.appData.registrationSettings.registrationPaths.regPathId,
                  travelSettings: { airRequestSettings: { requireAirRequest: false } }
                }
              }
            }
          }
        };
        const registrations = getPrimaryRegistration();
        await mockNavigationRequest(newState, registrations, true);
        expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
        expect(setAirRequestOptOutChoice).not.toHaveBeenCalled();
      });
      it('does not open TravelUnsavedInfoWarningDialog as air request is in expanded form but air request is required and there are no existing air requests', async () => {
        const newState = {
          ...localState,
          appData: {
            ...localState.appData,
            registrationSettings: {
              registrationPaths: {
                regPathId: {
                  ...localState.appData.registrationSettings.registrationPaths.regPathId,
                  travelSettings: { airRequestSettings: { requireAirRequest: true } }
                }
              }
            }
          }
        };
        const registrations = getPrimaryRegistration();
        await mockNavigationRequest(newState, registrations, true);
        expect(openTravelUnsavedInfoWarningDialog).not.toHaveBeenCalled();
        expect(setAirRequestOptOutChoice).not.toHaveBeenCalled();
      });
      it('open TravelUnsavedInfoWarningDialog as air request is required and air request info is incomplete but there are existing air requests', async () => {
        const newState = {
          ...localState,
          travelCart: {
            ...localState.travelCart,
            cart: {
              ...localState.travelCart.cart,
              bookings: [
                {
                  id: 'primaryEventRegId',
                  airBookings: [{ id: 'id_1' }]
                }
              ]
            }
          },
          appData: {
            ...localState.appData,
            registrationSettings: {
              registrationPaths: {
                regPathId: {
                  ...localState.appData.registrationSettings.registrationPaths.regPathId,
                  travelSettings: { airRequestSettings: { requireAirRequest: true } }
                }
              }
            }
          }
        };
        const registrations = getPrimaryRegistration();
        await mockNavigationRequest(newState, registrations, true);
        expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
        expect(setAirRequestOptOutChoice).not.toHaveBeenCalled();
      });
      it('does not opt out guest if primary has chosen opt out when InviteesAndGuests setting is not ON', async () => {
        const newState = {
          ...localState,
          travelCart: {
            ...localState.travelCart,
            userSession: {
              ...localState.travelCart.userSession,
              airRequest: { showSummary: true }
            }
          },
          appData: {
            ...localState.appData,
            registrationSettings: {
              registrationPaths: {
                regPathId: {
                  ...localState.appData.registrationSettings.registrationPaths.regPathId,
                  travelSettings: { airRequestSettings: { requireAirRequest: false } }
                }
              }
            }
          }
        };
        const registrations = {
          ...getGuestRegistration(TRAVEL_OPT_OUT_CHOICE.NOT_APPLICABLE),
          primaryEventRegId: {
            ...getPrimaryRegistration().primaryEventRegId,
            attendee: {
              airOptOutChoice: TRAVEL_OPT_OUT_CHOICE.OPT_OUT
            }
          }
        };
        await mockNavigationRequest(newState, registrations, true);
        expect(setAirRequestOptOutChoice).not.toHaveBeenCalled();
      });
    });
    it('open TravelUnsavedInfoWarningDialog as air actual in expanded form', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: false },
            hotelRequest: { isSummaryView: false, expandedHotels: [] },
            airActual: { showSummary: true }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog as hotel request in expanded form', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: false },
            hotelRequest: { isSummaryView: false, expandedHotels: ['dummyId'] },
            airActual: { showSummary: false }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    it('does not open TravelUnsavedInfoWarningDialog as no travel user session', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {}
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).not.toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog when previous button is pressed', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: true },
            hotelRequest: { isSummaryView: false, expandedHotels: ['dummyId'] },
            airActual: { showSummary: true },
            groupFlights: { showSummary: true }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, false);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog when submit button is pressed', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: true },
            hotelRequest: { isSummaryView: false, expandedHotels: ['dummyId'] },
            airActual: { showSummary: true },
            groupFlights: { showSummary: true }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockCompleteRequest(newState, registrations);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog as group flight in expanded form', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          ...defaultPartialState.travelCart,
          userSession: {
            airRequest: { showSummary: true },
            hotelRequest: { isSummaryView: false, expandedHotels: [] },
            airActual: { showSummary: true },
            groupFlights: { showSummary: false }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog as air request in expanded form and no travel booking found', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          cart: {},
          userSession: {
            airRequest: { showSummary: true },
            hotelRequest: { isSummaryView: false, expandedHotels: [] },
            airActual: { showSummary: false }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });

    it('open TravelUnsavedInfoWarningDialog when no air booking found and air request is expanded', async () => {
      const newState = {
        ...defaultPartialState,
        travelCart: {
          cart: {
            bookings: [{}]
          },
          userSession: {
            airRequest: { showSummary: true },
            hotelRequest: { isSummaryView: false, expandedHotels: [] },
            airActual: { showSummary: false }
          }
        }
      };
      const registrations = getPrimaryRegistration();
      await mockNavigationRequest(newState, registrations, true);
      expect(openTravelUnsavedInfoWarningDialog).toHaveBeenCalled();
    });
  });
});
