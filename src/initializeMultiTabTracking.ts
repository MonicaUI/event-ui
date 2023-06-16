import { getDefaultWebsitePageId } from './redux/website';
import { getCurrentPageId } from './redux/pathInfo';
import { getRegistrationPaths } from './redux/website/selectors';
import uuid from 'uuid';
import { openRegistrationInOtherTabDialog } from './dialogs';
import { routeToPage, redirectToPage } from './redux/pathInfo';
import { closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  restoreRegistrationFromOtherTab,
  rescindAbortRegCartAndLogoutRequest,
  abortRegCartAndLogout
} from './redux/registrationForm/regCart';
import { updateIn } from 'icepick';
import { some, map } from 'lodash';
import { restoreTravelCartState } from './redux/travelCart/index';
import { loadEventSnapshotAndTransform } from './redux/actions';
import { DECLINE, GUEST_REGISTRATION, REGISTRATION, isRegistrationPage } from './redux/website/registrationProcesses';
import { setRescindAbortRegistrationRequest } from './redux/registrationForm/regCart/restore';
import { shouldAbortRegistration } from './utils/registrationUtils';

// Set the name of the hidden property and the change event for visibility
let hidden;
let visibilityChange;
if (typeof document.hidden !== 'undefined') {
  // Opera 12.10 and Firefox 18 and later support
  hidden = 'hidden';
  visibilityChange = 'visibilitychange';
  // @ts-expect-error ts-migrate(2551) FIXME: Property 'msHidden' does not exist on type 'Docume... Remove this comment to see the full error message
} else if (typeof document.msHidden !== 'undefined') {
  hidden = 'msHidden';
  visibilityChange = 'msvisibilitychange';
} else if (typeof (document as $TSFixMe).webkitHidden !== 'undefined') {
  hidden = 'webkitHidden';
  visibilityChange = 'webkitvisibilitychange';
}

// Set the session cookie
const setCookie = (key, value) => {
  document.cookie = `${key}=${value}`;
};

const getCookie = key => {
  const splitCookie = document.cookie.split(';');
  for (let i = 0; i < splitCookie.length; i++) {
    let item = splitCookie[i];
    item = item.trim();
    if (item.indexOf(`${key}=`) === 0) {
      return JSON.parse(item.substring(`${key}=`.length));
    }
  }
};

// Check if local storage is availble, setItem will fail in private browsing mode in older versions of Safari
const isLocalStorageAvailable = () => {
  const test = 'test';
  try {
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

const setLocalStorageItem = (key, value) => {
  if (isLocalStorageAvailable()) {
    // PROD-69458 if setItem fails try to delete old keys and retry
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return;
    } catch (e) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const localKey = window.localStorage.key(i);
        // check if localKey starts with 'registration-'
        const item = localKey.startsWith('registration-')
          ? JSON.parse(window.localStorage.getItem(localKey))
          : window.localStorage.getItem(localKey);
        /*
         * if item has a lastActiveTab attribute it isn't currently open in a tab, remove this key and
         * try to insert the active one
         */
        if (item.lastActiveTab) {
          window.localStorage.removeItem(localKey);
          try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return;
          } catch (er) {
            // set failed again we didn't clear enough space so continue
          }
        }
      }
    }
  }
  setCookie(key, JSON.stringify({ ...value, usingCookies: true, registrationState: true }));
};

const getLocalStorageItem = key => {
  if (isLocalStorageAvailable()) {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : item;
  }
  return getCookie(key);
};

const tabId = uuid.v4();

function markActiveTab(currentPage) {
  return (dispatch, getState) => {
    const state = getState();
    const eventId = state.event.id;
    const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
    setLocalStorageItem(`registration-${eventId}`, {
      ...tabWithActiveRegistration,
      activeTab: tabId,
      lastPage: currentPage
    });
  };
}

function continueRegistration() {
  return async (dispatch, getState) => {
    const state = getState();
    const eventId = state.event.id;
    const currentPage = getCurrentPageId(state);
    const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
    if (tabWithActiveRegistration.usingCookies) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      dispatch(redirectToPage(tabWithActiveRegistration.lastPage, true));
    } else {
      const { regCart, regCartPayment, modificationStartRegCart, regCartPricing, travelCart } =
        tabWithActiveRegistration.registrationState;
      dispatch(restoreRegistrationFromOtherTab(regCart, regCartPayment, regCartPricing, modificationStartRegCart));
      await dispatch(loadEventSnapshotAndTransform(regCart.eventSnapshotVersions[eventId]));
      await dispatch(restoreTravelCartState(travelCart));
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      dispatch(routeToPage(tabWithActiveRegistration.lastPage, true));
    }
    dispatch(closeDialogContainer());
    dispatch(markActiveTab(currentPage));
  };
}

