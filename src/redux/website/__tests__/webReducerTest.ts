/* global */
import reducer from '../index';
import { loadWebsiteContent, setReferrer } from '../../actions';

function createDefaultWebsite(newWebLinkOnlyPageIds = [], newNavigationGroups = {}) {
  return {
    layoutItems: {},
    pages: {},
    pluginData: {
      registrationProcessNavigation: {
        regTypeVisibility: {},
        registrationPaths: {}
      },
      eventWebsiteNavigation: {
        regTypeVisibility: {},
        webLinkOnlyPageIds: newWebLinkOnlyPageIds,
        navigationGroups: newNavigationGroups
      }
    }
  };
}

describe('Website Reducer Test :', () => {
  test('Verifying mergeWebsite is validated', () => {
    const existingWebsite = createDefaultWebsite();
    const newWebsite = reducer({}, loadWebsiteContent(existingWebsite));
    expect(newWebsite).toStrictEqual(existingWebsite);
  });
  test('Verfying mergeWebsite when pluginData is available in the website', () => {
    const { existingWebsite, webLinkOnlyPageId, navigationGroup } = getDefaultData();
    const website = createDefaultWebsite();
    const newWebsite = reducer(existingWebsite, loadWebsiteContent(website));
    expect(newWebsite.pluginData.eventWebsiteNavigation.webLinkOnlyPageIds).toStrictEqual(webLinkOnlyPageId);
    expect(newWebsite.pluginData.eventWebsiteNavigation.navigationGroups).toStrictEqual(navigationGroup);
  });
  test('Verifying setReferrer', () => {
    const { existingWebsite } = getDefaultData();
    const newWebsite = reducer(existingWebsite, setReferrer('testPageId'));
    expect(newWebsite.referrer).toStrictEqual('testPageId');
  });
});

function getDefaultData() {
  const webLinkOnlyPageId = ['websitePage:2fda2642-c371-4e76-be9c-04ee7b865b66'];
  const navigationGroup = {
    postRegPages: {
      name: 'Post Registration Pages',
      childIds: [],
      id: 'postRegPages'
    }
  };
  const existingWebsite = createDefaultWebsite(webLinkOnlyPageId, navigationGroup);
  return { existingWebsite, webLinkOnlyPageId, navigationGroup };
}
