import {
  CALCULATE_PRICING_SUCCESS,
  RESTORE_REG_CART_SUCCESS,
  INITIALIZE_PRICE_OVERRIDE,
  SET_PRICE_OVERRIDE,
  UPDATE_EDIT_MODE
} from './registrationForm/regCart/actionTypes';
import { LOG_OUT_REGISTRANT_SUCCESS } from './registrantLogin/actionTypes';
import { setIn } from 'icepick';
import { createSelector } from 'reselect';
import { optionalValidator } from '@cvent/nucleus-form-validations';
import { currencyValidatorWithZero, numberRangeValidator } from 'event-widgets/utils/validators';
import { find, forEach } from 'lodash';

export const getOverrideProductFees = createSelector(
  state => (state as $TSFixMe).regCartPricing,
  pricing => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return (pricing && pricing.plannerOverriddenProductFees) || null;
  }
);

export const getOverrideProductRefunds = createSelector(
  state => (state as $TSFixMe).regCartPricing,
  pricing => {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return (pricing && pricing.plannerOverriddenProductRefunds) || null;
  }
);

export const isOverrideProductFeesValid = createSelector(
  state => getOverrideProductFees(state),
  overriddenFees => {
    let valid = true;
    const eventRegFees = overriddenFees && Object.values(overriddenFees);
    if (eventRegFees) {
      eventRegFees.forEach((productFees: $TSFixMe) => {
        const invalid = find(productFees, fee => {
          const validator = optionalValidator(currencyValidatorWithZero);
          return !validator(fee);
        });
        if (invalid) {
          valid = false;
        }
      });
    }
    return valid;
  }
);

function getProductPricingsRefund(eventRegistrationPricings, eventRegId) {
  if (eventRegistrationPricings) {
    const eventRegistrationPricing = eventRegistrationPricings.filter(
      eventRegPricing => eventRegPricing.eventRegistrationId === eventRegId
    );
    if (eventRegistrationPricing && eventRegistrationPricing.length > 0) {
      return eventRegistrationPricing[0].productPricings.filter(
        product => product.pricingRefunds && product.pricingRefunds.length > 0
      );
    }
  }
}

const getEventPricings = createSelector(
  state => (state as $TSFixMe).regCartPricing && (state as $TSFixMe).regCartPricing.eventRegistrationPricings,
  eventRegistrationPricings => {
    return eventRegistrationPricings;
  }
);

export const isOverrideProductRefundsValid = createSelector(
  state => getOverrideProductRefunds(state),
  state => getEventPricings(state),
  (overriddenRefunds, eventPricings) => {
    let valid = true;
    if (overriddenRefunds) {
      forEach(overriddenRefunds, (productRefunds, eventRegId) => {
        const invalid = find(productRefunds, fee => {
          const validator = optionalValidator(currencyValidatorWithZero);
          return !validator(fee);
        });
        if (invalid !== undefined) {
          valid = false;
        }
        Object.keys(productRefunds).forEach(chargeOrderDetailId => {
          const productPricing = getProductPricingsRefund(eventPricings, eventRegId).filter(pricing => {
            return pricing.pricingRefunds[0].chargeOrderDetailId === chargeOrderDetailId;
          });
          if (productPricing.length > 0) {
            const max = productPricing[0].pricingRefunds[0].originalAmountCharged;
            const validator = optionalValidator(numberRangeValidator(0, max));
            if (!validator(productRefunds[chargeOrderDetailId])) {
              valid = false;
            }
          }
        });
      });
      return valid;
    }
  }
);

export function initializeOverrideProductFees(
  eventRegistrationProductFees: $TSFixMe,
  eventRegistrationProductRefunds: $TSFixMe
): $TSFixMe {
  return {
    type: INITIALIZE_PRICE_OVERRIDE,
    payload: { eventRegistrationProductFees, eventRegistrationProductRefunds }
  };
}

export function overrideProductFees(eventRegistrationId: $TSFixMe, productId: $TSFixMe, value: $TSFixMe): $TSFixMe {
  return {
    type: SET_PRICE_OVERRIDE,
    payload: { eventRegistrationId, productId, value }
  };
}

export function setIsEditPrice(isEditPrice: $TSFixMe): $TSFixMe {
  return {
    type: UPDATE_EDIT_MODE,
    payload: { isEditPrice }
  };
}

export function setIsEditRefund(isEditRefund: $TSFixMe): $TSFixMe {
  return {
    type: UPDATE_EDIT_MODE,
    payload: { isEditRefund }
  };
}

// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
export const getIsEditPrice = (state: $TSFixMe): $TSFixMe => state.regCartPricing && state.regCartPricing.isEditPrice;
// eslint-disable-next-line @typescript-eslint/prefer-optional-chain
export const getIsEditRefund = (state: $TSFixMe): $TSFixMe => state.regCartPricing && state.regCartPricing.isEditRefund;
export const getIsTaxesEnabled = (state: $TSFixMe): $TSFixMe =>
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  state.event.eventFeatureSetup && state.event.eventFeatureSetup.fees && state.event.eventFeatureSetup.fees.taxes;
export const getIsServiceFeeEnabled = (state: $TSFixMe): $TSFixMe =>
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  state.event.eventFeatureSetup && state.event.eventFeatureSetup.fees && state.event.eventFeatureSetup.fees.serviceFees;

const initialState = {
  plannerOverriddenProductFees: {},
  plannerOverriddenProductRefunds: {},
  isEditPrice: false,
  isEditRefund: false
};

// eslint-disable-next-line complexity
export default function regCartPricing(state = initialState, action: $TSFixMe): $TSFixMe {
  switch (action.type) {
    case CALCULATE_PRICING_SUCCESS:
      return {
        ...action.payload.regCartPricing,
        plannerOverriddenProductFees: state ? state.plannerOverriddenProductFees : {},
        plannerOverriddenProductRefunds: state ? state.plannerOverriddenProductRefunds : {},
        isEditPrice: state ? state.isEditPrice : false,
        isEditRefund: state ? state.isEditRefund : false
      };
    case LOG_OUT_REGISTRANT_SUCCESS:
      return null;
    case RESTORE_REG_CART_SUCCESS:
      return action.payload.regCartPricing || null;
    case INITIALIZE_PRICE_OVERRIDE:
      return {
        ...state,
        plannerOverriddenProductFees: action.payload.eventRegistrationProductFees,
        plannerOverriddenProductRefunds: action.payload.eventRegistrationProductRefunds
      };
    case SET_PRICE_OVERRIDE: {
      const { eventRegistrationId, productId, value } = action.payload;
      // eslint-disable-next-line no-prototype-builtins
      if (state.plannerOverriddenProductFees[eventRegistrationId].hasOwnProperty(productId)) {
        return setIn(state, ['plannerOverriddenProductFees', eventRegistrationId, productId], value);
        // eslint-disable-next-line no-prototype-builtins
      } else if (state.plannerOverriddenProductRefunds[eventRegistrationId].hasOwnProperty(productId)) {
        return setIn(state, ['plannerOverriddenProductRefunds', eventRegistrationId, productId], value);
      }
      return state;
    }
    case UPDATE_EDIT_MODE:
      return {
        ...state,
        isEditPrice: action.payload.isEditPrice != null ? action.payload.isEditPrice : state.isEditPrice,
        isEditRefund: action.payload.isEditRefund != null ? action.payload.isEditRefund : state.isEditRefund
      };
    default:
      return state;
  }
}
