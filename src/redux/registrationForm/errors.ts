import {
  CALCULATE_PRICING_FAILURE,
  CREATE_REG_CART_FAILURE,
  FINALIZE_CHECKOUT_FAILURE,
  START_MODIFICATION_FAILURE,
  UPDATE_REG_CART_FAILURE,
  UPDATE_REG_CART_FAILURE_FOR_GUEST,
  ADD_GROUP_MEMBER_FAILURE,
  INITIATE_WAITLIST_REGISTRATION_FAILURE,
  START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE
} from './regCart/actionTypes';
import { getDefaultRegistrationPath } from 'event-widgets/redux/selectors/appData';
import { get, every } from 'lodash';
import { redirectToExternalAuth, redirectToOAuth } from '../pathInfo';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { accessRulesJsonPath } from 'event-widgets/utils/registrationPath';
import { PRIVATE_ALL_TARGETED_LISTS, PRIVATE_LIMITED_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import { getIn } from 'icepick';
import { getAllHotelRoomBookings } from '../travelCart/selectors';
import { isPasskeyEnabled } from '../selectors/event';
import { ProductType } from 'event-widgets/utils/ProductType';
import { AttendingFormat, shouldHybridFlowWork } from 'event-widgets/utils/AttendingFormatUtils';
import { Error } from '../types';

const PAYMENT_STATUS_FAILED = 'PaymentFailed';
const REGCART_PROCESSING_VALIDATION = 'REGAPI.REGCART_PROCESSING';
const REGCART_CANCELLED = 'REGAPI.REGCART_CANCELLED';
const REGAPI_CONCURRENTACTIONS_EXISTING_LOCKHOLDER = 'REGAPI.REGAPI_CONCURRENTACTIONS_EXISTING_LOCKHOLDER';
const REGCART_STATUS_NOT_IN_PROGRESS = 'REGAPI.REGCART_STATUS_NOT_IN_PROGRESS';
const REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED = 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED';

export const SEVERITY = {
  Info: 'Info',
  Warning: 'Warning',
  Error: 'Error'
};

export const SEVERITY_ORDER_MAP = {
  [SEVERITY.Info]: 1,
  [SEVERITY.Warning]: 2,
  [SEVERITY.Error]: 3
};

/**
 * Compare validation messages by severity (in descending order).
 * @param val1 validationMessage
 * @param val2 validationMessage
 * @returns {number}
 */
const validationSeverityCompareDesc = (val1, val2) =>
  (SEVERITY_ORDER_MAP[val2?.severity] || 0) - (SEVERITY_ORDER_MAP[val1?.severity] || 0);

export const getValidations = (response: $TSFixMe, validationCode: $TSFixMe, parameters?: $TSFixMe): $TSFixMe => {
  return get(response, 'validationMessages', []).filter(validation => {
    return (
      validation.localizationKey === validationCode &&
      (!parameters || every(parameters, (parameter, key) => validation.parametersMap[key] === parameter))
    );
  });
};

/**
 * Determines if the response has the given validation with the specified parameters.
 */
const responseHasValidation = (response, validationCode, parameters?) => {
  return getValidations(response, validationCode, parameters).length > 0;
};

/**
 * Determines if the errors has the given validation with the specified parameters.
 */
const hasValidation = (error, validationCode, parameters?) => {
  return responseHasValidation(get(error, 'responseBody', undefined), validationCode, parameters);
};

const isPrivateEvent = (error: $TSFixMe): $TSFixMe => {
  return (
    hasValidation(error, 'REGAPI.EMAIL_ONLY_INVITEE') ||
    hasValidation(error, 'REGAPI.ATTENDEE_NOT_IN_ANY_TARGET_LIST') ||
    hasValidation(error, 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST') ||
    hasValidation(error, 'REGAPI.EVENT_TO_EVENT_PREREQUISITE_FAILED') ||
    hasValidation(error, 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED')
  );
};

/**
 * returns true if createRegCart call throws the validation: EVENT_ATTENDING_FORMAT_SWITCH_IN_PROGRESS
 * The validation will be thrown, when planner has initiated event attending format switch as no new registrations
 * are allowed until attending format switch is completed.
 */
const isEventAttendingFormatSwitchInProgress = (error: $TSFixMe): $TSFixMe => {
  return hasValidation(error, 'REGAPI.EVENT_ATTENDING_FORMAT_SWITCH_IN_PROGRESS');
};

const isAttendeeNotAllowedByCustomLogic = (error?: $TSFixMe): $TSFixMe => {
  return hasValidation(error, 'REGAPI.ATTENDEE_ASSIGNED_NOT_ALLOWED_REG_TYPE');
};

const isTransactionInProcessingError = (error: $TSFixMe): $TSFixMe => {
  return hasValidation(error, 'REGAPI.REGMOD_INVITEE_TRANSACTION_IN_PROCESSING');
};

const isRegTypeInvalidForEvent = (error: $TSFixMe): $TSFixMe => {
  return hasValidation(error, 'REGAPI.REGTYPE_INVALID_FOR_EVENT');
};

const isRegTypeInvalidForGroup = (error: string): unknown => {
  return hasValidation(error, 'REGAPI.REGTYPE_INVALID_FOR_GROUP_SETTINGS');
};

// eslint-disable-next-line complexity
export const getKnownErrorOrNull = (localizationKey: $TSFixMe): $TSFixMe => {
  switch (localizationKey) {
    case 'REGAPI.INVALID_INVITEES_STATUS_DECLINED':
      return 'EventGuestSide_DeclineRegistration_InviteeStatusInvalid_SubMessage__resx';
    case 'REGAPI.REGAPI_VOUCHER_CODE_REQUIRED':
      return 'EventGuestside_ApiError_VoucherCodeRequired__resx';
    case 'REGAPI.IDENTITY_SOURCE_ID_MODIFIED':
      return 'EventGuestside_ApiError_SourceIdModified__resx';
    case 'REGAPI.IDENTITY_EMAIL_MODIFIED':
      return 'EventGuestside_ApiError_EmailModified__resx';
    case 'REGAPI.ID_CONFIRMATION_CONTACT_IDENTIFICATION_EXCEPTION':
      return 'EventGuestside_ApiError_ContactNotFound__resx';
    case 'REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH':
      return 'EventGuestside_ApiError_SourceIdNoMatch__resx';
    case 'REGAPI.ID_CONFIRMATION_SOURCE_ID_MULTIPLE_MATCHED':
      return 'EventGuestside_ApiError_SourceIdMultipleMatches__resx';
    case 'REGAPI.ID_CONFIRMATION_SOURCE_ID_INCONSISTENT_MATCH':
      return 'EventGuestside_ApiError_SourceIdInconsistentMatch__resx';
    case 'REGAPI.DUP_MATCH_KEY_VIOLATION':
      return 'EventGuestside_ApiError_DuplicateMatchKey__resx';
    case 'REGAPI.CHANGED_ID_CONFIRMATION_FIELDS':
      return 'EventGuestside_ApiError_ChangedIdConfirmation__resx';
    case 'REGAPI.FIELD_VALIDATION_ERROR_EMAIL_FORMAT':
    case 'QUESTION.INVALID_EMAIL':
    case 'REGAPI.ADMIN_EMAIL_FORMAT_INVALID':
    case 'REGAPI.ADMIN_EMAIL_DOMAIN_NOT_ALLOWED':
      return 'EventWidgets_Validations_EmailAddressFormat__resx';
    case 'REGAPI.DISCOUNT_INVALID':
      return 'EventWidgets_Validations_DiscountCodeInvalid__resx';
    case 'REGAPI.DISCOUNT_NONSTACKABLE':
      return 'EventWidgets_Validations_DiscountCodeNotStackable__resx';
    case 'REGAPI.DISCOUNT_NOT_APPLICABLE':
      return 'EventWidgets_Validations_DiscountCodeNotApplicable__resx';
    case 'REGAPI.DISCOUNT_ALREADY_APPLIED':
      return 'EventWidgets_Validations_DiscountCodeAlreadyApplied__resx';
    case 'REGAPI.ID_CONFIRMATION_SOURCE_ID_EMAIL_MISMATCH':
      return 'EventGuestside_ApiError_SourceIdEmailIdMismatch__resx';
    case 'REGAPI.REGMOD_PAST_MODIFICATION_DATE':
      return 'EventGuestSide_ApiError_RegModPastModificationDate__resx';
    case 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION':
      return 'AlreadyRegistered_validation__resx';
    case 'REGAPI.REGAPI.REGMOD_INVITEE_STATUS_INVALID':
      return 'EventGuestside_ApiError_RegModInviteeStatusInvalid__resx';
    case 'REGAPI.ATTENDEE_REQUIRED_FIELD_MISSING':
    case 'REGAPI.REGTYPE_MISSING':
    case 'REGAPI.ATTENDEE_QUESTION_MISSING':
    case 'REGAPI.IDENTITY_SOURCE_ID_MISSING':
      return 'EventGuestside_ApiError_RequiredFieldMissing__resx';
    case 'REGAPI.ADMIN_IDENTITY_EMAIL_USED_BY_ATTENDEE':
      return 'EventGuestSide_AdminEmailExist_ErrorMessage__resx';
    case 'REGAPI.REGTYPE_INVALID_FOR_EVENT':
      return 'EventGuestSide_RegistrationTypeConflict_Title_resx';
    case 'QUESTION.INVALID_CHOICE':
      return 'EventGuestSide_InvalidQuestion_Choice__resx';
    case 'REGAPI.REGCART_CANCELLED':
    case 'REGAPI.REGMOD_CHECKED_OUT_DEQUEUE_IN_PROCESS':
    case 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED':
      return 'EventGuestSide_CurrentOperationCanceled_ConcurrentAction__resx';
    case 'REGAPI.MIN_GUEST_LIMIT_SUBCEEDED':
      return 'EventGuestSide_MinGuestValidation_SubmitRequestButton__resx';
    default:
      return null;
  }
};

/**
 * Given the list of validation messages, returns the first known corresponding resource key.
 * Prioritizes messages with higher severity.
 * @param validationMessages {Object[]}
 * @returns {string | *}
 */
export const findKnownErrorResourceKey = (validationMessages: $TSFixMe): $TSFixMe => {
  return [...validationMessages]
    .sort(validationSeverityCompareDesc)
    .map(validationMessage => getKnownErrorOrNull(validationMessage.localizationKey))
    .find(x => x);
};

export const getDeclineErrors = {
  isInviteeDeclined(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.INVALID_INVITEES_STATUS_DECLINED', { inviteeStatus: 'Declined' });
  },
  isInviteeRegistered(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.INVALID_INVITEES_STATUS_DECLINED', { inviteeStatus: 'Accepted' }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', { inviteeStatus: 'Accepted' }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', {
        inviteeStatus: 'PendingApproval'
      }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', { inviteeStatus: 'DeniedApproval' })
    );
  },
  isInviteeStatusInvalid(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.INVALID_INVITEES_STATUS_DECLINED');
  },
  isPrivateRegistrationPath(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.REGAPI_PRIVATE_REGISTRATION_PATH_DECLINE') ||
      hasValidation(error, 'REGAPI.ATTENDEE_NOT_IN_ANY_TARGET_LIST') ||
      hasValidation(error, 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST') ||
      hasValidation(error, 'REGAPI.PRIVACY_SETTINGS_REGISTRATION_NOT_ALLOWED')
    );
  }
};
export const getRegisterErrors = {
  isInviteeRegistered(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', { inviteeStatus: 'Accepted' }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', {
        inviteeStatus: 'PendingApproval'
      }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', { inviteeStatus: 'DeniedApproval' })
    );
  },
  isRegistrationClosed(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE') ||
      hasValidation(error, 'REGAPI.PRODUCT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE') ||
      hasValidation(error, 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE')
    );
  },
  isRegTypeInvalidForEvent,
  hasExternalAuthenticationEnabled(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.EXTERNAL_AUTH');
  },
  isValidEmailDomainForAdmin(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.ADMIN_EMAIL_DOMAIN_NOT_ALLOWED');
  },
  hasOAuthEnabled(error?: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.OAUTH');
  },
  isEventClosed(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION_INVITEE_STATUS')
    );
  },
  isEventTemporaryClosed(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.EVENT_TEMPORARY_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.EVENT_STATUS_WAITLIST_NOT_ALLOWED')
    );
  },
  isCapacityFull(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE');
  },
  isInviteeAlreadyWaitlistedForClosedEvent: (error: $TSFixMe): $TSFixMe => {
    return (
      hasValidation(error, 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION_INVITEE_STATUS', { inviteeStatus: 'WaitListed' }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION', { inviteeStatus: 'WaitListed' }) ||
      hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_WAITLIST', { inviteeStatus: 'WaitListed' })
    );
  },
  isSourceIdNoMatch(error?: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH');
  },
  isPrivateEvent,
  isAttendeeNotAllowedByCustomLogic,
  isEventAttendingFormatSwitchInProgress
};

