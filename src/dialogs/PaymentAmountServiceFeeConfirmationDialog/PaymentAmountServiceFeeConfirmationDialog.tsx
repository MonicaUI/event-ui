import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import ThemeableComponent from 'nucleus-widgets/lib/ThemeableComponent';
import { closeDialogContainer, withLoading } from 'nucleus-guestside-site/src/redux/modules/dialogContainer';
import { merge } from 'lodash';
import ConfirmationStyles from '../shared/Confirmation.less';
import { injectTestId } from '@cvent/nucleus-test-automation';
import clearImageInTheme from '../shared/clearImageInTheme';
import { finalizeRegistration } from '../../redux/registrationForm/regCart';
import { getPaymentAmountServiceFeeInfo } from '../../redux/selectors/payment';
import { map } from 'lodash';
import { resolve } from '@cvent/nucleus-dynamic-css';
import PaymentStyles from './PaymentAmountServiceFeeConfirmationDialog.less';
import getInlineStyle from 'nucleus-widgets/utils/style/getInlineStyle';
import {
  getIdConfirmationValidationsFromCartError,
  openIdConfirmationConflictDialog
} from '../selectionConflictDialogs';
import {
  saveRegistrationAndRouteToPage,
  returnProperErrorDialog
} from '../../widgets/RegistrationNavigator/RegistrationNavigatorWidget';
import { REGISTRATION } from '../../redux/website/registrationProcesses';
import { getTotalCreditsApplied } from 'event-widgets/utils/paymentUtils';
import useCachedRegCartPricing from '../../widgets/PaymentWidget/useCachedRegCartPricing';
import { redirectToConfirmation } from '../../errorHandling/confirmation';

export const completeRegistration = withLoading(submitForm => {
  return async (dispatch, getState) => {
    let regStatus;
    try {
      regStatus = await dispatch(finalizeRegistration());
    } catch (error) {
      dispatch(closeDialogContainer());
      // reg API checkout validations handling
      const dialog = await returnProperErrorDialog(error, dispatch, getState);
      if (dialog !== null) {
        return dialog;
      }

      // handles validation for id confirmation conflicts
      const idConfirmationValidations = getIdConfirmationValidationsFromCartError(getState(), error);
      if (!idConfirmationValidations.isValid) {
        const registrationStartPageId = REGISTRATION.forCurrentRegistrant().startPageId(getState());
        const callback = () => saveRegistrationAndRouteToPage(submitForm, registrationStartPageId, false);
        return await dispatch(openIdConfirmationConflictDialog(idConfirmationValidations, callback));
      }
      throw error;
    }
    if (regStatus.statusCode !== 'THIRD_PARTY_REDIRECT' && regStatus.statusCode !== 'THIRD_PARTY_REDIRECT_STARTED') {
      setTimeout(() => {
        void redirectToConfirmation(regStatus, dispatch, getState);
      });
    }
    dispatch(closeDialogContainer());
  };
});

class PaymentAmountServiceFeeConfirmationDialog extends ThemeableComponent<$TSFixMe, $TSFixMe> {
  static propTypes = {
    style: PropTypes.object
  };
  getElementBackground: $TSFixMe;
  getElementInlineStyle: $TSFixMe;
  props: $TSFixMe;
  getStyleObject() {
    return {
      dialogHeader: this.getElementInlineStyle('dialogHeader'),
      exit: this.getElementInlineStyle('exit'),
      primaryButton: this.getElementInlineStyle('primaryButton'),
      secondaryButton: this.getElementInlineStyle('secondaryButton'),
      dragHandle: this.getElementBackground('content2'),
      body: this.getElementInlineStyle('body1')
    };
  }
  getClasses() {
    return {
      ...ConfirmationStyles
    };
  }
  render() {
    return (
      <ConfirmationDialog
        {...injectTestId('payment-amount-service-fee-confirmation-dialog')}
        {...this.props}
        style={this.getStyleObject()}
        classes={this.getClasses()}
      />
    );
  }
}

