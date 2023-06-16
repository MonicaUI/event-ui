import { RequestBuilder, fetchAndRetryIfServerBusy } from '../utils/wrappedFetchAndRetryIfServerTooBusy';
import { SESSION_HEADER_EVENT_ID } from '@cvent/event-ui-networking';
import Logger from '@cvent/nucleus-logging';
import { ServiceError } from '@cvent/event-ui-networking';

const LOG = new Logger('FlexFileClient');

export default class FlexFileClient {
  environment: $TSFixMe;
  eventId: $TSFixMe;
  flexFileBaseUrl: $TSFixMe;
  constructor(baseURL: $TSFixMe, eventId: $TSFixMe, environment: $TSFixMe) {
    this.flexFileBaseUrl = `${baseURL}flex-file/v1`;
    this.eventId = eventId;
    this.environment = environment;
  }

  _getRequestBuilder(relativeUrl = ''): $TSFixMe {
    const builder = new RequestBuilder({ url: `${this.flexFileBaseUrl}${relativeUrl}` })
      .withCookies()
      .header(SESSION_HEADER_EVENT_ID, this.eventId)
      .header('Content-Type', 'application/json');
    return this.environment ? builder.query('environment', this.environment) : builder;
  }

  /**
   * Delete uploaded file.
   */
  async deleteFile(filePath: $TSFixMe, uploadType: $TSFixMe, fileIdentifiers: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder('/file/delete')
      .query('eventId', this.eventId)
      .query('filePath', filePath)
      .query('uploadType', uploadType)
      .query('fieldId', fileIdentifiers.fieldId)
      .query('regCartId', fileIdentifiers.regCartId)
      .query('eventRegistrationId', fileIdentifiers.eventRegistrationId)
      .delete()
      .build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('File deletion failed', response, request);
      LOG.error('Error deleting file ', request.url, error.responseStatus, error.responseBody);
    }
  }

  getFileUploadUrl(uploadType: $TSFixMe, fileIdentifiers: $TSFixMe, eventSnapshotVersion: $TSFixMe): $TSFixMe {
    const environmentParam = this.environment ? `&environment=${this.environment}` : '';
    const uploadUrl =
      `${this.flexFileBaseUrl}/file/upload?` +
      `eventId=${this.eventId}&fieldId=${fileIdentifiers.fieldId}&regCartId=${fileIdentifiers.regCartId}` +
      `&eventRegistrationId=${fileIdentifiers.eventRegistrationId}&eventSnapshotVersion=${eventSnapshotVersion}` +
      `&uploadType=${uploadType}${environmentParam}`;
    return uploadUrl;
  }

  /**
   * Get public link for resource specified at path
   */
  async getPublicFileUrl(filePath: $TSFixMe, uploadType: $TSFixMe): Promise<$TSFixMe> {
    const request = this._getRequestBuilder('/file/publiclink')
      .query('eventId', this.eventId)
      .query('filePath', filePath)
      .query('uploadType', uploadType)
      .get()
      .build();

    const response = await fetchAndRetryIfServerBusy(request);
    if (!response.ok) {
      const error = await ServiceError.create('Public url retrieval failed', response, request);
      LOG.error('Error retrieving public url ', request.url, error.responseStatus, error.responseBody);
    }
    return await response.json();
  }
}
