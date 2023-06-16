import {
  getUpdatedTravelBookings,
  removeTravelAnswers,
  removeTravelAlternateAnswers,
  removeAllTravelAnswers
} from '../travelAnswers';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';
import { TRAVEL_ANSWER_REQUESTED_ACTIONS } from '../../../utils/questionUtils';

jest.mock('../../selectors/currentRegistrant', () => {
  return {
    getEventRegistration: jest.fn(() => ({ eventRegistrationId: 'eventRegistrationId' }))
  };
});

const baseState = {
  appData: {
    registrationSettings: {
      travelQuestions: {
        'air-alternate-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS
            }
          },
          travelQuestionAssociations: ['airRequest']
        },
        'air-actual-alternate-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS
            }
          },
          travelQuestionAssociations: ['airActual']
        },
        'hotel-alternate-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS
            }
          },
          travelQuestionAssociations: ['hotelRequest']
        },
        'group-flight-alternate-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.GROUP_FLIGHT_ALTERNATE_QUESTIONS
            }
          },
          travelQuestionAssociations: ['groupFlightRequest']
        },
        'air-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_QUESTIONS
            }
          },
          travelQuestionAssociations: ['airRequest']
        },
        'air-actual-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
            }
          },
          travelQuestionAssociations: ['airActual']
        },
        'hotel-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
            }
          },
          travelQuestionAssociations: ['hotelRequest']
        },
        'group-flight-question': {
          question: {
            additionalInfo: {
              surveyType: SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS
            }
          },
          travelQuestionAssociations: ['groupFlightRequest']
        }
      }
    }
  },
  travelCart: {
    userSession: {
      travelAnswers: {
        'air-alternate-question_00000000-0000-0000-0000-000000000000': {},
        'air-actual-alternate-question_00000000-0000-0000-0000-000000000000': {},
        'hotel-alternate-question_00000000-0000-0000-0000-000000000000': {},
        'group-flight-alternate-question_00000000-0000-0000-0000-000000000000': {}
      }
    }
  }
};