const dialogStyle = (style, sections, global) => {
  const contentDetailsStyles = getInlineStyle(global.elements.body1, {}, global.palette, global.fontPalette);
  return {
    ...style,
    dialogHeader: { styleMapping: 'header3' },
    exit: { styleMapping: 'body1' },
    primaryButton: { styleMapping: 'primaryButton' },
    secondaryButton: { styleMapping: 'secondaryButton' },
    content2: { ...clearImageInTheme(merge({}, global, sections.content2)), styleMapping: 'custom' },
    contentDetails: {
      instruction: contentDetailsStyles,
      tableHeader: contentDetailsStyles,
      tableContentRow: contentDetailsStyles
    }
  };
};

const renderPaymentAmountServiceFeeInfo = (serviceFeesInfo, translateCurrency, props, translate) => {
  return map(serviceFeesInfo, serviceFeeInfo => {
    const serviceFeeTextToDisplay = serviceFeeInfo.serviceFees.serviceFeeName;
    return (
      <div {...resolve(props, 'additionalItems', 'orderSummaryRow')} key={serviceFeeInfo.serviceFees.serviceFeeId}>
        <div className={PaymentStyles.oneLineItemStyle}>
          <span className={PaymentStyles.additionalItemsText}>{translate(serviceFeeTextToDisplay)}</span>
          <span className={PaymentStyles.totalAmount}>
            {translateCurrency(serviceFeeInfo.serviceFees.serviceFeeAmount)}
          </span>
        </div>
      </div>
    );
  });
};

const renderPopupInfo = (serviceFeesInfo, translateCurrency, props, regCartPricing, translate, separatorColor) => {
  // Total due after adjusting payment amount service fee and payment credits.
  const totalDueWithPaymentAmountServiceFeeAndCreditsAdjusted =
    regCartPricing?.netFeeAmountChargeWithPaymentAmountServiceFee -
    getTotalCreditsApplied(regCartPricing?.paymentCreditsForEventReg);

  return (
    <div {...resolve(props, 'container')}>
      <div className={PaymentStyles.leftLineItemStyle}>
        <span className={PaymentStyles.instructionalText}>{translate('ServiceFees_PaymentInstruction__resx')}</span>
      </div>
      <br />
      <br />
      {renderPaymentAmountServiceFeeInfo(serviceFeesInfo, translateCurrency, props, translate)}
      <hr {...resolve(props, 'separator')} style={separatorColor} />
      <div className={PaymentStyles.rightLineItemStyle}>
        <span className={PaymentStyles.totalAmountDue} {...injectTestId('total-due-value')}>
          {translate('EventWidgets_PaymentWidget_TotalDue__resx', {
            totalDue: translateCurrency(totalDueWithPaymentAmountServiceFeeAndCreditsAdjusted)
          })}
        </span>
      </div>
    </div>
  );
};

const PaymentAmountServiceFeeConfirmationDialogWrapper = connect(
  (state: $TSFixMe, props: $TSFixMe) => {
    const { sections, global } = state.website.theme;
    const { style, ...otherDialogConfig } = props.dialogConfig;
    const { event } = state;
    const { regCartPricing } = props;
    return {
      ...otherDialogConfig,
      title: 'ServiceFees_PaymentHeader__resx',
      translate: state.text.translate,
      useSuccessComponent: false,
      style: dialogStyle(style, sections, global),
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
  },
  {
    requestClose: closeDialogContainer,
    completeRegistration
  },
  (stateProps: $TSFixMe, dispatchProps: $TSFixMe, ownProps: $TSFixMe) => {
    return {
      ...ownProps,
      ...stateProps,
      ...dispatchProps,
      confirmChoice: dispatchProps.completeRegistration.bind(null, ownProps.submitForm)
    };
  }
)(PaymentAmountServiceFeeConfirmationDialog);

export default function PaymentAmountServiceFeeConfirmationDialogCacheWrapper(props: $TSFixMe): $TSFixMe {
  const query = useCachedRegCartPricing();
  const regCartPricing = (query as $TSFixMe).data?.pricing?.regCartPricing;

  return <PaymentAmountServiceFeeConfirmationDialogWrapper {...props} regCartPricing={regCartPricing} />;
}
