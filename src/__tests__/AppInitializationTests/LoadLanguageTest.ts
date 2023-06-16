import renderMainApp from '../../testUtils/renderMainApp';
import * as eventStatus from 'event-widgets/clients/EventStatus';
import { act } from '@testing-library/react';
import { loadLanguage } from '../../redux/multiLanguage/actions';
import querystring from 'querystring';

const eventId = '11111111-2222-3333-4444-555555555555';
const fakePath = `/${eventId}/`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

jest.mock('../../redux/multiLanguage/actions', () => {
  return {
    loadLanguage: jest.fn()
  };
});
jest.mock('querystring', () => {
  return {
    __esModule: true,
    default: {
      parse: jest.fn(),
      stringify: x => x
    }
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});
describe('Load Language Action', () => {
  const renderApp = async () =>
    await act(async () => {
      await renderMainApp(
        {
          eventContext: {
            eventId: '123',
            regCartId: 'fake-reg-cart-id',
            confirmationNumber: 'fake-confirmation-number'
          },
          eventLaunchWizardSettings: '{}'
        },
        fakePath,
        event => ({
          ...event,
          status: eventStatus.ACTIVE,
          eventLocalesSetup: {
            eventLocales: [{ cultureCode: 'en-US' }, { cultureCode: 'fr-FR' }],
            isAllowDetectLanguages: true
          },
          eventFeatureSetup: { website: { multipleLanguages: true } },
          cultureCode: 'en-US'
        })
      );
      await wait(0);
    });

  const navigatorLanguageGetSpy = jest.spyOn(navigator, 'language', 'get');
  const navigatorLanguagesArrayGetSpy = jest.spyOn(navigator, 'languages', 'get');

  test('It loads locale passed from query param', async () => {
    (loadLanguage as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE' }));
    (querystring.parse as $TSFixMe).mockImplementation(() => ({ locale: 'fr-FR' }));
    await renderApp();
    expect(loadLanguage).toHaveBeenCalledWith('fr-FR');
  });
  test('It loads default locale when no match to query param found', async () => {
    (loadLanguage as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE' }));
    (querystring.parse as $TSFixMe).mockImplementation(() => ({ locale: 'ur-UR' }));
    await renderApp();
    expect(loadLanguage).toHaveBeenCalledWith('en-US');
  });
  test('It loads navigator.language', async () => {
    (querystring.parse as $TSFixMe).mockImplementation(() => ({}));
    navigatorLanguageGetSpy.mockReturnValue('fr-FR');
    (loadLanguage as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE' }));
    await renderApp();
    expect(loadLanguage).toHaveBeenCalledWith('fr-FR');
  });
  test('It loads navigator.browserLanguage', async () => {
    (querystring.parse as $TSFixMe).mockImplementation(() => ({}));
    navigatorLanguageGetSpy.mockReturnValue(null);
    (navigator as $TSFixMe).__defineGetter__('browserLanguage', () => 'fr-FR');
    (loadLanguage as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE' }));
    await renderApp();
    expect(loadLanguage).toHaveBeenCalledWith('fr-FR');
  });
  test('It loads the first element of navigator.languages', async () => {
    (querystring.parse as $TSFixMe).mockImplementation(() => ({}));
    navigatorLanguageGetSpy.mockReturnValue(null);
    (navigator as $TSFixMe).__defineGetter__('browserLanguage', () => null);
    navigatorLanguagesArrayGetSpy.mockReturnValue(['fr-FR']);
    (loadLanguage as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE' }));
    await renderApp();
    expect(loadLanguage).toHaveBeenCalledWith('fr-FR');
  });
  test('loads locale of event', async () => {
    navigatorLanguageGetSpy.mockReturnValue(null);
    (navigator as $TSFixMe).__defineGetter__('browserLanguage', () => null);
    navigatorLanguagesArrayGetSpy.mockReturnValue([]);
    (loadLanguage as $TSFixMe).mockImplementation(() => ({ type: 'LOAD_LANGUAGE' }));
    (querystring.parse as $TSFixMe).mockImplementation(() => ({}));
    await renderApp();
    expect(loadLanguage).toHaveBeenCalledWith('en-US');
  });
});
