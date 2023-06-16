import React from 'react';
import { connect } from 'react-redux';
import PaymentWidget from 'event-widgets/lib/Payment/PaymentWidget';
import getJSONValue from 'nucleus-widgets/utils/fields/getJSONValue';
import { merge, orderBy, size } from 'lodash';
import { loadCountryStates } from '../../redux/states';
import {
  updateDiscountCodes,
  updateIgnoreTaxesInRegCart,
  updateIgnoreServiceFeesInRegCart,
  updateRegCartForAutoDiscounts
} from './actions';
import { showLoadingDialog, hideLoadingDialog } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { openPaymentAmountServiceFeeDialog } from '../../dialogs/PaymentAmountServiceFeeDialog';
import { getSelectedMerchantAccount } from 'event-widgets/redux/selectors';
import { getRegistrationPath } from 'event-widgets/redux/selectors/appData';
import { isRegistrationModification, getEventRegistrationId } from '../../redux/selectors/currentRegistrant';
import withMappedWidgetConfig from 'nucleus-widgets/lib/withMappedWidgetConfig';
import {
  setSelectedPaymentMethod,
  setPaymentOfflineAdditionalDetails,
  setCreditCardField,
  updatePaymentAmountValue,
  setPartialPaymentRadioButton
} from '../../redux/registrationForm/regCartPayment/actions';
import { getIsTaxesEnabled, getIsServiceFeeEnabled } from '../../redux/regCartPricing';
import { delayedScrollToFirstWidgetError } from '../../utils/formUtils';
import {
  getPaymentInfo,
  getInitialOverrideProductFees,
  getTaxesInfo,
  getInitialOverrideProductRefunds,
  shouldUseWebpaymentsForm
} from '../../redux/selectors/payment';
import { isDiscountCodesEnabled } from '../../redux/selectors/event';
import {
  getRegistrationPathIdOrDefault,
  getPaymentCreditsEnabled
} from '../../redux/selectors/currentRegistrationPath';
import { getPaymentMethodTypes, selectCreditCardOptions } from 'event-widgets/utils/creditCardUtils';
import { getServiceFeeInfo, isPaymentTypeServiceFeeEnabled } from '../../redux/selectors/payment';
import { openPaymentCreditsDialog } from '../../dialogs';
import {
  isInSitePaymentProcessingEnabled,
  isProcessOfflineForCreditCardEnabled
} from 'event-widgets/redux/selectors/event';
import { RESET_WEBPAYMENTS_FORM } from '../../redux/registrationForm/regCart/actionTypes';
import { completeRegistrationCallback } from '../RegistrationNavigator/RegistrationNavigatorWidget';
import getRegCartPricingMergedState from './getRegCartPricingAction';
import useCachedRegCartPricing from './useCachedRegCartPricing';
import { PAYMENT_TYPE } from 'event-widgets/constants/PaymentType';
import { useReactiveVar } from '@apollo/client';
import {
  isEditPriceVar,
  isEditRefundVar,
  plannerOverriddenProductFeesVar,
  plannerOverriddenProductRefundsVar,
  overrideProductFees as overrideProductFeesCached,
  isOverrideProductFeesValid as isOverrideProductFeesValidCached,
  isOverrideProductRefundsValid as isOverrideProductRefundsValidCached,
  plannerOverriddenProductFeesSavedVar,
  plannerOverriddenProductRefundsSavedVar,
  isInCheckoutVar,
  clearCachedPricing
} from './regCartPricing';
import { isRegCartUpdateInProgress } from '../../redux/selectors/shared';
import { isPlannerRegistration } from '../../redux/defaultUserSession';
import { isOrderSummaryHiddenEnabled } from '../../ExperimentHelper';
import { membershipItemsVar, MembershipItem } from 'event-widgets/lib/MembershipItems/useMembershipItems';
import { allSessionBundlesVar } from 'event-widgets/lib/Sessions/useVisibleSessionBundles';
import { SessionBundle } from 'event-widgets/types/sessionBundleType';
const NO_VOLUME_DISCOUNT_IN_CART = 'NO_VOLUME_DISCOUNT_IN_CART';

/**
 * Set the selected payment method and update pricing accordingly.
 * @param method the method to select
 */
