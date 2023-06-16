import {
  getEventRegistration,
  getAttendee,
  getAttendeeId,
  getAttendeeStandardFieldAnswer,
  getAttendeeCustomFieldAnswer,
  getAttendeeQuestionAnswer,
  getSelectedAdmissionItem,
  getSelectedSessions,
  modificationStart,
  isQuestionVisible,
  getTemporaryGuestEventRegistrationId,
  getAdmissionItemInfoForPrimaryAndGuests,
  getTemporaryGuestEventRegistration,
  getConfirmedGuests,
  guestRegistrantsCount,
  isProductVisibleForEventRegistration,
  isGuestEditMode,
  getRegTypeHasAvailableAdmissionItemMap,
  getRegistrationTypesForPrimaryAndGuests,
  getRegisteredAdmissionItemForPrimaryAndGuests
} from '../currentRegistrant';
import {
  getPrimaryAndGuestVisibleEventRegistration,
  getPrimaryAndGuestSortedVisibleSessions,
  getPrimarySortedVisibleSessions,
  getSessionsVisibleToPrimary,
  getPrimarySortedVisibleAdmissionItems,
  getPrimaryAndGuestSortedVisibleAdmissionItems,
  getAllSortedSessions,
  getAllSortedAdmissionItems,
  getSelectedSessionDefinitions,
  getGuestSelectedSessionDefinitions,
  getGuestSelectedSessionDefinitionsByGuest,
  getAllSortedAdmissionItemsForWidget,
  getAllSortedSessionsForPayments,
  getSortedVisibleSessionsForEventRegistration,
  getQuantityItemInfoForPrimary,
  getSkipSessionValidationAttendees,
  getSessionRegistrationCount,
  getSessionUnregisterCount,
  getSessionWaitlistCount,
  getSessionUnWaitlistCount,
  getSessionCountWithAdmissionItemAssociation,
  getSelectedWaitlistSessionsInSessionGroup,
  getIncludedSessionsForEventRegistration,
  getSessionCountWithSessionBundleAssociation,
  getSessionBundleRegistrationCount
} from '../productSelectors';
import { merge } from 'lodash';
import { setIn, getIn, updateIn, unsetIn } from 'icepick';
import { ATTENDEE_TYPE_INVITEE_AND_GUEST } from 'event-widgets/lib/HotelRequest/utils/HotelRequestUtil';
import { SessionRegistration } from '@cvent/flex-event-shared/target/guestside';

const PRIMARY_INVITEE_REGISTRATION_ID = 'eventRegistrationAId';
const TEMPORARY_GUEST_REGISTRATION_ID = 'eventRegistrationBId';
const CONFIRMED_GUEST_REGISTRATION_ID = 'eventRegistrationDId'; // C is already getting used in some other tests

const getDefaultRegCart = () => {
  return {
    regCartId: 'regCartAId',
    eventRegistrations: {
      [TEMPORARY_GUEST_REGISTRATION_ID]: {
        eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID,
        eventId: 'EventAId',
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        registrationTypeId: 'registrationTypeBId',
        attendee: {
          attendeeId: 'attendeeBId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        productRegistrations: [
          {
            productId: 'admissionItemBId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          sessionAId: {
            productId: 'sessionAId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      },
      [CONFIRMED_GUEST_REGISTRATION_ID]: {
        eventRegistrationId: CONFIRMED_GUEST_REGISTRATION_ID,
        eventId: 'EventAId',
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        registrationTypeId: 'registrationTypeBId',
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        productRegistrations: [
          {
            productId: 'admissionItemAId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          sessionAId: {
            productId: 'sessionAId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        },
        requestedAction: 'REGISTER'
      },
      [PRIMARY_INVITEE_REGISTRATION_ID]: {
        eventRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        eventId: 'EventAId',
        registrationTypeId: 'registrationTypeAId',
        attendee: {
          attendeeId: 'attendeeAId',
          personalInformation: {
            firstName: 'floofykins',
            lastName: 'snuffles',
            emailAddress: 'floofykins.snuffles@j.mail',
            socialMediaUrls: {
              FACEBOOK: 'http://www.facebook.com/YourChosenName'
            },
            customFields: {
              customFieldAId: {
                questionId: 'customFieldAId',
                answers: [
                  {
                    answerType: 'I am a dragon!',
                    text: 'text answer'
                  }
                ]
              }
            }
          },
          eventAnswers: {
            eventAnswerAId: {
              questionId: 'eventAnswerAId',
              answers: [
                {
                  answerType: 'Im Hungry!',
                  text: 'text answer'
                }
              ]
            }
          }
        },
        attendeeType: 'ATTENDEE',
        productRegistrations: [
          {
            productId: 'admissionItemAId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          sessionAId: {
            productId: 'sessionAId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        }
      }
    }
  };
};

jest.mock('../event', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../event'),
    __esModule: true,
    getAdvancedSessionRules: jest.fn(() => [
      {
        id: 'advanceRuleId1',
        optionalSession: ['sessionAId'],
        isActive: true,
        min: 1,
        max: 1
      }
    ])
  };
});

const getVisibleProducts = () => {
  return {
    Sessions: {
      eventRegistrationAId: {
        admissionItems: {
          admissionItemAId: {
            applicableContactTypes: ['registrationTypeAId'],
            associatedRegistrationTypes: [],
            availableOptionalSessions: ['sessionIId', 'sessionJId'],
            displayOrder: 2,
            id: 'admissionItemAId',
            isOpenForRegistration: true,
            isVisibleToPrimary: true,
            limitOptionalSessionsToSelect: false
          }
        },
        sessionProducts: {
          sessionAId: {
            id: 'sessionAId',
            isOpenForRegistration: true,
            showOnAgenda: true,
            type: 'Session',
            name: 'Session A'
          },
          sessionDId: {
            id: 'sessionDId',
            isOpenForRegistration: true,
            showOnAgenda: false,
            type: 'Session',
            name: 'Session D'
          }
        },
        sortKeys: {
          sessionGroupAId: ['2016-10-10T21:20:20.935Z'],
          sessionAId: ['2016-10-09T21:20:20.935Z']
        }
      }
    },
    Widget: {
      sessionProducts: {
        sessionDId: {
          id: 'sessionDId',
          isOpenForRegistration: true
        },
        sessionAId: {
          id: 'sessionAId',
          isOpenForRegistration: true,
          status: 7
        }
      }
    }
  };
};

const getDefaultState = () => {
  return {
    registrationForm: {
      regCart: getDefaultRegCart()
    },
    regCartStatus: {
      modificationStartRegCart: getDefaultRegCart()
    },
    event: {
      products: {
        admissionItems: {
          admissionItemAId: {
            id: 'admissionItemAId',
            associatedRegistrationTypes: [],
            limitOptionalSessionsToSelect: false,
            availableOptionalSessions: ['sessionIId', 'sessionJId']
          },
          admissionItemBId: {
            id: 'admissionItemBId',
            associatedRegistrationTypes: [],
            limitOptionalSessionsToSelect: true,
            availableOptionalSessions: ['sessionAId', 'sessionHId', 'sessionKId']
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
                  isOpenForRegistration: true
                },
                sessionEId: {
                  id: 'sessionEId',
                  isOpenForRegistration: false
                },
                sessionFId: {
                  id: 'sessionFId',
                  isOpenForRegistration: true,
                  autoCloseDate: '2010-10-27T22:55:00.000Z'
                },
                sessionGId: {
                  id: 'sessionGId',
                  isOpenForRegistration: true,
                  autoCloseDate: '2020-10-27T22:55:00.000Z'
                },
                sessionPId: {
                  id: 'sessionPId',
                  isOpenForRegistration: true,
                  associatedRegistrationTypes: ['registrationTypeAId', 'registrationTypeBId']
                },
                sessionQId: {
                  id: 'sessionQId',
                  isOpenForRegistration: true,
                  associatedRegistrationTypes: ['registrationTypeBId']
                }
              }
            },
            sessionGroupBId: {
              id: 'sessionGroupBId',
              isOpenForRegistration: false,
              autoCloseDate: '2016-10-10T21:20:20.935Z',
              sessions: {
                sessionBId: {
                  id: 'sessionBId',
                  isOpenForRegistration: true
                },
                sessionCId: {
                  id: 'sessionCId',
                  isOpenForRegistration: true
                }
              }
            }
          },
          optionalSessions: {
            sessionAId: {
              id: 'sessionAId',
              isOpenForRegistration: true,
              showOnAgenda: true
            },
            sessionHId: {
              id: 'sessionHId',
              isOpenForRegistration: true,
              associatedRegistrationTypes: ['registrationTypeAId'],
              showOnAgenda: true
            },
            sessionIId: {
              id: 'sessionIId',
              isOpenForRegistration: true,
              associatedRegistrationTypes: ['registrationTypeBId']
            },
            sessionJId: {
              id: 'sessionJId',
              isOpenForRegistration: false,
              associatedRegistrationTypes: ['registrationTypeBId']
            },
            sessionKId: {
              id: 'sessionKId',
              isOpenForRegistration: true,
              autoCloseDate: '2010-10-27T22:55:00.000Z',
              associatedRegistrationTypes: ['registrationTypeAId']
            },
            sessionLId: {
              id: 'sessionLId',
              isOpenForRegistration: true,
              autoCloseDate: '2020-10-27T22:55:00.000Z',
              associatedRegistrationTypes: ['registrationTypeAId']
            }
          },
          includedSessions: {
            sessionMId: {
              id: 'sessionMId',
              isOpenForRegistration: true
            },
            sessionNId: {
              id: 'sessionNId',
              isOpenForRegistration: false
            },
            sessionOId: {
              id: 'sessionOId',
              isOpenForRegistration: true,
              status: 7
            }
          }
        }
      },
      registrationTypes: {
        registrationTypeAId: {
          id: 'registrationTypeAId',
          name: 'registrationTypeA'
        },
        registrationTypeBId: {
          id: 'registrationTypeBId',
          name: 'registrationTypeB'
        }
      }
    },
    appData: {
      registrationSettings: {
        productQuestions: {
          productQuestionId: {
            productQuestionAssociations: ['admissionItemAId'],
            question: {
              id: 'productQuestionId'
            }
          },
          productQuestionId1: {
            productQuestionAssociations: ['admissionItemAId1'],
            question: {
              id: 'productQuestionId1'
            }
          },
          optionalSessionQuestionId: {
            productQuestionAssociations: ['sessionAId'],
            question: {
              id: 'optionalSessionQuestionId'
            }
          },
          includedSessionQuestionId: {
            productQuestionAssociations: ['sessionNId'],
            question: {
              id: 'includedSessionQuestionId'
            }
          },
          sessionGroupSessionQuestionId: {
            productQuestionAssociations: ['sessionDId'],
            question: {
              id: 'sessionGroupSessionQuestionId'
            }
          }
        }
      }
    },
    defaultUserSession: { isPlanner: false },
    userSession: {},
    visibleProducts: {
      Sessions: {
        eventRegistrationAId: {
          admissionItems: {
            admissionItemAId: {
              applicableContactTypes: ['registrationTypeAId'],
              associatedRegistrationTypes: [],
              availableOptionalSessions: ['sessionIId', 'sessionJId'],
              displayOrder: 2,
              id: 'admissionItemAId',
              isOpenForRegistration: true,
              isVisibleToPrimary: true,
              limitOptionalSessionsToSelect: false
            }
          },
          quantityItems: {
            quantityItem1: {
              id: 'quantityItem1',
              capacityId: 'quantityItem1',
              name: 'Quantity Item Name',
              code: 'Quantity Item Code',
              description: 'Quantity Item Description',
              defaultFeeId: 'fee1',
              fees: {
                fee1: {
                  amount: 100,
                  name: 'Fee 1',
                  registrationTypes: [],
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      isActive: true
                    },
                    {
                      amount: 50,
                      effectiveUntil: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30).toISOString(),
                      isActive: true
                    }
                  ]
                }
              },
              displayOrder: 1,
              isOpenForRegistration: true,
              associatedRegistrationTypes: []
            },
            quantityItemNoFee: {
              id: 'quantityItemNoFee',
              capacityId: 'quantityItem1',
              name: 'Quantity Item No Fee',
              code: 'quantity Item Code 2',
              description: 'Quantity Item Description',
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              fees: {},
              displayOrder: 2,
              isOpenForRegistration: true,
              associatedRegistrationTypes: []
            },
            quantityItem2WithCap1: {
              id: 'quantityItem2WithCap1',
              capacityId: 'quantityItem2WithCap1',
              name: 'Quantity Item 2 With Cap 1',
              code: 'Quantity Item 2 Code',
              description: 'Quantity Item 2 Description',
              defaultFeeId: 'fee1',
              fees: {
                fee1: {
                  amount: 100,
                  name: 'Fee 1',
                  registrationTypes: [],
                  chargePolicies: [
                    {
                      amount: 100,
                      effectiveUntil: '2999-12-31T00:00:00.000Z',
                      isActive: true
                    },
                    {
                      amount: 50,
                      effectiveUntil: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30).toISOString(),
                      isActive: true
                    }
                  ]
                }
              },
              displayOrder: 3,
              isOpenForRegistration: true,
              associatedRegistrationTypes: []
            }
          },
          sessionProducts: {
            sessionGroupAId: {
              id: 'sessionGroupAId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  isOpenForRegistration: true,
                  name: 'Group A Session D'
                }
              }
            },
            sessionAId: {
              id: 'sessionAId',
              isOpenForRegistration: true,
              showOnAgenda: true,
              type: 'Session',
              name: 'Session A'
            }
          },
          sortKeys: {
            sessionGroupAId: ['2016-10-10T21:20:20.935Z'],
            sessionAId: ['2016-10-09T21:20:20.935Z']
          }
        }
      },
      Widget: {
        sessionProducts: {
          sessionIncId: {
            id: 'sessionIncId',
            isOpenForRegistration: true,
            showOnAgenda: true,
            type: 'Session',
            name: 'Included Session'
          }
        }
      }
    },
    registrationType: {
      registrationTypeBId: {
        id: 'registrationTypeBId'
      }
    }
  };
};

