import { checkEventPasscodeProtected } from '../securityUtils';

jest.mock('../../redux/website/registrationProcesses', () => ({
  ...jest.requireActual<$TSFixMe>('../../redux/website/registrationProcesses'),
  __esModule: true,
  isRegistrationPage: () => true
}));

describe('security Utils', () => {
  let authenticationLocation = 0;
  let authenticationType = 2;
  it('Returns false when the authentication type is 2, location is 0 and website password is validated', async () => {
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(flag).toBe(false);
  });
  it('Returns true when the authentication type is 2, location is 1 and website password is not validated', async () => {
    authenticationLocation = 1;
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      false
    );
    expect(flag).toBe(true);
  });
  it('Returns false when the authentication type is 2, location is 1 and website password is validated', async () => {
    authenticationLocation = 1;
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(flag).toBe(false);
  });
  it('Returns false when the authentication type is 0', async () => {
    authenticationType = 0;
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(flag).toBe(false);
  });
  it('Returns false when the authentication type is 1', async () => {
    authenticationType = 1;
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(flag).toBe(false);
  });
  it('Returns false for the default case', async () => {
    authenticationType = 100;
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(flag).toBe(false);
  });
  it('Returns false for authentication type and location both being false', async () => {
    authenticationType = 2;
    authenticationLocation = 2;
    const flag = checkEventPasscodeProtected(
      authenticationType,
      authenticationLocation,
      undefined,
      undefined,
      undefined,
      true
    );
    expect(flag).toBe(false);
  });
});
