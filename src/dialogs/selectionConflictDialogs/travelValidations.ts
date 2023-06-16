import AirAdvancedRulesValidator from 'event-widgets/lib/AirRequest/AirAdvancedRulesValidator';
import { getIn } from 'icepick';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { utcToDisplayDate } from 'event-widgets/redux/modules/timezones';
import HotelAdvancedRulesValidator from 'event-widgets/lib/HotelRequest/HotelAdvancedRulesValidator';

// selectors
import { getAssociatedRegistrationPathId, getRegCart } from '../../redux/selectors/shared';
import {
  getAirRequestSnapshot,
  getHotelRegRules,
  getGroupFlightsSnapshotData
} from 'event-widgets/redux/selectors/eventTravel';
import {
  getActiveHotelRoomBookings,
  getTravelBookingsForCurrentRegistrantAndGuests,
  getTravelBookingsByEventRegistrations
} from '../../redux/travelCart/selectors';
import { getEventRegistration } from '../../redux/registrationForm/regCart/selectors';
import { getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import { isPasskeyEnabled } from '../../redux/selectors/event';
import { EVENT_HOTEL_VISIBILITY_OPTION } from 'event-widgets/utils/travelConstants';
import { createDerivedRoomRegTypeAssociations } from '../../utils/travelUtils';
import * as travel from 'event-widgets/redux/selectors/eventTravel';
import { shouldDeriveRoomRegTypeAssociations } from 'event-widgets/lib/HotelRequest/utils/HotelRequestUtil';
import { isGuestRegistrationTypeSelectionEnabledOnRegPath } from '../../redux/selectors/currentRegistrationPath';

const ALLOWED_ATTENDEE_TYPES = {
  INVITEE: 'invitee',
  INVITEE_AND_GUEST: 'inviteeAndGuest'
};

/**
 * validates if there is invalid hotel room booking in travel cart based on new reg path / new reg type / adm item id
 */
export function validateHotelBookings(
  state: $TSFixMe,
  registrationTypeId: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  admissionItem: $TSFixMe
): $TSFixMe {
  const travelCart = getIn(state, ['travelCart', 'cart']);
  const hotelRoomBookings = getActiveHotelRoomBookings(travelCart, eventRegistrationId);

  const invalidTravelBookings = [];
  if (!isPasskeyEnabled(state) && hotelRoomBookings) {
    const availableHotelRooms = getAvailableHotelRooms(state, registrationTypeId, admissionItem);
    // find invalid room bookings based on hotel rooms available for new reg path / new reg type
    hotelRoomBookings.forEach(hotelRoomBooking => {
      if (!availableHotelRooms.includes(hotelRoomBooking.roomTypeId)) {
        invalidTravelBookings.push(hotelRoomBooking);
      }
    });
  }
  return {
    isValid: isEmpty(invalidTravelBookings),
    invalidTravelBookings
  };
}

export function validateAirRequestAdvancedRules(
  state: $TSFixMe,
  newRegistrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe,
  eventRegistrationId: $TSFixMe,
  isGuest: $TSFixMe
): $TSFixMe {
  if (!admissionItem) {
    return { isValid: true };
  }
  const airRequestSnapshot = getAirRequestSnapshot(state);
  let travelBookingsToValidate = [];
  // if current registration is guest's or guest has its own reg type widget control
  if (isGuest || !!isGuestRegistrationTypeSelectionEnabledOnRegPath(state)) {
    travelBookingsToValidate = getTravelBookingsByEventRegistrations(state, eventRegistrationId);
  } else {
    // if no reg type widget on guest page then primary controls its selection
    travelBookingsToValidate = getTravelBookingsForCurrentRegistrantAndGuests(state, getEventRegistrationId(state));
  }
  const validator = new AirAdvancedRulesValidator(airRequestSnapshot, admissionItem.id, newRegistrationTypeId);
  return validator.getValidationResult(travelBookingsToValidate);
}

export function validateHotelBookingAdvancedRules(
  state: $TSFixMe,
  newRegistrationTypeId: $TSFixMe,
  admissionItem: $TSFixMe
): $TSFixMe {
  if (isPasskeyEnabled(state) || !admissionItem) {
    return { isValid: true };
  }
  const eventTimezone = getIn(state, ['timezones'])[getIn(state, ['event', 'timezone'])];
  const isPlanner = getIn(state, ['defaultUserSession', 'isPlanner']);
  const hotelRequestRules = getHotelRegRules(state);
  const travelBookingsToValidate = getTravelBookingsForCurrentRegistrantAndGuests(state, getEventRegistrationId(state));
  const hotels = getIn(state, ['eventTravel', 'hotelsData', 'hotels']);
  const validator = new HotelAdvancedRulesValidator(
    hotelRequestRules,
    admissionItem.id,
    newRegistrationTypeId,
    isPlanner,
    eventTimezone,
    hotels
  );
  return validator.getValidationResult(travelBookingsToValidate);
}

/**
 * validates if there is invalid air booking in travel cart based on new reg path
 * @param state
 * @param newRegistrationTypeId
 * @param isGuest whether current event reg is guest
 * @returns {{isValid: *, invalidAirBookings: []}}
 */
export function validateAirRequests(state: $TSFixMe, newRegistrationTypeId: $TSFixMe, isGuest: $TSFixMe): $TSFixMe {
  // get all travel cart bookings
  const bookings = getTravelBookingsForCurrentRegistrantAndGuests(state, getEventRegistrationId(state));

  const invalidAirBookings = [];

  // guest cant change reg path, hence these validations are to be skipped
  if (!isEmpty(bookings) && !isGuest) {
    // new path id based on new reg type id
    const newRegPathId = getAssociatedRegistrationPathId(state, newRegistrationTypeId);
    // get travel settings of new reg path
    const airRegSettings = getIn(getIn(state, ['appData', 'registrationSettings', 'registrationPaths'])[newRegPathId], [
      'travelSettings',
      'airRequestSettings'
    ]);
    const eventTimezone = getIn(state, ['timezones'])[getIn(state, ['event', 'timezone'])];
    const isPlanner = getIn(state, ['defaultUserSession', 'isPlanner']);
    /*
     * validate if air request is not dropped on reg path
     * validate air booking based on newRequestUntil
     */
    if (
      !airRegSettings ||
      (!isPlanner &&
        airRegSettings.allowNewRequestUntil &&
        moment().isAfter(utcToDisplayDate(airRegSettings.allowNewRequestUntil, eventTimezone)))
    ) {
      bookings.forEach(booking => invalidAirBookings.push(...(booking.airBookings ?? [])));
    } else {
      bookings.forEach(booking => {
        if (!isEmpty(booking.airBookings)) {
          // validate air booking based on maxNumberOfAirRequestsPerAttendee
          if (
            !isPlanner &&
            airRegSettings.maxNumberOfAirRequestsPerAttendee &&
            airRegSettings.maxNumberOfAirRequestsPerAttendee < booking.airBookings.length
          ) {
            invalidAirBookings.push(...(booking.airBookings ?? []));
          } else {
            const eventRegistration = getEventRegistration(getRegCart(state), booking.id);
            booking.airBookings.forEach(airBooking => {
              if (
                // validate air booking based on allowedAttendeeTypes
                !hasValidAirBookingAttendeeType(
                  airRegSettings.allowedAttendeeTypes,
                  airBooking,
                  eventRegistration.attendeeType
                )
              ) {
                invalidAirBookings.push(airBooking);
              }
            });
          }
        }
      });
    }
  }
  return {
    isValid: isEmpty(invalidAirBookings),
    invalidAirBookings
  };
}

/**
 * validates if there is invalid group flight booking in travel cart based on new reg path
 * @param state
 * @param newRegistrationTypeId
 * @param eventRegistrationId
 * @returns {{invalidGroupFlightBookings: [], isValid: *}}
 */
export function validateGroupFlightRequests(
  state: $TSFixMe,
  newRegistrationTypeId: $TSFixMe,
  eventRegistrationId: $TSFixMe
): $TSFixMe {
  // get all travel cart bookings
  const bookings = getTravelBookingsForCurrentRegistrantAndGuests(state, getEventRegistrationId(state));
  const booking = bookings.find(b => b.id === eventRegistrationId);
  const invalidGroupFlightBookings = [];
  if (booking) {
    // new path id based on new reg type id
    const newRegPathId = getAssociatedRegistrationPathId(state, newRegistrationTypeId);
    const {
      groupFlightSetup: { groupFlights = [] }
    } = getGroupFlightsSnapshotData(state.eventTravel);
    const groupFlightsForNewRegPath = [];
    // get group flights available for new reg path
    if (groupFlights.length > 0) {
      groupFlights.forEach(groupFlight => {
        if (newRegPathId in groupFlight.regPathSettings) {
          groupFlightsForNewRegPath.push(groupFlight.id);
        }
      });
    }
    // find invalid group flight bookings based on availability for new reg path
    booking.groupFlightBookings.forEach(groupFlightBooking => {
      if (
        (groupFlightBooking.outboundGroupFlightId &&
          !groupFlightsForNewRegPath.includes(groupFlightBooking.outboundGroupFlightId)) ||
        (groupFlightBooking.returnGroupFlightId &&
          !groupFlightsForNewRegPath.includes(groupFlightBooking.returnGroupFlightId))
      ) {
        invalidGroupFlightBookings.push(groupFlightBooking);
      }
    });
  }
  return {
    isValid: isEmpty(invalidGroupFlightBookings),
    invalidGroupFlightBookings
  };
}

/**
 * if passed air booking is made for an allowed attendee type
 * @param allowedAttendeeTypes
 * @param airBooking
 * @param attendeeType
 * @returns {boolean}
 */
function hasValidAirBookingAttendeeType(allowedAttendeeTypes, airBooking, attendeeType) {
  // if only invitee is allowed to make air bookings then air bookings for guest and others are invalid.
  if (
    allowedAttendeeTypes === ALLOWED_ATTENDEE_TYPES.INVITEE &&
    (attendeeType === 'GUEST' ||
      (airBooking.isForOther && (attendeeType === 'GROUP_LEADER' || attendeeType === 'ATTENDEE')))
  ) {
    return false;
  }
  return true;
}

/**
 * get associated hotel rooms for new reg type / new reg path / admission item id
 */
function getAvailableHotelRooms(state, registrationTypeId, admissionItem) {
  let availableHotelRooms = [];
  const hotelsData = getIn(state, ['eventTravel', 'hotelsData']);
  if (!hotelsData || !hotelsData.hotels || hotelsData.hotels.length === 0) {
    return availableHotelRooms;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const visibilityOption = hotelsData && hotelsData.eventHotelVisibilityOption;
  const newRegPathId = getAssociatedRegistrationPathId(state, registrationTypeId);
  const isRoomVisibilityExperimentEnabled = getIn(state, ['experiments', 'isHotelRoomVisibilityExperimentEnabled']);
  const regPaths = getIn(state, ['appData', 'registrationSettings', 'registrationPaths']);
  const derivedRoomRegTypeAssociations = createDerivedRoomRegTypeAssociations(
    state,
    travel.getHotelVisibilityOption(state),
    isRoomVisibilityExperimentEnabled,
    hotelsData.hotels,
    regPaths
  );
  switch (visibilityOption) {
    case null:
    case undefined:
    case EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_PATH:
      availableHotelRooms = getAvailableHotelRoomsForRegPath(
        visibilityOption,
        isRoomVisibilityExperimentEnabled,
        hotelsData,
        derivedRoomRegTypeAssociations,
        registrationTypeId,
        newRegPathId
      );
      break;
    case EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE:
      hotelsData.hotels.forEach(hotel => {
        if (hotel.roomTypes) {
          availableHotelRooms.push(
            ...hotel.roomTypes
              .filter(
                room =>
                  room.isOpenForRegistration &&
                  room.associatedEntitySettings &&
                  room.associatedEntitySettings[registrationTypeId]
              )
              .map(room => room.id)
          );
        }
      });
      break;
    case EVENT_HOTEL_VISIBILITY_OPTION.ADMISSION_ITEM:
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (admissionItem && admissionItem.id) {
        hotelsData.hotels.forEach(hotel => {
          if (hotel.roomTypes) {
            availableHotelRooms.push(
              ...hotel.roomTypes
                .filter(
                  room =>
                    room.isOpenForRegistration &&
                    room.associatedEntitySettings &&
                    room.associatedEntitySettings[admissionItem.id]
                )
                .map(room => room.id)
            );
          }
        });
      }
      break;
    default:
      break;
  }

  return availableHotelRooms;
}

/**
 * get valid hotel rooms when visibility option is reg path
 */
function getAvailableHotelRoomsForRegPath(
  visibilityOption,
  isRoomVisibilityExperimentEnabled,
  hotelsData,
  derivedRoomRegTypeAssociations,
  registrationTypeId,
  newRegPathId
) {
  const availableHotelRooms = [];

  if (shouldDeriveRoomRegTypeAssociations(visibilityOption, isRoomVisibilityExperimentEnabled)) {
    hotelsData.hotels.forEach(hotel => {
      if (hotel.roomTypes) {
        availableHotelRooms.push(
          ...hotel.roomTypes
            .filter(
              room =>
                room.isOpenForRegistration &&
                derivedRoomRegTypeAssociations[room.id] &&
                derivedRoomRegTypeAssociations[room.id][registrationTypeId]
            )
            .map(room => room.id)
        );
      }
    });
  } else {
    // get hotel rooms available for new reg path
    hotelsData.hotels.forEach(hotel => {
      if (hotel.roomTypes) {
        availableHotelRooms.push(
          ...hotel.roomTypes
            .filter(
              room =>
                room.isOpenForRegistration &&
                room.associatedRegPathSettings &&
                room.associatedRegPathSettings[newRegPathId]
            )
            .map(room => room.id)
        );
      }
    });
  }

  return availableHotelRooms;
}
