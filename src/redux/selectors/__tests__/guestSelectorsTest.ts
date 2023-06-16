import { getNoOfConfirmedGuestsWithGivenAttendingFormat } from '../guestSelectors';
import { AttendingFormat } from 'event-widgets/utils/AttendingFormatUtils';

const state = {
  appData: {
    registrationSettings: {}
  },
  registrationForm: {},
  event: {
    timezone: 35
  },
  timezones: {}
};

test('currentRegistrant.getConfirmedGuestsWithGivenAttendingFormat', () => {
  // The dataset has an invitee, one temporary guest, one inPerson guest and two virtual guests.

  const PRIMARY_INVITEE_REGISTRATION_ID = 'eventRegistrationAId';
  const TEMPORARY_GUEST_REGISTRATION_ID = 'eventRegistrationBId';
  const CONFIRMED_GUEST_REGISTRATION_ID1 = 'eventRegistrationDId1';
  const CONFIRMED_GUEST_REGISTRATION_ID2 = 'eventRegistrationDId2';
  const CONFIRMED_GUEST_REGISTRATION_ID3 = 'eventRegistrationDId3';
  const updatedRegCart = {
    regCartId: 'regCartAId',
    eventRegistrations: {
      [TEMPORARY_GUEST_REGISTRATION_ID]: {
        eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID,
        attendingFormatId: 0,
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        attendee: {
          attendeeId: 'attendeeBId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        requestedAction: 'REGISTER'
      },
      [CONFIRMED_GUEST_REGISTRATION_ID1]: {
        eventRegistrationId: CONFIRMED_GUEST_REGISTRATION_ID1,
        attendingFormatId: 1,
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        requestedAction: 'REGISTER'
      },
      [CONFIRMED_GUEST_REGISTRATION_ID2]: {
        eventRegistrationId: CONFIRMED_GUEST_REGISTRATION_ID2,
        attendingFormatId: 1,
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        requestedAction: 'REGISTER'
      },
      [CONFIRMED_GUEST_REGISTRATION_ID3]: {
        eventRegistrationId: CONFIRMED_GUEST_REGISTRATION_ID3,
        attendingFormatId: 0,
        primaryRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        attendee: {
          attendeeId: 'attendeeCId',
          personalInformation: {}
        },
        attendeeType: 'GUEST',
        requestedAction: 'REGISTER'
      },
      [PRIMARY_INVITEE_REGISTRATION_ID]: {
        eventRegistrationId: PRIMARY_INVITEE_REGISTRATION_ID,
        attendingFormatId: 1,
        attendee: {
          attendeeId: 'attendeeAId',
          personalInformation: {
            firstName: 'floofykins',
            lastName: 'snuffles',
            emailAddress: 'floofykins.snuffles@j.mail',
            socialMediaUrls: {
              FACEBOOK: 'http://www.facebook.com/YourChosenName'
            },
            customFields: {
              customFieldAId: {
                questionId: 'customFieldAId',
                answers: [
                  {
                    answerType: 'I am a dragon!',
                    text: 'text answer'
                  }
                ]
              }
            }
          },
          eventAnswers: {
            eventAnswerAId: {
              questionId: 'eventAnswerAId',
              answers: [
                {
                  answerType: 'Im Hungry!',
                  text: 'text answer'
                }
              ]
            }
          }
        },
        attendeeType: 'ATTENDEE'
      }
    }
  };
  const updatedState = {
    ...state,
    registrationForm: {
      currentGuestEventRegistration: { eventRegistrationId: TEMPORARY_GUEST_REGISTRATION_ID },
      regCart: updatedRegCart
    }
  };

  const noOfInPersonConfirmedGuests = getNoOfConfirmedGuestsWithGivenAttendingFormat(
    updatedState,
    AttendingFormat.INPERSON
  );

  const noOfVirtualConfirmedGuests = getNoOfConfirmedGuestsWithGivenAttendingFormat(
    updatedState,
    AttendingFormat.VIRTUAL
  );

  expect(noOfInPersonConfirmedGuests).toEqual(1);
  expect(noOfVirtualConfirmedGuests).toEqual(2);
});
