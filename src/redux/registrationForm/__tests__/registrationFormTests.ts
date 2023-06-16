import errorsReducer, {
  getDeclineErrors,
  getUpdateErrors,
  getKnownErrorOrNull,
  getUpdateResponseValidations,
  isExcludedByPrivacySettings
} from '../errors';
import regCartPaymentReducer from '../regCartPayment/reducer';
import {
  setSelectedPaymentMethod,
  setCreditCardField,
  setPaymentOfflineAdditionalDetails
} from '../regCartPayment/actions';
import { CREATE_REG_CART_FAILURE, SET_REG_CART_PAYMENT_FIELD_VALUE } from '../regCart/actionTypes';
import { PRIVATE_ALL_TARGETED_LISTS } from 'event-widgets/clients/RegistrationPathType';
import { LOG_OUT_REGISTRANT_SUCCESS } from '../../registrantLogin/actionTypes';
import { setIn } from 'icepick';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';

describe('check registration for private event error', () => {
  const appData = {
    registrationSettings: {
      registrationPaths: {
        '02ecb4d5-ea33-4044-9d10-51eb65b1e78a': {
          id: '02ecb4d5-ea33-4044-9d10-51eb65b1e78a',
          accessRules: {
            invitationListAccess: {
              type: PRIVATE_ALL_TARGETED_LISTS,
              allowedInvitationListIds: [],
              isEmailOnlyInvite: true,
              allowedInvitationListsIds: []
            }
          },
          isDefault: true
        }
      }
    }
  };
  test('when unknown invitee registers for email invitation and the event website option events', () => {
    const response = {
      validationMessages: [
        {
          severity: 'Warning',
          unLocalizedInternalMessage: 'Attendee not in any TargetList for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.ATTENDEE_NOT_IN_ANY_TARGET_LIST',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        },
        {
          severity: 'Warning',
          unLocalizedInternalMessage:
            'Registrant must have one and only one admission item for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.ADMISSION_ITEM_EXACTLY_ONE',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        }
      ]
    };
    const isPrivateEventWarning = getUpdateResponseValidations.isPrivateEvent(response);
    expect(isPrivateEventWarning).toMatchSnapshot();
  });

  test('when unknown invitee in a specific target list tries to registers with different target list', () => {
    const response = {
      validationMessages: [
        {
          severity: 'Warning',
          unLocalizedInternalMessage: 'Attendee not in a TargetList for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.ATTENDEE_NOT_IN_SPECIFIC_TARGET_LIST',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        },
        {
          severity: 'Warning',
          unLocalizedInternalMessage:
            'Registrant must have one and only one admission item for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.ADMISSION_ITEM_EXACTLY_ONE',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        }
      ]
    };
    const isPrivateEventWarning = getUpdateResponseValidations.isPrivateEvent(response);
    expect(isPrivateEventWarning).toMatchSnapshot();
  });

  test('when unknown invitee registers for email invitation only events', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Event {{eventId}} only allows registration via email link.',
            localizationKey: 'REGAPI.EMAIL_ONLY_INVITEE',
            parametersMap: {
              eventId: '35d1aea9-b4ed-4582-854c-6fff39ecbbfe'
            },
            subValidationMessageList: []
          }
        ]
      }
    };
    const isPrivateEventError = isExcludedByPrivacySettings(error, { appData });
    expect(isPrivateEventError).toMatchSnapshot();
  });

  test('when invitee was registered and then removed from email list for email invitation only event', () => {
    const error = {
      responseStatus: 404,
      responseBody: {
        message: "Invitee record can't be found"
      },
      message: 'Error creating reg cart from link',
      httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)',
      stack: 'Error creating reg cart from link'
    };

    const isPrivateEventWhenInviteeNotFound = isExcludedByPrivacySettings(error, { appData });
    expect(isPrivateEventWhenInviteeNotFound).toMatchSnapshot();
  });

  test('when known invitee registers for private event', () => {
    const response = {
      validationMessages: [
        {
          severity: 'Warning',
          unLocalizedInternalMessage:
            'Registrant must have one and only one admission item for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.ADMISSION_ITEM_EXACTLY_ONE',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        }
      ]
    };
    const isPrivateEventWarning = getUpdateResponseValidations.isPrivateEvent(response);
    expect(isPrivateEventWarning).toMatchSnapshot();
  });
});

