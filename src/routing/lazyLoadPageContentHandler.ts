import { injectPageSnapshot } from '../redux/actions';
import { getPagePath } from '../redux/pathInfo';

export const createLazyLoadPageHandler =
  (store: $TSFixMe, loadPageSnapshot: $TSFixMe, onEnterCallback?: $TSFixMe): $TSFixMe =>
  async (nextRouterState: $TSFixMe): Promise<$TSFixMe> => {
    const { history } = nextRouterState;
    const pageSnapshot = await loadPageSnapshot();
    await store.dispatch(injectPageSnapshot(pageSnapshot));
    if (onEnterCallback) {
      await onEnterCallback();
    }
    history.replace(getPagePath(store.getState(), Object.keys(pageSnapshot.pages)[0]));
  };
