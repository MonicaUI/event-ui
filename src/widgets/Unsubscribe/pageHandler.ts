import { unsubscribeAction } from './redux';
import { createLazyLoadPageHandler } from '../../routing/lazyLoadPageContentHandler';
import querystring from 'querystring';

export default function createUnsubscribePageHandler(store: $TSFixMe): $TSFixMe {
  const {
    userSession: { inviteeId }
  } = store.getState();
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
  const encodedGuestId = queryParams.g;
  if (!inviteeId && !encodedGuestId) {
    return createLazyLoadPageHandler(store, () =>
      import(/* webpackChunkName: "unsubscribe" */ './invalidInviteeContent').then(m => m.invalidInviteeUnsubscribePage)
    );
  }
  return createLazyLoadPageHandler(
    store,
    () => import(/* webpackChunkName: "unsubscribe" */ './content').then(m => m.unsubscribePage),
    () => store.dispatch(unsubscribeAction(true))
  );
}
