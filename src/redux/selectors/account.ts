import { getIn } from 'icepick';

/**
 * Get account snapshot version
 * @param state
 * @returns account Snapshot Version
 */
export const getAccountSnapshotVersion = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['account', 'version']);
};
