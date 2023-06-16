import { LOAD_EVENT_ARCHIVE_PAGE_DATA } from './actions';
import { LOAD_EVENT_SNAPSHOT } from '../redux/actionTypes';

const mergeWebsiteContent = (existingWebsite, newWebsite) => {
  const { layoutItems = {}, pages = {}, pluginData = {} } = existingWebsite;
  const { layoutItems: newLayoutItems, pages: newPages, pluginData: newPluginData } = newWebsite;
  return {
    ...existingWebsite,
    ...newWebsite,
    layoutItems: { ...layoutItems, ...newLayoutItems },
    pages: { ...pages, ...newPages },
    pluginData: { ...pluginData, ...newPluginData }
  };
};

/**
 * Reducer which loads information from the website content payload.
 */
const websiteContentReducer = (state = {}, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case LOAD_EVENT_SNAPSHOT:
    case LOAD_EVENT_ARCHIVE_PAGE_DATA:
      return mergeWebsiteContent(state, action.payload.website);
    default:
      return state;
  }
};

export default websiteContentReducer;
