import { getEventSnapshotVersion } from '../../selectors/event';
import { getAccountSnapshotVersion } from '../../selectors/account';
import { getTravelSnapshotVersion } from '../../travelCart/selectors';
import {
  extractValidationsFromResponse,
  containsConcurrentActionWarning,
  containsConcurrentActionValidation,
  wasCartAbortedDueToConcurrentAction
} from '../errors';
import {
  setValidationMessage,
  setShowConfirmationMessage,
  showConcurrentActionPopupMessage,
  showCartAbortedMessage
} from '../reducer';
import { getEventId } from '../../selectors/event';
import { getAttendee } from '../../selectors/currentRegistrant';

const handleResponseResult = (response, substitutionCart) => {
  return async dispatch => {
    if (!response || wasCartAbortedDueToConcurrentAction(response)) {
      /**
       * This has happened because the substitution has been cancelled beacause some other operation is happening for the registrant
       * which has heigher precedence and we can't really reuse the existing cart.
       * OR because the cart was aborted by the concurrent user.
       */
      await dispatch(showCartAbortedMessage());
    } else {
      if (containsConcurrentActionWarning(response)) {
        await dispatch(showConcurrentActionPopupMessage(response.substitutionCart));
      } else {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        const validationList = extractValidationsFromResponse(response, substitutionCart.substituentInformation);
        if (validationList?.length > 0) {
          await dispatch(setValidationMessage(validationList, containsConcurrentActionValidation(response)));
        } else {
          await dispatch(setShowConfirmationMessage(response.substitutionCart));
        }
      }
    }
  };
};

/**
 * Function that dispatch required actions after creating a substitution cart
 * @returns {Function}
 */
export function handleSubstitutionCartCreation() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { substitutionCartClient },
      registrationSubstitution: { substitutionForm }
    } = state;
    const substitutionCart = createSubstitutionCart(
      substitutionForm,
      getAttendee(state),
      getEventId(state),
      getAllSnapshotVersions(state)
    );
    try {
      const response = await substitutionCartClient.createSubstitutionCart(substitutionCart);
      dispatch(handleResponseResult(response, substitutionCart));
    } catch (error) {
      const validationList = extractValidationsFromResponse(
        error.responseBody,
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        substitutionCart.substituentInformation
      );
      if (validationList && validationList.length > 0) {
        await dispatch(setValidationMessage(validationList, containsConcurrentActionValidation(error)));
      }
    }
  };
}

/**
 * Function that dispatch required actions after updating a substitution cart
 * @returns {Function}
 */
export function handleSubstitutionCartUpdation() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      clients: { substitutionCartClient },
      registrationSubstitution: { substitutionCart, substitutionForm }
    } = state;
    const updatedSubstitutionCart = getUpdatedSubstitutionCart(substitutionCart, substitutionForm);
    try {
      const response = await substitutionCartClient.updateSubstitutionCart(updatedSubstitutionCart);
      dispatch(handleResponseResult(response, substitutionCart));
    } catch (error) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
      const validationList = extractValidationsFromResponse(error, substitutionCart.substituentInformation);
      if (validationList && validationList.length > 0) {
        await dispatch(setValidationMessage(validationList, containsConcurrentActionValidation(error)));
      }
    }
  };
}

/**
 * Check if the cart should be update if there is any change in the details
 * @param substituentInformation Already created substitutionCart.substituentInformation
 * @param substitutionForm Newly added details in the substitution form
 * @returns {boolean} True: Cart must be updated as there is change in the substituent information;
 * False: If there is no change or cart has been created as of now
 */
export const shouldUpdateCart = (substituentInformation: $TSFixMe, substitutionForm: $TSFixMe): $TSFixMe => {
  if (substituentInformation) {
    return (
      substituentInformation.firstName !== substitutionForm.firstName ||
      substituentInformation.lastName !== substitutionForm.lastName ||
      substituentInformation.emailAddress !== substitutionForm.emailAddress
    );
  }
  return false;
};

/**
 * Decides whether we should delete the substitution cart because user do not want to perform the substitution
 * or substitution has been performed already and we should just log out the user
 * @param status
 * @returns {boolean} True = Perform delete cart operation; False = Logout registrant
 */
export const shouldCartBeDeleted = (status: $TSFixMe): $TSFixMe => {
  return status === 'INPROGRESS' || status === 'FAILED';
};

/**
 * Create substitution Cart object to pass reg api
 * @param substitutionForm
 * @param registrant
 * @param eventId
 * @param snapshotVersions
 * @returns {{eventId, contactId: *, inviteeId: *, eventSnapshotVersion: {}, accountSnapshotVersion: *,
 * substituentInformation: {}}}
 */
function createSubstitutionCart(substitutionForm, registrant, eventId, snapshotVersions) {
  const cart = {
    eventId,
    contactId: registrant.personalInformation.contactId,
    inviteeId: registrant.attendeeId,
    eventSnapshotVersion: {
      [eventId]: snapshotVersions.event
    },
    accountSnapshotVersion: snapshotVersions.account,
    substituentInformation: {
      ...substitutionForm
    }
  };
  // Add event travel Snapshot only if eventTravel is present
  const travelSnapshotVersion = snapshotVersions.travel;
  if (travelSnapshotVersion) {
    return {
      ...cart,
      travelSnapshotVersion: {
        [eventId]: travelSnapshotVersion
      }
    };
  }
  return cart;
}

/**
 * update substitution Cart object to pass reg api
 * @param substitutionCart
 * @param substitutionForm
 * @returns {{eventId, contactId: *, inviteeId: *, eventSnapshotVersion: {}, accountSnapshotVersion: *,
 * substituentInformation: {}}}
 */
export function getUpdatedSubstitutionCart(substitutionCart: $TSFixMe, substitutionForm: $TSFixMe): $TSFixMe {
  return {
    ...substitutionCart,
    substituentInformation: {
      ...substitutionForm
    }
  };
}

/**
 * Retrieve all snapshot versions from state and return an object containing each's version
 * @param state
 * @returns {{event: eventSnapshotVersion, account: account, travel: event}}
 */
export function getAllSnapshotVersions(state: $TSFixMe): $TSFixMe {
  return {
    event: getEventSnapshotVersion(state),
    account: getAccountSnapshotVersion(state),
    travel: getTravelSnapshotVersion(state)
  };
}
