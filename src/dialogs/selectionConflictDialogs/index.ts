import { lazyLoadAction } from '../../utils/lazyLoad';
/**
 * Provides the necessary validations of selected products when a new Registration Type or Admission
 * item is selected. Dialogs for managing invalid products are also provided for each of these
 * changes.
 */
export {
  validateUserRegistrationTypeSelection,
  validateAdmissionItemChange,
  validateContactCustomFieldChoiceChange,
  regTypeCapacityFull,
  getIdConfirmationValidationsFromCartError
} from './validations';

export const handleRegistrationTypeSelectionConflict = lazyLoadAction(() =>
  // eslint-disable-next-line import/no-cycle
  import(
    /* webpackChunkName: "registrationTypeSelectionConflictDialog" */ './RegistrationTypeSelectionConflictDialog'
  ).then(m => m.handleRegistrationTypeSelectionConflict)
);

export const handleRegTypeConflictFromServiceValidationResult = lazyLoadAction(() =>
  // eslint-disable-next-line import/no-cycle
  import(
    /* webpackChunkName: "registrationTypeSelectionConflictDialog" */ './RegistrationTypeSelectionConflictDialog'
  ).then(m => m.handleRegTypeConflictFromServiceValidationResult)
);

export const openAdmissionItemSelectionConflictDialog = lazyLoadAction(() =>
  // eslint-disable-next-line import/no-cycle
  import(/* webpackChunkName: "admissionItemSelectionConflictDialog" */ './AdmissionItemSelectionConflictDialog').then(
    m => m.openAdmissionItemSelectionConflictDialog
  )
);

export const openIdConfirmationConflictDialog = lazyLoadAction(() =>
  // eslint-disable-next-line import/no-cycle
  import(/* webpackChunkName: "idConfirmationConflictDialog" */ './IdConfirmationConflictDialog').then(
    m => m.openIdConfirmationConflictDialog
  )
);

export const openContactCustomFieldChoiceSelectionConflictDialog = lazyLoadAction(() =>
  import(
    /* webpackChunkName: "customContactFieldChoiceSelectionConflictDialog" */
    './CustomContactFieldChoiceSelectionConflictDialog'
  ).then(m => m.openContactCustomFieldChoiceSelectionConflictDialog)
);

export const openGuestNavigationConflictDialog = lazyLoadAction(() =>
  import(/* webpackChunkName: "guestNavigationConflictDialog" */ './GuestNavigationConflictDialog').then(
    m => m.openGuestNavigationConflictDialog
  )
);
