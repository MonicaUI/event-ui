import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { ServiceError } from '@cvent/event-ui-networking';
import { convertResponse } from './RegCartClient';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('EventGuestClient');

async function fetchOrThrow(request, errorMessage) {
  const response = await fetchAndRetryIfServerBusy(request);
  if (!response.ok) {
    throw await ServiceError.create(errorMessage, response, request);
  }
  if (response.status === 204) {
    return;
  }
  return await response.json();
}

/**
 * The client to manage a guest for the event.
 */
export default class EventGuestClient {
  baseUrl: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  constructor(baseUrl?: $TSFixMe, eventId?: $TSFixMe, environment?: $TSFixMe) {
    this.baseUrl = baseUrl;
    this.eventId = eventId;
    this.environment = environment;
  }
  _getRequestBuilder(authToken: $TSFixMe, urlPath = ''): $TSFixMe {
    const builder = new RequestBuilder({ url: `${this.baseUrl}${urlPath}` })
      .header(SESSION_HEADER_EVENT_ID, this.eventId)
      .auth(authToken)
      .withCookies();
    return this.environment ? builder.query('environment', this.environment) : builder;
  }
  /**
   * Returns the baseUrl for the event guest site
   */
  getBaseUrl = (): $TSFixMe => this.baseUrl;

  /**
   * Logs out the user dissasociating the user from any saved information in their session.
   */
  async logout(authToken: $TSFixMe, eventId: $TSFixMe, userType: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(authToken, `event/${eventId}`).query('userType', userType).delete().build();
    return await fetchOrThrow(request, 'Failed to logout user.');
  }

  /**
   * Logs user out and aborts an ongoing INPROGRESS regCart using Navigator.sendBeacon API
   */
  async abortRegCartAndLogout(eventId: $TSFixMe, userType: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(null, 'reg/regAbort')
      .query('environment', this.environment)
      .query('eventId', eventId)
      .query('userType', userType)
      .build();

    const response = navigator.sendBeacon(request.url);
    if (!response) {
      LOG.info('Error logging out and aborting reg cart ', request.url);
    }
  }

  /**
   * Issues request to rescind earlier abort registration and logout request
   */
  async rescindAbortRegCartAndLogoutRequest(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    userType: $TSFixMe
  ): Promise<$TSFixMe> {
    LOG.debug('rescindAbortRegCartAndLogoutRequest');
    const request = this._getRequestBuilder(authToken, 'reg/rescindRegAbort')
      .query('environment', this.environment)
      .query('eventId', eventId)
      .query('userType', userType)
      .post()
      .build();

    return await fetchOrThrow(request, 'Failed to rescind registration abort.');
  }

  /**
   * Opt out or opt in email communications of all events under an give account.
   * @param authToken
   * @param {string} eventId - an event ID from the desired opt out/in account
   * @param {string} inviteeId - invitee ID to identify the user from the event
   * @param {string} guestId - guest ID to identify the guest from the event
   * @param {string} contactId - contact ID to identify the contact from the event
   */
  async getOptOutStatus(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    inviteeId: $TSFixMe,
    guestId: $TSFixMe,
    contactId: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(authToken, `event/${eventId}/opt-in-out`)
      .query('environment', this.environment)
      .query('inviteeId', inviteeId)
      .query('guestId', guestId)
      .query('contactId', contactId)
      .get();
    return await fetchOrThrow(request.build(), 'Failed to retrieve user opt-out status.');
  }

  /**
   * Opt out or opt in email communications of all events under an give account.
   * @param authToken
   * @param {string} eventId - an event ID from the desired opt out/in account
   * @param {string} inviteeId - invitee ID to identify the user from the event
   * @param {string} guestId - guest ID to identify the guest from the event
   * @param {string} contactId - contact ID to identify the contact from the event
   * @param {boolean} optOutStatus - desired optOut status. true - opted out.
   */
  async optOut(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    inviteeId: $TSFixMe,
    guestId: $TSFixMe,
    contactId: $TSFixMe,
    optOutStatus: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(authToken, `event/${eventId}/opt-in-out`)
      .query('environment', this.environment)
      .query('inviteeId', inviteeId)
      .query('guestId', guestId)
      .query('contactId', contactId)
      .query('optOut', optOutStatus)
      .put();
    return await fetchOrThrow(request.build(), 'Failed to opt-out user.');
  }

