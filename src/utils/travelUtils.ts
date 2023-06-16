import { getTravelBookingsByEventRegistrations } from '../redux/travelCart/selectors';
import { REQUESTED_ACTION } from 'event-widgets/redux/modules/eventTravel';
import { getHotelRegRules, isHotelRequestEnabled } from 'event-widgets/redux/selectors/eventTravel';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import {
  getRegistrationTypeId,
  getSelectedAdmissionItem,
  getRegistrationPathId,
  getAttendee,
  isGuest,
  getEventRegistration
} from '../redux/registrationForm/regCart/selectors';
import { getIn } from 'icepick';
import {
  filterRoomRatesForBookingByUTCDates,
  isRoomTypeAssociated,
  shouldDeriveRoomRegTypeAssociations
} from 'event-widgets/lib/HotelRequest/utils/HotelRequestUtil';
import { createSelector } from 'reselect';
import { getCurrencySymbol, REG_TYPE_ENTITY_ID } from 'event-widgets/utils/travelUtils';
import { getAirActualsFromBooking } from '../redux/travelCart/airActuals';
import { openTravelUnsavedInfoWarningDialog } from '../dialogs';
import { EVENT_HOTEL_VISIBILITY_OPTION } from 'event-widgets/utils/travelConstants';
import { getCityLevelAddressFromAttendee, hasAddressChangedInState } from './addressUtil';
import { hasShoulderDates } from 'event-widgets/lib/HotelRequest/utils/ShoulderDatesUtil';
import BillingInstructionsResolver from 'event-widgets/lib/HotelRequest/utils/BillingInstructionsResolver';
import { getDateOnlyString } from 'event-widgets/utils/dateUtils';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import merge from 'lodash/merge';
import has from 'lodash/has';
import { defaultRegistrationTypeId as EMPTY_UUID } from 'event-widgets/utils/registrationType';
import { getWidget } from '../redux/website/pageContents';
import { shouldUseAirOptOutFeature } from '../ExperimentHelper';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { getAirRequestSettingsByRegPath } from 'event-widgets/redux/selectors/appData';

/**
 * filter out non-cancelled entities
 * @type {function(*): boolean}
 */
export const nonCancelledFilter = (entity: $TSFixMe): $TSFixMe => entity.requestedAction !== REQUESTED_ACTION.CANCEL;

const filterSubBookingsToDisplay = (allTravelBookings, getSubBookingsFromTravelBooking, primaryEventRegistrationId) => {
  return allTravelBookings.reduce(
    (accumulator, booking) => {
      if (getSubBookingsFromTravelBooking(booking) && nonCancelledFilter(booking)) {
        getSubBookingsFromTravelBooking(booking)
          .filter(nonCancelledFilter) // don't need to display cancelled bookings
          .forEach(subBooking => {
            // append the associated attendee with the booking
            if (booking.id === primaryEventRegistrationId) {
              accumulator.primary.push({ ...subBooking, attendeeRegistrationId: booking.id });
            } else {
              accumulator.guests.push({ ...subBooking, attendeeRegistrationId: booking.id });
            }
          });
      }
      return accumulator;
    },
    { primary: [], guests: [] }
  );
};

/**
 * Utility function to return air booking for primary Registrant and it's guests.
 * @param {Object} state
 * @param {string} primaryEventRegistrationId
 * @param {Array} guestsEventRegistrationIds
 * @returns {Object}
 */
export function getAirBookingsToDisplay(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe
): $TSFixMe {
  const allBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);
  return filterSubBookingsToDisplay(allBookings, booking => booking.airBookings, primaryEventRegistrationId);
}

export function getGroupFlightBookingsToDisplay(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe
): $TSFixMe {
  const allBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);
  return filterSubBookingsToDisplay(allBookings, booking => booking.groupFlightBookings, primaryEventRegistrationId);
}

/**
 * Utility function to return airActuals for primary Registrant and it's guests.
 * Exclude cancelled bookings/airActuals/airActualFlights
 * @param {Object} state
 * @returns {Object}
 */
