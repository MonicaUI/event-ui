import { handleUserSessionTimeoutErrors } from '../userSessionTimeoutErrors';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { redirectToExternalAuth, redirectToOAuth } from '../../redux/pathInfo';
import { openSessionTimedOutDialog } from '../../dialogs/SessionTimedOutDialog';

jest.mock('../../redux/pathInfo', () => ({
  redirectToExternalAuth: jest.fn(() => () => {}),
  redirectToOAuth: jest.fn(() => () => {})
}));

jest.mock('../../dialogs/SessionTimedOutDialog', () => ({
  openSessionTimedOutDialog: jest.fn(() => () => {})
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
function getState() {
  return {};
}

let store;
beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(getState());
});

test('Verify timeouts are handled correctly', () => {
  const map = new Map();
  map.set('ACCESS-FAILED', 'EXTERNAL_AUTH');
  store.dispatch(handleUserSessionTimeoutErrors(map));

  let redirect;
  redirect = redirectToExternalAuth;
  expect(redirect).toHaveBeenCalled();

  map.set('ACCESS-FAILED', 'OAUTH');
  store.dispatch(handleUserSessionTimeoutErrors(map));

  redirect = redirectToOAuth;
  expect(redirect).toHaveBeenCalled();

  map.set('ACCESS-FAILED', 'REG_CART_EXPIRED');
  store.dispatch(handleUserSessionTimeoutErrors(map));

  redirect = openSessionTimedOutDialog;
  expect(redirect).toHaveBeenCalled();
});

test('Verify timeouts are handled correctly if incorrect header is passed', () => {
  const map = new Map();
  map.set('wrong header', 'EXTERNAL_AUTH');
  store.dispatch(handleUserSessionTimeoutErrors(map));
});

test('Verify timeouts are handled correctly if unknown value passed', () => {
  const map = new Map();
  map.set('ACCESS-FAILED', 'UNKNOWN');
  store.dispatch(handleUserSessionTimeoutErrors(map));
});

test('Verify timeouts are handled correctly if blank header is passed', () => {
  const map = new Map();
  store.dispatch(handleUserSessionTimeoutErrors(map));
});

test('Verify that redirectToOAuth is called with the correct parameters', () => {
  const map = new Map();

  map.set('ACCESS-FAILED', 'OAUTH');
  store.dispatch(handleUserSessionTimeoutErrors(map));

  const redirect = redirectToOAuth;
  expect(redirect).toHaveBeenCalledWith(undefined, undefined);
});
