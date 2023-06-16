import { getIn } from 'icepick';
import { shouldShowAirActualWidget } from 'event-widgets/utils/travelUtils';
import { getRegistrationPathIdOrDefault } from '../redux/selectors/currentRegistrationPath';
import { filterHotels } from 'event-widgets/lib/HotelRequest/utils/HotelRequestUtil';
import {
  getAirActualsToDisplay,
  getAirBookingsToDisplay,
  getHotelRoomBookingsToDisplay,
  getGroupFlightBookingsToDisplay,
  getAttendeeRegTypeAndAdmItemIds,
  createDerivedRoomRegTypeAssociations
} from './travelUtils';
import { SURVEY_TYPE } from 'event-widgets/utils/questionConstants';
import * as currentRegistrant from '../redux/selectors/currentRegistrant';
import { formatAttendeeNameFromResource } from 'event-widgets/utils/formatAttendeeName';
import { displayToUtcDateString } from 'event-widgets/redux/modules/timezones';
import { SET_TRAVEL_ANSWER_FIELD } from '../redux/travelCart/actionTypes';
import { getQuestionSurveyType, getTravelAnswerData, TRAVEL_ANSWER_REQUESTED_ACTIONS } from './questionUtils';
import { getTravelBookingsByEventRegistrations } from '../redux/travelCart/selectors';
import * as travel from 'event-widgets/redux/selectors/eventTravel';

export function setTravelAnswerFieldAction(path: $TSFixMe, eventRegistrationId: $TSFixMe, value?: $TSFixMe): $TSFixMe {
  return {
    type: SET_TRAVEL_ANSWER_FIELD,
    payload: {
      path,
      eventRegistrationId,
      value
    }
  };
}

export function getTravelAnswer({
  state,
  answerPath,
  getAnswerFormatter = (x): $TSFixMe => x,
  eventRegistrationId
}: {
  state?: $TSFixMe;
  answerPath?: $TSFixMe;
  getAnswerFormatter?: $TSFixMe;
  eventRegistrationId?: $TSFixMe;
}): $TSFixMe {
  // TODO - Need to handle with reg mod, may be?
  const valueBeforeMod = {
    otherText: null,
    selectedValues: []
  };
  return {
    valueBeforeMod,
    value: getAnswerFormatter(getTravelAnswerData(state, answerPath, eventRegistrationId)),
    setterAction: setTravelAnswerFieldAction(answerPath, eventRegistrationId)
  };
}

/**
 * Returns travel questions data to be displayed
 * @param {Object} state
 * @param {Object} props
 * @returns {Array}
 */