test('currentRegistrant.getEventRegistration returns the event registration', () => {
  const state = getDefaultState();
  expect(getEventRegistration(state)).toMatchSnapshot();
});

test('currentRegistrant.getAttendee returns the attendee', () => {
  const state = getDefaultState();
  expect(getAttendee(state)).toMatchSnapshot();
});

test('currentRegistrant.getAttendeeId returns the attendee id', () => {
  const state = getDefaultState();
  expect(getAttendeeId(state)).toMatchSnapshot();
});

test('currentRegistrant.getAttendeeStandardFieldAnswer returns undefined when the field does not exist.', () => {
  const state = getDefaultState();
  expect(getAttendeeStandardFieldAnswer(state, 'nonExistentPath')).toBeUndefined();
});

test('currentRegistrant.getAttendeeStandardFieldAnswer returns the answer', () => {
  const state = getDefaultState();
  expect(getAttendeeStandardFieldAnswer(state, 'firstName')).toMatchSnapshot();
});

test('currentRegistrant.getAttendeeCustomFieldAnswer returns undefined when the custom field does not exist.', () => {
  const state = getDefaultState();
  expect(getAttendeeCustomFieldAnswer(state, 'nonExistentId')).toBeUndefined();
});

test('currentRegistrant.getAttendeeCustomFieldAnswer returns the answer', () => {
  const state = getDefaultState();
  expect(getAttendeeCustomFieldAnswer(state, 'customFieldAId')).toMatchSnapshot();
});

test('currentRegistrant.getAttendeeQuestionAnswer returns undefined when the question does not exist.', () => {
  const state = getDefaultState();
  expect(getAttendeeQuestionAnswer(state, 'nonExistentId')).toBeUndefined();
});

test('currentRegistrant.getAttendeeQuestionAnswer returns the answer', () => {
  const state = getDefaultState();
  expect(getAttendeeQuestionAnswer(state, 'questionAId')).toMatchSnapshot();
});

test('currentRegistrant.getSelectedAdmissionItem returns the selected admission item', () => {
  const state = getDefaultState();
  expect(getSelectedAdmissionItem(state)).toMatchSnapshot();
});

test('currentRegistrant.getSelectedSessions returns the list of sessions', () => {
  const state = getDefaultState();
  expect(getSelectedSessions(state)).toMatchSnapshot();
});