export const getAirActualsForCurrentRegistrant = (state: $TSFixMe, sourceTypes: $TSFixMe): $TSFixMe => {
  const primaryEventRegistration = currentRegistrant.getEventRegistration(state) || {};
  const guestsEventRegistrations = currentRegistrant.getConfirmedGuests(state) || [];
  const currencyList = state.currencies ? Object.values(state.currencies) : [];

  const eventRegistrationIds = [primaryEventRegistration, ...guestsEventRegistrations].map(r => r.eventRegistrationId);
  const allBookings = getTravelBookingsByEventRegistrations(state, eventRegistrationIds);
  return allBookings
    .filter(nonCancelledFilter) // don't need to display cancelled bookings and air actuals associated to group flights
    .reduce(
      (accumulator, booking) => {
        const groupFlightAssociatedAirActualReservationIds =
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          (booking.groupFlightBookings &&
            booking.groupFlightBookings.filter(b => b.airReservationActualId).map(b => b.airReservationActualId)) ||
          [];
        getAirActualsFromBooking(booking, sourceTypes)
          // don't need to display cancelled air actuals
          .filter(nonCancelledFilter)
          // Dont show air actuals associated to group flights
          .filter(airActual => !groupFlightAssociatedAirActualReservationIds.includes(airActual.airReservationActualId))
          .forEach(airActual => {
            const currencySymbol = getCurrencySymbol(currencyList, airActual.currencyId.toString());
            const updatedAirActual = {
              ...airActual,
              flightDetails: airActual.flightDetails.filter(nonCancelledFilter), // dont need cancelled flights
              attendeeRegistrationId: booking.id,
              currencySymbol
            };

            if (booking.id === primaryEventRegistration.eventRegistrationId) {
              accumulator.primary.push(updatedAirActual);
            } else {
              accumulator.guests.push(updatedAirActual);
            }
          });
        return accumulator;
      },
      { primary: [], guests: [] }
    );
};

/**
 * Utility function to return hotel room bookings for primary Registrant and it's guests.
 * @param {Object} state
 * @param {string} primaryEventRegistrationId
 * @param {Array} guestsEventRegistrationIds
 * @returns {Object}
 */
export function getHotelRoomBookingsToDisplay(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe
): $TSFixMe {
  const allBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);
  return filterSubBookingsToDisplay(allBookings, booking => booking.hotelRoomBookings, primaryEventRegistrationId);
}

function getTravelCartAttendee(regCart, id) {
  const eventReg = getEventRegistration(regCart, id) || {};
  const regCartAttendee = getAttendee(regCart, id) || {};
  const isGuestReg = isGuest(regCart, id);
  const regCartPrimaryAttendee = isGuestReg
    ? getAttendee(regCart, eventReg.primaryRegistrationId) || {}
    : regCartAttendee;
  const regCartCityLevelHomeAddress = getCityLevelAddressFromAttendee(
    regCartPrimaryAttendee.personalInformation?.homeAddress || {}
  );
  const regCartCityLevelWorkAddress = getCityLevelAddressFromAttendee(
    regCartPrimaryAttendee.personalInformation?.workAddress || {}
  );
  return {
    contactId: regCartPrimaryAttendee.personalInformation?.contactId,
    primaryRegistrantTravelBookingId: eventReg.primaryRegistrationId,
    id: regCartAttendee.attendeeId,
    type: isGuestReg ? 'GUEST' : 'INVITEE',
    status: regCartAttendee.inviteeStatus,
    targetListId: regCartPrimaryAttendee.targetListId,
    inviteeEmailAddress: regCartPrimaryAttendee.personalInformation?.emailAddress,
    primaryInviteeId: isGuestReg ? regCartPrimaryAttendee.attendeeId : null,
    homeCityAddress: regCartCityLevelHomeAddress,
    workCityAddress: regCartCityLevelWorkAddress
  };
}

function hasAttendeeChanged(attendee, travelCartAttendee) {
  return (
    attendee &&
    travelCartAttendee &&
    (travelCartAttendee.contactId !== attendee.contactId ||
      travelCartAttendee.primaryRegistrantTravelBookingId !== attendee.primaryRegistrantTravelBookingId ||
      travelCartAttendee.id !== attendee.id ||
      travelCartAttendee.type !== attendee.type ||
      travelCartAttendee.status !== attendee.status ||
      travelCartAttendee.targetListId !== attendee.targetListId ||
      travelCartAttendee.inviteeEmailAddress !== attendee.inviteeEmailAddress ||
      travelCartAttendee.primaryInviteeId !== attendee.primaryInviteeId ||
      hasAddressChangedInState(attendee.homeCityAddress || {}, travelCartAttendee.homeCityAddress) ||
      hasAddressChangedInState(attendee.workCityAddress || {}, travelCartAttendee.workCityAddress))
  );
}

