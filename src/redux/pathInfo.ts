import path from 'path';
import history from '../myHistory';
import { isSingleSignOn } from './selectors/shared';
import { addGroupMemberEventRegIdToUrl, urlStrippedRetryAttempt, addRetryAttempt } from '../utils/registrationUtils';

export const SET_CURRENT_PAGE = 'event-guestside-site/pathInfo/SET_CURRENT_PAGE';
export const SET_NAVIGATION_DIALOG_CONFIG = 'event-guestside-site/pathInfo/SET_NAVIGATION_DIALOG_CONFIG';
export const EMBEDDED_REGISTRATION_ROOT = '/embedded-registration';

import Logger from '@cvent/nucleus-logging';
import { isOAuthOnInAccount } from './selectors/shared';
import { isOAuthOnInEvent } from './selectors/event';
import qs from 'querystring';
import querystring from 'querystring';
const LOG = new Logger('event-guestside-site/src/redux/actions/pathInfo');

export function getPagePath(state: $TSFixMe, pageId: $TSFixMe, includeQueryString = true): $TSFixMe {
  const {
    pathInfo: { rootPath }
  } = state;
  let newPath = path.join(rootPath, pageId);
  if (includeQueryString && global.location.search) {
    newPath = newPath + global.location.search;
  }
  LOG.debug(`path for ${pageId} is ${newPath}`);
  return newPath;
}

export function isInviteeInUrl(url: $TSFixMe): $TSFixMe {
  const queryParams = url.split('?')[1];
  return queryParams && (queryParams.includes('i=') || queryParams.includes('inviteeId='));
}

export function routeToUrl(url: $TSFixMe) {
  return (): $TSFixMe => {
    history.push(url);
  };
}

export function replaceUrl(url: $TSFixMe) {
  return (): $TSFixMe => {
    history.replace(url);
  };
}

export function routeToPage(pageId: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    history.push(getPagePath(getState(), pageId));
  };
}

export function routeToPageWithoutQueryString(pageId: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    history.push(getPagePath(getState(), pageId, false));
  };
}
export function routeToHomePage() {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    history.push(getPagePath(getState(), ''));
  };
}

export function routeToFirstPageOfRegistrationForGroup(
  currentEventRegistrationId = '',
  firstPageId = 'regProcessStep1'
) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    history.push(
      addGroupMemberEventRegIdToUrl(getPagePath(getState(), firstPageId), currentEventRegistrationId),
      false
    );
  };
}

/**
 * A browser redirect and restart the SPA
 * Note this kills the running app, and any unsaved state change is lost.
 */
export function redirectToPage(pageId: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    global.location.replace(getPagePath(getState(), pageId));
  };
}

export function redirectToExternalAuth(event: $TSFixMe, account: $TSFixMe): $TSFixMe {
  if (isSingleSignOn(account)) {
    const customTargetParam = account.settings.customTargetParam;
    redirectToURL(event, customTargetParam);
  } else {
    redirectToURL(event, 'TARGET');
  }
}

export function redirectToOAuth(
  event: $TSFixMe,
  account: $TSFixMe,
  regTypeStub?: $TSFixMe,
  regPathStub?: $TSFixMe
): $TSFixMe {
  if (isOAuthOnInAccount(account) && isOAuthOnInEvent(event)) {
    redirectToOAuthURL(event, regTypeStub, regPathStub);
  }
}

