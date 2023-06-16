/* eslint-env jest */
import * as event from '../event';
import { setIn } from 'icepick';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import * as eventClosedReason from 'event-widgets/clients/EventClosedReason';
import { canAccessWebsitePages, cannotAccessAlreadyRegisteredPage } from 'event-widgets/redux/selectors/event';

jest.mock('event-widgets/redux/selectors/event', () => {
  return {
    ...jest.requireActual<$TSFixMe>('event-widgets/redux/selectors/event'),
    canAccessWebsitePages: jest.fn(),
    cannotAccessAlreadyRegisteredPage: jest.fn()
  };
});

const mockStateWithFeesEnabled = {
  event: {
    eventFeatureSetup: {
      fees: {
        fees: true
      }
    }
  }
};

const mockStateWithFeesNotEnabled = {
  event: {
    eventFeatureSetup: {
      fees: {
        fees: false
      }
    }
  }
};

const mockStateWithNoFeesStructure = {
  event: {
    eventFeatureSetup: {}
  }
};

const mockStateWithWaitlistFeatureEnabled = {
  event: {
    status: eventStatus.ACTIVE,
    eventFeatureSetup: {
      registrationProcess: {
        eventWaitlist: true,
        multipleRegistrationPaths: false
      }
    }
  }
};

const mockAppDataWithRegPathLevelAllowWaitlistFlagNotPresent = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        'test-registration-path-id': {}
      }
    }
  }
};

const mockAppDataWithRegPathLevelAllowWaitlist = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        'test-registration-path-id': {
          allowWaitlist: true
        }
      }
    }
  }
};

const mockAppDataWithRegPathLevelNotAllowWaitlist = {
  appData: {
    registrationSettings: {
      registrationPaths: {
        'test-registration-path-id': {
          allowWaitlist: false
        }
      }
    }
  }
};

const mockStateWithWaitlistFeatureNotEnabled = {
  event: {
    eventFeatureSetup: {
      registrationProcess: {
        eventWaitlist: false
      }
    }
  }
};

describe('Check if fee is enabled for an event', () => {
  test('feesEnabled is enabled', () => {
    const isFeesEnabled = event.isFeesEnabled(mockStateWithFeesEnabled);
    expect(isFeesEnabled).toBe(true);
  });
  test('feesSetup is not enabled', () => {
    const isFeesEnabled = event.isFeesEnabled(mockStateWithFeesNotEnabled);
    expect(isFeesEnabled).toBe(false);
  });
  test('Fees structure is not present', () => {
    const isFeesEnabled = event.isFeesEnabled(mockStateWithNoFeesStructure);
    expect(isFeesEnabled).toBe(false);
  });
});

describe('Check if waitlist is allowed based on feature setting and reg path settings', () => {
  test('Waitlist feature is turned off at event level', () => {
    const isWaitlistEnabled = event.isWaitlistEnabled(mockStateWithWaitlistFeatureNotEnabled, '');
    expect(isWaitlistEnabled).toBe(false);
  });
  test('Waitlist feature is turned on at event level, but reg path level flag is not present', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlistFlagNotPresent };
    const isWaitlistEnabled = event.isWaitlistEnabled(state, 'test-registration-path-id');
    expect(isWaitlistEnabled).toBe(true);
  });
  test('Waitlist feature is turned on at event level, but reg path level flag is not present 1', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlistFlagNotPresent };
    const newState = setIn(
      state,
      ['event', 'eventFeatureSetup', 'registrationProcess', 'multipleRegistrationPaths'],
      true
    );
    const isWaitlistEnabled = event.isWaitlistEnabled(newState, 'test-registration-path-id');
    expect(isWaitlistEnabled).toBe(true);
  });
  test('Waitlist feature is turned on at event level, but reg path feature is off', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelNotAllowWaitlist };
    const isWaitlistEnabled = event.isWaitlistEnabled(state, 'test-registration-path-id');
    expect(isWaitlistEnabled).toBe(false);
  });
  test('Waitlist feature is turned on at event level, but reg path flag is on', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlist };
    const newState = setIn(
      state,
      ['event', 'eventFeatureSetup', 'registrationProcess', 'multipleRegistrationPaths'],
      true
    );
    const isWaitlistEnabled = event.isWaitlistEnabled(newState, 'test-registration-path-id');
    expect(isWaitlistEnabled).toBe(true);
  });
  test('Waitlist feature is turned on at event level, but reg path flag is off', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelNotAllowWaitlist };
    const newState = setIn(
      state,
      ['event', 'eventFeatureSetup', 'registrationProcess', 'multipleRegistrationPaths'],
      true
    );
    const isWaitlistEnabled = event.isWaitlistEnabled(newState, 'test-registration-path-id');
    expect(isWaitlistEnabled).toBe(false);
  });
});

