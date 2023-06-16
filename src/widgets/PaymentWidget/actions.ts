/* Method for adding / removing taxes in Order Summary for planner reg */
import { getRegCart } from '../../redux/selectors/shared';
import {
  DISCOUNT_CODE_VALIDATION_FAILURE,
  UPDATE_REG_CART_FAILURE,
  UPDATE_REG_CART_PENDING,
  UPDATE_REG_CART_SUCCESS
} from '../../redux/registrationForm/regCart/actionTypes';
import { closeDialogContainer, hideLoadingOnError } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { unset, updateIn } from 'icepick';
import {
  getAllowableEventRegistrationsForDiscountCapacityMap,
  getAvailableCapacity,
  getRegistrantsCountedTowardsDiscountCapacity,
  getRegistrantsEligibleForDiscount,
  getRegistrationTypeId,
  getRegistrationPathId
} from '../../redux/registrationForm/regCart/selectors';
import { findKnownErrorResourceKey, getUpdateErrors } from '../../redux/registrationForm/errors';
import { loadAvailableCapacityCounts } from '../../redux/capacity';
import { getEventRegistrationId, isGroupRegistration } from '../../redux/selectors/currentRegistrant';
import { openGuestProductSelectionDialog, openAlreadyRegisteredDialog } from '../../dialogs';
import Logger from '@cvent/nucleus-logging';
import { updateRegCart } from '../../redux/registrationForm/regCart';

const LOG = new Logger('widgets/PaymentWidget/actions');

export function updateIgnoreTaxesInRegCart(ignoreTaxes: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      accessToken,
      clients: { regCartClient },
      event,
      account
    } = state;
    const regCart = getRegCart(state);
    let response;
    dispatch({ type: UPDATE_REG_CART_PENDING });
    try {
      response = await updateRegCart(state, regCartClient, accessToken, {
        ...regCart,
        ignoreTaxes
      });
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages
        }
      });
      LOG.debug(`updateRegCart with id ${regCart.regCartId} was successful`);
    } catch (error) {
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
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());

      throw error;
    }
  };
}

export function updateIgnoreServiceFeesInRegCart(ignoreServiceFee: $TSFixMe) {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const state = getState();
    const {
      accessToken,
      clients: { regCartClient },
      event,
      account
    } = state;
    const regCart = getRegCart(state);
    let response;
    dispatch({ type: UPDATE_REG_CART_PENDING });
    try {
      response = await updateRegCart(state, regCartClient, accessToken, {
        ...regCart,
        ignoreServiceFee
      });
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages
        }
      });
      LOG.debug(`updateRegCart with id ${regCart.regCartId} was successful`);
    } catch (error) {
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
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());

      throw error;
    }
  };
}

/**
 * applies a discount code to the reg cart
 */
export function updateDiscountCodes(
  discountCode: $TSFixMe,
  removeDiscount: $TSFixMe,
  eventRegistrationsToApplyCodeTo?: $TSFixMe,
  previousAvailableCapacity?: $TSFixMe,
  previousErrors?: $TSFixMe
) {
  // eslint-disable-next-line complexity
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      regCartStatus: { lastSavedRegCart },
      clients: { regCartClient },
      event,
      account
    } = getState();
    dispatch({ type: UPDATE_REG_CART_PENDING });
    const regCart = getRegCart(getState());

    /*
     * when we try to apply new discount we need to use the latest reg cart, so we can calculate the
     * discount based on current reg cart info, this is needed for discount advance filter
     */
    let updatedRegCart = {};
    if (removeDiscount) {
      updatedRegCart = updateIn(lastSavedRegCart, ['discounts'], discountCodeMap =>
        unset(discountCodeMap, discountCode.toLowerCase())
      );
    } else if (eventRegistrationsToApplyCodeTo) {
      updatedRegCart = updateIn(regCart, ['discounts'], discountCodeMap => {
        return { ...discountCodeMap, [discountCode]: { discountCode, eventRegistrationsToApplyCodeTo } };
      });
    } else {
      updatedRegCart = updateIn(regCart, ['discounts'], discountCodeMap => {
        return { ...discountCodeMap, [discountCode]: { discountCode } };
      });
    }
    try {
      const response = await updateRegCart(getState(), regCartClient, accessToken, updatedRegCart);
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages
        }
      });

      LOG.debug(`updateRegCart with id ${lastSavedRegCart.regCartId} was successful`);
    } catch (error) {
      // if we get external auth or oauth error , we need to redirect to external auth or oauth url
      if (
        getUpdateErrors.handleAuthError(
          error,
          account,
          event,
          getRegistrationTypeId(updatedRegCart, getEventRegistrationId(getState())),
          getRegistrationPathId(updatedRegCart, getEventRegistrationId(getState()))
        )
      ) {
        return;
      }
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());

      let validationError = null;

      const state = getState();
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      const errors = state.registrationForm && state.registrationForm.errors;
      const currentAvailableCapacity = getAvailableCapacity(errors);

      if (getUpdateErrors.isDiscountCapacityInsufficient(error)) {
        if (previousAvailableCapacity && previousAvailableCapacity !== currentAvailableCapacity) {
          await dispatch(selectDiscountForRegistrant(discountCode, previousErrors));
        } else {
          await dispatch(selectDiscountForRegistrant(discountCode, null));
        }
        return;
      } else if (getUpdateErrors.isProductAvailabilityError(error)) {
        // TODO: display error specific for discount capacity
        dispatch(loadAvailableCapacityCounts());
        validationError = 'EventWidgets_Validations_DiscountCodeCapacityFull__resx';
      } else if (getUpdateErrors.isKnownError(error)) {
        validationError = findKnownErrorResourceKey(error.responseBody.validationMessages);
      }

      if (validationError) {
        return dispatch({
          type: DISCOUNT_CODE_VALIDATION_FAILURE,
          payload: {
            validationError
          }
        });
      }

      throw error;
    }
  };
}

