import { connect } from 'react-redux';
import InvitationForwardingWidget from 'event-widgets/lib/InvitationForwarding/InvitationForwardingWidget';
import { openInvitationForwardingDialog } from '../dialogs';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { invitationForwardingSettingsJsonPath } from '../redux/appData';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';

function clickHandler(props) {
  return dispatch => {
    dispatch(openInvitationForwardingDialog(props));
  };
}

function mapStateToProps(state: $TSFixMe, props: $TSFixMe) {
  const regPathId = getRegistrationPathIdForWidget(state, props.id);
  const invitationForwardingSettings = getJSONValue(state.appData, invitationForwardingSettingsJsonPath(regPathId));
  return {
    title: props.config.buttonText,
    invitationForwardingSettings
  };
}
/**
 * Data wrapper for the InvitationForwardingWidget.
 */
export default connect(mapStateToProps, { clickHandler })(InvitationForwardingWidget);