/**
 * Updates the reg types, admission items and reg paths from the reg cart into the corresponding travel bookings
 * @param {*} travelBookings travel bookings to update
 * @param {*} regCart reg cart object to update from
 */
export function updateRegistrantInformationInTravelBookings(travelBookings: $TSFixMe, regCart: $TSFixMe): $TSFixMe {
  const bookings = [];
  let hasAnyBookingChanged = false;
  travelBookings.forEach(booking => {
    const { id, admissionItemId, registrationTypeId, registrationPathId, attendee } = booking;
    const regCartRegTypeId = getRegistrationTypeId(regCart, id);
    const regCartAdmissionItemId = (getSelectedAdmissionItem(regCart, id) || {}).productId;
    const regCartRegPathId = getRegistrationPathId(regCart, id);
    const travelCartAttendee = getTravelCartAttendee(regCart, id);
    const isAttendeeUpdated = hasAttendeeChanged(attendee || {}, travelCartAttendee);
    hasAnyBookingChanged =
      hasAnyBookingChanged ||
      isAttendeeUpdated ||
      regCartRegTypeId !== registrationTypeId ||
      regCartAdmissionItemId !== admissionItemId ||
      regCartRegPathId !== registrationPathId;
    bookings.push({
      ...booking,
      admissionItemId: regCartAdmissionItemId || admissionItemId || null,
      registrationTypeId: regCartRegTypeId,
      registrationPathId: regCartRegPathId,
      attendee: {
        ...attendee,
        contactId: travelCartAttendee.contactId,
        primaryRegistrantTravelBookingId: travelCartAttendee.primaryRegistrantTravelBookingId,
        id: travelCartAttendee.id,
        type: travelCartAttendee.type,
        status: travelCartAttendee.status,
        targetListId: travelCartAttendee.targetListId,
        inviteeEmailAddress: travelCartAttendee.inviteeEmailAddress,
        primaryInviteeId: travelCartAttendee.primaryInviteeId,
        homeCityAddress: travelCartAttendee.homeCityAddress,
        workCityAddress: travelCartAttendee.workCityAddress
      }
    });
  });
  return {
    hasAnyBookingChanged,
    bookings
  };
}

/**
 * Get credit card details
 * @param {Object} state travel bookings to update
 * @param {string} primaryEventRegistrationId reg cart object to update from
 * @returns {*}
 */
export function getCreditCardDetails(state: $TSFixMe, primaryEventRegistrationId: $TSFixMe): $TSFixMe {
  const unSavedCreditCard = getIn(state, ['travelCart', 'userSession', 'creditCard']);
  if (!unSavedCreditCard) {
    const booking = (getTravelBookingsByEventRegistrations(state, [primaryEventRegistrationId]) || [])[0];
    const contextId = getIn(booking, ['creditCard', 'contextId']);
    const creditCardDetails = getIn(booking, ['creditCard', 'creditCardDetails'])
      ? { ...booking.creditCard.creditCardDetails }
      : {};
    return contextId ? { ...booking.creditCard.creditCardDetails, contextId } : creditCardDetails;
  }
  return unSavedCreditCard;
}

/**
 * Returns true if any travel answer exists
 * @param {Object} userSession
 * @returns {boolean}
 */
function hasAnyTravelAnswer(userSession) {
  const { travelAnswers } = userSession;
  const allAnswers = Object.values(travelAnswers);
  return allAnswers.length > 0;
}

/**
 * Returns whether any type of booking / credit card is present in the travel cart
 */
export function hasAnyTravelItem(travelForm: $TSFixMe): $TSFixMe {
  const { userSession } = travelForm;
  return (
    hasAnyValidBooking(travelForm) || !!getIn(userSession, ['creditCard', 'number']) || hasAnyTravelAnswer(userSession)
  );
}

/**
 * Whether the travel cart has any bookings that need to be processed by the backend
 */
