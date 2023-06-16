import { connect } from 'react-redux';
import PlainTextWidget from 'event-widgets/lib/PlainText/PlainTextWidget';

/**
 * Data wrapper for unsubscribe and subscribe page text widget
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const unsubscribeStatus = state.unsubscribe && state.unsubscribe.unsubscribeStatus;
  return {
    text: unsubscribeStatus ? props.config.text : props.config.alternateText
  };
})(PlainTextWidget);
