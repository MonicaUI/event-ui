import {
  UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE,
  UPDATE_REG_CART_PAYMENT_CREDITS_PENDING,
  UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS
} from './actionTypes';
import { getUpdateErrors } from '../errors';
import { hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import Logger from '@cvent/nucleus-logging';
import { getRegistrationPathId, getRegistrationTypeId } from './selectors';
import { getEventRegistrationId } from '../../selectors/currentRegistrant';

const LOG = new Logger('redux/registrationForm/regCart/paymentCredits');

export const updatePaymentCreditsInRegCart = () => {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      registrationForm: { regCart },
      clients: { regCartClient },
      account,
      event
    } = getState();
    dispatch({ type: UPDATE_REG_CART_PAYMENT_CREDITS_PENDING });

    try {
      const regCartResponse = await regCartClient.updatePaymentCreditsInRegCart(accessToken, regCart.regCartId);
      dispatch({ type: UPDATE_REG_CART_PAYMENT_CREDITS_SUCCESS, payload: { regCart: regCartResponse } });

      LOG.debug(`updatePaymentCreditsInRegCart with id ${regCart.regCartId} was successful`);
    } catch (error) {
      LOG.error(`updatePaymentCreditsInRegCart with id ${regCart.regCartId} failed`, error);
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(regCart, getEventRegistrationId(getState())),
          getRegistrationPathId(regCart, getEventRegistrationId(getState()))
        )
      ) {
        return;
      }
      dispatch({ type: UPDATE_REG_CART_PAYMENT_CREDITS_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
};
