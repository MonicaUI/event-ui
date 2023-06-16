/* global */
import { extractValidationsFromResponse } from '../errors';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';

const setValidationInResponse = (validation, inviteeStatus?) => {
  const response = {
    substitutionCart: {},
    validationMessages: [
      {
        localizationKey: validation
      }
    ]
  };
  if (validation === 'REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED' && inviteeStatus) {
    return {
      ...response,
      validationMessages: [
        {
          localizationKey: validation,
          parametersMap: {
            status: inviteeStatus
          }
        }
      ]
    };
  }
  return response;
};

describe('Test extractValidationsFromResponse method when', () => {
  const response = {
    validationMessages: [],
    substitutionCart: {}
  };
  test('No validation is present', () => {
    expect(extractValidationsFromResponse(response)).toStrictEqual(undefined);
  });

  describe('Substituent status is', () => {
    test('Accepted', () => {
      expect(
        extractValidationsFromResponse(
          setValidationInResponse('REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED', InviteeStatus.Accepted)
        )
      ).toStrictEqual(['Sub_accepted_validation__resx']);
    });

    test('PendingApproval', () => {
      expect(
        extractValidationsFromResponse(
          setValidationInResponse('REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED', InviteeStatus.PendingApproval)
        )
      ).toStrictEqual(['Sub_pending_validation__resx']);
    });

    test('DeniedApproval', () => {
      expect(
        extractValidationsFromResponse(
          setValidationInResponse('REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED', InviteeStatus.DeniedApproval)
        )
      ).toStrictEqual(['Sub_denied_validation__resx']);
    });

    test('Cancelled', () => {
      expect(
        extractValidationsFromResponse(
          setValidationInResponse('REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED', InviteeStatus.Cancelled)
        )
      ).toStrictEqual(['Sub_cancelled_validation__resx']);
    });

    test('Declined', () => {
      expect(
        extractValidationsFromResponse(
          setValidationInResponse('REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED', InviteeStatus.Declined)
        )
      ).toStrictEqual(['Sub_declined_validation__resx']);
    });
  });

  test('Substituent Dup Match Key same with Registrant', () => {
    expect(
      extractValidationsFromResponse(setValidationInResponse('REGAPI.SUBSTITUENT_DUP_MATCH_KEY_SAME_WITH_REGISTRANT'))
    ).toStrictEqual(['Sub_reg_validation__resx']);
  });

  test("Substituent Dup Match Key same with Registrant's Guest", () => {
    expect(
      extractValidationsFromResponse(
        setValidationInResponse('REGAPI.SUBSTITUENT_DUP_MATCH_KEY_SAME_WITH_REGISTRANT_GUEST')
      )
    ).toStrictEqual(['Sub_guest_validation__resx']);
  });

  test('Substituent is not a part of private event', () => {
    expect(
      extractValidationsFromResponse(
        setValidationInResponse('REGAPI.SUBSITUTION_NOT_ALLOWED_IN_PRIVATE_EVENT_FOR_NEW_INVITEE')
      )
    ).toStrictEqual(['Sub_privacy_validation__resx']);
  });

  test('Registrant has travel', () => {
    expect(
      extractValidationsFromResponse(setValidationInResponse('REGAPI.REGISTRANT_INFORMATION_INVALID_FOR_SUBSTITUTION'))
    ).toStrictEqual(['Sub_travel_validation__resx']);
  });

  test('Substituent is not a part of private limited event', () => {
    expect(
      extractValidationsFromResponse(setValidationInResponse('REGAPI_SUBSITUTION_NOT_ALLOWED_IN_PRIVATE_LIMITED_EVENT'))
    ).toStrictEqual(['Sub_privacy_validation__resx']);
  });

  test('Substituent email domain is not allowed', () => {
    expect(
      extractValidationsFromResponse(
        setValidationInResponse('REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_NOT_IN_ALLOWED_DOMAINS')
      )
    ).toStrictEqual(['EventWidgets_SubstituteReg_DomainValidation__resx']);
  });

  test('Substituent email domain is blocked', () => {
    expect(
      extractValidationsFromResponse(setValidationInResponse('REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_BLOCKED'))
    ).toStrictEqual(['EventWidgets_SubstituteReg_DomainValidation__resx']);
  });

  test('Duplicate substitution for Substituent', () => {
    expect(
      extractValidationsFromResponse(setValidationInResponse('REGAPI.DUPLICATE_SUBSTITUTION_FOR_SUBSTITUENT'))
    ).toStrictEqual(['EventWidgets_SubstituteReg_DuplicateSubstitution__resx']);
  });
});
