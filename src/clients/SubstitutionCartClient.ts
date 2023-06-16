import { RequestBuilder } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID, SESSION_HEADER_USER_TYPE } from '@cvent/event-ui-networking';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';

import Logger from '@cvent/nucleus-logging';
import { ServiceError } from '@cvent/event-ui-networking';
import { defaultPollingStrategy } from './RegCartClient';

const LOG = new Logger('SubstitutionCartClient');

/**
 * The substitution cart service client.
 */
export default class SubstitutionCartClient {
  substitutionCartBaseUrl;
  environment;
  request;

  /**
   * constructor
   * @param baseURL base URL
   * @param eventId event Id
   * @param environment environment
   * @param userType Request is from planner side or guest side
   */
  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe, userType: $TSFixMe) {
    this.substitutionCartBaseUrl = baseURL + 'registration/v1/substitute';
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.substitutionCartBaseUrl }).withCookies();
    this.request = this.request
      .header('Localized-Validations', 'true')
      .header(SESSION_HEADER_EVENT_ID, eventId)
      .header(SESSION_HEADER_USER_TYPE, userType);
  }

  /**
   * Get Substitution Cart
   * @param substitutionCartId
   * @returns {Promise<*>}
   */
  async getSubstitutionCart(substitutionCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .get()
      .url(`${this.substitutionCartBaseUrl}/${substitutionCartId}`)
      .query('environment', this.environment)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting substitution cart', response, request);
      LOG.error('Error getting substitution cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Creates a substitution cart
   * @param substitutionCart the substitution cart to create
   */
  async createSubstitutionCart(substitutionCart: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .post()
      .url(`${this.substitutionCartBaseUrl}`)
      .query('environment', this.environment)
      .json(substitutionCart)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error creating substitution cart', response, request);
      LOG.error('Error creating substitution cart ', request.url, error.responseStatus, error.responseBody);
      return error.responseBody;
    }
    return await response.json();
  }

  /**
   * Updates a substitution cart
   * @param substitutionCart what to update the substitution cart to
   */
  async updateSubstitutionCart(substitutionCart: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .put()
      .url(`${this.substitutionCartBaseUrl}/${substitutionCart.substitutionCartId}`)
      .query('environment', this.environment)
      .json(substitutionCart)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error updating substitution cart', response, request);
      LOG.error('Error updating substitution cart', request.url, error.responseStatus, error.responseBody);
      return error.responseBody;
    }
    return await response.json();
  }

  /**
   * Delete substitution cart
   * @param substitutionCartId
   * @returns {Promise<*>}
   */
  async deleteSubstitutionCart(substitutionCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .delete()
      .url(`${this.substitutionCartBaseUrl}/${substitutionCartId}`)
      .query('environment', this.environment)
      .build();
    const response = await fetchWithSessionTimeout(request);
    return { isSuccessful: response.status === 204 };
  }

  /**
   * checkout a substitution cart
   * @param substitutionCartId
   */
  async checkoutSubstitutionCart(substitutionCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .put()
      .url(`${this.substitutionCartBaseUrl}/${substitutionCartId}/checkout`)
      .query('environment', this.environment)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (response.status === 412) {
      return null;
    }
    if (!response.ok) {
      const error = await ServiceError.create('Error in checkout substitution cart', response, request);
      LOG.error('Error in checkout substitution cart', request.url, error.responseStatus, error.responseBody);
      return error.responseBody;
    }
    return await response.json();
  }

  /**
   * abort a substitution cart
   * @param substitutionCartId
   */
  async abortSubstitutionCart(substitutionCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .put()
      .url(`${this.substitutionCartBaseUrl}/${substitutionCartId}/abort`)
      .query('environment', this.environment)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      if (response.status !== 412) {
        const error = await ServiceError.create('Error in aborting substitution cart', response, request);
        LOG.error('Error in aborting substitution cart', request.url, error.responseStatus, error.responseBody);
      }
      return { isSuccessful: false };
    }
    return { isSuccessful: response.status === 204 };
  }

  /**
   * Polls for substitution cart completion with progress updates after each poll
   * @param substitutionCartId id of the substitution cart
   * @param pollingStrategy the polling strategy to use for polling
   */
  async waitForSubstitutionCartCheckoutCompletion(
    substitutionCartId: $TSFixMe,
    pollingStrategy = defaultPollingStrategy
  ): Promise<$TSFixMe> {
    let quickPollingTriesLeft = pollingStrategy.quickPollingTries;
    for (;;) {
      // append timestamp to stop IE from caching the request
      const request = this.request
        .get()
        .url(`${this.substitutionCartBaseUrl}/${substitutionCartId}?ts=${new Date().getTime()}`)
        .query('environment', this.environment)
        .build();
      const response = await fetchWithSessionTimeout(request);
      if (response.ok) {
        LOG.debug('polling for substitution cart checkout completion');
        const substitutionCartResponse = await response.json();
        const substitutionCartStatus = substitutionCartResponse.substitutionCart.status;
        switch (substitutionCartStatus) {
          case 'COMPLETED':
            LOG.debug('substitution cart checkout completed', substitutionCartStatus);
            return substitutionCartStatus;
          case 'FAILED':
          case 'CANCELLED': {
            const error = await ServiceError.create('substitution cart checkout failed', response, request);
            LOG.info('substitution cart checkout failed', request.url, substitutionCartStatus);
            throw error;
          }
          case 'INPROGRESS':
          case 'PROCESSING':
          case 'QUEUED':
          default:
            LOG.debug('substitution cart checkout not complete', substitutionCartStatus);
            quickPollingTriesLeft--;
            await this.waitToPoll(pollingStrategy, quickPollingTriesLeft);
            break;
        }
      } else {
        const error = await ServiceError.create(
          'Error polling for substitution cart status during checkout',
          response,
          request
        );
        LOG.error(
          'Error polling for substitution cart status during checkout',
          request.url,
          error.responseStatus,
          error.responseBody
        );
        throw error;
      }
    }
  }

  /**
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
}
