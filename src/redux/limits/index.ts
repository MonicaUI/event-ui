import { setAccountLimits } from './reducer';

export const loadAccountLimits = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { limitsClient },
      limits
    } = getState();
    if (limits == null) {
      const accountLimits = await limitsClient.getAccountLimits();
      dispatch(setAccountLimits(accountLimits));
    }
  };
};
