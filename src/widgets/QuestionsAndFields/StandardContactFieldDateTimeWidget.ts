import { connect } from 'react-redux';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import StandardContactFieldDateTimeWidget from 'event-widgets/lib/StandardContactFields/StandardContactFieldDateTimeWidget';
import { resolveDateFromString, getLocaleDateString } from '@cvent/nucleus-core-datetime-utils';
import { getLocalizedContactFieldForWidget } from './utils';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import {
  isGroupRegistration,
  getEventRegistrationId,
  isGroupLeader,
  isViewingGuest
} from '../../redux/selectors/currentRegistrant';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { DATE_CHANGE_EMPTY_DATE, DATE_CHANGE_SUCCESS } from 'nucleus-core/forms/PickADateBase';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';

const getUTCTime = date => date.getTime() - date.getTimezoneOffset() * 60000;

const setAnswer = (baseAction, value, locale) => {
  const { dateText } = value;
  const format = getLocaleDateString(locale);
  const date = dateText && resolveDateFromString(dateText, format);
  return eventRegistrationData.setAnswerAction(baseAction, date && getUTCTime(date));
};

export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ getLocalizedContactFieldForWidget })(memoized => (state: $TSFixMe, props: $TSFixMe) => {
      const registrationField = memoized.getLocalizedContactFieldForWidget(state, props.config, props.id);
      const fieldConfig = StandardContactFields[props.config.fieldId];

      const eventRegistrationPath = eventRegistrationData.buildEventRegistrationPath(fieldConfig.regApiPath);

      const alwaysEnforceRequiredValidation = fieldConfig.alwaysEnforceRequiredValidation;
      const currentEventRegistrationId = getEventRegistrationId(state);

      const isPrimaryRegistrant = isGroupLeader(state, currentEventRegistrationId) || !isGroupRegistration(state);
      const shouldDisableFieldForPlannerReg =
        state.defaultUserSession.isPlanner && fieldConfig.plannerRegistrationReadOnly;

      const answer = eventRegistrationData.answer({
        state,
        widgetConfig: props.config,
        eventRegistrationPath,
        // converting epoch time to ISO format.
        getAnswerFormatter: value => (value ? new Date(value).toISOString() : null)
      });

      return {
        registrationField,
        eventRegistrationId: getEventRegistrationId(state),
        skipRequiredValidation: state.defaultUserSession.isPlanner && !alwaysEnforceRequiredValidation,
        plannerRegistrationReadOnly: isPrimaryRegistrant ? shouldDisableFieldForPlannerReg : false,
        value: answer.value,
        setterAction: answer.setterAction,
        locale: state.text.locale,
        isViewingGuest: isViewingGuest(state)
      };
    }),
    { setAnswer, evaluateQuestionVisibilityLogic },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onDateTimeChange: value => {
          dispatchProps.setAnswer(stateProps.setterAction, value, stateProps.locale);
          // Only evaluate visibility logic if the date is valid, or the field is empty.
          if (value.statusCode === DATE_CHANGE_SUCCESS || value.statusCode === DATE_CHANGE_EMPTY_DATE) {
            dispatchProps.evaluateQuestionVisibilityLogic(ownProps.config.fieldId, false, stateProps.isViewingGuest);
          }
        }
      };
    }
  )(StandardContactFieldDateTimeWidget)
);
