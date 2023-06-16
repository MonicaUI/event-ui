import { getTravelQuestion } from 'event-widgets/redux/selectors/appData';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';
import * as currentRegistrant from '../selectors/currentRegistrant';
import { uniq } from 'lodash';
import { TRAVEL_ANSWER_REQUESTED_ACTIONS } from '../../utils/questionUtils';
import { getIn } from 'icepick';

const alternateAnswerSurveyTypes = [
  SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS,
  SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS,
  SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS,
  SURVEY_TYPE.GROUP_FLIGHT_ALTERNATE_QUESTIONS
];

/**
 * Update travel bookings for travel answers
 * @param {Object} travelCart
 * @param {Object} userSession
 * @returns {Object}
 */
export function getUpdatedTravelBookings(
  travelCart: $TSFixMe,
  userSession: $TSFixMe,
  travelQuestions?: $TSFixMe
): $TSFixMe {
  const { travelAnswers } = userSession;
  const allAnswers = Object.values(travelAnswers);
  // If no answers, do not update travelCart
  if (allAnswers.length === 0) {
    return travelCart;
  }

  let travelBookings = [...travelCart.bookings];
  for (const id in travelAnswers) {
    // eslint-disable-next-line no-prototype-builtins
    if (travelAnswers.hasOwnProperty(id)) {
      const ans = travelAnswers[id];
      const [questionId, requestBookingId] = id.split('_');
      const existingTravelBooking = travelBookings.find(booking => booking.id === ans.eventRegistrationId);
      // If bookings exist
      if (existingTravelBooking) {
        const existingAnswer = existingTravelBooking.travelAnswers.find(
          answer => answer.questionId === questionId && answer.requestBookingId === requestBookingId
        );

        // If answer exists, update it
        if (existingAnswer) {
          // If answer is deleted, then remove it from booking (in new reg)
          if (isEmptyAnswer(ans)) {
            existingTravelBooking.travelAnswers = existingTravelBooking.travelAnswers.reduce((accumulator, answer) => {
              const newAccumulator = [...accumulator];
              if (!(answer.questionId === questionId && answer.requestBookingId === requestBookingId)) {
                newAccumulator.push(answer);
              } else {
                // Updating requested action in case or reg mod
                if (
                  existingTravelBooking.travelReservationId &&
                  answer.requestedAction !== TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
                ) {
                  newAccumulator.push({
                    ...createTravelAnswer(ans, requestBookingId),
                    requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
                  });
                }
              }
              return newAccumulator;
            }, []);
          } else {
            // check if the answer is from an existing booking(hotel/air/airActual/groupFlight)
            const isModifiedAnswer =
              existingTravelBooking.travelReservationId &&
              shouldMarkAnswerModified(existingAnswer, travelQuestions, existingTravelBooking);
            existingTravelBooking.travelAnswers = [
              ...existingTravelBooking.travelAnswers.filter(
                answer => !(answer.questionId === questionId && answer.requestBookingId === requestBookingId)
              ),
              createTravelAnswer(ans, requestBookingId, isModifiedAnswer)
            ];
          }
        } else {
          // Do not push answer if value is empty
          if (!isEmptyAnswer(ans)) {
            // add new answer
            existingTravelBooking.travelAnswers = [
              ...existingTravelBooking.travelAnswers,
              createTravelAnswer(ans, requestBookingId)
            ];
          }
        }

        travelBookings = [
          ...travelBookings.filter(booking => booking.id !== ans.eventRegistrationId),
          existingTravelBooking
        ];
      } else {
        // If no booking exists, add new
        travelBookings = [
          ...travelBookings,
          {
            id: ans.eventRegistrationId,
            travelAnswers: [createTravelAnswer(ans, requestBookingId)]
          }
        ];
      }
    }
  }

  return {
    ...travelCart,
    bookings: travelBookings
  };
}

/**
 * Returns updated travelCart with travel answers
 * @param {Object} cart
 * @returns {*}
 */
export function updateTravelAnswers(cart: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      travelCart: { userSession },
      appData: {
        registrationSettings: { travelQuestions }
      }
    } = getState();
    return getUpdatedTravelBookings(cart, userSession, travelQuestions);
  };
}

