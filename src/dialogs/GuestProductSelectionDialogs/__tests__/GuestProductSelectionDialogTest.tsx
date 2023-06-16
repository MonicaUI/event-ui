import React from 'react';
import { mount } from 'enzyme';
import {
  GuestProductSelectionDialogWithGraphQL,
  GuestProductSelectionDialogWithRedux,
  openGuestProductSelectionDialog
} from '..';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { MockedProvider } from '@apollo/client/testing';
import { act } from 'react-dom/test-utils';
import registrantLogin from '../../../redux/registrantLogin';
import registrationForm from '../../../redux/registrationForm/reducer';
import { Provider } from 'react-redux';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import { LOAD_ACCOUNT_SNAPSHOT } from '../../../redux/actionTypes';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import transformEventData from 'event-widgets/utils/transformEventData';
import { getWidget } from '../../../redux/website/pageContents';
// eslint-disable-next-line jest/no-mocks-import
import { getApolloClientMocks } from '../__mocks__/apolloClient';

jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  __esModule: true,
  ...jest.requireActual<$TSFixMe>('../__mocks__/pageVarietyPathQueryHooks')
}));
jest.mock('../../../redux/pathInfo', () => ({
  routeToPage: jest.fn(() => () => {})
}));

jest.mock('../../../redux/website/pageContents', () => ({
  getWidget: jest.fn(() => () => {})
}));
// eslint-disable-next-line jest/no-mocks-import
import { getMockedFieldInputs } from '../../__mocks__/documentElementMock';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';
import { GraphQLSiteEditorDataReleases } from '../../../ExperimentHelper';
getMockedFieldInputs(['ProductSelection', 'AlreadySelectedProductSelection']);

const sessionId = 'mockSessionId';
const sessionTitle = 'mockSessionTitle';
const unlimitedCapacity = -1;

const guestEventRegId = '00000000-0000-0000-0000-000000000002';
const primaryEventRegId = '00000000-0000-0000-0000-000000000001';

const forWaitlistingAttendees = false;

const spinnerSelection = { spinnerSelectionId: sessionId };

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});

const regCartClient = {
  authorizeByConfirm: jest.fn(() => ({ accessToken: 'fakeAuthByConfirmToken' }))
};

const eventEmailClient = {};
function account(state = {}, action) {
  return action.type === LOAD_ACCOUNT_SNAPSHOT ? action.payload.account : state;
}
const eventSnapshotClient = {
  getAccountSnapshot: jest.fn(() => EventSnapshot.accountSnapshot),
  getEventSnapshot: jest.fn(() => EventSnapshot.eventSnapshot)
};

const eventRegistrations = [
  {
    eventRegistrationId: primaryEventRegId,
    attendee: {
      personalInformation: {
        firstName: 'Ornstein',
        lastName: 'The DragonSlayer',
        emailAddress: 'orstein@anorLondo.j.mail'
      },
      attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
    },
    confirmationNumber: '123456789',
    productRegistrations: [],
    sessionRegistrations: {
      sessionDId: {
        productId: 'sessionDId',
        productType: 'Session',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    },
    attendeeType: 'GROUP_LEADER',
    registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
    registrationTypeId: '00000000-0000-0000-0000-000000000000'
  },
  {
    eventRegistrationId: guestEventRegId,
    attendee: {
      personalInformation: {
        firstName: 'Smough',
        lastName: 'The Executioner',
        emailAddress: 'smough@anorLondo.j.mail'
      },
      eventAnswers: {}
    },
    attendeeType: 'ATTENDEE',
    primaryRegistrationId: primaryEventRegId,
    registrationTypeId: 'guestRegTypeId',
    productRegistrations: [
      {
        productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ]
  }
];

const applyGuestSessionSelection = jest.fn(() => () => {});

const defaultEventRegSelections = {
  [primaryEventRegId]: {
    isSelected: false,
    isDisabled: false
  },
  [guestEventRegId]: {
    isSelected: false,
    isDisabled: false
  }
};

const primarySelectedEventRegSelections = {
  ...defaultEventRegSelections,
  [primaryEventRegId]: {
    ...defaultEventRegSelections[primaryEventRegId],
    isSelected: true,
    isIncluded: true
  }
};

const defaultSessionGroupEventRegSelections = {
  [primaryEventRegId]: {
    isSelected: false,
    isDisabled: false,
    registeredForProductInGroup: true,
    registeredProductId: 'sessionDId'
  },
  [guestEventRegId]: {
    isSelected: false,
    isDisabled: false,
    registeredForProductInGroup: false
  }
};

let store;

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve));
  });
};

