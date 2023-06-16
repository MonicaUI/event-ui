import { connect } from 'react-redux';

import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';

import ApptsAvailabilityWidget from 'event-widgets/lib/ApptsAvailability/ApptsAvailabilityWidget';
import { getEventRegistrationId } from '../redux/selectors/currentRegistrant';
import { getPrimaryAndGuestSelectedSessions } from '../redux/selectors/productSelectors';
import { getAllSortedSessionsForWidget } from '../redux/selectors/productSelectors';
import { getRegCart } from '../redux/selectors/shared';
import { getIn } from 'icepick';
import { setAppointmentsAvailability } from '../redux/registrationForm/regCart/actions';

/* Returns appointments availability from reg cart */
export const getApptsAvailability = (state: $TSFixMe, eventRegistrationId: $TSFixMe): $TSFixMe => {
  const regCart = getRegCart(state);
  return getIn(regCart, ['eventRegistrations', eventRegistrationId, 'appointmentsAvailability']);
};

export default withMappedWidgetConfig(
  connect(
    (state: $TSFixMe, props: $TSFixMe) => {
      const selectedSessions = getPrimaryAndGuestSelectedSessions(state);
      const {
        event: { timezone },
        appointments: { appointmentEvent }
      } = state;
      const eventRegistrationId = getEventRegistrationId(state);
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      const sessionInfo = getAllSortedSessionsForWidget(state, 'ApptsAvailability');
      return {
        config: props.config,
        selectedSessions,
        sessionInfo,
        isGuest: true,
        timezone: state.timezones[timezone],
        apptsAvailability: getApptsAvailability(state, getEventRegistrationId(state)),
        eventRegistrationId,
        globalTheme: state.website.theme.global,
        appointmentEvent
      };
    },
    {
      onSetAppointmentsAvailability: setAppointmentsAvailability
    },
    (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
      return {
        ...ownProps,
        ...stateProps,
        onSetAppointmentsAvailability: dispatchProps.onSetAppointmentsAvailability
      };
    }
  )(ApptsAvailabilityWidget)
);
