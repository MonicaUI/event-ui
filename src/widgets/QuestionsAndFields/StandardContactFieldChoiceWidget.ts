import { connect } from 'react-redux';
import StandardContactFields from 'event-widgets/lib/StandardContactFields/StandardContactFields';
import StandardContactFieldChoiceWidget from 'event-widgets/lib/StandardContactFields/StandardContactFieldChoiceWidget';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { getLocalizedContactFieldForWidget } from './utils';
import { isPassportCountryField } from 'event-widgets/utils/standardContactField';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import {
  getEventRegistrationId,
  isGroupLeader,
  isGroupRegistration,
  isViewingGuest
} from '../../redux/selectors/currentRegistrant';
import { getCountriesAsChoices } from '../../redux/selectors/shared';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { isGenderField } from 'event-widgets/utils/standardContactField';
import { getGenderOptions } from '@cvent/event-fields/gender';

function getValues(answer) {
  return answer ? [answer] : [];
}

function getChoices(state, fieldId, selectedValues) {
  if (isPassportCountryField(fieldId)) {
    return getCountriesAsChoices(state);
  } else if (isGenderField(fieldId)) {
    return getGenderOptions(state.account, selectedValues);
  }
  return null;
}

export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ getValues, getLocalizedContactFieldForWidget })(
      memoized => (state: $TSFixMe, props: $TSFixMe) => {
        const registrationField = memoized.getLocalizedContactFieldForWidget(state, props.config, props.id);
        const fieldConfig = StandardContactFields[props.config.fieldId];
        const alwaysEnforceRequiredValidation = fieldConfig.alwaysEnforceRequiredValidation;

        const currentEventRegistrationId = getEventRegistrationId(state);
        const isPrimaryRegistrant = isGroupLeader(state, currentEventRegistrationId) || !isGroupRegistration(state);
        const shouldDisableFieldForPlannerReg =
          state.defaultUserSession.isPlanner && fieldConfig.plannerRegistrationReadOnly;

        const eventRegistrationPath = eventRegistrationData.buildEventRegistrationPath(fieldConfig.regApiPath);

        const answer = eventRegistrationData.answer({
          state,
          widgetConfig: props.config,
          eventRegistrationPath,
          getAnswerFormatter: memoized.getValues
        });

        return {
          registrationField,
          skipRequiredValidation: state.defaultUserSession.isPlanner && !alwaysEnforceRequiredValidation,
          plannerRegistrationReadOnly: isPrimaryRegistrant ? shouldDisableFieldForPlannerReg : false,
          choices: getChoices(state, props.config.fieldId, answer.value),
          selectedValues: answer.value,
          previouslySelectedValues: answer.valueBeforeMod,
          setterAction: answer.setterAction,
          isViewingGuest: isViewingGuest(state)
        };
      }
    ),
    { setAnswer: eventRegistrationData.setAnswerAction, evaluateQuestionVisibilityLogic },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onSingleChoiceChange: async value => {
          dispatchProps.setAnswer(stateProps.setterAction, value);
          dispatchProps.evaluateQuestionVisibilityLogic(ownProps.config.fieldId, false, stateProps.isViewingGuest);
        }
      };
    }
  )(StandardContactFieldChoiceWidget)
);
