import { useQuery, QueryResult } from '@apollo/client';
import gql from 'graphql-tag';

export const gqlQuery = gql`
  query PageVarietyPath {
    event {
      registrationPath {
        registration {
          airActual {
            enabled
          }
          airRequest {
            enabled
          }
          groupFlight {
            enabled
          }
          hotelRequest {
            enabled
          }
        }
      }
    }
  }
`;

/**
 * Generates a custom hook to query registration path data for a specified page variety.
 */
export const useRegistrationPageVarietyPathQuery = (): QueryResult => {
  const query = useQuery(gqlQuery);
  return query;
};
