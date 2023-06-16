import {
  finalizePostRegistrationPayment,
  startPostRegistrationPaymentPage,
  continuePostRegistrationPaymentAfterServiceFeesConfirmation
} from '..';
import AttendeeOrderClient from '../../../clients/AttendeeOrderClient';
import RegCartClient from '../../../clients/RegCartClient';
import EventGuestClient from '../../../clients/EventGuestClient';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import appData from '../../registrationForm/regCart/__tests__/appData.json';
import { CHECKED_OUT } from '../../registrationIntents';

jest.mock('../../../utils/confirmationUtil', () => ({
  getConfirmationPageIdForInvitee: () => () => Promise.resolve('confirmation')
}));

function getState() {
  return {
    accessToken: 'BEARER 123',
    account: {},
    clients: {
      attendeeOrderClient: new AttendeeOrderClient(),
      regCartClient: new RegCartClient(),
      eventGuestClient: { logout: () => {} },
      productVisibilityClient: { getVisibleProducts: () => {}, getRegCartVisibleProducts: () => {} }
    },
    event: {
      eventFeatureSetup: {
        fees: {
          fees: true
        },
        registrationProcess: {
          multipleRegistrationTypes: true
        },
        agendaItems: {
          admissionItems: true
        }
      },
      registrationTypes: EventSnapshot.eventSnapshot.registrationTypes,
      products: EventSnapshot.eventSnapshot.products,
      id: EventSnapshot.eventSnapshot.id,
      capacityId: 'event_capacity'
    },
    registrationForm: {
      currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart: {
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
            confirmationNumber: '123456789',
            productRegistrations: [],
            registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
          }
        }
      },
      errors: {}
    },
    travelCart: {
      cart: {
        bookings: []
      },
      isCartCreated: false,
      userSession: {
        travelAnswers: {}
      }
    },
    testSettings: { registrationCheckoutTimeout: '2' },
    regCartPricing: {
      netFeeAmountCharge: 98,
      netFeeAmountChargeWithPaymentAmountServiceFee: 98
    },
    userSession: {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
    },
    defaultUserSession: {
      httpReferrer: 'http://cvent.com',
      isPlanner: false,
      isTestMode: false
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    appData,
    text: {
      translate: text => {
        return text;
      }
    },
    registrantLogin: { form: { emailAddress: '', confirmationNumber: '' } },
    pathInfo: {
      currentPageId: 'regProcessStep2',
      rootPath: 'xet'
    },
    postRegistrationPaymentData: {
      webPaymentData: {
        contextId: '123',
        cardType: 'Visa'
      }
    },
    visibleProducts: {},
    orders: [
      {
        orderId: 'fcf5d93f-e0e9-4b4a-af36-4c6bb3ff15c7',
        attendeeId: 'fbe827fd-9cc7-4a6f-a3d9-26ab948f4020',
        groupMemberTitle: 'Member',
        submittedOn: '2020-01-02T13:23:56.000Z',
        orderType: 'OfflineCharge',
        orderItems: [
          {
            itemId: '7baadcd6-fbbe-4c82-ab14-af73615fb516',
            registrantId: '352184f5-9e34-467e-88e5-1c9e9a33bdbf',
            firstName: 'express',
            lastName: 'ticketing',
            productType: 'AdmissionItem',
            itemPrice: 10.0,
            itemName: 'A1',
            quantity: 1,
            amount: 10.0,
            amountPaid: 0.0,
            amountDue: 10.0
          },
          {
            itemId: '8baadcd6-fbbe-4c82-ab14-af73615fb516',
            registrantId: '352184f5-9e34-467e-88e5-1c9e9a33bdbf',
            firstName: 'express',
            lastName: 'ticketing',
            productType: 'AdmissionItem',
            itemPrice: 10.0,
            itemName: 'A1',
            quantity: 1,
            amount: 15.0,
            amountPaid: 0.0,
            amountDue: 12.0
          },
          {
            itemId: '9baadcd6-fbbe-4c82-ab14-af73615fb516',
            registrantId: '352184f5-9e34-467e-88e5-1c9e9a33bdbf',
            firstName: 'express',
            lastName: 'ticketing',
            productType: 'Tax',
            itemPrice: 10.0,
            itemName: 'A1',
            quantity: 1,
            amount: 12,
            amountPaid: 0.0,
            amountDue: 2
          }
        ]
      }
    ]
  };
}

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const response = {
  // mock response with getters to always use fresh copy
  get regCart() {
    return {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
      status: 'INPROGRESS',
      eventSnapshotVersions: {
        [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
      },
      eventRegistrations: {
        '00000000-0000-0000-0000-000000000001': {
          eventRegistrationId: '00000000-0000-0000-0000-000000000001',
          eventId: '123',
          attendee: {
            personalInformation: {
              contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
              firstName: 'Luke',
              lastName: 'Roling',
              emailAddress: 'lroling-384934@j.mail',
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
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      }
    };
  }
};

const pricingInfoNew = {
  get regCartPricing() {
    return {
      pricing: {
        netFeeAmountRefund: 0,
        netFeeAmountChargeWithPaymentAmountServiceFee: 260,
        paymentTypeServiceFeePricingCharges: {
          '99437532-36c2-4b2e-802c-7f65585465b6': {
            primaryRegToOrderDetailIds: {
              'beb8b011-861b-4c49-bca7-528a8d52ddea': 'bdd54850-dcae-4ae7-ad1e-41d0ef46185b'
            },
            appliedOrder: 2,
            id: '99437532-36c2-4b2e-802c-7f65585465b6',
            feeApplyType: 1,
            totalPaymentTypeServiceFeeAmount: 20,
            inviteeBreakdowns: [
              {
                amount: 20,
                attendeeType: 'ATTENDEE',
                attendeeId: '4195ba99-ef03-4458-959e-4bca2b951298',
                eventRegistrationId: 'beb8b011-861b-4c49-bca7-528a8d52ddea',
                orderDetailTaxFeeId: null
              }
            ]
          }
        },
        regCartId: '02c0142f-2985-4830-8009-4aa1ceed666d'
      }
    };
  }
};

const registration = {
  get registrationProcess() {
    return {
      registrationProcess: {
        multipleRegistrationTypes: true
      }
    };
  }
};

// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{}, []>' is not assignable to type '(ev... Remove this comment to see the full error message
AttendeeOrderClient.prototype.getAttendeeOrders = jest.fn(() => ({}));
(RegCartClient.prototype as $TSFixMe).authorizeByConfirm = jest.fn(() => ({ accessToken: 'fake-post-reg-token' }));
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ regCartId: string; status: string; ev... Remove this comment to see the full error message
RegCartClient.prototype.getRegCart = jest.fn(() => response.regCart);
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ pricing: { netFeeAmountRefund: number... Remove this comment to see the full error message
RegCartClient.prototype.getRegCartPricing = jest.fn(() => pricingInfoNew.regCartPricing);
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ regCartId: string; status: string; ev... Remove this comment to see the full error message
RegCartClient.prototype.acknowledgeRegCartStatus = jest.fn(() => response.regCart);
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ regCartId: string; status: string; ev... Remove this comment to see the full error message
RegCartClient.prototype.startRegCartCheckout = jest.fn(() => response.regCart);
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ registrationProcess: { multipleRegist... Remove this comment to see the full error message
EventGuestClient.prototype.getRegistrationContent = jest.fn(() => registration.registrationProcess);
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ regCart: { regCartId: string; }; }, [... Remove this comment to see the full error message
RegCartClient.prototype.startPaymentCartCheckout = jest.fn(() => ({
  regCart: {
    regCartId: '123'
  }
}));
// @ts-expect-error ts-migrate(2322) FIXME: Type 'Mock<{ registrationIntent: string; checkoutP... Remove this comment to see the full error message
RegCartClient.prototype.waitForRegCartCheckoutCompletion = jest.fn(() => ({
  registrationIntent: CHECKED_OUT,
  checkoutProgress: 100,
  lastSavedRegCart: {
    ...response.regCart,
    status: 'COMPLETED'
  }
}));

let attendeeOrderClient;
let regCartClient;
let store;
beforeEach(() => {
  jest.clearAllMocks(); // clear counters in jest mock functions
  store = mockStore(getState());
  attendeeOrderClient = store.getState().clients.attendeeOrderClient;
  regCartClient = store.getState().clients.regCartClient;
});

test('creates an paymentCart', async () => {
  await store.dispatch(startPostRegistrationPaymentPage());
  expect(attendeeOrderClient.getAttendeeOrders).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('finalizes payment cart', async () => {
  const webPaymentData = {
    contextId: '123',
    cardType: 'Visa'
  };
  await store.dispatch(finalizePostRegistrationPayment(webPaymentData));
  expect(regCartClient.startPaymentCartCheckout).toHaveBeenCalledTimes(1);
  expect(regCartClient.waitForRegCartCheckoutCompletion).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('finalize post reg payment confirmation', async () => {
  await store.dispatch(continuePostRegistrationPaymentAfterServiceFeesConfirmation());
  expect(regCartClient.acknowledgeRegCartStatus).toHaveBeenCalledTimes(1);
  expect(regCartClient.startRegCartCheckout).toHaveBeenCalledTimes(1);
});

test('Does not attempt to create a post reg payment cart if there is no event registration id in state.', async () => {
  store = mockStore({
    ...getState(),
    registrationForm: {
      ...getState().registrationForm,
      currentEventRegistrationId: null
    }
  });
  await store.dispatch(startPostRegistrationPaymentPage());
  expect(attendeeOrderClient.getAttendeeOrders).not.toHaveBeenCalled();
});
