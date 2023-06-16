import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID, SESSION_HEADER_USER_TYPE } from '@cvent/event-ui-networking';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';
import { mapToArray, arrayToMap } from 'nucleus-widgets/utils/arrayToMap';
import calculateInitiateRegModPercentComplete from './calculateInitiateRegModPercentComplete';

import Logger from '@cvent/nucleus-logging';
import { ServiceError } from '@cvent/event-ui-networking';
const LOG = new Logger('RegCartClient');
const EMPTY_ANSWERS = Object.freeze([]);

function isAnswered(answer) {
  return answer && (typeof answer.toJSON !== 'function' || answer.toJSON());
}

/**
 * Checks for any improper or unanswered answer objects. For example,
 * if it is a text answer, it must have a populated text field.
 */
function isValidAnswerFormat(answer) {
  return answer && (answer.answerType !== 'Text' || answer?.text);
}

/**
 * FLEX-67135: Encodes urls in event answers from regcart to pass WAF
 * @returns event answers with encoded urls
 */
function encodeEventAnswers(eventAnswers) {
  if (eventAnswers.length > 0) {
    return eventAnswers.map(eventAnswer => {
      return {
        ...eventAnswer,
        answers:
          eventAnswer?.answers?.filter(isValidAnswerFormat).length > 0
            ? eventAnswer.answers.map(answer => {
                return {
                  ...answer,
                  ...(answer?.uRL && {
                    uRL: encodeURIComponent(answer.uRL)
                  })
                };
              })
            : EMPTY_ANSWERS // store [] answers in database
      };
    });
  }
  return eventAnswers;
}

/**
 * FLEX-67135: Encodes image's source url in profile image answer from regcart to pass WAF
 * @returns profile image answer with encoded urls
 */
function encodeProfileImageAnswer(profileImage) {
  return {
    ...profileImage,
    ...(profileImage?.imageUri && {
      imageUri: encodeURIComponent(profileImage.imageUri)
    })
  };
}

/**
 * Function to convert some maps to arrays in the reg cart
 */
export function convertRegCart(regCart: $TSFixMe): $TSFixMe {
  return {
    ...regCart,
    eventRegistrations: mapToArray(regCart.eventRegistrations, (erId, er) => ({
      ...er,
      attendee: {
        ...er.attendee,
        eventAnswers: encodeEventAnswers(
          mapToArray(er.attendee.eventAnswers)
            .filter(isAnswered)
            .map(answer => (typeof answer.toJSON === 'function' && answer.toJSON() ? answer.toJSON() : answer))
        ),
        personalInformation: {
          ...er.attendee.personalInformation,
          ...(er.attendee.personalInformation?.profileImage && {
            profileImage: encodeProfileImageAnswer(er.attendee.personalInformation.profileImage)
          }),
          customFields: mapToArray(er.attendee.personalInformation.customFields).filter(isAnswered)
        }
      }
    }))
  };
}

/**
 * Function to convert api response reg cart back to application's format
 */
function convertRegCartResponse(regCart) {
  return {
    ...regCart,
    eventRegistrations: arrayToMap(
      regCart.eventRegistrations,
      er => er.eventRegistrationId,
      er => ({
        ...er,
        attendee: {
          ...er.attendee,
          eventAnswers: arrayToMap(er.attendee.eventAnswers, answer => answer.questionId),
          personalInformation: {
            ...er.attendee.personalInformation,
            customFields: arrayToMap(er.attendee.personalInformation.customFields, answer => answer.questionId)
          }
        }
      })
    )
  };
}

/**
 * Function to convert api response back to application's format
 */
export function convertResponse(body: $TSFixMe): $TSFixMe {
  return {
    ...body,
    regCart: convertRegCartResponse(body.regCart)
  };
}

export const defaultPollingStrategy = {
  quickPollingTries: 3, // How many times to poll at the quick polling interval before falling back to normal
  quickPollingInterval: 1000, // Number of ms to wait between polling calls for the first quickPollingTries times
  normalPollingInterval: 3000 // Number of ms to wait between polling calls after the first quickPollingTries times
};