export const travelCartErrors = {
  getInvalidHotelRoomBookings(state: $TSFixMe, error: $TSFixMe): $TSFixMe {
    const invalidRoomBookingIds = getValidations(
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      error.responseBody && error.responseBody.validationResult,
      'TRAVEL_API.ROOM_TYPE_NOT_AVAILABLE'
    )
      .filter(validation => validation.parametersMap && validation.parametersMap.bookingType === 'Room')
      .map(validation => validation.parametersMap.childBookingId);

    const travelCart = getIn(state, ['travelCart', 'cart']);
    const hotelRoomBookings = getAllHotelRoomBookings(travelCart);

    const invalidBookings = [];
    if (!isPasskeyEnabled(state) && hotelRoomBookings) {
      hotelRoomBookings.forEach(hotelRoomBooking => {
        if (invalidRoomBookingIds.includes(hotelRoomBooking.id)) {
          invalidBookings.push(hotelRoomBooking);
        }
      });
    }
    return invalidBookings;
  }
};

export const productErrors = {
  getInvalidSessionIds(error: $TSFixMe): $TSFixMe {
    return getValidations(error.responseBody, 'REGAPI.PRODUCT_NOT_AVAILABLE')
      .filter(validation => validation.parametersMap && validation.parametersMap.productType === 'Session')
      .map(validation => validation.parametersMap.productId);
  },
  isAdmissionItemInvalid(error: $TSFixMe): $TSFixMe {
    const validations = getValidations(error.responseBody, 'REGAPI.PRODUCT_NOT_AVAILABLE').filter(
      validation => validation.parametersMap && validation.parametersMap.productType === 'AdmissionItem'
    );
    return validations.length > 0;
  },
  isGroupRegistrationNotAllowed(error: $TSFixMe): $TSFixMe {
    const validations = getValidations(error.responseBody, 'REGAPI.GROUP_REGISTRATION_NOT_ALLOWED');
    return validations && validations.length > 0;
  },
  getInvalidQuanityItemIds(error: $TSFixMe): $TSFixMe {
    return getValidations(error.responseBody, 'REGAPI.PRODUCT_NOT_AVAILABLE')
      .filter(validation => validation.parametersMap && validation.parametersMap.productType === 'QuantityItem')
      .map(validation => validation.parametersMap.productId);
  },
  getInvalidDonationItemIds(error: $TSFixMe): $TSFixMe {
    return getValidations(error.responseBody, 'REGAPI.PRODUCT_NOT_AVAILABLE')
      .filter(validation => validation.parametersMap && validation.parametersMap.productType === 'DonationItem')
      .map(validation => validation.parametersMap.productId);
  }
};

