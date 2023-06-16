/* eslint-disable import/no-cycle */

import { injectPageSnapshot } from '../../redux/actions';
import querystring from 'querystring';

/**
 * Opt-out and opt-in Redux module:
 * Event invitees can click "Opt Out" link in their emails to opt them out all communications from the event account
 */
const GET_OPT_OUT_STATUS = 'event-guestside-site/optOut/GET_OPT_OUT_STATUS';
const OPT_OUT_CONTACT = 'event-guestside-site/optOut/OPT_OUT_CONTACT';

const createGetOptedOutStatusAction = contactInfo => {
  return {
    type: GET_OPT_OUT_STATUS,
    payload: contactInfo
  };
};

export const getOptOutStatus =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventGuestClient },
      accessToken,
      event: { id: eventId }
    } = getState();
    let {
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const guestId = queryParams.g;
    const contactId = queryParams.c;
    if (contactId) {
      inviteeId = null;
    }
    const optedOutContact = await eventGuestClient.getOptOutStatus(accessToken, eventId, inviteeId, guestId, contactId);
    dispatch(createGetOptedOutStatusAction(optedOutContact));
  };

export const createOptedOutAction = (contactInfo: $TSFixMe): $TSFixMe => {
  return {
    type: OPT_OUT_CONTACT,
    payload: contactInfo
  };
};

export const optOutAction =
  (optOutStatus: $TSFixMe, fromConfirmPage: $TSFixMe): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { eventGuestClient },
      accessToken,
      event: { id: eventId }
    } = getState();
    let {
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const guestId = queryParams.g;
    const contactId = queryParams.c;
    if (contactId) {
      inviteeId = null;
    }
    // eslint-disable-next-line import/no-cycle
    const page = (await import(/* webpackChunkName optOut */ './content')).optInOutPageNew;
    if ((fromConfirmPage && optOutStatus) || !fromConfirmPage) {
      const optedOutContact = await eventGuestClient.optOut(
        accessToken,
        eventId,
        inviteeId,
        guestId,
        contactId,
        optOutStatus
      );
      dispatch(createOptedOutAction(optedOutContact));
    }
    dispatch(injectPageSnapshot(page));
  };

export const prepareForOptOutPageLoad =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const guestId = queryParams.g;
    const contactId = queryParams.c;
    let page;
    if (!inviteeId && !guestId && !contactId) {
      page = (await import(/* webpackChunkName optOut */ './invalidInviteeContent')).invalidInviteeOptOut;
    } else {
      await dispatch(getOptOutStatus());
      if (getState() && getState().optOut && getState().optOut.optOutStatus) {
        // eslint-disable-next-line import/no-cycle
        page = (await import(/* webpackChunkName optOut */ './content')).optInOutPage;
      } else {
        // eslint-disable-next-line import/no-cycle
        page = (await import(/* webpackChunkName optOut */ './content')).confirmationPage;
      }
    }
    dispatch(injectPageSnapshot(page));
  };

export const optOutReducer = (state = {}, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case GET_OPT_OUT_STATUS:
    case OPT_OUT_CONTACT:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
