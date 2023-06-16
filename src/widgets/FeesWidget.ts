import { connect } from 'react-redux';
import FeesWidget from 'event-widgets/lib/FeesWidget/FeesWidget';
import { openFeeRefundPolicyDialog } from '../dialogs';

/**
 * Data wrapper for the Fees widget.
 */

function clickHandler(props) {
  return dispatch => {
    dispatch(openFeeRefundPolicyDialog(props));
  };
}

function mapStateToProps(state: $TSFixMe) {
  const translateCurrency = state.text.resolver.currency;
  const eventFees = state.eventFees || {};
  const translate = state.text.translate;
  const eventCurrencyCode = state.event.eventCurrencySnapshot.isoAlphabeticCode;
  const eventTimeZone = state.timezones[state.event.timezone];

  return {
    translateCurrency,
    eventFees,
    translate,
    eventCurrencyCode,
    eventTimeZone
  };
}
export default connect(mapStateToProps, { clickHandler })(FeesWidget);
