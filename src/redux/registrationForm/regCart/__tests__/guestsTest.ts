import { removeGuestByEventRegistrationId } from '..';
import {
  updateGuestsInRegCart,
  updateGuestDetails,
  filterErrorMessagesByRegId,
  updateGuestsToMatchPrimaryReg
} from '../guests';
import registrationForm from '../../reducer';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import getStoreForTest from 'event-widgets/utils/testUtils';
import validationErrorResponse from './fixtures/validationErrorResponse.json';
import appData from './appData.json';
import { ServiceError } from '@cvent/event-ui-networking';
import { openKnownErrorDialog } from '../../../../dialogs/KnownErrorDialog';
import { handleRegTypeConflictFromServiceValidationResult } from '../../../../dialogs/selectionConflictDialogs';
import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { AppDispatch } from '../../../reducer';
jest.mock('../../../../dialogs/selectionConflictDialogs', () => ({
  ...jest.requireActual<$TSFixMe>('../../../../dialogs/selectionConflictDialogs'),
  handleRegTypeConflictFromServiceValidationResult: jest.fn(
    jest.requireActual<$TSFixMe>('../../../../dialogs/selectionConflictDialogs')
      .handleRegTypeConflictFromServiceValidationResult
  )
}));

jest.mock('../../../../dialogs/KnownErrorDialog', () => {
  return {
    openKnownErrorDialog: jest.fn().mockImplementation(() => () => ({}))
  };
});

jest.mock('../../../visibleProducts', () => {
  return {
    populateVisibleProducts: jest.fn().mockImplementation(() => ({
      type: '[MOCK]/LOAD_VISIBLE_SESSION_PRODUCTS',
      payload: {}
    }))
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const visibleProducts = require('../../../visibleProducts');

const guestRegCart = {
  eventRegistrations: {
    primary: {
      eventRegistrationId: 'primary',
      requestedAction: 'REGISTER',
      attendeeType: 'ATTENDEE',
      attendee: { personalInformation: {} }
    },
    guest1: {
      eventRegistrationId: 'guest1',
      primaryRegistrationId: 'primary',
      requestedAction: 'REGISTER',
      displaySequence: 1,
      attendeeType: 'GUEST',
      attendee: { personalInformation: {} }
    }
  }
};

const regCartClient = {
  updateRegCart: jest.fn(() => {
    return {
      regCart: {}
    };
  })
};

const capacityClient = {
  getCapacitySummaries: jest.fn(() => ({}))
};

const apolloClient = {
  cache: {
    evict: jest.fn(() => {})
  }
};

const initialState = {
  accessToken: '',
  defaultUserSession: {
    isPlanner: false
  },
  text: {
    translate: x => x
  },
  clients: {
    regCartClient,
    capacityClient
  },
  regCartStatus: {
    lastSavedRegCart: {
      eventRegistrations: {
        primary: {
          ...guestRegCart.eventRegistrations.primary
        }
      }
    },
    registrationIntent: {}
  },
  registrationForm: {
    regCart: guestRegCart
  },
  event: {
    products: {}
  },
  experiments: {}
};

const mockReducer = (state, action) => {
  return {
    ...initialState,
    registrationForm: registrationForm(state.registrationForm, action)
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Guest tests', () => {
  test('remove a specific guest', async () => {
    const expectedRegCart = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          attendee: { personalInformation: {} }
        },
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'UNREGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          attendee: { personalInformation: {} }
        }
      }
    };
    const actualRegCart = await removeGuestByEventRegistrationId(guestRegCart, 'guest1');
    expect(expectedRegCart).toEqual(actualRegCart);
  });

  test('should evict cache to refetch session bundles when guest count is modified', async () => {
    const getMockStore = compose(applyMiddleware(thunk.withExtraArgument({ apolloClient })))(createStore);
    const mockStore = getMockStore(mockReducer, initialState);

    await (mockStore.dispatch as AppDispatch)(updateGuestsInRegCart(guestRegCart, true));
    expect(apolloClient.cache.evict).toBeCalled();
    // @ts-expect-error ts-migrate(2493) FIXME: Tuple type '[]' of length '0' has no element at in... Remove this comment to see the full error message
    expect(apolloClient.cache.evict.mock.calls[0][0]).toStrictEqual({ fieldName: 'products' });
  });

  test('state validation messages should contain error response after adding same email address for guest and invitee', async () => {
    const mockStore = getStoreForTest(mockReducer, initialState);
    const guestRegCartWithSameEmailForGuestAndInvitee = {
      eventRegistrations: {
        primary: {
          addGuestFromRelatedContacts: false,
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          autoAssignRegTypeForEventRegistration: false,
          contactNoMatchInSfCampaign: false,
          displaySequence: 1,
          attendee: {
            personalInformation: {
              contactGroups: [],
              customFields: [],
              emailAddress: 'sameaddress@j.mail',
              emailAddressDomain: 'j.mail',
              firstName: 'invitee',
              lastName: 'invitee',
              mobilePhone: '9876543211'
            }
          }
        },
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          attendee: {
            personalInformation: {
              customFields: [],
              emailAddress: 'sameaddress@j.mail',
              firstName: 'guest',
              lastName: 'guest'
            }
          }
        }
      }
    };
    regCartClient.updateRegCart = jest.fn();
    regCartClient.updateRegCart.mockReturnValue(
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'Promise<never>' is not assignabl... Remove this comment to see the full error message
      Promise.reject({
        responseBody: {
          validationMessages: [
            {
              severity: 'Error',
              unLocalizedInternalMessage:
                'Found matching invitee or guest for EventRegistration {{eventRegistrationId}}',
              localizationKey: 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION',
              parametersMap: {
                eventRegistrationId: '36ea1712-0f88-431c-bb5f-d7842f078887'
              },
              subValidationMessageList: []
            }
          ]
        }
      })
    );
    try {
      await mockStore.dispatch(updateGuestsInRegCart(guestRegCartWithSameEmailForGuestAndInvitee, true));
    } catch (error) {
      // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
      expect(mockStore.getState().registrationForm.validationMessages[0].localizationKey).toBe(
        'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION'
      );
    }
  });
});

