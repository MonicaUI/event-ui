import { filter } from 'lodash';
import { ProductType } from 'event-widgets/utils/ProductType';
import { getEventRegistrationId } from '../selectors/currentRegistrant';
import { getCurrentPageId } from '../pathInfo';
import { findWidgetPresentedPages } from '../website/pageContents';
import {
  isWidgetPresentOnCurrentPage,
  quantityItemAppearOnPageBeforeEventIdentityConfirmation
} from '../website/pageContentsWithGraphQL';
import { getRegistrationPathId } from '../selectors/currentRegistrationPath';
import { getGuestDetailsPage } from '../website/registrationProcesses';
import { ApolloClient } from '@apollo/client';
import { RootState } from '../reducer';

export function hasRegTypeCapacityWarning(state: $TSFixMe): $TSFixMe {
  const message = filter(
    state.registrationForm.validationMessages || [],
    validationMessage =>
      validationMessage.localizationKey === 'REGAPI.CAPACITY_UNAVAILABLE' &&
      validationMessage.parametersMap &&
      validationMessage.parametersMap.entityType === 'ContactType'
  );
  if (message.length > 0) {
    return true;
  }
  return false;
}

export function hasQuantityItemCapacityWarning(state: $TSFixMe): $TSFixMe {
  const message = filter(
    state.registrationForm.validationMessages || [],
    validationMessage =>
      validationMessage.localizationKey === 'REGAPI.CAPACITY_UNAVAILABLE' &&
      validationMessage.parametersMap &&
      validationMessage.parametersMap.entityType === ProductType.OPTIONAL_ITEM
  );
  if (message.length > 0) {
    return true;
  }
  return false;
}

export function hasQuantityItemAdvanceRuleWarning(state: $TSFixMe): $TSFixMe {
  const message = filter(
    state.registrationForm.validationMessages || [],
    validationMessage => validationMessage.localizationKey === 'REGAPI.QUANTITY_ITEMS_REGISTRATION_RULE_FAILED'
  );
  if (message.length > 0) {
    return true;
  }
  return false;
}

export async function hasQuantityItemAdvancedRuleValidation(
  state: $TSFixMe,
  apolloClient: $TSFixMe
): Promise<$TSFixMe> {
  const quantityItemsAppearBeforeIdentityConfirmation = await quantityItemAppearOnPageBeforeEventIdentityConfirmation(
    state,
    apolloClient
  );
  const hasAdvanceRuleWarning = hasQuantityItemAdvanceRuleWarning(state);

  return hasAdvanceRuleWarning && quantityItemsAppearBeforeIdentityConfirmation;
}

export function getAttendeeQuestionIdsWithWarning(state: $TSFixMe, eventRegistrationId?: $TSFixMe): $TSFixMe {
  return filter(
    state.registrationForm.validationMessages || [],
    validationMessage =>
      validationMessage.localizationKey === 'REGAPI.ATTENDEE_QUESTION_MISSING' &&
      validationMessage.parametersMap.eventRegistrationId === eventRegistrationId
  ).map(validationMessage => validationMessage.parametersMap.attendeeQuestion);
}

export const hasAttendeeQuestionRuleValidationWarning = async (
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<boolean> => {
  const questionIdsWithWarning = getAttendeeQuestionIdsWithWarning(state, getEventRegistrationId(state));
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (questionIdsWithWarning && questionIdsWithWarning.length) {
    const currentPageId = getCurrentPageId(state);
    const isIdentityConfirmationOnCurrentPage = await isWidgetPresentOnCurrentPage(
      state,
      'EventIdentityConfirmation',
      currentPageId,
      apolloClient
    );
    const isAnyQuestionOnCurrentPage = questionIdsWithWarning.some(attendeeQuestionId =>
      findWidgetPresentedPages(state.website, { fieldId: attendeeQuestionId }).includes(currentPageId)
    );
    return isIdentityConfirmationOnCurrentPage && isAnyQuestionOnCurrentPage;
  }
  return false;
};

export const hasGuestQuestionRuleValidationWarning = (
  state: $TSFixMe,
  guestEventRegistrationId: $TSFixMe
): $TSFixMe => {
  const questionIdsWithWarning = getAttendeeQuestionIdsWithWarning(state, guestEventRegistrationId);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (questionIdsWithWarning && questionIdsWithWarning.length) {
    const currentRegPathId = getRegistrationPathId(state);
    const currentPageId = getGuestDetailsPage(state, currentRegPathId).id;
    return questionIdsWithWarning.some(attendeeQuestionId =>
      findWidgetPresentedPages(state.website, { fieldId: attendeeQuestionId }).includes(currentPageId)
    );
  }
  return false;
};
