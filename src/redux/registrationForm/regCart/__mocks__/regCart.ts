import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import appData from '../__tests__/appData.json';
import { CHECKED_OUT } from '../../../registrationIntents';

export function RegCartClient(): $TSFixMe {}
export function TravelApiClient(): $TSFixMe {}
export function EventGuestClient(): $TSFixMe {}

const accessToken = 'BEARER TOKEN';
const eventId = EventSnapshot.eventSnapshot.id;

export const response = {
  // mock response with getters to always use fresh copy
  get regCart(): $TSFixMe {
    return {
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
  },
  get regCartPricing(): $TSFixMe {
    return {
      regCartPricing: {
        netFeeAmountCharge: 98,
        netFeeAmountRefund: 0,
        productFeeAmountCharge: 98,
        productFeeAmountRefund: 0,
        productSubTotalAmountCharge: 98,
        productSubTotalAmountRefund: 0,
        regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
      }
    };
  },
  get products(): $TSFixMe {
    return {
      ...EventSnapshot.eventSnapshot.products,
      admissionItems: {
        ...EventSnapshot.eventSnapshot.products.admissionItems,
        '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c': {
          limitOptionalItemsToSelect: false,
          isOpenForRegistration: true,
          limitGuestsByContactType: false,
          includeWaitlistSessionsTowardsMaxiumumLimit: false,
          applicableContactTypes: ['00000000-0000-0000-0000-000000000000', '4e271dd1-8e5c-4a95-95f5-da6897d64e5d'],
          limitOptionalSessionsToSelect: false,
          includedOptionalSessions: [],
          applicableOptionalItems: [],
          minimumNumberOfSessionsToSelect: 0,
          applicableOptionalSessions: [],
          capacityByGuestContactTypes: [],
          displayOrder: 0,
          code: '',
          description: '',
          id: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
          capacityId: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
          name: 'New Admission Item',
          status: 2,
          defaultFeeId: '00000000-0000-0000-0000-000000000000'
        },
        'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d': {
          limitOptionalItemsToSelect: false,
          isOpenForRegistration: true,
          limitGuestsByContactType: false,
          includeWaitlistSessionsTowardsMaxiumumLimit: false,
          applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
          limitOptionalSessionsToSelect: false,
          associatedOptionalSessions: ['a550c1a7-ed00-5e55-1045-500000000000'],
          applicableOptionalItems: [],
          minimumNumberOfSessionsToSelect: 0,
          applicableOptionalSessions: [],
          capacityByGuestContactTypes: [],
          displayOrder: 0,
          code: '',
          description: '',
          id: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
          capacityId: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
          name: 'Admission Item with Associated Session',
          status: 2,
          defaultFeeId: '00000000-0000-0000-0000-000000000000'
        }
      },
      sessionContainer: {
        sessionGroups: {
          sessionGroupAId: {
            id: 'sessionGroupAId',
            isOpenForRegistration: true,
            sessions: {
              sessionDId: {
                id: 'sessionDId',
                capacityId: 'sessionDId',
                isOpenForRegistration: true
              },
              sessionEId: {
                id: 'sessionEId',
                capacityId: 'sessionEId',
                isOpenForRegistration: true
              },
              sessionFId: {
                id: 'sessionFId',
                capacityId: 'sessionFId',
                isOpenForRegistration: true
              },
              sessionGId: {
                id: 'sessionGId',
                capacityId: 'sessionGId',
                isOpenForRegistration: true
              }
            }
          }
        },
        optionalSessions: {
          'a550c1a7-ed00-5e55-1045-500000000000': {
            associatedRegistrationTypes: [],
            associatedWithAdmissionItems: ['a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d'],
            availableToAdmissionItems: [],
            capacityId: 'a550c1a7-ed00-5e55-1045-500000000000',
            categoryId: '00000000-0000-0000-0000-000000000000',
            code: '',
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            description: '',
            endTime: '2017-09-10T23:00:00.000Z',
            fees: {},
            id: 'a550c1a7-ed00-5e55-1045-500000000000',
            isIncludedSession: false,
            isOpenForRegistration: true,
            name: 'Associated Session',
            registeredCount: 1,
            sessionCustomFieldValues: {},
            startTime: '2017-09-10T22:00:00.000Z',
            status: 2,
            type: 'Session'
          }
        }
      }
    };
  },
  get registrationTypes(): $TSFixMe {
    return {
      '00000000-0000-0000-0000-000000000000': {
        id: '00000000-0000-0000-0000-000000000000',
        name: '',
        availableSessions: []
      },
      '90def55d-3f9d-4726-b32d-871cf7b550db': {
        id: '90def55d-3f9d-4726-b32d-871cf7b550db',
        name: 'Reg Type 1',
        availableSessions: []
      },
      '4e271dd1-8e5c-4a95-95f5-da6897d64e5d': {
        id: '4e271dd1-8e5c-4a95-95f5-da6897d64e5d',
        name: 'Reg Type 2',
        availableSessions: []
      }
    };
  },
  get visibleProducts(): $TSFixMe {
    return {
      Sessions: {
        '00000000-0000-0000-0000-000000000001': {
          admissionItems: {
            '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['00000000-0000-0000-0000-000000000000', '4e271dd1-8e5c-4a95-95f5-da6897d64e5d'],
              limitOptionalSessionsToSelect: false,
              includedOptionalSessions: [],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
              capacityId: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
              name: 'New Admission Item',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            },
            'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
              limitOptionalSessionsToSelect: false,
              associatedOptionalSessions: ['a550c1a7-ed00-5e55-1045-500000000000'],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
              capacityId: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
              name: 'Admission Item with Associated Session',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            },
            'c0215717-5640-4e9d-b790-36047f14bf21': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: [],
              limitOptionalSessionsToSelect: false,
              includedOptionalSessions: [],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'c0215717-5640-4e9d-b790-36047f14bf21',
              capacityId: 'c0215717-5640-4e9d-b790-36047f14bf21',
              name: 'Event Registration',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            }
          },
          sessionProducts: {
            'a550c1a7-ed00-5e55-1045-500000000000': {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: ['a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d'],
              availableToAdmissionItems: [],
              capacityId: 'a550c1a7-ed00-5e55-1045-500000000000',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: '',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              endTime: '2017-09-10T23:00:00.000Z',
              fees: {},
              id: 'a550c1a7-ed00-5e55-1045-500000000000',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Associated Session',
              registeredCount: 1,
              sessionCustomFieldValues: {},
              startTime: '2017-09-10T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            sessionGroupAId: {
              id: 'sessionGroupAId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  capacityId: 'sessionDId',
                  isOpenForRegistration: true
                },
                sessionEId: {
                  id: 'sessionEId',
                  capacityId: 'sessionEId',
                  isOpenForRegistration: true
                },
                sessionFId: {
                  id: 'sessionFId',
                  capacityId: 'sessionFId',
                  isOpenForRegistration: true
                },
                sessionGId: {
                  id: 'sessionGId',
                  capacityId: 'sessionGId',
                  isOpenForRegistration: true
                }
              }
            }
          },
          sortKeys: {
            'a550c1a7-ed00-5e55-1045-500000000000': ['2017-09-10T22:00:00.000Z'],
            sessionGroupAId: ['2017-09-10T22:00:00.000Z']
          }
        },
        '01': {
          admissionItems: {
            '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['00000000-0000-0000-0000-000000000000', '4e271dd1-8e5c-4a95-95f5-da6897d64e5d'],
              limitOptionalSessionsToSelect: false,
              includedOptionalSessions: [],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
              capacityId: '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c',
              name: 'New Admission Item',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            },
            'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
              limitOptionalSessionsToSelect: false,
              associatedOptionalSessions: ['a550c1a7-ed00-5e55-1045-500000000000'],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
              capacityId: 'a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d',
              name: 'Admission Item with Associated Session',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            },
            'c0215717-5640-4e9d-b790-36047f14bf21': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: [],
              limitOptionalSessionsToSelect: false,
              includedOptionalSessions: [],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'c0215717-5640-4e9d-b790-36047f14bf21',
              capacityId: 'c0215717-5640-4e9d-b790-36047f14bf21',
              name: 'Event Registration',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            }
          },
          sessionProducts: {
            'a550c1a7-ed00-5e55-1045-500000000000': {
              associatedRegistrationTypes: [],
              associatedWithAdmissionItems: ['a550c1a7-ed0c-4a3a-8d1c-92f0f961b86d'],
              availableToAdmissionItems: [],
              capacityId: 'a550c1a7-ed00-5e55-1045-500000000000',
              categoryId: '00000000-0000-0000-0000-000000000000',
              code: '',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              description: '',
              endTime: '2017-09-10T23:00:00.000Z',
              fees: {},
              id: 'a550c1a7-ed00-5e55-1045-500000000000',
              isIncludedSession: false,
              isOpenForRegistration: true,
              name: 'Associated Session',
              registeredCount: 1,
              sessionCustomFieldValues: {},
              startTime: '2017-09-10T22:00:00.000Z',
              status: 2,
              type: 'Session'
            },
            sessionGroupAId: {
              id: 'sessionGroupAId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  capacityId: 'sessionDId',
                  isOpenForRegistration: true
                },
                sessionEId: {
                  id: 'sessionEId',
                  capacityId: 'sessionEId',
                  isOpenForRegistration: true
                },
                sessionFId: {
                  id: 'sessionFId',
                  capacityId: 'sessionFId',
                  isOpenForRegistration: true
                },
                sessionGId: {
                  id: 'sessionGId',
                  capacityId: 'sessionGId',
                  isOpenForRegistration: true
                }
              }
            }
          },
          sortKeys: {
            sessionGroupAId: ['2017-09-10T22:00:00.000Z'],
            'a550c1a7-ed00-5e55-1045-500000000000': ['2017-09-10T22:00:00.000Z']
          }
        },
        '03': {
          admissionItems: {
            'c0215717-5640-4e9d-b790-36047f14bf21': {
              limitOptionalItemsToSelect: false,
              isOpenForRegistration: true,
              limitGuestsByContactType: false,
              includeWaitlistSessionsTowardsMaxiumumLimit: false,
              applicableContactTypes: [],
              limitOptionalSessionsToSelect: false,
              includedOptionalSessions: [],
              applicableOptionalItems: [],
              minimumNumberOfSessionsToSelect: 0,
              applicableOptionalSessions: [],
              capacityByGuestContactTypes: [],
              displayOrder: 0,
              code: '',
              description: '',
              id: 'c0215717-5640-4e9d-b790-36047f14bf21',
              capacityId: 'c0215717-5640-4e9d-b790-36047f14bf21',
              name: 'Event Registration',
              status: 2,
              defaultFeeId: '00000000-0000-0000-0000-000000000000'
            }
          },
          sessionProducts: {}
        }
      }
    };
  },
  get travelCart(): $TSFixMe {
    return {
      id: '6bbef10e-0e0c-49bf-a1bf-534508814dbf',
      eventId: 'c41bbb71-8ecf-4293-b6c7-4ac9001f0af8',
      status: 'COMPLETED',
      bookings: [
        {
          travelReservationId: 'e2cb4e98-a298-4b25-ba6f-edcbc703f478',
          id: '00000000-0000-0000-0000-000000000001',
          attendee: {
            id: '89921838-4ffc-4ee9-b09c-4655ecea4f0d',
            type: 'INVITEE',
            primaryRegistrantTravelBookingId: '00000000-0000-0000-0000-000000000000',
            contactId: 'eaa1354b-b0a7-465a-9bcf-db595d713a16',
            status: 2,
            inviteeEmailAddress: 'jangrahul22@gmail.com',
            targetListId: '946fb400-cf89-400f-9586-38f4f555f3c1'
          },
          registrationPathId: 'caa06ad5-e7a5-4ed6-a2aa-02c8cd574ae0',
          registrationTypeId: '0d3545cb-1c0c-43a7-9cc5-4ea3bccb8bee',
          hotelRoomBookings: [
            {
              hotelReservationDetailId: '300ee56c-d7e4-4245-9df8-42b47bbad1c4',
              id: 'af3afda7-d896-46e4-835f-e0388536baa8',
              requestGroupId: 'eadc9114-879c-4b5b-b799-e692c0c2e1d1',
              hotelId: 'fd550a92-97a6-4b11-8079-99eded955f48',
              roomTypeId: '7800e1c7-0ea4-4eb4-96d0-090bea710e81',
              quantity: 1,
              checkinDate: '2020-01-16',
              checkoutDate: '2020-01-23',
              travellerInfo: {
                firstName: 'rahul22',
                lastName: 'jangra',
                gender: 1
              },
              preferences: {
                specialRequestNotes: '',
                rewardsCode: '',
                roommatePreferences: {
                  roommateDescription: '',
                  type: 'SEARCH',
                  roommateId: '72990cb8-1301-44ac-95bb-e6eb408da29b',
                  roommateIdType: 'HOTEL_RESERVATION_DETAIL',
                  roommateFirstName: 'rahul18',
                  roommateLastName: 'jangra'
                },
                isAdaAccessibilityOpted: false,
                isRoomSharingOpted: true,
                isSmokingOpted: false
              },
              requestedAction: 'BOOK',
              dateChargeOrderDetailMap: [],
              isRoommateMatchingFailed: false,
              isRoommateMatched: false
            }
          ],
          airBookings: [],
          groupFlightBookings: [],
          airActuals: [],
          concurAirActuals: [],
          pnrAirActuals: [],
          requestedAction: 'BOOK',
          admissionItemId: '4e522c8f-0b4f-40e5-a851-0dc6aad9c232',
          travelAnswers: []
        }
      ],
      travelSnapshotVersion: 'teT1gODr4Wymg1iVnJO5hRmJ0mODRSjc',
      requestedAction: 'BOOK',
      callbackUri:
        'https://web-s437.cvent.com/event_guest/v1/registration/v1/callback/6bbef10e-0e0c-49bf-a1bf-534508814dbf/travel-checkout-callback?environment=S437',
      isForPreview: false,
      isForPlanner: false,
      isForTestMode: false,
      isPlannerApprovalRequired: false,
      isCartRecoveringFromFailure: false
    };
  }
};

