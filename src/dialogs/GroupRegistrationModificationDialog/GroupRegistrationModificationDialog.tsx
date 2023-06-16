import React from 'react';
import StandardDialog from '../shared/StandardDialog';
import GroupRegistrationDialogContent from '../shared/GroupRegistrationDialogContent';

export const GroupRegistrationModificationDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    onClose,
    registrations: { registrationsCanMod, registrationsCannotMod },
    translate,
    modifyRegistration,
    style,
    classes,
    contentStyle
  } = props;

  return (
    <div className={classes.attendeeSelectionDialogContainer}>
      <StandardDialog
        title={translate('EventGuestSide_GroupRegistrationModificationModal_SelectAttendee__resx')}
        onClose={onClose}
        classes={classes}
        style={style}
      >
        <GroupRegistrationDialogContent
          registrationCanAction={registrationsCanMod}
          registrationCannotAction={registrationsCannotMod}
          registrationAction={modifyRegistration}
          classes={classes}
          style={contentStyle}
          instructionText={translate('EventGuestSide_GroupRegistrationModificationModal_Instructions__resx')}
          labelText={translate('EventGuestSide_GroupRegistrationModificationModal_ModificationNotAllowed__resx')}
          actionText={translate('EventGuestSide_GroupRegistrationModificationModal_ModifyRegistration__resx')}
        />
      </StandardDialog>
    </div>
  );
};
