import { setupLoggingForTest, logErrorAndRedirect } from '../loggingAndErrors';
import redirectToErrorPage from '../../utils/redirectToErrorPage';
import { SessionTimedOutError } from '../../dialogs/SessionTimedOutDialog';
import { ServiceError } from '@cvent/event-ui-networking';
import { setLogClient } from '@cvent/nucleus-logging';
import RemoteLogClient from '@cvent/nucleus-remote-log-client';

let logs = [];
const logMessage = level =>
  jest.fn((marker, message, errorType, exception) =>
    logs.push({
      level,
      marker,
      message,
      errorType,
      exception
    })
  );

const mockLoggingFunctions = {
  error: logMessage('error')
};

// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
const remoteLogClient = new RemoteLogClient();
setupLoggingForTest(remoteLogClient);
setLogClient(remoteLogClient);

jest.mock('@cvent/nucleus-remote-log-client', () =>
  jest.fn(() => ({
    flushNow: () => Promise.resolve(),
    ...mockLoggingFunctions
  }))
);
jest.mock('../../utils/redirectToErrorPage');

function buildServiceError(responseStatus) {
  const response = {
    status: responseStatus,
    text: () => Promise.resolve('')
  };

  const request = {
    headers: {
      get: () => ''
    }
  };

  return ServiceError.create('test', response, request);
}

const appSettings = {
  viewRoot: '/test',
  environment: 'testEnv',
  eventContext: {
    eventId: 'testEvent'
  },
  isDebug: false
};

beforeEach(() => {
  jest.clearAllMocks();
  logs = [];
});

describe('logErrorAndRedirect', () => {
  test('should do nothing if error is a SessionTimeoutError', async () => {
    const exception = new SessionTimedOutError();
    setupLoggingForTest(remoteLogClient, appSettings);

    await logErrorAndRedirect('test', exception);

    expect(mockLoggingFunctions.error).not.toHaveBeenCalled();
    expect(redirectToErrorPage).not.toHaveBeenCalled();
    expect(logs).toHaveLength(0);
  });

  test('should show an alert box and not redirect if app is in debug mode', async () => {
    setupLoggingForTest(remoteLogClient, {
      ...appSettings,
      isDebug: true
    });

    await logErrorAndRedirect('test', {});

    expect(mockLoggingFunctions.error).toHaveBeenCalled();
    expect(redirectToErrorPage).not.toHaveBeenCalled();
    expect(logs).toMatchSnapshot();
  });

  test('should normally log and redirect', async () => {
    setupLoggingForTest(remoteLogClient, appSettings);
    await logErrorAndRedirect('test', {});

    expect(mockLoggingFunctions.error).toHaveBeenCalled();
    expect(redirectToErrorPage).toHaveBeenCalled();
    expect(logs).toMatchSnapshot();
  });

  test('should specify ServiceError in log message if instance type matches', async () => {
    const exception = await buildServiceError(666);
    setupLoggingForTest(remoteLogClient, appSettings);

    await logErrorAndRedirect('test', exception);

    expect(mockLoggingFunctions.error).toHaveBeenCalled();
    expect(redirectToErrorPage).toHaveBeenCalled();
    expect(logs).toMatchSnapshot();
  });
});
