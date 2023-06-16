import { gql } from '@apollo/client/core';
import { QueryResult, useQuery } from '@apollo/client';
import { useStore } from 'react-redux';
import { useMemo } from 'react';

const getRegisteredInviteeGQL = gql`
  query getRegisteredInvitees($url: String!) {
    registeredInvitees(url: $url) @rest(type: "RegisteredInviteesResponse", path: "{args.url}") {
      firstName
      middleName
      lastName
      confirmationNumber
      emailAddress
      inviteeStub
      isAdmin
    }
  }
`;

export default function useRegisteredInvitees(): [QueryResult<$TSFixMe, $TSFixMe>, $TSFixMe] {
  const store = useStore();
  const state = store.getState();
  const {
    accessToken,
    userSession: { authenticatedContact, hasRegisteredInvitees },
    clients: { eventGuestsideAttendeeClient },
    event: {
      eventFeatureSetup: {
        other: { contactSnapshot }
      }
    }
  } = state;

  const request = useMemo(() => {
    return eventGuestsideAttendeeClient.buildRequestForRegisteredInvitees(
      accessToken,
      authenticatedContact,
      contactSnapshot
    );
  }, [accessToken, authenticatedContact, eventGuestsideAttendeeClient, contactSnapshot]);

  const query = useQuery(getRegisteredInviteeGQL, {
    variables: {
      accessToken,
      authenticatedContact,
      hasRegisteredInvitees
    },
    context: {
      request,
      fetchWithSessionTimeout: true
    },
    fetchPolicy: 'no-cache'
  });

  // @ts-expect-error ts-migrate(2322) FIXME: Type 'QueryResult<any, { accessToken: any; authent... Remove this comment to see the full error message
  return query;
}
