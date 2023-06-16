import { fetchAndRetryIfServerBusy } from '@cvent/event-ui-networking';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { createApolloLink, createRestLinkWithCustomFetch, createErrorLink } from '@cvent/event-ui-apollo';
import { fetchWithSessionTimeout } from '../dialogs/SessionTimedOutDialog';
import { ApolloLink, from } from '@apollo/client';

export function createLink(
  baseUrl: string,
  apolloServerBaseUrl = '',
  optionalHeaders?: Record<string, unknown>
): ApolloLink {
  const link = createApolloLink(optionalHeaders).split(
    operation => operation.getContext()?.fetchWithSessionTimeout,
    createRestLinkWithCustomFetch(baseUrl, fetchWithSessionTimeout),
    createRestLinkWithCustomFetch(baseUrl, fetchAndRetryIfServerBusy)
  );
  const errorLink = createErrorLink();
  return from([
    link,
    errorLink,
    new BatchHttpLink({ uri: `${apolloServerBaseUrl}/event/graphql`, batchMax: 5, batchInterval: 20 })
  ]);
}
