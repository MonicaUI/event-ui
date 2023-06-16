import { connect } from 'react-redux';
import FlightItinerarySummaryWidget from 'event-widgets/lib/FlightItinerarySummary/FlightItinerarySummaryWidget';
import {
  getAirActualsForCurrentRegistrant,
  getGroupFlightBookingsToDisplay,
  getCurrencyDetailsForAirActuals
} from '../utils/travelUtils';
import { transformEventDates } from 'event-widgets/utils/travelUtils';
import { ALL_AIR_ACTUALS_SOURCES } from 'event-widgets/utils/travelConstants';
import { getGroupFlightsSnapshotData } from 'event-widgets/redux/selectors/eventTravel';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';

export default connect((state: $TSFixMe) => {
  const primaryEventRegistration = currentRegistrant.getEventRegistration(state) || {};
  const guestsEventRegistrations = currentRegistrant.getConfirmedGuests(state) || [];
  const {
    groupFlightSetup: { groupFlights = [] }
  } = getGroupFlightsSnapshotData(state.eventTravel);
  return {
    translateDate: state.text.translateDate,
    translateCurrency: state.text.resolver.currency,
    translateTime: state.text.translateTime,
    event: transformEventDates(state),
    airports: state.airports,
    currencyList: getCurrencyDetailsForAirActuals(state),
    airActualsToDisplay: getAirActualsForCurrentRegistrant(state, ALL_AIR_ACTUALS_SOURCES),
    groupFlightsToDisplay: getGroupFlightBookingsToDisplay(
      state,
      primaryEventRegistration.eventRegistrationId,
      guestsEventRegistrations.map(r => r.eventRegistrationId)
    ),
    groupFlights
  };
})(FlightItinerarySummaryWidget);