function exitRegistration() {
  return (dispatch, getState) => {
    const state = getState();
    const eventId = state.event.id;
    const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
    if (tabWithActiveRegistration.usingCookies) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      dispatch(redirectToPage(tabWithActiveRegistration.lastPage, true));
    } else {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      dispatch(routeToPage(getDefaultWebsitePageId(getState(), true)));
    }
    dispatch(closeDialogContainer());
  };
}

/**
 * Prompt to take over a registration that is active in another tab
 */
export function promptToTakeOverRegistration() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(
      openRegistrationInOtherTabDialog(
        () => dispatch(exitRegistration()),
        () => dispatch(continueRegistration())
      )
    );
  };
}

export function isOtherActiveTabOnRegistrationStartPage(state: $TSFixMe, checkLastActiveTab?: $TSFixMe): $TSFixMe {
  const regStartPages = map(getRegistrationPaths(state), regPath =>
    REGISTRATION.forRegistrationPath(regPath.id).pageIds(state)
  );
  return some(regStartPages, pageId => isOtherActiveTab(state, pageId, checkLastActiveTab));
}

export function isOtherActiveTabOnDeclineStartPage(state: $TSFixMe, checkLastActiveTab?: $TSFixMe): $TSFixMe {
  const regDeclinePages = map(getRegistrationPaths(state), regPath => {
    return DECLINE.forRegistrationPath(regPath.id).startPageId(state);
  });
  return some(regDeclinePages, pageId => pageId && isOtherActiveTab(state, pageId, checkLastActiveTab));
}

/**
 * Check if another tab has an active registration in progress
 */
export function isOtherActiveTab(state: $TSFixMe, currentPage: $TSFixMe, checkLastActiveTab?: $TSFixMe): $TSFixMe {
  const eventId = state.event.id;
  const isRegistrationSessionEnabledPage =
    REGISTRATION.isTypeOfCurrentPage(state) ||
    GUEST_REGISTRATION.isTypeOfCurrentPage(state) ||
    DECLINE.isTypeOfCurrentPage(state);
  const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
  if (!isRegistrationSessionEnabledPage || !tabWithActiveRegistration || !tabWithActiveRegistration.registrationState) {
    return false;
  }
  if (tabWithActiveRegistration.activeTab && tabWithActiveRegistration.activeTab !== tabId) {
    return isRegistrationPage(state, tabWithActiveRegistration.lastPage);
  }
  if (!tabWithActiveRegistration.activeTab && checkLastActiveTab) {
    return tabWithActiveRegistration.lastActiveTab && isRegistrationPage(state, tabWithActiveRegistration.lastPage);
  }
  return false;
}

/**
 * Handle changing to a specified page
 */
export function handlePageChange(page: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    if (isOtherActiveTab(state, page)) {
      dispatch(promptToTakeOverRegistration());
    } else if (isRegistrationPage(state, page)) {
      dispatch(markActiveTab(page));
    }
  };
}

/**
 * Forces the current tab to mark itself as the active tab with passed in page.
 * Added with PROD-48301 to mark the tab that answers 'yes' or 'no' to Register Now dialog as active.
 */
export function forceTabToActive(pageId: $TSFixMe) {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const state = getState();
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
    dispatch(markActiveTab(state, pageId));
  };
}

/**
 * Remove sensitive information that is not supposed to be stored from payment details
 */
function removeSensitivePaymentInfo(regCartPayment) {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  if (regCartPayment && regCartPayment.pricingInfo && regCartPayment.pricingInfo.creditCard) {
    return updateIn(regCartPayment, ['pricingInfo', 'creditCard'], creditCard => {
      return { ...creditCard, number: '', cVV: '' };
    });
  }
}

/**
 * Initialize multi-tab tracking for the application
 */
