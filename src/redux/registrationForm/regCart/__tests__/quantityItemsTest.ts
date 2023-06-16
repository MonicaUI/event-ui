/* eslint-env jest */
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { REGISTERING } from '../../../registrationIntents';
import { updateQuantity, updateLocalQuantity } from '../quantityItems';
import { updateIn } from 'icepick';
import { hasQuantityItemCapacityWarning } from '../../warnings';
import { openCapacityReachedDialog } from '../../../../dialogs/CapacityReachedDialog';
// eslint-disable-next-line jest/no-mocks-import
import { RegCartClient } from '../../../../widgets/PaymentWidget/__mocks__/regCartClient';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const errors = require('../../errors');
errors.getUpdateErrors.isProductAvailabilityError = jest.fn();

jest.mock('../../warnings');
jest.mock('../../../../dialogs/CapacityReachedDialog', () => {
  const fn = jest.fn();
  return {
    openCapacityReachedDialog: () => fn
  };
});
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pageContents = require('../../../website/pageContents');
pageContents.quantityItemAppearOnSamePageAsPayment = jest.fn(() => false);

let mockUseGraphQLSiteEditorData = false;
jest.mock('../../../../ExperimentHelper', () => ({
  ...jest.requireActual<$TSFixMe>('../../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));

jest.mock('../../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            quantityItems: {
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const partialUpdates = require('../partialUpdates');
const middlewares = [thunk.withExtraArgument({ apolloClient: {} })];
const mockStore = configureMockStore(middlewares);
const eventId = EventSnapshot.eventSnapshot.id;
const accessToken = '';
const selectedQuantityItemId = 'quantityItemId';

const response = {
  // mock response with getters to always use fresh copy
  get regCart() {
    return {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
      status: 'INPROGRESS',
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          attendee: {
            personalInformation: {
              emailAddress: 'lroling-384934@j.mail'
            },
            attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
          },
          productRegistrations: [
            {
              productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      }
    };
  }
};

function getState() {
  return {
    accessToken,
    clients: {
      regCartClient: new RegCartClient()
    },
    pathInfo: {
      currentPageId: ''
    },
    registrationForm: {
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart: {
        regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
        status: 'INPROGRESS',
        eventSnapshotVersions: {
          [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
        },
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            eventId,
            attendee: {
              personalInformation: {
                contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
                emailAddress: 'lroling-384934@j.mail',
                firstName: 'Luke',
                lastName: 'Roling',
                primaryAddressType: 'WORK'
              },
              attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
            },
            attendeeType: 'ATTENDEE',
            productRegistrations: [
              {
                productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
                productType: 'AdmissionItem',
                quantity: 1,
                requestedAction: 'REGISTER'
              }
            ],
            sessionRegistrations: {},
            donationItemRegistrations: {
              donationItem2: {
                productId: 'donationItem2',
                amount: '7'
              }
            },
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
          }
        }
      },
      errors: {}
    },
    regCartStatus: {
      registrationIntent: REGISTERING
    },
    appData: {
      registrationPathSettings: {
        '411c6566-1e5a-4c38-b8e5-f63ab9239b40': {
          paymentSettings: {
            creditCard: {
              enabled: false,
              label: 'EventWidgets_Payment_CreditCard_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false,
              securityCodeRequired: true
            },
            check: {
              enabled: true,
              label: 'EventWidgets_Payment_Check_DefaultText__resx',
              instructionalText: '',
              displayAdditionalDetails: false,
              additionalDetails: {
                label: 'EventWidgets_Payment_Check_AdditionalDetailsDefaultText__resx',
                makeRequired: false
              },
              autoMarkPaidInFull: false
            },
            offline: {
              optionOne: {
                enabled: true,
                label: 'EventWidgets_Payment_OfflineOptionOne_DefaultText__resx',
                instructionalText: '',
                displayAdditionalDetails: false,
                additionalDetails: {
                  label: 'EventWidgets_Payment_Offline_AdditionalDetailsDefaultText__resx',
                  makeRequired: false
                },
                autoMarkPaidInFull: false
              }
            }
          }
        }
      }
    },
    event: {
      products: {
        quantityItems: {
          quantityItemId: {
            id: 'quantityItemId',
            capacityId: 'quantityItemId'
          }
        }
      },
      eventFeatureSetup: {
        fees: {
          fees: false
        }
      }
    },
    text: {
      translate: text => {
        return text;
      }
    },
    userSession: {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
    },
    defaultUserSession: {},
    experiments: {}
  };
}
const dummyCapacitySummaries = {
  quantityItemId: {
    capacityId: 'quantityItemId',
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  }
};
(RegCartClient.prototype as $TSFixMe).getCapacitySummaries = jest.fn(() => {
  return dummyCapacitySummaries;
});
(RegCartClient.prototype as $TSFixMe).updateRegCartQuantityItemRegistrations = jest.fn(() => response.regCart);

describe.each([
  ['GraphQL', true],
  ['Redux', false]
])('Quantity items using %s site editor data', (description, experimentStatus) => {
  // fresh references in each test cases
  let store;
  let regCartClient;
  beforeEach(() => {
    jest.clearAllMocks(); // clear counters in jest mock functions
    store = mockStore(getState());
    regCartClient = store.getState().clients.regCartClient;
    mockUseGraphQLSiteEditorData = experimentStatus;
  });

  test('updates a regCart with quantity item', async () => {
    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        quantityItemRegistrations: [
          {
            productId: selectedQuantityItemId,
            quantity: 3
          }
        ]
      };
    });
    const quantityItemId = 'quantityItemId';
    const quantity = 3;
    regCartClient.updateRegCartQuantityItemRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    regCartClient.calculateRegCartPricing = jest.fn(() => Object.assign({ regCartPricing: {} }));
    partialUpdates.getAttendeeFieldValues = jest.fn(() => {
      return {
        personalInformation: {
          contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
          firstName: 'test',
          lastName: 'test',
          emailAddress: 'lroling-384934@j.mail',
          primaryAddressType: 'WORK'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      };
    });
    await store.dispatch(updateQuantity(eventRegistrationId, quantityItemId, quantity));
    expect(regCartClient.updateRegCartQuantityItemRegistrations).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });

  test('capacity reached modal showed when trying to get update more quantity that is available', async () => {
    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const quantityItemId = 'quantityItemId';
    const quantity = 3;
    regCartClient.updateRegCartQuantityItemRegistrations = jest.fn(() => Object.assign({ regCart: response.regCart }));

    regCartClient.calculateRegCartPricing = jest.fn(() => Object.assign({ regCartPricing: {} }));
    (hasQuantityItemCapacityWarning as $TSFixMe).mockImplementation(() => {
      return true;
    });

    await store.dispatch(updateQuantity(eventRegistrationId, quantityItemId, quantity));
    expect(regCartClient.updateRegCartQuantityItemRegistrations).toHaveBeenCalledTimes(1);
    expect(openCapacityReachedDialog()).toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });

  test('updates the local regCart in the state with quantity item', async () => {
    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const quantityItemId = 'quantityItemId';
    const quantity = 3;

    await store.dispatch(updateLocalQuantity(eventRegistrationId, quantityItemId, quantity));
    expect(regCartClient.updateRegCartQuantityItemRegistrations).not.toHaveBeenCalled();
    expect(store.getActions()).toMatchSnapshot();
  });

  test('product is unavailable error when trying to get update more quantity', async () => {
    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const quantityItemId = 'quantityItemId';
    const quantity = 3;
    regCartClient.updateRegCartQuantityItemRegistrations = jest.fn(() => {
      throw new Error();
    });
    try {
      await store.dispatch(updateQuantity(eventRegistrationId, quantityItemId, quantity));
    } catch (error) {
      errors.getUpdateErrors.isProductAvailabilityError.mockImplementation(() => {
        return true;
      });
      // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
      expect(store.getActions()).toMatchSnapshot();
    }
  });

  test('calculate pricing is called if quantity items widget is on same page as payment widget', async () => {
    pageContents.quantityItemAppearOnSamePageAsPayment = jest.fn(() => true);
    const eventRegistrationId = Object.keys(response.regCart.eventRegistrations)[0];
    const updatedRegCart = updateIn(response.regCart, ['eventRegistrations', eventRegistrationId], eventReg => {
      return {
        ...eventReg,
        attendee: {
          ...eventReg.attendee,
          personalInformation: {
            ...eventReg.attendee.personalInformation,
            firstName: 'test',
            lastName: 'test'
          }
        },
        quantityItemRegistrations: [
          {
            productId: selectedQuantityItemId,
            quantity: 3
          }
        ]
      };
    });
    const quantityItemId = 'quantityItemId';
    const quantity = 3;
    regCartClient.updateRegCartQuantityItemRegistrations = jest.fn(() => Object.assign({ regCart: updatedRegCart }));
    regCartClient.calculateRegCartPricing = jest.fn(() => Object.assign({ regCartPricing: {} }));
    partialUpdates.getAttendeeFieldValues = jest.fn(() => {
      return {
        personalInformation: {
          contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
          firstName: 'test',
          lastName: 'test',
          emailAddress: 'lroling-384934@j.mail',
          primaryAddressType: 'WORK'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      };
    });
    await store.dispatch(updateQuantity(eventRegistrationId, quantityItemId, quantity));
    expect(regCartClient.updateRegCartQuantityItemRegistrations).toHaveBeenCalledTimes(1);
    expect(store.getActions()).toMatchSnapshot();
  });
});