describe('check registration for private event error 1', () => {
  test('when invitee registers for event and is not allowed by custom logic', () => {
    const response = {
      validationMessages: [
        {
          severity: 'Warning',
          unLocalizedInternalMessage:
            'Attendee assigned Not Allowed registration type through custom logic for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.ATTENDEE_ASSIGNED_NOT_ALLOWED_REG_TYPE',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        }
      ]
    };
    const isPrivateEventWarning = getUpdateResponseValidations.isAttendeeNotAllowedByCustomLogic(response);
    expect(isPrivateEventWarning).toMatchSnapshot();
  });
});

describe('check registration for admin attendee email error', () => {
  test('when invitee registers for event using a source id, and admin has same email', () => {
    const response = {
      validationMessages: [
        {
          severity: 'Warning',
          unLocalizedInternalMessage: 'Registrants and admins cannot have the same email address.',
          localizationKey: 'REGAPI.ADMIN_IDENTITY_EMAIL_USED_BY_ATTENDEE',
          parametersMap: {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001'
          },
          subValidationMessageList: []
        }
      ]
    };
    const isAdminEmailUsedByAttendeeWarning = getUpdateResponseValidations.isAdminEmailUsedByAttendee(response);
    expect(isAdminEmailUsedByAttendeeWarning).toMatchSnapshot();
  });
});

test('check registration for payment processing error', () => {
  const error = {
    responseStatus: 200,
    responseBody: {
      statusCode: 'INPROGRESS',
      message: 'This reg cart is currently in progress, and has not yet been processed.',
      paymentInfo: {
        ignoreTaxes: false,
        ignoreServiceFee: false,
        paymentRedirectRequired: false,
        paymentStatus: 'PaymentFailed',
        paymentResultCode: 'OtherError',
        paymentStatusDetail: 'TransactionState: SaleFailed, ResultCode: OtherError, Message: Wrong expiration'
      },
      httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
    }
  };
  const paymentProcessingError = getUpdateErrors.isPaymentProcessingError(error);
  expect(paymentProcessingError).toMatchSnapshot();
});

test('check registration error for invitee already registered error', () => {
  const error = {
    responseStatus: 422,
    responseBody: {
      validationMessages: [
        {
          severity: 'Error',
          unLocalizedInternalMessage: "Matching invitee's Status {{inviteeStatus}} is not valid for registration.",
          localizationKey: 'REGAPI.INVALID_EXISTING_INVITEES_STATUS_REGISTRATION',
          parametersMap: {
            inviteeStatus: 'Accepted'
          },
          subValidationMessageList: []
        }
      ],
      httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
    }
  };
  const isInviteeAlreadyRegistered = getUpdateErrors.isInviteeAlreadyRegistered(error);
  expect(isInviteeAlreadyRegistered).toMatchSnapshot();
});

test('check registration error for registrant already added as guest in event error', () => {
  const error = {
    responseStatus: 422,
    responseBody: {
      validationMessages: [
        {
          severity: 'Error',
          unLocalizedInternalMessage: '{{guestIdentificationResultMessage}}.',
          localizationKey: 'REGAPI.ID_CONFIRMATION_GUEST_IDENTIFICATION_EXCEPTION',
          parametersMap: {
            inviteeStatus: 'Accepted'
          },
          subValidationMessageList: []
        }
      ],
      httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
    }
  };
  const isRegistrantAlreadyAddedAsGuest = getUpdateErrors.isRegistrantAlreadyAddedAsGuest(error);
  expect(isRegistrantAlreadyAddedAsGuest).toMatchSnapshot();
});

