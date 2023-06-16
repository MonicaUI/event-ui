import { connect } from 'react-redux';
import PlainTextWidget from 'event-widgets/lib/PlainText/PlainTextWidget';

/**
 * Data wrapper for opt out and opt in page text widget
 */
export default connect((state: $TSFixMe, props: $TSFixMe) => {
  return {
    text: props.translate(props.config.text, {
      inviteeEmail: state.optOut.inviteeEmailAddress,
      plannerFN: state.optOut.plannerFirstName,
      plannerLN: state.optOut.plannerLastName
    })
  };
})(PlainTextWidget);
