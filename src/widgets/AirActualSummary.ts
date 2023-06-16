import { connect } from 'react-redux';
import AirActualSummaryWidget from 'event-widgets/lib/AirActualSummary/AirActualSummaryWidget';
import { getAirActualsForCurrentRegistrant } from '../utils/travelUtils';
import { ALL_AIR_ACTUALS_SOURCES } from 'event-widgets/utils/travelConstants';

export default connect((state: $TSFixMe) => {
  return {
    airActuals: getAirActualsForCurrentRegistrant(state, ALL_AIR_ACTUALS_SOURCES),
    translateDate: state.text.translateDate,
    translateCurrency: state.text.resolver.currency,
    translateTime: state.text.translateTime,
    event: {
      ...state.event,
      timezone: state.timezones[state.event.timezone]
    },
    airports: state.airports
  };
})(AirActualSummaryWidget);
