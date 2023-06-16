export const INVITATION_FORWARDING_SUCCESS = 'event-guestside-site/invitationForwarding/INVITATION_FORWARDING_SUCCESS';
export const INVITATION_FORWARDING_ERROR = 'event-guestside-site/invitationForwarding/INVITATION_FORWARDING_ERROR';
export const RESET_INVITATION_FORWARDING = 'event-guestside-site/invitationForwarding/RESET_INVITATION_FORWARDING';
export const AUTO_FOCUS_ON = 'event-guestside-site/invitationForwarding/AUTO_FOCUS_ON';
export const SET_ENTITY = 'event-guestside-site/invitationForwarding/SET_ENTITY';

export function forwardingInvitationSuccess(): $TSFixMe {
  return { type: INVITATION_FORWARDING_SUCCESS };
}

export function forwardingInvitationError(): $TSFixMe {
  return { type: INVITATION_FORWARDING_ERROR };
}

export function requestForwardingInvitations() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    try {
      dispatch(forwardingInvitationSuccess());
    } catch (ex) {
      dispatch(forwardingInvitationError());
    }
  };
}

export function resetInvitationForwarding(): $TSFixMe {
  return { type: RESET_INVITATION_FORWARDING };
}

export function turnOnAutoFocus(): $TSFixMe {
  return { type: AUTO_FOCUS_ON };
}

export function setEntity(value: $TSFixMe): $TSFixMe {
  return { type: SET_ENTITY, payload: { value } };
}

const initialState = {
  invitationForwardingSuccess: false,
  invitationForwardingError: false,
  autoFocus: false,
  entityList: []
};

export default function reducer(state = initialState, action = {}): $TSFixMe {
  switch ((action as $TSFixMe).type) {
    case INVITATION_FORWARDING_SUCCESS:
      return { ...state, invitationForwardingSuccess: true, invitationForwardingError: false };
    case INVITATION_FORWARDING_ERROR:
      return { ...state, invitationForwardingSuccess: true, invitationForwardingError: false };
    case RESET_INVITATION_FORWARDING:
      return initialState;
    case AUTO_FOCUS_ON:
      return { ...state, autoFocus: true };
    case SET_ENTITY:
      return { ...state, entityList: [...state.entityList, (action as $TSFixMe).payload.value] };
    default:
      return state;
  }
}
