import { openGroupFlightAttendeeSelectionDialog } from '../GroupFlight/GroupFlight';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import appData from '../../../redux/registrationForm/regCart/__tests__/appData.json';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const eventRegistrationId = '00000000-0000-0000-0000-000000000001';
const groupFlightId = '90b23b7c-7297-490b-82af-61c41b5e809f';
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store;

function getState() {
  return {
    regCartStatus: {
      lastSavedRegCart: {
        regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
        status: 'INPROGRESS',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
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
          },
          '00000000-0000-0000-0000-000000000002': {
            attendee: {
              personalInformation: {
                lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
                customFields: {}
              },
              eventAnswers: {}
            },
            eventRegistrationId: '00000000-0000-0000-0000-000000000002',
            attendeeType: 'GUEST',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
            productRegistrations: [
              {
                productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
                productType: 'AdmissionItem',
                quantity: 1,
                requestedAction: 'REGISTER'
              }
            ],
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            requestedAction: 'REGISTER',
            sessionRegistrations: {}
          }
        }
      }
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
      regCart: {
        regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
        status: 'INPROGRESS',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
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
          },
          '00000000-0000-0000-0000-000000000002': {
            attendee: {
              personalInformation: {
                lastName: 'Registration_RegistrationSummary_GuestPlaceholderName__resx',
                customFields: {}
              },
              eventAnswers: {}
            },
            attendeeType: 'GUEST',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
            productRegistrations: [
              {
                productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
                productType: 'AdmissionItem',
                quantity: 1,
                requestedAction: 'REGISTER'
              }
            ],
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            requestedAction: 'REGISTER',
            sessionRegistrations: {}
          },
          '00000000-0000-0000-0000-000000000003': {
            attendee: {
              personalInformation: {
                lastName: 'Guest2',
                customFields: {}
              },
              eventAnswers: {}
            },
            attendeeType: 'GUEST',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
            productRegistrations: [
              {
                productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
                productType: 'AdmissionItem',
                quantity: 1,
                requestedAction: 'REGISTER'
              }
            ],
            registrationTypeId: '00000000-0000-0000-0000-000000000000',
            requestedAction: 'REGISTER',
            sessionRegistrations: {}
          }
        }
      }
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
    text: {
      resolver: {
        date: () => 'some date ',
        currency: x => x
      },
      translate: x => x,
      translateDate: (value, format) => {
        if (format === 'date') {
          return value.toUTCString().split(' ').slice(0, 4).join(' ');
        }
        return value.toUTCString();
      },
      translateTime: value => {
        return value.toISOString().slice(11, 16);
      }
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
    registrantLogin: { form: { emailAddress: '', confirmationNumber: '' } },
    pathInfo: { currentPageId: 'regProcessStep2' },
    visibleProducts: {}
  };
}

const passengerDialogData = {
  '00000000-0000-0000-0000-000000000001': {
    isSelected: true,
    isDisabled: false,
    registeredForProductInGroup: false
  },
  '00000000-0000-0000-0000-000000000002': {
    isSelected: false,
    isDisabled: false,
    registeredForProductInGroup: false
  }
};

describe('GuestProductSelectionDialog render tests', () => {
  test('renders list of attendees when opened', async () => {
    store = mockStore(getState());
    // const openGuestProductSelectionDialog = jest.fn();
    const applyGuestGroupFlightSelection = jest.fn();

    await store.dispatch(
      openGroupFlightAttendeeSelectionDialog(
        eventRegistrationId,
        groupFlightId,
        applyGuestGroupFlightSelection,
        passengerDialogData,
        'outbound'
      )
    );
    expect(store.getActions()).toMatchSnapshot();
  });
});