// Manipulate prototype(class) here, individual test cases can shadow desired functions at object level
RegCartClient.prototype.calculateRegCartPricing = jest.fn(() => response.regCartPricing);
RegCartClient.prototype.getRegCart = jest.fn(() => response.regCart);
RegCartClient.prototype.createRegCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.updateRegCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.resumePartialRegCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.createRegCartFromLink = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.createTestModeRegCartFromLink = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.startRegCartCheckout = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.authorizeByConfirm = jest.fn(() => ({ accessToken: 'fake-post-reg-token' }));
RegCartClient.prototype.waitForRegCartCheckoutCompletion = jest.fn(() => ({
  registrationIntent: CHECKED_OUT,
  checkoutProgress: 100,
  lastSavedRegCart: {
    ...response.regCart,
    status: 'COMPLETED'
  }
}));
RegCartClient.prototype.createDeclineRegistrationCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.createWaitlistRegistrationCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.updateRegCartSessionRegistrations = jest.fn(() => ({ regCart: response.regCart }));

TravelApiClient.prototype.getTravelCart = jest.fn(() => response.travelCart);

RegCartClient.prototype.identifyByConfirm = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.createRegModCart = jest.fn(() => ({ regCart: response.regCart }));
RegCartClient.prototype.createCancelRegistrationCart = jest.fn(() => ({ regCart: response.regCart }));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const errors = require('../../errors');
errors.getUpdateErrors.isGuestProductAvailabilityError = jest.fn();
errors.getUpdateErrors.isAddGroupMemberNotAvailableError = jest.fn();
errors.getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError = jest.fn();
errors.getUpdateErrors.isDiscountCapacityInsufficient = jest.fn();
errors.getUpdateErrors.isProductAvailabilityError = jest.fn();
errors.getUpdateErrors.isKnownError = jest.fn();

