import { MockedResponse } from '@apollo/client/testing';
import { gqlQuery } from './pageVarietyPathQueryHooks';

type QuestionWidgetMockData = {
  isAirActualWidgetPresent: boolean;
  isAirRequestWidgetPresent: boolean;
  isGroupFlightWidgetPresent: boolean;
  isHotelRequestWidgetPresent: boolean;
};

export const getApolloClientMocks = (state: QuestionWidgetMockData): MockedResponse<Record<string, $TSFixMe>>[] => {
  const {
    isAirActualWidgetPresent = false,
    isAirRequestWidgetPresent = false,
    isGroupFlightWidgetPresent = false,
    isHotelRequestWidgetPresent = false
  } = state;
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
                airActual: {
                  enabled: isAirActualWidgetPresent
                },
                airRequest: {
                  enabled: isAirRequestWidgetPresent
                },
                groupFlight: {
                  enabled: isGroupFlightWidgetPresent
                },
                hotelRequest: {
                  enabled: isHotelRequestWidgetPresent
                }
              }
            }
          }
        }
      }
    }
  ];
};
