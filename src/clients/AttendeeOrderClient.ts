import { RequestBuilder } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';
import { ServiceError } from '@cvent/event-ui-networking';

export default class AttendeeOrderClient {
  attendeeOrderBaseUrl;
  environment;
  request;
  constructor(baseURL?: $TSFixMe, eventId?: $TSFixMe, environment?: $TSFixMe, authorizationToken?: $TSFixMe) {
    this.attendeeOrderBaseUrl = baseURL + 'attendee-order/v1/orders';
    this.environment = environment;
    this.request = new RequestBuilder({ url: this.attendeeOrderBaseUrl }).withCookies();
    this.request = this.request
      .header('Localized-Validations', 'true')
      .header(SESSION_HEADER_EVENT_ID, eventId)
      .auth(authorizationToken);
  }

  async getAttendeeOrders(eventId: $TSFixMe, attendeeId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.attendeeOrderBaseUrl}`)
      .query('eventId', eventId)
      .query('attendeeId', attendeeId)
      .query('environment', this.environment)
      .get()
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting attendee orders', response, request);
      throw error;
    }
    return await response.json();
  }
}
