/* eslint-env jest */
import { getAccountSnapshotVersion } from '../account';

const state = {
  account: {
    version: 'accountSnapshotVersion'
  }
};
test('getAccountSnapshotVersion', () => {
  expect(getAccountSnapshotVersion(state)).toEqual('accountSnapshotVersion');
});
