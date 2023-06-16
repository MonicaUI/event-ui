// test cases
import {
  isProductQuestion,
  getQuestionIdsForVisibilityField,
  getQuestionIdsWithVisibilityLogic,
  questionHasVisibilityLogic,
  getQuestionVisibilityFieldIdsForQuestions,
  createAnswer,
  isGuestQuestion,
  isQuestionAvailableForRegistrant,
  isFieldLinkedToQuestionVisibilityLogic
} from '../questionUtils';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';

const questionIds = [
  'b325b987-7ca6-4b9b-8055-b9d41f6ec4d6',
  '0b58c345-c870-4cfc-80a1-5248073742be',
  '0ad14b86-d305-4c50-9f0c-d6014ca7ec9b',
  'ae044277-2656-44b5-88f3-f6c1bede27ea'
];
const fieldIds = ['fieldName', 'fieldName1', 'fieldName2', 'fieldName3'];

describe('isProductQuestion tests', () => {
  test('Returns true when question is a product question', () => {
    const state = {
      registrationSettings: {
        productQuestions: {
          [questionIds[0]]: {}
        }
      }
    };
    expect(isProductQuestion(state, questionIds[0])).toBeTruthy();
  });

  test('Returns false when question is not a travel question', () => {
    const state = {
      registrationSettings: {
        productQuestions: {}
      }
    };
    expect(isProductQuestion(state, questionIds[0])).toBeFalsy();
  });
});

describe('isGuestQuestion tests', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'GuestOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            }
          },
          [questionIds[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            }
          },
          badQuestion: {
            questions: {}
          }
        }
      }
    }
  };
  test('Question is a guest question', () => {
    expect(isGuestQuestion(state, questionIds[0])).toEqual(true);
  });
  test('Question is not a guest question', () => {
    expect(isGuestQuestion(state, questionIds[1])).toEqual(false);
  });
  test('Question does not exist', () => {
    expect(isGuestQuestion(state, '123123')).toEqual(false);
  });
  test('Question does not have a audience type', () => {
    expect(isGuestQuestion(state, '')).toEqual(false);
  });
});

describe('isQuestionAvailableForRegistrant tests', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'GuestOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            }
          },
          [questionIds[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            }
          },
          [questionIds[2]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeAndGuest'
              },
              visibilityLogic: {
                filters: [{}]
              }
            }
          },
          badQuestion: {
            questions: {}
          }
        },
        productQuestions: {
          [questionIds[3]]: {
            question: {
              visibilityLogic: {
                filters: [{}]
              }
            }
          }
        }
      }
    }
  };
  test('Registration Question is avaliable for guest', () => {
    expect(isQuestionAvailableForRegistrant(state, questionIds[0], true)).toEqual(true);
    expect(isQuestionAvailableForRegistrant(state, questionIds[2], true)).toEqual(true);
  });
  test('Registration Question is available for invitee', () => {
    expect(isQuestionAvailableForRegistrant(state, questionIds[1], false)).toEqual(true);
    expect(isQuestionAvailableForRegistrant(state, questionIds[2], false)).toEqual(true);
  });
  test('Registration Question is not available for registrant', () => {
    expect(isQuestionAvailableForRegistrant(state, questionIds[1], true)).toEqual(false);
    expect(isQuestionAvailableForRegistrant(state, questionIds[0], false)).toEqual(false);
  });
  test('Registration Question does not exist', () => {
    expect(isQuestionAvailableForRegistrant(state, '123123', false)).toEqual(false);
  });
  test('Registration Question does not have a audience type', () => {
    expect(isQuestionAvailableForRegistrant(state, '', false)).toEqual(false);
  });
  test('Product Question is available for invitee', () => {
    expect(isQuestionAvailableForRegistrant(state, questionIds[3], false)).toEqual(true);
  });
  test('Product Question is not available for guest', () => {
    expect(isQuestionAvailableForRegistrant(state, questionIds[3], true)).toEqual(false);
  });
});

