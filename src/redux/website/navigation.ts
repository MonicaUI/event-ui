import gql from 'graphql-tag';
import { ApolloClient } from '@apollo/client';
import {
  Event,
  OrderedPage,
  EventRegistrationPathArgs,
  RegistrationPathRegistrationArgs
} from '@cvent/event-ui-apollo-server/src/schema/types';

export const NEXT_PAGE = gql`
  query NextPage(
    $currentPageId: ID!
    $registrationPathId: ID!
    $registrationTypeId: ID!
    $eventId: ID!
    $eventSnapshotVersion: String!
    $environment: String!
  ) {
    eventId @client @export(as: "eventId")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    environment @client @export(as: "environment")
    event(input: { eventId: $eventId, eventSnapshotVersion: $eventSnapshotVersion, environment: $environment }) {
      registrationPath(registrationPathId: $registrationPathId) {
        registration(currentPageId: $currentPageId, registrationTypeId: $registrationTypeId) {
          currentPage {
            nextPage {
              id
            }
          }
        }
      }
    }
  }
`;

export const getNextPage = async (
  currentPageId: string,
  registrationPathId: string,
  registrationTypeId: string,
  apolloClient: ApolloClient<unknown>
): Promise<OrderedPage> => {
  const query = await apolloClient.query<
    { event: Event },
    EventRegistrationPathArgs & RegistrationPathRegistrationArgs
  >({
    query: NEXT_PAGE,
    variables: {
      currentPageId,
      registrationPathId,
      registrationTypeId
    }
  });
  return query.data.event.registrationPath.registration.currentPage.nextPage;
};
