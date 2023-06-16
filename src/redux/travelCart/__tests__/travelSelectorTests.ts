import { getTravelBookingsForCurrentRegistrantAndGuests, getTravelSnapshotVersion } from '../selectors';

test('Get Travel Bookings For Current Registrant And Guests', () => {
  const state = {
    travelCart: {
      cart: {
        bookings: [
          {
            id: 'ID_PRIMARY'
          },
          {
            id: 'ID_GUEST'
          }
        ]
      }
    },
    registrationForm: {
      regCart: {
        regCartId: 'DUMMY_CART_ID',
        eventRegistrations: {
          ID_PRIMARY: {
            eventRegistrationId: 'ID_PRIMARY',
            attendeeType: 'INVITEE',
            requestedAction: 'REGISTER'
          },
          ID_GUEST: {
            eventRegistrationId: 'ID_GUEST',
            attendeeType: 'GUEST',
            primaryRegistrationId: 'ID_PRIMARY',
            requestedAction: 'REGISTER'
          },
          ID_PRIMARY_2: {
            eventRegistrationId: 'ID_PRIMARY_2',
            attendeeType: 'INVITEE',
            requestedAction: 'REGISTER'
          },
          ID_GUEST_2: {
            eventRegistrationId: 'ID_GUEST_2',
            attendeeType: 'GUEST',
            primaryRegistrationId: 'ID_PRIMARY_2',
            requestedAction: 'REGISTER'
          }
        }
      }
    }
  };
  expect(getTravelBookingsForCurrentRegistrantAndGuests(state, 'ID_PRIMARY')).toMatchSnapshot();
});

test('getTravelSnapshotVersion', () => {
  const state = {
    eventTravel: {
      travelSnapshotVersion: 'travelSnapshotVersion'
    }
  };
  expect(getTravelSnapshotVersion(state)).toEqual('travelSnapshotVersion');
});
