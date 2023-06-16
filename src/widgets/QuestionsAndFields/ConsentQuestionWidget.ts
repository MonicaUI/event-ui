import { connect } from 'react-redux';
import ConsentWidget from 'cvent-question-widgets/lib/Consent/widget';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import escapeQuestionHtmlField from 'event-widgets/utils/escapeQuestionHtmlField';
import ChoiceAnswer from './model/ChoiceAnswer';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { isQuestionVisible } from '../../redux/selectors/currentRegistrant';
import { get } from 'lodash';

function setAnswer(baseAction, questionId, choices) {
  return (dispatch, getState) => {
    const { appData, event } = getState();
    const optIn =
      get(event, ['eventLocalesSetup', 'eventLocales'], []).length > 1
        ? get(appData, ['registrationSettings', 'registrationQuestions', questionId, 'question', 'choice', 'optIn'], {})
        : null;
    const answers = choices.map(choice => ({ answerType: 'Choice', choice: get(optIn, ['text']) || choice }));
    const answer = new ChoiceAnswer(questionId, answers);
    return dispatch(eventRegistrationData.setAnswerAction(baseAction, answer));
  };
}

function getAnswers(optIn, answer) {
  if (!answer || !answer.answers) {
    return { selectedValues: [] };
  }

  const selectedValues = answer.answers
    .filter(entry => entry.answerType === 'Choice')
    .map(entry => get(optIn, ['text']) || entry.choice);
  return {
    selectedValues
  };
}

// Using the common cvent-question-widgets/lib/Consent/widget that is shared by survey.
export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({
      getAnswers,
      escapeQuestionHtmlField
    })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
      const questionId = props.config.id;
      const hasMultipleLanguages = get(state, ['event', 'eventLocalesSetup', 'eventLocales'], []).length > 1;
      const answer = eventRegistrationData.answer({
        state,
        widgetConfig: props.config,
        eventRegistrationPath: eventRegistrationData.buildQuestionAnswerPath(questionId),
        getAnswerFormatter: memoized.getAnswers.bind(
          null,
          hasMultipleLanguages ? get(props.config, ['appData', 'question', 'choice', 'optIn'], {}) : null
        )
      });
      const config = {
        ...props.config,
        appData: {
          ...props.config.appData,
          question: {
            ...props.config.appData.question,
            questionId,
            html: null
          }
        }
      };

      return {
        ...answer.value,
        config: memoized.escapeQuestionHtmlField(config),
        isQuestionVisible: isQuestionVisible(state, config, answer),
        previouslySelectedValues: answer.valueBeforeMod,
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        useChoiceIds: false,
        setterAction: answer.setterAction
      };
    }),
    { setAnswer },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      const questionId = ownProps.config.id;
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onChange: dispatchProps.setAnswer.bind(null, stateProps.setterAction, questionId)
      };
    }
  )(ConsentWidget)
);