describe('Complex guest session selection test', () => {
  test('selecting a session', async () => {
    const expectedRegCart = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          attendee: { personalInformation: {} }
        },
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'UNREGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          attendee: { personalInformation: {} }
        }
      }
    };
    const actualRegCart = await removeGuestByEventRegistrationId(guestRegCart, 'guest1');
    expect(expectedRegCart).toEqual(actualRegCart);
  });
});

describe('Auto-assign reg-type guest tests', () => {
  test('should assign regTypeId to guest when auto-assign reg-type applicable with experiment ON', async () => {
    // Arrange
    const mockReducerWithFlexAutoAssignExperimentOn = (state, action) => {
      return {
        ...initialState,
        experiments: { isFlexAutoAssignRegTypeEnabled: true },
        registrationForm: registrationForm(state.registrationForm, action)
      };
    };
    const mockStore = getStoreForTest(mockReducerWithFlexAutoAssignExperimentOn, {
      ...initialState,
      experiments: {
        isFlexAutoAssignRegTypeEnabled: true
      }
    });
    const expectedRegCartWhenAutoAssignApplicable = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          autoAssignRegTypeForEventRegistration: false
        },
        guest1: {
          eventRegistrationId: 'guest1',
          requestedAction: 'REGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          autoAssignRegTypeForEventRegistration: true,
          registrationTypeId: 'autoAssignRegTypeId'
        }
      }
    };
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: expectedRegCartWhenAutoAssignApplicable
      };
    });

    // Act
    await mockStore.dispatch(updateGuestsInRegCart(guestRegCart, true));

    // Assert
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.eventRegistrationId).toBe('guest1');
    expect(
      mockStore.getState().registrationForm.currentGuestEventRegistration.autoAssignRegTypeForEventRegistration
    ).toBe(true);
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.registrationTypeId).toBe(
      'autoAssignRegTypeId'
    );
  });

  test('should not assign regTypeId to guest when auto-assign not applicable with experiment ON', async () => {
    // Arrange
    const mockStore = getStoreForTest(mockReducer, {
      ...initialState,
      experiments: {
        isFlexAutoAssignRegTypeEnabled: true
      }
    });
    const expectedRegCartForAutoAssignNotApplicable = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          autoAssignRegTypeForEventRegistration: false
        },
        guest1: {
          eventRegistrationId: 'guest1',
          requestedAction: 'REGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          autoAssignRegTypeForEventRegistration: false,
          registrationTypeId: defaultRegistrationTypeId
        }
      }
    };
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: expectedRegCartForAutoAssignNotApplicable
      };
    });

    // Act
    await mockStore.dispatch(updateGuestsInRegCart(guestRegCart, true));

    // Assert
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.eventRegistrationId).toBe('guest1');
    expect(
      mockStore.getState().registrationForm.currentGuestEventRegistration.autoAssignRegTypeForEventRegistration
    ).toBeUndefined();
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.registrationTypeId).toBe(
      defaultRegistrationTypeId
    );
  });

  test('should not assign regTypeId to guest when auto-assign applicable with experiment disabled', async () => {
    // Arrange
    const mockStore = getStoreForTest(mockReducer, initialState);
    const expectedRegCartWhenAutoAssignApplicable = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          autoAssignRegTypeForEventRegistration: false
        },
        guest1: {
          eventRegistrationId: 'guest1',
          requestedAction: 'REGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          autoAssignRegTypeForEventRegistration: true,
          registrationTypeId: 'autoAssignRegTypeId'
        }
      }
    };
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: expectedRegCartWhenAutoAssignApplicable
      };
    });

    // Act
    await mockStore.dispatch(updateGuestsInRegCart(guestRegCart, true));

    // Assert
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.eventRegistrationId).toBe('guest1');
    expect(
      mockStore.getState().registrationForm.currentGuestEventRegistration.autoAssignRegTypeForEventRegistration
    ).toBeUndefined();
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.registrationTypeId).toBe(
      defaultRegistrationTypeId
    );
  });

  test('should not assign regTypeId to guest when auto-assign not applicable with experiment disabled', async () => {
    // Arrange
    const mockStore = getStoreForTest(mockReducer, initialState);
    const expectedRegCartForAutoAssignNotApplicable = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          autoAssignRegTypeForEventRegistration: false
        },
        guest1: {
          eventRegistrationId: 'guest1',
          requestedAction: 'REGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          autoAssignRegTypeForEventRegistration: false,
          registrationTypeId: defaultRegistrationTypeId
        }
      }
    };
    regCartClient.updateRegCart = jest.fn(() => {
      return {
        regCart: expectedRegCartForAutoAssignNotApplicable
      };
    });

    // Act
    await mockStore.dispatch(updateGuestsInRegCart(guestRegCart, true));

    // Assert
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.eventRegistrationId).toBe('guest1');
    expect(
      mockStore.getState().registrationForm.currentGuestEventRegistration.autoAssignRegTypeForEventRegistration
    ).toBeUndefined();
    expect(mockStore.getState().registrationForm.currentGuestEventRegistration.registrationTypeId).toBe(
      defaultRegistrationTypeId
    );
  });
});

