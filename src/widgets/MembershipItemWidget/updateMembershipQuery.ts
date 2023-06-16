import { gql } from '@apollo/client/core';

export const SELECT_MEMBERSHIP = gql`
  mutation selectMembershipItem(
    $eventId: String!
    $environment: String!
    $regCartId: String!
    $membershipItemId: String!
    $productId: String!
    $eventRegistrationId: String!
    $renewal: Boolean!
  ) {
    eventId @client @export(as: "eventId")
    environment @client @export(as: "environment")
    selectMembershipItem(
      input: {
        eventId: $eventId
        environment: $environment
        regCartId: $regCartId
        membershipItemId: $membershipItemId
        productId: $productId
        eventRegistrationId: $eventRegistrationId
        renewal: $renewal
      }
    ) {
      regCart
      membershipItemRegistration {
        productType
        requestedAction
        membershipItemId
        registrationTypeIdBeforeMembershipSelection
        productId
        renewal
      }
    }
  }
`;

export const DESELECT_MEMBERSHIP = gql`
  mutation deselectMembershipItem(
    $eventId: String!
    $environment: String!
    $regCartId: String!
    $membershipItemId: String!
    $productId: String!
    $eventRegistrationId: String!
  ) {
    eventId @client @export(as: "eventId")
    environment @client @export(as: "environment")
    deselectMembershipItem(
      input: {
        eventId: $eventId
        environment: $environment
        regCartId: $regCartId
        membershipItemId: $membershipItemId
        productId: $productId
        eventRegistrationId: $eventRegistrationId
      }
    ) {
      regCart
    }
  }
`;
