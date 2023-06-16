import React from 'react';
import StandardDialog from './shared/StandardDialog';
import { openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import CommonErrorDialogStyles from './styles/DialogError.less';
import { getCurrentPageId, redirectToPage } from '../redux/pathInfo';
import { logoutRegistrant, logoutPlanner } from '../redux/registrantLogin/actions';
import getDialogContainerStyle from './shared/getDialogContainerStyle';
import { isLoggedIn } from '../redux/selectors/currentRegistrant';
import { hasAccessToWebsitePages } from '../redux/selectors/event';
import { fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { GUEST_REGISTRATION, isPostRegistrationPage, REGISTRATION } from '../redux/website/registrationProcesses';
import { withStyles } from './ThemedDialog';
import { containsVideoWidget } from '../utils/widgetUtils';
import { AppThunk } from '../redux/reducer';

export class SessionTimedOutError {}

/**
 * Creates a wrapper around `fetch` that
 *  1. tracks the 'Cvent-Session-Expiry' header in responses and opens a session timeout dialog at the indicated time
 *  2. opens the session timeout dialog when receiving a 401 response
 */
function createFetchWithSessionTimeoutDialog(store) {
  let timedOpen: number;
  function scheduleTimedOpen(msFromNow: number) {
    if (timedOpen) {
      window.clearTimeout(timedOpen);
    }
    timedOpen = window.setTimeout(() => {
      const state = store.getState();
      const hasPostRegLogin = isLoggedIn(state);
      const onRegistrationPage =
        REGISTRATION.isTypeOfCurrentPage(state) || GUEST_REGISTRATION.isTypeOfCurrentPage(state);
      const currentPageId = getCurrentPageId(state);
      const onPostRegistrationPage = isPostRegistrationPage(state, currentPageId);
      let shouldSuppressSessionTimeOutPopup = false;
      if (onPostRegistrationPage) {
        // suppress popup if video widget is dropped on a post reg page
        shouldSuppressSessionTimeOutPopup = containsVideoWidget(state.website, currentPageId);
      }

      /**
       * if video widget is placed on any of the PostReg pages
       * suppress the session timeout popup
       */
      if (shouldSuppressSessionTimeOutPopup) {
        return;
      }

      /*
       * If the session ending has user-visible effects,
       * i.e. their post reg pages disappear or they are on a registration page
       * then show the session time out message, otherwise, just silently clear their session
       */
      if (hasPostRegLogin || onRegistrationPage) {
        store.dispatch(openSessionTimedOutDialog());
      } else {
        store.dispatch(logoutRegistrant());
      }
    }, msFromNow);
  }

  async function fetch(request) {
    const response = await fetchAndRetryIfServerBusy(request);
    if (response.status === 401) {
      store.dispatch(openSessionTimedOutDialog());
      throw new SessionTimedOutError();
    }
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (response.headers && response.headers.has('Cvent-Session-Expiry')) {
      const msToExpiration = Number.parseInt(response.headers.get('Cvent-Session-Expiry'), 10);
      if (msToExpiration) {
        scheduleTimedOpen(msToExpiration);
      }
    }
    return response;
  }
  return fetch;
}

let _fetchWithSessionTimeout;
export function initializeFetchWithSessionTimeout(store: $TSFixMe): $TSFixMe {
  _fetchWithSessionTimeout = createFetchWithSessionTimeoutDialog(store);
}

export function fetchWithSessionTimeout(request: $TSFixMe): $TSFixMe {
  if (!_fetchWithSessionTimeout) {
    throw new Error('fetch with session timeout is not initialized');
  }
  return _fetchWithSessionTimeout(request);
}

const Dialog = withStyles(StandardDialog);

export function openSessionTimedOutDialog(): AppThunk {
  return (dispatch, getState) => {
    const state = getState();
    const {
      text: { translate },
      defaultUserSession: { isPlanner },
      plannerRegSettings: { exitUrl }
    } = state;
    const exitSessionTimedOut = async () => {
      if (isPlanner) {
        await dispatch(logoutPlanner(exitUrl));
        return;
      }
      const areWebsitePagesAccessible = hasAccessToWebsitePages(state);
      await dispatch(logoutRegistrant());
      dispatch(redirectToPage(areWebsitePagesAccessible ? '' : 'register'));
    };

    const dialog = (
      <Dialog
        onClose={exitSessionTimedOut}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        message={translate('Flex_SessionTimedOut_SubTitle__resx')}
        subMessage={translate('Flex_SessionTimedout_Message__resx')}
        title={translate('Flex_SessionTimedOut_Title__resx')}
        icon="time"
        iconModifier="success"
        classes={CommonErrorDialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, exitSessionTimedOut, {
        classes: { dialogContainer: CommonErrorDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
}
