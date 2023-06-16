/* eslint-env jest */
import { mount } from 'enzyme';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import React from 'react';
import { Provider } from 'react-redux';
import dialogContainer, * as dialogContainerActions from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import { updateIn, setIn } from 'icepick';
import { selectSession, PRODUCT_STATUS, unSelectSession } from '../sessions';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
// eslint-disable-next-line jest/no-mocks-import
import {
  regCartId,
  primaryEventRegId,
  getState,
  accessToken,
  visibleProductsForRegistration,
  selectedSessionId,
  waitlistedSessionId,
  registrationPathId,
  response,
  RegCartClient,
  dummyCapacitySummaries
} from '../__mocks__/sessions';

dialogContainerActions.showLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingDialog = jest.fn(() => () => {});
dialogContainerActions.hideLoadingOnError = jest.fn(() => () => {});

jest.mock('../../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  useRegistrationPageVarietyPathQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            sessions: {
              validation: {
                reviewed: false,
                onCurrentPage: false,
                onPageBeforeAdmissionItems: false,
                onPageBeforeRegistrationType: false,
                onPageWithPaymentOrRegistrationSummary: false
              }
            }
          }
        }
      }
    }
  })
}));

RegCartClient.prototype.getCapacitySummaries = jest.fn(() => {
  return dummyCapacitySummaries;
});
RegCartClient.prototype.updateRegCartSessionRegistrations = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.calculateRegCartPricing = jest.fn(() => Object.assign({ regCartPricing: {} }));

const guestEventRegId1 = '00000000-0000-0000-0000-000000000002';
const guestEventRegId2 = '00000000-0000-0000-0000-000000000003';
const guestEventRegIdWithSessionGroup = '00000000-0000-0000-0000-000000000004';

const sessionInSessionGroup = 'freeSessionInGroup';

