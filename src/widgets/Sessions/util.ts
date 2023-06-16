import { getConfirmedGuests, getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import { createSelector } from 'reselect';
import {
  getCurrentRegistrantAndGuests,
  getRegistrationTypeIdsForCurrentRegistrantsAndGuests
} from '../../redux/selectors/productSelectors';
import { isGuestProductSelectionEnabledOnRegPath } from '../../redux/selectors/currentRegistrationPath';
import { isNil } from 'lodash';

export function guestCount(state: $TSFixMe): $TSFixMe {
  const confirmedGuests = getConfirmedGuests(state);
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return (confirmedGuests && confirmedGuests.length) || 0;
}

export const getRegistrationTypeId = createSelector(
  getEventRegistrationId,
  getCurrentRegistrantAndGuests,
  (eventRegistrationId, currentRegistrants) => {
    const primaryReg = currentRegistrants?.filter(r => r && r.eventRegistrationId === eventRegistrationId);
    return primaryReg?.[0]?.registrationTypeId;
  }
);

/**
 * Obtains all fetch-able registration type ids of a product for the current registrant.
 * If guests have the same agenda as the current registrant and the current registrant has guests,
 * only the current registrant's regTypeId will be returned.
 * Otherwise, all unique regTypeIds for the current registrant and its guests will be returned.
 */
export const getSelectedRegistrationTypeIds = createSelector(
  getRegistrationTypeId,
  getRegistrationTypeIdsForCurrentRegistrantsAndGuests,
  isGuestProductSelectionEnabledOnRegPath,
  (primaryRegTypeId, currentRegistrantAndGuestsRegTypeIds, guestProductSelectionEnabledOnRegPath) => {
    if (isNil(primaryRegTypeId)) {
      return [];
    }
    if (!guestProductSelectionEnabledOnRegPath) {
      return [primaryRegTypeId];
    }
    return currentRegistrantAndGuestsRegTypeIds;
  }
);
