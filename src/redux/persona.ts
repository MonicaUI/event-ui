import { getAttendeeId } from './selectors/currentRegistrant';
import { getIn } from 'icepick';
import * as InviteeStatus from 'event-widgets/utils/InviteeStatus';
import { loadRegistrationContent } from './actions';
import { APPROVAL_DENIED, PENDING_APPROVAL } from './website/registrationProcesses';
import { getRegistrationPathIdOrNull } from './selectors/currentRegistrationPath';

function getInviteeStatus(state) {
  return getIn(state, ['persona', 'inviteeStatus']);
}

export function isInviteePendingApproval(state: $TSFixMe): $TSFixMe {
  return InviteeStatus.PendingApproval === getInviteeStatus(state);
}

export function isInviteeApprovalDenied(state: $TSFixMe): $TSFixMe {
  return InviteeStatus.DeniedApproval === getInviteeStatus(state);
}

export function isInviteeCancelled(state: $TSFixMe): $TSFixMe {
  return InviteeStatus.Cancelled === getInviteeStatus(state);
}

const INVITEE_IDENTIFIED = 'event-guestside-site/persona/INVITEE_IDENTIFIED';
const UPDATE_INVITEE_STATUS_AND_CONTACT_ID = 'event-guestside-site/persona/UPDATE_INVITEE_STATUS_AND_CONTACT_ID';

export const createInviteeIdentifiedAction = (invitee: $TSFixMe): $TSFixMe => {
  return {
    type: INVITEE_IDENTIFIED,
    payload: invitee
  };
};

const createUpdateInviteeStatusAction = invitee => {
  return {
    type: UPDATE_INVITEE_STATUS_AND_CONTACT_ID,
    payload: invitee
  };
};

export const updateInviteeStatusAndContactIdInStore = (invitee: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(createUpdateInviteeStatusAction(invitee));
  };
};

export const loadRegistrationContentForRegApproval = (inviteeStatusToLoad = null) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const inviteeStatus = inviteeStatusToLoad || getState().persona.inviteeStatus;
    if (inviteeStatus === InviteeStatus.PendingApproval) {
      await dispatch(loadRegistrationContent(PENDING_APPROVAL, getRegistrationPathIdOrNull(getState())));
    } else if (inviteeStatus === InviteeStatus.DeniedApproval) {
      await dispatch(loadRegistrationContent(APPROVAL_DENIED, getRegistrationPathIdOrNull(getState())));
    }
  };
};

export const identifyInvitee =
  (isContactIdRequired = false): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventPersonaClient },
      accessToken
    } = getState();
    const inviteeId = getState().userSession.inviteeId || getAttendeeId(getState());
    const invitee = await eventPersonaClient.identifyInvitee(accessToken, inviteeId, isContactIdRequired);
    if (invitee.inviteeStatus === InviteeStatus.PendingApproval) {
      await dispatch(loadRegistrationContent(PENDING_APPROVAL, getRegistrationPathIdOrNull(getState())));
    } else if (invitee.inviteeStatus === InviteeStatus.DeniedApproval) {
      await dispatch(loadRegistrationContent(APPROVAL_DENIED, getRegistrationPathIdOrNull(getState())));
    }
    dispatch(createInviteeIdentifiedAction(invitee));
  };

export const setPendingApprovalStatus =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch(createInviteeIdentifiedAction({ inviteeStatus: InviteeStatus.PendingApproval }));
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await loadRegistrationContent(PENDING_APPROVAL, getRegistrationPathIdOrNull(getState()));
  };

export const personaReducer = (state = {}, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case INVITEE_IDENTIFIED:
      return {
        ...state,
        inviteeStatus: action.payload.inviteeStatus,
        contactId: action.payload.contactId
      };
    case UPDATE_INVITEE_STATUS_AND_CONTACT_ID:
      return {
        ...state,
        inviteeStatus: InviteeStatus.InviteeStatusById[action.payload.inviteeStatus],
        contactId: action.payload.contactId
      };
    default:
      return state;
  }
};
