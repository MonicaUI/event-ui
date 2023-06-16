/* eslint-env jest */
import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { combineReducers } from 'redux';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import pageContainerWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import CancelRegistrationWidget from '../../../widgets/CancelRegistrationWidget';
import { LOAD_ACCOUNT_SNAPSHOT } from '../../../redux/actionTypes';
import registrationForm from '../../../redux/registrationForm/reducer';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import registrantLogin from '../../../redux/registrantLogin';
import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import * as Dialogs from '../..';
import { openCancelRegistrationDialog } from '..';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import { routeToPage } from '../../../redux/pathInfo';
import { wait } from '../../../testUtils';
import { MAX_WEBSITE_VERSION } from 'event-widgets/utils/transformWebsiteMaxVersion';
import EventGuestClient from '../../../clients/EventGuestClient';
import RegCartClient from '../../../clients/RegCartClient';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient } from '../../../widgets/PaymentWidget/__mocks__/apolloClient';

jest.mock('../../../widgets/PaymentWidget/getRegCartPricingAction', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  default: async (state, _) => {
    return state;
  }
}));

const eventSnapshot = JSON.parse(JSON.stringify(EventSnapshot)).eventSnapshot;

/*
 * we are skipping migrations because they caused test timeouts
 * if at some point we become dependent on the migrated code,
 * then run them here, don't just remove this line
 */

eventSnapshot.siteEditor.website.eventVersion = MAX_WEBSITE_VERSION;

jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation', () => {
  return {
    getRegistrationPathIdForWidget: jest.fn(() => 'dummyRegPath'),
    isWidgetOnPath: jest.fn(() => false)
  };
});

let mockHackyPromiseResolver = null;

jest.mock('../../../redux/pathInfo', () => {
  return {
    routeToPage: jest.fn(() => () => {
      if (mockHackyPromiseResolver) {
        mockHackyPromiseResolver();
      }
    })
  };
});

const mockEventId = '11111111-2222-3333-4444-555555555555';

const mockConfirmedRegCartResponse = {
  regCart: {
    regCartId: 'regCartId',
    status: 'INPROGRESS',
    regCancel: true,
    eventSnapshotVersions: {
      [mockEventId]: 'fake-eventSnapshot-version'
    },
    eventRegistrations: {
      'event-registrations-key': {
        confirmationNumber: 'fake-number',
        attendee: {
          attendeeId: 'fake-attendeeId',
          personalInformation: {
            emailAddress: 'fake-email-address'
          }
        },
        registrationPathId: 'dummyRegPath'
      }
    }
  },
  validationMessages: []
};

function account(state = {}, action) {
  return action.type === LOAD_ACCOUNT_SNAPSHOT ? action.payload.account : state;
}

jest.mock('../../../clients/RegCartClient');
(RegCartClient.prototype.calculateRegCartPricing as $TSFixMe).mockImplementation(() => Promise.resolve({}));
(RegCartClient.prototype.getRegCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse.regCart)
);
(RegCartClient.prototype.startRegCartCheckout as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse.regCart)
);
(RegCartClient.prototype.waitForRegCartCheckoutCompletion as $TSFixMe).mockImplementation(() =>
  Promise.resolve({
    registrationIntent: 'CHECKED_OUT',
    checkoutProgress: 100,
    lastSavedRegCart: {
      ...mockConfirmedRegCartResponse.regCart,
      status: 'COMPLETED'
    }
  })
);
(RegCartClient.prototype.createCancelRegistrationCart as $TSFixMe).mockImplementation(() =>
  Promise.resolve(mockConfirmedRegCartResponse)
);

jest.mock('../../../clients/EventGuestClient');

