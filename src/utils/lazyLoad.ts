import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';

export const lazyLoadAction = (importAction?: $TSFixMe, withPageTransition = false): $TSFixMe =>
  withLoading((...args): $TSFixMe => {
    return async dispatch => {
      const action = await importAction();
      return await dispatch(action(...args));
    };
  }, withPageTransition);

export const lazyLoadFunction =
  (importFunction: $TSFixMe): $TSFixMe =>
  async (...args: $TSFixMe[]): Promise<$TSFixMe> => {
    const f = await importFunction();
    return await f(...args);
  };
