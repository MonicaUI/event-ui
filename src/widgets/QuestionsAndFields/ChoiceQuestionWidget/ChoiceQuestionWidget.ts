import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import ChoiceQuestionWidget from 'cvent-question-widgets/lib/ChoiceQuestion/widget';
import { NAChoice, OtherChoice } from 'cvent-question-widgets/lib/ChoiceQuestion';
import { QuestionTypes } from 'cvent-question-widgets/lib/questionSettings';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import escapeQuestionHtmlField from 'event-widgets/utils/escapeQuestionHtmlField';
import ChoiceAnswer from '../model/ChoiceAnswer';
import {
  buildQuestionAnswerPath,
  buildSubQuestionSetterAction,
  createAnswer,
  setAnswerAction,
  getQuestionHeader
} from '../../../utils/eventRegistrationData';
import {
  getSubQuestionsByParentId,
  isSubQuestionVisible,
  getQuestionAnswer,
  isQuestionVisible,
  getEventRegistrationId
} from '../../../redux/selectors/currentRegistrant';
import { setIn } from 'icepick';
import { getTravelAnswer, setTravelAnswerFieldAction } from '../../../utils/travelQuestionUtils';

import { isTravelQuestion } from 'event-widgets/utils/travelUtils';
import {
  getQuestionFieldName,
  getQuestionSurveyType,
  buildTravelQuestionAnswerPath
} from '../../../utils/questionUtils';
import {
  setSelectedValuesForChoices,
  convertChoicesToBaseLanguage,
  setParentQuestionId,
  getQuestionCategory,
  setDefaultChoicesPreSelected
} from '../utils';
import { get } from 'lodash';
import { eventHasMultipleLanguages } from 'event-widgets/utils/multiLanguageUtils';

function setInvisibleSubQuestionAnswers(eventRegistrationId, isWidgetPlacedOnGuestModal, questionId, bookingId) {
  return (dispatch, getState) => {
    const subQuestions = getSubQuestionsByParentId(getState(), questionId);
    if (subQuestions) {
      const state = getState();
      return subQuestions
        .filter(subQuestion => {
          return (
            !isSubQuestionVisible({
              state,
              questionId: subQuestion.question.id,
              parentQuestionId: questionId,
              isWidgetPlacedOnGuestModal,
              eventRegistrationId,
              bookingId
            }) &&
            getQuestionAnswer({
              state,
              questionId: subQuestion.question.id,
              isQuestionPlacedOnGuestModal: isWidgetPlacedOnGuestModal,
              eventRegistrationId,
              bookingId
            })
          );
        })
        .map(subQuestion => {
          const subQuestionId = subQuestion.question.id;
          const previousAnswer = getQuestionAnswer({
            state,
            questionId: subQuestionId,
            isQuestionPlacedOnGuestModal: isWidgetPlacedOnGuestModal,
            eventRegistrationId,
            bookingId
          });

          if (bookingId) {
            // If travel Question
            const answer = {
              ...previousAnswer,
              answers: []
            };
            dispatch(
              setTravelAnswerFieldAction(
                buildTravelQuestionAnswerPath(subQuestionId, bookingId),
                eventRegistrationId,
                answer
              )
            );
          } else {
            /*
             * need to wait till next page to remove answers for invisible sub-questions, thus
             * having an implementation of toJSON() to return null, so that answered is not set
             * when calling isAnswered in RegCartClient to check if question was answered.
             */
            const answer = {
              questionId: subQuestionId,
              answers: previousAnswer.answers,
              toJSON() {
                return { questionId: answer.questionId, answers: null };
              }
            };
            const setterAction = buildSubQuestionSetterAction(
              eventRegistrationId || getEventRegistrationId(getState()),
              isWidgetPlacedOnGuestModal,
              subQuestionId
            );
            dispatch(setAnswerAction(setterAction, answer));
          }
        });
    }
  };
}

function onMultiChoiceChange(
  baseAction,
  eventRegistrationId,
  isWidgetPlacedOnGuestModal,
  questionId,
  bookingId,
  config,
  choices,
  otherText
) {
  return (dispatch, getState) => {
    const normalChoices = choices.filter(c => c !== NAChoice && c !== OtherChoice);
    const hasNAChoice = choices.includes(NAChoice);
    const hasOtherChoice = choices.includes(OtherChoice);
    const choicesToBeSaved = getChoicesToBeSaved(getState(), questionId, config, normalChoices);
    const answers =
      choicesToBeSaved.length > 0 ? choicesToBeSaved : normalChoices.map(choice => ({ answerType: 'Choice', choice }));
    if (hasNAChoice) {
      answers.push({ answerType: 'NA' });
    }
    if (hasOtherChoice) {
      answers.push({ answerType: 'Other', text: otherText });
    }
    const answer = new ChoiceAnswer(questionId, answers);
    dispatch(setAnswerAction(baseAction, answer));
    return dispatch(
      setInvisibleSubQuestionAnswers(eventRegistrationId, isWidgetPlacedOnGuestModal, questionId, bookingId)
    );
  };
}