function setSelectedPaymentMethodAndRecalculatePricing(method) {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    const state = getState();
    dispatch(showLoadingDialog());
    dispatch(setSelectedPaymentMethod(method));
    await dispatch(updateRegCartForAutoDiscounts());
    const {
      registrationForm: {
        regCart: { regCartId }
      }
    } = state;
    clearCachedPricing(regCartId, apolloClient);
    dispatch(hideLoadingDialog());
  };
}

/**
 * Set the selected payment method and update pricing accordingly
 * @param method the method to select
 */
function setCreditCardFieldAndRecalculatePricing(field, value) {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    const state = getState();
    dispatch(showLoadingDialog());
    dispatch(setCreditCardField(field, value));
    if (field === 'paymentMethodType') {
      const {
        registrationForm: {
          regCart: { regCartId }
        }
      } = state;
      clearCachedPricing(regCartId, apolloClient);
    }
    dispatch(hideLoadingDialog());
  };
}

const getPaymentSettings = (paymentSettings, isPlanner, isTestMode, isPreview, event, experimentSettings) => {
  const newPaymentSettings = paymentSettings;
  // Do not show the option for thirdPartyPayments during Planner Side Registration.
  if (isPlanner) {
    newPaymentSettings.payPal.enabled = false;
    newPaymentSettings.cyberSourceSecureAcceptance.enabled = false;
    newPaymentSettings.authorizeDotNet.enabled = false;
    newPaymentSettings.touchNet.enabled = false;
    newPaymentSettings.wpm.enabled = false;
  }
  // In Test or Preview Mode, show the options for thirdpPartyPayments but set it to disabled so they cant be selected.
  if (isTestMode || isPreview) {
    newPaymentSettings.payPal.disabled = true;
    newPaymentSettings.cyberSourceSecureAcceptance.disabled = true;
    newPaymentSettings.authorizeDotNet.disabled = true;
    newPaymentSettings.touchNet.disabled = true;
    newPaymentSettings.wpm.disabled = true;
  }
  return {
    ...newPaymentSettings,
    creditCard: {
      ...newPaymentSettings.creditCard,
      instructionalText: newPaymentSettings.creditCard.processOffline
        ? 'EventWidgets_Payment_CreditCard_InstructionalText__resx'
        : newPaymentSettings.creditCard.instructionalText,
      enabled:
        isInSitePaymentProcessingEnabled(event) ||
        isProcessOfflineForCreditCardEnabled(event, newPaymentSettings, experimentSettings)
          ? newPaymentSettings.creditCard.enabled
          : false
    },
    noPayment: {
      enabled: isPlanner,
      label: 'EventGuestSide_Payment_NoPayment_Label__resx'
    }
  };
};

const getVolumeDiscountStatus = state => {
  return (
    state.registrationForm.regCart.volumeDiscountsInCartStatusType &&
    state.registrationForm.regCart.volumeDiscountsInCartStatusType !== NO_VOLUME_DISCOUNT_IN_CART
  );
};

const showDiscountCodes = state => {
  if (!isDiscountCodesEnabled(state.event)) {
    return false;
  }
  const regPathId = getRegistrationPathIdOrDefault(state);
  const regPath = getRegistrationPath(state.appData, regPathId);
  if (!regPath) {
    return false;
  }
  return regPath.allowDiscountCodes;
};

const getAppliedDiscountCodes = state => {
  return orderBy(
    state.registrationForm.regCart.discounts,
    [
      'isAutoApplied',
      'autoApplyPriority',
      discount => (discount.isAutoApplied ? discount.discountName.toLowerCase() : '')
    ],
    ['desc', 'asc', 'asc']
  );
};

function onPriceEditChange(field, value, currentEventRegId) {
  return () => {
    overrideProductFeesCached(currentEventRegId, field, value);
  };
}

function onOverridePricesEdit() {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    const state = await getRegCartPricingMergedState(getState(), apolloClient);

    const eventRegistrationProductFees = merge(getInitialOverrideProductFees(state), plannerOverriddenProductFeesVar());
    const eventRegistrationProductRefunds = merge(
      getInitialOverrideProductRefunds(state),
      plannerOverriddenProductRefundsVar()
    );

    plannerOverriddenProductFeesVar(eventRegistrationProductFees);
    plannerOverriddenProductRefundsVar(eventRegistrationProductRefunds);
  };
}

function showPaymentAmountServiceFeeDialog(paymentMethods) {
  return async dispatch => {
    await dispatch(openPaymentAmountServiceFeeDialog(paymentMethods));
  };
}

