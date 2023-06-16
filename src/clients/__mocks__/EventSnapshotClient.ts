/**
 * This is a mock for EventSnapshotClient.js. The getEventSnapshot function is
 * instrumented with FutureExcutor, which can simulate a delay, such as network
 * latency, when set.
 * To enable the mock, one should add the following 2 lines:
 *  1. const eventSnapshotClient = require('<path-to-client>/EventSnapshotClient').default.prototype;
 *  2. import { FutureExecutor } from '<path-to-client>/__mocks__/EventSnapshotClient';
 * To enable the delay, the user of the mock should:
 *  1. Create the FutureExecutor, e.g. const futureExecutor = new FutureExecutor
 *  2. Invoke eventSnapshotClient.setFutureExecutor(futureExecutor);
 *  3. Invoke eventSnapshotClient.getEventSnapshot, either directly or indirectly
 *  4. Invoke futureExecutor.resolve(ARRAY_INDICATED_ORDER_OF_RESOLUTION, callbackFunction)
 */
import EventSnapshot from '../../../fixtures/EventSnapshot.json';

const eventSnapshot = { ...EventSnapshot.eventSnapshot, version: 'fIQoY_yI8DDWAUEtQw69TRSXXqKFSabH' };
const eventSnapshot2 = { ...EventSnapshot.eventSnapshot, version: 'yIlzAvkFA.DJJDLTvCAu3gkaiLNF29zu' };

const eventSnapshotMap = new Map();

const getLatestEventSnapshot = () => eventSnapshot2;

const getEventSnapshot = (eventId, options = {}) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'version' does not exist on type '{}'.
  const { version } = options;
  let foundEventSnapshot;
  if (version) {
    foundEventSnapshot = eventSnapshotMap.get(version);
  } else {
    foundEventSnapshot = getLatestEventSnapshot();
  }
  return foundEventSnapshot;
};

export class FutureExecutor {
  promises: $TSFixMe;
  resolvers: $TSFixMe;
  constructor() {
    this.promises = [];
    this.resolvers = [];
  }

  execute =
    (method: $TSFixMe): $TSFixMe =>
    (...args: $TSFixMe[]): $TSFixMe => {
      const p = new Promise(resolve => this.resolvers.push(resolve.bind(null, method(...args))));
      this.promises.push(p);
      return p;
    };

  async resolve(taskIds: $TSFixMe, resolveCallback: $TSFixMe): Promise<$TSFixMe> {
    taskIds.forEach(taskId => this.resolvers[taskId]());
    await Promise.all(this.promises);
    this.resolvers = [];
    this.promises = [];
    resolveCallback();
  }
}

export default class EventSnapshotClient {
  futureExecutor: $TSFixMe;
  constructor() {
    this.initialize();
  }

  initialize(): $TSFixMe {
    eventSnapshotMap.clear();
    eventSnapshotMap.set(eventSnapshot.version, eventSnapshot);
    eventSnapshotMap.set(eventSnapshot2.version, eventSnapshot2);
  }

  setFutureExecutor(futureExecutor: $TSFixMe): $TSFixMe {
    this.futureExecutor = futureExecutor;
  }

  getFutureExecutor(): $TSFixMe {
    return this.futureExecutor;
  }

  getLatestEventSnapshot(): $TSFixMe {
    return getLatestEventSnapshot();
  }

  getEventSnapshot(eventId: $TSFixMe, options = {}): $TSFixMe {
    const futureExecutor = this.getFutureExecutor();
    if (futureExecutor) {
      this.setFutureExecutor(null);
      return futureExecutor.execute(getEventSnapshot)(eventId, options);
    }
    return getEventSnapshot(eventId, options);
  }

  isLatestSnapshotVersion(
    eventId: $TSFixMe,
    accountSnapshotVersion: $TSFixMe,
    eventSnapshotVersion: $TSFixMe
  ): $TSFixMe {
    return eventSnapshot2.version === eventSnapshotVersion; // need to add account check
  }
}
