import { SPINNER_SELECTION_PENDING, SPINNER_SELECTION_DONE } from './actionTypes';

const initialState = {
  pendingSpinnerSelection: ''
};

const reducer = (state = initialState, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case SPINNER_SELECTION_PENDING: {
      return { ...state, pendingSpinnerSelection: action.payload };
    }
    case SPINNER_SELECTION_DONE: {
      return {
        ...state,
        pendingSpinnerSelection: ''
      };
    }
    default:
      return state;
  }
};

export default reducer;
