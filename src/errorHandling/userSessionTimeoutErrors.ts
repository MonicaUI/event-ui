import { redirectToExternalAuth, redirectToOAuth } from '../redux/pathInfo';
import { openSessionTimedOutDialog } from '../dialogs/SessionTimedOutDialog';
import { AppThunk } from '../redux/reducer';
import { Headers } from 'whatwg-fetch';

/**
 * Handles session timeout based on the custom header 'ACCESS-FAILED'
 * @param headers: Headers
 */
export function handleUserSessionTimeoutErrors(headers: Headers): AppThunk {
  return async (dispatch, getState) => {
    const failedReason = headers.get('ACCESS-FAILED');
    const { event, account } = getState();
    switch (failedReason) {
      case 'EXTERNAL_AUTH':
        return redirectToExternalAuth(event, account);
      case 'OAUTH':
        return redirectToOAuth(event, account);
      case 'REG_CART_EXPIRED':
        return dispatch(openSessionTimedOutDialog());
      default:
        return;
    }
  };
}
