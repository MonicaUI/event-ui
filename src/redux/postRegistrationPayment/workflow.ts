import {
  FINALIZE_CHECKOUT_FAILURE,
  RESET_REG_CART,
  SET_CURRENT_EVENT_REGISTRATION_ID,
  RESTORE_REG_CART_SUCCESS
} from '../registrationForm/regCart/actionTypes';
import { GET_ORDERS, CLEAR_ORDERS } from '../actionTypes';
import { getPrimaryRegistrationId } from '../registrationForm/regCart/selectors';
import { getInviteeData } from '../registrationForm/regCart/internal';
import { getPostRegPaymentPricingInfo, getCheckoutInfoForPostServiceFees } from './reducer';
import { closeDialogContainer, hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { getFinalState, waitForRegCartCheckoutCompletionUi } from '../registrationForm/regCart/workflow';
import { routeToPage } from '../pathInfo';
import { openPaymentSuccessfulDialog } from '../../dialogs';
import { getConfirmationPageIdForInvitee } from '../../utils/confirmationUtil';

export function startPostRegistrationPaymentPage() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      registrationForm,
      clients: { attendeeOrderClient },
      defaultUserSession: { eventId }
    } = getState();
    const regCart = registrationForm.regCart;
    const registrantId = registrationForm.currentEventRegistrationId;
    if (!registrantId) {
      return;
    }
    const eventRegistrations = registrationForm.regCart.eventRegistrations;
    const attendeeId = eventRegistrations[registrantId].attendee.attendeeId;
    let ordersResponse = [];
    if (attendeeId) {
      ordersResponse = await attendeeOrderClient.getAttendeeOrders(eventId, attendeeId);
    }
    const currentEventRegistrationId = getPrimaryRegistrationId(regCart);
    dispatch({ type: GET_ORDERS, payload: { ordersResponse } });
    dispatch({ type: SET_CURRENT_EVENT_REGISTRATION_ID, payload: { currentEventRegistrationId } });
  };
}

export function finalizePostRegistrationPayment(webPaymentData: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      event,
      accessToken,
      clients: { regCartClient, travelApiClient },
      registrationForm,
      orders,
      partialPaymentSettings
    } = getState();
    const inviteeData = await getInviteeData(registrationForm);
    const pricingInfo = getPostRegPaymentPricingInfo(orders, webPaymentData, accessToken, partialPaymentSettings);
    let postRegPaymentRegCartId = '';
    try {
      /**
       * When the user confirms payment, startPaymentCartCheckout is called to
       * create the payment cart for post registration payments.
       * getRegCartPricing is called to update the regCartPricing and regCart so that
       * IF SERVICE FEES is ENABLED, the dialog will be rendered with the updated netFeeAmount value
       */
      const response = await regCartClient.startPaymentCartCheckout(
        accessToken,
        pricingInfo,
        inviteeData.confirmationNumber,
        event.id,
        inviteeData.emailAddress
      );
      postRegPaymentRegCartId = response.regCart.regCartId;
      const pricingInfoNew = await regCartClient.getRegCartPricing(accessToken, response.regCart.regCartId);
      dispatch({ type: RESTORE_REG_CART_SUCCESS, payload: { ...pricingInfoNew, regCart: response.regCart } });
      return await getFinalState(regCartClient, travelApiClient, accessToken, response.regCart.regCartId, dispatch);
    } catch (error) {
      const regCartResponse = await regCartClient.getRegCart(accessToken, postRegPaymentRegCartId);
      dispatch({ type: RESET_REG_CART, payload: { regCart: regCartResponse } });
      dispatch({ type: FINALIZE_CHECKOUT_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}

export function continuePostRegistrationPaymentAfterServiceFeesConfirmation(isServiceFeeModalClosed: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { regCartClient },
      regCartPricing,
      postRegistrationPaymentData: { webPaymentData }
    } = getState();
    const regCartId = regCartPricing.regCartId;
    // if user cancels/confirms service fees, we want to change the status to INPROGRESS for regCart
    await regCartClient.acknowledgeRegCartStatus(
      accessToken,
      regCartId,
      'UPDATE_STATUS_POST_SERVICE_FEES_CONFIRMATION'
    );
    try {
      /*
       * When user goes back to confirmation page,
       * regcart status as INPROGRESS allows modification
       *  and cancel buttons to be enabled
       */
      if (isServiceFeeModalClosed) {
        dispatch(closeDialogContainer());
        const regCartResponse = await regCartClient.getRegCart(accessToken, regCartId);
        dispatch({ type: RESET_REG_CART, payload: { regCart: regCartResponse } });
      } else {
        /**
         * Once user confirms service fee charges, startRegCartCheckout is called
         * to continue checkout of current regCart with new calculated service fees.
         * waitForRegCartCheckoutCompletionUi is called to confirm final status of regCart,
         * so that user is directed to confirmation page only after successful checkout.
         */
        const pricingInfo = getCheckoutInfoForPostServiceFees(webPaymentData, regCartPricing, accessToken);
        await regCartClient.startRegCartCheckout(accessToken, regCartId, pricingInfo);
        await dispatch(waitForRegCartCheckoutCompletionUi());
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
        const confirmationPageId = await dispatch(getConfirmationPageIdForInvitee(getState()));
        dispatch({ type: CLEAR_ORDERS });
        dispatch(routeToPage(confirmationPageId));
        await dispatch(openPaymentSuccessfulDialog());
      }
    } catch (error) {
      const regCartResponse = await regCartClient.getRegCart(accessToken, regCartId);
      dispatch({ type: RESET_REG_CART, payload: { regCart: regCartResponse } });
      dispatch({ type: FINALIZE_CHECKOUT_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());
      throw error;
    }
  };
}