// eslint-disable-next-line complexity
export function getTravelQuestionsData(state: $TSFixMe, props: $TSFixMe): $TSFixMe {
  const surveyType = getQuestionSurveyType(props.config);
  const {
    config: {
      appData: { parentQuestionId }
    },
    isAirActualWidgetPresent,
    isAirRequestWidgetPresent,
    isGroupFlightWidgetPresent,
    isHotelRequestWidgetPresent
  } = props;
  const primaryEventRegistrationId = (currentRegistrant.getEventRegistration(state) || {}).eventRegistrationId;
  const guestsEventRegistrationIds = (currentRegistrant.getConfirmedGuests(state) || []).map(
    r => r.eventRegistrationId
  );

  switch (surveyType) {
    case SURVEY_TYPE.HOTEL_QUESTIONS: {
      const hotelBookings = getHotelRoomBookingsToDisplay(
        state,
        primaryEventRegistrationId,
        guestsEventRegistrationIds
      );
      const allBookings = [...hotelBookings.primary, ...hotelBookings.guests];

      if (shouldShowHotelRequestQuestions(state, isHotelRequestWidgetPresent)) {
        return getQuestionsDataForBookings(allBookings, parentQuestionId, props.metaData);
      }
      return [];
    }

    case SURVEY_TYPE.HOTEL_ALTERNATE_QUESTIONS: {
      const hotelBookings = getHotelRoomBookingsToDisplay(
        state,
        primaryEventRegistrationId,
        guestsEventRegistrationIds
      );
      const allBookings = [...hotelBookings.primary, ...hotelBookings.guests];

      if (shouldShowHotelRequestQuestions(state, isHotelRequestWidgetPresent) && !allBookings.length) {
        return [
          {
            booking: {
              id: '00000000-0000-0000-0000-000000000000'
            },
            eventRegistrationId: primaryEventRegistrationId
          }
        ];
      }
      return [];
    }

    case SURVEY_TYPE.AIR_QUESTIONS: {
      const airBookings = getAirBookingsToDisplay(state, primaryEventRegistrationId, guestsEventRegistrationIds);
      const allBookings = [...airBookings.primary, ...airBookings.guests];

      if (shouldShowAirRequestQuestions(state, isAirRequestWidgetPresent)) {
        return getQuestionsDataForBookings(allBookings, parentQuestionId, props.metaData);
      }
      return [];
    }

    case SURVEY_TYPE.AIR_ALTERNATE_QUESTIONS: {
      const airBookings = getAirBookingsToDisplay(state, primaryEventRegistrationId, guestsEventRegistrationIds);
      const allBookings = [...airBookings.primary, ...airBookings.guests];

      if (shouldShowAirRequestQuestions(state, isAirRequestWidgetPresent) && !allBookings.length) {
        return [
          {
            booking: {
              id: '00000000-0000-0000-0000-000000000000'
            },
            eventRegistrationId: primaryEventRegistrationId
          }
        ];
      }
      return [];
    }

    case SURVEY_TYPE.AIR_ACTUAL_QUESTIONS: {
      const airActuals = getAirActualsToDisplay(state, primaryEventRegistrationId, guestsEventRegistrationIds);
      const allBookings = [...airActuals.primary, ...airActuals.guests];

      if (shouldShowAirActualQuestions(state, isAirActualWidgetPresent)) {
        return getQuestionsDataForBookings(allBookings, parentQuestionId, props.metaData);
      }
      return [];
    }

    case SURVEY_TYPE.AIR_ACTUAL_ALTERNATE_QUESTIONS: {
      const airActuals = getAirActualsToDisplay(state, primaryEventRegistrationId, guestsEventRegistrationIds);
      const allBookings = [...airActuals.primary, ...airActuals.guests];

      if (shouldShowAirActualQuestions(state, isAirActualWidgetPresent) && !allBookings.length) {
        return [
          {
            booking: {
              id: '00000000-0000-0000-0000-000000000000'
            },
            eventRegistrationId: primaryEventRegistrationId
          }
        ];
      }
      return [];
    }

    case SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS: {
      const groupFlightBookings = getGroupFlightBookingsToDisplay(
        state,
        primaryEventRegistrationId,
        guestsEventRegistrationIds
      );
      const allBookings = [...groupFlightBookings.primary, ...groupFlightBookings.guests];

      if (shouldShowGroupFlightQuestions(state, isGroupFlightWidgetPresent)) {
        return getQuestionsDataForBookings(allBookings, parentQuestionId, props.metaData);
      }
      return [];
    }

    case SURVEY_TYPE.GROUP_FLIGHT_ALTERNATE_QUESTIONS: {
      const groupFlightBookings = getGroupFlightBookingsToDisplay(
        state,
        primaryEventRegistrationId,
        guestsEventRegistrationIds
      );
      const allBookings = [...groupFlightBookings.primary, ...groupFlightBookings.guests];

      if (shouldShowGroupFlightQuestions(state, isGroupFlightWidgetPresent) && !allBookings.length) {
        return [
          {
            booking: {
              id: '00000000-0000-0000-0000-000000000000'
            },
            eventRegistrationId: primaryEventRegistrationId
          }
        ];
      }
      return [];
    }

    default:
      return [];
  }
}

/**
 * get questions data from request bookings(hotel/air/airActual)
 */
function getQuestionsDataForBookings(allBookings, parentQuestionId, metaData) {
  let bookings = allBookings;
  // If child question, we need to show it only once and for only parent booking id
  if (parentQuestionId) {
    bookings = allBookings.filter(booking => {
      return booking.id === metaData.bookingId;
    });
  }
  const questions = bookings.map(booking => {
    return {
      booking,
      eventRegistrationId: booking.attendeeRegistrationId
    };
  });

  return questions;
}

/**
 * returns whether to show air actual questions based on settings in state
 * @param state
 * @returns {boolean}
 */
