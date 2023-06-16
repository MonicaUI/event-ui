/* eslint-env jest */
import React from 'react';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { mount } from 'enzyme';
import pageContainingWidgetFixture from '../../../testUtils/pageContainingWidgetFixture';
import { expect } from '@jest/globals';
import { Provider } from 'react-redux';
// eslint-disable-next-line jest/no-mocks-import
import { getRegistrationTypeResults, mockApolloClient } from '../__mocks__/apolloClient';
import { MockedProvider } from '@apollo/client/testing';
// eslint-disable-next-line jest/no-mocks-import
import useRegTypes from '../__mocks__/useRegTypes';
import { act } from '@testing-library/react';
import { Grid } from 'nucleus-core/layout/flexbox';
import RegistrationTypeWidget from '../RegistrationTypeWidget';
import * as registrationFieldPageType from 'event-widgets/utils/registrationFieldPageType';
import { cloneDeep, set } from 'lodash';
import configureStore from '../../../redux/configureStore';

// eslint-disable-next-line jest/no-export
export const genericRegistrationTypeData = [...getRegistrationTypeResults];

jest.mock('../../../redux/registrationForm/errors', () => {
  return {
    getUpdateErrors: {
      isPrivateEvent: jest.fn(),
      isAttendeeNotAllowedByCustomLogic: jest.fn(),
      isAdmissionItemsNotAvailableForRegTypeError: jest.fn(),
      isEventTemporaryClosed: jest.fn()
    }
  };
});
jest.mock('../../../dialogs/selectionConflictDialogs', () => {
  return {
    validateUserRegistrationTypeSelection: jest.fn()
  };
});
jest.mock('../../../dialogs');
jest.mock('../../../redux/actions', () => {
  return {
    filterEventSnapshot: jest.fn(() => () => {}),
    loadRegistrationContent: jest.fn(() => () => {})
  };
});

jest.mock('../../../redux/registrationForm/regCart/registrationTypes');

const baseState = {
  text: {
    locale: 'en'
  },
  event: {
    registrationTypes: {},
    eventFeatureSetup: {
      registrationProcess: {
        multipleRegistrationTypes: true
      },
      agendaItems: {
        admissionItems: false
      }
    },
    id: 'EVENT_ID',
    version: 'VERSION'
  },
  website: {
    ...pageContainingWidgetFixture('pageId', 'widgetId'),
    pluginData: {
      registrationProcessNavigation: {
        registrationPaths: {
          regPathId: {
            id: 'regPathId',
            pageIds: ['pageId']
          }
        }
      }
    }
  },
  appData: {
    registrationSettings: {
      registrationPaths: {
        regPathId: {
          registrationTypeSettings: {
            limitVisibility: false
          },
          guestRegistrationSettings: {
            registrationTypeSettings: {
              limitVisibility: false
            }
          },
          accessRules: {
            invitationListAccess: {
              isEmailOnlyInvite: false
            }
          }
        }
      }
    }
  },
  userSession: {
    regCartId: 'REG_CART_ID'
  },
  defaultUserSession: {
    isPreview: false
  },
  registrationForm: {
    regCart: {
      eventRegistrations: {
        eventRegId: {
          registrationPathId: 'regPathId'
        }
      },
      regCartId: 'REG_CART_ID'
    }
  },
  limits: {
    perEventLimits: {
      maxNumberOfGuests: {
        limit: 10
      }
    }
  },
  experiments: {
    graphQLForEventCapacitiesVariant: 1
  },
  environment: 'TEST'
};

const reducer = state => state;

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

const createMockStore = state => {
  const apolloClient = {};
  return createStore(reducer, state, applyMiddleware(thunk.withExtraArgument({ apolloClient })));
};

const registrationTypeWidgetProps = {
  style: {},
  classes: {},
  translate: text => text,
  config: {
    shared: {},
    registrationFieldPageType: registrationFieldPageType.Registration
  },
  id: 'widgetId'
};

jest.mock('../regTypeUtils', () => ({
  getAnswer: jest.fn().mockReturnValue({ isWidgetPlacedOnGuestModal: false })
}));

jest.mock('../useRegTypes', () => ({
  useRegTypes: jest.fn().mockReturnValue([
    {
      id: '7a14802a-8aa0-4463-95f1-5e5793a63a8a',
      name: 'r1',
      visible: 'CAPACITY_FULL'
    },
    {
      id: '158ab11c-bc65-450a-92f6-6f5dc3a052ba',
      name: 'r2',
      visible: 'CLOSED'
    },
    {
      id: '00000000-0000-0000-0000-000000000000',
      name: '',
      visible: 'AVAILABLE'
    }
  ])
}));

const TestComponent1 = props => {
  return <RegistrationTypeWidget {...props} />;
};

const mountWidget = async (state, overrides = {}) => {
  let mockStore = createMockStore(state);
  const props = { ...registrationTypeWidgetProps, ...overrides, store: mockStore };
  const apolloClient = mockApolloClient(state);
  mockStore = configureStore(state, {}, { apolloClient });
  const component = mount(
    <Grid>
      <Provider store={mockStore}>
        {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: { request: { que... Remove this comment to see the full error message */}
        <MockedProvider mocks={getRegistrationTypeResults} addTypeName={false}>
          <TestComponent1 {...props} />
        </MockedProvider>
      </Provider>
    </Grid>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

const cloneState = state => {
  const clonedState = cloneDeep(state);
  set(
    clonedState,
    ['widgetFactory', 'loadMetaData'],
    jest.fn(() => {
      return {};
    })
  );
  return clonedState;
};

describe('RegistrationTypeWidget (connected) no registration types -', () => {
  test('baseline graphQL', async () => {
    const initialState = cloneState(baseState);
    const widget = await mountWidget(initialState);
    expect(widget).toMatchSnapshot();
  });
});

const TestComponent = () => {
  const regTypes = useRegTypes();
  return <div>{JSON.stringify(regTypes)}</div>;
};

const mountComponentRegistrationType = async (state?) => {
  const mockStore = createMockStore(state);
  const component = mount(
    <Provider store={mockStore}>
      {/* @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: Element; mocks: { request: { que... Remove this comment to see the full error message */}
      <MockedProvider mocks={getRegistrationTypeResults} addTypeName={false}>
        <TestComponent />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('getRegTypeTest', () => {
  it('should render with query result', async () => {
    const component = await mountComponentRegistrationType();
    expect(component).toMatchSnapshot();
  });
});
