import FlexFileClient from '../FlexFileClient';

jest.mock('@cvent/nucleus-networking', () => {
  const RequestBuilderModule = jest.requireActual<$TSFixMe>('@cvent/nucleus-networking');
  class MockRequestBuilder extends RequestBuilderModule.RequestBuilder {
    constructor(requestOptions = {}) {
      const newRequestOptions = {
        ...requestOptions,
        headers: {
          ...(requestOptions as $TSFixMe).headers,
          httplogpageloadid: 'httplogpageloadid',
          httplogrequestid: 'httplogrequestid'
        }
      };
      super(newRequestOptions);
    }
  }
  return {
    ...RequestBuilderModule,
    RequestBuilder: MockRequestBuilder,
    fetchAndRetryIfServerBusy: jest.fn(() => {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    })
  };
});

test('FlexFileClient.deleteFile matches snapshot', async () => {
  const client = new FlexFileClient('https://example.com/flex-file-service/del/', 'superawesomeevent', 'dev');

  await client.deleteFile('filePath', 'uploadType', {
    fieldId: 'fieldId',
    regCartId: 'regCartId',
    eventRegistrationId: 'eventRegistrationId'
  });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[0]).toMatchSnapshot();
});

test('FlexFileClient.deleteFileNoEnvironment matches snapshot', async () => {
  const client = new FlexFileClient('https://example.com/flex-file-service/delNo/', 'superawesomeevent', null);

  await client.deleteFile('filePath', 'uploadType', {
    fieldId: 'fieldId',
    regCartId: 'regCartId',
    eventRegistrationId: 'eventRegistrationId'
  });
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[1]).toMatchSnapshot();
});

test('FlexFileClient.getPublicFileUrl matches snapshot', async () => {
  const client = new FlexFileClient('https://example.com/flex-file-service/get/', 'superawesomeevent', 'dev');

  await client.getPublicFileUrl('filePath', 'uploadType');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[2]).toMatchSnapshot();
});

test('FlexFileClient.getPublicFileUrlNoEnvironment matches snapshot', async () => {
  const client = new FlexFileClient('https://example.com/flex-file-service/getNo/', 'superawesomeevent', null);

  await client.getPublicFileUrl('filePath', 'uploadType');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fetch = require('@cvent/nucleus-networking').fetchAndRetryIfServerBusy;
  expect(fetch).toHaveBeenCalled();
  expect(fetch.mock.calls[3]).toMatchSnapshot();
});

test('FlexFileClient.getFileUploadUrl matches uploadURL', async () => {
  const client = new FlexFileClient('https://example.com/flex-file-service/', 'superawesomeevent', 'dev');
  const fileUploadUrl = client.getFileUploadUrl(
    'uploadType',
    {
      fieldId: 'fieldId',
      regCartId: 'regCartId',
      eventRegistrationId: 'eventRegistrationId'
    },
    'eventSnapshotVersion'
  );
  const extectedURL =
    'https://example.com/flex-file-service/flex-file/v1/file/upload?eventId=superawesomeevent&fieldId=fieldId&regCartId=regCartId&eventRegistrationId=eventRegistrationId&eventSnapshotVersion=eventSnapshotVersion&uploadType=uploadType&environment=dev';
  expect(fileUploadUrl).toBe(extectedURL);
});

test('FlexFileClient.getFileUploadUrlNoEnvironment matches uploadURL', async () => {
  const client = new FlexFileClient('https://example.com/flex-file-service/', 'superawesomeevent', null);
  const fileUploadUrl = client.getFileUploadUrl(
    'uploadType',
    {
      fieldId: 'fieldId',
      regCartId: 'regCartId',
      eventRegistrationId: 'eventRegistrationId'
    },
    'eventSnapshotVersion'
  );
  const extectedURL =
    'https://example.com/flex-file-service/flex-file/v1/file/upload?eventId=superawesomeevent&fieldId=fieldId&regCartId=regCartId&eventRegistrationId=eventRegistrationId&eventSnapshotVersion=eventSnapshotVersion&uploadType=uploadType';
  expect(fileUploadUrl).toBe(extectedURL);
});
