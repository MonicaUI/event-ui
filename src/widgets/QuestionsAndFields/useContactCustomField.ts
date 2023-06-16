import { gql } from '@apollo/client/core';
import { useQuery } from '@apollo/client';

export const GET_CONTACT_CUSTOM_FIELD = gql`
  query getContactCustomDateTimeField(
    $eventId: ID!
    $eventSnapshotVersion: String!
    $environment: String!
    $contactCustomFieldId: ID!
    $accountSnapshotVersion: String!
  ) {
    eventId @client @export(as: "eventId")
    environment @client @export(as: "environment")
    eventSnapshotVersion @client @export(as: "eventSnapshotVersion")
    accountSnapshotVersion @client @export(as: "accountSnapshotVersion")
    event(input: { eventId: $eventId, eventSnapshotVersion: $eventSnapshotVersion, environment: $environment }) {
      contactCustomField(
        input: { accountSnapshotVersion: $accountSnapshotVersion, contactCustomFieldId: $contactCustomFieldId }
      ) {
        questionServiceEntityType
        question {
          code
          questionTypeInfo {
            ... on OpenEndedDateTimeQuestionTypeInfo {
              answerPlacementType
              minDate
              maxDate
              displayFormatTypeId
              defaultToCurrentDate
            }
            ... on OpenEndedTextOneLineQuestionTypeInfo {
              answerPlacementType
              answerFormatType
              customAnswerFormat
              minValue
              maxValue
              minLength
              maxLength
            }
            ... on OpenEndedTextCommentBoxQuestionTypeInfo {
              answerPlacementType
              minLength
              maxLength
            }
            ... on SingleChoiceQuestionTypeInfo {
              answerPlacementType
              displayType
              otherAnswer
              linkLogic
              choiceSortOrder
              naAnswer
            }
            ... on MultiChoiceQuestionTypeInfo {
              answerPlacementType
              displayType
              otherAnswer
              linkLogic
              choiceSortOrder
              naAnswer
              minSelections
              maxSelections
            }
          }
          additionalInfo {
            additionalInfoType
            required
            helpText
          }
          html
          id
          text
        }
        customFieldCategory
        defaultTagText
        showOnWizard
        consentFlag
        lastModifiedDate
      }
    }
  }
`;

export function useContactCustomField(contactCustomFieldId: $TSFixMe): $TSFixMe {
  const query = useQuery(GET_CONTACT_CUSTOM_FIELD, {
    variables: {
      contactCustomFieldId
    }
  });
  return query?.data?.event?.contactCustomField;
}
