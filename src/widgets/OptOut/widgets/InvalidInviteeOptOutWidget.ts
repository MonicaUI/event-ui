import { connect } from 'react-redux';
import PlainTextWidget from 'event-widgets/lib/PlainText/PlainTextWidget';

/**
 * Data wrapper for invalid invitee opt out page text widget
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  return {
    text: props.config.text
  };
})(PlainTextWidget);