export interface SnapshotVersions {
  event: string;
  account: string;
}

/**
 * The reg cart service client.
 */
export default class RegCartClient {
  partialRegCartBaseUrl: $TSFixMe;
  regCartBaseUrl;
  paymentBaseUrl;
  regCartV2Url;
  environment;
  request;
  capacityBaseUrl;
  constructor(baseURL?: $TSFixMe, eventId?: $TSFixMe, environment?: $TSFixMe, userType?: $TSFixMe) {
    this.regCartBaseUrl = baseURL + 'registration/v1/regcart';
    this.partialRegCartBaseUrl = baseURL + 'registration/v1';
    this.regCartV2Url = baseURL + 'registration/v2/regcart';
    this.paymentBaseUrl = baseURL + 'registration/v1/paymentProxy';
    this.capacityBaseUrl = baseURL + 'registration/v1/regcart/capacity';
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.regCartBaseUrl }).withCookies();
    this.request = this.request
      .header('Localized-Validations', 'true')
      .header(SESSION_HEADER_EVENT_ID, eventId)
      .header(SESSION_HEADER_USER_TYPE, userType);
  }

  async getRegCart(authToken: $TSFixMe, regCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartBaseUrl}/${regCartId}`)
      .query('environment', this.environment)
      .header('Pragma', 'no-cache')
      .get()
      .auth(authToken)
      .withNoCache()
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting reg cart', response, request);
      LOG.info('Error getting reg cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertRegCartResponse(await response.json());
  }

  /**
   * Creates a reg cart
   * @param authToken auth token to use for the request
   * @param regCart the reg cart to create
   * @param contactId the contact id to populate reg cart's user data
   * @param inviteeId the invitee for which to create cart
   * @param createdBy field used to populate regcart's createdBy
   */
  async createRegCart(
    authToken: $TSFixMe,
    regCart: $TSFixMe,
    contactId: $TSFixMe,
    inviteeId?: $TSFixMe,
    adminContactId?: $TSFixMe,
    isContactWebsite?: $TSFixMe,
    createdBy?: $TSFixMe,
    eventId?: string,
    snapshotVersions?: SnapshotVersions
  ): Promise<$TSFixMe> {
    let request = this.request
      .query('contactId', contactId)
      .query('inviteeId', inviteeId)
      .query('adminId', adminContactId)
      .query('isContactWebsite', isContactWebsite)
      .query('environment', this.environment)
      .post()
      .json(convertRegCart(regCart))
      .auth(authToken);

    if (createdBy) {
      request = request.query('cb', createdBy);
    }
    if (snapshotVersions) {
      // add snapshot version headers if defined, used by embedded reg
      request = request
        .header('Account-Snapshot-Version', snapshotVersions?.account)
        .header('Event-Snapshot-Versions', JSON.stringify({ [eventId]: snapshotVersions?.event }));
    }

    request = request.build();

    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error creating reg cart', response, request);
      LOG.info('Error creating reg cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * Creates a reg cart from email links
   * @param authToken auth token to use for the request
   * @param inviteeId the invitee id in the email link
   * @param regTypeId registration type id
   * @param regPathId registration path id
   */
  async createRegCartFromLink(
    authToken: $TSFixMe,
    inviteeId: $TSFixMe,
    regTypeId?: $TSFixMe,
    regPathId?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(this.regCartBaseUrl + '/link?inviteeId=' + inviteeId)
      .query('environment', this.environment)
      .query('registrationTypeId', regTypeId)
      .query('registrationPathId', regPathId)
      .post()
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error creating reg cart from link', response, request);
      LOG.info('Error creating reg cart from link', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * Creates a reg cart for test mode events
   * @param authToken auth token to use for the request
   * @param eventId the event id of the test event
   * @param regTypeId registration type id
   * @param regPathId registration path id
   */
  async createTestModeRegCartFromLink(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    regTypeId?: $TSFixMe,
    regPathId?: $TSFixMe
  ): Promise<$TSFixMe> {
    let request = this.request
      .url(this.regCartBaseUrl + '/link')
      .query('eventId', eventId)
      .query('performTest', 'true')
      .query('environment', this.environment);
    if (regTypeId) {
      request = request.query('registrationTypeId', regTypeId);
    }
    if (regPathId) {
      request = request.query('registrationPathId', regPathId);
    }
    request = request.post().auth(authToken).build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create(
        'Error creating reg cart from link for test mode event',
        response,
        request
      );
      LOG.info(
        'Error creating reg cart from link for test mode event',
        request.url,
        error.responseStatus,
        error.responseBody
      );
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * aborts an ongoing INPROGRESS regCart
   * @param authToken auth token to use for the request
   * @param regCartId id of the regCart to cancel
   * @returns {Promise<void>}
   */
  async abortRegCart(authToken: $TSFixMe, regCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(this.regCartBaseUrl + '/' + regCartId + '/abort')
      .query('environment', this.environment)
      .put()
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error cancelling reg cart', response, request);
      LOG.info('Error cancelling reg cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
  }

  /**
   * Updates a reg cart with quantity item
   * @param authToken auth token to use for the request
   * @param regCartId what reg cart id to update
   * @param quantityItemRegistrationToUpdate information to update for quantity item registrations
   */
  async updateRegCartQuantityItemRegistrations(
    authToken: $TSFixMe,
    regCartId: $TSFixMe,
    quantityItemRegistrationToUpdate: $TSFixMe
  ): Promise<$TSFixMe> {
    const requestToBuild = this.request
      .url(this.regCartBaseUrl + '/' + regCartId + '/productRegistrations/quantityItem')
      .query('environment', this.environment)
      .put()
      .json(quantityItemRegistrationToUpdate)
      .auth(authToken);
    const request = requestToBuild.build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create(
        'Error updating quantity item registrations in reg cart',
        response,
        request
      );
      LOG.info(
        'Error updating quantity item registrations in reg cart',
        request.url,
        error.responseStatus,
        error.responseBody
      );
      throw error;
    }
    const regCartResponse = await response.json();
    return convertResponse(regCartResponse);
  }

  /**
   * Updates a reg cart
   * @param authToken auth token to use for the request
   * @param regCart what to update the reg cart to
   * @param linkedInviteeIdToRemove invitee to remove
   */
  async updateRegCart(authToken: $TSFixMe, regCart: $TSFixMe, linkedInviteeIdToRemove?: $TSFixMe): Promise<$TSFixMe> {
    let requestToBuild = this.request
      .url(this.regCartBaseUrl + '/' + regCart.regCartId)
      .query('environment', this.environment)
      .put()
      .json(convertRegCart(regCart))
      .auth(authToken);
    if (linkedInviteeIdToRemove) {
      requestToBuild = requestToBuild.query('linkedInviteeIdToRemove', linkedInviteeIdToRemove);
    }
    const request = requestToBuild.build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error updating reg cart', response, request);
      LOG.info('Error updating reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    const regCartResponse = await response.json();
    return convertResponse(regCartResponse);
  }

  /**
   * updates payment credits in reg cart
   */
  async updatePaymentCreditsInRegCart(authToken: $TSFixMe, regCartId: $TSFixMe): Promise<$TSFixMe> {
    const updatePaymentCreditUri = 'updatePaymentCredits';
    const request = this.request
      .url(`${this.regCartBaseUrl}/${regCartId}/${updatePaymentCreditUri}`)
      .query('environment', this.environment)
      .put()
      .auth(authToken)
      .build();

    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error updating payment credits in reg cart', response, request);
      LOG.info('Error updating payment credits in reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    const regCartResponse = await response.json();
    return convertRegCartResponse(regCartResponse);
  }

  buildRequestForRegCartPricing(authToken: $TSFixMe, regCartId: $TSFixMe, pricingInfo: $TSFixMe): $TSFixMe {
    return this.request
      .url(this.regCartBaseUrl + '/' + regCartId + '/pricing')
      .query('environment', this.environment)
      .put()
      .json(pricingInfo)
      .auth(authToken)
      .build();
  }

  /**
   * Calculate pricing for a reg cart
   * @param authToken auth token to use for the request
   * @param regCartId id of the reg cart
   * @param pricingInfo payment/pricing information to use for checkout
   */
  async calculateRegCartPricing(authToken: $TSFixMe, regCartId: $TSFixMe, pricingInfo: $TSFixMe): Promise<$TSFixMe> {
    const request = this.buildRequestForRegCartPricing(authToken, regCartId, pricingInfo);
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error retrieving pricing for reg cart', response, request);
      LOG.info('Error retriving pricing for reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  buildRequestForGetRegCartPricing(authToken: $TSFixMe, regCartId: $TSFixMe): $TSFixMe {
    return this.request
      .url(this.regCartBaseUrl + '/' + regCartId + '/pricing')
      .query('environment', this.environment)
      .get()
      .auth(authToken)
      .build();
  }

  async getRegCartPricing(authToken: $TSFixMe, regCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.buildRequestForGetRegCartPricing(authToken, regCartId);
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting pricing for reg cart', response, request);
      LOG.info('Error retrieving pricing for reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Start checkout for a reg cart
   * @param authToken auth token to use for the request
   * @param regCartId id of the reg cart
   * @param pricingInfo payment/pricing information to use for checkout
   * @param registrationCheckoutTimeout registration dequeue timeout
   */
  async startRegCartCheckout(
    authToken: $TSFixMe,
    regCartId: $TSFixMe,
    pricingInfo: $TSFixMe,
    registrationCheckoutTimeout: $TSFixMe
  ): Promise<$TSFixMe> {
    let requestBuilder = this.request
      .url(this.regCartV2Url + '/' + regCartId + '/checkout')
      .query('environment', this.environment)
      .put()
      .json(pricingInfo)
      .auth(authToken);
    if (registrationCheckoutTimeout) {
      requestBuilder = requestBuilder.query('dequeueTimeout', registrationCheckoutTimeout);
    }
    const request = requestBuilder.build();

    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error checking out reg cart', response, request);
      LOG.info('Error checking out reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return response.json();
  }

  /**
   * Creates a payment Cart
   * this is used during post reg payments to create the payment cart and validate the amount passed
   * @param authToken auth token to use for the request
   * @param pricingInfo payment/pricing information to use for checkout
   */
  async startPaymentCartCheckout(
    authToken: $TSFixMe,
    pricingInfo: $TSFixMe,
    confirmationNumber: $TSFixMe,
    eventId: $TSFixMe,
    emailAddress: $TSFixMe
  ): Promise<$TSFixMe> {
    const requestBuilder = this.request
      .url(this.partialRegCartBaseUrl + '/postRegPayment/paymentCart')
      .query('environment', this.environment)
      .query('confirmationNumber', confirmationNumber)
      .query('eventId', eventId)
      .query('email', emailAddress)
      .post()
      .json(pricingInfo)
      .auth(authToken);
    const request = requestBuilder.build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error checking out reg cart', response, request);
      LOG.info('Error checking out reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return response.json();
  }

  async acknowledgeRegCartStatus(authToken: $TSFixMe, regCartId: $TSFixMe, statusAction: $TSFixMe): Promise<$TSFixMe> {
    const requestBuilder = this.request
      .url(this.regCartBaseUrl + '/' + regCartId + '/status')
      .query('environment', this.environment)
      .put()
      .json(statusAction)
      .auth(authToken);

    const request = requestBuilder.build();

    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error acknowledging status', response, request);
      LOG.info('Error acknowledging status', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
  }

  /**
   * const response = await fetchWithSessionTimeout(request);
   * Delays until the next poll should occur
   * @param pollingStrategy the polling strategy to use for polling
   * @param quickPollingTriesLeft number of tries left using quick polling before switching to normal polling
   */
  waitToPoll(pollingStrategy: $TSFixMe, quickPollingTriesLeft: $TSFixMe): $TSFixMe {
    return new Promise(resolve => {
      setTimeout(
        // @ts-expect-error ts-migrate(2794) FIXME: Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
        () => resolve(),
        quickPollingTriesLeft > 0 ? pollingStrategy.quickPollingInterval : pollingStrategy.normalPollingInterval
      );
    });
  }

  /**
   * Polls for reg cart completion with progress updates after each poll
   * @param authToken auth token to use for the request
   * @param regCartId id of the reg cart
   * @param onProgress callback to call whenever getting an update about the reg cart
   * @param pollingStrategy the polling strategy to use for polling
   */
  // eslint-disable-next-line complexity
  async waitForRegCartCheckoutCompletion(
    authToken: $TSFixMe,
    regCartId: $TSFixMe,
    onProgress: $TSFixMe,
    pollingStrategy = defaultPollingStrategy
  ): Promise<$TSFixMe> {
    const pollingRequestBuilder = this.request.get().auth(authToken);

    let quickPollingTriesLeft = pollingStrategy.quickPollingTries;
    let count = 1;
    for (;;) {
      const request = pollingRequestBuilder
        // append timestamp to stop IE from caching the request
        .url(
          this.regCartBaseUrl +
            '/' +
            regCartId +
            '/status?waitForInviteeIngestion=true&attemptNumber=' +
            count +
            '&ts=' +
            new Date().getTime()
        )
        .query('environment', this.environment)
        .build();
      count++;
      const response = await fetchWithSessionTimeout(request);
      const responseCopy = response.clone();
      if (response.ok) {
        LOG.debug('polling for reg cart checkout completion');
        const regCartStatus = await response.json();
        onProgress(regCartStatus);

        switch (regCartStatus.statusCode) {
          case 'THIRD_PARTY_REDIRECT': {
            await this.acknowledgeRegCartStatus(authToken, regCartId, 'UPDATE_REDIRECT_STATUS');
            window.location = regCartStatus.paymentInfo.thirdPartyRedirectUrl;
            return regCartStatus;
          }
          case 'SERVICE_FEES_CONFIRMATION_PENDING':
            LOG.debug('reg cart awaiting invitee confirmation for service fees', regCartStatus);
            return regCartStatus;
          case 'COMPLETED':
          case 'COMPLETED_PENDING_REFUNDS':
            LOG.debug('reg cart checkout completed', regCartStatus);
            return regCartStatus;
          case 'TIME_OUT_EXPIRED':
            LOG.info('Timeout expired for registration', regCartId);
            return regCartStatus;
          case 'FAILED':
          case 'ABANDONED':
          case 'CANCELLED': {
            const error = await ServiceError.create('reg cart checkout failed', responseCopy, request);
            LOG.info('reg cart checkout failed', request.url, regCartStatus);
            throw error;
          }
          case 'INPROGRESS': {
            if (regCartStatus.paymentInfo.paymentStatus === 'PaymentFailed') {
              LOG.debug('reg cart checkout payment processing failed', regCartStatus);
              const error = await ServiceError.create(
                'reg cart checkout payment processing failed',
                responseCopy,
                request
              );
              LOG.info(
                'reg cart checkout payment processing failed',
                request.url,
                error.responseStatus,
                error.responseBody
              );
              throw error;
            }
            LOG.debug('reg cart checkout not complete', regCartStatus);
            quickPollingTriesLeft--;
            await this.waitToPoll(pollingStrategy, quickPollingTriesLeft);
            break;
          }
          case 'PROCESSING':
          case 'QUEUED':
          case 'PAYMENT_INITIATED':
          default:
            LOG.debug('reg cart checkout not complete', regCartStatus);
            quickPollingTriesLeft--;
            await this.waitToPoll(pollingStrategy, quickPollingTriesLeft);
            break;
        }
      } else {
        const error = await ServiceError.create('Error polling for reg cart status during checkout', response, request);
        LOG.info(
          'Error polling for reg cart status during checkout',
          request.url,
          error.responseStatus,
          error.responseBody
        );
        throw error;
      }
    }
    // This is unreachable, but flow can't figure that out
    /* eslint-disable no-unreachable */
    throw new Error('stopped polling for reg cart checkout without completing');
    /* eslint-enable no-unreachable */
  }

  /**
   * create registrations cart for Decline Survey
   */
  async createDeclineRegistrationCart(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    inviteeId: $TSFixMe,
    registrationTypeId?: $TSFixMe,
    sendEmail?: $TSFixMe,
    referenceId?: $TSFixMe,
    localeId?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartBaseUrl}/decline`)
      .query('eventId', eventId)
      .query('inviteeId', inviteeId)
      .query('registrationTypeId', registrationTypeId)
      .query('environment', this.environment)
      .query('sendEmail', Boolean(sendEmail).toString())
      .query('referenceId', referenceId)
      .query('localeId', localeId)
      .post()
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('createDeclineRegistrationCart failed', response, request);
      LOG.info('Error declining registration', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * search Partial Reg cart
   */
  async searchPartialRegCart(
    authToken: $TSFixMe,
    regCart: $TSFixMe,
    isPreview: $TSFixMe,
    isAbandonedReg?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.partialRegCartBaseUrl}/partial-regcart`)
      .query('environment', this.environment)
      .query('isPreview', isPreview)
      .query('isAbandonedResumed', isAbandonedReg)
      .put()
      .json(convertRegCart(regCart))
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('getPartialRegCart failed', response, request);
      LOG.info('Error partial registration', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * Resume Partial Reg cart
   */
  async resumePartialRegCart(authToken: $TSFixMe, regCartId: $TSFixMe, partialRegCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.partialRegCartBaseUrl}/partial-regcart/${regCartId}/resume`)
      .query('environment', this.environment)
      .put()
      .json(partialRegCartId)
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error resuming partial reg cart', response, request);
      LOG.info('Error resuming partial reg cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * create registrations cart for Waitlist
   */
  async createWaitlistRegistrationCart(authToken: $TSFixMe, eventId: $TSFixMe, inviteeId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartBaseUrl}/waitlist`)
      .query('eventId', eventId)
      .query('inviteeId', inviteeId)
      .query('environment', this.environment)
      .post()
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('createWaitlistRegistrationCart failed', response, request);
      LOG.info('Error waitlisting registration', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * gets capacity counts updated with available transfers
   */
  async getCapacitySummaries(authToken: $TSFixMe, regCartId: $TSFixMe, capacityIds: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.capacityBaseUrl}/${regCartId}`)
      .query('environment', this.environment)
      .post()
      .json(capacityIds)
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting reg cart capacities', response, request);
      LOG.info('Error getting reg cart capacities', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * gets capacity counts updated with available transfers
   */
  async getCapacitySummariesOnPageLoad(
    authToken: $TSFixMe,
    regCartId: $TSFixMe,
    capacityIds: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.capacityBaseUrl}/${regCartId}`)
      .query('environment', this.environment)
      .post()
      .json(capacityIds)
      .auth(authToken)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting reg cart capacities', response, request);
      LOG.info('Error getting reg cart capacities', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Check if a question is visible based on an answer
   */
  async evaluateVisibilityLogic(
    authToken: $TSFixMe,
    visibilityLogicPayload: $TSFixMe,
    eventSnapshotVersion: $TSFixMe,
    eventId: $TSFixMe,
    regCartId: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartV2Url}/${regCartId}/questions/visibility`)
      .query('eventId', eventId)
      .query('snapshotVersion', eventSnapshotVersion)
      .query('environment', this.environment)
      .auth(authToken)
      .post()
      .json(visibilityLogicPayload)
      .build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create('Failed to evaluate question visibility logic ', response, request);
    }
    return await response.json();
  }

  /**
   * Updates a reg cart with sessions
   * @param authToken auth token to use for the request
   * @param regCartId what reg cart id to update
   * @param sessionRegistrationsToUpdate information to update for session registrations
   */
  async updateRegCartSessionRegistrations(
    authToken: $TSFixMe,
    regCartId: $TSFixMe,
    sessionRegistrationsToUpdate: $TSFixMe
  ): Promise<$TSFixMe> {
    const requestToBuild = this.request
      .url(this.regCartBaseUrl + '/' + regCartId + '/productRegistrations/sessions')
      .query('environment', this.environment)
      .put()
      .json(sessionRegistrationsToUpdate)
      .auth(authToken);
    const request = requestToBuild.build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error updating session registrations in reg cart', response, request);
      LOG.info(
        'Error updating session registrations in reg cart',
        request.url,
        error.responseStatus,
        error.responseBody
      );
      throw error;
    }
    if (response.status === 204) {
      return null;
    }
    const regCartResponse = await response.json();
    return convertResponse(regCartResponse);
  }
  async initiateRegModAsync(
    authToken: $TSFixMe,
    inviteeId: $TSFixMe,
    confirmationNumber: $TSFixMe,
    eventId: $TSFixMe,
    performedByContactId: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(this.regCartBaseUrl + '/mod/async')
      .query('environment', this.environment)
      .query('inviteeId', inviteeId)
      .query('confirmationNumber', confirmationNumber)
      .query('eventId', eventId)
      .query('performedByContactId', performedByContactId)
      .post()
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error starting reg mod', response, request);
      LOG.info('Error starting reg mod ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Create reg cart when invitee logs in with confirmation number
   */
  async identifyByConfirm(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    emailAddress: $TSFixMe,
    confirmationNumber: $TSFixMe,
    inviteeId?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartBaseUrl}/identifyByConfirm`)
      .query('environment', this.environment)
      .post()
      .json({ eventId, emailAddress, confirmationNumber, inviteeId })
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);

    if (!response.ok) {
      const error = await ServiceError.create('identifyByConfirm failed', response, request);
      LOG.info('Error identify reg cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * Creates reg cart for a reg mod using a token that has been authorized for a user who has already registered
   */
  async createRegModCart(
    authToken: $TSFixMe,
    inviteeId?: $TSFixMe,
    confirmationNumber?: $TSFixMe,
    eventId?: $TSFixMe,
    performedByContactId?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartBaseUrl}/mod`)
      .query('environment', this.environment)
      .query('inviteeId', inviteeId)
      .query('confirmationNumber', confirmationNumber)
      .query('eventId', eventId)
      .query('performedByContactId', performedByContactId)
      .post()
      .json({})
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);

    if (!response.ok) {
      const error = await ServiceError.create('createRegModCart failed', response, request);
      LOG.info('Error starting registration modification', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * Creates reg cart for a cancel registration using a token
   * that has been authorized for a user who has already registered
   */
  async createCancelRegistrationCart(
    authToken: $TSFixMe,
    inviteeId?: $TSFixMe,
    confirmationNumber?: $TSFixMe,
    eventId?: $TSFixMe,
    performedByContactId?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.regCartBaseUrl}/cancel`)
      .query('environment', this.environment)
      .query('inviteeId', inviteeId)
      .query('confirmationNumber', confirmationNumber)
      .query('eventId', eventId)
      .query('performedByContactId', performedByContactId)
      .post()
      .json({})
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);

    if (!response.ok) {
      const error = await ServiceError.create('createCancelRegistrationCart failed', response, request);
      LOG.info('Error starting registration cancellation', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  async awaitRegModReady(
    authToken: $TSFixMe,
    regCartId: $TSFixMe,
    onProgress: $TSFixMe,
    pollingStrategy = defaultPollingStrategy
  ): Promise<$TSFixMe> {
    const pollingRequestBuilder = this.request.get().auth(authToken);

    let quickPollingTriesLeft = pollingStrategy.quickPollingTries;
    let pollingTriesLeft = 42;
    let initialPosition = null;
    for (;;) {
      const request = pollingRequestBuilder
        // append timestamp to stop IE from caching the request
        .url(this.regCartBaseUrl + '/mod/async/' + regCartId + '?ts=' + new Date().getTime())
        .query('environment', this.environment)
        .build();
      const response = await fetchWithSessionTimeout(request);
      if (response.ok) {
        const { done, position, result } = await response.json();
        if (!initialPosition) {
          initialPosition = position;
        }
        onProgress(calculateInitiateRegModPercentComplete(initialPosition, position));
        if (done) {
          return result;
        }
        if (pollingTriesLeft <= 0) {
          LOG.error('failed to start reg mod', result);
          throw new Error('failed to start reg mod');
        }
      }
      quickPollingTriesLeft--;
      pollingTriesLeft--;
      await this.waitToPoll(pollingStrategy, quickPollingTriesLeft);
    }
  }
}
