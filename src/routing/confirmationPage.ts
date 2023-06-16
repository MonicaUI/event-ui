import { getRegCart } from '../redux/selectors/shared';
import { isLoggedIn, isNewRegistration } from '../redux/selectors/currentRegistrant';
import { requireRegApproval } from '../redux/selectors/event';
import { setPendingApprovalStatus, updateInviteeStatusAndContactIdInStore } from '../redux/persona';
import { getDefaultWebsitePageId } from '../redux/website';
import { getConfirmationPageIdForInvitee } from '../utils/confirmationUtil';
import { getPagePath } from '../redux/pathInfo';
import { getPrimaryAttendee } from '../redux/registrationForm/regCart/selectors';
import { openSingleSignOnRegistrationDialog } from '../dialogs';
import { isSingleSignOn } from '../redux/selectors/shared';
import { loginRegistrant } from '../redux/registrantLogin/actions';

const setInviteePersona = async store => {
  const state = store.getState();
  const regCart = getRegCart(state) || {};
  if (isLoggedIn(state)) {
    if (state.userSession.verifiedAttendee) {
      await store.dispatch(loginRegistrant());
    } else if (isNewRegistration(state) && regCart.status !== 'INPROGRESS') {
      if (requireRegApproval(state)) {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        await store.dispatch(setPendingApprovalStatus(state));
      }
    } else {
      await store.dispatch(updateInviteeStatusAndContactIdInStore(getPrimaryAttendee(regCart)));
    }
  }
};

export const createConfirmationPageHandler =
  (store: $TSFixMe): $TSFixMe =>
  async (nextRouterState: $TSFixMe): Promise<$TSFixMe> => {
    const state = store.getState();

    if (
      isSingleSignOn(state.account) &&
      state.userSession.authenticatedContact &&
      state.userSession.hasRegisteredInvitees
    ) {
      await store.dispatch(openSingleSignOnRegistrationDialog());
    }
    let nextPage = getDefaultWebsitePageId(store.getState());
    if (isLoggedIn(store.getState())) {
      await setInviteePersona(store);
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      nextPage = await store.dispatch(getConfirmationPageIdForInvitee(store.getState()));
    }
    nextRouterState.history.replace(getPagePath(store.getState(), nextPage));
  };