const eventRegistrationsWithGuests = {
  [primaryEventRegId]: {
    eventRegistrationId: primaryEventRegId,
    requestedAction: REQUESTED_ACTIONS.REGISTER,
    attendee: {
      personalInformation: {
        firstName: 'Potter',
        lastName: 'Harry',
        emailAddress: 'hp@j.mail'
      },
      attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
    },
    confirmationNumber: '123456789',
    productRegistrations: [
      {
        productId: 'admissionItemId',
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: REQUESTED_ACTIONS.REGISTER
      }
    ],
    sessionWaitlists: {},
    attendeeType: 'ATTENDEE',
    registrationPathId,
    registrationTypeId: '00000000-0000-0000-0000-000000000000'
  },
  [guestEventRegId1]: {
    eventRegistrationId: guestEventRegId1,
    requestedAction: REQUESTED_ACTIONS.REGISTER,
    attendee: {
      personalInformation: {
        firstName: 'Weasley',
        lastName: 'Ron',
        emailAddress: 'rweasley@j.mail'
      },
      eventAnswers: {}
    },
    attendeeType: 'GUEST',
    primaryRegistrationId: primaryEventRegId,
    registrationTypeId: 'guestRegTypeId',
    registrationPathId,
    productRegistrations: [
      {
        productId: 'admissionItemId',
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ],
    sessionWaitlists: {}
  }
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const productSelectors = require('../../../selectors/productSelectors');
const setMockForSessionSelectionWithGuests = (sessionId, isWaitlistEnabled = false) => {
  productSelectors.getPrimaryAndGuestSortedVisibleSessions = jest.fn(() => {
    return [
      {
        id: sessionId,
        isOpenForRegistration: true,
        showOnAgenda: true,
        type: 'Session',
        name: sessionId,
        isWaitlistEnabled,
        status: PRODUCT_STATUS.ACTIVE
      },
      {
        id: 'sessionGroup',
        sessions: {
          [sessionInSessionGroup]: {
            capacityId: 'unlimitedCapacity',
            id: sessionInSessionGroup,
            name: 'Free Session in Group',
            status: PRODUCT_STATUS.ACTIVE
          },
          sessionInGroupWithFee: {
            capacityId: 'unlimitedCapacity',
            id: 'sessionInGroupWithFee',
            name: 'Session in Group',
            status: PRODUCT_STATUS.ACTIVE
          }
        }
      }
    ];
  });
  productSelectors.getSessionGroups = jest.fn(() => {
    return [
      {
        code: 'Group',
        id: 'sessionGroup',
        isOpenForRegistration: true,
        name: 'Group',
        sessions: {
          [sessionInSessionGroup]: {
            capacityId: 'unlimitedCapacity',
            id: sessionInSessionGroup,
            name: 'Free Session in Group'
          },
          sessionInGroupWithFee: {
            capacityId: 'unlimitedCapacity',
            id: 'sessionInGroupWithFee',
            name: 'Session in Group'
          }
        }
      }
    ];
  });
};
const getStateWithGuests = (eventRegistrations, isGuestProductSelectionEnabled = true) => {
  let updatedState = setIn(getState(), ['registrationForm', 'regCart', 'eventRegistrations'], eventRegistrations);
  updatedState = updateIn(
    updatedState,
    ['appData', 'registrationSettings', 'registrationPaths', registrationPathId, 'guestRegistrationSettings'],
    settings => {
      return {
        ...settings,
        isGuestProductSelectionEnabled
      };
    }
  );
  updatedState = setIn(updatedState, ['regCartStatus', 'lastSavedRegCart', 'eventRegistrations'], eventRegistrations);
  updatedState = updateIn(updatedState, ['visibleProducts', 'Sessions'], sessionEventRegistrations => {
    const newSessionEventRegistrations = { ...sessionEventRegistrations };
    Object.keys(eventRegistrations).forEach(eventRegistrationId => {
      newSessionEventRegistrations[eventRegistrationId] = { ...visibleProductsForRegistration };
    });
    return newSessionEventRegistrations;
  });
  return updatedState;
};

const getMockStoreForSessionSelectionWithGuests = state => {
  return createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      accessToken: (x = {}) => x,
      dialogContainer,
      regCartStatus: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x,
      text: (x = {}) => x,
      clients: (x = {}) => x,
      visibleProducts: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      event: (x = {}) => x,
      timezones: (x = {}) => x,
      experiments: (x = {}) => x,
      waitlistSelectionForGuests: (x = {}) => x
    }),
    {
      ...state
    },
    {
      thunkExtraArgument: { apolloClient: {} }
    }
  );
};
// eslint-disable-next-line jest/no-mocks-import
import { getMockedFieldInputs } from '../../../../dialogs/__mocks__/documentElementMock';
import { GraphQLSiteEditorDataReleases } from '../../../../ExperimentHelper';
getMockedFieldInputs(['ProductSelection', 'AlreadySelectedProductSelection']);

