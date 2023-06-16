import { GET_REG_TYPES } from './useRegTypes';

export const mockApolloClient = (readFragmentData = {}): $TSFixMe => {
  return {
    cache: {
      evict: jest.fn(),
      gc: jest.fn()
    },
    readFragment: jest.fn(() => readFragmentData)
  };
};

const request = {
  query: GET_REG_TYPES,
  variables: {
    eventId: 'EVENT_ID',
    regPathId: 'REG_PATH_ID',
    regCartId: 'REG_CART_ID',
    eventSnapshotVersion: 'VERSION',
    environment: 'ENV',
    attendeeType: 'INVITEE'
  }
};

export const getRegistrationTypeResults = [
  {
    request,
    result: {
      data: {
        getEvent: {
          visible: 'AVAILABLE',
          registrationTypes: [
            {
              id: '7a14802a-8aa0-4463-95f1-5e5793a63a8a',
              name: 'r1',
              visible: 'CAPACITY_FULL'
            },
            {
              id: '158ab11c-bc65-450a-92f6-6f5dc3a052ba',
              name: 'r2',
              visible: 'CLOSED'
            },
            {
              id: '00000000-0000-0000-0000-000000000000',
              name: '',
              visible: 'AVAILABLE'
            }
          ]
        }
      }
    }
  }
];

export const getEventData = [...getRegistrationTypeResults];
