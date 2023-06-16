import { loadIntlWithLocale } from 'nucleus-text/intlLoaders/index';
import getMatchingLocale from 'nucleus-text/util/getMatchingLocale';
import locales from '../../appInitialization/locales';
import { setLocale } from 'nucleus-widgets/redux/modules/text';
import { saveLocaleId } from '../registrationForm/regCart/actions';
import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';
import { loadLocalizedUserText } from 'nucleus-guestside-site/src/redux/modules/localizedUserText';
import {
  registerTranslationsFromSnapshot,
  getEventDefaultCultureCode,
  getEventLocales,
  getCurrentLocale,
  detectProperLocale
} from 'event-widgets/utils/multiLanguageUtils';
import { loadLanguageManagementSettings } from '../actions';
import { createLoadCountry } from 'event-widgets/redux/modules/country';
import { registerTranslation } from 'nucleus-guestside-site/src/redux/modules/text';
import { loadMultiStates } from 'event-widgets/redux/modules/state';

export const LOAD_LANGUAGE = 'event-guestside-site/mutliLanguage/LOAD_LANGUAGE';

function shouldLoadTranslation(multiLanguageLocale, caseCorrectedLocale, currentLocale) {
  return (
    !!multiLanguageLocale.loadedLanguages &&
    (!multiLanguageLocale.loadedLanguages.includes(caseCorrectedLocale) ||
      !multiLanguageLocale.loadedLanguages.includes(currentLocale))
  );
}

export const loadLanguage = (locale: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      text,
      multiLanguageLocale,
      clients: { userTextClient, translationSnapshotClient },
      event,
      // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
      event: { cultureCode, eventLocalesSetup = {} } = {},
      localizedUserText = {},
      experiments: { isUserTextLoadedOnlyForSecondaryLanguage = false } = {},
      event: { eventLocalesSetup: { eventLocales = [] } = {} },
      account: {
        settings: { defaultCultureCode = cultureCode }
      },
      registrationForm
    } = getState();
    if (eventLocales.length > 1) {
      const caseCorrectedLocale = getFullLanguageFromDefaultMapping(locale);
      const currentLocale = getCurrentLocale(caseCorrectedLocale, eventLocales);
      const setAndSaveLocale = () => {
        dispatch(saveLocaleId(getLocaleIdFromCultureCode(caseCorrectedLocale, eventLocales)));
        dispatch(setLocale(caseCorrectedLocale));
      };
      const availableLocales = getEventLocales(event);
      if (
        availableLocales.includes(locale.toLowerCase()) ||
        locale === cultureCode ||
        availableLocales.includes(currentLocale.toLowerCase())
      ) {
        const promises = [];
        if (shouldLoadTranslation(multiLanguageLocale, caseCorrectedLocale, currentLocale)) {
          promises.push(
            dispatch(
              registerTranslationsFromSnapshot(
                text.resolver,
                translationSnapshotClient,
                getEventDefaultCultureCode(event),
                defaultCultureCode,
                caseCorrectedLocale
              )
            )
          );
          promises.push(loadBaseTranslations(caseCorrectedLocale, text));

          if (
            !isUserTextLoadedOnlyForSecondaryLanguage ||
            (isUserTextLoadedOnlyForSecondaryLanguage && currentLocale !== getEventDefaultCultureCode(event))
          ) {
            promises.push(
              loadUserTextTranslations(
                localizedUserText,
                caseCorrectedLocale,
                eventLocalesSetup,
                userTextClient,
                dispatch
              )
            );
          }

          promises.push(
            dispatch(createLoadCountry(registerTranslation, { locale: caseCorrectedLocale, translate: text.translate }))
          );
          promises.push(
            dispatch({
              type: LOAD_LANGUAGE,
              payload: caseCorrectedLocale
            })
          );
        }
        const currentlySelectedCountries = getSelectedCountries(registrationForm);
        if (currentlySelectedCountries.length > 0) {
          promises.push(
            dispatch(loadMultiStates(registerTranslation, currentlySelectedCountries, caseCorrectedLocale))
          );
        }
        await Promise.all(promises);
        setAndSaveLocale();
        if (shouldLoadTranslation(multiLanguageLocale, caseCorrectedLocale, currentLocale)) {
          // this needs to go last so the other translations don't overwrite it
          await dispatch(loadLanguageManagementSettings());
        }
      }
    }
  };
};

