import { startRegistration } from '../index';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import EventSnapshot from '../../../../../fixtures/EventSnapshot.json';
// eslint-disable-next-line jest/no-mocks-import
import { getState, response } from '../__mocks__/regCart';

function RegCartClient() {}

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const eventId = EventSnapshot.eventSnapshot.id;

jest.mock('querystring', () => {
  // to effectively set window.location.search
  const querystring = jest.requireActual<$TSFixMe>('querystring');
  return {
    ...querystring,
    parse: querystring.parse.bind(null, 'MarketoID=marketo-id&c=contact-id&contactWebsite=true')
  };
});

jest.mock('../../../actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../../actions'),
    filterEventSnapshot: () => () => {},
    loadRegistrationContent: () => () => {}
  };
});

RegCartClient.prototype.createRegCart = jest.fn(() => ({ regCart: response.regCart }));

afterEach(() => {
  jest.clearAllMocks();
});

test('creates a regCart with external reg contact id', async () => {
  const store = mockStore(getState());
  store.experiments = {
    ...store.experiments
  };
  await store.dispatch(startRegistration({ eventId }));
  const regCartClient = store.getState().clients.regCartClient;
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});

test('creates a regCart with external reg contact id - cached regCart pricing', async () => {
  const store = mockStore(getState());
  store.experiments = {
    ...store.experiments
  };
  await store.dispatch(startRegistration({ eventId }));
  const regCartClient = store.getState().clients.regCartClient;
  expect(regCartClient.createRegCart).toHaveBeenCalledTimes(1);
  expect(store.getActions()).toMatchSnapshot();
});