describe('questionHasVisibilityLogic tests', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          }
        },
        productQuestions: {
          [questionIds[1]]: {
            question: {
              visibilityLogic: {
                filters: [{}]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          },
          'no-visibility-logic': {
            question: {},
            registrationPathQuestionAssociations: ['testRegPath']
          }
        }
      }
    }
  };
  test('Returns questions that have visibility logic', () => {
    expect(getQuestionIdsWithVisibilityLogic(state, false, 'testRegPath')).toEqual(questionIds.slice(0, 2));
    expect(getQuestionIdsWithVisibilityLogic(state, false, 'badPath')).toEqual([]);
  });
});

describe('questionHasVisibilityLogic tests guest', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'GuestOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          },
          badQuestion: {
            question: {
              additionalInfo: {
                audienceType: 'GuestOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            },
            registrationPathQuestionAssociations: ['badPath']
          },
          [questionIds[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [{}]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          }
        }
      }
    }
  };
  test('Returns questions that have visibility logic for guests', () => {
    expect(getQuestionIdsWithVisibilityLogic(state, true, 'testRegPath')).toEqual([questionIds[0]]);
  });
});

describe('getQuestionIdsForVisibilityField tests for guest', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'GuestOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Criterion',
                    fieldName: fieldIds[0]
                  },
                  {
                    nodeType: 'Criterion',
                    fieldName: fieldIds[1]
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          },
          [questionIds[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Filter',
                    filters: [
                      {
                        nodeType: 'Criterion',
                        fieldName: fieldIds[0]
                      },
                      {
                        nodeType: 'Criterion',
                        fieldName: fieldIds[0]
                      },
                      {
                        nodeType: 'Filter',
                        filters: [
                          {
                            nodeType: 'Filter',
                            filters: [
                              {
                                nodeType: 'Criterion',
                                fieldName: fieldIds[3]
                              },
                              {
                                nodeType: 'Criterion',
                                fieldName: fieldIds[2]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          }
        }
      }
    }
  };
  test('Return the ids for guest questions that have visibility logic that a given field id is the source for', () => {
    expect(getQuestionIdsForVisibilityField(state, fieldIds[0], true, 'testRegPath')).toEqual([questionIds[0]]);
    expect(getQuestionIdsForVisibilityField(state, fieldIds[1], true, 'testRegPath')).toEqual([questionIds[0]]);
    expect(getQuestionIdsForVisibilityField(state, 'fakeId', false, 'testRegPath')).toEqual([]);
    expect(getQuestionIdsForVisibilityField(state, fieldIds[1], true, 'badPath')).toEqual([]);
  });
});

describe('getQuestionIdsForVisibilityField tests', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Criterion',
                    fieldName: fieldIds[0]
                  },
                  {
                    nodeType: 'Criterion',
                    fieldName: fieldIds[1]
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          },
          [questionIds[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Filter',
                    filters: [
                      {
                        nodeType: 'Criterion',
                        fieldName: fieldIds[0]
                      },
                      {
                        nodeType: 'Criterion',
                        fieldName: fieldIds[0]
                      },
                      {
                        nodeType: 'Filter',
                        filters: [
                          {
                            nodeType: 'Filter',
                            filters: [
                              {
                                nodeType: 'Criterion',
                                fieldName: fieldIds[3]
                              },
                              {
                                nodeType: 'Criterion',
                                fieldName: fieldIds[2]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            },
            registrationPathQuestionAssociations: ['testRegPath']
          }
        }
      }
    }
  };
  test('Return the ids for questions that have visibility logic that a given field id is the source for', () => {
    expect(getQuestionIdsForVisibilityField(state, fieldIds[0], false, 'testRegPath')).toEqual(questionIds.slice(0, 2));
    expect(getQuestionIdsForVisibilityField(state, fieldIds[1], false, 'testRegPath')).toEqual([questionIds[0]]);
    expect(getQuestionIdsForVisibilityField(state, 'fakeId', false, 'testRegPath')).toEqual([]);
    expect(getQuestionIdsForVisibilityField(state, fieldIds[1], false, 'badPath')).toEqual([]);
  });
});

describe('questionHasVisibilityLogic', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          'reg-question-with-logic': {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [{}, {}]
              }
            }
          },
          'reg-question-no-logic': {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              }
            }
          }
        },
        productQuestions: {
          'product-question-with-logic': {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [{}, {}]
              }
            }
          },
          'product-question-no-logic': {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              }
            }
          }
        }
      }
    }
  };
  test('Registration question with logic returns true', () =>
    expect(questionHasVisibilityLogic(state, 'reg-question-with-logic')).toBeTruthy());
  test('Registration question without logic returns false', () =>
    expect(questionHasVisibilityLogic(state, 'reg-question-no-logic')).toBeFalsy());
  test('Product question with logic returns true', () =>
    expect(questionHasVisibilityLogic(state, 'product-question-with-logic')).toBeTruthy());
  test('Product question without logic returns false', () =>
    expect(questionHasVisibilityLogic(state, 'product-question-no-logic')).toBeFalsy());
});

