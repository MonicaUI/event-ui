import { connect } from 'react-redux';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import { setAppointmentsMeetingInterest } from '../redux/registrationForm/regCart/actions';
import { getEventRegistrationId } from '../redux/selectors/currentRegistrant';
import { getRegCart } from '../redux/selectors/shared';
import { getExhibitorCustomFields, loadExhibitorsList } from 'event-widgets/redux/modules/appointments';
import { getIn } from 'icepick';

import ApptsMeetingInterestWidget from 'event-widgets/lib/ApptsMeetingInterest/ApptsMeetingInterestWidget';

/* Returns appointments meeting interest from reg cart */
export const getApptsMeetingInterest = (state: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'appointmentsMeetingInterest']);
};

export default withMappedWidgetConfig(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const eventRegistrationId = getEventRegistrationId(state);
      return {
        config: props.config,
        meetingInterest: getApptsMeetingInterest(state, eventRegistrationId),
        eventRegistrationId,
        appointmentEvent: state.appointments.appointmentEvent,
        exhibitors: state.appointments.exhibitors,
        exhibitorCustomFieldsMap: state.appointments.exhibitorCustomFieldsMap,
        countries: state.countries.countries,
        isGuest: true
      };
    },
    {
      setAppointmentsMeetingInterest,
      getExhibitorCustomFields,
      loadExhibitorsList
    },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        setAppointmentsMeetingInterest: dispatchProps.setAppointmentsMeetingInterest,
        getExhibitorCustomFields: customFieldIds => dispatchProps.getExhibitorCustomFields(true, customFieldIds),
        loadExhibitorsList: customFieldIds => dispatchProps.loadExhibitorsList(true, customFieldIds)
      };
    }
  )(ApptsMeetingInterestWidget)
);
