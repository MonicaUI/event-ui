import { httpLogPageLoadId } from '@cvent/nucleus-networking';

export default function redirectToErrorPage(
  rootPath: $TSFixMe,
  eventId: $TSFixMe,
  environment: $TSFixMe,
  httpLogRequestId: $TSFixMe
): $TSFixMe {
  const errorUrl =
    `${rootPath}/error?httpLogPageLoadId=${httpLogPageLoadId}` +
    `&httpLogRequestId=${httpLogRequestId || ''}` +
    `&errorDateTime=${new Date().toString()}` +
    `&isoDateTime=${new Date().toISOString()}` +
    `&eventId=${eventId}` +
    (environment ? `&environment=${environment}` : '');
  // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type 'Location'... Remove this comment to see the full error message
  window.location = encodeURI ? encodeURI(errorUrl) : errorUrl;
}
