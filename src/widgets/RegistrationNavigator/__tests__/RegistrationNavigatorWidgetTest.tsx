import React from 'react';
jest.mock('../../../clients/EventGuestClient');
jest.mock('../../../clients/RegCartClient');
jest.mock('../../../redux/registrationForm/regCart');
jest.mock('../../../redux/registrationForm/regCart/actions');
jest.mock('../../../dialogs/AlreadyRegisteredDialog');
jest.mock('../../../dialogs/CapacityReachedDialog');
jest.mock('../../../dialogs/KnownErrorDialog');
jest.mock('../../../dialogs/PrivateEventErrorDialog');
jest.mock('../../../dialogs/SessionOverlapWarningDialog');
jest.mock('../../../redux/persona');
jest.mock('../../../dialogs/GroupMemberRemoveDialog');
jest.mock('../../../dialogs/GroupCancelDialog');
jest.mock('../../../redux/actions');
jest.mock('../../../redux/capacity');
jest.mock('../../../dialogs/EventStatusDialog');
jest.mock('../../../redux/website/pageContents');
jest.mock('../../../dialogs/PartialRegDialog/index');
jest.mock('../../../dialogs/InvalidPhoneNumberDialog');
jest.mock('../../../dialogs/selectionConflictDialogs/IdConfirmationConflictDialog');
jest.mock('../../../redux/selectors/currentRegistrant', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/selectors/currentRegistrant'),
    isGroupMember: jest.fn(),
    isRegistrationModification: jest.fn(),
    regModCartContainsNewRegistrants: jest.fn()
  };
});
jest.mock('../../../redux/registrationForm/regCartPayment/actions');
jest.mock('../../../dialogs/PaymentCreditsErrorDialog');
import { shallow } from 'enzyme';
import RegistrationNavigatorWidgetWrapper, { LinearPageNavigatorWidget } from '../RegistrationNavigatorWidget';
import { REGISTERING } from '../../../redux/registrationIntents';
import {
  saveRegistration,
  finalizeRegistration,
  searchPartialRegistration,
  startRegistration,
  abortRegCart
} from '../../../redux/registrationForm/regCart';
import { logoutRegistrant } from '../../../redux/registrantLogin/actions';
import { updateEventRegistrations } from '../../../redux/registrationForm/regCart/actions';
import { routeToPage, getCurrentPageId } from '../../../redux/pathInfo';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import { openAlreadyRegisteredDialog } from '../../../dialogs/AlreadyRegisteredDialog';
import { openCapacityReachedDialog } from '../../../dialogs/CapacityReachedDialog';
import { openKnownErrorDialog } from '../../../dialogs/KnownErrorDialog';
import { openPartialRegDialog } from '../../../dialogs/PartialRegDialog';
import { openPrivateEventErrorDialog } from '../../../dialogs/PrivateEventErrorDialog';
import EventSnapshot from '../../../../fixtures/EventSnapshotWithGuestRegPage.json';
import { openGroupMemberRemoveDialog } from '../../../dialogs/GroupMemberRemoveDialog';
import { openGroupCancelRegistrationDialog } from '../../../dialogs/GroupCancelDialog';
import { filterEventSnapshot } from '../../../redux/actions';
import { openEventStatusDialog } from '../../../dialogs/EventStatusDialog';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import EventGuestClient from '../../../clients/EventGuestClient';
import {
  isWidgetPresentOnCurrentPage,
  quantityItemAppearOnPageBeforeEventIdentityConfirmation
} from '../../../redux/website/pageContents';
import { openIdConfirmationConflictDialog } from '../../../dialogs/selectionConflictDialogs/IdConfirmationConflictDialog';
import {
  regModCartContainsNewRegistrants,
  isRegistrationModification
} from '../../../redux/selectors/currentRegistrant';
import testRenderer from 'react-test-renderer';
import { setSelectedPaymentMethod } from '../../../redux/registrationForm/regCartPayment/actions';
import { defaultPricingInfo } from '../../../redux/registrationForm/regCartPayment/util';
import RegCartClient from '../../../clients/RegCartClient';
import { openPaymentCreditsErrorDialog } from '../../../dialogs/PaymentCreditsErrorDialog';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../../PaymentWidget/__mocks__/apolloClient';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { hasAccessToWebsitePages } from '../../../redux/selectors/event';
import { startNewRegistrationAndNavigateToRegistration } from '../../../dialogs';
import { redirectToSummaryPage } from '../../../redux/registrationForm/regCart/workflow';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
import { openInvalidPhoneNumberDialog } from '../../../dialogs/InvalidPhoneNumberDialog';
import configureStore from '../../../redux/configureStore';
import { Provider } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing';

let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Development;
let mockUseGraphQLForSkippingPages = true;
jest.mock('../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData,
  useGraphQLForSkippingPages: () => mockUseGraphQLForSkippingPages
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

jest.mock('../../../dialogs', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../dialogs'),
    startNewRegistrationAndNavigateToRegistration: jest.fn()
  };
});
jest.mock('../../../redux/selectors/event', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/selectors/event'),
    hasAccessToWebsitePages: jest.fn()
  };
});