let mockUseGraphQLSiteEditorData = GraphQLSiteEditorDataReleases.Off;
jest.mock('../../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData,
  useGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

describe.each([
  ['GraphQL', GraphQLSiteEditorDataReleases.Development],
  ['Redux', GraphQLSiteEditorDataReleases.Off]
])('sessions with guests using %s site editor data', (description, experimentStatus) => {
  // fresh references in each test cases
  let store;
  let regCartClient;
  let eventRegistrations;
  beforeEach(() => {
    jest.clearAllMocks(); // clear counters in jest mock functions
    eventRegistrations = Object.assign({}, eventRegistrationsWithGuests);
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    regCartClient = store.getState().clients.regCartClient;
    mockUseGraphQLSiteEditorData = experimentStatus;
  });
  test('selecting session with guests', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, selectedSessionId));
    dialog.update();

    // select session for primary
    dialog.find('[id="ProductSelection_0"]').simulate('change');
    // select session for guest
    dialog.find('[id="ProductSelection_1"]').simulate('change');
    expect(dialog).toMatchSnapshot('Session selection snapshot in dialog');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: primaryEventRegId,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      },
      {
        eventRegistrationId: guestEventRegId1,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('unselecting session with guests', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    eventRegistrations = {
      ...eventRegistrationsWithGuests,
      [guestEventRegId2]: {
        eventRegistrationId: guestEventRegId2,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Granger',
            lastName: 'Hermione',
            emailAddress: 'hgranger@j.mail'
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: primaryEventRegId,
        registrationTypeId: 'guestRegTypeId',
        registrationPathId,
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            productType: 'Session',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'Selected'
          }
        }
      }
    };
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(unSelectSession(primaryEventRegId, selectedSessionId));
    dialog.update();
    expect(dialog).toMatchSnapshot();

    // select session for guest
    dialog.find('[id="AlreadySelectedProductSelection_0"]').simulate('change');
    expect(dialog).toMatchSnapshot('Session selection snapshot in dialog');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: guestEventRegId2,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.UNREGISTER,
        registrationSourceType: 'Selected'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('selecting session for primary after guest got session through association', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    eventRegistrations = {
      ...eventRegistrationsWithGuests,
      [guestEventRegId2]: {
        eventRegistrationId: guestEventRegId2,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Granger',
            lastName: 'Hermione',
            emailAddress: 'hgranger@j.mail'
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: primaryEventRegId,
        registrationTypeId: 'guestRegTypeId',
        registrationPathId,
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            productType: 'Session',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'AdmissionItem'
          }
        }
      }
    };
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, selectedSessionId));
    dialog.update();
    expect(dialog).toMatchSnapshot();

    // select session for primary
    dialog.find('[id="ProductSelection_0"]').simulate('change');
    expect(dialog).toMatchSnapshot('Session selection snapshot in dialog');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: primaryEventRegId,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      },
      {
        eventRegistrationId: guestEventRegId2,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'AdmissionItem'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('waitlisting session with guests', async () => {
    setMockForSessionSelectionWithGuests(waitlistedSessionId, true);
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, waitlistedSessionId, true));
    dialog.update();

    // select session for primary
    dialog.find('[id="ProductSelection_0"]').simulate('change');
    // select session for guest
    dialog.find('[id="ProductSelection_1"]').simulate('change');
    expect(dialog).toMatchSnapshot('Session waitlist snapshot in dialog');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: primaryEventRegId,
        productId: waitlistedSessionId,
        requestedAction: REQUESTED_ACTIONS.WAITLIST,
        registrationSourceType: null
      },
      {
        eventRegistrationId: guestEventRegId1,
        productId: waitlistedSessionId,
        requestedAction: REQUESTED_ACTIONS.WAITLIST,
        registrationSourceType: null
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('registering session which was waitlisted before with guests', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId, true);
    eventRegistrations = {
      ...eventRegistrationsWithGuests,
      [guestEventRegId2]: {
        eventRegistrationId: guestEventRegId2,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Granger',
            lastName: 'Hermione',
            emailAddress: 'hgranger@j.mail'
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: primaryEventRegId,
        registrationTypeId: 'guestRegTypeId',
        registrationPathId,
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionWaitlists: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            productType: 'Session',
            requestedAction: REQUESTED_ACTIONS.WAITLIST
          }
        }
      }
    };
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, selectedSessionId));
    dialog.update();
    // select session for guest2
    dialog.find('[id="ProductSelection_2"]').simulate('change');
    expect(dialog).toMatchSnapshot('Session waitlist snapshot in dialog');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: guestEventRegId2,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      },
      {
        eventRegistrationId: guestEventRegId2,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.LEAVE_WAITLIST,
        registrationSourceType: null
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('registering session in session groups for guests with session selection', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    eventRegistrations = {
      ...eventRegistrationsWithGuests,
      [guestEventRegIdWithSessionGroup]: {
        eventRegistrationId: guestEventRegIdWithSessionGroup,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Longbottom',
            lastName: 'Neville',
            emailAddress: 'nLongbottom@j.mail'
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: primaryEventRegId,
        registrationTypeId: 'guestRegTypeId',
        registrationPathId,
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ]
      }
    };
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, sessionInSessionGroup));
    dialog.update();
    // select session for guest2
    dialog.find('[id="ProductSelection_2"]').simulate('change');
    expect(dialog).toMatchSnapshot('Session snapshot in dialog');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: guestEventRegIdWithSessionGroup,
        productId: sessionInSessionGroup,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('select a session for primary and match to guests when assign primary reg session to guests is enabled', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations, false));
    await store.dispatch(selectSession(primaryEventRegId, selectedSessionId));
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: primaryEventRegId,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      },
      {
        eventRegistrationId: guestEventRegId1,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('Selecting session for guest which is included with primary invitee admission item', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    eventRegistrations = {
      [primaryEventRegId]: {
        eventRegistrationId: primaryEventRegId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Potter',
            lastName: 'Harry',
            emailAddress: 'hp@j.mail'
          },
          attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
        },
        confirmationNumber: '123456789',
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: REQUESTED_ACTIONS.REGISTER
          }
        ],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            productType: 'Session',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'AdmissionItem'
          }
        },
        sessionWaitlists: {},
        attendeeType: 'ATTENDEE',
        registrationPathId,
        registrationTypeId: '00000000-0000-0000-0000-000000000000'
      },
      [guestEventRegId1]: {
        eventRegistrationId: guestEventRegId1,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Weasley',
            lastName: 'Ron',
            emailAddress: 'rweasley@j.mail'
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: primaryEventRegId,
        registrationTypeId: 'guestRegTypeId',
        registrationPathId,
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionWaitlists: {}
      }
    };
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, selectedSessionId));
    dialog.update();

    // select session which is included for PI
    dialog.find('[id="ProductSelection_0"]').simulate('change');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: primaryEventRegId,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'AdmissionItem'
      },
      {
        eventRegistrationId: guestEventRegId1,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });

  test('Selecting session for guest which is included with another Guest admission item', async () => {
    setMockForSessionSelectionWithGuests(selectedSessionId);
    eventRegistrations = {
      ...eventRegistrationsWithGuests,
      [guestEventRegId2]: {
        eventRegistrationId: guestEventRegId2,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        attendee: {
          personalInformation: {
            firstName: 'Granger',
            lastName: 'Hermione',
            emailAddress: 'hgranger@j.mail'
          },
          eventAnswers: {}
        },
        attendeeType: 'GUEST',
        primaryRegistrationId: primaryEventRegId,
        registrationTypeId: 'guestRegTypeId',
        registrationPathId,
        productRegistrations: [
          {
            productId: 'admissionItemId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          [selectedSessionId]: {
            productId: selectedSessionId,
            productType: 'Session',
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: 'AdmissionItem'
          }
        }
      }
    };
    store = getMockStoreForSessionSelectionWithGuests(getStateWithGuests(eventRegistrations));
    const dialog = mount(
      <Provider store={store}>
        <DialogContainer spinnerMessage="spinnerMessage" message="message" />
      </Provider>
    );
    await store.dispatch(selectSession(primaryEventRegId, selectedSessionId));
    dialog.update();
    // select session which is included for Guest2
    dialog.find('[id="ProductSelection_1"]').simulate('change');
    // click done
    dialog.find('[data-cvent-id="done-button"]').hostNodes().simulate('click');
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledTimes(1);
    const expectedSessionRegUpdates = [
      {
        eventRegistrationId: guestEventRegId1,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'Selected'
      },
      {
        eventRegistrationId: guestEventRegId2,
        productId: selectedSessionId,
        requestedAction: REQUESTED_ACTIONS.REGISTER,
        registrationSourceType: 'AdmissionItem'
      }
    ];
    expect(regCartClient.updateRegCartSessionRegistrations).toHaveBeenCalledWith(
      accessToken,
      regCartId,
      expectedSessionRegUpdates
    );
  });
});
