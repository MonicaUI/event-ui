import { connect } from 'react-redux';
import AirRequestWidget from 'event-widgets/lib/AirRequest/AirRequestWidget';
import { showAirTravelSummaryView } from '../redux/travelCart/index';
import { setSelectedAirRequestId, removeSelectedAirRequestIds } from '../redux/travelCart';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import { getAirBookingsToDisplay } from '../utils/travelUtils';
import { saveAirRequests, onClearAirRequests, onOwnAirTravelReservation } from '../redux/travelCart';
import { loadAirportsForSuggestions } from '../redux/airports';
import AirAdvancedRulesValidator from 'event-widgets/lib/AirRequest/AirAdvancedRulesValidator';
import { get } from 'lodash';

// selectors
import { getRegistrationTypeId, getSelectedAdmissionItemDefinition } from '../redux/selectors/currentRegistrant';
import { getAirRequestSnapshot } from 'event-widgets/redux/selectors/eventTravel';
import { getAirRequestSettingsByRegPath } from 'event-widgets/redux/selectors/appData';
import { transformEventDates } from 'event-widgets/utils/travelUtils';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { shouldUseAirOptOutFeature } from '../ExperimentHelper';
import { setAirRequestOptOutChoice } from '../redux/registrationForm/regCart';
import { areRegistrationActionsDisabled } from '../redux/selectors/shared';

// HOC
export default connect(
  (state: $TSFixMe) => {
    const primaryEventRegistration = currentRegistrant.getEventRegistration(state) || {};
    const guestsEventRegistrations = currentRegistrant.getConfirmedGuests(state) || [];

    const airRequestsForCurrentInvitee = getAirBookingsToDisplay(
      state,
      primaryEventRegistration.eventRegistrationId,
      guestsEventRegistrations.map(r => r.eventRegistrationId)
    );

    const registrationTypeId = getRegistrationTypeId(state);
    const airRequestSnapshot = getAirRequestSnapshot(state);
    const admissionItem = getSelectedAdmissionItemDefinition(state);
    const validator = new AirAdvancedRulesValidator(
      airRequestSnapshot,
      admissionItem ? admissionItem.id : null,
      registrationTypeId
    );
    const restrictionDates = validator.getMergedRestrictions();
    const defaultDates = validator.getMergedDefaults();
    const isRegMod = currentRegistrant.isRegistrationModification(state);
    const isOwnReservation = state.travelCart.userSession.airRequest.ownBooking;
    const isPlanner = state.defaultUserSession.isPlanner;
    const isPendingInviteeModification = isRegMod && currentRegistrant.isRegApprovalRequired(state);
    const displayPlannerFields = isPlanner && !isPendingInviteeModification;
    const registrationPathId = getRegistrationPathIdOrDefault(state);
    let airRequestSettings = getAirRequestSettingsByRegPath(state.appData, registrationPathId);
    const isRegistrationActionDisabled = areRegistrationActionsDisabled(state);

    const userText = state?.localizedUserText?.currentLocale
      ? get(state.localizedUserText.localizations, state.localizedUserText.currentLocale, null)
      : null;
    airRequestSettings = {
      ...airRequestSettings,
      ownReservationText: airRequestSettings.ownReservationText
        ? state.text.translate(
            get(
              userText,
              'appData.registrationSettings.registrationPaths.' +
                registrationPathId +
                '.travelSettings.airRequestSettings.ownReservationText',
              airRequestSettings.ownReservationText
            )
          )
        : undefined
    };

    return {
      airData: {
        ...state.eventTravel.airData,
        airRequestSetup: {
          ...airRequestSnapshot,
          airRequestSettings
        },
        isOwnReservation,
        isSummaryView: state.travelCart.userSession.airRequest.showSummary,
        selectedAirRequestIds: state.travelCart.userSession.airRequest.selectedAirRequestIds
      },
      airRequests: [...airRequestsForCurrentInvitee.primary, ...airRequestsForCurrentInvitee.guests],
      airports: state.airports,
      translateDate: state.text.translateDate,
      event: transformEventDates(state),
      registrations: {
        primary: primaryEventRegistration,
        guests: guestsEventRegistrations
      },
      restrictionDates,
      defaultDates,
      isPlanner,
      displayPlannerFields,
      isRegMod,
      isBehindOptOutExperiment: shouldUseAirOptOutFeature(state),
      isRegistrationActionDisabled
    };
  },
  {
    toggleOwnAirTravelReservation: onOwnAirTravelReservation,
    showAirTravelSummaryView,
    onSubmitAirRequest: saveAirRequests,
    onDeleteAirRequest: onClearAirRequests,
    setSelectedAirRequestId,
    removeSelectedAirRequestIds,
    onAirportSearch: loadAirportsForSuggestions,
    setRequestOptOutChoice: setAirRequestOptOutChoice
  }
)(AirRequestWidget);
