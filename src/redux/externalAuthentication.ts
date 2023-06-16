import { SET_CURRENT_PAGE } from './pathInfo';
import { ARRIVE_FROM_SSO_DIALOG } from './registrantLogin/actionTypes';

const initialState = {
  scrollToRegTyoe: false,
  regTypeId: '',
  persistRegType: false,
  hasDialogBeenOpened: false
};

const SINGLE_SIGN_ON_DIALOG_OPENED = 'event-guestside-site/externalAuthentication/SINGLE_SIGN_ON_DIALOG_OPENED';

const reducer = (state = initialState, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case SET_CURRENT_PAGE:
      return {
        ...state,
        arriveFromDialog: false
      };
    case ARRIVE_FROM_SSO_DIALOG:
      return {
        ...state,
        arriveFromDialog: action.payload.arriveFromDialog
      };
    case SINGLE_SIGN_ON_DIALOG_OPENED:
      return {
        ...state,
        hasDialogBeenOpened: true
      };
    default:
      return state;
  }
};

export const setArriveFromDialogInUserSession = (arriveFromDialog: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: ARRIVE_FROM_SSO_DIALOG,
      payload: {
        arriveFromDialog
      }
    });
  };
};

export const setDialogBeenOpened = () => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: SINGLE_SIGN_ON_DIALOG_OPENED
    });
  };
};

export default reducer;
