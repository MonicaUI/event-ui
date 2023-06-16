import { DESELECT_MEMBERSHIP, SELECT_MEMBERSHIP } from '../updateMembershipQuery';

const selectMembershipRequest = {
  query: SELECT_MEMBERSHIP,
  variables: {
    regCartId: '53372990-b26e-4556-8c42-efee05473e29',
    membershipItemId: '457b1725-6394-4476-92b2-6ecfb106791f',
    productId: '95bf4765-4706-425f-bb5a-bd3ba83075b9',
    eventRegistrationId: '00000000-0000-0000-0000-000000000001',
    renewal: false
  }
};

const deselectMembershipRequest = {
  query: DESELECT_MEMBERSHIP,
  variables: {
    regCartId: '53372990-b26e-4556-8c42-efee05473e29',
    membershipItemId: '457b1725-6394-4476-92b2-6ecfb106791f',
    productId: '95bf4765-4706-425f-bb5a-bd3ba83075b9',
    eventRegistrationId: '00000000-0000-0000-0000-000000000001',
    renewal: false
  }
};

const regCartResponse = {
  eventId: 'd780d258-4b8d-422f-a686-fd43862f2d09',
  localeId: 1033,
  accountSnapshotVersion: 'XQlU4Bg_NkiqdRIYerVqOyBN_2RIrlCM',
  eventSnapshotVersions: {
    'f694fb1c-a278-4555-ae2b-73042fda2063': 'Opbs0Iz4WlyFxIVggb1vIg7DXC.dfMFj'
  },
  regCartId: '53372990-b26e-4556-8c42-efee05473e29',
  lastSavedPageId: 'regProcessStep1',
  status: 'INPROGRESS',
  groupRegistration: false,
  volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
  eventRegistrations: [
    {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      attendee: {
        personalInformation: {
          firstName: 'Alexandra',
          lastName: 'Petersen',
          emailAddress: 'rotemobeb@mailinator.com',
          company: 'Davidson and Copeland Inc',
          title: 'Accusamus et sunt incidunt officia ut repellendus Sit ut',
          mobilePhone: 'Id voluptatem laborum et quos',
          customFields: [],
          emailAddressDomain: 'mailinator.com'
        },
        isGroupMember: false,
        eventAnswers: []
      },
      attendeeType: 'ATTENDEE',
      displaySequence: 1,
      productRegistrations: [],
      requestedAction: 'REGISTER',
      externalRegistrationContactId: '',
      eventId: 'd780d258-4b8d-422f-a686-fd43862f2d09',
      primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
      sessionRegistrations: {},
      quantityItemRegistrations: {},
      donationItemRegistration: {},
      membershipItemRegistrations: {},
      sessionWaitlists: {},
      sessionBundleRegistrations: {},
      registrationTypeId: '78ba0e75-7dab-4e38-a074-9e249ba8cd54',
      registrationPathId: '73386686-09c5-4e52-be42-43311c3bfc90',
      addGuestFromRelatedContacts: false,
      autoAssignRegTypeForEventRegistration: false,
      attendingFormatId: 0
    }
  ],
  isAdmin: false,
  registrationApprovalRequired: false,
  hasTravel: false,
  partial: true,
  regDecline: false,
  regWaitList: false,
  regApproval: false,
  regCancel: false,
  regMod: false,
  postRegPayment: false
};

export const mockMembershipSelectionSuccess = {
  request: selectMembershipRequest,
  newData: jest.fn(() => ({
    data: {
      selectMembershipItem: {
        regCart: {
          validationMessages: [],
          regCart: {
            ...regCartResponse,
            eventRegistrations: [
              {
                ...regCartResponse.eventRegistrations[0],
                membershipItemRegistrations: {
                  '95bf4765-4706-425f-bb5a-bd3ba83075b9': {
                    productType: 'MembershipItem',
                    requestedAction: 'REGISTER',
                    membershipItemId: '457b1725-6394-4476-92b2-6ecfb106791f',
                    renewal: false,
                    registrationTypeIdBeforeMembershipSelection: '00000000-0000-0000-0000-000000000000',
                    productId: '95bf4765-4706-425f-bb5a-bd3ba83075b9'
                  }
                }
              }
            ]
          }
        },
        membershipItemRegistrations: {
          '95bf4765-4706-425f-bb5a-bd3ba83075b9': {
            productType: 'MembershipItem',
            requestedAction: 'REGISTER',
            membershipItemId: '457b1725-6394-4476-92b2-6ecfb106791f',
            renewal: false,
            registrationTypeIdBeforeMembershipSelection: '00000000-0000-0000-0000-000000000000',
            productId: '95bf4765-4706-425f-bb5a-bd3ba83075b9'
          }
        }
      }
    }
  }))
};
export const mockMembershipDeselectionSuccess = {
  request: deselectMembershipRequest,
  newData: jest.fn(() => ({
    data: {
      deselectMembershipItem: {
        regCart: {
          validationMessages: [],
          regCart: {
            ...regCartResponse
          }
        }
      }
    }
  }))
};
