import React from 'react';
import { mount } from 'enzyme';
import { openIncludedSessionsDialog } from '..';
import { Provider } from 'react-redux';
import DialogContainer from 'nucleus-guestside-site/src/containers/DialogContainer';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import dialogContainer from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import registrantLogin from '../../../redux/registrantLogin';
import registrationForm from '../../../redux/registrationForm/reducer';
import { personaReducer } from '../../../redux/persona';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

jest.mock('../../../redux/selectors/currentRegistrationPath', () => {
  return {
    getRegistrationPathId: jest.fn(() => 'eventRegistrationId')
  };
});

jest.mock('../../../redux/reducer', () => {
  return {
    getEventTimezone: jest.fn(() => {
      return {
        hasDst: true
      };
    })
  };
});

const mockApolloClient = (readFragmentData = {}) => {
  return {
    cache: {
      evict: jest.fn(),
      gc: jest.fn()
    },
    readFragment: jest.fn(() => readFragmentData),
    query: () => {
      return {
        then: () => [
          {
            __typename: 'SortedSessionsResponse',
            code: '',
            id: 'dcc3c31b-75ad-4089-869f-f62973565b19',
            speakerIds: {
              '8f20ab73-0866-4e0f-8ed5-adcbe928032b': {
                speakerId: '8f20ab73-0866-4e0f-8ed5-adcbe928032b',
                speakerCategoryId: '183ec15b-f0c9-4d0f-994a-43d2c9877f50',
                sessionId: '3fad1abf-adb7-4f8f-8dd8-724ed2bee38a'
              }
            },
            name: 'dcc3c31b-75ad-4089-869f-f62973565b19.name',
            locationId: null,
            locationName: null,
            categoryId: '00000000-0000-0000-0000-000000000000',
            description: '',
            sessionCustomFieldValues: {},
            startTime: '2021-07-27T22:00:00.000Z',
            endTime: '2021-07-27T23:00:00.000Z',
            capacityId: 'dcc3c31b-75ad-4089-869f-f62973565b19'
          }
        ]
      };
    }
  };
};
const apolloClient = mockApolloClient();

const store = createStoreWithMiddleware(
  combineReducers({
    dialogContainer,
    registrantLogin,
    registrationForm,
    event: (x = {}) => x,
    website: (x = {}) => x,
    appData: (x = {}) => x,
    text: (x = {}) => x,
    clients: (x = {}) => x,
    userSession: (x = {}) => x,
    experiments: (x = {}) => x,
    persona: personaReducer,
    defaultUserSession: (x = {}) => x,
    timezones: (x = {}) => x,
    capacity: (x = {}) => x
  }),
  {
    event: {
      timezone: 35
    },
    website: EventSnapshot.eventSnapshot.siteEditor.website,
    text: {
      translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
    },
    timezones: {
      '35': {
        id: 35,
        name: 'Eastern Time',
        nameResourceKey: 'Event_Timezone_Name_35__resx',
        plannerDisplayName: '(GMT-05:00) Eastern [US & Canada]',
        hasDst: true,
        utcOffset: -300,
        abbreviation: 'ET',
        abbreviationResourceKey: 'Event_Timezone_Abbr_35__resx',
        dstInfo: []
      }
    },
    capacity: {
      'dcc3c31b-75ad-4089-869f-f62973565b19': {
        capacityId: 'dcc3c31b-75ad-4089-869f-f62973565b19',
        totalCapacityAvailable: -1,
        availableCapacity: -1,
        active: true
      }
    }
  },
  {
    thunkExtraArgument: { apolloClient }
  }
);

describe('IncludedSessionsDialog', () => {
  const dialog = mount(
    <Provider store={store}>
      <DialogContainer spinnerMessage="spinnerMessage" message="message" />
    </Provider>
  );

  const sessionBundle = {
    id: '064cf1cc-621d-4a98-a28c-9e1017430bb4',
    description: '',
    name: 'T1',
    code: 'T1',
    productDisplayOrder: 2,
    applicableRegistrationTypes: [],
    capacity: {
      availableCapacity: -1
    }
  };
  const props = {
    config: {
      display: {
        speakers: true
      },
      sort: {
        selectedSortOrder: {}
      }
    },
    style: {
      palette: {}
    },
    palette: {},
    registrationPathId: '7fea5f05-e714-48a1-ac61-b6b3cec44a2c',
    sessionBundle,
    sessionCustomFieldDefinitions: [],
    speakers: {
      '8f20ab73-0866-4e0f-8ed5-adcbe928032b': {
        id: '8f20ab73-0866-4e0f-8ed5-adcbe928032b',
        categoryId: '183ec15b-f0c9-4d0f-994a-43d2c9877f50',
        firstName: '8f20ab73-0866-4e0f-8ed5-adcbe928032b.firstName',
        lastName: '8f20ab73-0866-4e0f-8ed5-adcbe928032b.lastName',
        prefix: '',
        company: '',
        title: '',
        biography: '',
        designation: '',
        displayOnWebsite: false,
        facebookUrl: '',
        twitterUrl: '',
        linkedInUrl: '',
        order: 1,
        profileImageFileName: '',
        profileImageUri: '',
        websites: {}
      }
    }
  };
  test('matches snapshot when opened', async () => {
    await store.dispatch(openIncludedSessionsDialog(props, sessionBundle));
    await dialog.update();
    expect(dialog).toMatchSnapshot();
  });

  test('matches snapshot when closed', async () => {
    dialog.find('[data-cvent-id="close"]').hostNodes().simulate('click');
    await wait(0);
    expect(dialog).toMatchSnapshot();
  });
});
