import React from 'react';
jest.mock('../../../clients/EventGuestClient');
jest.mock('../../../redux/registrationForm/regCart');
jest.mock('../../../redux/pathInfo', () => {
  return {
    getCurrentPageId: () => 'regProcessStep1',
    routeToPage: jest.fn(() => () => {})
  };
});
jest.mock('../../../redux/website/pageContents', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../redux/website/pageContents'),
    __esModule: true,
    isWidgetPresentOnCurrentPage: jest.fn(),
    getPageWithRegistrationType: jest.fn(),
    regTypeAppearOnPageBeforeEventIdentityConfirmation: jest.fn()
  };
});
jest.mock('../../../dialogs');
jest.mock('../../../redux/selectors/currentRegistrationPath');
jest.mock('../../../redux/registrationForm/warnings');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const currentRegistrant = require('../../../redux/selectors/currentRegistrant');
currentRegistrant.guests = jest.fn(() => []);

import { shallow } from 'enzyme';
import RegistrationNavigatorWidgetWrapper, { LinearPageNavigatorWidget } from '../RegistrationNavigatorWidget';
import { REGISTERING } from '../../../redux/registrationIntents';
import { finalizeRegistration, saveRegistration } from '../../../redux/registrationForm/regCart';
import { createLocalNucleusForm } from 'nucleus-form/src/NucleusForm';
import { isWidgetPresentOnCurrentPage } from '../../../redux/website/pageContents';
import { openCapacityReachedDialog, openPrivateEventErrorDialog } from '../../../dialogs';
import { hasRegTypeCapacityWarning } from '../../../redux/registrationForm/warnings';
import {
  getPageWithRegistrationType,
  regTypeAppearOnPageBeforeEventIdentityConfirmation
} from '../../../redux/website/pageContents';
import EventGuestClient from '../../../clients/EventGuestClient';
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
let mockRegistrationTypeBeforeIdentityConfirm = true;
let mockIdentityConfirmationOnCurrentPage = false;
jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            registrationType: {
              validation: {
                onPageBeforeIdentityConfirmation: mockRegistrationTypeBeforeIdentityConfirm
              }
            },
            identityConfirmation: {
              validation: {
                onCurrentPage: mockIdentityConfirmationOnCurrentPage
              }
            }
          }
        }
      }
    }
  })
}));
function getState() {
  return {
    account: {},
    clients: {
      eventGuestClient: new EventGuestClient(),
      regCartClient: new RegCartClient()
    },
    regCartStatus: {
      registrationIntent: REGISTERING
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            isDefault: true,
            allowOverlappingSessions: false,
            allowPartialRegistration: true
          }
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
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
        }
      },
      regCartPayment: {}
    },
    registrantLogin: {
      form: {}
    },
    userSession: {},
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
      registrationTypes: {
        '00000000-0000-0000-0000-000000000000': {
          id: '00000000-0000-0000-0000-000000000000',
          isOpenForRegistration: true
        }
      },
      eventFeatureSetup: {
        fees: {}
      },
      complianceSettings: {
        cookieBannerSettings: {
          showCookieBanner: false
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
            childIds: ['registrationNavigatorWidget'],
            type: 'container'
          },
          id: 'id-3'
        },
        registrationNavigatorWidget: {
          layout: {
            type: 'widget',
            childIds: [],
            parentId: 'id-3'
          },
          id: 'registrationNavigatorWidget'
        }
      }
    },
    visibleProducts: {
      Sessions: {}
    },
    text: {
      translate: value => value,
      resolver: {
        fetchAllDataTags: value => value
      }
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

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('RegistrationNavigatorWidget capacity tests using %s site editor data', (description, experimentStatus) => {
  describe('RegistrationNavigatorWidgetRegTypeCapacityFull', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      finalizeRegistration.mockImplementation(() => () => Promise.resolve({ statusCode: 'COMPLETED' }));
      mockUseGraphQLSiteEditorData = experimentStatus;
      mockIdentityConfirmationOnCurrentPage = false;
    });

    it('Clicking next when reg type widget is on page', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'RegistrationType') {
          return true;
        }
        return false;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('Clicking submit when reg type widget is on page', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'RegistrationType') {
          return true;
        }
        return false;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('Clicking next when reg type widget is not on registration path and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;

      (getPageWithRegistrationType as $TSFixMe).mockImplementation(() => {
        return false;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });

    it('Clicking submit when reg type widget is not on registration path and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;

      (getPageWithRegistrationType as $TSFixMe).mockImplementation(() => {
        return false;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openPrivateEventErrorDialog).toHaveBeenCalled();
    });

    it('Clicking next when reg type widget is on previous page and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;

      (getPageWithRegistrationType as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (regTypeAppearOnPageBeforeEventIdentityConfirmation as $TSFixMe).mockImplementation(() => {
        return true;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('Clicking submit when reg type widget is on previous page and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;

      (getPageWithRegistrationType as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (regTypeAppearOnPageBeforeEventIdentityConfirmation as $TSFixMe).mockImplementation(() => {
        return true;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('Clicking next when reg type widget is on page and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation' || widgetType === 'RegistrationType') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;
      mockRegistrationTypeBeforeIdentityConfirm = true;

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('Clicking submit when reg type widget is on page and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation' || widgetType === 'RegistrationType') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;
      mockRegistrationTypeBeforeIdentityConfirm = true;

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).toHaveBeenCalled();
    });

    it('Clicking next when reg type widget is on future page and page has id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;

      (getPageWithRegistrationType as $TSFixMe).mockImplementation(() => {
        return true;
      });

      (regTypeAppearOnPageBeforeEventIdentityConfirmation as $TSFixMe).mockImplementation(() => {
        return false;
      });
      mockRegistrationTypeBeforeIdentityConfirm = false;

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openPrivateEventErrorDialog).not.toHaveBeenCalled();
      expect(openCapacityReachedDialog).not.toHaveBeenCalled();
    });
  });

  describe('RegistrationNavigatorWidgetRegTypeCapacityNotFull', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      finalizeRegistration.mockImplementation(() => () => Promise.resolve({ statusCode: 'COMPLETED' }));
      mockUseGraphQLSiteEditorData = experimentStatus;
      mockIdentityConfirmationOnCurrentPage = false;
    });

    it('Reg type not full clicking submit when reg type widget is on page', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return false;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'RegistrationType') {
          return true;
        }
        return false;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onCompleteRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openCapacityReachedDialog).not.toHaveBeenCalled();
    });

    it('Reg type not full, next, widget not on registration path and id confirmation', async () => {
      (hasRegTypeCapacityWarning as $TSFixMe).mockImplementation(() => {
        return false;
      });

      (isWidgetPresentOnCurrentPage as $TSFixMe).mockImplementation((website, widgetType) => {
        if (widgetType === 'EventIdentityConfirmation') {
          return true;
        }
        return false;
      });
      mockIdentityConfirmationOnCurrentPage = true;

      (getPageWithRegistrationType as $TSFixMe).mockImplementation(() => {
        return false;
      });

      const wrapper = shallow(<RegistrationNavigatorWidgetWrapper {...defaultProps} />).dive();
      const widget = wrapper.find(LinearPageNavigatorWidget);
      await widget.props().onNavigateRequest('page1', true);
      expect(saveRegistration).toHaveBeenCalled();
      expect(openPrivateEventErrorDialog).not.toHaveBeenCalled();
    });
  });
});