/**
 * create a travel answer object
 * @param {Object} answer
 * @param {string} requestBookingId
 * @returns {Object}
 */
function createTravelAnswer(answer, requestBookingId, isModifiedAnswer?) {
  const { answers, questionId } = answer;
  return {
    answers,
    questionId,
    requestBookingId,
    requestedAction: isModifiedAnswer ? TRAVEL_ANSWER_REQUESTED_ACTIONS.MODIFY : TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD
  };
}

/**
 * Check whether answer is empty or not
 * @param {Object} answer
 * @returns {boolean}
 */
function isEmptyAnswer(answer) {
  if (!answer.answers.length) return true;
  return answer.answers.every(ans => {
    if (ans.answerType === 'Text') {
      return ans.text === '' || (typeof ans.text === 'object' && ans.text.dateText === '');
    }
    return false;
  });
}

/**
 * Removes travel answers from booking for list of request ids
 * @param {Array} bookings
 * @param {Array} requestIds
 * @returns {Array}
 */
export function removeTravelAnswers(bookings: $TSFixMe, requestIds: $TSFixMe): $TSFixMe {
  return bookings.map(booking => {
    return {
      ...booking,
      travelAnswers: (booking.travelAnswers || [])
        .filter(ans => {
          return !(
            ans.requestedAction === TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD && requestIds.includes(ans.requestBookingId)
          );
        })
        .map(ans => {
          return {
            ...ans,
            requestedAction: requestIds.includes(ans.requestBookingId)
              ? TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
              : ans.requestedAction
          };
        })
    };
  });
}

/**
 * Removes all provided travel answers from bookings
 * @param {Array<Object>} initialTravelBookings
 * @param {Array<Object>} travelAnswersToCancel
 * @returns {Array}
 */
export function removeAllTravelAnswers(initialTravelBookings: $TSFixMe, travelAnswersToCancel: $TSFixMe): $TSFixMe {
  const travelBookingIdsToUpdate = uniq(travelAnswersToCancel.map(a => a.attendeeRegistrationId));
  return [
    ...initialTravelBookings.filter(booking => !travelBookingIdsToUpdate.includes(booking.id)),
    ...initialTravelBookings
      .filter(booking => travelBookingIdsToUpdate.includes(booking.id))
      .map(booking => {
        return {
          ...booking,
          travelAnswers: booking.travelAnswers
            .map(ans => {
              if (ans.requestedAction === TRAVEL_ANSWER_REQUESTED_ACTIONS.VIEW) {
                return {
                  ...ans,
                  requestedAction: TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE // those already in sql
                };
              }
            })
            .filter(a => a)
        };
      })
  ];
}

/**
 * remove alternate answers from user session. To handle cases like prod-81952 (using browser back button instead of
 * previous button)
 * @param state
 * @param requestWidgetType
 * @returns {Promise<void>}
 */
function filterTravelAnswersOfUserSession(state, requestWidgetType) {
  const {
    travelCart: {
      userSession: { travelAnswers }
    }
  } = state;
  const filteredAnswers = {};

  for (const answerId in travelAnswers) {
    // eslint-disable-next-line no-prototype-builtins
    if (travelAnswers.hasOwnProperty(answerId)) {
      const existingAnswer = travelAnswers[answerId];
      const [questionId, requestBookingId] = answerId.split('_');

      if (!isAlternateAnswer(state, { questionId, requestBookingId, ...existingAnswer }, requestWidgetType)) {
        // if not an alternate answer, keep it.
        filteredAnswers[answerId] = existingAnswer;
      }
    }
  }
  return filteredAnswers;
}

/**
 * Removes alternate travel answers from bookings for current registrant and return updated travel cart
 * @param {Object} state
 * @param {Array} bookings
 * @param {string} requestWidgetType
 * @returns {Array}
 */
