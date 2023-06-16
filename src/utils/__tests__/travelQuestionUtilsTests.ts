import { getTravelQuestionsData, getTravelAnswer } from '../travelQuestionUtils';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';
import {
  getQuestionFieldName,
  getQuestionSurveyType,
  getTravelAnswerData,
  buildTravelQuestionAnswerPath,
  TRAVEL_ANSWER_REQUESTED_ACTIONS
} from '../questionUtils';

jest.mock('../../redux/selectors/currentRegistrant', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/selectors/currentRegistrant'),
    getEventRegistration: () => ({ eventRegistrationId: 'eventRegistrationIdOne' }),
    getConfirmedGuests: () => []
  };
});

const widgetPresentProps = {
  isAirActualWidgetPresent: true,
  isAirRequestWidgetPresent: true,
  isGroupFlightWidgetPresent: true,
  isHotelRequestWidgetPresent: true
};

const widgetAbsentProps = {
  isAirActualWidgetPresent: false,
  isAirRequestWidgetPresent: false,
  isGroupFlightWidgetPresent: false,
  isHotelRequestWidgetPresent: false
};

const testEventRegistrationId = 'eventRegistrationIdOne';
const guestBookingId = 'guestBookingId';

const config = {
  id: '123',
  appData: {
    question: {
      additionalInfo: {
        surveyType: SURVEY_TYPE.HOTEL_QUESTIONS
      }
    }
  }
};

