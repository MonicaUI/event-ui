import { MockedResponse } from '@apollo/client/testing';
import { gqlQuery } from './pageVarietyPathQueryHooks';

type GuestProductSelectionDialogMockData = {
  displayAdmissionItemsFees: unknown;
  displaySessionsFees: unknown;
};

export const getApolloClientMocks = (
  state: GuestProductSelectionDialogMockData
): MockedResponse<Record<string, $TSFixMe>>[] => {
  const { displayAdmissionItemsFees = {}, displaySessionsFees = {} } = state;
  return [
    {
      request: {
        query: gqlQuery
      },
      result: {
        data: {
          event: {
            registrationPath: {
              registration: {
                admissionItems: {
                  display: {
                    fees: displayAdmissionItemsFees
                  }
                },
                sessions: {
                  display: {
                    fees: displaySessionsFees
                  }
                }
              }
            }
          }
        }
      }
    }
  ];
};
