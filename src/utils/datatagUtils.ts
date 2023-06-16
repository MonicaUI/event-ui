import { refreshResolvers } from 'nucleus-widgets/redux/modules/text';

let isDatatagCacheInvalid = false;

const getTriggerHandlerBody = snippet => {
  return snippet?.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
};

const tryResolveDatatags = (resolver, fallbackOverride?) => {
  if (!window.CVENT?.codeSnippets) {
    return;
  }

  window.CVENT.codeSnippetsWithResolvedDatatags = {};

  for (const event in window.CVENT.codeSnippets) {
    if (event && window.CVENT.codeSnippets[event]) {
      window.CVENT.codeSnippets[event].forEach(snippet => {
        if (!window.CVENT.codeSnippetsWithResolvedDatatags[event]) {
          window.CVENT.codeSnippetsWithResolvedDatatags[event] = [];
        }
        window.CVENT.codeSnippetsWithResolvedDatatags[event].push(
          resolver.resolveDataTags(getTriggerHandlerBody(snippet), fallbackOverride)
        );
      });
    }
  }
};

/**
 * resolves the datatags for code snippet by calling text's resolver functions. This function first parse try to resolve
 * the data tags, if they does not get resolve then only it sends a network call to fetch datatags.
 */
export default function resolveDatatagsForCodeSnippets() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    let anyUnresolved = false;
    const {
      fetchTextResolverDatatags,
      text: { resolver }
    } = getState();

    tryResolveDatatags(resolver, () => {
      anyUnresolved = true;
      return '';
    });

    if (!anyUnresolved || !resolver.fetchDataTags || !resolver.shouldFetchDataTags()) {
      return;
    }

    const fetchOverride = fetchTextResolverDatatags.bind(null, dispatch, getState);
    await new Promise((resolve, reject) => {
      resolver.fetchDataTags(fetchOverride, resolve, reject);
    });
    tryResolveDatatags(resolver);
  };
}

/**
 * Whenever context of contact changes in the guest side this function fetches all the datatags registered in text's
 * resolver. It checks whether there is any datatags registered or not by calling resolver.shouldFetchAllDataTags() and
 * then attempt to resolve the fetchall datatags. refreshResolver refreshes all the existing resolved texts with the new
 * resolution.
 */
export function fetchAllDatatagResolutions() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      fetchTextResolverDatatags,
      text: { resolver }
    } = getState();
    if (isDatatagCacheInvalid && resolver.fetchAllDataTags) {
      tryResolveDatatags(resolver);
      if (resolver.shouldFetchAllDataTags()) {
        const fetchOverride = fetchTextResolverDatatags.bind(null, dispatch, getState);
        await new Promise((resolve, reject) => {
          resolver.fetchAllDataTags(fetchOverride, resolve, reject);
        });
        await dispatch(refreshResolvers());
      }
      isDatatagCacheInvalid = false;
    }
  };
}

/**
 * Invalidate the data tag cache. So that next time, before resolution of datatags all the datatags will be fetched
 * again.
 */
export function invalidateDatatagCache(): $TSFixMe {
  isDatatagCacheInvalid = true;
}
