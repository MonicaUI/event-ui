import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { connect } from 'react-redux';
import { canModifyRegistration } from '../utils/registrationUtils';
import { getRegCart, regCartHasGroupMembers } from '../redux/selectors/shared';
import { isAdminRegistration } from '../redux/selectors/currentRegistrant';
import { routeToPage } from '../redux/pathInfo';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { openGroupRegistrationModificationDialog } from '../dialogs/GroupRegistrationModificationDialog';

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  const regPathId = getRegistrationPathIdForWidget(state, props.id);
  const modificationDeadline = new Date(
    state.appData.registrationSettings.registrationPaths[regPathId].modification.deadline
  );
  const isVisible = canModifyRegistration(state.event, modificationDeadline);
  const regCartStatus = getRegCart(state).status;
  return {
    kind: isVisible ? 'button' : 'hidden',
    disabled: regCartStatus !== 'COMPLETED' && regCartStatus !== 'TRANSIENT' && regCartStatus !== 'INPROGRESS',
    isAdmin: isAdminRegistration(state),
    hasMultipleInvitees: regCartHasGroupMembers(state)
  };
};

const mapDispatchToProps = (dispatch: $TSFixMe) => {
  return {
    openGroupRegistrationModificationDialog: props => dispatch(openGroupRegistrationModificationDialog(props)),
    openModifyRegistration: () => dispatch(routeToPage('modifyRegistration'))
  };
};

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
  return {
    ...stateProps,
    ...ownProps,
    clickHandler: props => {
      return props.isAdmin && props.hasMultipleInvitees
        ? dispatchProps.openGroupRegistrationModificationDialog(props)
        : dispatchProps.openModifyRegistration();
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ButtonWidget);