const apolloClient = mockApolloClient();
const store = createStoreWithMiddleware(
  combineReducers({
    account,
    dialogContainer,
    registrantLogin,
    registrationForm,
    event: (x = {}) => x,
    website: (x = {}) => x,
    appData: (x = {}) => x,
    pathInfo: (x = {}) => x,
    text: (x = {}) => x,
    regCartStatus: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    defaultUserSession: (x = {}) => x,
    plannerRegSettings: (x = {}) => x,
    accessToken: (x = {}) => x,
    testSettings: (x = {}) => x,
    timezones: (x = {}) => x,
    experiments: (x = {}) => x
  }),
  {
    event: {
      status: eventStatus.CLOSED,
      id: mockEventId,
      eventFeatureSetup: {
        fees: {
          fees: true
        }
      },
      registrationSettings: {
        registrationPaths: {
          dummyRegPath: {}
        }
      }
    },
    pathInfo: {
      currentPageId: 'regProcessStep1',
      rootPath: 'dummyRegPath'
    },
    timezones: [
      {
        id: 1,
        name: 'Samoa Time',
        nameResourceKey: 'Event_Timezone_Name_1__resx',
        plannerDisplayName: '(GMT-11:00) Samoa',
        abbreviation: 'ST',
        abbreviationResourceKey: 'Event_Timezone_Abbr_1__resx',
        dstInfo: [{}],
        hasDst: true,
        utcOffset: -660
      }
    ],
    website: {
      eventVersion: 48,
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            dummyRegPath: {
              id: 'dummyRegPath',
              cancellation: new Date().valueOf() + 100000000000,
              postRegPageIds: ['confirmation']
            }
          }
        },
        eventWebsiteNavigation: {
          defaultPageId: 'summary'
        }
      },
      theme: eventSnapshot.siteEditor.website.theme,
      ...pageContainerWidgetFixture('confirmation', 'cancellationWidget')
    },
    clients: {
      eventGuestClient: new EventGuestClient(),
      regCartClient: new RegCartClient(),
      eventSnapshotClient: {
        getEventSnapshot() {
          return Promise.resolve({ ...eventSnapshot, version: 'fake-eventSnapshot-version' });
        }
      }
    },
    defaultUserSession: {
      isPreview: false,
      isPlanner: false
    },
    plannerRegSettings: {
      exitURL: 'url'
    },
    accessToken: 'BEARER fakeToken',
    registrantLogin: {
      form: {
        firstName: 'firstName',
        lastName: 'lastName',
        emailAddress: 'emailAddress',
        confirmationNumber: 'confirmationNumber'
      },
      status: {
        login: {},
        resendConfirmation: {}
      }
    },
    testSettings: { registrationCheckoutTimeout: 10000 },
    appData: {
      registrationSettings: {
        registrationPaths: {
          dummyRegPath: {
            cancellation: {
              deadline: 1505336943175
            }
          }
        }
      }
    },
    registrationForm: { regCart: {} },
    regCartStatus: {
      registrationIntent: null
    },
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    experiments: {}
  },
  {
    thunkExtraArgument: { apolloClient }
  }
);
const defaultProps = {
  config: {
    text: 'Cancel Registration',
    style: {}
  },
  kind: 'button',
  style: eventSnapshot.siteEditor.website.theme.global,
  translate: text => text
};

describe('CancelRegistrationWidget', () => {
  const wrapper = mount(
    <Provider store={store}>
      <span>
        <CancelRegistrationWidget {...defaultProps} />
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </span>
    </Provider>
  );
  const widget = wrapper.find(ButtonWidget);
  test('Check if CancelRegistrationDialog is opened', async () => {
    const openCancelRegistrationDialogSpy = jest.spyOn(Dialogs, 'openCancelRegistrationDialog');
    await widget.props().clickHandler(defaultProps);
    expect(openCancelRegistrationDialogSpy).toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });
  test('Close CancelRegistrationDialog', async () => {
    wrapper.update();
    wrapper.find('[data-cvent-id="no-submit-button"]').hostNodes().simulate('click');
    expect(wrapper).toMatchSnapshot();
  });
  test('Goes to Cancellation default page on clicking yes', async () => {
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    store.dispatch(openCancelRegistrationDialog(defaultProps));
    dialog.update();
    dialog.find('[data-cvent-id="yes-submit-button"]').hostNodes().simulate('click');

    const hackyPromise = new Promise(resolve => {
      mockHackyPromiseResolver = () => {
        // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        resolve();
        return this;
      };
    });

    /**
     * jest will kill the test after 5s if this doesn't get called.
     * the previous 3s wait was flaky
     */
    await hackyPromise;
    // the update to the dialog is still asynchronous
    await wait(0);

    expect(RegCartClient.prototype.createCancelRegistrationCart).toHaveBeenCalledWith(
      'BEARER fakeToken',
      undefined,
      undefined,
      mockEventId,
      null
    );
    expect(RegCartClient.prototype.calculateRegCartPricing).toHaveBeenCalled();
    expect(RegCartClient.prototype.startRegCartCheckout).toHaveBeenCalled();
    expect(EventGuestClient.prototype.logout).toHaveBeenCalled();
    expect(routeToPage).toHaveBeenCalledWith('summary');
    expect(dialog).toMatchSnapshot();
  });
});