export default (store: $TSFixMe, initialPage: $TSFixMe): $TSFixMe => {
  if (isOtherActiveTab(store.getState(), initialPage)) {
    store.dispatch(promptToTakeOverRegistration());
  } else {
    const state = store.getState();
    if (isRegistrationPage(state, initialPage)) {
      store.dispatch(markActiveTab(initialPage));
    }
  }

  /**
   * Special handling for returning to site quickly (example. page refresh)
   * Rescind the abort registration request which was previously sent during the window.unload event,
   * if the configured time limit hasn't passed
   */
  function onLoad() {
    const {
      event: { id: eventId },
      userSession: { abortRegistrationSecondsDelay = 0 }
    } = store.getState();
    const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
    if (tabWithActiveRegistration) {
      if (tabWithActiveRegistration.abortRegistrationSent) {
        const timeOfRequest = tabWithActiveRegistration.abortRegistrationSent;
        if (timeOfRequest + abortRegistrationSecondsDelay * 1000 > Date.now()) {
          // rescind request to abort registration as its likely a page refresh or quick navigation
          const rescindAbortRegistrationRequest = store.dispatch(rescindAbortRegCartAndLogoutRequest());
          setRescindAbortRegistrationRequest(rescindAbortRegistrationRequest);
        }
        delete tabWithActiveRegistration.abortRegistrationSent;
      }
      // add the tabId back into allOpenTabs list and save to local storage
      const allOpenTabs = tabWithActiveRegistration.allOpenTabs || [];
      setLocalStorageItem(`registration-${eventId}`, {
        ...tabWithActiveRegistration,
        allOpenTabs: [...allOpenTabs, tabId]
      });
    }
  }
  onLoad();

  window.addEventListener(
    'unload',
    () => {
      const state = store.getState();
      const eventId = state.event.id;
      const currentPage = getCurrentPageId(state);
      const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
      if (tabWithActiveRegistration) {
        let updatedTabWithActiveRegistration;
        if (tabWithActiveRegistration.activeTab === tabId) {
          updatedTabWithActiveRegistration = {
            lastActiveTab: tabId,
            lastPage: currentPage,
            registrationState: tabWithActiveRegistration.registrationState,
            allOpenTabs: tabWithActiveRegistration.allOpenTabs
          };
        }
        const allOpenTabs = tabWithActiveRegistration.allOpenTabs || [];
        const tabIndex = allOpenTabs.findIndex(allTabId => allTabId === tabId);
        if (tabIndex !== -1) {
          // remove the current tab from list of open registration tabs
          allOpenTabs.splice(tabIndex, 1);
          updatedTabWithActiveRegistration = updatedTabWithActiveRegistration
            ? { ...updatedTabWithActiveRegistration, allOpenTabs }
            : { ...tabWithActiveRegistration, allOpenTabs };
        }
        const status = state.regCartStatus?.lastSavedRegCart?.status;
        const {
          regCartStatus: { registrationIntent },
          experiments: { abortRegCartVariant }
        } = state;
        if (shouldAbortRegistration(allOpenTabs.length, status, registrationIntent, abortRegCartVariant)) {
          store.dispatch(abortRegCartAndLogout());
          const abortRegistrationSent = Date.now();
          updatedTabWithActiveRegistration = updatedTabWithActiveRegistration
            ? { ...updatedTabWithActiveRegistration, abortRegistrationSent }
            : { ...tabWithActiveRegistration, abortRegistrationSent };
        }
        if (updatedTabWithActiveRegistration) {
          setLocalStorageItem(`registration-${eventId}`, updatedTabWithActiveRegistration);
        }
      }
    },
    false
  );

  document.addEventListener(
    visibilityChange,
    () => {
      const state = store.getState();
      const eventId = state.event.id;
      const currentPage = getCurrentPageId(state);

      /*
       * The order in which visibilityChange events fire is not guaranteed across browsers. Which means the newly hidden
       * tab might not write to storage before the newly visible tab checks for an active registration. So we have to
       * fire off a delayed second check in order for the multi-tab dialog to happen reliably.
       */
      // eslint-disable-next-line prefer-const
      let delayedInactiveTabVisibleCheck;
      const inactiveTabVisibleCheck = () => {
        if (!document[hidden] && isOtherActiveTab(state, getCurrentPageId(state), true)) {
          clearTimeout(delayedInactiveTabVisibleCheck);
          store.dispatch(promptToTakeOverRegistration());
        }
      };
      delayedInactiveTabVisibleCheck = setTimeout(inactiveTabVisibleCheck, 250);
      inactiveTabVisibleCheck();

      const tabWithActiveRegistration = getLocalStorageItem(`registration-${eventId}`);
      let updatedTabWithActiveRegistration;
      if (tabWithActiveRegistration) {
        const allOpenTabs = tabWithActiveRegistration.allOpenTabs || [];
        if (document[hidden] && tabWithActiveRegistration.activeTab === tabId) {
          const {
            registrationForm: { regCart, regCartPayment },
            regCartPricing,
            regCartStatus: { modificationStartRegCart },
            travelCart
          } = state;
          updatedTabWithActiveRegistration = {
            activeTab: tabId,
            allOpenTabs,
            lastPage: currentPage,
            registrationState: {
              regCart,
              regCartPayment: removeSensitivePaymentInfo(regCartPayment),
              regCartPricing,
              modificationStartRegCart,
              travelCart
            }
          };
        }
        if (
          !allOpenTabs.includes(tabId) &&
          (tabWithActiveRegistration.activeTab === tabId || isOtherActiveTab(state, getCurrentPageId(state), true))
        ) {
          // if this or another tab has an active registration in progress, ensure this tab is in the list of open tabs
          updatedTabWithActiveRegistration = updatedTabWithActiveRegistration
            ? { ...updatedTabWithActiveRegistration, allOpenTabs: [...allOpenTabs, tabId] }
            : { ...tabWithActiveRegistration, allOpenTabs: [...allOpenTabs, tabId] };
        }
      }
      if (updatedTabWithActiveRegistration) {
        setLocalStorageItem(`registration-${eventId}`, updatedTabWithActiveRegistration);
      }
    },
    false
  );
};
