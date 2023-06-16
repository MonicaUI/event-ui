import React from 'react';
import { map } from 'lodash';
import { getAllPaymentAmountServiceFeeInfo } from '../../redux/selectors/payment';
import { resolve } from '@cvent/nucleus-dynamic-css';
import PaymentAmountServiceFeeDialogStyles from './PaymentAmountServiceFeeDialog.less';
import StandardDialog from '../shared/StandardDialog';

const renderPaymentAmountServiceFeeInfo = (serviceFeesInfo, currency, props, number, translate) => {
  return map(serviceFeesInfo, serviceFeeInfo => {
    const serviceFeeTextToDisplay = serviceFeeInfo.applicableMethod;
    return (
      <div {...resolve(props, 'additionalItems', 'orderSummaryRow')}>
        {serviceFeeTextToDisplay !== '' ? <br /> : ''}
        <div {...resolve(props, 'instructionalText')} className={PaymentAmountServiceFeeDialogStyles.oneLineItemStyle}>
          <span className={PaymentAmountServiceFeeDialogStyles.additionalItemsText}>
            {translate(serviceFeeTextToDisplay)}
          </span>
          <span className={PaymentAmountServiceFeeDialogStyles.totalAmount}>
            {serviceFeeInfo.serviceFeeAdjustmentType === 1
              ? currency(serviceFeeInfo.serviceFeeAmount)
              : number(serviceFeeInfo.serviceFeeAmount, { minimumFractionDigits: 2 }) + '%'}
          </span>
        </div>
      </div>
    );
  });
};

const renderPopupInfo = (serviceFeesInfo, currency, props, regCartPricing, translate, number) => {
  return (
    <div {...resolve(props, 'container')}>
      <div className={PaymentAmountServiceFeeDialogStyles.leftLineItemStyle}>
        <span
          {...resolve(props, 'instructionalText')}
          className={PaymentAmountServiceFeeDialogStyles.instructionalText}
        >
          {translate('ServiceFees_PaymentAmountType_Instruction__resx')}
        </span>
      </div>
      <br />
      <br />
      {renderPaymentAmountServiceFeeInfo(serviceFeesInfo, currency, props, number, translate)}
    </div>
  );
};

export const PaymentAmountServiceFeeDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    title,
    translate,
    onClose,
    style,
    classes,
    registrationForm,
    regCartPricing,
    event,
    paymentMethods,
    currency,
    number
  } = props;

  return (
    <StandardDialog {...props} title={title} onClose={onClose} style={style} classes={classes}>
      {renderPopupInfo(
        getAllPaymentAmountServiceFeeInfo(registrationForm.regCart, regCartPricing, event, paymentMethods),
        currency,
        props,
        regCartPricing,
        translate,
        number
      )}
    </StandardDialog>
  );
};