const state = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          isDefault: true,
          isActive: true,
          associatedRegistrationTypes: [],
          id: 'regPathId'
        }
      }
    }
  },
  eventTravel: {
    hotelsData: {
      isHotelRequestEnabled: true,
      hotels: [
        {
          id: 'hotelId',
          isActive: true,
          roomTypes: [
            {
              id: 'room1Id',
              roomRate: [],
              isOpenForRegistration: true,
              associatedRegPathSettings: {
                regPathId: { allowCharge: true }
              }
            }
          ]
        }
      ]
    },
    airData: {
      isAirRequestFormEnabled: true,
      isAirActualFormEnabled: true,
      isGroupFlightEnabled: true,
      airActualSetup: {
        isPlannerDisplayOnly: false,
        displaySettings: {}
      }
    }
  },
  travelCart: {
    cart: {
      bookings: [
        {
          id: testEventRegistrationId,
          requestedAction: 'BOOK',
          airBookings: [
            {
              id: 'airBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'airBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'airBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          hotelRoomBookings: [
            {
              id: 'hotelRoomBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'hotelRoomBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'hotelRoomBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          airActuals: [
            {
              id: 'airActualIdOne',
              requestedAction: 'BOOK',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'airActualIdTwo',
              requestedAction: 'MODIFY',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'airActualIdThree',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            }
          ],
          groupFlightBookings: [
            {
              id: 'groupFlightBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'groupFlightBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'groupFlightBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ]
        },
        {
          id: 'bookingTwo',
          requestedAction: 'CANCEL',
          airBookings: [
            {
              id: 'newAirBookingIdOne',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newAirBookingIdTwo',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newAirBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          hotelRoomBookings: [
            {
              id: 'newHotelRoomBookingIdOne',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newHotelRoomBookingIdTwo',
              requestedAction: 'CANCEL'
            },
            {
              id: 'newHotelRoomBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          airActuals: [
            {
              id: 'newAirActualIdOne',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'newAirActualIdTwo',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'newAirActualIdThree',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            }
          ]
        },
        {
          id: guestBookingId,
          requestedAction: 'BOOK',
          airBookings: [
            {
              id: 'guestAirBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'guestAirBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'guestAirBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          hotelRoomBookings: [
            {
              id: 'guestHotelRoomBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'guestHotelRoomBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'guestHotelRoomBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ],
          airActuals: [
            {
              id: 'guestAirActualIdOne',
              requestedAction: 'BOOK',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'guestAirActualIdTwo',
              requestedAction: 'MODIFY',
              flightDetails: [],
              currencyId: 123
            },
            {
              id: 'guestAirActualIdThree',
              requestedAction: 'CANCEL',
              flightDetails: [],
              currencyId: 123
            }
          ],
          groupFlightBookings: [
            {
              id: 'guestGroupFlightBookingIdOne',
              requestedAction: 'BOOK'
            },
            {
              id: 'guestGroupFlightBookingIdTwo',
              requestedAction: 'MODIFY'
            },
            {
              id: 'guestGroupFlightBookingIdThree',
              requestedAction: 'CANCEL'
            }
          ]
        }
      ]
    }
  },
  text: {
    translate: x => x
  }
};

describe('questionUtils tests', () => {
  describe('getQuestionSurveyType() method', () => {
    test('should return survey type', () => {
      expect(getQuestionSurveyType(config)).toBe(SURVEY_TYPE.HOTEL_QUESTIONS);
    });
  });

  describe('getQuestionFieldName() method', () => {
    test('should return name for travel question', () => {
      const props = {
        ...widgetPresentProps,
        config,
        booking: {
          id: 'requestId'
        }
      };
      const fieldName = getQuestionFieldName(props);
      expect(fieldName).toBe('123-requestId');
    });

    test('should return name for product question', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          id: '456',
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.ADMISSION_ITEM_REGISTRATION_QUESTIONS
              }
            }
          }
        },
        eventRegistrationId: 'eventRegId'
      };
      const fieldName = getQuestionFieldName(props);
      expect(fieldName).toBe('456-eventRegId');
    });
  });

  describe('getTravelAnswerData() method', () => {
    const questionId = 'dummy-question-id';
    const requestBookingId = 'dummy-question-id';
    const eventRegistrationId = 'eventRegistrationId';
    const newState = {
      travelCart: {
        userSession: {
          travelAnswers: {
            [`${questionId}_${requestBookingId}`]: {
              questionId,
              eventRegistrationId,
              answers: [
                {
                  answerType: 'text',
                  text: 'userSession answer'
                }
              ]
            }
          }
        },
        cart: {
          bookings: [
            {
              id: eventRegistrationId,
              travelAnswers: [
                {
                  questionId,
                  requestBookingId,
                  answers: [
                    {
                      answerType: 'text',
                      text: 'travelCart answer'
                    }
                  ],
                  requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
                },
                {
                  questionId,
                  requestBookingId: 'requestBookingId-2',
                  answers: [
                    {
                      answerType: 'text',
                      text: 'travelCart answer'
                    }
                  ],
                  requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
                }
              ]
            }
          ]
        }
      }
    };
    const path = ['userSession', 'travelAnswers', `${questionId}_${requestBookingId}`];

    test('should fetch data from userSession', () => {
      const answer = getTravelAnswerData(newState, path, eventRegistrationId);
      expect(answer).toMatchSnapshot();
      expect(answer.answers[0].text).toBe('userSession answer');
    });

    test('should fetch data from travelCart if not exist in userSession', () => {
      const updatedState = {
        ...newState,
        travelCart: {
          ...newState.travelCart,
          userSession: {
            travelAnswers: {}
          }
        }
      };
      const answer = getTravelAnswerData(updatedState, path, eventRegistrationId);
      expect(answer).toMatchSnapshot();
      expect(answer.answers[0].text).toBe('travelCart answer');
    });
  });

  describe('getTravelQuestionsData() method', () => {
    describe('for hotel requests', () => {
      test('should return questions data for parent question', () => {
        const props = {
          ...widgetPresentProps,
          config: {
            appData: {
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.HOTEL_QUESTIONS
                }
              }
            }
          }
        };
        const res = getTravelQuestionsData(state, props);
        expect(res.length).toBe(2);
      });

      test('should return questions data for child question', () => {
        const props = {
          ...widgetPresentProps,
          config: {
            appData: {
              parentQuestionId: 'parentQuestionId',
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.HOTEL_QUESTIONS
                }
              }
            }
          },
          metaData: {
            bookingId: 'hotelRoomBookingIdOne'
          }
        };
        const res = getTravelQuestionsData(state, props);
        expect(res.length).toBe(1);
      });
    });

    test('should return empty array when widget is not present', () => {
      const props = {
        ...widgetAbsentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.HOTEL_QUESTIONS
              }
            }
          }
        }
      };
      const res = getTravelQuestionsData(state, props);
      expect(res).toEqual([]);
    });

    describe('for hotel alternate question', () => {
      describe('when hotel booking exists', () => {
        test('should return empty array', () => {
          const props = {
            ...widgetAbsentProps,
            config: {
              appData: {
                question: {
                  additionalInfo: {
                    surveyType: SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS
                  }
                }
              }
            }
          };
          const res = getTravelQuestionsData(state, props);
          expect(res).toEqual([]);
        });
      });

      describe('when hotel booking does not exists', () => {
        const newState = {
          ...state,
          travelCart: {
            cart: {
              bookings: []
            }
          }
        };
        const props = {
          ...widgetPresentProps,
          config: {
            appData: {
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS
                }
              }
            }
          }
        };

        test('should return questions data for parent question', () => {
          const res = getTravelQuestionsData(newState, props);
          expect(res.length).toBe(1);
        });

        test('should return questions data for child question', () => {
          const newProps = {
            ...widgetPresentProps,
            config: {
              appData: {
                parentQuestionId: 'parentQuestionId',
                question: {
                  additionalInfo: {
                    surveyType: SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS
                  }
                }
              }
            },
            metaData: {
              bookingId: 'hotelRoomBookingIdOne'
            }
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res.length).toBe(1);
        });

        describe('when isHotelRequestEnabled is false', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              hotelsData: {
                ...newState.eventTravel.hotelsData,
                isHotelRequestEnabled: false
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });

        describe('when hotel is not active', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              hotelsData: {
                ...newState.eventTravel.hotelsData,
                hotels: [
                  {
                    ...newState.eventTravel.hotelsData.hotels[0],
                    isActive: false
                  }
                ]
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });

        describe('when room is not open for registration', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              hotelsData: {
                ...newState.eventTravel.hotelsData,
                hotels: [
                  {
                    ...newState.eventTravel.hotelsData.hotels[0],
                    roomTypes: [
                      {
                        ...newState.eventTravel.hotelsData.hotels[0].roomTypes[0],
                        isOpenForRegistration: false
                      }
                    ]
                  }
                ]
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });

        describe('when widget is not present', () => {
          test('should return empty array', () => {
            const newProps = {
              ...props,
              ...widgetAbsentProps
            };
            const res = getTravelQuestionsData(newState, newProps);
            expect(res).toEqual([]);
          });
        });
      });
    });

    describe('for air questions', () => {
      test('should return questions data for parent question', () => {
        const props = {
          ...widgetPresentProps,
          config: {
            appData: {
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.AIR_QUESTIONS
                }
              }
            }
          }
        };
        const res = getTravelQuestionsData(state, props);
        expect(res.length).toBe(2);
      });

      test('should return questions data for child question', () => {
        const props = {
          ...widgetPresentProps,
          config: {
            appData: {
              parentQuestionId: 'parentQuestionId',
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.AIR_QUESTIONS
                }
              }
            }
          },
          metaData: {
            bookingId: 'airBookingIdOne'
          }
        };
        const res = getTravelQuestionsData(state, props);
        expect(res.length).toBe(1);
      });
    });

    test('should return empty array when widget is not present 1', () => {
      const props = {
        ...widgetAbsentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_QUESTIONS
              }
            }
          }
        }
      };
      const res = getTravelQuestionsData(state, props);
      expect(res).toEqual([]);
    });

    describe('for air alternate question', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS
              }
            }
          }
        }
      };
      describe('when air booking exists', () => {
        test('should return empty array', () => {
          const res = getTravelQuestionsData(state, props);
          expect(res).toEqual([]);
        });
      });

      describe('when air booking does not exists', () => {
        const newState = {
          ...state,
          travelCart: {
            cart: {
              bookings: []
            }
          }
        };
        test('should return questions data for parent question', () => {
          const res = getTravelQuestionsData(newState, props);
          expect(res.length).toBe(1);
        });

        test('should return questions data for child question', () => {
          const newProps = {
            ...widgetPresentProps,
            config: {
              appData: {
                parentQuestionId: 'parentQuestionId',
                question: {
                  additionalInfo: {
                    surveyType: SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS
                  }
                }
              }
            },
            metaData: {
              bookingId: 'airBookingIdOne'
            }
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res.length).toBe(1);
        });

        describe('when air request settings are disabled', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              airData: {
                ...newState.eventTravel.airData,
                isAirRequestFormEnabled: false
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });
      });
      describe('when widget is not present', () => {
        test('should return empty array', () => {
          const newState = {
            ...state,
            travelCart: {
              cart: {
                bookings: []
              }
            }
          };
          const newProps = {
            ...props,
            ...widgetAbsentProps
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res).toEqual([]);
        });
      });
    });

    describe('for air actual questions', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
              }
            }
          }
        }
      };
      test('should return questions data for parent question', () => {
        const res = getTravelQuestionsData(state, props);
        expect(res.length).toBe(2);
      });

      test('should return questions data for child question', () => {
        const newProps = {
          ...widgetPresentProps,
          config: {
            appData: {
              parentQuestionId: 'parentQuestionId',
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
                }
              }
            }
          },
          metaData: {
            bookingId: 'airActualIdOne'
          }
        };
        const res = getTravelQuestionsData(state, newProps);
        expect(res.length).toBe(1);
      });
    });

    test('should return empty array when widget is not present 2', () => {
      const props = {
        ...widgetAbsentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ACTUAL_QUESTIONS
              }
            }
          }
        }
      };
      const res = getTravelQuestionsData(state, props);
      expect(res).toEqual([]);
    });

    describe('for air actual alternate question', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS
              }
            }
          }
        }
      };
      describe('when air actual exists', () => {
        test('should return empty array', () => {
          const res = getTravelQuestionsData(state, props);
          expect(res).toEqual([]);
        });
      });

      describe('when air actual does not exists', () => {
        const newState = {
          ...state,
          travelCart: {
            cart: {
              bookings: []
            }
          }
        };
        test('should return questions data for parent question', () => {
          const res = getTravelQuestionsData(newState, props);
          expect(res.length).toBe(1);
        });

        test('should return questions data for child question', () => {
          const newProps = {
            ...widgetPresentProps,
            config: {
              appData: {
                parentQuestionId: 'parentQuestionId',
                question: {
                  additionalInfo: {
                    surveyType: SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS
                  }
                }
              }
            },
            metaData: {
              bookingId: 'airActualIdOne'
            }
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res.length).toBe(1);
        });

        describe('when air actual settings only for planner', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              airData: {
                ...newState.eventTravel.airData,
                airActualSetup: {
                  ...newState.eventTravel.airData.airActualSetup,
                  isPlannerDisplayOnly: true
                }
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });
      });
      describe('when widget is not present', () => {
        test('should return empty array', () => {
          const newState = {
            ...state,
            travelCart: {
              cart: {
                bookings: []
              }
            }
          };
          const newProps = {
            ...props,
            ...widgetAbsentProps
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res).toEqual([]);
        });
      });
    });

    test('should return empty array if survey type does not belong to travel', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          appData: {
            parentQuestionId: 'parentQuestionId',
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.REGISTRANT_SURVEY
              }
            }
          }
        },
        metaData: {
          bookingId: 'hotelRoomBookingIdOne'
        }
      };
      const res = getTravelQuestionsData(state, props);
      expect(res).toEqual([]);
    });

    describe('for group flight questions', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS
              }
            }
          }
        }
      };

      test('should return questions data for parent question', () => {
        const res = getTravelQuestionsData(state, props);
        expect(res.length).toBe(2);
      });

      test('should return questions data for child question', () => {
        const newProps = {
          ...widgetPresentProps,
          config: {
            appData: {
              parentQuestionId: 'parentQuestionId',
              question: {
                additionalInfo: {
                  surveyType: SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS
                }
              }
            }
          },
          metaData: {
            bookingId: 'groupFlightBookingIdOne'
          }
        };
        const res = getTravelQuestionsData(state, newProps);
        expect(res.length).toBe(1);
      });
    });

    test('should return empty array when group flight widget is not present', () => {
      const props = {
        ...widgetAbsentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS
              }
            }
          }
        }
      };
      const res = getTravelQuestionsData(state, props);
      expect(res).toEqual([]);
    });

    describe('for group flight alternate question', () => {
      const props = {
        ...widgetPresentProps,
        config: {
          appData: {
            question: {
              additionalInfo: {
                surveyType: SURVEY_TYPE.GROUP_FLIGHT_ALTERNATE_QUESTIONS
              }
            }
          }
        }
      };
      describe('when group flight booking exists', () => {
        test('should return empty array', () => {
          const res = getTravelQuestionsData(state, props);
          expect(res).toEqual([]);
        });
      });

      describe('when group flight booking does not exists', () => {
        const newState = {
          ...state,
          travelCart: {
            cart: {
              bookings: []
            }
          }
        };
        test('should return questions data for parent question', () => {
          const res = getTravelQuestionsData(newState, props);
          expect(res.length).toBe(1);
        });

        test('should return questions data for child question', () => {
          const newProps = {
            ...widgetPresentProps,
            config: {
              appData: {
                parentQuestionId: 'parentQuestionId',
                question: {
                  additionalInfo: {
                    surveyType: SURVEY_TYPE.GROUP_FLIGHT_ALTERNATE_QUESTIONS
                  }
                }
              }
            },
            metaData: {
              bookingId: 'groupFlightBookingIdOne'
            }
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res.length).toBe(1);
        });

        describe('when group flight settings are disabled', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              airData: {
                ...newState.eventTravel.airData,
                isGroupFlightEnabled: false
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });

        describe('when group flight settings are disabled 1', () => {
          const updatedState = {
            ...newState,
            eventTravel: {
              ...newState.eventTravel,
              airData: {
                ...newState.eventTravel.airData,
                isGroupFlightEnabled: false
              }
            }
          };

          test('should return empty array', () => {
            const res = getTravelQuestionsData(updatedState, props);
            expect(res).toEqual([]);
          });
        });
      });
      describe('when widget is not present', () => {
        test('should return empty array', () => {
          const newState = {
            ...state,
            travelCart: {
              cart: {
                bookings: []
              }
            }
          };
          const newProps = {
            ...props,
            ...widgetAbsentProps
          };
          const res = getTravelQuestionsData(newState, newProps);
          expect(res).toEqual([]);
        });
      });
    });
  });

  describe('getTravelAnswer() method', () => {
    it('should fetch values from userSession', () => {
      const questionId = 'dummy-question-id';
      const requestBookingId = 'dummy-question-id';
      const eventRegistrationId = 'eventRegistrationId';
      const newState = {
        travelCart: {
          userSession: {
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
          },
          cart: {
            bookings: []
          }
        }
      };
      const ans = getTravelAnswer({
        state: newState,
        answerPath: buildTravelQuestionAnswerPath(questionId, requestBookingId),
        eventRegistrationId
      });
      expect(ans).toMatchSnapshot();
    });
  });
});
