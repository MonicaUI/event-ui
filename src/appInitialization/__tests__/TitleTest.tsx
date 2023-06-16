/* eslint-env jest */
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import Title from '../Title';
import configureStore from '../../redux/configureStore';

const baseStore = {
  pathInfo: {
    currentPageId: 'personalInformation'
  },
  text: {
    translate: (x, y) => {
      let returnString = x;
      if (y) {
        returnString += ` - ${y.title} - ${y.eventTitle}`;
      }
      return returnString;
    }
  },
  website: {
    pages: {
      personalInformation: {
        title: 'BasicTitle'
      }
    }
  },
  event: {
    title: 'BasicEventTitle'
  }
};
const store = configureStore(baseStore);
beforeEach(() => {
  jest.clearAllMocks();
});

test('should not set document title with values when there is no currentPageId', () => {
  const modifiedStore = configureStore({
    ...baseStore,
    pathInfo: {}
  });
  renderer.create(
    <Provider store={modifiedStore}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('');
});

test('should not set document title with values when the website does not have a page for the currentPageId', () => {
  const modifiedStore = configureStore({
    ...baseStore,
    website: {
      pages: {}
    }
  });
  renderer.create(
    <Provider store={modifiedStore}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('');
});

test('should set document title with basic title values', () => {
  renderer.create(
    <Provider store={store}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('AppInitialization_Title_PageTitle__resx - BasicTitle - BasicEventTitle');
});

test('should set document title with basic title values 1', () => {
  const modifiedStore = configureStore({
    ...baseStore,
    website: {
      pages: {
        personalInformation: {
          name: 'BasicName'
        }
      }
    }
  });
  renderer.create(
    <Provider store={modifiedStore}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('AppInitialization_Title_PageTitle__resx - BasicName - BasicEventTitle');
});

test('should set document title with userText title value', () => {
  const modifiedStore = configureStore({
    ...baseStore,
    localizedUserText: {
      currentLocale: 'en-US',
      localizations: {
        'en-US': {
          'website.pages.personalInformation.title': 'UserTextTitle'
        }
      }
    }
  });
  renderer.create(
    <Provider store={modifiedStore}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('AppInitialization_Title_PageTitle__resx - UserTextTitle - BasicEventTitle');
});

test('should set document title with userText name value', () => {
  const modifiedStore = configureStore({
    ...baseStore,
    localizedUserText: {
      currentLocale: 'en-US',
      localizations: {
        'en-US': {
          'website.pages.personalInformation.name': 'UserTextName'
        }
      }
    }
  });
  renderer.create(
    <Provider store={modifiedStore}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('AppInitialization_Title_PageTitle__resx - UserTextName - BasicEventTitle');
});

test('should set document title when event is Archived with userText title value', () => {
  const modifiedStore = configureStore({
    ...baseStore,
    pathInfo: {
      currentPageId: null
    },
    event: {
      isArchived: true,
      title: 'BasicEventTitle'
    },
    website: {
      pages: {
        eventArchivePage: {
          title: 'BasicTitle'
        }
      }
    },
    localizedUserText: {
      currentLocale: 'en-US',
      localizations: {
        'en-US': {
          'website.pages.eventArchivePage.name': 'UserTextName'
        }
      }
    }
  });
  renderer.create(
    <Provider store={modifiedStore}>
      <Title />
    </Provider>
  );
  expect(global.document.title).toEqual('AppInitialization_Title_PageTitle__resx - UserTextName - BasicEventTitle');
});
