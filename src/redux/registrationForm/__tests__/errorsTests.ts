import {
  findKnownErrorResourceKey,
  getKnownErrorOrNull,
  getUpdateErrors,
  getRegisterErrors,
  getDeclineErrors
} from '../errors';
import validationResponse from './fixtures/validationErrorResponse.json';

describe('registrationForm_errors', () => {
  test('findKnownErrorResourceKey prioritizes errors over warnings', () => {
    const resKey = findKnownErrorResourceKey(validationResponse.validationMessages);
    expect(resKey).toEqual('AlreadyRegistered_validation__resx');
  });

  test('check registration error for any known errors and find resx associated to known error', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: "Matching invitee's Status {{inviteeStatus}} is not valid for declining.",
            localizationKey: 'REGAPI.INVALID_INVITEES_STATUS_DECLINED',
            parametersMap: {
              inviteeStatus: 'Cancelled'
            },
            subValidationMessageList: []
          }
        ],
        httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
      }
    };
    const isKnownError = getUpdateErrors.isKnownError(error);
    const knownErrorResourceKey = getKnownErrorOrNull(error.responseBody.validationMessages[0].localizationKey);
    expect(isKnownError).toEqual(true);
    expect(knownErrorResourceKey).toEqual('EventGuestSide_DeclineRegistration_InviteeStatusInvalid_SubMessage__resx');
  });
});

describe('Check no invalid SourceID', () => {
  test('getRegisterErrors does not throw SourceID Error when no invalid SourceID', () => {
    const errors = getRegisterErrors;
    expect(errors.isSourceIdNoMatch()).toEqual(false);
  });
});

describe('Check error is thrown on Invalid SourceID', () => {
  test('getRegisterErrors throws SourceID error on invalid SourceID', () => {
    const errors = findKnownErrorResourceKey([{ localizationKey: 'REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH' }]);
    expect(errors).toEqual('EventGuestside_ApiError_SourceIdNoMatch__resx');
  });
});

describe('Check that OAuth is Enabled', () => {
  test('getRegisterErrors throws hasOAuthEnabled error if not enabled', () => {
    const errors = getRegisterErrors;
    expect(errors.hasOAuthEnabled()).toEqual(false);
  });
});

describe('Check isPrivateRegistrationPath for getDeclineErrors', () => {
  test('isPrivateRegistrationPath includes REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED', () => {
    const errors = getDeclineErrors;
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage:
              'Privacy Settings have been configured such that {{eventRegistrationId}} is not allowed to register',
            localizationKey: 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED',
            parametersMap: {
              eventRegistrationId: 'fc5f151f-f1ce-4c7f-a227-72744dbf952d'
            },
            subValidationMessageList: []
          }
        ],
        httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
      }
    };
    expect(errors.isPrivateRegistrationPath(error)).toEqual(true);
  });
});
