import {
  attendeeEmailSuccess,
  attendeeEmailError,
  resetAttendeeEmail,
  ATTENDEE_EMAIL_SUCCESS,
  ATTENDEE_EMAIL_ERROR,
  RESET_ATTENDEE_EMAIL,
  sendAttendeeEmail
} from '../attendeeList';
import reducer from '../attendeeList';

describe('Attendee List redux', () => {
  describe('Attendee List actions', () => {
    test('attendeeEmailSuccess returns correct action type', async () => {
      const action = attendeeEmailSuccess();
      expect(action.type).toEqual(ATTENDEE_EMAIL_SUCCESS);
    });
    test('attendeeEmailError returns correct action type', async () => {
      const action = attendeeEmailError();
      expect(action.type).toEqual(ATTENDEE_EMAIL_ERROR);
    });
    test('resetAttendeeEmail returns correct action type', async () => {
      const action = resetAttendeeEmail();
      expect(action.type).toEqual(RESET_ATTENDEE_EMAIL);
    });
  });
  describe('Attendee List reducer', () => {
    const defaultState = {
      attendeeEmailSuccess: false,
      attendeeEmailError: false
    };
    test('attendeeEmailSuccess returns correct flag settings', async () => {
      const action = { type: ATTENDEE_EMAIL_SUCCESS };
      const state = reducer(defaultState, action);
      expect(state.attendeeEmailSuccess).toBeTruthy();
      expect(state.attendeeEmailError).toBeFalsy();
    });
    test('attendeeEmailError returns correct flag settings', async () => {
      const action = { type: ATTENDEE_EMAIL_ERROR };
      const state = reducer(defaultState, action);
      expect(state.attendeeEmailSuccess).toBeFalsy();
      expect(state.attendeeEmailError).toBeTruthy();
    });
    test('resetAttendeeEmail returns correct flag settings', async () => {
      const action = { type: RESET_ATTENDEE_EMAIL };
      const testState = {
        attendeeEmailSuccess: true,
        attendeeEmailError: true
      };
      const state = reducer(testState, action);
      expect(state.attendeeEmailSuccess).toBeFalsy();
      expect(state.attendeeEmailError).toBeFalsy();
    });
    test('other action type returns same flag settings', async () => {
      const action = { type: 'TestType' };
      const state = reducer(defaultState, action);
      expect(state.attendeeEmailSuccess).toBeFalsy();
      expect(state.attendeeEmailError).toBeFalsy();
    });
    test('attendee stub should be used when calling sendAttendeeEmail', async () => {
      const eventEmailClient = {
        sendAttendeeEmail: jest.fn()
      };
      const registrationForm = {
        regCart: {
          eventRegistrations: {
            'event-registration-id': {
              attendee: {
                attendeeId: 'attendeeId'
              }
            }
          }
        }
      };
      const getState = () => {
        return {
          event: { id: 'event-id' },
          clients: { eventEmailClient },
          registrationForm
        };
      };
      const emailToSend = {
        senderEmail: 'senderEmailAddress@no.mail',
        message: 'message',
        subject: 'subject',
        contactStub: 'contact-stub',
        attendeeId: 'attendeeId',
        receiverAttendeeId: 'receiverAttendeeId',
        guestId: 'guestId'
      };
      const reduxFunction = sendAttendeeEmail(
        'senderEmailAddress@no.mail',
        'message',
        'subject',
        'contact-stub',
        'receiverAttendeeId',
        'guestId'
      );
      const dispatch = () => {};
      await reduxFunction(dispatch, getState);
      expect(eventEmailClient.sendAttendeeEmail).toHaveBeenCalledWith('event-id', emailToSend);
    });
  });
});