test('productSelectors.getSortedVisibleSessionsForEventRegistration returns the list of visible sessions', () => {
  let state = getDefaultState();
  state = setIn(state, ['registrationForm', 'regCart'], getDefaultRegCart());
  const visibleSessions = getSortedVisibleSessionsForEventRegistration(
    getIn(state, ['visibleProducts']),
    getIn(state, ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistrationAId', 'eventRegistrationId'])
  );
  const expectedSessionKeys = ['sessionAId', 'sessionDId'];
  const expectedSessionNames = ['Session A', 'Group A Session D'];
  const sessionIds = Object.keys(visibleSessions);
  expect(sessionIds.length).toBe(2);
  for (let i = 0; i < sessionIds.length; i++) {
    expect(sessionIds[i]).toBe(expectedSessionKeys[i]);
    expect(visibleSessions[sessionIds[i]].name).toBe(expectedSessionNames[i]);
  }
});

test('productSelectors.getIncludedSessionsForEventRegistration returns the list of included sessions', () => {
  let state = getDefaultState();
  state = setIn(state, ['registrationForm', 'regCart'], getDefaultRegCart());
  const includedSessionInRegCart = {
    sessionIncId: {
      productId: 'sessionIncId',
      productType: 'Session',
      quantity: 1,
      requestedAction: 'REGISTER',
      registrationSourceType: 'Included'
    }
  };
  state = setIn(
    state,
    ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistrationAId', 'sessionRegistrations'],
    includedSessionInRegCart
  );
  const visibleSessions = getIncludedSessionsForEventRegistration(
    getIn(state, ['visibleProducts']),
    getIn(state, ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistrationAId', 'eventRegistrationId']),
    getIn(state, ['registrationForm', 'regCart', 'eventRegistrations'])
  );
  const expectedSessionKeys = ['sessionIncId'];
  const expectedSessionNames = ['Included Session'];
  const sessionIds = Object.keys(visibleSessions);
  expect(sessionIds.length).toBe(1);
  for (let i = 0; i < sessionIds.length; i++) {
    expect(sessionIds[i]).toBe(expectedSessionKeys[i]);
    expect(visibleSessions[sessionIds[i]].name).toBe(expectedSessionNames[i]);
  }
});

test('currentRegistrant.getSortedVisibleSessionsForEventRegistration returns empty when there are no sessions', () => {
  let state = getDefaultState();
  state = setIn(state, ['registrationForm', 'regCart'], getDefaultRegCart());
  state = setIn(state, ['registrationForm', 'regCart', 'eventRegistrations'], []);
  const visibleSessions = getSortedVisibleSessionsForEventRegistration(
    state,
    getIn(state, ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistrationAId', 'eventRegistrationId'])
  );
  expect(visibleSessions).toHaveLength(0);
});

describe('currentRegistrant.modificationStart', () => {
  let state;
  beforeEach(() => {
    state = getDefaultState();
    state.registrationForm.regCart.regMod = true;
  });

  test('.getEventRegistration returns the event registration', () => {
    expect(modificationStart.getEventRegistration(state)).toMatchSnapshot();
  });

  test('.getAttendee returns the attendee', () => {
    expect(modificationStart.getAttendee(state)).toMatchSnapshot();
  });

  test('.getAttendeeId returns the attendee id', () => {
    expect(modificationStart.getAttendeeId(state)).toMatchSnapshot();
  });

  test(`.getAttendeeStandardFieldAnswer
    returns undefined when the field does not exist.`, () => {
    expect(modificationStart.getAttendeeStandardFieldAnswer(state, 'nonExistentPath')).toBeUndefined();
  });

  test('.getAttendeeStandardFieldAnswer returns the answer', () => {
    expect(modificationStart.getAttendeeStandardFieldAnswer(state, 'firstName')).toMatchSnapshot();
  });

  test('.getAttendeeCustomFieldAnswer returns undefined when the custom field does not exist.', () => {
    expect(modificationStart.getAttendeeCustomFieldAnswer(state, 'nonExistentId')).toBeUndefined();
  });

  test('.getAttendeeCustomFieldAnswer returns the answer', () => {
    expect(modificationStart.getAttendeeCustomFieldAnswer(state, 'customFieldAId')).toMatchSnapshot();
  });

  test('.getAttendeeQuestionAnswer returns undefined when the question does not exist.', () => {
    expect(modificationStart.getAttendeeQuestionAnswer(state, 'nonExistentId')).toBeUndefined();
  });

  test('.getAttendeeQuestionAnswer returns the answer', () => {
    expect(modificationStart.getAttendeeQuestionAnswer(state, 'questionAId')).toMatchSnapshot();
  });

  test('.getRegisteredAdmissionItem returns the set of admission items', () => {
    expect(modificationStart.getRegisteredAdmissionItem(state)).toMatchSnapshot();
  });

  test('.getRegisteredSessions returns the list of sessions', () => {
    expect(modificationStart.getRegisteredSessions(state)).toMatchSnapshot();
  });

  test('.getRegisteredQuantityItems returns the list of quantity items', () => {
    const regCart = getDefaultRegCart();
    const updatedRegCart = setIn(
      regCart,
      ['eventRegistrations', ['eventRegistrationAId'], 'quantityItemRegistrations'],
      {
        quantityItem1: {
          productId: 'quantityItem1',
          quantity: 2
        },
        quantityItemNoFee: {
          productId: 'quantityItemNoFee',
          quantity: 4
        }
      }
    );
    const stateWithQuantityItems = setIn(getDefaultState(), ['registrationForm', 'regCart'], updatedRegCart);
    expect(modificationStart.getRegisteredQuantityItems(stateWithQuantityItems)).toMatchSnapshot();
  });
});

test('currentRegistrant.isQuestionVisible returns if question is visible', () => {
  const state = merge({}, getDefaultState(), {
    registrationForm: {
      regCart: {
        eventRegistrations: {
          [PRIMARY_INVITEE_REGISTRATION_ID]: {
            sessionRegistrations: {
              sessionDId: {
                productId: 'sessionDId',
                requestedAction: 'REGISTER'
              }
            }
          }
        }
      }
    }
  });
  const config = {
    id: 'productQuestionId',
    appData: {
      question: {}
    }
  };
  expect(isQuestionVisible(state, config)).toMatchSnapshot(
    'currentRegistrant.isQuestionVisible returns true when associated to selected admission item'
  );
  config.id = 'productQuestionId1';
  expect(isQuestionVisible(state, config)).toMatchSnapshot(
    'currentRegistrant.isQuestionVisible returns false when associated to non-selected admission item'
  );
  config.id = 'optionalSessionQuestionId';
  expect(isQuestionVisible(state, config)).toMatchSnapshot(
    'currentRegistrant.isQuestionVisible returns true when associated to selected optional session'
  );
  config.id = 'includedSessionQuestionId';
  expect(isQuestionVisible(state, config)).toMatchSnapshot(
    'currentRegistrant.isQuestionVisible returns false when associated to non-selected included session'
  );
  config.id = 'sessionGroupSessionQuestionId';
  expect(isQuestionVisible(state, config)).toMatchSnapshot(
    'currentRegistrant.isQuestionVisible returns true when associated to selected session in session group'
  );
});

test('currentRegistrant.guestRegistrantsCount returns guest registration count', () => {
  const state = getDefaultState();
  expect(guestRegistrantsCount(state)).toBe(2);
  expect(guestRegistrantsCount(state)).toMatchSnapshot(
    'currentRegistrant.guestRegistrantsCount returns guest registration count'
  );
});

test('Session register, unregister, association, waitlist, unwaitlist count selectors return correct values', () => {
  const regCart = getDefaultRegCart();
  /*
   * sessionAId: 1 primary + 2 guests registered
   * sessionBId: 1 guest registered
   *sessionCId: 1 guest unregistered
   */
  const regCartWithGuestSessions = {
    ...regCart,
    eventRegistrations: {
      ...regCart.eventRegistrations,
      eventRegistrationCId: {
        eventRegistrationId: 'eventRegistrationCId',
        eventId: 'EventBId',
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        registrationTypeId: 'registrationTypeBId',
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        productRegistrations: [
          {
            productId: 'admissionItemAId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'REGISTER'
          }
        ],
        sessionRegistrations: {
          sessionAId: {
            productId: 'sessionAId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER'
          },
          sessionBId: {
            productId: 'sessionBId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER',
            registrationSourceType: 'AdmissionItem'
          },
          sessionCId: {
            productId: 'sessionCId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'UNREGISTER'
          },
          sessionFId: {
            productId: 'sessionFId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER',
            registrationSourceType: 'Track'
          }
        },
        sessionBundleRegistrations: {
          sessionBundleAId: {
            productId: 'sessionBundleAId',
            requestedAction: 'REGISTER'
          },
          sessionBundleBId: {
            productId: 'sessionBundleBId',
            requestedAction: 'UNREGISTER'
          }
        },
        sessionWaitlists: {
          sessionDId: {
            productId: 'sessionDId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'WAITLIST'
          },
          sessionEId: {
            productId: 'sessionEId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'LEAVE_WAITLIST'
          }
        },
        requestedAction: 'REGISTER'
      }
    }
  };
  const state = getDefaultState();
  const stateWithGuestSessions = setIn(state, ['registrationForm', 'regCart'], regCartWithGuestSessions);

  expect(getSessionRegistrationCount(stateWithGuestSessions, 'sessionAId')).toEqual(4);
  expect(getSessionRegistrationCount(stateWithGuestSessions, 'sessionBId')).toEqual(0);
  expect(getSessionUnregisterCount(stateWithGuestSessions, 'sessionCId')).toEqual(1);
  expect(getSessionCountWithAdmissionItemAssociation(stateWithGuestSessions, 'sessionBId')).toEqual(1);
  expect(getSessionCountWithSessionBundleAssociation(stateWithGuestSessions, 'sessionFId')).toEqual(1);
  expect(getSessionWaitlistCount(stateWithGuestSessions, 'sessionDId')).toEqual(1);
  expect(getSessionUnWaitlistCount(stateWithGuestSessions, 'sessionEId')).toEqual(1);
  expect(getSessionBundleRegistrationCount(stateWithGuestSessions, 'sessionBundleAId')).toEqual(1);
});

test('productSelectors.getQuantityItemInfoForPrimary returns correct selected quantity items', () => {
  const regCart = getDefaultRegCart();
  /*
   * quantityItem1: 2 primary
   * quantityItemNoFee: 4 primary
   */
  const updatedRegCart = setIn(regCart, ['eventRegistrations', ['eventRegistrationAId'], 'quantityItemRegistrations'], {
    quantityItem1: {
      productId: 'quantityItem1',
      quantity: 2
    },
    quantityItemNoFee: {
      productId: 'quantityItemNoFee',
      quantity: 4
    }
  });
  const state = getDefaultState();
  const stateWithQuantityItems = setIn(state, ['registrationForm', 'regCart'], updatedRegCart);
  const expectedQuantityItemInfo = {
    quantityItem1: {
      eventRegistrationId: 'eventRegistrationAId',
      attendee: {
        personalInformation: {
          firstName: 'floofykins',
          lastName: 'snuffles'
        }
      },
      quantity: 2
    },
    quantityItemNoFee: {
      eventRegistrationId: 'eventRegistrationAId',
      attendee: {
        personalInformation: {
          firstName: 'floofykins',
          lastName: 'snuffles'
        }
      },
      quantity: 4
    }
  };
  expect(getQuantityItemInfoForPrimary(stateWithQuantityItems)).toEqual(expectedQuantityItemInfo);
  expect(getQuantityItemInfoForPrimary(stateWithQuantityItems)).toMatchSnapshot(
    'productSelectors.getQuantityItemInfoForPrimaryreturns correct selected quantities'
  );
});

describe('currentRegistrant.getTemporaryGuestEventRegistrationId returns correct guest eventRegId', () => {
  test('currentRegistrant.getTemporaryGuestEventRegistrationId exists in state', () => {
    const state = getDefaultState();
    const stateWithGuestEventRegProperty = setIn(state, ['registrationForm', 'currentGuestEventRegistration'], {
      eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID
    });

    expect(getTemporaryGuestEventRegistrationId(stateWithGuestEventRegProperty)).toBe(TEMPORARY_GUEST_REGISTRATION_ID);
    expect(getTemporaryGuestEventRegistrationId(stateWithGuestEventRegProperty)).toMatchSnapshot(
      'currentRegistrant.getTemporaryGuestEventRegistrationId returns correct guest eventRegId'
    );
  });

  test('currentRegistrant.getTemporaryGuestEventRegistrationId does not exist in state', () => {
    const state = getDefaultState();

    expect(getTemporaryGuestEventRegistrationId(state)).toBeUndefined();
    expect(getTemporaryGuestEventRegistrationId(state)).toMatchSnapshot(
      'currentRegistrant.getTemporaryGuestEventRegistrationId returns undefined if property missing'
    );
  });
});

describe('currentRegistrant.getConfirmedGuests', () => {
  // setup
  const state = getDefaultState();
  const stateWithTemporaryGuestSet = setIn(state, ['registrationForm', 'currentGuestEventRegistration'], {
    eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID
  });

  // execute
  const confirmedGuests = getConfirmedGuests(stateWithTemporaryGuestSet);

  // verify
  test('> does not return parent invitee', () => {
    expect(confirmedGuests.find(g => g.eventRegistrationId === PRIMARY_INVITEE_REGISTRATION_ID)).toBe(undefined);
  });
  test('> does not return temporary guest', () => {
    expect(confirmedGuests.find(g => g.eventRegistrationId === TEMPORARY_GUEST_REGISTRATION_ID)).toBe(undefined);
  });
  test('> returns confirmed guests', () => {
    expect(confirmedGuests.length).toBe(1);
    expect(confirmedGuests[0].eventRegistrationId).toBe(CONFIRMED_GUEST_REGISTRATION_ID);
  });
});

test('currentRegistrant.getAdmissionItemInfoForPrimaryAndGuests returns correct registered and unregisted counts', () => {
  const regCart = getDefaultRegCart();
  /*
   * admissionItemAId: 1 primary + 1 guests registered
   * admissionItemBId: 1 guest registered
   *admissionItemCId: 1 guest unregistered
   */
  const regCartWithGuestSessions = {
    ...regCart,
    eventRegistrations: {
      ...regCart.eventRegistrations,
      eventRegistrationCId: {
        eventRegistrationId: 'eventRegistrationCId',
        eventId: 'EventBId',
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        registrationTypeId: 'registrationTypeBId',
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        productRegistrations: [
          {
            productId: 'admissionItemCId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'UNREGISTER'
          }
        ],
        sessionRegistrations: {},
        requestedAction: 'REGISTER'
      }
    }
  };
  const state = getDefaultState();
  const stateWithGuestAdmissionItems = setIn(state, ['registrationForm', 'regCart'], regCartWithGuestSessions);
  const expectedAdmissionItemInfo = {
    admissionItemAId: {
      registered: [
        {
          attendee: {
            attendeeId: 'attendeeCId',
            personalInformation: {}
          },
          eventRegistrationId: 'eventRegistrationDId'
        },
        {
          attendee: {
            attendeeId: 'attendeeAId',
            personalInformation: {
              firstName: 'floofykins',
              lastName: 'snuffles',
              emailAddress: 'floofykins.snuffles@j.mail',
              socialMediaUrls: {
                FACEBOOK: 'http://www.facebook.com/YourChosenName'
              },
              customFields: {
                customFieldAId: {
                  questionId: 'customFieldAId',
                  answers: [
                    {
                      answerType: 'I am a dragon!',
                      text: 'text answer'
                    }
                  ]
                }
              }
            },
            eventAnswers: {
              eventAnswerAId: {
                questionId: 'eventAnswerAId',
                answers: [
                  {
                    answerType: 'Im Hungry!',
                    text: 'text answer'
                  }
                ]
              }
            }
          },
          eventRegistrationId: 'eventRegistrationAId'
        }
      ],
      unRegistered: []
    },
    admissionItemBId: {
      registered: [
        {
          attendee: {
            attendeeId: 'attendeeBId',
            personalInformation: {}
          },
          eventRegistrationId: 'eventRegistrationBId'
        }
      ],
      unRegistered: []
    },
    admissionItemCId: {
      registered: [],
      unRegistered: [
        {
          attendee: {
            attendeeId: 'attendeeCId',
            personalInformation: {}
          },
          eventRegistrationId: 'eventRegistrationCId'
        }
      ]
    }
  };
  expect(getAdmissionItemInfoForPrimaryAndGuests(stateWithGuestAdmissionItems)).toEqual(expectedAdmissionItemInfo);
  expect(getAdmissionItemInfoForPrimaryAndGuests(stateWithGuestAdmissionItems)).toMatchSnapshot(
    'currentRegistrant.getAdmissionItemInfoForPrimaryAndGuestsreturns correct registered and unregistered counts'
  );
});

describe('currentRegistrant.getRegistrationTypesForPrimaryAndGuests returns correct registration types', () => {
  /*
   * registrationTypeAId: 1 primary
   * registrationTypeBId: 1 guest registered
   */
  const state = getDefaultState();
  test('returns all reg type ids when allowed attendee type are invitees and guests', () => {
    // only the registered adm item Ids of both primary and guest are expected
    const expectedRegTypes = ['registrationTypeBId', 'registrationTypeAId'];
    expect(getRegistrationTypesForPrimaryAndGuests(state, ATTENDEE_TYPE_INVITEE_AND_GUEST)).toEqual(expectedRegTypes);
  });

  test('returns only primary reg type id when allowed attendee type are invitees only', () => {
    // only the registered adm item Ids of both primary and guest are expected
    const expectedRegTypes = ['registrationTypeAId'];
    expect(getRegistrationTypesForPrimaryAndGuests(state)).toEqual(expectedRegTypes);
  });
});

describe('currentRegistrant.getRegisteredAdmissionItemForPrimaryAndGuests returns correct adm item ids', () => {
  const regCart = getDefaultRegCart();
  /*
   * admissionItemAId: 1 primary + 1 guests registered
   * admissionItemBId: 1 guest registered
   * admissionItemCId: 1 guest unregistered
   */
  const regCartWithGuestSessions = {
    ...regCart,
    eventRegistrations: {
      ...regCart.eventRegistrations,
      eventRegistrationCId: {
        eventRegistrationId: 'eventRegistrationCId',
        eventId: 'EventBId',
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        registrationTypeId: 'registrationTypeBId',
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        productRegistrations: [
          {
            productId: 'admissionItemCId',
            productType: 'AdmissionItem',
            quantity: 1,
            requestedAction: 'UNREGISTER'
          }
        ],
        sessionRegistrations: {},
        requestedAction: 'REGISTER'
      }
    }
  };
  const state = getDefaultState();
  const stateWithGuestAdmissionItems = setIn(state, ['registrationForm', 'regCart'], regCartWithGuestSessions);

  test('returns all admission item ids when allowed attendee type are invitees and guests', () => {
    // only the registered adm item Ids of both primary and guest are expected
    const expectedAdmissionItemIds = ['admissionItemBId', 'admissionItemAId'];
    expect(
      getRegisteredAdmissionItemForPrimaryAndGuests(stateWithGuestAdmissionItems, ATTENDEE_TYPE_INVITEE_AND_GUEST)
    ).toEqual(expectedAdmissionItemIds);
  });

  test('returns only primary invitee admission item ids when allowed attendee type are invitees only', () => {
    // only the registered adm item Ids of both primary and guest are expected
    const expectedAdmissionItemIds = ['admissionItemAId'];
    expect(getRegisteredAdmissionItemForPrimaryAndGuests(stateWithGuestAdmissionItems)).toEqual(
      expectedAdmissionItemIds
    );
  });
});

test('productSelectors.getPrimarySortedVisibleAdmissionItems returns available admission items for primary in sorted order', () => {
  const state = getDefaultState();
  /*
   * should show the same as admission items in visible products.
   */
  const expectedAdmissionItemInfo = {
    admissionItemAId: {
      applicableContactTypes: ['registrationTypeAId'],
      associatedRegistrationTypes: [],
      availableOptionalSessions: ['sessionIId', 'sessionJId'],
      displayOrder: 2,
      id: 'admissionItemAId',
      isOpenForRegistration: true,
      isVisibleToPrimary: true,
      limitOptionalSessionsToSelect: false
    }
  };
  expect(getPrimarySortedVisibleAdmissionItems(state)).toMatchSnapshot();
  expect(getPrimarySortedVisibleAdmissionItems(state)).toEqual(expectedAdmissionItemInfo);
});

test('productSelectors.getPrimaryAndGuestSortedVisibleAdmissionItems returns available admission items for primary and guest in sorted order', () => {
  const defaultState = getDefaultState();
  const visibleProducts = defaultState.visibleProducts;
  const state = {
    ...defaultState,
    visibleProducts: {
      Sessions: {
        ...visibleProducts.Sessions,
        eventRegistrationBId: {
          admissionItems: {
            admissionItemBId: {
              id: 'admissionItemBId',
              associatedRegistrationTypes: [],
              limitOptionalSessionsToSelect: true,
              availableOptionalSessions: ['sessionAId', 'sessionHId', 'sessionKId'],
              displayOrder: 1
            }
          }
        }
      }
    }
  };
  /*
   * should show the same as visible products.
   */
  const expectedAdmissionItemInfo = {
    admissionItemAId: {
      applicableContactTypes: ['registrationTypeAId'],
      associatedRegistrationTypes: [],
      availableOptionalSessions: ['sessionIId', 'sessionJId'],
      displayOrder: 2,
      id: 'admissionItemAId',
      isOpenForRegistration: true,
      isVisibleToPrimary: true,
      limitOptionalSessionsToSelect: false
    },
    admissionItemBId: {
      id: 'admissionItemBId',
      associatedRegistrationTypes: [],
      limitOptionalSessionsToSelect: true,
      availableOptionalSessions: ['sessionAId', 'sessionHId', 'sessionKId'],
      displayOrder: 1
    }
  };
  expect(getPrimaryAndGuestSortedVisibleAdmissionItems(state)).toMatchSnapshot();
  expect(getPrimaryAndGuestSortedVisibleAdmissionItems(state)).toEqual(expectedAdmissionItemInfo);
});

test('productSelectors.getPrimarySortedVisibleSessions returns available session products for primary in sorted order', () => {
  const state = getDefaultState();
  /*
   * should show the same as session products in visible products. with exact the same order
   */
  const expectedSessionProductsInfo = [
    {
      id: 'sessionAId',
      isOpenForRegistration: true,
      showOnAgenda: true,
      type: 'Session',
      name: 'Session A'
    },
    {
      id: 'sessionGroupAId',
      isOpenForRegistration: true,
      sessions: {
        sessionDId: {
          id: 'sessionDId',
          isOpenForRegistration: true,
          name: 'Group A Session D'
        }
      }
    }
  ];
  expect(getPrimarySortedVisibleSessions(state)).toMatchSnapshot();
  expect(getPrimarySortedVisibleSessions(state)).toEqual(expectedSessionProductsInfo);
});

test('productSelectors.getPrimaryAndGuestSortedVisibleSessions returns available sessionProducts for primary and guest in sorted order', () => {
  const defaultState = getDefaultState();
  const visibleProducts = defaultState.visibleProducts;
  const state = {
    ...defaultState,
    visibleProducts: {
      Sessions: {
        ...visibleProducts.Sessions,
        eventRegistrationBId: {
          sessionProducts: {
            sessionGroupAId: {
              id: 'sessionGroupAId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  isOpenForRegistration: true
                },
                sessionPId: {
                  id: 'sessionPId',
                  isOpenForRegistration: true
                },
                sessionQId: {
                  id: 'sessionQId',
                  isOpenForRegistration: true
                }
              }
            },
            sessionIId: {
              id: 'sessionIId',
              isOpenForRegistration: true,
              associatedRegistrationTypes: ['registrationTypeBId'],
              type: 'Session'
            }
          },
          sortKeys: {
            sessionGroupAId: ['2016-10-10T21:20:20.935Z'],
            sessionIId: ['2016-10-10T23:20:20.935Z']
          }
        }
      }
    }
  };
  /*
   * should show the same as session products in visible products, which is ordered by start time.
   */
  const expectedSessionProductsInfo = [
    {
      id: 'sessionAId',
      isOpenForRegistration: true,
      showOnAgenda: true,
      type: 'Session',
      name: 'Session A'
    },
    {
      id: 'sessionGroupAId',
      isOpenForRegistration: true,
      sessions: {
        sessionDId: {
          id: 'sessionDId',
          isOpenForRegistration: true,
          name: 'Group A Session D'
        },
        sessionPId: {
          id: 'sessionPId',
          isOpenForRegistration: true
        },
        sessionQId: {
          id: 'sessionQId',
          isOpenForRegistration: true
        }
      }
    },
    {
      id: 'sessionIId',
      isOpenForRegistration: true,
      associatedRegistrationTypes: ['registrationTypeBId'],
      type: 'Session'
    }
  ];
  expect(getPrimaryAndGuestSortedVisibleSessions(state)).toMatchSnapshot();
  expect(getPrimaryAndGuestSortedVisibleSessions(state)).toEqual(expectedSessionProductsInfo);
});

test('productSelectors.getSessionsVisibleToPrimary returns available sessions that are visible to primary, which includes sessions in sesson group.', () => {
  const state = getDefaultState();
  /*
   * should show the same as session products in visible products, which is ordered by start time.
   */
  const expectedSessionInfo = ['sessionAId', 'sessionGroupAId', 'sessionDId'];
  expect(getSessionsVisibleToPrimary(state)).toMatchSnapshot();
  expect(getSessionsVisibleToPrimary(state)).toEqual(expectedSessionInfo);
});

describe('currentRegistrant.getTemporaryGuestEventRegistration returns correct guest eventRegistration', () => {
  test('temporary guest eventReg exists in state', () => {
    const state = getDefaultState();
    const temporaryGuestEventReg = {
      eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID
    };
    const stateWithGuestEventRegProperty = setIn(
      state,
      ['registrationForm', 'currentGuestEventRegistration'],
      temporaryGuestEventReg
    );
    expect(getTemporaryGuestEventRegistration(stateWithGuestEventRegProperty)).toBe(temporaryGuestEventReg);
  });

  test('temporary guest eventReg does not exist in state', () => {
    const state = getDefaultState();
    expect(getTemporaryGuestEventRegistration(state)).toBeUndefined();
  });
});

describe('currentRegistrant.isProductVisibleForEventRegistration', () => {
  const defaultState = merge({}, getDefaultState(), {
    registrationForm: {
      regCart: {
        regCartId: 'regCartAId',
        eventRegistrations: {
          [CONFIRMED_GUEST_REGISTRATION_ID]: {
            eventId: 'EventAId',
            registrationTypeId: 'registrationTypeAId'
          }
        }
      }
    },
    visibleProducts: {
      Sessions: {
        eventRegistrationDId: {
          admissionItems: {
            admissionItemAId: {
              applicableContactTypes: ['registrationTypeAId'],
              associatedRegistrationTypes: [],
              availableOptionalSessions: ['sessionIId', 'sessionJId'],
              id: 'admissionItemAId',
              isOpenForRegistration: true,
              isVisibleToPrimary: true,
              limitOptionalSessionsToSelect: false
            }
          },
          sessionProducts: {
            sessionGroupAId: {
              id: 'sessionGroupAId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  isOpenForRegistration: true
                }
              }
            },
            sessionAId: {
              id: 'sessionAId',
              isOpenForRegistration: true,
              showOnAgenda: true
            }
          }
        }
      }
    }
  });
  test('currentRegistrant.isProductVisibleForEventRegistration returns true if admission product is visible', () => {
    expect(
      isProductVisibleForEventRegistration(
        defaultState.visibleProducts,
        'admissionItemAId',
        CONFIRMED_GUEST_REGISTRATION_ID
      )
    ).toBe(true);
  });
  test('currentRegistrant.isProductVisibleForEventRegistration returns true if session is visible', () => {
    expect(
      isProductVisibleForEventRegistration(defaultState.visibleProducts, 'sessionAId', CONFIRMED_GUEST_REGISTRATION_ID)
    ).toBe(true);
  });
  test('currentRegistrant.isProductVisibleForEventRegistration returns true if session group is visible', () => {
    expect(
      isProductVisibleForEventRegistration(
        defaultState.visibleProducts,
        'sessionGroupAId',
        CONFIRMED_GUEST_REGISTRATION_ID
      )
    ).toBe(true);
  });
  test('currentRegistrant.isProductVisibleForEventRegistration returns false if admission product is not visible', () => {
    expect(
      isProductVisibleForEventRegistration(
        defaultState.visibleProducts,
        'admissionItemBId',
        CONFIRMED_GUEST_REGISTRATION_ID
      )
    ).toBe(false);
  });
  test('currentRegistrant.isProductVisibleForEventRegistration returns false if session is not visible', () => {
    expect(
      isProductVisibleForEventRegistration(defaultState.visibleProducts, 'sessionIId', CONFIRMED_GUEST_REGISTRATION_ID)
    ).toBe(false);
  });
  test('currentRegistrant.isProductVisibleForEventRegistration returns false if session group is not visible', () => {
    expect(
      isProductVisibleForEventRegistration(
        defaultState.visibleProducts,
        'sessionGroupBId',
        CONFIRMED_GUEST_REGISTRATION_ID
      )
    ).toBe(false);
  });
});

