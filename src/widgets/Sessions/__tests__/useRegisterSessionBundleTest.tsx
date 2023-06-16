import React from 'react';
import {
  _getCapacityForGuestProductSelectionDialog,
  _getEventRegistrationSelections,
  _getGuestSessionBundleSelectionApplicator,
  _handleRegistrationWithDifferentAgendas,
  Mutation,
  useRegisterSessionBundle
} from '../useRegisterSessionBundle';
// eslint-disable-next-line jest/no-mocks-import
import {
  mockRegisterSessionBundleError,
  mockRegisterSessionBundleSuccess,
  mockRegisterSessionBundleCapacityReachError
} from '../__mocks__/apolloClient';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { CLOSE_DIALOG, HIDE_LOADING, OPEN_DIALOG } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { REGISTRATION_SOURCE_TYPES, REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import {
  UPDATE_REG_CART_SESSION_BUNDLE_FAILURE,
  UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS
} from '../../../redux/registrationForm/regCart/actionTypes';

import { openCapacityReachedDialog } from '../../../dialogs';
import { LOAD_SESSION_CAPACITY } from 'event-widgets/redux/modules/capacity';
import { EventRegistration } from '@cvent/flex-event-shared';

jest.mock('../../../dialogs', () => ({
  ...jest.requireActual<$TSFixMe>('../../../dialogs'),
  openCapacityReachedDialog: jest.fn(jest.requireActual<$TSFixMe>('../../../dialogs').openCapacityReachedDialog)
}));

const initialState = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        'c6da5ffa-fa0d-465d-823a-8f4c328f7619': {
          guestRegistrationSettings: {
            isGuestRegistrationEnabled: false,
            isGuestProductSelectionEnabled: false
          }
        }
      }
    }
  },
  clients: {
    capacityClient: {
      getCapacitySummaries: jest.fn(() => {})
    }
  },
  event: {
    products: {},
    timezone: 35
  },
  defaultUserSession: {
    isPreview: false,
    isPlanner: false
  },
  registrationForm: {
    currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
    regCartPayment: {
      selectedPaymentMethod: null,
      pricingInfo: {
        creditCard: {
          paymentMethodKey: 'creditCard',
          paymentType: 'Online',
          paymentMethodType: null,
          number: '',
          name: '',
          cVV: '',
          expirationMonth: '5',
          expirationYear: '2021',
          address1: '',
          address2: '',
          address3: '',
          country: '',
          city: '',
          state: '',
          zip: ''
        },
        check: {
          paymentMethodKey: 'check',
          paymentType: 'Offline',
          paymentMethodType: 'Check',
          referenceNumber: ''
        },
        purchaseOrder: {
          paymentMethodKey: 'purchaseOrder',
          paymentType: 'Offline',
          paymentMethodType: 'PurchaseOrder',
          referenceNumber: ''
        },
        offline: {
          optionOne: {
            paymentType: 'Offline',
            paymentMethodType: 'Other',
            paymentMethodKey: 'offline.optionOne',
            note: ''
          },
          optionTwo: {
            paymentType: 'Offline',
            paymentMethodType: 'Other2',
            paymentMethodKey: 'offline.optionTwo',
            note: ''
          },
          optionThree: {
            paymentType: 'Offline',
            paymentMethodType: 'Other3',
            paymentMethodKey: 'offline.optionThree',
            note: ''
          }
        },
        noPayment: {
          paymentMethodKey: 'noPayment',
          paymentType: 'NoPayment',
          paymentMethodType: null
        },
        payPal: {
          paymentMethodKey: 'payPal',
          paymentType: 'Online',
          paymentMethodType: 'PayPal'
        },
        authorizeDotNet: {
          paymentMethodKey: 'authorizeDotNet',
          paymentType: 'Online',
          paymentMethodType: 'AuthorizeNetSIM'
        },
        touchNet: {
          paymentMethodKey: 'touchNet',
          paymentType: 'Online',
          paymentMethodType: 'TouchNet'
        },
        cyberSourceSecureAcceptance: {
          paymentMethodKey: 'cyberSourceSecureAcceptance',
          paymentType: 'Online',
          paymentMethodType: 'CyberSourceSecureAcceptance'
        },
        wpm: {
          paymentMethodKey: 'wpm',
          paymentType: 'Online',
          paymentMethodType: 'Wpm'
        }
      }
    },
    regCart: {
      someUnsavedData: 'someUnsavedData',
      sendEmail: true,
      eventId: 'f694fb1c-a278-4555-ae2b-73042fda2063',
      localeId: 1033,
      accountSnapshotVersion: 'XQlU4Bg_NkiqdRIYerVqOyBN_2RIrlCM',
      eventSnapshotVersions: {
        'f694fb1c-a278-4555-ae2b-73042fda2063': 'Opbs0Iz4WlyFxIVggb1vIg7DXC.dfMFj'
      },
      regCartId: '01d4655d-f010-458d-8a10-a408f97c029c',
      lastSavedPageId: 'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8',
      status: 'INPROGRESS',
      dequeueStatus: {
        totalSteps: 0,
        currentStep: 0
      },
      groupRegistration: false,
      volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          attendee: {
            personalInformation: {
              firstName: 'invitee',
              lastName: '1',
              emailAddress: 'invitee@j.mail',
              customFields: {},
              emailAddressDomain: 'j.mail'
            },
            isGroupMember: false,
            eventAnswers: {}
          },
          attendeeType: 'ATTENDEE',
          displaySequence: 1,
          productRegistrations: [
            {
              requestedAction: 'REGISTER',
              productType: 'AdmissionItem',
              productId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
              quantity: 1
            }
          ],
          requestedAction: 'REGISTER',
          externalRegistrationContactId: '',
          contactNoMatchInSfCampaign: false,
          eventId: 'f694fb1c-a278-4555-ae2b-73042fda2063',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
          sessionRegistrations: {},
          quantityItemRegistrations: {},
          donationItemRegistrations: {},
          sessionWaitlists: {},
          sessionBundleRegistrations: {},
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: 'c6da5ffa-fa0d-465d-823a-8f4c328f7619',
          addGuestFromRelatedContacts: false,
          autoAssignRegTypeForEventRegistration: false,
          attendingFormatId: 0
        },
        '9a44e12c-bc20-43fc-88ad-36c42c8de107': {
          eventRegistrationId: '9a44e12c-bc20-43fc-88ad-36c42c8de107',
          attendee: {
            personalInformation: {
              firstName: 'guest',
              lastName: '1',
              emailAddress: 'guest@j.mail',
              customFields: {},
              emailAddressDomain: 'j.mail'
            },
            isGroupMember: false,
            eventAnswers: {}
          },
          attendeeType: 'GUEST',
          displaySequence: 1,
          productRegistrations: [
            {
              requestedAction: 'REGISTER',
              productType: 'AdmissionItem',
              productId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
              quantity: 1
            }
          ],
          requestedAction: 'REGISTER',
          contactNoMatchInSfCampaign: false,
          eventId: 'f694fb1c-a278-4555-ae2b-73042fda2063',
          primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
          sessionRegistrations: {},
          quantityItemRegistrations: {},
          donationItemRegistrations: {},
          sessionWaitlists: {},
          sessionBundleRegistrations: {},
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: 'c6da5ffa-fa0d-465d-823a-8f4c328f7619',
          addGuestFromRelatedContacts: false,
          autoAssignRegTypeForEventRegistration: false,
          attendingFormatId: 0
        }
      },
      isAdmin: false,
      registrationApprovalRequired: false,
      hasTravel: false,
      partial: true,
      regApproval: false,
      regCancel: false,
      regMod: false,
      regDecline: false,
      regWaitList: false,
      postRegPayment: false
    },
    errors: {},
    currentGuestEventRegistration: {},
    validationMessages: [],
    discountCodeStatus: ''
  },
  regCartStatus: {
    lastSavedRegCart: {}
  },
  visibleProducts: {
    Sessions: {
      '00000000-0000-0000-0000-000000000001': {
        admissionItems: {
          '6a0ee119-0fd3-4e70-a61e-16361ebef51f': {
            code: '',
            description: '',
            id: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
            capacityId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
            name: 'Event Registration',
            status: 2,
            type: 'AdmissionItem',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            closedReasonType: 'NotClosed',
            isOpenForRegistration: true,
            limitOptionalItemsToSelect: false,
            includeWaitlistSessionsTowardsMaximumLimit: false,
            applicableContactTypes: [],
            limitOptionalSessionsToSelect: false,
            associatedOptionalSessions: [],
            applicableOptionalItems: [],
            minimumNumberOfSessionsToSelect: 0,
            availableOptionalSessions: [],
            displayOrder: 2
          }
        },
        sessionProducts: {
          '0c7af723-a761-447e-af49-4c6654de14ed': {
            code: '',
            description: '',
            id: '0c7af723-a761-447e-af49-4c6654de14ed',
            capacityId: '0c7af723-a761-447e-af49-4c6654de14ed',
            name: 'Has Large Available Capacity',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            closedReasonType: 'NotClosed',
            isOpenForRegistration: true,
            categoryId: '00000000-0000-0000-0000-000000000000',
            waitlistCapacityId: '0c7af723-a761-447e-af49-4c6654de14ed_waitlist',
            startTime: '2021-06-27T22:00:00.000Z',
            endTime: '2021-06-27T23:00:00.000Z',
            isIncludedSession: false,
            isWaitlistEnabled: false,
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            showOnAgenda: true,
            speakerIds: {}
          }
        },
        sessions: null,
        sessionGroups: null,
        sortKeys: {
          '808fb94d-5002-40cd-ae24-38d016e13199': [
            '2021-06-27 00:00:00:000',
            '18:00',
            '2147483647',
            '',
            '9223372036854775807'
          ],
          '2c245649-0b83-41cc-aa62-ccb89fcb5cd1': [
            '2021-06-27 00:00:00:000',
            '18:00',
            '2147483647',
            '',
            '9223372036854775807'
          ],
          '355c1b55-74bb-442f-86e8-6a0468c64002': [
            '2021-04-28 00:00:00:000',
            '18:55',
            '2147483647',
            '',
            '9223372036854775807'
          ],
          '785a109d-79ad-4902-95f1-690b71c32a1b': [
            '2021-06-27 00:00:00:000',
            '18:00',
            '2147483647',
            '',
            '9223372036854775807'
          ],
          '0c7af723-a761-447e-af49-4c6654de14ed': [
            '2021-06-27 00:00:00:000',
            '18:00',
            '2147483647',
            '',
            '9223372036854775807'
          ],
          '1e8d0206-660b-4aa3-8bbf-cb886fb38e58': [
            '2021-06-27 00:00:00:000',
            '18:00',
            '2147483647',
            '',
            '9223372036854775807'
          ]
        },
        quantityItems: {},
        donationItems: {},
        skipValidationItems: null
      },
      '9a44e12c-bc20-43fc-88ad-36c42c8de107': {
        admissionItems: {
          '6a0ee119-0fd3-4e70-a61e-16361ebef51f': {
            code: '',
            description: '',
            id: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
            capacityId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
            name: 'Event Registration',
            status: 2,
            type: 'AdmissionItem',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            closedReasonType: 'NotClosed',
            isOpenForRegistration: true,
            limitOptionalItemsToSelect: false,
            includeWaitlistSessionsTowardsMaximumLimit: false,
            applicableContactTypes: [],
            limitOptionalSessionsToSelect: false,
            associatedOptionalSessions: [],
            applicableOptionalItems: [],
            minimumNumberOfSessionsToSelect: 0,
            availableOptionalSessions: [],
            displayOrder: 2
          }
        },
        sessionProducts: {
          '0c7af723-a761-447e-af49-4c6654de14ed': {
            code: '',
            description: '',
            id: '0c7af723-a761-447e-af49-4c6654de14ed',
            capacityId: '0c7af723-a761-447e-af49-4c6654de14ed',
            name: 'Has Large Available Capacity',
            status: 2,
            type: 'Session',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            closedReasonType: 'NotClosed',
            isOpenForRegistration: true,
            categoryId: '00000000-0000-0000-0000-000000000000',
            waitlistCapacityId: '0c7af723-a761-447e-af49-4c6654de14ed_waitlist',
            startTime: '2021-06-27T22:00:00.000Z',
            endTime: '2021-06-27T23:00:00.000Z',
            isIncludedSession: false,
            isWaitlistEnabled: false,
            associatedRegistrationTypes: [],
            sessionCustomFieldValues: {},
            displayPriority: 0,
            showOnAgenda: true,
            speakerIds: {}
          }
        },
        sessions: null,
        sessionGroups: null,
        quantityItems: {},
        donationItems: {},
        skipValidationItems: null
      }
    },
    Widget: {
      admissionItems: {
        '6a0ee119-0fd3-4e70-a61e-16361ebef51f': {
          code: '',
          description: '',
          id: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
          capacityId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
          name: 'Event Registration',
          status: 2,
          type: 'AdmissionItem',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {},
          closedReasonType: 'NotClosed',
          isOpenForRegistration: true,
          limitOptionalItemsToSelect: false,
          includeWaitlistSessionsTowardsMaximumLimit: false,
          applicableContactTypes: [],
          limitOptionalSessionsToSelect: false,
          associatedOptionalSessions: [],
          applicableOptionalItems: [],
          minimumNumberOfSessionsToSelect: 0,
          availableOptionalSessions: [],
          displayOrder: 2
        }
      },
      sessionProducts: {
        '0c7af723-a761-447e-af49-4c6654de14ed': {
          code: '',
          description: '',
          id: '0c7af723-a761-447e-af49-4c6654de14ed',
          capacityId: '0c7af723-a761-447e-af49-4c6654de14ed',
          name: 'Has Large Available Capacity',
          status: 2,
          type: 'Session',
          defaultFeeId: '00000000-0000-0000-0000-000000000000',
          fees: {},
          closedReasonType: 'NotClosed',
          isOpenForRegistration: true,
          categoryId: '00000000-0000-0000-0000-000000000000',
          waitlistCapacityId: '0c7af723-a761-447e-af49-4c6654de14ed_waitlist',
          startTime: '2021-06-27T22:00:00.000Z',
          endTime: '2021-06-27T23:00:00.000Z',
          isIncludedSession: false,
          isWaitlistEnabled: false,
          associatedRegistrationTypes: [],
          sessionCustomFieldValues: {},
          displayPriority: 0,
          showOnAgenda: true,
          speakerIds: {}
        }
      },
      sessions: null,
      sessionGroups: null,
      quantityItems: {},
      donationItems: {},
      skipValidationItems: null
    }
  },
  text: {
    resolver: {},
    locale: 'en',
    translate: jest.fn()
  },
  timezones: {
    35: {
      nameResourceKey: 'Event_Timezone_Name_35__resx'
    }
  },
  website: {
    theme: {
      global: {
        dialog: {
          background: {},
          body: {},
          header: {},
          headerText: {}
        }
      },
      sections: {}
    }
  }
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('useRegisterSessionBundle', () => {
  const TestComponent = () => {
    const [mutate] = useRegisterSessionBundle({
      id: '3a53a9c0-f8f9-451a-919a-0ab577e9fb64',
      name: '',
      capacity: {
        availableCapacity: 10
      },
      fees: {},
      defaultFeeId: 'defaultFeeId'
    });
    return (
      <button type="button" onClick={mutate}>
        Register Session Bundle
      </button>
    );
  };

  const mountComponent = (store, apolloClientMock) =>
    mount(
      <Provider store={store}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: any[]; addTypeNa... Remove this comment to see the full error message */}
        <MockedProvider mocks={[apolloClientMock]} addTypeName={false}>
          <TestComponent />
        </MockedProvider>
      </Provider>
    );

  it('should call mutation when clicking button', async () => {
    const store = mockStore(initialState);
    const component = await mountComponent(store, mockRegisterSessionBundleSuccess);
    await act(() => component.find('button').prop('onClick')());
    const registerSessionBundleMock = mockRegisterSessionBundleSuccess.newData;
    expect(registerSessionBundleMock).toHaveBeenCalled();
  });

  it('should dispatch failure actions on error', async () => {
    const store = mockStore(initialState);
    const component = await mountComponent(store, mockRegisterSessionBundleError);
    await act(() => component.find('button').prop('onClick')());
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: UPDATE_REG_CART_SESSION_BUNDLE_FAILURE
        }),
        expect.objectContaining({
          type: HIDE_LOADING
        })
      ])
    );
  });

  it('should not open guest product selection dialog if guests have same agenda', async () => {
    const store = mockStore({
      ...initialState,
      appData: {
        registrationSettings: {
          registrationPaths: {
            'c6da5ffa-fa0d-465d-823a-8f4c328f7619': {
              guestRegistrationSettings: {
                isGuestRegistrationEnabled: true,
                isGuestProductSelectionEnabled: false
              }
            }
          }
        }
      }
    });
    const component = await mountComponent(store, mockRegisterSessionBundleSuccess);
    await act(() => component.find('button').prop('onClick')());
    expect(store.getActions()).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({
          type: OPEN_DIALOG
        })
      ])
    );
  });

  it('should open guest product selection dialog if guests have different agenda', async () => {
    const store = mockStore({
      ...initialState,
      appData: {
        registrationSettings: {
          registrationPaths: {
            'c6da5ffa-fa0d-465d-823a-8f4c328f7619': {
              guestRegistrationSettings: {
                isGuestRegistrationEnabled: true,
                isGuestProductSelectionEnabled: true
              }
            }
          }
        }
      }
    });
    const component = await mountComponent(store, mockRegisterSessionBundleSuccess);
    await act(() => component.find('button').prop('onClick')());
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: OPEN_DIALOG
        })
      ])
    );
  });

  it('should handle capacity reached error state', async () => {
    const store = mockStore(initialState);
    const component = await mountComponent(store, mockRegisterSessionBundleCapacityReachError);
    await act(() => component.find('button').prop('onClick')());
    expect(openCapacityReachedDialog).toHaveBeenCalled();
  });

  it('should update session capacities on success', async () => {
    const store = mockStore(initialState);
    const component = await mountComponent(store, mockRegisterSessionBundleSuccess);
    await act(() => component.find('button').prop('onClick')());
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: LOAD_SESSION_CAPACITY
        })
      ])
    );
  });

  it('should update retain unsaved reg cart data on success', async () => {
    const store = mockStore(initialState);
    const component = await mountComponent(store, mockRegisterSessionBundleSuccess);
    await act(() => component.find('button').prop('onClick')());
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS,
          payload: expect.objectContaining({
            regCart: expect.objectContaining({
              someUnsavedData: 'someUnsavedData'
            })
          })
        })
      ])
    );
  });
});

