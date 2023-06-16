export default class AttendeeLoginClient {
  baseUrl: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  userType: $TSFixMe;
  constructor(baseUrl: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe, userType: $TSFixMe) {
    this.baseUrl = baseUrl;
    this.eventId = eventId;
    this.environment = environment;
    this.userType = userType;
  }

  async authorize(): Promise<$TSFixMe> {
    window.location.assign(
      `${this.baseUrl}attendeeLogin/${this.eventId}/authorize?environment=${this.environment}&userType=${this.userType}`
    );
  }
}