function shouldShowAirActualQuestions(state, isAirActualWidgetPresent) {
  const isPlannerRegistrationMode = getIn(state, ['defaultUserSession', 'isPlanner']);
  const airActualSetup = getIn(state, ['eventTravel', 'airData', 'airActualSetup']);
  const registrationPathId = getRegistrationPathIdOrDefault(state);
  const airActualSettings = getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    registrationPathId,
    'travelSettings',
    'airActualSettings'
  ]);

  return (
    shouldShowAirActualWidget({ ...airActualSetup, ...airActualSettings }, false, isPlannerRegistrationMode) &&
    isAirActualWidgetPresent
  );
}

/**
 * return whether to show air request widget based on air request settings in state
 */
function shouldShowAirRequestQuestions(state, isAirRequestWidgetPresent) {
  return getIn(state, ['eventTravel', 'airData', 'isAirRequestFormEnabled']) && isAirRequestWidgetPresent;
}

function shouldShowGroupFlightQuestions(state, isGroupFlightWidgetPresent) {
  return getIn(state, ['eventTravel', 'airData', 'isGroupFlightEnabled']) && isGroupFlightWidgetPresent;
}

/**
 * return whether to show hotel questions based on settings in state
 */
function shouldShowHotelRequestQuestions(state, isHotelRequestWidgetPresent) {
  const hotelsData = getIn(state, ['eventTravel', 'hotelsData']);
  const isPlanner = getIn(state, ['defaultUserSession', 'isPlanner']);
  const currentRegistrationPathId = getRegistrationPathIdOrDefault(state);
  const allowedAttendeeTypes = getIn(state, [
    'appData',
    'registrationSettings',
    'registrationPaths',
    currentRegistrationPathId,
    'travelSettings',
    'hotelRequestSettings',
    'allowedAttendeeTypes'
  ]);

  if (hotelsData.isHotelRequestEnabled && isHotelRequestWidgetPresent) {
    const registrationPathId = getRegistrationPathIdOrDefault(state);
    const eventHotelVisibilityOption = hotelsData.eventHotelVisibilityOption;
    const isRoomVisibilityExperimentEnabled = getIn(state, ['experiments', 'isHotelRoomVisibilityExperimentEnabled']);
    const attendeeRegTypeAndAdmItemIds = getAttendeeRegTypeAndAdmItemIds(
      eventHotelVisibilityOption,
      currentRegistrant.getRegistrationTypesForPrimaryAndGuests(state, allowedAttendeeTypes),
      currentRegistrant.getRegisteredAdmissionItemForPrimaryAndGuests(state, allowedAttendeeTypes),
      isRoomVisibilityExperimentEnabled
    );
    const regPaths = getIn(state, ['appData', 'registrationSettings', 'registrationPaths']);
    const derivedRoomRegTypeAssociations = createDerivedRoomRegTypeAssociations(
      state,
      travel.getHotelVisibilityOption(state),
      isRoomVisibilityExperimentEnabled,
      hotelsData.hotels,
      regPaths
    );
    const filteredHotels = filterHotels(
      hotelsData.hotels,
      registrationPathId,
      isPlanner,
      eventHotelVisibilityOption,
      attendeeRegTypeAndAdmItemIds,
      false,
      isRoomVisibilityExperimentEnabled,
      derivedRoomRegTypeAssociations
    );
    return !!filteredHotels.length;
  }
  return false;
}

/**
 * Returns question header for travel questions
 * @param {Object} state
 * @param {Object} booking
 * @param {string} surveyType
 * @returns {string}
 */
