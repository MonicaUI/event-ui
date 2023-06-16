import { SHOW_TRANSPARENT_WRAPPER, HIDE_TRANSPARENT_WRAPPER } from './actionTypes';

const initialState = {
  showTransparentWrapper: false
};

const reducer = (state = initialState, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case SHOW_TRANSPARENT_WRAPPER:
      return {
        ...state,
        showTransparentWrapper: true
      };
    case HIDE_TRANSPARENT_WRAPPER:
      return {
        ...state,
        showTransparentWrapper: false
      };
    default:
      return state;
  }
};

export default reducer;
