import { selectPasskeyHotel, modifyPasskeyRequest } from '../passkeyHotelRequest';

jest.mock('../../registrationForm/regCart/selectors', () => {
  return {
    getPrimaryRegistrationId: jest.fn(),
    getAttendeeId: jest.fn()
  };
});

jest.mock('../../selectors/currentRegistrationPath', () => {
  return {
    getRegistrationPathIdOrDefault: jest.fn(() => 'REG_PATH_ID')
  };
});

jest.mock('../../selectors/currentRegistrant', () => {
  return {
    getRegistrationTypeId: jest.fn(() => 'REG_TYPE_ID'),
    getAttendeeId: jest.fn(() => 'ATTENDEE_ID')
  };
});

const defaultState = {
  accessToken: 'dummyToken',
  clients: {
    passkeyClient: {
      getNewRequestRedirectUrl: jest.fn().mockReturnValue('http://newRequestDummyUri'),
      getEditRequestRedirectUrl: jest.fn().mockReturnValue('http://editRequestDummyUri')
    }
  }
};

describe('selectPasskeyHotel method', () => {
  test('should call window.open with redirectUri', async () => {
    const url = await selectPasskeyHotel()(null, () => defaultState);
    expect(url).toBe('http://newRequestDummyUri');
  });
});

describe('modifyPasskeyRequest method', () => {
  test('should call window.open with redirectUri', async () => {
    window.open = jest.fn();
    await modifyPasskeyRequest()(null, () => defaultState);
    expect(window.open).toHaveBeenCalledWith('http://editRequestDummyUri', '_blank');
  });
});
