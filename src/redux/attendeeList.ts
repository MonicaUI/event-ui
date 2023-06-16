import { getAttendeeId } from './selectors/currentRegistrant';
export const ATTENDEE_EMAIL_SUCCESS = 'event-guestside-site/attendeeList/ATTENDEE_EMAIL_SUCCESS';
export const ATTENDEE_EMAIL_ERROR = 'event-guestside-site/attendeeList/ATTENDEE_EMAIL_ERROR';
export const RESET_ATTENDEE_EMAIL = 'event-guestside-site/attendeeList/RESET_ATTENDEE_EMAIL';

export function attendeeEmailSuccess(): $TSFixMe {
  return { type: ATTENDEE_EMAIL_SUCCESS };
}

export function attendeeEmailError(): $TSFixMe {
  return { type: ATTENDEE_EMAIL_ERROR };
}

export function resetAttendeeEmail(): $TSFixMe {
  return { type: RESET_ATTENDEE_EMAIL };
}

const initialState = {
  attendeeEmailSuccess: false,
  attendeeEmailError: false
};

export function sendAttendeeEmail(
  senderEmailAddress: $TSFixMe,
  message: $TSFixMe,
  subject: $TSFixMe,
  contactStub: $TSFixMe,
  receiverAttendeeId: $TSFixMe,
  guestId: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const {
        event: { id: eventId },
        clients: { eventEmailClient },
        registrationForm
      } = getState();
      const attendeeId = getAttendeeId({ registrationForm });
      const emailToSend = {
        senderEmail: senderEmailAddress,
        message,
        subject,
        contactStub,
        attendeeId,
        receiverAttendeeId,
        guestId
      };
      await eventEmailClient.sendAttendeeEmail(eventId, emailToSend);
      dispatch(attendeeEmailSuccess());
    } catch (ex) {
      dispatch(attendeeEmailError());
    }
  };
}

export default function reducer(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case ATTENDEE_EMAIL_SUCCESS:
      return { ...state, attendeeEmailSuccess: true };
    case ATTENDEE_EMAIL_ERROR:
      return { ...state, attendeeEmailError: true };
    case RESET_ATTENDEE_EMAIL:
      return { ...initialState };
    default:
      return state;
  }
}
