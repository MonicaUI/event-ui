import {
  LOAD_EVENT_SNAPSHOT,
  LOAD_WEBSITE_CONTENT,
  LOAD_REGISTRATION_PROCESS_CONTENT,
  SET_REFERRER
} from '../actionTypes';
import { updateIn } from 'icepick';
import { parseRegistrationProcessType } from './registrationProcesses';
import { mapValues } from 'lodash';
import { removeDeletedContactFields } from 'event-widgets/utils/transformWebsite';
import { refPreserving } from '@cvent/ref-preserving-function';

function mergeRegistrationPaths(existingRegistrationPaths, newRegistrationPaths) {
  return {
    ...existingRegistrationPaths,
    ...mapValues(newRegistrationPaths, (regPath, id) => ({ ...existingRegistrationPaths[id], ...regPath }))
  };
}

function mergeRegTypeVisibility(existingRegTypeVisibility, newRegTypeVisibility) {
  return {
    ...existingRegTypeVisibility,
    ...newRegTypeVisibility
  };
}

function mergeWebLinkOnlyPageIds(existingWebLinkOnlyPageIds, newWebLinkOnlyPageIds) {
  return [...existingWebLinkOnlyPageIds, ...newWebLinkOnlyPageIds];
}

function mergeNavigationGroups(existingNavigationGroups, newNavigationGroups) {
  return {
    ...existingNavigationGroups,
    ...newNavigationGroups
  };
}

function mergeEventWebsiteNavigation(existingEventWebsiteNavigation = {}, newEventWebsiteNavigation = {}) {
  return {
    ...existingEventWebsiteNavigation,
    ...newEventWebsiteNavigation,
    regTypeVisibility: mergeRegTypeVisibility(
      (existingEventWebsiteNavigation as $TSFixMe).regTypeVisibility || {},
      (newEventWebsiteNavigation as $TSFixMe).regTypeVisibility || {}
    ),
    navigationGroups: mergeNavigationGroups(
      (existingEventWebsiteNavigation as $TSFixMe).navigationGroups || {},
      (newEventWebsiteNavigation as $TSFixMe).navigationGroups || {}
    ),
    webLinkOnlyPageIds: mergeWebLinkOnlyPageIds(
      (existingEventWebsiteNavigation as $TSFixMe).webLinkOnlyPageIds || [],
      (newEventWebsiteNavigation as $TSFixMe).webLinkOnlyPageIds || []
    )
  };
}

function mergeRegistrationProcessNavigation(existingRegistrationProcessNavigation, newRegistrationProcessNavigation) {
  return {
    regTypeVisibility: mergeRegTypeVisibility(
      (existingRegistrationProcessNavigation || {}).regTypeVisilbity || {},
      (newRegistrationProcessNavigation || {}).regTypeVisibility || {}
    ),
    /*
     * Keep all reg paths that have ever been seen so that the reg paths don't disappear before s
     * switch to a page in the new reg path if the current reg path gets filtered out because of a reg path change
     * and so that the reg paths used by other group/guest members are still available.
     */
    registrationPaths: mergeRegistrationPaths(
      (existingRegistrationProcessNavigation || {}).registrationPaths || {},
      (newRegistrationProcessNavigation || {}).registrationPaths || {}
    )
  };
}

function mergePluginData(existingPluginData = {}, newPluginData = {}) {
  return {
    ...existingPluginData,
    ...newPluginData,
    registrationProcessNavigation: mergeRegistrationProcessNavigation(
      (existingPluginData as $TSFixMe).registrationProcessNavigation,
      (newPluginData as $TSFixMe).registrationProcessNavigation
    ),
    eventWebsiteNavigation: mergeEventWebsiteNavigation(
      (existingPluginData as $TSFixMe).eventWebsiteNavigation,
      (newPluginData as $TSFixMe).eventWebsiteNavigation
    )
  };
}

function mergeWebsite(existingWebsite, newWebsite) {
  const { layoutItems = {}, pages = {}, pluginData = {} } = existingWebsite;
  const { layoutItems: newLayoutItems, pages: newPages, pluginData: newPluginData } = newWebsite;
  return {
    ...existingWebsite,
    ...newWebsite,
    /*
     * Keep all pages and layout items that have ever been seen so that things that have been filtered out because of a
     * reg path change don't disappear before we have a chance to switch to a page in the new reg path and so that the
     * reg paths used by other group/guest members are still available
     */
    layoutItems: { ...layoutItems, ...newLayoutItems },
    pages: { ...pages, ...newPages },
    pluginData: mergePluginData(pluginData, newPluginData)
  };
}

