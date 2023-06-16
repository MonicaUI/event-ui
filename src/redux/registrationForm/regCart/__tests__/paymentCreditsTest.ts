/* eslint-env jest */
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import { REGISTERING } from '../../../registrationIntents';
import { updatePaymentCreditsInRegCart } from '../paymentCredits';
import { getUpdateErrors } from '../../errors';
import reducer from '../reducer';
import getStoreForTest from 'event-widgets/utils/testUtils';

const eventId = EventSnapshot.eventSnapshot.id;
const accessToken = '';
const UPDATED_CREDITS = 90;
const PAYMENT_CREDITS = 100;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const errors = require('../../errors');
errors.getUpdateErrors.handleAuthError = jest.fn();

function RegCartClient() {}

const response = {
  // mock response with getters to always use fresh copy
  get regCart() {
    return {
      regCartId: 'reg-cart-id',
      status: 'INPROGRESS',
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          attendee: {
            availablePaymentCredits: UPDATED_CREDITS, // reduced number of credits
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

const mockReducer = (state, action) => {
  return {
    accessToken: state.accessToken,
    clients: state.clients,
    registrationForm: {
      ...state.registrationForm,
      regCart: reducer(state.regCart, action)
    },
    regCartStatus: state.regCartStatus,
    event: state.event,
    userSession: state.userSession,
    defaultUserSession: state.defaultUserSession
  };
};

function getState() {
  return {
    accessToken,
    clients: {
      regCartClient: new RegCartClient()
    },
    registrationForm: {
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart: {
        regCartId: 'reg-cart-id',
        status: 'INPROGRESS',
        eventSnapshotVersions: {
          [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
        },
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            eventId,
            attendee: {
              availablePaymentCredits: PAYMENT_CREDITS,
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
    event: {
      products: {
        quantityItems: {
          quantityItemId: {
            id: 'quantityItemId',
            capacityId: 'quantityItemId'
          }
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
    }
  };
}

RegCartClient.prototype.updatePaymentCreditsInRegCart = jest.fn(() => response.regCart);

let store;
let regCartClient;
beforeEach(() => {
  jest.clearAllMocks(); // clear counters in jest mock functions
  store = getStoreForTest(mockReducer, getState());
  regCartClient = store.getState().clients.regCartClient;
});

test('updates payment credits in regCart', async () => {
  regCartClient.updatePaymentCreditsInRegCart = jest.fn(() => response.regCart);

  await store.dispatch(updatePaymentCreditsInRegCart());
  expect(regCartClient.updatePaymentCreditsInRegCart).toHaveBeenCalledTimes(1);
  const updatedRegCart = store.getState().registrationForm.regCart;

  // credits should be updated in state for every registration
  expect(
    Object.values(updatedRegCart.eventRegistrations).every(er => {
      return (er as $TSFixMe).attendee.availablePaymentCredits === UPDATED_CREDITS;
    })
  ).toBeTruthy();
});

test('handle error while updating payment credits in reg cart', async () => {
  regCartClient.updatePaymentCreditsInRegCart = jest.fn(() => {
    throw new Error();
  });

  (getUpdateErrors.handleAuthError as $TSFixMe).mockImplementation(() => {
    return false;
  });
  try {
    await store.dispatch(updatePaymentCreditsInRegCart());
  } catch (error) {
    const regCart = store.getState().registrationForm.regCart;

    // credits should not be updated in state for every registration
    // eslint-disable-next-line jest/no-conditional-expect,jest/no-try-expect
    expect(
      Object.values(regCart.eventRegistrations).every(er => {
        return (er as $TSFixMe).attendee.availablePaymentCredits === PAYMENT_CREDITS;
      })
    ).toBeTruthy();
  }
});
