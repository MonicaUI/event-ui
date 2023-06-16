import AttendeeLoginClient from '../AttendeeLoginClient';

const baseUrl = 'https://cvent.com/';
const eventId = 'eventId';
const environment = 'S408';
const userType = 'Attendee';
const client = new AttendeeLoginClient(baseUrl, eventId, environment, userType);

describe('Attendee Login Client Tests', () => {
  test('Authorize performs a redirect.', async () => {
    delete window.location;
    // @ts-expect-error ts-migrate(2740) FIXME: Type '{ assign: Mock<() => void, []>; }' is missin... Remove this comment to see the full error message
    window.location = { assign: jest.fn(() => () => {}) };
    await client.authorize();
    expect(window.location.assign).toHaveBeenCalledWith(
      `${baseUrl}attendeeLogin/${eventId}/authorize?environment=${environment}&userType=${userType}`
    );
  });
});
