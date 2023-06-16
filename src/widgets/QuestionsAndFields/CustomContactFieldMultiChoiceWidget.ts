import { connect } from 'react-redux';
import CustomContactFieldChoiceWidget from 'event-widgets/lib/CustomContactFields/CustomContactFieldChoiceWidget';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { injectTestId } from '@cvent/nucleus-test-automation';
import * as eventRegistrationData from '../../utils/eventRegistrationData';
import { createChoiceSelectors } from './customFieldSelectors';
import {
  validateContactCustomFieldChoiceChange,
  openContactCustomFieldChoiceSelectionConflictDialog
} from '../../dialogs/selectionConflictDialogs';
import ChoiceAnswer from './model/ChoiceAnswer';
import { GuestRegistration } from 'event-widgets/utils/registrationFieldPageType';
import { evaluateQuestionVisibilityLogic } from '../../redux/actions';
import { getContactFieldForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { getConfigWithDisplay, modifyFieldDefinitionForMultiLanguage } from './utils';
import {
  shouldWidgetUseTranslations,
  customFieldShouldUseChoiceIds,
  getContactFieldDefaultConfigName,
  getContactFieldAccountTranslation
} from 'event-widgets/utils/multiLanguageUtils';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';

function getTextValues(answer) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return answer && answer.answers && answer.answers.map(entry => entry.choice);
}

function onMultiChoiceChange(setAnswer, setterAction, customFieldId, onGuestPage, choices) {
  return async (dispatch, getState) => {
    const answer = new ChoiceAnswer(
      customFieldId,
      !choices ? [] : choices.map(choice => ({ answerType: 'Choice', choice }))
    );
    const validationResults = validateContactCustomFieldChoiceChange(getState(), customFieldId, answer, onGuestPage);
    if (!validationResults.isValid) {
      dispatch(openContactCustomFieldChoiceSelectionConflictDialog(validationResults, onGuestPage));
      return;
    }
    dispatch(setAnswer(setterAction, answer));
    return await dispatch(evaluateQuestionVisibilityLogic(customFieldId, false, onGuestPage));
  };
}

export default withMappedWidgetConfig(
  connect(
    withMemoizedFunctions({ modifyFieldDefinitionForMultiLanguage, getConfigWithDisplay })(memoized => {
      const { filterChoicesByLinkLogic } = createChoiceSelectors();

      return (state: $TSFixMe, props: $TSFixMe) => {
        const fieldId = props.config.fieldId;
        const fieldDefinition = filterChoicesByLinkLogic(
          state,
          state.account.contactCustomFields[fieldId],
          props.config.registrationFieldPageType === GuestRegistration
        );

        const eventRegistrationPath = ['attendee', 'personalInformation', 'customFields', fieldId];

        const answer = eventRegistrationData.answer({
          state,
          widgetConfig: props.config,
          eventRegistrationPath
        });

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
          fieldDefinition: memoized.modifyFieldDefinitionForMultiLanguage(fieldDefinition),
          selectedValues: getTextValues(answer.value),
          previouslySelectedValues: getTextValues(answer.valueBeforeMod),
          skipRequiredValidation: state.defaultUserSession.isPlanner,
          setterAction: answer.setterAction,
          config: memoized.getConfigWithDisplay(props.config, display),
          useTranslations: shouldWidgetUseTranslations(
            state.event,
            state.localizedUserText,
            props.id,
            defaultDisplayName,
            multiLanguageTranslation
          ),
          useChoiceIds: customFieldShouldUseChoiceIds(state.event, state.account) || false
        };
      };
    }),
    { setAnswer: eventRegistrationData.setAnswerAction, onMultiChoiceChange },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps,
        onMultiChoiceChange: dispatchProps.onMultiChoiceChange.bind(
          null,
          dispatchProps.setAnswer,
          stateProps.setterAction,
          stateProps.fieldDefinition.question.id,
          ownProps.config.registrationFieldPageType === GuestRegistration
        ),
        useChoiceIds: stateProps.useChoiceIds,
        fieldDefinition: stateProps.fieldDefinition
      };
    }
  )(CustomContactFieldChoiceWidget)
);