describe('updateGuestDetails', () => {
  test('visible products is called for guests when admission item is updated', async () => {
    const localState = {
      ...initialState,
      appData: {
        ...appData,
        registrationSettings: {
          ...appData.registrationSettings,
          registrationPaths: {
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              ...appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40'],
              guestRegistrationSettings: {
                ...appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40']
                  .guestRegistrationSettings,
                isGuestProductSelectionEnabled: true
              }
            }
          }
        }
      },
      registrationForm: {
        ...initialState.registrationForm,
        regCart: {
          eventRegistrations: {
            primary: {
              eventRegistrationId: 'primary',
              attendeeType: 'ATTENDEE',
              registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
            },
            guest1: {
              eventRegistrationId: 'guest1',
              primaryRegistrationId: 'primary',
              requestedAction: 'REGISTER',
              attendeeType: 'GUEST',
              registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
            }
          }
        },
        currentGuestEventRegistration: {
          eventRegistrationId: 'guest1',
          productRegistrations: [
            {
              requestedAction: 'REGISTER',
              productType: 'AdmissionItem',
              productId: '262d3516-d083-46cf-9634-272957379226'
            }
          ]
        }
      }
    };
    const localMockReducer = (state, action) => {
      return {
        ...localState,
        registrationForm: registrationForm(state.registrationForm, action)
      };
    };
    const mockStore = getStoreForTest(localMockReducer, localState);
    await mockStore.dispatch(updateGuestDetails());
    expect(visibleProducts.populateVisibleProducts).toHaveBeenCalled();
  });
  test('visible products is called for guests when reg type is updated', async () => {
    const localState = {
      ...initialState,
      appData: {
        ...appData,
        registrationSettings: {
          ...appData.registrationSettings,
          registrationPaths: {
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              ...appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40'],
              guestRegistrationSettings: {
                ...appData.registrationSettings.registrationPaths['411c6566-1e5a-4c38-b8e5-f63ab9239b40']
                  .guestRegistrationSettings,
                isGuestProductSelectionEnabled: true
              }
            }
          }
        }
      },
      registrationForm: {
        ...initialState.registrationForm,
        regCart: {
          eventRegistrations: {
            primary: {
              eventRegistrationId: 'primary',
              attendeeType: 'ATTENDEE',
              registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
            },
            guest1: {
              eventRegistrationId: 'guest1',
              primaryRegistrationId: 'primary',
              requestedAction: 'REGISTER',
              attendeeType: 'GUEST',
              registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40',
              registrationTypeId: '00000000-0000-0000-0000-00000000'
            }
          }
        },
        currentGuestEventRegistration: {
          eventRegistrationId: 'guest1',
          registrationTypeId: 'regType1'
        }
      }
    };
    const localMockReducer = (state, action) => {
      return {
        ...localState,
        registrationForm: registrationForm(state.registrationForm, action)
      };
    };
    const mockStore = getStoreForTest(localMockReducer, localState);
    await mockStore.dispatch(updateGuestDetails());
    expect(visibleProducts.populateVisibleProducts).toHaveBeenCalled();
  });
  test('handles error by opening dialog with the correct message', async () => {
    const localState = {
      ...initialState,
      appData: {
        ...(initialState as $TSFixMe).appData,
        registrationSettings: {
          ...appData.registrationSettings,
          registrationPaths: {
            ...appData.registrationSettings.registrationPaths,
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              isGuestRegistrationAllowed: true
            }
          }
        }
      },
      registrationForm: {
        ...initialState.registrationForm,
        currentGuestEventRegistration: {
          eventRegistrationId: 'guest1'
        }
      }
    };
    const localMockReducer = (state, action) => {
      return {
        ...localState,
        registrationForm: registrationForm(state.registrationForm, action)
      };
    };
    const mockStore = getStoreForTest(localMockReducer, localState);
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<Promise<never>, []>' is not assignable ... Remove this comment to see the full error message
    regCartClient.updateRegCart = jest.fn(async () => {
      const request = {
        headers: {
          get: () => {}
        }
      };
      const response = {
        ...validationErrorResponse,
        text: () => JSON.stringify(validationErrorResponse)
      };
      throw await ServiceError.create('updateRegCart failed', response, request);
    });

    await mockStore.dispatch(updateGuestDetails());

    expect(openKnownErrorDialog).toHaveBeenCalledWith('AlreadyRegistered_validation__resx', null, undefined);
  });

  test('handles error by opening dialog on invalid guest email', async () => {
    const openGuestDetailsDialog = jest.fn();
    const localState = {
      ...initialState,
      appData: {
        ...(initialState as $TSFixMe).appData,
        registrationSettings: {
          ...appData.registrationSettings,
          registrationPaths: {
            ...appData.registrationSettings.registrationPaths,
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              isGuestRegistrationAllowed: true
            }
          }
        }
      },
      registrationForm: {
        ...initialState.registrationForm,
        currentGuestEventRegistration: {
          eventRegistrationId: 'guest1'
        }
      }
    };
    const localMockReducer = (state, action) => {
      return {
        ...localState,
        registrationForm: registrationForm(state.registrationForm, action)
      };
    };
    const mockStore = getStoreForTest(localMockReducer, localState);
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<Promise<never>, []>' is not assignable ... Remove this comment to see the full error message
    regCartClient.updateRegCart = jest.fn(async () => {
      const request = {
        headers: {
          get: () => {}
        }
      };
      const emailValidationErrorResponse = {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Email missing for EventRegistration {{eventRegistrationId}}.',
            localizationKey: 'REGAPI.FIELD_VALIDATION_ERROR_EMAIL_FORMAT',
            parametersMap: {},
            subValidationMessageList: []
          }
        ]
      };
      const response = {
        ...emailValidationErrorResponse,
        text: () => JSON.stringify(emailValidationErrorResponse)
      };
      throw await ServiceError.create('Invalid guest email id', response, request);
    });

    await mockStore.dispatch(updateGuestDetails(openGuestDetailsDialog));

    expect(openKnownErrorDialog).toHaveBeenCalledWith(
      'EventWidgets_Validations_EmailAddressFormat__resx',
      null,
      openGuestDetailsDialog
    );
  });

  test('handles error by opening reg type conflict dialog on guest registration type conflict of session bundles', async () => {
    const openGuestDetailsDialog = jest.fn();
    const localState = {
      ...initialState,
      website: {
        theme: {
          global: {},
          sections: {}
        }
      },
      appData: {
        ...(initialState as $TSFixMe).appData,
        registrationSettings: {
          ...appData.registrationSettings,
          registrationPaths: {
            ...appData.registrationSettings.registrationPaths,
            '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
              isGuestRegistrationAllowed: true
            }
          }
        }
      },
      registrationForm: {
        ...initialState.registrationForm,
        currentGuestEventRegistration: {
          eventRegistrationId: 'guest1'
        }
      }
    };
    const localMockReducer = (state, action) => {
      return {
        ...localState,
        registrationForm: registrationForm(state.registrationForm, action)
      };
    };
    const mockStore = getStoreForTest(localMockReducer, localState);
    // @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<Promise<never>, []>' is not assignable ... Remove this comment to see the full error message
    regCartClient.updateRegCart = jest.fn(async () => {
      const request = {
        headers: {
          get: () => {}
        }
      };
      const regCartRegTypeConflictValidationErrorResponse = {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.PRODUCT_REGTYPE_CONFLICT',
            parametersMap: {
              eventRegistrationId: 'evtRegId',
              productId: 'sessionBundleId',
              productType: 'Track',
              registrationTypeId: 'attendee'
            }
          }
        ]
      };
      const response = {
        ...regCartRegTypeConflictValidationErrorResponse,
        text: () => JSON.stringify(regCartRegTypeConflictValidationErrorResponse)
      };
      throw await ServiceError.create('Invalid guest session bundle reg type conflict', response, request);
    });
    await mockStore.dispatch(updateGuestDetails(openGuestDetailsDialog));
    expect(handleRegTypeConflictFromServiceValidationResult).toHaveBeenCalled();
  });
});

