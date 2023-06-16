import mockWebsite from './mockWebsite.json';
const mockRegPathId = '8d43c432-eec8-4a3a-bcaa-674bac985fb3';
const mockState = {
  website: mockWebsite,
  appData: {
    registrationSettings: {
      registrationPaths: {
        [mockRegPathId]: {
          id: mockRegPathId,
          isDefault: true
        }
      }
    }
  }
};
import { getOrderedWidgetsInRegistration } from '../pageContents';
import { isWebsiteVarietyPage } from '..';

describe('getOrderedWidgetsInRegistration', () => {
  it('should get widgets for standard registration pages and guest info page', () => {
    const widgets = getOrderedWidgetsInRegistration(mockState, mockRegPathId, ['EventStandardContactFieldText']);

    expect(widgets).toMatchSnapshot();
  });
});

describe('isWebsiteVarietyPage', () => {
  it('should return true for page in immediate child ids', () => {
    const isWebsitePage = isWebsiteVarietyPage(
      {
        website: { pluginData: { eventWebsiteNavigation: { childIds: ['websitePage1'] } } }
      },
      'websitePage1'
    );

    expect(isWebsitePage).toBeTruthy();
  });

  it('should return true for page in any of the website nav groups', () => {
    const isWebsitePage = isWebsiteVarietyPage(
      {
        website: {
          pluginData: {
            eventWebsiteNavigation: {
              childIds: ['websitePage1', 'websiteNavGroup1', 'websiteNavGroup2', 'websiteNavGroup3'],
              navigationGroups: {
                websiteNavGroup1: {
                  childIds: ['websitePage3']
                },
                websiteNavGroup2: {},
                websiteNavGroup3: {
                  childIds: ['websitePage2']
                }
              }
            }
          }
        }
      },
      'websitePage2'
    );

    expect(isWebsitePage).toBeTruthy();
  });

  it('should return false for other pages', () => {
    const isWebsitePage = isWebsiteVarietyPage(
      {
        website: { pluginData: { eventWebsiteNavigation: { childIds: ['websitePage1'] } } }
      },
      'otherPage1'
    );

    expect(isWebsitePage).toBeFalsy();
  });
});