export function updateRegCartForAutoDiscounts() {
  return async (dispatch: $TSFixMe, getState: $TSFixMe): Promise<$TSFixMe> => {
    const {
      accessToken,
      clients: { regCartClient },
      event,
      account
    } = getState();
    const regCart = getRegCart(getState());
    dispatch({ type: UPDATE_REG_CART_PENDING });
    try {
      const response = await updateRegCart(getState(), regCartClient, accessToken, regCart);
      dispatch({
        type: UPDATE_REG_CART_SUCCESS,
        payload: {
          regCart: response.regCart,
          validationMessages: response.validationMessages
        }
      });
      LOG.debug(`updateRegCart with id ${regCart.regCartId} was successful`);
    } catch (error) {
      if (getUpdateErrors.isInviteeAlreadyRegistered(error)) {
        LOG.debug(`updateRegCart with id ${regCart.regCartId} failed`, error);
        dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
        dispatch(hideLoadingOnError());
        return dispatch(
          openAlreadyRegisteredDialog({
            title: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_Header__resx',
            instructionalText: 'EventGuestSide_ExistingInvitee_AlreadyRegistered_InstructionalText__resx',
            prepopulateForm: true
          })
        );
      }
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
      dispatch({ type: UPDATE_REG_CART_FAILURE, payload: { error } });
      dispatch(hideLoadingOnError());

      throw error;
    }
  };
}

/**
 * Apply discount to selected registrants only
 */
function selectDiscountForRegistrant(discountCodeValue, previousErrors) {
  return async (dispatch, getState) => {
    const {
      registrationForm,
      regCartStatus: { lastSavedRegCart }
    } = getState();
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const errors = previousErrors || (registrationForm && registrationForm.errors);
    const allowableEventRegistrationsForDiscountCapacityMap =
      getAllowableEventRegistrationsForDiscountCapacityMap(errors);
    // Get only those registrants who count towards discount capacity
    const discountCapacityRegistrants = getRegistrantsCountedTowardsDiscountCapacity(
      lastSavedRegCart,
      allowableEventRegistrationsForDiscountCapacityMap
    );
    dispatch(handleDiscountSelectionForInsufficientCapacity(discountCodeValue, discountCapacityRegistrants));
  };
}

/* Apply discount to registrants selected in the modal */
const applyDiscountToSelectedRegistrants = (
  discountCodeValue,
  currentPrimaryRegId,
  selectedEventRegIds,
  eventRegistrations
) => {
  return async (dispatch, getState) => {
    dispatch(closeDialogContainer());
    const {
      registrationForm,
      regCartStatus: { lastSavedRegCart }
    } = getState();
    const selectedDiscountEligibleRegistrants = [];
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const errors = registrationForm && registrationForm.errors;
    const allowableEventRegistrationsForDiscountCapacityMap =
      getAllowableEventRegistrationsForDiscountCapacityMap(errors);
    const availableCapacity = getAvailableCapacity(errors);
    // Get all registrants who are eligible for the discount
    let discountEligibleRegistrants = [];
    eventRegistrations.forEach(eventReg => {
      const eventRegId = eventReg.eventRegistrationId;
      if (selectedEventRegIds[eventRegId].isSelected) {
        // If this registrant is selected, apply discount code as applicable
        discountEligibleRegistrants = getRegistrantsEligibleForDiscount(
          lastSavedRegCart,
          allowableEventRegistrationsForDiscountCapacityMap,
          eventRegId
        );
        discountEligibleRegistrants.forEach(regId => {
          selectedDiscountEligibleRegistrants.push(regId);
        });
      }
    });
    dispatch(
      updateDiscountCodes(discountCodeValue, false, selectedDiscountEligibleRegistrants, availableCapacity, errors)
    );
  };
};

function handleDiscountSelectionForInsufficientCapacity(discountCodeValue, discountCapacityRegistrants) {
  return async (dispatch, getState) => {
    const state = getState();
    const eventRegistrations = discountCapacityRegistrants;
    /*
     * this variable is needed for the dialog logic, but since we don't need it for the discount logic,
     * we pass '' and check for it in the dialog logic
     */
    const eventRegistrationId = '';
    // Passing discountCodeValue into modal's productId field
    const discountId = discountCodeValue;
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const errors = state.registrationForm && state.registrationForm.errors;
    const availableCapacity = getAvailableCapacity(errors);
    const discountTitle = 'GuestProductSelection_DiscountTitle__resx';
    // overrideCapacity will always be false in this case
    const overrideCapacity = false;
    const isGroupReg = isGroupRegistration(state);
    const eventRegSelections = {};
    // the eventRegSelections properties would always be false here
    eventRegistrations.forEach(eventReg => {
      const eventRegId = eventReg.eventRegistrationId;
      eventRegSelections[eventRegId] = {
        isSelected: false,
        isDisabled: false,
        registeredForProductInGroup: false
      };
    });
    await dispatch(
      openGuestProductSelectionDialog(
        'GuestProductSelection_ApplyDiscount__resx',
        discountId,
        discountTitle,
        availableCapacity,
        overrideCapacity,
        eventRegSelections,
        eventRegistrations,
        eventRegistrationId,
        isGroupReg,
        applyDiscountToSelectedRegistrants
      )
    );
  };
}
