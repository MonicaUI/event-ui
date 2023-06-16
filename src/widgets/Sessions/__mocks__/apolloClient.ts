import { REGISTER_SESSION_BUNDLE } from '../../../redux/registrationForm/regCart/sessionBundles';

const request = {
  query: REGISTER_SESSION_BUNDLE,
  variables: {
    regCartId: '01d4655d-f010-458d-8a10-a408f97c029c',
    input: [
      {
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        productId: '3a53a9c0-f8f9-451a-919a-0ab577e9fb64',
        requestedAction: 'REGISTER',
        registrationSourceType: 'Selected'
      }
    ]
  }
};

export const mockRegisterSessionBundleSuccess = {
  request,
  newData: jest.fn(() => ({
    data: {
      response: {
        regCart: {
          sendEmail: true,
          eventId: 'f694fb1c-a278-4555-ae2b-73042fda2063',
          localeId: 1033,
          accountSnapshotVersion: 'XQlU4Bg_NkiqdRIYerVqOyBN_2RIrlCM',
          eventSnapshotVersions: {
            'f694fb1c-a278-4555-ae2b-73042fda2063': 'Opbs0Iz4WlyFxIVggb1vIg7DXC.dfMFj'
          },
          regCartId: '01d4655d-f010-458d-8a10-a408f97c029c',
          lastSavedPageId: 'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8',
          status: 'INPROGRESS',
          dequeueStatus: {
            totalSteps: 0,
            currentStep: 0
          },
          groupRegistration: false,
          volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
          eventRegistrations: [
            {
              eventRegistrationId: '00000000-0000-0000-0000-000000000001',
              attendee: {
                personalInformation: {
                  firstName: 'invitee',
                  lastName: '1',
                  emailAddress: 'invitee@j.mail',
                  customFields: [],
                  emailAddressDomain: 'j.mail'
                },
                isGroupMember: false,
                eventAnswers: []
              },
              attendeeType: 'ATTENDEE',
              displaySequence: 1,
              productRegistrations: [
                {
                  requestedAction: 'REGISTER',
                  productType: 'AdmissionItem',
                  productId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
                  quantity: 1
                }
              ],
              requestedAction: 'REGISTER',
              externalRegistrationContactId: '',
              contactNoMatchInSfCampaign: false,
              eventId: 'f694fb1c-a278-4555-ae2b-73042fda2063',
              primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
              sessionRegistrations: {
                '0c7af723-a761-447e-af49-4c6654de14ed': {
                  requestedAction: 'REGISTER',
                  productId: '0c7af723-a761-447e-af49-4c6654de14ed',
                  registrationSourceType: 'Track',
                  registrationSourceParentId: '3a53a9c0-f8f9-451a-919a-0ab577e9fb64',
                  includedInAgenda: false
                }
              },
              quantityItemRegistrations: {},
              donationItemRegistrations: {},
              sessionWaitlists: {},
              sessionBundleRegistrations: {
                '3a53a9c0-f8f9-451a-919a-0ab577e9fb64': {
                  requestedAction: 'REGISTER',
                  productId: '3a53a9c0-f8f9-451a-919a-0ab577e9fb64'
                }
              },
              registrationTypeId: '00000000-0000-0000-0000-000000000000',
              registrationPathId: 'c6da5ffa-fa0d-465d-823a-8f4c328f7619',
              addGuestFromRelatedContacts: false,
              autoAssignRegTypeForEventRegistration: false,
              attendingFormatId: 0
            },
            {
              eventRegistrationId: '9a44e12c-bc20-43fc-88ad-36c42c8de107',
              attendee: {
                personalInformation: {
                  firstName: 'guest',
                  lastName: '1',
                  emailAddress: 'guest@j.mail',
                  customFields: [],
                  emailAddressDomain: 'j.mail'
                },
                isGroupMember: false,
                eventAnswers: []
              },
              attendeeType: 'GUEST',
              displaySequence: 1,
              productRegistrations: [
                {
                  requestedAction: 'REGISTER',
                  productType: 'AdmissionItem',
                  productId: '6a0ee119-0fd3-4e70-a61e-16361ebef51f',
                  quantity: 1
                }
              ],
              requestedAction: 'REGISTER',
              contactNoMatchInSfCampaign: false,
              eventId: 'f694fb1c-a278-4555-ae2b-73042fda2063',
              primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
              sessionRegistrations: {
                '0c7af723-a761-447e-af49-4c6654de14ed': {
                  requestedAction: 'REGISTER',
                  productId: '0c7af723-a761-447e-af49-4c6654de14ed',
                  registrationSourceType: 'Track',
                  registrationSourceParentId: '3a53a9c0-f8f9-451a-919a-0ab577e9fb64',
                  includedInAgenda: false
                }
              },
              quantityItemRegistrations: {},
              donationItemRegistrations: {},
              sessionWaitlists: {},
              sessionBundleRegistrations: {
                '3a53a9c0-f8f9-451a-919a-0ab577e9fb64': {
                  requestedAction: 'REGISTER',
                  productId: '3a53a9c0-f8f9-451a-919a-0ab577e9fb64'
                }
              },
              registrationTypeId: '00000000-0000-0000-0000-000000000000',
              registrationPathId: 'c6da5ffa-fa0d-465d-823a-8f4c328f7619',
              addGuestFromRelatedContacts: false,
              autoAssignRegTypeForEventRegistration: false,
              attendingFormatId: 0
            }
          ],
          isAdmin: false,
          registrationApprovalRequired: false,
          hasTravel: false,
          partial: true,
          regApproval: false,
          regCancel: false,
          regMod: false,
          regDecline: false,
          regWaitList: false,
          postRegPayment: false
        },
        validationMessages: []
      }
    }
  }))
};

export const mockRegisterSessionBundleError = {
  request,
  error: new Error('Some error occurred')
};

export const mockRegisterSessionBundleCapacityReachError = {
  request,
  error: {
    statusCode: 422,
    result: {
      validationMessages: [
        {
          severity: 'Error',
          localizationKey: 'REGAPI.CAPACITY_UNAVAILABLE',
          parametersMap: {
            eventRegistrationId: 'evtRegId',
            productId: 'sessionBundleId',
            productType: 'Track',
            registrationTypeId: 'attendee'
          }
        }
      ]
    }
  }
};
