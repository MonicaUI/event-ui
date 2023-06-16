import { MockedResponse } from '@apollo/client/testing';
import { gqlQuery } from './pageVarietyPathQueryHooks';

type RelatedContactsDialogMockData = {
  relatedContactsModalStyles: unknown;
  relatedContactsModalText: unknown;
};

export const getApolloClientMocks = (
  state: RelatedContactsDialogMockData
): MockedResponse<Record<string, $TSFixMe>>[] => {
  const { relatedContactsModalStyles = {}, relatedContactsModalText = {} } = state;
  return [
    {
      request: {
        query: gqlQuery
      },
      result: {
        data: {
          event: {
            registrationPath: {
              guestRegistration: {
                addGuestFromRelatedContacts: {
                  style: {
                    relatedContactsModalStyles
                  },
                  relatedContactsModalText
                }
              }
            }
          }
        }
      }
    }
  ];
};
