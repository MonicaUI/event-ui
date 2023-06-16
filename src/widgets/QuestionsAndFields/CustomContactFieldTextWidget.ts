import { connect } from 'react-redux';
import CustomContactFieldOpenEndedWidget from 'event-widgets/lib/CustomContactFields/CustomContactFieldTextWidget';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { injectTestId } from '@cvent/nucleus-test-automation';
import TextAndDateAnswer from './model/TextAndDateAnswer';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { getCustomAnswerFormats, substituteCustomAnswerFormat } from 'event-widgets/utils/customAnswerFormatUtils';
import { AnswerFormatTypes } from 'cvent-question-widgets/lib/TextQuestion';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { getConfigWithDisplay } from './utils';
import {
  shouldWidgetUseTranslations,
  getContactFieldDefaultConfigName,
  getContactFieldAccountTranslation
} from 'event-widgets/utils/multiLanguageUtils';
import { escape } from 'lodash';

const HARD_LIMIT = 9999999999;

function getTextValue(answer) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const textEntry = answer && answer.answers && answer.answers.find(entry => entry.answerType === 'Text');
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (textEntry && textEntry.text) || '';
}

function createAnswer(fieldId, value) {
  return new TextAndDateAnswer(fieldId, [{ answerType: 'Text', text: value || '' }]);
}

function getQuestionTypeInfo(questionTypeInfo) {
  if (questionTypeInfo.answerFormatType === AnswerFormatTypes.NUMBER) {
    return {
      ...questionTypeInfo,
      hardLimit: HARD_LIMIT
    };
  }
  return { ...questionTypeInfo };
}

export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ getConfigWithDisplay })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
      const fieldId = props.config.fieldId;
      let fieldDefinition = state.account.contactCustomFields[fieldId];
      fieldDefinition = substituteCustomAnswerFormat(fieldDefinition, getCustomAnswerFormats(state), true);
      const eventRegistrationPath = ['attendee', 'personalInformation', 'customFields', fieldId];

      const answer = eventRegistrationData.answer({
        state,
        widgetConfig: props.config,
        eventRegistrationPath
      });

      const questionTypeInfo = getQuestionTypeInfo(fieldDefinition.question.questionTypeInfo);
      fieldDefinition = {
        ...fieldDefinition,
        question: {
          ...fieldDefinition.question,
          questionTypeInfo
        }
      };
      const { display } = getContactFieldForWidget(
        state,
        props.config.registrationFieldPageType,
        props.config.fieldId,
        props.id
      );
      const defaultDisplayName = getContactFieldDefaultConfigName(state, props.id);
      const multiLanguageTranslation = getContactFieldAccountTranslation(
        state.multiLanguageTranslation,
        escape(fieldDefinition?.question?.html),
        state.localizedUserText?.currentLocale
      );
      return {
        ...injectTestId(`contact-custom-field-${fieldId}`),
        fieldDefinition,
        value: getTextValue(answer.value),
        setterAction: answer.setterAction,
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        config: memoized.getConfigWithDisplay(props.config, display),
        useTranslations: shouldWidgetUseTranslations(
          state.event,
          state.localizedUserText,
          props.id,
          defaultDisplayName,
          multiLanguageTranslation
        )
      };
    }),
    { setAnswer: eventRegistrationData.setAnswerAction, evaluateQuestionVisibilityLogic },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onTextChange: value =>
          dispatchProps.setAnswer(stateProps.setterAction, createAnswer(ownProps.config.fieldId, value))
      };
    }
  )(CustomContactFieldOpenEndedWidget)
);
