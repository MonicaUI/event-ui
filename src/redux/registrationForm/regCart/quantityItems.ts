import { SAVING_REGISTRATION } from '../../registrationIntents';
import {
  UPDATE_REG_CART_QUANTITY_ITEM_PENDING,
  UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS,
  UPDATE_REG_CART_QUANTITY_ITEM_FAILURE
} from './actionTypes';
import { loadAvailableQuantityItemCapacityCounts } from '../../capacity';
import { getUpdateErrors } from '../errors';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { openCapacityReachedDialog } from '../../../dialogs';
import Logger from '@cvent/nucleus-logging';
import { getIn, setIn } from 'icepick';
import { hasQuantityItemCapacityWarning } from '../warnings';
import { setEventRegistrationFieldValue } from './actions';
import { getSelectedQuantityItems } from '../../selectors/currentRegistrant';
import { quantityItemAppearOnSamePageAsPaymentOrRegSummary } from '../../website/pageContentsWithGraphQL';

const LOG = new Logger('redux/registrationForm/regCart/quantityItems');

/**
 * Update the quantity items registrations in reg cart
 */
export function updateQuantity(eventRegistrationId: $TSFixMe, quantityItemId: $TSFixMe, quantity: $TSFixMe) {
  return async (
    dispatch: $TSFixMe,
    getState: $TSFixMe,
    {
      apolloClient
    }: {
      apolloClient?: $TSFixMe;
    }
  ): Promise<$TSFixMe> => {
    LOG.debug('updateQuantity', eventRegistrationId, quantityItemId, quantity);
    const {
      accessToken,
      registrationForm: { regCart: cart },
      regCartStatus: { registrationIntent },
      clients: { regCartClient },
      text: { translate }
    } = getState();
    if (registrationIntent === SAVING_REGISTRATION) {
      return;
    }
    const quantityItemRegistrationToUpdate = {
      eventRegistrationId,
      productId: quantityItemId,
      quantity
    };
    dispatch({ type: UPDATE_REG_CART_QUANTITY_ITEM_PENDING });
    try {
      LOG.debug('updateRegCartQuantityItemRegistrations', quantityItemRegistrationToUpdate);
      const response = await regCartClient.updateRegCartQuantityItemRegistrations(
        accessToken,
        cart.regCartId,
        quantityItemRegistrationToUpdate
      );
      LOG.debug('updateRegCartQuantityItemRegistrations success');
      const savedRegCart = response.regCart;

      // Put the information that was saved as part of selecting a product back in the unsaved reg cart
      const savedQuantityItemRegistrations = getIn(savedRegCart, [
        'eventRegistrations',
        eventRegistrationId,
        'quantityItemRegistrations'
      ]);
      const regCartWithUnsavedChanges = setIn(
        cart,
        ['eventRegistrations', eventRegistrationId, 'quantityItemRegistrations'],
        savedQuantityItemRegistrations
      );

      dispatch({
        type: UPDATE_REG_CART_QUANTITY_ITEM_SUCCESS,
        payload: {
          regCart: regCartWithUnsavedChanges,
          savedRegCart,
          validationMessages: response.validationMessages
        }
      });
      const quantityItemsOnPageWithPaymentOrRegSummary = await quantityItemAppearOnSamePageAsPaymentOrRegSummary(
        getState(),
        apolloClient
      );
      if (quantityItemsOnPageWithPaymentOrRegSummary) {
        await Promise.all([dispatch(loadAvailableQuantityItemCapacityCounts())]);
        LOG.debug('loadAvailableQuantityItemCapacityCounts success');
      } else {
        await dispatch(loadAvailableQuantityItemCapacityCounts());
        LOG.debug('loadAvailableQuantityItemCapacityCounts success');
      }
      if (hasQuantityItemCapacityWarning(getState())) {
        return await dispatch(
          openCapacityReachedDialog({
            subMessage: translate('EventGuestSide_QuantityItem_CapacityReachedSubMessage__resx')
          })
        );
      }
    } catch (error) {
      LOG.info('updateQuantity failed', error);
      dispatch({ type: UPDATE_REG_CART_QUANTITY_ITEM_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      if (getUpdateErrors.isProductAvailabilityError(error)) {
        dispatch(loadAvailableQuantityItemCapacityCounts());
        return await dispatch(openCapacityReachedDialog());
      }
      throw error;
    }
  };
}

/**
 * add/update quantity for the current registrant in the reg cart locally
 * @param eventRegistrationId eventReg to update
 * @param quantityItemId which quantity item to update
 * @param quantity quantity they want to choose
 */
export function updateLocalQuantity(eventRegistrationId: $TSFixMe, quantityItemId: $TSFixMe, quantity: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const { ...rest } = getSelectedQuantityItems(state);
    const quantityItemRegistrationsToUpdate =
      quantity >= 0
        ? {
            ...rest,
            [quantityItemId]: {
              productId: quantityItemId,
              quantity
            }
          }
        : { ...rest };

    dispatch(
      setEventRegistrationFieldValue(
        eventRegistrationId,
        ['quantityItemRegistrations'],
        quantityItemRegistrationsToUpdate
      )
    );
  };
}
