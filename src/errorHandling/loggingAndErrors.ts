import Logger, {
  DebugLevels,
  setDebugLevel,
  setLogClient,
  CompositeLogClient,
  ConsoleLogClient
} from '@cvent/nucleus-logging';
import RemoteLogClient from '@cvent/nucleus-remote-log-client';
import { SessionTimedOutError } from '../dialogs/SessionTimedOutDialog';
import { ServiceError } from '@cvent/event-ui-networking';
import redirectToErrorPage from '../utils/redirectToErrorPage';
import { httpLogPageLoadId } from '@cvent/nucleus-networking';
import { debounce } from 'lodash';

const LOG = new Logger('event-guestside-site/GLOBAL');

let loggingAppSettings;
let remoteClient;

// For tests
export function setupLoggingForTest(remoteClientValue: $TSFixMe, appSettings?: $TSFixMe): $TSFixMe {
  remoteClient = remoteClientValue;
  loggingAppSettings = appSettings;
}

const logDevelopmentError = debounce(
  exception => {
    if (exception.stack && exception.stack.indexOf('invokeGuardedCallbackDev') >= 0) {
      /*
       * Ignore errors that will be processed by componentDidCatch.
       * SEE: https://github.com/facebook/react/issues/10474
       * This should only matter with development build because errors are rethrown to facilitate debugging
       */
      return;
    }
    // eslint-disable-next-line no-alert
    alert(
      'A fatal error occurred. This will cause the instance page to appear in production. ' +
        'Look at console for more details on what occurred. To enable fatal error page ' +
        'run the command "IS_DEBUG=false pnpm dev"'
    );
  },
  30000,
  { leading: true }
);

export async function logErrorAndRedirect(
  message: $TSFixMe,
  exception: $TSFixMe,
  ...rest: $TSFixMe[]
): Promise<$TSFixMe> {
  if (exception instanceof SessionTimedOutError || isAbortError(exception)) {
    return;
  }

  const errorType = exception instanceof ServiceError ? 'ServiceError' : 'ClientError';

  LOG.error(message, errorType, exception, ...rest, { version: (window as $TSFixMe).version });
  if (remoteClient) {
    const flushPromise = remoteClient.flushNow();
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 2500));
    await Promise.race([flushPromise, timeoutPromise]);
  }

  try {
    if (loggingAppSettings.isDebug) {
      logDevelopmentError(exception);
    } else {
      redirectToErrorPage(
        loggingAppSettings.viewRoot,
        loggingAppSettings.eventContext.eventId,
        loggingAppSettings.environment,
        exception.httpLogRequestId
      );
    }
  } catch (e) {
    console.error('Error logging.', e); // eslint-disable-line no-console
  }
}

function isAbortError(error) {
  // Connection was aborted by something, we don't care about this
  return error.name === 'AbortError';
}

function isFetchError(error) {
  // Fetch network request completely failed, e.g. network offline
  return error.name === 'FetchError';
}

// Error when a webpack chunk fails to load
function isChunkLoadError(error) {
  // Webpack chunk failed to load
  return error.name === 'ChunkLoadError';
}

export function isNetworkError(error: $TSFixMe): $TSFixMe {
  return isChunkLoadError(error) || isFetchError(error);
}

function isThirdPartyError(error) {
  /*
   * Lack of error information usually indicates error in a script from another domain that we are blocked from seeing
   * much information about because of cross-origin restrictions. We aren't responsible for these errors (most likely
   * some stupid tracking script the client is using), so don't do anything about them.
   */
  return !error || (!error.line && !error.column && !error.stack);
}

const assetDomain = process.env.NODE_ENV === 'production' ? 'cvent-assets.com' : 'localhost';

function isProbablyCodeSnippetOrExtension(error, { file }: $TSFixMe = {}) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (file && file.includes(assetDomain)) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return !(error && error.stack && error.stack.includes(assetDomain));
}

let handleNetworkError;

export function runNetworkErrorHandler(): $TSFixMe {
  return handleNetworkError();
}

export function setNetworkErrorHandler(handler: $TSFixMe): $TSFixMe {
  handleNetworkError = handler;
}

export function initializeLogging(appSettings: $TSFixMe, eventId: $TSFixMe): $TSFixMe {
  const { debugLevel = DebugLevels.WARN, logToServer = true, environment, serviceBaseUrl } = appSettings;
  loggingAppSettings = appSettings;

  setDebugLevel(debugLevel);
  setNetworkErrorHandler(error => logErrorAndRedirect('Global Unhandled Network Error During Page Load', error));
  if (logToServer) {
    remoteClient = new RemoteLogClient({
      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ httpLogPageLoadId: string; }' is not assig... Remove this comment to see the full error message
      context: { httpLogPageLoadId },
      url: `${serviceBaseUrl}/v1/log?environment=${environment}&eventId=${eventId}`,
      maxMessagesPerInterval: 200,
      maxWaitMs: 5000
    });
    const compositeClient = new CompositeLogClient(remoteClient, new ConsoleLogClient());
    setLogClient(compositeClient);
  }
  global.onunhandledrejection = async event => {
    let reason;
    try {
      reason = await event.reason;
      if (!reason) {
        // Probably an error in a third-party script because we don't manually use reject
        LOG.warn({ message: 'unhandledrejection event had no reason', event });
        return;
      }
    } catch (error) {
      reason = error;
      if (!reason) {
        reason = { message: 'unhandledrejection event reason promise rejected with no value', event };
      }
    }
    if (isNetworkError(reason)) {
      LOG.info('network error happened', reason);
      handleNetworkError(reason);
    } else if (isThirdPartyError(reason)) {
      LOG.warn('Third Party Script Unhandled Rejection', reason);
    } else if (isProbablyCodeSnippetOrExtension(reason)) {
      LOG.warn('Unhandled Promise Probably Code Snippet or Extension', reason);
    } else {
      void logErrorAndRedirect('Global Unhandled Promise Rejection', reason);
    }
  };
  window.onerror = (message, file, line, column, error) => {
    if (isThirdPartyError(error)) {
      /*
       * Error in a script that we are prevented from seeing because of cross-origin party
       * Probably a third party script in a code snippet that we aren't responsible for
       */
      LOG.warn('Third Party Script Unhandled Error', error, { message, file, line, column });
    } else if (isProbablyCodeSnippetOrExtension(error, { message, file, line, column })) {
      LOG.warn('Unhandled Error Probably Code Snippet or Extension', error, { message, file, line, column });
    } else {
      void logErrorAndRedirect('Global Unhandled Error', error, { message, file, line, column });
    }
  };
}