  /**
   * Get registration content (pages, layout items, etc.)
   */
  async getRegistrationContent(
    eventId: $TSFixMe,
    snapshotVersion: $TSFixMe,
    pageVariety: $TSFixMe,
    regPathId = null,
    registrationTypeId = null
  ): Promise<$TSFixMe> {
    const regPathSegment = regPathId ? `registrationPath/${regPathId}` : 'defaultRegistrationPath';
    const request = this._getRequestBuilder(null, `websiteContent/${eventId}/${regPathSegment}/${pageVariety}`)
      .get()
      .query('snapshotVersion', snapshotVersion)
      .query('registrationTypeId', registrationTypeId)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(`Event snapshot load failed eventId: ${String(eventId)}`, response, request);
    }
    return await response.json();
  }

  /**
   * Get website page content (pages, layout items, etc.)
   */
  async getWebsiteContent(eventId: $TSFixMe, snapshotVersion: $TSFixMe, registrationTypeId = null): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(null, `websiteContent/${eventId}/website`)
      .get()
      .query('snapshotVersion', snapshotVersion)
      .query('registrationTypeId', registrationTypeId)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(`Event snapshot load failed eventId: ${String(eventId)}`, response, request);
    }
    return await response.json();
  }

  /**
   * Get site editor core content
   */
  async getSiteEditorCore(
    eventId: $TSFixMe,
    snapshotVersion: $TSFixMe,
    registrationPathId?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(null, `websiteContent/${eventId}/siteEditorCore`)
      .get()
      .query('snapshotVersion', snapshotVersion)
      .query('registrationPathId', registrationPathId)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(
        `Event siteEditorCore load failed eventId: ${String(eventId)}`,
        response,
        request
      );
    }
    return await response.json();
  }

  /**
   * Get documents for a given speaker
   */
  async getSpeakerDocuments(
    authToken: string,
    eventId: string,
    snapshotVersion: string,
    speakerId: string,
    flexBearerAuthRemoval = false
  ): Promise<Record<string, unknown> | ServiceError> {
    let request = this._getRequestBuilder(authToken, `event/speaker/${eventId}/speakerDocuments`);

    if (flexBearerAuthRemoval) {
      request = this._getRequestBuilder(null, `event/speaker/${eventId}/speakerDocuments`);
    }

    request = request.get().query('snapshotVersion', snapshotVersion).query('speakerId', speakerId).build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      throw await ServiceError.create(
        `Failed to retrieve speaker documents for eventId: ${String(eventId)} and speakerId: ${String(speakerId)}`,
        response,
        request
      );
    }
    return await response.json();
  }

  async identifyByContactId(authToken: $TSFixMe, eventId: $TSFixMe, contactId?: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(authToken, 'reg/identifyByContactId')
      .query('environment', this.environment)
      .post()
      .json({ eventId, contactId })
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('identifyByContactId failed', response, request);
      LOG.error('Error identifying by contact id', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return convertResponse(await response.json());
  }

  /**
   * Get related contacts list containing firstName, lastName, emailAddress and relatedContactStub for a contact.
   * @param authToken
   * @param {string} eventId - event ID of the current registration
   * @param {string} regCartId - regCart ID of the current registration
   * @param {string} contactId - contact ID of the invitee for whom guests will be added from related contacts
   * @param {int} limit - number of related contacts we want to fetch and show on the guests popup
   * @param {null} searchString - search criteria to filter the related contacts to show on the guests popup
   */
  async getRelatedContacts(
    authToken: $TSFixMe,
    eventId: $TSFixMe,
    regCartId: $TSFixMe,
    contactId: $TSFixMe,
    limit: $TSFixMe,
    searchString?: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(authToken, `contacts/${eventId}/relatedContacts`)
      .query('regCartId', regCartId)
      .query('contactId', contactId)
      .query('limit', limit)
      .query('searchString', searchString)
      .query('environment', this.environment)
      .get()
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('getRelatedContacts failed', response, request);
      LOG.info('Error getting related contacts', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Publishes an attendee activity fact. Purposefully not throwing the error should one occur. Since it's analytic
   * tracking, we want to log the error and let the application continue.
   */
  async publishAttendeeActivityFact(authToken: $TSFixMe, fact: $TSFixMe): Promise<$TSFixMe> {
    const body = {
      activities: [fact]
    };
    const request = this._getRequestBuilder(authToken, 'attendeeactivities/v1/attendeeactivities/publish')
      .query('environment', this.environment)
      .post()
      .json(body)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);

    if (!response.ok) {
      const error = await ServiceError.create('attendeeactivities/publish failed', response, request);
      LOG.info('Error publishing fact', request.url, error.responseStatus, error.responseBody);
    }
  }

  async getEventWebAppStatus(authToken: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder(authToken, 'event-hub/published')
      .query('environment', this.environment)
      .query('eventId', this.eventId)
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('getEventWebAppStatus failed', response, request);
      LOG.info('Error getting event webapp status', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }
}