/* eslint complexity: ["error", 14]*/
export const hasAnyBookingsToProcess = (travelCart: $TSFixMe, eventTravel: $TSFixMe): $TSFixMe => {
  const { cart, userSession } = travelCart;
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (cart &&
      cart.bookings &&
      cart.bookings.length > 0 &&
      cart.bookings.some(
        booking =>
          booking &&
          ((booking.hotelRoomBookings && booking.hotelRoomBookings.length > 0 && isHotelRequestEnabled(eventTravel)) ||
            (booking.airBookings && booking.airBookings.length > 0) ||
            (booking.airActuals && booking.airActuals.length > 0) ||
            (booking.pnrAirActuals && booking.pnrAirActuals.length > 0) ||
            (booking.groupFlightBookings && booking.groupFlightBookings.length > 0) ||
            (booking.travelAnswers && booking.travelAnswers.length > 0))
      )) ||
    hasAnyTravelAnswer(userSession)
  );
};

/**
 * Returns whether any type of booking is present in the travel cart
 * this includes cancelled pnrs because we need to process the cancelled integrations on service side
 */
function hasAnyValidBooking(travelForm) {
  const { cart } = travelForm;
  return (
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    cart &&
    cart.bookings &&
    cart.bookings.length > 0 &&
    cart.bookings.some(
      booking =>
        booking &&
        ((booking.hotelRoomBookings && booking.hotelRoomBookings.length > 0) ||
          (booking.airBookings && booking.airBookings.length > 0) ||
          (booking.airActuals && booking.airActuals.length > 0) ||
          (booking.pnrAirActuals &&
            booking.pnrAirActuals.filter(pnr => pnr.requestedAction === REQUESTED_ACTION.CANCEL).length > 0) ||
          (booking.groupFlightBookings && booking.groupFlightBookings.length > 0))
    )
  );
}

/**
 * Returns whether any travel booking is present for invitee and it's guests.
 * @param {Object} state
 * @param {string} primaryEventRegistrationId
 * @param {Array} guestsEventRegistrationIds
 * @returns {boolean}
 */
export function hasAnyTravelBookingForInviteeAndGuests(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe
): $TSFixMe {
  // check for air requests
  const airBookings = getAirBookingsToDisplay(state, primaryEventRegistrationId, guestsEventRegistrationIds);
  if (airBookings.primary.length > 0 || airBookings.guests.length > 0) return true;

  // check for hotel requests
  const hotelRoomBookings = getHotelRoomBookingsToDisplay(
    state,
    primaryEventRegistrationId,
    guestsEventRegistrationIds
  );
  if (hotelRoomBookings.primary.length > 0 || hotelRoomBookings.guests.length > 0) return true;

  // check for group flights
  const groupFlightBookings = getGroupFlightBookingsToDisplay(
    state,
    primaryEventRegistrationId,
    guestsEventRegistrationIds
  );
  return groupFlightBookings.primary.length > 0 || groupFlightBookings.guests.length > 0;
}

/**
 * Utility function to check if any hotel room bookings exists
 * for which the attendee has to pay during the registration.
 * @param {Object} state
 * @param {string} primaryEventRegistrationId
 * @param {Array} guestsEventRegistrationIds
 * @returns {Object}
 */
export function hasAnyPaidHotelRoomBookings(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe,
  hotels: $TSFixMe
): $TSFixMe {
  const allBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);
  let hasAnyPaidBooking = false;
  allBookings.forEach(booking => {
    if (!hasAnyPaidBooking && booking.hotelRoomBookings && booking.requestedAction !== REQUESTED_ACTION.CANCEL) {
      booking.hotelRoomBookings.forEach(hotelBooking => {
        if (!hasAnyPaidBooking && hotelBooking.requestedAction !== REQUESTED_ACTION.CANCEL) {
          // check if the booking has rate > 0
          const roomTypes = getIn(
            hotels.find(h => h.id === hotelBooking.hotelId),
            ['roomTypes']
          );
          const roomRates = getIn(
            roomTypes.find(r => r.id === hotelBooking.roomTypeId),
            ['roomRate']
          );

          // get planner confirmed dates if planner fields exists
          const checkinDate =
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            (hotelBooking.plannerFields && hotelBooking.plannerFields.plannerConfirmedCheckinDate) ||
            hotelBooking.confirmedCheckinDate ||
            hotelBooking.checkinDate;
          const checkoutDate =
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            (hotelBooking.plannerFields && hotelBooking.plannerFields.plannerConfirmedCheckoutDate) ||
            hotelBooking.confirmedCheckoutDate ||
            hotelBooking.checkoutDate;

          const applicableRates = filterRoomRatesForBookingByUTCDates(
            roomRates,
            checkinDate,
            checkoutDate,
            booking.registrationTypeId
          );
          if (applicableRates.find(r => r.rate > 0)) {
            hasAnyPaidBooking = true;
          }
        }
      });
    }
  });
  return hasAnyPaidBooking;
}

