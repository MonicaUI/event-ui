import { defaultMemoize } from 'reselect';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { getIn } from 'icepick';

/**
 * Get validations corresponding to the validation message sent by reg api
 * @type {Function}
 */
const getStatusValidation = defaultMemoize(status => {
  switch (status) {
    case InviteeStatus.Accepted: {
      return 'Sub_accepted_validation__resx';
    }
    case InviteeStatus.PendingApproval: {
      return 'Sub_pending_validation__resx';
    }
    case InviteeStatus.DeniedApproval: {
      return 'Sub_denied_validation__resx';
    }
    case InviteeStatus.Cancelled: {
      return 'Sub_cancelled_validation__resx';
    }
    case InviteeStatus.Declined: {
      return 'Sub_declined_validation__resx';
    }
    default:
      return null;
  }
});

/**
 * Get validations corresponding to the validation message sent by reg api
 * @type {Function}
 */
const getValidationsOrNull = defaultMemoize(validation => {
  switch (validation) {
    case 'REGAPI.SUBSTITUENT_DUP_MATCH_KEY_SAME_WITH_REGISTRANT': {
      return 'Sub_reg_validation__resx';
    }
    case 'REGAPI.SUBSTITUENT_DUP_MATCH_KEY_SAME_WITH_REGISTRANT_GUEST': {
      return 'Sub_guest_validation__resx';
    }
    case 'REGAPI.SUBSITUTION_NOT_ALLOWED_IN_PRIVATE_EVENT_FOR_NEW_INVITEE': {
      return 'Sub_privacy_validation__resx';
    }
    case 'REGAPI.REGISTRANT_INFORMATION_INVALID_FOR_SUBSTITUTION': {
      return 'Sub_travel_validation__resx';
    }
    case 'REGAPI_SUBSITUTION_NOT_ALLOWED_IN_PRIVATE_LIMITED_EVENT': {
      return 'Sub_privacy_validation__resx';
    }
    case 'REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_NOT_IN_ALLOWED_DOMAINS': {
      return 'EventWidgets_SubstituteReg_DomainValidation__resx';
    }
    case 'REGAPI.SUBSITUTION_EMAIL_DOMAIN_IS_BLOCKED': {
      return 'EventWidgets_SubstituteReg_DomainValidation__resx';
    }
    case 'REGAPI.DUPLICATE_SUBSTITUTION_FOR_SUBSTITUENT': {
      return 'EventWidgets_SubstituteReg_DuplicateSubstitution__resx';
    }
    case 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED': {
      return 'EventWidgets_SubstituteReg_ConcurrentActionFailure__resx';
    }
    default:
      return null;
  }
});

/**
 * Extract validations from response if there are any
 * @param response
 * @returns {Array}
 */
export function extractValidationsFromResponse(response: $TSFixMe): $TSFixMe {
  const validationMessages = response.validationMessages || [];
  if (validationMessages && validationMessages.length > 0) {
    return validationMessages.map(validation => {
      if (validation.localizationKey === 'REGAPI.SUBSTITUENT_STATUS_NOT_ALLOWED') {
        return getStatusValidation(validation.parametersMap.status);
      }
      return getValidationsOrNull(validation.localizationKey);
    });
  }
}

/**
 * Does the response contains concurrent  action validation
 */
export function containsConcurrentActionValidation(response: $TSFixMe): $TSFixMe {
  const validationList = getIn(response, ['validationMessages']);
  if (!validationList || validationList.length === 0) {
    return false;
  }
  const concurrentActionValidation = validationList.find(
    validation =>
      validation.localizationKey === 'REGAPI.DUPLICATE_SUBSTITUTION_FOR_SUBSTITUENT' ||
      validation.localizationKey === 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED'
  );
  return concurrentActionValidation?.localizationKey?.length > 0;
}

/**
 * Does the response contains concurrent action warning
 */
export function containsConcurrentActionWarning(response: $TSFixMe): $TSFixMe {
  const validationList = getIn(response, ['validationMessages']);
  if (!validationList || validationList.length === 0) {
    return false;
  }
  const concurrentActionWarning = validationList.find(
    validation =>
      validation.severity === 'Warning' &&
      validation.localizationKey === 'REGAPI.REGAPI_CONCURRENTACTIONS_EXISTING_LOCKHOLDER'
  );
  return concurrentActionWarning?.localizationKey?.length > 0;
}

/**
 * Was cart aborted due to concurrent action
 * @param {Response} response
 * @returns boolean
 */
export function wasCartAbortedDueToConcurrentAction(response: $TSFixMe): $TSFixMe {
  const validationList = getIn(response, ['validationMessages']);
  if (!validationList || validationList.length === 0) {
    return false;
  }
  const cartAbortedValidation = validationList.find(
    validation => validation.localizationKey === 'REGAPI.SUBSITUTION_CART_CANCELLED'
  );
  return cartAbortedValidation?.localizationKey?.length > 0;
}