describe('productSelectors.getPrimaryAndGuestVisibleEventRegistration', () => {
  test('productSelectors.getPrimaryAndGuestVisibleEventRegistration returns available event registrations for primary', () => {
    const state = getDefaultState();
    expect(getPrimaryAndGuestVisibleEventRegistration(state)).toMatchSnapshot();
  });

  test('productSelectors.getPrimaryAndGuestVisibleEventRegistration returns available event Registration for primary and guest', () => {
    let defaultState = getDefaultState();
    const visibleProducts = defaultState.visibleProducts;
    defaultState = setIn(
      defaultState,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistrationAId', 'registrationPathId'],
      'regPathId'
    );
    defaultState = setIn(
      defaultState,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'guestRegistrationSettings',
        'isGuestProductSelectionEnabled'
      ],
      true
    );
    const state = {
      ...defaultState,
      visibleProducts: {
        Sessions: {
          ...visibleProducts.Sessions,
          eventRegistrationBId: {
            sessionProducts: {
              sessionGroupBId: {
                id: 'sessionGroupBId',
                isOpenForRegistration: true,
                sessions: {
                  sessionDId: {
                    id: 'sessionDId',
                    isOpenForRegistration: true
                  }
                }
              },
              sessionIId: {
                id: 'sessionIId',
                isOpenForRegistration: true,
                associatedRegistrationTypes: ['registrationTypeBId'],
                type: 'Session'
              }
            }
          }
        }
      }
    };
    expect(getPrimaryAndGuestVisibleEventRegistration(state)).toMatchSnapshot();
  });

  test('productSelectors.getPrimaryAndGuestVisibleEventRegistration returns no event registrations for primary, if the session group is not visible for selected admission item in Reg Mod', () => {
    const defaultState = getDefaultState();
    const visibleProducts = defaultState.visibleProducts;
    const state = {
      ...defaultState,
      visibleProducts: {
        Sessions: {
          ...visibleProducts.Sessions,
          eventRegistrationAId: {
            ...visibleProducts.Sessions.eventRegistrationAId,
            skipValidationItems: ['sessionGroupAId']
          }
        }
      }
    };
    expect(getPrimaryAndGuestVisibleEventRegistration(state)).toMatchSnapshot();
  });

  test('productSelectors.getPrimaryAndGuestVisibleEventRegistration returns available event Registration for primary and guest, when the session group is not visible for the guest', () => {
    let defaultState = getDefaultState();
    const visibleProducts = defaultState.visibleProducts;
    defaultState = setIn(
      defaultState,
      ['registrationForm', 'regCart', 'eventRegistrations', 'eventRegistrationAId', 'registrationPathId'],
      'regPathId'
    );
    defaultState = setIn(
      defaultState,
      [
        'appData',
        'registrationSettings',
        'registrationPaths',
        'regPathId',
        'guestRegistrationSettings',
        'isGuestProductSelectionEnabled'
      ],
      true
    );
    const state = {
      ...defaultState,
      visibleProducts: {
        Sessions: {
          ...visibleProducts.Sessions,
          eventRegistrationBId: {
            sessionProducts: {
              sessionGroupBId: {
                id: 'sessionGroupBId',
                isOpenForRegistration: true,
                sessions: {
                  sessionDId: {
                    id: 'sessionDId',
                    isOpenForRegistration: true
                  }
                }
              },
              sessionIId: {
                id: 'sessionIId',
                isOpenForRegistration: true,
                associatedRegistrationTypes: ['registrationTypeBId'],
                type: 'Session'
              }
            },
            skipValidationItems: ['sessionGroupBId']
          }
        }
      }
    };
    expect(getPrimaryAndGuestVisibleEventRegistration(state)).toMatchSnapshot();
  });
});

