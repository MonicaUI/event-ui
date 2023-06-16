import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PasskeyHotelRequestWidget from 'event-widgets/lib/PasskeyHotelRequest/PasskeyHotelRequestWidget';
import { isRegApprovalRequired } from '../redux/selectors/currentRegistrant';
import { selectPasskeyHotel, modifyPasskeyRequest } from '../redux/travelCart/passkeyHotelRequest';
import { getRegCart, getAllInviteesRegistrationIds } from '../redux/selectors/shared';
import { getIn } from 'icepick';
import { ATTENDEE_TYPE_MAPPINGS_BY } from 'event-widgets/utils/travelConstants';
import { getSelectedAdmissionItem } from '../redux/registrationForm/regCart/selectors';
import { getTravelCart, getActivePasskeyBookings } from '../redux/travelCart/selectors';
import { getApplicablePasskeyAttendeeTypeMappings } from 'event-widgets/redux/selectors/eventTravel';

const EmptyImmutableArray = Object.freeze([]);

/**
 * @param attendeeTypeMappingBy
 * @param attendeeTypeMappings
 * @returns {*|boolean}
 */
const hasValidMappingsByAdmissionItem = (attendeeTypeMappingBy, attendeeTypeMappings) =>
  attendeeTypeMappingBy &&
  attendeeTypeMappingBy === ATTENDEE_TYPE_MAPPINGS_BY.ADMISSION_ITEM &&
  attendeeTypeMappings &&
  attendeeTypeMappings[attendeeTypeMappingBy];

function isPendingApprovalCase(state) {
  // return false if reg approval feature is not enabled
  const regApprovalFeature = getIn(state, [
    'event',
    'eventFeatureSetup',
    'registrationProcess',
    'registrationApproval'
  ]);
  if (!regApprovalFeature) {
    return false;
  }
  // return if at least one reg in unapproved state
  return isRegApprovalRequired(state);
}

/**
 * checks if all invitees has corresponding invalid admission item type mappings and no hotel room booking opted
 */
export const hasInvalidMappingsWithNoHotelRoomBookings = createSelector(
  // Selector arguments
  getRegCart,
  getApplicablePasskeyAttendeeTypeMappings,
  getTravelCart,
  getAllInviteesRegistrationIds,

  // result function
  (regCart, attendeeTypeMappings, travelCart, eventRegistrationIds) => {
    return (
      !eventRegistrationIds.some(id => getActivePasskeyBookings(true, travelCart, id).length > 0) &&
      !eventRegistrationIds.some(id => {
        const admissionItem = getSelectedAdmissionItem(regCart, id);
        return admissionItem && attendeeTypeMappings[admissionItem.productId];
      })
    );
  }
);

export default connect(
  (state: $TSFixMe) => {
    const {
      registrationForm: {
        regCart: { eventRegistrations }
      }
    } = state;
    const hotels = getIn(state, ['eventTravel', 'hotelsData', 'hotels']) || EmptyImmutableArray;
    const travelBookings = getIn(state, ['travelCart', 'cart', 'bookings']) || [];
    const regCartStatus = getRegCart(state).status;
    const isRegPending = !(
      regCartStatus === 'COMPLETED' ||
      regCartStatus === 'TRANSIENT' ||
      regCartStatus === 'INPROGRESS'
    );
    const passkeySetup = getIn(state, ['eventTravel', 'hotelsData', 'passkeySetup']);
    const attendeeTypeMappingBy = getIn(passkeySetup, ['attendeeTypeMappingBy']);
    const attendeeTypeMappings = getIn(passkeySetup, ['attendeeTypeMappings']) || {};
    const hideWidget =
      hasValidMappingsByAdmissionItem(attendeeTypeMappingBy, attendeeTypeMappings) &&
      hasInvalidMappingsWithNoHotelRoomBookings(state);

    return {
      hotelsData: {
        ...state.eventTravel.hotelsData,
        hotels
      },
      translateDate: state.text.translateDate,
      eventTimezone: state.timezones[state.event.timezone],
      travelBookings,
      eventRegistrations,
      isPendingApprovalCase: isPendingApprovalCase(state),
      attendeeTypeMappingBy,
      attendeeTypeMappings,
      isRegPending,
      hideWidget
    };
  },
  {
    onNewRequest: withLoading(selectPasskeyHotel, true),
    onModifyRequest: modifyPasskeyRequest
  }
)(PasskeyHotelRequestWidget);
