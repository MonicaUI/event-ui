import { useDispatch, useSelector, useStore } from 'react-redux';
import { useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getRegCart } from '../../redux/selectors/shared';
import {
  getEventRegistrationId,
  isGroupRegistration,
  isRegApprovalRequired
} from '../../redux/selectors/currentRegistrant';
import { getGuestsOfRegistrant } from '../../redux/registrationForm/regCart/selectors';
import {
  isGuestProductSelectionEnabledOnRegPath,
  isGuestRegistrationEnabled
} from '../../redux/selectors/currentRegistrationPath';
import Logger from '@cvent/nucleus-logging';
import { convertResponse } from '../../clients/RegCartClient';
import {
  UPDATE_REG_CART_SESSION_BUNDLE_FAILURE,
  UPDATE_REG_CART_SESSION_BUNDLE_SUCCESS
} from '../../redux/registrationForm/regCart/actionTypes';
import { closeDialogContainer, hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import {
  getCurrentRegistrantAndGuests,
  getSessionBundleRegistrationCount
} from '../../redux/selectors/productSelectors';
import { REQUESTED_ACTIONS } from 'event-widgets/constants/Request';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import { openGuestProductSelectionDialog } from '../../dialogs';
import { isEmpty, isNil } from 'lodash';
import { getUpdateResponseValidations } from '../../redux/registrationForm/errors';
import { openCapacityReachedDialog } from '../../dialogs';
import {
  getSessionBundleToUpdate,
  prepareRegCartWithUnsavedChanges,
  REGISTER_SESSION_BUNDLE,
  SessionBundleRegistration,
  updateSessionCapacitiesForChangedSessionBundles
} from '../../redux/registrationForm/regCart/sessionBundles';
import { EventRegistrationSelection } from '../../dialogs/GuestProductSelectionDialogs';
import { EventRegistration, RegCart } from '@cvent/flex-event-shared';
import { SessionBundle } from 'event-widgets/types/sessionBundleType';
import type { AppDispatch, RootState } from '../../redux/reducer';

export type Mutation = [MutationCallback, boolean];
type MutationCallback = (options?: MutationCallbackOptions) => Promise<void>;
type MutationCallbackOptions = {
  variables: {
    regCartId: string;
    input: SessionBundleRegistration[];
  };
};
type RegisterSessionBundleTuple = [() => Promise<void>, boolean];

const LOG = new Logger('widgets/Sessions/useRegisterSessionBundle');

/**
 * A react hook used to register a session bundle for an invitee and its guests.
 *
 * @param sessionBundle the session bundle to be registered
 * @returns {(function(): *|boolean)[]} a tuple, the first value being a function that will
 *   initiate the registration process when called, and the second value being a boolean
 *   to indicate the loading state
 */
export function useRegisterSessionBundle(sessionBundle: SessionBundle): RegisterSessionBundleTuple {
  const dispatch = useDispatch();
  const store = useStore();
  const state = store.getState();
  const mutation = useMutation();

  const eventRegistrationId = useSelector(getEventRegistrationId) as string;
  const regCart = useSelector(getRegCart);
  const guestRegistrationEnabled = useSelector(isGuestRegistrationEnabled);
  const guestProductSelectionEnabledOnRegPath = useSelector(isGuestProductSelectionEnabledOnRegPath);
  const guestRegistrations = getGuestsOfRegistrant(regCart, eventRegistrationId);

  const hasGuests = guestRegistrationEnabled && !isEmpty(guestRegistrations);
  if (hasGuests && guestProductSelectionEnabledOnRegPath) {
    return _handleRegistrationWithDifferentAgendas(
      dispatch,
      state,
      mutation,
      sessionBundle,
      regCart,
      eventRegistrationId
    );
  }
  return handleRegistrationWithSameAgenda(
    state,
    mutation,
    sessionBundle,
    regCart,
    eventRegistrationId,
    hasGuests,
    guestRegistrations
  );
}

/**
 * A hook that executes the session bundle registration mutation, as well as handles post-execution logic.
 * This implementation is separate from Apollo's useMutation so that the mutation's input can still be accessed
 * after the mutation has completed (which Apollo's `useMutation` cannot do).
 *
 * @returns a tuple, the first value being a function that will
 *   call the mutation, and the second value being a boolean to indicate the loading state
 */
function useMutation(): Mutation {
  const dispatch = useDispatch<AppDispatch>();
  const apolloClient = useApolloClient();
  const [loading, setLoading] = useState(false);
  const regCart = useSelector(getRegCart);

  const mutate = async options => {
    try {
      setLoading(true);

      const result = await apolloClient.mutate({
        mutation: REGISTER_SESSION_BUNDLE,
        refetchQueries: ['getVisibleSessionBundles'],
        awaitRefetchQueries: true,
        ...options
      });
      const response = result?.data?.response;
      LOG.debug('useRegisterSessionBundle success', response);
      const { regCart: savedRegCart, validationMessages } = convertResponse(response);
      const regCartWithUnsavedChanges = prepareRegCartWithUnsavedChanges(
        options.variables.input,
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
      await dispatch(updateSessionCapacitiesForChangedSessionBundles(options.variables.input, regCart, savedRegCart));
    } catch (error) {
      LOG.debug('useRegisterSessionBundle failed', error);
      const result = error?.networkError?.result;
      if (result && getUpdateResponseValidations.isProductReachCapacity(result)) {
        apolloClient.cache.evict({
          fieldName: 'products'
        });
        apolloClient.cache.gc();
        dispatch(openCapacityReachedDialog());
      } else {
        dispatch({ type: UPDATE_REG_CART_SESSION_BUNDLE_FAILURE, payload: { error } });
        dispatch(hideLoadingOnError());
      }
    } finally {
      setLoading(false);
    }
  };

  return [mutate, loading];
}

/**
 * Exported for testing only.
 * Returns selection information for the product selection dialog for the given session bundle
 *
 * @param eventRegistrations all of the available event registrations
 * @param sessionBundle the session bundle who's selection information is to be obtained
 * @returns {{}} the selection information for each event registration
 */
export function _getEventRegistrationSelections(
  eventRegistrations: EventRegistration[],
  sessionBundle: SessionBundle
): Record<string, EventRegistrationSelection> {
  const eventRegistrationSelections = {};
  eventRegistrations.forEach(eventRegistration => {
    const sessionBundleRegistration = eventRegistration?.sessionBundleRegistrations?.[sessionBundle.id];
    eventRegistrationSelections[eventRegistration.eventRegistrationId] = {
      isSelected: sessionBundleRegistration && sessionBundleRegistration.requestedAction === REQUESTED_ACTIONS.REGISTER,
      isDisabled:
        !isEmpty(sessionBundle.applicableRegistrationTypes) &&
        !sessionBundle.applicableRegistrationTypes.includes(eventRegistration.registrationTypeId)
    };
  });
  return eventRegistrationSelections;
}

/**
 * Exported for testing only.
 * Returns a function that will apply the session bundle selection from the product
 * selection dialog when called.
 *
 * @param dispatch the redux dispatch
 * @param mutate the apollo mutation function
 * @param regCart the current regCart
 * @returns {function(*=, *, *=): function(): Promise<void>}
 */
export function _getGuestSessionBundleSelectionApplicator(
  dispatch: AppDispatch,
  mutate: MutationCallback,
  regCart: RegCart
) {
  return (
      productId: string,
      currentPrimaryRegId: string,
      selectedEventRegIds: Record<string, EventRegistrationSelection>
    ): (() => Promise<void>) =>
    async () => {
      dispatch(closeDialogContainer());
      if (selectedEventRegIds) {
        const sessionBundleRegistrationsToUpdate = Object.keys(selectedEventRegIds)
          .filter(eventRegId => !isNil(selectedEventRegIds[eventRegId].isSelected))
          .map(eventRegId =>
            getSessionBundleToUpdate(eventRegId, productId, selectedEventRegIds[eventRegId].isSelected)
          );
        await mutate({
          variables: {
            regCartId: regCart.regCartId,
            input: sessionBundleRegistrationsToUpdate
          }
        });
      }
    };
}

/**
 * Exported for testing only.
 * Determines the capacity for a product in the guest product selection dialog. In cases
 * of reg approval, the available capacity should correspond to the difference in selections
 * already made.
 *
 * @param productCapacity the available capacity of the session bundle
 * @param isRegApproval true if reg approval is required, otherwise false
 * @param eventRegistrationSelections the selections made on this product
 * @returns the available capacity for the dialog
 */
export function _getCapacityForGuestProductSelectionDialog(
  productCapacity: number,
  isRegApproval: boolean,
  eventRegistrationSelections: Record<string, EventRegistrationSelection>
): number {
  if (!isRegApproval || productCapacity === -1) {
    return productCapacity;
  }

  const selectedCount = Object.values(eventRegistrationSelections).filter(selection => selection.isSelected).length;
  return productCapacity <= selectedCount ? 0 : productCapacity - selectedCount;
}

/**
 * Exported for testing only.
 * Handles selection for session bundles in the case where guests may have an agenda that
 * differs from the primary invitee. In such case, a dialog will appear that allows each
 * invitee to individually select the product.
 *
 * @param dispatch the redux dispatch function
 * @param state the redux state
 * @param mutation the mutation used to register a session bundle
 * @param sessionBundle the session bundle to be registered
 * @param regCart the current registration cart
 * @param eventRegistrationId the current event registration id
 * @returns {((function(): *)|boolean)[]} a tuple, the first value being a function that will
 *   open the product selection dialog when called, and the second value being a boolean to
 *   indicate the loading state of the mutation
 */
export function _handleRegistrationWithDifferentAgendas(
  dispatch: AppDispatch,
  state: RootState,
  mutation: Mutation,
  sessionBundle: SessionBundle,
  regCart: RegCart,
  eventRegistrationId: string
): RegisterSessionBundleTuple {
  const [mutate, loading] = mutation;
  const isGroupReg = isGroupRegistration(state);
  const isRegApproval = isRegApprovalRequired(state);
  const overrideCapacity = isPlannerRegistration(state);
  const eventRegistrations = Object.values(getCurrentRegistrantAndGuests(state));

  const eventRegistrationSelections = _getEventRegistrationSelections(eventRegistrations, sessionBundle);
  const applyGuestSessionBundleSelection = _getGuestSessionBundleSelectionApplicator(dispatch, mutate, regCart);
  const productCapacity = _getCapacityForGuestProductSelectionDialog(
    sessionBundle.capacity.availableCapacity,
    isRegApproval,
    eventRegistrationSelections
  );
  const openProductSelectionDialog = () =>
    dispatch(
      openGuestProductSelectionDialog(
        'GuestProductSelection_SelectAttendees__resx',
        sessionBundle.id,
        sessionBundle.name,
        productCapacity,
        overrideCapacity,
        eventRegistrationSelections,
        eventRegistrations,
        eventRegistrationId,
        isGroupReg,
        applyGuestSessionBundleSelection,
        sessionBundle.fees,
        sessionBundle.defaultFeeId
      )
    );
  return [openProductSelectionDialog, loading];
}

/**
 * Handles selection for sessions bundles in the case where there are no guests, or when
 * there are guests and they have the same agenda as the primary invitee.
 *
 * @param state the redux state
 * @param mutation he mutation used to register a session bundle
 * @param sessionBundle the session bundle to be registered
 * @param regCart the current registration cart
 * @param eventRegistrationId the current event registration id
 * @param hasGuests a boolean that indicates if the current registrant has guests
 * @param guestRegistrations the guest registrations of the current registrant
 * @returns {((function(): *)|boolean)[]} a tuple, the first value being a function that will
 *   open the product selection dialog when called, and the second value being a boolean to
 *   indicate the loading state of the mutation
 */
function handleRegistrationWithSameAgenda(
  state,
  mutation,
  sessionBundle,
  regCart,
  eventRegistrationId,
  hasGuests,
  guestRegistrations
): RegisterSessionBundleTuple {
  const [mutate, loading] = mutation;
  const registerSessionBundle = async () => {
    const isSelectedForInviteeAndGuests = getSessionBundleRegistrationCount(state, sessionBundle.id) > 0;
    const guestSessionBundleRegistrationsToUpdate = hasGuests
      ? guestRegistrations.map(guestRegistration =>
          getSessionBundleToUpdate(
            guestRegistration.eventRegistrationId,
            sessionBundle.id,
            !isSelectedForInviteeAndGuests
          )
        )
      : [];
    const sessionBundleRegistrationsToUpdate = [
      getSessionBundleToUpdate(eventRegistrationId, sessionBundle.id, !isSelectedForInviteeAndGuests),
      ...guestSessionBundleRegistrationsToUpdate
    ];

    if (!isEmpty(sessionBundleRegistrationsToUpdate)) {
      await mutate({
        variables: {
          regCartId: regCart.regCartId,
          input: sessionBundleRegistrationsToUpdate
        }
      });
    }
  };
  return [registerSessionBundle, loading];
}
