/* eslint-env jest */
import noopAction from '../../../../testUtils/noopAction';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
import appData from '../__tests__/appData.json';
import { REGISTERING } from '../../../registrationIntents';

export const unSelectSession = jest.fn(noopAction);
export const selectSession = jest.fn(noopAction);
export const switchSession = jest.fn(noopAction);

export const registrationPathId = '411c6566-1e5a-4c38-b8e5-f63ab9239b40';
export const regCartId = '928f02df-4ba7-4637-824d-ae71bd414e4f';
export const eventId = EventSnapshot.eventSnapshot.id;
export const accessToken = '';
export const primaryEventRegId = '00000000-0000-0000-0000-000000000001';

export const unSelectedSessionId = 'unSelectedSessionId';
export const waitlistedSessionId = 'waitlistSessionId';
export const selectedSessionId = 'sessionId';
export const nonWaitlistedSessionId = 'nonWaitlistSessionId';

export function RegCartClient(): $TSFixMe {}
export const visibleProductsForRegistrationWithSessionGroups = {
  admissionItems: {
    admissionItemId: {
      id: 'admissionItemId'
    }
  },
  sessionProducts: {
    sessionGroup: {
      code: 'Group',
      id: 'sessionGroup',
      isOpenForRegistration: true,
      name: 'Group',
      sessions: {
        freeSessionInGroup: {
          capacityId: 'unlimitedCapacity',
          id: 'freeSessionInGroup',
          name: 'Free Session in Group'
        },
        sessionInGroupWithFee: {
          capacityId: 'unlimitedCapacity',
          id: 'sessionInGroupWithFee',
          name: 'Session in Group'
        }
      }
    }
  }
};

export const visibleProductsForRegistration = {
  admissionItems: {
    admissionItemId: {
      id: 'admissionItemId'
    }
  },
  sessionProducts: {
    [selectedSessionId]: {
      id: selectedSessionId,
      capacityId: selectedSessionId,
      isWaitlistEnabled: true,
      name: selectedSessionId,
      waitlistCapacityId: `${selectedSessionId}_waitlist`
    },
    [unSelectedSessionId]: {
      id: unSelectedSessionId,
      capacityId: unSelectedSessionId,
      name: unSelectedSessionId,
      isWaitlistEnabled: true,
      waitlistCapacityId: `${unSelectedSessionId}_waitlist`
    },
    limitedSelectedSession: {
      id: 'limitedSelectedSession',
      capacityId: 'limitedSelectedSession',
      isWaitlistEnabled: false,
      name: 'limitedSelectedSession',
      waitlistCapacityId: nonWaitlistedSessionId
    },
    limitedUnSelectedSession: {
      id: 'limitedUnSelectedSession',
      capacityId: 'limitedUnSelectedSession',
      isWaitlistEnabled: false,
      name: 'limitedUnSelectedSession',
      waitlistCapacityId: nonWaitlistedSessionId
    },
    [nonWaitlistedSessionId]: {
      id: nonWaitlistedSessionId,
      capacityId: nonWaitlistedSessionId,
      isWaitlistEnabled: false,
      name: nonWaitlistedSessionId,
      waitlistCapacityId: nonWaitlistedSessionId
    },
    [waitlistedSessionId]: {
      id: waitlistedSessionId,
      capacityId: waitlistedSessionId,
      isWaitlistEnabled: true,
      name: waitlistedSessionId,
      waitlistCapacityId: `${waitlistedSessionId}_waitlist`
    }
  },
  sortKeys: {
    [selectedSessionId]: ['2017-09-10T22:00:00.000Z'],
    [unSelectedSessionId]: ['2017-09-10T22:00:00.000Z'],
    [nonWaitlistedSessionId]: ['2017-09-10T22:00:00.000Z'],
    [waitlistedSessionId]: ['2017-09-10T22:00:00.000Z']
  }
};

export const dummyCapacitySummaries = {
  [selectedSessionId]: {
    capacityId: selectedSessionId,
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  },
  [unSelectedSessionId]: {
    capacityId: unSelectedSessionId,
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  },
  [waitlistedSessionId]: {
    capacityId: waitlistedSessionId,
    totalCapacityAvailable: -1,
    availableCapacity: -1,
    active: true
  },
  limitedSelectedSession: {
    capacityId: 'limitedSelectedSession',
    totalCapacityAvailable: 10,
    availableCapacity: 10,
    active: true
  },
  limitedUnSelectedSession: {
    capacityId: 'limitedUnSelectedSession',
    totalCapacityAvailable: 20,
    availableCapacity: 10,
    active: true
  }
};

export function getState(): $TSFixMe {
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
        quantityItemRegistrations: {},
        sessionRegistrations: {
          [unSelectedSessionId]: {
            productId: unSelectedSessionId,
            requestedAction: 'REGISTER',
            registrationSourceType: 'Selected'
          },
          limitedSelectedSession: {
            productId: 'limitedSelectedSession',
            requestedAction: 'REGISTER',
            registrationSourceType: 'Selected'
          }
        },
        sessionWaitlists: {
          [waitlistedSessionId]: {
            productId: waitlistedSessionId,
            requestedAction: 'WAITLIST',
            registrationSourceType: 'Selected'
          }
        },
        donationItemRegistrations: {
          donationItem2: {
            productId: 'donationItem2',
            amount: '7'
          }
        },
        registrationTypeId: '00000000-0000-0000-0000-000000000000',
        registrationPathId
      }
    }
  };
  return {
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    accessToken,
    clients: {
      // @ts-expect-error ts-migrate(2350) FIXME: Only a void function can be called with the 'new' ... Remove this comment to see the full error message
      regCartClient: new RegCartClient()
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
      products: {
        sessionContainer: {
          optionalSessions: {
            sessionId: {
              id: 'sessionId',
              capacityId: 'sessionId'
            },
            limitedSelectedSession: {
              id: 'limitedSelectedSession',
              capacityId: 'limitedSelectedSession'
            },
            limitedUnSelectedSession: {
              id: 'limitedUnSelectedSession',
              capacityId: 'limitedUnSelectedSession'
            },
            unSelectedSessionId: {
              id: unSelectedSessionId,
              capacityId: unSelectedSessionId
            }
          }
        }
      }
    },
    visibleProducts: {
      Sessions: {
        [primaryEventRegId]: { ...visibleProductsForRegistration }
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
    waitlistSelectionForGuests: {
      [waitlistedSessionId]: true
    },
    capacity: {
      ...dummyCapacitySummaries
    },
    experiments: {}
  };
}

export const response = {
  // mock response with getters to always use fresh copy
  get regCart(): $TSFixMe {
    return {
      regCartId,
      status: 'INPROGRESS',
      eventRegistrations: {
        [primaryEventRegId]: {
          eventRegistrationId: primaryEventRegId,
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
          sessionRegistrations: {},
          registrationTypeId: '00000000-0000-0000-0000-000000000000',
          registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
        }
      }
    };
  }
};