export function removeTravelAlternateAnswers(
  state: $TSFixMe,
  bookings: $TSFixMe,
  requestWidgetType: $TSFixMe
): $TSFixMe {
  const { eventRegistrationId } = currentRegistrant.getEventRegistration(state) || {};
  const { travelCart } = state;
  const filteredAnswers = filterTravelAnswersOfUserSession(state, requestWidgetType);

  const updatedBookings = bookings.map(booking => {
    if (booking.id === eventRegistrationId) {
      return {
        ...booking,
        travelAnswers: (booking.travelAnswers || [])
          .filter(
            ans =>
              !(
                ans.requestedAction === TRAVEL_ANSWER_REQUESTED_ACTIONS.ADD &&
                isAlternateAnswer(state, ans, requestWidgetType)
              )
          )
          .map(ans => {
            return {
              ...ans,
              requestedAction: isAlternateAnswer(state, ans, requestWidgetType)
                ? TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
                : ans.requestedAction
            };
          })
      };
    }
    return booking;
  });

  return {
    ...travelCart,
    cart: {
      ...travelCart.cart,
      bookings: updatedBookings
    },
    userSession: {
      ...travelCart.userSession,
      travelAnswers: filteredAnswers
    }
  };
}

/**
 * transforms travel cart answers. Checks for Date/Time answers having null value to replace with ""
 * @param travelAnswers
 */
export function transformTravelAnswers(travelAnswers: $TSFixMe): $TSFixMe {
  return (travelAnswers || []).map(travelAnswer => {
    return {
      ...travelAnswer,
      answers: (travelAnswer.answers || []).map(ans => {
        // if date time answer is empty then set text as ""
        if (ans.answerType === 'Text' && typeof ans.text === 'object' && ans.text.dateText === '') {
          return {
            ...ans,
            text: ''
          };
        }

        return ans;
      })
    };
  });
}

/**
 * Returns if an answer is an alternate answer
 * @param {*} travelAnswer
 * @param {*} requestWidgetType
 */
function isAlternateAnswer(state, travelAnswer, requestWidgetType) {
  const { appData } = state;
  const travelQuestion = getTravelQuestion(appData, travelAnswer.questionId);
  if (travelQuestion) {
    const { surveyType } = travelQuestion.question.additionalInfo;
    return (
      travelAnswer.requestBookingId === '00000000-0000-0000-0000-000000000000' &&
      getWidgetTypeBySurveyType(surveyType) === requestWidgetType
    );
  }
  return false;
}

/**
 * Returns travel widget type based on surveyType.
 * @param {string} surveyType
 * @returns {string}
 */
function getWidgetTypeBySurveyType(surveyType) {
  switch (surveyType) {
    case SURVEY_TYPE.HOTEL_QUESTIONS:
    case SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS:
      return 'HotelRequest';
    case SURVEY_TYPE.AIR_QUESTIONS:
    case SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS:
      return 'AirRequest';
    case SURVEY_TYPE.AIR_ACTUAL_QUESTIONS:
    case SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS:
      return 'AirActual';
    case SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS:
    case SURVEY_TYPE.GROUP_FLIGHT_ALTERNATE_QUESTIONS:
      return 'GroupFlight';
    default:
      return null;
  }
}

/**
 * identifies if an existing answer is a new answer (answered in new reg process)
 * or a modified answer (which was earlier answered in previous reg process)
 * @param {*} answer
 * @param {*} travelQuestions
 * @param {*} travelBooking
 */
function shouldMarkAnswerModified(answer, travelQuestions, travelBooking) {
  const questionType = getIn(travelQuestions, [answer.questionId, 'travelQuestionAssociations', 0]);

  /*
   * PROD-89870: check if existing answer is for an alternate question because they don't have an associated
   * reservation detail id
   */
  const surveyType = getIn(travelQuestions, [answer.questionId, 'question', 'additionalInfo', 'surveyType']);
  if (
    answer.requestBookingId === '00000000-0000-0000-0000-000000000000' &&
    alternateAnswerSurveyTypes.includes(surveyType)
  ) {
    return true;
  }

  // there can be only one association for travelQuestion, not sure why kept as []
  switch (questionType) {
    case 'airActual':
      return travelBooking.airActuals.find(a => a.id === answer.requestBookingId).airReservationActualId;
    case 'airRequest':
      return travelBooking.airBookings.find(a => a.id === answer.requestBookingId).airReservationDetailId;
    case 'hotelRequest':
      return travelBooking.hotelRoomBookings.find(a => a.id === answer.requestBookingId).hotelReservationDetailId;
    case 'groupFlightRequest':
      return travelBooking.groupFlightBookings.find(a => a.id === answer.requestBookingId).airReservationActualId;
    default:
      return;
  }
}
