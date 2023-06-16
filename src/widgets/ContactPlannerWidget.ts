import { connect } from 'react-redux';
import ContactPlannerWidget from 'event-widgets/lib/ContactPlanner/ContactPlannerWidget';
import { openContactPlannerDialog } from '../dialogs';

function openDialog(buttonText, contactInfo, widgetStyles) {
  const titleText = buttonText.htmlContent ? buttonText.htmlContent.replace(/<[^>]*>/g, '') : buttonText;
  return dispatch => {
    dispatch(openContactPlannerDialog({ title: titleText }, contactInfo, widgetStyles));
  };
}
/**
 * Data wrapper for the ContactPlanner widget.
 */
export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    return {
      config: ContactPlannerWidget.getConfig(state, props.config, props.type, props.id)
    };
  },
  { onClick: openDialog }
)(ContactPlannerWidget);
