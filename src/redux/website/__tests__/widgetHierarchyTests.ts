/* eslint-env jest */
import website from './siteEditor.website.json';
import AddGuestFromRelatedContacts from '../../../../../event-site-editor/fixtures/EditorConfig/Widgets/AddGuestFromRelatedContacts';

import {
  findWidgetPresentedPages,
  isWidgetPresentOnCurrentPage,
  isWidgetReviewed,
  getGuestRegistrationPageWidget
} from '../pageContents';

describe('findWidgetPresentedPages', () => {
  it('shoud find all pages for given widgetType', () => {
    expect(findWidgetPresentedPages(website, { widgetType: 'EventStandardContactFieldText' })).toEqual([
      'regProcessStep1'
    ]);
    expect(findWidgetPresentedPages(website, { widgetType: 'RegistrationType' })).toEqual([
      'regPage:0cc99264-e900-43b2-a995-91b920ff2a33'
    ]);
    expect(findWidgetPresentedPages(website, { widgetType: 'AdmissionItems' })).toEqual([
      'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
    ]);
    expect(findWidgetPresentedPages(website, { widgetType: 'RegistrationNavigator' })).toEqual([
      'regProcessStep1',
      'regPage:0cc99264-e900-43b2-a995-91b920ff2a33',
      'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
    ]);
  });
  it("shoud find all pages for a given widget's fieldId", () => {
    expect(findWidgetPresentedPages(website, { fieldId: '2e305875-4f49-4ce3-85f1-abc7d9247c8a' })) // workAddress
      .toEqual(['regProcessStep1']);
    expect(findWidgetPresentedPages(website, { fieldId: 'ff919d05-4281-4d9c-aa0d-82e3722d580d' })) // emailAddress
      .toEqual(['regProcessStep1']);
  });
  it('should return empty array without query or query.widgetType or query.fieldId', () => {
    expect(findWidgetPresentedPages(website)).toEqual([]);
    expect(findWidgetPresentedPages(website, {})).toEqual([]);
  });
});

describe('isWidgetReviewed', () => {
  let mockState;
  beforeEach(
    () =>
      (mockState = {
        pathInfo: { currentPageId: 'regProcessStep1' },
        website,
        registrationPaths: {
          '9f632f6a-40d9-4870-beeb-8f38a8151b54': {
            pageIds: [
              'regProcessStep1', // Personal Information (ID Confirmation), customSingleChoice
              'regPage:0cc99264-e900-43b2-a995-91b920ff2a33', // Reg Type
              'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8' // Admission Items
            ],
            id: '9f632f6a-40d9-4870-beeb-8f38a8151b54',
            confirmationPageId: 'confirmation',
            postRegPageIds: ['confirmation']
          }
        },
        registrationForm: {
          regCart: {
            eventRegistrations: {
              eventRegId: {
                registrationPathId: '9f632f6a-40d9-4870-beeb-8f38a8151b54'
              }
            }
          }
        }
      })
  );
  it('accept widget type and figures out if widget presented on previous pages', () => {
    mockState.pathInfo.currentPageId = 'regProcessStep1';
    expect(isWidgetReviewed(mockState, { widgetType: 'RegistrationType' })).toBe(false);
    expect(isWidgetReviewed(mockState, { widgetType: 'EventCustomContactFieldSingleChoice' })).toBe(false);
    mockState.pathInfo.currentPageId = 'regPage:0cc99264-e900-43b2-a995-91b920ff2a33';
    expect(isWidgetReviewed(mockState, { widgetType: 'RegistrationType' })).toBe(false);
    mockState.pathInfo.currentPageId = 'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8';
    expect(isWidgetReviewed(mockState, { widgetType: 'RegistrationType' })).toBe(true);
    expect(isWidgetReviewed(mockState, { widgetType: 'AdmissionItems' })).toBe(false);
    expect(isWidgetReviewed(mockState, { widgetType: 'EventCustomContactFieldSingleChoice' })).toBe(true);
  });
  it('accept widget id and figures out if widget presented on previous pages', () => {
    expect(isWidgetReviewed(mockState, { fieldId: '2e305875-4f49-4ce3-85f1-abc7d9247c8a' })).toBe(false);
  });
  it('should return false without query or query.widgetType or query.fieldId', () => {
    expect(isWidgetReviewed(mockState)).toBe(false);
    expect(isWidgetReviewed(mockState, {})).toBe(false);
  });
});

describe('isWidgetPresentOnCurrentPage', () => {
  it('should return true if atleast one widget is present on a given page', () => {
    expect(isWidgetPresentOnCurrentPage(website, 'EventStandardContactFieldText', 'regProcessStep1')).toEqual(true);
    expect(
      isWidgetPresentOnCurrentPage(website, 'RegistrationType', 'regPage:0cc99264-e900-43b2-a995-91b920ff2a33')
    ).toEqual(true);
  });
  it('should return false if widget is not present on page', () => {
    expect(isWidgetPresentOnCurrentPage(website, 'AdmissionItems', 'regProcessStep1')).toEqual(false);
    expect(
      isWidgetPresentOnCurrentPage(website, 'RegistrationType', 'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8')
    ).toEqual(false);
  });
  it('should return false if argument is wrong or missing', () => {
    expect(isWidgetPresentOnCurrentPage(website)).toEqual(false);
    expect(isWidgetPresentOnCurrentPage(website, 'AdmissionItems')).toEqual(false);
    expect(isWidgetPresentOnCurrentPage(website, 'NonExistentWidget')).toEqual(false);
  });
});

describe('getGuestRegistrationPageWidget', () => {
  const mockRegPathId = '9f632f6a-40d9-4870-beeb-8f38a8151b54';
  const mockState = {
    website,
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
  it('should return widget if widgetType is present on guest registration page', () => {
    const widget = getGuestRegistrationPageWidget(mockState, 'AddGuestFromRelatedContacts');
    expect(widget.config).toEqual(AddGuestFromRelatedContacts.config());
  });
  it('should return null if widgetType is not present on guest registration page', () => {
    expect(getGuestRegistrationPageWidget(mockState, 'ConfirmationNumber')).toEqual({});
  });
});
