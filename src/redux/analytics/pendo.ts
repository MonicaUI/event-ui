import { RequestBuilder, fetchAndRetryIfServerBusy } from '../../utils/wrappedFetchAndRetryIfServerTooBusy';
import { ServiceError } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';

const LOG = new Logger('Pendo');

/*
 * Creates a thunked action to initialize pendo
 */
export function initializePendoAnalytics(
  previewToken: $TSFixMe,
  accessToken: $TSFixMe,
  environment: $TSFixMe,
  accountName: $TSFixMe,
  baseUrl: $TSFixMe
) {
  return (): $TSFixMe => {
    eventBuildWizardPreviewPendoInformation(accessToken, previewToken, baseUrl, environment)
      .then(payload => {
        if ((window as $TSFixMe).pendo) {
          (window as $TSFixMe).pendo.initialize({
            visitor: {
              id: payload.visitorId,
              environment,
              ipaddress: payload.ipAddress,
              screenResolution: window.screen ? window.screen.width + '*' + window.screen.height : null,
              language: payload.plannerLocale
            },
            account: {
              id: accountName,
              salesforceAccountId: payload.salesforceId
            }
          });
        }
      })
      .catch(() => {});
  };
}

function _getRequestBuilder(baseUrl, authToken, urlPath = '') {
  return new RequestBuilder({ url: `${baseUrl}${urlPath}` }).auth(authToken).withCookies();
}

/**
 * Publishes pendo information in event build wizard preview.
 * Purposefully not throwing the error should one occur. Since it's  pendo analytic
 * tracking, we want to log the error and let the application continue.
 */
async function eventBuildWizardPreviewPendoInformation(authToken, previewToken, baseUrl, environment) {
  const request = _getRequestBuilder(baseUrl, authToken, 'attendeeactivities/v1/event-build-wizard-preview/pendo')
    .query('environment', environment)
    .query('previewToken', previewToken)
    .get()
    .build();
  const response = await fetchAndRetryIfServerBusy(request);

  if (!response.ok) {
    const error = await ServiceError.create('eventBuildWizardPreviewPendoInformation failed', response, request);
    LOG.info(
      'Error publishing Event Build Wizard Preview pendo informaiton',
      request.url,
      error.responseStatus,
      error.responseBody
    );
  }
  return await response.json();
}
