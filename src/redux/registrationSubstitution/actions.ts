import {
  setConfirmationDenied,
  setConfirmationAccepted,
  substituteRegistrationSuccess,
  substituteRegistrationError,
  resetSubstituteRegistration,
  setShowConfirmationMessage,
  showCartAbortedMessage,
  hideConcurrentActionPopupMessage
} from './reducer';
import { logoutRegistrant } from '../registrantLogin/actions';
import { withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  shouldCartBeDeleted,
  handleSubstitutionCartCreation,
  handleSubstitutionCartUpdation,
  shouldUpdateCart
} from './util/registrationSubstitutionUtil';
import { redirectToPage } from '../pathInfo';
import { wasCartAbortedDueToConcurrentAction } from './errors';
import { hasAccessToWebsitePages } from '../selectors/event';

/**
 *  Request confirmation while showing spinner widget on UI
 */
export const getConfirmationWithLoading = withLoading(() => {
  return async dispatch => {
    await dispatch(requestConfirmation());
  };
});

/**
 * Request substitution while showing spinner widget on UI
 */
export const requestSubstituteRegistrationWithLoading = withLoading(() => {
  return async dispatch => {
    await dispatch(requestSubstituteRegistration());
  };
});

/**
 * Request to deny confirmation
 * @returns {Function}
 */
export function requestConfirmationDeny() {
  return (dispatch: $TSFixMe): $TSFixMe => {
    dispatch(setConfirmationDenied());
  };
}

/**
 * Requests confirmation from user if the cart creation/updation is successful otherwise show validations.
 * @returns {Function}
 */
export function requestConfirmation() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      registrationSubstitution: { substitutionCart, substitutionForm }
    } = state;
    if (substitutionCart && shouldUpdateCart(substitutionCart.substituentInformation, substitutionForm)) {
      await dispatch(handleSubstitutionCartUpdation());
    } else if (!substitutionCart) {
      await dispatch(handleSubstitutionCartCreation());
    } else {
      /*
       * We already have cart created and user did not change anything on update
       * Show confirmation message
       */
      await dispatch(setShowConfirmationMessage(substitutionCart));
    }
  };
}

/**
 * Request the checkout for substitutionCart and dispatches appropriate action
 * @returns {Function}
 */
export function requestSubstituteRegistration() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { substitutionCartClient },
      registrationSubstitution: { substitutionCart }
    } = state;
    const checkoutResponse = await substitutionCartClient.checkoutSubstitutionCart(substitutionCart.substitutionCartId);
    if (!checkoutResponse || wasCartAbortedDueToConcurrentAction(checkoutResponse)) {
      await dispatch(setConfirmationDenied());
      await dispatch(showCartAbortedMessage());
    } else if (checkoutResponse.validationMessages && checkoutResponse.validationMessages.length > 0) {
      await dispatch(setConfirmationDenied());
      await dispatch(substituteRegistrationError());
    } else {
      await dispatch(setConfirmationAccepted());
      try {
        await substitutionCartClient.waitForSubstitutionCartCheckoutCompletion(substitutionCart.substitutionCartId);
        await dispatch(substituteRegistrationSuccess());
      } catch (error) {
        await dispatch(setConfirmationDenied());
        await dispatch(substituteRegistrationError());
      }
    }
  };
}

/**
 * Delete substitution cart upon closing the popup if request is not confirmed yet
 * @returns {Function}
 */
export function removeSubstitutionCart() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { substitutionCartClient },
      registrationSubstitution: { substitutionCart, cartAborted }
    } = state;
    /*
     * check if substitution cart is present. If not present, there is nothing to delete.
     * Can happen if the registrant opened a popup and then closed it without doing any operation.
     */
    if (substitutionCart) {
      /*
       * Check if cart is in a valid state to be deleted
       * Checked out carts can't be deleted.
       */
      const areWebsitePagesAccessible = hasAccessToWebsitePages(state);
      let isInviteeRedirectedToOktaLogoutUrl;
      if (shouldCartBeDeleted(substitutionCart.status)) {
        await substitutionCartClient.deleteSubstitutionCart(substitutionCart.substitutionCartId);
        if (cartAborted) {
          isInviteeRedirectedToOktaLogoutUrl = await dispatch(logoutRegistrant());
          if (!isInviteeRedirectedToOktaLogoutUrl) {
            await dispatch(redirectToPage(areWebsitePagesAccessible ? 'summary' : 'register'));
          }
        }
      } else {
        // Log out the user and redirect to summary page as substitution is completed.
        isInviteeRedirectedToOktaLogoutUrl = await dispatch(logoutRegistrant());
        if (!isInviteeRedirectedToOktaLogoutUrl) {
          await dispatch(redirectToPage(areWebsitePagesAccessible ? 'summary' : 'register'));
        }
      }
    }
    await dispatch(resetSubstituteRegistration());
  };
}

export function abortOriginalSubstitutionCart() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      clients: { substitutionCartClient },
      registrationSubstitution: { originalSubstitutionCart }
    } = getState();
    if (originalSubstitutionCart) {
      const responseResult = await substitutionCartClient.abortSubstitutionCart(
        originalSubstitutionCart.substitutionCartId
      );
      if (responseResult.isSuccessful) {
        await dispatch(hideConcurrentActionPopupMessage());
      } else {
        await dispatch(substituteRegistrationError());
      }
    } else {
      await dispatch(substituteRegistrationError());
    }
  };
}
