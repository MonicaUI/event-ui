import { getRegCart } from '../../selectors/shared';
import { getEventRegistrationId, guests } from '../../selectors/currentRegistrant';
import { getEventRegistration as getEventRegistrationRegCart } from './selectors';
import {
  isGuestProductSelectionEnabledOnRegPath,
  isGuestRegistrationTypeSelectionEnabledOnRegPath
} from '../../selectors/currentRegistrationPath';
import { defaultRegistrationTypeId } from 'event-widgets/utils/registrationType';
import { applyPartialEventRegistrationUpdate } from './partialUpdates';

export const runRegistrationTypeChangeValidationsForPrimaryAndGuest = async (
  validateUserRegistrationTypeSelection: $TSFixMe,
  regTypeId: $TSFixMe,
  state: $TSFixMe,
  ignoreAdmissionItemsWidgetPlacement = false,
  apolloClient: $TSFixMe
): Promise<$TSFixMe> => {
  const regCart = getRegCart(state);
  const primaryEventRegId = getEventRegistrationId(state);
  const primaryEventReg = getEventRegistrationRegCart(regCart, primaryEventRegId);
  const guestEventRegs = guests(state);
  const isGuestRegTypeSelectionIsEnabled = !!(
    isGuestRegistrationTypeSelectionEnabledOnRegPath(state) && isGuestProductSelectionEnabledOnRegPath(state)
  );
  const eventRegsToValidate = isGuestRegTypeSelectionIsEnabled
    ? [primaryEventReg]
    : (guestEventRegs || []).concat(primaryEventReg);
  const validationResults = {};
  let hasConflicts = false;
  for (const eventReg of eventRegsToValidate) {
    const eventRegId = eventReg.eventRegistrationId;
    const validationResultsPerRegistrant = await validateUserRegistrationTypeSelection(
      state,
      regTypeId,
      eventRegId,
      ignoreAdmissionItemsWidgetPlacement,
      apolloClient
    );
    validationResults[eventRegId] = validationResultsPerRegistrant;
    hasConflicts = hasConflicts || !validationResultsPerRegistrant.isValid;
    /**
     * if we're only validating for primary(guest can chose their own regType), if the validationResults
     * returns invalidGuestRegistrations, run the guest through same validations with default RegType selected.
     * If the user decides to go ahead with their selection, we wouldn't have to open up another conflict modal
     * to clear out any guest products that wouldn't be visible to the defaultRegType
     */
    if (
      eventRegId === primaryEventRegId &&
      eventRegsToValidate.length === 1 &&
      validationResultsPerRegistrant.guestRegistrationsValidationResults.invalidGuestRegistrations.length > 0
    ) {
      for (const guestEventReg of guestEventRegs) {
        const guestEventRegId = guestEventReg.eventRegistrationId;
        const validationResultsPerGuest = await validateUserRegistrationTypeSelection(
          state,
          defaultRegistrationTypeId,
          guestEventRegId,
          ignoreAdmissionItemsWidgetPlacement,
          apolloClient
        );
        validationResults[guestEventRegId] = validationResultsPerGuest;
        hasConflicts = hasConflicts || !validationResultsPerGuest.isValid;
      }
    }
  }
  return {
    hasConflicts,
    validationResults
  };
};

export function setRegistrationTypeId(eventRegistrationId: $TSFixMe, registrationTypeId: $TSFixMe): $TSFixMe {
  const eventRegUpdates = { registrationTypeId };
  return applyPartialEventRegistrationUpdate(eventRegistrationId, eventRegUpdates);
}