/**
 * Utility function to return air actuals for primary Registrant and it's guests.
 * @param {Object} state
 * @param {string} primaryEventRegistrationId
 * @param {Array} guestsEventRegistrationIds
 * @returns {Object}
 */
export function getAirActualsToDisplay(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe
): $TSFixMe {
  const allBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);
  const currencyList = state.currencies ? Object.values(state.currencies) : [];
  return allBookings.reduce(
    (accumulator, booking) => {
      const groupFlightAssociatedAirActualReservationIds =
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        (booking.groupFlightBookings &&
          booking.groupFlightBookings.filter(b => b.airReservationActualId).map(b => b.airReservationActualId)) ||
        [];
      // don't need to display cancelled bookings and air actuals associated to group flights
      booking.airActuals
        // don't need to display cancelled air actuals
        .filter(nonCancelledFilter)
        // Dont display air actuals associated with group flights
        .filter(airActual => !groupFlightAssociatedAirActualReservationIds.includes(airActual.airReservationActualId))
        .forEach(airActual => {
          const updatedAirActual = {
            ...airActual,
            flightDetails: airActual.flightDetails.filter(nonCancelledFilter), // dont need cancelled flights
            attendeeRegistrationId: booking.id,
            // append currency symbol
            currencySymbol: getCurrencySymbol(currencyList, airActual.currencyId.toString())
          };

          if (booking.id === primaryEventRegistrationId) {
            accumulator.primary.push(updatedAirActual);
          } else {
            accumulator.guests.push(updatedAirActual);
          }
        });
      return accumulator;
    },
    { primary: [], guests: [] }
  );
}

/**
 * Utility function to get currency list with details like currency_symbol, iso_code
 * @param {Object} state
 * @returns {Object}
 */
export const getCurrencyDetailsForAirActuals = createSelector(
  state => getIn(state, ['account', 'accountCurrencies']) || [],
  state => (state as $TSFixMe).currencies,
  (accountCurrencies, allCurrencies) => {
    const currencyList = [];
    accountCurrencies.forEach(accountCurrency => {
      const currencyDetails = allCurrencies[accountCurrency.id.toString()];
      currencyList.push({
        ...accountCurrency,
        iSOCode: currencyDetails.iSOCode,
        nameOfSymbol: currencyDetails.nameOfSymbol,
        symbol: currencyDetails.symbol
      });
    });
    return currencyList;
  }
);

/**
 * verify that the unsaved travel info warning dialog needs to be opened
 * @param userTravelSessionInfo object containing the user's session info for the different travel components
 * @param isBehindOptOutExperiment flag indicating if the opt out feature specific logic needs to be considered
 * @param airRequestSettings site editor settings for air request
 * @param hasAnyAirRequests flag indicating if user has made any air requests either for primary or guest invitee
 * @returns {[]|[string]|*|boolean}
 */
