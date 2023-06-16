import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import ChoiceQuestionFieldTextWidget from 'event-widgets/lib/QuestionsAndFields/ChoiceQuestionFieldTextWidget';
import { isQuestionVisible } from '../../../redux/selectors/currentRegistrant';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import TextAndDateAnswer from '../model/TextAndDateAnswer';
import {
  buildQuestionAnswerPath,
  createAnswer,
  setAnswerAction,
  getQuestionHeader
} from '../../../utils/eventRegistrationData';
import escapeQuestionHtmlField from 'event-widgets/utils/escapeQuestionHtmlField';
import { getTravelAnswer } from '../../../utils/travelQuestionUtils';
import { getCustomAnswerFormats, substituteCustomAnswerFormat } from 'event-widgets/utils/customAnswerFormatUtils';
import { isTravelQuestion } from 'event-widgets/utils/travelUtils';
import {
  getQuestionFieldName,
  getQuestionSurveyType,
  buildTravelQuestionAnswerPath
} from '../../../utils/questionUtils';
import { setParentQuestionId } from '../utils';

const setAnswer = (baseAction, questionId, value) => {
  const answer = new TextAndDateAnswer(questionId, [{ answerType: 'Text', text: value }]);
  return setAnswerAction(baseAction, answer);
};

function getTextValue(answer) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const textEntry = answer && answer.answers && answer.answers.find(entry => entry.answerType === 'Text');
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return textEntry && textEntry.text;
}

export default connect(
  withMemoizedFunctions({
    escapeQuestionHtmlField,
    getTextValue,
    getCustomAnswerFormats,
    setParentQuestionId
  })(memoized => {
    const buildWidgetQuestionAnswerPath = defaultMemoize(questionId => {
      return buildQuestionAnswerPath(questionId);
    });
    const getAnswer = createAnswer();
    return (state: $TSFixMe, props: $TSFixMe) => {
      let config = props.config;
      config = substituteCustomAnswerFormat(config, memoized.getCustomAnswerFormats(state), false);
      const questionId = config.id;
      const isTravelQues = isTravelQuestion(getQuestionSurveyType(props.config));

      const answer = isTravelQues
        ? getTravelAnswer({
            state,
            answerPath: buildTravelQuestionAnswerPath(questionId, props.booking.id),
            getAnswerFormatter: memoized.getTextValue,
            eventRegistrationId: props.eventRegistrationId
          })
        : getAnswer({
            state,
            widgetConfig: props.config,
            eventRegistrationPath: buildWidgetQuestionAnswerPath(questionId),
            getAnswerFormatter: memoized.getTextValue,
            eventRegistrationId: props.eventRegistrationId
          });
      const questionHeader = !props.config.appData.parentQuestionId && getQuestionHeader(state, props);
      config = memoized.escapeQuestionHtmlField(config);
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const bookingId = props.booking && props.booking.id;
      config = memoized.setParentQuestionId(state.appData, config, questionId);
      return {
        config,
        locale: state.text.locale,
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        isQuestionVisible: isQuestionVisible(state, config, answer, props.eventRegistrationId, bookingId),
        value: answer.value,
        setterAction: answer.setterAction,
        fieldName: getQuestionFieldName(props), // This is needed for Nucleus form validation
        questionHeader
      };
    };
  }),
  { setAnswer },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onTextChange: dispatchProps.setAnswer.bind(null, stateProps.setterAction, ownProps.config.id)
    };
  }
)(ChoiceQuestionFieldTextWidget);