describe('filterErrorMessagesByRegId', () => {
  test("should correctly filter error's messages by event registration id", async () => {
    const error = new Error('');
    (error as $TSFixMe).responseBody = validationErrorResponse;

    const guestError = filterErrorMessagesByRegId(error, 'guest1');

    expect(guestError.responseBody.validationMessages.length).toBe(1);
    expect(guestError.responseBody.validationMessages[0]).toEqual({
      severity: 'Error',
      unLocalizedInternalMessage: 'Found matching invitee or guest for EventRegistration {{eventRegistrationId}}',
      localizationKey: 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION',
      parametersMap: {
        eventRegistrationId: 'guest1'
      },
      subValidationMessageList: []
    });
  });
  test('should not modify original error object', async () => {
    const error = new Error('');
    (error as $TSFixMe).responseBody = validationErrorResponse;

    const guestError = filterErrorMessagesByRegId(error, 'guest1');

    expect(guestError.responseBody.validationMessages.length).toBe(1);
    expect(error instanceof Error).toBeTruthy();
    expect((error as $TSFixMe).responseBody.validationMessages.length).toBe(7);
  });
});

describe('updateGuestsToMatchPrimaryReg', () => {
  it('should update reg cart with session bundles', () => {
    const state = {
      ...initialState,
      appData,
      visibleProducts,
      registrationForm: {
        ...initialState.registrationForm,
        regCart: {
          eventRegistrations: {
            primary: {
              eventRegistrationId: 'primary',
              requestedAction: 'REGISTER',
              attendeeType: 'ATTENDEE',
              attendee: { personalInformation: {} },
              sessionBundleRegistrations: {
                bundle1: {
                  productId: 'bundle1',
                  registrationSourceType: 'Selected',
                  requestedAction: 'REGISTER'
                },
                bundle2: {
                  productId: 'bundle2',
                  registrationSourceType: 'Selected',
                  requestedAction: 'UNREGISTER'
                },
                bundle3: {
                  productId: 'bundle3',
                  registrationSourceType: 'Selected',
                  requestedAction: 'REGISTER'
                }
              }
            },
            guest1: {
              eventRegistrationId: 'guest1',
              primaryRegistrationId: 'primary',
              requestedAction: 'REGISTER',
              displaySequence: 1,
              attendeeType: 'GUEST',
              attendee: { personalInformation: {} },
              sessionBundleRegistrations: {
                bundle1: {
                  productId: 'bundle1',
                  registrationSourceType: 'Selected',
                  requestedAction: 'REGISTER'
                },
                bundle4: {
                  productId: 'bundle4',
                  registrationSourceType: 'Selected',
                  requestedAction: 'REGISTER'
                }
              }
            }
          }
        }
      }
    };

    const expectedResult = {
      eventRegistrations: {
        primary: {
          eventRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          attendeeType: 'ATTENDEE',
          attendee: {
            personalInformation: {}
          },
          sessionBundleRegistrations: {
            bundle1: {
              productId: 'bundle1',
              registrationSourceType: 'Selected',
              requestedAction: 'REGISTER'
            },
            bundle2: {
              productId: 'bundle2',
              registrationSourceType: 'Selected',
              requestedAction: 'UNREGISTER'
            },
            bundle3: {
              productId: 'bundle3',
              registrationSourceType: 'Selected',
              requestedAction: 'REGISTER'
            }
          }
        },
        guest1: {
          eventRegistrationId: 'guest1',
          primaryRegistrationId: 'primary',
          requestedAction: 'REGISTER',
          displaySequence: 1,
          attendeeType: 'GUEST',
          attendee: {
            personalInformation: {}
          },
          sessionBundleRegistrations: {
            bundle1: {
              productId: 'bundle1',
              requestedAction: 'REGISTER',
              registrationSourceType: 'Selected'
            },
            bundle2: {
              productId: 'bundle2',
              registrationSourceType: 'Selected',
              requestedAction: 'UNREGISTER'
            },
            bundle3: {
              productId: 'bundle3',
              requestedAction: 'REGISTER',
              registrationSourceType: 'Selected'
            },
            bundle4: {
              productId: 'bundle4',
              registrationSourceType: 'Selected',
              requestedAction: 'UNREGISTER'
            }
          }
        }
      }
    };

    const actualResult = updateGuestsToMatchPrimaryReg(state.registrationForm.regCart, 'primary', state);
    expect(actualResult).toEqual(expectedResult);
  });
});