describe('_getEventRegistrationSelections', () => {
  const eventRegistrationId = 'eventReg1';
  const registrationTypeId = 'regTypeId1';
  const eventRegistrations = [
    {
      eventRegistrationId,
      registrationTypeId,
      sessionBundleRegistrations: {
        sessionBundle1: {
          requestedAction: REQUESTED_ACTIONS.REGISTER
        },
        sessionBundle2: {
          requestedAction: REQUESTED_ACTIONS.UNREGISTER
        }
      }
    } as unknown as EventRegistration
  ];

  it('should be selected if requested action is register', () => {
    const sessionBundle = { id: 'sessionBundle1' };
    const result = _getEventRegistrationSelections(eventRegistrations, sessionBundle);

    expect(result?.[eventRegistrationId]).toBeDefined();
    expect(result[eventRegistrationId].isSelected).toBeTruthy();
  });

  it('should not be selected if requested action is unregister', () => {
    const sessionBundle = { id: 'sessionBundle2' };
    const result = _getEventRegistrationSelections(eventRegistrations, sessionBundle);

    expect(result?.[eventRegistrationId]).toBeDefined();
    expect(result[eventRegistrationId].isSelected).toBeFalsy();
  });

  it('should not be disabled if session bundle has empty applicable registration types', () => {
    const sessionBundle = {
      id: 'sessionBundle1',
      applicableRegistrationTypes: []
    };
    const result = _getEventRegistrationSelections(eventRegistrations, sessionBundle);

    expect(result?.[eventRegistrationId]).toBeDefined();
    expect(result[eventRegistrationId].isDisabled).toBeFalsy();
  });

  it('should not be disabled if session bundle contains applicable registration type', () => {
    const sessionBundle = {
      id: 'sessionBundle1',
      applicableRegistrationTypes: [registrationTypeId]
    };
    const result = _getEventRegistrationSelections(eventRegistrations, sessionBundle);

    expect(result?.[eventRegistrationId]).toBeDefined();
    expect(result[eventRegistrationId].isDisabled).toBeFalsy();
  });

  it('should be disabled if session bundle does not contain any applicable registration types', () => {
    const sessionBundle = {
      id: 'sessionBundle1',
      applicableRegistrationTypes: ['someOtherRegType']
    };
    const result = _getEventRegistrationSelections(eventRegistrations, sessionBundle);

    expect(result?.[eventRegistrationId]).toBeDefined();
    expect(result[eventRegistrationId].isDisabled).toBeTruthy();
  });
});