jest.mock('../../../redux/registrantLogin/actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/registrantLogin/actions'),
    logoutRegistrant: jest.fn(),
    loginRegistrant: jest.fn()
  };
});
jest.mock('../../PaymentWidget/getRegCartPricingAction', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: async (state, _) => {
    return state;
  }
}));
jest.mock('../../../utils/datatagUtils', () => {
  return {
    fetchAllDatatagResolutions: jest.fn(),
    invalidateDatatagCache: jest.fn()
  };
});
jest.mock('../../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/pathInfo'),
    __esModule: true,
    routeToPage: jest.fn(),
    getCurrentPageId: jest.fn()
  };
});
jest.mock('../../../redux/visibleProducts', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/visibleProducts'),
    __esModule: true,
    populateVisibleProducts: jest.fn().mockImplementation(() => ({
      type: '[MOCK]/LOAD_VISIBLE_SESSION_PRODUCTS',
      payload: {}
    }))
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const visibleProducts = require('../../../redux/visibleProducts');
let administratorRegistrationEnabled = false;
let selectedValue = false;
let adminEmail = 'b@b.com';
let allowsGroupRegistration = false;
let currentEventRegistrationId = 'eventRegId';
let applyPaymentCredits: false;
let attendingFormat = AttendingFormat.INPERSON;
let regCartPricing;
const initialRegistrations = {
  eventRegId: {
    registrationPathId: 'regPathId',
    sessionRegistrations: {
      'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18': {
        requestedAction: 'REGISTER',
        productId: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
        registrationSourceType: 'Selected',
        includedInAgenda: false
      },
      'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30': {
        requestedAction: 'REGISTER',
        productId: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
        registrationSourceType: 'Selected',
        includedInAgenda: false
      }
    },
    attendee: {
      personalInformation: {
        firstName: 'a',
        lastName: 'a',
        emailAddress: 'a@a.com'
      }
    }
  }
};
let registrations = JSON.parse(JSON.stringify(initialRegistrations));

const registrantLogin = {
  form: {
    emailAddress: 'a@a.com',
    confirmationNumber: 'confirmationNumber'
  }
};

const guestRegistration = {
  guestEventRegId: {
    registrationPathId: 'regPathId',
    sessionRegistrations: {
      'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18': {
        requestedAction: 'REGISTER',
        productId: 'cc928ca1-8e2f-40a4-aec1-ff3d24dbfb18',
        registrationSourceType: 'Selected',
        includedInAgenda: false
      },
      'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30': {
        requestedAction: 'REGISTER',
        productId: 'a7ab7770-f8e4-4ce1-a3b5-d5d992495a30',
        registrationSourceType: 'Selected',
        includedInAgenda: false
      }
    },
    attendee: {
      personalInformation: {
        firstName: 'a-guest',
        lastName: 'a-guest',
        emailAddress: 'a-guest@a.com'
      }
    },
    attendeeType: 'GUEST'
  }
};

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

const eventSnapshotClient = {
  getVisibleProducts: jest.fn(() => sessions)
};

const getExperiments = jest.fn(() => {});
const allowGroupRegistration = jest.fn(() => false);

let validationMessages = {};
let disableRegistrationActions = false;

function getState() {
  return {
    registrationForm: {
      currentEventRegistrationId,

      regCart: {
        groupRegistration: allowGroupRegistration(),
        eventRegistrations: {
          ...registrations
        },
        admin: {
          firstName: 'a',
          lastName: 'a',
          emailAddress: adminEmail,
          selectedValue
        },
        adminConfirmationNumber: 'adminconfirmnum'
      },
      validationMessages,
      warnings: {},
      regCartPayment: {},
      preventRegistration: disableRegistrationActions
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      partialRegCartUpdated: false,
      lastSavedRegCart: {}
    },
    userSession: {
      isAbandonedReg: false
    },
    defaultUserSession: {
      isPlanner: false
    },
    plannerRegSettings: {
      exitUrl: 'https://www.google.com/'
    },
    partialPaymentSettings: {
      paymentAmountOption: {
        value: 1
      },
      paymentAmount: 23
    },
    event: {
      attendingFormat,
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
        },
        fees: {}
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
    website: {
      ...EventSnapshot.eventSnapshot.siteEditor.website,
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
            childIds: [
              'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc',
              'row:14ee1cd8-816a-11e8-adc0-fa7ae01bbebc',
              'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
            ],
            parentId: 'temp-1469646842439'
          },
          id: 'temp-1469646842440'
        },
        'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc': {
          layout: {
            type: 'row',
            childIds: ['widget:306adfac-e25d-45fd-a155-740e4a8dfcd4'],
            parentId: 'temp-1469646842440'
          },
          id: 'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc'
        },
        'widget:306adfac-e25d-45fd-a155-740e4a8dfcd4': {
          layout: {
            type: 'widget',
            childIds: [],
            parentId: 'row:fd2953d0-1814-4a7f-a0b1-a4a29b190edc'
          },
          id: 'widget:306adfac-e25d-45fd-a155-740e4a8dfcd4',
          config: {
            registrationFieldPageType: 1,
            fieldId: '56aeaca6-a0ad-4548-8afc-94d8d4361ba1'
          },
          widgetType: 'EventStandardContactFieldText'
        },
        'row:241d35e0-d8d9-4860-b4e1-235616a2922a': {
          layout: {
            type: 'row',
            childIds: ['widget:e4ec24be-a67e-4639-a8c3-65c3caa0558c', 'registrationNavigatorWidget'],
            parentId: 'temp-1469646842440'
          },
          id: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
        },
        'widget:e4ec24be-a67e-4639-a8c3-65c3caa0558c': {
          layout: {
            type: 'widget',
            childIds: [],
            parentId: 'row:241d35e0-d8d9-4860-b4e1-235616a2922a'
          },
          id: 'widget:e4ec24be-a67e-4639-a8c3-65c3caa0558c',
          config: {
            registrationFieldPageType: 1,
            id: '884e410c-176c-49f4-9923-2cfb05c48a0e'
          },
          widgetType: 'OpenEndedTextQuestion'
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
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            isDefault: true,
            allowOverlappingSessions: false,
            allowPartialRegistration: true,
            identityConfirmation: {
              administratorRegistrationEnabled
            },
            allowsGroupRegistration
          },
          regPathId1: {
            id: 'regPathId1',
            isDefault: false,
            allowOverlappingSessions: false,
            allowPartialRegistration: false,
            identityConfirmation: {
              administratorRegistrationEnabled
            },
            allowsGroupRegistration
          }
        }
      },
      registrationPathSettings: {
        regPathId: {
          applyPaymentCredits
        },
        regPathId1: {
          applyPaymentCredits
        }
      }
    },
    regCartPricing,
    account: {
      settings: {
        allowPartialRegistration: true,
        dupMatchKeyType: 'EMAIL_ONLY'
      }
    },
    pathInfo: {
      currentPageId: 'currentPage'
    },
    text: {
      translate: value => value,
      resolver: {
        fetchAllDataTags: value => value
      }
    },
    clients: {
      productVisibilityClient: eventSnapshotClient,
      eventGuestClient: new EventGuestClient(),
      regCartClient: new RegCartClient()
    },
    registrantLogin,
    persona: {},
    experiments: getExperiments(),
    eventTravel: {
      hotelsData: {
        hotels: []
      }
    },
    travelCart: {
      cart: {}
    }
  };
}
const apolloClient = mockApolloClient();
async function dispatch(action) {
  if (typeof action === 'function') {
    return await action(dispatch, getState, { apolloClient });
  }
}
const subscribe = () => {};
const defaultProps = {
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
  store: { dispatch, subscribe, getState },
  id: 'registrationNavigatorWidget'
};

