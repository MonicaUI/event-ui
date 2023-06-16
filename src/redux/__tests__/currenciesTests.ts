import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer, { setCurrencies, loadAllCurrencies } from '../currencies';

const getCurrenciesMock = jest.fn();
getCurrenciesMock.mockReturnValue(
  new Promise(resolve =>
    resolve({
      currencies: {
        1: {
          id: '1',
          iSOCode: 123,
          nameOfSymbol: 'Double Dollars',
          symbol: '$$',
          name: 'Double Dollars',
          resourceKey: 'resourceKey1'
        }
      }
    })
  )
);
const initialState = {
  clients: {
    lookupClient: {
      getCurrencies: getCurrenciesMock
    }
  },
  currencies: {
    1: {
      id: 1,
      iSOCode: 123,
      nameOfSymbol: 'Double Dollars',
      symbol: '$$',
      name: 'Double Dollars',
      resourceKey: 'resourceKey1'
    }
  },
  text: {
    locale: 'locale1'
  }
};
const getState = (state = initialState) => state;
function clearMocksAndCreateStore(mockState = initialState) {
  jest.clearAllMocks();
  return createStore(
    (state, action) => {
      return {
        ...state,
        currencies: reducer(state.currencies, action)
      };
    },
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ clients: { lookupClient: { get... Remove this comment to see the full error message
    getState(mockState),
    applyMiddleware(thunk)
  );
}
let mockStore;
beforeEach(() => {
  mockStore = clearMocksAndCreateStore();
});

test('set currencies', () => {
  const newState = reducer(
    { 1: { id: 1, iSOCode: 123, nameOfSymbol: 'USD', symbol: '$', name: 'Dollars', resourceKey: 'resourceKey1' } },
    setCurrencies({
      2: { id: 2, iSOCode: 234, nameOfSymbol: 'INR', symbol: 'INR', name: 'Indian Rupees', resourceKey: 'resourceKey2' }
    })
  );
  expect(newState).not.toBeNull();
  expect(newState).toHaveProperty('2', {
    id: 2,
    iSOCode: 234,
    nameOfSymbol: 'INR',
    symbol: 'INR',
    name: 'Indian Rupees',
    resourceKey: 'resourceKey2'
  });
  expect(newState).toHaveProperty('1', {
    id: 1,
    iSOCode: 123,
    nameOfSymbol: 'USD',
    symbol: '$',
    name: 'Dollars',
    resourceKey: 'resourceKey1'
  });
});

describe('load all currencies when currencies already loaded', () => {
  test('matches snapshot', async () => {
    await mockStore.dispatch(loadAllCurrencies());
    expect(getCurrenciesMock).toHaveBeenCalledTimes(0);
  });
});

describe('load all currencies when currencies not loaded in state', () => {
  test('matches snapshot', async () => {
    const newState = {
      ...initialState,
      currencies: {}
    };
    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ currencies: {}; clients: { loo... Remove this comment to see the full error message
    mockStore = mockStore = clearMocksAndCreateStore(newState);
    await mockStore.dispatch(loadAllCurrencies());
    expect(getCurrenciesMock).toHaveBeenCalled();
    expect(mockStore.getState()).toMatchSnapshot();
  });
});