describe('_getGuestSessionBundleSelectionApplicator', () => {
  const store = mockStore(initialState);
  const regCart = store.getState().registrationForm.regCart;
  const mutate = jest.fn();
  const applyGuestSessionBundleSelection = _getGuestSessionBundleSelectionApplicator(store.dispatch, mutate, regCart);

  it('should close dialogs when called', async () => {
    await applyGuestSessionBundleSelection(null, null, null)();
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: CLOSE_DIALOG
        })
      ])
    );
  });

  it('should not call mutation if no event registration ids are selected', async () => {
    await applyGuestSessionBundleSelection(null, null, null)();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('should call mutation with correct data if any event registration ids are selected', async () => {
    const eventRegistrationId = 'eventReg1';
    const sessionBundleId = 'sessionBundle1';
    const selectedEventRegIds = {
      [eventRegistrationId]: { isSelected: true, isDisabled: false }
    };
    await applyGuestSessionBundleSelection(sessionBundleId, null, selectedEventRegIds)();

    const expectedArguments = {
      variables: {
        regCartId: regCart.regCartId,
        input: [
          {
            eventRegistrationId,
            productId: sessionBundleId,
            requestedAction: REQUESTED_ACTIONS.REGISTER,
            registrationSourceType: REGISTRATION_SOURCE_TYPES.SELECTED
          }
        ]
      }
    };
    expect(mutate).toBeCalledWith(expectedArguments);
  });

  it('should not call mutation with event registration ids that have not changed', async () => {
    const eventRegistrationId = 'eventReg1';
    const sessionBundleId = 'sessionBundle1';
    const selectedEventRegIds = {
      [eventRegistrationId]: { isSelected: undefined, isDisabled: false }
    };
    await applyGuestSessionBundleSelection(sessionBundleId, null, selectedEventRegIds)();

    const expectedArguments = {
      variables: {
        regCartId: regCart.regCartId,
        input: []
      }
    };
    expect(mutate).toBeCalledWith(expectedArguments);
  });
});

