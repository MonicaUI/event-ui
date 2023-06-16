import {
  CLEAR_URL_IDENTIFYING_INFORMATION,
  LOG_OUT_REGISTRANT_SUCCESS,
  UPDATE_USER_SESSION,
  VERIFIED_WEBSITE_PASSWORD,
  START_SSO_REGISTRATION
} from './registrantLogin/actionTypes';

import { defaultRegistrationTypeId as EMPTY_UUID } from 'event-widgets/utils/registrationType';
import { getIn } from 'icepick';
import querystring from 'querystring';
import { getQueryParam } from '../utils/queryUtils';

const initialState = {
  scrollToRegTyoe: false,
  regTypeId: '',
  persistRegType: false
};

const reducer = (state = initialState, action: $TSFixMe): $TSFixMe => {
  switch (action.type) {
    case LOG_OUT_REGISTRANT_SUCCESS:
      return {
        // maintain following fields and clears registrant information such as : regCartId, inviteeId, emailAddress...
        scrollToRegType: state.scrollToRegTyoe,
        verifiedWebsitePassword: (state as $TSFixMe).verifiedWebsitePassword,
        regTypeId: action.payload?.regTypeId ?? state.regTypeId,
        persistRegType: action.payload?.persistRegType ?? false
      };
    case UPDATE_USER_SESSION:
      return action.payload;
    case CLEAR_URL_IDENTIFYING_INFORMATION:
      return {
        ...state,
        inviteeId: undefined,
        regTypeId: '',
        persistRegType: false
      };
    case VERIFIED_WEBSITE_PASSWORD:
      return {
        ...state,
        verifiedWebsitePassword: action.payload.verifiedWebsitePassword
      };
    case START_SSO_REGISTRATION:
      return {
        ...state,
        ssoFlowSelected: true,
        hasRegisteredInvitees: action.payload.isSsoAdmin,
        isSsoAdmin: action.payload.isSsoAdmin
      };
    default:
      return state;
  }
};

export const getRegistrationTypeIdFromUserSession = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['userSession', 'regTypeId']) || EMPTY_UUID;
};

export const getRegistrationPathIdFromSession = (state: $TSFixMe): $TSFixMe => {
  const regPathId = getIn(state, ['userSession', 'defaultRegPathId']);
  return regPathId === '00000000-0000-0000-0000-000000000000' ? null : regPathId;
};

export const isPlannerRegMod = (state: $TSFixMe): $TSFixMe => {
  return getIn(state, ['userSession', 'isPlannerRegMod']) === true;
};

export function isLinkedInviteeRegistration(state: $TSFixMe): $TSFixMe {
  return !!state.userSession.inviteeId;
}

export async function setQueryParamsInUserSession(dispatch: $TSFixMe, state: $TSFixMe): Promise<$TSFixMe> {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
  await dispatch({
    type: UPDATE_USER_SESSION,
    payload: {
      ...state.userSession,
      referenceId: getQueryParam(queryParams, 'refid')
    }
  });
}

export async function toggleScrollToRegType(dispatch: $TSFixMe, state: $TSFixMe): Promise<$TSFixMe> {
  await dispatch({
    type: UPDATE_USER_SESSION,
    payload: {
      ...state.userSession,
      scrollToRegType: !state.userSession.scrollToRegTyoe
    }
  });
}

export const setRegistrationIdInUserSession = (registrationId?: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: UPDATE_USER_SESSION,
      payload: {
        ...getState().userSession,
        registrationId
      }
    });
  };
};

export const setInviteeIdInUserSession = (inviteeId: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: UPDATE_USER_SESSION,
      payload: {
        ...getState().userSession,
        inviteeId
      }
    });
  };
};

export const setSsoFlowSelectionInUserSession = (ssoFlowSelected: $TSFixMe) => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: UPDATE_USER_SESSION,
      payload: {
        ...getState().userSession,
        ssoFlowSelected
      }
    });
  };
};

export const setVerifiedWebsitePasswordInUserSession = (verifiedWebsitePassword: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: VERIFIED_WEBSITE_PASSWORD,
      payload: {
        verifiedWebsitePassword
      }
    });
  };
};

export const startSsoRegistration = (isSsoAdmin: $TSFixMe) => {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    dispatch({
      type: START_SSO_REGISTRATION,
      payload: {
        isSsoAdmin
      }
    });
  };
};

export default reducer;
