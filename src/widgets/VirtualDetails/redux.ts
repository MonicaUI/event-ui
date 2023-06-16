import querystring from 'querystring';
import { injectPageSnapshot } from '../../redux/actions';
import { populateAllProducts } from '../../redux/visibleProducts';
import { isBeforeStartTime, currentTimeIsInRangeOf } from 'event-widgets/redux/modules/timezones';
import { CANCELLED } from 'event-widgets/clients/EventStatus';
import { sessionStatus } from 'event-widgets/redux/selectors/event';
import Logger from '@cvent/nucleus-logging';

const SET_VIRTUAL_DETAILS = 'event-guestside-site/virtualDetails/SET_VIRTUAL_DETAILS';
const DISPLAY_SESSION_NOT_AVAILABLE_MESSAGE =
  'event-guestside-site/virtualDetails/DISPLAY_SESSION_NOT_AVAILABLE_MESSAGE';
export const EVENT = 'event';
export const SESSION = 'session';
export const VIRTUAL_DETAILS_PAGE = 'virtualDetailsPage';
export const SESSION_NOT_AVAILABLE_PAGE = 'sessionNotAvailableMessagePage';
const LOG = new Logger('widgets/virtualDetails/redux');

const setVirtualDetails = ({ code, url, type, isPassed, pageToDisplay }) => {
  return {
    type: SET_VIRTUAL_DETAILS,
    payload: { code, url, type, isPassed, pageToDisplay }
  };
};

const displaySessionNotAvailableMessage = () => {
  return {
    type: DISPLAY_SESSION_NOT_AVAILABLE_MESSAGE,
    payload: { pageToDisplay: SESSION_NOT_AVAILABLE_PAGE }
  };
};

export const joinWebcastSession =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      virtualDetails: { url }
    } = getState();
    if (url) {
      window.open(url, '_blank');
    }
  };

const getURLAndCode = (attendeeWebcastData, genericWebcastData) => {
  let url;
  let code;

  if (attendeeWebcastData?.join?.href) {
    url = attendeeWebcastData?.join?.href;
    code = attendeeWebcastData?.join?.code;
  } else if (genericWebcastData?.joiningURL) {
    url = genericWebcastData?.joiningURL;
    code = genericWebcastData?.joiningCode;
  }

  return { url, code };
};

const fetchSessionWebcastData = (attendeeId, sessionId) => async (dispatch, getState) => {
  let {
    // eslint-disable-next-line prefer-const
    selectedTimeZone,
    // eslint-disable-next-line prefer-const
    text: { eventTimezone },
    // eslint-disable-next-line prefer-const
    clients: { universalWebcastClient },
    visibleProducts: { Widget: { sessionProducts = {} } = {} }
  } = getState();
  let virtualData = {};
  let attendeeLinksContainer;
  let attendeeWebcastData;

  await dispatch(populateAllProducts('Widget'));
  sessionProducts = getState().visibleProducts?.Widget?.sessionProducts;
  const selectedSessionDetails = sessionProducts[sessionId];

  // If session was deleted in test mode
  if (!selectedSessionDetails) {
    dispatch(displaySessionNotAvailableMessage());
    return;
  }

  if (selectedSessionDetails.status === sessionStatus.cancelled) {
    return;
  }

  const isSessionPassed = !(
    currentTimeIsInRangeOf(
      selectedSessionDetails.startTime,
      selectedSessionDetails.endTime,
      selectedTimeZone,
      eventTimezone
    ) || isBeforeStartTime(selectedSessionDetails.startTime, selectedTimeZone, eventTimezone)
  );

  if (isSessionPassed) {
    if (selectedSessionDetails?.webcast?.recordingURL) {
      virtualData = {
        url: selectedSessionDetails?.webcast?.recordingURL,
        code: selectedSessionDetails?.webcast.recordingCode
      };
    } else {
      return;
    }
  } else {
    try {
      attendeeLinksContainer = await universalWebcastClient.getAttendeeLinkData(attendeeId);
    } catch (error) {
      LOG.warn(`Failed to get attendee specific session webcast data for attendeeId ${attendeeId}`);
      return;
    }
    attendeeWebcastData = attendeeLinksContainer?.data.find(
      attendeeLinkData => attendeeLinkData?.session?.id === sessionId
    );
    virtualData = getURLAndCode(attendeeWebcastData, selectedSessionDetails.webcast);
  }

  if (!(virtualData as $TSFixMe)?.url) {
    return;
  }

  dispatch(
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ type: string; isPassed: boolea... Remove this comment to see the full error message
    setVirtualDetails({ ...virtualData, type: SESSION, isPassed: isSessionPassed, pageToDisplay: VIRTUAL_DETAILS_PAGE })
  );
};

