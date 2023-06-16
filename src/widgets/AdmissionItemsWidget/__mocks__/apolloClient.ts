import { GET_ADMISSION_ITEMS } from '../useAdmissionItems';
import { Visible } from '@cvent/event-ui-apollo-server/src/schema/types';

export const eventId = 'EVENT_ID';
export const environment = 'S437';
export const eventSnapshotVersion = 'VERSION';

export const mockApolloClient = [
  {
    request: {
      query: GET_ADMISSION_ITEMS,
      variables: {
        eventId,
        environment,
        eventSnapshotVersion,
        regCartId: 'REG_CART_ID',
        regPathId: 'REG_PATH_ID',
        filter:
          "applicableContactTypes is empty or applicableContactTypes contains '00000000-0000-0000-0000-000000000000'",
        includeInPersonCapacity: true,
        includeVirtualCapacity: false
      }
    },
    result: {
      data: {
        getEvent: {
          admissionItems: [
            {
              id: '213994f0-f2e1-48da-a016-37a80a5cc5d6',
              name: 'Event Registration',
              visible: Visible.Available,
              description: '',
              code: '',
              applicableContactTypes: ['regTypeId1'],
              defaultFeeId: '00000000-0000-0000-0000-000000000000',
              displayOrder: 2,
              capacity: {
                inPerson: {
                  available: -1,
                  total: -1
                }
              }
            }
          ]
        }
      }
    }
  }
];
