import { withStyles } from '../ThemedDialog';
import { closeDialogContainer, openDialogContainer } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import DialogStyles from '../styles/DialogError.less';
import getDialogContainerStyle from '../shared/getDialogContainerStyle';
import React from 'react';
import ConfirmationStyles from '../shared/Confirmation.less';
import { connect } from 'react-redux';
import { getEventRegistrationAttendeeInfos, getPaymentInfo } from '../../redux/selectors/payment';
import { PaymentCreditsDialog } from './PaymentCreditsDialog';
import useCachedRegCartPricing from '../../widgets/PaymentWidget/useCachedRegCartPricing';

const Dialog = withStyles(PaymentCreditsDialog);

const mapStateToProps = (state: $TSFixMe, props: $TSFixMe) => {
  const {
    text: {
      resolver: { currency },
      translate
    }
  } = state;
  const { regCartPricing } = props;
  const { order: { paymentCreditsForEventReg = {} } = {} } = getPaymentInfo(state, regCartPricing);
  const attendees = getEventRegistrationAttendeeInfos(state);

  return {
    translateCurrency: currency,
    translate,
    attendees,
    paymentCreditsForEventReg,
    classes: ConfirmationStyles
  };
};

const ConnectedDialog = connect(mapStateToProps)(Dialog);

function ConnectedDialogCacheWrapper(props) {
  const query = useCachedRegCartPricing();
  const regCartPricing = (query as $TSFixMe).data?.pricing?.regCartPricing;

  return <ConnectedDialog {...props} regCartPricing={regCartPricing} />;
}

export const openPaymentCreditsDialog = () => {
  return (dispatch: $TSFixMe, getState: $TSFixMe): $TSFixMe => {
    const translate = getState().text.translate;
    const boundCloseDialog = () => {
      dispatch(closeDialogContainer());
    };
    const dialog = (
      <ConnectedDialogCacheWrapper
        title={translate('EventWidgets_PaymentWidget_PaymentMethodTypePaymentCredits__resx')}
        onClose={boundCloseDialog}
        classes={DialogStyles}
      />
    );
    return dispatch(
      openDialogContainer(dialog, boundCloseDialog, {
        classes: { dialogContainer: DialogStyles.dialogContainer },
        style: { dragContainer: getDialogContainerStyle(getState()) }
      })
    );
  };
};
