import { connect } from 'react-redux';
import withMemoizedFunctions from 'nucleus-widgets/lib/withMemoizedFunctions';
import * as currentRegistrant from '../../redux/selectors/currentRegistrant';
import { getDeemFlightRequestSettings, redirectToDeem } from './util';
import { getAirActualsForCurrentRegistrant } from '../../utils/travelUtils';
import DeemFlightRequestWidget from 'event-widgets/lib/DeemFlightRequest/DeemFlightRequestWidget';
import { isDeemEnabled } from 'event-widgets/utils/travelUtils';
import { DEEM_SECTION_DISPLAY_TYPE } from 'event-widgets/lib/DeemFlightRequest/deemFlightRequestUtils';
import { ALL_AIR_ACTUALS_SOURCES } from 'event-widgets/utils/travelConstants';

const DEFAULT_PERSONAL_INFO = Object.freeze({});

function isDeemWidgetVisible(state) {
  const airActualsInfo = getAirActualsForCurrentRegistrant(state, ALL_AIR_ACTUALS_SOURCES);
  const airActuals = [...airActualsInfo.primary, ...airActualsInfo.guests];
  const deemRequestSettings = getDeemFlightRequestSettings(state);
  return (
    isDeemEnabled(state) &&
    (deemRequestSettings.displayDeemSection === DEEM_SECTION_DISPLAY_TYPE.YES ||
      (deemRequestSettings.displayDeemSection ===
        DEEM_SECTION_DISPLAY_TYPE.NO_HIDE_FROM_INVITEES_WHO_HAVE_AIR_ACTUALS &&
        !airActuals.length))
  );
}

/**
 * Data wrapper for putting basic and required information
 * for the functioning of the Deem Flight Request Widget.
 */
export default connect(
  withMemoizedFunctions({ isDeemWidgetVisible })(memoized => (state: $TSFixMe) => {
    const primaryRegistrant = currentRegistrant.getEventRegistration(state);
    const personalInformation = primaryRegistrant?.attendee?.personalInformation || DEFAULT_PERSONAL_INFO;

    return {
      attendeeInfo: personalInformation,
      isDeemEnabled: memoized.isDeemWidgetVisible(state)
    };
  }),
  { onFlightRequest: redirectToDeem }
)(DeemFlightRequestWidget);
