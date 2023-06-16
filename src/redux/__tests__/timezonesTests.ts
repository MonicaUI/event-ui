import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { setSelectedTimeZone } from '../timeZoneSelection';
import { updateSelectedTimeZoneForPrimaryAttendee, updateTimeZonePreference } from '../timezones';

import EventSnapshot from '../../../fixtures/EventSnapshot.json';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
let store;

function InviteeSearchClient() {}

InviteeSearchClient.prototype.updateInviteeTimeZonePreference = jest.fn(() => {});

const dummyRegCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'INPROGRESS',
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      attendee: {
        personalInformation: {
          emailAddress: 'lroling-384934@j.mail'
        },
        timeZonePreference: 1,
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      confirmationNumber: '123456789',
      productRegistrations: [],
      registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
    }
  }
};

jest.mock('../timeZoneSelection');
(setSelectedTimeZone as $TSFixMe).mockImplementation(() => () => {});

function getState() {
  return {
    accessToken: '',
    clients: {
      inviteeSearchClient: new InviteeSearchClient()
    },
    website: {
      pages: {
        postRegPage1: {
          id: 'postRegPage1'
        },
        postRegPage2: {
          id: 'postRegPage2',
          rootLayoutItemIds: ['id-4']
        },
        confirmation: {
          id: 'confirmation',
          rootLayoutItemIds: ['temp-1469646842471']
        }
      },
      pluginData: {
        registrationProcessNavigation: {
          registrationPaths: {
            testRegPath: {
              pageIds: ['regProcessStep1', 'regProcessStep2'],
              id: 'todoThisShouldBeRegPathId',
              confirmationPageId: 'confirmation',
              postRegPageIds: ['confirmation'],
              registrationCancellationPageIds: ['registrationCancellationPage:bf70431d-16ee-49d2-aa19-6df2496f651c'],
              registrationDeclinePageIds: ['registrationDecline'],
              eventWaitlistPageIds: ['waitlistPage'],
              registrationPendingApprovalPageIds: ['registrationPendingApprovalPage'],
              registrationApprovalDeniedPageIds: ['registrationApprovalDeniedPage'],
              guestRegistrationPageIds: ['guestRegistrationPage:45a8c623-7f5f-487b-88c0-1fead8bdc785']
            }
          }
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          testRegPath: {
            id: 'testRegPath',
            isDefault: true,
            postRegPageIds: ['confirmation'],
            guestRegistrationSettings: {
              isGuestRegistrationEnabled: true
            }
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
      capacityId: 'event_capacity',
      eventLocalesSetup: {
        eventLocales: [
          {
            localeId: 1033,
            languageName: 'English',
            cultureCode: 'en-US'
          },
          {
            localeId: 1031,
            languageName: 'Deutsch',
            cultureCode: 'de-DE'
          }
        ]
      }
    },
    pathInfo: {
      currentPageId: 'confirmation'
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
    registrationForm: {
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart: {
        ...dummyRegCart
      },
      errors: {}
    },
    text: {
      translate: text => {
        return text;
      }
    }
  };
}

test('update the selected Time Zone', async () => {
  store = mockStore(getState());
  await store.dispatch(updateSelectedTimeZoneForPrimaryAttendee(dummyRegCart, '00000000-0000-0000-0000-000000000001'));
  expect(setSelectedTimeZone).toHaveBeenCalled();
});

test('update the time zone preference and call inviteeSearchClient if it is post reg Page', async () => {
  store = mockStore(getState());
  const inviteeSearchClient = store.getState().clients.inviteeSearchClient;
  const timeZonePreference = {
    id: 1,
    name: 'Samoa Time',
    nameResourceKey: 'Event_Timezone_Name_1__resx',
    plannerDisplayName: '(GMT-11:00) Samoa',
    abbreviation: 'ST',
    abbreviationResourceKey: 'Event_Timezone_Abbr_1__resx',
    dstInfo: [{}],
    value: 1001,
    hasDst: true,
    utcOffset: -660
  };
  await store.dispatch(updateTimeZonePreference(timeZonePreference));
  expect(inviteeSearchClient.updateInviteeTimeZonePreference).toHaveBeenCalled();
});
