import { getFullLanguageFromDefaultMapping } from 'event-widgets/utils/getMatchingLocale';
import { getIn } from 'icepick';
import { identifyInvitee } from './persona';
import { getPagePath } from './pathInfo';
import { eventHasMultipleLanguages } from 'event-widgets/utils/multiLanguageUtils';
import { getEventRegistrationId } from './selectors/currentRegistrant';

/**
 * Function to retrieve datatag resolutions from a service or anywhere else.
 * @param {*} dispatch - the store dispatch function.
 * @param {*} getState - the store getState function.
 * @param {*} datatags - the list of datatgs to get resolutions for
 * @param {*} options - additional options:
 *      successCallback - callback to fire on successful load of data tags. Takes a single parameter
 *          containing an array of the resolved text (in the same order as the passed in dataTags parameter).
 *      failureCallback - callback to fire on failed load of data tags. Takes a single error parameter.
 *      context - generally to be used to identify the entity you are resolving tags against in your service.
 *      locale - generally to be used to identify what language you are resolving tags against in your service.
 *      dataTagFormatRegExp - use if your service supports configuring this.
 *      translate - Text translation function. Generally used inside of the dataTagMakeServiceCall function if its
 *          implemented to return example resolutions. When calling an actual datatag service to get real resolutions,
 *          we would generally expect the service to use the locale property to return the correct text instead.
 */
export default async function fetchTextResolverDatatags(
  dispatch: $TSFixMe,
  getState: $TSFixMe,
  datatags: $TSFixMe,
  options: $TSFixMe
): Promise<$TSFixMe> {
  // load contact Id for invitee
  await dispatch(identifyInvitee(true));
  const primaryEventRegId = getEventRegistrationId(getState());
  const eventRegs = getIn(getState(), ['registrationForm', 'regCart', 'eventRegistrations']);
  const eventReg = eventRegs && primaryEventRegId && eventRegs[primaryEventRegId] ? eventRegs[primaryEventRegId] : {};
  const contactId =
    getIn(eventReg, ['attendee', 'personalInformation', 'contactId']) || getIn(getState(), ['persona', 'contactId']);
  const {
    clients: { DataTagsResolutionClient },
    multiLanguageLocale: { locale },
    event
  } = getState();

  const fullCurrentLocale = getFullLanguageFromDefaultMapping(locale);

  let text = [];
  if (eventHasMultipleLanguages(event)) {
    text = await DataTagsResolutionClient.resolveWithDefaultLanguage(
      datatags,
      fullCurrentLocale,
      fullCurrentLocale,
      contactId
    );
  } else {
    text = await DataTagsResolutionClient.resolve(datatags, fullCurrentLocale, fullCurrentLocale, contactId);
  }
  text = removeDataTags(text, datatags, getState);

  options.successCallback(text);
}

export function removeDataTags(resolvedText: $TSFixMe, datatags: $TSFixMe, getState: $TSFixMe): $TSFixMe {
  const {
    pathInfo: { rootPath }
  } = getState();
  /**
   * when made call to resolve() rsvp_yes/rsvp_no DT with no contactId then DRS
   * doesnt resolve inviteeStub ,so instead replace Datatag
   * rsvp_yes with home page URL and
   * rsvp_no with decline Page URLs
   */
  const inviteeStubTag = '{[IN-INVITEE STUB BASE64]}';
  return resolvedText.map((item, index) => {
    if (datatags.includes(item)) {
      return '';
    } else if (item.includes(inviteeStubTag)) {
      switch (datatags[index]) {
        case '{[E-RSVP YES URL]}':
          return window.location.origin + rootPath + '/register';
        case '{[E-RSVP NO URL]}':
          return window.location.origin + getPagePath(getState(), 'decline');
        default:
          if (datatags[index].includes('{[E-CUSTOM URL:')) {
            return resolveCustomPageUrls(item, inviteeStubTag);
          }
      }
    }
    return item;
  });
}

function resolveCustomPageUrls(resolvedText, inviteeStubTag) {
  const urlSplit = resolvedText.split('i=' + inviteeStubTag);
  return urlSplit[0] + urlSplit[1];
}

export async function resolveDataTagsForArchiveEvents(
  dispatch: $TSFixMe,
  getState: $TSFixMe,
  datatags: $TSFixMe,
  options: $TSFixMe
): Promise<$TSFixMe> {
  const {
    clients: { dataTagsResolutionClient },
    event: { cultureCode }
  } = getState();
  const languageCode = getFullLanguageFromDefaultMapping(cultureCode);
  let resolvedText = await dataTagsResolutionClient.resolve(datatags, languageCode);
  resolvedText = removeDataTags(resolvedText, datatags, getState);
  options.successCallback(resolvedText);
}