export function getTravelQuestionHeader(state: $TSFixMe, booking: $TSFixMe, surveyType: $TSFixMe): $TSFixMe {
  const {
    text: { translate, translateDate },
    eventTravel: {
      hotelsData: { hotels }
    },
    timezones,
    event: { timezone },
    airports
  } = state;
  const eventRegistration = state.registrationForm.regCart.eventRegistrations[booking.attendeeRegistrationId];
  let firstName = getIn(eventRegistration, ['attendee', 'personalInformation', 'firstName']);
  let lastName = getIn(eventRegistration, ['attendee', 'personalInformation', 'lastName']);
  /*
   * This block will be required only when using the guest dropdown,
   * the firstName is undefined and the secondName follows the pattern, 'Guest 01'.
   * So, in that case we want to use 'Guest' as firstName' and '01' as lastName.
   */
  if (!firstName && lastName) {
    const name = lastName.trim().split(' ');
    firstName = name[0];
    lastName = name[1];
  }
  const eventTimezone = timezones[timezone];
  switch (surveyType) {
    case SURVEY_TYPE.HOTEL_QUESTIONS: {
      const hotel = hotels.find(h => h.id === booking.hotelId);
      const roomType = hotel.roomTypes.find(r => r.id === booking.roomTypeId);
      return translate('EventWidgets_QuestionWidget_HotelQuestionHeader__resx', {
        name: formatAttendeeNameFromResource({ firstName, lastName }, translate),
        hotelName: translate(hotel.name),
        roomType: translate(roomType.roomTypeName),
        checkinDate: translateDate(
          displayToUtcDateString(booking.confirmedCheckinDate || booking.checkinDate, eventTimezone),
          'medium'
        ),
        checkoutDate: translateDate(
          displayToUtcDateString(booking.confirmedCheckoutDate || booking.checkoutDate, eventTimezone),
          'medium'
        )
      });
    }

    case SURVEY_TYPE.AIR_ACTUAL_QUESTIONS: {
      const name = booking.travellerInfo.fullName;
      const flight = booking.flightDetails[0];
      const origin = airports[flight.departureFrom].code;
      const destination = airports[flight.arrivalTo].code;

      return translate('EventWidgets_QuestionWidget_AirActualQuestionHeader__resx', {
        name,
        origin,
        destination,
        travelDate: translateDate(displayToUtcDateString(flight.departureDate, eventTimezone), 'medium')
      });
    }

    case SURVEY_TYPE.AIR_QUESTIONS: {
      const travellerInfo = booking.travellerInfo;

      const originAirport = airports[booking.departureFrom];
      const destAirport = airports[booking.departureTo];

      if (originAirport && destAirport) {
        return translate('EventWidgets_QuestionWidget_AirQuestionHeader__resx', {
          fname: travellerInfo.firstName,
          lname: travellerInfo.lastName,
          origin: airports[booking.departureFrom].code,
          destination: airports[booking.departureTo].code,
          travelDate: translateDate(displayToUtcDateString(booking.departureDate, eventTimezone), 'medium')
        });
      }
      return translate('EventWidgets_QuestionWidget_AirQuestionHeader_WithoutAirport__resx', {
        fname: travellerInfo.firstName,
        lname: travellerInfo.lastName,
        travelDate: translateDate(displayToUtcDateString(booking.departureDate, eventTimezone), 'medium')
      });
    }

    case SURVEY_TYPE.GROUP_FLIGHT_QUESTIONS: {
      return translate('EventWidgets_QuestionWidget_GroupFlightQuestionHeader', {
        name: formatAttendeeNameFromResource({ firstName, lastName }, translate)
      });
    }
    default:
      return null;
  }
}

/**
 * Utility function to return travel answers for primary Registrant and it's guests.
 * @param {Object} state
 * @param {string} primaryEventRegistrationId
 * @param {Array} guestsEventRegistrationIds
 * @returns {Object}
 */
export function getTravelAnswersToDisplay(
  state: $TSFixMe,
  primaryEventRegistrationId: $TSFixMe,
  guestsEventRegistrationIds: $TSFixMe
): $TSFixMe {
  const allBookings = getTravelBookingsByEventRegistrations(state, [
    primaryEventRegistrationId,
    ...guestsEventRegistrationIds
  ]);

  return allBookings.reduce(
    (accumulator, booking) => {
      if (
        // need cancelled bookings as they may have alternate travel answers
        booking.travelAnswers
      ) {
        booking.travelAnswers
          .filter(a => a.requestedAction !== TRAVEL_ANSWER_REQUESTED_ACTIONS.DELETE)
          .forEach(answer => {
            // append the associated attendee with the booking
            if (booking.id === primaryEventRegistrationId) {
              accumulator.primary.push({ ...answer });
            } else {
              accumulator.guests.push({ ...answer });
            }
          });
      }
      return accumulator;
    },
    { primary: [], guests: [] }
  );
}
