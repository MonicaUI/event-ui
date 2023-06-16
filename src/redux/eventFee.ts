/*
 * All the active fee available in the Event
 */
import { isFlexBearerAuthRemovalOn } from '../ExperimentHelper';
import { loadEventFees as loadEventFeesEventWidget } from 'event-widgets/redux/modules/eventFee';
import { handleUserSessionTimeoutErrors } from '../errorHandling/userSessionTimeoutErrors';
import { AsyncAppThunk } from './reducer';

/*
 * Creates an action to load the event fees.
 */
export function loadEventFees(regTypeId: string, eventSnapshotVersion: string): AsyncAppThunk {
  return async (dispatch, getState) => {
    try {
      return await dispatch(
        loadEventFeesEventWidget(regTypeId, eventSnapshotVersion, isFlexBearerAuthRemovalOn(getState()))
      );
    } catch (error) {
      if (error.responseStatus === 401 && isFlexBearerAuthRemovalOn(getState())) {
        return dispatch(handleUserSessionTimeoutErrors(error.responseHeaders));
      }
      throw error;
    }
  };
}
