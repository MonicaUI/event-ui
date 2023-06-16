import thunk from 'redux-thunk';
import { setCookieConsent } from '../action';
import cookieConsentReducer from '../reducer';
import { applyMiddleware, createStore } from 'redux';
import { ALLOW } from '../../../utils/CookieConstants';

let store;
const initialState = {
  cookieConsent: {}
};

const getState = (state = initialState) => state;
function clearMocksAndCreateStore(mockState = initialState) {
  jest.clearAllMocks();
  store = createStore(
    (state, action) => {
      return {
        ...state,
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ cookieConsent: {}; }' is not a... Remove this comment to see the full error message
        cookieConsent: cookieConsentReducer(state, action)
      };
    },
    getState(mockState),
    applyMiddleware(thunk)
  );
}

describe('setCookieConsent', () => {
  it('sets cookie consent to allow all', async () => {
    clearMocksAndCreateStore(initialState);
    await store.dispatch(setCookieConsent(ALLOW));
    expect(store.getState().cookieConsent.status).toBe(ALLOW);
  });
});