test('productSelectors.getAllSortedSessions returns sessions for agenda widget', () => {
  const defaultState = getDefaultState();
  const visibleProducts = defaultState.visibleProducts;
  const state = {
    ...defaultState,
    visibleProducts: {
      ...visibleProducts.Sessions,
      'Agenda:agendaWidgetId': {
        sessionProducts: {
          sessionGroupBId: {
            id: 'sessionGroupBId',
            isOpenForRegistration: true,
            sessions: {
              sessionDId: {
                id: 'sessionDId',
                isOpenForRegistration: true
              }
            }
          },
          sessionDId: {
            id: 'sessionDId',
            isOpenForRegistration: true
          }
        }
      }
    }
  };
  expect(getAllSortedSessions(state, 'Agenda', 'agendaWidgetId')).toMatchSnapshot();
});

test('productSelectors.getAllSortedAdmissionItemsForWidget returns admission items for registration summary widget', () => {
  const defaultState = getDefaultState();
  const visibleProducts = defaultState.visibleProducts;
  const state = {
    ...defaultState,
    visibleProducts: {
      ...visibleProducts.Sessions,
      Widget: {
        admissionItems: {
          admissionItemAId: {
            id: 'admissionItemAId',
            isOpenForRegistration: true,
            type: 'AdmissionItem'
          }
        }
      }
    }
  };
  expect(getAllSortedAdmissionItemsForWidget(state)).toMatchSnapshot();
});

