const SET_ACCOUNT_LIMITS = 'event-guestside-site/limits/SET_ACCOUNT_LIMITS';

export const setAccountLimits = (accountLimits: $TSFixMe): $TSFixMe => {
  return {
    type: SET_ACCOUNT_LIMITS,
    payload: {
      accountLimits
    }
  };
};

export default function reducer(state: $TSFixMe, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case SET_ACCOUNT_LIMITS: {
      return action.payload.accountLimits;
    }
    default: {
      return state;
    }
  }
}
