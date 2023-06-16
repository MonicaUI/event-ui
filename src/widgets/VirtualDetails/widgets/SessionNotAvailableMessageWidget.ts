import { connect } from 'react-redux';
import PlainTextWidget from 'event-widgets/lib/PlainText/PlainTextWidget';

/**
 * Data wrapper for session not available message widget
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  return {
    text: props.config?.text
  };
})(PlainTextWidget);
