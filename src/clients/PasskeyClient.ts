/**
 * The passkey client
 */
export default class PasskeyClient {
  passkeyGuestSideUrl;
  environment;
  userType;
  eventId;
  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe, userType: $TSFixMe) {
    this.environment = environment;
    this.eventId = eventId;
    this.passkeyGuestSideUrl = `${baseURL}redirect/passkey`;
    this.userType = userType;
  }

  /**
   * Fetch passkey hotel request redirect url
   * @param inviteeId to get id corresponding to which passkey request need to be populated
   * @returns {Guest side endpoint url for new requests}
   */
  getNewRequestRedirectUrl(
    redirectedInviteeId: $TSFixMe,
    loggedInInviteeId: $TSFixMe,
    regPathId: $TSFixMe,
    regTypeId: $TSFixMe,
    pageUrl: $TSFixMe
  ): $TSFixMe {
    const requestUrl =
      `${this.passkeyGuestSideUrl}/new-reservation?environment=${this.environment}` +
      `&eventId=${this.eventId}` +
      `&redirectedInviteeId=${redirectedInviteeId}` +
      `&loggedInInviteeId=${loggedInInviteeId}` +
      `&userType=${this.userType}` +
      `&registrationPathId=${regPathId}` +
      `&registrationTypeId=${regTypeId}` +
      `&pageUrl=${pageUrl}`;
    return requestUrl;
  }

  /**
   * Fetch passkey hotel request redirect url
   * @param hotelReservationId hotel reservation id for which the redirect url is to be created
   * @returns {Guest side endpoint url for edit requests}
   */
  getEditRequestRedirectUrl(
    loggedInInviteeId: $TSFixMe,
    regPathId: $TSFixMe,
    regTypeId: $TSFixMe,
    hotelReservationId: $TSFixMe
  ): $TSFixMe {
    const requestUrl =
      `${this.passkeyGuestSideUrl}/edit-reservation?environment=${this.environment}` +
      `&eventId=${this.eventId}` +
      `&loggedInInviteeId=${loggedInInviteeId}` +
      `&userType=${this.userType}` +
      `&registrationPathId=${regPathId}` +
      `&registrationTypeId=${regTypeId}` +
      `&reservationId=${hotelReservationId}`;
    return requestUrl;
  }
}