test('productSelectors.getAllSortedAdmissionItems returns admission items for agenda widget', () => {
  const defaultState = getDefaultState();
  const visibleProducts = defaultState.visibleProducts;
  const state = {
    ...defaultState,
    visibleProducts: {
      ...visibleProducts.Sessions,
      'InviteeAgenda:inviteeAgendaWidgetId': {
        registrationTypeAId: {
          admissionItems: {
            admissionItemAId: {
              id: 'admissionItemAId',
              isOpenForRegistration: true,
              type: 'AdmissionItem'
            }
          }
        }
      }
    }
  };
  expect(getAllSortedAdmissionItems(state, 'InviteeAgenda', 'inviteeAgendaWidgetId', true)).toMatchSnapshot();
});

describe('productSelectors.getSelectedSessionDefinitions', () => {
  test('returns selected session definitions for invitee agenda widget', () => {
    const defaultState = getDefaultState();
    const visibleProducts = defaultState.visibleProducts;
    const state = {
      ...defaultState,
      visibleProducts: {
        ...visibleProducts.Sessions,
        'InviteeAgenda:inviteeAgendaWidgetId': {
          sessionProducts: {
            sessionGroupBId: {
              id: 'sessionGroupBId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  isOpenForRegistration: true
                }
              }
            },
            sessionDId: {
              id: 'sessionDId',
              isOpenForRegistration: true
            },
            sessionAId: {
              id: 'sessionAId',
              isOpenForRegistration: true
            }
          }
        }
      }
    };
    expect(getSelectedSessionDefinitions(state, 'InviteeAgenda', 'inviteeAgendaWidgetId')).toMatchSnapshot();
  });

  test('returns selected session definitions for sessions widget', () => {
    const state = getDefaultState();
    expect(getSelectedSessionDefinitions(state)).toMatchSnapshot();
  });
});

test('productSelectors.getAllSortedSessionsForPayments returns session with cancelled sessions.', () => {
  const defaultState = getDefaultState();
  const state = {
    ...defaultState,
    visibleProducts: getVisibleProducts()
  };
  const visibleSessions = getAllSortedSessionsForPayments(state);
  expect(visibleSessions.length).toBe(2);
});

test('productSelectors.getAllSortedSessions returns session without cancelled sessions.', () => {
  const defaultState = getDefaultState();
  const state = {
    ...defaultState,
    visibleProducts: getVisibleProducts()
  };
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 3-4 arguments, but got 5.
  const visibleSessionsWithoutCancelledSessions = getAllSortedSessions(state, 'Widget', null, false, true);
  expect(visibleSessionsWithoutCancelledSessions.length).toBe(1);
});
test('productSelectors.getGuestSelectedSessionDefinitions returns selected session definitions for guests', () => {
  const defaultState = getDefaultState();
  const visibleProducts = defaultState.visibleProducts;
  const state = {
    ...defaultState,
    visibleProducts: {
      Sessions: {
        eventRegistrationAId: {
          ...visibleProducts.Sessions.eventRegistrationAId,
          sessionGroupBId: {
            id: 'sessionGroupBId',
            isOpenForRegistration: true,
            sessions: {
              sessionDId: {
                id: 'sessionDId',
                isOpenForRegistration: true
              }
            }
          }
        },
        eventRegistrationBId: {
          sessionProducts: {
            sessionGroupBId: {
              id: 'sessionGroupBId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  isOpenForRegistration: true
                }
              }
            },
            sessionIId: {
              id: 'sessionIId',
              isOpenForRegistration: true,
              associatedRegistrationTypes: ['registrationTypeBId'],
              type: 'Session'
            },
            sessionHId: {
              id: 'sessionHId',
              isOpenForRegistration: true,
              associatedRegistrationTypes: ['registrationTypeAId'],
              showOnAgenda: true
            }
          },
          sortKeys: {
            sessionGroupBId: ['2016-10-10T21:20:20.935Z'],
            sessionIId: ['2016-10-10T21:20:20.935Z'],
            sessionHId: ['2016-10-10T21:20:20.935Z']
          }
        }
      }
    }
  };
  expect(getGuestSelectedSessionDefinitions(state)).toMatchSnapshot();
});

