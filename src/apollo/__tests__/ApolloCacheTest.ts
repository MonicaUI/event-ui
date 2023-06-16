import apolloCache from '../apolloCache';
import { eventSnapshotVersionVar } from '../../redux/actions';

describe('ApolloClient', () => {
  it('should read eventSnapshotVersionVar', () => {
    eventSnapshotVersionVar('test');
    const cache = apolloCache();
    expect(cache.config.typePolicies.Query.fields.eventSnapshotVersion.read()).toBe('test');
  });
});
