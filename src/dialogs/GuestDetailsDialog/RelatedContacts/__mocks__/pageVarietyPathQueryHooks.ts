import { useQuery, QueryResult } from '@apollo/client';
import gql from 'graphql-tag';

export const gqlQuery = gql`
  query PageVarietyPath {
    event {
      registrationPath {
        guestRegistration {
          addGuestFromRelatedContacts {
            style {
              relatedContactsModalStyles
            }
            relatedContactsModalText
          }
        }
      }
    }
  }
`;

/**
 * Generates a custom hook to query registration path data for a specified page variety.
 */
export const useGuestRegistrationPageVarietyPathQuery = (): QueryResult => {
  const query = useQuery(gqlQuery);
  return query;
};
