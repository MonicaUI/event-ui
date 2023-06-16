import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import {
  openDialogContainer,
  closeDialogContainer,
  withLoading
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import GroupMemberRemoveDialogStyles from '../shared/Confirmation.less';
import { GroupMemberRemoveDialog } from './GroupMemberRemoveDialog';
import Logger from '@cvent/nucleus-logging';
import { connect } from 'react-redux';
import { handleRegistrantRemovalInTravelCart } from '../../redux/travelCart';
import { removeGroupMembersFromRegCart } from '../../redux/registrationForm/regCart';
import ConfirmationStyles from '../shared/Confirmation.less';
import { withStyles } from '../ThemedDialog';
import { createRestoreRegTypesAction } from '../../redux/actions';

const Dialog = withStyles(GroupMemberRemoveDialog);

const LOG = new Logger('/containers/GroupMemberRemoveDialog');

const removeGroupMemberWithLoading = withLoading((eventRegistrationIdToRemove, additionalActions) => {
  return async (dispatch, getState) => {
    const {
      defaultUserSession: { eventId },
      clients: { eventSnapshotClient }
    } = getState();
    LOG.debug('Removing travel bookings of group member with id ', eventRegistrationIdToRemove);
    await dispatch(handleRegistrantRemovalInTravelCart(eventRegistrationIdToRemove));
    LOG.debug('Removing group member with id ', eventRegistrationIdToRemove);
    await dispatch(removeGroupMembersFromRegCart([eventRegistrationIdToRemove]));
    const eventSnapshot = await eventSnapshotClient.getEventSnapshot(eventId);
    dispatch(createRestoreRegTypesAction(eventSnapshot));
    if (additionalActions && typeof additionalActions === 'function') {
      await dispatch(additionalActions());
    }
    dispatch(closeDialogContainer());
  };
});

const ConnectedDialog = connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const { ...otherDialogConfig } = props.dialogConfig;
    const eventRegId = props.eventRegId;
    return {
      ...otherDialogConfig,
      title: 'EventGuestSide_RemoveGroupMemberModal_Title__resx',
      translate: state.text.translate,
      useSuccessComponent: false,
      classes: { ...ConfirmationStyles },
      instructionalText: 'EventGuestSide_RemoveGroupMemberModal_InstructionalText__resx',
      eventRegId: { eventRegId }
    };
  },
  {
    requestClose: closeDialogContainer,
    removeGroupMemberWithLoading
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      confirmChoice: dispatchProps.removeGroupMemberWithLoading.bind(
        null,
        ownProps.eventRegId,
        ownProps.additionalActions
      )
    };
  }
)(Dialog);

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

export const openGroupMemberRemoveDialog = (eventRegId: $TSFixMe, additionalActions?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    LOG.debug('Requested to remove group member with id', eventRegId);
    const dialogConfig = {
      style: getState().website.theme.global
    };
    const dialog = (
      <ConnectedDialog dialogConfig={dialogConfig} eventRegId={eventRegId} additionalActions={additionalActions} />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: GroupMemberRemoveDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
