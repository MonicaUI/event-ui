import { find } from 'lodash';

type ValidationMessage = {
  localizationKey: string;
};
type RegistrationForm = {
  validationMessages: Array<ValidationMessage>;
};
type State = {
  registrationForm: RegistrationForm;
};
/**
 * Determines if the mobile number's format was found to be invalid via validation message.
 */
export function hasInvalidMobilePhone(state: State): boolean {
  if (
    find(
      state.registrationForm.validationMessages,
      (validationMessage: ValidationMessage) => validationMessage.localizationKey === 'REGAPI.MOBILE_PHONE_INVALID'
    )
  ) {
    return true;
  }
  return false;
}
