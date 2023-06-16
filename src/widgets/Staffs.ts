import { connect } from 'react-redux';
import StaffsWidget from 'event-widgets/lib/Staffs/StaffsWidget';
import { getStaffList } from 'event-widgets/redux/selectors/event';

/**
 * Data wrapper for the Staff List widget
 */
export default connect((state: $TSFixMe) => {
  const {
    event: { cultureCode }
  } = state;
  return {
    getStaffList: translate => getStaffList(state.event, translate),
    cultureCode
  };
})(StaffsWidget);
