import ButtonWidget from 'nucleus-widgets/lib/Button/ButtonWidget';
import { connect } from 'react-redux';
import { canModifyRegistration } from '../utils/registrationUtils';
import { openConcurWarningDialog } from '../dialogs/ConcurCancellationDialog';
import { openCancelRegistrationDialog } from '../dialogs';
import { getRegCart, regCartHasGroupMembers } from '../redux/selectors/shared';
import { routeToPage } from '../redux/pathInfo';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { CANCELLATION } from '../redux/website/registrationProcesses';
import { loadRegistrationContent } from '../redux/actions';
import { currentRegistrantOrGuestsHaveConcurBookings } from '../redux/travelCart/airActuals';
import { openGroupRegistrationCancellationDialog } from '../dialogs/GroupRegistrationCancellationDialog';
import { isAdminRegistration } from '../redux/selectors/currentRegistrant';

const openConfirmationDialog = props => {
  const titleText = props.config.text.htmlContent
    ? props.config.text.htmlContent.replace(/<[^>]*>/g, '')
    : props.config.text;
  return async dispatch => {
    await dispatch(
      openCancelRegistrationDialog({
        title: titleText,
        classes: { ...props.classes },
        style: props.style
      })
    );
  };
};

const openRegistrationCancellationPage = () => routeToPage('cancelRegistration');

const openConcurConfirmationDialog = props => {
  /**
   * Classes and style in this modal are not used. If changes needed here,
   * also need to check GroupRegistrationCancellationDialog.
   */
  return dispatch => {
    dispatch(
      openConcurWarningDialog(
        {
          classes: { ...props.classes },
          style: props.style
        },
        props.translate
      )
    );
  };
};

const openCancelRegistration = props => {
  return async (dispatch, getState) => {
    await dispatch(loadRegistrationContent(CANCELLATION, getRegistrationPathIdForWidget(getState(), props.id)));
    const registrationCancellationPageId = CANCELLATION.forPathContainingWidget(props.id).startPageId(getState());
    if (registrationCancellationPageId) {
      if (currentRegistrantOrGuestsHaveConcurBookings(getState())) {
        // show concur warning to invitee before sending to cancellation page if we have concur bookings
        dispatch(openConcurConfirmationDialog({ ...props, translate: getState().text.translate }));
      } else {
        dispatch(openRegistrationCancellationPage());
      }
    } else {
      // only be used for events created before cancellation surveys were implemented
      await dispatch(openConfirmationDialog(props));
    }
  };
};

function mapStateToProps(state: $TSFixMe, props: $TSFixMe) {
  const regPathId = getRegistrationPathIdForWidget(state, props.id);
  const cancellationDeadline = new Date(
    state.appData.registrationSettings.registrationPaths[regPathId].cancellation.deadline
  );
  // Cancellation is considered as a form of modification.
  const isVisible = canModifyRegistration(state.event, cancellationDeadline);
  const regCartStatus = getRegCart(state).status;
  return {
    kind: isVisible ? 'button' : 'hidden',
    disabled: regCartStatus !== 'COMPLETED' && regCartStatus !== 'TRANSIENT' && regCartStatus !== 'INPROGRESS',
    isAdmin: isAdminRegistration(state),
    hasMultipleInvitees: regCartHasGroupMembers(state)
  };
}

const mapDispatchToProps = (dispatch: $TSFixMe) => {
  return {
    openGroupRegistrationCancellationDialog: props => dispatch(openGroupRegistrationCancellationDialog(props)),
    openCancelRegistration: props => dispatch(openCancelRegistration(props))
  };
};

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
  return {
    ...stateProps,
    ...ownProps,
    clickHandler: props => {
      return props.isAdmin && props.hasMultipleInvitees
        ? dispatchProps.openGroupRegistrationCancellationDialog(props)
        : dispatchProps.openCancelRegistration(props);
    }
  };
};

/**
 * Data wrapper for the event register now widget.
 */
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ButtonWidget);
