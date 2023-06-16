import { redirectToConcur, autoRedirectToConcurFromConfirmationPage, searchRoommates } from '../workflow';
import getStoreForTest from 'event-widgets/utils/testUtils';
import reducer from '../index';

jest.mock('../../selectors/currentRegistrationPath', () => {
  return {
    getRegistrationPathIdOrDefault: jest.fn(() => 'REG_PATH')
  };
});

jest.mock('../../selectors/shared', () => {
  return {
    getRegCart: jest.fn(() => {})
  };
});

let mockedIsRegApprovalRequired = false;
jest.mock('../../registrationForm/regCart/selectors', () => {
  return {
    isRegApprovalRequired: jest.fn(() => mockedIsRegApprovalRequired),
    getAttendeeId: jest.fn().mockReturnValue('ATTENDEE_ID')
  };
});

jest.mock('../../selectors/currentRegistrant', () => {
  return {
    getEventRegistrationId: jest.fn(() => 'REG')
  };
});

let mockedShouldAutoRedirectToConcur = true;
jest.mock('event-widgets/redux/selectors/eventTravel', () => {
  return {
    shouldAutoRedirectToConcur: jest.fn(() => mockedShouldAutoRedirectToConcur)
  };
});

let mockedIsWidgetOnPath = true;
jest.mock('event-widgets/redux/selectors/website/pluginData/registrationProcessNavigation', () => {
  return {
    isWidgetOnPath: jest.fn(() => mockedIsWidgetOnPath)
  };
});

const mockReducer = (state, action) => {
  return {
    event: {
      id: 'EVENT_ID'
    },
    clients: {
      eventGuestClient: {
        getBaseUrl: jest.fn().mockReturnValue('http://gueside.web/')
      }
    },
    eventTravel: {
      travelSnapshotVersion: 'abc.travelSnapshot'
    },
    eventSnapshotVersion: 'xyz.eventSnapshotVersion',
    travelCart: reducer(state.travelCart, action)
  };
};

const openSpy = jest.spyOn(window, 'open');
const mockStore = getStoreForTest(mockReducer, {});

beforeEach(() => {
  openSpy.mockClear();
  mockedIsRegApprovalRequired = false;
  mockedShouldAutoRedirectToConcur = true;
  mockedIsWidgetOnPath = true;
});

describe('Redirect to Concur', () => {
  test('onButton Click - Open new tab', async () => {
    redirectToConcur()(null, mockStore.getState);
    expect(openSpy).toHaveBeenCalledWith(
      'http://gueside.web/redirect/concur?eventId=EVENT_ID&inviteeId=ATTENDEE_ID&travelSnapshotVersion=abc.travelSnapshot&eventSnapshotVersion=xyz.eventSnapshotVersion',
      null
    );
  });
});

describe('Auto-redirection to Concur', () => {
  test('No redirection when reg cart status is not completed', async () => {
    mockStore.dispatch(autoRedirectToConcurFromConfirmationPage({ statusCode: 'TRAVEL_PENDING' }, true));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('No redirection when auto redirection setting is not enabled', async () => {
    mockedShouldAutoRedirectToConcur = false;
    mockStore.dispatch(autoRedirectToConcurFromConfirmationPage({ statusCode: 'COMPLETED' }, true));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('No redirection when its not a new reg', async () => {
    mockStore.dispatch(autoRedirectToConcurFromConfirmationPage({ statusCode: 'COMPLETED' }, false));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('No redirection when its a new reg but requires reg approval', async () => {
    mockedIsRegApprovalRequired = true;
    mockStore.dispatch(autoRedirectToConcurFromConfirmationPage({ statusCode: 'COMPLETED' }, true));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('No redirection when widget is not on the path', async () => {
    mockedIsWidgetOnPath = false;
    mockStore.dispatch(autoRedirectToConcurFromConfirmationPage({ statusCode: 'COMPLETED' }, true));
    expect(openSpy).not.toHaveBeenCalled();
  });

  test('Successful redirection', async () => {
    mockStore.dispatch(autoRedirectToConcurFromConfirmationPage({ statusCode: 'COMPLETED' }, true));
    expect(openSpy).toHaveBeenCalled();
  });
});

// todo: uncomment later
describe('searchRoommates() method', () => {
  test('should update search text in keyword search', () => {
    // expect(mockStore.getState()).toMatchSnapshot();
    mockStore.dispatch(searchRoommates('searching'));
    // expect(mockStore.getState()).toMatchSnapshot();
  });
});
