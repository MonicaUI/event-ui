import { injectPageSnapshot } from '../../redux/actions';
import querystring from 'querystring';

/**
 * Unsubscribe and re-subscribe Redux module:
 * Event invitees can click "Unsubscribe" link in their emails to opt them out from the event emails communication
 */
const GET_UNSUBSCRIBE_STATUS = 'event-guestside-site/unsubscribe/GET_UNSUBSCRIBE_STATUS';
const SET_UNSUBSCRIBE_STATUS = 'event-guestside-site/unsubscribe/SET_UNSUBSCRIBE_STATUS';

const createGetUnsubscribeStatusAction = (unsubscribedContact, optOutStatus) => {
  return {
    type: GET_UNSUBSCRIBE_STATUS,
    payload: {
      ...optOutStatus,
      unsubscribeStatus: !unsubscribedContact.subscribed
    }
  };
};

export const getUnsubscribeStatus =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventEmailClient, eventGuestClient },
      accessToken,
      event: { id: eventId },
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const encodedGuestId = queryParams.g;
    const unsubscribedContact = await eventEmailClient.getSubscriptionStatus(eventId, inviteeId, encodedGuestId);
    // optOutStatus object has invitee/guest and planner infomation for display
    const optOutStatus = await eventGuestClient.getOptOutStatus(accessToken, eventId, inviteeId, encodedGuestId);
    dispatch(createGetUnsubscribeStatusAction(unsubscribedContact, optOutStatus));
  };

const createUnsubscribeAction = unsubscribeStatus => {
  return {
    type: SET_UNSUBSCRIBE_STATUS,
    payload: { unsubscribeStatus }
  };
};

export const unsubscribeAction =
  (unsubscribeStatus: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventEmailClient },
      event: { id: eventId },
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const encodedGuestId = queryParams.g;
    const subscribed = !unsubscribeStatus;
    await eventEmailClient.setSubscriptionStatus(eventId, inviteeId, encodedGuestId, subscribed);
    dispatch(createUnsubscribeAction(unsubscribeStatus));
  };

export const prepareForUnsubscribePageLoad =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const encodedGuestId = queryParams.g;
    let unsubscribePage;
    if (!inviteeId && !encodedGuestId) {
      unsubscribePage = (await import(/* webpackChunkName: "unsubscribe" */ './invalidInviteeContent'))
        .invalidInviteeUnsubscribePage;
    } else {
      await dispatch(getUnsubscribeStatus());
      // eslint-disable-next-line import/no-cycle
      unsubscribePage = (await import(/* webpackChunkName: "unsubscribe" */ './content')).unsubscribePage;
    }
    dispatch(injectPageSnapshot(unsubscribePage));
  };

export const unsubscribeReducer = (state = {}, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case GET_UNSUBSCRIBE_STATUS:
    case SET_UNSUBSCRIBE_STATUS:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
