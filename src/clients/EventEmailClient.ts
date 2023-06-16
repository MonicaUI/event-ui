import { fetchAndRetryIfServerBusy, RequestBuilder } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';
import { ServiceError } from '@cvent/event-ui-networking';

export class EmailThrottleError extends Error {
  url: $TSFixMe;
  constructor(message?: $TSFixMe, url?: $TSFixMe) {
    super(message);
    this.name = 'EmailThrottleError';
    this.url = url;
  }
}

const LOG = new Logger('EventEmailClient');
export default class EventEmailClient {
  environment: $TSFixMe;
  eventEmailBaseUrl: $TSFixMe;
  request: $TSFixMe;
  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
    this.eventEmailBaseUrl = baseURL + 'eventemail/v1';
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.eventEmailBaseUrl })
      .header('Localized-Validations', 'true')
      .withCookies()
      .header(SESSION_HEADER_EVENT_ID, eventId);
  }
  async resendConfirmationEmail(
    eventId: $TSFixMe,
    emailAddress: $TSFixMe,
    firstName: $TSFixMe,
    lastName: $TSFixMe
  ): Promise<$TSFixMe> {
    LOG.debug('resendConfirmationEmail', eventId, emailAddress, firstName, lastName);
    const request = this.request
      .url(`${this.eventEmailBaseUrl}/resendconfirmationemail/${eventId}`)
      // eventType=4 signals the request is from a flex event.
      .query('eventType', '4')
      .query('environment', this.environment)
      .post()
      .json({ eventId, emailAddress, firstName, lastName })
      .build();
    const response = await fetchAndRetryIfServerBusy(request);

    if (!response.ok || response.status === 202) {
      // 202 represents a throttled request
      const errorMessage = `resendConfirmationEmail failed: ${this.eventEmailBaseUrl}: ${response.status} - ${response.statusText}`;
      let error;
      if (response.status === 202) {
        // throw error for a throttled request
        error = new EmailThrottleError(errorMessage);
      } else {
        error = await ServiceError.create(errorMessage, response, request);
      }
      LOG.info('Error resending confirmation email', error);
      throw error;
    }
    return response;
  }

  async sendPlannerEmail(eventId: $TSFixMe, emailAddress: $TSFixMe, message: $TSFixMe): Promise<$TSFixMe> {
    LOG.debug('sendPlannerEmail', eventId, emailAddress, message);
    const response = await fetchAndRetryIfServerBusy(
      this.request
        .url(`${this.eventEmailBaseUrl}/contacteventplanner/${eventId}`)
        // eventType=4 signals the request is from a flex event.
        .query('eventType', '4')
        .query('environment', this.environment)
        .post()
        .json({ senderEmail: emailAddress, message })
        .build()
    );

    if (!response.ok) {
      const error = new Error(
        `sendPlannerEmail failed: ${this.eventEmailBaseUrl}: ${response.status} - ${response.statusText}`
      );
      LOG.info('Error sending planner email', error);
      throw error;
    }
    return response;
  }

  async sendAttendeeEmail(eventId: $TSFixMe, emailToSend: $TSFixMe): Promise<$TSFixMe> {
    LOG.debug('sendAttendeeEmail', eventId, emailToSend);
    const request = this.request
      .url(`${this.eventEmailBaseUrl}/sendattendeeemail/${eventId}`)
      // eventType=4 signals the request is from a flex event.
      .query('eventType', '4')
      .query('environment', this.environment)
      .post()
      .json(emailToSend)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);

    if (!response.ok || response.status === 202) {
      // 202 represents a throttled request
      const errorMessage = `sendAttendeeEmail failed: ${this.eventEmailBaseUrl}: ${response.status} - ${response.statusText}`;
      let error;
      if (response.status === 202) {
        // throw error for a throttled request
        error = new EmailThrottleError(errorMessage);
      } else {
        error = await ServiceError.create(errorMessage, response, request);
      }
      LOG.info('Error sending attendee email', error);
      throw error;
    }
    return response;
  }

  /**
   * Get invitee's or guest's subscription status of email communications for the event.
   * @param {string} eventId - an event ID from the desired opt out/in account
   * @param {string} inviteeId - invitee ID to identify the user from the event
   * @param {string} encodedGuestId - encoded guestId ID to identify the user from the event
   * @returns {object} subscriptionstatus - contains invitee/guest's subscribed flag
   */
  async getSubscriptionStatus(eventId: $TSFixMe, inviteeId: $TSFixMe, encodedGuestId?: $TSFixMe): Promise<$TSFixMe> {
    const response = await fetchAndRetryIfServerBusy(
      this.request
        .url(`${this.eventEmailBaseUrl}/eventemail/${eventId}/subscriptionstatus`)
        .query('inviteeId', inviteeId)
        .query('guestId', encodedGuestId)
        .query('environment', this.environment)
        .get()
        .build()
    );
    if (!response.ok) {
      const error = new Error(
        `GET - getSubscriptionStatus failed: ${this.eventEmailBaseUrl}: ${response.status} - ${response.statusText}`
      );
      LOG.info('Error retrieving invitee/guest email subscription status', error);
      throw error;
    }
    return await response.json();
  }

  /**
   * Get invitee's or guest's subscription status of email communications for the event.
   * @param {string} eventId - an event ID from the desired opt out/in account
   * @param {string} inviteeId - invitee ID to identify the user from the event
   * @param {string} encodedGuestId - encoded guestId ID to identify the user from the event
   * @param subscriptionstatus - contains invitee/guest's subscribed flag
   */
  async setSubscriptionStatus(
    eventId: $TSFixMe,
    inviteeId: $TSFixMe,
    encodedGuestId: $TSFixMe,
    subscriptionstatus?: $TSFixMe
  ): Promise<$TSFixMe> {
    const response = await fetchAndRetryIfServerBusy(
      this.request
        .url(`${this.eventEmailBaseUrl}/eventemail/${eventId}/subscriptionstatus`)
        .query('inviteeId', inviteeId)
        .query('guestId', encodedGuestId)
        .query('environment', this.environment)
        .put()
        .json({ subscribed: subscriptionstatus })
        .build()
    );
    if (!response.ok) {
      const error = new Error(
        `SET - subscriptionstatus failed: ${this.eventEmailBaseUrl}: ${response.status} - ${response.statusText}`
      );
      LOG.info('Error setting invitee/guest email subscription status', error);
      throw error;
    }
    return response;
  }
}