test('check registration error for duplicate invitee in cart', () => {
  const error = {
    responseStatus: 422,
    responseBody: {
      validationMessages: [
        {
          severity: 'Error',
          unLocalizedInternalMessage:
            'Invitee for EventRegistration {{eventRegistrationId}} is duplicated in the regcart',
          localizationKey: 'REGAPI.DUPLICATE_INVITEE',
          parametersMap: {
            eventRegistrationId: '64a7bdef-4582-4031-ad8e-e2e4225465cd'
          },
          subValidationMessageList: []
        }
      ],
      httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
      errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
    }
  };
  const isDuplicateInvitee = getUpdateErrors.isDuplicateInvitee(error);
  expect(isDuplicateInvitee).toMatchSnapshot();
});

test('check registration error for any known errors', () => {
  const error = {
    responseStatus: 422,
    responseBody: {
      validationMessages: [
        {
          severity: 'Error',
          unLocalizedInternalMessage:
            'Cannot update email during registration modification. Email updated for EventRegistration {{eventRegistrationId}}.',
          localizationKey: 'REGAPI.CHANGED_ID_CONFIRMATION_FIELDS',
          parametersMap: {
            eventRegistrationId: '89f1cc01-104f-4ebb-bc12-ee3b439206e2'
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
  expect(isKnownError).toMatchSnapshot();
  expect(knownErrorResourceKey).toMatchSnapshot();
});

describe('check registraton for decline errors', () => {
  test('when invitee is already registered', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: "Matching invitee's Status {{inviteeStatus}} is not valid for declining",
            localizationKey: 'REGAPI.INVALID_INVITEES_STATUS_DECLINED',
            parametersMap: {
              inviteeStatus: 'Accepted'
            },
            subValidationMessageList: []
          }
        ],
        httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
      }
    };
    const isDeclineError = getDeclineErrors.isInviteeRegistered(error);
    expect(isDeclineError).toMatchSnapshot();
  });

  test('when invitee is already declined', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: "Matching invitee's Status {{inviteeStatus}} is not valid for declining",
            localizationKey: 'REGAPI.INVALID_INVITEES_STATUS_DECLINED',
            parametersMap: {
              inviteeStatus: 'Declined'
            },
            subValidationMessageList: []
          }
        ],
        httpLogRequestId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        httpLogPageLoadId: '90f6b10e-294d-4c26-b20c-684c8cbe4c94',
        errorDateTime: 'Fri Jun 02 2017 10:51:36 GMT-0400 (EDT)'
      }
    };
    const isDeclineError = getDeclineErrors.isInviteeDeclined(error);
    expect(isDeclineError).toMatchSnapshot();
  });
});

test('set reg cart payment fields for credit card', () => {
  expect(setSelectedPaymentMethod('creditCard')).toMatchSnapshot();
  // eslint-disable-next-line jest/valid-expect
  expect(setCreditCardField('cVV', '123'));
});

test('set reg cart payment fields for offline payment', () => {
  expect(setPaymentOfflineAdditionalDetails('path', 'additional details')).toMatchSnapshot();
});

describe('testing reducers', () => {
  test('error failure sets the errors', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Event {{eventId}} only allows registration via email link.',
            localizationKey: 'REGAPI.EMAIL_ONLY_INVITEE',
            parametersMap: {
              eventId: '35d1aea9-b4ed-4582-854c-6fff39ecbbfe'
            },
            subValidationMessageList: []
          }
        ]
      }
    };
    expect(errorsReducer({}, { type: CREATE_REG_CART_FAILURE, payload: { error } })).toMatchSnapshot();
  });

  test('SET_REG_CART_PAYMENT_FIELD_VALUE setting reg cart payment field value', () => {
    const initialRegCartPayment = setIn(
      regCartPaymentReducer(undefined, {}),
      ['pricingInfo', 'creditCard', 'expirationMonth'],
      '6'
    );
    expect(
      regCartPaymentReducer(initialRegCartPayment, {
        type: SET_REG_CART_PAYMENT_FIELD_VALUE,
        payload: { path: 'path', value: '123' }
      })
    ).toMatchSnapshot();
  });

  test('LOG_OUT_REGISTRANT_SUCCESS setting payment to default payment values', () => {
    const initialRegCartPayment = {
      selectedPaymentMethod: 'creditCard',
      pricingInfo: {
        creditCard: {
          paymentMethodKey: 'creditCard',
          paymentType: PAYMENT_TYPE.ONLINE,
          paymentMethodType: 'Visa',
          number: '4111111111111111',
          name: 'ak',
          cVV: '123',
          expirationMonth: '7',
          expirationYear: '2017',
          address1: '1965 Us road',
          address2: '',
          address3: '',
          country: 'US',
          city: 'Mclean',
          state: 'VA',
          zip: '22012'
        }
      }
    };
    expect(
      setIn(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ selectedPaymentMethod: string;... Remove this comment to see the full error message
        regCartPaymentReducer(initialRegCartPayment, { type: LOG_OUT_REGISTRANT_SUCCESS }),
        ['pricingInfo', 'creditCard', 'expirationMonth'],
        '6'
      )
    ).toMatchSnapshot();
  });
});

