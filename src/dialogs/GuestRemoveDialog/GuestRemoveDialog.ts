import { connect } from 'react-redux';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import ConfirmationStyles from '../shared/Confirmation.less';
import Logger from '@cvent/nucleus-logging';
import { handleRegistrantRemovalInTravelCart } from '../../redux/travelCart';
import { updateGuestsInRegCart, removeGuestByEventRegistrationId } from '../../redux/registrationForm/regCart';
import { withStyles } from '../ThemedDialog';

const LOG = new Logger('/components/GuestRemoveDialog');

export const removeGuestWithLoading = withLoading(eventRegistrationIdToRemove => {
  return async (dispatch, getState) => {
    LOG.debug('Removing travel bookings of guest with id ', eventRegistrationIdToRemove);
    await dispatch(handleRegistrantRemovalInTravelCart(eventRegistrationIdToRemove));
    LOG.debug('Removing guest with id ', eventRegistrationIdToRemove);
    const {
      registrationForm: { regCart }
    } = getState();
    const updatedRegCart = await removeGuestByEventRegistrationId(regCart, eventRegistrationIdToRemove);
    LOG.debug('Regcart after guest removal', updatedRegCart);
    await dispatch(updateGuestsInRegCart(updatedRegCart));
    dispatch(closeDialogContainer());
  };
});

const Dialog = withStyles(ConfirmationDialog);

export default connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const eventRegId = props.eventRegId;
    return {
      ...props.dialogConfig,
      title: 'EventGuestsideSite_RemoveGuestDialog_Title__resx',
      translate: state.text.translate,
      useSuccessComponent: false,
      instructionalText: 'EventGuestsideSite_RemoveGuestDialog_InstructionalText__resx',
      eventRegId: { eventRegId },
      classes: ConfirmationStyles
    };
  },
  {
    requestClose: closeDialogContainer,
    removeGuestWithLoading
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      confirmChoice: dispatchProps.removeGuestWithLoading.bind(null, ownProps.eventRegId)
    };
  }
)(Dialog);