export const getUpdateErrors = {
  isPrivateEvent,
  isAttendeeNotAllowedByCustomLogic,
  isRegTypeInvalidForEvent,
  isRegTypeInvalidForGroup,
  isInviteeNotFound(error: $TSFixMe): $TSFixMe {
    return error.responseStatus === 404;
  },
  handleAuthError(
    error: $TSFixMe,
    account: $TSFixMe,
    event: $TSFixMe,
    regTypeStub: $TSFixMe,
    regPathStub: $TSFixMe
  ): $TSFixMe {
    let authErrorFound = false;
    if (hasValidation(error, 'REGAPI.EXTERNAL_AUTH')) {
      authErrorFound = true;
      redirectToExternalAuth(event, account);
    }
    if (hasValidation(error, 'REGAPI.OAUTH')) {
      authErrorFound = true;
      redirectToOAuth(event, account, regTypeStub, regPathStub);
    }
    return authErrorFound;
  },
  isCartBeingProcessed(error: $TSFixMe): $TSFixMe {
    return error?.responseBody && error.responseStatus === 422 && hasValidation(error, REGCART_PROCESSING_VALIDATION);
  },
  existingLockholder(error: $TSFixMe): $TSFixMe {
    return (
      error?.responseBody &&
      error.responseStatus === 422 &&
      hasValidation(error, REGAPI_CONCURRENTACTIONS_EXISTING_LOCKHOLDER)
    );
  },
  isCartCancelled(error: $TSFixMe): $TSFixMe {
    return error?.responseBody && hasValidation(error, REGCART_CANCELLED);
  },
  acquiringLockFailed(error: $TSFixMe): $TSFixMe {
    return (
      error?.responseBody &&
      error.responseStatus === 422 &&
      hasValidation(error, REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED)
    );
  },
  isCartStatusNotInProgress(error: $TSFixMe): $TSFixMe {
    return error?.responseBody && error.responseStatus === 422 && hasValidation(error, REGCART_STATUS_NOT_IN_PROGRESS);
  },
  // eslint-disable-next-line complexity
  isKnownError(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.IDENTITY_SOURCE_ID_MODIFIED') ||
      hasValidation(error, 'REGAPI.IDENTITY_EMAIL_MODIFIED') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_CONTACT_IDENTIFICATION_EXCEPTION') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_SOURCE_ID_NO_MATCH') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_SOURCE_ID_MULTIPLE_MATCHED') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_SOURCE_ID_INCONSISTENT_MATCH') ||
      hasValidation(error, 'REGAPI.DUP_MATCH_KEY_VIOLATION') ||
      hasValidation(error, 'REGAPI.CHANGED_ID_CONFIRMATION_FIELDS') ||
      hasValidation(error, 'REGAPI.FIELD_VALIDATION_ERROR_EMAIL_FORMAT') ||
      hasValidation(error, 'QUESTION.INVALID_EMAIL') ||
      hasValidation(error, 'REGAPI.DISCOUNT_INVALID') ||
      hasValidation(error, 'REGAPI.DISCOUNT_NONSTACKABLE') ||
      hasValidation(error, 'REGAPI.DISCOUNT_NOT_APPLICABLE') ||
      hasValidation(error, 'REGAPI.DISCOUNT_ALREADY_APPLIED') ||
      hasValidation(error, 'REGAPI.ADMIN_EMAIL_FORMAT_INVALID') ||
      hasValidation(error, 'REGAPI.ADMIN_EMAIL_DOMAIN_NOT_ALLOWED') ||
      hasValidation(error, 'REGAPI.SESSION_GROUP_SESSION_MISSING') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_SOURCE_ID_EMAIL_MISMATCH') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION') ||
      hasValidation(error, 'REGAPI.APPOINTMENTS_INTEREST_MIN_MAX_SELECTIONS') ||
      hasValidation(error, 'REGAPI.APPOINTMENTS_INTEREST_MIN_SELECTIONS') ||
      hasValidation(error, 'REGAPI.APPOINTMENTS_INTEREST_MAX_SELECTIONS') ||
      hasValidation(error, 'REGAPI.ADMIN_IDENTITY_EMAIL_USED_BY_ATTENDEE') ||
      hasValidation(error, 'QUESTION.INVALID_CHOICE') ||
      hasValidation(error, 'REGAPI.INVALID_INVITEES_STATUS_DECLINED', { inviteeStatus: 'Cancelled' })
    );
  },
  isGuestEmailIdInvalid(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.FIELD_VALIDATION_ERROR_EMAIL_FORMAT');
  },
  isInviteeAlreadyRegistered(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION');
  },
  isRegistrantAlreadyAddedAsGuest(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION');
  },
  isDuplicateInvitee(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.DUPLICATE_INVITEE');
  },
  isPaymentProcessingError(error: $TSFixMe): $TSFixMe {
    const response = get(error, 'responseBody', undefined);
    const statusCode = get(error, 'responseBody.statusCode', undefined);
    return (
      response &&
      statusCode &&
      statusCode === 'INPROGRESS' &&
      response.paymentInfo.paymentStatus === PAYMENT_STATUS_FAILED
    );
  },
  isProductAvailabilityError(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.PRODUCT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE') ||
      hasValidation(error, 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE')
    );
  },
  isProductAvailabilityErrorInHybridEvent(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE') ||
      hasValidation(error, 'REGAPI.PRODUCT_NOT_AVAILABLE')
    );
  },
  isGuestProductAvailabilityError(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.PRODUCT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE') ||
      hasValidation(error, 'REGAPI.PRODUCT_NOT_AVAILABLE')
    );
  },
  isVoucherAvailabilityError(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.REGAPI_VOUCHER_CAPACITY_UNAVAILABLE');
  },
  isAdmissionItemsNotAvailableForRegTypeError(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE');
  },
  isAddGroupMemberNotAvailableError(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.PRODUCT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE') ||
      hasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE') ||
      hasValidation(error, 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.EVENT_TEMPORARY_NOT_OPEN_FOR_REGISTRATION')
    );
  },
  isCustomFieldAnswerInvalidError(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.CUSTOM_FIELD_ANSWER_INVALID_DUE_TO_LOGIC');
  },
  getCustomFieldAnswerInvalidErrors(error: $TSFixMe): $TSFixMe {
    return getValidations(error.responseBody, 'REGAPI.CUSTOM_FIELD_ANSWER_INVALID_DUE_TO_LOGIC').filter(validation => {
      return validation.parametersMap.customField;
    });
  },
  isEventClosed(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION') ||
      hasValidation(error, 'REGAPI.EVENT_NOT_OPEN_FOR_REGISTRATION_INVITEE_STATUS')
    );
  },
  isVoucherCodeMissing(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.EVENT_VOUCHER_CODE_MISSING');
  },
  isVoucherCodeInvalid(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.EVENT_VOUCHER_CODE_INVALID');
  },
  isEventOpenForWaitlist: (error: $TSFixMe): $TSFixMe => {
    return hasValidation(error, 'REGAPI.OPEN_EVENT_WAITLIST_NOT_ALLOWED');
  },
  isSessionOverlapError: (error: $TSFixMe): $TSFixMe => {
    return hasValidation(error, 'REGAPI.SESSIONS_OVERLAP');
  },
  hasRegTypeCapacityError: (error: $TSFixMe): $TSFixMe => {
    return hasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE', { entityType: 'ContactType' });
  },
  isDiscountCapacityInsufficient: (error: $TSFixMe): $TSFixMe => {
    return hasValidation(error, 'REGAPI.DISCOUNT_CAPACITY_INSUFFICIENT');
  },
  isEventTemporaryClosed(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.EVENT_TEMPORARY_NOT_OPEN_FOR_REGISTRATION');
  },
  isErrorThatPreventsRegistration(error: $TSFixMe): $TSFixMe {
    return hasValidation(error, 'REGAPI.FIELD_VALIDATION_ERROR_LENGTH_RESTRICTED');
  },
  getRegTypeConflictSessionBundleParams(error: $TSFixMe): $TSFixMe {
    return getValidations(error.responseBody, 'REGAPI.PRODUCT_REGTYPE_CONFLICT')
      .filter(
        validation => validation.parametersMap && validation.parametersMap.productType === ProductType.SESSION_BUNDLE
      )
      .map(validation => {
        return validation.parametersMap;
      });
  }
};

