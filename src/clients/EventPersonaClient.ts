import { RequestBuilder } from '@cvent/nucleus-networking';
import { SESSION_HEADER_EVENT_ID, SESSION_HEADER_USER_TYPE } from '@cvent/event-ui-networking';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';
import Logger from '@cvent/nucleus-logging';
import { ServiceError } from '@cvent/event-ui-networking';

const LOG = new Logger('EventPersonaClient');

function createIdentity(eventId, inviteeId, isContactIdRequired) {
  return { eventId, inviteeId, isContactIdRequired };
}

function convertResponseToInvitee(response) {
  return {
    eventId: response.persona.eventId,
    inviteeId: response.persona.inviteeId,
    inviteeStatus: response.persona.status,
    contactId: response.persona.contactId
  };
}

/**
 * The event persona evaluation client
 */
export default class EventPersonaClient {
  environment: $TSFixMe;
  eventId: $TSFixMe;
  eventPersonaBaseUrl: $TSFixMe;
  request: $TSFixMe;
  constructor(baseUrl: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe, userType: $TSFixMe) {
    this.eventPersonaBaseUrl = baseUrl + 'registration/v1/event_persona_evaluation';
    this.environment = environment;
    this.eventId = eventId;
    this.request = new RequestBuilder({ url: this.eventPersonaBaseUrl })
      .withCookies()
      .header(SESSION_HEADER_EVENT_ID, eventId)
      .header(SESSION_HEADER_USER_TYPE, userType);
  }

  async identifyInvitee(authToken: $TSFixMe, inviteeId: $TSFixMe, isContactIdRequired = false): Promise<$TSFixMe> {
    LOG.debug('searchInvitee', inviteeId);
    const request = this.request
      .url(`${this.eventPersonaBaseUrl}/identify`)
      .query('environment', this.environment)
      .post()
      .json(createIdentity(this.eventId, inviteeId, isContactIdRequired))
      .auth(authToken)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const errorMessage = `identifyInvitee failed: ${this.eventPersonaBaseUrl}/identify:
          ${inviteeId} / ${response.status} - ${response.statusText}`;
      const error = await ServiceError.create(errorMessage, response, request);
      LOG.info('Error identifying invitee', error);
      throw error;
    }
    return convertResponseToInvitee(await response.json());
  }
}
