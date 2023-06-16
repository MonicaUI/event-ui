import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';
import DateTimeQuestionWidget from 'cvent-question-widgets/lib/DateTimeQuestion/widget';
import TextAndDateAnswer from '../model/TextAndDateAnswer';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { isQuestionVisible } from '../../../redux/selectors/currentRegistrant';
import escapeQuestionHtmlField from 'event-widgets/utils/escapeQuestionHtmlField';
import {
  buildQuestionAnswerPath,
  createAnswer,
  setAnswerAction,
  getQuestionHeader
} from '../../../utils/eventRegistrationData';
import {
  getQuestionFieldName,
  getQuestionSurveyType,
  buildTravelQuestionAnswerPath
} from '../../../utils/questionUtils';
import { getTravelAnswer } from '../../../utils/travelQuestionUtils';
import { isTravelQuestion } from 'event-widgets/utils/travelUtils';
import { setParentQuestionId } from '../utils';

function setAnswer(baseAction, questionId, value) {
  const answer = value && new TextAndDateAnswer(questionId, [{ answerType: 'Text', text: value }]);
  return setAnswerAction(baseAction, answer);
}

function getDateTimeValue(answer) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const textEntry = answer && answer.answers && answer.answers.find(entry => entry.answerType === 'Text');
  if (textEntry && typeof textEntry.text === 'string' && textEntry.text === '') {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return textEntry && textEntry.text;
}

export default connect(
  withMemoizedFunctions({
    escapeQuestionHtmlField,
    getDateTimeValue,
    setParentQuestionId
  })(memoized => {
    const buildWidgetQuestionAnswerPath = defaultMemoize(questionId => {
      return buildQuestionAnswerPath(questionId);
    });
    const getAnswer = createAnswer();
    return (state: $TSFixMe, props: $TSFixMe) => {
      const questionId = props.config.id;
      const isTravelQues = isTravelQuestion(getQuestionSurveyType(props.config));
      const answer = isTravelQues
        ? getTravelAnswer({
            state,
            answerPath: buildTravelQuestionAnswerPath(questionId, props.booking.id),
            getAnswerFormatter: memoized.getDateTimeValue,
            eventRegistrationId: props.eventRegistrationId
          })
        : getAnswer({
            state,
            widgetConfig: props.config,
            eventRegistrationPath: buildWidgetQuestionAnswerPath(questionId),
            getAnswerFormatter: memoized.getDateTimeValue,
            eventRegistrationId: props.eventRegistrationId
          });
      const questionHeader = !props.config.appData.parentQuestionId && getQuestionHeader(state, props);
      const minRange = new Date().getFullYear() - 1900;
      const maxRange = 10;
      let config = memoized.escapeQuestionHtmlField(props.config);
      config = memoized.setParentQuestionId(state.appData, config, questionId);
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const bookingId = props.booking && props.booking.id;
      return {
        config,
        locale: state.text.locale,
        value: answer.value,
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        isQuestionVisible: isQuestionVisible(state, config, answer, props.eventRegistrationId, bookingId),
        setterAction: answer.setterAction,
        fieldName: getQuestionFieldName(props), // This is needed for Nucleus form validation
        questionHeader,
        minRange,
        maxRange
      };
    };
  }),
  { setAnswer },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onDateTimeChange: dispatchProps.setAnswer.bind(null, stateProps.setterAction, ownProps.config.id)
    };
  }
)(DateTimeQuestionWidget);
