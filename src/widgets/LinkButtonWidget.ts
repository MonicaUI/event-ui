import { connect } from 'react-redux';
import LinkButtonWidgetWrapper from 'event-widgets/lib/LinkButton/LinkButtonWidgetWrapper';

/**
 * Data wrapper for the LinkButton widget.
 */
export default connect(() => ({
  enableHyperlink: true
}))(LinkButtonWidgetWrapper);
