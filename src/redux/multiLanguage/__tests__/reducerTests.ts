import reducer from '../reducer';
import { SET_LOCALE } from 'nucleus-widgets/redux/modules/text';
import { LOAD_LANGUAGE } from '../actions';

describe('MultiLanguageReducer', () => {
  let state;
  beforeEach(() => {
    state = {
      event: {
        id: 'eventId'
      },
      locale: 'en-US',
      loadedLanguages: ['English']
    };
  });
  it('should return the initial state', () => {
    expect(reducer(state, {})).toEqual(state);
  });
  it('should update the locale in state', () => {
    const action = {
      type: SET_LOCALE,
      payload: {
        locale: 'fn-FN'
      }
    };
    const newstate = reducer(state, action);
    expect(newstate.locale).toEqual('fn-FN');
  });
  it('should update the loaded languages array', () => {
    const action = {
      type: LOAD_LANGUAGE,
      payload: 'French'
    };
    const newstate = reducer(state, action);
    expect(newstate.loadedLanguages).toEqual(['English', 'French']);
  });
});
