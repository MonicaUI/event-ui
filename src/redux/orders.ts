import { CLEAR_ORDERS, GET_ORDERS } from './actionTypes';

/**
 *
 * @param state
 * @param action
 * @returns {*}
 */
export const ordersReducer = (state: $TSFixMe, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case GET_ORDERS:
      return action.payload.ordersResponse;
    case CLEAR_ORDERS:
      return '';
    default:
      return state;
  }
};