describe('productSelectors.getGuestSelectedSessionDefinitionsByGuest returns expected session definitions', () => {
  test('productSelectors.getGuestSelectedSessionDefinitionsByGuest returns selected session definitions for guest', () => {
    const defaultState = getDefaultState();
    const visibleProducts = defaultState.visibleProducts;
    const state = {
      ...defaultState,
      visibleProducts: {
        Sessions: {
          eventRegistrationAId: {
            ...visibleProducts.Sessions.eventRegistrationAId,
            sessionGroupBId: {
              id: 'sessionGroupBId',
              isOpenForRegistration: true,
              sessions: {
                sessionDId: {
                  id: 'sessionDId',
                  isOpenForRegistration: true
                }
              }
            }
          },
          eventRegistrationBId: {
            sessionProducts: {
              sessionGroupBId: {
                id: 'sessionGroupBId',
                isOpenForRegistration: true,
                sessions: {
                  sessionDId: {
                    id: 'sessionDId',
                    isOpenForRegistration: true
                  }
                }
              },
              sessionIId: {
                id: 'sessionIId',
                isOpenForRegistration: true,
                associatedRegistrationTypes: ['registrationTypeBId'],
                type: 'Session'
              },
              sessionHId: {
                id: 'sessionHId',
                isOpenForRegistration: true,
                associatedRegistrationTypes: ['registrationTypeAId'],
                showOnAgenda: true
              }
            },
            sortKeys: {
              sessionGroupBId: ['2016-10-10T21:20:20.935Z'],
              sessionIId: ['2016-10-10T21:20:20.935Z'],
              sessionHId: ['2016-10-10T21:20:20.935Z']
            }
          }
        }
      }
    };
    expect(getGuestSelectedSessionDefinitionsByGuest(state)).toMatchSnapshot();
  });
  test(`PROD-71652: productSelectors.getGuestSelectedSessionDefinitionsByGuest
    does not add undefined to empty lists because of included sessions`, () => {
    const defaultState = getDefaultState();
    const defaultRegCart = getDefaultRegCart();
    const regCartWithIncludedSessions = {
      ...defaultRegCart,
      eventRegistrations: {
        ...defaultRegCart.eventRegistrations,
        [TEMPORARY_GUEST_REGISTRATION_ID]: {
          ...defaultRegCart.eventRegistrations[TEMPORARY_GUEST_REGISTRATION_ID],
          sessionRegistrations: {
            sessionMId: {
              productId: 'sessionMId',
              registrationSourceType: 'Included',
              requestedAction: 'REGISTER'
            }
          }
        },
        [CONFIRMED_GUEST_REGISTRATION_ID]: {
          ...defaultRegCart.eventRegistrations[CONFIRMED_GUEST_REGISTRATION_ID],
          sessionRegistrations: {
            sessionMId: {
              productId: 'sessionMId',
              registrationSourceType: 'Included',
              requestedAction: 'REGISTER'
            }
          }
        },
        [PRIMARY_INVITEE_REGISTRATION_ID]: {
          ...defaultRegCart.eventRegistrations[PRIMARY_INVITEE_REGISTRATION_ID],
          sessionRegistrations: {
            sessionMId: {
              productId: 'sessionMId',
              registrationSourceType: 'Included',
              requestedAction: 'REGISTER'
            }
          }
        }
      }
    };
    const state = {
      ...defaultState,
      visibleProducts: {
        Sessions: {}
      },
      registrationForm: {
        ...defaultState.registrationForm,
        regCart: regCartWithIncludedSessions
      }
    };
    const guestSelectedSessionDefinitionsByGuest = getGuestSelectedSessionDefinitionsByGuest(state);
    Object.keys(guestSelectedSessionDefinitionsByGuest).forEach(guestEventRegId => {
      // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
      expect.not(guestSelectedSessionDefinitionsByGuest[guestEventRegId].contains(undefined));
    });
    expect(guestSelectedSessionDefinitionsByGuest).toMatchSnapshot();
  });
});

describe('currentRegistrant.getIsGuestEditMode returns correct boolean', () => {
  test('returns false when guest is not in edit mode', () => {
    const state = getDefaultState();
    const temporaryGuestEventReg = {
      eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID
    };
    const stateWithGuestEventRegProperty = setIn(
      state,
      ['registrationForm', 'currentGuestEventRegistration'],
      temporaryGuestEventReg
    );
    expect(isGuestEditMode(stateWithGuestEventRegProperty)).toBe(false);
  });

  test('returns true when guest is in edit mode', () => {
    const state = getDefaultState();
    const temporaryGuestEventReg = {
      eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID
    };
    const stateWithGuestEventRegProperty = setIn(
      state,
      ['registrationForm', 'currentGuestEventRegistration'],
      temporaryGuestEventReg
    );
    const stateWithGuestEditModeProperty = setIn(
      stateWithGuestEventRegProperty,
      ['registrationForm', 'regCart', 'eventRegistrations', TEMPORARY_GUEST_REGISTRATION_ID, 'attendee', 'isEditMode'],
      true
    );
    expect(isGuestEditMode(stateWithGuestEditModeProperty)).toBe(true);
  });
});

describe('currentRegistrant.getRegTypeHasAvailableAdmissionItemMap planner scenarios', () => {
  const initialState = {
    text: {
      locale: 'en'
    },
    event: {
      products: {
        admissionItems: {
          admissionItem: {
            id: 'admissionItem',
            capacityId: 'admissionItem',
            name: 'Admission Item Name',
            code: 'Admission Item Code',
            description: 'Admission Item Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 1,
            isOpenForRegistration: true,
            applicableContactTypes: ['regType4', 'regType5', 'regType6', 'regType7']
          },
          admissionItemFull: {
            id: 'admissionItemFull',
            capacityId: 'admissionItemFull',
            name: 'Admission Item Full Name',
            code: 'Admission Item Full Code',
            description: 'Admission Item Full Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 2,
            isOpenForRegistration: true,
            applicableContactTypes: ['regType1', 'regType3', 'regType5', 'regType7']
          },
          admissionItemClosed: {
            id: 'admissionItemClosed',
            capacityId: 'admissionItemClosed',
            name: 'Admission Item Closed Name',
            code: 'Admission Item Closed Code',
            description: 'Admission Item Closed Description',
            associatedOptionalSessions: [],
            defaultFeeId: '00000000-0000-0000-0000-000000000000',
            fees: {},
            displayOrder: 3,
            isOpenForRegistration: false,
            applicableContactTypes: ['regType2', 'regType3', 'regType6', 'regType7']
          }
        }
      },
      registrationTypes: {
        regType1: {
          id: 'regType1',
          name: 'Reg Type 1',
          isOpenForRegistration: true
        },
        regType2: {
          id: 'regType2',
          name: 'Reg Type 2',
          isOpenForRegistration: true
        },
        regType3: {
          id: 'regType3',
          name: 'Reg Type 3',
          isOpenForRegistration: true
        },
        regType4: {
          id: 'regType4',
          name: 'Reg Type 4',
          isOpenForRegistration: true
        },
        regType5: {
          id: 'regType5',
          name: 'Reg Type 5',
          isOpenForRegistration: true
        },
        regType6: {
          id: 'regType6',
          name: 'Reg Type 6',
          isOpenForRegistration: true
        },
        regType7: {
          id: 'regType7',
          name: 'Reg Type 7',
          isOpenForRegistration: true
        }
      },
      eventFeatureSetup: {
        agendaItems: {
          admissionItems: true
        },
        registrationProcess: {
          multipleRegistrationTypes: true
        }
      }
    },
    appData: {
      registrationSettings: {
        registrationPaths: {
          regPathId: {
            registrationTypeSettings: {
              limitVisibility: false
            },
            guestRegistrationSettings: {
              registrationTypeSettings: {
                limitVisibility: false
              }
            },
            accessRules: {
              invitationListAccess: {
                isEmailOnlyInvite: false
              }
            }
          }
        }
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          eventRegId: {
            registrationPathId: 'regPathId'
          }
        }
      }
    },
    capacity: {
      admissionItem: {
        active: true,
        availableCapacity: -1,
        capacityId: 'admissionItem',
        totalCapacityAvailable: -1
      },
      admissionItemFull: {
        active: true,
        availableCapacity: 0,
        capacityId: 'admissionItemFull',
        totalCapacityAvailable: 1
      },
      admissionItemClosed: {
        active: true,
        availableCapacity: -1,
        capacityId: 'admissionItemClosed',
        totalCapacityAvailable: -1
      }
    },
    defaultUserSession: {
      isPlanner: true,
      isPreview: false
    }
  };

  test('all regTypes linked to closed/full adm item should be visible if planner', () => {
    const expectedRegTypeAdmItemMap = {
      regType1: true,
      regType2: true,
      regType3: true,
      regType4: true,
      regType5: true,
      regType6: true,
      regType7: true
    };

    expect(getRegTypeHasAvailableAdmissionItemMap(initialState)).toEqual(expectedRegTypeAdmItemMap);
  });

  test('all regTypes linked to closed/full and no other adm item shouldnt be visible if not planner', () => {
    const testState = {
      ...initialState,
      defaultUserSession: {
        ...initialState.defaultUserSession,
        isPlanner: false
      }
    };

    const expectedRegTypeAdmItemMap = {
      regType1: false,
      regType2: false,
      regType3: false,
      regType4: true,
      regType5: true,
      regType6: true,
      regType7: true
    };

    expect(getRegTypeHasAvailableAdmissionItemMap(testState)).toEqual(expectedRegTypeAdmItemMap);
  });
});

