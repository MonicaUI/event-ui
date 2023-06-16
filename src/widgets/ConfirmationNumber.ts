import { connect } from 'react-redux';
import ConfirmationNumberWidget from 'event-widgets/lib/ConfirmationNumber/ConfirmationNumberWidget';
import { getConfirmationNumber } from '../redux/selectors/currentRegistrant';

/**
 * Data wrapper for the confirmation number widget.
 */
export default connect((state: $TSFixMe) => {
  return {
    confirmationNumber: getConfirmationNumber(state) || ''
  };
})(ConfirmationNumberWidget);