function mergeRegistrationProcess(existingWebsite, registrationProcess, account) {
  const { layoutItems = {}, pages = {}, pluginData = {} } = existingWebsite;
  const { registrationPathId, pageVariety, layoutItems: newLayoutItems, pages: newPages } = registrationProcess;
  const newWebsite = {
    ...existingWebsite,
    /*
     * Keep all pages and layout items that have ever been seen so that things that have been filtered out because of a
     * reg path change don't disappear before we have a chance to switch to a page in the new reg path and so that the
     * reg paths used by other group/guest members are still available
     */
    layoutItems: { ...layoutItems, ...newLayoutItems },
    pages: { ...pages, ...newPages },
    pluginData: updateIn(
      pluginData,
      ['registrationProcessNavigation', 'registrationPaths', registrationPathId],
      regPath => {
        return {
          ...regPath,
          id: registrationPathId,
          [parseRegistrationProcessType(pageVariety).pageKey]: registrationProcess.pageIds
        };
      }
    )
  };
  // filter deleted contact field before modify the state.
  return removeDeletedContactFields(newWebsite, account);
}

/**
 * The reducer for the website. Any data not found under a childe reducer
 * will be maintained as constant data.
 */
function reducer(state = {}, action) {
  switch (action.type) {
    case LOAD_EVENT_SNAPSHOT:
    case LOAD_WEBSITE_CONTENT:
      return action.payload.website ? mergeWebsite(state, action.payload.website) : state;
    case LOAD_REGISTRATION_PROCESS_CONTENT:
      return mergeRegistrationProcess(state, action.payload.registrationProcess, action.payload.account);
    case SET_REFERRER:
      return {
        ...state,
        referrer: action.payload.pageId
      };
    default:
      return state;
  }
}
export default refPreserving(reducer);

/* put exported child selectors below this comment */

export function getDefaultWebsitePageId(state: $TSFixMe): $TSFixMe {
  const { defaultPageId } = state.website.pluginData.eventWebsiteNavigation;
  if (!defaultPageId) {
    throw new Error('failed to find valid defaultWebsitePageId.');
  }
  return defaultPageId;
}
export function getWebsiteDisabledPageIds(state: $TSFixMe): $TSFixMe {
  return state.website.pluginData.eventWebsiteNavigation.disabledPageIds;
}
export function getWebsiteChildIds(state: $TSFixMe): $TSFixMe {
  return state.website.pluginData.eventWebsiteNavigation.childIds;
}
export function getWebsiteNavigationGroups(state: $TSFixMe): $TSFixMe {
  return state.website.pluginData.eventWebsiteNavigation.navigationGroups;
}

export function isWebsiteVarietyPage(state: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  const childIds = getWebsiteChildIds(state) || [];
  const navigationGroups = getWebsiteNavigationGroups(state) || {};
  return childIds.some(
    child =>
      child === pageId || // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      (navigationGroups[child] &&
        navigationGroups[child].childIds &&
        navigationGroups[child].childIds.some(c => c === pageId))
  );
}

export function pageExists(state: $TSFixMe, pageId: $TSFixMe): $TSFixMe {
  return (
    !!(state.website.pages[pageId] && state.website.pages[pageId].type === 'PAGE') &&
    !getWebsiteDisabledPageIds(state).includes(pageId)
  );
}

export function getPageId(state: $TSFixMe, pageCode: $TSFixMe): $TSFixMe {
  // $FlowIssue Flow bug with Object.values https://github.com/facebook/flow/issues/2221
  const foundPage = Object.values(state.website.pages).find(
    page => (page as $TSFixMe).pageCode && (page as $TSFixMe).pageCode === pageCode
  );
  return foundPage && (foundPage as $TSFixMe).id;
}

export function getWebsiteWebLinkOnlyPageIds(state: $TSFixMe): $TSFixMe {
  if (state.website.pluginData.eventWebsiteNavigation.webLinkOnlyPageIds) {
    return state.website.pluginData.eventWebsiteNavigation.webLinkOnlyPageIds;
  }
  return [];
}
