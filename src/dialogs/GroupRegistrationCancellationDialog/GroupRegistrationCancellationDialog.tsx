import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import GroupRegistrationDialogContent from '../shared/GroupRegistrationDialogContent';

export const GroupRegistrationCancellationDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    onClose,
    registrations: { registrationsCanCancel, registrationsCannotCancel },
    translate,
    cancelRegistration,
    style,
    classes,
    contentStyle
  } = props;

  return (
    <div className={classes.attendeeSelectionDialogContainer}>
      <StandardDialog
        title={translate('EventGuestSide_GroupRegistrationCancellationModal_SelectAttendee__resx')}
        onClose={onClose}
        classes={classes}
        style={style}
      >
        <GroupRegistrationDialogContent
          registrationCanAction={registrationsCanCancel}
          registrationCannotAction={registrationsCannotCancel}
          registrationAction={cancelRegistration}
          classes={classes}
          style={contentStyle}
          instructionText={translate('EventGuestSide_GroupRegistrationCancellationModal_Instructions__resx')}
          labelText={translate('EventGuestSide_GroupRegistrationCancellationModal_CancellationNotAllowed__resx')}
          actionText={translate('EventGuestSide_GroupRegistrationCancellationModal_CancelRegistration__resx')}
          translate={translate}
        />
      </StandardDialog>
    </div>
  );
};
