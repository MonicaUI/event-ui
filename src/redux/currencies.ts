const LOAD_CURRENCY_SUCCESS = 'event-guestside-site/currencies/LOAD_CURRENCY_SUCCESS';

export function setCurrencies(currencies: $TSFixMe): $TSFixMe {
  return { type: LOAD_CURRENCY_SUCCESS, payload: { currencies } };
}

/**
 * Creates a thunked action to load all currencies
 */
export const loadAllCurrencies =
  (): $TSFixMe =>
  async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { lookupClient },
      currencies: loadedCurrencies,
      text: { locale }
    } = getState();
    if (loadedCurrencies && Object.keys(loadedCurrencies).length !== 0) {
      return;
    }
    const response = await lookupClient.getCurrencies(locale);
    const { currencies } = response;
    dispatch(setCurrencies(currencies));
  };

export default function reducer(state: $TSFixMe, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case LOAD_CURRENCY_SUCCESS: {
      return {
        ...state,
        ...action.payload.currencies
      };
    }
    default: {
      return state;
    }
  }
}
