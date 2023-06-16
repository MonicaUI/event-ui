import {
  getAnswerForFieldId,
  isViewingGuest,
  getCurrentGuestStandardFieldAnswer,
  getRegisteredStatusGuests,
  getAnswerForRegistrationTypeField,
  isQuestionVisible,
  getAdmissionItemsCapacityMap,
  getConfirmationInfo,
  isArriveFromPublicWeblink,
  isAutoAssignRegTypeApplicableForEventRegistration,
  isAdminRegistrationFromRegCart
} from '../currentRegistrant';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';

const eventRegistrationId = 'event-registration-id';
const registrationTypeId = 'registrationTypeId';

const customContactFieldId = '31971776-0f98-4bd0-a4ed-e5715ba90c7a';
const customContactFieldId2 = '21971776-0f98-4bd0-a4ed-e5715ba90c7a';
const customContactFieldIdNoValue = '088403ce-9014-4032-a026-5bbc78a5485e';
const customContactFieldMultiChoice = 'customContactFieldMultiChoice';
const customContactFieldDate = 'customContactFieldDateField';

const state = {
  appData: {
    registrationSettings: {
      registrationQuestions: {
        'a269e095-0464-4c97-9e4c-3a8a7a394255': {
          question: {
            html: 'Question Text',
            id: 'a269e095-0464-4c97-9e4c-3a8a7a394255',
            visibilityLogic: {
              filters: [
                {
                  nodeType: 'Filter',
                  evaluationType: 'Or',
                  orEvaluationMinimumMatch: 1,
                  filters: [
                    {
                      fieldId: null,
                      operator: null,
                      values: []
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      productQuestions: {},
      travelQuestions: {}
    }
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        [eventRegistrationId]: {
          registrationTypeId,
          attendee: {
            personalInformation: {
              firstName: 'firstName',
              lastName: 'lastName',
              isEncryptedNationalIdentificationNumberPresent: true,
              isEncryptedSocialSecurityNumberPresent: false,
              socialSecurityNumber: '123-12-1234',
              customFields: {
                [customContactFieldId]: {
                  answers: [
                    {
                      answerType: 'Text',
                      text: 'yeet'
                    }
                  ]
                },
                [customContactFieldId2]: {
                  answers: [
                    {
                      answerType: 'Text',
                      text: 'yeet'
                    }
                  ]
                },
                [customContactFieldIdNoValue]: {
                  answers: []
                },
                [customContactFieldMultiChoice]: {
                  answers: [
                    {
                      answerType: 'Choice',
                      choice: 'yeet'
                    },
                    {
                      answerType: 'Choice',
                      choice: 'yeet2'
                    }
                  ]
                },
                [customContactFieldDate]: {
                  answers: [
                    {
                      answerType: 'Text',
                      text: {
                        statusCode: 'DATE_CHANGE_SUCCESS',
                        date: '1900-01-01T00:00:00.000Z'
                      }
                    }
                  ]
                }
              },
              homeAddress: {
                address1: 'home address 1',
                city: 'Fredericton',
                countryCode: 'CA',
                state: 'New Brunswick',
                stateCode: 'NB'
              },
              socialMediaUrls: {
                LINKEDIN: 'linkedIn.com',
                TWITTER: 'twitter.com'
              }
            }
          }
        }
      }
    }
  },
  event: {
    timezone: 35
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
  }
};

const guestState = {
  registrationForm: {
    currentGuestEventRegistration: {
      eventRegistrationId: 'TEST-GUEST-UUID',
      attendee: {
        personalInformation: {
          firstName: 'firstNameGuest',
          lastName: 'lastNameGuest',
          customFields: {
            [customContactFieldId]: {
              answers: [
                {
                  answerType: 'Text',
                  text: 'yeetGuest'
                }
              ]
            },
            [customContactFieldId2]: {
              answers: [
                {
                  answerType: 'Text',
                  text: ''
                }
              ]
            },
            [customContactFieldIdNoValue]: {
              answers: []
            },
            [customContactFieldMultiChoice]: {
              answers: [
                {
                  answerType: 'Choice',
                  choice: 'yeetGuest'
                },
                {
                  answerType: 'Choice',
                  choice: 'yeet2Guest'
                }
              ]
            }
          },
          workAddress: {
            address1: 'work address 1',
            city: 'Fredericton',
            countryCode: 'CA',
            state: 'New Brunswick',
            stateCode: 'NB'
          }
        }
      }
    },
    regCart: {
      eventRegistrations: {
        [eventRegistrationId]: {
          registrationTypeId,
          attendee: {
            personalInformation: {
              firstName: 'firstName',
              lastName: 'lastName',
              customFields: {
                [customContactFieldId]: {
                  answers: [
                    {
                      answerType: 'Text',
                      text: 'yeet'
                    }
                  ]
                },
                [customContactFieldId2]: {
                  answers: [
                    {
                      answerType: 'Text',
                      text: 'yeet'
                    }
                  ]
                },
                [customContactFieldIdNoValue]: {
                  answers: []
                },
                [customContactFieldMultiChoice]: {
                  answers: [
                    {
                      answerType: 'Choice',
                      choice: 'yeet'
                    },
                    {
                      answerType: 'Choice',
                      choice: 'yeet2'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  event: {
    timezone: 35
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
  }
};

describe('Test Guest Selectors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Is not viewing guest', () => {
    expect(isViewingGuest(state)).toEqual(false);
  });
  test('Is viewing guest', () => {
    expect(isViewingGuest(guestState)).toEqual(true);
  });
  test('Return guest answer', () => {
    expect(getCurrentGuestStandardFieldAnswer(guestState, 'firstName')).toEqual('firstNameGuest');
    expect(getCurrentGuestStandardFieldAnswer(guestState, ['firstName'])).toEqual('firstNameGuest');
  });
  test('Return guest answer for address fields', () => {
    expect(getCurrentGuestStandardFieldAnswer(guestState, ['workAddress', 'address1'])).toEqual('work address 1');
    expect(getCurrentGuestStandardFieldAnswer(guestState, ['workAddress', 'city'])).toEqual('Fredericton');
    expect(getCurrentGuestStandardFieldAnswer(guestState, ['workAddress', 'countryCode'])).toEqual('CA');
    expect(getCurrentGuestStandardFieldAnswer(guestState, ['workAddress', 'stateCode'])).toEqual('NB');
  });
});

describe('getAnswerForFieldId tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Standard contact field creates an answer for a value that exists', () => {
    const answer = {
      questionId: Fields.firstName.id,
      answers: [
        {
          answerType: 'Text',
          text: 'firstname'
        }
      ]
    };
    expect(getAnswerForFieldId(state, Fields.firstName.id).toJSON()).toEqual(answer);
  });
  test('Standard contact field creates an answer for a value that does not exist', () => {
    const answer = {
      questionId: Fields.facebookUrl.id,
      answers: null
    };
    expect(getAnswerForFieldId(state, Fields.facebookUrl.id).toJSON()).toEqual(answer);
  });
  test('Secure standard contact field creates an answer for a value, when it has not been secured', () => {
    const answer = {
      questionId: Fields.ssn.id,
      answers: [
        {
          answerType: 'Text',
          text: '123-12-1234'
        }
      ]
    };
    expect(getAnswerForFieldId(state, Fields.ssn.id).toJSON()).toEqual(answer);
  });
  test('Secure standard contact field creates an answer for a value, when is has been secured', () => {
    const answer = {
      questionId: Fields.nin.id,
      answers: [
        {
          answerType: 'Text',
          text: '000-001-0001'
        }
      ]
    };
    expect(getAnswerForFieldId(state, Fields.nin.id).toJSON()).toEqual(answer);
  });
  test('Custom contact field creates an answer for a text field that exists', () => {
    const answer = {
      questionId: customContactFieldId,
      answers: [
        {
          answerType: 'Text',
          text: 'yeet'
        }
      ]
    };
    expect(getAnswerForFieldId(state, customContactFieldId).toJSON()).toEqual(answer);
  });
  test('Custom contact field creates an answer for a choice field that exists', () => {
    const answer = {
      questionId: customContactFieldMultiChoice,
      answers: [
        {
          answerType: 'Text',
          text: 'yeet'
        },
        {
          answerType: 'Text',
          text: 'yeet2'
        }
      ]
    };
    expect(getAnswerForFieldId(state, customContactFieldMultiChoice).toJSON()).toEqual(answer);
  });
  test('Custom contact field creates an answer for a value that does not exist', () => {
    const answer = {
      questionId: customContactFieldIdNoValue,
      answers: null
    };
    expect(getAnswerForFieldId(state, customContactFieldIdNoValue).toJSON()).toMatchObject(answer);
  });
  test('Custom contact field creates an answer for a date field', () => {
    const answer = expect.objectContaining({
      questionId: customContactFieldDate,
      answers: [
        {
          answerType: 'Text',
          text: expect.stringMatching(/^1900-01-01T/)
        }
      ]
    });
    expect(getAnswerForFieldId(state, customContactFieldDate).toJSON()).toEqual(answer);
  });
  test('Standard contact field creates an answer for a social media value that exists', () => {
    const answer = {
      questionId: Fields.twitterUrl.id,
      answers: [
        {
          answerType: 'Text',
          text: 'twitter.com'
        }
      ]
    };
    expect(getAnswerForFieldId(state, Fields.twitterUrl.id).toJSON()).toEqual(answer);
  });
  test('Standard contact field creates an answer for an address subfield value that exists', () => {
    const answer = {
      questionId: Fields.homeAddress1.id,
      answers: [
        {
          answerType: 'Text',
          text: 'home address 1'
        }
      ]
    };
    expect(getAnswerForFieldId(state, Fields.homeAddress1.id).toJSON()).toEqual(answer);
  });
});

describe('getAnswerForFieldId tests for guests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Standard contact field creates an answer for a value that exists', () => {
    const answer = {
      questionId: Fields.firstName.id,
      answers: [
        {
          answerType: 'Text',
          text: 'firstnameguest'
        }
      ]
    };
    expect(getAnswerForFieldId(guestState, Fields.firstName.id, true).toJSON()).toEqual(answer);
  });
  test('Standard contact field creates an answer for a value that does not exist', () => {
    const answer = {
      questionId: Fields.facebookUrl.id,
      answers: null
    };
    expect(getAnswerForFieldId(guestState, Fields.facebookUrl.id, true).toJSON()).toEqual(answer);
  });
  test('Custom contact field creates an answer for a text field that exists', () => {
    const answer = {
      questionId: customContactFieldId,
      answers: [
        {
          answerType: 'Text',
          text: 'yeetguest'
        }
      ]
    };
    expect(getAnswerForFieldId(guestState, customContactFieldId, true).toJSON()).toEqual(answer);
  });
  test('Primary has answer but guest does not', () => {
    const answer = {
      questionId: customContactFieldId2,
      answers: null
    };
    expect(getAnswerForFieldId(guestState, customContactFieldId2, true).toJSON()).toEqual(answer);
  });
  test('Custom contact field uses guest answer when it is present', () => {
    const answer = {
      questionId: customContactFieldMultiChoice,
      answers: [
        {
          answerType: 'Text',
          text: 'yeetguest'
        },
        {
          answerType: 'Text',
          text: 'yeet2guest'
        }
      ]
    };
    expect(getAnswerForFieldId(guestState, customContactFieldMultiChoice, true).toJSON()).toEqual(answer);
  });
  test('Custom contact field creates an answer for a value that does not exist', () => {
    const answer = {
      questionId: customContactFieldIdNoValue,
      answers: null
    };
    expect(getAnswerForFieldId(guestState, customContactFieldIdNoValue, true).toJSON()).toEqual(answer);
  });
});

describe('getRegisteredStatusGuests() method', () => {
  const registeredGuest = 'registered-guest-event-registration-id';
  const newGuest = 'new-guest-event-registration-id';
  const deletedGuest = 'deleted-guest-registration-id';
  const existingEventRegistration = state.registrationForm.regCart.eventRegistrations[eventRegistrationId];

  const updatedState = {
    ...state,
    registrationForm: {
      ...state.registrationForm,
      regCart: {
        ...state.registrationForm.regCart,
        eventRegistrations: {
          [eventRegistrationId]: {
            ...existingEventRegistration,
            attendeeType: 'GROUP_LEADER',
            eventRegistrationId
          },
          [registeredGuest]: {
            ...existingEventRegistration,
            eventRegistrationId: registeredGuest,
            confirmationNumber: 'YHNQPR7DQXK',
            attendeeType: 'GUEST',
            primaryRegistrationId: eventRegistrationId,
            registrationStatus: 'REGISTERED',
            requestedAction: 'REGISTER'
          },
          [deletedGuest]: {
            ...existingEventRegistration,
            eventRegistrationId: deletedGuest,
            confirmationNumber: 'QWNQPR7DQXK',
            attendeeType: 'GUEST',
            primaryRegistrationId: eventRegistrationId,
            registrationStatus: 'REGISTERED',
            requestedAction: 'REGISTER'
          },
          [newGuest]: {
            ...existingEventRegistration,
            confirmationNumber: undefined,
            eventRegistrationId: newGuest,
            attendeeType: 'GUEST',
            primaryRegistrationId: eventRegistrationId,
            requestedAction: 'REGISTER'
          }
        }
      }
    }
  };

  test("> for a mod cart in progress Should return guests with 'REGISTERED' i.e return registered, deleted guests.", () => {
    const registeredStatusGuests = getRegisteredStatusGuests(updatedState);
    // new guest and primary invitee registrations should not be returned
    expect(registeredStatusGuests.length).toEqual(2);
    expect(registeredStatusGuests.find(eventReg => eventReg.eventRegistrationId === registeredGuest)).toBeTruthy();
    expect(registeredStatusGuests.find(eventReg => eventReg.eventRegistrationId === deletedGuest)).toBeTruthy();
  });

  test('> for a completed(checked out) cart, Should return all guests', () => {
    const newState = {
      ...updatedState,
      registrationForm: {
        ...updatedState.registrationForm,
        regCart: {
          ...updatedState.registrationForm.regCart,
          status: 'COMPLETED'
        }
      }
    };

    const registeredStatusGuests = getRegisteredStatusGuests(newState);
    // only primary invitee registrations should not be returned
    expect(registeredStatusGuests.length).toEqual(3);
  });
});

describe('Test for get answer for registration type field', () => {
  const regTypeState = {
    registrationForm: {
      currentGuestEventRegistration: {
        registrationTypeId: 'guestRegTypeId'
      }
    }
  };
  it('Should return primary registrations regtype (default value)', () => {
    expect(getAnswerForRegistrationTypeField('testFieldId', regTypeState, false).answers[0].text).toEqual(
      '00000000-0000-0000-0000-000000000000'
    );
  });
  it('Should return guests regtype', () => {
    expect(getAnswerForRegistrationTypeField('testFieldId', regTypeState, true).answers[0].text).toEqual(
      'guestregtypeid'
    );
  });
});

describe('Test for question visibility', () => {
  const config = {
    id: 'a269e095-0464-4c97-9e4c-3a8a7a394255',
    appData: {
      question: {
        html: 'Question Text Visible',
        id: 'a269e095-0464-4c97-9e4c-3a8a7a394255',
        additionalInfo: { audienceType: 'InviteeOnly' }
      }
    }
  };

  test('when question visibility is undefined for invitee reg', () => {
    expect(isQuestionVisible(state, config, {}, eventRegistrationId, null)).toEqual(true);
  });

  test('when question visibility is undefined for guest reg', () => {
    expect(
      isQuestionVisible(
        {
          ...guestState,
          appData: {
            registrationSettings: {
              registrationQuestions: {
                'a269e095-0464-4c97-9e4c-3a8a7a394255': {
                  question: {
                    html: 'Question Text',
                    id: 'a269e095-0464-4c97-9e4c-3a8a7a394255',
                    visibilityLogic: {
                      filters: [
                        {
                          nodeType: 'Filter',
                          evaluationType: 'Or',
                          orEvaluationMinimumMatch: 1,
                          filters: [
                            {
                              fieldId: null,
                              operator: null,
                              values: []
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              },
              productQuestions: {},
              travelQuestions: {}
            }
          }
        },
        config,
        {},
        eventRegistrationId,
        null
      )
    ).toEqual(false);
  });

  test('when question visibility is true for guest reg', () => {
    (config.appData.question as $TSFixMe).isVisible = {
      'event-registration-id': true
    };
    expect(
      isQuestionVisible(
        {
          ...guestState,
          appData: {
            registrationSettings: {
              registrationQuestions: {
                'a269e095-0464-4c97-9e4c-3a8a7a394255': {
                  question: {
                    html: 'Question Text',
                    id: 'a269e095-0464-4c97-9e4c-3a8a7a394255',
                    visibilityLogic: {
                      filters: [
                        {
                          nodeType: 'Filter',
                          evaluationType: 'Or',
                          orEvaluationMinimumMatch: 1,
                          filters: [
                            {
                              fieldId: null,
                              operator: null,
                              values: []
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              },
              productQuestions: {},
              travelQuestions: {}
            }
          }
        },
        config,
        {},
        eventRegistrationId,
        null
      )
    ).toEqual(true);
  });

  test('when question visibility is undefined and audienceType is GuestOnly for invitee reg', () => {
    config.appData.question.additionalInfo = {
      audienceType: 'GuestOnly'
    };
    expect(isQuestionVisible(state, config, {}, eventRegistrationId, null)).toEqual(true);
  });

  test('when question visibility is false', () => {
    (config.appData.question as $TSFixMe).isVisible = {
      'event-registration-id': false
    };
    expect(isQuestionVisible(state, config, {}, eventRegistrationId, null)).toEqual(false);
  });

  test('when question visibility is true', () => {
    (config.appData.question as $TSFixMe).isVisible = {
      'event-registration-id': true
    };
    expect(isQuestionVisible(state, config, {}, eventRegistrationId, null)).toEqual(true);
  });
});

describe('Test for getAdmissionItemsCapacityMap', () => {
  test('does not throw error when Sessions is undefined', () => {
    expect(
      getAdmissionItemsCapacityMap({
        event: {
          agendaItems: {},
          eventFeatureSetup: {
            agendaItems: {
              admissionItems: {}
            }
          }
        },
        userSession: {},
        defaultUserSession: {},
        visibleProducts: {}
      })
    ).toEqual({});
  });
});

describe('getConfirmationInfo() method', () => {
  const commonState = {
    appData: {
      registrationSettings: {
        registrationPaths: {
          reg1RegPath: {
            allowPersonalInformationModification: true
          }
        }
      }
    },
    registrantLogin: {
      currentLogin: {
        emailAddress: 'currentLoginEmail@domain.com',
        confirmationNumber: 'currentLoginConfirmNumber'
      }
    },
    registrationForm: {
      regCart: {
        eventRegistrations: {
          reg1: {
            registrationPathId: 'reg1RegPath',
            confirmationNumber: 'regCartConfirmNumber',
            attendee: {
              personalInformation: {
                emailAddress: 'regCartEmail@domain.com'
              }
            }
          }
        },
        regMod: true
      }
    },
    userSession: {
      isAdmin: false,
      confirmationNumber: 'sessionConfirmationNumber',
      emailAddress: 'sessionEmail@domain.com'
    }
  };
  test('retrieves values from login form when id fields cant have changed', () => {
    expect(
      getConfirmationInfo({
        ...commonState,
        appData: {
          registrationSettings: {
            registrationPaths: {
              reg1RegPath: {
                allowPersonalInformationModification: false
              }
            }
          }
        }
      })
    ).toEqual({
      emailAddress: 'currentLoginEmail@domain.com',
      confirmationNumber: 'currentLoginConfirmNumber'
    });
  });
  test('retrieves values from login form for admin user if it is populated', () => {
    expect(
      getConfirmationInfo({
        ...commonState,
        registrationForm: {
          ...commonState.registrationForm,
          regCart: {
            ...commonState.registrationForm.regCart,
            isAdmin: true
          }
        }
      })
    ).toEqual({
      emailAddress: 'currentLoginEmail@domain.com',
      confirmationNumber: 'currentLoginConfirmNumber'
    });
  });
  test('retrieves values from session for admin user if login form is empty', () => {
    expect(
      getConfirmationInfo({
        ...commonState,
        registrantLogin: {
          currentLogin: {}
        },
        registrationForm: {
          ...commonState.registrationForm,
          regCart: {
            ...commonState.registrationForm.regCart,
            isAdmin: true
          }
        }
      })
    ).toEqual({
      emailAddress: 'sessionEmail@domain.com',
      confirmationNumber: 'sessionConfirmationNumber'
    });
  });
  test('retrieves values from reg cart if id fields can change and not admin', () => {
    expect(getConfirmationInfo(commonState)).toEqual({
      emailAddress: 'regCartEmail@domain.com',
      confirmationNumber: 'regCartConfirmNumber'
    });
  });
});

describe('isArriveFromPublicWeblink tests', () => {
  test('invitee arrives from public weblink', () => {
    expect(
      isArriveFromPublicWeblink({
        ...state,
        userSession: {
          inviteeId: undefined
        }
      })
    ).toBeTruthy();
  });

  test('invitee does not arrive from public weblink', () => {
    expect(
      isArriveFromPublicWeblink({
        ...state,
        userSession: {
          inviteeId: 'some invitee id'
        }
      })
    ).toBeFalsy();
  });
});

describe('isAutoAssignRegTypeApplicableForEventRegistration tests', () => {
  test('invitee auto-assigned reg-type is enabled', () => {
    const updatedRegCart = {
      ...state.registrationForm.regCart,
      eventRegistrations: {
        [eventRegistrationId]: {
          ...state.registrationForm.regCart.eventRegistrations[eventRegistrationId],
          autoAssignRegTypeForEventRegistration: true
        }
      }
    };
    expect(isAutoAssignRegTypeApplicableForEventRegistration(updatedRegCart, eventRegistrationId)).toBeTruthy();
  });

  test('invitee auto-assigned reg-type is disabled', () => {
    const updatedRegCart = {
      ...state.registrationForm.regCart,
      eventRegistrations: {
        [eventRegistrationId]: {
          ...state.registrationForm.regCart.eventRegistrations[eventRegistrationId],
          autoAssignRegTypeForEventRegistration: false
        }
      }
    };
    expect(isAutoAssignRegTypeApplicableForEventRegistration(updatedRegCart, eventRegistrationId)).toBeFalsy();
  });
});

describe('isAdminRegistrationFromRegCart', () => {
  test('For reg mod/cancel cart', () => {
    const regCart = {
      isAdmin: true,
      regMod: true
    };
    expect(isAdminRegistrationFromRegCart(regCart)).toBe(true);
    regCart.regMod = false;
    (regCart as $TSFixMe).regCancel = true;
    expect(isAdminRegistrationFromRegCart(regCart)).toBe(true);
    regCart.isAdmin = false;
    expect(isAdminRegistrationFromRegCart(regCart)).toBe(false);
  });

  test('For initial checkout cart', () => {
    const regCart = {
      isAdmin: false,
      regMod: false,
      regCancel: false
    };
    expect(isAdminRegistrationFromRegCart(regCart)).toBe(false);
    (regCart as $TSFixMe).admin = {};
    expect(isAdminRegistrationFromRegCart(regCart)).toBe(true);
  });
});