describe('_getCapacityForGuestProductSelectionDialog', () => {
  it('should return correct capacity on reg approval', () => {
    const productCapacity = 5;
    const eventRegistrationSelections = {
      '1': { isSelected: true, isDisabled: false },
      '2': { isSelected: true, isDisabled: false },
      '3': { isSelected: true, isDisabled: false }
    };
    const result = _getCapacityForGuestProductSelectionDialog(productCapacity, true, eventRegistrationSelections);
    expect(result).toEqual(2);
  });

  it('should return no capacity on reg approval if selections exceed product capacity', () => {
    const productCapacity = 2;
    const eventRegistrationSelections = {
      '1': { isSelected: true, isDisabled: false },
      '2': { isSelected: true, isDisabled: false },
      '3': { isSelected: true, isDisabled: false }
    };
    const result = _getCapacityForGuestProductSelectionDialog(productCapacity, true, eventRegistrationSelections);
    expect(result).toEqual(0);
  });

  it('should return product capacity on normal reg', () => {
    const productCapacity = 10;
    const result = _getCapacityForGuestProductSelectionDialog(productCapacity, false, {});
    expect(result).toEqual(productCapacity);
  });

  it('should return product capacity if capacity is unlimited', () => {
    const productCapacity = -1;
    const result = _getCapacityForGuestProductSelectionDialog(productCapacity, true, {});
    expect(result).toEqual(productCapacity);
  });
});

describe('_handleRegistrationWithDifferentAgendas', () => {
  const store = mockStore(initialState);
  const state = store.getState();
  const regCart = state.registrationForm.regCart;
  const eventRegistrationId = 'eventReg1';
  const mutation = [jest.fn(), true] as Mutation;
  const sessionBundle = {
    id: 'id',
    name: 'name',
    capacity: { availableCapacity: 0 },
    fees: {},
    defaultFeeId: 'defaultFeeId'
  };

  it('should open dialog when called', async () => {
    const [openProductSelectionDialog] = _handleRegistrationWithDifferentAgendas(
      store.dispatch,
      state,
      mutation,
      sessionBundle,
      regCart,
      eventRegistrationId
    );
    await openProductSelectionDialog();
    expect(store.getActions()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: OPEN_DIALOG
        })
      ])
    );
  });
});
