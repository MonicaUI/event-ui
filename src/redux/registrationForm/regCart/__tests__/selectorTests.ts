import {
  getEventRegistrations,
  getEventRegistration,
  getAttendee,
  getAttendeeId,
  getAttendeePersonalInformation,
  getAttendeeStandardFieldAnswer,
  getAttendeeCustomFieldAnswer,
  getAttendeeQuestionAnswer,
  getProducts,
  getSelectedAdmissionItem,
  getRegisteredSessionsSourceTypeNotWithSessionBundle,
  getSelectedSessions,
  isRegistrationModification,
  getPrimaryRegistrationId,
  isNewRegistration,
  isGuest,
  getNumberOfGroupMembers,
  getGroupLeaderAttendeeId,
  isPlaceholderRegCart,
  getSessionBundles
} from '../selectors';

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
            requestedAction: 'REGISTER',
            registrationSourceType: 'Selected'
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
            requestedAction: 'REGISTER',
            registrationSourceType: 'Selected'
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
            requestedAction: 'REGISTER',
            registrationSourceType: 'Selected'
          },
          sessionBId: {
            productId: 'sessionBId',
            productType: 'Session',
            quantity: 1,
            requestedAction: 'REGISTER',
            registrationSourceType: 'Track'
          }
        },
        sessionBundleRegistrations: {
          bundle1: {
            productId: 'bundle1',
            requestedAction: 'REGISTER'
          },
          bundle2: {
            productId: 'bundle2',
            requestedAction: 'REGISTER'
          }
        }
      }
    }
  };
};

test('getEventRegistrations returns empty when regCart is undefined', () => {
  expect(getEventRegistrations(undefined)).toEqual({});
});

test('getEventRegistrations returns eventRegistrations', () => {
  const regCart = getDefaultRegCart();
  expect(getEventRegistrations(regCart)).toEqual(regCart.eventRegistrations);
});

test('getEventRegistration returns undefined when eventRegistration does not exist', () => {
  const regCart = getDefaultRegCart();
  expect(getEventRegistration(regCart, 'nonExistentId')).toBeUndefined();
});

test('getEventRegistration returns the specific event registration', () => {
  const regCart = getDefaultRegCart();
  expect(getEventRegistration(regCart, 'eventRegistrationAId')).toEqual(
    regCart.eventRegistrations.eventRegistrationAId
  );
});

test('getAttendee returns undefined when attendee does not exist', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendee(regCart, 'nonExistentId')).toBeUndefined();
});

test('getAttendee returns the attendee', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendee(regCart, 'eventRegistrationAId')).toEqual(
    regCart.eventRegistrations.eventRegistrationAId.attendee
  );
});

test('getAttendeeId returns undefined when attendee does not exist', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeId(regCart, 'nonExistentId')).toBeUndefined();
});

test('getAttendeeId returns the attendee id', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeId(regCart, 'eventRegistrationAId')).toEqual(
    regCart.eventRegistrations.eventRegistrationAId.attendee.attendeeId
  );
});

test('getAttendeePersonalInformation returns undefined when attendee does not exist', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeePersonalInformation(regCart, 'nonExistentId')).toBeUndefined();
});

test('getAttendeePersonalInformation returns the personal information', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeePersonalInformation(regCart, 'eventRegistrationAId')).toEqual(
    regCart.eventRegistrations.eventRegistrationAId.attendee.personalInformation
  );
});

test('getAttendeeStandardFieldAnswer returns undefined when the field does not exist.', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeStandardFieldAnswer(regCart, 'eventRegistrationAId', 'nonExistentPath')).toBeUndefined();
});

test('getAttendeeStandardFieldAnswer handles array type of field with length > 1', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeStandardFieldAnswer(regCart, 'eventRegistrationAId', ['socialMediaUrls', 'FACEBOOK'])).toEqual(
    regCart.eventRegistrations.eventRegistrationAId.attendee.personalInformation.socialMediaUrls.FACEBOOK
  );
});

test('getAttendeeStandardFieldAnswer returns the answer', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeStandardFieldAnswer(regCart, 'eventRegistrationAId', 'firstName')).toEqual(
    regCart.eventRegistrations.eventRegistrationAId.attendee.personalInformation.firstName
  );
});

test('getAttendeeCustomFieldAnswer returns undefined when the custom field does not exist.', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeCustomFieldAnswer(regCart, 'eventRegistrationAId', 'nonExistentId')).toBeUndefined();
});

