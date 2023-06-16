import { updateIn } from 'icepick';
import RegCartClient from '../../../clients/RegCartClient';
import { beginNewRegistration } from '../../../routing/startRegistration';
import { AppDispatch, GetState } from '../../reducer';
import { RegCart } from '../../types';
import { RESET_REG_CART, UPDATE_PLACEHOLDER_REG_CART, UPDATE_PLACEHOLDER_REG_CART_ROLLBACK } from './actionTypes';
import { isPlaceholderRegCart } from './selectors';
import { abortRegCart } from './workflow';

/**
 * Initiates reg cart creation for embedded reg and returns booleans controlling whether
 * the handler should continue and if so whether the reg cart save operation should also occur.
 * The embedded reg cart is initialized from the redux store which is updated with the selected product registration
 * If the create cart request fails, the partial cart update is rolled back to restore the carts previous state
 */
export async function handleEmbeddedRegistrationCartCreationAndDetermineNextSteps(
  dispatch: AppDispatch,
  getState: GetState,
  eventRegistrationId: string,
  eventRegUpdates: Record<string, boolean>
): Promise<Record<string, boolean>> {
  const {
    registrationForm: { regCart, validationMessages }
  } = getState();
  dispatch({
    type: UPDATE_PLACEHOLDER_REG_CART,
    payload: {
      regCart: updateIn(regCart, ['eventRegistrations', eventRegistrationId] as const, eventReg => {
        return {
          ...eventReg,
          ...eventRegUpdates
        };
      }),
      validationMessages
    }
  });
  await dispatch(beginNewRegistration()); // initializes cart
  if (isPlaceholderRegCart(getState().registrationForm?.regCart)) {
    // if placeholder cart has not been replaced, an error has occurred and we should rollback the update
    dispatch({
      type: UPDATE_PLACEHOLDER_REG_CART_ROLLBACK,
      payload: {
        regCart
      }
    });
    return { shouldContinue: false };
  }
  return { shouldContinue: true, shouldSaveCart: false };
}

/**
 * Initiates the reg cart save if required and returns the update cart response.
 * If no update is required, the previously saved cart is returned
 */
export async function handleRegCartSave(
  regCartClient: RegCartClient,
  accessToken: string,
  cartWithSelection: RegCart,
  lastSavedRegCart: RegCart,
  shouldSaveCart: boolean
): Promise<Record<string, unknown>> {
  if (shouldSaveCart) {
    return regCartClient.updateRegCart(accessToken, cartWithSelection);
  }
  // if cart save is not required, use the regcart in redux
  return {
    regCart: lastSavedRegCart
  };
}

/**
 * Used for rolling back the reg cart and aborting the current cart
 * Currently only used in embedded registration for replacing a reg cart with a placeholder reg cart
 */
export async function resetAndAbortRegCart(
  dispatch: AppDispatch,
  initialRegCart: RegCart,
  abortCartId = ''
): Promise<void> {
  dispatch({
    type: RESET_REG_CART,
    payload: {
      regCart: {
        ...initialRegCart
      }
    }
  });
  if (abortCartId) {
    void dispatch(abortRegCart(abortCartId));
  }
}
