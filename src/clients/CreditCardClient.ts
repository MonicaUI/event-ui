import { RequestBuilder } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID, SESSION_HEADER_USER_TYPE } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';
import { fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { ServiceError } from '@cvent/event-ui-networking';

const LOG = new Logger('CreditCardClient');

/**
 * The credit card service client.
 */
export default class CreditCardClient {
  creditCardBaseURL;
  environment;
  request;
  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe, userType: $TSFixMe) {
    this.creditCardBaseURL = baseURL + 'webpayments/v1/creditcard';
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.creditCardBaseURL })
      .withCookies()
      .header(SESSION_HEADER_EVENT_ID, eventId)
      .header(SESSION_HEADER_USER_TYPE, userType);
  }

  /**
   * Create credit card
   * @param authToken auth token to use for the request
   * @param creditCard credit card data
   */
  async createCreditCard(authToken: $TSFixMe, creditCard: $TSFixMe): Promise<$TSFixMe> {
    const modifiedCreditCard = {
      ...creditCard,
      applicationId: 'travel-booking-service'
    };
    const request = this.request.post().json(modifiedCreditCard).auth(authToken).build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error saving credit card', response, request);
      LOG.info('Error saving credit card ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }
}
