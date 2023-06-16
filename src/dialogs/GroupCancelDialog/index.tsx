import React from 'react';
import { GroupCancelDialog } from './GroupCancelDialog';
import GroupCancelRegistrationStyles from '../shared/Confirmation.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import {
  openDialogContainer,
  closeDialogContainer,
  withLoading
} from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ConfirmationStyles from '../shared/Confirmation.less';
import { withStyles } from '../ThemedDialog';

const Dialog = withStyles(GroupCancelDialog);

const boundCloseDialog = () => {
  return dispatch => dispatch(closeDialogContainer());
};

function confirmCancel(confirmHandler) {
  return () => {
    return dispatch => {
      dispatch(closeDialogContainer());
      dispatch(confirmHandler());
    };
  };
}

const ConnectDialog = connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const { ...otherDialogConfig } = props.dialogConfig;
    return {
      ...(otherDialogConfig || { title: '' }),
      translate: state.text.translate,
      title: 'EventGuestsideSite_GroupCancelDialog_Title__resx',
      useSuccessComponent: false,
      classes: { ...ConfirmationStyles },
      instructionalText: 'EventGuestsideSite_GroupCancelDialog_InstructionalText__resx'
    };
  },
  (dispatch: $TSFixMe, props: $TSFixMe) => {
    const actions = {
      requestClose: boundCloseDialog,
      confirmChoice: withLoading(confirmCancel(props.confirmHandler))
    };
    return bindActionCreators(actions, dispatch);
  }
)(Dialog);

export const openGroupCancelRegistrationDialog = (confirmHandler: $TSFixMe, openDialogConfig: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialog = <ConnectDialog dialogConfig={openDialogConfig} confirmHandler={confirmHandler} />;
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: GroupCancelRegistrationStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