describe('Check if the event allows waitlist', () => {
  test('Event is ACTIVE', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlist };
    const canWaitlist = event.canWaitlist(state, 'test-registration-path-id');
    expect(canWaitlist).toBe(false);
  });
  test('Event is closed and the closed reason is CAPACITY', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlist };
    let newState = setIn(state, ['event', 'status'], eventStatus.CLOSED);
    newState = setIn(newState, ['event', 'closedReason'], eventClosedReason.CAPACITY);
    const canWaitlist = event.canWaitlist(newState, 'test-registration-path-id');
    expect(canWaitlist).toBe(true);
  });
  test('Event is closed and the closed reason is not CAPACITY', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlist };
    let newState = setIn(state, ['event', 'status'], eventStatus.CLOSED);
    newState = setIn(newState, ['event', 'closedReason'], eventClosedReason.PLANNER_ACTION);
    const canWaitlist = event.canWaitlist(newState, 'test-registration-path-id');
    expect(canWaitlist).toBe(true);
  });
  test('Event is closed and the closed reason is not present', () => {
    const state = { ...mockStateWithWaitlistFeatureEnabled, ...mockAppDataWithRegPathLevelAllowWaitlist };
    const newState = setIn(state, ['event', 'status'], eventStatus.CLOSED);
    const canWaitlist = event.canWaitlist(newState, 'test-registration-path-id');
    expect(canWaitlist).toBe(true);
  });
});

test('getEventSnapshotVersion', () => {
  const state = {
    event: {
      version: 'eventSnapshotVersion'
    }
  };
  expect(event.getEventSnapshotVersion(state)).toEqual('eventSnapshotVersion');
});

describe('Check if the website pages are accessible', () => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
  canAccessWebsitePages.mockImplementation(() => true);
  const eventData = { id: 'BLAH', status: 'SOMETHING' };
  test('hasAccessToWebsitePages should return the appropriate value', () => {
    const state = {
      event: eventData,
      defaultUserSession: {
        isPreview: false,
        isTestMode: false
      }
    };
    const value = event.hasAccessToWebsitePages(state);
    expect(value).toBeTruthy();

    expect(canAccessWebsitePages).toHaveBeenCalledWith(eventData, false);
  });

  test('hasAccessToWebsitePages in preview mode should return true', () => {
    const state = { event: eventData, defaultUserSession: { isPreview: true, isTestMode: false } };
    const value = event.hasAccessToWebsitePages(state);
    expect(value).toBeTruthy();
    expect(canAccessWebsitePages).toHaveBeenCalledWith(eventData, true);
  });

  test('hasAccessToWebsitePages in test mode should return true', () => {
    const state = { event: eventData, defaultUserSession: { isPreview: false, isTestMode: true } };
    const value = event.hasAccessToWebsitePages(state);
    expect(value).toBeTruthy();
    expect(canAccessWebsitePages).toHaveBeenCalledWith(eventData, true);
  });

  test('hasAccessToWebsitePages should return the appropriate value for embedded registration', () => {
    const state = {
      event: eventData,
      pathInfo: { rootPath: '/event/event-id' },
      defaultUserSession: { isPreview: false }
    };
    expect(event.hasAccessToWebsitePages(state)).toBeTruthy();
    (state as $TSFixMe).isEmbeddedRegistration = true;
    expect(event.hasAccessToWebsitePages(state)).toBeFalsy();
  });
});

test('hasNoAccessToAlreadyRegisteredPage should return the appropriate value', () => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
  cannotAccessAlreadyRegisteredPage.mockImplementation(() => true);
  const eventData = { id: 'BLAH', status: 'SOMETHING' };

  const state = { event: eventData };
  const value = event.hasNoAccessAlreadyRegisteredPage(state);
  expect(value).toBeTruthy();

  expect(cannotAccessAlreadyRegisteredPage).toHaveBeenCalledWith(eventData);
});