function onOverridePricesSave() {
  return async () => {
    plannerOverriddenProductFeesSavedVar(plannerOverriddenProductFeesVar());
    plannerOverriddenProductRefundsSavedVar(plannerOverriddenProductRefundsVar());
  };
}

function onEditPricesToggle() {
  return async dispatch => {
    if (isEditPriceVar()) {
      const overriddenProductFees = plannerOverriddenProductFeesVar();
      if (isOverrideProductFeesValidCached(overriddenProductFees)) {
        dispatch(onOverridePricesSave());
        isEditPriceVar(false);
      } else {
        delayedScrollToFirstWidgetError('orderSummary');
      }
    } else {
      dispatch(onOverridePricesEdit());
      isEditPriceVar(true);
    }
  };
}

function onEditRefundsToggle() {
  return async (dispatch, getState, { apolloClient }: $TSFixMe = {}) => {
    const state = await getRegCartPricingMergedState(getState(), apolloClient);
    if (isEditRefundVar()) {
      const { regCartPricing } = state;
      const overriddenProductRefunds = plannerOverriddenProductRefundsVar();
      if (isOverrideProductRefundsValidCached(overriddenProductRefunds, regCartPricing)) {
        dispatch(onOverridePricesSave());
        isEditRefundVar(false);
      } else {
        delayedScrollToFirstWidgetError('refundOrderSummary');
      }
    } else {
      dispatch(onOverridePricesEdit());
      isEditRefundVar(true);
    }
  };
}

function onDiscountCodeApply(discountCode) {
  return async dispatch => {
    dispatch(showLoadingDialog());
    await dispatch(updateDiscountCodes(discountCode, false, null, null, null));
    dispatch(hideLoadingDialog());
  };
}

function onDiscountCodeRemove(discountCode) {
  return async dispatch => {
    dispatch(showLoadingDialog());
    await dispatch(updateDiscountCodes(discountCode, true, null, null, null));
    dispatch(hideLoadingDialog());
  };
}

/**
 * Method to toggle adding and removing of taxes for planner registration
 */
function onTaxRemoveToggle() {
  return async (dispatch, getState) => {
    const store = getState();
    const ignoreTaxes = getIgnoreTaxes(store);
    if (ignoreTaxes) {
      await dispatch(updateIgnoreTaxesInRegCart(false));
    } else {
      await dispatch(updateIgnoreTaxesInRegCart(true));
    }
  };
}

/**
 * Method to toggle adding and removing of serviceFee for planner registration
 */
function onServiceFeeRemoveToggle() {
  return async (dispatch, getState) => {
    const store = getState();
    const ignoreServiceFee = getIgnoreServiceFees(store);
    await dispatch(updateIgnoreServiceFeesInRegCart(!ignoreServiceFee));
  };
}

/**
 * Called after the webpayments form has received our submit flag. This sets the submit flag
 * back to false
 */
function webPaymentsResetSubmit() {
  return dispatch => {
    dispatch({ type: RESET_WEBPAYMENTS_FORM });
  };
}

/**
 * Called after the webpayments form has successfully submitted. This calls back to the
 * registration checkout flow in RegistrationNavigatorWidget
 * @param {*} webPaymentsData Data passed by the webpayments form on successful submission
 */
function webPaymentsOnComplete(webPaymentsData) {
  return async dispatch => {
    try {
      isInCheckoutVar(true);
      dispatch(setCreditCardField('contextId', webPaymentsData.contextId));
      dispatch(setCreditCardField('paymentMethodType', webPaymentsData.cardType));
      await dispatch(completeRegistrationCallback(null));
    } finally {
      isInCheckoutVar(false);
    }
  };
}

export function getIgnoreTaxes(state: $TSFixMe): $TSFixMe {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return state.registrationForm && state.registrationForm.regCart && state.registrationForm.regCart.ignoreTaxes;
}

export function getIgnoreServiceFees(state: $TSFixMe): $TSFixMe {
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  return state.registrationForm && state.registrationForm.regCart && state.registrationForm.regCart.ignoreServiceFee;
}

