import { RequestBuilder } from '@cvent/nucleus-networking';
import { SESSION_HEADER_EVENT_ID, SESSION_HEADER_USER_TYPE } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';
import { ServiceError } from '@cvent/event-ui-networking';
import { GET_HOTEL_ROOM_CAPACITIES } from 'event-widgets/lib/HotelRequest/useHotelRoomCapacity';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HotelRoomCapacities } from 'event-widgets/redux/modules/eventTravel';

const LOG = new Logger('TravelApiClient');

/**
 * The travel cart service client.
 */
export default class TravelApiClient {
  travelApiBaseUrl;
  travelCartBaseUrl;
  environment;
  request;
  createdBy;
  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe, userType: $TSFixMe, createdBy: $TSFixMe) {
    this.travelApiBaseUrl = baseURL + 'travel-booking/v1';
    this.travelCartBaseUrl = this.travelApiBaseUrl + '/travel-carts';
    this.environment = environment;
    this.createdBy = createdBy;
    this.request = new RequestBuilder({ url: this.travelApiBaseUrl }).withCookies();
    this.request = this.request.header(SESSION_HEADER_EVENT_ID, eventId).header(SESSION_HEADER_USER_TYPE, userType);
  }

  /**
   * get roommates
   * @param eventId
   * @param params search parameters for post body
   * @returns {Promise<*>}
   */
  async getRoommates(eventId: $TSFixMe, params: $TSFixMe, travelSnapshotVersion: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.travelApiBaseUrl}/roommates/${eventId}`)
      .header('Travel-Snapshot-Version', travelSnapshotVersion)
      .query('environment', this.environment)
      .post()
      .json(params)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error fetching roommates', response, request);
      LOG.info('Error fetching roommates', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Creates a travel cart
   * @param travelCart the travel cart to create
   */
  async createTravelCart(travelCart: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(this.travelCartBaseUrl)
      .header('Travel-Snapshot-Version', travelCart.travelSnapshotVersion)
      .header('Event-Snapshot-Version', travelCart.eventSnapshotVersion)
      .header('Created-By', this.createdBy)
      .query('environment', this.environment)
      .post()
      .json(travelCart)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error creating travel cart', response, request);
      LOG.info('Error creating travel cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Updates a travel cart
   * @param travelCart what to update the travel cart to
   */
  async updateTravelCart(travelCart: $TSFixMe): Promise<$TSFixMe> {
    const requestToBuild = this.request
      .url(`${this.travelCartBaseUrl}/${travelCart.id}`)
      .query('environment', this.environment)
      .put()
      .json(travelCart);
    const request = requestToBuild.build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error updating travel cart', response, request);
      LOG.info('Error updating travel cart', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Get a travel cart
   * @param {*} travelCartId the travel cart id corresponding to which the travel cart is to be fetched
   */
  async getTravelCart(travelCartId: $TSFixMe): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.travelCartBaseUrl}/${travelCartId}`)
      .query('environment', this.environment)
      .get()
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting travel cart', response, request);
      LOG.info('Error getting travel cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Gets transient travel cart
   * @param inviteeId to get id corresponding to which the transien travel cart needs to be populated
   * @param includeGroupMembers if include group members too in travelCart
   * @returns {Promise<*>}
   */
  async getTransientTravelCart(
    inviteeId: $TSFixMe,
    includeGroupMembers: $TSFixMe,
    travelCartActionRequest: $TSFixMe
  ): Promise<$TSFixMe> {
    const request = this.request
      .url(`${this.travelCartBaseUrl}/transient/${inviteeId}`)
      .query('environment', this.environment)
      .query('includeGroupMembers', includeGroupMembers)
      .post()
      .json(travelCartActionRequest)
      .build();
    const response = await fetchWithSessionTimeout(request);
    if (!response.ok) {
      const error = await ServiceError.create('Error getting travel cart', response, request);
      LOG.info('Error getting travel cart ', request.url, error.responseStatus, error.responseBody);
      throw error;
    }
    return await response.json();
  }

  /**
   * Fetches hotel room capacity summaries
   */
  async getHotelRoomCapacitySummaries(
    isInTestMode: boolean,
    contactTypeId: string,
    apolloClient: ApolloClient<InMemoryCache>
  ): Promise<HotelRoomCapacities> {
    const input = {
      isForTestMode: isInTestMode,
      contactTypeIds: [contactTypeId]
    };
    const result = await apolloClient.query({
      query: GET_HOTEL_ROOM_CAPACITIES,
      variables: {
        input,
        pathFunction: ({ args }) =>
          `${this.travelApiBaseUrl}/capacity/hotel-room-capacity/${args.eventId}?environment=${args.environment}`
      }
    });
    return result?.data?.response;
  }
}