function shouldOpenTravelUnsavedInfoWarningDialog(
  userTravelSessionInfo,
  isBehindOptOutExperiment,
  airRequestSettings,
  hasAnyAirRequests
) {
  const hotelRequestSessionInfo = userTravelSessionInfo.hotelRequest;
  const hasIncompleteAirRequestInfo = !getIn(userTravelSessionInfo, ['airRequest', 'showSummary']);
  const hasIncompleteAirActualInfo = !getIn(userTravelSessionInfo, ['airActual', 'showSummary']);
  const hasIncompleteGroupFlightInfo = !getIn(userTravelSessionInfo, ['groupFlights', 'showSummary']);
  const hasIncompleteHotelRequestInfo =
    !hotelRequestSessionInfo.isSummaryView &&
    hotelRequestSessionInfo.expandedHotels &&
    hotelRequestSessionInfo.expandedHotels.length > 0;

  const hasAnyIncompleteInfo =
    hasIncompleteAirRequestInfo ||
    hasIncompleteAirActualInfo ||
    hasIncompleteHotelRequestInfo ||
    hasIncompleteGroupFlightInfo;

  const shouldSkipForIncompleteAirRequestInfo =
    isBehindOptOutExperiment && airRequestSettings.requireAirRequest && !hasAnyAirRequests;

  return hasAnyIncompleteInfo && (!hasIncompleteAirRequestInfo || !shouldSkipForIncompleteAirRequestInfo);
}

/**
 * validates if we have travel widgets unsaved info on current page and navigate
 * @param handler
 * @returns {Promise<*>}
 */
export async function validateTravelWidgetsAndNavigate(
  handler: $TSFixMe,
  dispatch: $TSFixMe,
  state: $TSFixMe
): Promise<$TSFixMe> {
  const isBehindOptOutExperiment = shouldUseAirOptOutFeature(state);
  const primaryEventRegistration = currentRegistrant.getEventRegistration(state) || {};
  const guestsEventRegistrations = currentRegistrant.getConfirmedGuests(state) || [];
  const airRequestsForCurrentInvitee = getAirBookingsToDisplay(
    state,
    primaryEventRegistration.eventRegistrationId,
    guestsEventRegistrations.map(r => r.eventRegistrationId)
  );
  const hasAnyAirRequests =
    airRequestsForCurrentInvitee.primary.length + airRequestsForCurrentInvitee.guests.length > 0;
  const registrationPathId = getRegistrationPathIdOrDefault(state);

  const userTravelSessionInfo = getIn(state, ['travelCart', 'userSession']);
  // if travel user session exists
  if (userTravelSessionInfo) {
    if (
      shouldOpenTravelUnsavedInfoWarningDialog(
        userTravelSessionInfo,
        isBehindOptOutExperiment,
        getAirRequestSettingsByRegPath(state.appData, registrationPathId),
        hasAnyAirRequests
      )
    ) {
      return await dispatch(openTravelUnsavedInfoWarningDialog(handler, state.text.translate));
    }
  }
  await handler();
}

/**
 * Utility function to check if any hotel room bookings exists
 * which has shoulder dates.
 * @returns {boolean}
 */
export function hasAnyHotelRoomBookingsWithShoulderDates(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe,
  hotels: $TSFixMe
): $TSFixMe {
  const allTravelBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);

  return allTravelBookings
    .filter(booking => booking.hotelRoomBookings && booking.requestedAction !== REQUESTED_ACTION.CANCEL)
    .some(booking => {
      return booking.hotelRoomBookings
        .filter(hotelRoomBooking => hotelRoomBooking.requestedAction !== REQUESTED_ACTION.CANCEL)
        .some(hotelRoomBooking => {
          return hasShoulderDates(
            hotelRoomBooking.checkinDate,
            hotelRoomBooking.checkoutDate,
            hotels.find(h => h.id === hotelRoomBooking.hotelId),
            getHotelRegRules(state),
            booking.registrationTypeId,
            booking.admissionItemId,
            hotelRoomBooking.plannerFields
          );
        });
    });
}

/**
 * Utility function to check if any of primary invitee's (or group member's) hotel room bookings
 * is associated with selectedBIID
 * @returns {boolean}
 */
