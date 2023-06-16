import { ApolloClient, ApolloQueryResult, QueryResult, useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import gql from 'graphql-tag';
import { DocumentNode } from '@apollo/client';
import { getRegistrationPathIdOrNull } from '../../redux/selectors/currentRegistrationPath';
import { getRegistrationTypeIdFromUserSession } from '../../redux/userSession';
import { getCurrentPageId } from '../../redux/pathInfo';
import { OperationDefinitionNode } from 'graphql';
import { RootState } from '../../redux/reducer';

/**
 * Creates a GraphQL query template literal string for page variety path data using the specified fragment and page variety.
 */
export const createPageVarietyPathQuery = (
  pageVariety: string,
  fragmentName: string,
  fragment: DocumentNode
): DocumentNode => {
  return gql`
    query PageVarietyPath(
      $registrationPathId: ID,
      $registrationTypeId: ID!,
      $currentPageId: ID!,
      $eventId: ID!,
      $eventSnapshotVersion: String!,
      $environment: String!
    ) {
      eventId @client @export(as: "eventId")
      eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
      environment @client @export(as: "environment")
      event(input: {
        eventId: $eventId,
        eventSnapshotVersion: $eventSnapshotVersion,
        environment: $environment
      }) {
        id
        registrationPath(registrationPathId: $registrationPathId) {
          id
          ${pageVariety}(registrationTypeId: $registrationTypeId, currentPageId: $currentPageId) {
            id
            ...${fragmentName}
          }
        }
      }
    }
    ${fragment}`;
};

/**
 * Generates a custom hook to query registration path data for a specified page variety.
 */
export const createPageVarietyPathQueryHook = (pageVariety: string) => {
  return (fragment: DocumentNode): QueryResult => {
    const registrationPathId = useSelector(getRegistrationPathIdOrNull);
    const registrationTypeId = useSelector(getRegistrationTypeIdFromUserSession);
    const currentPageId = useSelector(getCurrentPageId);
    const fragmentDefinition = fragment.definitions.find(
      def => def.kind === 'FragmentDefinition'
    ) as OperationDefinitionNode;
    const fragmentName = fragmentDefinition.name.value;
    const gqlQuery = createPageVarietyPathQuery(pageVariety, fragmentName, fragment);

    const query = useQuery(gqlQuery, {
      variables: {
        registrationPathId,
        registrationTypeId,
        currentPageId
      }
    });
    return query;
  };
};

/**
 * Generates an executable query for registration path data for a specified page variety.
 */
export const createPageVarietyPathManualQuery = async (
  pageVariety: string,
  fragment: DocumentNode,
  state: RootState,
  apolloClient: ApolloClient<unknown>
): Promise<ApolloQueryResult<$TSFixMe>> => {
  const registrationPathId = getRegistrationPathIdOrNull(state);
  const registrationTypeId = getRegistrationTypeIdFromUserSession(state);
  const currentPageId = getCurrentPageId(state);

  const fragmentDefinition = fragment.definitions.find(
    def => def.kind === 'FragmentDefinition'
  ) as OperationDefinitionNode;
  const fragmentName = fragmentDefinition.name.value;
  const gqlQuery = createPageVarietyPathQuery(pageVariety, fragmentName, fragment);

  const query = await apolloClient.query({
    query: gqlQuery,
    variables: {
      registrationPathId,
      registrationTypeId,
      currentPageId
    }
  });
  return query;
};

/**
 * A custom hook that returns data for the REGISTRATION page variety as specified by
 * the supplied GraphQL fragment.
 * @param {*} fragment A GraphQL fragment defined as a `gql` template literal.
 */
export const useRegistrationPageVarietyPathQuery = createPageVarietyPathQueryHook('registration');

/**
 * A custom hook that returns data for the GUEST_REGISTRATION page variety as specified by
 * the supplied GraphQL fragment.
 * @param {*} fragment A GraphQL fragment defined as a `gql` template literal.
 */
export const useGuestRegistrationPageVarietyPathQuery = createPageVarietyPathQueryHook('guestRegistration');
