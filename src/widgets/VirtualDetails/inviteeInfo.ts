import { useStore } from 'react-redux';
import { gql } from '@apollo/client/core';
import { useQuery } from '@apollo/client';

export const GET_INVITEE = gql`
  query getInvitee($environment: String, $eventId: String!, $guestId: String, $inviteeId: String) {
    invitee(environment: $environment, eventId: $eventId, guestId: $guestId, inviteeId: $inviteeId)
      @rest(type: "InviteeResponse", path: "/event-guestside-attendee/v1/invitee?{args}") {
      inviteeFirstName
      inviteeLastName
      inviteeEmailAddress
    }
  }
`;

export function useInvitee(): $TSFixMe {
  const store = useStore();
  const state = store.getState();
  const {
    event: { id: eventId },
    pathInfo: {
      queryParams: { g: guestId, i: inviteeId }
    },
    environment
  } = state;

  const query = useQuery(GET_INVITEE, {
    variables: {
      environment,
      eventId,
      guestId,
      inviteeId
    }
  });
  return query;
}
