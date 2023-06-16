import { hasAnyValidBookingIncludingConcurAndPnr } from '../substituteTravelUtils';

describe('hasAnyValidBookingIncludingConcurAndPnr method', () => {
  test('should return false when cart is empty', () => {
    const newState = {
      registrationForm: {
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            groupLeaderEventRegId: {
              eventRegistrationId: 'groupLeaderEventRegId',
              attendeeType: 'GROUP_LEADER',
              attendee: {
                attendeeId: 'groupLeaderAttendeeId'
              }
            },
            attendeeRegId: {
              eventRegistrationId: 'attendeeRegId',
              attendeeType: 'ATTENDEE'
            },
            guestOneRegId: {
              eventRegistrationId: 'guestOneRegId',
              attendeeType: 'GUEST'
            },
            guestTwoRegId: {
              eventRegistrationId: 'guestTwoRegId',
              attendeeType: 'GUEST'
            }
          }
        }
      },
      travelCart: {
        cart: {}
      }
    };
    expect(hasAnyValidBookingIncludingConcurAndPnr(newState)).toBeFalsy();
  });

  test('should return true when Group leader or his guest or both have any valid booking', () => {
    const newState = {
      registrationForm: {
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            groupLeaderEventRegId: {
              eventRegistrationId: 'groupLeaderEventRegId',
              attendeeType: 'GROUP_LEADER',
              attendee: {
                attendeeId: 'groupLeaderAttendeeId'
              }
            },
            attendeeRegId: {
              eventRegistrationId: 'attendeeRegId',
              attendeeType: 'ATTENDEE'
            },
            guestOneRegId: {
              eventRegistrationId: 'guestOneRegId',
              attendeeType: 'GUEST'
            },
            guestTwoRegId: {
              eventRegistrationId: 'guestTwoRegId',
              attendeeType: 'GUEST'
            }
          }
        }
      },
      travelCart: {
        cart: {
          bookings: [
            {
              id: 'guestOneRegId',
              attendee: {
                id: 'guestOneId',
                type: 'GUEST',
                primaryInviteeId: 'groupLeaderAttendeeId'
              },
              airBookings: [
                {
                  id: 'guestOneBookingId',
                  requestedAction: 'BOOK'
                }
              ]
            },
            {
              id: 'groupLeaderEventRegId',
              attendee: {
                id: 'groupLeaderAttendeeId',
                type: 'INVITEE'
              },
              airBookings: [
                {
                  id: 'leaderAirBookingId',
                  requestedAction: 'CANCEL'
                }
              ]
            },
            {
              id: 'attendeeRegId',
              attendee: {
                id: 'groupMemberId',
                type: 'INVITEE'
              },
              airBookings: [
                {
                  id: 'memberAirBookingId',
                  requestedAction: 'BOOK'
                }
              ]
            },
            {
              id: 'guestTwoRegId',
              attendee: {
                id: 'guestTwoId',
                type: 'GUEST',
                primaryInviteeId: 'groupMemberId'
              },
              airBookings: [
                {
                  id: 'guestTwoBookingId',
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyValidBookingIncludingConcurAndPnr(newState)).toBeTruthy();
  });

  test('should return false when Group leader and his guests do not have any valid booking', () => {
    const newState = {
      registrationForm: {
        regCart: {
          groupRegistration: true,
          eventRegistrations: {
            groupLeaderEventRegId: {
              eventRegistrationId: 'groupLeaderEventRegId',
              attendeeType: 'GROUP_LEADER',
              attendee: {
                attendeeId: 'groupLeaderAttendeeId'
              }
            },
            attendeeRegId: {
              eventRegistrationId: 'attendeeRegId',
              attendeeType: 'ATTENDEE'
            },
            guestOneRegId: {
              eventRegistrationId: 'guestOneRegId',
              attendeeType: 'GUEST'
            },
            guestTwoRegId: {
              eventRegistrationId: 'guestTwoRegId',
              attendeeType: 'GUEST'
            }
          }
        }
      },
      travelCart: {
        cart: {
          bookings: [
            {
              id: 'attendeeRegId',
              attendee: {
                id: 'groupMemberId',
                type: 'INVITEE'
              },
              airBookings: [
                {
                  id: 'memberAirBookingId',
                  requestedAction: 'BOOK'
                }
              ]
            },
            {
              id: 'guestTwoRegId',
              attendee: {
                id: 'guestTwoId',
                type: 'GUEST',
                primaryInviteeId: 'groupMemberId'
              },
              airBookings: [
                {
                  id: 'guestTwoBookingId',
                  requestedAction: 'BOOK'
                }
              ]
            }
          ]
        }
      }
    };
    expect(hasAnyValidBookingIncludingConcurAndPnr(newState)).toBeFalsy();
  });

  test('should return false when Invited Group Member and his guest do not have any valid booking', () => {
    const newState = {
      registrationForm: {
        regCart: {
          groupRegistration: false,
          eventRegistrations: {
            groupLeaderEventRegId: {
              attendeeRegId: {
                eventRegistrationId: 'attendeeRegId',
                attendeeType: 'ATTENDEE'
              },
              guestTwoRegId: {
                eventRegistrationId: 'guestTwoRegId',
                attendeeType: 'GUEST'
              }
            }
          }
        },
        travelCart: {
          cart: {
            bookings: [
              {
                id: 'attendeeRegId',
                attendee: {
                  id: 'groupMemberId',
                  type: 'INVITEE'
                },
                airBookings: [
                  {
                    id: 'memberAirBookingId',
                    requestedAction: 'BOOK'
                  }
                ]
              },
              {
                id: 'guestTwoRegId',
                attendee: {
                  id: 'guestTwoId',
                  type: 'GUEST',
                  primaryInviteeId: 'groupMemberId'
                },
                airBookings: [
                  {
                    id: 'guestTwoBookingId',
                    requestedAction: 'BOOK'
                  }
                ]
              }
            ]
          }
        }
      }
    };
    expect(hasAnyValidBookingIncludingConcurAndPnr(newState)).toBeFalsy();
  });
});
