import React from 'react';
import { GroupRegistrationTypeDialog, withTextColorProperty } from './GroupRegistrationTypeDialog';
import GroupRegistrationTypeStyles from './GroupRegistrationTypeDialog.less';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withStyles } from '../ThemedDialog';
import { eventHasMultipleLanguages } from 'event-widgets/utils/multiLanguageUtils';

const Dialog = withStyles(withTextColorProperty(GroupRegistrationTypeDialog));

const boundCloseDialog = () => {
  return dispatch => {
    dispatch(closeDialogContainer());
  };
};

const mapDispatchToProps = () => {
  return (dispatch, ownProps) => {
    const actions = {
      onClose: boundCloseDialog,
      applyGroupMemberRegTypeSelection: withLoading(ownProps.applyGroupMemberRegTypeSelection)
    };
    return bindActionCreators(actions, dispatch);
  };
};

const ConnectedGroupRegistrationTypeDialog = connect(
  (state: $TSFixMe) => {
    const {
      text: { translate },
      event
    } = state;
    return {
      translate,
      hasMultiLanguage: eventHasMultipleLanguages(event)
    };
  },
  mapDispatchToProps,
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      onClose: dispatchProps.onClose,
      applyGroupMemberRegTypeSelection: dispatchProps.applyGroupMemberRegTypeSelection
    };
  }
)(Dialog);

export const openGroupRegistrationTypeDialog = (
  groupMemberVisibleRegTypes: $TSFixMe,
  regCart: $TSFixMe,
  groupMemberEventRegId: $TSFixMe,
  applyGroupMemberRegTypeSelection: $TSFixMe,
  inviteeId: $TSFixMe,
  contactId: $TSFixMe,
  regTypeHasAvailableAdmissionItemMap: $TSFixMe,
  isAdmissionItemsEnabled: $TSFixMe
) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialog = (
      <ConnectedGroupRegistrationTypeDialog
        title="EventWidgets_GroupMember_AddGroupMemberHeader__resx"
        groupMemberVisibleRegTypes={groupMemberVisibleRegTypes}
        regCart={regCart}
        groupMemberEventRegId={groupMemberEventRegId}
        applyGroupMemberRegTypeSelection={applyGroupMemberRegTypeSelection}
        inviteeId={inviteeId}
        contactId={contactId}
        regTypeHasAvailableAdmissionItemMap={regTypeHasAvailableAdmissionItemMap}
        isAdmissionItemsEnabled={isAdmissionItemsEnabled}
        classes={GroupRegistrationTypeStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: { dialogContainer: GroupRegistrationTypeStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