export const loadLanguageFromLocale = (localeId: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      // @ts-expect-error ts-migrate(2525) FIXME: Initializer provides no value for this binding ele... Remove this comment to see the full error message
      event: { cultureCode, eventLocalesSetup: { eventLocales } = {} }
    } = getState();
    const cultureCodeFromLocaleId = getCultureCodeFromLocaleId(localeId, cultureCode, eventLocales);
    if (cultureCodeFromLocaleId) {
      dispatch(loadLanguage(cultureCodeFromLocaleId));
    }
  };
};

export function getLocaleIdFromCultureCode(cultureCode: $TSFixMe, eventLocales: $TSFixMe): $TSFixMe {
  if (eventLocales && Array.isArray(eventLocales)) {
    const fullLocale = getFullLanguageFromDefaultMapping(cultureCode);
    const matchingLocale = eventLocales.find(eventLocale => eventLocale.cultureCode === fullLocale);
    return matchingLocale ? matchingLocale.localeId : null;
  }
  return null;
}

/*
 * PROD-126575: regCart.localeId would be for 1033 for event of which cutureCode is en-CA.
 * We need to find the proper locale based on event.cultureCode for this case to return en-CA
 * instead of returing en-US which causes date formatting issue.
 */
export function getCultureCodeFromLocaleId(
  localeId: $TSFixMe,
  eventCultureCode: $TSFixMe,
  eventLocales: $TSFixMe
): $TSFixMe {
  if (eventLocales && Array.isArray(eventLocales)) {
    const matchingLocale = eventLocales.find(locale => locale.localeId === localeId);
    return matchingLocale ? detectProperLocale(matchingLocale.cultureCode, eventCultureCode, eventLocales) : null;
  }
  return null;
}

/**
 * Gets UserText for locale
 */
async function getUserText(localizedUserText, locale, eventLocalesSetup, userTextClient) {
  let userText = localizedUserText.localization ? localizedUserText.localization[locale] || {} : {};
  if (eventLocalesSetup.eventLocales) {
    const eventLocale = eventLocalesSetup.eventLocales.find(l => l.cultureCode === locale);
    if (eventLocale) {
      const localizedUserTextForLocale = await userTextClient.getUserTextForLocale(eventLocale.localeId);
      if (localizedUserTextForLocale) {
        userText = Object.keys(localizedUserTextForLocale.data).reduce((result, key) => {
          if (localizedUserTextForLocale.data[key].richText) {
            /**
             * if user text has rich text format, render rich text.
             */
            return { ...result, [key]: JSON.parse(localizedUserTextForLocale.data[key].richText) };
          }
          return { ...result, [key]: localizedUserTextForLocale.data[key].text };
        }, {});
      }
    }
  }
  return userText;
}

function getSelectedCountries(registrationForm) {
  const eventRegistrations = registrationForm?.regCart?.eventRegistrations;
  const countryCodes = [];
  if (eventRegistrations) {
    Object.keys(eventRegistrations).forEach(key => {
      const homeAddressCountryCode = eventRegistrations[key].attendee?.personalInformation?.homeAddress?.countryCode;
      const workAddressCountryCode = eventRegistrations[key].attendee?.personalInformation?.workAddress?.countryCode;
      if (homeAddressCountryCode && homeAddressCountryCode !== '' && !countryCodes.includes(homeAddressCountryCode)) {
        countryCodes.push(homeAddressCountryCode);
      }
      if (workAddressCountryCode && workAddressCountryCode !== '' && !countryCodes.includes(workAddressCountryCode)) {
        countryCodes.push(workAddressCountryCode);
      }
    });
  }
  const paymentCountryCode = registrationForm?.regCartPayment?.pricingInfo?.creditCard?.country;
  if (paymentCountryCode && paymentCountryCode !== '' && !countryCodes.includes(paymentCountryCode)) {
    countryCodes.push(paymentCountryCode);
  }
  return countryCodes;
}

async function loadBaseTranslations(locale, text) {
  const translationsPromise = new Promise(getMatchingLocale(locale, locales));
  await new Promise(resolve => loadIntlWithLocale(locale, resolve));
  text.resolver.registerTranslations(await translationsPromise, 'default', locale);
}

async function loadUserTextTranslations(localizedUserText, locale, eventLocalesSetup, userTextClient, dispatch) {
  const userText = await getUserText(localizedUserText, locale, eventLocalesSetup, userTextClient);
  dispatch(loadLocalizedUserText(locale, userText));
}