describe('travelAnswers tests', () => {
  describe('getUpdatedTravelBookings() method', () => {
    const questionId = 'dummy-question-id';
    const requestBookingId = 'dummy-question-id';
    const eventRegistrationId = 'eventRegistrationId';
    const userSession = {
      travelAnswers: {
        [`${questionId}_${requestBookingId}`]: {
          questionId,
          eventRegistrationId,
          answers: [
            {
              answerType: 'text',
              text: 'dummyAns'
            }
          ]
        }
      }
    };

    test('should do nothing if answers are not present in userSession', () => {
      const travelCart = {
        bookings: []
      };
      const newUserSession = {
        travelAnswers: {}
      };
      const updatedTravelCart = getUpdatedTravelBookings(travelCart, newUserSession);
      expect(updatedTravelCart).toEqual(travelCart);
    });

    test('should add travel answer when no booking exist', () => {
      const travelCart = {
        bookings: []
      };
      const updatedTravelCart = getUpdatedTravelBookings(travelCart, userSession);
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(1);
    });

    test('should add travel answer for existing booking', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelAnswers: []
          }
        ]
      };
      const updatedTravelCart = getUpdatedTravelBookings(travelCart, userSession);
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(1);
    });

    test('should update travel answer if already exists', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelAnswers: [
              {
                questionId,
                requestBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'abc'
                  }
                ]
              }
            ]
          }
        ]
      };
      // Update existing answer
      const updatedTravelCart = getUpdatedTravelBookings(travelCart, userSession);
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers[0].answers[0].text).toBe('dummyAns');
    });

    test('should remove travel answer if answer text is empty', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelAnswers: [
              {
                questionId,
                requestBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'abc'
                  }
                ]
              }
            ]
          }
        ]
      };

      const newUserSession = {
        travelAnswers: {
          [`${questionId}_${requestBookingId}`]: {
            questionId,
            eventRegistrationId,
            answers: [
              {
                answerType: 'Text',
                text: ''
              }
            ]
          }
        }
      };
      const updatedTravelCart = getUpdatedTravelBookings(travelCart, newUserSession);
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(0);
    });
  });

  describe('getUpdatedTravelBookings() method for REG MOD', () => {
    const airActualQuestionId = 'air-actual-question';
    const hotelQuestionId = 'hotel-question';
    const hotelBookingId = 'hotel-booking-id';
    const airActualBookingId = 'air-actual-booking-id';
    const airRequestQuestionId = 'air-question';
    const airRequestBookingId = 'air-question-booking-id';
    const groupFlightQuestionId = 'group-flight-question';
    const groupFlightBookingId = 'group-flight-booking-id';
    const eventRegistrationId = 'eventRegistrationId';

    const airAlternateQuestionId = 'air-alternate-question';
    const airActualAlternateQuestionId = 'air-actual-alternate-question';
    const hotelAlternateQuestionId = 'hotel-alternate-question';
    const groupFlightAlternateQuestionId = 'group-flight-alternate-question';
    const requestBookingIdForAlternateQuestions = '00000000-0000-0000-0000-000000000000';

    const userSession = {
      travelAnswers: {
        [`${airRequestQuestionId}_${airRequestBookingId}`]: {
          eventRegistrationId,
          questionId: airRequestQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'uvw'
            }
          ]
        },
        [`${airActualQuestionId}_${airActualBookingId}`]: {
          eventRegistrationId,
          questionId: airActualQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'abc'
            }
          ]
        },
        [`${hotelQuestionId}_${hotelBookingId}`]: {
          eventRegistrationId,
          questionId: hotelQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'xyz'
            }
          ]
        },
        [`${groupFlightQuestionId}_${groupFlightBookingId}`]: {
          eventRegistrationId,
          questionId: groupFlightQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'def'
            }
          ]
        }
      }
    };

    const userSessionWithAlternateQuestionAnswers = {
      travelAnswers: {
        [`${airAlternateQuestionId}_${requestBookingIdForAlternateQuestions}`]: {
          eventRegistrationId,
          questionId: airAlternateQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'abc alternate'
            }
          ]
        },
        [`${airActualAlternateQuestionId}_${requestBookingIdForAlternateQuestions}`]: {
          eventRegistrationId,
          questionId: airActualAlternateQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'def alternate'
            }
          ]
        },
        [`${hotelAlternateQuestionId}_${requestBookingIdForAlternateQuestions}`]: {
          eventRegistrationId,
          questionId: hotelAlternateQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'uvw alternate'
            }
          ]
        },
        [`${groupFlightAlternateQuestionId}_${requestBookingIdForAlternateQuestions}`]: {
          eventRegistrationId,
          questionId: groupFlightAlternateQuestionId,
          answers: [
            {
              answerType: 'Text',
              text: 'xyz alternate'
            }
          ]
        }
      }
    };

    test('Reg Mod - should update travel answer action to ADD if new', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelReservationId: eventRegistrationId,
            airBookings: [
              {
                id: airRequestBookingId
              }
            ],
            airActuals: [
              {
                id: airActualBookingId
              }
            ],
            hotelRoomBookings: [
              {
                id: hotelBookingId
              }
            ],
            groupFlightBookings: [
              {
                id: groupFlightBookingId
              }
            ],
            travelAnswers: [
              {
                questionId: airRequestQuestionId,
                requestBookingId: airRequestBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: airActualQuestionId,
                requestBookingId: airActualBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: hotelQuestionId,
                requestBookingId: hotelBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'hotelAns'
                  }
                ]
              },
              {
                questionId: groupFlightQuestionId,
                requestBookingId: groupFlightBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'groupFlightAns'
                  }
                ]
              }
            ]
          }
        ]
      };
      // Update existing answer with action ADD since its a new answer
      const updatedTravelCart = getUpdatedTravelBookings(
        travelCart,
        userSession,
        baseState.appData.registrationSettings.travelQuestions
      );
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(4);
      const airRequestAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.requestBookingId === airRequestBookingId
      );
      expect(airRequestAnswer.answers[0].text).toBe('uvw');
      expect(airRequestAnswer.requestedAction).toBe('ADD');
      const airActualAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.requestBookingId === airActualBookingId
      );
      expect(airActualAnswer.answers[0].text).toBe('abc');
      expect(airActualAnswer.requestedAction).toBe('ADD');
      const hotelAnswer = updatedTravelCart.bookings[0].travelAnswers.find(a => a.requestBookingId === hotelBookingId);
      expect(hotelAnswer.answers[0].text).toBe('xyz');
      expect(hotelAnswer.requestedAction).toBe('ADD');
      const groupFlightAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.requestBookingId === groupFlightBookingId
      );
      expect(groupFlightAnswer.answers[0].text).toBe('def');
      expect(groupFlightAnswer.requestedAction).toBe('ADD');
    });

    test('Reg Mod - should update travel answer action to MODIFY if existing', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelReservationId: eventRegistrationId,
            airBookings: [
              {
                id: airRequestBookingId,
                airReservationDetailId: 'something'
              }
            ],
            airActuals: [
              {
                id: airActualBookingId,
                airReservationActualId: 'something'
              }
            ],
            hotelRoomBookings: [
              {
                id: hotelBookingId,
                hotelReservationDetailId: 'something'
              }
            ],
            groupFlightBookings: [
              {
                id: groupFlightBookingId,
                airReservationActualId: 'something'
              }
            ],
            travelAnswers: [
              {
                questionId: airRequestQuestionId,
                requestBookingId: airRequestBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: airActualQuestionId,
                requestedAction: 'ADD',
                requestBookingId: airActualBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: hotelQuestionId,
                requestedAction: 'ADD',
                requestBookingId: hotelBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: groupFlightQuestionId,
                requestBookingId: groupFlightBookingId,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'groupFlightAns'
                  }
                ]
              }
            ]
          }
        ]
      };
      // Update existing answer with action MODIFY since its an existing answer
      const updatedTravelCart = getUpdatedTravelBookings(
        travelCart,
        userSession,
        baseState.appData.registrationSettings.travelQuestions
      );
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(4);
      const airRequestAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.requestBookingId === airRequestBookingId
      );
      expect(airRequestAnswer.answers[0].text).toBe('uvw');
      expect(airRequestAnswer.requestedAction).toBe('MODIFY');
      const airActualAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.requestBookingId === airActualBookingId
      );
      expect(airActualAnswer.answers[0].text).toBe('abc');
      expect(airActualAnswer.requestedAction).toBe('MODIFY');
      const hotelAnswer = updatedTravelCart.bookings[0].travelAnswers.find(a => a.requestBookingId === hotelBookingId);
      expect(hotelAnswer.answers[0].text).toBe('xyz');
      expect(hotelAnswer.requestedAction).toBe('MODIFY');
      const groupFlightAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.requestBookingId === groupFlightBookingId
      );
      expect(groupFlightAnswer.answers[0].text).toBe('def');
      expect(groupFlightAnswer.requestedAction).toBe('MODIFY');
    });

    test('Reg Mod - should update travel alternate answer action to ADD if not existing', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelReservationId: eventRegistrationId,
            airActuals: [],
            hotelRoomBookings: [],
            travelAnswers: []
          }
        ]
      };
      // Update existing answer with action ADD since its a new alternate answer
      const updatedTravelCart = getUpdatedTravelBookings(
        travelCart,
        userSessionWithAlternateQuestionAnswers,
        baseState.appData.registrationSettings.travelQuestions
      );
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(4);

      const airAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === airAlternateQuestionId
      );
      expect(airAlternateAnswer.requestedAction).toBe('ADD');
      expect(airAlternateAnswer.answers[0].text).toBe('abc alternate');

      const airActualAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === airActualAlternateQuestionId
      );
      expect(airActualAlternateAnswer.requestedAction).toBe('ADD');
      expect(airActualAlternateAnswer.answers[0].text).toBe('def alternate');

      const hotelAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === hotelAlternateQuestionId
      );
      expect(hotelAlternateAnswer.requestedAction).toBe('ADD');
      expect(hotelAlternateAnswer.answers[0].text).toBe('uvw alternate');

      const groupFlightAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === groupFlightAlternateQuestionId
      );
      expect(groupFlightAlternateAnswer.requestedAction).toBe('ADD');
      expect(groupFlightAlternateAnswer.answers[0].text).toBe('xyz alternate');
    });

    test('Reg Mod - should update travel alternate answer action to MODIFY if existing', () => {
      const travelCart = {
        bookings: [
          {
            id: eventRegistrationId,
            travelReservationId: eventRegistrationId,
            airActuals: [],
            hotelRoomBookings: [],
            travelAnswers: [
              {
                questionId: airAlternateQuestionId,
                requestedAction: 'VIEW',
                requestBookingId: requestBookingIdForAlternateQuestions,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: airActualAlternateQuestionId,
                requestedAction: 'VIEW',
                requestBookingId: requestBookingIdForAlternateQuestions,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: hotelAlternateQuestionId,
                requestedAction: 'VIEW',
                requestBookingId: requestBookingIdForAlternateQuestions,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              },
              {
                questionId: groupFlightAlternateQuestionId,
                requestedAction: 'VIEW',
                requestBookingId: requestBookingIdForAlternateQuestions,
                answers: [
                  {
                    answerType: 'Text',
                    text: 'dummyAns'
                  }
                ]
              }
            ]
          }
        ]
      };
      // Update existing answer with action MODIFY since its an existing alternate answer
      const updatedTravelCart = getUpdatedTravelBookings(
        travelCart,
        userSessionWithAlternateQuestionAnswers,
        baseState.appData.registrationSettings.travelQuestions
      );
      expect(updatedTravelCart).toMatchSnapshot();
      expect(updatedTravelCart.bookings[0].travelAnswers.length).toBe(4);

      const airAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === airAlternateQuestionId
      );
      expect(airAlternateAnswer.requestedAction).toBe('MODIFY');
      expect(airAlternateAnswer.answers[0].text).toBe('abc alternate');

      const airActualAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === airActualAlternateQuestionId
      );
      expect(airActualAlternateAnswer.requestedAction).toBe('MODIFY');
      expect(airActualAlternateAnswer.answers[0].text).toBe('def alternate');

      const hotelAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === hotelAlternateQuestionId
      );
      expect(hotelAlternateAnswer.requestedAction).toBe('MODIFY');
      expect(hotelAlternateAnswer.answers[0].text).toBe('uvw alternate');

      const groupFlightAlternateAnswer = updatedTravelCart.bookings[0].travelAnswers.find(
        a => a.questionId === groupFlightAlternateQuestionId
      );
      expect(groupFlightAlternateAnswer.requestedAction).toBe('MODIFY');
      expect(groupFlightAlternateAnswer.answers[0].text).toBe('xyz alternate');
    });
  });

  describe('removeTravelAnswers() method', () => {
    describe('for new Reg', () => {
      test('should remove travelAnswers for booking ids', () => {
        const bookings = [
          {
            travelAnswers: [
              {
                questionId: 'dummy-question-id',
                requestBookingId: 'dummy-request-id',
                answers: [],
                requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
              }
            ]
          }
        ];
        const requestIds = ['dummy-request-id'];
        const updatedBookings = removeTravelAnswers(bookings, requestIds);
        expect(updatedBookings[0].travelAnswers.length).toBe(0);
      });
    });

    describe('for reg mod', () => {
      test('should update travelAnswers requested actions for booking ids', () => {
        const bookings = [
          {
            travelAnswers: [
              {
                questionId: 'dummy-question-id',
                requestBookingId: 'dummy-request-id',
                answers: [],
                requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.VIEW
              }
            ]
          }
        ];
        const requestIds = ['dummy-request-id'];
        const updatedBookings = removeTravelAnswers(bookings, requestIds);
        expect(updatedBookings[0].travelAnswers[0].requestedAction).toBe(TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE);
      });
    });
  });

  describe('removeTravelAlternateAnswers() method', () => {
    describe('for new reg', () => {
      test('should remove alternate travelAnswers for widget type', async () => {
        const state = {
          ...baseState,
          appData: {
            registrationSettings: {
              travelQuestions: {
                'dummy-alternate-question-id': {
                  question: {
                    additionalInfo: {
                      surveyType: SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS
                    }
                  }
                }
              }
            }
          }
        };
        const bookings = [
          {
            id: 'eventRegistrationId',
            travelAnswers: [
              {
                questionId: 'dummy-alternate-question-id',
                requestBookingId: '00000000-0000-0000-0000-000000000000',
                answers: [],
                requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
              }
            ]
          }
        ];
        const updatedTravelCart = removeTravelAlternateAnswers(state, bookings, 'AirActual');
        expect(updatedTravelCart.cart.bookings[0].travelAnswers.length).toBe(0);
      });
    });

    describe('for reg mod', () => {
      test('should update alternate travelAnswers for widget type', async () => {
        const state = {
          ...baseState,
          appData: {
            registrationSettings: {
              travelQuestions: {
                'dummy-alternate-question-id': {
                  question: {
                    additionalInfo: {
                      surveyType: SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS
                    }
                  }
                }
              }
            }
          }
        };
        const bookings = [
          {
            id: 'eventRegistrationId',
            travelAnswers: [
              {
                questionId: 'dummy-alternate-question-id',
                requestBookingId: '00000000-0000-0000-0000-000000000000',
                answers: [],
                requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.VIEW
              }
            ]
          }
        ];
        const updatedTravelCart = removeTravelAlternateAnswers(state, bookings, 'AirActual');
        expect(updatedTravelCart.cart.bookings[0].travelAnswers[0].requestedAction).toBe(
          TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
        );
      });
    });

    test('should not remove / update travelAnswers for different widget type', async () => {
      const state = {
        ...baseState,
        appData: {
          registrationSettings: {
            travelQuestions: {
              'dummy-question-id': {
                question: {
                  additionalInfo: {
                    surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
                  }
                }
              }
            }
          }
        }
      };
      const bookings = [
        {
          id: 'eventRegistrationId',
          travelAnswers: [
            {
              questionId: 'dummy-question-id',
              requestBookingId: '00000000-0000-0000-0000-000000000111',
              answers: [],
              requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
            }
          ]
        }
      ];
      const updatedTravelCart = removeTravelAlternateAnswers(state, bookings, 'HotelRequest');
      expect(updatedTravelCart.cart.bookings[0].travelAnswers.length).toBe(1);
    });

    test('should remove hotel alternate questions from user session when hotel is requested', () => {
      const bookings = [
        {
          id: 'eventRegistrationId',
          travelAnswers: [
            {
              questionId: 'air-alternate-question',
              requestBookingId: '00000000-0000-0000-0000-000000000000',
              answers: [],
              requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
            }
          ]
        }
      ];
      const updatedTravelCart = removeTravelAlternateAnswers(baseState, bookings, 'HotelRequest');
      const updatedAnswers = updatedTravelCart.userSession.travelAnswers;
      expect(Object.keys(updatedAnswers).length).toBe(3);
      expect(Object.keys(updatedAnswers).find(a => a.match('hotel-alternate-question'))).toBeFalsy();
    });

    test('should remove air alternate questions from user session when air is requested', () => {
      const bookings = [
        {
          id: 'eventRegistrationId',
          travelAnswers: [
            {
              questionId: 'air-alternate-question',
              requestBookingId: '00000000-0000-0000-0000-000000000000',
              answers: [],
              requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
            }
          ]
        }
      ];
      const updatedTravelCart = removeTravelAlternateAnswers(baseState, bookings, 'AirRequest');
      const updatedAnswers = updatedTravelCart.userSession.travelAnswers;
      expect(Object.keys(updatedAnswers).length).toBe(3);
      expect(Object.keys(updatedAnswers).find(a => a.match('air-alternate-question'))).toBeFalsy();
    });

    test('should remove air actual alternate questions from user session when air actual is requested', () => {
      const bookings = [
        {
          id: 'eventRegistrationId',
          travelAnswers: [
            {
              questionId: 'air-alternate-question',
              requestBookingId: '00000000-0000-0000-0000-000000000000',
              answers: [],
              requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
            }
          ]
        }
      ];
      const updatedTravelCart = removeTravelAlternateAnswers(baseState, bookings, 'AirActual');
      const updatedAnswers = updatedTravelCart.userSession.travelAnswers;
      expect(Object.keys(updatedAnswers).length).toBe(3);
      expect(Object.keys(updatedAnswers).find(a => a.match('air-actual-alternate-question'))).toBeFalsy();
    });

    test('should remove group flight alternate questions from user session when group flight is requested', () => {
      const bookings = [
        {
          id: 'eventRegistrationId',
          travelAnswers: [
            {
              questionId: 'air-alternate-question',
              requestBookingId: '00000000-0000-0000-0000-000000000000',
              answers: [],
              requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
            }
          ]
        }
      ];
      const updatedTravelCart = removeTravelAlternateAnswers(baseState, bookings, 'GroupFlight');
      const updatedAnswers = updatedTravelCart.userSession.travelAnswers;
      expect(Object.keys(updatedAnswers).length).toBe(3);
      expect(Object.keys(updatedAnswers).find(a => a.match('group-flight-alternate-question'))).toBeFalsy();
    });
  });

  describe('removeAllTravelAnswers() method', () => {
    describe('for new reg', () => {
      test('should remove travel answers', () => {
        const initialTravelBookings = [
          {
            id: 'eventRegistrationId',
            travelAnswers: [
              {
                questionId: 'dummy-question-id',
                requestBookingId: '00000000-0000-0000-0000-000000000111',
                answers: [],
                requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
              }
            ]
          },
          {
            id: 'eventRegistrationId2'
          }
        ];

        const travelAnswersToCancel = [
          {
            questionId: 'dummy-question-id',
            requestBookingId: '00000000-0000-0000-0000-000000000111',
            answers: [],
            requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD,
            attendeeRegistrationId: 'eventRegistrationId'
          }
        ];
        const updatedBookings = removeAllTravelAnswers(initialTravelBookings, travelAnswersToCancel);
        expect(updatedBookings).toMatchSnapshot();
      });
    });

    describe('for reg mod', () => {
      test('should update travel answers', () => {
        const initialTravelBookings = [
          {
            id: 'eventRegistrationId',
            travelAnswers: [
              {
                questionId: 'dummy-question-id-2',
                requestBookingId: '00000000-0000-0000-0000-000000000111',
                answers: [],
                requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.VIEW
              }
            ]
          },
          {
            id: 'eventRegistrationId2'
          }
        ];

        const travelAnswersToCancel = [
          {
            questionId: 'dummy-question-id-2',
            requestBookingId: '00000000-0000-0000-0000-000000000111',
            answers: [],
            requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.VIEW,
            attendeeRegistrationId: 'eventRegistrationId'
          }
        ];
        const updatedBookings = removeAllTravelAnswers(initialTravelBookings, travelAnswersToCancel);
        expect(updatedBookings).toMatchSnapshot();
      });
    });
  });
});
