import { abortRegCart } from '../../redux/registrationForm/regCart/workflow';
import getStoreForTest from 'event-widgets/utils/testUtils';
import {
  beginNewRegistration,
  startAdminRegistration,
  redirectToDefaultPageOrStartNewRegistration,
  disableRegistrationAndRedirectToRegistrationStart
} from '../startRegistration';
import { startRegistration } from '../../redux/registrationForm/regCart';
import {
  loadRegistrationContent,
  loadGuestRegistrationContent,
  evaluateQuestionVisibilityLogic,
  getStartPageForCurrentRegPath
} from '../../redux/actions';
import { routeToPage } from '../../redux/pathInfo';
import registrationFormReducer from '../../redux/registrationForm/reducer';
import { startNewRegistrationAndNavigateToRegistration } from '../../dialogs';
import { openCapacityReachedDialog } from '../../dialogs/CapacityReachedDialog';
jest.mock('../../dialogs/CapacityReachedDialog', () => {
  return {
    openCapacityReachedDialog: jest.fn(() => () => {})
  };
});
jest.mock('../../redux/registrationForm/regCart');
jest.mock('../../redux/pathInfo', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/pathInfo'),
    __esModule: true,
    routeToPage: jest.fn(() => () => {})
  };
});

jest.mock('../../dialogs', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../dialogs'),
    startNewRegistrationAndNavigateToRegistration: jest.fn(() => () => {})
  };
});

jest.mock('../../redux/actions', () => {
  return {
    ...jest.requireActual<$TSFixMe>('../../redux/actions'),
    loadRegistrationContent: jest.fn(),
    loadGuestRegistrationContent: jest.fn(),
    evaluateQuestionVisibilityLogic: jest.fn(),
    getStartPageForCurrentRegPath: jest.fn()
  };
});

jest.mock('../../redux/registrationForm/regCart/workflow', () => {
  return {
    abortRegCart: jest.fn(() => () => {})
  };
});

const baseState = {
  appData: {
    registrationSettings: {
      registrationPaths: {}
    }
  },
  defaultUserSession: {},
  userSession: {
    defaultRegPathId: '00000000-0000-0000-0000-000000000001'
  }
};
const store = getStoreForTest(() => baseState, {});
startRegistration.mockImplementation(() => () => {});
(loadRegistrationContent as $TSFixMe).mockImplementation(() => () => {});
(loadGuestRegistrationContent as $TSFixMe).mockImplementation(() => () => {});
(evaluateQuestionVisibilityLogic as $TSFixMe).mockImplementation(() => () => {});

const changePageOverride = jest.fn();

describe('Starting new registrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Aborts existing reg cart when starting new registration', async () => {
    await store.dispatch(beginNewRegistration({ changePageOverride, abortExistingCartId: 'regCartId' }));
    expect(abortRegCart).toHaveBeenCalled();
    expect(changePageOverride).toHaveBeenCalled();
  });

  test('Does not abort reg cart when starting new registration', async () => {
    await store.dispatch(beginNewRegistration({ changePageOverride }));
    expect(abortRegCart).not.toHaveBeenCalled();
    expect(changePageOverride).toHaveBeenCalled();
  });

  test('Aborts existing reg cart when starting new admin registration', async () => {
    await store.dispatch(startAdminRegistration({ changePageOverride, abortExistingCartId: 'regCartId' }));
    expect(abortRegCart).toHaveBeenCalled();
    expect(changePageOverride).toHaveBeenCalled();
  });

  test('Does not abort reg cart when starting new admin registration', async () => {
    await store.dispatch(startAdminRegistration({ changePageOverride }));
    expect(abortRegCart).not.toHaveBeenCalled();
    expect(changePageOverride).toHaveBeenCalled();
  });
});

let mockStore;
describe('containerEventUtils tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStore = getStoreForTest((state, action) => {
      return {
        ...state,
        registrationForm: registrationFormReducer(state.registrationForm, action),
        userSession: {
          defaultRegPathId: '00000000-0000-0000-0000-000000000001'
        }
      };
    }, {});
  });

  it('redirectToDefaultPageOrStartNewRegistration should redirect to default page when website pages are accessible', async () => {
    await store.dispatch(redirectToDefaultPageOrStartNewRegistration('websitePage', true));
    expect(routeToPage).toHaveBeenCalledWith('websitePage');
  });

  it('redirectToDefaultPageOrStartNewRegistration should start new reg when website pages arent accessible', async () => {
    await mockStore.dispatch(redirectToDefaultPageOrStartNewRegistration('websitePage', false));
    expect(startNewRegistrationAndNavigateToRegistration).toHaveBeenCalled();
  });

  it('disableRegistrationAndRedirectToRegistrationStart sets prevent registration flag and redirects to first reg page', async () => {
    const startRegPage = 'startRegPage';
    (getStartPageForCurrentRegPath as $TSFixMe).mockImplementation(() => () => startRegPage);
    const changePageMock = jest.fn();

    await mockStore.dispatch(disableRegistrationAndRedirectToRegistrationStart(changePageMock));
    expect(mockStore.getState().registrationForm.preventRegistration).toBeTruthy();
    expect(changePageMock).toHaveBeenCalledWith(startRegPage);
  });
});

describe('Embedded registration tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Shows capacity error dialog if cart creation fails due to insufficient capacity', async () => {
    const theStore = getStoreForTest(() => {
      return {
        ...baseState,
        registrationForm: {
          regCart: {
            embeddedRegistration: true,
            regCartId: ''
          }
        }
      };
    }, {});
    startRegistration.mockImplementation(() => () => {
      // eslint-disable-next-line no-throw-literal
      throw {
        // eslint-disable-line no-throw-literal
        responseStatus: 422,
        responseBody: {
          validationMessages: [
            {
              severity: 'Error',
              localizationKey: 'REGAPI.CAPACITY_UNAVAILABLE'
            }
          ]
        }
      };
    });
    await theStore.dispatch(beginNewRegistration({ changePageOverride, abortExistingCartId: 'regCartId' }));
    expect(openCapacityReachedDialog).toHaveBeenCalled();
  });
});
