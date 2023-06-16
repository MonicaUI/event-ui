import reducer, { addTimezone, utcToDisplayDate } from 'event-widgets/redux/modules/timezones';
import { DEVICE_TIMEZONE_ID } from 'event-widgets/redux/selectors/timezone';
import { registerTranslation } from 'nucleus-guestside-site/src/redux/modules/text';

import { isPostRegistrationPage } from './website/registrationProcesses';
import { getCurrentPageId } from './pathInfo';
import { getRegCart } from './selectors/shared';
import { getPrimaryRegistrationId, getAttendee } from './registrationForm/regCart/selectors';
import { setSelectedTimeZone } from './timeZoneSelection';
import { convertEventTimezoneTranslations } from 'event-widgets/redux/selectors/timezone';
import { UPDATE_REG_CART_SUCCESS } from './registrationForm/regCart/actionTypes';

const DEVICE_TIMEZONE = 1;
const EVENT_TIMEZONE = 0;

/*
 * Creates a thunked action to load the timezone. Any language resource strings will
 * added to the necessary text resolvers.
 * @param The id of the timezone to load.
 */
export const loadTimezone =
  (timezoneId: $TSFixMe) =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { lookupClient },
      text
    } = getState();
    const locales = [text.locale];
    const response = await lookupClient.getTimezone(timezoneId, locales);
    const { timeZones, translations } = response;
    dispatch(addTimezone(timezoneId, timeZones[timezoneId]));
    dispatch(registerTranslation(translations[text.locale], text.locale, text.resolver.context));
  };

export const updateTimeZonePreference = (selectedTimeZone: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const timeZonePreference = selectedTimeZone.value === DEVICE_TIMEZONE_ID ? DEVICE_TIMEZONE : EVENT_TIMEZONE;
    const state = getState();
    const regCart = getRegCart(state);
    const {
      clients: { inviteeSearchClient }
    } = state;
    const isPostRegPage = isPostRegistrationPage(state, getCurrentPageId(state));
    const primaryEventRegistrationId = getPrimaryRegistrationId(regCart);
    const attendee = getAttendee(regCart, primaryEventRegistrationId);
    if (primaryEventRegistrationId && attendee) {
      const updatedRegCart = {
        ...regCart,
        eventRegistrations: {
          ...regCart.eventRegistrations,
          [primaryEventRegistrationId]: {
            ...regCart.eventRegistrations[primaryEventRegistrationId],
            attendee: {
              ...regCart.eventRegistrations[primaryEventRegistrationId].attendee,
              timeZonePreference
            }
          }
        }
      };
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: updatedRegCart
        }
      });
    }

    if (isPostRegPage) {
      inviteeSearchClient.updateInviteeTimeZonePreference(attendee.attendeeId, timeZonePreference);
    }
  };
};

/**
 * Creates a thunked action to load the timezone data and register related translations for the event
 * into the redux store
 * @param timezoneId
 * @param timeZones
 * @param translations
 * @returns {Function}
 */
export const loadEventTimezoneIntoStore = (timezoneId: $TSFixMe, timeZones: $TSFixMe, translations: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const { text } = getState();
    dispatch(addTimezone(timezoneId, timeZones[timezoneId]));
    dispatch(registerTranslation(translations[text.locale], text.locale, text.resolver.context));
  };
};

/**
 * Update the selected Time Zone in state as per the
 * invitee time zone preference
 * @param {*} timezonePreference
 */
const updateSelectedTimeZone = timezonePreference => {
  return (dispatch, getState) => {
    const {
      event: { timezone },
      timezones,
      text: { translate }
    } = getState();
    const eventTimeZone = timezones[timezone];
    let preferedTimeZone;
    if (timezonePreference === DEVICE_TIMEZONE) {
      preferedTimeZone = {
        utcOffset: -new Date().getTimezoneOffset(),
        value: DEVICE_TIMEZONE_ID,
        name: translate('Event_GuestSide_DeviceTimeZone_desc_resx'),
        nameResourceKey: 'Event_GuestSide_DeviceTimeZone__resx'
      };
    } else {
      preferedTimeZone = {
        ...convertEventTimezoneTranslations(translate, eventTimeZone),
        value: timezone
      };
    }
    dispatch(setSelectedTimeZone(preferedTimeZone));
  };
};

export const updateSelectedTimeZoneForPrimaryAttendee = (regCart: $TSFixMe, currentEventRegistrationId: $TSFixMe) => {
  return (dispatch: $TSFixMe): $TSFixMe => {
    const primaryRegistrationAttendee = getAttendee(regCart, currentEventRegistrationId);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (primaryRegistrationAttendee && primaryRegistrationAttendee.timeZonePreference) {
      dispatch(updateSelectedTimeZone(primaryRegistrationAttendee.timeZonePreference));
    }
  };
};

/*
 * Loads the timezone for the event.
 */
export const loadEventTimezone =
  () =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      event: { timezone }
    } = getState();
    await dispatch(loadTimezone(timezone));
  };

// Export the reducer and any methods from base timezone reducer for ease of use.
export default reducer;
export { utcToDisplayDate };
