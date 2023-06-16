import { connect } from 'react-redux';
import EventVoucherWidget from 'event-widgets/lib/EventVoucher/EventVoucherWidget';
import {
  getVoucherCode,
  getEventRegistrationId,
  isRegistrationModification,
  getAttendeeRegistrationStatus
} from '../redux/selectors/currentRegistrant';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { updateEventVoucher } from '../redux/registrationForm/regCart/actions';
/**
 * Data wrapper for the Event Vouchers widget.
 */
export default connect(
  (state: $TSFixMe) => {
    const eventRegistrationId = getEventRegistrationId(state);
    const voucherCode = getVoucherCode(state, eventRegistrationId);
    const isRegMod = isRegistrationModification(state);
    const isRegistered = getAttendeeRegistrationStatus(state, eventRegistrationId) != null;
    return {
      hidden: isRegMod && isRegistered,
      required: !state.defaultUserSession.isPlanner,
      eventRegistrationId,
      value: voucherCode
    };
  },
  {
    onVoucherCodeUpdate: withLoading(updateEventVoucher)
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      onVoucherCodeUpdate: dispatchProps.onVoucherCodeUpdate.bind(null, stateProps.eventRegistrationId)
    };
  }
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof EventVoucherWidget' is no... Remove this comment to see the full error message
)(EventVoucherWidget);
