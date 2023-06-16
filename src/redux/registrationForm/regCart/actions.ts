import {
  REMOVE_INVALID_CUSTOM_FIELD,
  RESET_REG_CART_DISABLE_REG,
  SET_REG_CART_FIELD_VALUE,
  SET_TEMPORARY_GUEST_FIELD_VALUE
} from './actionTypes';

function setRegCartFieldValue(path, value) {
  return {
    type: SET_REG_CART_FIELD_VALUE,
    payload: { path, value }
  };
}

function eventRegistrationPrefix(eventRegistrationId) {
  return ['eventRegistrations', eventRegistrationId];
}

export function setEventRegistrationFieldValue(
  eventRegistrationId: $TSFixMe,
  path: $TSFixMe,
  value: $TSFixMe
): $TSFixMe {
  return setRegCartFieldValue([...eventRegistrationPrefix(eventRegistrationId), ...path], value);
}

export function setTemporaryGuestFieldValue(path: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return {
    type: SET_TEMPORARY_GUEST_FIELD_VALUE,
    payload: { path, value }
  };
}

export function removeInvalidCustomField(eventRegistrationId: $TSFixMe, fieldId: $TSFixMe): $TSFixMe {
  return {
    type: REMOVE_INVALID_CUSTOM_FIELD,
    payload: {
      fieldId,
      path: [...eventRegistrationPrefix(eventRegistrationId), 'attendee', 'personalInformation', 'customFields']
    }
  };
}

export function updateAdmin(admin: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(setRegCartFieldValue(['admin'], admin));
  };
}

export function updateEventRegistrations(eventRegistrations: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(setRegCartFieldValue(['eventRegistrations'], eventRegistrations));
  };
}

export function updateEventVoucher(eventRegistrationId: $TSFixMe, voucherCode: $TSFixMe) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(
      setRegCartFieldValue(
        [...eventRegistrationPrefix(eventRegistrationId), 'appliedVoucher', 'voucherCode'],
        voucherCode
      )
    );
  };
}

export function setAppointmentsAvailability(eventRegistrationId: $TSFixMe, availability: $TSFixMe): $TSFixMe {
  return setRegCartFieldValue(
    [...eventRegistrationPrefix(eventRegistrationId), 'appointmentsAvailability'],
    availability
  );
}

export function setAppointmentsMeetingInterest(eventRegistrationId: $TSFixMe, meetingInterest: $TSFixMe): $TSFixMe {
  return setRegCartFieldValue(
    [...eventRegistrationPrefix(eventRegistrationId), 'appointmentsMeetingInterest'],
    meetingInterest
  );
}

export function setSendEmailFlag(sendEmail: $TSFixMe): $TSFixMe {
  return setRegCartFieldValue(['sendEmail'], sendEmail);
}

export function saveLocaleId(localeId: $TSFixMe): $TSFixMe {
  return setRegCartFieldValue(['localeId'], localeId);
}

/**
 * Creates a redux action that replaces the regcart object in the redux state with the passed regcart
 * and sets a flag in the redux state that tells the code to prevent registration actions
 *
 * For now, this use case comes into picture in container events only
 * When a user can't access website pages but can access registration pages
 * and they land on a registration page in such an event
 * and reg cart creation is prevented due to the status/config of the event (like registration being closed etc)
 * then we keep the user on the registration page (because they dont have access to website pages)
 * and disable registration actions because we detected earlier that reg cart creation is not possible
 */
export const disableRegistration = (regPathId: $TSFixMe): $TSFixMe => {
  return {
    type: RESET_REG_CART_DISABLE_REG,
    payload: {
      regCart: {
        regCartId: '',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            registrationPathId: regPathId,
            sessionRegistrations: {},
            attendee: {
              personalInformation: {
                firstName: '',
                lastName: ''
              }
            }
          }
        }
      }
    }
  };
};
