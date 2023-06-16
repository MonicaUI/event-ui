import { SPINNER_SELECTION_PENDING, SPINNER_SELECTION_DONE } from '../actionTypes';
import reducer from '../spinnerSelection';

describe('the transparentWrapper reducer test', () => {
  it('should change state.pendingSpinnerSelection to payload when dispatch SPINNER_SELECTION_PENDING', () => {
    let state = {
      pendingSpinnerSelection: ''
    };
    state = reducer(state, { type: SPINNER_SELECTION_PENDING, payload: '01831-1942-14123' });
    expect(state).toEqual({
      pendingSpinnerSelection: '01831-1942-14123'
    });
  });
  it('should change clear state.pendingSpinnerSelection when dispatch SPINNER_SELECTION_DONE', () => {
    let state = {
      pendingSpinnerSelection: '01831-1942-14123'
    };
    state = reducer(state, { type: SPINNER_SELECTION_DONE });
    expect(state).toEqual({
      pendingSpinnerSelection: ''
    });
  });
});
