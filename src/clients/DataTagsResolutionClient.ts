import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import { defaultLanguage } from 'event-widgets/utils/getMatchingLocale';
import Logger from '@cvent/nucleus-logging';
import { ServiceError } from '@cvent/event-ui-networking';

const LOG = new Logger('DataTagsResolutionClient');
const emptyContactId = '00000000-0000-0000-0000-000000000000';

function createResolve(
  environment,
  eventId,
  datatags,
  isPreview,
  cultureCode,
  language = defaultLanguage,
  contactId = emptyContactId
) {
  return {
    text: datatags.map(datatag => ({
      value: datatag,
      'output-mime-type': 'html'
    })),
    context: {
      eventStub: eventId,
      additionalProperties: {
        // evtRegTypeId=4 for flex event
        evtRegTypeId: '4'
      }
    },
    recipients: [contactId],
    timePattern: '24',
    datePattern: 'WCMMSD1C4',
    timeZone: '',
    environment,
    isPreview,
    language,
    cultureCode
  };
}

function convertResponseToArray(response, contactId) {
  return response[contactId];
}

/**
 * The data tags resolution client
 */
export default class DataTagsResolutionClient {
  contactId: $TSFixMe;
  dataTagsResolutionBaseUrl: $TSFixMe;
  defaultCultureCode: $TSFixMe;
  environment: $TSFixMe;
  eventId: $TSFixMe;
  isPreview: $TSFixMe;
  request: $TSFixMe;
  constructor(
    baseUrl: $TSFixMe,
    eventId: $TSFixMe,
    environment: $TSFixMe,
    defaultCultureCode: $TSFixMe,
    isPreview: $TSFixMe,
    contactId = emptyContactId
  ) {
    this.dataTagsResolutionBaseUrl = baseUrl + 'datatags-resolution/resolution/v1';
    this.environment = environment;
    this.eventId = eventId;
    this.isPreview = isPreview;
    this.contactId = contactId;
    this.defaultCultureCode = defaultCultureCode;
    this.request = new RequestBuilder({ url: this.dataTagsResolutionBaseUrl })
      .withCookies()
      .header(SESSION_HEADER_EVENT_ID, eventId);
  }

  async resolve(
    datatags: $TSFixMe,
    language?: $TSFixMe,
    cultureCode?: $TSFixMe,
    contactId = emptyContactId
  ): Promise<$TSFixMe> {
    let url;
    if (contactId === emptyContactId) {
      url = `${this.dataTagsResolutionBaseUrl}/resolve/batch`;
    } else {
      url = `${this.dataTagsResolutionBaseUrl}/resolve`;
    }
    const request = this.request
      .url(url)
      .query('environment', this.environment)
      .post()
      .json(createResolve(this.environment, this.eventId, datatags, this.isPreview, cultureCode, language, contactId))
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const errorMessage = `resolve failed: ${this.dataTagsResolutionBaseUrl}/resolve:
          ${datatags} / ${response.status} - ${response.statusText}`;
      const error = await ServiceError.create(errorMessage, response, request);
      LOG.warn('Error resolving data tags', error);
      return [];
    }
    if (contactId === emptyContactId) {
      return await response.json();
    }
    return convertResponseToArray(await response.json(), contactId);
  }

  async resolveWithDefaultLanguage(
    datatags: $TSFixMe,
    language: $TSFixMe,
    cultureCode: $TSFixMe,
    contactId = emptyContactId
  ): Promise<$TSFixMe> {
    let url;
    // eslint-disable-next-line prefer-const
    url = `${this.dataTagsResolutionBaseUrl}/resolve/with-default-lang`;
    const request = this.request
      .url(url)
      .query('environment', this.environment)
      .query('defaultLanguage', this.defaultCultureCode)
      .post()
      .json(createResolve(this.environment, this.eventId, datatags, this.isPreview, cultureCode, language, contactId))
      .build();
    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const errorMessage = `resolve failed: ${this.dataTagsResolutionBaseUrl}/resolve/with-default-lang:
          ${datatags} / ${response.status} - ${response.statusText}`;
      const error = await ServiceError.create(errorMessage, response, request);
      LOG.warn('Error resolving data tags', error);
      return [];
    }
    const datatagsResponse = await response.json();
    return datatagsResponse.resolved[contactId] || [];
  }
}
