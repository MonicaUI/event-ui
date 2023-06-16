import { createLazyLoadPageHandler } from '../../routing/lazyLoadPageContentHandler';
import querystring from 'querystring';
export default function createOptOutPageHandler(store: $TSFixMe): $TSFixMe {
  const {
    userSession: { inviteeId }
  } = store.getState();
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  const queryParams = window && window.location && querystring.parse(window.location.search.slice(1));
  const guestId = queryParams.g;
  const contactId = queryParams.c;
  if (!inviteeId && !guestId && !contactId) {
    return createLazyLoadPageHandler(store, () =>
      import(/* webpackChunkName: "optOut" */ './invalidInviteeContent').then(m => m.invalidInviteeOptOut)
    );
  }
  return createLazyLoadPageHandler(store, () =>
    import(/* webpackChunkName: "optOut" */ './content').then(m => m.confirmationPage)
  );
}
