import React from 'react';
import { returnToProcessStart } from './SelectionConflictDialog';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import DialogStyles from './SelectionConflictDialog.less';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  setEventRegistrationFieldValue,
  setTemporaryGuestFieldValue
} from '../../redux/registrationForm/regCart/actions';
import { getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import { openGuestDetailsDialog } from '../GuestDetailsDialog/GuestDetailsDialog';
import { withStyles, withCancelAndConfirmButtons } from '../ThemedDialog';
import StandardDialog from '../shared/StandardDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';

const Dialog = withStyles(withCancelAndConfirmButtons(StandardDialog));

function customFieldAnswerPath(customFieldId) {
  return ['attendee', 'personalInformation', 'customFields', customFieldId];
}

export function setCustomFieldAnswer(
  eventRegistrationId: $TSFixMe,
  customFieldId: $TSFixMe,
  value: $TSFixMe
): $TSFixMe {
  return setEventRegistrationFieldValue(eventRegistrationId, customFieldAnswerPath(customFieldId), value);
}

export function setCurrentGuestCustomFieldAnswer(customFieldId: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return setTemporaryGuestFieldValue(['attendee', 'personalInformation', 'customFields', customFieldId], value);
}

/**
 * A dialog which allows the registrant to confirm their new custom contact field choice selection
 * when the change in parent custom contact field choice will cause errors in their registration cart.
 * If they decide to choose the new choice, any invalid child custom contact field choices will be removed and
 * they will be brought to the beginning of registration in order to update their selections.
 */
export function openContactCustomFieldChoiceSelectionConflictDialog(
  validationResults: $TSFixMe,
  onGuestPage?: $TSFixMe
) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const {
      text: { translate }
    } = getState();
    const boundCancelSelection = async () => {
      await dispatch(closeDialogContainer());
      if (onGuestPage) {
        dispatch(openGuestDetailsDialog());
      }
    };
    const boundContinueSelection = async () => {
      await dispatch(withLoading(continueSelection)(validationResults, onGuestPage));
    };
    const dialog = (
      <Dialog
        {...injectTestId('contact-custom-field-choice-selection-conflict-dialog')}
        title={translate('EventGuestSide_ContactCustomFieldChoiceConflict_Title__resx')}
        message={translate('EventGuestSide_ContactCustomFieldChoiceConflict_Title__resx')}
        subMessage={getInformationalText(translate, validationResults)}
        content={translate('EventGuestSide_ContactCustomFieldChoiceConflict_InstructionalText__resx')}
        secondaryButtonText={translate('EventWidgets_GenericText_No__resx')}
        cancel={boundCancelSelection}
        onClose={boundCancelSelection}
        primaryButtonText={translate('EventWidgets_GenericText_Yes__resx')}
        confirm={boundContinueSelection}
        icon="attentionWarning"
        iconModifier="error"
        classes={DialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCancelSelection, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}

function getInformationalText(translate, validationResults) {
  const { contactCustomFieldChoiceValidationResults } = validationResults;
  if (!contactCustomFieldChoiceValidationResults.isValid) {
    return translate('EventGuestSide_ContactCustomFieldChoiceConflict_InformationalText__resx');
  }
  throw new Error('An unknown child custom field choice conflict occurred during parent custom field choice change');
}

/**
 * Removes any invalid choices for the child custom fields and selects the parent custom field choices.
 */
function continueSelection(validationResults, onGuestPage) {
  return async (dispatch, getState) => {
    const { contactCustomFieldChoiceValidationResults } = validationResults;
    const currentEventRegistrationId = getEventRegistrationId(getState());
    const setAnswer = onGuestPage
      ? setCurrentGuestCustomFieldAnswer
      : setCustomFieldAnswer.bind(null, currentEventRegistrationId);
    const invalid = contactCustomFieldChoiceValidationResults.invalidChildContactCustomFields;
    for (const invalidChildContactCustomFields of invalid) {
      dispatch(setAnswer(invalidChildContactCustomFields.questionId, invalidChildContactCustomFields.answer));
    }
    dispatch(setAnswer(validationResults.customFieldId, validationResults.answer));
    await dispatch(returnToProcessStart());
    await dispatch(closeDialogContainer());
    if (onGuestPage) {
      dispatch(openGuestDetailsDialog());
    }
  };
}
