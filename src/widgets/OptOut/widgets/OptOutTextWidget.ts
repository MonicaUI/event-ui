import { connect } from 'react-redux';
import PlainTextWidget from 'event-widgets/lib/PlainText/PlainTextWidget';

/**
 * Data wrapper for opt out and opt in page text widget
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const optOutStatus = state.optOut && state.optOut.optOutStatus;
  return {
    text: optOutStatus ? props.config.text : props.config.alternateText
  };
})(PlainTextWidget);
