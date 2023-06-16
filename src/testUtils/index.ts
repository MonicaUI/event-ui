export const wait = (ms: $TSFixMe): $TSFixMe => new Promise((resolve): $TSFixMe => setTimeout(resolve, ms));

export function createRegistrationType(id = 'registrationTypeAId'): $TSFixMe {
  return {
    id,
    name: `name-${id}`,
    availableSessions: []
  };
}

export function createAdmissionItem(id = 'admissionItemAId', applicableContactTypes?: $TSFixMe): $TSFixMe {
  return {
    id,
    isOpenForRegistration: true,
    applicableContactTypes: applicableContactTypes || [],
    limitOptionalSessionsToSelect: false,
    availableOptionalSessions: [],
    associatedOptionalSessions: [],
    minimumNumberOfSessionsToSelect: 0,
    maximumNumberOfSessionsToSelect: undefined,
    type: 'AdmissionItem',
    code: `code-${id}`,
    name: `name-${id}`,
    description: `description-${id}`,
    fees: {},
    capacityId: `capacityId-${id}`
  };
}

export function createProductAdmissionItem(admissionItem: $TSFixMe): $TSFixMe {
  return {
    productId: admissionItem.id,
    productType: 'AdmissionItem',
    quantity: 1,
    requestedAction: 'REGISTER',
    registrationSourceType: 'Selected'
  };
}

export function createAutoAppliedAdmissionItem(admissionItem: $TSFixMe): $TSFixMe {
  return {
    productId: admissionItem.id,
    productType: 'AdmissionItem',
    quantity: 1,
    requestedAction: 'REGISTER'
  };
}

export function createSession(id = 'sessionItemAId'): $TSFixMe {
  return {
    id,
    isOpenForRegistration: true,
    isIncludedSession: false,
    startTime: '2000-03-20T13:00:00',
    endTime: '2000-03-20T14:00:00',
    locationName: 'Middle Earth',
    categoryId: 'id',
    capacity: 10,
    registeredCount: 2,
    associatedRegistrationTypes: [],
    type: 'Session',
    code: `code-${id}`,
    name: `name-${id}`,
    description: `description-${id}`,
    fees: {},
    capacityId: `capacityId-${id}`
  };
}

export function createQuantityItem(id = 'quantityItemAId'): $TSFixMe {
  return {
    id,
    associatedRegistrationTypes: [],
    isOpenForRegistration: true,
    capacityId: `capacityId-${id}`,
    status: 2,
    type: 'QuantityItem',
    code: `code-${id}`,
    name: `name-${id}`
  };
}

export function createQuantityItemAdvancedRules(id = 'quantityItemAdvancedRuleAId'): $TSFixMe {
  return {
    id,
    minQuantityAllowed: 1,
    quantityItem: [],
    maxQuantityAllowed: 3,
    name: `name-${id}`,
    warningMessage: `${id}-violated`,
    contactType: [],
    admissionItem: [],
    isActive: true
  };
}

export function createProductQuantityItem(quantityItem: $TSFixMe): $TSFixMe {
  return {
    productId: quantityItem.id,
    quantity: 2
  };
}

export function createDonationItem(id = 'donationItemAId'): $TSFixMe {
  return {
    id,
    associatedRegistrationTypes: [],
    isOpenForRegistration: true,
    status: 2,
    type: 'DonationItem',
    code: `code-${id}`,
    name: `name-${id}`
  };
}

export function createProductDonationItem(donationItem: $TSFixMe): $TSFixMe {
  return {
    productId: donationItem.id
  };
}

export function createSessionGroup(id = 'sessionGroupAId'): $TSFixMe {
  return {
    id,
    code: `code-${id}`,
    name: `name-${id}`,
    description: `description-${id}`,
    placementDateTime: '2000-03-20T13:00:00',
    categoryId: 'id',
    displayFormat: 1,
    displayOrder: 1,
    allowSessionDisplayFields: [1, 2, 8],
    isPlacementTimeDisplayed: true,
    isSessionSelectionRequired: true,
    isOpenForRegistration: true
  };
}

export function createProductSession(session: $TSFixMe): $TSFixMe {
  return {
    productId: session.id,
    productType: 'Session',
    quantity: 1,
    requestedAction: 'REGISTER',
    registrationSourceType: 'Selected'
  };
}