describe('productSelectors.getSkipSessionValidationAttendees', () => {
  const state = getDefaultState();
  const updatedState = setIn(state, ['registrationForm', 'regCart', 'regMod'], true);
  test('returns all attendees as skipped for all session validations when there is no change in session selection during reg mod', () => {
    const attendeesToSkipSessionValidations = getSkipSessionValidationAttendees(updatedState);
    expect(attendeesToSkipSessionValidations).toMatchSnapshot();
  });
  test('returns only guest as skipped attendee for all session validations when existing registered session that is associated to advance rule is unregistered for primary attendee', () => {
    const sessionARegistration = {
      sessionAId: {
        productId: 'sessionAId',
        requestedAction: 'UNREGISTER'
      }
    };
    const newState = setIn(
      updatedState,
      ['registrationForm', 'regCart', 'eventRegistrations', [PRIMARY_INVITEE_REGISTRATION_ID], 'sessionRegistrations'],
      sessionARegistration
    );
    const attendeesToSkipSessionValidations = getSkipSessionValidationAttendees(newState);
    expect(attendeesToSkipSessionValidations).toMatchSnapshot();
  });
  test('returns all attendee as skipped for all session validations when new unassociated session is registered', () => {
    const sessionBRegistration = {
      sessionBId: {
        productId: 'sessionBId',
        requestedAction: 'REGISTER'
      }
    };
    const newState = updateIn(
      updatedState,
      [
        'registrationForm',
        'regCart',
        'eventRegistrations',
        [PRIMARY_INVITEE_REGISTRATION_ID],
        'sessionRegistrations'
      ] as const,
      (sessionRegistrations: SessionRegistration) => {
        return {
          ...sessionRegistrations,
          sessionBRegistration
        };
      }
    );
    const attendeesToSkipSessionValidations = getSkipSessionValidationAttendees(newState);
    expect(attendeesToSkipSessionValidations).toMatchSnapshot();
  });
  test("doesn't skip validation when admission item selection changed for guest", () => {
    const newProductRegistration = [
      {
        productId: 'admissionItemAId',
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ];
    // admissionItemBId -> admissionItemAId
    const newState = setIn(
      updatedState,
      ['registrationForm', 'regCart', 'eventRegistrations', TEMPORARY_GUEST_REGISTRATION_ID, 'productRegistrations'],
      newProductRegistration
    );
    const attendeesToSkipSessionValidations = getSkipSessionValidationAttendees(newState);
    expect(attendeesToSkipSessionValidations.attendeesToSkipAdvancedRulesValidation).not.toContain(
      TEMPORARY_GUEST_REGISTRATION_ID
    );
    expect(attendeesToSkipSessionValidations.attendeesToSkipMinMaxValidation).not.toContain(
      TEMPORARY_GUEST_REGISTRATION_ID
    );
  });
  test("doesn't skip validation when admission item selection changed for primary", () => {
    const newProductRegistration = [
      {
        productId: 'admissionItemBId',
        productType: 'AdmissionItem',
        quantity: 1,
        requestedAction: 'REGISTER'
      }
    ];
    // admissionItemAId -> admissionItemBId
    const newState = setIn(
      updatedState,
      ['registrationForm', 'regCart', 'eventRegistrations', PRIMARY_INVITEE_REGISTRATION_ID, 'productRegistrations'],
      newProductRegistration
    );
    const attendeesToSkipSessionValidations = getSkipSessionValidationAttendees(newState);
    expect(attendeesToSkipSessionValidations.attendeesToSkipAdvancedRulesValidation).not.toContain(
      PRIMARY_INVITEE_REGISTRATION_ID
    );
    expect(attendeesToSkipSessionValidations.attendeesToSkipMinMaxValidation).not.toContain(
      PRIMARY_INVITEE_REGISTRATION_ID
    );
  });
  test('should handle new guests during reg mod', () => {
    // new guest would have no existing registration in modificationStartRegCart
    const newState = unsetIn(updatedState, [
      'regCartStatus',
      'modificationStartRegCart',
      'eventRegistrations',
      TEMPORARY_GUEST_REGISTRATION_ID
    ]);
    const attendeesToSkipSessionValidations = getSkipSessionValidationAttendees(newState);
    expect(attendeesToSkipSessionValidations.attendeesToSkipAdvancedRulesValidation).not.toContain(
      TEMPORARY_GUEST_REGISTRATION_ID
    );
    expect(attendeesToSkipSessionValidations.attendeesToSkipMinMaxValidation).not.toContain(
      TEMPORARY_GUEST_REGISTRATION_ID
    );
  });
});

describe('productSelectors.getSelectedWaitlistSessionsInSessionGroup', () => {
  test('returns sessions waitlisted in a group when one of the session in the same group is being removed from waitlist', () => {
    const regCart = getDefaultRegCart();
    const regCartWithWaitlistedSessions = {
      ...regCart,
      eventRegistrations: {
        ...regCart.eventRegistrations,
        eventRegistrationCId: {
          eventRegistrationId: 'eventRegistrationCId',
          eventId: 'EventBId',
          primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
          registrationTypeId: 'registrationTypeBId',
          attendee: {
            attendeeId: 'attendeeCId',
            personalInformation: {}
          },
          attendeeType: 'GUEST',
          productRegistrations: [
            {
              productId: 'admissionItemAId',
              productType: 'AdmissionItem',
              quantity: 1,
              requestedAction: 'REGISTER'
            }
          ],
          sessionRegistrations: {
            sessionAId: {
              productId: 'sessionAId',
              productType: 'Session',
              quantity: 1,
              requestedAction: 'REGISTER'
            },
            sessionBId: {
              productId: 'sessionBId',
              productType: 'Session',
              quantity: 1,
              requestedAction: 'REGISTER',
              registrationSourceType: 'AdmissionItem'
            },
            sessionCId: {
              productId: 'sessionCId',
              productType: 'Session',
              quantity: 1,
              requestedAction: 'UNREGISTER'
            }
          },
          sessionWaitlists: {
            sessionDId: {
              productId: 'sessionDId',
              productType: 'Session',
              quantity: 1,
              requestedAction: 'WAITLIST'
            },
            sessionGId: {
              productId: 'sessionGId',
              productType: 'Session',
              quantity: 1,
              requestedAction: 'LEAVE_WAITLIST'
            }
          },
          requestedAction: 'REGISTER'
        }
      }
    };

    const sessionGroup = {
      id: 'sessionGroupAId',
      isOpenForRegistration: true,
      sessions: {
        sessionDId: {
          id: 'sessionDId',
          isOpenForRegistration: true
        },
        sessionEId: {
          id: 'sessionEId',
          isOpenForRegistration: false
        },
        sessionFId: {
          id: 'sessionFId',
          isOpenForRegistration: true,
          autoCloseDate: '2010-10-27T22:55:00.000Z'
        },
        sessionGId: {
          id: 'sessionGId',
          isOpenForRegistration: true,
          autoCloseDate: '2020-10-27T22:55:00.000Z'
        },
        sessionPId: {
          id: 'sessionPId',
          isOpenForRegistration: true,
          associatedRegistrationTypes: ['registrationTypeAId', 'registrationTypeBId']
        },
        sessionQId: {
          id: 'sessionQId',
          isOpenForRegistration: true,
          associatedRegistrationTypes: ['registrationTypeBId']
        }
      }
    };

    const expectedSelectedSessionInGroup = {
      sessionDId: {
        productId: 'sessionDId',
        productType: 'Session',
        quantity: 1,
        requestedAction: 'WAITLIST'
      }
    };
    const state = getDefaultState();
    const stateWithGuestSessions = setIn(state, ['registrationForm', 'regCart'], regCartWithWaitlistedSessions);
    expect(getSelectedWaitlistSessionsInSessionGroup(stateWithGuestSessions, sessionGroup)).toEqual(
      expectedSelectedSessionInGroup
    );
  });
});
