import { hasInvalidMobilePhone } from '../infoValidations';

describe('getInvalidPhoneValidationMessage', () => {
  test('message exists', () => {
    const message = [
      {
        severity: 'Info',
        unLocalizedInternalMessage:
          'Invalid format of mobile number provided for EventRegistration {{eventRegistrationID}}.',
        localizationKey: 'REGAPI.MOBILE_PHONE_INVALID',
        parametersMap: {
          eventRegistrationID: '00000000-0000-0000-0000-000000000001'
        },
        subValidationMessageList: []
      }
    ];
    const state = {
      registrationForm: {
        validationMessages: message
      }
    };

    const resp = hasInvalidMobilePhone(state);
    expect(resp).toBeTruthy();
  });
  test("message doesn't exist", () => {
    const message = [];
    const state = {
      registrationForm: {
        validationMessages: message
      }
    };
    const resp = hasInvalidMobilePhone(state);
    expect(resp).toBeFalsy();
  });
});
