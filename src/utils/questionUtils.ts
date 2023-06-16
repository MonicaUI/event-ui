import { getIn } from 'icepick';
import { isTravelQuestion } from 'event-widgets/utils/travelUtils';
import {
  getRegistrationQuestions,
  getQuestionVisibilityFilters,
  getProductQuestions
} from 'event-widgets/redux/selectors/appData';
import TextAndDateAnswer from '../widgets/QuestionsAndFields/model/TextAndDateAnswer';
import moment from 'moment';
import Fields from '@cvent/event-fields/RegistrationOptionFields.json';

export const TRAVEL_ANSWER_REQUESTED_ACTIONS = {
  ADD: 'ADD',
  MODIFY: 'MODIFY',
  DELETE: 'DELETE',
  VIEW: 'VIEW'
};

const PRIMARY_SUFFIX = '-primary';

/**
 * Returns survey type from config object
 * @param {Object} config
 * @returns {string}
 */
export function getQuestionSurveyType(config: $TSFixMe): $TSFixMe {
  return getIn(config, ['appData', 'question', 'additionalInfo', 'surveyType']);
}

/**
 * Returns Field name for product and travel questions
 * @param {Object} props
 * @returns {string}
 */
export function getQuestionFieldName(props: $TSFixMe, isQuestionForPrimary = false): $TSFixMe {
  // adding suffix to distinguish primary shared question question from guest shared question
  const questionSuffix = isQuestionForPrimary ? PRIMARY_SUFFIX : '';
  if (isTravelQuestion(getQuestionSurveyType(props.config))) {
    return props.config.id + (props.booking.id ? '-' + props.booking.id : '');
  }
  return props.config.id + (props.eventRegistrationId ? '-' + props.eventRegistrationId : '') + questionSuffix;
}

/**
 * Returns answer from userSession or travelCart
 * @param {Object} state
 * @param {Array} path
 * @param {string} eventRegistrationId
 * @returns {Object}
 */