describe('check registraton for add group member errors', () => {
  test('when event capacity is reached', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Event capacity is reached',
            localizationKey: 'REGAPI.CAPACITY_UNAVAILABLE',
            subValidationMessageList: []
          }
        ]
      }
    };
    const isAddGroupMemberNotAvailableError = getUpdateErrors.isAddGroupMemberNotAvailableError(error);
    expect(isAddGroupMemberNotAvailableError).toMatchSnapshot();
  });

  test('when no admission item associated with regtype', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Event capacity is reached',
            localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE',
            subValidationMessageList: []
          }
        ]
      }
    };
    const isAdmissionItemsNotAvailableForRegTypeError =
      getUpdateErrors.isAdmissionItemsNotAvailableForRegTypeError(error);
    expect(isAdmissionItemsNotAvailableForRegTypeError).toMatchSnapshot();
  });

  test('when selecting session with no admission item available', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Event capacity is reached',
            localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE_FOR_REGTYPE',
            subValidationMessageList: []
          }
        ]
      }
    };
    const isSelectSessionWhenNoAdmissionItemAvailable = getUpdateErrors.isProductAvailabilityError(error);
    expect(isSelectSessionWhenNoAdmissionItemAvailable).toBe(true);
  });

  test('when admission item capacity is reached', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Event capacity is reached',
            localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE',
            subValidationMessageList: []
          }
        ]
      }
    };
    const isAddGroupMemberNotAvailableError = getUpdateErrors.isAddGroupMemberNotAvailableError(error);
    expect(isAddGroupMemberNotAvailableError).toMatchSnapshot();
  });

  test('when product(admission item/ session) is closed', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage:
              'Product not available for registration for EventRegistration of RegistrationType regTypeId',
            localizationKey: 'REGAPI.PRODUCT_NOT_AVAILABLE',
            subValidationMessageList: []
          },
          {
            severity: 'Error',
            unLocalizedInternalMessage:
              'Capacity not available for any admission item for registration for EventRegistration',
            localizationKey: 'REGAPI.REGAPI_ADMISSION_CAPACITY_NOT_AVAILABLE',
            subValidationMessageList: []
          }
        ]
      }
    };
    const isProductNotAvailableError = getUpdateErrors.isProductAvailabilityErrorInHybridEvent(error);
    expect(isProductNotAvailableError).toBeTruthy();
  });
});

describe('check discount capacity insufficient error', () => {
  test('when discount capacity is reached', () => {
    const error = {
      responseStatus: 422,
      responseBody: {
        validationMessages: [
          {
            severity: 'Error',
            unLocalizedInternalMessage: 'Discount capacity is reached',
            localizationKey: 'REGAPI.DISCOUNT_CAPACITY_INSUFFICIENT',
            subValidationMessageList: []
          }
        ]
      }
    };
    const isDiscountCapacityInsufficient = getUpdateErrors.isDiscountCapacityInsufficient(error);
    expect(isDiscountCapacityInsufficient).toMatchSnapshot();
  });
});