const createError = responseBody => ({
  responseStatus: 422,
  responseBody,
  httpLogRequestId: 'requestHeader',
  httpLogPageLoadId: 'pageLoadId',
  errorDateTime: new Date()
});

const createReactTestWrapper = () => {
  const mockStore = configureStore(getState(), {}, {});
  return testRenderer.create(
    <Provider store={mockStore}>
      <MockedProvider mocks={[]} addTypename={false}>
        <RegistrationNavigatorWidgetWrapper {...defaultProps} />
      </MockedProvider>
    </Provider>
  );
};

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development, true],
  ['Redux', GraphQLSiteEditorDataReleases.Off, false]
])('RegistrationNavigatorWidget using %s site editor data', (descr, siteEditorExp, skippingPageExp) => {
  describe('RegistrationNavigatorWidget', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
      currentEventRegistrationId = 'eventRegId';
      registrations = JSON.parse(JSON.stringify(initialRegistrations));
      allowsGroupRegistration = false;
      disableRegistrationActions = false;
      adminEmail = 'b@b.com';
      finalizeRegistration.mockImplementation(() => () => Promise.resolve({ statusCode: 'COMPLETED' }));
      (RegCartClient.prototype.calculateRegCartPricing as $TSFixMe).mockImplementation(() => {
        return {
          regCartPricing: {
            netFeeAmountCharge: 98,
            netFeeAmountRefund: 0,
            productFeeAmountCharge: 98,
            productFeeAmountRefund: 0,
            productSubTotalAmountCharge: 98,
            productSubTotalAmountRefund: 0,
            regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
          }
        };
      });
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });

    it('Produces correct props on connecting to redux state', () => {
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
      // Normal flex event, exit button is shown and forward isnt diabled
      let wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      let widget = wrapper.find(LinearPageNavigatorWidget);
      expect(widget.props().disableForwardNavigation).toBeFalsy();
      expect(widget.props().showExitButton).toBeTruthy();

      // Container flex event, exit button isnt shown and forward is diabled
      // when disableRegistrationActions is true and website is not accessible
      disableRegistrationActions = true;
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
      wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      widget = wrapper.find(LinearPageNavigatorWidget);
      expect(widget.props().disableForwardNavigation).toBeTruthy();
      expect(widget.props().showExitButton).toBeFalsy();

      // Container flex event, exit button isnt shown and forward isnt diabled
      // when we are on first page of registration and website is not live
      disableRegistrationActions = false;
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
      (getCurrentPageId as $TSFixMe).mockImplementation(() => 'regProcessStep1');
      wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      widget = wrapper.find(LinearPageNavigatorWidget);
      expect(widget.props().disableForwardNavigation).toBeFalsy();
      expect(widget.props().showExitButton).toBeFalsy();

      // Container flex event, exit button is shown and forward isnt disabled
      // when we are on first page of registration and website is not live and its reg mod
      (isRegistrationModification as $TSFixMe).mockImplementation(() => true);
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
      (getCurrentPageId as $TSFixMe).mockImplementation(() => 'regProcessStep1');
      wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      widget = wrapper.find(LinearPageNavigatorWidget);
      expect(widget.props().disableForwardNavigation).toBeFalsy();
      expect(widget.props().showExitButton).toBeTruthy();
    });

    it('handles voucher over capacity', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGAPI_VOUCHER_CAPACITY_UNAVAILABLE'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles invalid voucher code', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.EVENT_VOUCHER_CODE_INVALID'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });

    it('handles voucher code missing', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.EVENT_VOUCHER_CODE_MISSING'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(expect.any(String), expect.any(String));
    });

    it('Handles no voucher code', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGAPI_VOUCHER_CODE_REQUIRED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(
        'EventGuestside_ApiError_VoucherCodeRequired__resx',
        undefined,
        undefined,
        true
      );
    });

    it('Handles no registration type', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGTYPE_MISSING'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(
        'EventGuestside_ApiError_RequiredFieldMissing__resx',
        undefined,
        undefined,
        true
      );
    });

    it('Handles guest below minimum required', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.MIN_GUEST_LIMIT_SUBCEEDED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(
        'EventGuestSide_MinGuestValidation_SubmitRequestButton__resx',
        undefined,
        undefined,
        true
      );
    });

    it('Handles registration type invalid for event', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGTYPE_INVALID_FOR_EVENT'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
      const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(subMessage, message);
    });

    it('Handles registration type invalid for group settings', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGTYPE_INVALID_FOR_GROUP_SETTINGS'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      const subMessage = 'EventGuestSide_RegistrationTypeError_NoRegistrationTypeAvailableHelpText_resx';
      const message = 'EventGuestSide_RegistrationTypeConflict_Title_resx';
      await widget.props().onNavigateRequest();
      expect(saveRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(subMessage, message);
    });

    it('Handles product not available in hybrid event', async () => {
      attendingFormat = AttendingFormat.HYBRID;
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.PRODUCT_NOT_AVAILABLE'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('handles registration cart cancelled action', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGCART_CANCELLED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(saveRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(
        'EventGuestSide_CurrentOperationCanceled_ConcurrentAction__resx',
        null,
        redirectToSummaryPage
      );
    });

    it('handles acquiring concurrent actions lock failed error', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(saveRegistration).toHaveBeenCalled();
      expect(openKnownErrorDialog).toHaveBeenCalledWith(
        'EventGuestSide_CurrentOperationCanceled_ConcurrentAction__resx',
        null,
        redirectToSummaryPage
      );
    });

    it('handles existing invitee registration attempt', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
      expect(openAlreadyRegisteredDialog).toHaveBeenCalledWith({
        title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
        instructionalText: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_InstructionalText__resx',
        prepopulateForm: true
      });
    });

    it('handles invalid phone number on next/previous', async () => {
      const defaultState = getState();
      const invalidPhoneState = {
        ...defaultState,
        registrationForm: {
          ...defaultState.registrationForm,
          validationMessages: [
            {
              severity: 'Info',
              localizationKey: 'REGAPI.MOBILE_PHONE_INVALID'
            }
          ]
        }
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: () => invalidPhoneState,
          dispatch: async action => {
            if (typeof action === 'function') {
              return await action(props.store.dispatch, () => invalidPhoneState, { apolloClient });
            }
          }
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(openInvalidPhoneNumberDialog).toHaveBeenCalled();
    });
    it('handles invalid phone number on submit', async () => {
      const defaultState = getState();
      const invalidPhoneState = {
        ...defaultState,
        registrationForm: {
          ...defaultState.registrationForm,
          validationMessages: [
            {
              severity: 'Info',
              localizationKey: 'REGAPI.MOBILE_PHONE_INVALID'
            }
          ]
        }
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: () => invalidPhoneState,
          dispatch: async action => {
            if (typeof action === 'function') {
              return await action(props.store.dispatch, () => invalidPhoneState, { apolloClient });
            }
          }
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(openInvalidPhoneNumberDialog).toHaveBeenCalled();
    });

    it('saves and routes to page on navigate request', async () => {
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1');
      expect(saveRegistration).toHaveBeenCalled();
      expect(routeToPage).toHaveBeenCalledWith('page1');
    });

    it('submits form when navigating forward', async () => {
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
    });

    it('navigates to the default website page on exit', async () => {
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest();
      expect(routeToPage).toHaveBeenCalledWith('website1');
    });

    it('submits form on complete', async () => {
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
    });

    it('submits form on complete with webpayments form', async () => {
      const defaultState = getState();

      const webPaymentsState = {
        ...defaultState,
        experiments: {
          // @ts-expect-error ts-migrate(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
          ...defaultState.experiments,
          isFlexRegWebPaymentEnabled: true
        },
        registrationForm: {
          ...defaultState.registrationForm,
          regCartPayment: {
            ...defaultState.registrationForm.regCartPayment,
            pricingInfo: defaultPricingInfo,
            selectedPaymentMethod: 'creditCard'
          }
        }
      };

      const dispatchedActions = [];

      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: () => webPaymentsState,
          dispatch: async action => {
            if (typeof action === 'function') {
              return await action(props.store.dispatch, () => webPaymentsState, { apolloClient });
            }
            if (action !== undefined) {
              dispatchedActions.push(action);
            }
          }
        }
      };

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalledTimes(0);
      expect(dispatchedActions).toMatchSnapshot();

      webPaymentsState.registrationForm.regCartPayment.selectedPaymentMethod = 'wpm';
      await widget.props().onCompleteRequest();
      expect(finalizeRegistration).toHaveBeenCalled();
    });

    it('set registrant as group leader when admin reg is on with group reg enabled', async () => {
      allowsGroupRegistration = true;
      administratorRegistrationEnabled = true;
      selectedValue = true;
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(updateEventRegistrations).toHaveBeenCalled();
    });

    it('set registrant as group leader when admin reg is on with group reg enabled and guest', async () => {
      allowsGroupRegistration = true;
      administratorRegistrationEnabled = true;
      selectedValue = true;
      registrations = { ...registrations, ...guestRegistration };

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(updateEventRegistrations).toHaveBeenCalled();
    });

    it('set registrant as group leader when admin reg is on without group reg enabled and guest', async () => {
      administratorRegistrationEnabled = true;
      selectedValue = true;
      registrations = { ...registrations, ...guestRegistration };

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(updateEventRegistrations).toHaveBeenCalled();
    });

    it('set registrant as group leader when admin reg is on without group reg enabled', async () => {
      administratorRegistrationEnabled = true;
      selectedValue = true;
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(updateEventRegistrations).toHaveBeenCalled();
    });

    it('handles admin reg email domain not allowed', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.ADMIN_EMAIL_DOMAIN_NOT_ALLOWED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(openKnownErrorDialog).toHaveBeenCalled();
    });

    it('handles admin reg email format invalid', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.ADMIN_EMAIL_FORMAT_INVALID'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(openKnownErrorDialog).toHaveBeenCalled();
    });

    it('handles admin email already used by attendee', async () => {
      administratorRegistrationEnabled = true;
      selectedValue = true;
      adminEmail = 'a@a.com';
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(openKnownErrorDialog).toHaveBeenCalled();
    });

    it('opens event closed dialog if checkout is initiated after event deadline', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(openEventStatusDialog).toHaveBeenCalledWith(eventStatus.CLOSED, expect.any(Function));
    });

    it('partial reg dialog opened', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pathInfo = require('../../../redux/pathInfo');
      pathInfo.getCurrentPageId = jest.fn(() => {
        return 'regProcessStep1';
      });
      searchPartialRegistration.mockImplementation(
        () => () =>
          Promise.resolve({
            regCart: {}
          })
      );
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(openPartialRegDialog).toBeCalled();
    });

    it('partial reg flow not opened for abandoned cart', async () => {
      const initialState = getState();
      const getDeadlineState = () => {
        return {
          ...initialState,
          userSession: {
            ...initialState.userSession,
            isAbandonedReg: true
          }
        };
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: getDeadlineState
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(openPartialRegDialog).not.toBeCalled();
    });

    it('partial reg flow not opened', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pathInfo = require('../../../redux/pathInfo');
      pathInfo.getCurrentPageId = jest.fn(() => {
        return 'regProcessStep1';
      });
      registrations = {
        ...registrations,
        eventRegId: {
          ...registrations.eventRegId,
          registrationPathId: 'regPathId1'
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(openPartialRegDialog).not.toBeCalled();
    });

    it('partial reg flow not opened during reg mod', async () => {
      const initialState = getState();
      const getDeadlineState = () => {
        return {
          ...initialState,
          registrationForm: {
            ...initialState.registrationForm,
            regCart: {
              ...initialState.registrationForm.regCart,
              regMod: true
            }
          },
          userSession: {
            ...initialState.userSession,
            isAbandonedReg: true
          }
        };
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: getDeadlineState
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(openPartialRegDialog).not.toBeCalled();
    });

    it('sets offline payment method when complete payment is done via payment credits', async () => {
      // state with "applyPaymentCredits" enabled on path and with order total equal to credits applied
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'true' is not assignable to type 'false'.
      applyPaymentCredits = true;
      regCartPricing = {
        netFeeAmountCharge: 100,
        paymentCreditsForEventReg: {
          eventRegistration1: {
            creditsCharge: 25
          },
          eventRegistration2: {
            creditsCharge: 75
          }
        },
        eventRegistrationPricings: {}
      };
      registrations = {
        eventRegId: { ...registrations.eventRegId }
      };

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();

      const offlinePaymentMethod = defaultPricingInfo.offline.optionOne.paymentMethodKey;
      expect(setSelectedPaymentMethod).toHaveBeenCalledWith(offlinePaymentMethod);
    });

    it('doesnt set offline payment method when partial payment is done via payment credits', async () => {
      // state with "applyPaymentCredits" enabled on path and with order total greater than credits applied
      registrations = { ...registrations };
      // @ts-expect-error ts-migrate(2322) FIXME: Type 'true' is not assignable to type 'false'.
      applyPaymentCredits = true;
      regCartPricing = {
        netFeeAmountCharge: 200,
        paymentCreditsForEventReg: {
          eventRegistration1: {
            creditsCharge: 25
          },
          eventRegistration2: {
            creditsCharge: 75
          }
        },
        eventRegistrationPricings: {}
      };
      registrations = {
        eventRegId: { ...registrations.eventRegId }
      };

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();

      expect(setSelectedPaymentMethod).not.toBeCalled();
    });

    it('handles invalid question choice', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'QUESTION.INVALID_CHOICE'
            }
          ]
        };
        throw createError(responseBody);
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest();
      expect(openKnownErrorDialog).toHaveBeenCalled();
    });
  });

  describe('RegistrationNavigatorWidget group scenarios', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
      allowsGroupRegistration = true;
      currentEventRegistrationId = 'groupMemberRegId';
      allowGroupRegistration.mockImplementation(() => true);
      registrations = {
        eventRegId: {
          ...registrations.eventRegId,
          registrationPathId: 'regPathId',
          attendeeType: 'GROUP_LEADER'
        },
        groupMemberRegId: {
          registrationPathId: 'regPathId1',
          eventRegistrationId: 'groupMemberRegId',
          sessionRegistrations: {},
          attendeeType: 'ATTENDEE',
          primaryRegistrationId: 'eventRegId',
          attendee: {
            personalInformation: {
              firstName: 'g',
              lastName: 'g',
              emailAddress: 'g@g.com'
            }
          }
        }
      };
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });

    it('calls groupMemberRemoveDialog during initial reg while registering gm', async () => {
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest();
      expect(openGroupMemberRemoveDialog).toHaveBeenCalledWith('groupMemberRegId', expect.any(Function));
    });

    it('calls groupCancelDialog during initial reg while on the primaries path', async () => {
      currentEventRegistrationId = 'eventRegId';
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest();
      expect(openGroupCancelRegistrationDialog).toHaveBeenCalledWith(expect.any(Function), expect.any(Object));
    });

    it('calls groupMemberRemoveDialog during regMod reg while registering gm', async () => {
      (regModCartContainsNewRegistrants as $TSFixMe).mockImplementation(() => true);

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest();
      expect(openGroupMemberRemoveDialog).toHaveBeenCalledWith('groupMemberRegId', expect.any(Function));
    });

    it('calls groupMemberRemoveDialog during regMod reg while on Primaries path', async () => {
      (regModCartContainsNewRegistrants as $TSFixMe).mockImplementation(() => true);
      currentEventRegistrationId = 'eventRegId';
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest();
      expect(openGroupMemberRemoveDialog).toHaveBeenCalledWith('groupMemberRegId', expect.any(Function));
    });

    it('calls filterEventSnapshot when gm Path is diff than GL and next page is regSummary', async () => {
      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation(() => true);
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(filterEventSnapshot).toHaveBeenCalled();
    });

    it('doesnt call filterEventSnapshot when GM and GL have same path and next page is regSummary', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const selectors = require('../../../redux/website/selectors');
      selectors.isWidgetPresentOnCurrentPage = jest.fn(() => {
        return true;
      });
      registrations = {
        ...registrations,
        groupMemberRegId: {
          ...registrations.groupMemberRegId,
          registrationPathId: 'regPathId'
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(filterEventSnapshot).not.toHaveBeenCalled();
    });

    it('doesnt call filterEventSnapshot when GM and GL have diff path and next page is isnt regSummary', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const selectors = require('../../../redux/website/selectors');
      selectors.isWidgetPresentOnCurrentPage = jest.fn(() => {
        return false;
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(filterEventSnapshot).not.toHaveBeenCalled();
    });

    it('doesnt call filterEventSnapshot when GM and GL have same path and next page is isnt regSummary', async () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const selectors = require('../../../redux/website/selectors');
      selectors.isWidgetPresentOnCurrentPage = jest.fn(() => {
        return false;
      });
      registrations = {
        ...registrations,
        groupMemberRegId: {
          ...registrations.groupMemberRegId,
          registrationPathId: 'regPathId'
        }
      };
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      expect(filterEventSnapshot).not.toHaveBeenCalled();
    });

    it('calls openIdConfirmationConflictDialog when quantity item advance rules are violated', async () => {
      (quantityItemAppearOnPageBeforeEventIdentityConfirmation as $TSFixMe).mockImplementation(() => true);
      validationMessages = [
        {
          localizationKey: 'REGAPI.QUANTITY_ITEMS_REGISTRATION_RULE_FAILED'
        }
      ];
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openIdConfirmationConflictDialog).toHaveBeenCalledWith(expect.any(Object), expect.any(Function));
    });

    it('populate visible products with current event registration id', async () => {
      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation(() => true);
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest();
      const currentEventRegId = 'groupMemberRegId';
      expect(visibleProducts.populateVisibleProducts).toHaveBeenCalledWith(currentEventRegId);
    });
  });

  describe('Privacy Settings tests', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });
    it('Open known error dialog when privacy settings validation is thrown, on update.', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const widget = createReactTestWrapper().root.findByType(LinearPageNavigatorWidget);
      await widget.props.onNavigateRequest();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });
    it('Opens known error dialog when privacy settings validation is thrown, on submit.', async () => {
      registrations = {
        eventRegId: {
          ...registrations.eventRegId,
          registrationPathId: 'regPathId',
          attendeeType: 'GROUP_LEADER',
          eventRegistrationId: 'eventRegId'
        }
      };
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED'
            }
          ]
        };
        throw createError(responseBody);
      });
      const widget = createReactTestWrapper().root.findByType(LinearPageNavigatorWidget);
      await widget.props.onCompleteRequest();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });
  });

  describe('Payment credits error dialog test', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });
    it('opens payment credits error dialog when payment credits related error is encountered on checkout', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.CONTACT_PAYMENT_CREDIT_MISMATCH'
            }
          ]
        };
        throw createError(responseBody);
      });

      const widget = createReactTestWrapper().root.findByType(LinearPageNavigatorWidget);
      await widget.props.onCompleteRequest();
      expect(openPaymentCreditsErrorDialog).toHaveBeenCalled();
    });
  });

  describe('Cancel button click in when website pages are not accessible', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => false);
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });

    it('starts new registration and takes user to first reg page', async () => {
      const widget = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />)
        .dive()
        .find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest(false);
      expect(startNewRegistrationAndNavigateToRegistration).toBeCalled();
    });
  });

  describe('aborting regCart on cancel button click', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (hasAccessToWebsitePages as $TSFixMe).mockImplementation(() => true);
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });
    const setupConditions = (abortRegCartVariant, isMod, isGroup) => {
      getExperiments.mockImplementation(() => ({ abortRegCartVariant }));
      (isRegistrationModification as $TSFixMe).mockImplementation(() => !!isMod);
      allowGroupRegistration.mockImplementation(() => !!isGroup);
    };
    const runTest = async removeGroupMemberConfirmed => {
      const widget = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />)
        .dive()
        .find(LinearPageNavigatorWidget);
      await widget.props().onExitRequest(removeGroupMemberConfirmed);
    };
    const verifyResults = (expectAbort, expectLogout) => {
      expect(abortRegCart).toHaveBeenCalledTimes(expectAbort ? 1 : 0);
      expect(logoutRegistrant).toHaveBeenCalledTimes(expectLogout ? 1 : 0);
    };

    test.each([
      /*
       * experiment OFF -> no need to abort cart or logout
       */
      [-1, false, false, false, false],
      [-1, true, false, false, false],
      [-1, false, true, false, false],
      [-1, true, true, false, false],
      /*
       * experiment ON with variant 1 -> need to only abort cart in all cases
       */
      [1, false, false, true, false],
      [1, true, false, true, false],
      [1, false, true, true, false],
      [1, true, true, true, false],
      /*
       * experiment ON with variant 2 -> need to abort cart AND logout user when applicable (no need logout in mod)
       */
      [2, false, false, true, true],
      [2, true, false, true, false],
      [2, false, true, true, true],
      [2, true, true, true, false]
    ])(
      'abortRegCartVariant: %d, isRegMod: %s, isGroupReg: %s',
      async (abortRegCartVariant, isMod, isGroup, expectAbort, expectLogout) => {
        setupConditions(abortRegCartVariant, isMod, isGroup);
        await runTest(isGroup);
        verifyResults(expectAbort, expectLogout);
      }
    );
  });

  describe('Invalid profile image error dialog test', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });
    it('opens private event error dialog when invalid profile image error is encountered on reg cart save', async () => {
      saveRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.FIELD_VALIDATION_ERROR_LENGTH_RESTRICTED'
            }
          ]
        };
        throw createError(responseBody);
      });

      const widget = createReactTestWrapper().root.findByType(LinearPageNavigatorWidget);
      await widget.props.onNavigateRequest();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });
    it('opens private event error dialog when invalid profile image error is encountered on checkout', async () => {
      finalizeRegistration.mockImplementation(() => {
        const responseBody = {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.FIELD_VALIDATION_ERROR_LENGTH_RESTRICTED'
            }
          ]
        };
        throw createError(responseBody);
      });

      const widget = createReactTestWrapper().root.findByType(LinearPageNavigatorWidget);
      await widget.props.onCompleteRequest();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });
  });

  describe('Embedded Registration tests', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      mockUseGraphQLSiteEditorData = siteEditorExp;
      mockUseGraphQLForSkippingPages = skippingPageExp;
    });
    it('creates reg cart when progressing forward on first reg page', async () => {
      const initialState = getState();
      const embeddedRegState = {
        ...initialState,
        registrationForm: {
          ...initialState.registrationForm,
          regCart: {
            ...initialState.registrationForm.regCart,
            regCartId: '',
            embeddedRegistration: true
          }
        }
      };
      const getEmbeddedRegState = () => {
        return embeddedRegState;
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: getEmbeddedRegState,
          dispatch: async action => {
            if (typeof action === 'function') {
              return await action(props.store.dispatch, getEmbeddedRegState, { apolloClient });
            }
          }
        }
      };
      (getCurrentPageId as $TSFixMe).mockImplementation(() => 'regProcessStep1');
      startRegistration.mockImplementation(() => {
        // update state to no longer have temporary cart
        embeddedRegState.registrationForm.regCart.regCartId = 'uuid';
      });
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(startRegistration).toHaveBeenCalled();
      expect(searchPartialRegistration).toHaveBeenCalled();
      expect(saveRegistration).not.toHaveBeenCalled();
    });

    it('exits handler if attempt to create reg cart fails', async () => {
      const initialState = getState();
      const embeddedRegState = {
        ...initialState,
        registrationForm: {
          ...initialState.registrationForm,
          regCart: {
            ...initialState.registrationForm.regCart,
            regCartId: '',
            embeddedRegistration: true
          }
        }
      };
      const getEmbeddedRegState = () => {
        return embeddedRegState;
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: getEmbeddedRegState,
          dispatch: async action => {
            if (typeof action === 'function') {
              return await action(props.store.dispatch, getEmbeddedRegState, { apolloClient });
            }
          }
        }
      };
      (getCurrentPageId as $TSFixMe).mockImplementation(() => 'regProcessStep1');
      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...props} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(startRegistration).toHaveBeenCalled();
      expect(searchPartialRegistration).not.toHaveBeenCalled();
    });

    it('Open known error dialog when privacy settings validation is thrown in embed', async () => {
      const initialState = getState();
      const embeddedRegState = {
        ...initialState,
        registrationForm: {
          ...initialState.registrationForm,
          regCart: {
            ...initialState.registrationForm.regCart,
            regCartId: '',
            embeddedRegistration: true
          }
        }
      };
      const getEmbeddedRegState = () => {
        return embeddedRegState;
      };
      const props = {
        ...defaultProps,
        store: {
          ...defaultProps.store,
          getState: getEmbeddedRegState,
          dispatch: async action => {
            if (typeof action === 'function') {
              return await action(props.store.dispatch, getEmbeddedRegState, { apolloClient });
            }
          }
        }
      };
      (getCurrentPageId as jest.Mock).mockImplementation(() => 'regProcessStep1');
      startRegistration.mockImplementation(() => {
        // update state to no longer have temporary cart
        embeddedRegState.registrationForm.regCart.regCartId = 'uuid';
        return () =>
          Promise.resolve({
            validationMessages: [
              { severity: 'Warning', localizationKey: 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST' }
            ]
          });
      });
      const mockStore = configureStore(getEmbeddedRegState(), {}, {});
      const wrapper = testRenderer.create(
        <Provider store={mockStore}>
          <MockedProvider mocks={[]} addTypename={false}>
            <RegistrationNavigatorWidgetWrapper {...props} />
          </MockedProvider>
        </Provider>
      );
      const widget = wrapper.root.findByType(LinearPageNavigatorWidget);
      await widget.props.onNavigateRequest();
      expect(startRegistration).toHaveBeenCalled();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });
  });
});