export function getWebPaymentsApplicationId(state: $TSFixMe): $TSFixMe {
  const paymentType = state.registrationForm.regCartPayment.pricingInfo?.creditCard?.paymentType;
  if (paymentType === PAYMENT_TYPE.OFFLINE) {
    return state.webPaymentsSettings?.webPaymentsPermanentApplicationId;
  }

  return state.webPaymentsSettings?.webPaymentsDefaultApplicationId;
}

const hasProductWithFees = (productMap: Record<string, { fees?: unknown }>) => {
  if (!productMap) {
    return false;
  }
  return Object.values(productMap).some(product => product?.fees != null && Object.keys(product.fees).length > 0);
};

type PartialProductsMap = {
  [productId: string]: {
    fees?: Record<string, unknown>;
  };
};

type PartialProductsState = {
  event: {
    products?: {
      admissionItems?: PartialProductsMap;
      serviceFees?: PartialProductsMap;
      taxes?: PartialProductsMap;
    };
  };
  visibleProducts?: {
    Widget?: {
      sessionProducts?: PartialProductsMap;
      quantityItems?: PartialProductsMap;
      donationItems?: PartialProductsMap;
    };
  };
};

/**
 * Function to verify if event has at least one fee created
 */
const isFeeCreatedForEvent = (
  state: PartialProductsState,
  membershipItems: MembershipItem[],
  sessionBundles: Record<string, SessionBundle>
) => {
  return (
    hasProductWithFees(state.event.products?.admissionItems) ||
    hasProductWithFees(state.event.products?.serviceFees) ||
    hasProductWithFees(state.event.products?.taxes) ||
    hasProductWithFees(state.visibleProducts?.Widget?.sessionProducts) ||
    hasProductWithFees(state.visibleProducts?.Widget?.quantityItems) ||
    hasProductWithFees(state.visibleProducts?.Widget?.donationItems) ||
    hasProductWithFees(sessionBundles) ||
    membershipItems.some(item => item.amount > 0)
  );
};

type PaymentWidgetWrapperProps = {
  membershipItems: MembershipItem[];
  sessionBundles: Record<string, SessionBundle>;
  config: $TSFixMe;
  regCartPricing: $TSFixMe;
  isEditPrice: $TSFixMe;
  isEditRefund: $TSFixMe;
  overriddenProductFees: $TSFixMe;
  overriddenProductRefunds: $TSFixMe;
};

/**
 * Data wrapper for the payment widget.
 */
