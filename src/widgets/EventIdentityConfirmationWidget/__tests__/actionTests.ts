/* eslint-env jest */
import appData from '../../../redux/registrationForm/regCart/__tests__/appData.json';
import { clearFields, dissociateInviteeAndClearInferredFields } from '../actions';
import history from '../../../myHistory';
import { CLEAR_REG_CART_INFERRED_FIELDS } from '../../../redux/registrationForm/regCart/actionTypes';
import EventSnapshot from '../../../../fixtures/EventSnapshot.json';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { populateVisibleProducts } from '../../../redux/visibleProducts';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';
import EventSnapshotClient from '../../../clients/EventSnapshotClient';
import * as ExperimentHelper from '../../../ExperimentHelper';
import * as dialogs from '../../../dialogs';

const mockOpenPrivateEventErrorDialog = jest.spyOn(dialogs, 'openPrivateEventErrorDialog');
let mockUseGraphQLSiteEditorData = ExperimentHelper.GraphQLSiteEditorDataReleases.Development;
jest.mock('../../../ExperimentHelper', () => ({
  ...jest.requireActual<typeof ExperimentHelper>('../../../ExperimentHelper'),
  getUseGraphQLSiteEditorData: () => mockUseGraphQLSiteEditorData
}));
jest.mock('../../../apollo/siteEditor/pageVarietyPathQueryHooks', () => ({
  createPageVarietyPathManualQuery: () => ({
    data: {
      event: {
        registrationPath: {
          registration: {
            registrationType: {
              validation: {
                onPageBeforeIdentityConfirmation: false
              }
            }
          }
        }
      }
    }
  })
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const eventId = EventSnapshot.eventSnapshot.id;
const regCart = {
  regCartId: '928f02df-4ba7-4637-824d-ae71bd414e4f',
  status: 'INPROGRESS',
  eventSnapshotVersions: {
    [(EventSnapshot as $TSFixMe).id]: 'fake-eventSnapshot-version'
  },
  eventRegistrations: {
    '00000000-0000-0000-0000-000000000001': {
      eventRegistrationId: '00000000-0000-0000-0000-000000000001',
      eventId,
      attendee: {
        personalInformation: {
          contactId: 'd10d9eab-743f-4b3e-80ee-adb520920281',
          firstName: 'Luke',
          lastName: 'Roling',
          emailAddress: 'lroling-384934@j.mail',
          primaryAddressType: 'WORK'
        },
        attendeeId: 'aac17ae9-74b8-4687-ae9e-e2781d247f95'
      },
      attendeeType: 'ATTENDEE',
      productRegistrations: [
        {
          productId: Object.keys(EventSnapshot.eventSnapshot.products.admissionItems)[0],
          productType: 'AdmissionItem',
          quantity: 1,
          requestedAction: 'REGISTER'
        }
      ],
      sessionRegistrations: {},
      registrationTypeId: '00000000-0000-0000-0000-000000000000',
      registrationPathId: '411c6566-1e5a-4c38-b8e5-f63ab9239b40'
    }
  }
};

jest.mock('../../../redux/visibleProducts');
const mockedVisibleProducts = populateVisibleProducts as jest.Mock;
mockedVisibleProducts.mockImplementation(() => ({
  type: '[MOCK]/LOAD_VISIBLE_SESSION_PRODUCTS',
  payload: {}
}));

jest.mock('../../../clients/EventSnapshotClient', () => {
  return {
    getVisibleProducts: jest.fn(() => ({ Sessions: {} }))
  };
});

describe.each([
  ['GraphQL', ExperimentHelper.GraphQLSiteEditorDataReleases.Development],
  ['Redux', ExperimentHelper.GraphQLSiteEditorDataReleases.Off]
])('action tests using %s site editor data', (_description, experimentStatus) => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGraphQLSiteEditorData = experimentStatus;
  });

  test("clearInferredFields clear regCart fields that's on page or upcoming", async () => {
    const eventRegistrationId = '00000000-0000-0000-0000-000000000001';
    const initialState = {
      event: EventSnapshot.eventSnapshot,
      account: EventSnapshot.accountSnapshot,
      website: EventSnapshot.eventSnapshot.siteEditor.website,
      appData,
      registrationForm: {
        regCart
      },
      regCartStatus: {
        lastSavedRegCart: regCart
      },
      pathInfo: {
        rootPath: '/events/dummyId',
        currentPageId: 'regProcessStep1'
      },
      registrationPaths: {
        'path-0': {
          pageIds: [
            'regProcessStep1',
            'regPage:0cc99264-e900-43b2-a995-91b920ff2a33',
            'regPage:617b1dc3-3ddb-4468-8087-049a4e6e51e8'
          ],
          id: '9f632f6a-40d9-4870-beeb-8f38a8151b54',
          confirmationPageId: 'confirmation',
          postRegPageIds: ['confirmation']
        }
      },
      userSession: {
        regTypeId: 'userSessionRegTypeId',
        inviteeId: 'inviteeId'
      },
      defaultUserSession: {}
    };
    const store = mockStore(initialState);
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
    // eslint-disable-next-line jest/valid-expect-in-promise
    await store.dispatch(dissociateInviteeAndClearInferredFields(eventRegistrationId));
    expect(store.getActions()).toMatchSnapshot();
    expect(history.location.pathname).toBe('/events/dummyId/regProcessStep1');
    // explicitly check personalInformation is cleared in snapshot
    const clearAction = store.getActions().find(action => action.type === CLEAR_REG_CART_INFERRED_FIELDS);
    expect(clearAction.payload.regCart.eventRegistrations[eventRegistrationId].attendee.attendeeId).toBe(undefined);
    expect(
      clearAction.payload.regCart.eventRegistrations[eventRegistrationId].attendee.personalInformation.firstName
    ).toBe(undefined);
  });

  const store = createStoreWithMiddleware(
    combineReducers({
      website: (x = {}) => x,
      text: (x = {}) => x,
      regCartStatus: (x = {}) => x,
      clients: (x = {}) => x,
      registrantLogin: (x = {}) => x,
      event: (x = {}) => x,
      userSession: (x = {}) => x,
      defaultUserSession: (x = {}) => x,
      registrationForm: (x = {}) => x,
      appData: (x = {}) => x,
      pathInfo: (x = {}) => x
    }),
    {
      website: EventSnapshot.eventSnapshot.siteEditor.website,
      appData,
      clients: {
        eventSnapshotClient: EventSnapshotClient
      },
      registrantLogin: {
        form: {
          emailAddress: 'email',
          confirmationNumber: 'confirmationNumber'
        }
      },
      regCartStatus: {
        lastSavedRegCart: regCart
      },
      event: {
        id: eventId
      },
      text: {
        translate: (resx, tokens) => (tokens ? `${resx}:${JSON.stringify(tokens)}` : resx)
      },
      userSession: {},
      defaultUserSession: {
        eventId
      },
      registrationForm: {
        regCart
      },
      pathInfo: {
        currentPageId: 'regPage1',
        rootPath: 'http://example123?'
      }
    },
    {
      thunkExtraArgument: { apolloClient: {} }
    }
  );

  const createError = responseBody => ({
    responseStatus: 422,
    responseBody,
    httpLogRequestId: 'requestHeader',
    httpLogPageLoadId: 'pageLoadId',
    errorDateTime: new Date()
  });

  test('clear fields must reevaluate visible session Products', async () => {
    await store.dispatch(clearFields());
    expect(populateVisibleProducts).toHaveBeenCalled();
    expect(populateVisibleProducts).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001');
  });

  test('clear fields handles error', async () => {
    mockedVisibleProducts.mockImplementation(() => {
      const responseBody = {
        validationMessages: [
          {
            severity: 'Error',
            localizationKey: 'REGAPI.EMAIL_ONLY_INVITEE'
          }
        ]
      };
      throw createError(responseBody);
    });

    await store.dispatch(clearFields());
    expect(mockOpenPrivateEventErrorDialog).toHaveBeenCalled();
    mockOpenPrivateEventErrorDialog.mockClear();
  });
});
