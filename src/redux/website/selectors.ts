import { getIn } from 'icepick';

const EMPTY_OBJECT = Object.freeze({});

/**
 * Gets the navigation information for all of the registration paths within the event.
 */
export function getRegistrationPaths(state: $TSFixMe): $TSFixMe {
  return getIn(state, ['website', 'pluginData', 'registrationProcessNavigation', 'registrationPaths']) || EMPTY_OBJECT;
}

/**
 * Gets the navigation information for a single registration path within the event if the path exists.
 */
export function getRegistrationPath(state: $TSFixMe, registrationPathId: $TSFixMe): $TSFixMe {
  return getIn(state, [
    'website',
    'pluginData',
    'registrationProcessNavigation',
    'registrationPaths',
    registrationPathId
  ]);
}

export function getArchivePageId(state: $TSFixMe): $TSFixMe {
  const { defaultPageId } = state.eventArchivePageNavigation;
  if (!defaultPageId) {
    throw new Error('failed to find valid event archive page id.');
  }
  return defaultPageId;
}

export function getCurrentPageName(state: $TSFixMe): $TSFixMe {
  const {
    pathInfo,
    website,
    text: { translate }
  } = state;
  const currentPageId = getIn(pathInfo, ['currentPageId']);
  const currentPage = getIn(website, ['pages', currentPageId]);
  const currentPageName = currentPage?.name || '';

  return translate(currentPageName);
}