const selectedAdmissionItemId = '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c';
const dummyCapacitySummaries = {
  'c0215717-5640-4e9d-b790-36047f14bf21': {
    capacityId: 'c0215717-5640-4e9d-b790-36047f14bf21',
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  },
  '93e7463b-ebaa-40e7-b0ad-a2ca26f87b3c': {
    capacityId: selectedAdmissionItemId,
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  }
};
RegCartClient.prototype.getCapacitySummaries = jest.fn(() => {
  return dummyCapacitySummaries;
});

export function getState(): $TSFixMe {
  return {
    persona: {},
    accessToken,
    account: {
      settings: {
        defaultCultureCode: 'en-US'
      }
    },
    clients: {
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      regCartClient: new RegCartClient(),
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      travelApiClient: new TravelApiClient(),
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      eventGuestClient: new EventGuestClient(),
      eventSnapshotClient: { getRegCartVisibleProducts: () => {} },
      productVisibilityClient: { getVisibleProducts: () => {} }
    },
    event: {
      cultureCode: 'en',
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
      },
      eventSecuritySetupSnapshot: {}
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
    registrantLogin: {
      form: {
        emailAddress: '',
        confirmationNumber: ''
      },
      currentLogin: {
        emailAddress: '',
        confirmationNumber: ''
      }
    },
    pathInfo: { currentPageId: 'regProcessStep2' },
    limits: {
      perEventLimits: {
        maxNumberOfGuests: {
          limit: 10
        }
      }
    },
    visibleProducts: {},
    multiLanguageLocale: { locale: 'en-US', loadedLanguages: ['en-US'] },
    experiments: {}
  };
}
