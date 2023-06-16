import { getEventRegVisibleProducts, populateAllProducts, populateRegCartVisibleProducts } from '../visibleProducts';
import { logoutRegistrant } from '../registrantLogin/actions';
import { redirectToPage } from '../pathInfo';
import { isFlexBearerAuthRemovalOn } from '../../ExperimentHelper';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { handleUserSessionTimeoutErrors } from '../../errorHandling/userSessionTimeoutErrors';

const eventId = 'id';
class ServiceError extends Error {
  readonly responseStatus: number;
  readonly responseHeaders: Map<string, string>;

  constructor(responseStatus: number) {
    super();
    const map = new Map();
    map.set('ACCESS-FAILED', 'UNKNOWN');
    this.responseStatus = responseStatus;
    this.responseHeaders = map;
  }
}

const eventSnapshotClient = {
  getRegCartVisibleProducts: jest.fn(() => {
    throw new ServiceError(401);
  })
};

const productVisibilityClient = {
  getVisibleProducts: jest.fn(() => {
    throw new ServiceError(401);
  })
};

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
function getState() {
  return {
    defaultUserSession: {
      eventId
    },
    clients: { eventSnapshotClient, productVisibilityClient },
    experiments: {
      useProductVisibilityService: false
    }
  };
}

let store;
beforeEach(() => {
  jest.clearAllMocks();
  store = mockStore(getState());
});

jest.mock('../../errorHandling/userSessionTimeoutErrors', () => ({
  handleUserSessionTimeoutErrors: jest.fn(() => () => {})
}));

jest.mock('../registrantLogin/actions', () => ({
  logoutRegistrant: jest.fn(() => () => {})
}));

jest.mock('../pathInfo', () => ({
  redirectToPage: jest.fn(() => () => {})
}));

jest.mock('../../ExperimentHelper', () => ({
  isFlexBearerAuthRemovalOn: jest.fn(() => () => {})
}));

jest.mock('../selectors/shared', () => ({
  getRegCart: jest.fn(() => {
    return {
      regCartId: 'id'
    };
  })
}));

class NoErrorThrownError extends Error {}

const getError = async call => {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error) {
    return error;
  }
};

test('visibleProducts.getEventRegVisibleProducts errors', async () => {
  const flexBearerAuthRemovalOn = isFlexBearerAuthRemovalOn as jest.MockedFunction<typeof isFlexBearerAuthRemovalOn>;
  flexBearerAuthRemovalOn.mockImplementation(() => true);

  await store.dispatch(getEventRegVisibleProducts('widgetType', 'widgetId', [null]));

  const handleError = handleUserSessionTimeoutErrors;
  expect(handleError).toHaveBeenCalled();

  flexBearerAuthRemovalOn.mockImplementation(() => false);

  const error = await getError(
    async () => await store.dispatch(getEventRegVisibleProducts('widgetType', 'widgetId', [null]))
  );

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  const logout = logoutRegistrant;
  expect(logout).toHaveBeenCalled();
  const refresh = redirectToPage;
  expect(refresh).toHaveBeenCalled();
});

test('visibleProducts.populateVisibleProducts errors', async () => {
  const flexBearerAuthRemovalOn = isFlexBearerAuthRemovalOn as jest.MockedFunction<typeof isFlexBearerAuthRemovalOn>;
  flexBearerAuthRemovalOn.mockImplementation(() => true);

  await store.dispatch(populateAllProducts('widgetType'));

  const handleError = handleUserSessionTimeoutErrors;
  expect(handleError).toHaveBeenCalled();

  flexBearerAuthRemovalOn.mockImplementation(() => false);

  const error = await getError(async () => await store.dispatch(populateAllProducts('widgetType')));

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
  const logout = logoutRegistrant;
  expect(logout).toHaveBeenCalled();
  const refresh = redirectToPage;
  expect(refresh).toHaveBeenCalled();
});

test('visibleProducts.populateRegCartVisibleProducts errors', async () => {
  const flexBearerAuthRemovalOn = isFlexBearerAuthRemovalOn as jest.MockedFunction<typeof isFlexBearerAuthRemovalOn>;
  flexBearerAuthRemovalOn.mockImplementation(() => true);

  await store.dispatch(populateRegCartVisibleProducts());

  const handleError = handleUserSessionTimeoutErrors;
  expect(handleError).toHaveBeenCalled();
  const logout = logoutRegistrant;
  expect(logout).toHaveBeenCalledTimes(0);
  const refresh = redirectToPage;
  expect(refresh).toHaveBeenCalledTimes(0);

  flexBearerAuthRemovalOn.mockImplementation(() => false);

  const error = await getError(async () => await store.dispatch(populateRegCartVisibleProducts()));

  expect(error).not.toBeInstanceOf(NoErrorThrownError);
});
