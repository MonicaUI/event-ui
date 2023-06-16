import { getIn } from 'icepick';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import {
  SET_REG_CART_FIELD_VALUE,
  SET_TEMPORARY_GUEST_FIELD_VALUE
} from '../redux/registrationForm/regCart/actionTypes';
import { isArray } from 'util';
import * as pageType from 'event-widgets/utils/registrationFieldPageType';
import { defaultMemoize } from 'reselect';
import { getRegCart } from '../redux/selectors/shared';
import { getEventRegistration as getEventRegistrationFromRegCart } from '../redux/registrationForm/regCart/selectors';
import {
  getSortedVisibleSessionsForEventRegistration,
  getIncludedSessionsForEventRegistration
} from '../redux/selectors/productSelectors';
import { getTravelQuestionHeader } from './travelQuestionUtils';
import { isTravelQuestion, isAlternateQuestion } from 'event-widgets/utils/travelUtils';
import { getQuestionSurveyType } from './questionUtils';

function setRegCartFieldBaseAction(currentRegistrationId, basePath) {
  return {
    type: SET_REG_CART_FIELD_VALUE,
    payload: {
      path: ['eventRegistrations', currentRegistrationId, ...(basePath ?? [])]
    }
  };
}

function setTemporaryGuestFieldBaseAction(basePath) {
  return {
    type: SET_TEMPORARY_GUEST_FIELD_VALUE,
    payload: { path: basePath }
  };
}

export function isWidgetPlacedOnGuestModal(widgetConfig: $TSFixMe): $TSFixMe {
  return widgetConfig?.registrationFieldPageType === pageType.GuestRegistration;
}

function getEventRegistration(state, widgetConfig) {
  return isWidgetPlacedOnGuestModal(widgetConfig)
    ? state.registrationForm.currentGuestEventRegistration
    : currentRegistrant.getEventRegistration(state);
}

function getEventRegistrationBeforeMod(state, widgetConfig) {
  const modStartSelectors = isWidgetPlacedOnGuestModal(widgetConfig)
    ? currentRegistrant.modificationStartForCurrentGuest
    : currentRegistrant.modificationStart;

  return modStartSelectors.getEventRegistration(state);
}

/*
 * Here's how to use this stuff when you're wiring up a widget component
 *
 * connect(function mapStateToProps(state, ownProps) {
 * const answer = eventRegistrationData.answer({
 * state, // Need this to call selectors
 * widgetConfig: ownProps.config, // If you're wiring up a widget, this is part of your props
 * eventRegistrationPath:
 * ['personalInformation', 'somefield'] // Path relative to the root of an eventRegistration object
 * });
 *
 * return {
 * value: answer.value,
 * setterAction: answer.setterAction // This gets used later,
 * previouslySelectedValue: answer.valueBeforeMod // Used for choice questions
 * };
 * }, {
 * // If you pass an object instead of a function for mapDispatchToProps, it will call
 * // bindActionCreators on it automatically
 * setAnswer: eventRegistrationData.setAnswerAction
 * }, function mergeProps(stateProps, dispatchProps, ownProps) {
 * return {
 * onChange: value => dispatchProps.setAnswer(stateProps.setterAction, value)
 * };
 * })(Widget);
 *
 *
 */

export function buildEventRegistrationPath(personalInfoPath: $TSFixMe): $TSFixMe {
  return ['attendee', 'personalInformation', ...personalInfoPath];
}

export function buildQuestionAnswerPath(questionId: $TSFixMe): $TSFixMe {
  return ['attendee', 'eventAnswers', questionId];
}

export function setAnswerAction(baseAction: $TSFixMe, value: $TSFixMe, morePath = []): $TSFixMe {
  const morePathArray = isArray(morePath) ? morePath : [morePath];

  const action = {
    ...baseAction,
    payload: {
      ...baseAction.payload,
      path: [...baseAction.payload.path, ...morePathArray],
      value
    }
  };

  return action;
}

export const buildSubQuestionSetterAction = (
  eventRegistrationId: $TSFixMe,
  isSubQuestionPlacedOnGuestModal: $TSFixMe,
  questionId: $TSFixMe
): $TSFixMe => {
  return isSubQuestionPlacedOnGuestModal
    ? setTemporaryGuestFieldBaseAction(buildQuestionAnswerPath(questionId))
    : setRegCartFieldBaseAction(eventRegistrationId, buildQuestionAnswerPath(questionId));
};

export function createAnswer(): $TSFixMe {
  const buildBaseSetAnswerAction = defaultMemoize((eventRegistrationId, widgetConfig, basePath) => {
    return isWidgetPlacedOnGuestModal(widgetConfig)
      ? setTemporaryGuestFieldBaseAction(basePath)
      : setRegCartFieldBaseAction(eventRegistrationId, basePath);
  });

  function answerFunc({
    state,
    widgetConfig,
    eventRegistrationPath,
    getAnswerFormatter = x => x,
    eventRegistrationId
  }) {
    const getAnswer = (eventRegistration, path) => getAnswerFormatter(getIn(eventRegistration, path));

    let eventRegistration;
    let answerEventRegistrationId;
    let valueBeforeMod;
    if (eventRegistrationId) {
      eventRegistration = getEventRegistrationFromRegCart(getRegCart(state), eventRegistrationId);
      answerEventRegistrationId = eventRegistrationId;
      const modStartSelectors = currentRegistrant.modificationStartFromEventRegistrationId(eventRegistrationId);
      valueBeforeMod = getAnswer(modStartSelectors.getEventRegistration(state), eventRegistrationPath);
    } else {
      eventRegistration = getEventRegistration(state, widgetConfig);
      answerEventRegistrationId = currentRegistrant.getEventRegistrationId(state);
      valueBeforeMod = getAnswer(getEventRegistrationBeforeMod(state, widgetConfig), eventRegistrationPath);
    }
    return {
      valueBeforeMod,
      value: getAnswer(eventRegistration, eventRegistrationPath),
      setterAction: buildBaseSetAnswerAction(answerEventRegistrationId, widgetConfig, eventRegistrationPath),
      isWidgetPlacedOnGuestModal: isWidgetPlacedOnGuestModal(widgetConfig)
    };
  }

  return answerFunc;
}

