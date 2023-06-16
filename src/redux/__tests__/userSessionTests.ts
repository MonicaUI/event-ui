import reducer, { setVerifiedWebsitePasswordInUserSession, getRegistrationTypeIdFromUserSession } from '../userSession';
import { LOG_OUT_REGISTRANT_SUCCESS, CLEAR_URL_IDENTIFYING_INFORMATION } from '../registrantLogin/actionTypes';
import createStoreWithMiddleware from 'nucleus-guestside-site/src/redux/devCreateStoreWithMiddleware';
import { combineReducers } from 'redux';

const initialUserSessionUnknownInvitee = {
  eventId: 'b1cc65b3-af12-441d-9e8c-7681db58f96e',
  inviteeId: '608a5435-91c0-49eb-96e1-34f4c03599e2',
  isPreview: false,
  isPlanner: false,
  isTestMode: false,
  showEventBuildWizardBanner: false,
  eventBuildWizardExitUrl: '',
  licenseTypeId: 1,
  isFreeTrial: false,
  freeTrialPurchaseCta: '',
  httpReferrer: '',
  regTypeId: '',
  persistRegType: false
};

const initialUserSessionKnownInvitee = {
  ...initialUserSessionUnknownInvitee,
  inviteeId: '608a5435-91c0-49eb-96e1-34f4c03599e2'
};

const logoutAction = {
  type: LOG_OUT_REGISTRANT_SUCCESS,
  payload: {
    regTypeId: 'REG_TYPE_IN_ACTION_PAYLOAD',
    persistRegType: true
  }
};

const logoutActionWithExperimentOff = {
  type: LOG_OUT_REGISTRANT_SUCCESS
};

test('Verifying initial state.', () => {
  expect(reducer(undefined, {})).toMatchSnapshot();
});

test('Unknown invitee LOG_OUT_REGISTRANT_SUCCESS should maintain regType in user session.', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ eventId: string; inviteeId: st... Remove this comment to see the full error message
  const newState = reducer(initialUserSessionUnknownInvitee, logoutAction);
  expect(newState.regTypeId).toEqual('REG_TYPE_IN_ACTION_PAYLOAD');
  expect(newState.persistRegType).toBeTruthy();
});

test('Known invitee LOG_OUT_REGISTRANT_SUCCESS with persistRegType experiment off.', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ inviteeId: string; eventId: st... Remove this comment to see the full error message
  const newState = reducer(initialUserSessionKnownInvitee, logoutActionWithExperimentOff);
  expect(newState.regTypeId).toEqual('');
  expect(newState.persistRegType).toBeFalsy();
});

test('Known invitee LOG_OUT_REGISTRANT_SUCCESS logs out invitee user.', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ inviteeId: string; eventId: st... Remove this comment to see the full error message
  expect(reducer(initialUserSessionKnownInvitee, logoutAction)).toMatchSnapshot();
});

const clearFieldAction = {
  type: CLEAR_URL_IDENTIFYING_INFORMATION
};

test('Unknown invitee CLEAR_URL_IDENTIFYING_INFORMATION should clear regType in user session.', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ eventId: string; inviteeId: st... Remove this comment to see the full error message
  const newState = reducer(initialUserSessionUnknownInvitee, clearFieldAction);
  expect(newState.regTypeId).toEqual('');
  expect(newState.persistRegType).toBeFalsy();
});

test('Known invitee CLEAR_URL_IDENTIFYING_INFORMATION should clear regType in user session.', () => {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ inviteeId: string; eventId: st... Remove this comment to see the full error message
  const newState = reducer(initialUserSessionKnownInvitee, clearFieldAction);
  expect(newState.regTypeId).toEqual('');
  expect(newState.persistRegType).toBeFalsy();
});

test('getRegistrationTypeIdFromUserSession', () => {
  const state = {
    userSession: {
      regTypeId: 'b1cc65b3-af12-441d-9e8c-7681db58f96e'
    }
  };

  expect(getRegistrationTypeIdFromUserSession(state)).toBe(state.userSession.regTypeId);
  expect(getRegistrationTypeIdFromUserSession({})).toBe('00000000-0000-0000-0000-000000000000');
});

describe('setVerifiedWebsitePasswordInUserSession', () => {
  let store;
  beforeEach(() => {
    store = createStoreWithMiddleware(
      combineReducers({
        website: (x = {}) => x,
        appData: (x = {}) => x,
        text: (x = {}) => x,
        clients: (x = {}) => x,
        visibleProducts: (x = {}) => x,
        registrationForm: (x = {}) => x,
        eventSnapshotVersion: (x = {}) => x,
        event: (x = {}) => x,
        timezones: (x = {}) => x,
        userSession: reducer
      })
    );
  });

  it('Sets setVerifiedWebsitePasswordInUserSession to true', () => {
    store.dispatch(setVerifiedWebsitePasswordInUserSession(true));
    expect(store.getState().userSession.verifiedWebsitePassword).toBeTruthy();
  });
  it('Sets setVerifiedWebsitePasswordInUserSession to false', () => {
    store.dispatch(setVerifiedWebsitePasswordInUserSession(false));
    expect(store.getState().userSession.verifiedWebsitePassword).toBeFalsy();
  });
});
