import { gql } from '@apollo/client/core';
import { useQuery } from '@apollo/client';
import { values } from 'lodash';

export const GET_REG_TYPES = gql`
  query GetEvents($input: RegistrationInfo) {
    getEvent(input: $input) {
      visible
      registrationTypes {
        id
        name
        visible
      }
    }
  }
`;

export default function useRegTypes(): $TSFixMe {
  const { data } = useQuery(GET_REG_TYPES, {
    variables: {
      eventId: 'EVENT_ID',
      regPathId: 'REG_PATH_ID',
      regCartId: 'REG_CART_ID',
      eventSnapshotVersion: 'VERSION',
      environment: 'ENV',
      attendeeType: 'INVITEE'
    }
  });
  return values(data?.getEvent?.registrationTypes);
}