function getChoicesToBeSaved(state, questionId, config, choices) {
  const {
    appData: { registrationSettings },
    event
  } = state;
  const questionCategory = getQuestionCategory(config.appData.question);
  const choicesInBaseLanguage = get(
    registrationSettings,
    [questionCategory, questionId, 'question', 'questionTypeInfo', 'choices'],
    []
  );
  const choicesInCurrentLanguage = get(config, ['appData', 'question', 'questionTypeInfo', 'choices'], []);
  const choicesToBeSaved =
    get(event, ['eventLocalesSetup', 'eventLocales'], []).length > 1
      ? convertChoicesToBaseLanguage(choices, choicesInCurrentLanguage, choicesInBaseLanguage)
      : [];
  return choicesToBeSaved;
}

function onSingleChoiceChange(
  baseAction,
  eventRegistrationId,
  isWidgetPlacedOnGuestModal,
  questionId,
  bookingId,
  config,
  value,
  otherText
) {
  return (dispatch, getState) => {
    let answer;
    if (value === NAChoice) {
      answer = { questionId, answers: [{ answerType: 'NA' }] };
    } else if (value === OtherChoice) {
      answer = { questionId, answers: [{ answerType: 'Other', text: otherText }] };
    } else {
      const choicesToBeSaved = getChoicesToBeSaved(getState(), questionId, config, [value]);
      answer = new ChoiceAnswer(questionId, [
        { answerType: 'Choice', choice: choicesToBeSaved.length ? choicesToBeSaved[0].choice : value }
      ]);
    }
    dispatch(setAnswerAction(baseAction, answer));
    return dispatch(
      setInvisibleSubQuestionAnswers(eventRegistrationId, isWidgetPlacedOnGuestModal, questionId, bookingId)
    );
  };
}

export function getAnswers(answer: $TSFixMe): $TSFixMe {
  if (!answer?.answers) {
    return { selectedValues: [], otherText: '', useDefaultChoices: true };
  }
  const otherAnswer = answer.answers.find(entry => entry.answerType === 'Other');
  const hasNA = !!answer.answers.find(entry => entry.answerType === 'NA');
  const selectedValues = answer.answers.filter(entry => entry.answerType === 'Choice').map(entry => entry.choice);
  if (otherAnswer) {
    selectedValues.push(OtherChoice);
  }
  if (hasNA) {
    selectedValues.push(NAChoice);
  }
  return {
    selectedValues,
    otherText: otherAnswer ? otherAnswer.text : null,
    useDefaultChoices: false
  };
}

/*
 * We need to pass an identifier down to the sub question so that it knows which parent to render under.
 *This is because guest product or travel questions have the same parent question ID as the invitee product question
 */
function setSubQuestionParentQuestionRegistrationIdentifier(stateProps, ownProps) {
  const isTravelQuest = isTravelQuestion(getQuestionSurveyType(stateProps.config));
  if ((stateProps.isProductQuestion || isTravelQuest) && stateProps.hasSubQuestions) {
    if (ownProps.children) {
      const modifiedChildren = ownProps.children.map(child => {
        const modifiedNestedQuestionWidgets = child.props.children.map(questionWidget => {
          return {
            ...questionWidget,
            props: {
              ...questionWidget.props,
              widgetMetaData: isTravelQuest
                ? {
                    ...questionWidget.props.widgetMetaData,
                    bookingId: ownProps.booking.id
                  }
                : {
                    ...questionWidget.props.widgetMetaData,
                    parentQuestionEventRegId: ownProps.eventRegistrationId
                  }
            }
          };
        });
        return {
          ...child,
          props: {
            ...child.props,
            children: modifiedNestedQuestionWidgets
          }
        };
      });
      return setIn(ownProps, ['children'], modifiedChildren);
    }
  }
  return ownProps;
}