export function getTravelAnswerData(state: $TSFixMe, path: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe {
  // check for answer in userSession
  let answer = getIn(state, ['travelCart', ...path]);
  // check for answer in travelCart
  if (!answer) {
    const existingBooking = (state.travelCart.cart.bookings || []).find(booking => booking.id === eventRegistrationId);
    if (existingBooking) {
      const [questionId, requestBookingId] = path[2].split('_');
      answer = existingBooking.travelAnswers.find(
        ans =>
          ans.questionId === questionId &&
          ans.requestBookingId === requestBookingId &&
          ans.requestedAction !== TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE
      );
      return answer;
    }
  }
  return answer;
}

/**
 * Returns path array to fetch travel answer
 * @param {string} questionId
 * @param {string} bookingId
 * @returns {Array}
 */
export function buildTravelQuestionAnswerPath(questionId: $TSFixMe, bookingId: $TSFixMe): $TSFixMe {
  return ['userSession', 'travelAnswers', `${questionId}_${bookingId}`];
}

export const isProductQuestion = (state: $TSFixMe, questionId: $TSFixMe): $TSFixMe => {
  return !!getIn(state, ['registrationSettings', 'productQuestions', questionId]);
};

export const isGuestQuestion = (state: $TSFixMe, questionId: $TSFixMe): $TSFixMe => {
  const question = getIn(state, ['appData', 'registrationSettings', 'registrationQuestions', questionId]);
  let isGuest = false;

  if (question) {
    const audienceType = question.question.additionalInfo.audienceType;

    if (audienceType && audienceType === 'GuestOnly') {
      isGuest = true;
    }
  }

  return isGuest;
};

export const isQuestionAvailableForRegistrant = (
  state: $TSFixMe,
  questionId: $TSFixMe,
  isGuestReg: $TSFixMe
): $TSFixMe => {
  const regQuestion = getIn(state, ['appData', 'registrationSettings', 'registrationQuestions', questionId]);
  let isAvailable = false;

  if (regQuestion) {
    const audienceType = regQuestion.question.additionalInfo.audienceType;

    if (!isGuestReg && audienceType && audienceType !== 'GuestOnly') {
      isAvailable = true;
    }

    if (isGuestReg && audienceType && audienceType !== 'InviteeOnly') {
      isAvailable = true;
    }
  } else {
    const productQuestion = getIn(state, ['appData', 'registrationSettings', 'productQuestions', questionId]);
    if (productQuestion && !isGuestReg) {
      isAvailable = true;
    }
  }

  return isAvailable;
};

const reducer = (fieldIds, node) => {
  if (node && node.nodeType === 'Criterion') {
    if (!fieldIds.includes(node.fieldName)) {
      fieldIds.push(node.fieldName);
    }
  } else if (node && node.nodeType === 'Filter') {
    fieldIds.concat(node.filters.reduce(reducer, fieldIds));
  }
  return fieldIds;
};
const getFieldIdsFromFilters = filters => {
  return filters.reduce(reducer, []);
};

/**
 * Checks to see if field is included in question visibility filters. Special handling for address country and state
 * fields as these are controlled by the associated code widget so we use it instead
 */
export const isFieldLinkedToQuestionVisibilityLogic = (fieldIds: $TSFixMe, fieldId: $TSFixMe): $TSFixMe => {
  return (
    fieldIds.includes(fieldId) ||
    (fieldId === Fields.workCountryCode.id && fieldIds.includes(Fields.workCountry.id)) ||
    (fieldId === Fields.homeCountryCode.id && fieldIds.includes(Fields.homeCountry.id)) ||
    (fieldId === Fields.workStateCode.id && fieldIds.includes(Fields.workState.id)) ||
    (fieldId === Fields.homeStateCode.id && fieldIds.includes(Fields.homeState.id))
  );
};

export const getQuestionIdsForVisibilityField = (
  state: $TSFixMe,
  fieldId: $TSFixMe,
  isGuest: $TSFixMe,
  regPathId: $TSFixMe
): $TSFixMe => {
  const questionIds = [];
  let questions = getRegistrationQuestions(state);
  const productQuestions = getProductQuestions(state.appData);
  if (productQuestions) {
    questions = {
      ...questions,
      ...productQuestions
    };
  }
  if (!questions) {
    return questionIds;
  }
  Object.keys(questions).filter(questionId => {
    if (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      questions[questionId].registrationPathQuestionAssociations &&
      questions[questionId].registrationPathQuestionAssociations.includes(regPathId)
    ) {
      const filters = getQuestionVisibilityFilters(state, questionId);

      if (filters && isQuestionAvailableForRegistrant(state, questionId, isGuest)) {
        const fieldIds = getFieldIdsFromFilters(filters);
        if (isFieldLinkedToQuestionVisibilityLogic(fieldIds, fieldId)) {
          questionIds.push(questionId);
        }
      }
    }
  });

  return questionIds;
};

export const getQuestionVisibilityFieldIdsForQuestions = (state: $TSFixMe, questionIds: $TSFixMe): $TSFixMe => {
  const fieldIds = [];
  questionIds.forEach(questionId => {
    const filters = getQuestionVisibilityFilters(state, questionId);
    if (filters) {
      const idsFromFilters = getFieldIdsFromFilters(filters);
      idsFromFilters.forEach(fieldId => {
        if (!fieldIds.includes(fieldId)) {
          fieldIds.push(fieldId);
        }
      });
    }
  });
  return fieldIds;
};

export const questionHasVisibilityLogic = (state: $TSFixMe, questionId: $TSFixMe): $TSFixMe => {
  let questionType = 'registrationQuestions';
  if (isProductQuestion(state.appData, questionId)) {
    questionType = 'productQuestions';
  }
  const filters = getIn(state, [
    'appData',
    'registrationSettings',
    questionType,
    questionId,
    'question',
    'visibilityLogic',
    'filters'
  ]);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return filters && filters.length;
};

export const getQuestionIdsWithVisibilityLogic = (
  state: $TSFixMe,
  isGuest: $TSFixMe,
  regPathId: $TSFixMe
): $TSFixMe => {
  let questions = getRegistrationQuestions(state);
  const productQuestions = getProductQuestions(state.appData);
  if (productQuestions) {
    questions = {
      ...questions,
      ...productQuestions
    };
  }
  if (questions) {
    const questionIds = Object.keys(questions);
    return questionIds.filter(questionId => {
      const isOnRegPath =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        questions[questionId].registrationPathQuestionAssociations &&
        questions[questionId].registrationPathQuestionAssociations.includes(regPathId);
      const filters = getIn(questions[questionId], ['question', 'visibilityLogic', 'filters']);
      return isOnRegPath && filters && filters.length && isQuestionAvailableForRegistrant(state, questionId, isGuest);
    });
  }
  return [];
};

/**
 * Returns date in ISO format if the input is a valid date,
 * otherwise returns the lower cased input
 * @param {string} input
 * @returns {string}
 */
const parseAsDate = input => {
  const date = moment(input);
  if (date.isValid()) {
    /*
     * Visibilty logic can only be based on the actual date, not the time. So it's fine for the times to differ.
     * Need to do this to avoid timezones.
     */
    return date.utc(true).hours(12).toISOString();
  }
  return input.toLowerCase();
};

export function createAnswer(fieldId: $TSFixMe, valueOrArray?: $TSFixMe, isDate?: $TSFixMe): $TSFixMe {
  const values = Array.isArray(valueOrArray) ? valueOrArray : [valueOrArray];
  return new TextAndDateAnswer(
    fieldId,
    values.map(answer => {
      let answerValue = answer || '';
      if (isDate && answerValue) {
        answerValue = parseAsDate(answerValue);
      } else {
        answerValue = answerValue.toLowerCase();
      }
      return { answerType: 'Text', text: answerValue };
    })
  );
}