export function createCustomFieldAnswers(id = 'customFieldId'): $TSFixMe {
  return {
    questionId: id,
    answers: [
      {
        answerType: 'Choice',
        choice: `choice1-${id}`
      },
      {
        answerType: 'Choice',
        choice: `choice2-${id}`
      }
    ]
  };
}

export function createInvalidChildCustomFieldAnswers(id = 'childCustomFieldId', answers = []): $TSFixMe {
  return {
    questionId: id,
    answers
  };
}

export function createContactCustomFieldsMetadata(
  parentCustomFieldId = 'parentCustomFieldId',
  id = 'childCustomFieldId'
): $TSFixMe {
  return {
    contactCustomFields: [
      {
        question: {
          questionTypeInfo: {
            choices: [
              {
                id: 'childChoice1',
                text: `choice1-${id}`
              },
              {
                id: 'childChoice2',
                text: `choice2-${id}`
              },
              {
                id: 'childChoice3',
                text: `choice3-${id}`
              }
            ],
            linkLogic: {
              linkRules: [
                {
                  childChoices: [`choice3-${id}`]
                },
                {
                  childChoices: [`choice2-${id}`],
                  parentChoice: `choice1-${parentCustomFieldId}`
                },
                {
                  childChoices: [`choice1-${id}`],
                  parentChoice: `choice2-${parentCustomFieldId}`
                }
              ],
              parentQuestionLinkType: 'ContactCustomField',
              parentQuestionId: parentCustomFieldId
            }
          },
          id,
          text: 'child cust field with adv logic'
        }
      }
    ]
  };
}

export function createRegCartWithGuestRegistrations(): $TSFixMe {
  return {
    regCartId: 'd996d434-d088-44fb-8339-2831a2d0f93c',
    status: 'INPROGRESS',
    groupRegistration: false,
    eventRegistrations: {
      '00000000-0000-0000-0000-000000000001': {
        eventRegistrationId: '00000000-0000-0000-0000-000000000001',
        attendee: {
          isGroupMember: false
        },
        attendeeType: 'ATTENDEE',
        displaySequence: 1,
        productRegistrations: [
          {
            requestedAction: 'REGISTER',
            productType: 'AdmissionItem',
            productId: 'd4e7d4b3-77ac-4865-a30c-dac1f1055105',
            quantity: 1
          }
        ],
        requestedAction: 'REGISTER',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
        sessionRegistrations: {
          'fce781e0-b647-4548-af7e-badca1b0afad': {
            requestedAction: 'REGISTER',
            productId: 'fce781e0-b647-4548-af7e-badca1b0afad',
            registrationSourceType: 'Selected',
            includedInAgenda: false
          }
        },
        registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      },
      '554ca936-5f54-4fd3-85be-376f27f4c4db': {
        eventRegistrationId: '554ca936-5f54-4fd3-85be-376f27f4c4db',
        attendee: {
          isGroupMember: false
        },
        attendeeType: 'GUEST',
        displaySequence: 2,
        productRegistrations: [
          {
            requestedAction: 'REGISTER',
            productType: 'AdmissionItem',
            productId: 'd4e7d4b3-77ac-4865-a30c-dac1f1055105',
            quantity: 1
          }
        ],
        requestedAction: 'UNREGISTER',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
        sessionRegistrations: {
          'fce781e0-b647-4548-af7e-badca1b0afad': {
            requestedAction: 'REGISTER',
            productId: 'fce781e0-b647-4548-af7e-badca1b0afad',
            registrationSourceType: 'Selected',
            includedInAgenda: false
          }
        },
        registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      }
    }
  };
}

