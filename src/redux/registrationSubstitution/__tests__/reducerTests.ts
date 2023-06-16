/* global */
import reducer, {
  disableSubmitButton,
  initialState,
  setSubstitutionCart,
  showCartAbortedMessage,
  setSubstituteRegistrantFields,
  resetSubstituteRegistration,
  setValidationMessage,
  setConfirmationAccepted,
  setConfirmationDenied,
  setShowConfirmationMessage,
  turnOnAutoFocus,
  substituteRegistrationError,
  substituteRegistrationSuccess,
  hideConcurrentActionPopupMessage,
  showConcurrentActionPopupMessage
} from '../reducer';

const FIRST_LAST_EMAIL = 'FIRST_LAST_EMAIL';

describe('Test Reducer :', () => {
  const state = initialState;
  let newState = state;
  test('Verifying initial state.', () => {
    expect(reducer(undefined, {})).toMatchSnapshot();
  });
  test('Verifying turnOnAutoFocus', () => {
    newState = reducer(newState, turnOnAutoFocus());
    expect(newState.autoFocus).toBeTruthy();
  });
  test('verifying setSubstituteRegistrantFields and setSubstitutionCart', () => {
    const cart = {
      substituentInformation: {
        firstName: 'firstName1',
        lastName: 'lastName1',
        emailAddress: 'emailAddress1'
      }
    };
    newState = reducer(newState, setSubstituteRegistrantFields('firstName', 'firstName'));
    newState = reducer(newState, setSubstituteRegistrantFields('lastName', 'lastName'));
    newState = reducer(newState, setSubstituteRegistrantFields('emailAddress', 'emailAddress'));
    expect(newState.substitutionForm.firstName).toEqual('firstName');
    expect(newState.substitutionForm.lastName).toEqual('lastName');
    expect(newState.substitutionForm.emailAddress).toEqual('emailAddress');

    newState = reducer(newState, setSubstitutionCart(cart));
    expect(newState.substitutionForm.firstName).toEqual(cart.substituentInformation.firstName);
    expect(newState.substitutionForm.lastName).toEqual(cart.substituentInformation.lastName);
    expect(newState.substitutionForm.emailAddress).toEqual(cart.substituentInformation.emailAddress);
    expect(newState.substitutionCart).toEqual(cart);

    newState = reducer(newState, disableSubmitButton());
    newState = reducer(newState, setSubstituteRegistrantFields('firstName', 'firstName'));
    expect(newState.disableSubmitButton).toBeTruthy();
    newState = reducer(newState, setSubstituteRegistrantFields('emailAddress', 'emailAddress1'));
    expect(newState.disableSubmitButton).toBeTruthy();
    newState = reducer(newState, setSubstituteRegistrantFields('emailAddress', 'emailAddress2'));
    expect(newState.disableSubmitButton).toBeFalsy();

    newState = reducer(newState, disableSubmitButton());
    newState = reducer(newState, setSubstituteRegistrantFields('firstName', 'firstName'), FIRST_LAST_EMAIL);
    expect(newState.disableSubmitButton).toBeTruthy();
    newState = reducer(newState, setSubstituteRegistrantFields('lastName', 'firstName1'), FIRST_LAST_EMAIL);
    expect(newState.disableSubmitButton).toBeFalsy();
  });
  test('verifying setValidationMessage when validated', () => {
    newState = reducer(newState, setValidationMessage(['Validation']));
    expect(newState.validationList).toStrictEqual(['Validation']);
  });
  test('verifying setShowConfirmationMessage', () => {
    newState = reducer(newState, setShowConfirmationMessage({ substitutionCartId: 'substitutionCartId' }));
    expect(newState.validationList).toBe(null);
    expect(newState.substitutionCart).toStrictEqual({ substitutionCartId: 'substitutionCartId' });
    expect(newState.showConfirmationMessage).toBeTruthy();
  });
  test('verifying setConfirmationDenied', () => {
    newState = reducer(newState, setConfirmationDenied());
    expect(newState.validationList).toBe(null);
    expect(newState.showConfirmationMessage).toBeFalsy();
  });
  test('verifying setConfirmationAccepted', () => {
    newState = reducer(newState, setConfirmationAccepted());
    expect(newState.hasConfirmed).toBeTruthy();
  });
  test('verifying substituteRegistrationSuccess', () => {
    newState = reducer(newState, substituteRegistrationSuccess());
    expect(newState.substituteRegistrationSuccess).toBeTruthy();
    expect(newState.originalSubstitutionCart).toEqual(null);
  });
  test('verifying substituteRegistrationError', () => {
    newState = reducer(newState, substituteRegistrationError());
    expect(newState.substituteRegistrationError).toBeTruthy();
    expect(newState.showConcurrentActionMessage).toBeFalsy();
    expect(newState.cartAborted).toBeFalsy();
  });
  test('verifying resetSubstituteRegistration', () => {
    newState = reducer(newState, resetSubstituteRegistration());
    expect(newState).toEqual(state);
  });
  test('verifying cartAborted', () => {
    newState = reducer(newState, showCartAbortedMessage());
    expect(newState.cartAborted).toBeTruthy();
  });
  test('verifying showConcurrentActionMessage', () => {
    const cart = {
      substituentInformation: {
        firstName: 'firstName1',
        lastName: 'lastName1',
        emailAddress: 'emailAddress1'
      }
    };
    newState = reducer(newState, showConcurrentActionPopupMessage(cart));
    expect(newState.showConcurrentActionMessage).toBeTruthy();
    expect(newState.originalSubstitutionCart).toEqual(cart);
  });
  test('verifying showSubstitutionForm', () => {
    newState = reducer(newState, hideConcurrentActionPopupMessage());
    expect(newState.showConcurrentActionMessage).toBeFalsy();
    expect(newState.originalSubstitutionCart).toEqual(null);
  });
});