export default connect(
  withMemoizedFunctions({
    getAnswers,
    escapeQuestionHtmlField,
    setSelectedValuesForChoices,
    setParentQuestionId,
    setDefaultChoicesPreSelected
  })(memoized => {
    const buildWidgetQuestionAnswerPath = defaultMemoize(questionId => {
      return buildQuestionAnswerPath(questionId);
    });
    const getAnswer = createAnswer();
    return (state: $TSFixMe, props: $TSFixMe) => {
      const questionId = props.config.id;
      const isTravelQues = isTravelQuestion(getQuestionSurveyType(props.config));
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const bookingId = props.booking && props.booking.id;

      let answer = isTravelQues
        ? getTravelAnswer({
            state,
            answerPath: buildTravelQuestionAnswerPath(questionId, bookingId),
            getAnswerFormatter: memoized.getAnswers,
            eventRegistrationId: props.eventRegistrationId
          })
        : getAnswer({
            state,
            widgetConfig: props.config,
            eventRegistrationPath: buildWidgetQuestionAnswerPath(questionId),
            getAnswerFormatter: memoized.getAnswers,
            eventRegistrationId: props.eventRegistrationId
          });

      const readOnlyOther = answer.value.otherText && !props.config.appData.question.questionTypeInfo.otherAnswer;
      const questionHeader = !props.config.appData.parentQuestionId && getQuestionHeader(state, props);

      const subQuestions = getSubQuestionsByParentId(state, questionId);
      const hasSubQuestions = !!subQuestions && subQuestions.length > 0;
      let config = memoized.escapeQuestionHtmlField(
        props.config,
        state.localizedUserText,
        eventHasMultipleLanguages(state.event)
      );
      config = memoized.setParentQuestionId(state.appData, config, questionId);
      const questionCategory = getQuestionCategory(config.appData.question);
      const baseChoices = get(
        state.appData,
        ['registrationSettings', questionCategory, questionId, 'question', 'questionTypeInfo', 'choices'],
        []
      );
      const localizedChoices = get(config, ['appData', 'question', 'questionTypeInfo', 'choices'], []);

      if (answer.value.useDefaultChoices) {
        answer = memoized.setDefaultChoicesPreSelected(
          state.appData,
          questionCategory,
          questionId,
          answer,
          baseChoices
        );
      }
      if (baseChoices.length > 0 && get(state, ['event', 'eventLocalesSetup', 'eventLocales'], []).length > 1) {
        answer = memoized.setSelectedValuesForChoices(answer, baseChoices, localizedChoices);
      }

      return {
        ...answer.value,
        config,
        previouslySelectedValues: answer.valueBeforeMod.selectedValues,
        useChoiceIds: false,
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        otherRequired: true,
        isQuestionVisible: isQuestionVisible(state, config, answer, props.eventRegistrationId, bookingId),
        setterAction: answer.setterAction,
        isWidgetPlacedOnGuestModal: answer.isWidgetPlacedOnGuestModal,
        readOnlyOther,
        // This is needed for Nucleus form validation
        fieldName: getQuestionFieldName(props, !answer.isWidgetPlacedOnGuestModal),
        questionHeader,
        isProductQuestion: props.config.appData.question.isProductQuestion,
        hasSubQuestions
      };
    };
  }),
  { onSingleChoiceChange, onMultiChoiceChange },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    const questionId = ownProps.config.id;
    const eventRegistrationId = ownProps.eventRegistrationId;
    const modifiedOwnProps = setSubQuestionParentQuestionRegistrationIdentifier(stateProps, ownProps);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const bookingId = ownProps.booking && ownProps.booking.id;
    return {
      ...modifiedOwnProps,
      ...stateProps,
      ...dispatchProps,
      onSingleChoiceChange: dispatchProps.onSingleChoiceChange.bind(
        null,
        stateProps.setterAction,
        eventRegistrationId,
        stateProps.isWidgetPlacedOnGuestModal,
        questionId,
        bookingId,
        stateProps.config
      ),
      onMultiChoiceChange: dispatchProps.onMultiChoiceChange.bind(
        null,
        stateProps.setterAction,
        eventRegistrationId,
        stateProps.isWidgetPlacedOnGuestModal,
        questionId,
        bookingId,
        stateProps.config
      ),
      setDefaultChoiceToAnswers: () => {
        if (stateProps.isQuestionVisible) {
          const questionType = ownProps.config.appData.question.questionTypeInfo.questionType;
          const selectedValues = stateProps.selectedValues;

          if (questionType === QuestionTypes.SINGLE_CHOICE) {
            dispatchProps.onSingleChoiceChange(
              stateProps.setterAction,
              ownProps.eventRegistrationId,
              stateProps.isWidgetPlacedOnGuestModal,
              ownProps.config.id,
              // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              ownProps.booking && ownProps.booking.id,
              stateProps.config,
              selectedValues[0]
            );
          } else {
            dispatchProps.onMultiChoiceChange(
              stateProps.setterAction,
              ownProps.eventRegistrationId,
              stateProps.isWidgetPlacedOnGuestModal,
              ownProps.config.id,
              // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
              ownProps.booking && ownProps.booking.id,
              stateProps.config,
              selectedValues
            );
          }
        }
      }
    };
  }
)(ChoiceQuestionWidget);