const PaymentWidgetWrapper = withMappedWidgetConfig(
  connect(
    (state: $TSFixMe, props: PaymentWidgetWrapperProps) => {
      const { selectedPaymentMethod, pricingInfo } = state.registrationForm.regCartPayment;
      const { event } = state;
      const {
        registrationForm: { regCart }
      } = state;
      const {
        partialPaymentSettings: { paymentAmountOption, paymentAmount }
      } = state;
      const {
        regCartPricing,
        isEditPrice,
        isEditRefund,
        overriddenProductFees,
        overriddenProductRefunds,
        membershipItems,
        sessionBundles
      } = props;
      const paymentInfo = getPaymentInfo(state, regCartPricing);
      const appliedDiscountCodes = getAppliedDiscountCodes(state);
      const isVolumeDiscountPresentInCart = getVolumeDiscountStatus(state);
      const hasAppliedDiscount = isVolumeDiscountPresentInCart || size(appliedDiscountCodes) > 0;
      let isOrderSummaryHidden = false;
      if (isOrderSummaryHiddenEnabled(state)) {
        isOrderSummaryHidden =
          !paymentInfo.order?.total &&
          !hasAppliedDiscount &&
          !(isPlannerRegistration(state) && isFeeCreatedForEvent(state, membershipItems, sessionBundles));
      }
      return {
        selectedPaymentMethod,
        lockDisplayPanel: false,
        paymentInfo: getPaymentInfo(state, regCartPricing),
        pricingInfo: selectedPaymentMethod && getJSONValue(pricingInfo, selectedPaymentMethod),
        paymentMethodTypes: getPaymentMethodTypes(state),
        merchantAccount: getSelectedMerchantAccount(state),
        translateCurrency: state.text.resolver.currency,
        creditCardOptions: selectCreditCardOptions(state),
        paymentSettings: getPaymentSettings(
          props.config.appData.paymentSettings,
          state.defaultUserSession.isPlanner,
          state.defaultUserSession.isTestMode,
          state.defaultUserSession.isPreview,
          state.event,
          state.experiments
        ),
        partialPaymentSettings: { ...props.config.appData.partialPaymentSettings, paymentAmountOption, paymentAmount },
        canOverridePrices: state.defaultUserSession.isPlanner,
        isEditPrice,
        isEditRefund,
        overrideProductFees: overriddenProductFees,
        overrideProductRefunds: overriddenProductRefunds,
        isRegMod: isRegistrationModification(state),
        displayDiscountCodesInput: showDiscountCodes(state),
        appliedDiscountCodes: getAppliedDiscountCodes(state),
        isVolumeDiscountPresentInCart: getVolumeDiscountStatus(state),
        discountCodeStatus: state.registrationForm.discountCodeStatus,
        errors: state.registrationForm.errors,
        eventRegistrationId: getEventRegistrationId(state),
        taxChargesInfo: getTaxesInfo(regCartPricing, event, 'taxPricingCharges'),
        taxRefundsInfo: getTaxesInfo(regCartPricing, event, 'taxPricingRefunds'),
        ignoreTaxes: !getIgnoreTaxes(state),
        ignoreServiceFees: !getIgnoreServiceFees(state),
        isTaxesEnabled: getIsTaxesEnabled(state),
        isServiceFeeEnabled: getIsServiceFeeEnabled(state),
        serviceFeeChargesInfo: getServiceFeeInfo(regCartPricing, event, false),
        serviceFeeRefundsInfo: getServiceFeeInfo(regCartPricing, event, true),
        isPaymentAmountServiceFeeEnabled: isPaymentTypeServiceFeeEnabled(
          regCart,
          regCartPricing,
          event,
          props.config.appData.paymentSettings
        ),
        applyPaymentCredits: getPaymentCreditsEnabled(state),
        // Use post reg ones for now
        accessToken: state.accessToken,
        webPaymentsUrl: state.webPaymentsSettings?.webPaymentsEndpoint,
        webPaymentsApplicationId: getWebPaymentsApplicationId(state),
        eventLocale: state.text.locale,
        useWebPaymentsForm: shouldUseWebpaymentsForm(state),
        webPaymentsIsSubmitting: state.regCartStatus?.webPaymentsIsSubmitting,
        disableButton: isRegCartUpdateInProgress(state),
        isOrderSummaryHidden
      };
    },
    {
      setSelectedPaymentMethod: setSelectedPaymentMethodAndRecalculatePricing,
      setPaymentOfflineAdditionalDetails,
      setCreditCardField: setCreditCardFieldAndRecalculatePricing,
      loadCountryStates,
      onOverridePricesSave,
      onOverridePricesEdit,
      onPriceEditChange,
      onEditPricesToggle,
      onEditRefundsToggle,
      onDiscountCodeApply,
      onDiscountCodeRemove,
      onTaxRemoveToggle,
      onServiceFeeRemoveToggle,
      showPaymentAmountServiceFeeDialog,
      setPartialPaymentRadioButton,
      updatePartialPaymentAmount: updatePaymentAmountValue,
      openPaymentCreditsDialog,
      webPaymentsResetSubmit,
      webPaymentsOnComplete
    }
  )(PaymentWidget)
);

export default function PaymentWidgetCacheWrapper(props: $TSFixMe): $TSFixMe {
  const query = useCachedRegCartPricing();
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '[QueryResu... Remove this comment to see the full error message
  const { data, previousData } = query;
  const regCartPricing = data?.pricing?.regCartPricing || previousData?.pricing?.regCartPricing;
  const isEditPrice = useReactiveVar(isEditPriceVar);
  const isEditRefund = useReactiveVar(isEditRefundVar);
  const overriddenProductFees = useReactiveVar(plannerOverriddenProductFeesVar);
  const overriddenProductRefunds = useReactiveVar(plannerOverriddenProductRefundsVar);
  const membershipItems = useReactiveVar(membershipItemsVar);
  const sessionBundles = useReactiveVar(allSessionBundlesVar) as Record<string, SessionBundle>;

  return (
    <PaymentWidgetWrapper
      {...props}
      regCartPricing={regCartPricing}
      isEditPrice={isEditPrice}
      isEditRefund={isEditRefund}
      overriddenProductFees={overriddenProductFees}
      overriddenProductRefunds={overriddenProductRefunds}
      membershipItems={membershipItems}
      sessionBundles={sessionBundles}
    />
  );
}
