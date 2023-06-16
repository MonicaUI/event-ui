import React from 'react';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import { openDialogContainer, closeDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import PaymentAmountServiceFeeDialogStyles from './PaymentAmountServiceFeeDialog.less';
import { PaymentAmountServiceFeeDialog } from './PaymentAmountServiceFeeDialog';
import { injectTestId } from '@cvent/nucleus-test-automation';
import { connect } from 'react-redux';
import ConfirmationStyles from '../shared/Confirmation.less';
import { withStyles } from '../ThemedDialog';
import useCachedRegCartPricing from '../../widgets/PaymentWidget/useCachedRegCartPricing';

const Dialog = withStyles(PaymentAmountServiceFeeDialog);

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  const { event, registrationForm } = state;
  const { currency, number } = state.text.resolver;
  const { translate } = state.text;
  const { regCartPricing } = props;

  return {
    title: translate('ServiceFees_PaymentHeader__resx'),
    translate,
    currency,
    number,
    event,
    regCartPricing,
    registrationForm,
    classes: ConfirmationStyles
  };
};

function ConnectedDialogCacheWrapper(props) {
  const query = useCachedRegCartPricing();
  const regCartPricing = (query as $TSFixMe).data?.pricing?.regCartPricing;
  return <ConnectedDialog {...props} regCartPricing={regCartPricing} />;
}

const ConnectedDialog = connect(mapStateToProps)(Dialog);

export const openPaymentAmountServiceFeeDialog = (paymentMethods?: $TSFixMe) => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const dialogConfig = {
      style: getState().website.theme.global
    };

    const boundCloseDialog = () => dispatch(closeDialogContainer());
    const dialog = (
      <ConnectedDialogCacheWrapper
        {...injectTestId('payment-amount-service-fee-dialog')}
        onClose={boundCloseDialog}
        dialogConfig={dialogConfig}
        paymentMethods={paymentMethods}
        classes={ConfirmationStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: PaymentAmountServiceFeeDialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
