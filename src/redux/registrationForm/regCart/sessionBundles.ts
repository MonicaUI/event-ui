import { getIn, setIn } from 'icepick';
import { convertResponse } from '../../../clients/RegCartClient';
import {
  UPDATE_REG_CART_SESSION_BUNDLE_FAILURE,
  UPDATE_REG_CART_SESSION_BUNDLE_PENDING,
  UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS
} from './actionTypes';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getGuestsOfRegistrant } from './selectors';
import Logger from '@cvent/nucleus-logging';
import { isEmpty, merge, pick } from 'lodash';
import { gql } from '@apollo/client/core';
import { REGISTRATION_SOURCE_TYPES, REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import { loadAvailableSessionCapacityCounts } from '../../capacity';

export type SessionBundleRegistration = {
  eventRegistrationId: string;
  productId: string;
  requestedAction: string;
  registrationSourceType: string;
};

const LOG = new Logger('redux/registrationForm/regCart/sessionBundles');

export const REGISTER_SESSION_BUNDLE = gql`
  mutation registerSessionBundle($regCartId: String!) {
    environment @client @export(as: "environment")
    response(input: $input, regCartId: $regCartId, environment: $environment)
      @rest(
        type: "RegisterSessionBundleResponse"
        path: "registration/v1/regcart/{args.regCartId}/productRegistrations/sessionbundles?environment={args.environment}"
        method: "PUT"
        endpoint: "eventGuestsideV1"
      ) {
      regCart
      validationMessages
    }
  }
`;

/**
 * This is a converter that used to convert the shape of validation message regarding
 * session bundle from RegAPI response into the validation results , which is the output
 * that would be used as a prop for different use cases in UI component that will accept
 * and align with existed workflow
 */
export function buildRegTypeSelectionConflictDialogResults(conflictSessionBundleParams: $TSFixMe): $TSFixMe {
  const sessionBundleValidationResults = {};
  let regTypeId;
  conflictSessionBundleParams.forEach(param => {
    const { eventRegistrationId: evtRegId, productId: sessionBundleId, registrationTypeId: newRegTypeId } = param;
    regTypeId = newRegTypeId;
    if (sessionBundleValidationResults[evtRegId]) {
      sessionBundleValidationResults[evtRegId] = {
        ...sessionBundleValidationResults[evtRegId],
        sessionBundlesValidationResults: {
          ...sessionBundleValidationResults[evtRegId].sessionBundlesValidationResults,
          invalidSessionBundles: [
            ...sessionBundleValidationResults[evtRegId].sessionBundlesValidationResults.invalidSessionBundles,
            sessionBundleId
          ]
        }
      };
    } else {
      sessionBundleValidationResults[evtRegId] = {
        sessionBundlesValidationResults: {
          isValid: false,
          invalidSessionBundles: [sessionBundleId]
        },
        newRegistrationTypeId: regTypeId
      };
    }
  });
  return { sessionBundleValidationResults, regTypeId };
}

export function buildIdConfirmationDialogRegTypeConflictResults(conflictSessionBundleParams?: $TSFixMe): $TSFixMe {
  return {
    isValid: isEmpty(conflictSessionBundleParams),
    invalidSessionBundles: conflictSessionBundleParams?.map(param => param.productId) ?? []
  };
}

/**
 * build Reg API input for session bundle unregistration per eventRegId
 * append guest reg if shouldApplyWithGuest is true
 */
export function buildUnregisterSessionBundlesInput(
  regCart: $TSFixMe,
  eventRegId: $TSFixMe,
  invalidSessionBundleIds: $TSFixMe,
  shouldApplyWithGuest: $TSFixMe
): $TSFixMe {
  const sessionBundleRegistrationsToUnregister = [];
  // for current eventRegId(invitee/guest), append each invalid session bundle unregister request param
  sessionBundleRegistrationsToUnregister.push(
    ...invalidSessionBundleIds.map(sessionBundleId => getSessionBundleToUpdate(eventRegId, sessionBundleId, false))
  );
  if (shouldApplyWithGuest) {
    // if guest apply same product is ON
    const guestRegistrations = getGuestsOfRegistrant(regCart, eventRegId);
    if (guestRegistrations && guestRegistrations.length > 0) {
      // for current guest that has apply same product ON, append each invalid session bundle unregister request param
      invalidSessionBundleIds.forEach(sessionBundleId =>
        guestRegistrations.forEach(guestRegistration =>
          sessionBundleRegistrationsToUnregister.push(
            getSessionBundleToUpdate(guestRegistration.eventRegistrationId, sessionBundleId, false)
          )
        )
      );
    }
  }
  return sessionBundleRegistrationsToUnregister;
}

/**
 * Unregister invalid Session Bundles due to RegType Conflict for each eventRegId using GraphQL
 */
export function handleRegTypeConflictSessionBundles(
  apolloClient: $TSFixMe,
  regCart: $TSFixMe,
  sessionBundleUnRegisterInput: $TSFixMe,
  guestEvtRegId?: $TSFixMe
) {
  return async (dispatch: $TSFixMe): Promise<$TSFixMe> => {
    if (sessionBundleUnRegisterInput && sessionBundleUnRegisterInput.length > 0) {
      dispatch({ type: UPDATE_REG_CART_SESSION_BUNDLE_PENDING });
      try {
        const result = await apolloClient.mutate({
          mutation: REGISTER_SESSION_BUNDLE,
          variables: {
            regCartId: regCart.regCartId,
            input: sessionBundleUnRegisterInput
          },
          refetchQueries: ['getVisibleSessionBundles'],
          awaitRefetchQueries: true
        });
        const { regCart: savedRegCart, validationMessages } = convertResponse(result.data.response);
        const regCartWithUnsavedChanges = prepareRegCartWithUnsavedChanges(
          sessionBundleUnRegisterInput,
          savedRegCart,
          regCart
        );
        dispatch({
          type: UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS,
          payload: {
            regCart: regCartWithUnsavedChanges,
            savedRegCart,
            validationMessages
          }
        });
        dispatch(updateSessionCapacitiesForChangedSessionBundles(sessionBundleUnRegisterInput, regCart, savedRegCart));

        if (guestEvtRegId) {
          const guestEventReg = savedRegCart.eventRegistrations[guestEvtRegId];
          return {
            sessionBundleRegistrations: guestEventReg.sessionBundleRegistrations,
            sessionRegistrations: guestEventReg.sessionRegistrations
          };
        }
      } catch (error) {
        LOG.debug('handleRegTypeConflictSessionBundles failed', error);
        dispatch({ type: UPDATE_REG_CART_SESSION_BUNDLE_FAILURE, payload: { error } });
        dispatch(hideLoadingOnError());
      }
    }
  };
}

/**
 * Only update the session bundle and session registration for each event registration
 * in current regCart, leave other info remain same
 */
export function prepareRegCartWithUnsavedChanges(
  sessionBundleRegistrationsToUpdate: $TSFixMe,
  savedRegCart: $TSFixMe,
  cart: $TSFixMe
): $TSFixMe {
  // Put the information that was saved as part of selecting a product back in the unsaved reg cart
  const eventRegIdsToUpdateForSessionRegistrations = sessionBundleRegistrationsToUpdate.map(
    sessionReg => sessionReg.eventRegistrationId
  );
  let regCartWithUnsavedChanges = cart;
  for (const eventRegistrationId of eventRegIdsToUpdateForSessionRegistrations) {
    const savedSessionBundleRegistrationsByRegId = getIn(savedRegCart, [
      'eventRegistrations',
      eventRegistrationId,
      'sessionBundleRegistrations'
    ]);
    regCartWithUnsavedChanges = setIn(
      regCartWithUnsavedChanges,
      ['eventRegistrations', eventRegistrationId, 'sessionBundleRegistrations'],
      savedSessionBundleRegistrationsByRegId
    );
    const savedSessionRegistrationsByRegId = getIn(savedRegCart, [
      'eventRegistrations',
      eventRegistrationId,
      'sessionRegistrations'
    ]);
    regCartWithUnsavedChanges = setIn(
      regCartWithUnsavedChanges,
      ['eventRegistrations', eventRegistrationId, 'sessionRegistrations'],
      savedSessionRegistrationsByRegId
    );
  }
  return regCartWithUnsavedChanges;
}

/**
 * Creates an formatted object used to be sent to the registration endpoint.
 *
 * @param eventRegistrationId the event registration id of the invitee
 * @param sessionBundleId the id of the session bundle that the invitee is registering
 * @param shouldRegister true if the invitee is registering the session bundle, otherwise false
 * @returns {{productId, requestedAction: (string), eventRegistrationId, registrationSourceType: string}}
 */
export function getSessionBundleToUpdate(
  eventRegistrationId: string,
  sessionBundleId: string,
  shouldRegister: boolean
): SessionBundleRegistration {
  return {
    eventRegistrationId,
    productId: sessionBundleId,
    requestedAction: shouldRegister ? REQUESTED_ACTIONS.REGISTER : REQUESTED_ACTIONS.UNREGISTER,
    registrationSourceType: REGISTRATION_SOURCE_TYPES.SELECTED
  };
}

/**
 * Updates the capacities of all sessions corresponding to a session bundle that was just added
 * or removed from a regCart.
 * Adding or removing a session bundle consequently adds or removes included sessions
 * to `newRegCart`. This finds the bundle sessions that were added to `newRegCart`,
 * the included sessions that were removed from `lastRegCart`, and then update the
 * capacities for those sessions only.
 *
 * @param sessionBundleRegistrationsToUpdate the registration objects obtained from `getSessionBundleToUpdate`
 * @param lastRegCart the regCart before the session bundle was added/removed
 * @param newRegCart the regCart after the session bundle was added/removed
 * @returns a thunk redux action to be dispatched
 */
export function updateSessionCapacitiesForChangedSessionBundles(
  sessionBundleRegistrationsToUpdate: $TSFixMe,
  lastRegCart: $TSFixMe,
  newRegCart: $TSFixMe
) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const sessionProducts = getState().visibleProducts.Widget?.sessionProducts;
    if (isEmpty(sessionProducts)) {
      return;
    }

    const capacityIdsOfChangedSessions = _getSessionCapacityIdsForChangedSessionBundles(
      sessionProducts,
      sessionBundleRegistrationsToUpdate,
      lastRegCart,
      newRegCart
    );
    await dispatch(loadAvailableSessionCapacityCounts(capacityIdsOfChangedSessions));
  };
}

/**
 * Extracted and exported for testing only so that the capacity id retrieval can be tested
 * outside of the `updateSessionCapacitiesForChangedSessionBundles` thunk action.
 */
export function _getSessionCapacityIdsForChangedSessionBundles(
  sessionProducts: $TSFixMe,
  sessionBundleRegistrationsToUpdate: $TSFixMe,
  lastRegCart: $TSFixMe,
  newRegCart: $TSFixMe
): $TSFixMe {
  const eventRegistrationIds = sessionBundleRegistrationsToUpdate.map(reg => reg.eventRegistrationId);
  const sessionBundleIds = sessionBundleRegistrationsToUpdate.map(reg => reg.productId);
  return Object.values(
    merge(
      {},
      ...Object.values(pick(lastRegCart.eventRegistrations, eventRegistrationIds)),
      ...Object.values(pick(newRegCart.eventRegistrations, eventRegistrationIds))
    ).sessionRegistrations
  )
    .filter(product => sessionBundleIds.includes((product as $TSFixMe).registrationSourceParentId))
    .map(session => sessionProducts?.[(session as $TSFixMe).productId]?.capacityId);
}
