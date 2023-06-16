import { connect } from 'react-redux';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import HotelRequestWidget from 'event-widgets/lib/HotelRequest/HotelRequestWidget';
import {
  toggleOwnAccommodation,
  showHotelRequestSummaryView,
  setAnotherHotelRequestFlag,
  updateExpandedHotels,
  loadRoommateData,
  searchRoommates
} from '../redux/travelCart/index';
import { saveHotelRoomRequests, openHotelRequestDeleteConfirmation } from '../redux/travelCart/workflow';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import {
  getHotelRoomBookingsToDisplay,
  getAttendeeRegTypeAndAdmItemIds,
  getSelectedRoomsInHotelRequests,
  createDerivedRoomRegTypeAssociations
} from '../utils/travelUtils';
import * as travel from 'event-widgets/redux/selectors/eventTravel';
import { getActiveAccountHotelBillingInstructions, areRegistrationActionsDisabled } from '../redux/selectors/shared';
import { openShoulderDateApprovalWarningDialog } from '../dialogs';
import { transformEventDates } from 'event-widgets/utils/travelUtils';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { getIn } from 'icepick';
import { getRegisteredAdmissionItemForPrimaryAndGuests } from '../redux/selectors/currentRegistrant';
import getDialogContainerStyle from '../dialogs/shared/getDialogContainerStyle';

export default connect(
  (state: $TSFixMe) => {
    const primaryEventRegistration = currentRegistrant.getEventRegistration(state) || {};
    const guestsEventRegistrations = currentRegistrant.getConfirmedGuests(state) || [];
    const isGroupRegistration = currentRegistrant.isGroupRegistration(state);

    const hotelRequestsForCurrentInvitee = getHotelRoomBookingsToDisplay(
      state,
      primaryEventRegistration.eventRegistrationId,
      guestsEventRegistrations.map(r => r.eventRegistrationId)
    );

    const hotelRegRules = travel.getHotelRegRules(state);
    const admissionItem = currentRegistrant.getSelectedAdmissionItemDefinition(state) || {};
    const isPlanner = state.defaultUserSession.isPlanner;
    const isRegMod = currentRegistrant.isRegistrationModification(state);

    const isPendingInvitee = currentRegistrant.isRegApprovalRequired(state);
    const isPendingInviteeModification = isPendingInvitee && isRegMod;

    const isRegistrationActionDisabled = areRegistrationActionsDisabled(state);

    // show planner fields only if planner is registering OR (modifying an approved invitee).
    const displayPlannerFields = isPlanner && !isPendingInviteeModification;
    const currentRegistrationPathId = getRegistrationPathIdOrDefault(state);
    const roommateRequestSettings = getIn(state, [
      'appData',
      'registrationSettings',
      'registrationPaths',
      currentRegistrationPathId,
      'travelSettings',
      'hotelRequestSettings',
      'roommateRequestSettings'
    ]);
    const hotelRequestSessionInfo = getIn(state, ['travelCart', 'userSession', 'hotelRequest']);
    const allowedAttendeeTypes = getIn(state, [
      'appData',
      'registrationSettings',
      'registrationPaths',
      currentRegistrationPathId,
      'travelSettings',
      'hotelRequestSettings',
      'allowedAttendeeTypes'
    ]);
    const isRoomVisibilityExperimentEnabled = getIn(state, ['experiments', 'isHotelRoomVisibilityExperimentEnabled']);
    const attendeeRegTypeAndAdmItemIds = getAttendeeRegTypeAndAdmItemIds(
      travel.getHotelVisibilityOption(state),
      currentRegistrant.getRegistrationTypesForPrimaryAndGuests(state, allowedAttendeeTypes),
      getRegisteredAdmissionItemForPrimaryAndGuests(state, allowedAttendeeTypes),
      isRoomVisibilityExperimentEnabled
    );
    const hotels = travel.getHotels(state);
    const regPaths = getIn(state, ['appData', 'registrationSettings', 'registrationPaths']);
    const derivedRoomRegTypeAssociations = createDerivedRoomRegTypeAssociations(
      state,
      travel.getHotelVisibilityOption(state),
      isRoomVisibilityExperimentEnabled,
      hotels,
      regPaths
    );
    const selectedRooms = getSelectedRoomsInHotelRequests(
      hotelRequestsForCurrentInvitee,
      hotels,
      isPlanner,
      travel.getHotelVisibilityOption(state),
      currentRegistrationPathId,
      attendeeRegTypeAndAdmItemIds,
      isRoomVisibilityExperimentEnabled,
      derivedRoomRegTypeAssociations
    );

    const isSummaryView =
      (selectedRooms.length > 0 &&
        hotelRequestSessionInfo.expandedHotels.length === 0 &&
        !hotelRequestSessionInfo.isMakingAnotherRequest) ||
      hotelRequestSessionInfo.isSummaryView;

    return {
      hotelsData: {
        ...state.eventTravel.hotelsData,
        selectedRooms,
        isOwnAccommodation: hotelRequestSessionInfo.ownBooking
      },
      translateCurrency: state.text.resolver.currency,
      translateDate: state.text.translateDate,
      event: transformEventDates(state),
      registrationPathId: getRegistrationPathIdOrDefault(state),
      registrationTypeId: currentRegistrant.getRegistrationTypeId(state),
      attendeeRegTypeAndAdmItemIds,
      isPlanner,
      isGroupRegistration,
      isSiteEditorPreview: false,
      roommateRequestSettings,
      registrations: {
        primary: primaryEventRegistration,
        guests: guestsEventRegistrations
      },
      roommates: state.travelCart.roommates,
      hotelRegRules,
      admissionItemId: admissionItem.id,
      displayPlannerFields,
      accountHotelBillingInstructions: getActiveAccountHotelBillingInstructions(state),
      isRegMod,
      isSummaryView,
      expandedHotels: hotelRequestSessionInfo.expandedHotels,
      isPendingInvitee,
      isRoomVisibilityExperimentEnabled,
      derivedRoomRegTypeAssociations,
      dialogContainerStyle: getDialogContainerStyle(state),
      isRegistrationActionDisabled
    };
  },
  {
    toggleOwnAccommodation,
    showHotelRequestSummaryView,
    updateExpandedHotels,
    setAnotherHotelRequestFlag,
    onRoommateCriteriaChange: withLoading(loadRoommateData),
    onRoommateSearch: searchRoommates,
    onSubmitRoomRequest: saveHotelRoomRequests,
    onClearRoomSelection: openHotelRequestDeleteConfirmation,
    onRequestShoulderDatesRequiringApproval: openShoulderDateApprovalWarningDialog
  }
)(HotelRequestWidget);