export const getRestoreErrors = {
  isRegCartIdConflict(error: $TSFixMe): $TSFixMe {
    return error.responseStatus === 409;
  },
  partialRegCartNotFound(error: $TSFixMe): $TSFixMe {
    return error.responseStatus === 404;
  },
  invalidEmailInPartial(error: $TSFixMe): $TSFixMe {
    return error.responseStatus === 422 && hasValidation(error, 'REGAPI.FIELD_VALIDATION_ERROR_EMAIL_FORMAT');
  }
};

export const getUpdateResponseValidations = {
  isPrivateEvent(response: $TSFixMe): $TSFixMe {
    return (
      responseHasValidation(response, 'REGAPI.EMAIL_ONLY_INVITEE') ||
      responseHasValidation(response, 'REGAPI.ATTENDEE_NOT_IN_ANY_TARGET_LIST') ||
      responseHasValidation(response, 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST') ||
      responseHasValidation(response, 'REGAPI.EVENT_TO_EVENT_PREREQUISITE_FAILED') ||
      responseHasValidation(response, 'REGAPI.ATTENDEE_ASSIGNED_NOT_ALLOWED_REG_TYPE')
    );
  },
  isAttendeeNotAllowedByCustomLogic(response: $TSFixMe): $TSFixMe {
    return responseHasValidation(response, 'REGAPI.ATTENDEE_ASSIGNED_NOT_ALLOWED_REG_TYPE');
  },
  isAdminEmailUsedByAttendee(response: $TSFixMe): $TSFixMe {
    return responseHasValidation(response, 'REGAPI.ADMIN_IDENTITY_EMAIL_USED_BY_ATTENDEE');
  },
  isProductReachCapacity(error: $TSFixMe): $TSFixMe {
    return responseHasValidation(error, 'REGAPI.CAPACITY_UNAVAILABLE');
  }
};

export const getCheckoutErrors = {
  admissionItemMissing: (error: $TSFixMe): $TSFixMe => hasValidation(error, 'REGAPI.ADMISSION_ITEM_EXACTLY_ONE'),
  isKnownError: (error: $TSFixMe): $TSFixMe => {
    return (
      hasValidation(error, 'REGAPI.REGAPI_VOUCHER_CODE_REQUIRED') ||
      hasValidation(error, 'REGAPI.REGAPI.REGMOD_INVITEE_STATUS_INVALID') ||
      hasValidation(error, 'REGAPI.ATTENDEE_REQUIRED_FIELD_MISSING') ||
      hasValidation(error, 'REGAPI.REGTYPE_MISSING') ||
      hasValidation(error, 'REGAPI.ATTENDEE_QUESTION_MISSING') ||
      hasValidation(error, 'REGAPI.IDENTITY_SOURCE_ID_MISSING') ||
      hasValidation(error, 'REGAPI.MIN_GUEST_LIMIT_SUBCEEDED')
    );
  },
  hasPaymentCreditsError: (error: $TSFixMe): $TSFixMe => {
    // check if any error related to payment credits is present
    return (
      hasValidation(error, 'REGAPI.CONTACT_PAYMENT_CREDIT_MISMATCH') ||
      hasValidation(error, 'REGAPI.CONTACT_PAYMENT_CREDIT_DEFICIT') ||
      hasValidation(error, 'REGAPI.REGAPI_CONTACT_PAYMENT_CREDIT_LOCK_EXISTS') ||
      hasValidation(error, 'REGAPI.REGAPI_CONTACT_PAYMENT_CREDIT_LOCK_ACQUISITION_FAILED')
    );
  },
  isPrivateEvent,
  isAttendeeNotAllowedByCustomLogic
};

export const getModErrors = {
  isKnownError(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.REGMOD_PAST_MODIFICATION_DATE') ||
      hasValidation(error, 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION') ||
      hasValidation(error, 'REGAPI.REGMOD_CHECKED_OUT_DEQUEUE_IN_PROCESS') ||
      hasValidation(error, 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED')
    );
  },
  isTransactionInProcessingError
};

export const getModAndCancelErrors = {
  isKnownError(error: $TSFixMe): $TSFixMe {
    return (
      hasValidation(error, 'REGAPI.REGMOD_CHECKED_OUT_DEQUEUE_IN_PROCESS') ||
      hasValidation(error, 'REGAPI.REGAPI_ACQUIRING_CONCURRENTACTIONS_LOCK_FAILED')
    );
  }
};

export const getCancelErrors = {
  isTransactionInProcessingError
};

export const getGeneralErrors = {
  isGeneralValidationFailure(error: $TSFixMe): $TSFixMe {
    return error.responseBody.statusCode === 422;
  }
};

export default function reducer(state = {}, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case ADD_GROUP_MEMBER_FAILURE:
    case CREATE_REG_CART_FAILURE:
    case UPDATE_REG_CART_FAILURE:
    case UPDATE_REG_CART_FAILURE_FOR_GUEST:
    case FINALIZE_CHECKOUT_FAILURE:
    case CALCULATE_PRICING_FAILURE:
    case START_MODIFICATION_FAILURE:
    case INITIATE_WAITLIST_REGISTRATION_FAILURE:
    case START_WAITLIST_REGISTRATION_CHECKOUT_FAILURE:
      return {
        type: action.type,
        error: action.payload.error
      };
    default:
      return state;
  }
}

export function isExcludedByPrivacySettings(error: $TSFixMe, state: $TSFixMe): $TSFixMe {
  if (!error.responseBody) {
    return false;
  }
  if (getUpdateErrors.isInviteeNotFound(error)) {
    const regPathId = getDefaultRegistrationPath(state.appData).id;
    const invitationListAccess = regPathId
      ? getJSONValue(state.appData, accessRulesJsonPath(regPathId, 'invitationListAccess'))
      : null;
    return (
      invitationListAccess &&
      (invitationListAccess.type === PRIVATE_ALL_TARGETED_LISTS ||
        invitationListAccess.type === PRIVATE_LIMITED_TARGETED_LISTS)
    );
  }
  return getUpdateErrors.isPrivateEvent(error);
}

export function isProductCapacityReached(error: Error, attendingFormat = AttendingFormat.INPERSON): boolean {
  return (
    getUpdateErrors.isProductAvailabilityError(error) ||
    (shouldHybridFlowWork(attendingFormat) && getUpdateErrors.isProductAvailabilityErrorInHybridEvent(error))
  );
}