test('getAttendeeCustomFieldAnswer returns the answer', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeCustomFieldAnswer(regCart, 'eventRegistrationAId', 'customFieldAId')).toEqual(
    regCart.eventRegistrations.eventRegistrationAId.attendee.personalInformation.customFields.customFieldAId
  );
});

test('getAttendeeQuestionAnswer returns undefined when the question does not exist.', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeQuestionAnswer(regCart, 'eventRegistrationAId', 'nonExistentId')).toBeUndefined();
});

test('getAttendeeQuestionAnswer returns the answer', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeQuestionAnswer(regCart, 'eventRegistrationAId', 'questionAId')).toEqual(
    (regCart.eventRegistrations.eventRegistrationAId.attendee.eventAnswers as $TSFixMe).questionAId
  );
});

test('getProducts returns an empty list of products when the event registration does not exist.', () => {
  const regCart = getDefaultRegCart();
  expect(getProducts(regCart, 'nonExistentId')).toEqual([]);
});

test('getProducts returns the list of products', () => {
  const regCart = getDefaultRegCart();
  expect(getAttendeeQuestionAnswer(regCart, 'eventRegistrationAId')).toEqual(
    (regCart.eventRegistrations.eventRegistrationAId.attendee as $TSFixMe).productRegistrations
  );
});

test('getSelectedAdmissionItem returns nothing when the event registration does not exist.', () => {
  const regCart = getDefaultRegCart();
  expect(getSelectedAdmissionItem(regCart, 'nonExistentId')).toBeUndefined();
});

test('getSelectedAdmissionItem returns the selected admission items', () => {
  const regCart = getDefaultRegCart();
  expect(getSelectedAdmissionItem(regCart, 'eventRegistrationAId')).toMatchSnapshot();
});

test('getSessionBundles returns sessionBundles', () => {
  const regCart = getDefaultRegCart();
  const expectedResult = regCart.eventRegistrations[PRIMARY_INVITEE_REGISTRATION_ID].sessionBundleRegistrations;
  const actualResult = getSessionBundles(regCart, PRIMARY_INVITEE_REGISTRATION_ID);
  expect(actualResult).toEqual(expectedResult);
});

test('getSessionBundles returns empty object if registrations not found', () => {
  const regCart = getDefaultRegCart();
  const actualResult = getSessionBundles(regCart, 'nonExistentId');
  expect(actualResult).toEqual({});
});

test('getSelectedSessions returns an empty list of sessions when the event registration does not exist.', () => {
  const regCart = getDefaultRegCart();
  expect(getSelectedSessions(regCart, 'nonExistentId')).toEqual({});
});

test('getSelectedSessions returns the list of sessions', () => {
  const regCart = getDefaultRegCart();
  const sessionList = getSelectedSessions(regCart, 'eventRegistrationAId');
  expect(sessionList).toMatchSnapshot();
  expect(sessionList.sessionAId).toBeDefined();
  expect(sessionList.sessionBId).toBeDefined();
});

test('getRegisteredSessionsSourceTypeNotWithSessionBundle returns the list of sessions', () => {
  const regCart = getDefaultRegCart();
  const sessionList = getRegisteredSessionsSourceTypeNotWithSessionBundle(regCart, 'eventRegistrationAId');
  expect(sessionList).toMatchSnapshot();
  expect(sessionList.sessionAId).toBeDefined();
  expect(sessionList.sessionBId).toBeUndefined();
});

test('isRegistrationModification returns regMod field as boolean', () => {
  const regCart = getDefaultRegCart();
  expect(isRegistrationModification(regCart)).toBe(false);
  (regCart as $TSFixMe).regMod = true;
  expect(isRegistrationModification(regCart)).toBe(true);
});

test('getPrimaryRegistrationId does not return guest attendee id', () => {
  const regCart = getDefaultRegCart();
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
  expect(getPrimaryRegistrationId(regCart, 'eventRegistrationAId')).toMatchSnapshot();
});

