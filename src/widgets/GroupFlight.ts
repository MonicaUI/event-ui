import { connect } from 'react-redux';
import { getIn } from 'icepick';
import GroupFlightWidget from 'event-widgets/lib/GroupFlight/GroupFlightWidget';
import { transformEventDates } from 'event-widgets/utils/travelUtils';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import {
  toggleGroupFlightSummaryView,
  onClearGroupFlights,
  saveGroupFlightRequests,
  setSelectedGroupFlightId,
  removeSelectedGroupFlightIds
} from '../redux/travelCart/index';
import { getGroupFlightsSnapshotData } from 'event-widgets/redux/selectors/eventTravel';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { getGroupFlightBookingsToDisplay } from '../utils/travelUtils';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getEventRegistrationId } from '../redux/selectors/currentRegistrant';
import { openGroupFlightAttendeeSelectionDialog } from '../dialogs/index';
import { areRegistrationActionsDisabled } from '../redux/selectors/shared';

const getAttendeeData = (primary, guests) => {
  const attendees = {};
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (primary && primary.attendee && primary.attendee.personalInformation) {
    attendees[primary.eventRegistrationId] = primary.attendee.personalInformation;
  }

  guests.forEach(guest => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (guest && guest.attendee && guest.attendee.personalInformation) {
      attendees[guest.eventRegistrationId] = guest.attendee.personalInformation;
    }
  });
  return attendees;
};

export default connect(
  (state: $TSFixMe) => {
    const isForPlanner = getIn(state, ['defaultUserSession', 'isPlanner']);
    const groupFlightsSnapshotData = getGroupFlightsSnapshotData(state.eventTravel);
    const currentRegistrationPathId = getRegistrationPathIdOrDefault(state);
    const eventRegistrationId = getEventRegistrationId(state);

    const primary = currentRegistrant.getEventRegistration(state) || {};
    const guests = currentRegistrant.getConfirmedGuests(state) || [];
    const attendees = getAttendeeData(primary, guests);
    const isRegApprovalRequired = currentRegistrant.isRegApprovalRequired(state);
    const isRegistrationActionDisabled = areRegistrationActionsDisabled(state);

    const applicableGroupFlightRequests = getGroupFlightBookingsToDisplay(
      state,
      primary.eventRegistrationId,
      guests.map(r => r.eventRegistrationId)
    );
    const groupFlightRequests = [...applicableGroupFlightRequests.primary, ...applicableGroupFlightRequests.guests];

    return {
      event: transformEventDates(state),
      airports: state.airports,
      translateCurrency: state.text.resolver.currency,
      translateDate: state.text.translateDate,
      translateTime: state.text.translateTime,
      isSummaryView: getIn(state, ['travelCart', 'userSession', 'groupFlights', 'showSummary']),
      isGroupFlightEnabled: groupFlightsSnapshotData.isGroupFlightEnabled,
      groupFlightSetup: groupFlightsSnapshotData.groupFlightSetup,
      registrationPathId: currentRegistrationPathId,
      isForPlanner,
      attendees,
      groupFlightRequests,
      eventRegistrationId,
      selectedGroupFlightIds: state.travelCart.userSession.groupFlights.selectedGroupFlightIds,
      isRegApprovalRequired,
      isRegistrationActionDisabled
    };
  },
  {
    toggleGroupFlightSummaryView,
    onSubmitGroupFlights: saveGroupFlightRequests,
    onDeleteGroupFlight: onClearGroupFlights,
    setSelectedGroupFlightId,
    removeSelectedGroupFlightIds,
    onSelectGroupFlight: withLoading(openGroupFlightAttendeeSelectionDialog)
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onSelectGroupFlight: dispatchProps.onSelectGroupFlight.bind(null, stateProps.eventRegistrationId)
    };
  }
)(GroupFlightWidget);