describe('getQuestionVisibilityFieldIdsForQuestions', () => {
  const state = {
    appData: {
      registrationSettings: {
        registrationQuestions: {
          [questionIds[0]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Filter',
                    filters: [
                      {
                        nodeType: 'Criterion',
                        fieldName: fieldIds[0]
                      },
                      {
                        nodeType: 'Filter',
                        filters: [
                          {
                            nodeType: 'Filter',
                            filters: [
                              {
                                nodeType: 'Criterion',
                                fieldName: fieldIds[2]
                              }
                            ]
                          },
                          {
                            nodeType: 'Criterion',
                            fieldName: fieldIds[3]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    nodeType: 'Criterion',
                    fieldName: fieldIds[2]
                  }
                ]
              }
            }
          }
        },
        productQuestions: {
          [questionIds[1]]: {
            question: {
              additionalInfo: {
                audienceType: 'InviteeOnly'
              },
              visibilityLogic: {
                filters: [
                  {
                    nodeType: 'Filter',
                    filters: [
                      {
                        nodeType: 'Criterion',
                        fieldName: fieldIds[0]
                      },
                      {
                        nodeType: 'Filter',
                        filters: [
                          {
                            nodeType: 'Filter',
                            filters: [
                              {
                                nodeType: 'Criterion',
                                fieldName: fieldIds[3]
                              }
                            ]
                          },
                          {
                            nodeType: 'Criterion',
                            fieldName: fieldIds[3]
                          }
                        ]
                      }
                    ]
                  },
                  {
                    nodeType: 'Criterion',
                    fieldName: fieldIds[2]
                  }
                ]
              }
            }
          }
        }
      }
    }
  };
  test('Get all the field names out of a registration question with visibility logic', () => {
    const fields = getQuestionVisibilityFieldIdsForQuestions(state, [questionIds[0]]);
    expect(fields).toEqual([fieldIds[0], fieldIds[2], fieldIds[3]]);
  });
  test('Get all the field names out of a product question with visibility logic', () => {
    const fields = getQuestionVisibilityFieldIdsForQuestions(state, [questionIds[1]]);
    expect(fields).toEqual([fieldIds[0], fieldIds[3], fieldIds[2]]);
  });
  test('Get all the unique field names from all the questions with visibility logic', () => {
    const fields = getQuestionVisibilityFieldIdsForQuestions(state, questionIds);
    expect(fields).toEqual([fieldIds[0], fieldIds[2], fieldIds[3]]);
  });
});

