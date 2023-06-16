export default class MockEventGuestClient {}

Object.assign(MockEventGuestClient.prototype, {
  logout: jest.fn(() => Promise.resolve()),
  getOptOutStatus: jest.fn(() => Promise.resolve()),
  optOut: jest.fn(() => Promise.resolve()),
  getRegistrationContent: jest.fn(() =>
    Promise.resolve({
      registrationPathId: 'regPathId',
      pageVariety: 'REGISTRATION',
      pageIds: [],
      pages: {},
      layoutItems: {},
      registrationPath: {
        id: 'regPathId',
        registrationPageFields: [],
        modification: {}
      }
    })
  ),
  getWebsiteContent: jest.fn(() => Promise.resolve({}))
});
