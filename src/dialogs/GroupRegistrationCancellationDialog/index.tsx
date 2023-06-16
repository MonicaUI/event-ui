import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import React from 'react';
import { GroupRegistrationCancellationDialog } from './GroupRegistrationCancellationDialog';
import { routeToPage } from '../../redux/pathInfo';
import { setRegistrationIdInUserSession } from '../../redux/userSession';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import GroupRegistrationDialogStyles from '../styles/GroupRegistrationDialog.less';
import { connect } from 'react-redux';
import { getRegCart, getRegistrationPaths, shouldDisplayOnGroupRegistrationPopup } from '../../redux/selectors/shared';
import { isModifyOrCancelOpen } from '../../utils/registrationUtils';
import { createSelector } from 'reselect';
import { getNonGuestRegistrationsForDisplay } from 'event-widgets/utils/eventRegistration';
import { currentRegistrantOrGuestsHaveConcurBookings } from '../../redux/travelCart/airActuals';
import { openConcurWarningDialog } from '../ConcurCancellationDialog';
import { withStyles } from '../ThemedDialog';

const Dialog = withStyles(GroupRegistrationCancellationDialog);

const getName = eventRegistration => {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const personalInformationExists = eventRegistration.attendee && eventRegistration.attendee.personalInformation;
  const firstName =
    personalInformationExists && eventRegistration.attendee.personalInformation.firstName
      ? eventRegistration.attendee.personalInformation.firstName
      : '';
  const lastName =
    personalInformationExists && eventRegistration.attendee.personalInformation.lastName
      ? eventRegistration.attendee.personalInformation.lastName
      : '';
  return firstName + ' ' + lastName;
};

const getRegistrations = createSelector(getRegCart, getRegistrationPaths, (regCart, registrationPaths) => {
  const eventRegistrations = getNonGuestRegistrationsForDisplay(Object.values(regCart.eventRegistrations));
  const registrationsCanCancel = [];
  const registrationsCannotCancel = [];
  eventRegistrations.map(value => {
    if (shouldDisplayOnGroupRegistrationPopup(value, regCart.status)) {
      const cancellationSetting = registrationPaths[value.registrationPathId].cancellation;
      if (
        cancellationSetting &&
        isModifyOrCancelOpen(
          value,
          cancellationSetting.deadline,
          cancellationSetting.pendingEnabled,
          cancellationSetting.enabled
        )
      ) {
        registrationsCanCancel.push({
          name: getName(value),
          id: value.eventRegistrationId
        });
      } else {
        registrationsCannotCancel.push({
          name: getName(value)
        });
      }
    }
  });
  return { registrationsCanCancel, registrationsCannotCancel };
});

const openConcurConfirmationDialog = props => {
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

function cancelRegistration(registrationId, translate) {
  return async (dispatch, getState) => {
    if (registrationId) {
      await dispatch(setRegistrationIdInUserSession(registrationId));
    }
    if (currentRegistrantOrGuestsHaveConcurBookings(getState(), registrationId)) {
      /**
       * show concur warning to invitee before sending to cancellation page if
       * selected invitee has concur bookings
       */
      dispatch(openConcurConfirmationDialog({ translate }));
    } else {
      dispatch(routeToPage('cancelRegistration'));
      dispatch(closeDialogContainer());
    }
  };
}

const boundCloseDialog = () => {
  return dispatch => {
    dispatch(closeDialogContainer());
  };
};

const ConnectedGroupRegistrationCancellationDialog = connect(
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
    onCancel: cancelRegistration
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      onClose: dispatchProps.onClose,
      cancelRegistration: dispatchProps.onCancel
    };
  }
)(Dialog);

export const openGroupRegistrationCancellationDialog = (props?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const style = props && props.style;
    const dialog = (
      <ConnectedGroupRegistrationCancellationDialog
        onClose={boundCloseDialog}
        contentStyle={style}
        cancelRegistration={cancelRegistration}
        classes={GroupRegistrationDialogStyles}
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