describe('isNewRegistration -', () => {
  test('regMod - is not new registration', () => {
    const regCart = {
      ...getDefaultRegCart(),
      regMod: true
    };
    expect(isNewRegistration(regCart)).toBe(false);
  });
  test('regCancel - is not new registration', () => {
    const regCart = {
      ...getDefaultRegCart(),
      regCancel: true
    };
    expect(isNewRegistration(regCart)).toBe(false);
  });
  test('regDecline - is not new registration', () => {
    const regCart = {
      ...getDefaultRegCart(),
      regDecline: true
    };
    expect(isNewRegistration(regCart)).toBe(false);
  });
  test('regWaitList - is not new registration', () => {
    const regCart = {
      ...getDefaultRegCart(),
      regWaitList: true
    };
    expect(isNewRegistration(regCart)).toBe(false);
  });
  test('regRetrieval - is not new registration', () => {
    const regCart = {
      ...getDefaultRegCart(),
      regRetrieval: true
    };
    expect(isNewRegistration(regCart)).toBe(false);
  });
  test('none of the above - is new registration', () => {
    expect(isNewRegistration(getDefaultRegCart())).toBe(true);
  });
});

describe('isGuest', () => {
  test('returns false if not guest', () => {
    const regCart = {
      ...getDefaultRegCart()
    };
    expect(isGuest(regCart, PRIMARY_INVITEE_REGISTRATION_ID)).toBe(false);
  });
  test('returns true if guest', () => {
    const regCart = {
      ...getDefaultRegCart()
    };
    expect(isGuest(regCart, CONFIRMED_GUEST_REGISTRATION_ID)).toBe(true);
  });
  test('returns false if eventRegId does not exist in regCart', () => {
    const regCart = {
      ...getDefaultRegCart()
    };
    expect(isGuest(regCart, 'DummyEventRegId')).toBe(false);
  });
});

describe('getNumberOfGroupMembers', () => {
  const groupRegCart = {
    eventRegistrations: {
      groupLeaderEventRegId: {
        eventRegistrationId: 'groupLeaderEventRegId',
        attendeeType: 'GROUP_LEADER',
        attendee: {
          isGroupMember: false
        }
      },
      attendeeId: {
        eventRegistrationId: 'attendeeId',
        attendeeType: 'ATTENDEE',
        attendee: {
          isGroupMember: true
        },
        primaryRegistrationId: 'groupLeaderEventRegId'
      }
    }
  };
  test('should count the attendees', () => {
    expect(getNumberOfGroupMembers(groupRegCart)).toEqual(1);
  });
});

describe('getGroupLeaderAttendeeId', () => {
  test('should return false as groupRegistration is false', () => {
    const regCart = {
      groupRegistration: false,
      eventRegistrations: {
        groupLeaderEventRegId: {
          eventRegistrationId: 'groupLeaderEventRegId',
          attendeeType: 'ATTENDEE',
          attendee: {
            isGroupMember: false
          }
        }
      }
    };
    expect(getGroupLeaderAttendeeId(regCart)).toBeFalsy();
  });
  test('should return group leader attendee id', () => {
    const regCart = {
      groupRegistration: true,
      eventRegistrations: {
        groupLeaderEventRegId: {
          eventRegistrationId: 'groupLeaderEventRegId',
          attendeeType: 'GROUP_LEADER',
          attendee: {
            attendeeId: 'groupLeaderAttendeeId'
          }
        },
        inviteeId: {
          eventRegistrationId: 'attendeeId',
          attendeeType: 'ATTENDEE',
          primaryRegistrationId: 'groupLeaderEventRegId'
        },
        guestId: {
          eventRegistrationId: 'guestId',
          attendeeType: 'GUEST',
          primaryRegistrationId: 'groupLeaderEventRegId'
        }
      }
    };
    expect(getGroupLeaderAttendeeId(regCart)).toEqual(
      regCart.eventRegistrations.groupLeaderEventRegId.attendee.attendeeId
    );
  });
});

describe('isPlaceholderRegCart', () => {
  test('should correctly identify embedded reg cart', () => {
    expect(isPlaceholderRegCart()).toBe(false);
    expect(isPlaceholderRegCart({})).toBe(false);
    expect(isPlaceholderRegCart({ embeddedRegistration: true })).toBe(false);
    expect(isPlaceholderRegCart({ embeddedRegistration: false, regCartId: '' })).toBe(false);
    expect(isPlaceholderRegCart({ regCartId: '' })).toBe(false);
    expect(isPlaceholderRegCart({ embeddedRegistration: true, regCartId: 'fake-uuid' })).toBe(false);
    expect(isPlaceholderRegCart({ embeddedRegistration: true, regCartId: '' })).toBe(true);
  });
});
