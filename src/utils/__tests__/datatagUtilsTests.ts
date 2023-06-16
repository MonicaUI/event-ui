import resolveDatatagsForCodeSnippets, { fetchAllDatatagResolutions, invalidateDatatagCache } from '../datatagUtils';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

const codeSnippets = {
  AllPages: [
    function () {
      console.log('With Datatag: {[C-FIRST NAME]}');
    },
    function () {
      console.log('Without datatag: {[C-FIRST NAME]}');
    }
  ]
};

let shouldFetchAllDataTagsMock = jest.fn();
const fetchAllDataTagsMock = jest.fn((_, resolve) => {
  resolve();
});
let shouldFetchDataTagsMock = jest.fn();
const fetchDataTagsMock = jest.fn((_, resolve) => {
  resolve();
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let resolveDataTagsMock = jest.fn((text, _) => text);

let store;
const getInitialState = () => {
  return {
    text: {
      resolver: {
        shouldFetchDataTags: shouldFetchDataTagsMock,
        fetchDataTags: fetchDataTagsMock,
        shouldFetchAllDataTags: shouldFetchAllDataTagsMock,
        fetchAllDataTags: fetchAllDataTagsMock,
        resolveDataTags: resolveDataTagsMock
      }
    },
    fetchTextResolverDatatags: jest.fn()
  };
};

const getState = state => state;
function clearMocksAndCreateStore(mockState) {
  jest.clearAllMocks();
  store = createStore(
    () => {
      return {
        ...getInitialState()
      };
    },
    getState(mockState),
    applyMiddleware(thunk)
  );
}

describe('resolveDatatagsForCodeSnippets', () => {
  test('when window.CVENT is not initialised , resolution should not be attempted', async () => {
    clearMocksAndCreateStore(getInitialState());

    await store.dispatch(resolveDatatagsForCodeSnippets());

    expect(resolveDataTagsMock.mock.calls.length).toBe(0);
    expect(fetchDataTagsMock).not.toHaveBeenCalled();
  });
  test('when code snippet is not present, resolution should not be attempted', async () => {
    window.CVENT = {
      codeSnippets: {}
    };
    clearMocksAndCreateStore(getInitialState());

    await store.dispatch(resolveDatatagsForCodeSnippets());

    expect(resolveDataTagsMock.mock.calls.length).toBe(0);
    expect(fetchDataTagsMock).not.toHaveBeenCalled();
  });
  test('when fallback override is not called, should try to resolve datatags only once', async () => {
    window.CVENT = {
      codeSnippets
    };
    clearMocksAndCreateStore(getInitialState());

    await store.dispatch(resolveDatatagsForCodeSnippets());

    expect(resolveDataTagsMock.mock.calls.length).toBe(2);
    expect(fetchDataTagsMock).not.toHaveBeenCalled();
    expect(window.CVENT.codeSnippetsWithResolvedDatatags.AllPages.length).toBe(2);
  });
  test('when fallback override is called then fetch datatags and then try to resolve datatags again', async () => {
    window.CVENT = {
      codeSnippets
    };
    shouldFetchDataTagsMock = jest.fn(() => true);
    resolveDataTagsMock = jest.fn((text, fallbackOverride) => {
      if (fallbackOverride) {
        fallbackOverride();
      }
    });
    clearMocksAndCreateStore(getInitialState());

    await store.dispatch(resolveDatatagsForCodeSnippets());

    expect(resolveDataTagsMock.mock.calls.length).toBe(4);
    expect(fetchDataTagsMock).toHaveBeenCalled();
    expect(window.CVENT.codeSnippetsWithResolvedDatatags.AllPages.length).toBe(2);
  });
});

describe('fetchAllDatatagResolutions', () => {
  test('to do not fetch all datatags when cache is valid', async () => {
    window.CVENT = {
      codeSnippets
    };
    shouldFetchAllDataTagsMock = jest.fn(() => true);
    clearMocksAndCreateStore(getInitialState());
    await store.dispatch(fetchAllDatatagResolutions());

    expect(resolveDataTagsMock.mock.calls.length).toBe(0);
    expect(fetchAllDataTagsMock).not.toHaveBeenCalled();
  });
  test('to do not fetch all datatags when resolver.shouldFetchAllDataTags return false', async () => {
    window.CVENT = {
      codeSnippets
    };
    shouldFetchAllDataTagsMock = jest.fn(() => false);
    clearMocksAndCreateStore(getInitialState());
    invalidateDatatagCache();
    await store.dispatch(fetchAllDatatagResolutions());

    expect(resolveDataTagsMock.mock.calls.length).toBe(2);
    expect(fetchAllDataTagsMock).not.toHaveBeenCalled();
  });
  test('to fetch all datatags when resolver.shouldFetchAllDataTags return true', async () => {
    window.CVENT = {
      codeSnippets: {}
    };
    shouldFetchAllDataTagsMock = jest.fn(() => true);
    clearMocksAndCreateStore(getInitialState());
    invalidateDatatagCache();
    await store.dispatch(fetchAllDatatagResolutions());

    expect(resolveDataTagsMock.mock.calls.length).toBe(0);
    expect(fetchAllDataTagsMock).toHaveBeenCalled();
  });
});
