import { getQueryParam, getPersistRegType } from '../queryUtils';

describe('Test getQueryParam', () => {
  test('should not fail when missing', () => {
    expect(getQueryParam({ a: '1' }, 'refid')).toBe(undefined);
  });
  test('should handle lowercase', () => {
    expect(getQueryParam({ refid: '1' }, 'refid')).toBe('1');
  });
  test('should handle mixed case', () => {
    expect(getQueryParam({ rEfId: 'pencil' }, 'refid')).toBe('pencil');
  });
});

describe('Test getPersistRegType', () => {
  test('should be true when param includes rt', () => {
    expect(getPersistRegType({ rt: 'encodedRegTypeId', other: 'otherParams' })).toBeTruthy();
  });
  test('should be true when param includes registrationTypeId', () => {
    expect(getPersistRegType({ registrationTypeId: 'decodedRegTypeId', other: 'otherParams' })).toBeTruthy();
  });
  test('should be false when param is empty', () => {
    expect(getPersistRegType({})).toBeFalsy();
  });
  test('should be false when param include something else', () => {
    expect(getPersistRegType({ i: 'encodedInviteeId', other: 'otherParams' })).toBeFalsy();
  });
});
