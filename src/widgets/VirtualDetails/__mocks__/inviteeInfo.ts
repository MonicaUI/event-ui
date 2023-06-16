import { GET_INVITEE } from '../inviteeInfo';

const request = {
  query: GET_INVITEE,
  variables: {
    eventId: ''
  }
};

export const apolloClientMock = [
  {
    request,
    result: {
      data: {
        invitee: {
          inviteeFirstName: 'test',
          inviteeLastName: 'test',
          inviteeEmailAddress: 'test',
          __typename: 'invitee'
        }
      }
    }
  }
];
