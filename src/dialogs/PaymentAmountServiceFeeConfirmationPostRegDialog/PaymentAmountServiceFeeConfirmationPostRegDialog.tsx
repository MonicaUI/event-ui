import React from 'react';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { connect } from 'react-redux';
import { getPaymentAmountServiceFeeInfo } from '../../redux/selectors/payment';
import ConfirmationStyles from '../shared/Confirmation.less';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { continuePostRegistrationPaymentAfterServiceFeesConfirmation } from '../../redux/postRegistrationPayment/workflow';
import { withStyles } from '../ThemedDialog';
import { FINALIZE_CHECKOUT_PAYMENT_FAILURE } from '../../redux/registrationForm/regCart/actionTypes';
import { openPaymentProcessingErrorDialog } from '../index';
import { getUpdateErrors } from '../../redux/registrationForm/errors';
import ServiceFeePopUpInfo from './ServiceFeePopUpInfo';
import useCachedRegCartPricing from '../../widgets/PaymentWidget/useCachedRegCartPricing';

export const completeRegistration = withLoading(() => {
  return async dispatch => {
    try {
      // If user confirms, the dialog should be closed and checkout should be started with new calculated service fees
      dispatch(closeDialogContainer());
      return await dispatch(continuePostRegistrationPaymentAfterServiceFeesConfirmation(false));
    } catch (error) {
      // Dispatch error dialog if checkout fails
      if (getUpdateErrors.isPaymentProcessingError(error)) {
        dispatch({ type: FINALIZE_CHECKOUT_PAYMENT_FAILURE });
        const dialog = await dispatch(openPaymentProcessingErrorDialog());
        return dialog;
      }
      throw error;
    }
  };
});

export const closeDialog = withLoading(() => {
  return dispatch => {
    // this will close the dialog and reset the regCart status to INPROGRESS to avoid errors
    dispatch(continuePostRegistrationPaymentAfterServiceFeesConfirmation(true));
  };
});

const renderPopupInfo = (serviceFeesInfo, translateCurrency, props, regCartPricing, translate, separatorColor) => {
  const totalDue = regCartPricing.netFeeAmountChargeWithPaymentAmountServiceFee;
  return (
    <ServiceFeePopUpInfo
      serviceFeesInfo={serviceFeesInfo}
      totalDue={totalDue}
      translateCurrency={translateCurrency}
      translate={translate}
      separatorColor={separatorColor}
    />
  );
};

const Dialog = withStyles(ConfirmationDialog);

const mergeProps = (stateProps: $TSFixMe, dispatchProps: $TSFixMe) => {
  return {
    ...stateProps,
    ...dispatchProps,
    confirmChoice: dispatchProps.confirmChoice.bind(),
    requestClose: dispatchProps.requestClose.bind()
  };
};

const mapDispatchToProps = {
  confirmChoice: withLoading(completeRegistration),
  requestClose: withLoading(closeDialog)
};

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  const { style } = props.dialogConfig;
  const { event } = state;
  const { regCartPricing } = props;
  return {
    title: 'ServiceFees_PaymentHeader__resx',
    translate: state.text.translate,
    classes: ConfirmationStyles,
    buttonText: {
      yes: 'GuestProductSelection_DialogConfirmButtonText__resx',
      no: 'GuestProductSelection_DialogCancelButtonText__resx'
    },
    contentDetails: renderPopupInfo(
      getPaymentAmountServiceFeeInfo(regCartPricing, event),
      state.text.resolver.currency,
      props,
      regCartPricing,
      state.text.translate,
      style.backgroundColor
    )
  };
};

const PaymentAmountServiceFeeConfirmationPostRegDialogWrapper = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Dialog);

export default function PaymentAmountServiceFeeConfirmationPostRegDialogCacheWrapper(props: $TSFixMe): $TSFixMe {
  const query = useCachedRegCartPricing();
  const regCartPricing = (query as $TSFixMe).data?.pricing?.regCartPricing;

  return <PaymentAmountServiceFeeConfirmationPostRegDialogWrapper {...props} regCartPricing={regCartPricing} />;
}
