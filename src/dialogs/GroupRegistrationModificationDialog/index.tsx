import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import React from 'react';
import { GroupRegistrationModificationDialog } from './GroupRegistrationModificationDialog';
import { routeToPage } from '../../redux/pathInfo';
import { setRegistrationIdInUserSession } from '../../redux/userSession';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import GroupRegistrationDialogStyles from '../styles/GroupRegistrationDialog.less';
import { connect } from 'react-redux';
import { getRegCart, getRegistrationPaths, shouldDisplayOnGroupRegistrationPopup } from '../../redux/selectors/shared';
import { isModifyOrCancelOpen } from '../../utils/registrationUtils';
import { createSelector } from 'reselect';
import { getNonGuestRegistrationsForDisplay } from 'event-widgets/utils/eventRegistration';
import { withStyles } from '../ThemedDialog';

const Dialog = withStyles(GroupRegistrationModificationDialog);

const getRegistrations = createSelector(getRegCart, getRegistrationPaths, (regCart, registrationPaths) => {
  const eventRegistrations = getNonGuestRegistrationsForDisplay(Object.values(regCart.eventRegistrations));
  const registrationsCanMod = [];
  const registrationsCannotMod = [];
  eventRegistrations.map(value => {
    if (shouldDisplayOnGroupRegistrationPopup(value, regCart.status)) {
      const modificationSetting = registrationPaths[value.registrationPathId].modification;
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const personalInformationExists = value.attendee && value.attendee.personalInformation;
      const firstName =
        personalInformationExists && value.attendee.personalInformation.firstName
          ? value.attendee.personalInformation.firstName
          : '';
      const lastName =
        personalInformationExists && value.attendee.personalInformation.lastName
          ? value.attendee.personalInformation.lastName
          : '';
      if (
        modificationSetting &&
        isModifyOrCancelOpen(
          value,
          modificationSetting.deadline,
          modificationSetting.pendingEnabled,
          modificationSetting.enabled
        )
      ) {
        registrationsCanMod.push({
          name: firstName + ' ' + lastName,
          id: value.eventRegistrationId
        });
      } else {
        registrationsCannotMod.push({
          name: firstName + ' ' + lastName
        });
      }
    }
  });
  return { registrationsCanMod, registrationsCannotMod };
});

function modifyRegistration(registrationId) {
  return async dispatch => {
    if (registrationId) {
      await dispatch(setRegistrationIdInUserSession(registrationId));
    }
    dispatch(routeToPage('modifyRegistration'));
    await dispatch(closeDialogContainer());
  };
}

const boundCloseDialog = () => {
  return dispatch => {
    dispatch(closeDialogContainer());
  };
};

const ConnectedGroupRegistrationModificationDialog = connect(
  (state: $TSFixMe) => {
    const {
      text: { translate }
    } = state;
    return {
      translate,
      registrations: getRegistrations(state)
    };
  },
  {
    onClose: boundCloseDialog,
    onModify: modifyRegistration
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      onClose: dispatchProps.onClose,
      modifyRegistration: dispatchProps.onModify
    };
  }
)(Dialog);

export const openGroupRegistrationModificationDialog = (props?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const style = props && props.style;
    const dialog = (
      <ConnectedGroupRegistrationModificationDialog
        onClose={boundCloseDialog}
        contentStyle={style}
        classes={GroupRegistrationDialogStyles}
        modifyRegistration={modifyRegistration}
      />
    );
    return dispatch(
      openDialogContainer(dialog, () => dispatch(boundCloseDialog()), {
        classes: {
          dialogContainer: GroupRegistrationDialogStyles.dialogContainer
        },
        style: {
          dragContainer: getDialogContainerStyle(getState())
        }
      })
    );
  };
};