describe('createAnswer tests', () => {
  test('Create answer for iso date', () => {
    const answer = {
      questionId: Fields.dateOfBirth.id,
      answers: [
        {
          answerType: 'Text',
          text: '2019-09-20T12:00:00.000Z'
        }
      ]
    };
    expect(createAnswer(Fields.dateOfBirth.id, '2019-09-20T00:00:00', true).toJSON()).toEqual(answer);
  });
  test('Create answer for core date', () => {
    const answer = {
      questionId: Fields.dateOfBirth.id,
      answers: [
        {
          answerType: 'Text',
          text: '2019-09-20T12:00:00.000Z'
        }
      ]
    };
    expect(createAnswer(Fields.dateOfBirth.id, '2019-09-20T00:00:00', true).toJSON()).toEqual(answer);
  });
  test('Create answer for null/undefined', () => {
    const answer = {
      questionId: Fields.ccEmailAddress.id,
      answers: null
    };
    expect(createAnswer(Fields.ccEmailAddress.id).toJSON()).toEqual(answer);
  });
  test('Create answer for text field with number', () => {
    const answer = {
      questionId: Fields.ccEmailAddress.id,
      answers: [
        {
          answerType: 'Text',
          text: '1234'
        }
      ]
    };
    expect(createAnswer(Fields.ccEmailAddress.id, '1234', false)).toEqual(answer);
  });
  test('Create answer for date field with number', () => {
    const newAnswer = createAnswer(Fields.dateOfBirth.id, '1234', true);
    expect(new Date(newAnswer.answers[0].text).getFullYear()).toEqual(1234);
  });
  test('All upper case', () => {
    const answer = {
      questionId: Fields.firstName.id,
      answers: [
        {
          answerType: 'Text',
          text: 'test'
        }
      ]
    };
    expect(createAnswer(Fields.firstName.id, 'TEST').toJSON()).toEqual(answer);
  });
  test('Camel case', () => {
    const answer = {
      questionId: Fields.firstName.id,
      answers: [
        {
          answerType: 'Text',
          text: 'test'
        }
      ]
    };
    expect(createAnswer(Fields.firstName.id, 'teST').toJSON()).toEqual(answer);
  });
  test('All lower case', () => {
    const answer = {
      questionId: Fields.firstName.id,
      answers: [
        {
          answerType: 'Text',
          text: 'test'
        }
      ]
    };
    expect(createAnswer(Fields.firstName.id, 'test').toJSON()).toEqual(answer);
  });
});

describe('isFieldLinkedToQuestionVisibilityLogic tests', () => {
  const firstNameFieldId = Fields.firstName.id;
  const lastNameFieldId = Fields.lastName.id;
  const homeCountryCodeFieldId = Fields.homeCountryCode.id;
  const homeCountryFieldId = Fields.homeCountry.id;
  const workCountryCodeFieldId = Fields.workCountryCode.id;
  const workCountryFieldId = Fields.workCountry.id;
  const homeStateCodeFieldId = Fields.homeStateCode.id;
  const homeStateFieldId = Fields.homeState.id;
  const workStateCodeFieldId = Fields.workStateCode.id;
  const workStateFieldId = Fields.workState.id;
  test('Non address fields', () => {
    expect(isFieldLinkedToQuestionVisibilityLogic([firstNameFieldId], firstNameFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([firstNameFieldId, lastNameFieldId], firstNameFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([firstNameFieldId, lastNameFieldId], lastNameFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([firstNameFieldId], lastNameFieldId)).toBeFalsy();
    expect(isFieldLinkedToQuestionVisibilityLogic([], lastNameFieldId)).toBeFalsy();
  });
  test('Address fields', () => {
    expect(isFieldLinkedToQuestionVisibilityLogic([homeCountryCodeFieldId], homeCountryCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([homeCountryFieldId], homeCountryCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([workCountryCodeFieldId], workCountryCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([workCountryFieldId], workCountryCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([homeStateCodeFieldId], homeStateCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([homeStateFieldId], homeStateCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([workStateCodeFieldId], workStateCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([workStateFieldId], workStateCodeFieldId)).toBeTruthy();
    expect(isFieldLinkedToQuestionVisibilityLogic([lastNameFieldId, firstNameFieldId], workStateFieldId)).toBeFalsy();
    expect(isFieldLinkedToQuestionVisibilityLogic([], workStateFieldId)).toBeFalsy();
    expect(isFieldLinkedToQuestionVisibilityLogic([], workStateCodeFieldId)).toBeFalsy();
  });
});
