import {
  getAttendeeCustomFieldAnswer,
  modificationStart,
  getCurrentGuestCustomFieldAnswer,
  modificationStartForCurrentGuest
} from '../../redux/selectors/currentRegistrant';
import { filterFieldChoicesByLinkLogic } from 'event-widgets/redux/selectors/account';
import { createSelector } from 'reselect';
import { customFieldShouldUseChoiceIds } from 'event-widgets/utils/multiLanguageUtils';

export function getValues(answer: $TSFixMe): $TSFixMe {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return answer && answer.answers
    ? answer.answers.filter(entry => entry.answerType === 'Choice').map(entry => entry.choice)
    : [];
}

export function createChoiceSelectors(): $TSFixMe {
  const getSelectedValues = createSelector(
    onGuestPage => (onGuestPage ? getCurrentGuestCustomFieldAnswer : getAttendeeCustomFieldAnswer),
    getValues
  );
  const getPreviouslySelectedValues = createSelector(
    onGuestPage => (onGuestPage ? modificationStartForCurrentGuest : modificationStart.getAttendeeCustomFieldAnswer),
    getValues
  );
  const filterChoicesByLinkLogic = createSelector(
    (state, fieldDefinition) => fieldDefinition,
    (state, fieldDefinition, onGuestPage) => {
      if (!fieldDefinition.question.questionTypeInfo.linkLogic) {
        return null;
      }
      return (onGuestPage ? getCurrentGuestCustomFieldAnswer : getAttendeeCustomFieldAnswer)(
        state,
        fieldDefinition.question.questionTypeInfo.linkLogic.parentQuestionId
      );
    },
    state => customFieldShouldUseChoiceIds(state.event, state.account),
    (fieldDefinition, parentAnswer, useChoiceIds) =>
      filterFieldChoicesByLinkLogic(fieldDefinition, getValues(parentAnswer), useChoiceIds)
  );
  return { getSelectedValues, getPreviouslySelectedValues, filterChoicesByLinkLogic };
}
