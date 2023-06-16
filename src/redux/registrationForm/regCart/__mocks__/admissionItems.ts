/* eslint-env jest */
import noopAction from '../../../../testUtils/noopAction';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import appData from '../__tests__/appData.json';
import { REGISTERING } from '../../../registrationIntents';

export const selectAdmissionItem = jest.fn(noopAction);
export const unSelectAdmissionItem = jest.fn(noopAction);
export function RegCartClient(): $TSFixMe {}
export function ProductVisibilityClient(): $TSFixMe {}
export function EventSnapshotClient(): $TSFixMe {}
export const eventId = EventSnapshot.eventSnapshot.id;
export const primaryEventRegId = '00000000-0000-0000-0000-000000000001';
export const regCartId = '928f02df-4ba7-4637-824d-ae71bd414e4f';
export const unSelectedAdmissionId = 'unSelectedAdmissionId';

export const visibleProductsForDefaultRegType = {
  admissionItems: {
    '084ada84-832c-4511-ab20-6727fcf8d5ec': {
      code: '',
      description: '',
      id: '084ada84-832c-4511-ab20-6727fcf8d5ec',
      capacityId: '084ada84-832c-4511-ab20-6727fcf8d5ec',
      name: 'Event Registration',
      status: 2,
      type: 'AdmissionItem',
      defaultFeeId: '00000000-0000-0000-0000-000000000000',
      fees: {},
      closedReasonType: 'NotClosed',
      isOpenForRegistration: true,
      limitOptionalItemsToSelect: false,
      includeWaitlistSessionsTowardsMaximumLimit: false,
      applicableContactTypes: ['00000000-0000-0000-0000-000000000000'],
      limitOptionalSessionsToSelect: false,
      associatedOptionalSessions: [],
      applicableOptionalItems: [],
      minimumNumberOfSessionsToSelect: 0,
      availableOptionalSessions: [],
      displayOrder: 2
    }
  },
  sessionProducts: {},
  sessions: null,
  sessionGroups: null,
  sortKeys: {},
  quantityItems: {},
  donationItems: {},
  skipValidationItems: null
};

export function getState(regMod = false): $TSFixMe {
  const regCart = {
    regCartId,
    status: 'INPROGRESS',
    eventSnapshotVersions: {
      [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
    },
    eventRegistrations: {
      [primaryEventRegId]: {
        eventRegistrationId: primaryEventRegId,
        eventId,
        attendee: {
          personalInformation: {
            contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
            emailAddress: 'aa@j.mail',
            firstName: 'a',
            lastName: 'a',
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
        quantityItemRegistrations: {},
        sessionRegistrations: {},
        registrationTypeId: '00000000-0000-0000-0000-000000000000',
        registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
      }
    },
    regMod
  };
  return {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    accessToken: '',
    clients: {
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      regCartClient: new RegCartClient(),
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      productVisibilityClient: new ProductVisibilityClient(),
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      eventSnapshotClient: new EventSnapshotClient()
    },
    registrationForm: {
      regCartPayment: {
        pricingInfo: {
          selectedPaymentMethod: null
        }
      },
      regCart,
      errors: {}
    },
    regCartStatus: {
      registrationIntent: REGISTERING,
      lastSavedRegCart: regCart
    },
    event: {
      eventFeatureSetup: {
        fees: {
          fees: false
        },
        registrationProcess: {
          multipleRegistrationTypes: false
        },
        agendaItems: {
          admissionItems: true
        }
      },
      products: {}
    },
    visibleProducts: {
      Sessions: {
        [primaryEventRegId]: { ...visibleProductsForDefaultRegType }
      }
    },
    appData,
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx),
      resolver: {
        date: () => 'some date',
        currency: x => x
      }
    },
    userSession: {
      regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f'
    },
    defaultUserSession: {},
    travelCart: {}
  };
}

export const response = {
  get regCart(): $TSFixMe {
    return {
      regCartId,
      status: 'INPROGRESS',
      eventRegistrations: {
        [primaryEventRegId]: {
          eventRegistrationId: primaryEventRegId,
          attendee: {
            personalInformation: {
              emailAddress: 'aa@j.mail'
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
          sessionRegistrations: {},
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      }
    };
  }
};
