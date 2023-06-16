import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MockedProvider } from '@apollo/client/testing';
import { getRegistrationPathIdForWidget } from 'event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation';
import { buildAdmissionItemsFilter } from '../admissionItemsUtils';
import { act } from 'react-dom/test-utils';
import { useAdmissionItems } from '../useAdmissionItems';
import configureStore from '../../../redux/configureStore';
// eslint-disable-next-line jest/no-mocks-import
import { mockApolloClient, eventId, eventSnapshotVersion, environment } from '../__mocks__/apolloClient';
import { InMemoryCache } from '@apollo/client';
import { mapValues } from 'lodash';

jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation', () => ({
  getRegistrationPathIdForWidget: jest.fn()
}));

jest.mock('../admissionItemsUtils', () => ({
  buildAdmissionItemsFilter: jest.fn()
}));

// @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementation' does not exist on ty... Remove this comment to see the full error message
getRegistrationPathIdForWidget.mockImplementation(() => 'REG_PATH_ID');
(buildAdmissionItemsFilter as $TSFixMe).mockImplementation(
  () => "applicableContactTypes is empty or applicableContactTypes contains '00000000-0000-0000-0000-000000000000'"
);

const getState = () => {
  return {
    environment: 'S437',
    eventSnapshotVersion: 'VERSION',
    appData: {
      registrationSettings: {
        registrationPaths: {
          REG_PATH_ID: {
            guestRegistrationSettings: {
              isGuestRegistrationEnabled: true
            }
          }
        }
      }
    },
    registrationForm: {
      currentEventRegistrationId: '00000000-0000-0000-0000-000000000001',
      regCart: {
        volumeDiscountsInCartStatusType: 'NO_VOLUME_DISCOUNT_IN_CART',
        eventRegistrations: {
          '00000000-0000-0000-0000-000000000001': {
            eventRegistrationId: '00000000-0000-0000-0000-000000000001',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000000',
            attendee: {
              personalInformation: {
                firstName: 'm',
                lastName: 'd'
              }
            },
            attendeeType: 'ATTENDEE',
            displaySequence: 1,
            eventId: '1efacd58-d0aa-4984-929e-7a65648270bb',
            registrationPathId: 'REG_PATH_ID',
            requestedAction: 'REGISTER',
            sessionRegistrations: {
              '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
                includedInAgenda: false,
                productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
                registrationSourceType: 'Included',
                requestedAction: 'REGISTER'
              },
              'bd0d311c-68a8-4706-bee1-2ca42023a339': {
                includedInAgenda: false,
                productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
                registrationSourceType: 'Selected',
                requestedAction: 'REGISTER'
              }
            },
            attendingFormatId: 0
          },
          '55e6409a-1f00-4c67-b586-9666229d9dc9': {
            eventRegistrationId: '55e6409a-1f00-4c67-b586-9666229d9dc9',
            primaryRegistrationId: '00000000-0000-0000-0000-000000000001',
            attendee: {
              personalInformation: {
                firstName: 'abc',
                lastName: 'Guest 02'
              }
            },
            attendeeType: 'GUEST',
            displaySequence: 2,
            eventId: '1efacd58-d0aa-4984-929e-7a65648270bb',
            registrationPathId: 'REG_PATH_ID',
            requestedAction: 'REGISTER',
            sessionRegistrations: {
              '3253430c-d19a-421b-9592-70b8b2b7c4c5': {
                includedInAgenda: false,
                productId: '3253430c-d19a-421b-9592-70b8b2b7c4c5',
                registrationSourceType: 'Included',
                requestedAction: 'REGISTER'
              },
              'bd0d311c-68a8-4706-bee1-2ca42023a339': {
                includedInAgenda: false,
                productId: 'bd0d311c-68a8-4706-bee1-2ca42023a339',
                registrationSourceType: 'Selected',
                requestedAction: 'REGISTER'
              }
            },
            attendingFormatId: 0
          }
        },
        groupRegistration: false,
        regCartId: 'REG_CART_ID',
        status: 'INPROGRESS'
      }
    },
    event: {
      id: 'EVENT_ID',
      attendingFormat: 0
    },
    userSession: {
      regCartId: 'REG_CART_ID'
    }
  };
};

async function dispatch(action) {
  if (typeof action === 'function') {
    await action(dispatch, getState);
  }
}

const subscribe = () => {};
const defaultProps = {
  classes: {},
  style: {},
  translate: (res, opts) => (opts ? `${res}:${JSON.stringify(opts)}` : res),
  config: {
    headerText: 'Header',
    instructionalText: 'Instructional text',
    display: {
      capacity: true,
      description: true,
      fees: true,
      itemCode: true
    }
  },
  isRegistrationPage: true,
  id: 'widgetId',
  'data-cvent-id': 'widgetId',
  store: { dispatch, getState, subscribe },
  layout: {
    cellSize: 4
  }
};

const waitWithAct = async () => {
  // Act is used because the Redux store is updated during wait
  return act(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TestComponent = _props => {
  const admissionItems = useAdmissionItems('widgetId', []);
  return <pre>{JSON.stringify(admissionItems, null, 2)}</pre>;
};

function createCache(store, constants) {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          ...mapValues(constants, value => ({
            read() {
              return value;
            }
          }))
        }
      }
    },
    addTypename: false
  });
}

const mountComponent = async () => {
  const store = configureStore(getState(), {});
  const component = mount(
    <Provider store={store}>
      <MockedProvider
        mocks={mockApolloClient}
        cache={createCache(store, {
          eventId,
          environment,
          eventSnapshotVersion
        })}
        addTypename={false}
      >
        <TestComponent {...defaultProps} />
      </MockedProvider>
    </Provider>
  );
  // Wait for Apollo Client MockedProvider to render mock query results
  await waitWithAct();
  await component.update();
  return component;
};

describe('useAdmissionItems', () => {
  it('should render with query result', async () => {
    const component = await mountComponent();
    expect(component).toMatchSnapshot();
  });
});
