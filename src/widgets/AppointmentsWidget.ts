import { connect } from 'react-redux';
import AppointmentsWidget from 'event-widgets/lib/Appointments/AppointmentsWidget';
import { unescape } from 'lodash';
import { getConfirmationInfo, getEventRegistrationId, isAdminRegistration } from '../redux/selectors/currentRegistrant';
import { getConfirmationNumber, getPrimaryRegistrationId } from '../redux/registrationForm/regCart/selectors';
import { getRegCart } from '../redux/selectors/shared';

const determineConfirmationNumber = (state, regCart) => {
  let confirmationNumber;
  if (isAdminRegistration(state)) {
    const primaryRegistrationId = getPrimaryRegistrationId(regCart);
    if (primaryRegistrationId) {
      confirmationNumber = getConfirmationNumber(regCart, primaryRegistrationId);
    }
  } else {
    const confirmationInfo = getConfirmationInfo(state);
    if (confirmationInfo) {
      confirmationNumber = confirmationInfo.confirmationNumber;
    }
  }
  return confirmationNumber;
};

/**
 * Data wrapper for the Appointments widget.
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  let link = '';
  const regCart = getRegCart(state);
  if (regCart && getEventRegistrationId(state)) {
    const confirmationNumber = determineConfirmationNumber(state, regCart);
    const isAppointmentStatusValid =
      (state.appointments && state.appointments.appointmentEventStatus === 'ACTIVE') ||
      state.defaultUserSession?.isTestMode;
    if (
      state.appointmentsUrl &&
      state.event?.linkedAppointmentEvent?.eventCode &&
      isAppointmentStatusValid &&
      confirmationNumber
    ) {
      link =
        state.appointmentsUrl + '/event/' + state.event.linkedAppointmentEvent.eventCode + '/' + confirmationNumber;
    }
  }
  return {
    translate: state.text.translate,
    enableHyperlink: true,
    display: link.length > 0,
    config: {
      ...props.config,
      link: unescape(link)
    }
  };
})(AppointmentsWidget);