const fetchEventWebcastData = attendeeId => async (dispatch, getState) => {
  const {
    event: { status: eventStatus, webcast: eventWebcast, startDate, endDate },
    selectedTimeZone,
    text: { eventTimezone },
    clients: { universalWebcastClient }
  } = getState();
  let virtualData = {};
  let attendeeLinksContainer;
  let attendeeWebcastData;

  if (eventStatus === CANCELLED) {
    return;
  }

  const isEventPassed = !(
    currentTimeIsInRangeOf(startDate, endDate, selectedTimeZone, eventTimezone) ||
    isBeforeStartTime(startDate, selectedTimeZone, eventTimezone)
  );

  if (isEventPassed) {
    if (eventWebcast?.recordingURL) {
      virtualData = {
        url: eventWebcast?.recordingURL,
        code: eventWebcast?.recordingCode
      };
    } else {
      return;
    }
  } else {
    try {
      attendeeLinksContainer = attendeeId ? await universalWebcastClient.getAttendeeLinkData(attendeeId) : undefined;
    } catch (error) {
      LOG.warn(`Failed to get attendee specific event webcast data for attendeeId ${attendeeId}`);
      return;
    }
    attendeeWebcastData = attendeeLinksContainer?.data.find(
      attendeeLinkData => Object.keys(attendeeLinkData?.session).length === 0
    );
    virtualData = getURLAndCode(attendeeWebcastData, eventWebcast);
  }

  if (!(virtualData as $TSFixMe)?.url) {
    return;
  }

  dispatch(
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ type: string; isPassed: boolea... Remove this comment to see the full error message
    setVirtualDetails({ ...virtualData, type: EVENT, isPassed: isEventPassed, pageToDisplay: VIRTUAL_DETAILS_PAGE })
  );
};

export const prepareForVirtualDetailsPageLoad =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      userSession: { inviteeId }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
    const guestId = queryParams.g;
    const sessionId = queryParams.sessionId;
    const attendeeId = guestId || inviteeId;
    let virtualDetailsPage;

    if (sessionId) {
      if (attendeeId) {
        await dispatch(fetchSessionWebcastData(attendeeId, sessionId));
      }
    } else {
      await dispatch(fetchEventWebcastData(attendeeId));
    }

    if (getState()?.virtualDetails?.pageToDisplay === VIRTUAL_DETAILS_PAGE) {
      // eslint-disable-next-line import/no-cycle
      virtualDetailsPage = (await import(/* webpackChunkName: "virtualDetails" */ './content')).virtualDetailsPage;
    } else if (getState()?.virtualDetails?.pageToDisplay === SESSION_NOT_AVAILABLE_PAGE) {
      // eslint-disable-next-line import/no-cycle
      virtualDetailsPage = (await import(/* webpackChunkName: "virtualDetails" */ './content'))
        .sessionNotAvailableMessagePage;
    } else {
      // eslint-disable-next-line import/no-cycle
      virtualDetailsPage = (await import(/* webpackChunkName: "virtualDetails" */ './content')).genericMessagePage;
    }

    dispatch(injectPageSnapshot(virtualDetailsPage));
  };

export const virtualDetailsReducer = (state = {}, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case SET_VIRTUAL_DETAILS:
    case DISPLAY_SESSION_NOT_AVAILABLE_MESSAGE:
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};