export function answer(obj: $TSFixMe): $TSFixMe {
  return createAnswer()(obj);
}

const getVisibleSessionsForEventReg = defaultMemoize((visibleProducts, eventRegId) => {
  return getSortedVisibleSessionsForEventRegistration(visibleProducts, eventRegId);
});

const getIncludedSessionsForEventReg = defaultMemoize((visibleProducts, eventRegId, eventRegistrations) => {
  return getIncludedSessionsForEventRegistration(visibleProducts, eventRegId, eventRegistrations);
});

export function getProductNameForProductQuestion(
  translate: $TSFixMe,
  questionAssociations: $TSFixMe,
  event: $TSFixMe,
  state: $TSFixMe,
  eventRegId: $TSFixMe
): $TSFixMe {
  const admissionItems = getIn(event, ['products', 'admissionItems']) || [];
  const visibleSessions = getVisibleSessionsForEventReg(getIn(state, ['visibleProducts']), eventRegId) || [];
  const includedSessions =
    getIncludedSessionsForEventReg(
      getIn(state, ['visibleProducts']),
      eventRegId,
      getIn(state, ['registrationForm', 'regCart', 'eventRegistrations'])
    ) || [];
  const sessions = {
    ...visibleSessions,
    ...includedSessions
  };
  const productIds = [...Object.keys(admissionItems), ...Object.keys(sessions)];
  const selectedProducts = (questionAssociations || [])
    .filter(id => productIds.includes(id))
    .map(id => admissionItems[id] || sessions[id]);
  return selectedProducts.length === 1 ? translate(selectedProducts[0].name) : '';
}

export function getHeaderForProductQuestion(
  translate: $TSFixMe,
  firstName: $TSFixMe,
  lastName: $TSFixMe,
  productName: $TSFixMe
): $TSFixMe {
  if ((!firstName && !lastName) || !productName) {
    return undefined;
  }
  if (firstName && !lastName) {
    return translateSingleName(translate, firstName, productName);
  }
  if (!firstName && lastName) {
    return translateSingleName(translate, lastName, productName);
  }
  return translate('EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName', {
    firstName,
    lastName,
    productName
  });
}

function translateSingleName(translate, name, productName) {
  /*
   * when using the guest dropdown, the firstName is undefined and the secondName follows the pattern,
   * 'Guest 01'.  So, in that case we want to use 'Guest' as firstName' and '01' as lastName.
   */
  const trimmedName = name.trim();
  if (trimmedName.indexOf(' ') >= 0) {
    const firstName = trimmedName.substr(0, trimmedName.indexOf(' '));
    const lastName = trimmedName.substr(trimmedName.indexOf(' ') + 1);
    return translate('EventWidgets_QuestionWidget_ProductQuestionHeader_TwoPartName', {
      firstName,
      lastName,
      productName
    });
  }
  return translate('EventWidgets_QuestionWidget_ProductQuestionHeader', { trimmedName, productName });
}

/**
 * Returns question header for product questions
 * @param {Object} state
 * @param {Object} props
 * @returns {string}
 */
function getProductQuestionHeader(state, props) {
  const {
    text: { translate },
    event
  } = state;
  const {
    eventRegistrationId,
    config: {
      appData: { questionAssociations }
    }
  } = props;
  const eventRegId = eventRegistrationId || currentRegistrant.getEventRegistrationId(state);
  const eventRegistration = state.registrationForm.regCart.eventRegistrations[eventRegId];
  const firstName = getIn(eventRegistration, ['attendee', 'personalInformation', 'firstName']);
  const lastName = getIn(eventRegistration, ['attendee', 'personalInformation', 'lastName']);
  const productName = getProductNameForProductQuestion(translate, questionAssociations, event, state, eventRegId);
  return getHeaderForProductQuestion(translate, firstName, lastName, productName);
}

/**
 * Returns question header
 * @param {Object} state
 * @param {Object} props
 * @returns {string}
 */
export function getQuestionHeader(state: $TSFixMe, props: $TSFixMe): $TSFixMe {
  const {
    config: {
      appData: { question }
    },
    numGuests
  } = props;
  const surveyType = getQuestionSurveyType(props.config);
  if (question.isProductQuestion && numGuests > 0) {
    return getProductQuestionHeader(state, props);
  } else if (isTravelQuestion(surveyType) && !isAlternateQuestion(surveyType)) {
    return getTravelQuestionHeader(state, props.booking, surveyType);
  }
  return null;
}

export function getQuestionsForPrimaryAndGuests(
  guests: $TSFixMe,
  isProductSubQuestion: $TSFixMe,
  metaData: $TSFixMe
): $TSFixMe {
  let questions = [
    {
      /*
       * Add default null for primary registrant. This value is derived from current registrant
       * or current guest registrant
       */
      eventRegistrationId: null
    }
  ];

  if (guests) {
    guests.forEach(guest => {
      questions.push({
        eventRegistrationId: guest.eventRegistrationId
      });
    });
  }
  if (isProductSubQuestion) {
    questions = questions.filter(question => {
      return (
        metaData.parentQuestionEventRegId === undefined ||
        question.eventRegistrationId === metaData.parentQuestionEventRegId
      );
    });
  }
  return questions;
}
