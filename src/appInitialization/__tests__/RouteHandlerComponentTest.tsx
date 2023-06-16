/* eslint-env jest */
import React from 'react';
import TestRenderer from 'react-test-renderer';
import { withRoutes } from '../routeHandlerComponent';
import { FetchError } from '@cvent/event-ui-networking';
import { runNetworkErrorHandler, isNetworkError } from '../../errorHandling/loggingAndErrors';

jest.mock('../../errorHandling/loggingAndErrors');

beforeEach(() => {
  jest.clearAllMocks();
  (isNetworkError as $TSFixMe).mockImplementation(
    jest.requireActual<$TSFixMe>('../../errorHandling/loggingAndErrors').isNetworkError
  );
});

const makeFakeRoutes =
  onEnter =>
  // eslint-disable-next-line react/prop-types
  ({ pageId }) =>
    (
      <div>
        {withRoutes(
          ({ pageId: id }) => (
            <div>Output: {id}</div>
          ),
          createOnEnterHandler => {
            const Component = createOnEnterHandler(onEnter);
            return (
              <div>
                <Component match={{ params: { pageId } }} />
              </div>
            );
          }
        )}
      </div>
    );

test('opens error dialog when an error occurs while entering page', async () => {
  async function failingEnterHandler() {
    throw new FetchError('failed to fetch', 'http://example.com/');
  }
  const FakeRoutes = makeFakeRoutes(failingEnterHandler);

  await TestRenderer.act(async () => {
    TestRenderer.create(<FakeRoutes pageId={1} />);
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(runNetworkErrorHandler).toHaveBeenCalled();
});

test('does not open error dialog when an error does not occur while entering page', async () => {
  async function succeedingEnterHandler() {
    return 1;
  }
  const FakeRoutes = makeFakeRoutes(succeedingEnterHandler);

  let output;
  await TestRenderer.act(async () => {
    output = TestRenderer.create(<FakeRoutes pageId={1} />);
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(runNetworkErrorHandler).not.toHaveBeenCalled();

  expect(output.root.findByProps({ pageId: 1 })).toBeTruthy();

  output.update(<FakeRoutes pageId={2} />);

  expect(output.root.findByProps({ pageId: 2 })).toBeTruthy();
});