export function hasAnyHotelRoomBookingsWithBI(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  primaryRegTypeId: $TSFixMe,
  hotels: $TSFixMe,
  selectedBIID: $TSFixMe
): $TSFixMe {
  // all travel bookings made by primary invitee
  const allTravelBookings = getTravelBookingsByEventRegistrations(state, primaryEventRegistrationId);
  const resolver = new BillingInstructionsResolver(hotels, primaryRegTypeId);

  return allTravelBookings
    .filter(booking => booking.hotelRoomBookings && booking.requestedAction !== REQUESTED_ACTION.CANCEL)
    .some(booking => {
      return booking.hotelRoomBookings
        .filter(hotelRoomBooking => hotelRoomBooking.requestedAction !== REQUESTED_ACTION.CANCEL)
        .some(hotelRoomBooking => {
          let associatedWithBI = false;
          // evaluate applicable BIs for each date of hotel room booking's selected date range
          let dateIterator = moment(hotelRoomBooking.checkinDate);
          while (!associatedWithBI && dateIterator.isSameOrBefore(hotelRoomBooking.checkoutDate)) {
            const dateOnlyString = getDateOnlyString(dateIterator.toDate());
            // Billing Instruction associated with this hotel on planner side
            const currentRequestBI = resolver.getInstructions(hotelRoomBooking.hotelId, dateOnlyString);
            // check if this hotel room booking has same Billing Instruction as selected on site-editor
            associatedWithBI =
              selectedBIID === currentRequestBI?.roomAndTax || selectedBIID === currentRequestBI?.incidentals;

            dateIterator = dateIterator.add(1, 'day');
          }
          return associatedWithBI;
        });
    });
}
/**
 * get primary invitee's and guests' regType/admItem ids based on hotel visibility option chosen
 */
export function getAttendeeRegTypeAndAdmItemIds(
  eventHotelVisibilityOption: $TSFixMe,
  primaryAndGuestRegTypeIds: $TSFixMe,
  primaryAndGuestAdmItemIds: $TSFixMe,
  isRoomVisibilityExperimentEnabled?: $TSFixMe
): $TSFixMe {
  return eventHotelVisibilityOption === EVENT_HOTEL_VISIBILITY_OPTION.REGISTRATION_TYPE ||
    shouldDeriveRoomRegTypeAssociations(eventHotelVisibilityOption, isRoomVisibilityExperimentEnabled)
    ? primaryAndGuestRegTypeIds
    : primaryAndGuestAdmItemIds;
}

/**
 * get the selected rooms out of the current hotel requests
 */
export function getSelectedRoomsInHotelRequests(
  hotelRequestsForCurrentInvitee: $TSFixMe,
  hotels: $TSFixMe,
  isPlanner: $TSFixMe,
  visibilityOption: $TSFixMe,
  currentRegistrationPathId: $TSFixMe,
  attendeeRegTypeAndAdmItemIds: $TSFixMe,
  isRoomVisibilityExperimentEnabled?: $TSFixMe,
  derivedRoomRegTypeAssociations?: $TSFixMe
): $TSFixMe {
  return [...hotelRequestsForCurrentInvitee.primary, ...hotelRequestsForCurrentInvitee.guests].filter(roomRequest => {
    const hotel = hotels.find(h => h.id === roomRequest.hotelId);
    const roomType = hotel.roomTypes.find(r => r.id === roomRequest.roomTypeId);
    const isNewRequest = !roomRequest.hotelReservationDetailId;
    // during planner request modification, we only want to show valid associated room requests.
    return (
      isNewRequest ||
      !isPlanner ||
      isRoomTypeAssociated(
        roomType,
        currentRegistrationPathId,
        visibilityOption,
        attendeeRegTypeAndAdmItemIds,
        isRoomVisibilityExperimentEnabled,
        derivedRoomRegTypeAssociations
      )
    );
  });
}

/**
 * creates room -to- regtype associations from site-editor info and existing room -to- reg-path associations,
 * in the format:
 * {
 *   "room-id":{
 *     "reg-type-id":{
 *       entityId: "reg-type-id",
 *       entityType: 11,
 *       allowCharge: true,
 *       allowRefund: true
 *     }
 *   }
 * }
 */