const runTests = useGraphQLSiteEditorData => {
  const initialState = attendingFormat => {
    return {
      website: EventSnapshot.eventSnapshot.siteEditor.website,
      appData: transformEventData(
        EventSnapshot.eventSnapshot.siteEditor.eventData,
        EventSnapshot.accountSnapshot,
        EventSnapshot.eventSnapshot,
        EventSnapshot.eventSnapshot.siteEditor.website
      ),
      account: {
        settings: {
          dupMatchKeyType: 'EMAIL_ONLY'
        }
      },
      event: {
        id: 'eventId',
        timezone: 35,
        attendingFormat
      },
      timezones: {
        35: {
          id: 35,
          name: 'Eastern Time',
          nameResourceKey: 'Event_Timezone_Name_35__resx',
          plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
          hasDst: true,
          utcOffset: -300,
          abbreviation: 'ET',
          abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
          dstInfo: []
        }
      },
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
      text: {
        translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
        resolver: {
          date: () => 'some date',
          currency: x => x
        }
      },
      clients: { regCartClient, eventEmailClient, eventSnapshotClient },
      defaultUserSession: {
        isPreview: false
      },
      visibleProducts: {
        Sessions: {}
      },
      experiments: {
        flexProductVersion: 34,
        useGraphQLSiteEditorData
      }
    };
  };

  const defaultApolloMockData = {
    displaySessionsFees: false,
    displayAdmissionItemsFees: false
  };

  const configureStore = (attendingFormat = undefined) => {
    return createStoreWithMiddleware(
      combineReducers({
        account,
        dialogContainer,
        registrantLogin,
        registrationForm,
        website: (x = {}) => x,
        appData: (x = {}) => x,
        text: (x = {}) => x,
        clients: (x = {}) => x,
        visibleProducts: (x = {}) => x,
        userSession: (x = {}) => x,
        event: (x = {}) => x,
        timezones: (x = {}) => x,
        experiments: (x = {}) => x,
        defaultUserSession: (x = {}) => x
      }),
      initialState(attendingFormat)
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getWidget as $TSFixMe).mockImplementation(() => {
      return {};
    });
    store = configureStore();
  });

  const mountComponent = async (customStore = store, mockData = defaultApolloMockData) => {
    const component = mount(
      <Provider store={customStore}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: MockedResponse<R... Remove this comment to see the full error message */}
        <MockedProvider mocks={getApolloClientMocks(mockData)} addTypeName={false}>
          <DialogContainer spinnerMessage="spinnerMessage" message="message" />
        </MockedProvider>
      </Provider>
    );
    // Wait for Apollo Client MockedProvider to render mock query results
    await waitWithAct();
    await component.update();
    return component;
  };

  describe('Related Contacts Dialog GraphQL', () => {
    it('dialog should render based on experiment wrapper', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          defaultEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId'
        )
      );
      await waitWithAct();
      await dialog.update();
      expect(dialog.exists(GuestProductSelectionDialogWithGraphQL)).toEqual(!!useGraphQLSiteEditorData);
      expect(dialog.exists(GuestProductSelectionDialogWithRedux)).toEqual(!useGraphQLSiteEditorData);
    });
  });
  describe('GuestProductSelectionDialog render tests', () => {
    test('renders list of attendees when opened', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          defaultEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId'
        )
      );
      await waitWithAct();
      await dialog.update();
      expect(dialog).toMatchSnapshot();
    });

    test('renders list with checked options for previously selected registrants', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          1,
          false,
          primarySelectedEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId'
        )
      );
      await waitWithAct();
      await dialog.update();
      expect(dialog).toMatchSnapshot();
    });
  });

  describe('GuestProductSelectionDialog user interaction tests', () => {
    test('Can check and uncheck options for primary and guests', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          1,
          false,
          defaultEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId'
        )
      );
      await waitWithAct();
      await dialog.update();

      // select session for primary
      dialog.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // select session for guest
      dialog.find('[id="ProductSelection_1"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // unselect primary
      dialog.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // unselect guest
      dialog.find('[id="ProductSelection_1"]').simulate('change');
      expect(dialog).toMatchSnapshot();
    });

    test('Choices are disabled when local capacity is reached', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          1,
          false,
          defaultEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId'
        )
      );
      await waitWithAct();
      await dialog.update();

      // select session for primary
      dialog.find('[id="ProductSelection_0"]').simulate('change');
      // Snapshot shows choice disabled with disabled opacity styles
      expect(dialog).toMatchSnapshot();
    });

    test('Choices are never disabled even if capacity is reached when event is Hybrid', async () => {
      /*
       * For connect, we are relying on reg-API for all the capacity related validations, thus always
       * showing the all the choices enabled even if capacity is reached. If capacity has reached to its
       * maximum, reg-API will throw the validation, and capacity reached pop up will be shown .
       */
      const customStore = configureStore(AttendingFormat.HYBRID);
      const dialog = await mountComponent(customStore);
      customStore.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          1,
          false,
          defaultEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId'
        )
      );

      await waitWithAct();
      await dialog.update();

      // select session for primary
      dialog.find('[id="ProductSelection_0"]').simulate('change');
      expect(
        dialog.find('[data-cvent-id="option-ProductSelection_0"]').find('label').hostNodes().props().style.opacity
      ).toBe(undefined);
    });

    test('Clicking the done button calls the appropiate callback function with the selected registrants', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          defaultEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId',
          undefined,
          undefined,
          undefined,
          spinnerSelection
        )
      );

      await waitWithAct();
      await dialog.update();

      const expectedSelectedEventRegs = {
        ...defaultEventRegSelections,
        [primaryEventRegId]: {
          ...defaultEventRegSelections[primaryEventRegId],
          isSelected: true
        }
      };

      expect(dialog).toMatchSnapshot();
      const unselectedCheckbox = dialog.find('[data-cvent-id="unselected-checkbox"]');
      // select session for guest
      unselectedCheckbox.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // click done
      dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
      expect(dialog).toMatchSnapshot();

      // verify that the callback was called with the correct regType set.
      expect(applyGuestSessionSelection).toHaveBeenCalledWith(
        sessionId,
        primaryEventRegId,
        expectedSelectedEventRegs,
        eventRegistrations,
        forWaitlistingAttendees,
        spinnerSelection
      );
    });

    test('Can select closed products if previously held, disabled for others', async () => {
      const dialog = await mountComponent();
      const eventRegSelections = {
        [primaryEventRegId]: {
          isSelected: true,
          isDisabled: false
        },
        [guestEventRegId]: {
          isSelected: false,
          isDisabled: true
        }
      };
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          0,
          false,
          eventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId',
          undefined,
          undefined,
          undefined,
          spinnerSelection
        )
      );

      await waitWithAct();
      await dialog.update();

      // Snapshot shows that product is disabled for guest.
      expect(dialog).toMatchSnapshot();

      const alreadySelectedCheckbox = dialog.find('[data-cvent-id="already-selected-checkbox"]');
      // unselect primary
      alreadySelectedCheckbox.find('[id="AlreadySelectedProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // select primary again
      alreadySelectedCheckbox.find('[id="AlreadySelectedProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // click done
      dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
      expect(dialog).toMatchSnapshot();

      // verify that the callback was called with the correct regType set.
      expect(applyGuestSessionSelection).toHaveBeenCalledWith(
        sessionId,
        primaryEventRegId,
        eventRegSelections,
        eventRegistrations,
        forWaitlistingAttendees,
        spinnerSelection
      );
    });
  });

  describe('GuestProductSelectionDialog Session Group/Admission Item user interaction tests', () => {
    test('invitee thats already registered shows up in already registered section and selectable', async () => {
      const dialog = await mountComponent();
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          defaultSessionGroupEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          'defaultFeeId',
          undefined,
          undefined,
          undefined,
          spinnerSelection
        )
      );

      await waitWithAct();
      await dialog.update();

      const expectedSelectedEventRegs = {
        ...defaultSessionGroupEventRegSelections,
        [primaryEventRegId]: {
          ...defaultSessionGroupEventRegSelections[primaryEventRegId],
          isSelected: true
        }
      };

      expect(dialog).toMatchSnapshot();
      const alreadySelectedCheckbox = dialog.find('[data-cvent-id="already-selected-checkbox"]');
      // select session for guest
      alreadySelectedCheckbox.find('[id="AlreadySelectedProductSelection_0"]').hostNodes().simulate('change');
      expect(dialog).toMatchSnapshot();

      // click done
      dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
      expect(dialog).toMatchSnapshot();
      // verify that the callback was called with the correct regType set.
      expect(applyGuestSessionSelection).toHaveBeenCalledWith(
        sessionId,
        primaryEventRegId,
        expectedSelectedEventRegs,
        eventRegistrations,
        forWaitlistingAttendees,
        spinnerSelection
      );
    });
  });

  describe('GuestProductSelectionDialog fee tests', () => {
    const sessionWidget = {
      config: {
        display: {
          fees: true
        }
      }
    };

    const defaultFeeId = 'defaultFee';

    const defaultEventRegSelection = {
      [primaryEventRegId]: {
        isSelected: false,
        isDisabled: false
      },
      [guestEventRegId]: {
        isSelected: false,
        isDisabled: false
      }
    };

    const fees = {
      defaultFee: {
        id: 'defaultFee',
        amount: 100,
        isActive: true,
        isRefundable: true,
        chargePolicies: [
          {
            amount: 100,
            effectiveUntil: '2999-12-31T00:00:00.000Z',
            id: 'ffcb3714-3c73-4046-b8a8-0466cbcc461c',
            isActive: true,
            maximumRefundAmount: 100
          }
        ],
        registrationTypes: []
      },
      halfOff: {
        id: 'halfOff',
        amount: 50,
        isActive: true,
        isRefundable: true,
        chargePolicies: [
          {
            amount: 50,
            effectiveUntil: '2999-12-31T00:00:00.000Z',
            id: 'ffcb3714-3c73-4046-b8a8-0466cbcc461c',
            isActive: true,
            maximumRefundAmount: 50
          }
        ],
        registrationTypes: ['guestRegTypeId']
      }
    };
    test('fees show if fees are there and total updates', async () => {
      const mockData = {
        displaySessionsFees: true,
        displayAdmissionItemsFees: true
      };
      const dialog = await mountComponent(store, mockData);
      (getWidget as $TSFixMe).mockImplementation(() => {
        return sessionWidget;
      });
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          defaultEventRegSelection,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          fees,
          defaultFeeId
        )
      );

      await waitWithAct();
      await dialog.update();
      // total should be 0
      expect(dialog).toMatchSnapshot();

      // select session for primary total 100
      dialog.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // select session for guest total 150
      dialog.find('[id="ProductSelection_1"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // unselect session for guest total 100
      dialog.find('[id="ProductSelection_1"]').simulate('change');
      expect(dialog).toMatchSnapshot();
    });

    test('shows free if no fees set', async () => {
      const mockData = {
        displaySessionsFees: true,
        displayAdmissionItemsFees: true
      };
      const dialog = await mountComponent(store, mockData);
      (getWidget as $TSFixMe).mockImplementation(() => {
        return sessionWidget;
      });
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          defaultEventRegSelection,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          {},
          defaultFeeId
        )
      );

      await waitWithAct();
      await dialog.update();
      // Free resx instead of total
      expect(dialog).toMatchSnapshot();

      // select session for primary should show as free
      dialog.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();
    });

    test('dont calculate included session in total price', async () => {
      const mockData = {
        displaySessionsFees: true,
        displayAdmissionItemsFees: true
      };
      const dialog = await mountComponent(store, mockData);
      const includedEventRegSelections = {
        [primaryEventRegId]: {
          isSelected: false,
          isDisabled: false,
          isIncluded: false
        },
        [guestEventRegId]: {
          isSelected: true,
          isDisabled: false,
          isIncluded: true
        }
      };
      (getWidget as $TSFixMe).mockImplementation(() => {
        return sessionWidget;
      });
      store.dispatch(
        openGuestProductSelectionDialog(
          'FakeTitleDialog',
          sessionId,
          sessionTitle,
          unlimitedCapacity,
          false,
          includedEventRegSelections,
          eventRegistrations,
          primaryEventRegId,
          false,
          applyGuestSessionSelection,
          fees,
          defaultFeeId
        )
      );

      await waitWithAct();
      await dialog.update();
      // total should be 0
      expect(dialog).toMatchSnapshot();

      // select session for primary total 100 since included for guest
      const unselectedCheckbox = dialog.find('[data-cvent-id="unselected-checkbox"]');
      // select session for guest
      unselectedCheckbox.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();

      // unselect session for primary total should be 0.00
      unselectedCheckbox.find('[id="ProductSelection_0"]').simulate('change');
      expect(dialog).toMatchSnapshot();
    });
  });
};

describe('GuestProductSelectionDialog', () => {
  describe('Use GraphQL widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Development);
  });
  describe('Use Redux widget data', () => {
    runTests(GraphQLSiteEditorDataReleases.Off);
  });
});
