import { connect } from 'react-redux';
import TravelCreditCardWidget from 'event-widgets/lib/TravelCreditCard/TravelCreditCardWidget';
import { getExpirationDateOptions } from 'event-widgets/utils/creditCardUtils';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import { updateUnsavedCreditCard } from '../redux/travelCart/index';
import {
  getCreditCardDetails,
  hasAnyTravelBookingForInviteeAndGuests,
  hasAnyPaidHotelRoomBookings,
  hasAnyHotelRoomBookingsWithShoulderDates,
  hasAnyHotelRoomBookingsWithBI
} from '../utils/travelUtils';
import { getApplicableCreditCardSettings, isTravelCCWidgetVisible } from 'event-widgets/utils/creditCardUtils';
import { getIn } from 'icepick';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';

function displayCreditCardWidget(state, travelCreditCardSettings) {
  /*
   * Hide widget if travel credit card settings are not present
   * or when extended login is turned ON or no account card type is supported
   */
  if (!Object.keys(travelCreditCardSettings).length || !isTravelCCWidgetVisible(state)) {
    return false;
  }

  const primaryEventRegistrationId = currentRegistrant.getEventRegistration(state).eventRegistrationId;
  const guestsEventRegistrationIds = currentRegistrant.getConfirmedGuests(state).map(reg => reg.eventRegistrationId);
  const primaryRegTypeId = currentRegistrant.getRegistrationTypeId(state);

  const hotels = getIn(state, ['eventTravel', 'hotelsData', 'hotels']);

  switch (travelCreditCardSettings.displayWidget) {
    case 'balanceDueForHotelRequest':
      // fetch if there is any booking which has room rate > 0
      return hasAnyPaidHotelRoomBookings(state, primaryEventRegistrationId, guestsEventRegistrationIds, hotels);
    case 'atleastOneTravelRequest':
      return hasAnyTravelBookingForInviteeAndGuests(state, primaryEventRegistrationId, guestsEventRegistrationIds);
    case 'shoulderDatesOn':
      // returns true if any hotel room request has shoulder dates
      return hasAnyHotelRoomBookingsWithShoulderDates(
        state,
        primaryEventRegistrationId,
        guestsEventRegistrationIds,
        hotels
      );
    case 'billingInstructionOn': {
      const selectedBI = getSelectedBillingInstruction(state, travelCreditCardSettings);
      // returns true if any of the primary invitee's hotel room request is associated with the selected BI
      return (
        selectedBI &&
        hasAnyHotelRoomBookingsWithBI(state, primaryEventRegistrationId, primaryRegTypeId, hotels, selectedBI.id)
      );
    }
    default:
      return true;
  }
}

/**
 * returns the Billing Instruction selected in TCC widget on site-editor
 */
function getSelectedBillingInstruction(state, travelCreditCardSettings) {
  const hotelBillingInstructions = getIn(state, ['account', 'hotelBillingInstructions']);
  // Billing Instruction selected on site-editor
  const selectedBICode = getIn(travelCreditCardSettings, ['billingInstruction', 'billingInstructionCode']);
  const selectedBI = hotelBillingInstructions.find(BI => BI.code === selectedBICode);
  return selectedBI;
}

/**
 * Data wrapper for Travel Credit Card Widget
 */
export default connect(
  withMemoizedFunctions({ displayCreditCardWidget })(memoized => (state: $TSFixMe) => {
    const registrationPathId = currentRegistrant.getRegistrationPathId(state);
    const travelCreditCardSettings = getApplicableCreditCardSettings(state, registrationPathId);
    const creditCard = getCreditCardDetails(state, currentRegistrant.getEventRegistration(state).eventRegistrationId);
    return {
      event: {
        ...state.event,
        timezone: state.timezones[state.event.timezone]
      },
      travelCreditCardSettings,
      creditCard,
      displayCreditCardWidget: memoized.displayCreditCardWidget(state, travelCreditCardSettings),
      expirationDateOptions: getExpirationDateOptions(state)
    };
  }),
  {
    // saving data to userSession's credit card object
    onCardFieldChange: updateUnsavedCreditCard
  }
)(TravelCreditCardWidget);
