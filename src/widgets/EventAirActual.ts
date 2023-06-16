import { connect } from 'react-redux';
import AirActualWidget from 'event-widgets/lib/AirActual/AirActualWidget';
import { loadAirportsForSuggestions } from '../redux/airports';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import { getAccountDefaultCurrencyId } from 'event-widgets/redux/selectors/account';
import { onClearAirActuals, saveAirActuals } from '../redux/travelCart';
import { transformEventDates } from 'event-widgets/utils/travelUtils';
import { getIn } from 'icepick';
import { toggleAirActualSummaryView } from '../redux/travelCart/index';
import { getAirActualsForCurrentRegistrant, getCurrencyDetailsForAirActuals } from '../utils/travelUtils';
import { setSelectedAirActualId, removeSelectedAirActualIds } from '../redux/travelCart';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { AIR_ACTUAL_SOURCE_TYPE } from 'event-widgets/utils/travelConstants';
import { areRegistrationActionsDisabled } from '../redux/selectors/shared';

export default connect(
  (state: $TSFixMe) => {
    const isPlannerRegistrationMode = getIn(state, ['defaultUserSession', 'isPlanner']);
    const airActualSetup = getIn(state, ['eventTravel', 'airData', 'airActualSetup']);
    const primaryEventRegistration = currentRegistrant.getEventRegistration(state) || {};
    const guestsEventRegistrations = currentRegistrant.getConfirmedGuests(state) || [];
    const registrationPathId = getRegistrationPathIdOrDefault(state);
    const isRegistrationActionDisabled = areRegistrationActionsDisabled(state);
    const airActualSettings = getIn(state, [
      'appData',
      'registrationSettings',
      'registrationPaths',
      registrationPathId,
      'travelSettings',
      'airActualSettings'
    ]);

    return {
      event: transformEventDates(state),
      airports: state.airports,
      isPlannerRegistrationMode,
      isRegistrationActionDisabled,
      airActualSetup: {
        ...airActualSetup,
        ...airActualSettings
      },
      registrations: {
        primary: primaryEventRegistration,
        guests: guestsEventRegistrations
      },
      currencyList: getCurrencyDetailsForAirActuals(state),
      defaultCurrency: getAccountDefaultCurrencyId(state),
      isSummaryView: getIn(state, ['travelCart', 'userSession', 'airActual', 'showSummary']),
      selectedAirActualIds: getIn(state, ['travelCart', 'userSession', 'airActual', 'selectedAirActualIds']),
      airActualsToDisplay: getAirActualsForCurrentRegistrant(state, [AIR_ACTUAL_SOURCE_TYPE.CVENT]),
      translateCurrency: state.text.resolver.currency,
      translateDate: state.text.translateDate,
      translateTime: state.text.translateTime
    };
  },
  {
    onAirportSearch: loadAirportsForSuggestions,
    onSubmitAirActual: saveAirActuals,
    onDeleteAirActual: onClearAirActuals,
    toggleAirActualSummaryView,
    setSelectedAirActualId,
    removeSelectedAirActualIds
  }
)(AirActualWidget);
