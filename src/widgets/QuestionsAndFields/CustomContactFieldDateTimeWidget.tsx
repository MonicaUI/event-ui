import { connect, useStore } from 'react-redux';
import CustomContactFieldOpenEndedWidget from 'event-widgets/lib/CustomContactFields/CustomContactFieldDateTimeWidget';
import TextAndDateAnswer from './model/TextAndDateAnswer';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { injectTestId } from '@cvent/nucleus-test-automation';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { getIn, setIn } from 'icepick';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { DATE_CHANGE_EMPTY_DATE, DATE_CHANGE_SUCCESS } from 'nucleus-core/forms/PickADateBase';
import { isViewingGuest } from '../../redux/selectors/currentRegistrant';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import { getConfigWithDisplay } from './utils';
import {
  shouldWidgetUseTranslations,
  getContactFieldDefaultConfigName,
  getContactFieldAccountTranslation
} from 'event-widgets/utils/multiLanguageUtils';
import { useContactCustomField } from './useContactCustomField';
import { GraphQLSiteEditorDataReleases, useGraphQLSiteEditorData } from '../../ExperimentHelper';
import React from 'react';

function getDateTimeValue(answer) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const textEntry = answer && answer.answers && answer.answers.find(entry => entry.answerType === 'Text');
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (textEntry && textEntry.text) || null;
}

function createAnswer(fieldId, value) {
  return !value ? null : new TextAndDateAnswer(fieldId, [{ answerType: 'Text', text: value || '' }]);
}

/*
 * In this case, we want to display the same time regardless of timezone
 * so we add the time difference relative to the timezone offset
 */
const adjustForTimezone = date => {
  const oldDate = new Date(date);
  const timeOffsetInMS = oldDate.getTimezoneOffset() * 60000;
  const adjustedDate = new Date();
  adjustedDate.setTime(oldDate.getTime() + timeOffsetInMS);
  return adjustedDate;
};

type Props = {
  config: {
    fieldId: string;
    registrationFieldPageType: number;
  };
  type: string;
};

export const CustomContactFieldDateTimeWidget = withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ getConfigWithDisplay })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
      const fieldId = props.fieldId;
      let fieldDefinition = props.fieldDefinition;
      const eventRegistrationPath = ['attendee', 'personalInformation', 'customFields', fieldId];
      const answer = eventRegistrationData.answer({
        state,
        widgetConfig: props.config,
        eventRegistrationPath
      });

      const ogMinDate = getIn(fieldDefinition, ['question', 'questionTypeInfo', 'minDate']);
      const minDate = adjustForTimezone(ogMinDate || '1900-01-01T00:00:00.000Z');
      const ogMaxDate = getIn(fieldDefinition, ['question', 'questionTypeInfo', 'maxDate']);
      const maxDate = ogMaxDate ? adjustForTimezone(ogMaxDate) : null;

      fieldDefinition = setIn(fieldDefinition, ['question', 'questionTypeInfo', 'minDate'], minDate);
      fieldDefinition = setIn(fieldDefinition, ['question', 'questionTypeInfo', 'maxDate'], maxDate);

      const minRange = new Date().getFullYear() - 1900;
      const maxRange = 10;

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
        value: getDateTimeValue(answer.value),
        locale: state.text.locale,
        setterAction: answer.setterAction,
        skipRequiredValidation: state.defaultUserSession.isPlanner,
        isViewingGuest: isViewingGuest(state),
        config: memoized.getConfigWithDisplay(props.config, display),
        minRange,
        maxRange,
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
        onDateTimeChange: value => {
          dispatchProps.setAnswer(stateProps.setterAction, createAnswer(ownProps.config.fieldId, value));
          // Only evaluate visibility logic if the date is valid, or the field is empty.
          if (value.statusCode === DATE_CHANGE_SUCCESS || value.statusCode === DATE_CHANGE_EMPTY_DATE) {
            dispatchProps.evaluateQuestionVisibilityLogic(ownProps.config.fieldId, false, stateProps.isViewingGuest);
          }
        }
      };
    }
  )(CustomContactFieldOpenEndedWidget)
);

export const CustomContactFieldDateTimeWidgetWithGraphQL = (props: Props): JSX.Element => {
  const fieldId = props.config.fieldId;
  const fieldDefinition = useContactCustomField(fieldId);
  return fieldDefinition ? (
    <CustomContactFieldDateTimeWidget fieldDefinition={fieldDefinition} fieldId={fieldId} {...props} />
  ) : null;
};

export const CustomContactFieldDateTimeWidgetWithRedux = (props: Props): JSX.Element => {
  const fieldId = props.config.fieldId;
  const store = useStore();
  const state = store.getState();
  const fieldDefinition = { ...state.account.contactCustomFields[fieldId] };
  return <CustomContactFieldDateTimeWidget fieldDefinition={fieldDefinition} fieldId={fieldId} {...props} />;
};

export default function CustomContactFieldDateTimeWidgetExperimentWrapper(props: Props): JSX.Element {
  const usingGraphQLWidgetData = useGraphQLSiteEditorData(
    GraphQLSiteEditorDataReleases.CustomContactFieldDateTimeWidget
  );
  if (usingGraphQLWidgetData) return <CustomContactFieldDateTimeWidgetWithGraphQL {...props} />;
  return <CustomContactFieldDateTimeWidgetWithRedux {...props} />;
}
