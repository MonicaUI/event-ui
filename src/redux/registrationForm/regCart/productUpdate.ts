import {
  SHOW_TRANSPARENT_WRAPPER,
  HIDE_TRANSPARENT_WRAPPER,
  SPINNER_SELECTION_PENDING,
  SPINNER_SELECTION_DONE
} from '../../actionTypes';
import { has } from 'lodash';

export const withTransparentWrapperOnly = (method: $TSFixMe) => {
  /**
   * @param args - The args which will be passed to the provided method.
   */
  return (...args: $TSFixMe[]) => {
    return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
      try {
        dispatch({ type: SHOW_TRANSPARENT_WRAPPER });
        const returnValue = await dispatch(method(...args));
        dispatch({ type: HIDE_TRANSPARENT_WRAPPER });
        return returnValue;
      } catch (error) {
        dispatch({ type: HIDE_TRANSPARENT_WRAPPER });
        throw error;
      }
    };
  };
};

export const withSpinnerButtonAndTransparentWrapper = (method: $TSFixMe) => {
  /**
   * @param args - The args which will be passed to the provided method.
   */
  return (...args: $TSFixMe[]) => {
    return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
      let spinnerSelectionId = '';
      args.forEach(ele => {
        if (has(ele, 'spinnerSelectionId')) {
          spinnerSelectionId = ele.spinnerSelectionId;
        }
      });
      try {
        dispatch({ type: SHOW_TRANSPARENT_WRAPPER });
        dispatch({ type: SPINNER_SELECTION_PENDING, payload: spinnerSelectionId });
        const returnValue = await dispatch(method(...args));
        dispatch({ type: SPINNER_SELECTION_DONE, payload: spinnerSelectionId });
        dispatch({ type: HIDE_TRANSPARENT_WRAPPER });
        return returnValue;
      } catch (error) {
        dispatch({ type: SPINNER_SELECTION_DONE, payload: spinnerSelectionId });
        throw error;
      }
    };
  };
};

export const initSessionSelection = () => {
  return () => {
    return (dispatch: $TSFixMe): $TSFixMe => {
      dispatch({ type: SPINNER_SELECTION_DONE });
    };
  };
};
