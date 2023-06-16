import baseReducer, {
  loadCapacityCounts,
  getAdmissionItemCapacityIds,
  getRegTypeCapacityIds,
  getAllSessionCapacityIds,
  getQuantityItemCapacityIds,
  loadQuantityItemCapacity,
  loadSessionSelectionCapacityCounts,
  loadEventRegistrationCapacityCounts,
  checkIfLimitedCountForSingleCapacity
} from 'event-widgets/redux/modules/capacity';
import { getRegPackId } from '../selectors/shared';
import { UPDATE_REG_CART_SESSION_SUCCESS } from '../registrationForm/regCart/actionTypes';
import { refPreserving } from '@cvent/ref-preserving-function';

const collectAllCapacityIdsFromStore = (event, regPackId) => {
  const regTypeCapacityIds = getRegTypeCapacityIds(event, null, regPackId);
  const sessionCapacityIds = getAllSessionCapacityIds(event);
  const admissionCapacityIds = getAdmissionItemCapacityIds(event);
  const quantityItemCapacityIds = getQuantityItemCapacityIds(event);
  const eventCapacityId = event.capacityId;
  return [
    ...sessionCapacityIds,
    ...admissionCapacityIds,
    eventCapacityId,
    ...regTypeCapacityIds,
    ...quantityItemCapacityIds
  ];
};

export const fetchCapacitySummaries = async (
  regCartClient: $TSFixMe,
  capacityClient: $TSFixMe,
  accessToken: $TSFixMe,
  regCartId: $TSFixMe,
  capacityIds: $TSFixMe,
  hasSessionInitialized: $TSFixMe
): Promise<$TSFixMe> => {
  // If regCartId is present, call the regAPI capacity endpoint, otherwise just call capacity service directly
  let capacity = null;
  if (regCartId && hasSessionInitialized) {
    capacity = regCartClient.getCapacitySummaries(accessToken, regCartId, capacityIds);
  } else if (regCartId && !hasSessionInitialized) {
    capacity = regCartClient.getCapacitySummariesOnPageLoad(accessToken, regCartId, capacityIds);
  } else {
    capacity = capacityClient.getCapacitySummaries(accessToken, capacityIds);
  }
  return capacity;
};

export const loadAvailableCapacityCounts = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      event,
      clients: { regCartClient, capacityClient },
      userSession
    } = getState();
    const capacityIds = collectAllCapacityIdsFromStore(event, getRegPackId(getState()));
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = userSession && userSession.regCartId;
    dispatch(
      loadCapacityCounts(
        await fetchCapacitySummaries(regCartClient, capacityClient, accessToken, regCartId, capacityIds, true)
      )
    );
  };
};

export const loadAvailableEventRegistrationCapacityCounts = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      event,
      clients: { regCartClient, capacityClient },
      userSession
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = userSession && userSession.regCartId;
    const regTypeCapacityIds = getRegTypeCapacityIds(event, null, getRegPackId(getState()));
    const eventCapacityId = event.capacityId;
    const capacityIds = [...regTypeCapacityIds, eventCapacityId];
    dispatch(
      loadEventRegistrationCapacityCounts(
        await fetchCapacitySummaries(regCartClient, capacityClient, accessToken, regCartId, capacityIds, true)
      )
    );
  };
};

export const loadAvailableQuantityItemCapacityCounts = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      event,
      clients: { regCartClient, capacityClient },
      userSession
    } = getState();
    const quantityItemCapacityIds = getQuantityItemCapacityIds(event);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = userSession && userSession.regCartId;
    dispatch(
      loadQuantityItemCapacity(
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        await fetchCapacitySummaries(
          regCartClient,
          capacityClient,
          accessToken,
          regCartId,
          quantityItemCapacityIds,
          true
        )
      )
    );
  };
};

/**
 * exclude those session capacity id which has unlimited capacity
 * this is to reduce the number of request in capacity service for session capacity
 * e.g: when <loadAvailableSessionCapacityCounts> is being called
 */
const excludeUnlimitedSessionCapacityIds = (sessionCapacityIds, eventCapacity) => {
  if (eventCapacity) {
    return (
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      sessionCapacityIds &&
      sessionCapacityIds.filter(sessionCapacityId =>
        checkIfLimitedCountForSingleCapacity(sessionCapacityId, eventCapacity)
      )
    );
  }
  return sessionCapacityIds;
};

export const loadAvailableSessionCapacityCounts = (capacityIds = null) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { regCartClient, capacityClient },
      userSession,
      event,
      capacity
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = userSession && userSession.regCartId;
    let sessionCapacityIds = capacityIds;
    if (!sessionCapacityIds) {
      sessionCapacityIds = getAllSessionCapacityIds(event);
    }
    sessionCapacityIds = excludeUnlimitedSessionCapacityIds(sessionCapacityIds, capacity);
    /*
     * if sessionCapacityIds collection doesn't have anything, we don't need to make the capacity service call
     * e.g: all sessions are unlimited
     *
     * In case of no sessions present
     * capacity service call breaks when agenda widget is dropped on page
     */
    if (sessionCapacityIds && sessionCapacityIds.length > 0) {
      dispatch(
        loadSessionSelectionCapacityCounts(
          await fetchCapacitySummaries(regCartClient, capacityClient, accessToken, regCartId, sessionCapacityIds, true)
        )
      );
    }
  };
};

/**
 * initially when user lands on guest side summary page, we are not including capacities for sessions
 * from service side rendering, when user navigates to agenda widget tab, we need to load capacities for
 * all available sessions from event, since currently the capacity in state would not include for sessions
 */
export const loadAvailableSessionCapacityCountsForAgendaWidget = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { regCartClient, capacityClient },
      userSession,
      event
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const regCartId = userSession && userSession.regCartId;
    const sessionCapacityIds = getAllSessionCapacityIds(event);

    if (sessionCapacityIds && sessionCapacityIds.length > 0) {
      dispatch(
        loadSessionSelectionCapacityCounts(
          await fetchCapacitySummaries(regCartClient, capacityClient, accessToken, regCartId, sessionCapacityIds, true)
        )
      );
    }
  };
};

function reducer(oldState, action) {
  const state = baseReducer(oldState, action);
  switch (action.type) {
    case UPDATE_REG_CART_SESSION_SUCCESS: {
      const updates = {};
      for (const { capacityId, change } of action.payload.optimisticCapacityUpdates) {
        if (state[capacityId] && state[capacityId].totalCapacityAvailable !== -1) {
          updates[capacityId] = {
            ...state[capacityId],
            availableCapacity: state[capacityId].availableCapacity + change
          };
        }
      }
      return {
        ...state,
        ...updates
      };
    }
    default:
      return state;
  }
}

export default refPreserving(reducer);