export function createConflictRegCartWithGuests(products?: $TSFixMe): $TSFixMe {
  const selectedAdmissionItem =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    products && products.admissionItem
      ? createProductAdmissionItem(products.admissionItem)
      : createProductAdmissionItem(createAdmissionItem());
  const selectedSession =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    products && products.session ? createProductSession(products.session) : createProductSession(createSession());
  return {
    regCartId: 'd996d434-d088-44fb-8339-2831a2d0f93c',
    status: 'INPROGRESS',
    groupRegistration: false,
    eventRegistrations: {
      eventRegistrationId: {
        eventRegistrationId: 'eventRegistrationId',
        attendee: {
          isGroupMember: false,
          airOptOutChoice: 'OPT_OUT'
        },
        attendeeType: 'ATTENDEE',
        displaySequence: 1,
        productRegistrations: [selectedAdmissionItem],
        requestedAction: 'REGISTER',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
        sessionRegistrations: {
          [selectedSession.productId]: selectedSession
        },
        registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      },
      guestEventRegId: {
        eventRegistrationId: 'guestEventRegId',
        attendee: {
          isGroupMember: false,
          airOptOutChoice: 'OPT_OUT'
        },
        attendeeType: 'GUEST',
        displaySequence: 2,
        productRegistrations: [selectedAdmissionItem],
        requestedAction: 'REGISTER',
        primaryRegistrationId: 'eventRegistrationId',
        sessionRegistrations: {
          [selectedSession.productId]: selectedSession
        },
        registrationTypeId: 'registrationTypeAId',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      }
    }
  };
}

export function createConflictRegCartWithOptOutFlags(products?: $TSFixMe): $TSFixMe {
  const selectedAdmissionItem =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    products && products.admissionItem
      ? createProductAdmissionItem(products.admissionItem)
      : createProductAdmissionItem(createAdmissionItem());
  const selectedSession =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    products && products.session ? createProductSession(products.session) : createProductSession(createSession());
  return {
    regCartId: 'd996d434-d088-44fb-8339-2831a2d0f93c',
    status: 'INPROGRESS',
    groupRegistration: false,
    eventRegistrations: {
      eventRegistrationId: {
        eventRegistrationId: 'eventRegistrationId',
        attendee: {
          isGroupMember: false,
          airOptOutChoice: 'NOT_APPLICABLE'
        },
        attendeeType: 'ATTENDEE',
        displaySequence: 1,
        productRegistrations: [selectedAdmissionItem],
        requestedAction: 'REGISTER',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
        sessionRegistrations: {
          [selectedSession.productId]: selectedSession
        },
        registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      },
      guestEventRegId: {
        eventRegistrationId: 'guestEventRegId',
        attendee: {
          isGroupMember: false,
          airOptOutChoice: 'NOT_APPLICABLE'
        },
        attendeeType: 'GUEST',
        displaySequence: 2,
        productRegistrations: [selectedAdmissionItem],
        requestedAction: 'REGISTER',
        primaryRegistrationId: 'eventRegistrationId',
        sessionRegistrations: {
          [selectedSession.productId]: selectedSession
        },
        registrationTypeId: 'registrationTypeAId',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      }
    }
  };
}

export function createConflictRegCartWithAirOptOutChoiceSetToBooked(products?: $TSFixMe): $TSFixMe {
  const selectedAdmissionItem =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    products && products.admissionItem
      ? createProductAdmissionItem(products.admissionItem)
      : createProductAdmissionItem(createAdmissionItem());
  const selectedSession =
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    products && products.session ? createProductSession(products.session) : createProductSession(createSession());
  return {
    regCartId: 'd996d434-d088-44fb-8339-2831a2d0f93c',
    status: 'INPROGRESS',
    groupRegistration: false,
    eventRegistrations: {
      eventRegistrationId: {
        eventRegistrationId: 'eventRegistrationId',
        attendee: {
          isGroupMember: false,
          airOptOutChoice: 'BOOKED'
        },
        attendeeType: 'ATTENDEE',
        displaySequence: 1,
        productRegistrations: [selectedAdmissionItem],
        requestedAction: 'REGISTER',
        primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
        sessionRegistrations: {
          [selectedSession.productId]: selectedSession
        },
        registrationTypeId: '8ddb813c-4fa1-4188-ac24-e54759b206bc',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      },
      guestEventRegId: {
        eventRegistrationId: 'guestEventRegId',
        attendee: {
          isGroupMember: false,
          airOptOutChoice: 'BOOKED'
        },
        attendeeType: 'GUEST',
        displaySequence: 2,
        productRegistrations: [selectedAdmissionItem],
        requestedAction: 'REGISTER',
        primaryRegistrationId: 'eventRegistrationId',
        sessionRegistrations: {
          [selectedSession.productId]: selectedSession
        },
        registrationTypeId: 'registrationTypeAId',
        registrationPathId: 'fa7749e7-29db-44da-a6cc-bbe014599bb0'
      }
    }
  };
}