export function redirectToOAuthURL(event: $TSFixMe, regTypeStub?: $TSFixMe, regPathStub?: $TSFixMe): $TSFixMe {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (event && event.eventSecuritySetupSnapshot && event.eventSecuritySetupSnapshot.oAuthUrl) {
    let oauthUrl = event.eventSecuritySetupSnapshot.oAuthUrl;
    const urlPath = oauthUrl.split('?')[0];
    const parsedQueryParam = qs.parse(oauthUrl.split('?')[1]);
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | string[]' is not assign... Remove this comment to see the full error message
    const state = JSON.parse(parsedQueryParam.state);
    const guestsideQueryParams = qs.stringify(
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      window && window.location && querystring.parse(window.location.search.slice(1))
    );
    /*
     * Adds reg type, reg path and all guestside query params in Oauth state
     * We will add reg path only when we do not have reg type so as to give
     * preference to reg type and avoid cases where we can have
     * wrong reg path passed i.e. when the invitee updates the reg type and
     * then redirects to the external Identity Provider, in such cases we will not
     * have the updated reg path in react state
     */
    if (regTypeStub && regTypeStub !== '00000000-0000-0000-0000-000000000000') {
      state.regType = regTypeStub;
    } else if (regPathStub) {
      state.regPath = regPathStub;
    }
    if (guestsideQueryParams) {
      state.guestsideQueryParams = guestsideQueryParams;
    }
    parsedQueryParam.state = JSON.stringify(state);
    oauthUrl = urlPath.concat('?', qs.stringify(parsedQueryParam));
    global.location.replace(oauthUrl);
  }
}

function redirectToURL(event, targetUrlParam) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (event && event.eventSecuritySetupSnapshot && event.eventSecuritySetupSnapshot.authenticationUrl) {
    const targetUrl = encodeURIComponent(window.location.href);
    const authenitcationUrl = event.eventSecuritySetupSnapshot.authenticationUrl;
    let url;
    if (authenitcationUrl.includes('?')) {
      url = `${authenitcationUrl}&e=${event.id}&${targetUrlParam}=${targetUrl}`;
    } else {
      url = `${authenitcationUrl}?e=${event.id}&${targetUrlParam}=${targetUrl}`;
    }
    global.location.replace(url);
  }
}

/**
 * Takes the current uri, strips off the retry attempt querystring if present,
 * and replaces the current history entry with the new uri.
 */
export function stripRetryAttempt(): $TSFixMe {
  history.replace(urlStrippedRetryAttempt(global.location.toString()));
}

/**
 * Attempt to reload and restart the SPA using the same page it's currently on.
 * Note this kills the running app, and any unsaved state change is lost.
 */
export function retryLoadPage(): $TSFixMe {
  global.location.replace(addRetryAttempt(global.location.toString()));
}

/**
 * Sets the current page within the reducer.
 * @param {string} pageId - The id of the page to set as the current page.
 */
export function setCurrentPage(pageId: $TSFixMe): $TSFixMe {
  return {
    type: SET_CURRENT_PAGE,
    payload: {
      pageId,
      queryParams: qs.parse(global.location.search.split('?')[1])
    }
  };
}

/**
 * Sets the current page within the reducer.
 * @param {object} config - The config for the navigation dialog.
 */
export function setNavigationDialogConfig(config: $TSFixMe): $TSFixMe {
  return {
    type: SET_NAVIGATION_DIALOG_CONFIG,
    payload: config
  };
}

/**
 * Retrieves the id of the page the application is currently on.
 */
export function getCurrentPageId(state: $TSFixMe): $TSFixMe {
  return state.pathInfo.currentPageId;
}

const initialState = {
  rootPath: '',
  eventId: '',
  currentPageId: '',
  navigationDialogConfig: {
    isOpen: false
  },
  queryParams: {}
};

/**
 * Reducer managing the information describing the path the application is currently at.
 */
export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  const payload = action.payload || {};
  switch (action.type) {
    case SET_CURRENT_PAGE: {
      return {
        ...state,
        currentPageId: payload.pageId,
        queryParams: payload.queryParams
      };
    }
    case SET_NAVIGATION_DIALOG_CONFIG: {
      return {
        ...state,
        navigationDialogConfig: payload
      };
    }
    default:
      return state;
  }
}

/**
 * Determines whether the root path is for embedded registration
 */
export function isEmbeddedRegistrationWorkflow(rootPath: $TSFixMe): $TSFixMe {
  return rootPath?.startsWith(EMBEDDED_REGISTRATION_ROOT);
}
