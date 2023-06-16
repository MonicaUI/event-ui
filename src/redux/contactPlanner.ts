const CONTACT_PLANNER_SUCCESS = 'event-guestside-site/contactPlanner/CONTACT_PLANNER_SUCCESS';
const CONTACT_PLANNER_ERROR = 'event-guestside-site/contactPlanner/CONTACT_PLANNER_ERROR';
const RESET_CONTACT_PLANNER = 'event-guestside-site/contactPlanner/RESET_CONTACT_PLANNER';

function contactPlannerSuccess() {
  return { type: CONTACT_PLANNER_SUCCESS };
}

function contactPlannerError() {
  return { type: CONTACT_PLANNER_ERROR };
}

export function resetContactPlanner(): $TSFixMe {
  return { type: RESET_CONTACT_PLANNER };
}

export function requestContactPlanner() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    try {
      const {
        event: { id: eventId },
        contactForm: { senderEmailAddress, message },
        clients: { eventEmailClient }
      } = getState();
      await eventEmailClient.sendPlannerEmail(eventId, senderEmailAddress, message);
      dispatch(contactPlannerSuccess());
    } catch (ex) {
      dispatch(contactPlannerError());
    }
  };
}

const initialState = {
  contactPlannerSuccess: false,
  contactPlannerError: false
};

export default function reducer(state = initialState, action = {}): $TSFixMe {
  switch ((action as $TSFixMe).type) {
    case CONTACT_PLANNER_SUCCESS:
      return { ...state, contactPlannerSuccess: true };
    case CONTACT_PLANNER_ERROR:
      return { ...state, contactPlannerError: true };
    case RESET_CONTACT_PLANNER:
      return { ...initialState };
    default:
      return state;
  }
}