export function createDerivedRoomRegTypeAssociations(
  state: $TSFixMe,
  visibilityOption: $TSFixMe,
  isRoomVisibilityExperimentEnabled: $TSFixMe,
  hotels: $TSFixMe,
  registrationPaths: $TSFixMe
): $TSFixMe {
  const roomRegTypeAssociations = {};

  if (
    !hotels ||
    !registrationPaths ||
    !shouldDeriveRoomRegTypeAssociations(visibilityOption, isRoomVisibilityExperimentEnabled)
  ) {
    return roomRegTypeAssociations;
  }

  hotels.forEach(hotel => {
    hotel.roomTypes.forEach(room => {
      const regTypeSettings = {};
      let isRegTypeWidgetRequired = false;
      let isRegTypeWidgetPresent = false;
      let isRoomAssociatedToAnyRegPath = false;
      const defaultRegPathId = Object.keys(room.associatedRegPathSettings).find(
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        regPathId => registrationPaths[regPathId] && registrationPaths[regPathId].isDefault
      );
      const defaultRegPathSetting = defaultRegPathId && room.associatedRegPathSettings[defaultRegPathId];
      for (const regPathId in room.associatedRegPathSettings) {
        // check if Reg path still exists in event (not deleted)
        if (regPathId && registrationPaths[regPathId]) {
          isRoomAssociatedToAnyRegPath = true;
          const regPathSetting = room.associatedRegPathSettings[regPathId];
          const associatedRegTypes =
            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            (registrationPaths[regPathId] && registrationPaths[regPathId].associatedRegistrationTypes) || [];

          associatedRegTypes.forEach(regTypeId => {
            regTypeSettings[regTypeId] = createRoomRegTypeAssociation(
              regTypeId,
              regPathSetting.allowCharge,
              regPathSetting.allowRefund
            );
          });
        }
      }
      const widget = getWidget(state, 'RegistrationType');
      isRegTypeWidgetPresent = !isEmpty(widget);
      isRegTypeWidgetRequired = isRegTypeWidgetPresent && widget?.config?.required;

      /*
       * check if reg type widget is optional on reg path
       * add default reg type association only when Room is associated to at least 1 reg type
       */
      if (
        isRegTypeWidgetPresent &&
        !isRegTypeWidgetRequired &&
        Object.keys(regTypeSettings).length > 0 &&
        has(room.associatedRegPathSettings, defaultRegPathId)
      ) {
        regTypeSettings[EMPTY_UUID] = createRoomRegTypeAssociation(
          EMPTY_UUID,
          defaultRegPathSetting?.allowCharge,
          defaultRegPathSetting?.allowRefund
        );
      }

      merge(
        regTypeSettings,
        getRegTypeAssociationsForDefault(
          state,
          regTypeSettings,
          registrationPaths,
          isRegTypeWidgetPresent,
          isRegTypeWidgetRequired,
          isRoomAssociatedToAnyRegPath,
          defaultRegPathSetting?.allowCharge,
          defaultRegPathSetting?.allowRefund
        )
      );
      roomRegTypeAssociations[room.id] = regTypeSettings;
    });
  });

  return roomRegTypeAssociations;
}

function createRoomRegTypeAssociation(regTypeId = EMPTY_UUID, charge = false, refund = false) {
  return {
    entityId: regTypeId,
    entityType: REG_TYPE_ENTITY_ID,
    allowCharge: charge,
    allowRefund: refund
  };
}

function getRegTypeAssociationsForDefault(
  state,
  regTypeSettings,
  registrationPaths,
  isRegTypeWidgetPresent,
  isRegTypeWidgetRequired,
  isRoomAssociatedToAnyRegPath,
  charge = false,
  refund = false
) {
  const derivedRegTypeSettings = {};

  // return if room was not associated to any of the reg paths
  if (!isRoomAssociatedToAnyRegPath) {
    return derivedRegTypeSettings;
  }

  // if associated to no reg types but was associate to at least one reg path
  if (Object.keys(regTypeSettings).length < 1) {
    // if total reg path is 1 then associate all reg types
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const allRegTypes = (state.event && state.event.registrationTypes) || {};
    if (Object.keys(registrationPaths).length === 1 && !isEmpty(allRegTypes)) {
      Object.keys(allRegTypes).forEach(regTypeId => {
        if (isRegTypeWidgetPresent && isRegTypeWidgetRequired) {
          if (regTypeId !== EMPTY_UUID) {
            derivedRegTypeSettings[regTypeId] = createRoomRegTypeAssociation(regTypeId, charge, refund);
          }
        } else {
          derivedRegTypeSettings[regTypeId] = createRoomRegTypeAssociation(regTypeId, charge, refund);
        }
      });
    } else {
      // add association to default reg-type if no reg path associations are present for this room
      derivedRegTypeSettings[EMPTY_UUID] = createRoomRegTypeAssociation(EMPTY_UUID, charge, refund);
    }
  }
  return derivedRegTypeSettings;
}
